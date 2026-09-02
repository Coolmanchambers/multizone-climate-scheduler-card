import { describe, it, expect } from 'vitest';
import { executePlan, type ExecContext } from '../src/provision-exec';
import {
  engineAutomation,
  fanAutomation,
  learningAutomation,
  watchdogAutomation,
  runtimeAlertAutomation,
  automationSignatures,
  parseSignature,
  contentHash,
  type ZoneRef,
} from '../src/lib/automation-payloads';
import { buildDesired, plan } from '../src/lib/provisioning';
import { resolveEcoPreset } from '../src/types';
import { fetchExisting } from '../src/registry-read';
import type { Plan, PlanAction } from '../src/lib/provisioning';
import type { HassLike } from '../src/ha-types';

const ZONES: ZoneRef[] = [
  { slug: 'upstairs', name: 'Upstairs', climate: 'climate.upstairs' },
  { slug: 'downstairs', name: 'Downstairs', climate: 'climate.downstairs' },
];
const SEASONS = [
  { key: 'summer', name: 'Summer', default_mode: 'cool' as const },
  { key: 'winter', name: 'Winter', default_mode: 'heat_cool' as const },
];

describe('automation payload generators', () => {
  it('engine covers every zone x season schedule and gates on enable + marker + eco', () => {
    const a = engineAutomation('climate', ZONES, SEASONS);
    expect(a.id).toBe('climate_mzcs_engine');
    expect(a.alias).toBe('Climate: schedule engine');
    const triggers = a.triggers as Array<Record<string, unknown>>;
    expect(triggers[0]!.entity_id).toEqual([
      'schedule.climate_upstairs_summer',
      'schedule.climate_upstairs_winter',
      'schedule.climate_downstairs_summer',
      'schedule.climate_downstairs_winter',
    ]);
    const json = JSON.stringify(a);
    expect(json).toContain("is_state(repeat.item.enabled, 'on')");
    expect(json).toContain('mark != states(repeat.item.marker)');
    expect(json).toContain("!= 'eco'");
    expect(json).toContain('heat_cool');
    expect(json).toContain('target_temp_high');
  });

  it('fan automation targets the zone climate and its own timer', () => {
    const a = fanAutomation('climate', ZONES[0]!);
    expect(a.id).toBe('climate_mzcs_fan_timer_upstairs');
    const json = JSON.stringify(a);
    expect(json).toContain('timer.climate_upstairs_fan');
    expect(json).toContain('climate.upstairs');
    expect(json).toContain('set_fan_mode');
  });

  it('learning seeds on first valid day and EMAs afterwards', () => {
    const a = learningAutomation('climate', ZONES);
    const json = JSON.stringify(a);
    expect(json).toContain('cdd > 0.5');
    expect(json).toContain('old_k == 0');
    expect(json).toContain('input_number.climate_upstairs_k');
    expect(json).toContain('input_number.climate_downstairs_k');
  });

  it('watchdog watches the engine entity; alert reads margin helper', () => {
    const w = watchdogAutomation('climate');
    expect(JSON.stringify(w)).toContain('automation.climate_schedule_engine');
    const r = runtimeAlertAutomation('climate', ZONES);
    expect(JSON.stringify(r)).toContain('input_number.climate_runtime_alert_margin');
  });
});

interface Call {
  via: 'ws' | 'api';
  key: string;
  data?: Record<string, unknown>;
}

function fakeHass(failOn?: (c: Call) => boolean): {
  hass: HassLike;
  calls: Call[];
  autos: Map<string, Record<string, unknown>>;
  reg: Map<string, string>;
  autoEnt: Map<string, string>;
  entryDomains: Map<string, string>;
  helperUniq: Map<string, string>;
} {
  const calls: Call[] = [];
  let flowN = 0;
  const flowSteps = new Map<string, number>();
  const flowData = new Map<string, Record<string, unknown>>();
  const autos = new Map<string, Record<string, unknown>>();
  // entity_id -> owning config_entry_id (flow-created entities)
  const reg = new Map<string, string>();
  // automation entity_id -> automation uid, registered like HA does on POST
  // (alias slug, `_2` when a different automation already owns the base id)
  const autoEnt = new Map<string, string>();
  // config_entry_id -> domain (flow-created entries default to 'template';
  // tests set a foreign domain to model an adopted integration entity)
  const entryDomains = new Map<string, string>();
  // helper entity_id -> registry unique_id (storage id), for renamed helpers
  const helperUniq = new Map<string, string>();
  const slug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const hass: HassLike = {
    states: {},
    callService: async (domain, service, data) => {
      calls.push({ via: 'svc' as 'ws', key: `svc ${domain}.${service}`, data });
      return undefined;
    },
    callWS: async (msg) => {
      const c: Call = { via: 'ws', key: String(msg.type), data: msg };
      calls.push(c);
      if (failOn?.(c)) throw new Error(`forced failure at ${c.key}`);
      if (c.key === 'config/entity_registry/get_entries') {
        const ids = (msg.entity_ids as string[]) ?? [];
        return Object.fromEntries(
          ids.map((id) => [
            id,
            reg.has(id)
              ? { config_entry_id: reg.get(id), labels: [] }
              : autoEnt.has(id)
                ? { unique_id: autoEnt.get(id), labels: [] }
                : helperUniq.has(id)
                  ? { unique_id: helperUniq.get(id), labels: [] }
                  : null,
          ]),
        );
      }
      if (c.key === 'config_entries/get_single') {
        const id = String(msg.entry_id);
        return { config_entry: { entry_id: id, domain: entryDomains.get(id) ?? 'template' } };
      }
      if (c.key === 'config/entity_registry/update' && msg.new_entity_id) {
        const from = String(msg.entity_id);
        if (reg.has(from)) {
          reg.set(String(msg.new_entity_id), reg.get(from)!);
          reg.delete(from);
        }
        return {};
      }
      if (c.key === 'schedule/list') {
        return [
          {
            id: 'climate_upstairs_summer',
            name: 'Climate Upstairs Summer',
            monday: [{ from: '08:00:00', to: '22:00:00', data: { mode: 'cool' } }],
          },
        ];
      }
      if (c.key.endsWith('/create')) return { id: String(msg.name ?? 'x').toLowerCase().replace(/[^a-z0-9]+/g, '_') };
      return {};
    },
    callApi: async (method, path, data) => {
      const c: Call = { via: 'api', key: `${method} ${path}`, data };
      calls.push(c);
      if (failOn?.(c)) throw new Error(`forced failure at ${c.key}`);
      if (method === 'POST' && path === 'config/config_entries/flow') {
        const id = `f${++flowN}`;
        flowSteps.set(id, 0);
        return data?.handler === 'template'
          ? { flow_id: id, type: 'menu', step_id: 'user' }
          : {
              flow_id: id,
              type: 'form',
              step_id: 'user',
              data_schema: [{ name: 'name' }, { name: 'entity_id' }, { name: 'type' }],
            };
      }
      const m = path.match(/^config\/config_entries\/flow\/(f\d+)$/);
      if (m) {
        const id = m[1]!;
        const step = (flowSteps.get(id) ?? 0) + 1;
        flowSteps.set(id, step);
        const merged = { ...(flowData.get(id) ?? {}), ...(data ?? {}) };
        flowData.set(id, merged);
        if (data && 'next_step_id' in data) {
          return {
            flow_id: id,
            type: 'form',
            step_id: String(data.next_step_id),
            data_schema: [
              { name: 'name' },
              { name: 'state' },
              { name: 'device_class' },
              { name: 'unit_of_measurement' },
              { name: 'state_class' },
            ],
          };
        }
        if (step >= 2) {
          // Register the created entity like HA would: slug of the name,
          // suffixed when the base id is already taken.
          const name = String(merged.name ?? id);
          const domain = String(merged.device_class ?? '') === 'running' ? 'binary_sensor' : 'sensor';
          let entity = `${domain}.${slug(name)}`;
          while (reg.has(entity)) entity = `${entity}_2`;
          reg.set(entity, `e_${id}`);
          return { flow_id: id, type: 'create_entry', result: { entry_id: `e_${id}` } };
        }
        return {
          flow_id: id,
          type: 'form',
          step_id: 'options',
          data_schema: [{ name: 'state' }, { name: 'start' }, { name: 'end' }],
        };
      }
      const am = path.match(/^config\/automation\/config\/(.+)$/);
      if (am) {
        const uid = am[1]!;
        if (method === 'POST') {
          autos.set(uid, { ...(data ?? {}) });
          let ent = `automation.${slug(String(data?.alias ?? uid))}`;
          while (autoEnt.has(ent) && autoEnt.get(ent) !== uid) ent = `${ent}_2`;
          autoEnt.set(ent, uid);
          return { result: 'ok' };
        }
        if (method === 'GET') {
          const cfg = autos.get(uid);
          if (!cfg) throw new Error('not found');
          return cfg;
        }
        if (method === 'DELETE') { autos.delete(uid); return { result: 'ok' }; }
      }
      const em = path.match(/^config\/config_entries\/entry\/(.+)$/);
      if (method === 'DELETE' && em) {
        for (const [ent, entry] of [...reg]) if (entry === em[1]) reg.delete(ent);
        return { result: 'ok' };
      }
      return { result: 'ok' };
    },
  };
  return { hass, calls, autos, reg, autoEnt, entryDomains, helperUniq };
}

function ctx(log: string[] = []): ExecContext {
  return { prefix: 'climate', zones: ZONES, seasons: SEASONS, log: (l) => log.push(l) };
}

const emptyPlan = (): Plan => ({ create: [], adopt: [], update: [], delete: [], noop: [] });
const create = (id: string, kind: PlanAction['kind'], spec: Record<string, unknown> = {}) =>
  ({ op: 'create', id, kind, spec }) as Extract<PlanAction, { op: 'create' }>;

describe('configurable eco/standby preset (initial release)', () => {
  const cond = (a: Record<string, unknown>): string =>
    (JSON.stringify(a).match(/is_state.repeat.item.enabled[^"]*/) ?? [''])[0]!;

  it('default output is BYTE-IDENTICAL to the original generator (no drift on upgrade)', () => {
    const def = engineAutomation('climate', ZONES, SEASONS);
    const explicit = engineAutomation('climate', ZONES, SEASONS, 'eco');
    expect(contentHash(def)).toBe(contentHash(explicit));
    // The exact legacy strings: any change here re-plans an engine Update on
    // EVERY existing install - that is a deliberate act, never an accident.
    expect(cond(def)).toContain("state_attr(repeat.item.climate, 'preset_mode') != 'eco'");
    expect(String(def.description)).toContain('Zones stand down while their Eco preset is active.');
    expect(JSON.stringify(def)).toContain('Skip when zone disabled, already applied, Eco active, or no block data');
  });

  it('a custom preset name lands in the condition and changes the signature', () => {
    const away = engineAutomation('climate', ZONES, SEASONS, 'away');
    expect(cond(away)).toContain("preset_mode') != 'away'");
    expect(String(away.description)).toContain("their 'away' preset");
    expect(parseSignature(away.description)).not.toBe(
      parseSignature(engineAutomation('climate', ZONES, SEASONS).description),
    );
  });

  it('null disables the stand-down gate entirely', () => {
    const off = engineAutomation('climate', ZONES, SEASONS, null);
    expect(JSON.stringify(off)).not.toContain('preset_mode');
    expect(String(off.description)).not.toContain('stand down');
    expect(JSON.stringify(off)).toContain('Skip when zone disabled, already applied, or no block data');
  });

  it('preset names are sanitized against template injection (quotes/backslashes stripped)', () => {
    const evil = engineAutomation('climate', ZONES, SEASONS, "a'way\\");
    expect(cond(evil)).toContain("preset_mode') != 'away'");
  });

  it('signatures and executor payload agree for a custom preset (parity)', () => {
    const sigs = automationSignatures('climate', ZONES, SEASONS, undefined, 'away');
    const payload = engineAutomation('climate', ZONES, SEASONS, 'away');
    expect(sigs['climate_mzcs_engine']).toBe(parseSignature(payload.description));
    expect(sigs['climate_mzcs_engine']).toBe(contentHash(payload));
  });

  it('resolveEcoPreset: default eco, custom name trimmed, false disables', () => {
    expect(resolveEcoPreset(undefined)).toBe('eco');
    expect(resolveEcoPreset({})).toBe('eco');
    expect(resolveEcoPreset({ eco_preset: ' away ' })).toBe('away');
    expect(resolveEcoPreset({ eco_preset: '' })).toBe('eco');
    expect(resolveEcoPreset({ eco_preset: false })).toBe(null);
  });
});

describe('executePlan', () => {
  it('maps each object kind to the right API', async () => {
    const { hass, calls } = fakeHass();
    const p = emptyPlan();
    p.create.push(
      create('input_boolean.climate_upstairs_enabled', 'helper', { name: 'Climate Upstairs enabled' }),
      create('timer.climate_upstairs_fan', 'helper', { name: 'Climate Upstairs fan', restore: true }),
      create('input_number.climate_upstairs_k', 'helper', { name: 'Climate Upstairs K', min: 0, max: 10, step: 0.01 }),
      create('schedule.climate_upstairs_summer', 'schedule', {
        name: 'Climate Upstairs Summer',
        week: { monday: [{ from: '06:00:00', to: '24:00:00', data: { block: 'Wake' } }] },
      }),
      create('binary_sensor.climate_upstairs_running', 'template_sensor', {
        name: 'Climate Upstairs running',
        source: 'hvac_action',
      }),
      create('sensor.climate_upstairs_runtime_today', 'stats_sensor', {
        name: 'Climate Upstairs runtime today',
      }),
      create('automation:climate_mzcs_engine', 'automation', {}),
    );
    const log: string[] = [];
    const res = await executePlan(hass, p, ctx(log));
    expect(res.ok).toBe(true);
    expect(res.created).toBe(7);
    const keys = calls.map((c) => c.key);
    expect(keys).toContain('input_boolean/create');
    expect(keys).toContain('timer/create');
    expect(keys).toContain('input_number/create');
    expect(keys).toContain('schedule/create');
    expect(keys).toContain('POST config/config_entries/flow');
    expect(keys).toContain('POST config/automation/config/climate_mzcs_engine');
    // schedule create carries all 7 day keys
    const sched = calls.find((c) => c.key === 'schedule/create')!;
    expect(sched.data!.sunday).toEqual([]);
    expect(Array.isArray(sched.data!.monday)).toBe(true);
    // input_boolean create has NO initial/state key (CONTRACT 7c: born disabled)
    const ib = calls.find((c) => c.key === 'input_boolean/create')!;
    expect('initial' in ib.data!).toBe(false);
  });

  it('schedule updates rename but preserve live blocks; automation content is never overwritten; helper updates go through', async () => {
    const { hass, calls } = fakeHass();
    const p = emptyPlan();
    p.update.push(
      { op: 'update', id: 'schedule.climate_upstairs_summer', kind: 'schedule', spec: { name: 'Climate Upstairs Summertime' }, from: { name: 'Climate Upstairs Summer' } },
      { op: 'update', id: 'automation:climate_mzcs_engine', kind: 'automation', spec: {}, from: {} },
      { op: 'update', id: 'input_select.climate_season', kind: 'helper', spec: { name: 'Climate season', options: ['Summer'] }, from: {} },
    );
    const log: string[] = [];
    const res = await executePlan(hass, p, ctx(log));
    expect(res.updated).toBe(2);
    expect(res.skipped).toBe(1);
    // The rename carries the LIVE days through unchanged - spec has no week,
    // so the executor reads them back from schedule/list first.
    const schedUpd = calls.find((c) => c.key === 'schedule/update');
    expect(schedUpd?.data?.name).toBe('Climate Upstairs Summertime');
    expect(schedUpd?.data?.monday).toEqual([{ from: '08:00:00', to: '22:00:00', data: { mode: 'cool' } }]);
    expect(calls.some((c) => c.key === 'input_select/update')).toBe(true);
    expect(log.filter((l) => l.startsWith('KEEP'))).toHaveLength(1);
  });

  it('adopt only labels; delete removes helpers and PRISTINE automations only', async () => {
    const { hass, calls, autos } = fakeHass();
    // Seed a pristine, signed automation via the create path.
    const seed = emptyPlan();
    seed.create.push(create('automation:climate_mzcs_fan_timer_upstairs', 'automation', {}));
    await executePlan(hass, seed, ctx());
    const p = emptyPlan();
    p.adopt.push({ op: 'adopt', id: 'binary_sensor.climate_upstairs_running', kind: 'template_sensor', spec: {} });
    p.delete.push(
      { op: 'delete', id: 'timer.climate_office_fan', kind: 'helper' },
      { op: 'delete', id: 'automation:climate_mzcs_fan_timer_upstairs', kind: 'automation' },
    );
    const res = await executePlan(hass, p, ctx());
    expect(res.adopted).toBe(1);
    expect(res.deleted).toBe(2);
    expect(calls.some((c) => c.key === 'timer/delete')).toBe(true);
    expect(autos.has('climate_mzcs_fan_timer_upstairs')).toBe(false);
    // A customized (unsigned) automation is KEPT even when planned for delete (QA-R B2-2).
    autos.set('climate_mzcs_engine', { id: 'climate_mzcs_engine', alias: 'mine', description: 'hand-built' });
    const p2 = emptyPlan();
    p2.delete.push({ op: 'delete', id: 'automation:climate_mzcs_engine', kind: 'automation' });
    const log: string[] = [];
    const r2 = await executePlan(hass, p2, ctx(log));
    expect(r2.deleted).toBe(0);
    expect(r2.skipped).toBe(1);
    expect(autos.has('climate_mzcs_engine')).toBe(true);
    expect(log.some((l) => l.includes('customized'))).toBe(true);
  });

  it('create never blind-overwrites an existing automation config (upsert guard, QA-R B1-1/B2-1)', async () => {
    const { hass, autos } = fakeHass();
    autos.set('climate_mzcs_engine', { id: 'climate_mzcs_engine', alias: 'custom', description: 'no sig here' });
    const p = emptyPlan();
    p.create.push(create('automation:climate_mzcs_engine', 'automation', {}));
    const log: string[] = [];
    const res = await executePlan(hass, p, ctx(log));
    expect(res.ok).toBe(true);
    expect(autos.get('climate_mzcs_engine')!.alias).toBe('custom');
    expect(log.some((l) => l.includes('not overwritten'))).toBe(true);
    // A pristine pre-existing one IS regenerated, but never rollback-deleted:
    const seed = emptyPlan();
    seed.create.push(create('automation:climate_mzcs_watchdog', 'automation', {}));
    await executePlan(hass, seed, ctx());
    const p2 = emptyPlan();
    p2.create.push(
      create('automation:climate_mzcs_watchdog', 'automation', {}),
      create('schedule.climate_upstairs_summer', 'schedule', { name: 'S', week: {} }),
    );
    const { hass: h2 } = { hass };
    const failing = fakeHass((c) => c.key === 'schedule/create');
    failing.autos.set('climate_mzcs_watchdog', autos.get('climate_mzcs_watchdog')!);
    const r2 = await executePlan(failing.hass, p2, ctx());
    expect(r2.ok).toBe(false);
    // rollback must NOT have deleted the pre-existing watchdog
    expect(failing.autos.has('climate_mzcs_watchdog')).toBe(true);
    void h2;
  });

  it('description-only hand edits count as customized (QA-R B2-7)', async () => {
    const cfg = engineAutomation('climate', ZONES, SEASONS);
    const sig = parseSignature(cfg.description)!;
    expect(contentHash(cfg)).toBe(sig);
    const edited = { ...cfg, description: `${cfg.description} my private note` };
    expect(contentHash(edited)).not.toBe(sig);
  });

  it('input_number creation seeds the default via set_value, never HA initial (QA-R B1-5)', async () => {
    const { hass, calls } = fakeHass();
    const p = emptyPlan();
    p.create.push(
      create('input_number.climate_cdd_base', 'helper', { name: 'Climate cdd base', min: 60, max: 80, step: 1, seed: 75, unit: '°F' }),
    );
    const res = await executePlan(hass, p, ctx());
    expect(res.ok).toBe(true);
    const c = calls.find((x) => x.key === 'input_number/create')!;
    expect('initial' in c.data!).toBe(false);
    const sv = calls.find((x) => x.key === 'svc input_number.set_value');
    expect(sv?.data).toMatchObject({ entity_id: 'input_number.climate_cdd_base', value: 75 });
  });

  it('creates with slug-exact names so HA-generated ids match the contract (apostrophe zones)', async () => {
    const { hass, calls } = fakeHass();
    const p = emptyPlan();
    p.create.push(
      create('timer.climate_owners_office_fan', 'helper', { name: "Climate Owner's Office fan", restore: true }),
    );
    const res = await executePlan(hass, p, ctx());
    expect(res.ok).toBe(true);
    // HA slugifies the create name into the object_id ("Owner's" -> "owner_s"), so the
    // create must use the contract object_id as the name...
    const c = calls.find((x) => x.key === 'timer/create')!;
    expect(c.data!.name).toBe('climate_owners_office_fan');
    // ...and a follow-up update sets the display name without changing the id.
    const u = calls.find((x) => x.key === 'timer/update')!;
    expect(u.data!.timer_id).toBe('climate_owners_office_fan');
    expect(u.data!.name).toBe("Climate Owner's Office fan");
  });

  it('renames flow-created sensors to the contract id when HA slugification diverges', async () => {
    const { hass, calls } = fakeHass();
    const officeCtx: ExecContext = {
      prefix: 'climate',
      zones: [{ slug: 'owners_office', name: "Owner's Office", climate: 'climate.owners_office' }],
      seasons: SEASONS,
      log: () => undefined,
    };
    const p = emptyPlan();
    p.create.push(
      create('binary_sensor.climate_owners_office_running', 'template_sensor', {
        name: "Climate Owner's Office running",
        source: 'hvac_action',
      }),
    );
    const res = await executePlan(hass, p, officeCtx);
    expect(res.ok).toBe(true);
    const rename = calls.find(
      (x) => x.key === 'config/entity_registry/update' && x.data!.new_entity_id !== undefined,
    )!;
    expect(rename.data!.entity_id).toBe('binary_sensor.climate_owner_s_office_running');
    expect(rename.data!.new_entity_id).toBe('binary_sensor.climate_owners_office_running');
  });

  it('rolls back this run\'s creates in reverse order on failure', async () => {
    const { hass, calls } = fakeHass((c) => c.key === 'schedule/create');
    const p = emptyPlan();
    p.create.push(
      create('input_boolean.climate_upstairs_enabled', 'helper', { name: 'Climate Upstairs enabled' }),
      create('timer.climate_upstairs_fan', 'helper', { name: 'Climate Upstairs fan' }),
      create('schedule.climate_upstairs_summer', 'schedule', { name: 'Climate Upstairs Summer', week: {} }),
    );
    const log: string[] = [];
    const res = await executePlan(hass, p, ctx(log));
    expect(res.ok).toBe(false);
    const deletes = calls.filter((c) => c.key.endsWith('/delete')).map((c) => c.key);
    expect(deletes).toEqual(['timer/delete', 'input_boolean/delete']);
    expect(log.some((l) => l.startsWith('ERROR'))).toBe(true);
  });
});

describe('automation signatures + safe regeneration', () => {
  it('signatures change only for automations whose inputs changed', () => {
    const base = automationSignatures('climate', ZONES, SEASONS);
    const moreZones = automationSignatures(
      'climate',
      [...ZONES, { slug: 'office', name: 'Office', climate: 'climate.office' }],
      SEASONS,
    );
    expect(moreZones['climate_mzcs_engine']).not.toBe(base['climate_mzcs_engine']);
    expect(moreZones['climate_mzcs_runtime_learning']).not.toBe(base['climate_mzcs_runtime_learning']);
    expect(moreZones['climate_mzcs_watchdog']).toBe(base['climate_mzcs_watchdog']);
    // season rename (stable key) does NOT change the schedule ids but DOES
    // change the engine's name->key map, so the engine regenerates - correct.
    const renamed = automationSignatures('climate', ZONES, [
      { key: 'summer', name: 'Hot Season', default_mode: 'cool' },
      SEASONS[1]!,
    ]);
    expect(renamed['climate_mzcs_engine']).not.toBe(base['climate_mzcs_engine']);
    expect(renamed['climate_mzcs_runtime_alert']).toBe(base['climate_mzcs_runtime_alert']);
  });

  it('fan guard is part of the fan automation signature and payload', () => {
    const un = automationSignatures('climate', ZONES, SEASONS);
    const gu = automationSignatures('climate', ZONES, SEASONS, 'input_boolean.hvac_fan_guard');
    expect(gu['climate_mzcs_fan_timer_upstairs']).not.toBe(un['climate_mzcs_fan_timer_upstairs']);
    const payload = fanAutomation('climate', ZONES[0]!, 'input_boolean.hvac_fan_guard');
    expect(JSON.stringify(payload)).toContain('input_boolean.hvac_fan_guard');
  });

  it('generated payloads verify against their own embedded signature', () => {
    const cfg = engineAutomation('climate', ZONES, SEASONS);
    expect(parseSignature(cfg.description)).toBe(contentHash(cfg));
  });

  it('regenerates a stale automation only while it is pristine', async () => {
    const { hass, autos } = fakeHass();
    // Create with the base ctx...
    const p1 = emptyPlan();
    p1.create.push(create('automation:climate_mzcs_engine', 'automation', {}));
    await executePlan(hass, p1, ctx());
    const created = autos.get('climate_mzcs_engine')!;
    // ...then apply an update with an extra zone: pristine -> regenerated.
    const grown: ExecContext = {
      prefix: 'climate',
      zones: [...ZONES, { slug: 'office', name: 'Office', climate: 'climate.office' }],
      seasons: SEASONS,
      log: () => undefined,
    };
    const p2 = emptyPlan();
    p2.update.push({ op: 'update', id: 'automation:climate_mzcs_engine', kind: 'automation', spec: {}, from: {} });
    const r2 = await executePlan(hass, p2, grown);
    expect(r2.updated).toBe(1);
    const regen = autos.get('climate_mzcs_engine')!;
    expect(regen).not.toEqual(created);
    expect(JSON.stringify(regen)).toContain('schedule.climate_office_summer');
    // Hand-edit the stored config: next update must KEEP it.
    autos.set('climate_mzcs_engine', { ...regen, mode: 'single' });
    const log: string[] = [];
    const p3 = emptyPlan();
    p3.update.push({ op: 'update', id: 'automation:climate_mzcs_engine', kind: 'automation', spec: {}, from: {} });
    const r3 = await executePlan(hass, p3, { ...grown, log: (l) => log.push(l) });
    expect(r3.updated).toBe(0);
    expect(r3.skipped).toBe(1);
    expect(log.some((l) => l.includes('customized'))).toBe(true);
    expect(autos.get('climate_mzcs_engine')!.mode).toBe('single');
  });
});

describe('flow-entity resolution (S12c incident regression)', () => {
  it('renames the NEW entity, never a same-name bystander', async () => {
    const { hass, calls, reg } = fakeHass();
    // A pre-existing entity already owns the base slug (e.g. the production
    // sensor when a second-prefix card uses the same display name).
    reg.set('binary_sensor.climate_owner_s_office_running', 'someone_elses_entry');
    const officeCtx: ExecContext = {
      prefix: 'climate',
      zones: [{ slug: 'owners_office', name: "Owner's Office", climate: 'climate.x' }],
      seasons: SEASONS,
      log: () => undefined,
    };
    const p = emptyPlan();
    p.create.push(
      create('binary_sensor.climate_owners_office_running', 'template_sensor', {
        name: "Climate Owner's Office running",
        source: 'hvac_action',
      }),
    );
    const res = await executePlan(hass, p, officeCtx);
    expect(res.ok).toBe(true);
    const rename = calls.find(
      (x) => x.key === 'config/entity_registry/update' && x.data!.new_entity_id !== undefined,
    )!;
    // The suffixed NEW entity moves; the bystander keeps its id and entry.
    expect(rename.data!.entity_id).toBe('binary_sensor.climate_owner_s_office_running_2');
    expect(rename.data!.new_entity_id).toBe('binary_sensor.climate_owners_office_running');
    expect(reg.get('binary_sensor.climate_owner_s_office_running')).toBe('someone_elses_entry');
    expect(reg.get('binary_sensor.climate_owners_office_running')).toBe('e_f1');
  });

  it('display names are prefix-derived so two instances cannot collide', () => {
    const mk = (prefix: string) => buildDesired({
      prefix,
      zones: [{ slug: 'office', name: 'Office', climate: 'climate.office' }],
      seasons: SEASONS,
      schedules: { office: { summer: { granularity: 'all', sets: { all: [{ time: '06:00', name: 'Day', mode: 'cool', cool_temp: 78, heat_temp: null }] } }, winter: { granularity: 'all', sets: { all: [{ time: '06:00', name: 'Day', mode: 'heat_cool', cool_temp: 84, heat_temp: 66 }] } } } },
      features: { fan_timer: true, anomaly_alerts: true, steering: false },
    });
    const a = mk('climate');
    const b = mk('mzcsqa');
    const nameOf = (d: ReturnType<typeof mk>, id: string) => d.find((x) => x.id.endsWith(id))!.spec.name;
    expect(nameOf(a, '_outdoor_daily_mean')).toBe('Climate outdoor daily mean');
    expect(nameOf(b, '_outdoor_daily_mean')).toBe('Mzcsqa outdoor daily mean');
    expect(nameOf(b, '_next_block')).toBe('Mzcsqa next block');
    const aNames = new Set(a.map((x) => x.spec.name).filter((n) => typeof n === 'string'));
    for (const x of b) {
      if (typeof x.spec.name === 'string') expect(aNames.has(x.spec.name)).toBe(false);
    }
  });
});

describe('next-block sensor season map (item 47)', () => {
  const flowFields = (calls: Call[]) => {
    const steps = calls.filter((c) => /^POST config\/config_entries\/flow\/f\d+$/.test(c.key));
    return Object.assign({}, ...steps.map((c) => c.data ?? {}));
  };

  it('an apostrophe season name gets the double-quoted map key, pinned exactly', async () => {
    const { hass, calls } = fakeHass();
    const octx: ExecContext = {
      prefix: 'climate',
      zones: ZONES,
      seasons: [
        { key: 'owners_summer', name: "Owner's Summer", default_mode: 'cool' },
        { key: 'winter', name: 'Winter', default_mode: 'heat_cool' },
      ],
      log: () => undefined,
    };
    const p = emptyPlan();
    p.create.push(create('sensor.climate_next_block', 'template_sensor', { name: 'Climate next block' }));
    const res = await executePlan(hass, p, octx);
    expect(res.ok).toBe(true);
    expect(flowFields(calls).state).toBe(
      `{% set season = {"Owner's Summer": 'owners_summer', 'Winter': 'winter'}.get(states('input_select.climate_season'), states('input_select.climate_season') | lower) %}` +
        `{% set evs = states.schedule | selectattr('entity_id', 'search', '^schedule\\.climate_[a-z0-9_]+_' ~ season ~ '$') | map(attribute='attributes.next_event') | reject('none') | list %}` +
        `{{ evs | min if evs | count > 0 else 'unknown' }}`,
    );
  });

  it('quote-free seasons keep the pre-change template, byte-for-byte', async () => {
    const { hass, calls } = fakeHass();
    const p = emptyPlan();
    p.create.push(create('sensor.climate_next_block', 'template_sensor', { name: 'Climate next block' }));
    const res = await executePlan(hass, p, ctx());
    expect(res.ok).toBe(true);
    expect(flowFields(calls).state).toBe(
      `{% set season = {'Summer': 'summer', 'Winter': 'winter'}.get(states('input_select.climate_season'), states('input_select.climate_season') | lower) %}` +
        `{% set evs = states.schedule | selectattr('entity_id', 'search', '^schedule\\.climate_[a-z0-9_]+_' ~ season ~ '$') | map(attribute='attributes.next_event') | reject('none') | list %}` +
        `{{ evs | min if evs | count > 0 else 'unknown' }}`,
    );
  });
});

describe('config-entry sensor deletion (teardown / zone removal)', () => {
  it('deletes flow-created sensors via their config entry, not a bogus WS collection call', async () => {
    const { hass, calls, reg } = fakeHass();
    // create a running sensor via the flow (registers reg entry e_f1)
    const seed = emptyPlan();
    seed.create.push(
      create('binary_sensor.climate_upstairs_running', 'template_sensor', {
        name: 'Climate Upstairs running',
        source: 'hvac_action',
      }),
    );
    await executePlan(hass, seed, ctx());
    expect(reg.get('binary_sensor.climate_upstairs_running')).toBe('e_f1');
    const p = emptyPlan();
    p.delete.push({ op: 'delete', id: 'binary_sensor.climate_upstairs_running', kind: 'template_sensor' });
    const res = await executePlan(hass, p, ctx());
    expect(res.deleted).toBe(1);
    expect(calls.some((c) => c.key === 'DELETE config/config_entries/entry/e_f1')).toBe(true);
    expect(reg.has('binary_sensor.climate_upstairs_running')).toBe(false);
    // an unresolvable sensor is skipped with a note, never a bogus delete
    const p2 = emptyPlan();
    p2.delete.push({ op: 'delete', id: 'sensor.climate_ghost', kind: 'stats_sensor' });
    const log: string[] = [];
    const r2 = await executePlan(hass, p2, ctx(log));
    expect(r2.deleted).toBe(0);
    expect(r2.skipped).toBe(1);
    expect(log.some((l) => l.includes('no owning config entry'))).toBe(true);
  });
});

describe('pristine reporting for the Objects tab (initial release)', () => {
  it('reports pristine=false for a hand-edited automation and true for a generated one', async () => {
    const generated = engineAutomation('climate', ZONES, SEASONS);
    const edited = { ...generated, description: String(generated.description) + ' my own note' };
    const hass: HassLike = {
      states: {
        'automation.climate_schedule_engine': {
          state: 'on',
          attributes: { id: 'climate_mzcs_engine', friendly_name: 'Climate: schedule engine' },
        },
        'automation.climate_engine_watchdog': {
          state: 'on',
          attributes: { id: 'climate_mzcs_watchdog', friendly_name: 'Climate: engine watchdog' },
        },
      },
      callService: async () => undefined,
      callWS: async (msg) => {
        const t = String(msg.type);
        if (t === 'config/entity_registry/get_entries') {
          const ids = (msg.entity_ids as string[]) ?? [];
          return Object.fromEntries(ids.map((id) => [id, { labels: ['mzcs'] }]));
        }
        if (t.endsWith('/list')) return [];
        return {};
      },
      callApi: async (_m, path) =>
        path.endsWith('climate_mzcs_engine') ? generated : watchdogAutomation('climate'),
    };
    const existing = await fetchExisting(hass, 'climate', ['upstairs', 'downstairs'], ['summer', 'winter']);
    const eng = existing.find((e) => e.id === 'automation:climate_mzcs_engine');
    const wd = existing.find((e) => e.id === 'automation:climate_mzcs_watchdog');
    expect(eng?.pristine).toBe(true);
    expect(wd?.pristine).toBe(true);

    // Same registry, but the engine has been hand-edited in HA.
    const hass2: HassLike = {
      ...hass,
      callApi: async (_m, path) =>
        path.endsWith('climate_mzcs_engine') ? edited : watchdogAutomation('climate'),
    };
    const existing2 = await fetchExisting(hass2, 'climate', ['upstairs', 'downstairs'], ['summer', 'winter']);
    expect(existing2.find((e) => e.id === 'automation:climate_mzcs_engine')?.pristine).toBe(false);
  });

  it('pristine is reporting-only: it never reaches spec, so the differ is unaffected', async () => {
    const generated = engineAutomation('climate', ZONES, SEASONS);
    const hass: HassLike = {
      states: {
        'automation.climate_schedule_engine': {
          state: 'on',
          attributes: { id: 'climate_mzcs_engine', friendly_name: 'Climate: schedule engine' },
        },
      },
      callService: async () => undefined,
      callWS: async (msg) => {
        const t = String(msg.type);
        if (t === 'config/entity_registry/get_entries') {
          const ids = (msg.entity_ids as string[]) ?? [];
          return Object.fromEntries(ids.map((id) => [id, { labels: ['mzcs'] }]));
        }
        if (t.endsWith('/list')) return [];
        return {};
      },
      callApi: async () => ({ ...generated, description: String(generated.description) + ' edited' }),
    };
    const existing = await fetchExisting(hass, 'climate', ['upstairs', 'downstairs'], ['summer', 'winter']);
    const eng = existing.find((e) => e.id === 'automation:climate_mzcs_engine')!;
    expect(eng.pristine).toBe(false);
    expect('pristine' in eng.spec).toBe(false);
    expect(Object.keys(eng.spec).sort()).toEqual(['alias', 'sig']);
  });
});

describe('orphan season schedule discovery (QA-2 live finding, B1-6 season variant)', () => {
  // The live engine automation is the instance-scoped memory of which
  // schedules were provisioned (0.7.7): its state trigger lists every zone x
  // season schedule, its season map carries the keys, its for_each the zones.
  const engineConfig = (zones: string[], seasons: string[], extraWatched: string[] = []) => ({
    id: 'climate_mzcs_engine',
    triggers: [
      {
        trigger: 'state',
        entity_id: [...zones.flatMap((z) => seasons.map((s) => `schedule.climate_${z}_${s}`)), ...extraWatched],
      },
    ],
    actions: [
      {
        variables: {
          season: `{{ {${seasons.map((s) => `'${s[0]!.toUpperCase()}${s.slice(1)}': '${s}'`).join(', ')}}.get(states('input_select.climate_season'), states('input_select.climate_season') | lower) }}`,
        },
      },
      { repeat: { for_each: zones.map((z) => ({ zone: z })), sequence: [] } },
    ],
  });
  const engineFor =
    (zones: string[], seasons: string[], extraWatched: string[] = []): HassLike['callApi'] =>
    async (method, path) => {
      if (method === 'GET' && path === 'config/automation/config/climate_mzcs_engine') {
        return engineConfig(zones, seasons, extraWatched);
      }
      throw new Error('not found');
    };

  it('a schedule for a season no longer in the config is still seen and planned for delete', async () => {
    const hass: HassLike = {
      states: {
        'schedule.climate_upstairs_spring': { state: 'on', attributes: {} },
        'schedule.climate_upstairs_summer': { state: 'on', attributes: {} },
      },
      callService: async () => undefined,
      callWS: async (msg) => {
        const t = String(msg.type);
        if (t === 'config/entity_registry/get_entries') {
          const ids = (msg.entity_ids as string[]) ?? [];
          return Object.fromEntries(ids.map((id) => [id, { labels: ['mzcs'] }]));
        }
        if (t.endsWith('/list')) return [];
        return {};
      },
      callApi: engineFor(['upstairs'], ['spring', 'summer']),
    };
    // config only knows summer/winter - spring was removed
    const existing = await fetchExisting(hass, 'climate', ['upstairs'], ['summer', 'winter']);
    expect(existing.some((e) => e.id === 'schedule.climate_upstairs_spring' && e.managed)).toBe(true);
    const p = plan(buildDesired({
      prefix: 'climate',
      zones: [{ slug: 'upstairs', name: 'Upstairs', climate: 'climate.up' }],
      seasons: SEASONS,
      schedules: { upstairs: { summer: { granularity: 'all', sets: { all: [{ time: '06:00', name: 'Day', mode: 'cool', cool_temp: 78, heat_temp: null }] } }, winter: { granularity: 'all', sets: { all: [{ time: '06:00', name: 'Day', mode: 'heat_cool', cool_temp: 84, heat_temp: 66 }] } } } },
      features: { fan_timer: true, anomaly_alerts: true, steering: false },
    }), existing);
    expect(p.delete.map((a) => a.id)).toContain('schedule.climate_upstairs_spring');
    // a foreign (unlabeled) lookalike schedule is NOT deleted
    const hass2: HassLike = {
      ...hass,
      callWS: async (msg) => {
        const t = String(msg.type);
        if (t === 'config/entity_registry/get_entries') {
          const ids = (msg.entity_ids as string[]) ?? [];
          return Object.fromEntries(ids.map((id) => [id, { labels: [] }]));
        }
        if (t.endsWith('/list')) return [];
        return {};
      },
    };
    const existing2 = await fetchExisting(hass2, 'climate', ['upstairs'], ['summer', 'winter']);
    expect(existing2.some((e) => e.id === 'schedule.climate_upstairs_spring' && !e.managed)).toBe(true);
  });

  it('0.7.7 refutation M1: schedules are claimed from the live engine only, never by id shape', async () => {
    // Instance A (prefix `climate`, a zone called "House") beside instance B
    // (prefix `climate_house`). B's schedule ids read as `climate` + `house_...`
    // and the old tail rule claimed them for A - labelled, so delete-eligible.
    const mk = (engine: string[] | null): HassLike => ({
      states: {
        'schedule.climate_house_summer': { state: 'on', attributes: {} },
        'schedule.climate_house_upstairs_summer': { state: 'on', attributes: {} }, // B's
        'schedule.climate_house_upstairs_winter': { state: 'on', attributes: {} }, // B's
        'schedule.climate_house_spring': { state: 'on', attributes: {} }, // A's removed season
      },
      callService: async () => undefined,
      callWS: async (msg) => {
        const t = String(msg.type);
        if (t === 'config/entity_registry/get_entries') {
          const ids = (msg.entity_ids as string[]) ?? [];
          return Object.fromEntries(ids.map((id) => [id, { labels: ['mzcs'] }]));
        }
        if (t.endsWith('/list')) return [];
        return {};
      },
      ...(engine ? { callApi: engineFor(['house'], engine) } : {}),
    });
    const withEngine = await fetchExisting(mk(['summer', 'spring']), 'climate', ['house'], ['summer']);
    expect(withEngine.map((e) => e.id).sort()).toEqual(['schedule.climate_house_spring', 'schedule.climate_house_summer']);
    // No engine (never applied): nothing beyond the current parse is claimed -
    // B's schedules are safe, and A's stray spring schedule is left alone.
    const noEngine = await fetchExisting(mk(null), 'climate', ['house'], ['summer']);
    expect(noEngine.map((e) => e.id)).toEqual(['schedule.climate_house_summer']);
  });

  it('0.7.7 refutation MED-1: a removed zone whose slug extends a current slug is claimed ONCE', async () => {
    // zones `up` and `up_late`; `up_late` removed. The season pass used to
    // push `schedule.climate_up_late_*` (as zone `up`, season `late_*`) and
    // the zone pass pushed them again: two deletes, the second aborting Apply.
    const ids = [
      'schedule.climate_up_summer',
      'schedule.climate_up_late_summer',
      'schedule.climate_up_late_spring',
      'input_boolean.climate_up_late_enabled',
    ];
    const hass: HassLike = {
      states: Object.fromEntries(ids.map((id) => [id, { state: 'on', attributes: {} }])),
      callService: async () => undefined,
      callWS: async (msg) => {
        const t = String(msg.type);
        if (t === 'config/entity_registry/get_entries') {
          const e = (msg.entity_ids as string[]) ?? [];
          return Object.fromEntries(e.map((id) => [id, { labels: ['mzcs'] }]));
        }
        if (t.endsWith('/list')) return [];
        return {};
      },
      callApi: engineFor(['up', 'up_late'], ['summer', 'spring']),
    };
    const existing = await fetchExisting(hass, 'climate', ['up'], ['summer']);
    const seen = existing.map((e) => e.id);
    expect(new Set(seen).size).toBe(seen.length);
    // (up_spring is watched by the engine but has no state here, so it is not listed)
    expect(seen.sort()).toEqual([...ids].sort());
    const p = plan(
      buildDesired({
        prefix: 'climate',
        zones: [{ slug: 'up', name: 'Up', climate: 'climate.up' }],
        seasons: [{ key: 'summer', name: 'Summer', default_mode: 'cool' }],
        schedules: { up: { summer: { granularity: 'all', sets: { all: [{ time: '06:00', name: 'Day', mode: 'cool', cool_temp: 78, heat_temp: null }] } } } },
        features: { fan_timer: true, anomaly_alerts: true, steering: false },
      }),
      existing,
    );
    const del = p.delete.map((a) => a.id);
    expect(new Set(del).size).toBe(del.length);
    expect(del).toEqual(expect.arrayContaining(ids.filter((i) => i.includes('up_late'))));
  });

  it('0.7.7 refutation LOW-2: a hand-edited engine trigger cannot pull a foreign schedule into the claim', async () => {
    // The user added another instance's schedule to A's engine trigger. Only
    // schedules under A's OWN for_each zones are memory; the foreign one is
    // not claimed, so it can never become delete-eligible here.
    const hass: HassLike = {
      states: {
        'schedule.climate_house_summer': { state: 'on', attributes: {} },
        'schedule.climate_house_upstairs_summer': { state: 'on', attributes: {} }, // instance B's
      },
      callService: async () => undefined,
      callWS: async (msg) => {
        const t = String(msg.type);
        if (t === 'config/entity_registry/get_entries') {
          const e = (msg.entity_ids as string[]) ?? [];
          return Object.fromEntries(e.map((id) => [id, { labels: ['mzcs'] }]));
        }
        if (t.endsWith('/list')) return [];
        return {};
      },
      callApi: engineFor(['house'], ['summer'], ['schedule.climate_house_upstairs_summer']),
    };
    const existing = await fetchExisting(hass, 'climate', ['house'], ['summer']);
    expect(existing.map((e) => e.id)).toEqual(['schedule.climate_house_summer']);
  });
});

describe('runtime mirror sensor (item 42)', () => {
  /**
   * The mirror exists for ONE reason: history_stats sensors expose no
   * state_class, so HA accrues no long-term statistics for them (the live
   * 0.7.2 bug). Every assertion here is the load-bearing property - a mirror
   * created WITHOUT state_class: measurement is the original defect rebuilt.
   */
  it('creates a template sensor mirroring runtime_today WITH state_class: measurement', async () => {
    const { hass, calls } = fakeHass();
    const p = emptyPlan();
    p.create.push(
      create('sensor.climate_upstairs_runtime_mirror', 'template_sensor', {
        name: 'Climate Upstairs runtime mirror',
        model: 'runtime_mirror',
      }),
    );
    const log: string[] = [];
    const res = await executePlan(hass, p, ctx(log));
    expect(res.ok).toBe(true);
    expect(res.created).toBe(1);
    // The finishing flow step carries the sensor's fields.
    const flowSteps = calls.filter((c) => /^POST config\/config_entries\/flow\/f\d+$/.test(c.key));
    const fields = Object.assign({}, ...flowSteps.map((c) => c.data ?? {}));
    expect(fields.state).toBe("{{ states('sensor.climate_upstairs_runtime_today') | float(0) }}");
    expect(fields.state_class).toBe('measurement');
    expect(fields.unit_of_measurement).toBe('h');
  });

  it('skips with a log line, never throws, when the id matches no zone', async () => {
    const { hass } = fakeHass();
    const p = emptyPlan();
    p.create.push(
      create('sensor.climate_nowhere_runtime_mirror', 'template_sensor', {
        name: 'X',
        model: 'runtime_mirror',
      }),
    );
    const log: string[] = [];
    const res = await executePlan(hass, p, ctx(log));
    expect(res.ok).toBe(true);
    expect(log.some((l) => l.includes('SKIP'))).toBe(true);
  });
});

describe('power-heuristic running sensor (item 29)', () => {
  /**
   * SmartThings-class mini-splits expose NO hvac_action, so the hvac_action
   * template is permanently False for them (measured live 2026-08-30). With a
   * configured zone power sensor, the CREATION template becomes an OR of the
   * two measured heuristics: power above standby (catches setpoint-hold duty
   * cycling the delta misses) or hvac active with the room >= 1° past
   * setpoint (catches multi-hour power-feed stalls). Both failing together
   * undercounts - the fail-safe direction. Meta-only: absent power must emit
   * the ORIGINAL template byte-for-byte, and the differ never compares
   * template bodies either way.
   */
  const flowFields = (calls: Array<{ key: string; data?: Record<string, unknown> }>) => {
    const steps = calls.filter((c) => /^POST config\/config_entries\/flow\/f\d+$/.test(c.key));
    return Object.assign({}, ...steps.map((c) => c.data ?? {}));
  };

  it('with meta.power: the OR template, pinned exactly (QA 0.7.7 MED-1: asymmetric sentinels)', async () => {
    const { hass, calls } = fakeHass();
    const p = emptyPlan();
    p.create.push(
      create('binary_sensor.climate_upstairs_running', 'template_sensor', {
        name: 'Climate Upstairs running',
        source: 'hvac_action',
        power: 'sensor.upstairs_power',
      }),
    );
    const res = await executePlan(hass, p, ctx());
    expect(res.ok).toBe(true);
    const fields = flowFields(calls);
    // The delta branch's defaults are asymmetric ON PURPOSE: reading side low
    // (-9999), setpoint side high (9999), so a missing attribute can only make
    // the comparison FALSE. float(0) on both sides fabricated a huge delta
    // when current_temperature dropped out mid-heat and pinned running ON.
    expect(fields.state).toBe(
      "{{ (states('sensor.upstairs_power') | float(0)) > 100 or (is_state('climate.upstairs', 'cool') and (state_attr('climate.upstairs', 'current_temperature') | float(-9999)) - (state_attr('climate.upstairs', 'temperature') | float(9999)) >= 1) or (is_state('climate.upstairs', 'heat') and (state_attr('climate.upstairs', 'temperature') | float(-9999)) - (state_attr('climate.upstairs', 'current_temperature') | float(9999)) >= 1) }}",
    );
    expect(fields.device_class).toBe('running');
  });

  it('without meta.power: the ORIGINAL hvac_action template, byte-for-byte', async () => {
    const { hass, calls } = fakeHass();
    const p = emptyPlan();
    p.create.push(
      create('binary_sensor.climate_upstairs_running', 'template_sensor', {
        name: 'Climate Upstairs running',
        source: 'hvac_action',
      }),
    );
    const res = await executePlan(hass, p, ctx());
    expect(res.ok).toBe(true);
    expect(flowFields(calls).state).toBe(
      "{{ state_attr('climate.upstairs', 'hvac_action') in ['cooling', 'heating'] }}",
    );
  });
});

/**
 * 0.7.7 fresh review (2026-09-01): executor hardening. Each test names the
 * finding it pins; every one was reproduced by execution before the fix.
 */
describe('0.7.7 review: executor hardening', () => {
  it('E2: deleting an adopted sensor KEEPS a config entry that belongs to another integration', async () => {
    const { hass, calls, reg, entryDomains } = fakeHass();
    // An adopted running sensor whose registry entry points at a thermostat
    // integration's own config entry - deleting that entry would remove the
    // whole integration.
    reg.set('binary_sensor.climate_upstairs_running', 'entry_of_users_thermostat_integration');
    entryDomains.set('entry_of_users_thermostat_integration', 'nest');
    const p = emptyPlan();
    p.delete.push({ op: 'delete', id: 'binary_sensor.climate_upstairs_running', kind: 'template_sensor' });
    const log: string[] = [];
    const res = await executePlan(hass, p, ctx(log));
    expect(res.deleted).toBe(0);
    expect(res.skipped).toBe(1);
    expect(calls.some((c) => c.key.startsWith('DELETE config/config_entries/entry/'))).toBe(false);
    expect(log.some((l) => l.startsWith('KEEP') && l.includes('"nest"'))).toBe(true);
  });

  it('E2: an unreadable entry domain is also KEEP, never a delete', async () => {
    const { hass, calls, reg } = fakeHass((c) => c.key === 'config_entries/get_single' || c.key === 'config_entries/get');
    reg.set('sensor.climate_upstairs_runtime_today', 'e_unknown');
    const p = emptyPlan();
    p.delete.push({ op: 'delete', id: 'sensor.climate_upstairs_runtime_today', kind: 'stats_sensor' });
    const res = await executePlan(hass, p, ctx());
    expect(res.deleted).toBe(0);
    expect(calls.some((c) => c.key.startsWith('DELETE config/config_entries/entry/'))).toBe(false);
  });

  it('E3: helper update and delete address STORAGE by the registry unique_id, not the entity object_id', async () => {
    const { hass, calls, helperUniq } = fakeHass();
    // The managed helper's entity was renamed to the contract id by the user;
    // its storage item is still `hvac_cdd_base`. A foreign item happens to own
    // the storage id `climate_cdd_base` - addressing by object_id would rewrite
    // and then delete THAT one.
    helperUniq.set('input_number.climate_cdd_base', 'hvac_cdd_base');
    (hass.states as Record<string, unknown>)['input_number.climate_cdd_base'] = {
      state: '72',
      attributes: { min: 60, max: 80 },
    };
    const p = emptyPlan();
    p.update.push({
      op: 'update',
      id: 'input_number.climate_cdd_base',
      kind: 'helper',
      spec: { name: 'Climate CDD base', min: 60, max: 80, step: 1 },
      from: { name: 'old', min: 60, max: 80, step: 1 },
    });
    await executePlan(hass, p, ctx());
    const upd = calls.find((c) => c.key === 'input_number/update')!;
    expect(upd.data!.input_number_id).toBe('hvac_cdd_base');
    const d = emptyPlan();
    d.delete.push({ op: 'delete', id: 'input_number.climate_cdd_base', kind: 'helper' });
    const log: string[] = [];
    await executePlan(hass, d, ctx(log));
    const del = calls.find((c) => c.key === 'input_number/delete')!;
    expect(del.data!.input_number_id).toBe('hvac_cdd_base');
    // invariant 4: helper deletes are snapshot-logged (a learned/tuned value is worth a line)
    expect(log.some((l) => l.startsWith('snapshot input_number.climate_cdd_base') && l.includes('"72"'))).toBe(true);
  });

  it('E4: renaming the ACTIVE season re-selects it after the options update (core would fall back to options[0])', async () => {
    const { hass, calls } = fakeHass();
    (hass.states as Record<string, unknown>)['input_select.climate_season'] = { state: 'Winter', attributes: {} };
    const p = emptyPlan();
    p.update.push({
      op: 'update',
      id: 'input_select.climate_season',
      kind: 'helper',
      spec: { name: 'Climate season', options: ['Summer', 'Cold Season'] },
      from: { name: 'Climate season', options: ['Summer', 'Winter'] },
    });
    const log: string[] = [];
    await executePlan(hass, p, ctx(log));
    const sel = calls.find((c) => c.key === 'svc input_select.select_option')!;
    expect(sel.data).toEqual({ entity_id: 'input_select.climate_season', option: 'Cold Season' });
    expect(log.some((l) => l.includes('Re-selected "Cold Season"'))).toBe(true);
  });

  it('E4: no re-select when the current option survives; a note (no guess) when the mapping is ambiguous', async () => {
    const { hass, calls } = fakeHass();
    (hass.states as Record<string, unknown>)['input_select.climate_season'] = { state: 'Summer', attributes: {} };
    const p = emptyPlan();
    p.update.push({
      op: 'update',
      id: 'input_select.climate_season',
      kind: 'helper',
      spec: { name: 'Climate season', options: ['Summer', 'Cold Season'] },
      from: { name: 'Climate season', options: ['Summer', 'Winter'] },
    });
    await executePlan(hass, p, ctx());
    expect(calls.some((c) => c.key === 'svc input_select.select_option')).toBe(false);
    // A season ADDED at the same time as the rename: lengths differ, so the
    // index mapping is not trustworthy - log, do not guess.
    (hass.states as Record<string, unknown>)['input_select.climate_season'] = { state: 'Winter', attributes: {} };
    const q = emptyPlan();
    q.update.push({
      op: 'update',
      id: 'input_select.climate_season',
      kind: 'helper',
      spec: { name: 'Climate season', options: ['Summer', 'Cold Season', 'Shoulder'] },
      from: { name: 'Climate season', options: ['Summer', 'Winter'] },
    });
    const log: string[] = [];
    await executePlan(hass, q, ctx(log));
    expect(calls.some((c) => c.key === 'svc input_select.select_option')).toBe(false);
    expect(log.some((l) => l.startsWith('NOTE') && l.includes('no longer an option'))).toBe(true);
  });

  it('E4 (refutation LOW-3): a season removed and another added in its slot is NOT treated as a rename', async () => {
    // Winter deleted, Spring added: by names alone this looks like a rename by
    // position. The same Apply creates Spring's schedule and deletes Winter's,
    // so the executor logs instead of selecting a season the user never chose.
    const { hass, calls } = fakeHass();
    (hass.states as Record<string, unknown>)['input_select.climate_season'] = { state: 'Winter', attributes: {} };
    const p = emptyPlan();
    p.update.push({
      op: 'update',
      id: 'input_select.climate_season',
      kind: 'helper',
      spec: { name: 'Climate season', options: ['Summer', 'Spring'] },
      from: { name: 'Climate season', options: ['Summer', 'Winter'] },
    });
    p.create.push(create('schedule.climate_upstairs_spring', 'schedule', { name: 'Climate Upstairs Spring', week: {} }));
    p.delete.push({ op: 'delete', id: 'schedule.climate_upstairs_winter', kind: 'schedule' });
    const log: string[] = [];
    await executePlan(hass, p, ctx(log));
    expect(calls.some((c) => c.key === 'svc input_select.select_option')).toBe(false);
    expect(log.some((l) => l.startsWith('NOTE') && l.includes('no longer an option'))).toBe(true);
  });

  it('E5: a created automation is labelled by its unique id - a foreign automation owning the alias slug is never labelled', async () => {
    const { hass, calls, autoEnt } = fakeHass();
    // A user automation already owns automation.climate_schedule_engine.
    autoEnt.set('automation.climate_schedule_engine', 'users_own_automation');
    const p = emptyPlan();
    p.create.push(create('automation:climate_mzcs_engine', 'automation'));
    await executePlan(hass, p, ctx());
    const labels = calls.filter((c) => c.key === 'config/entity_registry/update' && Array.isArray(c.data?.labels));
    expect(labels.map((c) => c.data!.entity_id)).toEqual(['automation.climate_schedule_engine_2']);
  });

  it('E5: an automation whose entity cannot be resolved is left unlabelled with a note (the next Apply adopts it)', async () => {
    const { hass, calls, autoEnt } = fakeHass();
    const p = emptyPlan();
    p.create.push(create('automation:climate_mzcs_watchdog', 'automation'));
    // Simulate registry lag that never resolves: forget the entity after POST.
    const origWS = hass.callWS!;
    hass.callWS = async (msg) => {
      if (msg.type === 'config/entity_registry/get_entries') autoEnt.clear();
      return origWS(msg);
    };
    const log: string[] = [];
    await executePlan(hass, p, ctx(log));
    expect(calls.some((c) => c.key === 'config/entity_registry/update')).toBe(false);
    expect(log.some((l) => l.startsWith('NOTE') && l.includes('label'))).toBe(true);
  }, 15_000);

  it('rollback removes a config entry whose flow completed but whose locate/rename failed (no orphan entry)', async () => {
    // An apostrophe zone: HA slugs the flow name to owner_s_office, so the
    // contract id needs a rename; make that rename fail permanently.
    const { hass, calls } = fakeHass((c) => c.key === 'config/entity_registry/update' && Boolean(c.data?.new_entity_id));
    const owner: ZoneRef = { slug: 'owners_office', name: "Owner's Office", climate: 'climate.office' };
    const p = emptyPlan();
    p.create.push(
      create("binary_sensor.climate_owners_office_running", 'template_sensor', {
        name: "Climate Owner's Office running",
        source: 'hvac_action',
      }),
    );
    const log: string[] = [];
    const res = await executePlan(hass, p, { ...ctx(log), zones: [owner] });
    expect(res.ok).toBe(false);
    expect(calls.some((c) => c.key === 'DELETE config/config_entries/entry/e_f1')).toBe(true);
    expect(log.some((l) => l.startsWith('Rolled back e_f1'))).toBe(true);
  }, 15_000);
});

/**
 * 0.7.7 review E1: a zone removed from the config no longer parsed, so every
 * one of its objects was invisible to fetchExisting - never deleted, missed by
 * teardown, its kill switch keeping its state. The live engine automation's
 * for_each rows are the instance-scoped memory of which zones were provisioned.
 */
describe('0.7.7 review E1: objects of a zone REMOVED from the config are still seen', () => {
  const ZONE_TWO = [
    'input_boolean.climate_zone_two_enabled',
    'input_text.climate_zone_two_applied_block',
    'timer.climate_zone_two_fan',
    'binary_sensor.climate_zone_two_running',
    'sensor.climate_zone_two_runtime_today',
    'sensor.climate_zone_two_runtime_mirror',
    'sensor.climate_zone_two_expected_runtime',
    'input_number.climate_zone_two_k',
    'schedule.climate_zone_two_summer',
    'schedule.climate_zone_two_winter',
    'schedule.climate_zone_two_spring', // a season removed earlier, under the removed zone
  ];
  const OTHER_INSTANCE = 'input_boolean.climate_house_up_enabled'; // prefix `climate_house`, zone `up`
  const mk = (engineZones: string[] | null, labelled: boolean): HassLike => ({
    states: Object.fromEntries(
      [...ZONE_TWO, OTHER_INSTANCE, 'input_boolean.climate_zone_one_enabled'].map((id) => [
        id,
        { state: 'off', attributes: {} },
      ]),
    ),
    callService: async () => undefined,
    callWS: async (msg) => {
      const t = String(msg.type);
      if (t === 'config/entity_registry/get_entries') {
        const ids = (msg.entity_ids as string[]) ?? [];
        return Object.fromEntries(ids.map((id) => [id, { labels: labelled ? ['mzcs'] : [] }]));
      }
      if (t.endsWith('/list')) return [];
      return {};
    },
    callApi: async (method, path) => {
      if (method === 'GET' && path === 'config/automation/config/climate_mzcs_engine') {
        if (!engineZones) throw new Error('not found');
        return {
          id: 'climate_mzcs_engine',
          triggers: [
            {
              trigger: 'state',
              // the engine watches every zone x season schedule it was generated for
              entity_id: engineZones.flatMap((z) => ['summer', 'winter', 'spring'].map((s) => `schedule.climate_${z}_${s}`)),
            },
          ],
          actions: [
            {
              variables: {
                season:
                  "{{ {'Summer': 'summer', 'Winter': 'winter', 'Spring': 'spring'}.get(states('input_select.climate_season'), states('input_select.climate_season') | lower) }}",
              },
            },
            { repeat: { for_each: engineZones.map((z) => ({ zone: z })), sequence: [] } },
          ],
        };
      }
      throw new Error('not found');
    },
  });
  const singleZoneInput = () => ({
    prefix: 'climate',
    zones: [{ slug: 'zone_one', name: 'Zone One', climate: 'climate.zone_one' }],
    seasons: SEASONS,
    schedules: {
      zone_one: {
        summer: { granularity: 'all' as const, sets: { all: [{ time: '06:00', name: 'Day', mode: 'cool' as const, cool_temp: 78, heat_temp: null }] } },
        winter: { granularity: 'all' as const, sets: { all: [{ time: '06:00', name: 'Day', mode: 'heat_cool' as const, cool_temp: 84, heat_temp: 66 }] } },
      },
    },
    features: { fan_timer: true, anomaly_alerts: true, steering: false },
  });

  it('every object of the removed zone is a managed candidate and plan() deletes them all', async () => {
    const existing = await fetchExisting(mk(['zone_one', 'zone_two'], true), 'climate', ['zone_one'], ['summer', 'winter']);
    for (const id of ZONE_TWO) {
      expect(existing.some((e) => e.id === id && e.managed), id).toBe(true);
    }
    const p = plan(buildDesired(singleZoneInput()), existing);
    for (const id of ZONE_TWO) expect(p.delete.map((a) => a.id), id).toContain(id);
    // The other instance's object shares the `climate` prefix textually but is
    // NOT one of this engine's zones: never a candidate, never deletable.
    expect(existing.some((e) => e.id === OTHER_INSTANCE)).toBe(false);
    expect(p.delete.map((a) => a.id)).not.toContain(OTHER_INSTANCE);
  });

  it('unlabelled objects of a removed zone are seen but stay unmanaged (adopt-safe, never deleted)', async () => {
    const existing = await fetchExisting(mk(['zone_one', 'zone_two'], false), 'climate', ['zone_one'], ['summer', 'winter']);
    expect(existing.some((e) => e.id === 'input_boolean.climate_zone_two_enabled' && !e.managed)).toBe(true);
    const p = plan(buildDesired(singleZoneInput()), existing);
    expect(p.delete).toEqual([]);
  });

  it('no engine yet (never provisioned) or an engine that only knows the current zones claims nothing extra', async () => {
    for (const zones of [null, ['zone_one']]) {
      const existing = await fetchExisting(mk(zones, true), 'climate', ['zone_one'], ['summer', 'winter']);
      expect(existing.map((e) => e.id).filter((id) => id.includes('zone_two'))).toEqual([]);
      expect(existing.some((e) => e.id === OTHER_INSTANCE)).toBe(false);
    }
  });
});
