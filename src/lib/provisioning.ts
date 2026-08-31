// Provisioning differ (CONTRACT §5, §7b, §8 universal change-set rule).
// Pure functions - no Lit/hass imports. The wizard renders plan() output as the
// categorized preview; the executor (S6) walks the same actions. Idempotence
// guarantee: plan(applyPlan(plan(...)), desired) has zero actionable entries.

import type { BlockMode, DayGranularity } from '../types';
import { resolveEcoPreset, resolveOffPeak, normalizeRoomSensors } from '../types';
import {
  zoneEntityId,
  zoneScheduleId,
  globalEntityId,
  automationUniqueId,
  automationAlias,
  type ZoneClass,
  type GlobalClass,
} from './naming';
import { buildWeeklySchedule, type ScheduleBlock, type TimeRange, type DayKey } from './schedule-ranges';
import { automationSignatures, canonicalString } from './automation-payloads';

export const MZCS_LABEL = 'mzcs';
/** Bump when generated automation content changes; differ plans updates on mismatch. */
export const AUTOMATION_REVISION = 'r1';

export interface ProvisionZone {
  slug: string;
  name: string;
  /** climate entity id; feeds the automation generators' signatures */
  climate?: string;
  /**
   * Room sensors as {label, entity, seen?}, derived from the config's
   * room_sensors via steeringRooms() - THE single builder (three hand-copies
   * of the label rule was QA INFO-6's NEW-3 shape). Consumed ONLY by steering
   * (target_room options + the steering automation's maps); nothing else may
   * read it, so configs without steering are unaffected by room changes.
   */
  rooms?: Array<{ label: string; entity: string; seen?: string }>;
}

/**
 * THE single room_sensors -> steering rooms mapping (config-deterministic, no
 * hass). Label = configured name, else the entity id, with two sanitizations
 * (QA finding E4): a label that collides with the "Thermostat" sentinel or
 * with an earlier room's label falls back to the entity id, and duplicate
 * entities are dropped - otherwise the sentinel stops meaning "don't steer",
 * or duplicate input_select options abort the whole Apply into rollback.
 * `seen` carries the row's last_seen companion so the generated automation's
 * freshness gate keeps the item-36 protection (QA finding E5).
 */
export function steeringRooms(
  roomSensors: unknown,
): Array<{ label: string; entity: string; seen?: string }> {
  const used = new Set<string>(['thermostat']);
  const entities = new Set<string>();
  const out: Array<{ label: string; entity: string; seen?: string }> = [];
  for (const r of normalizeRoomSensors(roomSensors as Parameters<typeof normalizeRoomSensors>[0])) {
    if (entities.has(r.entity)) continue;
    entities.add(r.entity);
    let label = r.name ?? r.entity;
    if (used.has(label.trim().toLowerCase())) label = r.entity;
    used.add(label.trim().toLowerCase());
    out.push({ label, entity: r.entity, ...(r.last_seen ? { seen: r.last_seen } : {}) });
  }
  return out;
}

export interface ProvisionSeason {
  key: string;
  name: string;
  default_mode: BlockMode;
}

export interface ScheduleSet {
  granularity: DayGranularity;
  sets: Record<string, ScheduleBlock[]>;
}

export interface ProvisionInput {
  prefix: string;
  zones: ProvisionZone[];
  seasons: ProvisionSeason[];
  /** zone slug → season key → blocks */
  schedules: Record<string, Record<string, ScheduleSet>>;
  features: {
    fan_timer: boolean;
    anomaly_alerts: boolean;
    steering: boolean;
    fan_guard?: string;
    /** standby preset for the engine's stand-down gate (see MzcsCardConfig) */
    eco_preset?: string | false;
    /** off-peak comfort day entity + offset seed (item 7, see MzcsCardConfig) */
    off_peak_entity?: string;
    off_peak_offset?: number;
  };
  /** weather entity providing the outdoor temperature for CDD learning */
  weather_entity?: string;
}

export type ObjectKind = 'helper' | 'schedule' | 'template_sensor' | 'stats_sensor' | 'automation';

export interface DesiredObject {
  /** entity_id, or `automation:{unique_id}` for automations */
  id: string;
  kind: ObjectKind;
  /**
   * The COMPARED identity of the object - only keys the live registry can
   * faithfully read back (extraction parity: plan(fetchExisting(apply(...)))
   * must be empty). Creation-only payloads live in `meta`.
   */
  spec: Record<string, unknown>;
  /**
   * True = "keep it if it exists, but do not create it" (item 37). The outdoor
   * pair is desired unconditionally so an already-provisioned one is never
   * planned for delete, but WITHOUT a weather entity the executor cannot
   * create it - so planning a Create produced 2 permanent pending rows and a
   * weather-less install could never settle to all-Unchanged, breaking the
   * health canary for exactly the installs beta testers are likeliest to have.
   */
  conditional?: boolean;
  /** Creation-time payload (seed values, seeded week, template types). NEVER compared. */
  meta?: Record<string, unknown>;
}

export interface ExistingObject {
  id: string;
  kind: ObjectKind;
  spec: Record<string, unknown>;
  /** true when the object carries the mzcs label (we manage it). */
  managed: boolean;
  /**
   * Automations only: the live config still matches its embedded signature,
   * i.e. nobody hand-edited it since the generator wrote it. Reporting only -
   * NEVER part of `spec`, so it cannot affect the differ (extraction parity).
   * undefined = not an automation, or not determinable.
   */
  pristine?: boolean;
}

export type PlanAction =
  | { op: 'create'; id: string; kind: ObjectKind; spec: Record<string, unknown>; meta?: Record<string, unknown> }
  | { op: 'adopt'; id: string; kind: ObjectKind; spec: Record<string, unknown> }
  | { op: 'update'; id: string; kind: ObjectKind; spec: Record<string, unknown>; from: Record<string, unknown> }
  | { op: 'delete'; id: string; kind: ObjectKind }
  | { op: 'noop'; id: string; kind: ObjectKind };

export interface Plan {
  create: Array<Extract<PlanAction, { op: 'create' }>>;
  adopt: Array<Extract<PlanAction, { op: 'adopt' }>>;
  update: Array<Extract<PlanAction, { op: 'update' }>>;
  delete: Array<Extract<PlanAction, { op: 'delete' }>>;
  noop: Array<Extract<PlanAction, { op: 'noop' }>>;
}

const NUMBER_HELPERS: Array<{ cls: GlobalClass; min: number; max: number; step: number; initial: number; unit?: string }> = [
  { cls: 'season_confirm_days', min: 1, max: 14, step: 1, initial: 3 },
  { cls: 'season_dwell_days', min: 1, max: 60, step: 1, initial: 14 },
  { cls: 'dev_green_max', min: 1, max: 10, step: 1, initial: 2, unit: '°F' },
  { cls: 'dev_amber_max', min: 1, max: 15, step: 1, initial: 4, unit: '°F' },
  { cls: 'runtime_alert_margin', min: 5, max: 100, step: 5, initial: 35, unit: '%' },
  { cls: 'runtime_alert_days', min: 1, max: 7, step: 1, initial: 3 },
  { cls: 'runtime_learn_days', min: 7, max: 60, step: 1, initial: 30 },
  { cls: 'cdd_base', min: 60, max: 80, step: 1, initial: 75, unit: '°F' },
];

const STEERING_NUMBERS: Array<{ cls: GlobalClass; min: number; max: number; step: number; initial: number }> = [
  { cls: 'override_minutes', min: 15, max: 240, step: 15, initial: 60 },
  { cls: 'steer_min_setpoint', min: 50, max: 80, step: 1, initial: 68 },
  { cls: 'steer_max_setpoint', min: 70, max: 95, step: 1, initial: 85 },
  { cls: 'steer_max_offset', min: 1, max: 10, step: 1, initial: 5 },
];

function weeklySpec(set: ScheduleSet): Record<DayKey, TimeRange[]> {
  return buildWeeklySchedule(set.granularity, set.sets);
}

/**
 * Refuse season sets whose keys COLLIDE - and only those.
 *
 * The failure this exists for: schedule ids embed the season key verbatim
 * (`schedule.<prefix>_<zone>_<key>`), so two seasons with the same effective
 * key produce the same entity id for every zone. v0.7.1 caught that via the
 * generic naming-collision check below, whose message told the user to RENAME
 * their zones and seasons - advice that cannot help when the cause is a
 * missing or duplicated key. This block names the real cause. It never widens
 * what is refused: every config it throws for also threw at v0.7.1.
 *
 * What it deliberately does NOT do, each learned the hard way (QA rounds 2-3):
 * - It does not refuse a SINGLE keyless season. Measured against released
 *   v0.7.1: that config provisions (27 objects at 1 zone x 1 season), the
 *   engine applies blocks against `schedule.<prefix>_<zone>_undefined`, and a
 *   fully-applied install replans to all-Unchanged - fetchExisting's orphan-
 *   schedule fallback claims the entity even though the season parser cannot.
 *   Refusing a converging install is the breaking change R3 forbids. (Its
 *   one-time drawer-lookup defect was fixed in 0.7.3 by resolveSeasonKey.)
 * - It does not test key TYPES. `key: 1` and `key: off` name live entities.
 * - It does not group by trimmed or normalized keys. `key: null` beside an
 *   absent key yields `_null` and `_undefined` - DISTINCT ids that provisioned
 *   and converged at v0.7.1 - so grouping is by the EXACT string the id
 *   template embeds: `String(key)`.
 * - It does not fire with zero zones: no schedule ids exist, nothing collides,
 *   and v0.7.1 accepted the config.
 *
 * Every caller runs buildDesired inside try/catch that renders the message as
 * a panel error, so the card keeps rendering.
 */
/**
 * A season's name must be a string (item 41). Measured against v0.7.2 twice:
 * a missing, null or numeric name died as a raw TypeError from inside the
 * seasonMap template builders (automation-payloads and its executor twin) -
 * "Cannot read properties of undefined (reading 'replace')" surfaced as the
 * dry-run error. Every refused shape here already threw there, so this guard
 * is message-only: no config that provisioned changes behaviour. The empty
 * string is NOT refused - `name: ''` provisioned and converged at v0.7.2, and
 * refusing a working install is the breaking change R3 forbids. Guarded once
 * at the shared input rather than patched in two generators, because those two
 * hand-built maps drifting apart is finding NEW-3's whole genre.
 */
function assertSeasonNames(seasons: ProvisionSeason[]): void {
  seasons.forEach((s, i) => {
    if (typeof s?.name === 'string') return;
    const key = s?.key != null ? ` (key: ${String(s.key)})` : '';
    throw new Error(
      `Season ${i + 1}${key} has no name. Every season needs a display name - ` +
        `add \`name: ...\` to it, or configure the card with the visual editor, which requires one.`,
    );
  });
}

function assertUniqueSeasonKeys(seasons: ProvisionSeason[], zoneCount: number): void {
  if (zoneCount === 0) return;
  const groups = new Map<string, Array<{ s: ProvisionSeason; i: number }>>();
  seasons.forEach((s, i) => {
    const k = String(s?.key);
    const g = groups.get(k) ?? [];
    g.push({ s, i });
    groups.set(k, g);
  });
  for (const [key, group] of groups) {
    if (group.length < 2) continue;
    const allMissing = group.every(({ s }) => s?.key == null || String(s.key).trim() === '');
    if (allMissing) {
      const [first] = group;
      const named = typeof first!.s?.name === 'string' && first!.s.name.trim();
      const which = named ? `"${first!.s.name}"` : `at position ${first!.i + 1}`;
      const suggestion =
        (named ? first!.s.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') : '') ||
        `season_${first!.i + 1}`;
      throw new Error(
        `${group.length} seasons are missing their required "key", so they would all resolve to the ` +
          `same schedule entity names and collide. The key is the permanent id used in entity names; ` +
          `the display name is only a label and can be renamed freely. ` +
          `Give each season its own key - start with \`key: ${suggestion}\` on season ${which} - or ` +
          `configure the card with the visual editor, which fills keys in for you.`,
      );
    }
    throw new Error(
      `${group.length} seasons share the key "${key}", so their schedule entity names collide. ` +
        `The key is the permanent id used in entity names and must be unique per season; ` +
        `the display name is only a label and can be renamed freely.`,
    );
  }
}

export function buildDesired(input: ProvisionInput): DesiredObject[] {
  assertSeasonNames(input.seasons);
  assertUniqueSeasonKeys(input.seasons, input.zones.length);
  const out: DesiredObject[] = [];
  const p = input.prefix;
  // Display names are PREFIX-DERIVED so two card instances never share a name.
  // Shared names collide in HA's name->object_id slugification and made the
  // QA install rename the production daily-mean sensor (S12c incident).
  // For the default prefix 'climate' this yields the historical 'Climate ...'.
  const label = p.charAt(0).toUpperCase() + p.slice(1);

  for (const z of input.zones) {
    if (input.features.fan_timer) {
      out.push({
        id: zoneEntityId('fan_timer', p, z.slug),
        kind: 'helper',
        spec: { name: `${label} ${z.name} fan`, restore: true },
      });
    }
    out.push({
      id: zoneEntityId('running_sensor', p, z.slug),
      kind: 'template_sensor',
      spec: { name: `${label} ${z.name} running` },
      meta: { source: 'hvac_action' },
    });
    out.push({
      id: zoneEntityId('runtime_today', p, z.slug),
      kind: 'stats_sensor',
      spec: { name: `${label} ${z.name} runtime today` },
      meta: { model: 'history_stats' },
    });
    // LTS mirror (backlog item 42). history_stats sensors expose no
    // state_class, so HA generates no long-term statistics for them - the live
    // 0.7.2 bug. This template sensor mirrors runtime_today's value WITH
    // `state_class: measurement`, so hourly statistics accrue from the day it
    // is created; a day's runtime is that day's LTS max (the sensor climbs
    // 0 -> N and resets at midnight). The 30-day/seasonal card view reads it
    // later (item 42b) at zero recorder cost.
    out.push({
      id: zoneEntityId('runtime_mirror', p, z.slug),
      kind: 'template_sensor',
      spec: { name: `${label} ${z.name} runtime mirror` },
      meta: { model: 'runtime_mirror' },
    });
    out.push({
      id: zoneEntityId('expected_runtime', p, z.slug),
      kind: 'template_sensor',
      spec: { name: `${label} ${z.name} expected runtime` },
      meta: { model: 'k_x_cdd' },
    });
    out.push({
      id: zoneEntityId('applied_block_marker', p, z.slug),
      kind: 'helper',
      spec: { name: `${label} ${z.name} applied block` },
    });
    // CONTRACT §7c: spec is config-only (name) - NEVER state/initial. Reconfiguration
    // must be unable to flip a user's enable choice; creation defaults to off.
    out.push({
      id: zoneEntityId('zone_enabled', p, z.slug),
      kind: 'helper',
      spec: { name: `${label} ${z.name} enabled` },
    });
    out.push({
      id: zoneEntityId('k_factor', p, z.slug),
      kind: 'helper',
      spec: { name: `${label} ${z.name} K`, min: 0, max: 10, step: 0.01 },
    });
    if (input.features.steering) {
      out.push({
        id: zoneEntityId('target_room_select', p, z.slug),
        kind: 'helper',
        // Options derive from the zone's configured room sensors (spec §6):
        // "Thermostat" = not steering; a room label = steer to that room.
        spec: { name: `${label} ${z.name} target room`, options: ['Thermostat', ...(z.rooms ?? []).map((r) => r.label)] },
      });
      out.push({
        id: zoneEntityId('room_override_timer', p, z.slug),
        kind: 'helper',
        spec: { name: `${label} ${z.name} room override`, restore: true },
      });
      // The override's target temperature (decided with the maintainer
      // 2026-08-30: CONTRACT §7b reserved no store for it). Written by the
      // card when an override starts; read by the steering automation on
      // every recompute; survives an HA restart.
      out.push({
        id: zoneEntityId('steer_target', p, z.slug),
        kind: 'helper',
        spec: { name: `${label} ${z.name} steer target`, min: 50, max: 95, step: 1 },
      });
      out.push({
        id: zoneEntityId('sensor_schedule', p, z.slug),
        kind: 'schedule',
        spec: { name: `${label} ${z.name} sensor schedule` },
      });
    }
    for (const s of input.seasons) {
      const set = input.schedules[z.slug]?.[s.key];
      if (!set) throw new Error(`Missing schedule for ${z.slug}/${s.key}.`);
      out.push({
        id: zoneScheduleId(p, z.slug, s.key),
        kind: 'schedule',
        spec: { name: `${label} ${z.name} ${s.name}` },
        meta: { week: weeklySpec(set) },
      });
    }
  }

  out.push({
    id: globalEntityId('season_select', p),
    kind: 'helper',
    spec: { name: `${label} season`, options: input.seasons.map((s) => s.name) },
  });
  out.push({
    id: globalEntityId('season_mode', p),
    kind: 'helper',
    spec: { name: `${label} season mode`, options: ['Manual', 'Semi-auto', 'Full-auto'] },
  });
  // `seed` is the default VALUE the executor sets once at creation via
  // input_number.set_value. It is deliberately NOT HA's `initial` config field:
  // a configured `initial` resets the helper's state on EVERY HA restart,
  // silently reverting user-tuned values (QA-R finding B1-5).
  for (const n of NUMBER_HELPERS) {
    out.push({
      id: globalEntityId(n.cls, p),
      kind: 'helper',
      spec: {
        name: `${label} ${n.cls.replace(/_/g, ' ')}`,
        min: n.min,
        max: n.max,
        step: n.step,
        ...(n.unit ? { unit: n.unit } : {}),
      },
      meta: { seed: n.initial },
    });
  }
  if (input.features.steering) {
    for (const n of STEERING_NUMBERS) {
      out.push({
        id: globalEntityId(n.cls, p),
        kind: 'helper',
        spec: { name: `${label} ${n.cls.replace(/_/g, ' ')}`, min: n.min, max: n.max, step: n.step },
        meta: { seed: n.initial },
      });
    }
  }
  // Off-peak comfort (item 7): both helpers exist ONLY when the feature is
  // configured, so unconfigured installs keep their exact inventory. The
  // engine reads the offset HELPER (tunable without re-provisioning); the
  // config value is only its creation seed. The pause helper holds an ISO
  // date ("off-peak paused for this day"); it seeds nothing - unknown/empty
  // never equals today, which means not paused.
  const offPeak = resolveOffPeak(input.features);
  if (offPeak) {
    out.push({
      id: globalEntityId('off_peak_offset', p),
      kind: 'helper',
      spec: { name: `${label} off peak offset`, min: 0, max: 10, step: 1, unit: '°F' },
      meta: { seed: offPeak.offsetSeed },
    });
    out.push({
      id: globalEntityId('off_peak_paused_on', p),
      kind: 'helper',
      spec: { name: `${label} off peak paused on` },
    });
  }
  out.push({
    id: globalEntityId('next_block_sensor', p),
    kind: 'template_sensor',
    spec: { name: `${label} next block` },
  });
  // Outdoor temperature chain feeding CDD learning (QA-R gap G1). The pair is
  // ALWAYS desired so an already-provisioned one is never planned for delete;
  // without a weather entity it is marked conditional (item 37): kept and
  // compared when present, but never planned as a Create the executor would
  // only skip - that mismatch left weather-less installs permanently short of
  // all-Unchanged.
  const outdoorConditional = input.weather_entity ? {} : { conditional: true };
  out.push({
    id: globalEntityId('outdoor_temp_sensor', p),
    kind: 'template_sensor',
    spec: { name: `${label} outdoor temp` },
    meta: { source: 'weather' },
    ...outdoorConditional,
  });
  out.push({
    id: globalEntityId('outdoor_daily_mean', p),
    kind: 'stats_sensor',
    spec: { name: `${label} outdoor daily mean` },
    meta: { model: 'statistics_mean' },
    ...outdoorConditional,
  });
  out.push({
    id: globalEntityId('theme', p),
    kind: 'helper',
    spec: { name: `${label} theme` },
  });

  // Signatures of the current-generation automation payloads. A live automation
  // whose embedded signature differs is stale (zones/seasons/generator changed)
  // and gets an Update; the executor then regenerates it only when its content
  // still matches its own signature (i.e. never hand-edited).
  const zoneRefs = input.zones.map((z) => ({ ...z, climate: z.climate ?? `climate.${z.slug}` }));
  const sigs = automationSignatures(
    p,
    zoneRefs,
    input.seasons,
    input.features.fan_guard,
    resolveEcoPreset(input.features),
    offPeak?.entity ?? null,
    input.features.steering,
  );
  const auto = (key: string, zoneName?: string): DesiredObject => {
    const uid = automationUniqueId(p, zoneName ? `${key}_${zoneName.toLowerCase()}` : key);
    return {
      id: `automation:${uid}`,
      kind: 'automation',
      spec: { alias: automationAlias(p, key, zoneName), sig: sigs[uid] ?? AUTOMATION_REVISION },
    };
  };
  out.push(auto('engine'));
  out.push(auto('watchdog'));
  out.push(auto('runtime_learning'));
  // season_recommender deferred to a post-v1 release: it needs per-season
  // forecast-threshold helpers that are not yet in the contract.
  if (input.features.anomaly_alerts) out.push(auto('runtime_alert'));
  if (input.features.fan_timer) {
    for (const z of input.zones) {
      const uid = automationUniqueId(p, `fan_timer_${z.slug}`);
      out.push({
        id: `automation:${uid}`,
        kind: 'automation',
        spec: { alias: automationAlias(p, 'fan_timer', z.name), sig: sigs[uid] ?? AUTOMATION_REVISION },
      });
    }
  }
  // The steering automation (item 8): a generator exists as of 0.7.5, so it
  // is desired exactly when the feature is on - a Create for enabling
  // installs, absent (and therefore never a phantom Create) everywhere else.
  if (input.features.steering) out.push(auto('steering'));

  // Guard against compound id collisions the reserved-slug check cannot see
  // (e.g. zones 'up'/'up_late' with seasons 'late_summer'/'summer' both
  // resolving to schedule.<p>_up_late_summer) - QA-R finding A2-8.
  const seen = new Set<string>();
  for (const o of out) {
    if (seen.has(o.id)) {
      throw new Error(
        `Naming collision: two configured objects both resolve to "${o.id}". Rename the conflicting zone or season.`,
      );
    }
    seen.add(o.id);
  }
  return out;
}

/** Deep-equal on JSON-serializable specs (key order independent). */
export function specEqual(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  return canonicalString(a) === canonicalString(b);
}

export function plan(desired: DesiredObject[], existing: ExistingObject[]): Plan {
  const out: Plan = { create: [], adopt: [], update: [], delete: [], noop: [] };
  const byId = new Map(existing.map((e) => [e.id, e]));
  const desiredIds = new Set(desired.map((d) => d.id));

  for (const d of desired) {
    const e = byId.get(d.id);
    if (!e) {
      // Conditional objects (item 37) are keep-if-present only: absent means
      // nothing to do, never a Create the executor cannot honor. Present ones
      // fall through to the normal adopt/update/noop comparison below, and the
      // delete sweep still never touches them because they stay in desiredIds.
      if (d.conditional) continue;
      out.create.push({ op: 'create', id: d.id, kind: d.kind, spec: d.spec, ...(d.meta ? { meta: d.meta } : {}) });
    } else if (!e.managed) {
      out.adopt.push({ op: 'adopt', id: d.id, kind: d.kind, spec: d.spec });
    } else if (!specEqual(e.spec, d.spec)) {
      out.update.push({ op: 'update', id: d.id, kind: d.kind, spec: d.spec, from: e.spec });
    } else {
      out.noop.push({ op: 'noop', id: d.id, kind: d.kind });
    }
  }
  for (const e of existing) {
    if (e.managed && !desiredIds.has(e.id)) {
      out.delete.push({ op: 'delete', id: e.id, kind: e.kind });
    }
  }
  return out;
}

export function actionable(p: Plan): PlanAction[] {
  return [...p.create, ...p.adopt, ...p.update, ...p.delete];
}

/** Test/preview simulator: the registry state after executing a plan. */
export function applyPlan(p: Plan, existing: ExistingObject[]): ExistingObject[] {
  const byId = new Map(existing.map((e) => [e.id, { ...e }]));
  for (const a of p.create) byId.set(a.id, { id: a.id, kind: a.kind, spec: a.spec, managed: true });
  for (const a of p.adopt) {
    const e = byId.get(a.id);
    // Adopt only LABELS (matches the executor): the adopted object's own spec
    // is untouched, so a name that differs from the contract legitimately
    // shows as an Update on the next plan and converges on the second apply
    // (scan S13-conformance 5).
    if (e) e.managed = true;
  }
  for (const a of p.update) {
    const e = byId.get(a.id);
    if (e) e.spec = a.spec;
  }
  for (const a of p.delete) byId.delete(a.id);
  return [...byId.values()];
}

/**
 * Seasons assumed when a config omits `seasons:` entirely.
 *
 * Frozen, and every consumer goes through `defaultSeasons()` for its own copy.
 * The code this replaced built a fresh literal per call, so handing out a shared
 * array would have been a new hazard: one in-place sort anywhere - or a test
 * mutating the export - would corrupt every card instance on the page at once.
 * `src/editor.ts` already copies defensively for the same reason.
 */
const DEFAULT_SEASONS_FROZEN: readonly Readonly<ProvisionSeason>[] = Object.freeze([
  Object.freeze({ key: 'summer', name: 'Summer', default_mode: 'cool' as const }),
  Object.freeze({ key: 'winter', name: 'Winter', default_mode: 'heat_cool' as const }),
]);

/** A fresh, independently mutable copy of the default seasons. */
export function defaultSeasons(): ProvisionSeason[] {
  return DEFAULT_SEASONS_FROZEN.map((s) => ({ ...s }));
}

/**
 * Card config -> ProvisionInput. THE single mapping (docs/config-compatibility.md),
 * pure and Lit-free so the engine harness can drive its variant matrix from real
 * configs rather than from a hand-built ProvisionInput that could drift from what
 * the card actually passes.
 *
 * `schedules` is supplied by the caller because the card seeds placeholder weeks
 * from default-schedules.ts, which is a card concern, not a differ one.
 *
 * Note `fan_timer`: an ABSENT list means the feature is ON (the card's historical
 * default of three presets), while an explicitly EMPTY list means off. That
 * distinction is documented in the README and is easy to invert by accident, so
 * it is pinned by tests rather than left to the reader.
 */
export function provisionInputFromConfig(
  config: {
    prefix?: string;
    zones: Array<{ entity: string; name: string; room_sensors?: unknown }>;
    seasons?: ProvisionSeason[];
    weather_entity?: string;
    features?: {
      fan_timer?: number[];
      anomaly_alerts?: boolean;
      fan_guard?: string;
      eco_preset?: string | false;
      off_peak_entity?: string;
      off_peak_offset?: number;
      steering?: boolean;
    };
  },
  schedules: ProvisionInput['schedules'],
  slug: (name: string) => string,
): ProvisionInput {
  const steering = config.features?.steering === true;
  return {
    prefix: config.prefix ?? 'climate',
    zones: config.zones.map((z) => ({
      slug: slug(z.name),
      name: z.name,
      climate: z.entity,
      // Rooms feed ONLY steering; built exactly when the feature is on so a
      // non-steering config is byte-identical to one that never had sensors.
      ...(steering ? { rooms: steeringRooms(z.room_sensors) } : {}),
    })),
    seasons: config.seasons ?? defaultSeasons(),
    schedules,
    features: {
      fan_timer: (config.features?.fan_timer?.length ?? 3) > 0,
      anomaly_alerts: config.features?.anomaly_alerts ?? true,
      steering,
      fan_guard: config.features?.fan_guard,
      eco_preset: config.features?.eco_preset,
      off_peak_entity: config.features?.off_peak_entity,
      off_peak_offset: config.features?.off_peak_offset,
    },
    weather_entity: config.weather_entity,
  };
}
