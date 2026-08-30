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
  | 'applied_block_marker'
  | 'zone_enabled'
  | 'k_factor';

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
  | 'next_block_sensor'
  | 'outdoor_temp_sensor'
  | 'outdoor_daily_mean'
  | 'theme';

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
  zone_enabled: { domain: 'input_boolean', suffix: 'enabled' },
  k_factor: { domain: 'input_number', suffix: 'k' },
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
  outdoor_temp_sensor: { domain: 'sensor', suffix: 'outdoor_temp' },
  outdoor_daily_mean: { domain: 'sensor', suffix: 'outdoor_daily_mean' },
  theme: { domain: 'input_text', suffix: 'theme' },
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

/**
 * Which season key the schedule drawer should look under, given the display
 * name the season selector is currently holding.
 *
 * The selector's options are season NAMES; every provisioned schedule id
 * carries the season KEY. Resolving one to the other has to reproduce what the
 * id template did, and the template embeds `String(key)` - so a season with a
 * missing key provisioned `..._undefined` and one with a null key provisioned
 * `..._null`. Those installs are ones this card deliberately keeps provisioning
 * (round 3, option c), so their schedule row has to find them.
 *
 * Measured before this existed: a single keyless season named "Summer"
 * provisioned `schedule.<prefix>_<zone>_undefined` while the card looked for
 * `..._summer`, leaving the row permanently dead on an install that otherwise
 * converges to all-Unchanged.
 *
 * The name-slug fallback is kept for the case it was actually written for: a
 * selector holding a name that matches no configured season.
 */
export function resolveSeasonKey(
  seasons: ReadonlyArray<{ name?: unknown; key?: unknown }> | undefined,
  selectState: string,
): string {
  const match = seasons?.find((s) => s?.name === selectState);
  return match ? String(match.key) : slugify(selectState);
}

export function globalEntityId(cls: GlobalClass, prefix: string): string {
  const def = GLOBAL_CLASS_DEFS[cls];
  return `${def.domain}.${prefix}_${def.suffix}`;
}

export function automationUniqueId(prefix: string, key: string): string {
  return `${prefix}_mzcs_${key}`;
}

/**
 * entity_id HA derives for a generated automation, from its alias. Callers must
 * use this rather than assembling the id: a hand-built id silently diverges
 * from the aliases the executor labels and the card watches (live QA).
 */
export function automationEntityId(prefix: string, key: string, zoneName?: string): string {
  const slug = automationAlias(prefix, key, zoneName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `automation.${slug}`;
}

/**
 * Aliases are PREFIX-SCOPED: a second card instance (different prefix) on the
 * same HA must not collide friendly names, and the watchdog derives its target
 * engine entity_id from the alias - an unscoped alias would make every
 * instance's watchdog watch the first instance's engine. For the default
 * prefix 'climate' the output matches the historical 'Climate: ...' aliases.
 */
export function automationAlias(prefix: string, key: string, zoneName?: string): string {
  const label = prefix.charAt(0).toUpperCase() + prefix.slice(1);
  const names: Record<string, string> = {
    engine: `${label}: schedule engine`,
    fan_timer: `${label}: ${zoneName ?? '?'} fan timer finished`,
    season_recommender: `${label}: season recommender`,
    runtime_alert: `${label}: runtime anomaly alert`,
    runtime_learning: `${label}: runtime learning`,
    watchdog: `${label}: engine watchdog`,
    steering: `${label}: comfort steering`,
  };
  return names[key] ?? `${label}: ${key}`;
}

// Hoisted once: parseEntityId runs per entity across full hass.states scans
// (~3,400 entities live), and per-call Object.entries allocation adds up.
const GLOBAL_CLASS_ENTRIES = Object.entries(GLOBAL_CLASS_DEFS) as Array<
  [GlobalClass, { domain: string; suffix: string }]
>;
const ZONE_CLASS_ENTRIES = Object.entries(ZONE_CLASS_DEFS) as Array<
  [ZoneClass, { domain: string; suffix: string }]
>;

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

  for (const [cls, def] of GLOBAL_CLASS_ENTRIES) {
    if (domain === def.domain && rest === def.suffix) return { cls };
  }

  // Zone-scoped: match longest zone slug first, so a zone whose slug prefixes
  // another ("office" vs "office_annex") cannot swallow the longer one's ids.
  const sortedZones = [...zones].sort((a, b) => b.length - a.length);
  for (const zone of sortedZones) {
    if (rest !== zone && !rest.startsWith(`${zone}_`)) continue;
    const tail = rest.slice(zone.length + 1);
    for (const [cls, def] of ZONE_CLASS_ENTRIES) {
      if (domain === def.domain && tail === def.suffix) return { cls, zone };
    }
    if (domain === 'schedule' && seasons.includes(tail)) {
      return { cls: 'zone_schedule', zone, season: tail };
    }
  }
  return null;
}
