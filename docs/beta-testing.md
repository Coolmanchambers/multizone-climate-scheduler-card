# Beta releases

Some releases of this card are published as **betas** — builds that are ready for real use but
have only been run on the author's own installation. Betas are **opt-in**. If you do nothing,
HACS will never offer you one, and you stay on stable releases.

This page covers how to opt in, how to get back off, and what to do when a beta misbehaves.

---

## How the channel works

| | Stable | Beta |
|---|---|---|
| Tag | `v0.7.1` | `v0.7.1-beta.1` |
| On GitHub | Normal release, marked *Latest* | Marked **Pre-release** |
| Who sees it in HACS | Everyone | Only people who enabled the pre-release switch |

HACS hides GitHub pre-releases from anyone who has not asked for them, so a beta cannot reach a
normal user by accident. A beta version always sorts *below* the stable release of the same
number: `0.7.1-beta.1` comes before `0.7.1`. When the stable `v0.7.1` ships, beta testers are
offered it as a normal update.

---

## Opting in

The switch is per-repository, and Home Assistant ships it disabled, so this is a two-step
process the first time.

1. Go to **Settings → Devices & services → HACS**, then open the device named
   **Multi-Zone Climate Scheduler Card**.
2. On that device you'll see a line reading **"+1 entity is disabled"** (or similar). Click it,
   then enable the entity named **Pre-release**. Home Assistant tells you it will appear in
   about 30 seconds — wait for it.
3. Turn the **Pre-release** switch **on**.

That's it. HACS now considers pre-releases of this repository when it checks for updates, and
beta versions appear in its version list.

> [!TIP]
> If you don't see a **Pre-release** entity at all, your HACS is older than 2.0. Older versions
> put a **Show beta versions** toggle in the repository's download dialog instead.

## Installing a beta

Once the switch is on, either:

- Wait for HACS to offer the beta as an update, and press **Update**; or
- Open the repository in HACS → three-dot menu → **Redownload** → **Need a different version?**
  → pick the beta.

Then **hard-refresh your browser** (or, in the Companion app,
**Settings → Companion App → Troubleshooting → Reset frontend cache**, then force-quit and
reopen). A card is browser JavaScript — without a refresh you are still running the old bundle,
no matter what HACS says.

### Confirm which version you are actually running

Open your browser's developer console and reload the dashboard. The card prints a banner:

```
 Multi-Zone Climate Scheduler Card   v0.7.1-beta.1
```

That banner is the running bundle. The card also reports its version in the diagnostics report
(gear icon → **Objects** tab → **Build report**), which is the easier route.

---

## Rolling back

**A bad beta is a two-minute fix.** You do not need to uninstall anything.

1. HACS → **Multi-Zone Climate Scheduler Card** → three-dot menu → **Redownload**.
2. Expand **Need a different version?** and pick the last version that worked — usually the most
   recent stable, e.g. `v0.7.0`.
3. Hard-refresh the browser.
4. Confirm the console banner shows the version you picked.

Your schedules, helpers, sensors and automations are **untouched** by any of this. They live in
Home Assistant, not in the card, so downgrading the card does not lose a schedule or change a
setpoint.

> [!WARNING]
> **One exception, and it is the reason to roll back promptly.** If a beta added a new
> configuration option and you saved it in the card's config, an older bundle may not understand
> that option and can fail to render. If the card comes back blank after a downgrade, remove the
> new option from the card's YAML (dashboard → edit card → **Show code editor**) and refresh.
> Release notes call out any beta that introduces a new config shape.

**If a beta ever misbehaves while a zone is enabled**, the fastest safe move is the same as
always: gear icon → **Zones** tab → switch the zone (or the master) **Off**. Control returns to
your thermostat's own app immediately. Then roll back at your leisure.

---

## Leaving the beta channel

1. Turn the **Pre-release** switch **off** (same device page as above).
2. HACS → **Redownload** → pick the current stable release.
3. Hard-refresh.

You will stay on stable from then on. You can leave the switch entity enabled; an off switch is
enough.

---

## Reporting what you find

Beta feedback is the entire point, and negative results are as useful as positive ones.

Open an issue at
[github.com/Coolmanchambers/multizone-climate-scheduler-card/issues](https://github.com/Coolmanchambers/multizone-climate-scheduler-card/issues)
and include:

- **A diagnostics report** — gear icon → **Objects** tab → **Build report**. It carries the card
  and Home Assistant versions and the shape of your setup, with your entity ids and room names
  left out by default.
- **What you expected and what happened.**
- **For anything to do with provisioning** — objects created, edited or deleted, or an apply that
  won't settle — the contents of the dry-run preview (gear icon → **Setup** tab → **Run dry-run
  preview**). A healthy install settles to *Unchanged* for every object after one apply; if yours
  doesn't, that list is the single most useful thing you can send.
- **Any browser console errors**, copied as text.

If a beta is actively causing you trouble, roll back first and report afterwards. Nothing is
gained by staying on a broken build.
