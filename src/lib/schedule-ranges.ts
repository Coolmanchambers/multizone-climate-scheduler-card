// CONTRACT.md §3-§4: converts instant-based blocks ("at 06:00 set 78") into the
// contiguous weekly time RANGES the native schedule helper stores, with the
// overnight tail split at midnight. Pure functions, no Lit/hass imports.

import type { BlockMode, DayGranularity } from '../types';

export interface ScheduleBlock {
  time: string; // "HH:MM"
  name: string;
  mode: BlockMode;
  cool_temp: number | null;
  heat_temp: number | null;
}

export interface TimeRange {
  from: string; // "HH:MM:SS"
  to: string; // "HH:MM:SS", "24:00:00" allowed as end-of-day
  data: { block: string; mode: BlockMode; cool_temp: number | null; heat_temp: number | null };
}

export type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export const ALL_DAYS: DayKey[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];
const WEEKDAYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const WEEKEND: DayKey[] = ['saturday', 'sunday'];

export function validateBlocks(blocks: ScheduleBlock[]): string[] {
  const errors: string[] = [];
  if (blocks.length === 0) errors.push('A day needs at least one block.');
  const seen = new Set<string>();
  for (const b of blocks) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(b.time)) errors.push(`Bad time "${b.time}".`);
    if (seen.has(b.time)) errors.push(`Duplicate block time ${b.time}.`);
    seen.add(b.time);
    if (b.mode === 'cool' && b.cool_temp == null) errors.push(`${b.name}: cool needs cool_temp.`);
    if (b.mode === 'heat' && b.heat_temp == null) errors.push(`${b.name}: heat needs heat_temp.`);
    if (b.mode === 'heat_cool' && (b.cool_temp == null || b.heat_temp == null))
      errors.push(`${b.name}: heat_cool needs both cool_temp and heat_temp.`);
    if (b.cool_temp != null && b.heat_temp != null && b.heat_temp >= b.cool_temp)
      errors.push(`${b.name}: heat_temp must be below cool_temp.`);
  }
  return errors;
}

function toData(b: ScheduleBlock): TimeRange['data'] {
  return { block: b.name, mode: b.mode, cool_temp: b.cool_temp, heat_temp: b.heat_temp };
}

/**
 * Convert one day's instant blocks to contiguous ranges covering 00:00-24:00.
 * The last block of the day rules overnight: its data fills [last.time, 24:00)
 * AND [00:00, first.time) - the midnight split required by the schedule helper.
 * A single-block day collapses to one full-day range.
 */
export function blocksToDayRanges(blocks: ScheduleBlock[]): TimeRange[] {
  const errors = validateBlocks(blocks);
  if (errors.length > 0) throw new Error(errors.join(' '));
  const sorted = [...blocks].sort((a, b) => a.time.localeCompare(b.time));
  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;

  if (sorted.length === 1) {
    return [{ from: '00:00:00', to: '24:00:00', data: toData(first) }];
  }

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

/** Which days a granularity set-key covers. */
export function daysForSet(granularity: DayGranularity, setKey: string): DayKey[] {
  if (granularity === 'all' && setKey === 'all') return ALL_DAYS;
  if (granularity === 'wdwe' && setKey === 'wd') return WEEKDAYS;
  if (granularity === 'wdwe' && setKey === 'we') return WEEKEND;
  if (granularity === 'days' && (ALL_DAYS as string[]).includes(setKey.toLowerCase())) {
    return [setKey.toLowerCase() as DayKey];
  }
  throw new Error(`Unknown set "${setKey}" for granularity "${granularity}".`);
}

/**
 * Build the full weekly payload for one schedule entity from per-set blocks.
 * Example: { granularity: 'wdwe', sets: { wd: [...], we: [...] } }.
 */
export function buildWeeklySchedule(
  granularity: DayGranularity,
  sets: Record<string, ScheduleBlock[]>,
): Record<DayKey, TimeRange[]> {
  const week = {} as Record<DayKey, TimeRange[]>;
  for (const [setKey, blocks] of Object.entries(sets)) {
    const ranges = blocksToDayRanges(blocks);
    for (const day of daysForSet(granularity, setKey)) {
      week[day] = ranges;
    }
  }
  for (const day of ALL_DAYS) {
    if (!week[day]) throw new Error(`No block set covers ${day}.`);
  }
  return week;
}

/** Granularity transitions (CONTRACT §2): expand clones, collapse keeps a survivor. */
export function transitionSets(
  from: DayGranularity,
  to: DayGranularity,
  sets: Record<string, ScheduleBlock[]>,
): Record<string, ScheduleBlock[]> {
  if (from === to) return sets;
  const get = (k: string): ScheduleBlock[] => {
    const s = sets[k];
    if (!s) throw new Error(`Missing set "${k}" for transition ${from}→${to}.`);
    return s.map((b) => ({ ...b }));
  };
  if (from === 'all' && to === 'wdwe') return { wd: get('all'), we: get('all') };
  if (from === 'all' && to === 'days')
    return Object.fromEntries(ALL_DAYS.map((d) => [d, get('all')]));
  if (from === 'wdwe' && to === 'days')
    return Object.fromEntries(
      ALL_DAYS.map((d) => [d, (WEEKDAYS as string[]).includes(d) ? get('wd') : get('we')]),
    );
  if (from === 'wdwe' && to === 'all') return { all: get('wd') };
  if (from === 'days' && to === 'wdwe') return { wd: get('monday'), we: get('saturday') };
  if (from === 'days' && to === 'all') return { all: get('monday') };
  throw new Error(`Unsupported transition ${from}→${to}.`);
}
