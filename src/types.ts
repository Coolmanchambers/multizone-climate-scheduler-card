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
     * Omitted = 'eco' (the original behavior); a string names a
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

/**
 * Normalize a raw card config to the shape the rest of the card consumes.
 *
 * THE single normalization boundary (docs/config-compatibility.md, rule R1).
 * Every historical config shape is accepted here and nowhere else; read sites
 * consume the normalized result. Pure and Lit-free so it is directly testable -
 * tests run in a node environment and cannot import the card element.
 *
 * Tolerant by design (QA-R C2-2/C2-3): an incomplete config - empty zones, a
 * zone still being picked in the editor, a missing name, a scalar fan_timer -
 * must render a helpful placeholder rather than brick the card or its preview.
 * Only structurally hopeless configs throw.
 */
export function normalizeCardConfig(config: MzcsCardConfig): MzcsCardConfig {
  if (!config || !Array.isArray(config.zones ?? [])) {
    throw new Error('zones must be a list of { entity, name } items.');
  }
  const rawZones = config.zones ?? [];
  if (rawZones.length > 4) throw new Error('A maximum of 4 zones is supported.');
  const zones = rawZones.map((z) => ({
    ...z,
    name:
      typeof z.name === 'string' && z.name.trim()
        ? z.name
        : z.entity
          ? z.entity.split('.')[1]!.replace(/_/g, ' ')
          : 'Zone',
  }));
  // fan_timer was a scalar minute count before it became a list of presets.
  const ft = config.features?.fan_timer as unknown;
  const features = config.features
    ? {
        ...config.features,
        fan_timer: Array.isArray(ft) ? (ft as number[]) : typeof ft === 'number' ? [ft] : undefined,
      }
    : undefined;
  return { ...config, zones, ...(features ? { features } : {}) };
}
