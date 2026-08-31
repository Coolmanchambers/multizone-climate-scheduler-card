export type SeasonSwitchMode = 'manual' | 'semi' | 'full';
export type DayGranularity = 'all' | 'wdwe' | 'days';
export type BlockMode = 'cool' | 'heat' | 'heat_cool' | 'off';

export interface RoomSensorConfig {
  entity: string;
  /** label shown on the card; falls back to the entity's friendly name */
  name?: string;
  /**
   * Optional timestamp entity carrying when the device last actually spoke
   * (item 36) - e.g. a Zigbee2MQTT `_last_seen` sibling. When configured it
   * takes precedence over `last_reported` for the stale gate and is the ONLY
   * source the age label will state as a time. Absent means exactly today's
   * behaviour: gate from `last_reported`, no age shown, nothing to configure.
   */
  last_seen?: string;
}

/** Normalize the mixed shorthand/object form to objects. */
export function normalizeRoomSensors(
  list?: Array<string | RoomSensorConfig>,
): RoomSensorConfig[] {
  return (list ?? [])
    .map((s) => (typeof s === 'string' ? { entity: s } : s))
    .filter((s): s is RoomSensorConfig => !!s && typeof s.entity === 'string' && s.entity !== '')
    .map((s) => {
      // last_seen degrades SILENTLY (item 36 non-negotiable 6). The boundary
      // strips non-string shapes, blanks, and absurd lengths (a real entity id
      // is well under 256 chars; an unbounded string would ride the render
      // gate's hottest memo path), and trims the rest. A trimmed string that
      // names no real entity still passes - it degrades at read time, where
      // the adapter falls back exactly as for a dead companion.
      const raw = s.last_seen;
      if (!('last_seen' in s)) return s;
      if (typeof raw === 'string' && raw.trim() && raw.length <= 255) {
        const trimmed = raw.trim();
        return trimmed === raw ? s : { ...s, last_seen: trimmed };
      }
      const { last_seen: _drop, ...rest } = s;
      return rest;
    });
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

/**
 * The tidiest storable form of a room-sensor row: a bare string when only the
 * entity is set, an object carrying EVERY optional field otherwise. The editor
 * rebuilds rows in two places; both must go through this or a field silently
 * vanishes on the next unrelated edit (the item-36 `last_seen` trap).
 */
export function tidyRoomSensorRow(rs: RoomSensorConfig): string | RoomSensorConfig {
  const out: RoomSensorConfig = { entity: rs.entity };
  if (rs.name?.trim()) out.name = rs.name;
  if (typeof rs.last_seen === 'string' && rs.last_seen.trim()) out.last_seen = rs.last_seen;
  return out.name || out.last_seen ? out : rs.entity;
}

/** How the room rows show a configured last-seen companion's age (item 36). */
export type LastSeenMode = 'off' | 'always' | 'ageing';

/**
 * Presentation-only settings (items 36 + 12). Deliberately a separate top-level
 * block, NOT under `features`: `features` keys feed the provisioning engine and
 * its variant matrix, and nothing in here may ever reach a generator. The
 * compat tests pin that with a buildDesired/signature equality case.
 */
export interface DisplayConfig {
  /**
   * Age label on room rows that have a `last_seen` companion. 'always' shows it
   * on every such row, 'ageing' only past the ageing threshold, 'off' never.
   * Default: 'always' (maintainer decision, 2026-08-30). Rows without a
   * companion never show an age regardless of this setting.
   */
  last_seen?: LastSeenMode;
  /** Minutes before an age counts as ageing (drives 'ageing' mode). Default: 45. */
  ageing_minutes?: number;
  /**
   * Hours without a report before a reading is treated as stale (item 12 -
   * previously the hard-coded 3h ROOM_STALE_MS). Default: 3.
   */
  stale_hours?: number;
}

export interface ResolvedDisplay {
  lastSeen: LastSeenMode;
  ageingMs: number;
  staleMs: number;
}

/** The stale gate's original hard-coded threshold; still the default (item 12). */
export const DEFAULT_STALE_HOURS = 3;
export const DEFAULT_AGEING_MINUTES = 45;

/**
 * Resolve the display block to what read sites consume. Absent, partial and
 * junk shapes all resolve to the previous behaviour exactly (policy R1).
 */
export function resolveDisplay(display?: DisplayConfig): ResolvedDisplay {
  const mode = display?.last_seen;
  const ageing = Number(display?.ageing_minutes);
  const stale = Number(display?.stale_hours);
  return {
    lastSeen: mode === 'off' || mode === 'ageing' || mode === 'always' ? mode : 'always',
    ageingMs: Number.isFinite(ageing) && ageing > 0 ? ageing * 60_000 : DEFAULT_AGEING_MINUTES * 60_000,
    staleMs: Number.isFinite(stale) && stale > 0 ? stale * 3_600_000 : DEFAULT_STALE_HOURS * 3_600_000,
  };
}

export interface MzcsCardConfig {
  type: string;
  prefix?: string;
  zones: ZoneConfig[];
  seasons?: SeasonConfig[];
  season_switch?: SeasonSwitchMode;
  weather_entity?: string;
  display?: DisplayConfig;
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
