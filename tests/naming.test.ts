import { describe, it, expect } from 'vitest';
import {
  slugify,
  zoneEntityId,
  zoneScheduleId,
  globalEntityId,
  parseEntityId,
  automationUniqueId,
  resolveSeasonKey,
  automationAlias,
  RESERVED_SLUGS,
  type ZoneClass,
  type GlobalClass,
  automationEntityId,
} from '../src/lib/naming';

const PREFIX = 'climate';
const ZONES = ['upstairs', 'downstairs', 'owners_office'];
const SEASONS = ['summer', 'winter'];

const ZONE_CLASSES: ZoneClass[] = [
  'fan_timer',
  'room_override_timer',
  'running_sensor',
  'runtime_today',
  'expected_runtime',
  'target_room_select',
  'sensor_schedule',
  'applied_block_marker',
  'zone_enabled',
  'k_factor',
];

const GLOBAL_CLASSES: GlobalClass[] = [
  'season_select',
  'season_mode',
  'season_confirm_days',
  'season_dwell_days',
  'dev_green_max',
  'dev_amber_max',
  'runtime_alert_margin',
  'runtime_alert_days',
  'runtime_learn_days',
  'cdd_base',
  'override_minutes',
  'steer_min_setpoint',
  'steer_max_setpoint',
  'steer_max_offset',
  'next_block_sensor',
  'theme',
];

describe('slugify', () => {
  it('handles names, apostrophes, and whitespace', () => {
    expect(slugify('Upstairs')).toBe('upstairs');
    expect(slugify("Owner's Office")).toBe('owners_office');
    expect(slugify('  Down  Stairs ')).toBe('down_stairs');
    expect(slugify('Landing #2')).toBe('landing_2');
  });
});

describe('contract examples', () => {
  it('matches CONTRACT.md literal ids', () => {
    expect(zoneEntityId('fan_timer', PREFIX, 'upstairs')).toBe('timer.climate_upstairs_fan');
    expect(zoneEntityId('running_sensor', PREFIX, 'downstairs')).toBe(
      'binary_sensor.climate_downstairs_running',
    );
    expect(zoneScheduleId(PREFIX, 'upstairs', 'summer')).toBe('schedule.climate_upstairs_summer');
    expect(zoneEntityId('sensor_schedule', PREFIX, 'upstairs')).toBe(
      'schedule.climate_upstairs_sensor_schedule',
    );
    expect(globalEntityId('season_select', PREFIX)).toBe('input_select.climate_season');
    expect(globalEntityId('next_block_sensor', PREFIX)).toBe('sensor.climate_next_block');
  });
});

describe('round-trip: parse(generate(x)) === x', () => {
  it('round-trips every zone class for every zone', () => {
    for (const zone of ZONES) {
      for (const cls of ZONE_CLASSES) {
        const id = zoneEntityId(cls, PREFIX, zone);
        expect(parseEntityId(id, PREFIX, ZONES, SEASONS)).toEqual({ cls, zone });
      }
    }
  });

  it('round-trips every zone schedule', () => {
    for (const zone of ZONES) {
      for (const season of SEASONS) {
        const id = zoneScheduleId(PREFIX, zone, season);
        expect(parseEntityId(id, PREFIX, ZONES, SEASONS)).toEqual({
          cls: 'zone_schedule',
          zone,
          season,
        });
      }
    }
  });

  it('round-trips every global class', () => {
    for (const cls of GLOBAL_CLASSES) {
      const id = globalEntityId(cls, PREFIX);
      expect(parseEntityId(id, PREFIX, ZONES, SEASONS)).toEqual({ cls });
    }
  });
});

describe('parser rejections', () => {
  it('ignores foreign entities', () => {
    expect(parseEntityId('sensor.living_room_temperature', PREFIX, ZONES, SEASONS)).toBeNull();
    expect(parseEntityId('climate.upstairs_thermostat', PREFIX, ZONES, SEASONS)).toBeNull();
    expect(parseEntityId('sensor.climate2_next_block', PREFIX, ZONES, SEASONS)).toBeNull();
  });

  it('rejects wrong-domain matches', () => {
    expect(parseEntityId('sensor.climate_upstairs_fan', PREFIX, ZONES, SEASONS)).toBeNull();
  });

  it('rejects unknown zones and seasons', () => {
    expect(parseEntityId('timer.climate_attic_fan', PREFIX, ZONES, SEASONS)).toBeNull();
    expect(parseEntityId('schedule.climate_upstairs_monsoon', PREFIX, ZONES, SEASONS)).toBeNull();
  });

  it('prefers the longest zone slug (underscore zones)', () => {
    const withOwners = ['owners', 'owners_office'];
    expect(
      parseEntityId('timer.climate_owners_office_fan', PREFIX, withOwners, SEASONS),
    ).toEqual({ cls: 'fan_timer', zone: 'owners_office' });
  });
});

describe('reserved slugs and automations', () => {
  it('blocks season/zone names that collide with class suffixes', () => {
    expect(RESERVED_SLUGS.has('sensor_schedule')).toBe(true);
    expect(RESERVED_SLUGS.has('fan')).toBe(true);
    expect(RESERVED_SLUGS.has('season')).toBe(true);
    expect(RESERVED_SLUGS.has('summer')).toBe(false);
  });

  it('builds automation ids and aliases', () => {
    expect(automationUniqueId(PREFIX, 'engine')).toBe('climate_mzcs_engine');
    expect(automationAlias(PREFIX, 'engine')).toBe('Climate: schedule engine');
    expect(automationAlias(PREFIX, 'fan_timer', 'Upstairs')).toBe('Climate: Upstairs fan timer finished');
  });
});

describe('automationEntityId', () => {
  it('matches the entity id HA derives from the generated alias', () => {
    expect(automationEntityId('climate', 'engine')).toBe('automation.climate_schedule_engine');
    expect(automationEntityId('climate', 'fan_timer', "Owner's Office")).toBe(
      'automation.climate_owner_s_office_fan_timer_finished',
    );
  });

  it('is prefix-scoped so a second instance targets its own engine', () => {
    expect(automationEntityId('mzcsqa', 'engine')).toBe('automation.mzcsqa_schedule_engine');
  });
});

/**
 * Item 39. MEASURED against the current tree before this was written (the file
 * was byte-identical to v0.7.2 at the time):
 *
 *   one keyless season, name "Summer"
 *     input_select.climate_season options : ["Summer"]
 *     schedule the engine provisions      : schedule.climate_zone_a_undefined
 *     what the card looked for            : schedule.climate_zone_a_summer
 *
 * So the drawer row on a converging single-keyless install was dead. That
 * install is one this project deliberately keeps provisioning (round 3,
 * option c), so the schedule row has to find it.
 *
 * The engine's id template embeds `String(key)`. This resolver reproduces that
 * exactly, and only falls back to the name slug when NO season matches - which
 * is the pre-existing behaviour for a select holding a stale display name.
 */
describe('resolveSeasonKey (item 39)', () => {
  const s = (name: string, key?: unknown) => ({ name, key }) as { name: string; key?: unknown };

  it('returns the key of the season whose NAME the select is holding', () => {
    expect(resolveSeasonKey([s('Summer', 'summer'), s('Winter', 'winter')], 'Winter')).toBe('winter');
  });

  it('reproduces the id the engine actually built for a KEYLESS season', () => {
    expect(resolveSeasonKey([{ name: 'Summer' }], 'Summer')).toBe('undefined');
  });

  it('reproduces `_null` for an explicit null key, matching String(key)', () => {
    expect(resolveSeasonKey([s('Summer', null)], 'Summer')).toBe('null');
  });

  it('keeps non-string keys behaving exactly as the template coerces them', () => {
    expect(resolveSeasonKey([s('Summer', 1)], 'Summer')).toBe('1');
    expect(resolveSeasonKey([s('Summer', false)], 'Summer')).toBe('false');
  });

  it('falls back to the name slug ONLY when no season matches', () => {
    expect(resolveSeasonKey([s('Summer', 'summer')], 'Shoulder')).toBe('shoulder');
    expect(resolveSeasonKey([], 'Summer')).toBe('summer');
    expect(resolveSeasonKey(undefined, 'Summer')).toBe('summer');
  });

  it('the resolved key builds the id that exists, not one that does not', () => {
    const key = resolveSeasonKey([{ name: 'Summer' }], 'Summer');
    expect(zoneScheduleId('climate', 'zone_a', key)).toBe('schedule.climate_zone_a_undefined');
  });
});
