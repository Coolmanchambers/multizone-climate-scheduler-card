import type { MzcsCardConfig } from '../types';
import { normalizeRoomSensors, resolveEcoPreset } from '../types';

/**
 * The diagnostics blob users paste into a public GitHub issue.
 *
 * It is redacted by default, and that default is not politeness: entity ids are
 * a fingerprint of somebody's home, and zone/room labels are frequently the
 * names of the people who sleep in them. A support artifact that has to be
 * sanitised by hand before sharing is one that gets shared unsanitised.
 *
 * The redacted form keeps everything a maintainer actually reasons about -
 * versions, structure, counts, which options are set, what the last plan did -
 * and drops only the identifiers. Turning identifiers on is a deliberate,
 * separate act for the cases that genuinely need them (a naming or adoption
 * bug), and the UI shows the text before it is copied so the choice is informed.
 */

export interface DiagnosticsPlanCounts {
  create: number;
  adopt: number;
  update: number;
  delete: number;
  noop: number;
}

export interface DiagnosticsInput {
  cardVersion: string;
  haVersion?: string;
  userAgent?: string;
  config: MzcsCardConfig;
  /** Counts from the last dry-run, or null when none has been run this session. */
  plan?: DiagnosticsPlanCounts | null;
  planKind?: 'setup' | 'teardown';
  /** Statuses from the Objects tab, or null when it has not been loaded. */
  objectStatuses?: string[] | null;
  /** Per-zone scheduling switch states, keyed by zone name. */
  zoneEnabled?: Array<{ zone: string; state: string }>;
  activeSeason?: string;
  /** Include real entity ids and names. Default false. */
  identifiers?: boolean;
}

const DEFAULT_PREFIX = 'climate';

function countBy(values: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const v of values) out[v] = (out[v] ?? 0) + 1;
  return out;
}

/**
 * A prefix is usually the default or something generic, but it is user-chosen
 * and occasionally personal - and it is also the one field whose *value* rarely
 * matters to a diagnosis, only whether it was changed.
 */
function describePrefix(prefix: string, identifiers: boolean): string {
  if (identifiers) return prefix;
  return prefix === DEFAULT_PREFIX ? DEFAULT_PREFIX : '<custom>';
}

export function buildDiagnostics(input: DiagnosticsInput): string {
  const ids = input.identifiers === true;
  const cfg = input.config;
  const prefix = (cfg.prefix ?? DEFAULT_PREFIX).trim() || DEFAULT_PREFIX;
  const seasons = cfg.seasons ?? [];
  const features = cfg.features ?? {};

  const zones = (cfg.zones ?? []).map((z, i) => {
    const rooms = normalizeRoomSensors(z.room_sensors);
    return {
      name: ids ? z.name : `Zone ${i + 1}`,
      climate: ids ? z.entity : `climate.<zone_${i + 1}>`,
      room_sensors: ids
        ? rooms.map((r) => (r.name ? { entity: r.entity, name: r.name } : { entity: r.entity }))
        : rooms.map((_, j) => ({ entity: `sensor.<zone_${i + 1}_room_${j + 1}>` })),
      room_sensor_count: rooms.length,
      /** How many rooms carry an explicit label - a labelling bug shows up here. */
      room_sensors_labelled: rooms.filter((r) => !!r.name?.trim()).length,
    };
  });

  const enabled = (input.zoneEnabled ?? []).map((z, i) => ({
    zone: ids ? z.zone : `Zone ${i + 1}`,
    scheduling: z.state,
  }));

  const out: Record<string, unknown> = {
    card_version: input.cardVersion,
    ha_version: input.haVersion ?? 'unknown',
    identifiers_included: ids,
    user_agent: input.userAgent ?? 'unknown',

    config: {
      prefix: describePrefix(prefix, ids),
      zone_count: zones.length,
      zones,
      seasons: seasons.map((s, i) => ({
        name: ids ? s.name : `Season ${i + 1}`,
        // The key is frozen at provisioning time and drives entity ids, so a
        // key/name mismatch is a real class of bug worth surfacing either way.
        key_matches_name_slug: s.key === s.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        default_mode: s.default_mode,
      })),
      active_season: ids ? (input.activeSeason ?? 'unknown') : input.activeSeason ? 'set' : 'unknown',
      weather_entity: ids ? (cfg.weather_entity ?? null) : cfg.weather_entity ? 'set' : null,
      season_switch: cfg.season_switch ?? 'manual',
      features: {
        fan_timer: features.fan_timer ?? null,
        anomaly_alerts: features.anomaly_alerts !== false,
        fan_guard: ids ? (features.fan_guard ?? null) : features.fan_guard ? 'set' : null,
        eco_preset: resolveEcoPreset(features),
      },
    },

    scheduling_switches: enabled.length ? enabled : 'not read',

    last_dry_run: input.plan
      ? {
          kind: input.planKind ?? 'setup',
          create: input.plan.create,
          adopt: input.plan.adopt,
          update: input.plan.update,
          delete: input.plan.delete,
          unchanged: input.plan.noop,
          // A healthy install settles here; anything else is the first thing to
          // look at, so state it rather than making a reader do the arithmetic.
          settled: input.plan.create + input.plan.adopt + input.plan.update + input.plan.delete === 0,
        }
      : 'not run',

    managed_objects: input.objectStatuses
      ? { total: input.objectStatuses.length, by_status: countBy(input.objectStatuses) }
      : 'not loaded',
  };

  return JSON.stringify(out, null, 2);
}
