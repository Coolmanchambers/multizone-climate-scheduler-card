// Provisioning differ (CONTRACT §5, §7b, §8 universal change-set rule).
// Pure functions - no Lit/hass imports. The wizard renders plan() output as the
// categorized preview; the executor (S6) walks the same actions. Idempotence
// guarantee: plan(applyPlan(plan(...)), desired) has zero actionable entries.

import type { BlockMode, DayGranularity } from '../types';
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
  features: { fan_timer: boolean; anomaly_alerts: boolean; steering: boolean; fan_guard?: string };
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
  /** Creation-time payload (seed values, seeded week, template types). NEVER compared. */
  meta?: Record<string, unknown>;
}

export interface ExistingObject {
  id: string;
  kind: ObjectKind;
  spec: Record<string, unknown>;
  /** true when the object carries the mzcs label (we manage it). */
  managed: boolean;
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

export function buildDesired(input: ProvisionInput): DesiredObject[] {
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
        spec: { name: `${label} ${z.name} target room`, options: ['Thermostat'] },
      });
      out.push({
        id: zoneEntityId('room_override_timer', p, z.slug),
        kind: 'helper',
        spec: { name: `${label} ${z.name} room override`, restore: true },
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
  out.push({
    id: globalEntityId('next_block_sensor', p),
    kind: 'template_sensor',
    spec: { name: `${label} next block` },
  });
  // Outdoor temperature chain feeding CDD learning (QA-R gap G1). The daily
  // mean is ALWAYS desired so an already-provisioned one is never planned for
  // delete; creation is skipped with a note when no weather entity is set.
  out.push({
    id: globalEntityId('outdoor_temp_sensor', p),
    kind: 'template_sensor',
    spec: { name: `${label} outdoor temp` },
    meta: { source: 'weather' },
  });
  out.push({
    id: globalEntityId('outdoor_daily_mean', p),
    kind: 'stats_sensor',
    spec: { name: `${label} outdoor daily mean` },
    meta: { model: 'statistics_mean' },
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
  const sigs = automationSignatures(p, zoneRefs, input.seasons, input.features.fan_guard);
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
  // NOTE: the steering AUTOMATION is intentionally not desired yet - no
  // generator exists for it (S9.5). Desiring it would produce a perpetual
  // non-converging Create (QA-R finding A2-5). Steering helpers above remain
  // feature-gated so their provisioning is ready when the generator lands.

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
    if (e) {
      e.managed = true;
      e.spec = a.spec;
    }
  }
  for (const a of p.update) {
    const e = byId.get(a.id);
    if (e) e.spec = a.spec;
  }
  for (const a of p.delete) byId.delete(a.id);
  return [...byId.values()];
}
