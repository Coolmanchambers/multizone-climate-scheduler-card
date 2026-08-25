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

### Never commit

- **Real entity ids, area names, or device names from a live instance.** Fixtures use neutral
  names (`bedroom_1`, `Studio`) for exactly this reason. If you capture live state for a
  fixture, neutralise it in the same edit, not later.
- **Anything identifying the household**: personal names, a LAN address or hostname, an email,
  a timezone or utility that narrows the location, real occupancy hours.
- **`HANDOFF.md` or `.privacy-terms`.** Both are gitignored and the scan fails if either becomes
  tracked. `HANDOFF.md` is session state, not documentation; it lives on disk at the repo root
  and is deliberately outside version control.

Schedules deserve specific care: block times labelled *wake*, *away* and *sleep* are an occupancy
pattern, not test data. Keep them unattributed and do not describe them as anyone's real schedule.

## What belongs in the public repo

`README.md` (end users), `CONTRACT.md` (the frozen naming and schema contract), `CHANGELOG.md`,
`docs/`. Session state, roadmaps tied to one house, and live diagnostics do not.

## Before changing the provisioning engine

Generators, signatures, the differ, the executor and teardown all decide what gets written to
somebody's home automation. Read the `mzcs-engine-safety` skill first. The default generated
output must stay byte-identical unless a signature bump is intended, or every existing install
plans spurious updates.

## Verification expectations

- `npm run privacy`, `npx tsc --noEmit`, `npx vitest run`, `npm run build`.
- The committed `dist/` bundle must reproduce from source: `git diff --exit-code dist/`. It is
  what HACS serves between releases, and the release workflow fails if it drifts.
- Live claims need live evidence. A healthy install settles to an all-Unchanged dry-run; assert
  that rather than reasoning from the source.
