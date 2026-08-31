import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  canonicalInput,
  allPayloads,
  signaturesFor,
  inventoryFor,
  CANONICAL_SEASONS,
  VARIANTS,
} from './fixtures/canonical-config';
import { contentHash, parseSignature, canonicalString } from '../src/lib/automation-payloads';

/**
 * Backlog item 6, parts 1 and 2: golden snapshots and pinned default signatures.
 *
 * Every generated automation carries a content signature, and the differ plans
 * an Update whenever a live automation's embedded signature differs from the
 * current generator's. So ANY change to ANY generated string makes every
 * existing install plan work its owner did not ask for.
 *
 * These tests make that mechanical. A generator edit fails here with a readable
 * diff, and regenerating requires `npm run goldens`, which prints what moved.
 */

function golden(name: string): unknown {
  return JSON.parse(readFileSync(new URL(`./engine-golden/${name}`, import.meta.url), 'utf8'));
}

/**
 * The pinned default signatures.
 *
 * These are LITERALS on purpose. Reading them from signatures.default.json
 * would mean `npm run goldens` silently re-pins the very thing the pin exists to
 * protect - the file and the assertion would move together and the test could
 * never fail. Changing a value here has to be a deliberate human edit.
 *
 * Zone-independent generators (the watchdog) keep their hash across fixture
 * shapes; the rest are specific to this fixture's zone and season names.
 */
const PINNED: Record<string, string> = {
  climate_mzcs_engine: '6e68985e',
  climate_mzcs_watchdog: 'd6ad29bd',
  climate_mzcs_runtime_learning: 'ab1675eb',
  climate_mzcs_runtime_alert: '34cfb90d',
  climate_mzcs_fan_timer_zone_one: 'fac7b42f',
  climate_mzcs_fan_timer_zone_two: '19dee477',
  climate_mzcs_fan_timer_zone_three: 'e226bee9',
};

/**
 * Pinned signatures for EVERY variant, not just the default.
 *
 * QA finding H2/H4: `PINNED` above was the harness's only non-regenerable
 * anchor, and it covered exactly one config shape - 3 zones, 2 seasons, prefix
 * `climate`, defaults everywhere. A reviewer changed a string emitted only when
 * `fan_guard` was set, and another that varied only when `zones.length !== 3`,
 * regenerated the goldens, and the whole suite stayed green while real installs
 * would have planned Updates.
 *
 * These are literals for the same reason `PINNED` is. Regenerating cannot move
 * them, so a hash that shifts here forces someone to ask why a config they did
 * not think they touched moved - which is the question the false all-clear was
 * suppressing.
 */
const PINNED_VARIANTS: Record<string, Record<string, string>> = {
  'eco-preset-named': { engine: '62f37a13' },
  'eco-preset-disabled': { engine: '5bd0ad9b' },
  'fan-guard': { fan_timer_zone_one: '53dcd274', fan_timer_zone_two: '5fba46bc', fan_timer_zone_three: 'd3b8f72e' },
  // These two DROP automations rather than changing them, so their surviving
  // signatures must equal the default's. Pinned anyway: a generator that started
  // varying on a feature flag would show up here first.
  'fan-timer-off': { engine: '6e68985e', runtime_learning: 'ab1675eb', runtime_alert: '34cfb90d' },
  // Weather affects NO automation: its signatures must equal the default's
  // (item 37 - the variant exists to pin the conditional outdoor pair's false
  // branch). A weather-dependent generator change would show up here first.
  'with-weather': { engine: '6e68985e', runtime_learning: 'ab1675eb', runtime_alert: '34cfb90d' },
  'anomaly-alerts-off': { engine: '6e68985e', runtime_learning: 'ab1675eb', fan_timer_zone_one: 'fac7b42f' },
  'single-zone': { engine: '08c752f4', runtime_learning: '9a20aee7', runtime_alert: '015c309b', fan_timer_zone_one: 'fac7b42f' },
  'four-zones': {
    engine: 'd2673b28',
    runtime_learning: '4d7bdff3',
    runtime_alert: 'be454b0f',
    fan_timer_zone_one: 'fac7b42f',
    fan_timer_zone_two: '19dee477',
    fan_timer_zone_three: 'e226bee9',
    fan_timer_zone_four: '891b4085',
  },
  'single-season': { engine: '23cee162' },
  'three-seasons': { engine: '26c690bb' },
  // Item 7: the off-peak entity moves the engine ONLY; every other automation
  // must keep its default hash.
  'off-peak': { engine: '2a376799', runtime_learning: 'ab1675eb', fan_timer_zone_one: 'fac7b42f' },
  // Item 8: steering re-signs the engine (gate term + for_each key) and signs
  // the NEW steering automation; the rest keep their default hashes.
  steering: {
    engine: '3d725ac4',
    steering: '9d005136',
    runtime_learning: 'ab1675eb',
    fan_timer_zone_one: 'fac7b42f',
  },
  // The offset is a creation SEED read from a helper at runtime, so a custom
  // value must produce the SAME engine as the plain off-peak variant - a
  // config value leaking into the generator would show up here first.
  'off-peak-custom-offset': { engine: '2a376799' },
};

/** The alternate-prefix instance, pinned separately - different id namespace. */
const PINNED_ALT_PREFIX: Record<string, string> = {
  hvac_mzcs_engine: 'fa818666',
  hvac_mzcs_watchdog: 'cfcd2866',
  hvac_mzcs_runtime_learning: '9e1fa5cc',
  hvac_mzcs_runtime_alert: '28a72788',
  hvac_mzcs_fan_timer_zone_one: 'cec04818',
  hvac_mzcs_fan_timer_zone_two: '7618fc60',
  hvac_mzcs_fan_timer_zone_three: '120bda92',
};

describe('pinned signatures for NON-default configs (item 6 part 2, QA H2/H4)', () => {
  for (const [name, pins] of Object.entries(PINNED_VARIANTS)) {
    it(`${name} still produces its pinned hashes`, () => {
      const v = VARIANTS.find((x) => x.name === name)!;
      const sigs = signaturesFor(canonicalInput(v.overrides));
      const actual = Object.fromEntries(
        Object.keys(pins).map((k) => [k, sigs[`climate_mzcs_${k}`]]),
      );
      expect(actual).toEqual(pins);
    });
  }

  it('a second card instance still produces its pinned hashes', () => {
    expect(signaturesFor(canonicalInput({ prefix: 'hvac' }))).toEqual(PINNED_ALT_PREFIX);
  });

  it('the pins cover every variant in the matrix', () => {
    // A new axis without a pin would silently reintroduce the blind spot.
    const covered = new Set([...Object.keys(PINNED_VARIANTS), 'alternate-prefix']);
    expect(VARIANTS.map((v) => v.name).filter((n) => !covered.has(n))).toEqual([]);
  });
});

describe('pinned default signatures (item 6 part 2)', () => {
  const sigs = signaturesFor(canonicalInput());

  it('every generator still produces its pinned hash', () => {
    // Asserted as one object so a failure lists every drift at once rather than
    // stopping at the first.
    expect(sigs).toEqual(PINNED);
  });

  it('covers exactly the automations the fixture generates - no generator is unsigned', () => {
    expect(Object.keys(sigs).sort()).toEqual(Object.keys(allPayloads(canonicalInput())).sort());
  });

  it("each payload's embedded token IS its own content hash", () => {
    // automationSignatures() reads the token back out of the description rather
    // than re-hashing. That shortcut is only valid while stripping the token and
    // re-hashing reproduces it, so pin the property itself.
    for (const [uid, payload] of Object.entries(allPayloads(canonicalInput()))) {
      expect(parseSignature(payload.description), uid).toBe(contentHash(payload));
    }
  });

  it('the fixture generates the SAME payloads the signature map signs', () => {
    // QA code-health finding 2: allPayloads() in the fixture and
    // automationSignatures() in src both build the uid -> generator mapping by
    // hand, with their own argument lists, and nothing compared them. A
    // generator gaining a parameter that src passes and the fixture does not
    // would keep every other assertion green - key sets still match, each
    // payload is still self-consistent, PINNED still matches because it comes
    // from signaturesFor - while the committed goldens quietly stopped
    // describing what actually ships.
    for (const [uid, p] of Object.entries(allPayloads(canonicalInput()))) {
      expect(sigs[uid], `${uid}: fixture payload disagrees with the signature map`).toBe(
        parseSignature(p.description),
      );
    }
  });

  it('agrees with the signature map across every variant, not just the default', () => {
    for (const v of VARIANTS) {
      const input = canonicalInput(v.overrides);
      const vs = signaturesFor(input);
      for (const [uid, p] of Object.entries(allPayloads(input))) {
        expect(vs[uid], `${v.name}/${uid}`).toBe(parseSignature(p.description));
      }
    }
  });

  it('signatures are stable across repeated generation', () => {
    expect(signaturesFor(canonicalInput())).toEqual(sigs);
  });

  it('signatures are key-order independent', () => {
    // canonicalString sorts keys, so a config built in a different property
    // order must hash identically. If this broke, installs would flap between
    // two hashes and plan Updates forever.
    const a = canonicalString({ alias: 'x', id: 'y', mode: 'single' });
    const b = canonicalString({ mode: 'single', id: 'y', alias: 'x' });
    expect(a).toBe(b);
  });
});

describe('golden snapshots (item 6 part 1)', () => {
  it('the default automations match the committed golden', () => {
    expect(allPayloads(canonicalInput())).toEqual(golden('automations.default.json'));
  });

  it('the default signatures file matches the committed golden', () => {
    expect(signaturesFor(canonicalInput())).toEqual(golden('signatures.default.json'));
  });

  it('the golden signatures file agrees with the pinned literals', () => {
    // The one place the file and the literals are compared. If someone runs
    // `npm run goldens` after a generator change and commits it without
    // updating PINNED, this fails and names the drift.
    expect(golden('signatures.default.json')).toEqual(PINNED);
  });

  it('the desired inventory matches the committed golden', () => {
    expect(inventoryFor(canonicalInput())).toEqual(golden('inventory.default.json'));
  });

  it('the canonical fixture is a full 51-object install (48 + 3 runtime mirrors, item 42)', () => {
    const inv = inventoryFor(canonicalInput());
    expect(inv).toHaveLength(51);
    const byKind = inv.reduce<Record<string, number>>((a, o) => ({ ...a, [o.kind]: (a[o.kind] ?? 0) + 1 }), {});
    expect(byKind).toEqual({ helper: 23, template_sensor: 11, stats_sensor: 4, schedule: 6, automation: 7 });
  });

  it('every inventory id is unique', () => {
    const ids = inventoryFor(canonicalInput()).map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('the fixture describes a generic house, not a real one', () => {
    // This repository is public and its fixtures are committed. A live capture
    // pasted in here would ship somebody's room names to the world.
    const raw = readFileSync(new URL('./fixtures/canonical-config.ts', import.meta.url), 'utf8');
    expect(raw).not.toMatch(/upstairs|downstairs|master|bedroom_\d|nursery/i);
    for (const z of canonicalInput().zones) expect(z.name).toMatch(/^Zone /);
  });

});

describe('generated automations are well-formed (item 6 part 1 support)', () => {
  const payloads = allPayloads(canonicalInput());

  it('each payload id matches the key it is filed under', () => {
    for (const [uid, p] of Object.entries(payloads)) expect(p.id, uid).toBe(uid);
  });

  it('each description carries exactly one signature token', () => {
    for (const [uid, p] of Object.entries(payloads)) {
      const matches = String(p.description).match(/\[mzcs-sig:[0-9a-f]{8}\]/g) ?? [];
      expect(matches, uid).toHaveLength(1);
    }
  });

  it('each description declares the card as its owner', () => {
    // The managed marker is how a human reading their automation list knows not
    // to hand-edit it.
    for (const [uid, p] of Object.entries(payloads)) {
      expect(String(p.description), uid).toContain('Managed by Multi-Zone Climate Scheduler Card (mzcs).');
    }
  });

  it('the season name->key map covers every configured season', () => {
    const engine = JSON.stringify(payloads['climate_mzcs_engine']);
    for (const s of CANONICAL_SEASONS) expect(engine).toContain(`'${s.name}': '${s.key}'`);
  });
});
