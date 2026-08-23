// Weather-normalized runtime verdict (spec §8.1 / §11.5). Pure.
// expectedFullDay comes from the k x CDD template sensor; today's runtime is
// compared against the day-fraction-scaled expectation with the alert margin.

export type VerdictStatus = 'learning' | 'pending' | 'normal' | 'high';

export interface Verdict {
  status: VerdictStatus;
  label: string;
}

export function computeVerdict(
  todayHours: number,
  expectedFullDayHours: number,
  marginPct: number,
  hoursElapsed: number,
): Verdict {
  if (!Number.isFinite(expectedFullDayHours) || expectedFullDayHours <= 0) {
    return { status: 'learning', label: 'learning' };
  }
  if (hoursElapsed < 6) {
    return { status: 'pending', label: '' };
  }
  const paceExpected = expectedFullDayHours * (Math.min(hoursElapsed, 24) / 24);
  const threshold = paceExpected * (1 + marginPct / 100);
  // Require a real exceedance (not sub-hour noise) before calling it high.
  if (todayHours > threshold && todayHours - paceExpected > 0.5) {
    return { status: 'high', label: 'running high for the weather' };
  }
  return { status: 'normal', label: 'normal for the weather' };
}
