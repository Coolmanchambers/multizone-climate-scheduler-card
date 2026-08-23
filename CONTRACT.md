# MZCS CONTRACT.md - v1.0 FROZEN (S1)

The naming/schema contract. Everything in the card, wizard, differ, and engine builds against
this file. Changes after freeze require a version bump + migration note.

## 1. Identity

- Card: **Multi-Zone Climate Scheduler Card** · type `custom:multizone-climate-scheduler-card`
- Repo: `Coolmanchambers/multizone-climate-scheduler-card` (public, MIT)
- Bundle: `dist/multizone-climate-scheduler-card.js` (ES2022 - Lit 3 requires it)
- Label on every provisioned object: `mzcs` · Automation category: "Climate Scheduler"
- Entity prefix: user-chosen in wizard, default `climate` (examples below use it)

## 2. Zones and day-type granularity

- 1-4 zones. Zone key = slug of display name (`upstairs`, `downstairs`, `office`).
- Per zone x season, day granularity is one of:
  - `all` - one block set (keys: `all`)
  - `wdwe` - two sets (keys: `wd`, `we`)
  - `days` - seven sets (keys: `mon`..`sun`)
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
  at every boundary), (2) `input_select.{prefix}_season` change, (3) HA start / automation
  reload, (4) a time-pattern safety tick (15 min) that reasserts the current block idempotently.
- Granularity (`all`/`wdwe`/`days`) is a UI/wizard concept only: the editor writes identical
  blocks to every day in a set. Collapse/expand transitions rewrite day ranges per §2.
- Card tuning UI + wizard write via the `schedule/update` websocket (same command the core
  helpers UI uses). HA's native weekly-grid editor remains usable as a second editing surface.
- Sensor schedules (§7b) use the same model: `schedule.{prefix}_{zone}_sensor_schedule`, data
  `{sensor: entity_id | "thermostat"}`.

Per-value helpers (rejected Option B) are archived in the home-assistant project spec §12;
global tunables remain individual helpers (§6).

## 5. Provisioned inventory (per current config: 3 zones, 2 active seasons)

**Per zone:**
- `timer.climate_<zone>_fan` + automation "Climate: <Zone> fan timer finished"
- `binary_sensor.climate_<zone>_running` (template, from hvac_action) [adopted if pre-existing]
- `sensor.climate_<zone>_runtime_today` (history_stats, state_class total_increasing)
- `sensor.climate_<zone>_expected_runtime` (template: k x CDD, trailing-window k)

**Per zone x season:** schedule storage per §4.

**Global:**
- `input_select.climate_season` (active season; options = season names)
- `input_select.climate_season_mode` (manual | semi | full)
- `input_number.climate_season_confirm_days` (3), `input_number.climate_season_dwell_days` (14)
- `input_number.climate_dev_green_max` (2), `input_number.climate_dev_amber_max` (4)
- `input_number.climate_runtime_alert_margin` (35), `input_number.climate_runtime_alert_days`
  (3), `input_number.climate_runtime_learn_days` (30), `input_number.climate_cdd_base` (75)
- `sensor.climate_next_block` (template; attributes: per-zone next block time/name/targets)

**Automations (category "Climate Scheduler", label `mzcs`):**
- "Climate: schedule engine" (block transitions → climate.set_temperature / set_hvac_mode;
  respects season + granularity; APS precedence rule: external raises allowed, engine never
  fights a higher hold during on-peak - exact encoding settled in S7 with the audit)
- "Climate: <zone> fan timer finished" (per zone)
- "Climate: season recommender" (forecast avg-high vs thresholds + date window; semi = notify
  with actions, full = switch + notify; hysteresis via confirm_days, dwell via dwell_days)
- "Climate: runtime anomaly alert" (actual vs expected x margin, N consecutive days; iOS
  actionable + snooze, house pattern)
- "Climate: engine watchdog" (heartbeat: alert if no engine fire across a scheduled transition)

**Registry assignment:** zone objects → that zone's HA area; all objects → label `mzcs`;
automations → category "Climate Scheduler".

## 6. Card config schema (YAML shape the editor produces)

```yaml
type: custom:multizone-climate-scheduler-card
prefix: climate
zones:
  - entity: climate.nest_upstairs
    name: Upstairs
    room_sensors: [sensor.guest_room_temperature, ...]   # or
    auto_discover_area: true
  - entity: climate.nest_downstairs
    name: Downstairs
seasons:
  - { key: summer, name: Summer, default_mode: cool }
  - { key: winter, name: Winter, default_mode: heat_cool }
season_switch: semi          # manual | semi | full
weather_entity: weather.openweathermap   # required for semi/full
features: { fan_timer: [15, 30, 60], anomaly_alerts: true }
notify_target: mobile_app_owners_iphone
```

## 7. Seed data (the owner's live Nest schedules, decoded 2026-07-26; ~times confirmed in tuning)

**Upstairs · Summer (cool) · wdwe:**
- wd: 06:00 Wake 78 · 08:00 Away 80 · 14:00 Pre-cool 76 · 16:00 On-peak 79 · 18:45 Evening 77 · 21:30 Sleep 76
- we: 07:30 Wake 78 · 21:30 Sleep 76

**Upstairs · Winter (heat_cool) · all:** 06:00 Day 84/66 · 19:00 Evening 78/68

**Downstairs · Summer (cool) · wdwe:**
- wd: 06:00 Wake 80 · 07:00 Morning 79 · 09:30 Day 78 · 14:00 Pre-cool 76 · 16:00 On-peak 79 · 17:15 Evening 82 · 21:30 Night 82
- we: 07:00 Wake 79 · 09:45 Day 78 · 17:45 Evening 80 · 19:45 Night 82

**Downstairs · Winter (heat_cool) · all:** 07:00 Day 78/68 · 19:00 Evening 84/66

Office mini-split: zone supported, on hold - not provisioned at onboarding.

## 7b. Comfort steering (added pre-S1, spec §14)

HA cannot select the Nest's internal sensor (SDM limit); the engine reproduces it via
**setpoint compensation**: commanded setpoint = `thermostat_reading - (room_reading - target)`,
clamped, throttled, reverted on target-reached / timer expiry / sensor unavailable. v1 steers in
single-mode cool/heat only; on-peak hold caps compensation (exact rule settled with the S7
audit).

**Per zone:** `input_select.climate_<zone>_target_room` (default "Thermostat"),
`timer.climate_<zone>_room_override`.
**Global tunables:** `input_number.climate_override_minutes` (60),
`input_number.climate_steer_min_setpoint` (68), `input_number.climate_steer_max_setpoint` (85),
`input_number.climate_steer_max_offset` (5).
**Sensor schedule:** per zone, named periods each mapping to thermostat-or-sensor (Nest
dayparts UX: Morning/Midday/Evening/Night defaults, editable times, any count). Storage follows
the §4 decision (blocks with data payload - identical shape).
**Seed (the owner's live Nest config):** Upstairs - Morning/Midday/Evening = thermostat, Night =
Bedroom 1 sensor.
**Card UX:** tap room chip → 1h override with countdown + highlighted chip; sensor-schedule
editing in Manage. Steering inputs are Aqara-class sensors only (never Blink temps).
**Build placement:** S9.5a engine+override, S9.5b sensor schedule + UX (after Aqara install).

## 8. Universal change-set rule

Every wizard apply (first run or any later structural edit) = diff → categorized preview
(Create n / Edit n / Delete n highlighted individually / Unchanged n, exact names) → explicit
confirm → ordered apply with rollback list → verify by label query. No silent writes, ever.

## 9. Non-goals (v1)

Card never executes schedules (backend automations do). No Nest temp-sensor access (SDM
limitation). Segment detail beyond recorder window (LTS totals only). Mini-split hero parity
(zone on hold). Graph-based schedule editor (v1.x backlog, kneave/climate-scheduler MIT
patterns).
