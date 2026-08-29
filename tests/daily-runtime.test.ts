import { describe, it, expect } from 'vitest';
import { dailyRuntimeFromHistory, type HistoryPoint } from '../src/lib/segments';

/**
 * The 0.7.2 history fix: daily runtime summed from the running sensor's raw
 * recorder history, replacing a long-term-statistics query that could never
 * return rows (history_stats sensors carry no state_class, so HA generates no
 * statistics for them - on any install).
 *
 * The coverage states are the point. A day with no recorded points is
 * ambiguous - "did not run" versus "already purged" - and rendering both as an
 * empty bar asserts a fact nobody has. Every ambiguity here gets its own case.
 */

const H = 3_600_000;

// A fixed mid-afternoon "now", built via the Date API so the tests hold in any
// timezone the suite runs in.
function fixedNow(): number {
  const d = new Date();
  d.setHours(15, 0, 0, 0);
  return d.getTime();
}
/** Local midnight `back` days before now. */
function midnight(now: number, back: number): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - back);
  return d.getTime();
}
const pt = (t: number, state: string): HistoryPoint => ({ t, state });

describe('dailyRuntimeFromHistory', () => {
  const now = fixedNow();

  it('returns one row per requested day, oldest first', () => {
    const rows = dailyRuntimeFromHistory([], 10, now);
    expect(rows).toHaveLength(10);
    expect(rows[0]!.day).toBe(midnight(now, 9));
    expect(rows[9]!.day).toBe(midnight(now, 0));
  });

  it('with no points at all, every day is coverage none - never a zero-runtime claim', () => {
    for (const r of dailyRuntimeFromHistory([], 10, now)) {
      expect(r.coverage).toBe('none');
      expect(r.hours).toBe(0);
    }
  });

  it('sums simple on/off runs within a day', () => {
    const d2 = midnight(now, 2);
    const points = [
      pt(midnight(now, 9), 'off'), // recording begins at the window start
      pt(d2 + 6 * H, 'on'),
      pt(d2 + 8.5 * H, 'off'),
      pt(d2 + 14 * H, 'on'),
      pt(d2 + 15 * H, 'off'),
    ];
    const rows = dailyRuntimeFromHistory(points, 10, now);
    const day2 = rows.find((r) => r.day === d2)!;
    expect(day2.hours).toBeCloseTo(3.5, 5);
    expect(day2.coverage).toBe('complete');
  });

  it('splits a run crossing midnight across both days', () => {
    // On at 22:00 two days back, off at 02:00 the next day: 2h + 2h, never 4h
    // on one day. The second day's opening state is inferred from the previous
    // evening's 'on' point, which is why the full point set goes to every day.
    const d2 = midnight(now, 2);
    const d1 = midnight(now, 1);
    const points = [pt(midnight(now, 9), 'off'), pt(d2 + 22 * H, 'on'), pt(d1 + 2 * H, 'off')];
    const rows = dailyRuntimeFromHistory(points, 10, now);
    expect(rows.find((r) => r.day === d2)!.hours).toBeCloseTo(2, 5);
    expect(rows.find((r) => r.day === d1)!.hours).toBeCloseTo(2, 5);
  });

  it('clamps today at now, counting a still-running segment up to now', () => {
    const t0 = midnight(now, 0);
    const points = [pt(midnight(now, 9), 'off'), pt(t0 + 13 * H, 'on')]; // on 13:00, now 15:00
    const rows = dailyRuntimeFromHistory(points, 10, now);
    expect(rows.find((r) => r.day === t0)!.hours).toBeCloseTo(2, 5);
  });

  it('marks days before the earliest point none, the earliest day partial, later days complete', () => {
    // Recording starts at noon three days back - the purge boundary shape.
    const d3 = midnight(now, 3);
    const points = [pt(d3 + 12 * H, 'on'), pt(d3 + 14 * H, 'off')];
    const rows = dailyRuntimeFromHistory(points, 10, now);
    for (const r of rows) {
      if (r.day < d3) expect(r.coverage, new Date(r.day).toString()).toBe('none');
    }
    const d3row = rows.find((r) => r.day === d3)!;
    expect(d3row.coverage).toBe('partial');
    expect(d3row.hours).toBeCloseTo(2, 5);
    expect(rows.find((r) => r.day === midnight(now, 2))!.coverage).toBe('complete');
  });

  it('a fully recorded day with no runs is COMPLETE with zero hours - the distinction that matters', () => {
    // An 'off' point before the window start proves recording spans the day;
    // zero here is a fact, not an absence of data.
    const d5 = midnight(now, 5);
    const points = [pt(midnight(now, 9) - H, 'off')];
    const rows = dailyRuntimeFromHistory(points, 10, now);
    const day5 = rows.find((r) => r.day === d5)!;
    expect(day5.coverage).toBe('complete');
    expect(day5.hours).toBe(0);
  });

  it('unavailable ends a run rather than inventing runtime', () => {
    const d1 = midnight(now, 1);
    const points = [
      pt(midnight(now, 9), 'off'),
      pt(d1 + 10 * H, 'on'),
      pt(d1 + 11 * H, 'unavailable'),
      pt(d1 + 20 * H, 'off'),
    ];
    expect(dailyRuntimeFromHistory(points, 10, now).find((r) => r.day === d1)!.hours).toBeCloseTo(1, 5);
  });

  it('a sensor first seen later today makes today partial, not a low-usage claim', () => {
    const t0 = midnight(now, 0);
    const points = [pt(t0 + 14 * H, 'on')]; // first-ever point 14:00 today
    const rows = dailyRuntimeFromHistory(points, 10, now);
    const today = rows.find((r) => r.day === t0)!;
    expect(today.coverage).toBe('partial');
    expect(today.hours).toBeCloseTo(1, 5); // 14:00 -> now 15:00
  });
});
