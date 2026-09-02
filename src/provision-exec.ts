// Wizard executor (S12b, hardened in S12c): turns the differ's plan into real
// Home Assistant objects via the same websocket/REST APIs the core UI uses.
// Policies (CONTRACT §8 executor notes):
//   - CREATE: guarded upsert - an automation config that already exists in
//     storage (even without a live state entity) is never blindly overwritten;
//     the same pristine-signature rule as updates applies (QA-R B1-1/B2-1).
//   - UPDATE: helper configs applied; schedule/template/stats content NEVER
//     overwritten; automations regenerated only while pristine.
//   - DELETE: automations require a matching pristine signature (customized or
//     unverifiable ones are kept with a warning - QA-R B2-2); schedule and
//     automation configs are snapshotted into the log before deletion.
//   - Everything created is labeled mzcs; ordered rollback of THIS RUN'S
//     CREATES on error (already-executed updates/deletes are reported, not
//     reverted - see the failure log line).

import type { HassLike } from './ha-types';
import type { Plan, PlanAction, ProvisionSeason, ProvisionInput } from './lib/provisioning';
import { resolveEcoPreset, resolveOffPeak } from './types';
import {
  engineAutomation,
  fanAutomation,
  learningAutomation,
  watchdogAutomation,
  runtimeAlertAutomation,
  steeringAutomation,
  parseSignature,
  contentHash,
  seasonMapExpr,
  type ZoneRef,
} from './lib/automation-payloads';
import { parseEntityId, zoneEntityId } from './lib/naming';
import type { TimeRange, DayKey } from './lib/schedule-ranges';

export interface ExecContext {
  prefix: string;
  zones: ZoneRef[];
  seasons: ProvisionSeason[];
  /** optional helper the fan-off automations must respect (features.fan_guard) */
  fanGuard?: string;
  /** resolved standby preset: a name, or null = stand-down disabled; absent = 'eco' */
  ecoPreset?: string | null;
  /** resolved off-peak day entity (item 7), or null/absent = feature off */
  offPeakEntity?: string | null;
  /** comfort steering enabled (item 8); absent = off */
  steering?: boolean;
  /** weather entity feeding the outdoor-temperature chain (CDD learning) */
  weatherEntity?: string;
  log: (line: string) => void;
}

/**
 * THE ExecContext builder, shared by the card's Apply and teardown flows and by
 * the executor-parity test. The card used to assemble a third zone-ref list by
 * hand beside the differ's `provisionInputFromConfig` and the fixture's
 * `zoneRefs` (0.7.7 review, adversary LOW-1); the parity test then compared a
 * transcription of the executor against the differ and could not see either.
 * One builder, driven from the same ProvisionInput the differ signs from.
 */
export function execContextFor(input: ProvisionInput, log: (line: string) => void): ExecContext {
  return {
    prefix: input.prefix,
    zones: input.zones.map((z) => ({ ...z, climate: z.climate ?? `climate.${z.slug}` })),
    seasons: input.seasons,
    fanGuard: input.features.fan_guard,
    ecoPreset: resolveEcoPreset(input.features),
    offPeakEntity: resolveOffPeak(input.features)?.entity ?? null,
    steering: input.features.steering === true,
    weatherEntity: input.weather_entity,
    log,
  };
}

interface CreatedRecord {
  kind: 'collection' | 'config_entry' | 'automation';
  domain?: string;
  itemId?: string;
  entryId?: string;
  automationId?: string;
  /** object existed before this run - rollback must never delete it */
  preexisted?: boolean;
  /** already handed to the rollback list mid-create (config entries register
   * the moment their flow completes, BEFORE the locate/rename that can fail -
   * 0.7.7 review: a failed locate used to orphan the entry every retry) */
  registered?: boolean;
}

/** Config-entry domains the executor itself creates and may therefore delete. */
const DELETABLE_ENTRY_DOMAINS = new Set(['template', 'history_stats', 'statistics']);

/**
 * Storage id of a UI-created helper or schedule: the registry unique_id (for
 * collection helpers it IS the storage id), falling back to the entity's
 * object_id when the registry is silent (YAML helpers carry no unique_id;
 * pre-S13 behaviour). Addressing storage by object_id alone rewrote or deleted
 * the WRONG item once an entity had been renamed: fixed for schedule renames
 * in S13 (A1/F2), and for every other helper update/delete/snapshot in the
 * 0.7.7 review (E3), through this one resolver.
 */
async function storageIdFor(hass: HassLike, entityId: string): Promise<string> {
  const { objectId } = splitId(entityId);
  try {
    const entries = (await hass.callWS!({
      type: 'config/entity_registry/get_entries',
      entity_ids: [entityId],
    })) as Record<string, { unique_id?: string } | null>;
    const uniq = entries?.[entityId]?.unique_id;
    if (typeof uniq === 'string' && uniq) return uniq;
  } catch {
    // registry unreadable -> object_id fallback
  }
  return objectId;
}

/**
 * Domain of a config entry, or null when it cannot be read. Deleting a flow-
 * created sensor deletes its OWNING ENTRY; an adopted entity that belongs to
 * some other integration would take that whole integration down (0.7.7 review
 * E2), so the executor only deletes entries of the domains it creates itself.
 */
async function configEntryDomain(hass: HassLike, entryId: string): Promise<string | null> {
  try {
    const single = (await hass.callWS!({ type: 'config_entries/get_single', entry_id: entryId })) as
      | { config_entry?: { domain?: string }; domain?: string }
      | null;
    const d = single?.config_entry?.domain ?? single?.domain;
    if (typeof d === 'string' && d) return d;
  } catch {
    // older core without get_single, or a transient failure - try the list
  }
  try {
    const all = (await hass.callWS!({ type: 'config_entries/get' })) as Array<{ entry_id?: string; domain?: string }>;
    const hit = Array.isArray(all) ? all.find((e) => e?.entry_id === entryId) : undefined;
    if (typeof hit?.domain === 'string' && hit.domain) return hit.domain;
  } catch {
    // unreadable
  }
  return null;
}

const DAY_KEYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function errText(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (e && typeof e === 'object') return JSON.stringify(e);
  return String(e);
}

/** True only for a definite does-not-exist response (REST 404 / "not found"). */
function isNotFound(e: unknown): boolean {
  const status = (e as { status_code?: number; status?: number } | null | undefined);
  if (status && (status.status_code === 404 || status.status === 404)) return true;
  return /\b404\b|not.found/i.test(errText(e));
}

function splitId(entityId: string): { domain: string; objectId: string } {
  const dot = entityId.indexOf('.');
  return { domain: entityId.slice(0, dot), objectId: entityId.slice(dot + 1) };
}

/** HA's own name→object_id slugification (apostrophes become separators: "Owner's" → "owner_s"). */
function haSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

/**
 * Resolve which configured zone an entity id belongs to via the naming parser
 * (longest-slug-first). Substring matching is forbidden here: with zones
 * "den" and "garden", `includes()` wires garden's sensors to the den
 * thermostat (QA-R finding A2-2).
 */
function zoneFor(entityId: string, ctx: ExecContext): ZoneRef | null {
  const parsed = parseEntityId(
    entityId,
    ctx.prefix,
    ctx.zones.map((z) => z.slug),
    ctx.seasons.map((s) => s.key),
  );
  if (!parsed?.zone) return null;
  return ctx.zones.find((z) => z.slug === parsed.zone) ?? null;
}

/**
 * Locate the entity created by a config-entry flow. HA derives the entity id
 * from the display name; when a same-slug entity already exists the NEW one
 * gets a _2 suffix - renaming by computed slug alone moves the WRONG
 * (pre-existing) entity. This is exactly how the QA install renamed the
 * PRODUCTION daily-mean sensor (S12c incident): only the candidate whose
 * registry entry belongs to the new config entry may be touched.
 */
async function flowEntityId(hass: HassLike, domain: string, name: string, entryId: string): Promise<string> {
  const base = `${domain}.${haSlug(name)}`;
  const candidates = [base, ...[2, 3, 4, 5].map((n) => `${base}_${n}`)];
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const entries = (await hass.callWS!({
        type: 'config/entity_registry/get_entries',
        entity_ids: candidates,
      })) as Record<string, { config_entry_id?: string } | null>;
      for (const c of candidates) {
        if (entries?.[c]?.config_entry_id === entryId) return c;
      }
    } catch {
      // registry lag - retry below
    }
    await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
  }
  throw new Error(`Could not locate the entity created by flow entry ${entryId} (expected around ${base})`);
}

/** Rename an entity to its contract id when HA's name-derived id differs.
 * Retries because registry entries for flow-created sensors can lag the
 * create. FAILURE THROWS: later creates reference the contract id, so
 * continuing would cascade into wrong wiring and duplicates (QA-R B1-4). */
async function ensureEntityId(hass: HassLike, actual: string, desired: string, ctx: ExecContext): Promise<void> {
  if (actual === desired) return;
  let lastErr: unknown;
  for (let i = 0; i < 3; i++) {
    try {
      await hass.callWS!({ type: 'config/entity_registry/update', entity_id: actual, new_entity_id: desired });
      ctx.log(`Renamed ${actual} -> ${desired}`);
      return;
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
  throw new Error(
    `Could not rename ${actual} to its contract id ${desired} (${lastErr instanceof Error ? lastErr.message : 'registry error'})`,
  );
}

async function ensureLabel(hass: HassLike, ctx: ExecContext): Promise<void> {
  try {
    await hass.callWS!({ type: 'config/label_registry/create', name: 'mzcs', color: 'blue', icon: 'mdi:thermostat-box' });
    ctx.log('Created label mzcs');
  } catch {
    // already exists
  }
}

async function labelEntity(hass: HassLike, entityId: string): Promise<void> {
  try {
    const entries = (await hass.callWS!({
      type: 'config/entity_registry/get_entries',
      entity_ids: [entityId],
    })) as Record<string, { labels?: string[] } | null>;
    const existing = entries?.[entityId]?.labels ?? [];
    if (!existing.includes('mzcs')) {
      await hass.callWS!({
        type: 'config/entity_registry/update',
        entity_id: entityId,
        labels: [...existing, 'mzcs'],
      });
    }
  } catch {
    // label application is best-effort; the audit query surfaces gaps
  }
}

/**
 * Label the entity of an automation the executor just wrote. The entity id is
 * derived from the alias, but a FOREIGN automation may already own that id
 * (ours then lands at `_2`): labelling the computed id blindly marked the
 * bystander as managed and left ours unlabelled (0.7.7 review E5). Only the
 * candidate whose registry unique_id is our automation id gets the label;
 * the registry can lag the POST, hence the retries. Unresolvable = no label
 * (the next Apply adopts it - the documented best-effort-label class).
 */
async function labelAutomation(hass: HassLike, uid: string, alias: string, ctx: ExecContext): Promise<void> {
  const base = `automation.${haSlug(alias)}`;
  const candidates = [base, ...[2, 3, 4, 5].map((n) => `${base}_${n}`)];
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const entries = (await hass.callWS!({
        type: 'config/entity_registry/get_entries',
        entity_ids: candidates,
      })) as Record<string, { unique_id?: string } | null>;
      for (const c of candidates) {
        if (entries?.[c]?.unique_id === uid) {
          await labelEntity(hass, c);
          return;
        }
      }
    } catch {
      // registry lag - retry below
    }
    await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
  }
  ctx.log(`NOTE: could not resolve the entity for automation ${uid} to label it - the next Apply adopts it`);
}

/** Entity id of an automation config uid, resolved from live states. */
function automationEntityId(hass: HassLike, uid: string): string | null {
  for (const entityId in hass.states) {
    if (entityId.startsWith('automation.') && hass.states[entityId]?.attributes.id === uid) return entityId;
  }
  return null;
}

/** Drive a config-entry flow (template / history_stats / statistics) with pending fields. */
async function driveFlow(
  hass: HassLike,
  handler: string,
  menuChoice: string | null,
  fields: Record<string, unknown>,
): Promise<string> {
  if (!hass.callApi) throw new Error('callApi unavailable');
  let resp = (await hass.callApi('POST', 'config/config_entries/flow', {
    handler,
    show_advanced_options: true,
  })) as { flow_id: string; type: string; step_id?: string; data_schema?: Array<{ name: string }>; result?: { entry_id: string } };
  const pending = { ...fields };
  for (let hop = 0; hop < 8; hop++) {
    if (resp.type === 'create_entry') {
      const entryId = resp.result?.entry_id;
      // A missing entry id would poison rollback with a malformed DELETE (QA-R B1-8).
      if (!entryId) throw new Error(`Flow ${handler}: created an entry but returned no entry_id`);
      return entryId;
    }
    if (resp.type === 'menu') {
      if (!menuChoice) throw new Error(`Flow ${handler}: unexpected menu`);
      resp = (await hass.callApi('POST', `config/config_entries/flow/${resp.flow_id}`, {
        next_step_id: menuChoice,
      })) as typeof resp;
      continue;
    }
    if (resp.type === 'form') {
      const schemaNames = (resp.data_schema ?? []).map((f) => f.name);
      const payload: Record<string, unknown> = {};
      for (const n of schemaNames) {
        if (n in pending) {
          payload[n] = pending[n];
          delete pending[n];
        }
      }
      resp = (await hass.callApi('POST', `config/config_entries/flow/${resp.flow_id}`, payload)) as typeof resp;
      continue;
    }
    throw new Error(`Flow ${handler}: unhandled step type ${resp.type}`);
  }
  throw new Error(`Flow ${handler}: did not complete`);
}

function templateFlowSpec(id: string, spec: Record<string, unknown>, ctx: ExecContext):
  | { handler: string; menu: string | null; fields: Record<string, unknown> }
  | null {
  const { objectId } = splitId(id);
  const name = String(spec.name ?? objectId);
  const p = ctx.prefix;
  if (id.startsWith('binary_sensor.') && spec.source === 'hvac_action') {
    const zone = zoneFor(id, ctx);
    if (!zone) return null;
    // Item 29: with a configured power sensor the running template becomes an
    // OR of the two measured heuristics - power draw above standby, or hvac
    // active with the room >= 1° past setpoint. Power alone stalls for hours
    // (SmartThings feed, measured 2026-08-30); the delta alone misses
    // steady-state duty cycling at setpoint-hold (measured 2026-08-29). Both
    // failing together undercounts - the fail-safe direction. heat_cool
    // relies on the power branch (its setpoint attr is a pair, not a number).
    // A missing/unavailable power entity reads float(0) and falls through to
    // the delta branch. The delta branch's floats are ASYMMETRIC sentinels
    // (QA 0.7.7 MED-1): the reading side defaults far LOW and the setpoint
    // side far HIGH, so a missing attribute makes the comparison false and
    // the branch stays fail-safe - float(0) on both sides turned a dropped
    // current_temperature into a fabricated 60-degree delta and pinned the
    // sensor ON for the whole dropout. Without meta.power: the original
    // hvac_action template, byte-identical.
    const power = typeof spec.power === 'string' && spec.power ? spec.power : null;
    return {
      handler: 'template',
      menu: 'binary_sensor',
      fields: {
        name,
        state: power
          ? `{{ (states('${power}') | float(0)) > 100 or (is_state('${zone.climate}', 'cool') and (state_attr('${zone.climate}', 'current_temperature') | float(-9999)) - (state_attr('${zone.climate}', 'temperature') | float(9999)) >= 1) or (is_state('${zone.climate}', 'heat') and (state_attr('${zone.climate}', 'temperature') | float(-9999)) - (state_attr('${zone.climate}', 'current_temperature') | float(9999)) >= 1) }}`
          : `{{ state_attr('${zone.climate}', 'hvac_action') in ['cooling', 'heating'] }}`,
        device_class: 'running',
      },
    };
  }
  if (id.startsWith('sensor.') && spec.model === 'runtime_mirror') {
    const zone = zoneFor(id, ctx);
    if (!zone) return null;
    // Mirrors runtime_today so long-term statistics accrue (item 42): the
    // history_stats flow exposes no state_class, this template does. Daily
    // runtime = the day's LTS max of this sensor.
    return {
      handler: 'template',
      menu: 'sensor',
      fields: {
        name,
        state: `{{ states('sensor.${p}_${zone.slug}_runtime_today') | float(0) }}`,
        unit_of_measurement: 'h',
        state_class: 'measurement',
      },
    };
  }
  if (id.startsWith('sensor.') && spec.model === 'k_x_cdd') {
    const zone = zoneFor(id, ctx);
    if (!zone) return null;
    return {
      handler: 'template',
      menu: 'sensor',
      fields: {
        name,
        state: `{{ (states('input_number.${p}_${zone.slug}_k') | float(0)) * ([ (states('sensor.${p}_outdoor_daily_mean') | float(0)) - (states('input_number.${p}_cdd_base') | float(75)), 0 ] | max) | round(2) }}`,
        unit_of_measurement: 'h',
        state_class: 'measurement',
      },
    };
  }
  if (id === `sensor.${p}_next_block`) {
    // Zone-agnostic on purpose: enumerating schedules dynamically means the
    // template never goes stale when zones are added, and the season name→key
    // map survives renames (QA-R finding A2-7).
    const sel = `input_select.${p}_season`;
    return {
      handler: 'template',
      menu: 'sensor',
      fields: {
        name,
        state:
          `{% set season = ${seasonMapExpr(ctx.seasons)}.get(states('${sel}'), states('${sel}') | lower) %}` +
          `{% set evs = states.schedule | selectattr('entity_id', 'search', '^schedule\\.${p}_[a-z0-9_]+_' ~ season ~ '$') | map(attribute='attributes.next_event') | reject('none') | list %}` +
          `{{ evs | min if evs | count > 0 else 'unknown' }}`,
      },
    };
  }
  if (id === `sensor.${p}_outdoor_temp` && spec.source === 'weather') {
    if (!ctx.weatherEntity) return null;
    return {
      handler: 'template',
      menu: 'sensor',
      fields: {
        name,
        state: `{{ state_attr('${ctx.weatherEntity}', 'temperature') }}`,
        unit_of_measurement: '°F',
        state_class: 'measurement',
      },
    };
  }
  return null;
}

function automationPayload(uid: string, ctx: ExecContext): Record<string, unknown> | null {
  const p = ctx.prefix;
  if (uid === `${p}_mzcs_engine`)
    return engineAutomation(
      p,
      ctx.zones,
      ctx.seasons,
      ctx.ecoPreset === undefined ? 'eco' : ctx.ecoPreset,
      ctx.offPeakEntity ?? null,
      ctx.steering ?? false,
    );
  if (uid === `${p}_mzcs_steering`)
    return steeringAutomation(p, ctx.zones, ctx.seasons, ctx.ecoPreset === undefined ? 'eco' : ctx.ecoPreset);
  if (uid === `${p}_mzcs_watchdog`) return watchdogAutomation(p);
  if (uid === `${p}_mzcs_runtime_learning`) return learningAutomation(p, ctx.zones);
  if (uid === `${p}_mzcs_runtime_alert`) return runtimeAlertAutomation(p, ctx.zones);
  const fanMatch = uid.match(new RegExp(`^${p}_mzcs_fan_timer_(.+)$`));
  if (fanMatch) {
    const zone = ctx.zones.find((z) => z.slug === fanMatch[1]);
    return zone ? fanAutomation(p, zone, ctx.fanGuard) : null;
  }
  return null;
}

async function createOne(
  hass: HassLike,
  a: Extract<PlanAction, { op: 'create' }>,
  ctx: ExecContext,
  register: (rec: CreatedRecord) => void = () => {},
): Promise<CreatedRecord | null> {
  // A config entry joins the rollback list the moment its flow completes, so
  // a failed locate/rename afterwards still removes the entry (0.7.7 review).
  const entryRecord = (entryId: string): CreatedRecord => {
    const rec: CreatedRecord = { kind: 'config_entry', entryId, registered: true };
    register(rec);
    return rec;
  };
  // Creation sees the compared spec PLUS the creation-only meta payload
  // (seed values, seeded week, template types). Only spec is ever diffed.
  const spec = { ...a.spec, ...(a.meta ?? {}) };
  if (a.id.startsWith('automation:')) {
    const uid = a.id.slice('automation:'.length);
    const payload = automationPayload(uid, ctx);
    if (!payload) {
      ctx.log(`SKIP ${a.id} - no payload generator`);
      return null;
    }
    // Guarded upsert: the config API's POST is an EDIT for existing uids. An
    // automation can exist in storage without a live state entity (disabled,
    // failed reload) and would otherwise be silently overwritten and then
    // DELETED by rollback (QA-R B1-1/B2-1). Only a real 404 means "new" - a
    // transient error must NOT be read as absence, or the POST would edit an
    // existing automation this run then rollback-DELETE it (scan S13-D1).
    let preexisting: Record<string, unknown> | null = null;
    try {
      preexisting = (await hass.callApi!('GET', `config/automation/config/${uid}`)) as Record<string, unknown>;
    } catch (e) {
      if (!isNotFound(e)) throw new Error(`Could not verify whether ${a.id} already exists: ${errText(e)}`);
      preexisting = null;
    }
    if (preexisting) {
      const stored = parseSignature(preexisting.description);
      if (stored && contentHash(preexisting) === stored) {
        await hass.callApi!('POST', `config/automation/config/${uid}`, payload);
        await labelAutomation(hass, uid, String(payload.alias), ctx);
        ctx.log(`Recreated ${a.id} (existed in storage, pristine)`);
        return { kind: 'automation', automationId: uid, preexisted: true };
      }
      ctx.log(`KEEP ${a.id} - exists in storage but is customized/unsigned; not overwritten`);
      return null;
    }
    await hass.callApi!('POST', `config/automation/config/${uid}`, payload);
    // Label the automation ENTITY (managed = mzcs label, same as every other
    // kind), resolved through the registry by unique id - the executor's hass
    // snapshot predates the create, and the alias-derived id may belong to a
    // bystander.
    await labelAutomation(hass, uid, String(payload.alias), ctx);
    return { kind: 'automation', automationId: uid };
  }
  const { domain, objectId } = splitId(a.id);
  if (['timer', 'input_text', 'input_select', 'input_number', 'input_boolean', 'schedule'].includes(domain)) {
    // HA derives the object_id from the create name (its slugify differs from the
    // contract's - "Owner's" becomes "owner_s"). Creating with name = the contract
    // object_id makes the generated item id and entity_id exact, then a follow-up
    // update sets the display name without touching the id.
    const prettyName = String(spec.name ?? objectId);
    const body: Record<string, unknown> = {};
    if (domain === 'timer') Object.assign(body, { restore: spec.restore ?? true, duration: '0:30:00' });
    if (domain === 'input_select') Object.assign(body, { options: spec.options ?? ['-'] });
    // Creation-only (never in spec): HA's default max of 100 refused every
    // 12-token custom theme (102 characters), so custom themes could never be
    // saved on an executor-provisioned install, and the composed applied-block
    // marker (0.7.7) needs headroom for long block names (0.7.7 review C1).
    if (domain === 'input_text') Object.assign(body, { max: 255 });
    if (domain === 'input_number') {
      Object.assign(body, {
        min: spec.min ?? 0,
        max: spec.max ?? 100,
        step: spec.step ?? 1,
        ...(spec.unit ? { unit_of_measurement: spec.unit } : {}),
        // NEVER `initial`: a configured initial resets the helper's state on
        // every HA restart, reverting user-tuned values (QA-R B1-5). The
        // default value is seeded once via set_value below.
      });
    }
    if (domain === 'schedule') {
      const week = spec.week as Partial<Record<DayKey, TimeRange[]>> | undefined;
      for (const d of DAY_KEYS) body[d] = week?.[d] ?? [];
    }
    const res = (await hass.callWS!({ type: `${domain}/create`, ...body, name: objectId })) as { id?: string };
    const itemId = res?.id ?? objectId;
    if (itemId !== objectId) {
      // HA minted a different id (collision with an entity the registry hid
      // from us). A silent divergence becomes an invisible orphan (QA-R B1-3):
      // undo this create and abort.
      try {
        await hass.callWS!({ type: `${domain}/delete`, [`${domain}_id`]: itemId });
      } catch {
        ctx.log(`WARN: could not remove stray ${domain} item ${itemId}`);
      }
      throw new Error(`HA assigned id "${itemId}" instead of "${objectId}" for ${a.id} - an object with that id likely already exists (possibly registry-disabled)`);
    }
    if (prettyName !== itemId) {
      try {
        await hass.callWS!({ type: `${domain}/update`, [`${domain}_id`]: itemId, ...body, name: prettyName });
      } catch {
        ctx.log(`NOTE: created ${a.id} but could not set its display name to "${prettyName}"`);
      }
    }
    if (domain === 'input_number' && typeof spec.seed === 'number') {
      try {
        await hass.callService('input_number', 'set_value', { entity_id: a.id, value: spec.seed });
      } catch {
        ctx.log(`NOTE: created ${a.id} but could not seed its default value ${spec.seed}`);
      }
    }
    return { kind: 'collection', domain, itemId };
  }
  if (a.kind === 'template_sensor' || a.kind === 'stats_sensor') {
    if (a.kind === 'stats_sensor') {
      const statsName = String(spec.name ?? objectId);
      if (spec.model === 'statistics_mean') {
        // Outdoor daily mean (G1): statistics over the outdoor-temp template.
        if (!ctx.weatherEntity) {
          ctx.log(`SKIP ${a.id} - no weather entity configured (CDD learning stays off)`);
          return null;
        }
        const entryId = await driveFlow(hass, 'statistics', null, {
          name: statsName,
          entity_id: `sensor.${ctx.prefix}_outdoor_temp`,
          state_characteristic: 'mean',
          sampling_size: 500,
          max_age: { hours: 24, minutes: 0, seconds: 0 },
          keep_last_sample: false,
          percentile: 50,
          precision: 1,
        });
        const rec = entryRecord(entryId);
        await ensureEntityId(hass, await flowEntityId(hass, 'sensor', statsName, entryId), a.id, ctx);
        return rec;
      }
      const zone = zoneFor(a.id, ctx);
      if (!zone) {
        ctx.log(`SKIP ${a.id} - no zone match`);
        return null;
      }
      const entryId = await driveFlow(hass, 'history_stats', null, {
        name: statsName,
        entity_id: `binary_sensor.${ctx.prefix}_${zone.slug}_running`,
        type: 'time',
        state: ['on'],
        start: '{{ today_at() }}',
        end: '{{ now() }}',
      });
      const rec = entryRecord(entryId);
      await ensureEntityId(hass, await flowEntityId(hass, 'sensor', statsName, entryId), a.id, ctx);
      return rec;
    }
    const flow = templateFlowSpec(a.id, spec, ctx);
    if (!flow) {
      if (spec.source === 'weather' && !ctx.weatherEntity) {
        ctx.log(`SKIP ${a.id} - no weather entity configured`);
      } else {
        ctx.log(`SKIP ${a.id} - not flow-creatable`);
      }
      return null;
    }
    const entryId = await driveFlow(hass, flow.handler, flow.menu, flow.fields);
    const rec = entryRecord(entryId);
    const flowDomain = flow.menu === 'binary_sensor' ? 'binary_sensor' : 'sensor';
    await ensureEntityId(hass, await flowEntityId(hass, flowDomain, String(flow.fields.name), entryId), a.id, ctx);
    return rec;
  }
  ctx.log(`SKIP ${a.id} - unsupported kind ${a.kind}`);
  return null;
}

async function rollback(hass: HassLike, created: CreatedRecord[], ctx: ExecContext): Promise<void> {
  for (const rec of [...created].reverse()) {
    try {
      if (rec.kind === 'collection') {
        await hass.callWS!({ type: `${rec.domain}/delete`, [`${rec.domain}_id`]: rec.itemId });
      } else if (rec.kind === 'automation') {
        await hass.callApi!('DELETE', `config/automation/config/${rec.automationId}`);
      } else if (rec.kind === 'config_entry' && rec.entryId) {
        await hass.callApi!('DELETE', `config/config_entries/entry/${rec.entryId}`);
      }
      ctx.log(`Rolled back ${rec.itemId ?? rec.automationId ?? rec.entryId}`);
    } catch {
      ctx.log(`ROLLBACK FAILED for ${rec.itemId ?? rec.automationId ?? rec.entryId} - remove manually`);
    }
  }
}

/**
 * After an input_select's options are rewritten, Home Assistant core resets
 * the current option to options[0] when the old one is no longer valid - so
 * renaming the ACTIVE season flipped the select to the first season and the
 * engine's "Season changed" trigger applied that season's blocks (0.7.7
 * review E4). Options keep their position across a rename (season keys are
 * frozen, order is config order), so the same index names the renamed
 * option; anything more ambiguous is logged for the user instead of guessed.
 */
async function reselectAfterOptionsUpdate(
  hass: HassLike,
  a: Extract<PlanAction, { op: 'update' }>,
  ctx: ExecContext,
  seasonsUnchanged: boolean,
): Promise<void> {
  const next = Array.isArray(a.spec.options) ? (a.spec.options as unknown[]).map(String) : null;
  const prev = Array.isArray(a.from?.options) ? (a.from!.options as unknown[]).map(String) : null;
  const current = hass.states[a.id]?.state;
  if (!next || typeof current !== 'string' || next.includes(current)) return;
  const idx = prev ? prev.indexOf(current) : -1;
  // Only a pure rename maps by position: exactly one option differs, the
  // lengths agree, AND this Apply creates or deletes no schedule (a season
  // removed and another added in the same slot looks like a rename by name
  // alone - 0.7.7 refutation L2/LOW-3). Anything else is logged, not guessed.
  const positionsChanged = prev ? prev.filter((n, i) => n !== next[i]).length : Infinity;
  if (prev && prev.length === next.length && idx >= 0 && positionsChanged === 1 && seasonsUnchanged) {
    try {
      await hass.callService('input_select', 'select_option', { entity_id: a.id, option: next[idx] });
      ctx.log(`Re-selected "${next[idx]}" on ${a.id} (was "${current}") so the active season survives its rename`);
      return;
    } catch {
      // fall through to the note
    }
  }
  ctx.log(
    `NOTE: ${a.id} was set to "${current}", which is no longer an option - Home Assistant falls back to ` +
      `"${next[0]}". Re-select the intended season.`,
  );
}

export interface ExecResult {
  created: number;
  adopted: number;
  updated: number;
  deleted: number;
  skipped: number;
  ok: boolean;
}

export async function executePlan(hass: HassLike, plan: Plan, ctx: ExecContext): Promise<ExecResult> {
  const result: ExecResult = { created: 0, adopted: 0, updated: 0, deleted: 0, skipped: 0, ok: true };
  const createdRecords: CreatedRecord[] = [];
  let phase = 'create';
  await ensureLabel(hass, ctx);
  try {
    for (const a of plan.create) {
      const rec = await createOne(hass, a, ctx, (r) => createdRecords.push(r));
      if (rec) {
        if (!rec.preexisted && !rec.registered) createdRecords.push(rec);
        result.created++;
        ctx.log(`Created ${a.id}`);
        if (!a.id.startsWith('automation:')) await labelEntity(hass, a.id);
      } else {
        result.skipped++;
      }
    }
    phase = 'adopt';
    for (const a of plan.adopt) {
      const target = a.id.startsWith('automation:')
        ? automationEntityId(hass, a.id.slice('automation:'.length))
        : a.id;
      if (target) await labelEntity(hass, target);
      result.adopted++;
      ctx.log(`Adopted ${a.id}`);
    }
    phase = 'update';
    for (const a of plan.update) {
      if (a.kind === 'helper') {
        const { domain } = splitId(a.id);
        const { unit, ...rest } = a.spec;
        const payload = { ...rest, ...(unit ? { unit_of_measurement: unit } : {}) };
        try {
          const storageId = await storageIdFor(hass, a.id);
          await hass.callWS!({ type: `${domain}/update`, [`${domain}_id`]: storageId, ...payload });
          result.updated++;
          ctx.log(`Updated ${a.id}`);
          if (domain === 'input_select') {
            const seasonsUnchanged = ![...plan.create, ...plan.delete].some((x) => x.id.startsWith('schedule.'));
            await reselectAfterOptionsUpdate(hass, a, ctx, seasonsUnchanged);
          }
        } catch {
          result.skipped++;
          ctx.log(`SKIP update ${a.id} - not updatable`);
        }
      } else if (a.kind === 'automation' && hass.callApi) {
        // Stale generated automation. Regenerate ONLY when its live content
        // still matches its own embedded signature - i.e. nobody hand-edited
        // it since the generator wrote it. Customized automations are kept.
        const uid = a.id.slice('automation:'.length);
        const payload = automationPayload(uid, ctx);
        if (!payload) {
          result.skipped++;
          ctx.log(`KEEP ${a.id} - no generator for this automation`);
        } else {
          try {
            const existing = (await hass.callApi('GET', `config/automation/config/${uid}`)) as Record<string, unknown>;
            const stored = parseSignature(existing?.description);
            if (stored && contentHash(existing) === stored) {
              await hass.callApi('POST', `config/automation/config/${uid}`, payload);
              result.updated++;
              ctx.log(`Regenerated ${a.id} (config changed; automation was untouched)`);
            } else {
              result.skipped++;
              ctx.log(`KEEP ${a.id} - customized since generation; review it manually`);
            }
          } catch {
            result.skipped++;
            ctx.log(`KEEP ${a.id} - could not read its config to verify`);
          }
        }
      } else if ((a.kind === 'template_sensor' || a.kind === 'stats_sensor') && hass.callWS) {
        // Sensor specs are name-only, so an Update can only be display-name
        // drift. A registry name override is display-scoped: it never touches
        // the entity_id or the flow's template/statistics config.
        try {
          await hass.callWS({ type: 'config/entity_registry/update', entity_id: a.id, name: String(a.spec.name ?? '') });
          result.updated++;
          ctx.log(`Renamed ${a.id} to "${String(a.spec.name)}"`);
        } catch {
          result.skipped++;
          ctx.log(`SKIP update ${a.id} - could not set its display name`);
        }
      } else if (a.kind === 'schedule' && hass.callWS) {
        // Schedule specs are name-only by design: live BLOCKS are owned by the
        // card's schedule editor after provisioning and a re-run Apply must
        // never stomp them. A rename carries the live days through unchanged.
        // The storage item is joined via the entity's registry unique_id (for
        // helper entities, unique_id == storage id) - the entity-derived
        // object_id can differ for adopted schedules, and matching on it could
        // rename a DIFFERENT user's schedule whose entity was renamed away
        // (scan S13-A1/F2). Fallback to object_id when the registry is silent.
        const { objectId } = splitId(a.id);
        try {
          const storageId = await storageIdFor(hass, a.id);
          const items = (await hass.callWS({ type: 'schedule/list' })) as Array<Record<string, unknown>>;
          const item = items.find((i) => i.id === storageId);
          if (!item) throw new Error(`no storage item "${storageId}"`);
          const days: Record<string, unknown> = {};
          for (const d of DAY_KEYS) days[d] = item[d] ?? [];
          await hass.callWS({ type: 'schedule/update', schedule_id: storageId, name: String(a.spec.name ?? objectId), ...days });
          result.updated++;
          ctx.log(`Renamed ${a.id} to "${String(a.spec.name)}" (blocks preserved)`);
        } catch (e) {
          result.skipped++;
          ctx.log(`SKIP update ${a.id} - could not rename without touching its blocks (${errText(e)})`);
        }
      } else {
        result.skipped++;
        ctx.log(`KEEP ${a.id} - ${a.kind} updates never overwrite existing content`);
      }
    }
    phase = 'delete';
    for (const a of plan.delete) {
      if (a.id.startsWith('automation:')) {
        const uid = a.id.slice('automation:'.length);
        // Deleting is a stronger act than overwriting: only signature-pristine
        // (machine-generated, untouched) automations may be removed (QA-R B2-2).
        let cfg: Record<string, unknown> | null = null;
        try {
          cfg = (await hass.callApi!('GET', `config/automation/config/${uid}`)) as Record<string, unknown>;
        } catch {
          cfg = null;
        }
        if (!cfg) {
          result.skipped++;
          ctx.log(`SKIP delete ${a.id} - config not readable`);
          continue;
        }
        const stored = parseSignature(cfg.description);
        if (!(stored && contentHash(cfg) === stored)) {
          result.skipped++;
          ctx.log(`KEEP ${a.id} - customized or unsigned; delete it manually if intended`);
          continue;
        }
        ctx.log(`snapshot ${uid}: ${JSON.stringify(cfg)}`);
        await hass.callApi!('DELETE', `config/automation/config/${uid}`);
      } else if (a.kind === 'template_sensor' || a.kind === 'stats_sensor') {
        // Flow-created sensors are CONFIG ENTRIES, not WS collections - resolve
        // the owning entry from the registry and delete that (a `sensor/delete`
        // WS call does not exist; without this, zone removal and teardown could
        // never remove these sensors).
        let entryId: string | undefined;
        try {
          const entries = (await hass.callWS!({
            type: 'config/entity_registry/get_entries',
            entity_ids: [a.id],
          })) as Record<string, { config_entry_id?: string } | null>;
          entryId = entries?.[a.id]?.config_entry_id;
        } catch {
          entryId = undefined;
        }
        if (!entryId) {
          result.skipped++;
          ctx.log(`SKIP delete ${a.id} - no owning config entry found; remove it manually`);
          continue;
        }
        // Only entries of the domains this executor creates (0.7.7 review E2):
        // an adopted entity owned by another integration must never take that
        // integration's whole entry down. Unreadable domain = keep.
        const entryDomain = await configEntryDomain(hass, entryId);
        if (!entryDomain || !DELETABLE_ENTRY_DOMAINS.has(entryDomain)) {
          result.skipped++;
          ctx.log(
            `KEEP ${a.id} - its config entry ${entryId} belongs to "${entryDomain ?? 'an unreadable integration'}", ` +
              `not to a template/history_stats/statistics helper; remove it manually if intended`,
          );
          continue;
        }
        ctx.log(`snapshot ${a.id}: config entry ${entryId} (${entryDomain})`);
        await hass.callApi!('DELETE', `config/config_entries/entry/${entryId}`);
      } else {
        const { domain } = splitId(a.id);
        // Storage id via the registry (0.7.7 review E3): after an entity
        // rename the object_id can name a DIFFERENT user's item.
        const objectId = await storageIdFor(hass, a.id);
        // Steering-off re-apply (QA finding E6): the revert logic lives in the
        // automation being deleted, and deleting an active timer fires NO
        // timer.cancelled event - so without this, an in-flight override
        // strands the zone at the steered setpoint until the next block
        // transition. Cancel the timer and clear the zone's marker BEFORE the
        // delete; both are best-effort (full teardown deletes the marker
        // anyway).
        const parsed = parseEntityId(
          a.id,
          ctx.prefix,
          ctx.zones.map((z) => z.slug),
          ctx.seasons.map((s) => s.key),
        );
        if (parsed?.cls === 'room_override_timer' && parsed.zone) {
          try {
            await hass.callService('timer', 'cancel', { entity_id: a.id });
          } catch {
            /* already idle or gone */
          }
          try {
            await hass.callService('input_text', 'set_value', {
              entity_id: zoneEntityId('applied_block_marker', ctx.prefix, parsed.zone),
              value: '',
            });
            ctx.log(`Released steering override for ${parsed.zone} before deleting its timer`);
          } catch {
            ctx.log(`NOTE: could not clear ${parsed.zone}'s applied-block marker before deleting its timer`);
          }
        }
        if (domain === 'schedule') {
          // Snapshot the week into the log so an intentional-but-regretted
          // season/zone removal is recoverable (QA-R B2-5).
          try {
            const items = (await hass.callWS!({ type: 'schedule/list' })) as Array<Record<string, unknown>>;
            const item = items.find((i) => i.id === objectId);
            if (item) ctx.log(`snapshot ${objectId}: ${JSON.stringify(item)}`);
          } catch {
            ctx.log(`NOTE: could not snapshot ${a.id} before delete`);
          }
        } else {
          // Every other helper is snapshot-logged too (invariant 4; 0.7.7
          // review): a learned k or a tuned threshold is a value worth a line.
          const st = hass.states[a.id];
          ctx.log(`snapshot ${a.id}: state=${JSON.stringify(st?.state ?? null)} attributes=${JSON.stringify(st?.attributes ?? {})}`);
        }
        await hass.callWS!({ type: `${domain}/delete`, [`${domain}_id`]: objectId });
      }
      result.deleted++;
      ctx.log(`Deleted ${a.id}`);
    }
  } catch (e) {
    result.ok = false;
    ctx.log(
      `ERROR during ${phase}: ${e instanceof Error ? e.message : String(e)} - rolling back this run's creates. ` +
        `Already-applied updates/deletes from this run are NOT reverted; see the log above for what landed.`,
    );
    await rollback(hass, createdRecords, ctx);
  }
  return result;
}
