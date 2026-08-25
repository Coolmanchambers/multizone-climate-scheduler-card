import { describe, it, expect } from 'vitest';
import { buildDiagnostics } from '../src/lib/diagnostics';
import type { MzcsCardConfig } from '../src/types';

const CONFIG: MzcsCardConfig = {
  type: 'custom:multizone-climate-scheduler-card',
  prefix: 'climate',
  zones: [
    {
      name: "Owner's Office",
      entity: 'climate.owner_s_office_mini_split',
      room_sensors: ['sensor.bedroom_1_temperature', { entity: 'sensor.landing_temperature', name: 'Landing' }],
    },
    { name: 'Upstairs', entity: 'climate.upstairs_thermostat' },
  ],
  seasons: [
    { key: 'summer', name: 'Summer', default_mode: 'cool' },
    { key: 'summer_2', name: 'Winter', default_mode: 'heat_cool' },
  ],
  weather_entity: 'weather.forecast_home',
  features: { fan_timer: [15, 30], fan_guard: 'input_boolean.hvac_fan_guard', eco_preset: 'away' },
};

const BASE = {
  cardVersion: '0.7.0',
  haVersion: '2026.8.2',
  userAgent: 'Mozilla/5.0 (test)',
  config: CONFIG,
  plan: { create: 0, adopt: 0, update: 0, delete: 0, noop: 48 },
  objectStatuses: ['managed', 'managed', 'customized', 'missing'],
  zoneEnabled: [
    { zone: "Owner's Office", state: 'off' },
    { zone: 'Upstairs', state: 'on' },
  ],
  activeSeason: 'Summer',
};

const parse = (s: string) => JSON.parse(s) as Record<string, any>;

describe('diagnostics redaction (the default)', () => {
  it('leaks no entity id, zone name, room label or season name', () => {
    const text = buildDiagnostics(BASE);
    // Every identifier that appears in the config must be absent from the blob.
    for (const secret of [
      'owner_s_office_mini_split',
      'upstairs_thermostat',
      'bedroom_1_temperature',
      'landing_temperature',
      'forecast_home',
      'hvac_fan_guard',
      "Owner's Office",
      'Landing',
      'Summer',
      'Winter',
    ]) {
      expect(text, `redacted blob must not contain ${secret}`).not.toContain(secret);
    }
  });

  it('keeps the structure a maintainer actually reasons about', () => {
    const d = parse(buildDiagnostics(BASE));
    expect(d.card_version).toBe('0.7.0');
    expect(d.ha_version).toBe('2026.8.2');
    expect(d.identifiers_included).toBe(false);
    expect(d.config.zone_count).toBe(2);
    expect(d.config.zones[0].room_sensor_count).toBe(2);
    expect(d.config.zones[0].room_sensors_labelled).toBe(1);
    expect(d.config.seasons.map((s: any) => s.default_mode)).toEqual(['cool', 'heat_cool']);
    expect(d.config.features.eco_preset).toBe('away');
    expect(d.config.features.fan_timer).toEqual([15, 30]);
  });

  it('reports whether optional entities are configured without naming them', () => {
    const d = parse(buildDiagnostics(BASE));
    expect(d.config.weather_entity).toBe('set');
    expect(d.config.features.fan_guard).toBe('set');
  });

  it('says null, not "set", when an optional entity is absent', () => {
    const cfg = { ...CONFIG, weather_entity: undefined, features: {} };
    const d = parse(buildDiagnostics({ ...BASE, config: cfg }));
    expect(d.config.weather_entity).toBeNull();
    expect(d.config.features.fan_guard).toBeNull();
  });

  it('surfaces a non-default prefix without revealing it', () => {
    const d = parse(buildDiagnostics({ ...BASE, config: { ...CONFIG, prefix: 'household' } }));
    expect(d.config.prefix).toBe('<custom>');
    expect(buildDiagnostics({ ...BASE, config: { ...CONFIG, prefix: 'household' } })).not.toContain('household');
  });

  it('renames zones positionally so scheduling switches stay correlatable', () => {
    const d = parse(buildDiagnostics(BASE));
    expect(d.config.zones.map((z: any) => z.name)).toEqual(['Zone 1', 'Zone 2']);
    expect(d.scheduling_switches).toEqual([
      { zone: 'Zone 1', scheduling: 'off' },
      { zone: 'Zone 2', scheduling: 'on' },
    ]);
  });
});

describe('diagnostics with identifiers opted in', () => {
  it('includes the real ids and names only when asked', () => {
    const text = buildDiagnostics({ ...BASE, identifiers: true });
    expect(text).toContain('climate.owner_s_office_mini_split');
    expect(text).toContain("Owner's Office");
    expect(text).toContain('sensor.landing_temperature');
    expect(text).toContain('weather.forecast_home');
    expect(parse(text).identifiers_included).toBe(true);
  });
});

describe('diagnostics plan and object reporting', () => {
  it('marks a settled install and reports the counts', () => {
    const d = parse(buildDiagnostics(BASE));
    expect(d.last_dry_run.unchanged).toBe(48);
    expect(d.last_dry_run.settled).toBe(true);
  });

  it('marks an unsettled install when anything is actionable', () => {
    const d = parse(buildDiagnostics({ ...BASE, plan: { create: 1, adopt: 0, update: 0, delete: 0, noop: 47 } }));
    expect(d.last_dry_run.settled).toBe(false);
  });

  it('distinguishes "not run" from a run that found nothing', () => {
    const d = parse(buildDiagnostics({ ...BASE, plan: null }));
    expect(d.last_dry_run).toBe('not run');
  });

  it('carries the plan kind so a teardown preview is never mistaken for a setup one', () => {
    const d = parse(buildDiagnostics({ ...BASE, planKind: 'teardown' }));
    expect(d.last_dry_run.kind).toBe('teardown');
  });

  it('summarises object statuses by count', () => {
    const d = parse(buildDiagnostics(BASE));
    expect(d.managed_objects.total).toBe(4);
    expect(d.managed_objects.by_status).toEqual({ managed: 2, customized: 1, missing: 1 });
  });

  it('distinguishes "not loaded" from an empty inventory', () => {
    expect(parse(buildDiagnostics({ ...BASE, objectStatuses: null })).managed_objects).toBe('not loaded');
    expect(parse(buildDiagnostics({ ...BASE, objectStatuses: [] })).managed_objects).toEqual({
      total: 0,
      by_status: {},
    });
  });

  it('flags a season whose frozen key no longer matches its display name', () => {
    const d = parse(buildDiagnostics(BASE));
    // 'summer' matches 'Summer'; 'summer_2' does not match 'Winter' - a rename.
    expect(d.config.seasons.map((s: any) => s.key_matches_name_slug)).toEqual([true, false]);
  });
});

describe('diagnostics degrades rather than throwing', () => {
  it('survives a minimal config with no seasons, features or room sensors', () => {
    const cfg: MzcsCardConfig = {
      type: 'custom:multizone-climate-scheduler-card',
      zones: [{ name: 'Only', entity: 'climate.only' }],
    };
    const d = parse(buildDiagnostics({ cardVersion: '0.7.0', config: cfg }));
    expect(d.config.prefix).toBe('climate');
    expect(d.config.seasons).toEqual([]);
    expect(d.config.zones[0].room_sensor_count).toBe(0);
    expect(d.ha_version).toBe('unknown');
    expect(d.scheduling_switches).toBe('not read');
  });

  it('produces valid JSON in both modes', () => {
    expect(() => parse(buildDiagnostics(BASE))).not.toThrow();
    expect(() => parse(buildDiagnostics({ ...BASE, identifiers: true }))).not.toThrow();
  });
});
