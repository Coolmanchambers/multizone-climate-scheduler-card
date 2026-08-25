// Reading + editing views over a schedule helper's weekly config (S8).
// Pure functions - the card fetches the week via schedule/list and renders/edits
// through these. Inverse of schedule-ranges.ts's blocks→ranges conversion.

import type { ScheduleBlock, TimeRange, DayKey } from './schedule-ranges';
import { ALL_DAYS } from './schedule-ranges';
import type { BlockMode, DayGranularity } from '../types';

export type Week = Partial<Record<DayKey, TimeRange[]>>;

const dataOfRange = (r: TimeRange): ScheduleBlock => dataOf(r);
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
  // dayKeyOf sorts + JSON.stringifies a day - compute it once per day and
  // reuse for the wd/we comparisons (scan S13-A4).
  const keys = ALL_DAYS.map((d) => dayKeyOf(week[d] ?? []));
  const keyOf = (d: DayKey): string => keys[ALL_DAYS.indexOf(d)]!;
  const allSame = keys.every((k) => k === keys[0]);
  if (allSame) return { granularity: 'all', sets: { all: [...ALL_DAYS] } };
  const wdSame = WEEKDAYS.every((d) => keyOf(d) === keyOf('monday'));
  const weSame = WEEKEND.every((d) => keyOf(d) === keyOf('saturday'));
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
function sameBlockData(a: ScheduleBlock, b: ScheduleBlock): boolean {
  return (
    a.name === b.name && a.mode === b.mode && a.cool_temp === b.cool_temp && a.heat_temp === b.heat_temp
  );
}

/**
 * Next SETPOINT TRANSITION after `now`. Works on the raw ranges rather than
 * rangesToDayBlocks so midnight is handled truthfully (QA-R A1-1/A1-2): a
 * range start counts as a transition only when its data differs from the data
 * in effect immediately before it (the previous range, or the previous day's
 * last range at 00:00). A hold schedule that never changes returns null
 * instead of a phantom midnight block; a real midnight change (different
 * overnight temps between day-sets) is reported. Day iteration walks weekday
 * indices, not epoch milliseconds, so DST days are never skipped (A1-4).
 */
export function nextBlockAfter(week: Week, now: Date): ResolvedBlock | null {
  const startIdx = now.getDay();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const nowT = `${hm(now)}:00`;
  // Memoized per weekday: prevLastData re-walks days, so without this the
  // same day arrays get copied+sorted dozens of times per call (scan S13-A3).
  const rangeCache = new Map<number, TimeRange[]>();
  const dayRanges = (idx: number): TimeRange[] => {
    const norm = (((startIdx + idx) % 7) + 7) % 7;
    let rs = rangeCache.get(norm);
    if (!rs) {
      rs = [...(week[JS_DAY_TO_KEY[norm]!] ?? [])].sort((a, b) => a.from.localeCompare(b.from));
      rangeCache.set(norm, rs);
    }
    return rs;
  };
  const prevLastData = (idx: number): ScheduleBlock | null => {
    for (let back = 1; back <= 7; back++) {
      const rs = dayRanges(idx - back);
      if (rs.length) return dataOfRange(rs[rs.length - 1]!);
    }
    return null;
  };
  for (let offset = 0; offset <= 7; offset++) {
    const rs = dayRanges(offset);
    for (let i = 0; i < rs.length; i++) {
      const r = rs[i]!;
      if (offset === 0 && r.from <= nowT) continue;
      if (offset === 7 && r.from > nowT) break;
      const before = i > 0 ? dataOfRange(rs[i - 1]!) : prevLastData(offset);
      const b = dataOfRange(r);
      if (before && sameBlockData(before, b)) continue;
      const [bh, bm] = r.from.slice(0, 5).split(':').map(Number);
      const minutesUntil = offset * 1440 + (bh! * 60 + bm!) - nowMin;
      if (minutesUntil <= 0) continue;
      const day = JS_DAY_TO_KEY[(startIdx + offset) % 7]!;
      return { ...b, day, minutesUntil };
    }
  }
  return null;
}

/**
 * Apply an edit to one block across every day in its set, returning the new
 * full week payload for schedule/update. Edits keyed by original block time.
 * A time patch that would collide with another block in the set is dropped
 * (a duplicate time would emit a zero-length range - QA-R A1-5).
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
    const dayBlocks = rangesToDayBlocks(ranges);
    const safePatch =
      patch.time && dayBlocks.some((b) => b.time === patch.time && b.time !== originalTime)
        ? { ...patch, time: undefined }
        : patch;
    const blocks = dayBlocks.map((b) => (b.time === originalTime ? { ...b, ...safePatch, time: safePatch.time ?? b.time } : b));
    out[day] = blocksBackToRanges(blocks);
  }
  return out;
}

/**
 * True when any day's ranges do not contiguously cover 00:00-24:00. Schedules
 * authored in HA's native grid editor may contain OFF periods; the card's
 * block model would silently convert them into active coverage on save
 * (QA-R A1-3), so gap-weeks must be treated as read-only by the editor.
 */
export function weekHasGaps(week: Week): boolean {
  for (const d of ALL_DAYS) {
    const rs = [...(week[d] ?? [])].sort((a, b) => a.from.localeCompare(b.from));
    if (rs.length === 0) return true;
    if (rs[0]!.from !== '00:00:00') return true;
    for (let i = 1; i < rs.length; i++) {
      if (rs[i]!.from !== rs[i - 1]!.to) return true;
    }
    if (rs[rs.length - 1]!.to !== '24:00:00') return true;
  }
  return false;
}

/** Strip geometry straight from ranges, representing OFF gaps as block:null. */
export function stripSegmentsFromRanges(
  ranges: TimeRange[],
): Array<{ block: ScheduleBlock | null; fromMin: number; toMin: number }> {
  const rs = [...ranges].sort((a, b) => a.from.localeCompare(b.from));
  const out: Array<{ block: ScheduleBlock | null; fromMin: number; toMin: number }> = [];
  let cur = 0;
  for (const r of rs) {
    const f = timeToMin(r.from.slice(0, 5));
    const t = r.to === '24:00:00' ? 1440 : timeToMin(r.to.slice(0, 5));
    if (f > cur) out.push({ block: null, fromMin: cur, toMin: f });
    out.push({ block: dataOfRange(r), fromMin: f, toMin: t });
    cur = t;
  }
  if (cur < 1440) out.push({ block: null, fromMin: cur, toMin: 1440 });
  return out;
}

/**
 * Replace an entire set's block list across every day it covers (SE2 editor:
 * supports add/remove/rename, not just per-block patches). Other days keep
 * their existing ranges untouched.
 */
export function replaceSetBlocks(week: Week, setDays: DayKey[], blocks: ScheduleBlock[]): Week {
  const out: Week = {};
  for (const day of ALL_DAYS) {
    const ranges = week[day];
    if (!ranges) continue;
    out[day] = setDays.includes(day) ? blocksBackToRanges(blocks) : ranges;
  }
  return out;
}

export function timeToMin(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function minToTime(min: number): string {
  const v = Math.max(0, Math.min(1425, min));
  return `${String(Math.floor(v / 60)).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`;
}

export interface StripSegment {
  block: ScheduleBlock;
  /** minutes from midnight */
  fromMin: number;
  toMin: number;
  /** true for the pre-first-block span carrying the previous night's block */
  wrap: boolean;
}

/**
 * Strip geometry for the SE2 heat-strip view: each block runs from its start
 * to the next block's start; the span before the first block belongs to the
 * last block of the day (previous night wrapping past midnight).
 */
export function stripSegments(blocks: ScheduleBlock[]): StripSegment[] {
  if (blocks.length === 0) return [];
  const sorted = [...blocks].sort((a, b) => a.time.localeCompare(b.time));
  const out: StripSegment[] = [];
  const first = timeToMin(sorted[0]!.time);
  if (first > 0) out.push({ block: sorted[sorted.length - 1]!, fromMin: 0, toMin: first, wrap: true });
  sorted.forEach((b, i) => {
    out.push({
      block: b,
      fromMin: timeToMin(b.time),
      toMin: i < sorted.length - 1 ? timeToMin(sorted[i + 1]!.time) : 1440,
      wrap: false,
    });
  });
  return out;
}

/** blocks → contiguous ranges (mirror of schedule-ranges, local to avoid cycle). */
function blocksBackToRanges(blocks: ScheduleBlock[]): TimeRange[] {
  const sorted = [...blocks].sort((a, b) => a.time.localeCompare(b.time));
  if (sorted.length === 0) return [];
  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;
  // The schedule helper rejects null data values ("expected bool ... Got None") -
  // temps must be OMITTED when absent, never sent as null.
  const toData = (b: ScheduleBlock) => ({
    block: b.name,
    mode: b.mode,
    ...(b.cool_temp != null ? { cool_temp: b.cool_temp } : {}),
    ...(b.heat_temp != null ? { heat_temp: b.heat_temp } : {}),
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

/**
 * Would saving these drafts actually change the stored week?
 *
 * Draft presence is not the same question. `_switchGranularity` populates drafts
 * on every granularity change, and those expansions are value-preserving by
 * design - splitting one schedule into weekday/weekend clones the same blocks.
 * Treating "drafts exist" as "unsaved changes" therefore told users their
 * schedule was not running when it was, purely because they had looked at a
 * different view of it (QA S1).
 *
 * Compares the week the drafts would produce against the week as stored.
 */
export function draftsChangeWeek(
  week: Week,
  det: DetectedSets,
  drafts: Map<string, ScheduleBlock[]>,
): boolean {
  if (drafts.size === 0) return false;
  let out: Week = week;
  for (const [key, days] of Object.entries(det.sets)) {
    const blocks = drafts.get(key);
    if (blocks) out = replaceSetBlocks(out, days, blocks);
  }
  return !weeksEqual(out, week);
}

/** Structural comparison of two weeks, per day and per range. */
export function weeksEqual(a: Week, b: Week): boolean {
  for (const day of ALL_DAYS) {
    const ra = a[day] ?? [];
    const rb = b[day] ?? [];
    if (ra.length !== rb.length) return false;
    for (let i = 0; i < ra.length; i++) {
      const x = ra[i]!;
      const y = rb[i]!;
      if (x.from !== y.from || x.to !== y.to) return false;
      // Field-wise, not JSON.stringify: regenerating ranges from blocks can
      // reorder keys or add an explicit undefined, and neither is a change the
      // user made.
      const dx = dataOf(x);
      const dy = dataOf(y);
      if (
        dx.time !== dy.time ||
        (dx.name ?? '') !== (dy.name ?? '') ||
        (dx.mode ?? null) !== (dy.mode ?? null) ||
        (dx.cool_temp ?? null) !== (dy.cool_temp ?? null) ||
        (dx.heat_temp ?? null) !== (dy.heat_temp ?? null)
      ) {
        return false;
      }
    }
  }
  return true;
}
