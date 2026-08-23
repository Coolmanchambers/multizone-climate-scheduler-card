import { describe, it, expect } from 'vitest';
import { computeVerdict } from '../src/lib/verdict';

describe('computeVerdict', () => {
  it('learning while no expectation exists (k=0 → expected 0)', () => {
    expect(computeVerdict(3, 0, 35, 12).status).toBe('learning');
    expect(computeVerdict(3, NaN, 35, 12).status).toBe('learning');
  });

  it('pending early in the day - no verdict before 6h elapsed', () => {
    expect(computeVerdict(1, 10, 35, 3).status).toBe('pending');
  });

  it('normal when within margin of the pace expectation', () => {
    // expected 10h/day, at 12h elapsed pace = 5h; margin 35% → threshold 6.75
    expect(computeVerdict(6.5, 10, 35, 12).status).toBe('normal');
  });

  it('high when clearly over the pace threshold', () => {
    expect(computeVerdict(8, 10, 35, 12).status).toBe('high');
  });

  it('sub-hour exceedances stay normal (noise guard)', () => {
    // expected 1h/day, 12h elapsed pace 0.5h, threshold 0.675; today 0.9 exceeds
    // threshold but only by 0.4 over pace → normal
    expect(computeVerdict(0.9, 1, 35, 12).status).toBe('normal');
  });

  it('caps pace at full day', () => {
    expect(computeVerdict(9, 10, 35, 30).status).toBe('normal');
  });
});
