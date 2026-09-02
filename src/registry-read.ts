// Read-only registry snapshot for the provisioning dry-run (S5b).
// Runs in the browser with the user's session - same websocket commands the
// core helpers UI uses. NEVER writes.
import type { HassLike } from './ha-types';
import { parseEntityId, type ZoneClass, type GlobalClass } from './lib/naming';
import { parseSignature, contentHash } from './lib/automation-payloads';
import type { ExistingObject, ObjectKind } from './lib/provisioning';
import { MZCS_LABEL } from './lib/provisioning';

interface ListItem {
  id?: string;
  name?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  [k: string]: unknown;
}

// Typed over EVERY class (0.7.7 review): a class added to naming.ts and
// buildDesired but forgotten here was invisible to the differ - a permanent
// phantom Create on every dry-run. Now the compiler refuses the omission.
const KIND_BY_CLASS: Record<ZoneClass | GlobalClass | 'zone_schedule', ObjectKind> = {
  fan_timer: 'helper',
  room_override_timer: 'helper',
  target_room_select: 'helper',
  steer_target: 'helper',
  applied_block_marker: 'helper',
  zone_enabled: 'helper',
  theme: 'helper',
  k_factor: 'helper',
  season_select: 'helper',
  season_mode: 'helper',
  season_confirm_days: 'helper',
  season_dwell_days: 'helper',
  dev_green_max: 'helper',
  dev_amber_max: 'helper',
  runtime_alert_margin: 'helper',
  runtime_alert_days: 'helper',
  runtime_learn_days: 'helper',
  cdd_base: 'helper',
  override_minutes: 'helper',
  steer_min_setpoint: 'helper',
  steer_max_setpoint: 'helper',
  steer_max_offset: 'helper',
  off_peak_offset: 'helper',
  off_peak_paused_on: 'helper',
  running_sensor: 'template_sensor',
  runtime_mirror: 'template_sensor',
  expected_runtime: 'template_sensor',
  next_block_sensor: 'template_sensor',
  outdoor_temp_sensor: 'template_sensor',
  outdoor_daily_mean: 'stats_sensor',
  runtime_today: 'stats_sensor',
  zone_schedule: 'schedule',
  sensor_schedule: 'schedule',
};

async function listDomain(hass: HassLike, domain: string): Promise<ListItem[]> {
  if (!hass.callWS) return [];
  try {
    const res = await hass.callWS({ type: `${domain}/list` });
    return Array.isArray(res) ? (res as ListItem[]) : [];
  } catch (e) {
    // A failed list must FAIL the snapshot, not degrade it: swallowing it
    // makes every managed item of this domain extract a state-fallback spec,
    // and the differ then plans spurious Updates off a wrong picture
    // (scan S13-D2). The wizard surfaces this as the dry-run error.
    throw new Error(`Could not read the ${domain} list from Home Assistant: ${e instanceof Error ? e.message : String(e)}`);
  }
}

interface RegistryFacts {
  labels: string[];
  /** For UI-created helpers this IS the storage id (0.7.7 review E3: the
   * storage join goes through it, so a renamed entity never reads a
   * different user's item). Absent for YAML helpers and unknown entities. */
  uniqueId?: string;
}

async function registryFor(hass: HassLike, entityIds: string[]): Promise<Map<string, RegistryFacts>> {
  const out = new Map<string, RegistryFacts>();
  if (!hass.callWS || entityIds.length === 0) return out;
  try {
    const res = (await hass.callWS({
      type: 'config/entity_registry/get_entries',
      entity_ids: entityIds,
    })) as Record<string, { labels?: string[]; unique_id?: string } | null>;
    for (const [id, entry] of Object.entries(res ?? {})) {
      if (!entry) continue;
      out.set(id, {
        labels: entry.labels ?? [],
        ...(typeof entry.unique_id === 'string' && entry.unique_id ? { uniqueId: entry.unique_id } : {}),
      });
    }
  } catch {
    // Registry read unavailable → everything parse-matched reads as unmanaged (adopt-safe).
  }
  return out;
}

/**
 * Zone slugs the LIVE engine automation was last generated for - the `zone`
 * field of its per-zone `repeat.for_each` rows. This is the instance-scoped
 * memory of "which zones have been provisioned": the engine's unique id is
 * exact to the prefix, so two card instances under overlapping prefixes
 * (`climate` and `climate_house`) can never read each other's zones - which
 * scanning ids for zone-class suffixes would have done, and then DELETED the
 * other instance's labelled objects. Fail-soft: no engine, unreadable config,
 * or a customized engine without for_each rows = no orphan zones.
 */
interface EngineMemory {
  /** the engine config was read; false = never provisioned / unreadable */
  read: boolean;
  /** zone slugs of its per-zone for_each rows */
  zones: string[];
  /** every `schedule.<prefix>_<zone>_<season>` its state trigger watches */
  schedules: Set<string>;
}

async function previouslyProvisioned(hass: HassLike, prefix: string): Promise<EngineMemory> {
  const none: EngineMemory = { read: false, zones: [], schedules: new Set() };
  if (!hass.callApi) return none;
  try {
    const cfg = await hass.callApi('GET', `config/automation/config/${prefix}_mzcs_engine`);
    const zones = new Set<string>();
    const seasonKeys = new Set<string>();
    const watched = new Set<string>();
    const visit = (n: unknown): void => {
      if (Array.isArray(n)) {
        n.forEach(visit);
        return;
      }
      if (n && typeof n === 'object') {
        const o = n as Record<string, unknown>;
        const rep = o.repeat as Record<string, unknown> | undefined;
        if (rep && Array.isArray(rep.for_each)) {
          for (const row of rep.for_each) {
            const z = (row as Record<string, unknown> | null)?.zone;
            if (typeof z === 'string' && /^[a-z0-9_]+$/.test(z)) zones.add(z);
          }
        }
        // The engine's season name->key map (`{'Summer': 'summer', ...}.get(`):
        // the generator always single-quotes the KEY side.
        const season = (o.variables as Record<string, unknown> | undefined)?.season;
        if (typeof season === 'string' && season.includes('.get(')) {
          for (const m of season.matchAll(/: '([a-z0-9_]+)'/g)) seasonKeys.add(m[1]!);
        }
        if (o.trigger === 'state' && Array.isArray(o.entity_id)) {
          for (const id of o.entity_id) {
            if (typeof id === 'string' && id.startsWith(`schedule.${prefix}_`)) watched.add(id);
          }
        }
        Object.values(o).forEach(visit);
      }
    };
    visit(cfg);
    // Only the engine's OWN zone x season schedules - the exact ids the
    // generator emits - so a hand-edited trigger that watches some other
    // instance's schedule cannot make it claimable (0.7.7 refutation LOW-2),
    // and `<prefix>_<zone>_` as a mere string prefix cannot either
    // (`climate_house_` also prefixes `climate_house_upstairs_summer`).
    const own = new Set<string>();
    for (const z of zones) for (const k of seasonKeys) own.add(`schedule.${prefix}_${z}_${k}`);
    const schedules = new Set([...watched].filter((id) => own.has(id)));
    return { read: true, zones: [...zones], schedules };
  } catch {
    return none;
  }
}

/**
 * Snapshot every entity that belongs to this card's naming contract.
 * managed = carries the mzcs label. Spec extraction is per-domain minimal:
 * exactly the keys buildDesired() emits, so specEqual() compares like-for-like.
 */
export async function fetchExisting(
  hass: HassLike,
  prefix: string,
  zones: string[],
  seasons: string[],
): Promise<ExistingObject[]> {
  const candidates: Array<{ id: string; kind: ObjectKind }> = [];
  const candidateIds = new Set<string>();
  for (const entityId in hass.states) {
    const parsed = parseEntityId(entityId, prefix, zones, seasons);
    if (!parsed) continue;
    const kind = KIND_BY_CLASS[parsed.cls];
    if (kind) {
      candidates.push({ id: entityId, kind });
      candidateIds.add(entityId);
    }
  }
  const claim = (id: string, kind: ObjectKind): void => {
    if (candidateIds.has(id)) return;
    candidates.push({ id, kind });
    candidateIds.add(id);
  };
  // What this instance provisioned LAST time, read from its own engine
  // automation (exact uid, so instance-scoped): the zone slugs of its
  // for_each rows and every zone x season schedule its state trigger watches.
  const memory = await previouslyProvisioned(hass, prefix);
  // ORPHAN SCHEDULES: a season removed from the config (QA-R B1-6, hit live
  // in QA-2) or a zone removed from it (0.7.7 review E1) no longer parses, so
  // its schedule was invisible and silently orphaned instead of planned for
  // delete. Until 0.7.7 this claimed "any schedule under a known zone whose
  // tail is not a class suffix" - a rule that also claimed ANOTHER card
  // instance's schedules whenever one of our zone slugs was a leading word of
  // that instance's prefix (`house` vs `climate_house`), making them
  // delete-eligible (0.7.7 refutation M1). Now only schedules the live engine
  // was generated for are claimed; the mzcs label still decides managed. An
  // install with no readable engine claims nothing extra (never applied =
  // nothing to orphan; engine deleted by hand = delete stray schedules by hand).
  for (const id of memory.schedules) {
    if (hass.states[id]) claim(id, 'schedule');
  }
  // ORPHAN ZONES (0.7.7 review E1): a zone removed from (or renamed in) the
  // config no longer parses either, so ALL of its objects - kill switch,
  // marker, timer, sensors, k - were invisible: never deleted, missed by
  // teardown, and the removed zone's kill switch kept its state (re-adding
  // the zone resumed driving with an all-noop plan).
  const orphanZones = memory.zones.filter((z) => !zones.includes(z));
  if (orphanZones.length) {
    for (const entityId in hass.states) {
      const parsed = parseEntityId(entityId, prefix, orphanZones, seasons);
      if (parsed?.zone) claim(entityId, KIND_BY_CLASS[parsed.cls]);
    }
  }

  const [timers, selects, numbers, schedules, registry] = await Promise.all([
    listDomain(hass, 'timer'),
    listDomain(hass, 'input_select'),
    listDomain(hass, 'input_number'),
    listDomain(hass, 'schedule'),
    registryFor(
      hass,
      candidates.map((c) => c.id),
    ),
  ]);
  const listByObjectId = (items: ListItem[], domain: string) => {
    const m = new Map<string, ListItem>();
    for (const it of items) if (it.id) m.set(`${domain}.${it.id}`, it);
    return m;
  };
  const configs = new Map<string, ListItem>([
    ...listByObjectId(timers, 'timer'),
    ...listByObjectId(selects, 'input_select'),
    ...listByObjectId(numbers, 'input_number'),
    ...listByObjectId(schedules, 'schedule'),
  ]);

  const out: ExistingObject[] = [];
  for (const c of candidates) {
    // Storage join by the registry unique_id when it has one (the storage id
    // for UI-created helpers), else by the entity's object_id.
    const uniq = registry.get(c.id)?.uniqueId;
    const domain = c.id.slice(0, c.id.indexOf('.'));
    const cfg = uniq ? configs.get(`${domain}.${uniq}`) : configs.get(c.id);
    const st = hass.states[c.id];
    let spec: Record<string, unknown> = {};
    if (c.id.startsWith('input_number.') && cfg) {
      const unit = (cfg as { unit_of_measurement?: string }).unit_of_measurement;
      spec = { name: cfg.name, min: cfg.min, max: cfg.max, step: cfg.step, ...(unit != null ? { unit } : {}) };
    } else if (c.id.startsWith('input_select.') && cfg) {
      spec = { name: cfg.name, options: cfg.options };
    } else if (c.id.startsWith('timer.') && cfg) {
      spec = { name: cfg.name, restore: cfg.restore ?? false };
    } else if (c.id.startsWith('schedule.') && cfg) {
      // Name-only by design: live schedule BLOCKS are owned by the card's
      // schedule editor after provisioning; the wizard's week is a creation
      // seed (meta), so a re-run Apply never stomps user schedule edits.
      spec = { name: cfg.name };
    } else if (st) {
      spec = { name: st.attributes.friendly_name ?? c.id };
    }
    out.push({
      id: c.id,
      kind: c.kind,
      spec,
      managed: (registry.get(c.id)?.labels ?? []).includes(MZCS_LABEL),
    });
  }

  // Automations: match by the unique-id-bearing attributes.id on automation
  // entities. managed = carries the mzcs LABEL, same rule as every other kind -
  // an id that merely looks like ours must never make a foreign automation
  // delete-eligible (QA-R finding A2-4). The embedded [mzcs-sig:...] is read
  // from the stored config so the differ can detect stale generated content;
  // unreadable configs report an 'unknown' sig (plans an Update; the executor's
  // pristine check then decides).
  const autoIds: Array<{ cfgId: string; entityId: string; alias: string }> = [];
  for (const entityId in hass.states) {
    if (!entityId.startsWith('automation.')) continue;
    const st = hass.states[entityId];
    if (!st) continue;
    const cfgId = st.attributes.id;
    if (typeof cfgId === 'string' && cfgId.startsWith(`${prefix}_mzcs_`)) {
      autoIds.push({ cfgId, entityId, alias: String(st.attributes.friendly_name ?? cfgId) });
    }
  }
  const [sigs, autoLabels] = await Promise.all([
    Promise.all(
      autoIds.map(async ({ cfgId }) => {
        if (!hass.callApi) return { sig: 'unknown', pristine: undefined as boolean | undefined };
        try {
          const cfg = (await hass.callApi('GET', `config/automation/config/${cfgId}`)) as Record<string, unknown>;
          const stored = parseSignature(cfg?.description);
          // Same pristine test the executor gates regeneration/deletion on, so
          // the card can SHOW which automations the user has taken ownership of.
          return { sig: stored ?? 'unknown', pristine: stored ? contentHash(cfg) === stored : false };
        } catch {
          return { sig: 'unknown', pristine: undefined };
        }
      }),
    ),
    registryFor(
      hass,
      autoIds.map((a) => a.entityId),
    ),
  ]);
  autoIds.forEach(({ cfgId, entityId, alias }, i) => {
    out.push({
      id: `automation:${cfgId}`,
      kind: 'automation',
      spec: { alias, sig: sigs[i]!.sig },
      managed: (autoLabels.get(entityId)?.labels ?? []).includes(MZCS_LABEL),
      pristine: sigs[i]!.pristine,
    });
  });
  return out;
}
