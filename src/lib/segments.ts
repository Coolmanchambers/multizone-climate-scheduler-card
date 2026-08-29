// Runtime history → run segments + setpoint changes (S10). Pure functions.
// Consumes recorder history rows for the zone's running binary sensor and the
// climate entity's setpoint attribute; produces the Energy History
// primitives (segments for the timeline, changes for the bubbles).

export interface HistoryPoint {
  /** epoch milliseconds */
  t: number;
  state: string;
}

export interface Segment {
  /** epoch ms, clamped to the requested window */
  start: number;
  end: number;
}

/**
 * Extract "running" segments from state history within [windowStart, windowEnd).
 * - The state AT windowStart comes from the latest point at/before it (recorder
 *   returns an initial row; without one we assume not-running until the first point).
 * - `unavailable`/`unknown` terminate a segment (we never invent runtime).
 * - Gaps shorter than coalesceMs between segments are merged (compressor blips
 *   and sensor re-reports shouldn't shred the timeline).
 */
export function extractRunSegments(
  points: HistoryPoint[],
  windowStart: number,
  windowEnd: number,
  onState = 'on',
  coalesceMs = 60_000,
): Segment[] {
  const sorted = [...points].sort((a, b) => a.t - b.t);
  const raw: Segment[] = [];
  let curState = 'off';
  for (const p of sorted) {
    if (p.t <= windowStart) curState = p.state;
    else break;
  }
  let openAt: number | null = curState === onState ? windowStart : null;
  for (const p of sorted) {
    if (p.t <= windowStart || p.t >= windowEnd) continue;
    const running = p.state === onState;
    if (running && openAt == null) openAt = p.t;
    if (!running && openAt != null) {
      raw.push({ start: openAt, end: p.t });
      openAt = null;
    }
  }
  if (openAt != null) raw.push({ start: openAt, end: windowEnd });

  const merged: Segment[] = [];
  for (const s of raw) {
    const prev = merged[merged.length - 1];
    if (prev && s.start - prev.end <= coalesceMs) prev.end = s.end;
    else merged.push({ ...s });
  }
  return merged;
}

export function totalMs(segments: Segment[]): number {
  return segments.reduce((acc, s) => acc + (s.end - s.start), 0);
}

export interface SetpointChange {
  t: number;
  value: number;
}

/** Collapse a setpoint attribute series to its change points (bubble data). */
export function extractSetpointChanges(points: HistoryPoint[]): SetpointChange[] {
  const sorted = [...points].sort((a, b) => a.t - b.t);
  const out: SetpointChange[] = [];
  for (const p of sorted) {
    const v = Number(p.state);
    if (!Number.isFinite(v)) continue;
    const last = out[out.length - 1];
    if (!last || last.value !== v) out.push({ t: p.t, value: v });
  }
  return out;
}

/** 9.5 → "9½ hr", 0.25 → "¼ hr", 0 → "0 hr" (quarter-hour formatting). */
export function formatHoursQuarter(hours: number): string {
  if (!Number.isFinite(hours) || hours < 0) return '–';
  const q = Math.round(hours * 4) / 4;
  const whole = Math.floor(q);
  const frac = q - whole;
  const fracStr = frac === 0.25 ? '¼' : frac === 0.5 ? '½' : frac === 0.75 ? '¾' : '';
  if (whole === 0 && fracStr) return `${fracStr} hr`;
  return `${whole}${fracStr} hr`;
}

export function segmentToPct(s: Segment, windowStart: number, windowEnd: number): { left: number; width: number } {
  const span = windowEnd - windowStart;
  return {
    left: ((s.start - windowStart) / span) * 100,
    width: ((s.end - s.start) / span) * 100,
  };
}

export type DayCoverage = 'complete' | 'partial' | 'none';

export interface DailyRuntimeDay {
  /** epoch ms of this day's local midnight */
  day: number;
  hours: number;
  /**
   * 'complete': recorded history spans the whole day (today: up to now).
   * 'partial': the recorder's oldest surviving point falls INSIDE this day -
   *   the total is a floor, not a fact, because earlier runs are purged.
   * 'none': the day predates recorded history entirely.
   */
  coverage: DayCoverage;
}

/**
 * Daily runtime summed from the running sensor's raw recorder history.
 *
 * Replaces the long-term-statistics query that could never return rows:
 * history_stats sensors carry no state_class, so HA never generates statistics
 * for them - on ANY install. (Root cause of "history shows only today".)
 *
 * Coverage exists because a day with zero recorded points is ambiguous: the
 * equipment may genuinely not have run, or the recorder may have purged that
 * far back. Rendering both as an empty bar asserts a fact nobody has - the
 * item-27 class of failure - so every row says which it is.
 */
export function dailyRuntimeFromHistory(
  points: HistoryPoint[],
  days: number,
  now: number,
  onState = 'on',
): DailyRuntimeDay[] {
  const earliest = points.length ? Math.min(...points.map((p) => p.t)) : Infinity;
  const out: DailyRuntimeDay[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const dayStart = d.getTime();
    d.setDate(d.getDate() + 1); // DST-safe next midnight
    const winEnd = Math.min(d.getTime(), now);
    if (winEnd <= dayStart) continue;
    if (earliest >= winEnd) {
      out.push({ day: dayStart, hours: 0, coverage: 'none' });
      continue;
    }
    const hours = totalMs(extractRunSegments(points, dayStart, winEnd, onState)) / 3600_000;
    out.push({ day: dayStart, hours, coverage: earliest > dayStart ? 'partial' : 'complete' });
  }
  return out;
}
