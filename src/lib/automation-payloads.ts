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
 * The season name -> key map, shared VERBATIM by the engine and the steering
 * automation (and mirrored by the executor's next-block template). One
 * construction so the two generated maps cannot drift apart.
 */
function seasonMapExpr(seasons: ProvisionSeason[]): string {
  return `{${seasons.map((s) => `'${s.name.replace(/'/g, '')}': '${s.key}'`).join(', ')}}`;
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
  ecoPreset: string | null = 'eco',
  offPeakEntity: string | null = null,
  steering = false,
): Record<string, string> {
  // Each generator returns signed(...), so the payload's own embedded token IS
  // its content hash (contentHash(signed(c)) === contentHash(c) by the SIG_RE
  // strip) - reading it back avoids a second full canonicalization per payload.
  const sigOf = (p: Record<string, unknown>): string => parseSignature(p.description)!;
  const out: Record<string, string> = {
    [automationUniqueId(prefix, 'engine')]: sigOf(
      engineAutomation(prefix, zones, seasons, ecoPreset, offPeakEntity, steering),
    ),
    [automationUniqueId(prefix, 'watchdog')]: sigOf(watchdogAutomation(prefix)),
    [automationUniqueId(prefix, 'runtime_learning')]: sigOf(learningAutomation(prefix, zones)),
    [automationUniqueId(prefix, 'runtime_alert')]: sigOf(runtimeAlertAutomation(prefix, zones)),
  };
  // Signed only when the feature is on: the signature map's key set must
  // mirror what the config can desire (a default install signs no steering).
  if (steering) {
    out[automationUniqueId(prefix, 'steering')] = sigOf(steeringAutomation(prefix, zones, seasons, ecoPreset));
  }
  for (const z of zones) {
    out[automationUniqueId(prefix, `fan_timer_${z.slug}`)] = sigOf(fanAutomation(prefix, z, fanGuard));
  }
  return out;
}

/**
 * Seam 1 - the applied-setpoint step. Every feature that adjusts what the
 * engine writes (off-peak comfort now, any future contributor) plugs in HERE,
 * never as its own template branch: one place computes the applied values, so
 * two features can never fight over the same setpoint.
 *
 * With no adjustment feature configured, `step` is null and every expression
 * is the legacy `blk_*` string VERBATIM - the default engine output must stay
 * byte-identical (pinned by the golden/signature tests).
 */
interface AdjustmentSeam {
  /** Extra variables step after the block read; null = nothing emitted. */
  step: Record<string, unknown> | null;
  /** heat_cool branch: cool / heat values. */
  coolExpr: string;
  heatExpr: string;
  /** Single-target branch temperature. */
  singleExpr: string;
  /** What the skip gate compares and the record step writes. */
  markerExpr: string;
}

function adjustmentSeam(prefix: string, offPeakEntity: string | null): AdjustmentSeam {
  const legacy: AdjustmentSeam = {
    step: null,
    coolExpr: '{{ blk_cool }}',
    heatExpr: '{{ blk_heat }}',
    singleExpr: '{{ blk_cool if blk_cool is not none else blk_heat }}',
    markerExpr: 'blk',
  };
  // Same quote-stripping the eco preset gets: a stray apostrophe in a
  // hand-edited entity id would terminate the Jinja string literal.
  const entity = offPeakEntity === null ? '' : offPeakEntity.replace(/['"\\]/g, '').trim();
  if (!entity) return legacy;
  const offsetHelper = globalEntityId('off_peak_offset', prefix);
  const pausedHelper = globalEntityId('off_peak_paused_on', prefix);
  return {
    // `adj` is 0 unless the day entity is ON and today is not paused, so a
    // missing/unavailable/deleted entity or offset helper fails safe to the
    // written schedule (spec test 4; the helper fallback is float(0), NOT the
    // seed - QA finding E7). The pause helper holds an ISO INSTANT written by
    // the card; the engine derives "paused today" in ITS OWN local day, so a
    // browser in another timezone cannot desynchronize pause from apply (QA
    // findings C4/E-L4). It still expires at midnight with no reset
    // automation.
    // NO absolute clamp on the adjusted values, deliberately: the offset is
    // hard-bounded 0-10 by the provisioned helper, and both candidate clamp
    // sources are provably wrong on real hardware (a mini-split reports
    // min/max_temp as CELSIUS bounds against Fahrenheit setpoints - measured
    // live; fixed degree literals break Celsius installs the other way).
    // There IS a relative guard: `hc_adj` caps the heat_cool adjustment so the
    // band never shrinks below a 2-degree deadband (the card editor's own
    // minimum gap) - without it a card-legal 72/70 block plus the default
    // offset 2 commands an INVERTED range to real hardware (QA finding E1,
    // found independently by two reviewers).
    step: {
      alias: 'Compute the applied setpoints (off-peak comfort)',
      variables: {
        adj: `{{ (states('${offsetHelper}') | float(0)) if is_state('${entity}', 'on') and ((states('${pausedHelper}') | as_datetime) is none or (states('${pausedHelper}') | as_datetime | as_local).date() != now().date()) else 0 }}`,
        hc_adj: `{{ [ adj, [ ((blk_cool | float(0)) - (blk_heat | float(0)) - 2) / 2, 0 ] | max ] | min if blk_cool is not none and blk_heat is not none else adj }}`,
        app_cool: `{{ (blk_cool | float(0)) - adj if blk_cool is not none else none }}`,
        app_heat: `{{ (blk_heat | float(0)) + adj if blk_heat is not none else none }}`,
        app_hi: `{{ (blk_cool | float(0)) - hc_adj if blk_cool is not none else none }}`,
        app_lo: `{{ (blk_heat | float(0)) + hc_adj if blk_heat is not none else none }}`,
        mark: `{{ blk ~ '|op' ~ adj }}`,
      },
    },
    coolExpr: '{{ app_hi }}',
    heatExpr: '{{ app_lo }}',
    singleExpr: '{{ app_cool if blk_cool is not none else app_heat }}',
    // The marker carries the applied adjustment, so an off-peak flip OR an
    // offset tune re-applies within one 15-minute safety tick (spec §5).
    markerExpr: 'mark',
  };
}

/**
 * Seam 2 - the skip gate, built from an ORDERED term list: enabled, block
 * present, marker differs, standby preset, then one term per configured
 * feature (steering's override timer next; guard/presence terms later). Every
 * feature that stands a zone down joins this list; nothing else may edit the
 * gate. Emitted variants are pinned as EXACT strings across the whole matrix.
 */
function skipGateTemplate(markerExpr: string, presetClause: string, extraTerms: string[]): string {
  const extras = extraTerms.map((t) => ` and ${t}`).join('');
  return `{{ is_state(repeat.item.enabled, 'on') and blk is not none and ${markerExpr} != states(repeat.item.marker)${presetClause}${extras} }}`;
}

export function engineAutomation(
  prefix: string,
  zones: ZoneRef[],
  seasons: ProvisionSeason[],
  ecoPreset: string | null = 'eco',
  offPeakEntity: string | null = null,
  steering = false,
): Record<string, unknown> {
  // For the default 'eco' every string below is byte-identical to the
  // original generator, so existing installs keep their signature and plan
  // NO engine update. Only a changed setting regenerates.
  const preset = ecoPreset === null ? null : ecoPreset.replace(/['"\\]/g, '').trim() || 'eco';
  const standDown =
    preset === null
      ? ''
      : preset === 'eco'
        ? ' Zones stand down while their Eco preset is active.'
        : ` Zones stand down while their '${preset}' preset is active.`;
  const skipAlias =
    preset === null
      ? 'Skip when zone disabled, already applied, or no block data'
      : preset === 'eco'
        ? 'Skip when zone disabled, already applied, Eco active, or no block data'
        : 'Skip when zone disabled, already applied, standby preset active, or no block data';
  const presetClause = preset === null ? '' : ` and state_attr(repeat.item.climate, 'preset_mode') != '${preset}'`;
  const schedules = zones.flatMap((z) => seasons.map((s) => zoneScheduleId(prefix, z.slug, s.key)));
  const enables = zones.map((z) => zoneEntityId('zone_enabled', prefix, z.slug));
  // Season keys are STABLE while display names can be renamed - resolve the
  // schedule key through an explicit name->key map, falling back to lowercase
  // for pre-rename installs where key == lower(name).
  const seasonMap = seasonMapExpr(seasons);
  const seam = adjustmentSeam(prefix, offPeakEntity);
  const offPeakSentence = seam.step
    ? ' On off-peak days (per the configured entity) applied setpoints shift toward comfort by the off-peak offset helper.'
    : '';
  const steeringSentence = steering
    ? ' Comfort steering owns a zone while its room-override timer is active; this engine skips it until the steering automation reverts.'
    : '';
  return signed({
    id: automationUniqueId(prefix, 'engine'),
    alias: automationAlias(prefix, 'engine'),
    description: `${MANAGED} Applies the active season's schedule block to each ENABLED zone at block transitions. Per-zone applied-block markers mean manual changes and external raises HOLD until the next block; the 15-minute tick only recovers missed transitions.${standDown} heat_cool blocks apply dual setpoints.${offPeakSentence}${steeringSentence}`,
    mode: 'queued',
    max: 5,
    triggers: [
      { trigger: 'state', entity_id: schedules, alias: 'Any zone schedule changed' },
      { trigger: 'homeassistant', event: 'start', alias: 'HA started' },
      { trigger: 'time_pattern', minutes: '/15', alias: 'Safety tick' },
      { trigger: 'state', entity_id: globalEntityId('season_select', prefix), alias: 'Season changed' },
      { trigger: 'state', entity_id: enables, to: 'on', alias: 'Zone re-enabled' },
      // Steering's revert clears a zone's marker to ''; firing on that closes
      // the up-to-15-minute re-assert gap after an override ends (QA L6).
      ...(steering
        ? [
            {
              trigger: 'state',
              entity_id: zones.map((z) => zoneEntityId('applied_block_marker', prefix, z.slug)),
              to: '',
              alias: 'Steering released a zone',
            },
          ]
        : []),
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
            ...(steering ? { override_timer: zoneEntityId('room_override_timer', prefix, z.slug) } : {}),
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
            ...(seam.step ? [seam.step] : []),
            {
              alias: skipAlias,
              condition: 'template',
              value_template: skipGateTemplate(
                seam.markerExpr,
                presetClause,
                // Seam 2, steering term (spec §3): steering owns the zone
                // while its override timer runs - but ONLY on cooling blocks,
                // the only blocks steering acts on. On a scheduled transition
                // to off/heat/heat_cool mid-override the engine reclaims the
                // zone immediately instead of leaving it cooling through an
                // OFF period (QA finding M5); steering refuses non-cool
                // blocks, so they never fight.
                steering ? ["not (is_state(repeat.item.override_timer, 'active') and blk_mode == 'cool')"] : [],
              ),
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
                      data: { target_temp_high: seam.coolExpr, target_temp_low: seam.heatExpr, hvac_mode: 'heat_cool' },
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
                        temperature: seam.singleExpr,
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
              data: { value: `{{ ${seam.markerExpr} }}` },
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

/**
 * Comfort steering (item 8, spec mzcs_steering_design.md), v1 = the temporary
 * override path, COOL-ONLY by decision. One automation for all zones:
 *
 * - REVERT branch (a timer.finished/cancelled event): clear that zone's
 *   applied-block marker so the engine re-asserts the scheduled block on its
 *   next trigger (spec §3 ordering - marker first, then the engine sees the
 *   zone again via its own gate term).
 * - STEER branch (everything else): for each zone whose override timer is
 *   active, command `thermostat_reading - (room_reading - target)`, clamped to
 *   the steer band and to ±max_offset of the scheduled block's cool setpoint.
 *   Refusals (stale/unreadable room, missing target, non-cool block, standby
 *   preset) skip the write and leave the last commanded value; the timer's end
 *   still reverts the zone. A zone DISABLED mid-override gets its timer
 *   cancelled - the kill switch outranks everything.
 *
 * Zones without room sensors provision the steering objects but are never in
 * the steer loop - there is no reading to steer by.
 */
export function steeringAutomation(
  prefix: string,
  zones: ZoneRef[],
  seasons: ProvisionSeason[],
  ecoPreset: string | null = 'eco',
): Record<string, unknown> {
  const preset = ecoPreset === null ? null : ecoPreset.replace(/['"\\]/g, '').trim() || 'eco';
  const presetClause =
    preset === null ? '' : ` and state_attr(repeat.item.climate, 'preset_mode') != '${preset}'`;
  const timerId = (z: ZoneRef) => zoneEntityId('room_override_timer', prefix, z.slug);
  // Freshness of a room reading, for ANY room-entity expression: numeric,
  // recently reported, AND - when the row configured a last_seen companion -
  // the companion's timestamp is recent too. Without the companion clause the
  // automation trusts last_reported alone, which a restart's retained-MQTT
  // replay refreshes for a dead device - the exact item-36 blind spot the
  // 0.7.4 card work closed (QA finding E5). One builder, used by both the
  // steer refusal and the daypart pilot, so the two gates cannot drift.
  const freshExpr = (roomVar: string): string =>
    `states(${roomVar}) | float(-999) > -900` +
    ` and states[${roomVar}] is not none and now() - states[${roomVar}].last_reported < timedelta(hours=3)` +
    ` and (repeat.item.seens.get(${roomVar}) is none or ((states(repeat.item.seens.get(${roomVar})) | as_datetime) is not none and now() - (states(repeat.item.seens.get(${roomVar})) | as_datetime) < timedelta(hours=3)))`;
  const steerable = zones.filter((z) => (z.rooms ?? []).length > 0);
  const roomEntities = [...new Set(steerable.flatMap((z) => (z.rooms ?? []).map((r) => r.entity)))];
  // timer -> marker map for the revert branch; generated from the naming
  // contract so no Jinja ever hand-assembles an id.
  const revertMap = `{${zones
    .map((z) => `'${timerId(z)}': '${zoneEntityId('applied_block_marker', prefix, z.slug)}'`)
    .join(', ')}}`;
  const sel = globalEntityId('season_select', prefix);
  return signed({
    id: automationUniqueId(prefix, 'steering'),
    alias: automationAlias(prefix, 'steering'),
    description: `${MANAGED} Drives a zone's thermostat so the SELECTED ROOM reaches the override target while the room-override timer runs (cool only). Commanded setpoint = thermostat reading minus how far the room is above target, clamped to the steering band and to the max offset from the scheduled block. When the timer ends or is cancelled, the applied-block marker is cleared so the schedule engine re-asserts the block on its next trigger.`,
    // max 25, not 10: the queue is shared by chatty room-sensor triggers and
    // the timer.finished/cancelled events the revert depends on; a full queue
    // DROPS triggers (QA finding M4). A dropped revert degrades to the
    // documented manual-hold-until-next-block semantics, so depth is the
    // mitigation, not a redesign.
    mode: 'queued',
    max: 25,
    triggers: [
      ...(roomEntities.length
        ? [{ trigger: 'state', entity_id: roomEntities, alias: 'A steered room reading changed' }]
        : []),
      ...(steerable.length
        ? [
            {
              trigger: 'state',
              entity_id: steerable.map((z) => zoneEntityId('sensor_schedule', prefix, z.slug)),
              alias: 'A daypart boundary passed',
            },
          ]
        : []),
      {
        trigger: 'state',
        entity_id: zones.map((z) => timerId(z)),
        to: 'active',
        alias: 'An override started',
      },
      ...zones.map((z) => ({
        trigger: 'event',
        event_type: 'timer.finished',
        event_data: { entity_id: timerId(z) },
        alias: `${z.name} override timer finished`,
      })),
      ...zones.map((z) => ({
        trigger: 'event',
        event_type: 'timer.cancelled',
        event_data: { entity_id: timerId(z) },
        alias: `${z.name} override cancelled`,
      })),
      { trigger: 'time_pattern', minutes: '/5', alias: 'Safety tick' },
      { trigger: 'homeassistant', event: 'start', alias: 'HA started' },
    ],
    conditions: [],
    actions: [
      {
        alias: 'Revert on a timer event, steer otherwise',
        choose: [
          {
            conditions: [{ condition: 'template', value_template: "{{ trigger.platform == 'event' }}" }],
            sequence: [
              {
                alias: "Resolve which zone's override ended",
                variables: { marker: `{{ ${revertMap}.get(trigger.event.data.entity_id) }}` },
              },
              {
                alias: 'Only timers this card manages',
                condition: 'template',
                value_template: '{{ marker is not none }}',
              },
              {
                alias: 'Clear the applied-block marker so the engine re-asserts the schedule',
                action: 'input_text.set_value',
                target: { entity_id: '{{ marker }}' },
                data: { value: '' },
              },
            ],
          },
        ],
        default: [
          {
            alias: 'Resolve the active season key',
            variables: {
              season: `{{ ${seasonMapExpr(seasons)}.get(states('${sel}'), states('${sel}') | lower) }}`,
            },
          },
          {
            alias: 'Steer each zone with an active override',
            repeat: {
              for_each: steerable.map((z) => ({
                zone: z.slug,
                climate: z.climate,
                timer: timerId(z),
                select: zoneEntityId('target_room_select', prefix, z.slug),
                target: zoneEntityId('steer_target', prefix, z.slug),
                enabled: zoneEntityId('zone_enabled', prefix, z.slug),
                sensor_schedule: zoneEntityId('sensor_schedule', prefix, z.slug),
                rooms: Object.fromEntries((z.rooms ?? []).map((r) => [r.label, r.entity])),
                labels: Object.fromEntries((z.rooms ?? []).map((r) => [r.entity, r.label])),
                seens: Object.fromEntries((z.rooms ?? []).filter((r) => r.seen).map((r) => [r.entity, r.seen!])),
              })),
              sequence: [
                {
                  alias: "Resolve this zone's steering inputs",
                  variables: {
                    room: '{{ repeat.item.rooms.get(states(repeat.item.select)) }}',
                    blk_mode: `{{ state_attr('schedule.${prefix}_' ~ repeat.item.zone ~ '_' ~ season, 'mode') }}`,
                    blk_cool: `{{ state_attr('schedule.${prefix}_' ~ repeat.item.zone ~ '_' ~ season, 'cool_temp') }}`,
                    dp_label:
                      "{{ repeat.item.labels.get(state_attr(repeat.item.sensor_schedule, 'sensor')) }}",
                    dp_room: '{{ repeat.item.rooms.get(dp_label) }}',
                    dp_fresh: `{{ dp_room is not none and ${freshExpr('dp_room')} }}`,
                  },
                },
                {
                  // Dayparts (stage 4): the pilot REUSES the temporary
                  // mechanism - it starts the same override the card would,
                  // targeting the scheduled setpoint at the daypart's room,
                  // until the daypart ends. It never touches an ACTIVE timer,
                  // so a manual override always wins until it expires (the
                  // agreed precedence), and cancelling one simply lets the
                  // pilot resume within a safety tick.
                  alias: 'Daypart pilot - start the scheduled steer when no override is running',
                  choose: [
                    {
                      conditions: [
                        {
                          // blk_cool must land inside the steer_target
                          // helper's hard 50-95 bounds, or set_value below
                          // throws and ABORTS the whole run mid-loop, starving
                          // every later zone's kill-switch check (QA finding
                          // E2; always true on Celsius installs - steering is
                          // Fahrenheit-only in v1). dp_fresh keeps the pilot
                          // from arming an override on a dead/frozen sensor
                          // and locking the engine out for a whole daypart.
                          condition: 'template',
                          value_template: `{{ dp_label is not none and is_state(repeat.item.timer, 'idle') and is_state(repeat.item.enabled, 'on') and blk_mode == 'cool' and blk_cool is not none and blk_cool | float(0) >= 50 and blk_cool | float(0) <= 95 and dp_fresh${presetClause} }}`,
                        },
                      ],
                      sequence: [
                        {
                          alias: 'Point the zone at the daypart room',
                          continue_on_error: true,
                          action: 'input_select.select_option',
                          target: { entity_id: '{{ repeat.item.select }}' },
                          data: { option: '{{ dp_label }}' },
                        },
                        {
                          alias: 'Target the scheduled setpoint at that room',
                          continue_on_error: true,
                          action: 'input_number.set_value',
                          target: { entity_id: '{{ repeat.item.target }}' },
                          data: { value: '{{ blk_cool | float }}' },
                        },
                        {
                          alias: 'Run the override until the daypart ends',
                          continue_on_error: true,
                          action: 'timer.start',
                          target: { entity_id: '{{ repeat.item.timer }}' },
                          data: {
                            duration:
                              "{{ [ ((state_attr(repeat.item.sensor_schedule, 'next_event') - now()).total_seconds() | int) if state_attr(repeat.item.sensor_schedule, 'next_event') is not none else 1800, 300 ] | max }}",
                          },
                        },
                      ],
                    },
                  ],
                  default: [],
                },
                {
                  alias: 'Cancel the override if its zone was disabled mid-override',
                  choose: [
                    {
                      conditions: [
                        {
                          condition: 'template',
                          value_template:
                            "{{ is_state(repeat.item.timer, 'active') and not is_state(repeat.item.enabled, 'on') }}",
                        },
                      ],
                      sequence: [
                        {
                          alias: 'Cancel this override - the kill switch outranks steering',
                          continue_on_error: true,
                          action: 'timer.cancel',
                          target: { entity_id: '{{ repeat.item.timer }}' },
                        },
                      ],
                    },
                  ],
                  default: [],
                },
                {
                  alias: 'Steer only an enabled zone with an active override on a cooling block',
                  condition: 'template',
                  value_template: `{{ is_state(repeat.item.timer, 'active') and is_state(repeat.item.enabled, 'on') and room is not none and blk_mode == 'cool' and blk_cool is not none${presetClause} }}`,
                },
                {
                  alias: 'Read the room, the thermostat and the target',
                  variables: {
                    t_room: '{{ states(room) | float(-999) }}',
                    room_fresh: `{{ ${freshExpr('room')} }}`,
                    t_thermo: "{{ state_attr(repeat.item.climate, 'current_temperature') }}",
                    t_target: '{{ states(repeat.item.target) | float(-999) }}',
                  },
                },
                {
                  // The setpoint attribute check (QA E-INFO-6): a thermostat
                  // manually flipped to heat_cool exposes no `temperature`, so
                  // the throttle below would always pass and a doomed write
                  // would fire on every trigger.
                  alias: 'Refuse stale or unreadable inputs - the last commanded value stands',
                  condition: 'template',
                  value_template:
                    "{{ room_fresh and t_target > -900 and t_thermo is not none and state_attr(repeat.item.climate, 'temperature') is not none }}",
                },
                {
                  alias: 'Compute the commanded setpoint, clamped to the band and the block offset',
                  variables: {
                    smin: `{{ states('${globalEntityId('steer_min_setpoint', prefix)}') | float(68) }}`,
                    smax: `{{ states('${globalEntityId('steer_max_setpoint', prefix)}') | float(85) }}`,
                    moff: `{{ states('${globalEntityId('steer_max_offset', prefix)}') | float(5) }}`,
                    commanded:
                      '{{ [ [ [ [ (t_thermo | float) - (t_room - t_target), (blk_cool | float) - moff ] | max, (blk_cool | float) + moff ] | min, smin ] | max, smax ] | min | round(1) }}',
                  },
                },
                {
                  alias: 'Skip a write smaller than half a degree',
                  condition: 'template',
                  value_template:
                    "{{ (commanded - (state_attr(repeat.item.climate, 'temperature') | float(-999))) | abs >= 0.5 }}",
                },
                {
                  alias: 'Steer the zone toward the target room',
                  continue_on_error: true,
                  action: 'climate.set_temperature',
                  target: { entity_id: '{{ repeat.item.climate }}' },
                  data: { temperature: '{{ commanded }}' },
                },
              ],
            },
          },
        ],
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
