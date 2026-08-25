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

describe('failures survive whatever Home Assistant rejects with (QA R5)', () => {
  it('a bare websocket code still produces a usable message', async () => {
    // HA rejects in-flight commands with a numeric code when the socket drops -
    // the common case on a wall tablet that sleeps. This used to surface as "3".
    const hass = hassWith(async () => {
      throw 3;
    });
    const res = await fetchDailyRuntime(hass, 'sensor.x', 7);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).not.toBe('3');
      expect(res.error.length).toBeGreaterThan(3);
    }
  });

  it('a rejection with no value at all still reports a failure', async () => {
    // The worst case: errorText returned the VALUE undefined, so the caller's
    // truthiness check went false and the card fell back to "no data yet".
    const hass = hassWith(async () => {
      throw undefined;
    });
    const res = await fetchDayHistory(hass, 'binary_sensor.x', 0, DAY);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(typeof res.error).toBe('string');
      expect(res.error.length).toBeGreaterThan(0);
    }
  });
});

describe('every card call site consumes the result discriminant (QA T2)', () => {
  it('no fetch result is used without checking ok', async () => {
    const { readFileSync } = await import('node:fs');
    const src = readFileSync(new URL('../src/multizone-climate-scheduler-card.ts', import.meta.url), 'utf8');
    // The regression these tests exist for lived in the CARD, not the adapter:
    // a call site that ignores the discriminant re-introduces it while the
    // adapter tests stay green.
    const calls = [...src.matchAll(/fetch(?:DailyRuntime|DayHistory)\s*\(/g)];
    expect(calls.length).toBeGreaterThan(0);
    for (const m of calls) {
      const after = src.slice(m.index ?? 0, (m.index ?? 0) + 700);
      expect(
        /\.ok\b/.test(after) || /Res\.ok/.test(after) || /=\s*d;/.test(after),
        `a fetch call site near index ${m.index} must consume .ok`,
      ).toBe(true);
    }
  });
});
