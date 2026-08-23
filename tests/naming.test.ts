import { describe, it, expect } from 'vitest';
import { slugify, fanTimerId, runningSensorId } from '../src/lib/naming';

describe('naming', () => {
  it('slugifies display names', () => {
    expect(slugify('Upstairs')).toBe('upstairs');
    expect(slugify("the owner's Office")).toBe('owners_office');
    expect(slugify('  Down  Stairs ')).toBe('down_stairs');
  });

  it('builds contract entity ids', () => {
    expect(fanTimerId('climate', 'upstairs')).toBe('timer.climate_upstairs_fan');
    expect(runningSensorId('climate', 'downstairs')).toBe(
      'binary_sensor.climate_downstairs_running',
    );
  });
});
