import { describe, it, expect } from 'vitest';
import { clampSetpoint } from '../src/ha-adapter';

describe('clampSetpoint', () => {
  it('clamps within plausible bounds (Nest: 50-90°F, setpoint 77)', () => {
    expect(clampSetpoint(91, 90, 50, 90)).toBe(90);
    expect(clampSetpoint(49, 50, 50, 90)).toBe(50);
    expect(clampSetpoint(78, 77, 50, 90)).toBe(78);
  });

  it('skips clamping when bounds are implausible for the unit (mini-split °C bounds, °F temps)', () => {
    // Real fixture: min 7 / max 35 (Celsius) but setpoint 80°F sits outside them.
    expect(clampSetpoint(81, 80, 7, 35)).toBe(81);
  });

  it('skips clamping on missing or inverted bounds', () => {
    expect(clampSetpoint(81, 80, null, undefined)).toBe(81);
    expect(clampSetpoint(81, 80, 90, 50)).toBe(81);
    expect(clampSetpoint(81, null, 50, 90)).toBe(81);
  });
});
