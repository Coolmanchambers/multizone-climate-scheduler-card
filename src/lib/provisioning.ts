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

export const MZCS_LABEL = 'mzcs';
/** Bump when generated automation content changes; differ plans updates on mismatch. */
export const AUTOMATION_REVISION = 'r1';

export interface ProvisionZone {
  slug: string;
  name: string;
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
  features: { fan_timer: boolean; anomaly_alerts: boolean; steering: boolean };
}

export type ObjectKind = 'helper' | 'schedule' | 'template_sensor' | 'stats_sensor' | 'automation';

export interface DesiredObject {
  /** entity_id, or `automation:{unique_id}` for automations */
  id: string;
  kind: ObjectKind;
  /** Creation/update payload subset the differ owns and compares. */
  spec: Record<string, unknown>;
}

export interface ExistingObject {
  id: string;
  kind: ObjectKind;
  spec: Record<string, unknown>;
  /** true when the object carries the mzcs label (we manage it). */
  managed: boolean;
}

export type PlanAction =
  | { op: 'create'; id: string; kind: ObjectKind; spec: Record<string, unknown> }
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

  for (const z of input.zones) {
    if (input.features.fan_timer) {
      out.push({
        id: zoneEntityId('fan_timer', p, z.slug),
        kind: 'helper',
        spec: { name: `Climate ${z.name} fan`, restore: true },
      });
    }
    out.push({
      id: zoneEntityId('running_sensor', p, z.slug),
      kind: 'template_sensor',
      spec: { name: `Climate ${z.name} running`, source: 'hvac_action' },
    });
    out.push({
      id: zoneEntityId('runtime_today', p, z.slug),
      kind: 'stats_sensor',
      spec: { name: `Climate ${z.name} runtime today`, state_class: 'total_increasing' },
    });
    out.push({
      id: zoneEntityId('expected_runtime', p, z.slug),
      kind: 'template_sensor',
      spec: { name: `Climate ${z.name} expected runtime`, model: 'k_x_cdd' },
    });
    out.push({
      id: zoneEntityId('applied_block_marker', p, z.slug),
      kind: 'helper',
      spec: { name: `Climate ${z.name} applied block` },
    });
    // CONTRACT §7c: spec is config-only (name) - NEVER state/initial. Reconfiguration
    // must be unable to flip a user's enable choice; creation defaults to off.
    out.push({
      id: zoneEntityId('zone_enabled', p, z.slug),
      kind: 'helper',
      spec: { name: `Climate ${z.name} enabled` },
    });
    if (input.features.steering) {
      out.push({
        id: zoneEntityId('target_room_select', p, z.slug),
        kind: 'helper',
        spec: { name: `Climate ${z.name} target room`, options: ['Thermostat'] },
      });
      out.push({
        id: zoneEntityId('room_override_timer', p, z.slug),
        kind: 'helper',
        spec: { name: `Climate ${z.name} room override`, restore: true },
      });
      out.push({
        id: zoneEntityId('sensor_schedule', p, z.slug),
        kind: 'schedule',
        spec: { name: `Climate ${z.name} sensor schedule` },
      });
    }
    for (const s of input.seasons) {
      const set = input.schedules[z.slug]?.[s.key];
      if (!set) throw new Error(`Missing schedule for ${z.slug}/${s.key}.`);
      out.push({
        id: zoneScheduleId(p, z.slug, s.key),
        kind: 'schedule',
        spec: { name: `Climate ${z.name} ${s.name}`, week: weeklySpec(set) },
      });
    }
  }

  out.push({
    id: globalEntityId('season_select', p),
    kind: 'helper',
    spec: { name: 'Climate season', options: input.seasons.map((s) => s.name) },
  });
  out.push({
    id: globalEntityId('season_mode', p),
    kind: 'helper',
    spec: { name: 'Climate season mode', options: ['Manual', 'Semi-auto', 'Full-auto'] },
  });
  for (const n of NUMBER_HELPERS) {
    out.push({
      id: globalEntityId(n.cls, p),
      kind: 'helper',
      spec: { min: n.min, max: n.max, step: n.step, initial: n.initial, ...(n.unit ? { unit: n.unit } : {}) },
    });
  }
  if (input.features.steering) {
    for (const n of STEERING_NUMBERS) {
      out.push({
        id: globalEntityId(n.cls, p),
        kind: 'helper',
        spec: { min: n.min, max: n.max, step: n.step, initial: n.initial },
      });
    }
  }
  out.push({
    id: globalEntityId('next_block_sensor', p),
    kind: 'template_sensor',
    spec: { name: 'Climate next block' },
  });
  out.push({
    id: globalEntityId('theme', p),
    kind: 'helper',
    spec: { name: 'Climate theme' },
  });

  const auto = (key: string, zoneName?: string): DesiredObject => ({
    id: `automation:${automationUniqueId(p, zoneName ? `${key}_${zoneName.toLowerCase()}` : key)}`,
    kind: 'automation',
    spec: { alias: automationAlias(key, zoneName), revision: AUTOMATION_REVISION },
  });
  out.push(auto('engine'));
  out.push(auto('watchdog'));
  if (input.seasons.length > 1) out.push(auto('season_recommender'));
  if (input.features.anomaly_alerts) out.push(auto('runtime_alert'));
  if (input.features.fan_timer) {
    for (const z of input.zones) {
      out.push({
        id: `automation:${automationUniqueId(p, `fan_timer_${z.slug}`)}`,
        kind: 'automation',
        spec: { alias: automationAlias('fan_timer', z.name), revision: AUTOMATION_REVISION },
      });
    }
  }
  if (input.features.steering) out.push(auto('steering'));

  return out;
}

/** Deep-equal on JSON-serializable specs (key order independent). */
export function specEqual(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  return canon(a) === canon(b);
}
function canon(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canon).join(',')}]`;
  if (v !== null && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    return `{${Object.keys(o)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canon(o[k])}`)
      .join(',')}}`;
  }
  return JSON.stringify(v);
}

export function plan(desired: DesiredObject[], existing: ExistingObject[]): Plan {
  const out: Plan = { create: [], adopt: [], update: [], delete: [], noop: [] };
  const byId = new Map(existing.map((e) => [e.id, e]));
  const desiredIds = new Set(desired.map((d) => d.id));

  for (const d of desired) {
    const e = byId.get(d.id);
    if (!e) {
      out.create.push({ op: 'create', id: d.id, kind: d.kind, spec: d.spec });
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
