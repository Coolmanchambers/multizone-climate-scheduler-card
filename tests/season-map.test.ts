import { describe, it, expect } from 'vitest';
import { seasonMapExpr } from '../src/lib/automation-payloads';
import {
  canonicalInput,
  allPayloads,
  CANONICAL_SEASONS,
  STEERING_ZONES,
  VARIANTS,
} from './fixtures/canonical-config';

/**
 * Item 47: the season name -> key map is keyed by the season select's OPTIONS,
 * which are the raw display names. The old emission stripped single quotes
 * from the key only, so a name like Owner's Summer missed the map, missed the
 * lowercase fallback too (key != lower(name)), and the engine resolved no
 * block for any zone - applying nothing, with no error anywhere.
 *
 * The fix is quote-safe EMISSION, not refusal: a name containing a single
 * quote gets a double-quoted Jinja key; every quote-free name keeps the
 * historical single-quoted form byte-for-byte. All forms are pinned as EXACT
 * strings (substring checks on templates are banned - engine-safety skill).
 */

const APOSTROPHE_SEASONS = [
  { key: 'owners_summer', name: "Owner's Summer", default_mode: 'cool' as const },
  { key: 'winter', name: 'Winter', default_mode: 'heat_cool' as const },
];

type Node = Record<string, unknown>;
/** Every object node in a payload, depth-first. */
function walk(n: unknown): Node[] {
  if (Array.isArray(n)) return n.flatMap(walk);
  if (n !== null && typeof n === 'object') {
    return [n as Node, ...Object.values(n as Node).flatMap(walk)];
  }
  return [];
}
/** The full season-resolution expression of a generated automation. */
function seasonVar(payload: Record<string, unknown>): string {
  const node = walk(payload).find((x) => (x.variables as Node)?.season);
  return String((node!.variables as Node).season);
}

describe('season map emission (item 47)', () => {
  it('quote-free names keep the pre-change single-quoted form, byte-for-byte', () => {
    // The exact literal the generator emitted before item 47. If this moves,
    // every existing install plans an engine Update it did not ask for.
    expect(seasonMapExpr(CANONICAL_SEASONS)).toBe("{'Summer': 'summer', 'Winter': 'winter'}");
  });

  it('a name containing a single quote gets a double-quoted key, verbatim', () => {
    expect(seasonMapExpr(APOSTROPHE_SEASONS)).toBe(
      `{"Owner's Summer": 'owners_summer', 'Winter': 'winter'}`,
    );
  });

  it('escapes backslashes and double quotes inside a double-quoted key', () => {
    expect(
      seasonMapExpr([{ key: 's1', name: `O'wn\\er "Q"`, default_mode: 'cool' }]),
    ).toBe(`{"O'wn\\\\er \\"Q\\"": 's1'}`);
  });

  it('a double-quote-only name stays single-quoted, byte-identical to the old emission', () => {
    // No single quote in the name = the historical path; a "-only name always
    // worked inside single quotes and must not be perturbed.
    expect(seasonMapExpr([{ key: 's1', name: 'Sum"mer', default_mode: 'cool' }])).toBe(
      `{'Sum"mer': 's1'}`,
    );
  });

  it("the engine's season resolution uses the quoted map, pinned exactly", () => {
    const v = VARIANTS.find((x) => x.name === 'apostrophe-season')!;
    const engine = allPayloads(canonicalInput(v.overrides))['climate_mzcs_engine']!;
    expect(seasonVar(engine)).toBe(
      `{{ {"Owner's Summer": 'owners_summer', 'Winter': 'winter'}.get(states('input_select.climate_season'), states('input_select.climate_season') | lower) }}`,
    );
  });

  it("the steering automation's season resolution shares the same map, pinned exactly", () => {
    const input = canonicalInput({
      zones: STEERING_ZONES,
      seasons: APOSTROPHE_SEASONS,
      features: { steering: true },
    });
    const steering = allPayloads(input)['climate_mzcs_steering']!;
    expect(seasonVar(steering)).toBe(
      `{{ {"Owner's Summer": 'owners_summer', 'Winter': 'winter'}.get(states('input_select.climate_season'), states('input_select.climate_season') | lower) }}`,
    );
  });
});
