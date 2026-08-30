import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  normalizeCardConfig,
  normalizeRoomSensors,
  resolveEcoPreset,
  type MzcsCardConfig,
} from '../src/types';
import {
  buildDesired,
  plan,
  applyPlan,
  actionable,
  provisionInputFromConfig,
  type ProvisionInput,
} from '../src/lib/provisioning';
import { slugify } from '../src/lib/naming';
import { automationSignatures } from '../src/lib/automation-payloads';
import type { ScheduleBlock } from '../src/lib/schedule-ranges';

/**
 * Backlog item 9 - config-migration policy (docs/config-compatibility.md).
 *
 * One case per row of the shape registry. Each asserts the three properties the
 * policy requires:
 *   (a) the old shape normalizes to the modern shape and does not throw;
 *   (b) it produces identical `buildDesired` output;
 *   (c) it produces identical automation signatures.
 *
 * (b) and (c) are the engine-safety half: a config migration that perturbs
 * either one is not a migration, it is a breaking change that makes every
 * existing install plan Updates it did not ask for.
 */

const block: ScheduleBlock = { time: '04:00', name: 'Block A', mode: 'cool', cool_temp: 70, heat_temp: null };
const set = { granularity: 'all' as const, sets: { all: [block] } };

const ZONES = [
  { slug: 'zone_a', name: 'Zone A', climate: 'climate.zone_a' },
  { slug: 'zone_b', name: 'Zone B', climate: 'climate.zone_b' },
];
const SEASONS = [
  { key: 'summer', name: 'Summer', default_mode: 'cool' as const },
  { key: 'winter', name: 'Winter', default_mode: 'heat_cool' as const },
];

function input(overrides: Partial<ProvisionInput['features']> = {}): ProvisionInput {
  return {
    prefix: 'climate',
    zones: ZONES,
    seasons: SEASONS,
    schedules: Object.fromEntries(ZONES.map((z) => [z.slug, { summer: set, winter: set }])),
    features: { fan_timer: true, anomaly_alerts: true, steering: false, ...overrides },
  };
}

/** (b) + (c): two provision inputs must be indistinguishable to the engine. */
function expectSameProvisioning(a: ProvisionInput, b: ProvisionInput): void {
  expect(buildDesired(a)).toEqual(buildDesired(b));
  const refs = (i: ProvisionInput) => i.zones.map((z) => ({ ...z, climate: z.climate ?? `climate.${z.slug}` }));
  expect(
    automationSignatures(a.prefix, refs(a), a.seasons, a.features.fan_guard, resolveEcoPreset(a.features)),
  ).toEqual(
    automationSignatures(b.prefix, refs(b), b.seasons, b.features.fan_guard, resolveEcoPreset(b.features)),
  );
}

/**
 * Build a ProvisionInput from a raw card config through the SAME path the card
 * uses: normalize, then map. Comparing two hand-built ProvisionInputs proves
 * nothing about a config shape, because the shape difference is already
 * collapsed by the time a ProvisionInput exists (QA code-health finding 4 -
 * two tests here previously compared a value to itself).
 */
function viaConfig(cfg: MzcsCardConfig): ProvisionInput {
  const normalized = normalizeCardConfig(cfg);
  const schedules = Object.fromEntries(
    normalized.zones.map((z) => [slugify(z.name), { summer: set, winter: set }]),
  );
  return provisionInputFromConfig(normalized, schedules, slugify);
}

const baseConfig = (): MzcsCardConfig => ({
  type: 'custom:multizone-climate-scheduler-card',
  prefix: 'climate',
  zones: [{ entity: 'climate.zone_a', name: 'Zone A' }],
  seasons: SEASONS,
});

describe('registry row: zones[].room_sensors (string[] -> Array<string | {entity,name}>)', () => {
  it('(a) accepts the bare-string form forever', () => {
    expect(normalizeRoomSensors(['sensor.bedroom_1_temperature'])).toEqual([
      { entity: 'sensor.bedroom_1_temperature' },
    ]);
  });

  it('(a) accepts both forms mixed in one list', () => {
    expect(
      normalizeRoomSensors(['sensor.bedroom_1_temperature', { entity: 'sensor.studio_temperature', name: 'Studio' }]),
    ).toEqual([
      { entity: 'sensor.bedroom_1_temperature' },
      { entity: 'sensor.studio_temperature', name: 'Studio' },
    ]);
  });

  it('(a) survives a whole config through the normalization boundary', () => {
    const old = { ...baseConfig(), zones: [{ entity: 'climate.zone_a', name: 'Zone A', room_sensors: ['sensor.bedroom_1_temperature'] }] };
    expect(() => normalizeCardConfig(old)).not.toThrow();
    expect(normalizeRoomSensors(normalizeCardConfig(old).zones[0]!.room_sensors)).toEqual([
      { entity: 'sensor.bedroom_1_temperature' },
    ]);
  });

  it('(b)(c) both forms provision identically, through the real config path', () => {
    const oldShape = {
      ...baseConfig(),
      zones: [{ entity: 'climate.zone_a', name: 'Zone A', room_sensors: ['sensor.bedroom_1_temperature'] }],
    };
    const modern = {
      ...baseConfig(),
      zones: [
        {
          entity: 'climate.zone_a',
          name: 'Zone A',
          room_sensors: [{ entity: 'sensor.bedroom_1_temperature', name: 'Bedroom 1' }],
        },
      ],
    };
    expectSameProvisioning(viaConfig(oldShape), viaConfig(modern));
  });
});

describe('registry row: features.fan_timer (scalar number -> number[])', () => {
  it('(a) a scalar becomes a one-element list', () => {
    const old = { ...baseConfig(), features: { fan_timer: 15 as unknown as number[] } };
    expect(normalizeCardConfig(old).features?.fan_timer).toEqual([15]);
  });

  it('(a) a list passes through untouched', () => {
    const modern = { ...baseConfig(), features: { fan_timer: [15, 30, 60] } };
    expect(normalizeCardConfig(modern).features?.fan_timer).toEqual([15, 30, 60]);
  });

  it('(a) a non-numeric value degrades to undefined rather than throwing', () => {
    const junk = { ...baseConfig(), features: { fan_timer: 'fifteen' as unknown as number[] } };
    expect(() => normalizeCardConfig(junk)).not.toThrow();
    expect(normalizeCardConfig(junk).features?.fan_timer).toBeUndefined();
  });

  it('(b)(c) scalar and single-element list provision identically', () => {
    // Through the real path: the scalar normalizes to [15], and both then map to
    // features.fan_timer === true. Hand-building two ProvisionInputs would have
    // collapsed the difference before the assertion could see it.
    const scalar = { ...baseConfig(), features: { fan_timer: 15 as unknown as number[] } };
    const list = { ...baseConfig(), features: { fan_timer: [15] } };
    expectSameProvisioning(viaConfig(scalar), viaConfig(list));
    expect(viaConfig(scalar).features.fan_timer).toBe(true);
  });

  it('(b)(c) an absent features block still means fan timers ON', () => {
    // `(fan_timer?.length ?? 3) > 0` - absent is enabled, empty is disabled.
    expect(viaConfig(baseConfig()).features.fan_timer).toBe(true);
    expect(viaConfig({ ...baseConfig(), features: { fan_timer: [] } }).features.fan_timer).toBe(false);
  });

  it('(b)(c) an explicitly empty list is a DIFFERENT config, not a migration', () => {
    // Guards the README's documented distinction (X3): `fan_timer: []` hides the
    // chips and drops the per-zone timers. If this ever stopped differing, the
    // opt-out would have silently become a no-op.
    expect(buildDesired(input({ fan_timer: false }))).not.toEqual(buildDesired(input({ fan_timer: true })));
  });
});

describe('registry row: features.eco_preset (absent -> string | false)', () => {
  it('(a) absent resolves to the original behaviour', () => {
    expect(resolveEcoPreset(undefined)).toBe('eco');
    expect(resolveEcoPreset({})).toBe('eco');
  });

  it('(a) a name is honoured and false disables the gate', () => {
    expect(resolveEcoPreset({ eco_preset: 'away' })).toBe('away');
    expect(resolveEcoPreset({ eco_preset: false })).toBe(null);
  });

  it('(a) an empty or whitespace string falls back rather than emitting a blank preset', () => {
    expect(resolveEcoPreset({ eco_preset: '   ' })).toBe('eco');
  });

  it('(b)(c) omitting it provisions exactly as writing the default does', () => {
    expectSameProvisioning(input({ eco_preset: undefined }), input({ eco_preset: 'eco' }));
  });

  it('(b)(c) a different preset IS a signature change, and only of the engine', () => {
    const refs = ZONES;
    const base = automationSignatures('climate', refs, SEASONS, undefined, 'eco');
    const away = automationSignatures('climate', refs, SEASONS, undefined, 'away');
    expect(away['climate_mzcs_engine']).not.toBe(base['climate_mzcs_engine']);
    for (const uid of Object.keys(base)) {
      if (uid === 'climate_mzcs_engine') continue;
      expect(away[uid]).toBe(base[uid]);
    }
  });
});

describe('registry row: zones[].name (may be absent -> present)', () => {
  it('(a) a missing name is derived from the entity id', () => {
    const old = { ...baseConfig(), zones: [{ entity: 'climate.upper_floor' } as { entity: string; name: string }] };
    expect(normalizeCardConfig(old).zones[0]!.name).toBe('upper floor');
  });

  it('(a) a blank name is treated as missing', () => {
    const old = { ...baseConfig(), zones: [{ entity: 'climate.upper_floor', name: '   ' }] };
    expect(normalizeCardConfig(old).zones[0]!.name).toBe('upper floor');
  });

  it('(a) a zone with neither name nor entity still renders as a placeholder', () => {
    const partial = { ...baseConfig(), zones: [{} as { entity: string; name: string }] };
    expect(() => normalizeCardConfig(partial)).not.toThrow();
    expect(normalizeCardConfig(partial).zones[0]!.name).toBe('Zone');
  });

  it('(b)(c) a derived name provisions exactly as writing that name does', () => {
    // QA contract-conformance finding 2: this row had (a) coverage only.
    const derived = { ...baseConfig(), zones: [{ entity: 'climate.upper_floor' } as { entity: string; name: string }] };
    const explicit = { ...baseConfig(), zones: [{ entity: 'climate.upper_floor', name: 'upper floor' }] };
    expectSameProvisioning(viaConfig(derived), viaConfig(explicit));
  });
});

describe('registry row: seasons (may be absent -> Summer/Winter)', () => {
  it('(a) an absent seasons block is accepted', () => {
    const { seasons: _drop, ...noSeasons } = baseConfig();
    expect(() => viaConfig(noSeasons as MzcsCardConfig)).not.toThrow();
    expect(viaConfig(noSeasons as MzcsCardConfig).seasons.map((x) => x.key)).toEqual(['summer', 'winter']);
  });

  it('(b)(c) omitting seasons provisions exactly as writing the two defaults does', () => {
    const { seasons: _drop, ...noSeasons } = baseConfig();
    expectSameProvisioning(viaConfig(noSeasons as MzcsCardConfig), viaConfig(baseConfig()));
  });

  it('each caller gets its OWN seasons array, never a shared one', () => {
    // QA delta-safety finding 3: a shared module-level default would let one
    // in-place sort corrupt every card instance on the page at once.
    const { seasons: _drop, ...noSeasons } = baseConfig();
    const a = viaConfig(noSeasons as MzcsCardConfig).seasons;
    const b = viaConfig(noSeasons as MzcsCardConfig).seasons;
    expect(a).not.toBe(b);
    expect(a[0]).not.toBe(b[0]);
    a[0]!.name = 'Mutated';
    expect(viaConfig(noSeasons as MzcsCardConfig).seasons[0]!.name).toBe('Summer');
  });
});

describe('registry row: prefix and features (may be absent)', () => {
  it('(a)(b)(c) an absent prefix provisions exactly as the explicit default does', () => {
    const { prefix: _drop, ...noPrefix } = baseConfig();
    expectSameProvisioning(viaConfig(noPrefix as MzcsCardConfig), viaConfig(baseConfig()));
    expect(viaConfig(noPrefix as MzcsCardConfig).prefix).toBe('climate');
  });

  it('(a)(b)(c) an absent features block provisions exactly as the documented defaults do', () => {
    const explicit = { ...baseConfig(), features: { fan_timer: [15, 30, 60], anomaly_alerts: true } };
    expectSameProvisioning(viaConfig(baseConfig()), viaConfig(explicit));
  });
});

describe('normalization boundary (policy R1)', () => {
  it('is tolerant of the incomplete configs the editor produces mid-edit', () => {
    expect(() => normalizeCardConfig({ ...baseConfig(), zones: [] })).not.toThrow();
    expect(() => normalizeCardConfig({ ...baseConfig(), zones: undefined as unknown as [] })).not.toThrow();
  });

  it('still throws on the two structurally hopeless configs', () => {
    expect(() => normalizeCardConfig({ ...baseConfig(), zones: 'nope' as unknown as [] })).toThrow(
      /zones must be a list/,
    );
    const five = Array.from({ length: 5 }, (_, i) => ({ entity: `climate.z${i}`, name: `Z${i}` }));
    expect(() => normalizeCardConfig({ ...baseConfig(), zones: five })).toThrow(/maximum of 4 zones/);
  });

  it('does not mutate the config it was handed', () => {
    const original = { ...baseConfig(), features: { fan_timer: 15 as unknown as number[] } };
    const copy = JSON.parse(JSON.stringify(original));
    normalizeCardConfig(original);
    expect(original).toEqual(copy);
  });

  it('is the ONLY boundary - the card must not re-implement it', () => {
    const src = readFileSync(new URL('../src/multizone-climate-scheduler-card.ts', import.meta.url), 'utf8');
    expect(src).toContain('normalizeCardConfig(config)');
    // These literals live in src/types.ts now. Their reappearance in the card
    // means a second normalization path that no test can reach (the card cannot
    // be imported in a node environment).
    expect(src).not.toContain('A maximum of 4 zones is supported.');
    expect(src).not.toContain('zones must be a list of');
  });

  /**
   * Item 40. A SOURCE SCAN, not a behavioural test, and it is second-class
   * evidence: `src/editor.ts` defines a custom element and cannot be imported
   * in a node environment, so the fix itself was proven by driving the real
   * editor in a browser. This only stops the boundary being quietly removed
   * again. Verified non-vacuous: run against the v0.7.2 blobs, every assertion
   * below fails.
   */
  it('the editor and diagnostics go through the boundary too (item 40)', () => {
    const editor = readFileSync(new URL('../src/editor.ts', import.meta.url), 'utf8');
    const diag = readFileSync(new URL('../src/lib/diagnostics.ts', import.meta.url), 'utf8');

    expect(editor).toContain('normalizeCardConfig(config)');
    expect(diag).toContain('normalizeCardConfig(input.config)');

    // The editor rebuilt the config field by field, so any top-level key it has
    // no UI for was dropped on the first edit. The spread is the fix.
    expect(editor).toContain('...base,');

    // One set of season defaults, in provisioning.ts. The editor and
    // diagnostics each kept their own copy, which is how they drifted.
    for (const src of [editor, diag]) {
      expect(src).not.toContain("name: 'Summer'");
      expect(src).not.toContain("name: 'Winter'");
      expect(src).toContain('defaultSeasons()');
    }

    // Neither may re-implement the refusals; both must survive them, because
    // both exist to be used ON a config the boundary rejects.
    for (const src of [editor, diag]) {
      expect(src).not.toContain('A maximum of 4 zones is supported.');
      expect(src).not.toContain('zones must be a list of');
    }
  });
});

describe('seasons[].key: refuse ONLY the genuinely broken case (item 9, option c)', () => {
  const withSeasons = (seasons: unknown[]): ProvisionInput =>
    ({
      ...input(),
      seasons: seasons as ProvisionInput['seasons'],
      schedules: Object.fromEntries(
        ZONES.map((z) => [z.slug, Object.fromEntries((seasons as Array<{ key?: unknown }>).map((x) => [String(x.key), set]))]),
      ),
    }) as ProvisionInput;

  const keyless = (name?: string) => ({ name, default_mode: 'cool' });

  it('LEAVES ONE keyless season alone - that install converges and must not break', () => {
    // Verified against released v0.7.1: a single keyless season provisions, the
    // engine resolves its blocks against `..._undefined`, and a fully-applied
    // install replans to all-Unchanged. An earlier version of this guard refused
    // it on the asserted (and wrong) grounds that it "never worked". Refusing a
    // converging install is the breaking change R3 forbids.
    const cfg = withSeasons([keyless('Summer')]);
    expect(() => buildDesired(cfg)).not.toThrow();
    const desired = buildDesired(cfg);
    expect(desired.filter((o) => o.kind === 'schedule').map((o) => o.id)).toContain(
      'schedule.climate_zone_a_undefined',
    );
  });

  it('and that install still CONVERGES - the property that made refusing wrong', () => {
    const cfg = withSeasons([keyless('Summer')]);
    const desired = buildDesired(cfg);
    const existing = applyPlan(plan(desired, []), []).map((o) => ({ ...o, managed: true }));
    expect(actionable(plan(desired, existing))).toHaveLength(0);
  });

  it('leaves a keyed + keyless mix alone too - only one collides with nothing', () => {
    const cfg = withSeasons([{ key: 'summer', name: 'Summer', default_mode: 'cool' }, keyless('Winter')]);
    expect(() => buildDesired(cfg)).not.toThrow();
  });

  it('REFUSES two keyless seasons - which already threw at v0.7.1 anyway', () => {
    // v0.7.1 said "Naming collision: ... Rename the conflicting zone or season",
    // which names the wrong cause - renaming cannot supply a missing field.
    // Replacing that message changes behaviour for nobody.
    const cfg = withSeasons([keyless('Summer'), keyless('Winter')]);
    expect(() => buildDesired(cfg)).toThrow(/2 seasons are missing their required "key"/);
    expect(() => buildDesired(cfg)).toThrow(/key: summer/);
    expect(() => buildDesired(cfg)).not.toThrow(/Rename the conflicting/);
  });

  it('counts blank and null keys as keyless, not just absent ones', () => {
    for (const bad of ['', '   ', null]) {
      const cfg = withSeasons([
        { key: bad, name: 'Summer', default_mode: 'cool' },
        { key: bad, name: 'Winter', default_mode: 'heat_cool' },
      ]);
      expect(() => buildDesired(cfg), String(bad)).toThrow(/missing their required "key"/);
    }
  });

  it('ACCEPTS a key that YAML parsed as a number or a boolean', () => {
    // `key: 1` and `key: off` (a YAML 1.1 boolean) already name live entities
    // like `schedule.climate_zone_a_1`. Refusing them would break a working
    // install and, by telling its owner to rename the key, orphan the very
    // schedules holding their blocks.
    for (const key of [1, 0, false, true] as unknown[]) {
      expect(() => buildDesired(withSeasons([{ key, name: 'Summer', default_mode: 'cool' }])), String(key)).not.toThrow();
    }
    const numeric = buildDesired(withSeasons([{ key: 1, name: 'Summer', default_mode: 'cool' }]));
    expect(numeric.filter((o) => o.kind === 'schedule').map((o) => o.id)).toContain('schedule.climate_zone_a_1');
  });

  it('does NOT refuse a zero-zone config - no schedule ids exist to collide, and v0.7.1 accepted it', () => {
    // QA round-3 F1: the count-based guard refused this though nothing
    // collides. The guard now mirrors the id space: no zones, no collision.
    const cfg = {
      ...input(),
      zones: [],
      schedules: {},
      seasons: [keyless('Summer'), keyless('Winter')] as never,
    } as ProvisionInput;
    expect(() => buildDesired(cfg)).not.toThrow();
    expect(buildDesired(cfg)).toHaveLength(18); // globals + 4 automations, as at v0.7.1
  });

  it('does NOT refuse key:null beside an absent key - their ids are DISTINCT and both converged at v0.7.1', () => {
    // String(null) is 'null' and String(undefined) is 'undefined', so these
    // seasons never share a schedule id. Refusing them (as the count-based
    // guard did) would have broken a working install.
    const cfg = withSeasons([
      { key: null, name: 'Summer', default_mode: 'cool' },
      { name: 'Winter', default_mode: 'heat_cool' },
    ]);
    const ids = buildDesired(cfg)
      .filter((o) => o.kind === 'schedule')
      .map((o) => o.id);
    expect(ids).toContain('schedule.climate_zone_a_null');
    expect(ids).toContain('schedule.climate_zone_a_undefined');
  });

  it('refuses two seasons SHARING a real key, naming the duplication rather than suggesting renames', () => {
    // At v0.7.1 this hit the generic naming-collision message, which told the
    // user to rename zones and seasons - the keys were the problem.
    const cfg = withSeasons([
      { key: 'summer', name: 'Early Summer', default_mode: 'cool' },
      { key: 'summer', name: 'Late Summer', default_mode: 'cool' },
    ]);
    expect(() => buildDesired(cfg)).toThrow(/share the key "summer"/);
    expect(() => buildDesired(cfg)).not.toThrow(/Rename the conflicting/);
  });

  it('leaves every valid config untouched', () => {
    expect(() => buildDesired(input())).not.toThrow();
    expect(buildDesired(input()).length).toBeGreaterThan(0);
  });
});
