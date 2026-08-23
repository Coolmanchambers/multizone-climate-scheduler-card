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
      { slug: 'owners_office', name: "the owner's Office" },
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
    expect(byKind('helper')).toBe(20); // 3 fan timers + 3 markers + 3 enables + 2 selects + 8 numbers + theme
    expect(byKind('template_sensor')).toBe(7); // 3 running + 3 expected + next_block
    expect(byKind('stats_sensor')).toBe(3);
    expect(byKind('schedule')).toBe(6);
    expect(byKind('automation')).toBe(7); // engine, watchdog, recommender, alert, 3 fan
    expect(d).toHaveLength(43);
    expect(new Set(d.map((x) => x.id)).size).toBe(43); // no id collisions
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

  it('steering feature adds its object group', () => {
    const input = baseInput();
    input.features.steering = true;
    const d = buildDesired(input);
    expect(d.some((x) => x.id === 'input_select.climate_upstairs_target_room')).toBe(true);
    expect(d.some((x) => x.id === 'schedule.climate_upstairs_sensor_schedule')).toBe(true);
    expect(d.some((x) => x.id === 'input_number.climate_override_minutes')).toBe(true);
    expect(d.some((x) => x.id === 'automation:climate_mzcs_steering')).toBe(true);
  });

  it('single-season config skips the recommender', () => {
    const input = baseInput();
    input.seasons = [input.seasons[0]!];
    for (const z of Object.keys(input.schedules)) delete input.schedules[z]!.winter;
    const d = buildDesired(input);
    expect(d.some((x) => x.id === 'automation:climate_mzcs_season_recommender')).toBe(false);
  });
});

describe('plan + idempotence', () => {
  it('fresh install = all creates; apply → replan = zero actionable', () => {
    const desired = buildDesired(baseInput());
    const p1 = plan(desired, []);
    expect(p1.create).toHaveLength(43);
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
    expect(p.create).toHaveLength(42);
    expect(actionable(plan(desired, applyPlan(p, existing)))).toHaveLength(0);
  });

  it('removing a season deletes exactly its orphans and updates the season select', () => {
    const full = buildDesired(baseInput());
    const installed = applyPlan(plan(full, []), []);
    const input = baseInput();
    input.seasons = [input.seasons[0]!];
    for (const z of Object.keys(input.schedules)) delete input.schedules[z]!.winter;
    const p = plan(buildDesired(input), installed);
    expect(p.delete.map((a) => a.id).sort()).toEqual([
      'automation:climate_mzcs_season_recommender',
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

describe('granularity transitions are pure updates (Option A payoff)', () => {
  it('wdwe → days rewrites schedule payloads without create/delete', () => {
    const installed = applyPlan(plan(buildDesired(baseInput()), []), []);
    const input = baseInput();
    for (const z of Object.keys(input.schedules)) {
      const summer = input.schedules[z]!.summer!;
      input.schedules[z]!.summer = {
        granularity: 'days',
        sets: transitionSets('wdwe', 'days', summer.sets),
      };
    }
    const p = plan(buildDesired(input), installed);
    expect(p.create).toHaveLength(0);
    expect(p.delete).toHaveLength(0);
    // Cloned days produce identical weekly payloads → actually zero updates,
    // proving expand-by-clone is a true no-op until the user diverges a day.
    expect(p.update).toHaveLength(0);
    // Diverge one day, replan: exactly that zone's summer schedule updates.
    input.schedules.upstairs!.summer!.sets.saturday = [cool('09:00', 'Lazy', 79)];
    const p2 = plan(buildDesired(input), installed);
    expect(p2.update.map((a) => a.id)).toEqual(['schedule.climate_upstairs_summer']);
  });
});
