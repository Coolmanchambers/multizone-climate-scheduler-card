import { describe, it, expect } from 'vitest';
import { fetchDailyRuntime, fetchDayHistory } from '../src/ha-adapter';
import type { HassLike } from '../src/ha-types';

/**
 * Backlog item 27: a failed recorder query and an empty one used to be the same
 * value - both `[]` - so a broken query rendered as "History accrues daily...",
 * telling the user to wait for data that was never going to arrive.
 *
 * These tests pin the distinction. An empty *success* is still empty; a failure
 * is a failure and must say so.
 */

function hassWith(callWS?: HassLike['callWS']): HassLike {
  return { states: {}, callService: async () => undefined, callWS };
}

const DAY = 24 * 60 * 60 * 1000;

describe('fetchDailyRuntime distinguishes empty from failed', () => {
  it('a recorder error is reported as a failure, not as no data', async () => {
    const hass = hassWith(async () => {
      throw new Error('recorder is not running');
    });
    const res = await fetchDailyRuntime(hass, 'sensor.x_runtime_today', 7);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain('recorder is not running');
  });

  it('a successful query with no rows is a success that is empty', async () => {
    const hass = hassWith(async () => ({}));
    const res = await fetchDailyRuntime(hass, 'sensor.x_runtime_today', 7);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.rows).toEqual([]);
  });

  it('returns the rows on success', async () => {
    const hass = hassWith(async () => ({
      'sensor.x_runtime_today': [
        { start: 1_000_000, max: 1.5 },
        { start: 1_100_000, max: null },
        { start: 1_200_000, max: 2 },
      ],
    }));
    const res = await fetchDailyRuntime(hass, 'sensor.x_runtime_today', 7);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.rows).toEqual([
        { day: 1_000_000, hours: 1.5 },
        { day: 1_200_000, hours: 2 },
      ]);
    }
  });

  it('treats a core with no websocket as a failure, not as an empty history', async () => {
    const res = await fetchDailyRuntime(hassWith(undefined), 'sensor.x', 7);
    expect(res.ok).toBe(false);
  });
});

describe('fetchDayHistory distinguishes empty from failed', () => {
  it('a recorder error is reported as a failure', async () => {
    const hass = hassWith(async () => {
      throw new Error('database is locked');
    });
    const res = await fetchDayHistory(hass, 'binary_sensor.x_running', 0, DAY);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain('database is locked');
  });

  it('a day with genuinely no recorded state is an empty success', async () => {
    const hass = hassWith(async () => ({ 'binary_sensor.x_running': [] }));
    const res = await fetchDayHistory(hass, 'binary_sensor.x_running', 0, DAY);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.rows).toEqual([]);
  });

  it('returns points on success', async () => {
    const hass = hassWith(async () => ({
      'binary_sensor.x_running': [
        { s: 'off', lu: 1 },
        { s: 'on', lu: 2 },
      ],
    }));
    const res = await fetchDayHistory(hass, 'binary_sensor.x_running', 0, DAY);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.rows).toEqual([{ t: 1000, state: 'off' }, { t: 2000, state: 'on' }]);
  });

  it('treats a core with no websocket as a failure', async () => {
    const res = await fetchDayHistory(hassWith(undefined), 'binary_sensor.x', 0, DAY);
    expect(res.ok).toBe(false);
  });
});
