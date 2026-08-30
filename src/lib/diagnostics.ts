import type { MzcsCardConfig } from '../types';
import { normalizeCardConfig, normalizeRoomSensors, resolveEcoPreset } from '../types';
import { defaultSeasons } from './provisioning';

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
  /**
   * Per-zone scheduling switch state. `index` is the zone's position in
   * `config.zones`, so redacted labels line up with the `zones` block; `state`
   * is `not provisioned` when a zone has no enable helper at all - a CONTRACT
   * 7c violation worth reporting rather than silently omitting.
   */
  zoneEnabled?: Array<{ zone: string; state: string; index?: number }>;
  activeSeason?: string;
  /** Include real entity ids and names. Default false. */
  identifiers?: boolean;
}

const DEFAULT_PREFIX = 'climate';

const BLOCK_MODES = ['cool', 'heat', 'heat_cool', 'off'];
const SWITCH_MODES = ['manual', 'semi', 'full'];

/**
 * Config reaches this function straight from Lovelace YAML, which nothing
 * validates at runtime. `?? default` only catches `undefined`, so any field
 * echoed verbatim is a free-text channel out of a "redacted" report (QA P2-P4).
 */
function clampTo(value: unknown, legal: string[]): string {
  return typeof value === 'string' && legal.includes(value) ? value : '<invalid>';
}

/**
 * Browser family and platform answer "is this a rendering bug on one browser",
 * which is why the field exists. The full string additionally carries OS build,
 * app build and device model - a device fingerprint, in a report designed to be
 * published (QA P5).
 */
export function coarsenUserAgent(ua?: string): string {
  if (!ua) return 'unknown';
  const has = (re: RegExp) => re.test(ua);
  const browser = has(/\bEdg\//) ? 'Edge'
    : has(/\bOPR\//) ? 'Opera'
    : has(/\bFirefox\//) ? 'Firefox'
    : has(/\bChrome\//) ? 'Chrome'
    : has(/\bSafari\//) ? 'Safari'
    : 'other browser';
  const platform = has(/Android/) ? 'Android'
    : has(/iPhone|iPad|iPod/) ? 'iOS'
    : has(/Windows/) ? 'Windows'
    : has(/Macintosh|Mac OS/) ? 'macOS'
    : has(/Linux/) ? 'Linux'
    : 'unknown platform';
  const app = has(/HomeAssistant/) ? ' (HA companion app)' : '';
  return browser + ' on ' + platform + app;
}

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

function describeActiveSeason(value: string | undefined, ids: boolean): string {
  if (!value) return 'not read';
  // The literal states input_select.<prefix>_season holds when the engine has
  // no season to apply; mapping them to "set" reported a broken selector as
  // healthy (QA D4).
  if (value === 'unknown' || value === 'unavailable' || value === 'none') return value;
  return ids ? value : 'set';
}

function describeEcoPreset(features: { eco_preset?: string | false }, ids: boolean): string {
  if (features.eco_preset === false) return 'disabled';
  const resolved = resolveEcoPreset(features) ?? 'eco';
  if (ids) return resolved;
  return resolved === 'eco' ? 'eco (default)' : '<custom>';
}

export function buildDiagnostics(input: DiagnosticsInput): string {
  const ids = input.identifiers === true;
  // Read the config the CARD reads, not a second interpretation of the raw
  // YAML (item 40). Measured against v0.7.2, the private reading disagreed with
  // the install three ways: `seasons: []` was reported as two seasons while the
  // engine provisioned none, a legacy scalar `fan_timer: 20` was reported as
  // null (feature off) while the card ran [20], and a zone with no name was
  // reported as `undefined` while the card used the name it derives. A report
  // that describes a different install than the one filing it sends every
  // triage down the wrong path.
  //
  // The refusal is CAUGHT rather than propagated: this artifact exists to be
  // filed about a broken config, and a throw here happens inside a click
  // handler with no catch, so "Build report" would silently do nothing (QA D5).
  // The refusal reason is reported instead - on a rejected config that is the
  // single most useful line in the file.
  let cfg = input.config;
  let rejected: string | undefined;
  try {
    cfg = normalizeCardConfig(input.config);
  } catch (e) {
    rejected = e instanceof Error ? e.message : String(e);
  }
  // A non-string prefix is hand-editable YAML the boundary does not police.
  const prefix = (typeof cfg.prefix === 'string' && cfg.prefix.trim()) || DEFAULT_PREFIX;
  // `Array.isArray`, then nullish: this MUST mirror `_provisionInput`, which
  // applies the defaults only when the key is absent - an explicit empty list
  // provisions no seasons and the report has to say so. The non-array arm is
  // QA-sweep finding D1: `seasons: {}` (and '', 0, false) passed the boundary
  // untouched (it only polices zones) and `seasons.filter` threw inside the
  // catch-less click handler - the QA-D5 defect reintroduced, in the artifact
  // meant for broken configs. v0.7.2 built a report for those shapes; so do we.
  const seasons = Array.isArray(cfg.seasons) ? cfg.seasons : cfg.seasons == null ? defaultSeasons() : [];
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

  // Labelled from the SAME index space as `zones` above. The caller used to send
  // a filtered list which this then re-numbered, so on a half-provisioned
  // install - exactly what a report is filed about - a maintainer read the wrong
  // zone's kill-switch state (QA D1).
  const enabled = (input.zoneEnabled ?? []).map((z, i) => ({
    zone: ids ? z.zone : `Zone ${(z.index ?? i) + 1}`,
    scheduling: z.state,
  }));

  const out: Record<string, unknown> = {
    card_version: input.cardVersion,
    ha_version: input.haVersion ?? 'unknown',
    identifiers_included: ids,
    user_agent: coarsenUserAgent(input.userAgent),

    ...(rejected ? { config_rejected: rejected } : {}),

    config: {
      prefix: describePrefix(prefix, ids),
      zone_count: zones.length,
      zones,
      seasons_defaulted: cfg.seasons == null,
      seasons: seasons.filter((s) => s != null).map((s, i) => {
        const name = typeof s.name === 'string' ? s.name : '';
        return {
          name: ids ? name : `Season ${i + 1}`,
          // The key is frozen at provisioning time and drives entity ids, so a
          // key/name mismatch is a real class of bug worth surfacing either way.
          key_matches_name_slug: s.key === name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_'),
          default_mode: clampTo(s.default_mode, BLOCK_MODES),
        };
      }),
      active_season: describeActiveSeason(input.activeSeason, ids),
      weather_entity: ids ? (cfg.weather_entity ?? null) : cfg.weather_entity ? 'set' : null,
      season_switch: cfg.season_switch === undefined ? 'manual' : clampTo(cfg.season_switch, SWITCH_MODES),
      features: {
        fan_timer: Array.isArray(features.fan_timer)
          ? features.fan_timer.filter((n) => typeof n === 'number' && Number.isFinite(n))
          : null,
        anomaly_alerts: features.anomaly_alerts !== false,
        fan_guard: ids ? (features.fan_guard ?? null) : features.fan_guard ? 'set' : null,
        // Free text in the card editor, so it can hold a household name. The
        // shape of the answer - default, disabled, or customised - is what a
        // maintainer diagnoses with (QA P1).
        eco_preset: describeEcoPreset(features, ids),
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
          // Item 37 made weather-less installs settle (the outdoor pair is no
          // longer planned as a Create the executor cannot honor), so the old
          // "2 pending by design" note is gone. What remains diagnostic-worthy
          // is the consequence: without outdoor data, CDD learning is off.
          ...(cfg.weather_entity
            ? {}
            : { note: 'no weather entity: outdoor sensors not provisioned, CDD learning off' }),
        }
      : 'not run',

    managed_objects: input.objectStatuses
      ? { total: input.objectStatuses.length, by_status: countBy(input.objectStatuses) }
      : 'not loaded',
  };

  return JSON.stringify(out, null, 2);
}
