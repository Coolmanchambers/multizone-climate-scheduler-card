# MZCS CONTRACT.md - v1.2 (config-migration policy)

The naming/schema contract. Everything in the card, wizard, differ, and engine builds against
this file. Changes after freeze require a version bump + migration note.

**v1.2 (2026-08-26, message-only - no behaviour change):** added the config-migration policy
pointer to §6 and made the uniqueness of `seasons[].key` normative. `buildDesired` refuses season
sets whose keys COLLIDE - duplicate keys, or two-plus seasons with no key at all, when at least
one zone exists to collide in - with a message naming the real cause. Every such config already
failed at v0.7.1 with "rename the conflicting zone or season", advice that could not help.
Everything that provisioned at v0.7.1 still provisions: a single keyless season (measured: it
converges), distinct unusual keys (`null` beside absent, numbers, booleans), and zero-zone
configs, which emit no schedule ids to collide. No object shapes changed and no signature moved.

**v1.1 (2026-08-24, no migration needed):** synced §5's inventory to what the code actually
provisions (added the applied-block marker, per-zone k, theme, and the outdoor-temperature
chain; recorded the runtime-learning automation), marked the season recommender and comfort
steering (§7b) as deferred post-v1, simplified the shipped watchdog/alert descriptions to
match the code, added Adopt to §8's taxonomy, and corrected day-key names in §2. All changes
are contract-side: they document shipped v0.7.0 behavior; no object shapes changed.

## 1. Identity

- Card: **Multi-Zone Climate Scheduler Card** · type `custom:multizone-climate-scheduler-card`
- Repo: `Coolmanchambers/multizone-climate-scheduler-card` (public, MIT)
- Bundle: `dist/multizone-climate-scheduler-card.js` (ES2022 - Lit 3 requires it)
- Label on every provisioned object: `mzcs`. **No automation category is assigned** - category
  assignment is deferred post-v1 (§5). An earlier draft of this line promised one; the code never
  set it, and §5 is the section that governs.
- Entity prefix: user-chosen in wizard, default `climate` (examples below use it)

## 2. Zones and day-type granularity

- 1-4 zones. Zone key = slug of display name (`upstairs`, `downstairs`, `studio`).
- Per zone x season, day granularity is one of:
  - `all` - one block set (keys: `all`)
  - `wdwe` - two sets (keys: `wd`, `we`)
  - `days` - seven sets (keys: `monday`..`sunday`)
- Granularity transitions (wizard, via differ): expand = clone current values into new sets
  (all→wdwe: both get copy; wdwe→days: mon-fri get wd, sat-sun get we). Collapse = survivor set
  (days→wdwe: mon survives as wd, sat as we; →all: wd/mon survives). Preview always shows the
  survivor choice; surplus objects deleted only after confirm.

## 3. Block schema

```
block = { time: "HH:MM", name: string, mode: "cool" | "heat" | "heat_cool" | "off",
          cool_temp: number|null, heat_temp: number|null }
```
- Season carries a default mode; blocks may override.
- `heat_cool` requires both temps (cool_temp = target_temp_high, heat_temp = target_temp_low).
- Ordering: blocks sorted by time; last block of the day rules until the first block next day
  (midnight wrap).

## 4. Schedule storage - DECIDED (S1): native `schedule` helper per zone x season

**One `schedule.{prefix}_{zone}_{season}` entity per zone x season** (e.g.
`schedule.climate_upstairs_summer`). Verified against HA docs 2026-08-23: schedule blocks carry
custom data ("a mapping of attribute names to values, added to the entity's attributes when the
block is active") and the entity exposes `next_event`.

- Blocks stored as weekly time RANGES with data `{block: name, mode, cool_temp, heat_temp}`.
  Our instant-based blocks convert to contiguous ranges (block time → next block time); the
  overnight tail splits at midnight (…-24:00 + 00:00-…). Converter: `src/lib/schedule-ranges.ts`
  (pure, unit-tested).
- Because ranges are contiguous the entity is always `on`; the ENGINE TRIGGERS are:
  (1) attribute change on the active season's schedule entities (block data + next_event change
  at every boundary), (2) `input_select.{prefix}_season` change, (3) HA start, (4) a
  time-pattern safety tick (15 min) that reasserts the current block idempotently (also covers
  automation reloads), (5) a zone's enable edge (§7c instant resume).
- Granularity (`all`/`wdwe`/`days`) is a UI/wizard concept only: the editor writes identical
  blocks to every day in a set. Collapse/expand transitions rewrite day ranges per §2.
- Card tuning UI + wizard write via the `schedule/update` websocket (same command the core
  helpers UI uses). HA's native weekly-grid editor remains usable as a second editing surface.
- Sensor schedules (§7b) use the same model: `schedule.{prefix}_{zone}_sensor_schedule`, data
  `{sensor: entity_id | "thermostat"}`.

Per-value helpers (rejected Option B) are archived in the home-assistant project spec §12;
global tunables remain individual helpers (§6).

## 5. Provisioned inventory (per current config: 3 zones, 2 active seasons)

Display names are prefix-derived (`Climate ...` for the default prefix) so two card instances
never collide in HA's name→object_id slugification (S12c incident rule).

**Per zone:**
- `timer.climate_<zone>_fan` + automation "Climate: <Zone> fan timer finished"
- `binary_sensor.climate_<zone>_running` (template; from hvac_action, or - when the zone
  configures `power_entity`, 0.7.7 item 29 - an OR of power-above-standby and an hvac-active
  setpoint-delta check, for brands that never expose hvac_action - in `heat_cool` only the
  power branch applies, the setpoint being a pair; the choice is CREATION-only
  meta, never compared) [adopted if pre-existing]
- `sensor.climate_<zone>_runtime_today` (history_stats; feeds today's figure and the learning
  automation. The runtime drawer's PAST days come from the running sensor's raw recorder history
  - history_stats entries carry no state_class, so they have no long-term statistics to read)
- `sensor.climate_<zone>_runtime_mirror` (template mirroring runtime_today's value with
  `state_class: measurement`, added post-v0.7.2: it exists solely so long-term statistics accrue -
  a day's runtime is that day's LTS max. Additive; the permanent 30-day/seasonal view reads it
  once enough history exists)
- `sensor.climate_<zone>_expected_runtime` (template: k x CDD)
- `input_text.climate_<zone>_applied_block` (engine hold marker)
- `input_number.climate_<zone>_k` (learned runtime per cooling-degree-day; written nightly)
- `input_boolean.climate_<zone>_enabled` (kill switch, §7c)

**Per zone x season:** schedule storage per §4.

**Global:**
- `input_select.climate_season` (active season; options = season names)
- `input_select.climate_season_mode` (manual | semi | full) [reserved: recommender is post-v1]
- `input_number.climate_season_confirm_days` (3), `input_number.climate_season_dwell_days` (14)
  [reserved: recommender]
- `input_number.climate_dev_green_max` (2), `input_number.climate_dev_amber_max` (4)
- `input_number.climate_runtime_alert_margin` (35), `input_number.climate_runtime_alert_days`
  (3) [reserved: consecutive-days alert is post-v1], `input_number.climate_runtime_learn_days`
  (30), `input_number.climate_cdd_base` (75)
- `input_text.climate_theme` (card theme token)
- `input_number.climate_off_peak_offset` (2; 0-10, degrees of extra comfort on off-peak days)
  + `input_text.climate_off_peak_paused_on` (ISO date meaning "off-peak paused for this day";
  empty otherwise) - both created ONLY when `features.off_peak_entity` is configured (added
  0.7.5, item 7; additive)
- `sensor.climate_next_block` (template; state = earliest next_event across the active season's
  schedules; the card computes its next-block line locally)
- `sensor.climate_outdoor_temp` (template from the configured weather entity) +
  `sensor.climate_outdoor_daily_mean` (statistics mean, 24h window) - the CDD learning chain;
  creation is skipped with a note when no weather entity is configured, but both are always
  DESIRED so an existing pair is never planned for delete

**Automations (label `mzcs`):**
- "Climate: schedule engine" (block transitions → climate.set_temperature / set_hvac_mode incl.
  heat_cool dual range and off; per-zone enable + applied-block-marker + standby-preset gates;
  15-min safety tick; season name→key map). The standby gate is configurable via
  `features.eco_preset` (default `'eco'` = original behavior and byte-identical to the 0.7.0
  generator; a string names a different preset; `false` removes the gate). With
  `features.off_peak_entity` configured (0.7.5, item 7) the engine also computes applied
  setpoints on a shared adjustment step - cool minus / heat plus the live offset helper while
  the entity is `on` and today is not paused - and the applied-block marker gains an
  `|op<adj>` suffix so a mid-day flip or an offset tune re-applies within one safety tick.
  **Marker (0.7.7):** `<season>|<block>|<mode>|<cool>|<heat>` - the block's CONTENT, not its
  name alone, so a season switch or a same-named block with different setpoints applies at the
  next trigger while a manual thermostat change still holds until the next block. The gate
  also refuses an `unavailable`/`unknown` thermostat (a skipped service call is not "applied"),
  and with steering on it keeps a zone whose thermostat is not yet cooling. Both changed the
  engine signature deliberately in 0.7.7: every install plans one engine Update (and one
  runtime-learning Update, see below).
- "Climate: <Zone> fan timer finished" (per zone; stands down while the configured fan-guard
  helper is on)
- "Climate: runtime learning" (nightly 23:58 EMA of k per zone, clamped to the k helper's max
  since 0.7.7 - the clamp is what keeps an out-of-range write from aborting the loop; the
  step's `continue_on_error` only covers Home Assistant errors, not a range refusal; skips
  mild days; first valid
  day seeds directly)
- "Climate: runtime anomaly alert" (evening check, actual vs expected x margin, persistent
  notification; consecutive-days logic + iOS actionable/snooze are post-v1)
- "Climate: engine watchdog" (alert when the engine automation is off/unavailable 5 minutes)
- "Climate: season recommender" - **deferred post-v1** (needs per-season forecast-threshold
  helpers not yet in this contract; its helpers above are provisioned as reserved)

**Registry assignment:** all objects → label `mzcs` (the sole managed-marker). Area and
category assignment: deferred post-v1.

## 6. Card config schema (YAML shape the editor produces)

```yaml
type: custom:multizone-climate-scheduler-card
prefix: climate
zones:
  - entity: climate.upstairs_thermostat
    name: Upstairs
    room_sensors: [sensor.bedroom_3_temperature, ...]
    # room_sensors rows also accept {entity, name, last_seen} - last_seen names an
    # optional timestamp companion that joins that row's stale check and shows an age
    # power_entity: sensor.upstairs_hvac_power   # optional (W): running detection for
    #                               # brands without hvac_action; creation-only meta (§5)
  - entity: climate.downstairs_thermostat
    name: Downstairs
seasons:
  - { key: summer, name: Summer, default_mode: cool }
  - { key: winter, name: Winter, default_mode: heat_cool }
season_switch: manual        # manual (semi | full reserved for the post-v1 recommender)
weather_entity: weather.forecast_home   # optional; enables the CDD learning chain
features: { fan_timer: [15, 30, 60], anomaly_alerts: true, fan_guard: input_boolean.hvac_fan_guard }
# features.eco_preset: 'away'   # optional: standby preset the engine respects ('eco' default;
#                               # false disables the stand-down gate)
# features.off_peak_entity: binary_sensor.off_peak_today   # optional (0.7.5, §5): ON = today
#                               # is off-peak; the engine applies blocks shifted toward comfort
# features.off_peak_offset: 2   # optional: creation seed for the offset helper (0-10)
# features.steering: true       # optional (0.7.5, §7b): comfort steering objects + automation
# display: { last_seen: always, ageing_minutes: 45, stale_hours: 3 }   # optional, presentation
#                               # only - never reaches the engine or any provisioned object
```
`fan_guard` is optional. `room_sensors` per zone drives the read-only deviation chips.

`seasons[].key` is REQUIRED and is refused, not guessed, when absent: it is the permanent id baked
into entity names, so deriving one would move an existing install's provisioned objects. Config
shapes that have changed, and the rules governing future changes, are in
[`docs/config-compatibility.md`](docs/config-compatibility.md) - old shapes stay readable forever
(R1), the reading bundle ships before the writing one (R2), and a migration may not perturb
`buildDesired` output or automation signatures (R3).

## 7. Reference data - REMOVED (privacy, 2026-08-25)

This section held the maintainer's actual per-floor, per-season schedules from the original
onboarding: wake, away, pre-cool, evening and sleep times for a specific occupied house. It was
reference material only - a fresh install seeds a generic single "Day" block per season
(`src/lib/default-schedules.ts`) - so it has been removed rather than sanitised. The original
is retained privately.

Nothing in the card, the contract, or the tests depends on those values.

## 7b. Comfort steering - **SHIPPED 0.7.5 (v1: cool-only; temporary override + dayparts)**

Enabled via `features.steering: true` (absent/false = off, and the generated engine stays
byte-identical to a non-steering install). The steering automation generator landed in 0.7.5,
so the automation is desired exactly when the feature is on (the A2-5 phantom-Create rule holds
in its real form: desire only what a generator signs).

HA cannot select some thermostats' internal sensor (vendor API limit); the steering automation
reproduces it via **setpoint compensation**: commanded setpoint =
`thermostat_reading - (room_reading - target)`, clamped to the steering band and to
±`steer_max_offset` of the scheduled block's cool setpoint (band wins), throttled to half-degree
writes, cool-only in v1. The ENGINE skips a zone while its override timer is `active`; on
timer end or cancel the steering automation clears the applied-block marker FIRST, so the
engine re-asserts the schedule on its next trigger. Refusals (stale >3h / unreadable room,
missing target, non-cool block, standby preset) skip the write; a zone disabled mid-override
gets its timer cancelled - the kill switch outranks steering. **Dayparts** reuse the same
mechanism: a "pilot" in the steering automation starts the identical override (target = the
scheduled setpoint, duration = to the daypart's end) whenever the sensor schedule maps the
current daypart to a room and NO timer is running - so a manual override always wins until it
expires.

**Per zone:** `input_select.climate_<zone>_target_room` ("Thermostat" + one option per
configured room sensor, label = configured name else entity id),
`timer.climate_<zone>_room_override` (restore: true),
`input_number.climate_<zone>_steer_target` (50-95 step 1; the override's target temperature -
added 0.7.5 by maintainer decision 2026-08-30, the original reservation had nowhere to hold it).
**Global tunables:** `input_number.climate_override_minutes` (60),
`input_number.climate_steer_min_setpoint` (68), `input_number.climate_steer_max_setpoint` (85),
`input_number.climate_steer_max_offset` (5).
**Sensor schedule:** per zone, `schedule.climate_<zone>_sensor_schedule` - blocks identical
across all 7 days, block data `{sensor: <entity_id> | "thermostat"}`; each daypart runs to the
next one's start, the last to midnight; an empty schedule means the pilot is inert. Edited on
the settings Zones tab (start time + target per row).
**Automation:** `climate_mzcs_steering` ("Climate: comfort steering") - the revert branch, the
per-zone steer loop and the daypart pilot described above; created only under
`features.steering`.
**Card UX:** tap a room row → sheet (target temp + duration, defaults = current setpoint +
`override_minutes`) → Start; active room shows a highlighted row, countdown chip and cancel;
stale/unreadable rooms refuse to start, visibly.

## 7c. Kill switch (PRODUCT REQUIREMENT - final build)

Per zone: `input_boolean.{prefix}_{zone}_enabled` (class `zone_enabled`) + a "Scheduling · all
zones" master row on Manage. **Off = the engine stands down for that zone and the thermostat's
own app governs.** This is the user's escape hatch during setup,
testing, or any issue - one tap returns full control to their existing apps.

Invariants the wizard and engine MUST uphold:
1. **Every configured zone always has its toggle** - the wizard creates it with the zone and
   deletes it with the zone (zone_enabled is part of the standard desired inventory).
2. **Born disabled.** input_boolean creation defaults to off; provisioning NEVER enables a
   zone. A fresh install or newly added zone does nothing to the house until the user
   explicitly turns it on.
3. **Reconfiguration never flips toggles.** The differ's zone_enabled spec carries config only
   (name) - never state - so no wizard apply, rename, or granularity change can silently
   enable or disable scheduling. (Guarded by a unit test.)
4. **Engine gates per zone** on the boolean at every trigger; the enable edge is itself an
   engine trigger for instant resume.
5. **Resume order:** enabling clears the zone's applied-block marker BEFORE the boolean flips
   (the engine fires on the edge; clearing after races it - found via prod trace 2026-08-23).
6. Disabled zones keep everything else working: fan chips, room strip, schedule viewing and
   editing - only automatic setpoint application stands down.

## 8. Universal change-set rule

Every wizard apply (first run or any later structural edit) = diff → categorized preview
(Create n / Adopt n / Update n / Delete n highlighted individually / Unchanged n, exact names) →
explicit confirm → freshness gate (replan against the live registry; refuse on drift) →
ordered apply with rollback list → verify replan. No silent writes, ever. Adopt labels only;
a divergent display name then converges via an explicit Edit on the following apply.

## 8b. Competing-writer scan (advisory, added post-v0.7.2)

The card's dry-run also runs an advisory read-only sweep of `automation.*` and `script.*` for
anything else writing to a managed zone. It reads: stored configs via
`GET config/automation/config/<id>` and `GET config/script/config/<object_id>`, entity registry
entries via `config/entity_registry/get_entries`, and (only when a zone's area must be inherited
from its device) `config/device_registry/list`. It writes nothing, provisions nothing, and its
result never gates Apply or alters the plan. It is not part of the provisioned inventory or the
change-set rule above.

## 9. Non-goals (v1)

Card never executes schedules (backend automations do). No vendor temp-sensor access (API
limitation). No runtime data beyond the recorder window - daily totals and segment detail both
read raw recorder history, so both end where the purge does. (A mirror sensor carrying a
state_class, which would accrue true long-term statistics, is future provisioning work.)
Mini-split hero parity (zone on hold). Graph-based schedule editor (v1.x backlog, kneave/climate-scheduler MIT
patterns).
