import { describe, it, expect } from 'vitest';
import { draftsChangeWeek, detectSets, weeksEqual, replaceSetBlocks, type Week } from '../src/lib/schedule-view';
import { blocksToDayRanges, ALL_DAYS, type ScheduleBlock } from '../src/lib/schedule-ranges';

/**
 * QA finding S1: a granularity switch populates drafts with value-preserving
 * clones, so "drafts exist" told the user their schedule was unsaved and not
 * running when it was neither. The question has to be whether saving would
 * change anything.
 */
const cool = (time: string, name: string, temp: number): ScheduleBlock => ({
  time, name, mode: 'cool', cool_temp: temp, heat_temp: null,
});

const BLOCKS = [cool('00:00', 'Sleep', 76), cool('06:00', 'Wake', 78)];
const WEEK: Week = Object.fromEntries(ALL_DAYS.map((d) => [d, blocksToDayRanges(BLOCKS)]));

const WDWE_DET = {
  granularity: 'wdwe' as const,
  sets: {
    wd: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    we: ['saturday', 'sunday'],
  },
} as ReturnType<typeof detectSets>;

describe('draftsChangeWeek', () => {
  it('is false with no drafts at all', () => {
    expect(draftsChangeWeek(WEEK, detectSets(WEEK), new Map())).toBe(false);
  });

  it('is FALSE for a granularity split that preserves every value', () => {
    // This is the reported defect: all -> wdwe clones the same blocks into both
    // sets, so nothing would change, but the card called it unsaved.
    const drafts = new Map<string, ScheduleBlock[]>([
      ['wd', BLOCKS.map((b) => ({ ...b }))],
      ['we', BLOCKS.map((b) => ({ ...b }))],
    ]);
    expect(draftsChangeWeek(WEEK, WDWE_DET, drafts)).toBe(false);
  });

  it('is TRUE once a value actually diverges', () => {
    const drafts = new Map<string, ScheduleBlock[]>([
      ['wd', BLOCKS.map((b) => ({ ...b }))],
      ['we', [cool('00:00', 'Sleep', 70), cool('06:00', 'Wake', 78)]],
    ]);
    expect(draftsChangeWeek(WEEK, WDWE_DET, drafts)).toBe(true);
  });

  it('is TRUE when a block is removed', () => {
    const drafts = new Map<string, ScheduleBlock[]>([['all', [cool('00:00', 'Sleep', 76)]]]);
    expect(draftsChangeWeek(WEEK, detectSets(WEEK), drafts)).toBe(true);
  });

  it('is TRUE when only a block name changes', () => {
    const drafts = new Map<string, ScheduleBlock[]>([
      ['all', [cool('00:00', 'Night', 76), cool('06:00', 'Wake', 78)]],
    ]);
    expect(draftsChangeWeek(WEEK, detectSets(WEEK), drafts)).toBe(true);
  });

  it('is TRUE when only a temperature changes', () => {
    const drafts = new Map<string, ScheduleBlock[]>([
      ['all', [cool('00:00', 'Sleep', 76), cool('06:00', 'Wake', 79)]],
    ]);
    expect(draftsChangeWeek(WEEK, detectSets(WEEK), drafts)).toBe(true);
  });
});

describe('weeksEqual', () => {
  it('is true for a week rebuilt from the same blocks', () => {
    const rebuilt = replaceSetBlocks(WEEK, [...ALL_DAYS], BLOCKS.map((b) => ({ ...b })));
    expect(weeksEqual(WEEK, rebuilt)).toBe(true);
  });
  it('is false when a day differs', () => {
    expect(weeksEqual(WEEK, { ...WEEK, sunday: [] })).toBe(false);
  });
});
