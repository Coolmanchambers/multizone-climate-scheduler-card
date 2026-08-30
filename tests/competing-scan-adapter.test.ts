import { describe, it, expect } from 'vitest';
import { scanCompetingWriters } from '../src/ha-adapter';
import type { HassLike } from '../src/ha-types';

/**
 * Adapter-level pins from the tier-3a QA sweep: the fetch/count layer around
 * the pure scanner. Each fake hass models one reviewer-proven failure shape.
 */

const ZONES = [{ entity: 'climate.bedroom_1', name: 'Bedroom 1' }];

interface FakeParts {
  states?: Record<string, { state: string; attributes: Record<string, unknown> }>;
  configs?: Record<string, unknown>;
  scriptConfigs?: Record<string, unknown>;
  entries?: Record<string, { id?: string; area_id?: string | null; device_id?: string | null; labels?: string[] }>;
  deviceListFails?: boolean;
  noCallWS?: boolean;
}

function fakeHass(parts: FakeParts): HassLike {
  const states = parts.states ?? {};
  const hass: HassLike = {
    states,
    callService: async () => undefined,
    callApi: async (method: string, path: string) => {
      const auto = path.match(/^config\/automation\/config\/(.+)$/);
      if (auto && parts.configs && auto[1]! in parts.configs) return parts.configs[auto[1]!];
      const script = path.match(/^config\/script\/config\/(.+)$/);
      if (script && parts.scriptConfigs && script[1]! in parts.scriptConfigs) return parts.scriptConfigs[script[1]!];
      throw new Error('not found');
    },
  };
  if (!parts.noCallWS) {
    hass.callWS = async (msg: Record<string, unknown>) => {
      if (msg.type === 'config/entity_registry/get_entries') {
        const ids = (msg.entity_ids as string[]) ?? [];
        return Object.fromEntries(ids.map((id) => [id, parts.entries?.[id] ?? null]));
      }
      if (msg.type === 'config/device_registry/list') {
        if (parts.deviceListFails) throw new Error('registry down');
        return [];
      }
      throw new Error(`unexpected ws ${String(msg.type)}`);
    };
  }
  return hass;
}

const auto = (state: string, id: string) => ({ state, attributes: { friendly_name: id, id } });

describe('scanCompetingWriters (adapter layer)', () => {
  it('P4: refuses to scan without callWS instead of accusing its own engine', async () => {
    const hass = fakeHass({
      noCallWS: true,
      states: { 'automation.own': auto('on', 'climate_mzcs_engine') },
      configs: { climate_mzcs_engine: { action: [] } },
    });
    await expect(scanCompetingWriters(hass, 'climate', 'mzcs', ZONES)).rejects.toThrow(/entity registry/);
  });

  it('P5: a failed device-registry read is DISCLOSED as degraded, not swallowed', async () => {
    const hass = fakeHass({
      states: { 'automation.a': auto('on', 'a1') },
      configs: { a1: { action: [] } },
      // zone has a device but no area -> the device-registry read is needed
      entries: { 'climate.bedroom_1': { device_id: 'dev1', area_id: null, labels: [] } },
      deviceListFails: true,
    });
    const s = await scanCompetingWriters(hass, 'climate', 'mzcs', ZONES);
    expect(s.degraded).toBe(true);
  });

  it('S2: blueprints are counted separately, never as plainly scanned', async () => {
    const hass = fakeHass({
      states: { 'automation.bp': auto('on', 'bp1'), 'automation.plain': auto('on', 'p1') },
      configs: {
        bp1: { use_blueprint: { path: 'x.yaml', input: { thermostat: 'climate.bedroom_1' } } },
        p1: { action: [] },
      },
      entries: { 'climate.bedroom_1': { labels: [] } },
    });
    const s = await scanCompetingWriters(hass, 'climate', 'mzcs', ZONES);
    expect(s.blueprints).toBe(1);
    expect(s.scanned).toBe(1);
    expect(s.conflicts).toHaveLength(1);
    expect(s.conflicts[0]).toMatchObject({ via: 'blueprint', confidence: 'possible' });
  });

  it('P3: an off automation is still scanned and its finding says so', async () => {
    const hass = fakeHass({
      states: { 'automation.off_writer': auto('off', 'w1') },
      configs: { w1: { action: [{ action: 'climate.set_temperature', target: { entity_id: 'climate.bedroom_1' } }] } },
      entries: { 'climate.bedroom_1': { labels: [] } },
    });
    const s = await scanCompetingWriters(hass, 'climate', 'mzcs', ZONES);
    expect(s.conflicts).toHaveLength(1);
    expect(s.conflicts[0]!.sourceEnabled).toBe(false);
  });

  it('S1: the zone registry uuid reaches the matcher (device action by uuid)', async () => {
    const hass = fakeHass({
      states: { 'automation.dev': auto('on', 'd1') },
      configs: {
        d1: { action: [{ device_id: 'other', domain: 'climate', type: 'set_hvac_mode', entity_id: 'uuid_1234' }] },
      },
      entries: { 'climate.bedroom_1': { id: 'uuid_1234', labels: [] } },
    });
    const s = await scanCompetingWriters(hass, 'climate', 'mzcs', ZONES);
    expect(s.conflicts).toHaveLength(1);
    expect(s.conflicts[0]).toMatchObject({ via: 'entity', zoneEntityId: 'climate.bedroom_1' });
  });

  it('still excludes the card own automations by id AND label', async () => {
    const hass = fakeHass({
      states: { 'automation.own': auto('on', 'climate_mzcs_engine') },
      configs: {
        climate_mzcs_engine: { action: [{ action: 'climate.set_temperature', target: { entity_id: 'climate.bedroom_1' } }] },
      },
      entries: {
        'climate.bedroom_1': { labels: [] },
        'automation.own': { labels: ['mzcs'] },
      },
    });
    const s = await scanCompetingWriters(hass, 'climate', 'mzcs', ZONES);
    expect(s.conflicts).toEqual([]);
    expect(s.skippedOwn).toBe(1);
  });

  it('an unreadable config lands in unreadable, never in a clean scanned count', async () => {
    const hass = fakeHass({
      states: { 'automation.yaml_no_id': { state: 'on', attributes: { friendly_name: 'Y' } } },
      entries: {},
    });
    const s = await scanCompetingWriters(hass, 'climate', 'mzcs', ZONES);
    expect(s.scanned).toBe(0);
    expect(s.unreadable).toBe(1);
  });
});

describe('P3 follow-up: script state is not an enabled flag', () => {
  it('an idle script (state off) is NOT marked currently off', async () => {
    const hass = fakeHass({
      states: { 'script.writer': { state: 'off', attributes: { friendly_name: 'W' } } },
      scriptConfigs: { writer: { sequence: [{ action: 'climate.set_temperature', target: { entity_id: 'climate.bedroom_1' } }] } },
      entries: { 'climate.bedroom_1': { labels: [] } },
    });
    const s = await scanCompetingWriters(hass, 'climate', 'mzcs', ZONES);
    expect(s.conflicts).toHaveLength(1);
    expect(s.conflicts[0]!.sourceEnabled).toBeUndefined();
  });
});
