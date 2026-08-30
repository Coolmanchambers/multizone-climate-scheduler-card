/**
 * THE canonical engine fixture (backlog item 6).
 *
 * One config, one shape, one source. Every golden file, invariant assertion and
 * variant-matrix row derives from here, so a fixture change is a single visible
 * edit rather than eight copies drifting apart.
 *
 * Shape mirrors a full install - 3 zones x 2 seasons, fan timers and anomaly
 * alerts on - which yields the 48-object inventory and the 7 automations the
 * golden files pin.
 *
 * PRIVACY: this is a public repository. Zone and room NAMES must stay generic -
 * a name is a direct identifier, especially one built from a person's name.
 * Schedule times and setpoints are NOT restricted (maintainer decision,
 * 2026-08-26): a thermostat schedule names nobody and resolves to no address,
 * and this is a scheduling card, so realistic schedules are useful test data.
 * See CLAUDE.md for the criteria.
 */
import {
  buildDesired,
  provisionInputFromConfig,
  type ProvisionInput,
  type ProvisionSeason,
  type ScheduleSet,
} from '../../src/lib/provisioning';
import { automationSignatures, type ZoneRef } from '../../src/lib/automation-payloads';
import { slugify } from '../../src/lib/naming';
import {
  engineAutomation,
  fanAutomation,
  learningAutomation,
  watchdogAutomation,
  runtimeAlertAutomation,
} from '../../src/lib/automation-payloads';
import { resolveEcoPreset } from '../../src/types';
import type { ScheduleBlock } from '../../src/lib/schedule-ranges';

const cool = (time: string, name: string, t: number): ScheduleBlock => ({
  time,
  name,
  mode: 'cool',
  cool_temp: t,
  heat_temp: null,
});
const heatCool = (time: string, name: string, c: number, h: number): ScheduleBlock => ({
  time,
  name,
  mode: 'heat_cool',
  cool_temp: c,
  heat_temp: h,
});

// Three blocks / two blocks / two blocks is the STRUCTURE the harness needs:
// a multi-block set, a shorter alternate set, and a dual-setpoint set.
const WEEKDAY = [cool('04:00', 'Block A', 70), cool('12:00', 'Block B', 75), cool('20:00', 'Block C', 80)];
const WEEKEND = [cool('08:00', 'Block A', 70), cool('16:00', 'Block B', 75)];
const MIXED = [heatCool('04:00', 'Block A', 80, 60), heatCool('16:00', 'Block B', 85, 65)];

export const SUMMER_SET: ScheduleSet = { granularity: 'wdwe', sets: { wd: WEEKDAY, we: WEEKEND } };
export const WINTER_SET: ScheduleSet = { granularity: 'all', sets: { all: MIXED } };

export const CANONICAL_SEASONS: ProvisionSeason[] = [
  { key: 'summer', name: 'Summer', default_mode: 'cool' },
  { key: 'winter', name: 'Winter', default_mode: 'heat_cool' },
];

export const CANONICAL_ZONES = [
  { entity: 'climate.zone_one', name: 'Zone One' },
  { entity: 'climate.zone_two', name: 'Zone Two' },
  { entity: 'climate.zone_three', name: 'Zone Three' },
];

export interface FixtureOverrides {
  prefix?: string;
  zones?: Array<{ entity: string; name: string }>;
  seasons?: ProvisionSeason[];
  weather_entity?: string;
  features?: {
    fan_timer?: number[];
    anomaly_alerts?: boolean;
    fan_guard?: string;
    eco_preset?: string | false;
  };
}

/**
 * The canonical ProvisionInput, built through `provisionInputFromConfig` - the
 * SAME mapping the card uses - so a variant here cannot diverge from what a real
 * install would produce.
 */
export function canonicalInput(overrides: FixtureOverrides = {}): ProvisionInput {
  const seasons = overrides.seasons ?? CANONICAL_SEASONS;
  const zones = overrides.zones ?? CANONICAL_ZONES;
  // Each zone gets the same two-season week; a season beyond the canonical two
  // reuses the mixed-mode set so the fixture scales without new literals.
  const schedules: ProvisionInput['schedules'] = {};
  for (const z of zones) {
    schedules[slugify(z.name)] = Object.fromEntries(
      seasons.map((s) => [s.key, s.key === 'summer' ? SUMMER_SET : WINTER_SET]),
    );
  }
  return provisionInputFromConfig(
    {
      prefix: overrides.prefix,
      zones,
      seasons,
      weather_entity: overrides.weather_entity,
      features: overrides.features,
    },
    schedules,
    slugify,
  );
}

/** Zone refs in the shape the generators take (climate id resolved). */
export function zoneRefs(input: ProvisionInput): ZoneRef[] {
  return input.zones.map((z) => ({ ...z, climate: z.climate ?? `climate.${z.slug}` }));
}

/** Signatures for an input, resolving the standby preset exactly as the differ does. */
export function signaturesFor(input: ProvisionInput): Record<string, string> {
  return automationSignatures(
    input.prefix,
    zoneRefs(input),
    input.seasons,
    input.features.fan_guard,
    resolveEcoPreset(input.features),
  );
}

/** Every generator's payload, regardless of whether the config desires it. */
function generatedPayloads(input: ProvisionInput): Record<string, Record<string, unknown>> {
  const refs = zoneRefs(input);
  const preset = resolveEcoPreset(input.features);
  const out: Record<string, Record<string, unknown>> = {
    [`${input.prefix}_mzcs_engine`]: engineAutomation(input.prefix, refs, input.seasons, preset),
    [`${input.prefix}_mzcs_watchdog`]: watchdogAutomation(input.prefix),
    [`${input.prefix}_mzcs_runtime_learning`]: learningAutomation(input.prefix, refs),
    [`${input.prefix}_mzcs_runtime_alert`]: runtimeAlertAutomation(input.prefix, refs),
  };
  for (const z of refs) {
    out[`${input.prefix}_mzcs_fan_timer_${z.slug}`] = fanAutomation(input.prefix, z, input.features.fan_guard);
  }
  return out;
}

/**
 * The automation payloads this config actually PROVISIONS, keyed by unique id.
 *
 * QA finding H7: this used to return every generator's output regardless of
 * config, so the `fan-timer-off` and `anomaly-alerts-off` goldens were
 * byte-identical to the default BY CONSTRUCTION, and six assertions about them
 * restated the same tautology. Filtering to what `buildDesired` desires makes
 * those variants describe something real.
 *
 * `automationSignatures` deliberately signs every generator whether desired or
 * not - it is a lookup table. A golden has to describe what actually ships.
 */
export function allPayloads(input: ProvisionInput): Record<string, Record<string, unknown>> {
  const desired = new Set(
    buildDesired(input)
      .filter((o) => o.kind === 'automation')
      .map((o) => o.id.replace(/^automation:/, '')),
  );
  return Object.fromEntries(Object.entries(generatedPayloads(input)).filter(([uid]) => desired.has(uid)));
}

/** Every generator's payload, desired or not - for signature-map parity checks. */
export function allGeneratedPayloads(input: ProvisionInput): Record<string, Record<string, unknown>> {
  return generatedPayloads(input);
}

/**
 * The desired inventory as a golden pins it.
 *
 * QA finding H3: this dropped `meta`, so helper SEED VALUES, the seeded schedule
 * week and template-sensor models were pinned by nothing at all. Changing
 * `cdd_base` from 75 to 60, or narrowing the per-zone k range so every learned
 * value clamps, moved 11 goldens while the suite stayed green. `meta` is what
 * gets WRITTEN at creation, so it belongs in the golden even though the differ
 * deliberately never compares it.
 */
export function inventoryFor(
  input: ProvisionInput,
): Array<{ id: string; kind: string; spec: unknown; meta?: unknown; conditional?: boolean }> {
  return buildDesired(input).map((o) => ({
    id: o.id,
    kind: o.kind,
    spec: o.spec,
    ...(o.meta ? { meta: o.meta } : {}),
    // Pinned in the goldens deliberately (item 37): a change that flips an
    // object's conditionality changes what a fresh install creates, and an
    // unprojected field is invisible to the net.
    ...(o.conditional ? { conditional: true } : {}),
  }));
}

/**
 * The variant matrix. Each row names the automations it is ALLOWED to change;
 * every id it SHARES with the default must stay byte-identical.
 *
 * QA finding H4: four rows used to declare `affects: '*'`, which skipped the
 * non-perturbation half entirely. That was an excuse, not a necessity - the
 * comparison already ignores ids the base does not have, so a changed zone or
 * season set is perfectly checkable. The `four-zones` row is the load-bearing
 * one: "adding a fourth zone must not rewrite the other three zones' fan
 * automations" is a real user scenario and was entirely unasserted.
 */
export const VARIANTS: Array<{
  name: string;
  overrides: FixtureOverrides;
  affects: string[];
  note: string;
}> = [
  {
    name: 'eco-preset-named',
    overrides: { features: { eco_preset: 'away' } },
    affects: ['climate_mzcs_engine'],
    note: 'A different standby preset rewrites three engine strings and nothing else.',
  },
  {
    name: 'eco-preset-disabled',
    overrides: { features: { eco_preset: false } },
    affects: ['climate_mzcs_engine'],
    note: 'Disabling the stand-down drops the preset clause from the engine only.',
  },
  {
    name: 'fan-guard',
    overrides: { features: { fan_guard: 'input_boolean.hvac_fan_guard' } },
    affects: [
      'climate_mzcs_fan_timer_zone_one',
      'climate_mzcs_fan_timer_zone_two',
      'climate_mzcs_fan_timer_zone_three',
    ],
    note: 'The guard condition is per-zone fan automations; the engine must not move.',
  },
  {
    name: 'fan-timer-off',
    overrides: { features: { fan_timer: [] } },
    affects: [],
    note: 'Fan automations disappear from the inventory; the surviving payloads are unchanged.',
  },
  {
    name: 'anomaly-alerts-off',
    overrides: { features: { anomaly_alerts: false } },
    affects: [],
    note: 'runtime_alert leaves the inventory; the surviving payloads are unchanged.',
  },
  {
    name: 'single-zone',
    overrides: { zones: [CANONICAL_ZONES[0]!] },
    affects: ['climate_mzcs_engine', 'climate_mzcs_runtime_learning', 'climate_mzcs_runtime_alert'],
    note: 'Zone set changes the three zone-loop automations. The watchdog and the surviving fan automation must NOT move.',
  },
  {
    name: 'four-zones',
    overrides: { zones: [...CANONICAL_ZONES, { entity: 'climate.zone_four', name: 'Zone Four' }] },
    affects: ['climate_mzcs_engine', 'climate_mzcs_runtime_learning', 'climate_mzcs_runtime_alert'],
    note: 'The documented maximum. The three existing zone fan automations and the watchdog must NOT move.',
  },
  {
    name: 'single-season',
    overrides: { seasons: [CANONICAL_SEASONS[0]!] },
    affects: ['climate_mzcs_engine'],
    note: 'Only the engine reads seasons.',
  },
  {
    name: 'with-weather',
    overrides: { weather_entity: 'weather.forecast_home' },
    affects: [],
    note: 'A weather entity flips the outdoor pair unconditional (item 37) and must change NO automation.',
  },
  {
    name: 'three-seasons',
    overrides: {
      seasons: [...CANONICAL_SEASONS, { key: 'shoulder', name: 'Shoulder', default_mode: 'heat_cool' }],
    },
    affects: ['climate_mzcs_engine'],
    note: 'A third season appears in the map and the triggers, and touches nothing else.',
  },
  {
    name: 'alternate-prefix',
    overrides: { prefix: 'hvac' },
    affects: [],
    note: 'A second card instance shares NO id with the default, so the per-id check is vacuous here by nature; the collision assertions cover this row instead.',
  },
];
