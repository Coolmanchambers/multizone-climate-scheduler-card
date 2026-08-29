# Working in this repository

## This repository is public

It is developed against a single real Home Assistant install that controls real HVAC in a real
home, and the working copy sits beside that install's data. That combination has already caused
one disclosure: private detail reached tracked files, and the history had to be rewritten to
remove it.

**Before every commit, `npm run privacy` must pass.** It runs automatically as a pre-commit hook
(`npm install` points `core.hooksPath` at `.githooks/`) and again in CI. Do not pass
`--no-verify`. If the scan is wrong, narrow the pattern in `scripts/privacy-scan.mjs` and say so
in the commit; never delete a check to get a commit through.

### The test: could a stranger use this to identify the maintainer?

The bar is **a direct link back to a real person**, not "derived from something real". Scrub
anything that identifies; do not scrub data merely because it was captured from a live instance.

**Never commit** (these identify):

- **Personal names**, in any form: prose, a room or area name built from someone's name
  (`jordans_room`), an entity id slug, a possessive, straight or curly apostrophe variants.
  Illustrative names in this file are FICTIONAL on purpose: an example of what not to commit
  must not itself be the thing.
- **Emails, LAN addresses, hostnames, Nabu Casa URLs, local filesystem paths.**
- **Entity ids, area names or device names copied verbatim from the live instance**, because in
  practice they carry names (`jordans_room`, `alexs_office`) and one leaks the rest. Note this is a
  rule about *copying wholesale*, not about the words themselves: a room genuinely called
  "Upstairs" is fine to write (see below), what is not fine is pasting a live area list.
  Fixtures use neutral names (`bedroom_1`, `Studio`). If you capture live state, neutralise it in
  the same edit, not later.
- **`HANDOFF.md` or `.privacy-terms`.** Both are gitignored and the scan fails if either becomes
  tracked. `HANDOFF.md` is session state, not documentation.

**Fine to commit** (these do not identify, and treating them as secrets costs more than it buys):

- **Schedule block times, setpoints and block labels**, including *wake*, *away* and *sleep*.
  A thermostat schedule is not a direct identifier — it names nobody and resolves to no address —
  and this is a scheduling card, so realistic schedules are the useful test data.
  **Decided by the maintainer, 2026-08-26**, after a review flagged the canonical fixture for
  reproducing real block times. Do not re-raise it as a finding.
- Generic room words that are not built from a person's name (`Upstairs`, `Office`, `Studio`).
- The `Coolmanchambers` handle. It is the public repo owner and is intentionally public.

One standing exception, already decided and not a precedent: the Buy Me a Coffee page linked from
the README carries a LinkedIn link whose slug is the maintainer's real name. Accepted knowingly
("deep enough I'm not worried about it"). It covers that link and nothing else.

## What belongs in the public repo

`README.md` (end users), `CONTRACT.md` (the frozen naming and schema contract), `CHANGELOG.md`,
`docs/`. Session state, roadmaps tied to one house, and live diagnostics do not.

## Before changing the provisioning engine

Generators, signatures, the differ, the executor and teardown all decide what gets written to
somebody's home automation. Read the `mzcs-engine-safety` skill first. The default generated
output must stay byte-identical unless a signature bump is intended, or every existing install
plans spurious updates.

**The snapshot harness is a regression net, not a proof.** An adversarial review walked
semantically harmful generator changes past a green suite (unasserted `repeat.for_each` contents,
`choose` branch order, service-call data values, the executor's template flows, configs outside
the variant matrix - the repair list lives in the private HANDOFF backlog). A green run means
"nothing known-bad recurred", never "this change is safe": engine changes still get a human
review of the generated output before they ship. What the net covers:

- `tests/engine-golden.test.ts` — committed goldens plus the pinned default signatures. The
  hashes are literals in the test file, deliberately not read from the golden JSON, so
  regenerating cannot silently re-pin them.
- `tests/engine-invariants.test.ts` — the safety properties. The load-bearing gate templates are
  pinned as exact strings (substring checks proved defeatable); the rest is structural.
- `tests/engine-variants.test.ts` — per option, what changes AND that **nothing else does**. This
  is what makes a new feature safe to add behind a flag.
- `tests/executor-parity.test.ts` — that what `provision-exec.ts` WRITES equals what the differ
  SIGNS, for every variant. They are separate hand-built maps and can drift apart.
- `tests/fixtures/canonical-config.ts` — the single fixture and the variant matrix. Add an axis
  here, not in a test file.

If a golden legitimately changes, `npm run goldens` regenerates it and prints which golden files
changed, which signatures moved (as `config/automation`), and which configs will therefore plan
Updates. Then update the pinned literals by hand. If you did not intend a signature to move, do not
commit — branch the generator so the affected path emits the previous strings.

Adding a config option? `docs/config-compatibility.md` carries the rules and the checklist.

## Verification expectations

- `npm run privacy`, `npx tsc --noEmit`, `npx vitest run`, `npm run build`.
- The committed `dist/` bundle must reproduce from source: `git diff --exit-code dist/`. It is
  what HACS serves between releases, and the release workflow fails if it drifts.
- Live claims need live evidence. A healthy install settles to an all-Unchanged dry-run; assert
  that rather than reasoning from the source.
