import { describe, it, expect } from 'vitest';
import {
  blocksToDayRanges,
  buildWeeklySchedule,
  transitionSets,
  validateBlocks,
  ALL_DAYS,
  type ScheduleBlock,
} from '../src/lib/schedule-ranges';

const cool = (time: string, name: string, temp: number): ScheduleBlock => ({
  time,
  name,
  mode: 'cool',
  cool_temp: temp,
  heat_temp: null,
});

// A realistic multi-block summer weekday cooling schedule.
const UP_SUMMER_WD: ScheduleBlock[] = [
  cool('06:00', 'Wake', 78),
  cool('08:00', 'Away', 80),
  cool('14:00', 'Pre-cool', 76),
  cool('16:00', 'On-peak', 79),
  cool('18:45', 'Evening', 77),
  cool('21:30', 'Sleep', 76),
];

describe('blocksToDayRanges', () => {
  it('converts the real upstairs weekday schedule with midnight split', () => {
    const ranges = blocksToDayRanges(UP_SUMMER_WD);
    expect(ranges).toHaveLength(7);
    // Overnight head carries the LAST block (Sleep 76).
    expect(ranges[0]).toEqual({
      from: '00:00:00',
      to: '06:00:00',
      data: { block: 'Sleep', mode: 'cool', cool_temp: 76 },
    });
    // Tail runs to end-of-day with the same Sleep data.
    expect(ranges[6]).toMatchObject({ from: '21:30:00', to: '24:00:00' });
    expect(ranges[6]!.data.block).toBe('Sleep');
    // Contiguous: each range starts where the previous ended.
    for (let i = 1; i < ranges.length; i++) {
      expect(ranges[i]!.from).toBe(ranges[i - 1]!.to);
    }
  });

  it('collapses a single-block day to one full-day range', () => {
    const ranges = blocksToDayRanges([cool('07:00', 'Hold', 78)]);
    expect(ranges).toEqual([
      {
        from: '00:00:00',
        to: '24:00:00',
        data: { block: 'Hold', mode: 'cool', cool_temp: 78 },
      },
    ]);
  });

  it('handles a block exactly at midnight (no zero-length head)', () => {
    const ranges = blocksToDayRanges([cool('00:00', 'Night', 76), cool('08:00', 'Day', 79)]);
    expect(ranges[0]).toMatchObject({ from: '00:00:00', to: '08:00:00' });
    expect(ranges[0]!.data.block).toBe('Night');
    expect(ranges).toHaveLength(2);
  });

  it('carries dual setpoints for heat_cool blocks', () => {
    const winter: ScheduleBlock[] = [
      { time: '06:00', name: 'Day', mode: 'heat_cool', cool_temp: 84, heat_temp: 66 },
      { time: '19:00', name: 'Evening', mode: 'heat_cool', cool_temp: 78, heat_temp: 68 },
    ];
    const ranges = blocksToDayRanges(winter);
    expect(ranges[1]!.data).toEqual({ block: 'Day', mode: 'heat_cool', cool_temp: 84, heat_temp: 66 });
  });
});

describe('validateBlocks', () => {
  it('rejects empty, malformed, duplicate, and inverted setpoints', () => {
    expect(validateBlocks([])).not.toHaveLength(0);
    expect(validateBlocks([cool('6:00', 'Bad', 78)])).not.toHaveLength(0);
    expect(validateBlocks([cool('06:00', 'A', 78), cool('06:00', 'B', 79)])).not.toHaveLength(0);
    expect(
      validateBlocks([{ time: '06:00', name: 'X', mode: 'heat_cool', cool_temp: 66, heat_temp: 84 }]),
    ).not.toHaveLength(0);
    expect(
      validateBlocks([{ time: '06:00', name: 'X', mode: 'heat_cool', cool_temp: 84, heat_temp: null }]),
    ).not.toHaveLength(0);
  });

  it('accepts the seed schedules', () => {
    expect(validateBlocks(UP_SUMMER_WD)).toHaveLength(0);
  });
});

describe('buildWeeklySchedule', () => {
  it('maps wdwe sets onto the right days', () => {
    const week = buildWeeklySchedule('wdwe', {
      wd: UP_SUMMER_WD,
      we: [cool('07:30', 'Wake', 78), cool('21:30', 'Sleep', 76)],
    });
    expect(week.monday).toHaveLength(7);
    expect(week.saturday).toHaveLength(3);
    expect(week.sunday).toEqual(week.saturday);
    for (const day of ALL_DAYS) expect(week[day]).toBeDefined();
  });

  it('rejects incomplete coverage', () => {
    expect(() => buildWeeklySchedule('wdwe', { wd: UP_SUMMER_WD })).toThrow(/saturday/i);
  });
});

describe('transitionSets (CONTRACT §2)', () => {
  const wdwe = { wd: UP_SUMMER_WD, we: [cool('07:30', 'Wake', 78)] };

  it('expands by cloning (all→wdwe, wdwe→days)', () => {
    const expanded = transitionSets('all', 'wdwe', { all: UP_SUMMER_WD });
    expect(expanded.wd).toEqual(UP_SUMMER_WD);
    expect(expanded.we).toEqual(UP_SUMMER_WD);
    expect(expanded.wd).not.toBe(UP_SUMMER_WD); // deep-cloned, not shared

    const days = transitionSets('wdwe', 'days', wdwe);
    expect(days.tuesday).toEqual(UP_SUMMER_WD);
    expect(days.sunday).toEqual(wdwe.we);
  });

  it('collapses to the survivor set (days→wdwe uses mon/sat, →all uses wd/mon)', () => {
    const days = transitionSets('wdwe', 'days', wdwe);
    const back = transitionSets('days', 'wdwe', days);
    expect(back.wd).toEqual(UP_SUMMER_WD);
    expect(back.we).toEqual(wdwe.we);
    expect(transitionSets('wdwe', 'all', wdwe).all).toEqual(UP_SUMMER_WD);
  });

  it('round-trips all→days→all unchanged', () => {
    const there = transitionSets('all', 'days', { all: UP_SUMMER_WD });
    const back = transitionSets('days', 'all', there);
    expect(back.all).toEqual(UP_SUMMER_WD);
  });
});

describe('granularity switching is non-destructive (live bug)', () => {
  // Reported: switching weekday/weekend -> individual days copied the WEEKDAY
  // schedule onto Saturday and Sunday, losing the stored weekend. It happened
  // only when an earlier, unsaved granularity switch was still in effect - the
  // clone from that switch became the source for the next one. Discarding and
  // retrying worked, which is what made it look intermittent.
  const wd: ScheduleBlock[] = [
    { time: '06:00', name: 'Wake', mode: 'cool', cool_temp: 78, heat_temp: null },
    { time: '21:30', name: 'Sleep', mode: 'cool', cool_temp: 76, heat_temp: null },
  ];
  const we: ScheduleBlock[] = [
    { time: '07:30', name: 'Wake', mode: 'cool', cool_temp: 79, heat_temp: null },
    { time: '22:30', name: 'Sleep', mode: 'cool', cool_temp: 77, heat_temp: null },
  ];

  it('wdwe -> days keeps the weekend distinct from the weekdays', () => {
    const out = transitionSets('wdwe', 'days', { wd, we });
    expect(out.monday).toEqual(wd);
    expect(out.friday).toEqual(wd);
    expect(out.saturday).toEqual(we);
    expect(out.sunday).toEqual(we);
    expect(out.saturday).not.toEqual(out.monday);
  });

  it('chaining through a collapse is what destroyed the weekend', () => {
    // This is the mechanism, asserted so the reasoning stays visible: chaining
    // clone-onto-clone is lossy BY DESIGN, which is why the card must always
    // transition from the STORED week rather than from the previous switch.
    const collapsed = transitionSets('wdwe', 'all', { wd, we });
    const chained = transitionSets('all', 'days', collapsed);
    expect(chained.saturday).toEqual(chained.monday);

    // Transitioning from the stored week instead preserves it.
    const fromStored = transitionSets('wdwe', 'days', { wd, we });
    expect(fromStored.saturday).not.toEqual(fromStored.monday);
  });
});
