// Reading + editing views over a schedule helper's weekly config (S8).
// Pure functions - the card fetches the week via schedule/list and renders/edits
// through these. Inverse of schedule-ranges.ts's blocks→ranges conversion.

import type { ScheduleBlock, TimeRange, DayKey } from './schedule-ranges';
import { ALL_DAYS } from './schedule-ranges';
import type { BlockMode, DayGranularity } from '../types';

export type Week = Partial<Record<DayKey, TimeRange[]>>;

function dataOf(r: TimeRange): ScheduleBlock {
  const d = r.data as {
    block?: string;
    mode?: BlockMode;
    cool_temp?: number | null;
    heat_temp?: number | null;
  };
  return {
    time: r.from.slice(0, 5),
    name: d.block ?? '?',
    mode: d.mode ?? 'cool',
    cool_temp: d.cool_temp ?? null,
    heat_temp: d.heat_temp ?? null,
  };
}

function sameData(a: TimeRange, b: TimeRange): boolean {
  const da = dataOf(a);
  const db = dataOf(b);
  return (
    da.name === db.name &&
    da.mode === db.mode &&
    da.cool_temp === db.cool_temp &&
    da.heat_temp === db.heat_temp
  );
}

/**
 * Inverse of blocksToDayRanges: contiguous ranges → instant blocks.
 * The 00:00 head range is the previous night's tail when its data matches the
 * final range of the day - in that case it is dropped (its instant belongs to
 * the prior evening).
 */
export function rangesToDayBlocks(ranges: TimeRange[]): ScheduleBlock[] {
  if (ranges.length === 0) return [];
  const sorted = [...ranges].sort((a, b) => a.from.localeCompare(b.from));
  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;
  const dropHead =
    sorted.length > 1 && first.from === '00:00:00' && sameData(first, last);
  const kept = dropHead ? sorted.slice(1) : sorted;
  return kept.map(dataOf);
}

/** Canonical string for one day's ranges, for grouping identical days. */
function dayKeyOf(ranges: TimeRange[]): string {
  return JSON.stringify(
    [...ranges]
      .sort((a, b) => a.from.localeCompare(b.from))
      .map((r) => [r.from, r.to, dataOf(r)]),
  );
}

const WEEKDAYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const WEEKEND: DayKey[] = ['saturday', 'sunday'];

export interface DetectedSets {
  granularity: DayGranularity;
  /** set key → days it covers */
  sets: Record<string, DayKey[]>;
}

export function detectSets(week: Week): DetectedSets {
  const keys = ALL_DAYS.map((d) => dayKeyOf(week[d] ?? []));
  const allSame = keys.every((k) => k === keys[0]);
  if (allSame) return { granularity: 'all', sets: { all: [...ALL_DAYS] } };
  const wdSame = WEEKDAYS.every((d) => dayKeyOf(week[d] ?? []) === dayKeyOf(week.monday ?? []));
  const weSame = WEEKEND.every((d) => dayKeyOf(week[d] ?? []) === dayKeyOf(week.saturday ?? []));
  if (wdSame && weSame) {
    return { granularity: 'wdwe', sets: { wd: [...WEEKDAYS], we: [...WEEKEND] } };
  }
  return {
    granularity: 'days',
    sets: Object.fromEntries(ALL_DAYS.map((d) => [d, [d]])),
  };
}

const JS_DAY_TO_KEY: DayKey[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export interface ResolvedBlock extends ScheduleBlock {
  day: DayKey;
  /** minutes from `now` until this block starts (next-block resolution only) */
  minutesUntil?: number;
}

function hm(now: Date): string {
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export function currentBlockAt(week: Week, now: Date): ResolvedBlock | null {
  const day = JS_DAY_TO_KEY[now.getDay()]!;
  const ranges = week[day] ?? [];
  const t = `${hm(now)}:00`;
  for (const r of ranges) {
    if (r.from <= t && t < r.to) return { ...dataOf(r), day };
  }
  return null;
}

/** The next block INSTANT after now (skips the overnight-tail head ranges). */
export function nextBlockAfter(week: Week, now: Date): ResolvedBlock | null {
  for (let offset = 0; offset < 8; offset++) {
    const d = new Date(now.getTime() + offset * 86400000);
    const day = JS_DAY_TO_KEY[d.getDay()]!;
    const blocks = rangesToDayBlocks(week[day] ?? []);
    for (const b of blocks) {
      if (offset === 0 && b.time <= hm(now)) continue;
      const [bh, bm] = b.time.split(':').map(Number);
      const start = new Date(d);
      start.setHours(bh ?? 0, bm ?? 0, 0, 0);
      const minutesUntil = Math.round((start.getTime() - now.getTime()) / 60000);
      if (minutesUntil <= 0) continue;
      return { ...b, day, minutesUntil };
    }
  }
  return null;
}

/**
 * Apply an edit to one block across every day in its set, returning the new
 * full week payload for schedule/update. Edits keyed by original block time.
 */
export function editBlockInSet(
  week: Week,
  setDays: DayKey[],
  originalTime: string,
  patch: Partial<Pick<ScheduleBlock, 'time' | 'cool_temp' | 'heat_temp'>>,
): Week {
  const out: Week = {};
  for (const day of ALL_DAYS) {
    const ranges = week[day];
    if (!ranges) continue;
    if (!setDays.includes(day)) {
      out[day] = ranges;
      continue;
    }
    const blocks = rangesToDayBlocks(ranges).map((b) =>
      b.time === originalTime ? { ...b, ...patch } : b,
    );
    out[day] = blocksBackToRanges(blocks);
  }
  return out;
}

/** blocks → contiguous ranges (mirror of schedule-ranges, local to avoid cycle). */
function blocksBackToRanges(blocks: ScheduleBlock[]): TimeRange[] {
  const sorted = [...blocks].sort((a, b) => a.time.localeCompare(b.time));
  if (sorted.length === 0) return [];
  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;
  const toData = (b: ScheduleBlock) => ({
    block: b.name,
    mode: b.mode,
    cool_temp: b.cool_temp,
    heat_temp: b.heat_temp,
  });
  if (sorted.length === 1) return [{ from: '00:00:00', to: '24:00:00', data: toData(first) }];
  const ranges: TimeRange[] = [];
  if (first.time !== '00:00') {
    ranges.push({ from: '00:00:00', to: `${first.time}:00`, data: toData(last) });
  }
  for (let i = 0; i < sorted.length; i++) {
    const cur = sorted[i]!;
    const next = sorted[i + 1];
    ranges.push({
      from: `${cur.time}:00`,
      to: next ? `${next.time}:00` : '24:00:00',
      data: toData(cur),
    });
  }
  return ranges;
}
