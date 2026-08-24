# Multi-Zone Climate Scheduler Card

A Home Assistant custom Lovelace card: a Nest-style climate view for 1-4 zones with seasonal
scheduling, a visual schedule editor, fan timers, runtime history, and weather-normalized
runtime alerts.

The card's setup wizard provisions everything it needs - helpers, schedules, template sensors,
and the automations that actually run your schedules - as standard Home Assistant objects you
can see and edit anywhere. Every change the wizard makes is shown as a categorized change set
(create / adopt / update / delete) for confirmation before anything is written. The card
displays and controls; your Home Assistant backend does the scheduling, so everything keeps
working even with no dashboard open.

**Safe by default.** Every zone has a scheduling kill switch (plus an all-zones master) on the
card's Manage screen. Zones are created DISABLED - nothing touches your thermostats until you
explicitly turn a zone on - and reconfiguration never flips your choices. Turn a zone off at
any time and your thermostat's own app (Nest, SmartThings, ...) instantly governs again:
that's the escape hatch while you set up, test, or troubleshoot.

## Features

- **Nest-style zone view** - per-zone tabs, hero row with current/target temperature and a
  setpoint stepper, mode/fan/eco controls, humidity and inside temperature at a glance.
- **Seasonal schedules** - define seasons (e.g. Summer, Winter) with their own schedules per
  zone. Winter-style seasons support dual heat/cool setpoints (`heat_cool`), applied as a
  target range. Blocks can also turn a zone off.
- **Visual schedule editor** - colored temperature strips per season with tap-to-edit blocks,
  every-day / weekday-weekend / individual-day granularity, and dual COOL/HEAT strips for
  heat_cool seasons. Drafts stage locally until you Save. HA's own native schedule editor
  remains usable as a second editing surface.
- **Fan timers** - one-tap 15/30/60-minute fan runs per zone, turned off by a provisioned
  automation.
- **Runtime history and learning** - per-zone daily runtime tracking, a nightly automation
  that learns each zone's runtime-per-cooling-degree-day, and an evening anomaly alert when a
  zone runs well over its weather-normalized expectation (filters, doors, refrigerant...).
- **Full teardown** - a "Remove everything" flow that disables all zones first, then removes
  every provisioned object in dependency order, with a red preview before anything happens.

## Installation

### HACS (custom repository)

1. HACS → three-dot menu → **Custom repositories**.
2. Repository: `https://github.com/Coolmanchambers/multizone-climate-scheduler-card`,
   type **Dashboard**.
3. Find **Multi-Zone Climate Scheduler Card** in HACS and download it.
4. If prompted, reload your browser / clear the frontend cache.

HACS registers the resource automatically. For a manual install instead, copy
`dist/multizone-climate-scheduler-card.js` from the latest release into `config/www/` and add
it as a dashboard resource of type *JavaScript module*.

## Setup

1. Add the card to a dashboard: **Add card → Custom: Multi-Zone Climate Scheduler Card**.
   Everything is configured in the visual editor - no YAML required.
2. In the editor, add your zones (a name and a `climate.*` entity each), define your seasons
   and their default modes, and pick your options (fan timer presets, anomaly alerts, weather
   entity for runtime learning).
3. Open the card's **Setup** screen and run **Check**: the wizard shows exactly what it will
   create as a categorized change set. Nothing is written until you confirm **Apply**.
4. When you're ready, enable a zone on the **Manage** screen. Until then your thermostats'
   own apps keep governing.

Example YAML (all of this is editable visually):

```yaml
type: custom:multizone-climate-scheduler-card
prefix: climate
zones:
  - name: Downstairs
    entity: climate.nest_downstairs
  - name: Upstairs
    entity: climate.nest_upstairs
seasons:
  - name: Summer
    default_mode: cool
  - name: Winter
    default_mode: heat_cool
weather_entity: weather.home
features:
  fan_timer: [15, 30, 60]
  anomaly_alerts: true
```

## How provisioning works

- Every provisioned object is prefix-scoped (default `climate`) and labeled `mzcs`, so you can
  audit everything the card manages from Settings → Labels.
- Re-running Apply is always safe: the plan converges to "all unchanged" after an apply. Live
  schedule blocks and helper values you've tuned are never overwritten by reprovisioning.
- Generated automations carry a content signature. If you hand-edit one, the card stops
  managing its content: it will never overwrite or delete your edited version.
- Adopting an existing object (one whose entity id matches the contract) only labels it; the
  next Apply lists any display-name alignment as an explicit Edit before it happens.
- Removing a zone or season previews exactly what gets deleted; only card-managed objects are
  ever removed (automations additionally only when still signature-pristine), and deletions
  are snapshot-logged.

## Requirements

- A current Home Assistant release (the card relies on native `schedule` helpers with custom
  block data; developed and tested against 2026.x).
- One or more `climate` entities.
- Optional: a `weather` entity (enables outdoor-temperature tracking and runtime learning).

## Development

```bash
npm install
npm run dev        # Vite dev server with the mock-hass harness
npm test           # vitest unit suite
npm run build      # release bundle -> dist/multizone-climate-scheduler-card.js
npm run build:dev  # parallel dev element (multizone-climate-scheduler-card-dev)
```

`npm run build:dev` emits a bundle registering a separate `-dev` element so a development copy
can coexist with the HACS-installed release on the same instance.

See [CONTRACT.md](CONTRACT.md) for the frozen naming/schema contract and
[CHANGELOG.md](CHANGELOG.md) for release history.

## License

MIT
