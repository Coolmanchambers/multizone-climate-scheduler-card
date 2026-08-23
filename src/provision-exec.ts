// Wizard executor (S12b): turns the differ's plan into real Home Assistant
// objects via the same websocket/REST APIs the core UI uses. Policies
// (CONTRACT §8 executor notes):
//   - CREATE + ADOPT always; DELETE always; helper config UPDATEs applied.
//   - Schedule/template/stats/automation UPDATEs are SKIPPED with a note:
//     schedules are user data (never overwrite blocks), and existing
//     automations may carry user customizations (e.g. extra guards).
//   - Everything created is labeled mzcs; ordered rollback on error.

import type { HassLike } from './ha-types';
import type { Plan, PlanAction, ProvisionSeason } from './lib/provisioning';
import {
  engineAutomation,
  fanAutomation,
  learningAutomation,
  watchdogAutomation,
  runtimeAlertAutomation,
  type ZoneRef,
} from './lib/automation-payloads';
import type { TimeRange, DayKey } from './lib/schedule-ranges';

export interface ExecContext {
  prefix: string;
  zones: ZoneRef[];
  seasons: ProvisionSeason[];
  log: (line: string) => void;
}

interface CreatedRecord {
  kind: 'collection' | 'config_entry' | 'automation';
  domain?: string;
  itemId?: string;
  entryId?: string;
  automationId?: string;
}

const DAY_KEYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function splitId(entityId: string): { domain: string; objectId: string } {
  const dot = entityId.indexOf('.');
  return { domain: entityId.slice(0, dot), objectId: entityId.slice(dot + 1) };
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

/** Drive a config-entry flow (template / history_stats) with pending fields. */
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
    if (resp.type === 'create_entry') return resp.result?.entry_id ?? '';
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
  if (id.startsWith('binary_sensor.') && spec.source === 'hvac_action') {
    const zone = ctx.zones.find((z) => objectId.includes(z.slug));
    if (!zone) return null;
    return {
      handler: 'template',
      menu: 'binary_sensor',
      fields: {
        name,
        state: `{{ state_attr('${zone.climate}', 'hvac_action') in ['cooling', 'heating'] }}`,
        device_class: 'running',
      },
    };
  }
  if (id.startsWith('sensor.') && spec.model === 'k_x_cdd') {
    const zone = ctx.zones.find((z) => objectId.includes(z.slug));
    if (!zone) return null;
    const p = ctx.prefix;
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
  if (id === `sensor.${ctx.prefix}_next_block`) {
    const p = ctx.prefix;
    const attrs = ctx.zones
      .map((z) => `state_attr('schedule.${p}_${z.slug}_' ~ season, 'next_event')`)
      .join(', ');
    return {
      handler: 'template',
      menu: 'sensor',
      fields: {
        name,
        state: `{% set season = states('input_select.${p}_season') | lower %}{% set evs = [${attrs}] | reject('none') | list %}{{ evs | min if evs | count > 0 else 'unknown' }}`,
      },
    };
  }
  return null;
}

function automationPayload(uid: string, ctx: ExecContext): Record<string, unknown> | null {
  const p = ctx.prefix;
  if (uid === `${p}_mzcs_engine`) return engineAutomation(p, ctx.zones, ctx.seasons);
  if (uid === `${p}_mzcs_watchdog`) return watchdogAutomation(p);
  if (uid === `${p}_mzcs_runtime_learning`) return learningAutomation(p, ctx.zones);
  if (uid === `${p}_mzcs_runtime_alert`) return runtimeAlertAutomation(p, ctx.zones);
  const fanMatch = uid.match(new RegExp(`^${p}_mzcs_fan_timer_(.+)$`));
  if (fanMatch) {
    const zone = ctx.zones.find((z) => z.slug === fanMatch[1]);
    return zone ? fanAutomation(p, zone) : null;
  }
  return null;
}

async function createOne(
  hass: HassLike,
  a: Extract<PlanAction, { op: 'create' }>,
  ctx: ExecContext,
): Promise<CreatedRecord | null> {
  const spec = a.spec;
  if (a.id.startsWith('automation:')) {
    const uid = a.id.slice('automation:'.length);
    const payload = automationPayload(uid, ctx);
    if (!payload) {
      ctx.log(`SKIP ${a.id} - no payload generator`);
      return null;
    }
    await hass.callApi!('POST', `config/automation/config/${uid}`, payload);
    return { kind: 'automation', automationId: uid };
  }
  const { domain, objectId } = splitId(a.id);
  if (['timer', 'input_text', 'input_select', 'input_number', 'input_boolean'].includes(domain)) {
    const body: Record<string, unknown> = { name: spec.name ?? objectId };
    if (domain === 'timer') Object.assign(body, { restore: spec.restore ?? true, duration: '0:30:00' });
    if (domain === 'input_select') Object.assign(body, { options: spec.options ?? ['-'] });
    if (domain === 'input_number') {
      Object.assign(body, {
        min: spec.min ?? 0,
        max: spec.max ?? 100,
        step: spec.step ?? 1,
        ...(spec.unit ? { unit_of_measurement: spec.unit } : {}),
        ...(typeof spec.initial === 'number' ? { initial: spec.initial } : {}),
      });
    }
    const res = (await hass.callWS!({ type: `${domain}/create`, ...body })) as { id?: string };
    return { kind: 'collection', domain, itemId: res?.id ?? objectId };
  }
  if (domain === 'schedule') {
    const body: Record<string, unknown> = { type: 'schedule/create', name: spec.name ?? objectId };
    const week = spec.week as Partial<Record<DayKey, TimeRange[]>> | undefined;
    for (const d of DAY_KEYS) body[d] = week?.[d] ?? [];
    const res = (await hass.callWS!(body)) as { id?: string };
    return { kind: 'collection', domain, itemId: res?.id ?? objectId };
  }
  if (a.kind === 'template_sensor' || a.kind === 'stats_sensor') {
    if (a.kind === 'stats_sensor') {
      const zone = ctx.zones.find((z) => objectId.includes(z.slug));
      if (!zone) {
        ctx.log(`SKIP ${a.id} - no zone match`);
        return null;
      }
      const entryId = await driveFlow(hass, 'history_stats', null, {
        name: spec.name ?? objectId,
        entity_id: `binary_sensor.${ctx.prefix}_${zone.slug}_running`,
        type: 'time',
        state: ['on'],
        start: '{{ today_at() }}',
        end: '{{ now() }}',
      });
      return { kind: 'config_entry', entryId };
    }
    const flow = templateFlowSpec(a.id, spec, ctx);
    if (!flow) {
      ctx.log(`SKIP ${a.id} - not flow-creatable (computed by the card)`);
      return null;
    }
    const entryId = await driveFlow(hass, flow.handler, flow.menu, flow.fields);
    return { kind: 'config_entry', entryId };
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
  await ensureLabel(hass, ctx);
  try {
    for (const a of plan.create) {
      const rec = await createOne(hass, a, ctx);
      if (rec) {
        createdRecords.push(rec);
        result.created++;
        ctx.log(`Created ${a.id}`);
        if (!a.id.startsWith('automation:')) await labelEntity(hass, a.id);
      } else {
        result.skipped++;
      }
    }
    for (const a of plan.adopt) {
      await labelEntity(hass, a.id);
      result.adopted++;
      ctx.log(`Adopted ${a.id}`);
    }
    for (const a of plan.update) {
      if (a.kind === 'helper') {
        const { domain, objectId } = splitId(a.id);
        const { unit, ...rest } = a.spec;
        const payload = { ...rest, ...(unit ? { unit_of_measurement: unit } : {}) };
        try {
          await hass.callWS!({ type: `${domain}/update`, [`${domain}_id`]: objectId, ...payload });
          result.updated++;
          ctx.log(`Updated ${a.id}`);
        } catch {
          result.skipped++;
          ctx.log(`SKIP update ${a.id} - not updatable`);
        }
      } else {
        result.skipped++;
        ctx.log(`KEEP ${a.id} - ${a.kind} updates never overwrite existing content`);
      }
    }
    for (const a of plan.delete) {
      if (a.id.startsWith('automation:')) {
        await hass.callApi!('DELETE', `config/automation/config/${a.id.slice('automation:'.length)}`);
      } else {
        const { domain, objectId } = splitId(a.id);
        await hass.callWS!({ type: `${domain}/delete`, [`${domain}_id`]: objectId });
      }
      result.deleted++;
      ctx.log(`Deleted ${a.id}`);
    }
  } catch (e) {
    result.ok = false;
    ctx.log(`ERROR: ${e instanceof Error ? e.message : String(e)} - rolling back this run's creates`);
    await rollback(hass, createdRecords, ctx);
  }
  return result;
}
