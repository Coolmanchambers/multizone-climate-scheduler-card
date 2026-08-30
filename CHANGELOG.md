# Changelog

All notable changes to the Multi-Zone Climate Scheduler Card are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- **The dry-run now checks for other automations that control your thermostats.** Two schedulers
  fighting over one thermostat is this card's most common failure mode, and until now the card
  could only warn about it in prose. Running a dry-run preview also sweeps your automations and
  scripts (up to 500) for anything else that writes to a scheduled zone: service calls to
  `climate.set_temperature`, `set_hvac_mode`, `climate.turn_on/off/toggle` and
  `homeassistant.turn_on/off/toggle`, UI-built climate **device actions**, and **blueprint
  automations** whose configured inputs name a scheduled zone. Writers of the standby preset and
  the fan mode are reported separately, because they do not fight the setpoint - they change how
  the engine behaves. Targets are matched by entity, area, device and label; floor and group
  targets, and templated targets, are reported as "possible" rather than resolved. A `Re-scan`
  button re-runs the sweep. Disabled automations stay listed - one toggle re-arms them - marked
  "currently off". The check is advisory and never blocks Apply.
- The scan states what it could NOT check rather than counting it as clean: automations and
  scripts defined in YAML are not readable through Home Assistant's config API, blueprint
  automations are checked by their inputs only, scenes are not scanned, and anything outside Home
  Assistant automations (Node-RED, vendor apps, HomeKit routines) is invisible to it. The
  all-clear line only renders when the whole sweep actually completed; partial coverage says so.

### Fixed
- **The visual editor no longer overwrites a single fan-timer preset with three.** If your config
  used the older scalar form (`features: { fan_timer: 20 }`), the editor showed the fan-timer
  checkbox as OFF even though the card was running it, and one click replaced your 20 with
  `[15, 30, 60]`. The editor now reads the config the same way the card does, so the box reads ON
  and your value survives.
- **The visual editor no longer drops dashboard layout keys.** `view_layout`, `grid_options`,
  `visibility` and anything else the editor has no field for were removed from your config the
  first time you saved from it. They now round-trip untouched.
- **A season configured with a name but no `key` had a dead schedule row.** The card looked for a
  schedule named after the season, but the one it provisioned is named after the key, so on that
  install the drawer found nothing and the row never opened - even though the install is otherwise
  healthy and settles to an all-Unchanged dry-run. The card now resolves the schedule the same way
  the provisioner named it.
- **The diagnostics report described a different install than the one filing it.** `seasons: []`
  was reported as two seasons when the card provisions none; a scalar `fan_timer` was reported as
  "off" when it was running; a zone with no `name` was reported as `undefined` instead of the name
  the card derives. All three sent triage down the wrong path. The report now reads the config
  through the same boundary the card uses, and a config the card would reject is still reported on,
  with the reason included rather than the report silently failing to build.

## [0.7.2] - 2026-08-29

### Fixed
- **Runtime history now shows past days.** The 7- and 30-day views read long-term statistics that
  no install has ever had: the runtime sensors are created through Home Assistant's history_stats
  config flow, which offers no `state_class` field, and HA only records long-term statistics for
  sensors that declare one. Both views were therefore permanently stuck on their empty state - on
  every install - telling you statistics would "build up" when they never would. Past days are now
  summed from the running sensor's raw recorder history.

### Changed
- The runtime drawer shows a single 10-day view in place of the 7/30-day toggle. Ten days matches
  Home Assistant's default recorder retention, which is what actually bounds this data; a 30-day
  view honest about that would sit mostly empty. The oldest day is marked "≥" when the recorder
  has already trimmed its start, and days with no recorded history at all are omitted rather than
  drawn as zero-runtime days - an empty bar would claim a fact nobody has.
- Seasons whose keys collide - duplicate keys, or two-plus seasons with no key at all - are
  refused with a message naming the real cause. Previously the message blamed your zone and season
  NAMES and suggested renaming, which could not have helped. Nothing that provisioned at 0.7.1 is
  refused now: a single keyless season, distinct unusual keys, and zero-zone configs all keep
  working exactly as before.
- **No generated automation changed.** Signatures are byte-identical to 0.7.1, so an existing
  install plans zero Updates from this release.

### Added
- `docs/config-compatibility.md`: the rules governing changes to the card's own config shape, the
  registry of shapes that have changed, and the compatibility tests that hold them.
- An engine snapshot test harness (golden files, pinned signatures, semantic invariants and a
  variant matrix) so a change to a generated automation cannot pass unnoticed. Contributor-facing;
  no user-visible effect.


## [0.7.1] - 2026-08-25

### Fixed
- A dropped connection to Home Assistant is now reported as one. Some failures carry no message,
  and those were turning into a blank error that the card read as "no error at all", so a failed
  history read still showed "History accrues daily" - the very message the failure text replaced.
- Runtime history errors no longer follow you around. A failure reading one zone, or one day,
  could stay on screen while you looked at another that had loaded perfectly well, and a slow
  failure for a day you had already navigated away from could overwrite the day you were reading.
- The 30-day view now loads when you switch zones while it is open, instead of waiting forever.
- Looking at a different view of your schedule no longer claims you have unsaved changes.
  Switching between "every day" and "weekday/weekend" rearranges the same values, so the card
  now asks whether saving would actually change anything rather than whether you switched.
- The note explaining that unsaved edits were discarded is visible with the schedule closed,
  and no longer reappears later against a different zone.
- The configuration reference gained the required `seasons[].key`, without which a YAML-mode
  install creates mis-named schedule entities or reports a naming collision that blames the
  wrong thing. `features.fan_timer` is documented correctly: omitting it keeps the fan chips,
  and `[]` is what hides them.
- Documented that an install with no weather entity keeps two outdoor sensors listed as pending
  in the preview by design, so it is not mistaken for a provisioning bug.

### Changed
- The diagnostics report redacts more than it did. Free-text options - the standby preset name in
  particular - are reported by shape rather than by value, since anything typed into them can be a
  household name. The browser is reported as family and platform ("Chrome on Android") rather than
  the full user agent, which carries device model and OS build.
- The diagnostics report is more accurate: scheduling switches stay lined up with their zones on a
  part-provisioned install instead of shifting onto the wrong one, a config with no seasons reports
  the two it actually provisions, and a season selector reading unknown or unavailable is reported
  as such instead of as healthy.

- Unsaved schedule changes are visible with the drawer closed. Edits and granularity switches
  survive collapsing the schedule drawer, but the Save and Discard buttons only existed inside it,
  so the collapsed row looked exactly like a saved schedule while holding changes that were not
  running. The row now carries an "unsaved" marker and says plainly that the changes are not in
  effect until you save them.
- A failed history query no longer looks like an empty one. When Home Assistant's recorder could
  not be read, the runtime drawer said "History accrues daily - past days appear as statistics
  build up", which told you to wait for data that was never going to arrive. The three runtime
  views now say plainly that the history could not be read, and why, instead of reporting a
  broken query as an empty one.

### Added
- A diagnostics report for bug reports, on the settings **Objects** tab. It gathers the card and
  Home Assistant versions, the shape of your configuration, the result of your last preview, and
  the status of every object the card manages. **Your entity ids and the names you gave your zones
  and rooms are left out by default** - the report is still useful without them, there is a
  tick-box to include them if a maintainer asks, and the text is shown to you in full before you
  copy it so you always see what you are about to share.

## [0.7.0] - 2026-08-25

First public release. Feature-complete for day-to-day use and running against a real
multi-zone installation, but not yet proven across many homes - hence 0.7 rather than 1.0.
Expect rough edges and changes between releases until it has run in more than one house.

### Card
- Multi-zone climate view for 1-4 zones: hero row with setpoint stepper, mode/fan/eco
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

### Also included
- Settings are grouped into tabs - Zones, Tuning, Objects, Setup, Theme, Danger - with the
  destructive actions isolated on their own tab behind a three-step confirmation that ends in
  typing your entity prefix.
- An Objects tab inventorying everything the card manages, each with a status, including
  automations you have hand-edited, which it marks *Customized* and will never touch.
- Stale room sensors are marked rather than presented as fact: a sensor that has not reported
  for three hours is labelled "stale", greyed, and its deviation badge suppressed. Staleness is
  measured from when the sensor last *reported*, against Home Assistant's own clock, so neither
  a steady temperature nor a drifted tablet clock can fake it.
- Room sensors accept the `{entity, name}` row form, so you can label a sensor on the card
  without renaming the entity in Home Assistant. Bare entity ids still work and the two can mix.
  Room temperatures are rounded for display, since Zigbee sensors commonly report three decimals.
- The standby preset the engine stands down for is configurable (`features.eco_preset`), for
  thermostats that call it something other than `eco`, and can be switched off entirely.
- The card re-renders only when something it displays actually changed, rather than on every
  Home Assistant state change; wall-mounted tablets idle noticeably cooler. Time-derived text
  refreshes on its own heartbeat so nothing goes stale on a quiet instance.
- Theme presets with a full custom builder, stored in Home Assistant so a change reaches every
  device at once.

### Engine
- Backend schedule engine automation applies season blocks per zone (single setpoint,
  heat_cool dual setpoints, or off), honors manual holds until the next block, stands
  down for Eco, and recovers missed transitions with a 15-minute safety tick.
- Watchdog, nightly runtime-learning (k per cooling-degree-day), and evening runtime
  anomaly alerts.
