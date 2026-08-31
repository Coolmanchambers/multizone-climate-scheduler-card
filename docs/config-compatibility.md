# Config compatibility policy

How this card handles changes to the shape of its own YAML configuration.

The short version, for users: **let the visual editor write your config.** It always produces the
current shape, and it is the only path that cannot get the required fields wrong. Everything below
is the guarantee you get if your config was written by an older version, or by hand.

For contributors, this is a rule, not a guideline. `room_sensors` has already changed shape once,
and a config written in the new shape crashed bundles that only understood the old one. That is a
user's dashboard going blank because two things shipped in the wrong order.

## The three rules

### R1. Accept old shapes forever

Every config shape the card has ever written or documented stays readable. There is no deprecation
window and no migration step the user has to run.

Normalization happens at **one boundary**: `normalizeCardConfig()` in `src/types.ts`, called by the
card's `setConfig`, plus the small `normalize*` / `resolve*` helpers beside it. Read sites consume
the normalized result and never re-interpret a raw config field themselves.

That boundary is a pure function on purpose. Tests run in a node environment and cannot import the
card element, so normalization living inline in a Lit component is unreachable by any test that is
not a source scan. If it cannot be tested directly, it is in the wrong place.

**Closed 2026-08-29 (backlog item 40): the editor and the diagnostics report now go through the
boundary too.** Until then both re-read raw config fields with their own defaults, and both
disagreed with the install they described. What was measured against released v0.7.2 before the fix:

| Config | Editor / report said | The card actually did |
|---|---|---|
| `features.fan_timer: 20` (scalar) | checkbox OFF; one click wrote `[15, 30, 60]`, replacing the user's single preset with three | ran `[20]` |
| `view_layout`, `grid_options`, `visibility` | dropped on the first save - the editor rebuilt the config from a fixed key list | untouched |
| `seasons: []` | report listed two seasons | provisions **none** |
| `features.fan_timer: 20` (scalar) | report said `null`, i.e. feature off | ran `[20]` |
| zone with no `name` | report said `undefined` | used the name derived from the entity id |

(An earlier draft of this note claimed the editor wrote `[]` and dropped three automations. Measured,
it does not: writing `[]` needs the box to be ON at click time, which that config never renders.)

Both callers now normalize first and **catch the refusal rather than propagating it**, because both
exist to be used ON a config the boundary rejects: an editor that throws instead of opening leaves
the user no way to fix the config, and a report that throws is the "Build report does nothing"
defect. The report states the refusal reason in a `config_rejected` field, which on a rejected
config is the most useful line in it.

The default season list now has ONE copy, `defaultSeasons()` in `src/lib/provisioning.ts`. The
editor and the report each kept their own, which is how they drifted.

One deliberate non-change: `normalizeCardConfig()` itself was NOT touched. It feeds
`buildDesired()`, so widening it - defaulting `prefix` or `seasons` there - would change engine
input. This item routed the two callers to it; it did not change what it does.

### R2. Read before you write, by a release

Never write a new config shape until the bundle that understands it is deployed.

The order is always: ship the code that reads the new shape, let the user update, verify the new
bundle is actually being served, and only then let the editor start writing the new shape.

Reversing those two steps means a config the running bundle cannot parse, and the failure surfaces
inside the render path, which is the worst place for it. Cached bundles make this worse than it
looks: a browser can keep serving the previous version after an update, so "I updated" is not the
same as "the new bundle is running".

### R3. A migration must not perturb provisioning

An old shape and its modern equivalent must produce:

- identical `buildDesired()` output, and
- identical `automationSignatures()`.

If they cannot, it is not a migration. It is a breaking change, and it needs an explicit decision
plus a changelog line stating **"every existing install will plan exactly N Updates"**.

This is the rule with teeth. A generated automation carries its own content signature, so any drift
in what a config produces makes every install that never touched anything plan work it did not ask
for. A healthy install settles to an all-Unchanged dry-run, and it has to stay that way across
version upgrades, not just across re-runs.

## Shape registry

One row per config shape that has ever changed. Add a row and a compat test in the same change.

| Field | Old shape | Current shape | Normalizer |
|---|---|---|---|
| `zones[].room_sensors` | `string[]` | `Array<string \| {entity, name}>` | `normalizeRoomSensors` |
| `features.fan_timer` | scalar `number` | `number[]` | `normalizeCardConfig` |
| `features.eco_preset` | absent | `string \| false` | `resolveEcoPreset` |
| `zones[].name` | may be absent | present | `normalizeCardConfig` |
| `seasons` | may be absent | present | `defaultSeasons()` |
| `seasons[].key` | may be absent or collide | unique per season | colliding keys refused, see below |
| `prefix` | may be absent | present | `provisionInputFromConfig` |
| `features` | may be absent | present | `normalizeCardConfig` + `resolve*` |
| `zones[].room_sensors[].last_seen` | absent (pre-0.7.4) | optional timestamp entity id | `normalizeRoomSensors` (junk stripped silently) |
| `display` | absent (pre-0.7.4) | `{ last_seen, ageing_minutes, stale_hours }` | `resolveDisplay` |
| `features.off_peak_entity` | absent (pre-0.7.5) | optional entity id; absent/blank = feature off | `resolveOffPeak` |
| `features.off_peak_offset` | absent (pre-0.7.5) | optional helper SEED (default 2, clamped 0-10) | `resolveOffPeak` |
| `features.steering` | absent (pre-0.7.5) | optional boolean; only `true` enables | `provisionInputFromConfig` (strict `=== true`) |

The three 0.7.5 rows (`features.off_peak_*` and `features.steering`) ride the same exemption as
the 0.7.4 pair below:
additive keys inside `features`, which every prior bundle spreads through untouched and no
generator or renderer reads - a cached old bundle on a new-shape config degrades to exactly its
old behavior. The engine-safety half is pinned by the off-peak compat cases: an absent option
provisions and signs byte-identically to the pre-0.7.5 shape.

R2 note for the two 0.7.4 rows: both ship reader and writer in the same release, which R2's
letter forbids. The exemption is deliberate and verified, not an oversight: both are ADDITIVE
keys that the previous bundle provably ignores - 0.7.3's `normalizeCardConfig` spreads unknown
top-level keys through untouched, and its `normalizeRoomSensors` passes object rows with unknown
keys as-is - so a cached old bundle reading a new-shape config degrades to exactly its old
behavior instead of crashing. R2's full ordering applies whenever the old bundle would CHANGE
behavior on the new shape (the `room_sensors` string-to-object lesson); an additive key an old
bundle demonstrably ignores may ship read-and-write together. An old bundle's EDITOR will drop
`last_seen` from a row on that row's next edit (it rebuilds rows from the fields it knows) -
accepted, documented here.

An absent `seasons` block silently means Summer and Winter, and provisions identically to writing
those two out - verified by a compat test, not assumed. `season_switch` is written by the editor on every save
but never read by the card - only by the editor's own select and the diagnostics report - so it has
no provisioning shape to guarantee.

Reader and writer versions for these rows are recorded as **pre-0.7.0**. The repository history was
rewritten before 0.7.0, so the exact release that introduced each one is no longer recoverable, and
an invented version number would be worse than an honest gap. Rows added from 0.7.2 onward carry
real version numbers.

## Compat tests

`tests/config-compat.test.ts`. Every registry row gets a case asserting all three properties:

- **(a)** the old shape normalizes to the modern shape and does not throw
- **(b)** `buildDesired(old)` deep-equals `buildDesired(modern)`
- **(c)** `automationSignatures(old)` deep-equals `automationSignatures(modern)`

(b) and (c) are the engine-safety half, and they are the reason this file exists. (a) alone only
proves the card did not crash.

The file also pins the boundary: scans asserting that the card, the editor and the diagnostics
report each call `normalizeCardConfig`, that the editor spreads the incoming config rather than
rebuilding it from a key list, that neither keeps its own copy of the season defaults, and that none
of the three contains the boundary's error literals. Note the limit - these are source scans, so a
re-implemented zone-name fallback or `fan_timer` coercion under a different spelling would pass
them. They catch the regressions they were written for, not the whole class. The editor's fix itself
was proven by driving the real editor in a browser, because a custom element cannot be imported in a
node environment; the scan only stops it being quietly removed again.

### Colliding keys are refused, not guessed around

`seasons[].key` is the permanent id baked into entity names, which is what lets you rename a
season's display name without every schedule entity changing id underneath you.

When two or more seasons resolve to the same key - duplicates, or several seasons with no key at
all - the card **refuses with a message naming the real cause**, provided at least one zone exists
for the ids to collide in (a zero-zone config emits no schedule ids, so it stays accepted, exactly
as at v0.7.1). The card never invents a key from the display name.

Guessing would break R3 in the way that matters most. An install that already ran a keyless config
owns a real `schedule.<prefix>_<zone>_undefined` entity holding its actual schedule blocks. If a
later version started deriving `summer` from the name, that install would plan a Create for a new
`..._summer` entity and silently leave the original as an unmanaged orphan. The card would have
moved somebody's provisioned objects without being asked.

**Measured, not assumed** - an earlier version of this document claimed a keyless install "can
never reach an all-Unchanged dry-run". That was wrong, and it was the justification for refusing
one. Verified against released v0.7.1: a single keyless season provisions, the generated
engine automation resolves and applies its blocks against `schedule.<prefix>_<zone>_undefined`, and
a fully-applied install replans to create 0 / adopt 0 / update 0 / delete 0. **It converges.**
(27 objects at one zone and one season, not the 24 an earlier draft claimed - measured.)
`fetchExisting`'s orphan-schedule fallback claims the entity even though the season parser cannot.

So the card **leaves a single keyless season alone**. Refusing it would have been a breaking change
to working software, which R3 forbids without an explicit decision. Its one-time side defect - the
schedule drawer looking the entity up by name slug and finding nothing - was fixed in 0.7.3 by
`resolveSeasonKey`, so the row opens too.

**Season sets whose keys collide ARE refused** - duplicate keys, or two-plus seasons with no key
at all, whenever at least one zone exists to collide in. Every such config already threw at v0.7.1
with `Naming collision: ... Rename the conflicting zone or season.` - advice naming the wrong
cause, since renaming cannot supply a missing or duplicated key. Replacing that message changes
behaviour for nobody. Seasons whose effective keys are DISTINCT are never refused, however odd:
`key: null` beside an absent key yields `_null` and `_undefined`, distinct ids that provisioned
and converged at v0.7.1, and still do.

Every caller of `buildDesired` already runs it inside a try/catch that renders the message as a
panel error, so the card keeps rendering normally. You get an accurate error in the setup panel
instead of a blank dashboard.

**"Accept old shapes forever" means what it says.** The bar for refusing a shape is that it cannot
work at all - like two seasons that collide on the same entity id - not that it looks wrong or that
part of the UI mishandles it. Check convergence by running it, never by reasoning about it.

The boundary matters, and it cut the other way once already: a season key that YAML parsed as a
number (`key: 1`) or a boolean (`key: off`, a YAML 1.1 boolean) is NOT blank. It already names live
entities like `schedule.<prefix>_<zone>_1`, that install converges, and refusing it would both break
a working install and - by telling its owner to rename the key - orphan the schedules holding their
blocks. The guard therefore tests for emptiness, never for type.

## Adding a config option: the checklist

1. Add the field to `MzcsCardConfig` in `src/types.ts`, optional, with a documented default.
2. Handle its absence in `normalizeCardConfig()` or a dedicated `resolve*` helper. Absent must mean
   the previous behaviour, exactly.
3. Add a shape-registry row above and a compat test case.
4. If the option reaches a generator, confirm the default path is **byte-identical**: the pinned
   default signatures must not move. See the engine-safety notes in `CLAUDE.md`.
5. Only once the reading bundle is released, let the editor write the field (R2).
