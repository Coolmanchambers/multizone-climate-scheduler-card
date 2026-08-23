import { describe, it, expect } from 'vitest';
import { executePlan, type ExecContext } from '../src/provision-exec';
import {
  engineAutomation,
  fanAutomation,
  learningAutomation,
  watchdogAutomation,
  runtimeAlertAutomation,
  type ZoneRef,
} from '../src/lib/automation-payloads';
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
    expect(json).toContain('blk != states(repeat.item.marker)');
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

function fakeHass(failOn?: (c: Call) => boolean): { hass: HassLike; calls: Call[] } {
  const calls: Call[] = [];
  let flowN = 0;
  const flowSteps = new Map<string, number>();
  const hass: HassLike = {
    states: {},
    callService: async () => undefined,
    callWS: async (msg) => {
      const c: Call = { via: 'ws', key: String(msg.type), data: msg };
      calls.push(c);
      if (failOn?.(c)) throw new Error(`forced failure at ${c.key}`);
      if (c.key === 'config/entity_registry/get_entries') return {};
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
        if (step >= 2) return { flow_id: id, type: 'create_entry', result: { entry_id: `e_${id}` } };
        return {
          flow_id: id,
          type: 'form',
          step_id: 'options',
          data_schema: [{ name: 'state' }, { name: 'start' }, { name: 'end' }],
        };
      }
      return { result: 'ok' };
    },
  };
  return { hass, calls };
}

function ctx(log: string[] = []): ExecContext {
  return { prefix: 'climate', zones: ZONES, seasons: SEASONS, log: (l) => log.push(l) };
}

const emptyPlan = (): Plan => ({ create: [], adopt: [], update: [], delete: [], noop: [] });
const create = (id: string, kind: PlanAction['kind'], spec: Record<string, unknown> = {}) =>
  ({ op: 'create', id, kind, spec }) as Extract<PlanAction, { op: 'create' }>;

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

  it('never overwrites schedule/automation content on update; helper updates go through', async () => {
    const { hass, calls } = fakeHass();
    const p = emptyPlan();
    p.update.push(
      { op: 'update', id: 'schedule.climate_upstairs_summer', kind: 'schedule', spec: { week: {} }, from: {} },
      { op: 'update', id: 'automation:climate_mzcs_engine', kind: 'automation', spec: {}, from: {} },
      { op: 'update', id: 'input_select.climate_season', kind: 'helper', spec: { name: 'Climate season', options: ['Summer'] }, from: {} },
    );
    const log: string[] = [];
    const res = await executePlan(hass, p, ctx(log));
    expect(res.updated).toBe(1);
    expect(res.skipped).toBe(2);
    expect(calls.some((c) => c.key === 'schedule/update')).toBe(false);
    expect(calls.some((c) => c.key === 'input_select/update')).toBe(true);
    expect(log.filter((l) => l.startsWith('KEEP'))).toHaveLength(2);
  });

  it('adopt only labels; delete removes helpers and automations', async () => {
    const { hass, calls } = fakeHass();
    const p = emptyPlan();
    p.adopt.push({ op: 'adopt', id: 'binary_sensor.climate_upstairs_running', kind: 'template_sensor', spec: {} });
    p.delete.push(
      { op: 'delete', id: 'timer.climate_office_fan', kind: 'helper' },
      { op: 'delete', id: 'automation:climate_mzcs_fan_timer_office', kind: 'automation' },
    );
    const res = await executePlan(hass, p, ctx());
    expect(res.adopted).toBe(1);
    expect(res.deleted).toBe(2);
    expect(calls.some((c) => c.key === 'timer/delete')).toBe(true);
    expect(calls.some((c) => c.key === 'DELETE config/automation/config/climate_mzcs_fan_timer_office')).toBe(true);
    // adopt performed no create call
    expect(calls.some((c) => c.key.endsWith('/create') && c.key !== 'config/label_registry/create')).toBe(false);
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
