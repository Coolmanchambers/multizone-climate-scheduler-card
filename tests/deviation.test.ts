import { describe, it, expect } from 'vitest';
import { deviationColor, formatDelta, sanitizeThresholds, formatRoomTemp } from '../src/lib/deviation';
import { normalizeRoomSensors } from '../src/types';

describe('deviationColor', () => {
  it('maps contract defaults: green ≤2, amber ≤4, red beyond', () => {
    expect(deviationColor(0)).toBe('green');
    expect(deviationColor(2)).toBe('green');
    expect(deviationColor(-2)).toBe('green');
    expect(deviationColor(3)).toBe('amber');
    expect(deviationColor(-4)).toBe('amber');
    expect(deviationColor(5)).toBe('red');
    expect(deviationColor(-5)).toBe('red');
  });

  it('honors helper-tuned thresholds', () => {
    expect(deviationColor(3, 3, 6)).toBe('green');
    expect(deviationColor(5, 3, 6)).toBe('amber');
    expect(deviationColor(7, 3, 6)).toBe('red');
  });

  it('matches the mockup examples (setpoint 76)', () => {
    expect(deviationColor(71 - 76)).toBe('red'); // Guest -5
    expect(deviationColor(77 - 76)).toBe('green'); // bedroom 1, +1
    expect(deviationColor(72 - 76)).toBe('amber'); // bedroom 2, -4
    expect(deviationColor(81 - 76)).toBe('red'); // Loft +5
  });
});

describe('formatDelta', () => {
  it('signs and rounds', () => {
    expect(formatDelta(1)).toBe('+1°');
    expect(formatDelta(-4)).toBe('-4°');
    expect(formatDelta(0)).toBe('0°');
    expect(formatDelta(1.6)).toBe('+2°');
  });
});

describe('sanitizeThresholds', () => {
  it('falls back to defaults on null/invalid', () => {
    expect(sanitizeThresholds(null, null)).toEqual({ greenMax: 2, amberMax: 4 });
    expect(sanitizeThresholds(-1, 0)).toEqual({ greenMax: 2, amberMax: 4 });
  });
  it('repairs inverted pairs', () => {
    expect(sanitizeThresholds(4, 3)).toEqual({ greenMax: 4, amberMax: 5 });
  });
  it('passes valid pairs through', () => {
    expect(sanitizeThresholds(1, 3)).toEqual({ greenMax: 1, amberMax: 3 });
  });
});

describe('formatRoomTemp', () => {
  it('rounds sensor noise to one decimal and keeps whole numbers whole', () => {
    expect(formatRoomTemp(82.832)).toBe('82.8');
    expect(formatRoomTemp(76.208)).toBe('76.2');
    expect(formatRoomTemp(74.786)).toBe('74.8');
    expect(formatRoomTemp(77)).toBe('77');
    expect(formatRoomTemp(77.04)).toBe('77');
    // JS rounds .5 toward +Infinity; immaterial for a comfort readout.
    expect(formatRoomTemp(-3.25)).toBe('-3.2');
  });
});

describe('room sensor labels (normalizeRoomSensors)', () => {
  it('accepts bare ids, {entity, name} rows, and a mix of both', () => {
    expect(normalizeRoomSensors(['sensor.a'])).toEqual([{ entity: 'sensor.a' }]);
    expect(normalizeRoomSensors([{ entity: 'sensor.a', name: 'Guest Room' }])).toEqual([
      { entity: 'sensor.a', name: 'Guest Room' },
    ]);
    expect(normalizeRoomSensors(['sensor.a', { entity: 'sensor.b', name: 'Loft' }])).toEqual([
      { entity: 'sensor.a' },
      { entity: 'sensor.b', name: 'Loft' },
    ]);
  });

  it('is tolerant of an absent list and of junk entries', () => {
    expect(normalizeRoomSensors(undefined)).toEqual([]);
    expect(normalizeRoomSensors([])).toEqual([]);
    expect(
      normalizeRoomSensors(['', { entity: '' }, null as never, { entity: 'sensor.ok' }]),
    ).toEqual([{ entity: 'sensor.ok' }]);
  });
});
