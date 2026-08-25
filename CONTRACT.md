# MZCS CONTRACT.md - v1.1 (S13 release-gate sync)

The naming/schema contract. Everything in the card, wizard, differ, and engine builds against
this file. Changes after freeze require a version bump + migration note.

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
- Label on every provisioned object: `mzcs` · Automation category: "Climate Scheduler"
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
- `binary_sensor.climate_<zone>_running` (template, from hvac_action) [adopted if pre-existing]
- `sensor.climate_<zone>_runtime_today` (history_stats; the runtime drawer reads LTS max)
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
  generator; a string names a different preset; `false` removes the gate)
- "Climate: <Zone> fan timer finished" (per zone; stands down while the configured fan-guard
  helper is on)
- "Climate: runtime learning" (nightly 23:58 EMA of k per zone; skips mild days; first valid
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
```
`fan_guard` is optional. `room_sensors` per zone drives the read-only deviation chips.

## 7. Reference data - REMOVED (privacy, 2026-08-25)

This section held the maintainer's actual per-floor, per-season schedules from the original
onboarding: wake, away, pre-cool, evening and sleep times for a specific occupied house. It was
reference material only - a fresh install seeds a generic single "Day" block per season
(`src/lib/default-schedules.ts`) - so it has been removed rather than sanitised. The original
is retained privately.

Nothing in the card, the contract, or the tests depends on those values.

## 7b. Comfort steering (added pre-S1, spec §14) - **DEFERRED post-v1**

Not shipped in v0.7.0: `features.steering` is hard-off in the card and no steering automation
generator exists (desiring one would be a perpetual phantom Create - QA-R A2-5). The helper
inventory below stays feature-gated and ready.

HA cannot select some thermostats' internal sensor (vendor API limit); the engine reproduces it via
**setpoint compensation**: commanded setpoint = `thermostat_reading - (room_reading - target)`,
clamped, throttled, reverted on target-reached / timer expiry / sensor unavailable. v1 steers in
single-mode cool/heat only; on-peak hold caps compensation (exact rule settled with the S7
audit).

**Per zone:** `input_select.climate_<zone>_target_room` (default "Thermostat"),
`timer.climate_<zone>_room_override`.
**Global tunables:** `input_number.climate_override_minutes` (60),
`input_number.climate_steer_min_setpoint` (68), `input_number.climate_steer_max_setpoint` (85),
`input_number.climate_steer_max_offset` (5).
**Sensor schedule:** per zone, named periods each mapping to thermostat-or-sensor (daypart
UX: Morning/Midday/Evening/Night defaults, editable times, any count). Storage follows
the §4 decision (blocks with data payload - identical shape).
**Seed (original onboarding config):** Upstairs - Morning/Midday/Evening = thermostat, Night =
a bedroom sensor.
**Card UX:** tap room chip → 1h override with countdown + highlighted chip; sensor-schedule
editing in Manage. Steering inputs are Aqara-class sensors only (never Blink temps).
**Build placement:** S9.5a engine+override, S9.5b sensor schedule + UX (after Aqara install).

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
(Create n / Adopt n / Edit n / Delete n highlighted individually / Unchanged n, exact names) →
explicit confirm → freshness gate (replan against the live registry; refuse on drift) →
ordered apply with rollback list → verify replan. No silent writes, ever. Adopt labels only;
a divergent display name then converges via an explicit Edit on the following apply.

## 9. Non-goals (v1)

Card never executes schedules (backend automations do). No vendor temp-sensor access (API
limitation). Segment detail beyond recorder window (LTS totals only). Mini-split hero parity
(zone on hold). Graph-based schedule editor (v1.x backlog, kneave/climate-scheduler MIT
patterns).
