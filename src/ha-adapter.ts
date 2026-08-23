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
