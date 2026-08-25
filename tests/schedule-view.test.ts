import { describe, it, expect } from 'vitest';
import {
  rangesToDayBlocks,
  detectSets,
  currentBlockAt,
  nextBlockAfter,
  editBlockInSet,
  replaceSetBlocks,
  stripSegments,
  stripSegmentsFromRanges,
  weekHasGaps,
  timeToMin,
  minToTime,
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

// A realistic multi-block summer schedule: weekdays plus a lighter weekend.
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

describe('stripSegments (SE2 heat-strip geometry)', () => {
  it('attributes the pre-first-block span to the last block (overnight wrap)', () => {
    const segs = stripSegments(WD);
    expect(segs[0]!.wrap).toBe(true);
    expect(segs[0]!.block.name).toBe('Sleep');
    expect(segs[0]!.fromMin).toBe(0);
    expect(segs[0]!.toMin).toBe(360);
  });

  it('covers the full day contiguously', () => {
    const segs = stripSegments(WD);
    expect(segs[0]!.fromMin).toBe(0);
    expect(segs[segs.length - 1]!.toMin).toBe(1440);
    for (let i = 1; i < segs.length; i++) {
      expect(segs[i]!.fromMin).toBe(segs[i - 1]!.toMin);
    }
  });

  it('a single 00:00 block is one full-day segment with no wrap', () => {
    const segs = stripSegments([cool('00:00', 'Hold', 78)]);
    expect(segs).toHaveLength(1);
    expect(segs[0]).toMatchObject({ fromMin: 0, toMin: 1440, wrap: false });
  });

  it('empty blocks produce no segments', () => {
    expect(stripSegments([])).toEqual([]);
  });
});

describe('replaceSetBlocks (SE2 add/remove/rename)', () => {
  it('adding a block rewrites only the set days', () => {
    const withNew = [...WD, cool('11:00', 'Lunch', 77)];
    const week = replaceSetBlocks(WEEK, ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], withNew);
    expect(rangesToDayBlocks(week.monday!)).toHaveLength(7);
    expect(rangesToDayBlocks(week.monday!).map((b) => b.name)).toContain('Lunch');
    expect(week.saturday).toBe(WEEK.saturday);
  });

  it('removing a block round-trips cleanly', () => {
    const fewer = WD.filter((b) => b.name !== 'Pre-cool');
    const week = replaceSetBlocks(WEEK, ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], fewer);
    expect(rangesToDayBlocks(week.friday!)).toEqual(fewer);
  });

  it('renames persist and null temps stay omitted in range data', () => {
    const renamed = WD.map((b) => (b.name === 'Wake' ? { ...b, name: 'Morning' } : b));
    const week = replaceSetBlocks(WEEK, ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], renamed);
    expect(rangesToDayBlocks(week.monday!)[0]!.name).toBe('Morning');
    for (const r of week.monday!) {
      expect('heat_temp' in (r.data as Record<string, unknown>)).toBe(false);
    }
  });
});

describe('time helpers', () => {
  it('round-trips and clamps', () => {
    expect(timeToMin('06:00')).toBe(360);
    expect(minToTime(360)).toBe('06:00');
    expect(minToTime(1500)).toBe('23:45');
    expect(minToTime(-30)).toBe('00:00');
  });
});

describe('nextBlockAfter transition truthfulness (QA-R A1-1/A1-2)', () => {
  it('reports a real midnight setpoint change when overnight temps differ', () => {
    // Friday ends Sleep 76; Saturday overnight carries Sleep 74 -> the engine
    // really changes the setpoint at Sat 00:00.
    const we2 = [cool('07:30', 'Wake', 78), cool('21:30', 'Sleep', 74)];
    const week: Week = {
      monday: blocksToDayRanges(WD), tuesday: blocksToDayRanges(WD), wednesday: blocksToDayRanges(WD),
      thursday: blocksToDayRanges(WD), friday: blocksToDayRanges(WD),
      saturday: blocksToDayRanges(we2), sunday: blocksToDayRanges(we2),
    };
    const now = new Date('2026-08-21T23:00:00'); // Friday
    const next = nextBlockAfter(week, now);
    expect(next).toMatchObject({ day: 'saturday', time: '00:00', cool_temp: 74 });
    expect(next!.minutesUntil).toBe(60);
  });

  it('a hold schedule that never changes returns null, not a phantom midnight block', () => {
    const hold = [cool('06:00', 'Day', 78)];
    const week: Week = Object.fromEntries(
      Object.keys(WEEK).map((k) => [k, blocksToDayRanges(hold)]),
    );
    expect(nextBlockAfter(week, new Date('2026-08-19T10:00:00'))).toBeNull();
  });

  it('still resolves ordinary intra-day and cross-day transitions', () => {
    const now = new Date('2026-08-22T14:20:00'); // Saturday
    expect(nextBlockAfter(WEEK, now)).toMatchObject({ name: 'Sleep', time: '21:30', minutesUntil: 430 });
    const fri = new Date('2026-08-21T23:00:00');
    // WD and WE overnight blocks are identical (Sleep 76) so midnight is NOT a
    // transition; the next real change is Saturday Wake 07:30.
    expect(nextBlockAfter(WEEK, fri)).toMatchObject({ name: 'Wake', day: 'saturday', time: '07:30' });
  });
});

describe('gap handling (native-editor OFF periods, QA-R A1-3)', () => {
  const gapDay = [
    { from: '08:00:00', to: '12:00:00', data: { block: 'A', mode: 'cool' as const, cool_temp: 76 } },
    { from: '14:00:00', to: '20:00:00', data: { block: 'B', mode: 'cool' as const, cool_temp: 79 } },
  ];
  it('weekHasGaps detects holes and full coverage', () => {
    expect(weekHasGaps({ ...WEEK, saturday: gapDay })).toBe(true);
    expect(weekHasGaps(WEEK)).toBe(false);
  });
  it('stripSegmentsFromRanges renders gaps as null blocks covering the day', () => {
    const segs = stripSegmentsFromRanges(gapDay);
    expect(segs.map((s) => [s.fromMin, s.toMin, s.block?.name ?? null])).toEqual([
      [0, 480, null],
      [480, 720, 'A'],
      [720, 840, null],
      [840, 1200, 'B'],
      [1200, 1440, null],
    ]);
  });
});

describe('editBlockInSet time-collision guard (QA-R A1-5)', () => {
  it('drops a time patch that collides with another block', () => {
    const edited = editBlockInSet(WEEK, detectSets(WEEK).sets.wd!, '14:00', { time: '16:00', cool_temp: 75 });
    const blocks = rangesToDayBlocks(edited.monday!);
    // time kept at 14:00, temp patch still applied
    const b = blocks.find((x) => x.name === 'Pre-cool')!;
    expect(b.time).toBe('14:00');
    expect(b.cool_temp).toBe(75);
    for (const r of edited.monday!) expect(r.from).not.toBe(r.to);
  });
});
