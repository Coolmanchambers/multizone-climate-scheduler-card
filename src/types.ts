export type SeasonSwitchMode = 'manual' | 'semi' | 'full';
export type DayGranularity = 'all' | 'wdwe' | 'days';
export type BlockMode = 'cool' | 'heat' | 'heat_cool' | 'off';

export interface RoomSensorConfig {
  entity: string;
  /** label shown on the card; falls back to the entity's friendly name */
  name?: string;
}

/** Normalize the mixed shorthand/object form to objects. */
export function normalizeRoomSensors(
  list?: Array<string | RoomSensorConfig>,
): RoomSensorConfig[] {
  return (list ?? [])
    .map((s) => (typeof s === 'string' ? { entity: s } : s))
    .filter((s): s is RoomSensorConfig => !!s && typeof s.entity === 'string' && s.entity !== '');
}

export interface ZoneConfig {
  entity: string;
  name: string;
  /**
   * Room temperature sensors. Either a bare entity id, or the standard
   * `{ entity, name }` row form when you want a different label on the card
   * than the entity's own friendly name.
   */
  room_sensors?: Array<string | RoomSensorConfig>;
}

export interface SeasonConfig {
  key: string;
  name: string;
  default_mode: BlockMode;
}

export interface MzcsCardConfig {
  type: string;
  prefix?: string;
  zones: ZoneConfig[];
  seasons?: SeasonConfig[];
  season_switch?: SeasonSwitchMode;
  weather_entity?: string;
  features?: {
    fan_timer?: number[];
    anomaly_alerts?: boolean;
    /** helper entity the fan-off automations must respect (skip while 'on') */
    fan_guard?: string;
    /**
     * Thermostat preset that makes the engine stand down for a zone.
     * Omitted = 'eco' (the pre-0.9.1 behavior); a string names a
     * different preset (e.g. 'away'); false disables the stand-down entirely
     * so Home Assistant owns standby behavior.
     */
    eco_preset?: string | false;
  };
}

/**
 * Resolve the standby-preset setting to what the engine/UI consume:
 * a preset name, or null when the stand-down is disabled.
 */
export function resolveEcoPreset(features?: { eco_preset?: string | false }): string | null {
  const v = features?.eco_preset;
  if (v === false) return null;
  if (typeof v === 'string' && v.trim()) return v.trim();
  return 'eco';
}
