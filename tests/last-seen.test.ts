import { describe, it, expect } from 'vitest';
import { roomReading, ROOM_STALE_MS } from '../src/ha-adapter';
import {
  formatAge,
  ageVisible,
  ageing,
  lastSeenCandidateId,
  lastSeenSuggestion,
  planBulkLastSeen,
  applyBulkLastSeen,
  withLastSeen,
} from '../src/lib/last-seen';
import { DEFAULT_STALE_HOURS } from '../src/types';
import type { HassLike } from '../src/ha-types';

/**
 * Item 36 (last-seen companion) + item 12 (configurable stale threshold).
 *
 * The design facts these tests pin, measured live 2026-08-25 on the reference
 * instance: a Z2M companion is a SIBLING entity (`<base>_temperature` /
 * `<base>_last_seen`) with device_class timestamp, and `last_reported` is
 * refreshed by a restart's retained-MQTT replay while the companion is not -
 * which is why the companion takes precedence in the gate and why
 * `last_reported` must never be DISPLAYED as a time.
 */

const NOW = Date.parse('2026-08-30T20:00:00Z');

function hassWith(states: Record<string, { state: string; attributes?: Record<string, unknown>; last_reported?: string }>): HassLike {
  return {
    states: Object.fromEntries(
      Object.entries(states).map(([id, e]) => [id, { attributes: {}, ...e }]),
    ),
    callService: async () => undefined,
  } as unknown as HassLike;
}

const TEMP = 'sensor.bedroom_1_temperature';
const SEEN = 'sensor.bedroom_1_last_seen';

describe('roomReading with a last_seen companion (item 36 Q1: it drives the gate)', () => {
  const base = {
    [TEMP]: { state: '72.5', attributes: { friendly_name: 'Bedroom 1 Temperature' }, last_reported: '2026-08-30T19:55:00Z' },
  };

  it('fresh companion: not stale, age surfaced', () => {
    const h = hassWith({ ...base, [SEEN]: { state: '2026-08-30T19:58:00Z' } });
    const r = roomReading(h, TEMP, NOW, { lastSeenEntity: SEEN });
    expect(r.stale).toBe(false);
    expect(r.ageMs).toBe(2 * 60_000);
  });

  it('dead companion overrides a fresh last_reported - the restart blind spot', () => {
    // The scenario the feature exists for: retained MQTT replayed at restart
    // gives the temp entity a fresh last_reported while the device has been
    // silent for a day. Companion precedence flags it; last_reported would not.
    const h = hassWith({ ...base, [SEEN]: { state: '2026-08-29T19:00:00Z' } });
    const r = roomReading(h, TEMP, NOW, { lastSeenEntity: SEEN });
    expect(r.stale).toBe(true);
    expect(r.ageMs).toBe(25 * 3_600_000);
  });

  it.each(['unavailable', 'unknown', '', 'not-a-date'])(
    'companion state %j falls back to last_reported silently - no age surfaced',
    (state) => {
      const h = hassWith({ ...base, [SEEN]: { state } });
      const r = roomReading(h, TEMP, NOW, { lastSeenEntity: SEEN });
      expect(r.stale).toBe(false); // last_reported is 5 minutes old
      expect(r.ageMs).toBeUndefined();
    },
  );

  it('a MISSING companion entity falls back silently too', () => {
    const r = roomReading(hassWith(base), TEMP, NOW, { lastSeenEntity: SEEN });
    expect(r.stale).toBe(false);
    expect(r.ageMs).toBeUndefined();
  });

  it('no companion configured: byte-identical to the pre-item-36 result', () => {
    const plain = roomReading(hassWith(base), TEMP, NOW);
    expect(plain).toEqual({ entityId: TEMP, name: 'Bedroom 1', temp: 72.5, stale: false });
    expect('ageMs' in plain).toBe(false);
  });

  it('a companion timestamp slightly ahead of the reference clamps to age 0, never negative', () => {
    const h = hassWith({ ...base, [SEEN]: { state: '2026-08-30T20:00:30Z' } });
    const r = roomReading(h, TEMP, NOW, { lastSeenEntity: SEEN });
    expect(r.ageMs).toBe(0);
    expect(r.stale).toBe(false);
  });

  it.each(['45', '3000', '72.5', '2026', '70', '2026-08-30T13:00:00'])(
    'QA 2026-08-30 (3x confirmed): parseable non-timestamp state %j falls back, never poisons the gate',
    (state) => {
      // Date.parse accepts all of these ('45' is the year 2045, '72.5' is May
      // 1972, the offset-less one parses in the BROWSER timezone). None is a
      // trustworthy device timestamp; all must degrade silently.
      const h = hassWith({ ...base, [SEEN]: { state } });
      const r = roomReading(h, TEMP, NOW, { lastSeenEntity: SEEN });
      expect(r.ageMs).toBeUndefined();
      expect(r.stale).toBe(false); // last_reported is 5 minutes old
    },
  );

  it('QA 2026-08-30: a far-future companion is a broken source, not a fresh device', () => {
    // Beyond the slack the old clamp would have pinned a permanent "now" label
    // and suppressed the gate; now it falls back entirely.
    const h = hassWith({ ...base, [SEEN]: { state: '2026-08-30T21:00:00Z' } });
    const r = roomReading(h, TEMP, NOW, { lastSeenEntity: SEEN });
    expect(r.ageMs).toBeUndefined();
    expect(r.stale).toBe(false);
  });

  it('QA F1 2026-08-30: a fresh companion does NOT vouch for a dead temperature feed', () => {
    // The radio link being alive does not prove the temp entity still updates:
    // with last_reported 4h old and the companion 2m old, the row is stale.
    const h = hassWith({
      [TEMP]: { state: '72.5', attributes: { friendly_name: 'Bedroom 1 Temperature' }, last_reported: '2026-08-30T16:00:00Z' },
      [SEEN]: { state: '2026-08-30T19:58:00Z' },
    });
    const r = roomReading(h, TEMP, NOW, { lastSeenEntity: SEEN });
    expect(r.stale).toBe(true);
    expect(r.ageMs).toBe(2 * 60_000); // the age still reports the companion's truth
  });
});

describe('configurable stale threshold (item 12)', () => {
  const at = (iso: string) =>
    hassWith({ [TEMP]: { state: '70', last_reported: iso } });

  it('the default is exactly the original hard-coded gate', () => {
    expect(ROOM_STALE_MS).toBe(DEFAULT_STALE_HOURS * 3_600_000);
    // 2h59m old: fresh; 3h01m old: stale - unchanged behaviour.
    expect(roomReading(at('2026-08-30T17:01:00Z'), TEMP, NOW).stale).toBe(false);
    expect(roomReading(at('2026-08-30T16:59:00Z'), TEMP, NOW).stale).toBe(true);
  });

  it('an override moves the gate in both directions', () => {
    const twoHoursOld = at('2026-08-30T18:00:00Z');
    expect(roomReading(twoHoursOld, TEMP, NOW).stale).toBe(false);
    expect(roomReading(twoHoursOld, TEMP, NOW, { staleMs: 3_600_000 }).stale).toBe(true);
    const fourHoursOld = at('2026-08-30T16:00:00Z');
    expect(roomReading(fourHoursOld, TEMP, NOW).stale).toBe(true);
    expect(roomReading(fourHoursOld, TEMP, NOW, { staleMs: 6 * 3_600_000 }).stale).toBe(false);
  });

  it('the override applies to the companion path too', () => {
    const h = hassWith({
      [TEMP]: { state: '70', last_reported: '2026-08-30T19:59:00Z' },
      [SEEN]: { state: '2026-08-30T18:00:00Z' },
    });
    expect(roomReading(h, TEMP, NOW, { lastSeenEntity: SEEN }).stale).toBe(false);
    expect(roomReading(h, TEMP, NOW, { lastSeenEntity: SEEN, staleMs: 3_600_000 }).stale).toBe(true);
  });
});

describe('formatAge - compact single unit for the 300px row', () => {
  it.each([
    [0, 'now'],
    [59_000, 'now'],
    [60_000, '1m'],
    [45 * 60_000, '45m'],
    [59 * 60_000 + 59_000, '59m'],
    [60 * 60_000, '1h'],
    [5 * 3_600_000 + 30 * 60_000, '5h'],
    [24 * 3_600_000, '1d'],
    [3 * 24 * 3_600_000 + 3_600_000, '3d'],
  ])('%d ms -> %s', (ms, label) => {
    expect(formatAge(ms)).toBe(label);
  });

  it('never renders nonsense for a negative or non-finite age', () => {
    expect(formatAge(-1)).toBe('');
    expect(formatAge(NaN)).toBe('');
  });
});

describe('ageVisible - the tri-state setting', () => {
  it('no usable companion shows nothing in EVERY mode (non-negotiable 1)', () => {
    for (const mode of ['off', 'always', 'ageing'] as const) {
      expect(ageVisible(mode, undefined, 45 * 60_000)).toBe(false);
    }
  });

  it('off shows nothing even with a companion', () => {
    expect(ageVisible('off', 1000, 45 * 60_000)).toBe(false);
  });

  it('always shows any age', () => {
    expect(ageVisible('always', 0, 45 * 60_000)).toBe(true);
  });

  it('ageing shows only past the threshold', () => {
    expect(ageVisible('ageing', 44 * 60_000, 45 * 60_000)).toBe(false);
    expect(ageVisible('ageing', 45 * 60_000, 45 * 60_000)).toBe(true);
  });

  it('ageing() styling flag agrees with the ageing-mode visibility cut', () => {
    expect(ageing(undefined, 1)).toBe(false);
    expect(ageing(44 * 60_000, 45 * 60_000)).toBe(false);
    expect(ageing(46 * 60_000, 45 * 60_000)).toBe(true);
  });
});

describe('editor suggestion (Q3: the editor suggests, the config decides)', () => {
  it('derives the sibling id only for the _temperature convention', () => {
    expect(lastSeenCandidateId('sensor.zb_studio_temp_sensor_temperature')).toBe(
      'sensor.zb_studio_temp_sensor_last_seen',
    );
    expect(lastSeenCandidateId('sensor.loft_temp')).toBeNull();
    expect(lastSeenCandidateId('sensor.temperature_probe')).toBeNull();
  });

  it('offers the candidate only when it exists, is a timestamp, and is alive', () => {
    const alive = hassWith({
      [SEEN]: { state: '2026-08-30T19:58:00Z', attributes: { device_class: 'timestamp' } },
    });
    expect(lastSeenSuggestion(alive, TEMP)).toBe(SEEN);

    expect(lastSeenSuggestion(hassWith({}), TEMP)).toBeNull();

    const wrongClass = hassWith({ [SEEN]: { state: '2026-08-30T19:58:00Z', attributes: { device_class: 'power' } } });
    expect(lastSeenSuggestion(wrongClass, TEMP)).toBeNull();

    const dead = hassWith({ [SEEN]: { state: 'unavailable', attributes: { device_class: 'timestamp' } } });
    expect(lastSeenSuggestion(dead, TEMP)).toBeNull();
  });
});

describe('bulk find (non-negotiable 5: preview, skip filled, skip cleared)', () => {
  const zones = [
    {
      entity: 'climate.zone_a',
      name: 'Zone A',
      room_sensors: [
        TEMP, // string form, candidate exists
        { entity: 'sensor.studio_temperature', name: 'Studio' }, // no candidate in hass
        { entity: 'sensor.loft_temperature', last_seen: 'sensor.custom_uptime' }, // already filled
      ],
    },
    {
      entity: 'climate.zone_b',
      name: 'Zone B',
      room_sensors: [{ entity: 'sensor.den_temperature' }], // candidate exists
    },
  ];
  const h = hassWith({
    [SEEN]: { state: '2026-08-30T19:58:00Z', attributes: { device_class: 'timestamp' } },
    'sensor.den_last_seen': { state: '2026-08-30T19:58:00Z', attributes: { device_class: 'timestamp' } },
    'sensor.loft_last_seen': { state: '2026-08-30T19:58:00Z', attributes: { device_class: 'timestamp' } },
  });

  it('plans only the empty rows with a live candidate', () => {
    expect(planBulkLastSeen(zones, h)).toEqual([
      { zoneIndex: 0, sensorEntity: TEMP, lastSeen: SEEN },
      { zoneIndex: 1, sensorEntity: 'sensor.den_temperature', lastSeen: 'sensor.den_last_seen' },
    ]);
  });

  it('a filled row is skipped even though its sibling candidate exists', () => {
    expect(planBulkLastSeen(zones, h).some((r) => r.sensorEntity === 'sensor.loft_temperature')).toBe(false);
  });

  it('a deliberately cleared sensor stays cleared', () => {
    expect(planBulkLastSeen(zones, h, new Set([TEMP]))).toEqual([
      { zoneIndex: 1, sensorEntity: 'sensor.den_temperature', lastSeen: 'sensor.den_last_seen' },
    ]);
  });
});

describe('withLastSeen - the single write path preserves everything else', () => {
  it('sets on a string row without disturbing its neighbours', () => {
    expect(withLastSeen([TEMP, 'sensor.other_temperature'], TEMP, SEEN)).toEqual([
      { entity: TEMP, last_seen: SEEN },
      'sensor.other_temperature',
    ]);
  });

  it('sets on an object row, keeping the label', () => {
    expect(withLastSeen([{ entity: TEMP, name: 'Bedroom' }], TEMP, SEEN)).toEqual([
      { entity: TEMP, name: 'Bedroom', last_seen: SEEN },
    ]);
  });

  it('clearing collapses back to the tidiest form', () => {
    expect(withLastSeen([{ entity: TEMP, last_seen: SEEN }], TEMP, null)).toEqual([TEMP]);
    expect(withLastSeen([{ entity: TEMP, name: 'Bedroom', last_seen: SEEN }], TEMP, null)).toEqual([
      { entity: TEMP, name: 'Bedroom' },
    ]);
  });

  it('replacing a value is a plain overwrite', () => {
    expect(withLastSeen([{ entity: TEMP, last_seen: SEEN }], TEMP, 'sensor.custom_uptime')).toEqual([
      { entity: TEMP, last_seen: 'sensor.custom_uptime' },
    ]);
  });

  it('QA 2026-08-30 (executed): junk rows pass through untouched instead of throwing', () => {
    // A bare `-` in hand-written YAML parses to null; every other card path
    // filters it, and an editor gesture must not be the one that crashes.
    const rows = [null, undefined, { name: 'no entity' }, TEMP] as never[];
    expect(() => withLastSeen(rows, TEMP, SEEN)).not.toThrow();
    expect(withLastSeen(rows, TEMP, SEEN)).toEqual([
      null,
      undefined,
      { name: 'no entity' },
      { entity: TEMP, last_seen: SEEN },
    ]);
  });
});

describe('applyBulkLastSeen - the preview is an upper bound, re-checked at write time (QA F4, 2x)', () => {
  const h = hassWith({
    [SEEN]: { state: '2026-08-30T19:58:00Z', attributes: { device_class: 'timestamp' } },
    'sensor.den_last_seen': { state: '2026-08-30T19:58:00Z', attributes: { device_class: 'timestamp' } },
  });
  const preview = [
    { zoneIndex: 0, sensorEntity: TEMP, lastSeen: SEEN },
    { zoneIndex: 1, sensorEntity: 'sensor.den_temperature', lastSeen: 'sensor.den_last_seen' },
  ];
  const zonesAt = (bedroomRow: unknown) => [
    { entity: 'climate.zone_a', name: 'Zone A', room_sensors: [bedroomRow] as never },
    { entity: 'climate.zone_b', name: 'Zone B', room_sensors: ['sensor.den_temperature'] },
  ];

  it('applies exactly the previewed pairs on an unchanged config', () => {
    const out = applyBulkLastSeen(zonesAt(TEMP), preview, h);
    expect(out[0]!.room_sensors).toEqual([{ entity: TEMP, last_seen: SEEN }]);
    expect(out[1]!.room_sensors).toEqual([{ entity: 'sensor.den_temperature', last_seen: 'sensor.den_last_seen' }]);
  });

  it('a value the user set by hand while the preview sat open is NOT clobbered', () => {
    const out = applyBulkLastSeen(zonesAt({ entity: TEMP, last_seen: 'sensor.custom_uptime' }), preview, h);
    expect(out[0]!.room_sensors).toEqual([{ entity: TEMP, last_seen: 'sensor.custom_uptime' }]);
  });

  it('a companion cleared while the preview sat open stays cleared - "no" sticks', () => {
    const out = applyBulkLastSeen(zonesAt(TEMP), preview, h, new Set([TEMP]));
    expect(out[0]!.room_sensors).toEqual([TEMP]);
    // the untouched other zone still applies
    expect(out[1]!.room_sensors).toEqual([{ entity: 'sensor.den_temperature', last_seen: 'sensor.den_last_seen' }]);
  });

  it('zone membership is re-derived by content, so an edited config cannot be written by stale index', () => {
    // The sensors swapped zones after the preview was computed.
    const swapped = [
      { entity: 'climate.zone_a', name: 'Zone A', room_sensors: ['sensor.den_temperature'] },
      { entity: 'climate.zone_b', name: 'Zone B', room_sensors: [TEMP] },
    ];
    const out = applyBulkLastSeen(swapped, preview, h);
    expect(out[0]!.room_sensors).toEqual([{ entity: 'sensor.den_temperature', last_seen: 'sensor.den_last_seen' }]);
    expect(out[1]!.room_sensors).toEqual([{ entity: TEMP, last_seen: SEEN }]);
  });

  it('a sensor removed since the preview is a no-op', () => {
    const out = applyBulkLastSeen(
      [{ entity: 'climate.zone_a', name: 'Zone A', room_sensors: [] }],
      [{ zoneIndex: 0, sensorEntity: TEMP, lastSeen: SEEN }],
      h,
    );
    expect(out[0]!.room_sensors).toEqual([]);
  });
});
