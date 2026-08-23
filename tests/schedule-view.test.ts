import { describe, it, expect } from 'vitest';
import {
  rangesToDayBlocks,
  detectSets,
  currentBlockAt,
  nextBlockAfter,
  editBlockInSet,
  type Week,
} from '../src/lib/schedule-view';
import { blocksToDayRanges, type ScheduleBlock } from '../src/lib/schedule-ranges';

const cool = (time: string, name: string, temp: number): ScheduleBlock => ({
  time,
  name,
  mode: 'cool',
  cool_temp: temp,
  heat_temp: null,
});

// the owner's real Upstairs Summer schedule as provisioned in prod (S7).
const WD = [
  cool('06:00', 'Wake', 78),
  cool('08:00', 'Away', 80),
  cool('14:00', 'Pre-cool', 76),
  cool('16:00', 'On-peak', 79),
  cool('18:45', 'Evening', 77),
  cool('21:30', 'Sleep', 76),
];
const WE = [cool('07:30', 'Wake', 78), cool('21:30', 'Sleep', 76)];

const WEEK: Week = {
  monday: blocksToDayRanges(WD),
  tuesday: blocksToDayRanges(WD),
  wednesday: blocksToDayRanges(WD),
  thursday: blocksToDayRanges(WD),
  friday: blocksToDayRanges(WD),
  saturday: blocksToDayRanges(WE),
  sunday: blocksToDayRanges(WE),
};

describe('rangesToDayBlocks (inverse conversion)', () => {
  it('round-trips the real weekday schedule', () => {
    expect(rangesToDayBlocks(blocksToDayRanges(WD))).toEqual(WD);
  });
  it('round-trips the weekend schedule', () => {
    expect(rangesToDayBlocks(blocksToDayRanges(WE))).toEqual(WE);
  });
  it('keeps a genuine 00:00 block (single full-day)', () => {
    const single = [cool('07:00', 'Hold', 78)];
    // full-day range collapses to one block at 00:00 - acceptable canonical form
    const back = rangesToDayBlocks(blocksToDayRanges(single));
    expect(back).toHaveLength(1);
    expect(back[0]!.name).toBe('Hold');
  });
});

describe('detectSets', () => {
  it('detects wdwe on the real week', () => {
    const d = detectSets(WEEK);
    expect(d.granularity).toBe('wdwe');
    expect(d.sets.wd).toHaveLength(5);
    expect(d.sets.we).toEqual(['saturday', 'sunday']);
  });
  it('detects all when every day matches', () => {
    const week: Week = Object.fromEntries(
      Object.keys(WEEK).map((k) => [k, blocksToDayRanges(WE)]),
    );
    expect(detectSets(week).granularity).toBe('all');
  });
  it('falls back to days on divergence', () => {
    const week: Week = { ...WEEK, wednesday: blocksToDayRanges(WE) };
    expect(detectSets(week).granularity).toBe('days');
  });
});

describe('current/next block resolution', () => {
  it('Saturday 14:20 → current Wake 78, next Sleep 76 at 21:30', () => {
    const now = new Date('2026-08-22T14:20:00'); // a Saturday
    const cur = currentBlockAt(WEEK, now);
    expect(cur).toMatchObject({ name: 'Wake', cool_temp: 78, day: 'saturday' });
    const next = nextBlockAfter(WEEK, now);
    expect(next).toMatchObject({ name: 'Sleep', cool_temp: 76, time: '21:30', day: 'saturday' });
    expect(next!.minutesUntil).toBe(430);
  });

  it('Friday 23:00 → current Sleep, next is Saturday Wake 07:30', () => {
    const now = new Date('2026-08-21T23:00:00'); // a Friday
    expect(currentBlockAt(WEEK, now)).toMatchObject({ name: 'Sleep', day: 'friday' });
    const next = nextBlockAfter(WEEK, now);
    expect(next).toMatchObject({ name: 'Wake', day: 'saturday', time: '07:30' });
  });

  it('weekday 10:00 → current Away 80, next Pre-cool 14:00', () => {
    const now = new Date('2026-08-19T10:00:00'); // a Wednesday
    expect(currentBlockAt(WEEK, now)).toMatchObject({ name: 'Away', cool_temp: 80 });
    expect(nextBlockAfter(WEEK, now)).toMatchObject({ name: 'Pre-cool', cool_temp: 76 });
  });
});

describe('editBlockInSet', () => {
  it('edits a temp across the whole weekday set only', () => {
    const edited = editBlockInSet(WEEK, detectSets(WEEK).sets.wd!, '14:00', { cool_temp: 75 });
    const wedBlocks = rangesToDayBlocks(edited.wednesday!);
    expect(wedBlocks.find((b) => b.time === '14:00')!.cool_temp).toBe(75);
    // weekend untouched
    expect(rangesToDayBlocks(edited.saturday!)).toEqual(WE);
    // structure stays contiguous + valid
    expect(edited.monday!.length).toBe(WEEK.monday!.length);
  });

  it('edits a block time and keeps ranges contiguous', () => {
    const edited = editBlockInSet(WEEK, detectSets(WEEK).sets.wd!, '14:00', { time: '13:30' });
    const mon = edited.monday!;
    for (let i = 1; i < mon.length; i++) expect(mon[i]!.from).toBe(mon[i - 1]!.to);
    expect(rangesToDayBlocks(mon).find((b) => b.name === 'Pre-cool')!.time).toBe('13:30');
  });
});
