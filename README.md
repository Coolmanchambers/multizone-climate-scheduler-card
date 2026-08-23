# Multi-Zone Climate Scheduler Card

A Home Assistant custom Lovelace card: a Nest-style climate view for 1-4 zones with room
sensors, seasonal scheduling (manual, forecast-recommended, or fully automatic season
switching), fan timers, runtime history, and weather-normalized runtime alerts.

The card's setup wizard provisions everything it needs - helpers, template sensors, and the
automations that actually run your schedules - as standard Home Assistant objects you can see
and edit anywhere. Every change the wizard makes is shown as a categorized change set (create /
edit / delete) for confirmation before anything is written. The card displays and controls;
your Home Assistant backend does the scheduling, so everything keeps working even with no
dashboard open.

**Safe by default.** Every zone has a scheduling kill switch (plus an all-zones master) on the
card's Manage screen. Zones are created DISABLED - nothing touches your thermostats until you
explicitly turn a zone on - and reconfiguration never flips your choices. Turn a zone off at
any time and your thermostat's own app (Nest, SmartThings, ...) instantly governs again:
that's the escape hatch while you set up, test, or troubleshoot.

**Status: pre-alpha, under active development. Not yet ready for use.**

See [CONTRACT.md](CONTRACT.md) for the frozen naming/schema contract and
[HANDOFF.md](HANDOFF.md) for current build state.

## Planned installation

HACS custom repository (during development) and, later, the HACS default store.

## License

MIT
