// Automation config generators (S12b). Parametric reproductions of the
// automations proven live in S6-S11, built from CONTRACT names for any
// prefix/zone set. Pure functions - the executor POSTs these payloads.

import { zoneEntityId, zoneScheduleId, globalEntityId, automationUniqueId, automationAlias } from './naming';
import type { ProvisionZone, ProvisionSeason } from './provisioning';

const MANAGED = 'Managed by Multi-Zone Climate Scheduler Card (mzcs).';

export interface ZoneRef extends ProvisionZone {
  climate: string;
}

/**
 * Canonical (key-order independent) string form of a JSON-serializable value.
 * SHARED by the differ's specEqual and the signature system - if these two
 * canonicalizations ever diverged, phantom Updates or wrongly-"customized"
 * automations would follow (scan S13-C2), so there is exactly one.
 */
export function canonicalString(x: unknown): string {
  if (Array.isArray(x)) return `[${x.map(canonicalString).join(',')}]`;
  if (x !== null && typeof x === 'object') {
    const o = x as Record<string, unknown>;
    return `{${Object.keys(o).sort().map((k) => `${JSON.stringify(k)}:${canonicalString(o[k])}`).join(',')}}`;
  }
  return JSON.stringify(x);
}

/** Deterministic hash of a JSON-serializable config (key-order independent). */
export function canonicalHash(v: unknown): string {
  const s = canonicalString(v);
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(16).padStart(8, '0');
}

const SIG_RE = /\[mzcs-sig:([0-9a-f]{8})\]/;

/** Extract the embedded signature from an automation description, if present. */
export function parseSignature(description: unknown): string | null {
  const m = typeof description === 'string' ? description.match(SIG_RE) : null;
  return m ? m[1]! : null;
}

/**
 * Hash of an automation config with only the [mzcs-sig:...] token stripped from
 * the description. Description-only hand edits (user notes) therefore count as
 * customization too - an automation whose content hash equals its embedded
 * signature has never been touched since the generator wrote it.
 */
export function contentHash(config: Record<string, unknown>): string {
  const desc = String(config.description ?? '').replace(SIG_RE, '').trimEnd();
  return canonicalHash({ ...config, description: desc });
}

/** Stamp a generated config with its own content signature. */
function signed(config: Record<string, unknown>): Record<string, unknown> {
  const sig = contentHash(config);
  return { ...config, description: `${String(config.description ?? '')} [mzcs-sig:${sig}]` };
}

/**
 * Current-generation signatures for every managed automation, keyed by unique
 * id. The differ compares these against the signatures embedded in the live
 * automations to detect staleness (zones/seasons/generator changes).
 */
export function automationSignatures(
  prefix: string,
  zones: ZoneRef[],
  seasons: ProvisionSeason[],
  fanGuard?: string,
): Record<string, string> {
  // Each generator returns signed(...), so the payload's own embedded token IS
  // its content hash (contentHash(signed(c)) === contentHash(c) by the SIG_RE
  // strip) - reading it back avoids a second full canonicalization per payload.
  const sigOf = (p: Record<string, unknown>): string => parseSignature(p.description)!;
  const out: Record<string, string> = {
    [automationUniqueId(prefix, 'engine')]: sigOf(engineAutomation(prefix, zones, seasons)),
    [automationUniqueId(prefix, 'watchdog')]: sigOf(watchdogAutomation(prefix)),
    [automationUniqueId(prefix, 'runtime_learning')]: sigOf(learningAutomation(prefix, zones)),
    [automationUniqueId(prefix, 'runtime_alert')]: sigOf(runtimeAlertAutomation(prefix, zones)),
  };
  for (const z of zones) {
    out[automationUniqueId(prefix, `fan_timer_${z.slug}`)] = sigOf(fanAutomation(prefix, z, fanGuard));
  }
  return out;
}

export function engineAutomation(
  prefix: string,
  zones: ZoneRef[],
  seasons: ProvisionSeason[],
): Record<string, unknown> {
  const schedules = zones.flatMap((z) => seasons.map((s) => zoneScheduleId(prefix, z.slug, s.key)));
  const enables = zones.map((z) => zoneEntityId('zone_enabled', prefix, z.slug));
  // Season keys are STABLE while display names can be renamed - resolve the
  // schedule key through an explicit name->key map, falling back to lowercase
  // for pre-rename installs where key == lower(name).
  const seasonMap = `{${seasons.map((s) => `'${s.name.replace(/'/g, '')}': '${s.key}'`).join(', ')}}`;
  return signed({
    id: automationUniqueId(prefix, 'engine'),
    alias: automationAlias(prefix, 'engine'),
    description: `${MANAGED} Applies the active season's schedule block to each ENABLED zone at block transitions. Per-zone applied-block markers mean manual changes and external raises HOLD until the next block; the 15-minute tick only recovers missed transitions. Zones stand down while their Eco preset is active. heat_cool blocks apply dual setpoints.`,
    mode: 'queued',
    max: 5,
    triggers: [
      { trigger: 'state', entity_id: schedules, alias: 'Any zone schedule changed' },
      { trigger: 'homeassistant', event: 'start', alias: 'HA started' },
      { trigger: 'time_pattern', minutes: '/15', alias: 'Safety tick' },
      { trigger: 'state', entity_id: globalEntityId('season_select', prefix), alias: 'Season changed' },
      { trigger: 'state', entity_id: enables, to: 'on', alias: 'Zone re-enabled' },
    ],
    conditions: [],
    actions: [
      {
        alias: 'Resolve the active season key',
        variables: {
          season: `{{ ${seasonMap}.get(states('${globalEntityId('season_select', prefix)}'), states('${globalEntityId('season_select', prefix)}') | lower) }}`,
        },
      },
      {
        alias: 'Apply per zone',
        repeat: {
          for_each: zones.map((z) => ({
            zone: z.slug,
            climate: z.climate,
            marker: zoneEntityId('applied_block_marker', prefix, z.slug),
            enabled: zoneEntityId('zone_enabled', prefix, z.slug),
          })),
          sequence: [
            {
              alias: "Read this zone's active block",
              variables: {
                blk: `{{ state_attr('schedule.${prefix}_' ~ repeat.item.zone ~ '_' ~ season, 'block') }}`,
                blk_mode: `{{ state_attr('schedule.${prefix}_' ~ repeat.item.zone ~ '_' ~ season, 'mode') }}`,
                blk_cool: `{{ state_attr('schedule.${prefix}_' ~ repeat.item.zone ~ '_' ~ season, 'cool_temp') }}`,
                blk_heat: `{{ state_attr('schedule.${prefix}_' ~ repeat.item.zone ~ '_' ~ season, 'heat_temp') }}`,
              },
            },
            {
              alias: 'Skip when zone disabled, already applied, Eco active, or no block data',
              condition: 'template',
              value_template:
                "{{ is_state(repeat.item.enabled, 'on') and blk is not none and blk != states(repeat.item.marker) and state_attr(repeat.item.climate, 'preset_mode') != 'eco' }}",
            },
            {
              alias: 'Apply the block (dual range, off, or single target)',
              // One zone's service failure must not starve the zones after it
              // in the loop; the marker below still records the attempt so the
              // engine does not retry-spam every trigger.
              continue_on_error: true,
              choose: [
                {
                  conditions: [{ condition: 'template', value_template: "{{ blk_mode == 'heat_cool' }}" }],
                  sequence: [
                    {
                      alias: 'Apply heat_cool range',
                      action: 'climate.set_temperature',
                      target: { entity_id: '{{ repeat.item.climate }}' },
                      data: { target_temp_high: '{{ blk_cool }}', target_temp_low: '{{ blk_heat }}', hvac_mode: 'heat_cool' },
                    },
                  ],
                },
                {
                  conditions: [{ condition: 'template', value_template: "{{ blk_mode == 'off' }}" }],
                  sequence: [
                    {
                      alias: 'Turn the zone off',
                      action: 'climate.set_hvac_mode',
                      target: { entity_id: '{{ repeat.item.climate }}' },
                      data: { hvac_mode: 'off' },
                    },
                  ],
                },
                {
                  conditions: [
                    {
                      condition: 'template',
                      value_template: '{{ blk_cool is not none or blk_heat is not none }}',
                    },
                  ],
                  sequence: [
                    {
                      alias: 'Apply single target',
                      action: 'climate.set_temperature',
                      target: { entity_id: '{{ repeat.item.climate }}' },
                      data: {
                        temperature: '{{ blk_cool if blk_cool is not none else blk_heat }}',
                        hvac_mode: '{{ blk_mode }}',
                      },
                    },
                  ],
                },
              ],
              default: [],
            },
            {
              alias: 'Record the applied block',
              action: 'input_text.set_value',
              target: { entity_id: '{{ repeat.item.marker }}' },
              data: { value: '{{ blk }}' },
            },
          ],
        },
      },
    ],
  });
}

export function fanAutomation(prefix: string, zone: ZoneRef, guard?: string): Record<string, unknown> {
  return signed({
    id: automationUniqueId(prefix, `fan_timer_${zone.slug}`),
    alias: automationAlias(prefix, 'fan_timer', zone.name),
    description: `${MANAGED} Turns the ${zone.name} fan off when its fan timer ends.`,
    mode: 'single',
    triggers: [
      {
        trigger: 'event',
        event_type: 'timer.finished',
        event_data: { entity_id: zoneEntityId('fan_timer', prefix, zone.slug) },
        alias: `${zone.name} fan timer finished`,
      },
    ],
    conditions: guard
      ? [
          {
            alias: 'Stand down while the fan-guard helper wants the fan running',
            condition: 'state',
            entity_id: guard,
            state: 'off',
          },
        ]
      : [],
    actions: [
      {
        alias: `Turn the ${zone.name} fan off`,
        action: 'climate.set_fan_mode',
        target: { entity_id: zone.climate },
        data: { fan_mode: 'off' },
      },
    ],
  });
}

export function learningAutomation(prefix: string, zones: ZoneRef[]): Record<string, unknown> {
  return signed({
    id: automationUniqueId(prefix, 'runtime_learning'),
    alias: automationAlias(prefix, 'runtime_learning'),
    description: `${MANAGED} Nightly EMA update of each zone's runtime-per-cooling-degree-day factor. Skips mild days; first valid day seeds directly.`,
    mode: 'single',
    triggers: [{ trigger: 'time', at: '23:58:00', alias: 'Nightly close' }],
    conditions: [],
    actions: [
      {
        alias: "Compute today's cooling degree-days",
        variables: {
          cdd: `{{ [ (states('sensor.${prefix}_outdoor_daily_mean') | float(0)) - (states('${globalEntityId('cdd_base', prefix)}') | float(75)), 0 ] | max }}`,
          alpha: `{{ 2 / ((states('${globalEntityId('runtime_learn_days', prefix)}') | float(30)) + 1) }}`,
        },
      },
      { alias: 'Skip mild days', condition: 'template', value_template: '{{ cdd > 0.5 }}' },
      {
        alias: 'Update k per zone',
        repeat: {
          for_each: zones.map((z) => ({
            runtime: zoneEntityId('runtime_today', prefix, z.slug),
            k: zoneEntityId('k_factor', prefix, z.slug),
          })),
          sequence: [
            {
              alias: 'Compute the EMA',
              variables: {
                runtime_h: '{{ states(repeat.item.runtime) | float(-1) }}',
                old_k: '{{ states(repeat.item.k) | float(0) }}',
              },
            },
            { alias: 'Skip if unavailable', condition: 'template', value_template: '{{ runtime_h >= 0 }}' },
            {
              alias: 'Write the new k',
              action: 'input_number.set_value',
              target: { entity_id: '{{ repeat.item.k }}' },
              data: {
                value:
                  '{{ ((runtime_h / cdd) if old_k == 0 else (alpha * (runtime_h / cdd) + (1 - alpha) * old_k)) | round(2) }}',
              },
            },
          ],
        },
      },
    ],
  });
}

export function watchdogAutomation(prefix: string): Record<string, unknown> {
  const engineEntity = 'automation.' + automationAlias(prefix, 'engine').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return signed({
    id: automationUniqueId(prefix, 'watchdog'),
    alias: automationAlias(prefix, 'watchdog'),
    description: `${MANAGED} Alerts when the schedule engine automation is off or unavailable for 5 minutes.`,
    mode: 'single',
    triggers: [
      { trigger: 'state', entity_id: engineEntity, to: ['off', 'unavailable'], for: { minutes: 5 }, alias: 'Engine down' },
    ],
    conditions: [],
    actions: [
      {
        alias: 'Notify all admins via persistent notification',
        action: 'persistent_notification.create',
        data: {
          title: 'Climate schedule engine is down',
          message:
            'The Climate: schedule engine automation is off or unavailable. Zone schedules are not being applied - your thermostats hold their last setpoints (their own app schedules still work).',
        },
      },
    ],
  });
}

export function runtimeAlertAutomation(prefix: string, zones: ZoneRef[]): Record<string, unknown> {
  return signed({
    id: automationUniqueId(prefix, 'runtime_alert'),
    alias: automationAlias(prefix, 'runtime_alert'),
    description: `${MANAGED} Evening check: notifies when a zone's runtime is over the weather-normalized expectation by the alert margin. Uses learned k; silent while learning.`,
    mode: 'single',
    triggers: [{ trigger: 'time', at: '20:00:00', alias: 'Evening check' }],
    conditions: [],
    actions: [
      {
        alias: 'Check each zone',
        repeat: {
          for_each: zones.map((z) => ({
            name: z.name,
            runtime: zoneEntityId('runtime_today', prefix, z.slug),
            expected: zoneEntityId('expected_runtime', prefix, z.slug),
          })),
          sequence: [
            {
              alias: 'Compute exceedance',
              variables: {
                run_h: '{{ states(repeat.item.runtime) | float(0) }}',
                exp_h: '{{ states(repeat.item.expected) | float(0) }}',
                margin: `{{ states('${globalEntityId('runtime_alert_margin', prefix)}') | float(35) }}`,
              },
            },
            {
              alias: 'Only alert on a real, learned exceedance',
              condition: 'template',
              value_template: '{{ exp_h > 0 and run_h > exp_h * (1 + margin / 100) and (run_h - exp_h) > 1 }}',
            },
            {
              alias: 'Notify',
              action: 'persistent_notification.create',
              data: {
                title: 'HVAC running high',
                message:
                  "{{ repeat.item.name }} has run {{ run_h | round(1) }}h today vs ~{{ exp_h | round(1) }}h expected for this weather. Worth a look (filters, doors, refrigerant).",
              },
            },
          ],
        },
      },
    ],
  });
}
