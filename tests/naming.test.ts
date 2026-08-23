import { describe, it, expect } from 'vitest';
import {
  slugify,
  zoneEntityId,
  zoneScheduleId,
  globalEntityId,
  parseEntityId,
  automationUniqueId,
  automationAlias,
  RESERVED_SLUGS,
  type ZoneClass,
  type GlobalClass,
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
    expect(slugify("the owner's Office")).toBe('owners_office');
    expect(slugify('  Down  Stairs ')).toBe('down_stairs');
    expect(slugify('Loft #2')).toBe('loft_2');
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
    expect(parseEntityId('climate.nest_upstairs', PREFIX, ZONES, SEASONS)).toBeNull();
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
    const withTims = ['tims', 'owners_office'];
    expect(
      parseEntityId('timer.climate_owners_office_fan', PREFIX, withTims, SEASONS),
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
    expect(automationAlias('engine')).toBe('Climate: schedule engine');
    expect(automationAlias('fan_timer', 'Upstairs')).toBe('Climate: Upstairs fan timer finished');
  });
});
