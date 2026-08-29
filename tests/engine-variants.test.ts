import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  canonicalInput,
  allPayloads,
  signaturesFor,
  inventoryFor,
  VARIANTS,
  CANONICAL_ZONES,
} from './fixtures/canonical-config';

/**
 * Backlog item 6, part 4: the variant matrix.
 *
 * Two halves, and the SECOND is the load-bearing one:
 *   1. turning an option on changes what it is supposed to change;
 *   2. turning an option on changes NOTHING ELSE.
 *
 * (2) is what makes items 7 and 8 (off-peak, comfort steering) safe to build
 * behind feature flags. A new clause that leaks into the default path perturbs
 * the engine signature, and every existing install then plans an Update it did
 * not ask for. Here that is a failing test rather than a support thread.
 */

function golden(name: string): unknown {
  return JSON.parse(readFileSync(new URL(`./engine-golden/${name}`, import.meta.url), 'utf8'));
}

const BASE_PAYLOADS = allPayloads(canonicalInput());
const BASE_SIGS = signaturesFor(canonicalInput());

describe.each(VARIANTS)('variant: $name', (v) => {
  const input = canonicalInput(v.overrides);
  const payloads = allPayloads(input);

  it('matches its committed golden', () => {
    expect(payloads).toEqual(golden(`automations.${v.name}.json`));
  });

  it('inventory matches its committed golden', () => {
    expect(inventoryFor(input)).toEqual(golden(`inventory.${v.name}.json`));
  });

  {
    const affected = v.affects;

    it(`perturbs exactly: ${affected.length ? affected.join(', ') : '(nothing)'}`, () => {
      const moved = Object.keys(payloads).filter(
        (uid) => uid in BASE_PAYLOADS && JSON.stringify(payloads[uid]) !== JSON.stringify(BASE_PAYLOADS[uid]),
      );
      expect(moved.sort()).toEqual([...affected].sort());
    });

    it('leaves every other automation BYTE-IDENTICAL to the default', () => {
      // Spelled out separately from the assertion above so a failure names the
      // automation that moved rather than just showing two unequal arrays.
      for (const uid of Object.keys(payloads)) {
        if (affected.includes(uid) || !(uid in BASE_PAYLOADS)) continue;
        expect(payloads[uid], `${uid} drifted: ${v.note}`).toEqual(BASE_PAYLOADS[uid]);
      }
    });

    it('moves exactly the same set of signatures', () => {
      const sigs = signaturesFor(input);
      const moved = Object.keys(sigs).filter((uid) => uid in BASE_SIGS && sigs[uid] !== BASE_SIGS[uid]);
      expect(moved.sort()).toEqual([...affected].sort());
    });
  }
});

describe('option independence', () => {
  it('an option that only removes objects never rewrites the survivors', () => {
    // fan_timer: [] and anomaly_alerts: false drop automations. If dropping one
    // also reworded another, an install toggling a feature off would plan
    // Updates on automations it never touched.
    //
    // QA finding H7: allPayloads used to ignore those flags entirely, so this
    // compared the default against itself. It now returns only what is actually
    // provisioned, which is what makes the removal assertion below meaningful.
    const expectedDrops: Record<string, string[]> = {
      'fan-timer-off': [
        'climate_mzcs_fan_timer_zone_one',
        'climate_mzcs_fan_timer_zone_two',
        'climate_mzcs_fan_timer_zone_three',
      ],
      'anomaly-alerts-off': ['climate_mzcs_runtime_alert'],
    };
    for (const [name, drops] of Object.entries(expectedDrops)) {
      const v = VARIANTS.find((x) => x.name === name)!;
      const payloads = allPayloads(canonicalInput(v.overrides));
      // The named automations really are gone...
      for (const uid of drops) expect(payloads[uid], `${name} should drop ${uid}`).toBeUndefined();
      expect(Object.keys(payloads).sort()).toEqual(
        Object.keys(BASE_PAYLOADS)
          .filter((u) => !drops.includes(u))
          .sort(),
      );
      // ...and every survivor is untouched.
      for (const uid of Object.keys(payloads)) expect(payloads[uid], `${name}/${uid}`).toEqual(BASE_PAYLOADS[uid]);
    }
  });

  it('the fan guard does not reach the engine', () => {
    const withGuard = allPayloads(canonicalInput({ features: { fan_guard: 'input_boolean.hvac_fan_guard' } }));
    expect(withGuard['climate_mzcs_engine']).toEqual(BASE_PAYLOADS['climate_mzcs_engine']);
  });

  it('the standby preset does not reach the fan, learning or alert automations', () => {
    for (const preset of ['away', false] as const) {
      const p = allPayloads(canonicalInput({ features: { eco_preset: preset } }));
      for (const uid of Object.keys(p)) {
        if (uid === 'climate_mzcs_engine') continue;
        expect(p[uid], `${String(preset)}/${uid}`).toEqual(BASE_PAYLOADS[uid]);
      }
    }
  });

  it('two options together perturb exactly the union of what each does alone', () => {
    // The combination case: if options interacted, a user running both would
    // get output neither single-option golden describes.
    const both = allPayloads(
      canonicalInput({ features: { eco_preset: 'away', fan_guard: 'input_boolean.hvac_fan_guard' } }),
    );
    const eco = allPayloads(canonicalInput({ features: { eco_preset: 'away' } }));
    const guard = allPayloads(canonicalInput({ features: { fan_guard: 'input_boolean.hvac_fan_guard' } }));
    expect(both['climate_mzcs_engine']).toEqual(eco['climate_mzcs_engine']);
    for (const uid of Object.keys(both)) {
      if (uid.includes('fan_timer')) expect(both[uid], uid).toEqual(guard[uid]);
    }
  });
});

describe('inventory scales with the config', () => {
  it('one zone provisions the per-zone objects once', () => {
    const inv = inventoryFor(canonicalInput({ zones: [CANONICAL_ZONES[0]!] }));
    // 48 - 2 zones x (7 per-zone helpers/sensors + 2 seasons of schedule + 1 fan automation)
    expect(inv.filter((o) => o.kind === 'automation')).toHaveLength(5);
    expect(inv.filter((o) => o.kind === 'schedule')).toHaveLength(2);
  });

  it('four zones is the documented maximum and provisions cleanly', () => {
    const v = VARIANTS.find((x) => x.name === 'four-zones')!;
    const inv = inventoryFor(canonicalInput(v.overrides));
    expect(inv.filter((o) => o.kind === 'automation')).toHaveLength(8);
    expect(new Set(inv.map((o) => o.id)).size).toBe(inv.length);
  });

  it('a third season adds a schedule per zone and appears in the engine map', () => {
    const v = VARIANTS.find((x) => x.name === 'three-seasons')!;
    const input = canonicalInput(v.overrides);
    expect(inventoryFor(input).filter((o) => o.kind === 'schedule')).toHaveLength(9);
    expect(JSON.stringify(allPayloads(input)['climate_mzcs_engine'])).toContain("'Shoulder': 'shoulder'");
  });

  it('turning fan timers off removes both the timers and their automations', () => {
    const v = VARIANTS.find((x) => x.name === 'fan-timer-off')!;
    const inv = inventoryFor(canonicalInput(v.overrides));
    expect(inv.filter((o) => o.id.includes('_fan'))).toEqual([]);
    expect(inv.filter((o) => o.kind === 'automation')).toHaveLength(4);
  });

  it('an absent fan_timer list means ON, an empty list means OFF', () => {
    // Easy to invert by accident and the README documents the distinction.
    expect(inventoryFor(canonicalInput({ features: {} })).filter((o) => o.id.includes('_fan')).length).toBeGreaterThan(0);
    expect(inventoryFor(canonicalInput({ features: { fan_timer: [] } })).filter((o) => o.id.includes('_fan'))).toEqual([]);
  });
});

describe('a second card instance cannot collide with the first', () => {
  const other = canonicalInput({ prefix: 'hvac' });

  it('shares no object id with the default prefix', () => {
    const mine = new Set(inventoryFor(canonicalInput()).map((o) => o.id));
    for (const o of inventoryFor(other)) expect(mine.has(o.id), o.id).toBe(false);
  });

  it('shares no display name with the default prefix', () => {
    // Display names slugify into object ids on the HA side; a shared name once
    // renamed a production sensor belonging to another install.
    const mine = new Set(
      inventoryFor(canonicalInput()).map((o) => String((o.spec as Record<string, unknown>).name ?? '')),
    );
    for (const o of inventoryFor(other)) {
      const name = String((o.spec as Record<string, unknown>).name ?? '');
      if (name) expect(mine.has(name), name).toBe(false);
    }
  });

  it('signs its automations differently', () => {
    // QA finding H8: this used to assert `uid.startsWith('hvac_')`, which cannot
    // fail - automationUniqueId builds the id FROM the prefix - and never looked
    // at a signature at all, despite the name. Compare the values.
    const mine = signaturesFor(canonicalInput());
    const theirs = signaturesFor(other);
    const pairs = Object.keys(mine).map((uid) => [uid, uid.replace(/^climate_/, 'hvac_')] as const);
    expect(pairs.length).toBeGreaterThan(0);
    for (const [a, b] of pairs) {
      expect(theirs[b], `${b} missing from the second instance`).toBeDefined();
      // Every payload embeds its own prefixed ids, so no two instances can share
      // a signature. If they did, one instance's differ could read the other's
      // automation as pristine.
      expect(theirs[b], `${a} and ${b} share a signature`).not.toBe(mine[a]);
    }
  });
});
