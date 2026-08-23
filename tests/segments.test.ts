import { describe, it, expect } from 'vitest';
import {
  extractRunSegments,
  totalMs,
  extractSetpointChanges,
  formatHoursQuarter,
  segmentToPct,
  type HistoryPoint,
} from '../src/lib/segments';

const T0 = Date.parse('2026-08-22T00:00:00-07:00'); // window start (midnight)
const T24 = T0 + 24 * 3600_000;
const at = (h: number, m = 0): number => T0 + h * 3600_000 + m * 60_000;
const p = (t: number, state: string): HistoryPoint => ({ t, state });

describe('extractRunSegments', () => {
  it('extracts the real fixture pattern (idle/cooling cycling)', () => {
    // Mirrors dev/fixtures/history-upstairs-24h.json transitions 13:07-15:42
    const pts = [
      p(at(12, 50), 'off'),
      p(at(13, 7), 'on'),
      p(at(13, 19), 'off'),
      p(at(13, 36), 'on'),
      p(at(13, 49), 'off'),
      p(at(14, 5), 'on'),
      p(at(14, 18), 'off'),
      p(at(14, 26), 'on'),
      p(at(15, 42), 'off'),
    ];
    const segs = extractRunSegments(pts, T0, T24);
    expect(segs).toHaveLength(4);
    expect(totalMs(segs)).toBe((12 + 13 + 13 + 76) * 60_000);
  });

  it('uses the state at window start (midnight span from the prior evening)', () => {
    const pts = [p(T0 - 3600_000, 'on'), p(at(1, 30), 'off')];
    const segs = extractRunSegments(pts, T0, T24);
    expect(segs).toEqual([{ start: T0, end: at(1, 30) }]);
  });

  it('assumes off before the first point when no initial state exists', () => {
    const pts = [p(at(9), 'on'), p(at(10), 'off')];
    expect(extractRunSegments(pts, T0, T24)).toEqual([{ start: at(9), end: at(10) }]);
  });

  it('unavailable terminates a segment and never counts as runtime', () => {
    const pts = [p(at(8), 'on'), p(at(9), 'unavailable'), p(at(11), 'on'), p(at(12), 'off')];
    const segs = extractRunSegments(pts, T0, T24);
    expect(segs).toEqual([
      { start: at(8), end: at(9) },
      { start: at(11), end: at(12) },
    ]);
  });

  it('coalesces sub-minute blips', () => {
    const pts = [
      p(at(8), 'on'),
      p(at(8, 30), 'off'),
      { t: at(8, 30) + 20_000, state: 'on' },
      p(at(9), 'off'),
    ];
    const segs = extractRunSegments(pts, T0, T24);
    expect(segs).toEqual([{ start: at(8), end: at(9) }]);
  });

  it('clamps an open segment to window end', () => {
    const pts = [p(at(22), 'on')];
    expect(extractRunSegments(pts, T0, T24)).toEqual([{ start: at(22), end: T24 }]);
  });

  it('empty history = no segments', () => {
    expect(extractRunSegments([], T0, T24)).toEqual([]);
  });
});

describe('extractSetpointChanges', () => {
  it('collapses to change points and skips non-numeric', () => {
    const pts = [
      p(at(0), '76'),
      p(at(6), '78'),
      p(at(6, 30), '78'),
      p(at(8), 'unavailable'),
      p(at(14), '76'),
    ];
    expect(extractSetpointChanges(pts)).toEqual([
      { t: at(0), value: 76 },
      { t: at(6), value: 78 },
      { t: at(14), value: 76 },
    ]);
  });
});

describe('formatHoursQuarter', () => {
  it('formats Nest-style', () => {
    expect(formatHoursQuarter(9.5)).toBe('9½ hr');
    expect(formatHoursQuarter(11.5)).toBe('11½ hr');
    expect(formatHoursQuarter(9.25)).toBe('9¼ hr');
    expect(formatHoursQuarter(0.75)).toBe('¾ hr');
    expect(formatHoursQuarter(0)).toBe('0 hr');
    expect(formatHoursQuarter(9.13)).toBe('9¼ hr');
    expect(formatHoursQuarter(-1)).toBe('–');
  });
});

describe('segmentToPct', () => {
  it('maps to percentage of window', () => {
    const { left, width } = segmentToPct({ start: at(6), end: at(12) }, T0, T24);
    expect(left).toBe(25);
    expect(width).toBe(25);
  });
});
