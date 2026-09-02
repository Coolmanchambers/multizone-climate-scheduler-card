import { describe, it, expect } from 'vitest';
import { configSummary } from '../src/lib/config-summary';
import type { MzcsCardConfig } from '../src/types';

/**
 * The gear panel's read-only Config tab (backlog item 48).
 *
 * THE STANDING RULE (maintainer, 2026-08-31): every setting the card editor
 * writes must appear on the Config tab. The coverage block below enforces it
 * mechanically: for each editor-written key, changing that key must change the
 * summary. Adding a config option without a summary row leaves its mutation
 * invisible and fails here - add the row in src/lib/config-summary.ts in the
 * same change (docs/config-compatibility.md checklist step 6).
 */

/** Every editor-writable option set to a NON-default value. */
const FULL: MzcsCardConfig = {
  type: 'custom:multizone-climate-scheduler-card',
  prefix: 'hvac',
  zones: [
    {
      entity: 'climate.zone_a',
      name: 'Zone A',
      room_sensors: [
        { entity: 'sensor.room_a_temperature', name: 'Room A', last_seen: 'sensor.room_a_last_seen' },
      ],
      power_entity: 'sensor.zone_a_power',
    },
  ],
  seasons: [{ key: 'summer', name: 'Summer', default_mode: 'cool' }],
  season_switch: 'semi',
  weather_entity: 'weather.forecast_home',
  display: { last_seen: 'ageing', ageing_minutes: 30, stale_hours: 5 },
  features: {
    fan_timer: [10, 20],
    anomaly_alerts: false,
    fan_guard: 'input_boolean.fan_guard',
    eco_preset: 'away',
    off_peak_entity: 'binary_sensor.off_peak_today',
    off_peak_offset: 4,
    steering: true,
  },
};

const flat = (c: MzcsCardConfig) => JSON.stringify(configSummary(c));

describe('STANDING RULE: every editor-written key influences the Config tab', () => {
  const base = flat(FULL);
  const mutations: Array<[string, (c: MzcsCardConfig) => MzcsCardConfig]> = [
    ['prefix', (c) => ({ ...c, prefix: 'climate' })],
    ['weather_entity', (c) => ({ ...c, weather_entity: undefined })],
    ['season_switch', (c) => ({ ...c, season_switch: 'manual' })],
    ['zones[].name', (c) => ({ ...c, zones: [{ ...c.zones[0]!, name: 'Zone B' }] })],
    ['zones[].entity', (c) => ({ ...c, zones: [{ ...c.zones[0]!, entity: 'climate.zone_b' }] })],
    ['zones[].room_sensors', (c) => ({ ...c, zones: [{ ...c.zones[0]!, room_sensors: undefined }] })],
    ['zones[].power_entity', (c) => ({ ...c, zones: [{ ...c.zones[0]!, power_entity: undefined }] })],
    [
      'room_sensors[].name',
      (c) => ({
        ...c,
        zones: [
          { ...c.zones[0]!, room_sensors: [{ entity: 'sensor.room_a_temperature', last_seen: 'sensor.room_a_last_seen' }] },
        ],
      }),
    ],
    [
      'room_sensors[].last_seen',
      (c) => ({
        ...c,
        zones: [{ ...c.zones[0]!, room_sensors: [{ entity: 'sensor.room_a_temperature', name: 'Room A' }] }],
      }),
    ],
    ['seasons[].name', (c) => ({ ...c, seasons: [{ ...c.seasons![0]!, name: 'Sommer' }] })],
    ['seasons[].key', (c) => ({ ...c, seasons: [{ ...c.seasons![0]!, key: 'estate' }] })],
    ['seasons[].default_mode', (c) => ({ ...c, seasons: [{ ...c.seasons![0]!, default_mode: 'heat' }] })],
    ['features.fan_timer', (c) => ({ ...c, features: { ...c.features, fan_timer: [] } })],
    ['features.anomaly_alerts', (c) => ({ ...c, features: { ...c.features, anomaly_alerts: true } })],
    ['features.fan_guard', (c) => ({ ...c, features: { ...c.features, fan_guard: undefined } })],
    ['features.eco_preset', (c) => ({ ...c, features: { ...c.features, eco_preset: false } })],
    ['features.off_peak_entity', (c) => ({ ...c, features: { ...c.features, off_peak_entity: undefined } })],
    ['features.off_peak_offset', (c) => ({ ...c, features: { ...c.features, off_peak_offset: 9 } })],
    ['features.steering', (c) => ({ ...c, features: { ...c.features, steering: undefined } })],
    ['display.last_seen', (c) => ({ ...c, display: { ...c.display, last_seen: 'off' } })],
    ['display.ageing_minutes', (c) => ({ ...c, display: { ...c.display, ageing_minutes: 90 } })],
    ['display.stale_hours', (c) => ({ ...c, display: { ...c.display, stale_hours: 8 } })],
  ];

  for (const [name, mutate] of mutations) {
    it(`${name} is visible on the Config tab`, () => {
      expect(flat(mutate(FULL)), name).not.toBe(base);
    });
  }
});

describe('content rules', () => {
  it('marks unset display values as defaults, and set ones not', () => {
    const s = JSON.stringify(configSummary({ ...FULL, display: undefined }));
    expect(s).toContain('45 min (default)');
    expect(s).toContain('3 h (default)');
    expect(flat(FULL)).toContain('30 min');
    expect(flat(FULL)).not.toContain('30 min (default)');
  });

  it('resolves the standby preset like the engine does, default labeled', () => {
    const s = JSON.stringify(configSummary({ ...FULL, features: { ...FULL.features, eco_preset: undefined } }));
    expect(s).toContain("'eco' (default)");
    expect(JSON.stringify(configSummary({ ...FULL, features: { ...FULL.features, eco_preset: false } }))).toContain(
      'HA owns standby',
    );
  });

  it('points the off-peak seed at the Tuning tab (the seed-vs-live confusion)', () => {
    expect(flat(FULL)).toContain('offset seed 4');
    expect(flat(FULL)).toContain('Tuning tab');
  });

  it('lists room sensors with their labels and last-seen presence', () => {
    expect(flat(FULL)).toContain('Room A (last-seen ✓)');
  });

  it('whitespace-only power_entity shows NO power line - provisioning ignores it (QA 0.7.7)', () => {
    const s = JSON.stringify(
      configSummary({ ...FULL, zones: [{ ...FULL.zones[0]!, power_entity: '   ' }] }),
    );
    expect(s).not.toContain('power:');
    expect(flat(FULL)).toContain('power: sensor.zone_a_power');
  });

  it('absent fan_timer shows the ON default, never Off (browser-caught, the documented inversion trap)', () => {
    const s = JSON.stringify(configSummary({ ...FULL, features: { ...FULL.features, fan_timer: undefined } }));
    expect(s).toContain('15 / 30 / 60 min (default)');
    expect(JSON.stringify(configSummary(FULL))).toContain('10 / 20 min');
  });

  it('absent seasons show the Summer/Winter defaults the card actually runs (browser-caught)', () => {
    const s = JSON.stringify(configSummary({ ...FULL, seasons: undefined }));
    expect(s).toContain('Summer (default)');
    expect(s).toContain('Winter (default)');
  });

  it('a refused config (colliding season keys) still renders instead of throwing', () => {
    const bad: MzcsCardConfig = {
      ...FULL,
      seasons: [
        { key: 'x', name: 'A', default_mode: 'cool' },
        { key: 'x', name: 'B', default_mode: 'cool' },
      ],
    };
    expect(() => configSummary(bad)).not.toThrow();
    expect(JSON.stringify(configSummary(bad))).toContain('key: x');
  });
});
