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
  /**
   * Item 29: a power sensor (W) for this zone's equipment. When set, the
   * PROVISIONED running sensor is generated as an OR of "drawing more than
   * 100W" and "hvac active with the room >= 1° past setpoint" instead of the
   * hvac_action template - for brands (e.g. SmartThings mini-splits) that
   * never expose hvac_action, where power alone stalls for hours and the
   * delta alone misses steady-state duty cycling (both measured live). Both
   * failing together undercounts - the fail-safe direction. Absent = the
   * hvac_action template, exactly as before. Applies at CREATION: an already
   * provisioned running sensor keeps its template until deliberately
   * recreated (template bodies are never compared or overwritten).
   */
  power_entity?: string;
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
    /**
     * Off-peak comfort (item 7): a binary_sensor/input_boolean that is ON when
     * today is off-peak. Omitted = feature off (the pre-0.7.5 behavior). The
     * card never reads calendars or weekday rules itself - all day judgement
     * lives in the user's own entity.
     */
    off_peak_entity?: string;
    /**
     * SEED for the provisioned off-peak offset helper (degrees of extra
     * comfort), default 2. The engine reads the HELPER at runtime, so tuning
     * it later never re-provisions; this value only matters at creation.
     */
    off_peak_offset?: number;
    /**
     * Comfort steering (item 8): drive a zone's thermostat so a selected ROOM
     * reaches the override target while the room-override timer runs. Omitted
     * = off (the pre-0.7.5 behavior). v1 is cool-only.
     */
    steering?: boolean;
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
 * Resolve the off-peak comfort settings (item 7): the entity that says "today
 * is off-peak" plus the creation-time seed for the offset helper, or null when
 * the feature is off. Absent/blank entity = off, exactly the previous
 * behavior (compat R3).
 */
export function resolveOffPeak(features?: {
  off_peak_entity?: string;
  off_peak_offset?: number;
}): { entity: string; offsetSeed: number } | null {
  const e = features?.off_peak_entity;
  if (typeof e !== 'string' || !e.trim()) return null;
  const o = features?.off_peak_offset;
  // Clamped into the helper's own 0-10 range AND rounded to its step of 1, so
  // the creation-time seed can never fail input_number.set_value.
  const offsetSeed = typeof o === 'number' && Number.isFinite(o) ? Math.round(Math.min(10, Math.max(0, o))) : 2;
  return { entity: e.trim(), offsetSeed };
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
  // Shapes that pass here but throw inside render/shouldUpdate leave a blank
  // card (and an editor that cannot open) instead of HA's config-error card
  // (0.7.7 review C6). None of these ever provisioned, so refusing is R3-safe.
  if (config.seasons !== undefined && !Array.isArray(config.seasons)) {
    throw new Error('seasons must be a list of { key, name, default_mode } items.');
  }
  if (Array.isArray(config.seasons) && config.seasons.some((s) => !s || typeof s !== 'object')) {
    throw new Error('Every seasons entry must be a { key, name, default_mode } item (an empty "-" is not one).');
  }
  rawZones.forEach((z, i) => {
    if (!z || typeof z !== 'object') throw new Error(`Zone ${i + 1} must be a { entity, name } item.`);
    if (z.room_sensors !== undefined && !Array.isArray(z.room_sensors)) {
      throw new Error(`Zone ${i + 1}: room_sensors must be a list of sensor entity ids (one per line with a leading "-").`);
    }
  });
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
