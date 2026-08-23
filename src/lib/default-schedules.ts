// Placeholder seed schedules for the dry-run preview (S5b). The wizard's block
// editor (S6+) replaces these with user-authored blocks; until then desired
// schedules are a deterministic single-block day per season.
import type { SeasonConfig } from '../types';
import type { ScheduleSet } from './provisioning';

export function defaultScheduleSet(season: SeasonConfig): ScheduleSet {
  const m = season.default_mode;
  const block = {
    time: '06:00',
    name: 'Day',
    mode: m,
    cool_temp: m === 'heat' ? null : m === 'heat_cool' ? 84 : 78,
    heat_temp: m === 'heat' ? 68 : m === 'heat_cool' ? 66 : null,
  };
  return { granularity: 'all', sets: { all: [block] } };
}

export function defaultSchedules(
  zoneSlugs: string[],
  seasons: SeasonConfig[],
): Record<string, Record<string, ScheduleSet>> {
  const out: Record<string, Record<string, ScheduleSet>> = {};
  for (const z of zoneSlugs) {
    out[z] = {};
    for (const s of seasons) out[z][s.key] = defaultScheduleSet(s);
  }
  return out;
}
