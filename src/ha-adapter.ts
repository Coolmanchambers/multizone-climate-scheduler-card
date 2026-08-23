// The ONLY module allowed to interpret HA entity shapes (CONTRACT / plan risk #1).
import type { HassLike } from './ha-types';

export interface ClimateSummary {
  available: boolean;
  mode: string; // hvac state: cool/heat/heat_cool/off
  action: string; // hvac_action: cooling/heating/idle/off
  setpoint: number | null; // single-target modes
  targetLow: number | null;
  targetHigh: number | null;
  inside: number | null;
  humidity: number | null;
}

export function climateSummary(hass: HassLike, entityId: string): ClimateSummary {
  const e = hass.states[entityId];
  if (!e || e.state === 'unavailable' || e.state === 'unknown') {
    return {
      available: false,
      mode: 'unavailable',
      action: '',
      setpoint: null,
      targetLow: null,
      targetHigh: null,
      inside: null,
      humidity: null,
    };
  }
  const a = e.attributes;
  const num = (v: unknown): number | null => (typeof v === 'number' ? v : null);
  return {
    available: true,
    mode: e.state,
    action: typeof a.hvac_action === 'string' ? a.hvac_action : '',
    setpoint: num(a.temperature),
    targetLow: num(a.target_temp_low),
    targetHigh: num(a.target_temp_high),
    inside: num(a.current_temperature),
    humidity: num(a.current_humidity),
  };
}

export function fanTimerActive(hass: HassLike, timerEntityId: string): boolean {
  return hass.states[timerEntityId]?.state === 'active';
}

export function entityExists(hass: HassLike, entityId: string): boolean {
  return hass.states[entityId] !== undefined;
}

export function hvacModes(hass: HassLike, entityId: string): string[] {
  const m = hass.states[entityId]?.attributes.hvac_modes;
  return Array.isArray(m) ? m.filter((x): x is string => typeof x === 'string') : [];
}

export function ecoSupported(hass: HassLike, entityId: string): boolean {
  const p = hass.states[entityId]?.attributes.preset_modes;
  return Array.isArray(p) && p.includes('eco');
}

export function ecoActive(hass: HassLike, entityId: string): boolean {
  return hass.states[entityId]?.attributes.preset_mode === 'eco';
}

export function numberHelperValue(hass: HassLike, entityId: string): number | null {
  const e = hass.states[entityId];
  if (!e) return null;
  const v = Number(e.state);
  return Number.isFinite(v) ? v : null;
}

export interface RoomReading {
  entityId: string;
  name: string;
  temp: number | null;
}

export function roomReading(hass: HassLike, entityId: string): RoomReading {
  const e = hass.states[entityId];
  const name =
    typeof e?.attributes.friendly_name === 'string'
      ? e.attributes.friendly_name.replace(/ (Temperature|temperature)$/, '')
      : entityId.split('.')[1] ?? entityId;
  const v = e ? Number(e.state) : NaN;
  return { entityId, name, temp: Number.isFinite(v) ? v : null };
}

export function setHvacMode(hass: HassLike, entityId: string, mode: string): Promise<unknown> {
  return hass.callService('climate', 'set_hvac_mode', { entity_id: entityId, hvac_mode: mode });
}

export function setEco(hass: HassLike, entityId: string, on: boolean): Promise<unknown> {
  return hass.callService('climate', 'set_preset_mode', {
    entity_id: entityId,
    preset_mode: on ? 'eco' : 'none',
  });
}

export function startFanTimer(
  hass: HassLike,
  timerEntityId: string,
  minutes: number,
): Promise<unknown> {
  const mm = String(minutes % 60).padStart(2, '0');
  const hh = String(Math.floor(minutes / 60)).padStart(2, '0');
  return hass.callService('timer', 'start', {
    entity_id: timerEntityId,
    duration: `${hh}:${mm}:00`,
  });
}

/**
 * Clamp a target setpoint to the entity's min/max ONLY when those bounds are
 * plausible for the current setpoint's unit. Real-world quirk this guards:
 * SmartThings mini-splits report min_temp/max_temp in Celsius (7/35) while
 * temperatures are Fahrenheit - naive clamping would slam 78°F down to 35.
 */
export function clampSetpoint(
  target: number,
  current: number | null,
  min: unknown,
  max: unknown,
): number {
  const lo = typeof min === 'number' ? min : null;
  const hi = typeof max === 'number' ? max : null;
  const boundsPlausible =
    lo != null && hi != null && lo < hi && current != null && current >= lo && current <= hi;
  if (!boundsPlausible) return target;
  return Math.min(hi, Math.max(lo, target));
}

export function setTemperature(
  hass: HassLike,
  entityId: string,
  temp: number,
): Promise<unknown> {
  return hass.callService('climate', 'set_temperature', {
    entity_id: entityId,
    temperature: temp,
  });
}
