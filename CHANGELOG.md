# Changelog

All notable changes to the Multi-Zone Climate Scheduler Card are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.9.1] - 2026-08-24

### Added
- Configurable Eco/standby preset (`features.eco_preset`): choose which thermostat preset
  makes the engine stand down for a zone (the default stays `eco`, matching Nest), or set it
  to `false` so Home Assistant owns standby behaviour entirely. The card's Eco chip follows
  the same setting. Existing installs are untouched: with the default, the generated engine
  is byte-identical to 0.9.0, so no automation update is planned on upgrade.
- Tabbed settings screen: the gear panel is now Zones / Tuning / Objects / Setup / Look /
  Danger instead of one long scroll, with Close pinned to the header.
- Safer removal. The danger zone has its own tab, so the remove button is never rendered
  beside Close, and deletion now takes three deliberate steps: an are-you-sure prompt, the
  itemized red preview, and typing the install's entity prefix to enable the final button.
  Arming is discarded whenever you switch tabs or close the panel.
- New "Objects" tab listing every helper, schedule, sensor, and automation the card manages,
  grouped by kind, each with a status: Managed, Missing, Customized (you hand-edited it, so
  the card will never touch it), Unmanaged, or Not in config. Tap a row to open it in Home
  Assistant.

## [0.9.0] - 2026-08-24

First public release. Feature-complete for day-to-day use and running against a real
multi-zone installation, but not yet proven across many homes - hence 0.9 rather than 1.0.
1.0.0 follows once real-world use confirms it.

### Card
- Nest-style climate view for 1-4 zones: hero row with setpoint stepper, mode/fan/eco
  controls, per-zone enable kill switches with a master toggle, next-block line, and a
  runtime drawer with 7-day pills, day drill-in, and a weather-normalized verdict.
- Visual schedule editor: per-season colored strips (shared blue-to-amber temperature
  ramp), tap-to-edit stepper, draft staging with Save/Discard, dual COOL/HEAT segments
  for heat_cool seasons, and a granularity switcher (every day / weekday-weekend /
  individual days) that stages whole-week drafts safely.
- Fully visual card editor (no YAML): zones, seasons with per-season default modes,
  features (fan timer presets, anomaly alerts, fan-guard helper), and weather entity.

### Provisioning
- One-click provisioning wizard creates every backend object the card needs - helpers,
  schedules, template/statistics sensors, and automations - with a categorized
  preview-before-apply plan (Create / Adopt / Update / Delete / Unchanged).
- Extraction parity: the plan converges to all-Unchanged after an apply; re-running
  Apply is always safe. Live schedule blocks and user-tuned helper values are never
  overwritten by reprovisioning.
- Signature-managed automations: generated automations carry a content signature;
  hand-edited automations are never overwritten or deleted, pristine ones regenerate
  cleanly when the config changes.
- Everything is prefix-scoped and labeled `mzcs`; multiple card instances coexist.
- "Remove everything" teardown: zones stand down first, then automations, sensors,
  schedules, and helpers are removed in dependency order with logged snapshots.

### Engine
- Backend schedule engine automation applies season blocks per zone (single setpoint,
  heat_cool dual setpoints, or off), honors manual holds until the next block, stands
  down for Eco, and recovers missed transitions with a 15-minute safety tick.
- Watchdog, nightly runtime-learning (k per cooling-degree-day), and evening runtime
  anomaly alerts.
