// Naming contract (CONTRACT.md §4-§7b): pure functions, no Lit/hass imports.
// Every provisioned object's entity_id is generated AND parsed here - nothing else
// in the codebase may hand-assemble an id.

export type ZoneClass =
  | 'fan_timer'
  | 'room_override_timer'
  | 'running_sensor'
  | 'runtime_today'
  | 'expected_runtime'
  | 'target_room_select'
  | 'sensor_schedule'
  | 'applied_block_marker';

export type GlobalClass =
  | 'season_select'
  | 'season_mode'
  | 'season_confirm_days'
  | 'season_dwell_days'
  | 'dev_green_max'
  | 'dev_amber_max'
  | 'runtime_alert_margin'
  | 'runtime_alert_days'
  | 'runtime_learn_days'
  | 'cdd_base'
  | 'override_minutes'
  | 'steer_min_setpoint'
  | 'steer_max_setpoint'
  | 'steer_max_offset'
  | 'next_block_sensor';

export type ObjectClass = ZoneClass | GlobalClass | 'zone_schedule';

export interface ParsedId {
  cls: ObjectClass;
  zone?: string;
  season?: string;
}

const ZONE_CLASS_DEFS: Record<ZoneClass, { domain: string; suffix: string }> = {
  fan_timer: { domain: 'timer', suffix: 'fan' },
  room_override_timer: { domain: 'timer', suffix: 'room_override' },
  running_sensor: { domain: 'binary_sensor', suffix: 'running' },
  runtime_today: { domain: 'sensor', suffix: 'runtime_today' },
  expected_runtime: { domain: 'sensor', suffix: 'expected_runtime' },
  target_room_select: { domain: 'input_select', suffix: 'target_room' },
  sensor_schedule: { domain: 'schedule', suffix: 'sensor_schedule' },
  applied_block_marker: { domain: 'input_text', suffix: 'applied_block' },
};

const GLOBAL_CLASS_DEFS: Record<GlobalClass, { domain: string; suffix: string }> = {
  season_select: { domain: 'input_select', suffix: 'season' },
  season_mode: { domain: 'input_select', suffix: 'season_mode' },
  season_confirm_days: { domain: 'input_number', suffix: 'season_confirm_days' },
  season_dwell_days: { domain: 'input_number', suffix: 'season_dwell_days' },
  dev_green_max: { domain: 'input_number', suffix: 'dev_green_max' },
  dev_amber_max: { domain: 'input_number', suffix: 'dev_amber_max' },
  runtime_alert_margin: { domain: 'input_number', suffix: 'runtime_alert_margin' },
  runtime_alert_days: { domain: 'input_number', suffix: 'runtime_alert_days' },
  runtime_learn_days: { domain: 'input_number', suffix: 'runtime_learn_days' },
  cdd_base: { domain: 'input_number', suffix: 'cdd_base' },
  override_minutes: { domain: 'input_number', suffix: 'override_minutes' },
  steer_min_setpoint: { domain: 'input_number', suffix: 'steer_min_setpoint' },
  steer_max_setpoint: { domain: 'input_number', suffix: 'steer_max_setpoint' },
  steer_max_offset: { domain: 'input_number', suffix: 'steer_max_offset' },
  next_block_sensor: { domain: 'sensor', suffix: 'next_block' },
};

// Suffixes that may never be used as a season key or collide with a zone-class
// suffix; the wizard validates user-chosen zone/season names against these.
export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  ...Object.values(ZONE_CLASS_DEFS).map((d) => d.suffix),
  ...Object.values(GLOBAL_CLASS_DEFS).map((d) => d.suffix),
]);

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function zoneEntityId(cls: ZoneClass, prefix: string, zone: string): string {
  const def = ZONE_CLASS_DEFS[cls];
  return `${def.domain}.${prefix}_${zone}_${def.suffix}`;
}

export function zoneScheduleId(prefix: string, zone: string, season: string): string {
  return `schedule.${prefix}_${zone}_${season}`;
}

export function globalEntityId(cls: GlobalClass, prefix: string): string {
  const def = GLOBAL_CLASS_DEFS[cls];
  return `${def.domain}.${prefix}_${def.suffix}`;
}

export function automationUniqueId(prefix: string, key: string): string {
  return `${prefix}_mzcs_${key}`;
}

export function automationAlias(key: string, zoneName?: string): string {
  const names: Record<string, string> = {
    engine: 'Climate: schedule engine',
    fan_timer: `Climate: ${zoneName ?? '?'} fan timer finished`,
    season_recommender: 'Climate: season recommender',
    runtime_alert: 'Climate: runtime anomaly alert',
    watchdog: 'Climate: engine watchdog',
    steering: 'Climate: comfort steering',
  };
  return names[key] ?? `Climate: ${key}`;
}

/**
 * Parse an entity_id back to its object class. Requires the configured zone slugs
 * and season keys, since zone slugs may contain underscores. Returns null for
 * anything that is not an MZCS-provisioned id under this prefix.
 */
export function parseEntityId(
  entityId: string,
  prefix: string,
  zones: string[],
  seasons: string[],
): ParsedId | null {
  const dot = entityId.indexOf('.');
  if (dot < 0) return null;
  const domain = entityId.slice(0, dot);
  const object = entityId.slice(dot + 1);
  if (object !== prefix && !object.startsWith(`${prefix}_`)) return null;
  const rest = object.slice(prefix.length + 1);

  for (const [cls, def] of Object.entries(GLOBAL_CLASS_DEFS) as Array<
    [GlobalClass, { domain: string; suffix: string }]
  >) {
    if (domain === def.domain && rest === def.suffix) return { cls };
  }

  // Zone-scoped: match longest zone slug first so "owners_office" beats "tims".
  const sortedZones = [...zones].sort((a, b) => b.length - a.length);
  for (const zone of sortedZones) {
    if (rest !== zone && !rest.startsWith(`${zone}_`)) continue;
    const tail = rest.slice(zone.length + 1);
    for (const [cls, def] of Object.entries(ZONE_CLASS_DEFS) as Array<
      [ZoneClass, { domain: string; suffix: string }]
    >) {
      if (domain === def.domain && tail === def.suffix) return { cls, zone };
    }
    if (domain === 'schedule' && seasons.includes(tail)) {
      return { cls: 'zone_schedule', zone, season: tail };
    }
  }
  return null;
}
