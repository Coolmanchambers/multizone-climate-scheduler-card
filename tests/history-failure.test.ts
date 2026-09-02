import { describe, it, expect } from 'vitest';
import { fetchDailyRuntimeFromHistory, fetchDayHistory } from '../src/ha-adapter';
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

describe('fetchDailyRuntimeFromHistory distinguishes empty from failed', () => {
  it('a recorder error is reported as a failure, not as no data', async () => {
    const hass = hassWith(async () => {
      throw new Error('recorder is not running');
    });
    const res = await fetchDailyRuntimeFromHistory(hass, 'binary_sensor.x_running', 10);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain('recorder is not running');
  });

  it('a successful query with no recorded points succeeds, with every day marked coverage none', async () => {
    // Success-but-empty must not be a bare [] (the item-27 mistake) NOR a set
    // of zero-runtime days (the same mistake wearing numbers): each day says
    // there is no data for it.
    const hass = hassWith(async () => ({}));
    const res = await fetchDailyRuntimeFromHistory(hass, 'binary_sensor.x_running', 10);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.rows).toHaveLength(10);
      for (const r of res.rows) expect(r.coverage).toBe('none');
    }
  });

  it('sums the on-time from raw history rows on success', async () => {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const t0 = dayStart.getTime();
    const hass = hassWith(async () => ({
      'binary_sensor.x_running': [
        { s: 'on', lu: (t0 + 3_600_000) / 1000 },
        { s: 'off', lu: (t0 + 3 * 3_600_000) / 1000 },
      ],
    }));
    // FIXED clock (05:00 today). With the real clock this test failed the
    // v0.7.3 release CI at 01:22 UTC: the on-interval is 01:00-03:00, today is
    // clamped at "now", and at 01:22 today's sum genuinely IS 22 minutes. The
    // clamp is correct behaviour; a test of a specific sum needs a fixed now.
    const res = await fetchDailyRuntimeFromHistory(hass, 'binary_sensor.x_running', 10, t0 + 5 * 3_600_000);
    expect(res.ok).toBe(true);
    if (res.ok) {
      const today = res.rows[res.rows.length - 1]!;
      expect(today.day).toBe(t0);
      expect(today.hours).toBeCloseTo(2, 5);
      // The sensor's first-ever point is 01:00 today, so earlier today is
      // unknowable and the day is a floor, not a fact.
      expect(today.coverage).toBe('partial');
      for (const r of res.rows.slice(0, -1)) expect(r.coverage).toBe('none');
    }
  });

  it('treats a core with no websocket as a failure, not as an empty history', async () => {
    const res = await fetchDailyRuntimeFromHistory(hassWith(undefined), 'binary_sensor.x', 10);
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
    const res = await fetchDailyRuntimeFromHistory(hass, 'binary_sensor.x', 10);
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
  // 20 s budget: this scan reads and regex-walks the 4,000-line card source,
  // which on a cold OneDrive cache under a full-suite load has exceeded the
  // 5 s default twice (2026-09-01) - a flake, never a real failure.
  it('no fetch result is used without checking ok', { timeout: 20_000 }, async () => {
    const { readFileSync } = await import('node:fs');
    const src = readFileSync(new URL('../src/multizone-climate-scheduler-card.ts', import.meta.url), 'utf8');
    // The regression these tests exist for lived in the CARD, not the adapter:
    // a call site that ignores the discriminant re-introduces it while the
    // adapter tests stay green.
    const calls = [...src.matchAll(/fetch(?:DailyRuntimeFromHistory|DayHistory)\s*\(/g)];
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
