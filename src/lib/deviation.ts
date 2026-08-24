// Room deviation badges (spec §11.5): |room - setpoint| → green/amber/red.
// Thresholds come from helpers at runtime with contract defaults as fallback.

export type DevColor = 'green' | 'amber' | 'red';

export const DEFAULT_GREEN_MAX = 2;
export const DEFAULT_AMBER_MAX = 4;

export function deviationColor(
  delta: number,
  greenMax: number = DEFAULT_GREEN_MAX,
  amberMax: number = DEFAULT_AMBER_MAX,
): DevColor {
  const a = Math.abs(delta);
  if (a <= greenMax) return 'green';
  if (a <= amberMax) return 'amber';
  return 'red';
}

/**
 * Room temperature for display. Sensors report at their own precision - Zigbee
 * ones commonly send 3 decimals (82.832) - which is noise in a comfort readout.
 * One decimal, and a whole number stays whole.
 */
export function formatRoomTemp(temp: number): string {
  const r = Math.round(temp * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}

export function formatDelta(delta: number): string {
  const rounded = Math.round(delta);
  return `${rounded > 0 ? '+' : ''}${rounded}°`;
}

/** Sanitize helper-sourced thresholds: amber must exceed green, both positive. */
export function sanitizeThresholds(
  green: number | null,
  amber: number | null,
): { greenMax: number; amberMax: number } {
  let g = green != null && green > 0 ? green : DEFAULT_GREEN_MAX;
  let a = amber != null && amber > 0 ? amber : DEFAULT_AMBER_MAX;
  if (a <= g) a = g + 1;
  return { greenMax: g, amberMax: a };
}
