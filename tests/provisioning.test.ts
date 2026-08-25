import { describe, it, expect } from 'vitest';
import {
  buildDesired,
  plan,
  applyPlan,
  actionable,
  type ProvisionInput,
  type ExistingObject,
} from '../src/lib/provisioning';
import { transitionSets, type ScheduleBlock } from '../src/lib/schedule-ranges';

const cool = (time: string, name: string, temp: number): ScheduleBlock => ({
  time,
  name,
  mode: 'cool',
  cool_temp: temp,
  heat_temp: null,
});
const hc = (time: string, name: string, coolT: number, heatT: number): ScheduleBlock => ({
  time,
  name,
  mode: 'heat_cool',
  cool_temp: coolT,
  heat_temp: heatT,
});

const WD = [cool('06:00', 'Wake', 78), cool('14:00', 'Pre-cool', 76), cool('21:30', 'Sleep', 76)];
const WE = [cool('07:30', 'Wake', 78), cool('21:30', 'Sleep', 76)];
const WINTER = [hc('06:00', 'Day', 84, 66), hc('19:00', 'Evening', 78, 68)];

function baseInput(): ProvisionInput {
  const summer = { granularity: 'wdwe' as const, sets: { wd: WD, we: WE } };
  const winter = { granularity: 'all' as const, sets: { all: WINTER } };
  return {
    prefix: 'climate',
    zones: [
      { slug: 'upstairs', name: 'Upstairs' },
      { slug: 'downstairs', name: 'Downstairs' },
      { slug: 'owners_office', name: "Owner's Office" },
    ],
    seasons: [
      { key: 'summer', name: 'Summer', default_mode: 'cool' },
      { key: 'winter', name: 'Winter', default_mode: 'heat_cool' },
    ],
    schedules: {
      upstairs: { summer, winter },
      downstairs: { summer, winter },
      owners_office: { summer, winter },
    },
    features: { fan_timer: true, anomaly_alerts: true, steering: false },
  };
}

describe('buildDesired inventory (CONTRACT §5)', () => {
  it('produces the full expected inventory for 3 zones x 2 seasons', () => {
    const d = buildDesired(baseInput());
    const byKind = (k: string) => d.filter((x) => x.kind === k).length;
    expect(byKind('helper')).toBe(23); // 3 fan timers + 3 markers + 3 enables + 3 k + 2 selects + 8 numbers + theme
    expect(byKind('template_sensor')).toBe(8); // 3 running + 3 expected + next_block + outdoor_temp
    expect(byKind('stats_sensor')).toBe(4); // 3 runtime_today + outdoor_daily_mean
    expect(byKind('schedule')).toBe(6);
    expect(byKind('automation')).toBe(7); // engine, watchdog, learning, alert, 3 fan
    expect(d).toHaveLength(48);
    expect(new Set(d.map((x) => x.id)).size).toBe(48); // no id collisions
  });

  it('number helper specs seed defaults without HA `initial` (restart-reset hazard, QA-R B1-5)', () => {
    const d = buildDesired(baseInput());
    const numbers = d.filter((x) => x.id.startsWith('input_number.') && !x.id.includes('_k'));
    expect(numbers.length).toBe(8);
    for (const n of numbers) {
      expect('initial' in n.spec).toBe(false);
      // Seed lives in creation-only meta so the differ never compares it -
      // a user-tuned live value must not read as drift (extraction parity).
      expect('seed' in n.spec).toBe(false);
      expect(typeof n.meta?.seed).toBe('number');
    }
  });

  it('outdoor chain (G1) is always desired so an existing daily mean is never orphaned', () => {
    const d = buildDesired(baseInput());
    expect(d.some((x) => x.id === 'sensor.climate_outdoor_temp')).toBe(true);
    expect(d.some((x) => x.id === 'sensor.climate_outdoor_daily_mean')).toBe(true);
  });

  it('compound zone x season id collisions are rejected (QA-R A2-8)', () => {
    const input = baseInput();
    input.zones = [
      { slug: 'up', name: 'Up' },
      { slug: 'up_late', name: 'Up Late' },
    ];
    input.seasons = [
      { key: 'late_summer', name: 'Late Summer', default_mode: 'cool' },
      { key: 'summer', name: 'Summer', default_mode: 'cool' },
    ];
    input.schedules = {
      up: { late_summer: { granularity: 'all', sets: { all: WD } }, summer: { granularity: 'all', sets: { all: WD } } },
      up_late: { late_summer: { granularity: 'all', sets: { all: WD } }, summer: { granularity: 'all', sets: { all: WD } } },
    };
    expect(() => buildDesired(input)).toThrow(/Naming collision/);
  });

  it('kill switch: every zone gets a toggle whose spec can never flip state (CONTRACT 7c)', () => {
    const d = buildDesired(baseInput());
    const enables = d.filter((x) => x.id.startsWith('input_boolean.'));
    expect(enables.map((e) => e.id).sort()).toEqual([
      'input_boolean.climate_downstairs_enabled',
      'input_boolean.climate_owners_office_enabled',
      'input_boolean.climate_upstairs_enabled',
    ]);
    for (const e of enables) {
      // config-only spec: no state, no initial - reconfiguration cannot enable/disable
      expect(Object.keys(e.spec)).toEqual(['name']);
    }
  });

  it('kill switch: removing a zone deletes its toggle with it', () => {
    const installed = applyPlan(plan(buildDesired(baseInput()), []), []);
    const input = baseInput();
    input.zones = input.zones.filter((z) => z.slug !== 'owners_office');
    delete input.schedules.owners_office;
    const p = plan(buildDesired(input), installed);
    expect(p.delete.map((a) => a.id)).toContain('input_boolean.climate_owners_office_enabled');
  });

  it('steering feature adds its helpers but NOT the ungenerated automation (QA-R A2-5)', () => {
    const input = baseInput();
    input.features.steering = true;
    const d = buildDesired(input);
    expect(d.some((x) => x.id === 'input_select.climate_upstairs_target_room')).toBe(true);
    expect(d.some((x) => x.id === 'schedule.climate_upstairs_sensor_schedule')).toBe(true);
    expect(d.some((x) => x.id === 'input_number.climate_override_minutes')).toBe(true);
    // No generator exists yet - desiring it would be a perpetual phantom Create.
    expect(d.some((x) => x.id === 'automation:climate_mzcs_steering')).toBe(false);
  });

  it('recommender deferred; learning automation always present', () => {
    const d = buildDesired(baseInput());
    expect(d.some((x) => x.id === 'automation:climate_mzcs_season_recommender')).toBe(false);
    expect(d.some((x) => x.id === 'automation:climate_mzcs_runtime_learning')).toBe(true);
    expect(d.some((x) => x.id === 'input_number.climate_upstairs_k')).toBe(true);
  });
});

describe('plan + idempotence', () => {
  it('fresh install = all creates; apply → replan = zero actionable', () => {
    const desired = buildDesired(baseInput());
    const p1 = plan(desired, []);
    expect(p1.create).toHaveLength(48);
    expect(actionable(plan(desired, applyPlan(p1, [])))).toHaveLength(0);
  });

  it('adopts pre-existing unmanaged objects (running sensors from another session)', () => {
    const desired = buildDesired(baseInput());
    const existing: ExistingObject[] = [
      {
        id: 'binary_sensor.climate_upstairs_running',
        kind: 'template_sensor',
        spec: { name: 'whatever tim named it', source: 'hvac_action' },
        managed: false,
      },
    ];
    const p = plan(desired, existing);
    expect(p.adopt.map((a) => a.id)).toEqual(['binary_sensor.climate_upstairs_running']);
    expect(p.create).toHaveLength(47);
    // Adopt labels only (executor parity): the divergent display name shows
    // as exactly one rename Update on the next plan, and converges after it.
    const p2 = plan(desired, applyPlan(p, existing));
    expect(p2.update.map((a) => a.id)).toEqual(['binary_sensor.climate_upstairs_running']);
    expect(actionable(plan(desired, applyPlan(p2, applyPlan(p, existing))))).toHaveLength(0);
  });

  it('removing a season deletes exactly its orphans and updates the season select', () => {
    const full = buildDesired(baseInput());
    const installed = applyPlan(plan(full, []), []);
    const input = baseInput();
    input.seasons = [input.seasons[0]!];
    for (const z of Object.keys(input.schedules)) delete input.schedules[z]!.winter;
    const p = plan(buildDesired(input), installed);
    expect(p.delete.map((a) => a.id).sort()).toEqual([
      'schedule.climate_downstairs_winter',
      'schedule.climate_owners_office_winter',
      'schedule.climate_upstairs_winter',
    ]);
    expect(p.update.map((a) => a.id)).toContain('input_select.climate_season');
    expect(p.create).toHaveLength(0);
  });

  it('unmanaged foreign entities are never deleted', () => {
    const desired = buildDesired(baseInput());
    const existing: ExistingObject[] = [
      { id: 'timer.sprinkler_zone_1', kind: 'helper', spec: {}, managed: false },
    ];
    const p = plan(desired, existing);
    expect(p.delete).toHaveLength(0);
  });
});

describe('schedule blocks are creation seeds, never reprovisioned (extraction parity)', () => {
  it('week payloads ride on create meta; wizard block edits never replan an installed schedule', () => {
    const d = buildDesired(baseInput());
    const schedCreates = plan(d, []).create.filter((a) => a.kind === 'schedule');
    expect(schedCreates.length).toBeGreaterThan(0);
    for (const a of schedCreates) {
      expect(a.meta?.week).toBeDefined();
      expect('week' in a.spec).toBe(false);
    }
    const installed = applyPlan(plan(d, []), []);
    const input = baseInput();
    for (const z of Object.keys(input.schedules)) {
      const summer = input.schedules[z]!.summer!;
      input.schedules[z]!.summer = {
        granularity: 'days',
        sets: transitionSets('wdwe', 'days', summer.sets),
      };
    }
    // Diverge a day too: live schedule BLOCKS are owned by the card's schedule
    // editor after provisioning, so even a changed wizard week must not plan an
    // Update (an Apply re-run would otherwise stomp the user's live edits).
    input.schedules.upstairs!.summer!.sets.saturday = [cool('09:00', 'Lazy', 79)];
    const p2 = plan(buildDesired(input), installed);
    expect(p2.create).toHaveLength(0);
    expect(p2.delete).toHaveLength(0);
    expect(p2.update).toHaveLength(0);
  });
});

describe('extraction parity contract (every compared spec key is registry-readable)', () => {
  // fetchExisting() can only read these keys back per domain/kind. Any desired
  // spec key OUTSIDE this set can never compare equal against a live snapshot
  // and makes the plan non-converging (the S13 Update-28 asymmetry). Creation
  // payloads that are not readable back (seed, week, template types) belong in
  // meta, never spec.
  const READABLE: Array<{ match: (id: string, kind: string) => boolean; keys: string[] }> = [
    { match: (id) => id.startsWith('input_number.'), keys: ['name', 'min', 'max', 'step', 'unit'] },
    { match: (id) => id.startsWith('input_select.'), keys: ['name', 'options'] },
    { match: (id) => id.startsWith('timer.'), keys: ['name', 'restore'] },
    { match: (id) => id.startsWith('schedule.'), keys: ['name'] },
    { match: (id) => id.startsWith('automation:'), keys: ['alias', 'sig'] },
    { match: () => true, keys: ['name'] }, // sensors, input_text, input_boolean: friendly_name only
  ];
  it('all desired specs (steering on) stay within the readable key sets', () => {
    const input = baseInput();
    input.features.steering = true;
    for (const d of buildDesired(input)) {
      const allowed = READABLE.find((r) => r.match(d.id, d.kind))!.keys;
      for (const k of Object.keys(d.spec)) {
        expect(allowed, `${d.id} spec key "${k}" is not registry-readable - move it to meta`).toContain(k);
      }
    }
  });
});
