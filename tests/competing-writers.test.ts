import { describe, it, expect } from 'vitest';
import {
  collectServiceCalls,
  findCompetingWriters,
  isOwnAutomation,
  summarizeScan,
  type WriterSource,
  type ZoneRef,
} from '../src/lib/competing-writers';

const ZONES: ZoneRef[] = [
  {
    entityId: 'climate.bedroom_1',
    name: 'Bedroom 1',
    areaId: 'area_bedroom',
    deviceId: 'dev_bedroom',
    labels: ['upstairs'],
  },
  { entityId: 'climate.studio', name: 'Studio', areaId: null, deviceId: null, labels: [] },
];

function automation(config: unknown, id = 'automation.a', name = 'A'): WriterSource {
  return { id, name, kind: 'automation', config };
}

function findingsFor(config: unknown, zones = ZONES) {
  return findCompetingWriters([automation(config)], zones);
}

describe('collectServiceCalls', () => {
  it('reads the modern action: spelling', () => {
    const calls = collectServiceCalls({
      action: [{ action: 'climate.set_temperature', target: { entity_id: 'climate.bedroom_1' } }],
    });
    expect(calls.map((c) => c.service)).toEqual(['climate.set_temperature']);
    expect(calls[0]!.target.entityIds).toEqual(['climate.bedroom_1']);
  });

  it('reads the LEGACY service: spelling (harness hole H1)', () => {
    const calls = collectServiceCalls({
      action: [{ service: 'climate.set_hvac_mode', target: { entity_id: 'climate.bedroom_1' } }],
    });
    expect(calls.map((c) => c.service)).toEqual(['climate.set_hvac_mode']);
  });

  it('does not treat an automation top-level action LIST as a service name', () => {
    const calls = collectServiceCalls({ action: [{ delay: 5 }] });
    expect(calls).toEqual([]);
  });

  it('walks choose, if/then, repeat and parallel containers', () => {
    const calls = collectServiceCalls({
      action: [
        {
          choose: [
            {
              conditions: [],
              sequence: [
                { action: 'climate.set_temperature', target: { entity_id: 'climate.a' } },
              ],
            },
          ],
          default: [{ action: 'climate.turn_off', target: { entity_id: 'climate.b' } }],
        },
        {
          if: [],
          then: [{ action: 'climate.set_hvac_mode', target: { entity_id: 'climate.c' } }],
          else: [{ action: 'climate.set_fan_mode', target: { entity_id: 'climate.d' } }],
        },
        {
          repeat: {
            count: 3,
            sequence: [{ action: 'climate.set_preset_mode', target: { entity_id: 'climate.e' } }],
          },
        },
        { parallel: [{ action: 'homeassistant.turn_off', target: { entity_id: 'climate.f' } }] },
      ],
    });
    expect(calls.map((c) => c.service)).toEqual([
      'climate.set_temperature',
      'climate.turn_off',
      'climate.set_hvac_mode',
      'climate.set_fan_mode',
      'climate.set_preset_mode',
      'homeassistant.turn_off',
    ]);
  });

  it('reads every target spelling: target, legacy data, and bare entity_id', () => {
    const [a, b, c] = collectServiceCalls({
      action: [
        { action: 'climate.set_temperature', target: { entity_id: ['climate.a', 'climate.b'] } },
        { action: 'climate.set_temperature', data: { entity_id: 'climate.c' } },
        { action: 'climate.set_temperature', entity_id: 'climate.d' },
      ],
    });
    expect(a!.target.entityIds).toEqual(['climate.a', 'climate.b']);
    expect(b!.target.entityIds).toEqual(['climate.c']);
    expect(c!.target.entityIds).toEqual(['climate.d']);
  });

  it('reads area, device and label targets', () => {
    const [c] = collectServiceCalls({
      action: [
        {
          action: 'homeassistant.turn_off',
          target: { area_id: 'area_bedroom', device_id: ['dev_x'], label_id: 'upstairs' },
        },
      ],
    });
    expect(c!.target.areaIds).toEqual(['area_bedroom']);
    expect(c!.target.deviceIds).toEqual(['dev_x']);
    expect(c!.target.labelIds).toEqual(['upstairs']);
  });

  it('flags the all keyword and ignores none', () => {
    const [all, none] = collectServiceCalls({
      action: [
        { action: 'homeassistant.turn_off', entity_id: 'all' },
        { action: 'homeassistant.turn_off', entity_id: 'none' },
      ],
    });
    expect(all!.target.all).toBe(true);
    expect(none!.target.all).toBe(false);
    expect(none!.target.entityIds).toEqual([]);
  });

  it('marks templated targets and templated services instead of dropping them', () => {
    const [tpl, svc] = collectServiceCalls({
      action: [
        { action: 'climate.set_temperature', target: { entity_id: '{{ zone }}' } },
        { service_template: 'climate.{{ what }}', target: { entity_id: 'climate.bedroom_1' } },
      ],
    });
    expect(tpl!.target.templated).toBe(true);
    expect(tpl!.target.entityIds).toEqual([]);
    expect(svc!.serviceTemplated).toBe(true);
  });

  it('survives null, primitives and deep nesting without throwing', () => {
    expect(collectServiceCalls(null)).toEqual([]);
    expect(collectServiceCalls(42)).toEqual([]);
    let deep: unknown = { action: 'climate.set_temperature', entity_id: 'climate.bedroom_1' };
    for (let i = 0; i < 200; i++) deep = { sequence: [deep] };
    expect(() => collectServiceCalls(deep)).not.toThrow();
  });
});

describe('findCompetingWriters', () => {
  it('reports a direct entity write as a certain conflict', () => {
    const f = findingsFor({
      action: [{ action: 'climate.set_temperature', target: { entity_id: 'climate.bedroom_1' } }],
    });
    expect(f).toHaveLength(1);
    expect(f[0]).toMatchObject({
      sourceId: 'automation.a',
      service: 'climate.set_temperature',
      zoneEntityId: 'climate.bedroom_1',
      zoneName: 'Bedroom 1',
      severity: 'conflict',
      confidence: 'certain',
      via: 'entity',
    });
  });

  it('treats climate.turn_off as a conflict - it is set_hvac_mode under another name (tier B)', () => {
    const f = findingsFor({
      action: [{ action: 'climate.turn_off', target: { entity_id: 'climate.bedroom_1' } }],
    });
    expect(f).toHaveLength(1);
    expect(f[0]!.severity).toBe('conflict');
  });

  it('catches homeassistant.turn_off reaching the zone through its AREA (round-3 NEW-2 shape)', () => {
    const f = findingsFor({
      action: [{ service: 'homeassistant.turn_off', target: { area_id: 'area_bedroom' } }],
    });
    expect(f).toHaveLength(1);
    expect(f[0]).toMatchObject({ via: 'area', confidence: 'certain', severity: 'conflict' });
  });

  it('matches device and label targets', () => {
    expect(
      findingsFor({
        action: [{ action: 'climate.set_hvac_mode', target: { device_id: 'dev_bedroom' } }],
      })[0],
    ).toMatchObject({ via: 'device' });
    expect(
      findingsFor({
        action: [{ action: 'climate.set_hvac_mode', target: { label_id: 'upstairs' } }],
      })[0],
    ).toMatchObject({ via: 'label' });
  });

  it('matches every zone when the call targets all', () => {
    const f = findingsFor({ action: [{ action: 'homeassistant.turn_off', entity_id: 'all' }] });
    expect(f.map((x) => x.zoneEntityId)).toEqual(['climate.bedroom_1', 'climate.studio']);
    expect(f.every((x) => x.via === 'all')).toBe(true);
  });

  it('reports a templated target as POSSIBLE with no named zone, never as clear', () => {
    const f = findingsFor({
      action: [{ action: 'climate.set_temperature', target: { entity_id: '{{ z }}' } }],
    });
    expect(f).toHaveLength(1);
    expect(f[0]).toMatchObject({ confidence: 'possible', via: 'template', zoneEntityId: null });
  });

  it('reports a templated SERVICE aimed at a zone as possible', () => {
    const f = findingsFor({
      action: [{ service_template: 'climate.{{ x }}', target: { entity_id: 'climate.bedroom_1' } }],
    });
    expect(f).toHaveLength(1);
    expect(f[0]).toMatchObject({ confidence: 'possible', zoneEntityId: 'climate.bedroom_1' });
  });

  it('files preset and fan writers as notes, not conflicts (tier C)', () => {
    for (const s of ['climate.set_preset_mode', 'climate.set_fan_mode']) {
      const f = findingsFor({ action: [{ action: s, target: { entity_id: 'climate.bedroom_1' } }] });
      expect(f).toHaveLength(1);
      expect(f[0]!.severity).toBe('note');
    }
  });

  it('ignores services the engine never writes, and zones it does not manage', () => {
    expect(
      findingsFor({
        action: [
          { action: 'climate.set_humidity', target: { entity_id: 'climate.bedroom_1' } },
          { action: 'climate.set_swing_mode', target: { entity_id: 'climate.bedroom_1' } },
          { action: 'light.turn_on', target: { entity_id: 'light.bedroom_1' } },
          { action: 'climate.set_temperature', target: { entity_id: 'climate.not_managed' } },
        ],
      }),
    ).toEqual([]);
  });

  it('reads a script sequence', () => {
    const f = findCompetingWriters(
      [
        {
          id: 'script.evening',
          name: 'Evening',
          kind: 'script',
          config: {
            sequence: [
              { action: 'climate.set_temperature', target: { entity_id: 'climate.studio' } },
            ],
          },
        },
      ],
      ZONES,
    );
    expect(f).toHaveLength(1);
    expect(f[0]).toMatchObject({ sourceId: 'script.evening', zoneName: 'Studio' });
  });

  it('deduplicates the same writer hitting the same zone the same way', () => {
    const f = findingsFor({
      action: [
        { action: 'climate.set_temperature', target: { entity_id: 'climate.bedroom_1' } },
        { action: 'climate.set_temperature', target: { entity_id: 'climate.bedroom_1' } },
      ],
    });
    expect(f).toHaveLength(1);
  });

  it('keeps entity and area routes to the same zone as separate findings', () => {
    const f = findingsFor({
      action: [
        { action: 'climate.set_temperature', target: { entity_id: 'climate.bedroom_1' } },
        { action: 'climate.set_temperature', target: { area_id: 'area_bedroom' } },
      ],
    });
    expect(f.map((x) => x.via).sort()).toEqual(['area', 'entity']);
  });
});

describe('isOwnAutomation', () => {
  it('needs BOTH the id prefix and the label - a faked id must still be scanned', () => {
    expect(isOwnAutomation('climate_mzcs_engine_a', ['mzcs'], 'climate', 'mzcs')).toBe(true);
    expect(isOwnAutomation('climate_mzcs_engine_a', [], 'climate', 'mzcs')).toBe(false);
    expect(isOwnAutomation('something_else', ['mzcs'], 'climate', 'mzcs')).toBe(false);
    expect(isOwnAutomation(undefined, ['mzcs'], 'climate', 'mzcs')).toBe(false);
  });
});

describe('summarizeScan', () => {
  it('separates conflicts from notes and carries the honest counts', () => {
    const s = summarizeScan(
      [
        automation({
          action: [
            { action: 'climate.set_temperature', target: { entity_id: 'climate.bedroom_1' } },
            { action: 'climate.set_preset_mode', target: { entity_id: 'climate.studio' } },
          ],
        }),
      ],
      ZONES,
      { unreadable: 3, skippedOwn: 9, capped: false, degraded: false },
    );
    expect(s.scanned).toBe(1);
    expect(s.unreadable).toBe(3);
    expect(s.skippedOwn).toBe(9);
    expect(s.conflicts).toHaveLength(1);
    expect(s.notes).toHaveLength(1);
  });

  it('a clean scan is empty findings, NOT an absence of information', () => {
    const s = summarizeScan([automation({ action: [] })], ZONES, {
      unreadable: 0,
      skippedOwn: 0,
      capped: false,
      degraded: false,
    });
    expect(s.conflicts).toEqual([]);
    expect(s.notes).toEqual([]);
    expect(s.scanned).toBe(1);
  });
});

/**
 * QA-sweep remediation (2026-08-29). Every case below names the finding it
 * pins, from the six-reviewer sweep of tier 3a. S1/S2 were the two most-
 * confirmed false all-clears: both are the common way a real competing climate
 * automation exists, and both scanned silently clean.
 */
describe('S1: device actions (no service key at all)', () => {
  it('reports a climate device action as a conflict via the device', () => {
    const f = findingsFor({
      action: [{ device_id: 'dev_bedroom', domain: 'climate', type: 'set_hvac_mode', hvac_mode: 'off' }],
    });
    expect(f).toHaveLength(1);
    expect(f[0]).toMatchObject({
      service: 'climate.set_hvac_mode',
      severity: 'conflict',
      confidence: 'certain',
      via: 'device',
      zoneName: 'Bedroom 1',
    });
  });

  it('files a device set_preset_mode as a note, same as the service form', () => {
    const f = findingsFor({
      action: [{ device_id: 'dev_bedroom', domain: 'climate', type: 'set_preset_mode', preset_mode: 'eco' }],
    });
    expect(f).toHaveLength(1);
    expect(f[0]!.severity).toBe('note');
  });

  it('matches a device action whose entity_id is the REGISTRY UUID, not the entity id', () => {
    const zones: ZoneRef[] = [
      { entityId: 'climate.bedroom_1', name: 'Bedroom 1', registryId: 'abc123def456', labels: [] },
    ];
    const f = findCompetingWriters(
      [automation({ action: [{ device_id: 'other_dev', domain: 'climate', type: 'set_hvac_mode', entity_id: 'abc123def456' }] })],
      zones,
    );
    expect(f).toHaveLength(1);
    expect(f[0]!.via).toBe('entity');
  });

  it('does NOT fire on device TRIGGERS or device CONDITIONS (same key shape)', () => {
    expect(
      findingsFor({
        trigger: [{ platform: 'device', device_id: 'dev_bedroom', domain: 'climate', type: 'hvac_mode_changed' }],
        condition: [{ condition: 'device', device_id: 'dev_bedroom', domain: 'climate', type: 'is_hvac_mode', hvac_mode: 'heat' }],
        action: [],
      }),
    ).toEqual([]);
  });
});

describe('S2: blueprint automations (config carries no action list)', () => {
  it('reports a blueprint whose INPUT names a managed zone as a possible conflict', () => {
    const f = findingsFor({
      id: 'bp1',
      alias: 'Scheduler',
      use_blueprint: { path: 'community/climate_scheduler.yaml', input: { thermostat: 'climate.bedroom_1', target_temp: 21 } },
    });
    expect(f).toHaveLength(1);
    expect(f[0]).toMatchObject({
      severity: 'conflict',
      confidence: 'possible',
      via: 'blueprint',
      zoneEntityId: 'climate.bedroom_1',
    });
  });

  it('finds zone entity ids NESTED inside blueprint input lists', () => {
    const f = findingsFor({
      use_blueprint: { path: 'x.yaml', input: { targets: ['climate.studio'], extra: { deep: 'climate.bedroom_1' } } },
    });
    expect(f.map((x) => x.zoneEntityId).sort()).toEqual(['climate.bedroom_1', 'climate.studio']);
  });

  it('a blueprint with no zone in its inputs produces no finding but IS counted', () => {
    const src = automation({ use_blueprint: { path: 'x.yaml', input: { light: 'light.porch' } } });
    const s = summarizeScan([src], ZONES, { unreadable: 0, skippedOwn: 0, capped: false, degraded: false });
    expect(s.conflicts).toEqual([]);
    expect(s.blueprints).toBe(1);
  });
});

describe('S3/S4/S6: target spellings the sweep proved were dropped', () => {
  it('S3: reads a literal entity_id under legacy data_template', () => {
    const f = findingsFor({
      action: [{ service: 'climate.set_temperature', data_template: { entity_id: 'climate.bedroom_1', temperature: '{{ t }}' } }],
    });
    expect(f).toHaveLength(1);
    expect(f[0]!.confidence).toBe('certain');
  });

  it('S4: splits a legacy comma-separated entity_id string', () => {
    const f = findingsFor({
      action: [{ action: 'climate.set_temperature', entity_id: 'climate.bedroom_1, climate.studio' }],
    });
    expect(f.map((x) => x.zoneEntityId).sort()).toEqual(['climate.bedroom_1', 'climate.studio']);
  });

  it('S6: a whole-string template target sets the templated flag', () => {
    const f = findingsFor({
      action: [{ action: 'climate.set_temperature', target: '{{ tgt }}' }],
    });
    expect(f).toHaveLength(1);
    expect(f[0]).toMatchObject({ confidence: 'possible', via: 'template' });
  });
});

describe('S5/S8: floor and group targets surface as possible, never vanish', () => {
  it('S5: a watched service aimed at a floor_id is a possible finding', () => {
    const f = findingsFor({
      action: [{ action: 'climate.set_temperature', target: { floor_id: 'upstairs' } }],
    });
    expect(f).toHaveLength(1);
    expect(f[0]).toMatchObject({ confidence: 'possible', via: 'floor', zoneEntityId: null });
  });

  it('S8: a watched service aimed at a group entity is a possible finding', () => {
    const f = findingsFor({
      action: [{ action: 'climate.set_hvac_mode', target: { entity_id: 'group.all_thermostats' } }],
    });
    expect(f).toHaveLength(1);
    expect(f[0]).toMatchObject({ confidence: 'possible', via: 'group', zoneEntityId: null });
  });

  it('a direct zone match suppresses the group/floor fallback for the same call', () => {
    const f = findingsFor({
      action: [{ action: 'climate.set_hvac_mode', target: { entity_id: ['climate.bedroom_1', 'group.x'], floor_id: 'up' } }],
    });
    expect(f).toHaveLength(1);
    expect(f[0]!.via).toBe('entity');
  });
});

describe('S7: templated services filtered by their static domain prefix', () => {
  it('a climate-prefixed templated service with NO target still surfaces as possible', () => {
    const f = findingsFor({ action: [{ service_template: 'climate.set_{{ x }}' }] });
    expect(f).toHaveLength(1);
    expect(f[0]).toMatchObject({ confidence: 'possible', zoneEntityId: null });
  });

  it('a templated service on an UNWATCHED domain is dropped even with a templated target', () => {
    expect(
      findingsFor({ action: [{ service_template: 'notify.mobile_{{ x }}', target: { entity_id: '{{ y }}' } }] }),
    ).toEqual([]);
    expect(
      findingsFor({ action: [{ service_template: 'light.turn_{{ x }}', target: { entity_id: '{{ y }}' } }] }),
    ).toEqual([]);
  });

  it('an indeterminate prefix aimed at a zone stays possible (unchanged behaviour)', () => {
    const f = findingsFor({ action: [{ service_template: '{{ svc }}', target: { entity_id: 'climate.bedroom_1' } }] });
    expect(f).toHaveLength(1);
    expect(f[0]!.confidence).toBe('possible');
  });
});

describe('P3: findings carry the automation enabled state', () => {
  it('passes source.enabled through to the finding', () => {
    const f = findCompetingWriters(
      [{ id: 'automation.x', name: 'X', kind: 'automation', enabled: false,
         config: { action: [{ action: 'climate.set_temperature', target: { entity_id: 'climate.bedroom_1' } }] } }],
      ZONES,
    );
    expect(f[0]!.sourceEnabled).toBe(false);
  });
});
