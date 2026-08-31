import { describe, it, expect } from 'vitest';
import { canonicalInput, allPayloads, inventoryFor, VARIANTS } from './fixtures/canonical-config';
import { engineAutomation, type ZoneRef } from '../src/lib/automation-payloads';
import type { ProvisionSeason } from '../src/lib/provisioning';

/**
 * Item 7 - off-peak comfort, on the shared setpoint-adjustment seam.
 *
 * The engine-level halves of the spec's test list (mzcs_offpeak_design.md §7):
 *   1. default output byte-identical when the entity is absent;
 *   2. offset applied in the correct DIRECTION per mode, `off` untouched;
 *   4. entity missing/unavailable fails safe to the written schedule.
 * (§7.3 clamps: deliberately NOT emitted - see 'no absolute clamp' below.
 *  §7.5 card next-block text: card-side, tested with the card UI work.)
 *
 * Safety-critical strings are pinned EXACTLY (substring checks on boolean
 * templates are banned on this project - QA NEW-1).
 */

const ZONES: ZoneRef[] = [
  { slug: 'zone_one', name: 'Zone One', climate: 'climate.zone_one' },
  { slug: 'zone_two', name: 'Zone Two', climate: 'climate.zone_two' },
];
const SEASONS: ProvisionSeason[] = [
  { key: 'summer', name: 'Summer', default_mode: 'cool' },
  { key: 'winter', name: 'Winter', default_mode: 'heat_cool' },
];

type Node = Record<string, unknown>;
const OFF_PEAK = { features: { off_peak_entity: 'binary_sensor.off_peak_today' } };

function zoneSeq(payload: Node): Node[] {
  const actions = payload.actions as Node[];
  const rep = actions.find((a) => a.repeat) as Node;
  return (rep.repeat as { sequence: Node[] }).sequence;
}
function adjustStep(payload: Node): Node | undefined {
  return zoneSeq(payload).find((s) => String(s.alias).startsWith('Compute the applied setpoints'));
}

describe('spec §7.1 - the default engine is byte-identical when off-peak is absent', () => {
  it('a null entity and an omitted argument produce the same payload', () => {
    expect(engineAutomation('climate', ZONES, SEASONS, 'eco', null)).toEqual(
      engineAutomation('climate', ZONES, SEASONS, 'eco'),
    );
  });

  it('a blank or quote-only entity falls back to the legacy output entirely', () => {
    // Sanitization strips quotes/backslashes the way the eco preset does; an
    // entity that sanitizes to nothing must not emit a half-configured seam.
    const base = engineAutomation('climate', ZONES, SEASONS, 'eco');
    for (const junk of ['', '   ', "'\"\\"]) {
      expect(engineAutomation('climate', ZONES, SEASONS, 'eco', junk), JSON.stringify(junk)).toEqual(base);
    }
  });

  it('the default fixture emits NO adjustment step and the legacy marker', () => {
    const eng = allPayloads(canonicalInput())['climate_mzcs_engine'] as Node;
    expect(adjustStep(eng)).toBeUndefined();
    const record = zoneSeq(eng).find((s) => s.action === 'input_text.set_value') as Node;
    expect((record.data as Node).value).toBe('{{ blk }}');
  });
});

describe('spec §7.2/§7.4 - the adjustment step, pinned exactly', () => {
  const eng = allPayloads(canonicalInput(OFF_PEAK))['climate_mzcs_engine'] as Node;
  const step = adjustStep(eng)!;
  const vars = step.variables as Record<string, string>;

  it('adj gates on the day entity AND the pause instant, and is 0 otherwise (fail-safe)', () => {
    // `is_state(..., 'on')` is false for a missing/unavailable entity, so the
    // written schedule applies untouched (§7.4). The offset helper falls back
    // to 0, never the seed - a deleted helper must fail safe to the schedule
    // (QA round-5 finding E7). The pause helper holds an ISO INSTANT the
    // engine converts to ITS OWN local day, so a browser in another timezone
    // cannot pause the wrong day (QA C4/E-L4); it still expires at midnight.
    expect(vars.adj).toBe(
      "{{ (states('input_number.climate_off_peak_offset') | float(0)) if is_state('binary_sensor.off_peak_today', 'on') and ((states('input_text.climate_off_peak_paused_on') | as_datetime) is none or (states('input_text.climate_off_peak_paused_on') | as_datetime | as_local).date() != now().date()) else 0 }}",
    );
  });

  it('cool moves DOWN, heat moves UP, none stays none', () => {
    expect(vars.app_cool).toBe('{{ (blk_cool | float(0)) - adj if blk_cool is not none else none }}');
    expect(vars.app_heat).toBe('{{ (blk_heat | float(0)) + adj if blk_heat is not none else none }}');
  });

  it('QA-E1: heat_cool uses a DEADBAND-GUARDED adjustment that can never invert the range', () => {
    // Two reviewers independently: cool-adj / heat+adj SHRINKS the band by
    // 2*adj, and a card-legal 72/70 block with the default offset 2 would
    // command target_temp_high 70 / target_temp_low 72 to real hardware.
    // hc_adj caps the per-side move so at least a 2-degree deadband (the card
    // editor's own minimum gap) always survives; a gap already at 2 gets no
    // adjustment at all.
    expect(vars.hc_adj).toBe(
      '{{ [ adj, [ ((blk_cool | float(0)) - (blk_heat | float(0)) - 2) / 2, 0 ] | max ] | min if blk_cool is not none and blk_heat is not none else adj }}',
    );
    expect(vars.app_hi).toBe('{{ (blk_cool | float(0)) - hc_adj if blk_cool is not none else none }}');
    expect(vars.app_lo).toBe('{{ (blk_heat | float(0)) + hc_adj if blk_heat is not none else none }}');
  });

  it('the marker composes the block with the applied adjustment', () => {
    expect(vars.mark).toBe("{{ blk ~ '|op' ~ adj }}");
    const record = zoneSeq(eng).find((s) => s.action === 'input_text.set_value') as Node;
    expect((record.data as Node).value).toBe('{{ mark }}');
  });

  it('the step sits between the block read and the skip gate', () => {
    const aliases = zoneSeq(eng).map((s) => String(s.alias ?? s.action ?? ''));
    const read = aliases.findIndex((a) => a.startsWith("Read this zone's"));
    const adj = aliases.findIndex((a) => a.startsWith('Compute the applied setpoints'));
    const gate = aliases.findIndex((a) => a.startsWith('Skip when zone disabled'));
    expect(read).toBeGreaterThanOrEqual(0);
    expect(adj).toBe(read + 1);
    expect(gate).toBe(adj + 1);
  });

  it('heat_cool applies the GUARDED pair; single target uses the full adjustment', () => {
    const choose = (zoneSeq(eng).find((s) => String(s.alias).startsWith('Apply the block')) as Node)
      .choose as Node[];
    const dual = (choose[0]!.sequence as Node[])[0] as Node;
    expect(dual.data).toEqual({
      target_temp_high: '{{ app_hi }}',
      target_temp_low: '{{ app_lo }}',
      hvac_mode: 'heat_cool',
    });
    const single = (choose[2]!.sequence as Node[])[0] as Node;
    expect((single.data as Node).temperature).toBe('{{ app_cool if blk_cool is not none else app_heat }}');
  });

  it("'off' blocks are untouched - off means off (§7.2)", () => {
    const choose = (zoneSeq(eng).find((s) => String(s.alias).startsWith('Apply the block')) as Node)
      .choose as Node[];
    const off = (choose[1]!.sequence as Node[])[0] as Node;
    expect(off.action).toBe('climate.set_hvac_mode');
    expect(off.data).toEqual({ hvac_mode: 'off' });
  });

  it('a quoted entity id cannot break out of the Jinja string', () => {
    const p = engineAutomation('climate', ZONES, SEASONS, 'eco', "binary_sensor.off'peak");
    const adj = String((adjustStep(p)!.variables as Node).adj);
    expect(adj).toContain("is_state('binary_sensor.offpeak', 'on')");
    expect(adj.match(/'/g)!.length % 2).toBe(0);
  });
});

describe('no absolute clamp, DELIBERATELY (maintainer decision 2026-08-30, deviating from spec §5)', () => {
  // Both candidate clamp sources are provably wrong on real hardware: a
  // mini-split reports min/max_temp as CELSIUS bounds against Fahrenheit
  // setpoints (measured live - clamping to max_temp=35 would command 35°F),
  // and fixed °F literals break Celsius installs the other way. The offset is
  // instead hard-bounded by the helper the engine reads.
  it('the adjustment step never consults min_temp/max_temp', () => {
    const eng = allPayloads(canonicalInput(OFF_PEAK))['climate_mzcs_engine'] as Node;
    const step = JSON.stringify(adjustStep(eng));
    expect(step).not.toContain('min_temp');
    expect(step).not.toContain('max_temp');
  });

  it('the offset helper pins the hard bounds the engine relies on', () => {
    const inv = inventoryFor(canonicalInput(OFF_PEAK));
    const helper = inv.find((o) => o.id === 'input_number.climate_off_peak_offset')!;
    expect(helper.spec).toEqual({ name: 'Climate off peak offset', min: 0, max: 10, step: 1, unit: '°F' });
    expect(helper.meta).toEqual({ seed: 2 });
  });
});

describe('inventory and cross-variant properties', () => {
  it('the pause helper is name-only in spec and seeds nothing', () => {
    const inv = inventoryFor(canonicalInput(OFF_PEAK));
    const pause = inv.find((o) => o.id === 'input_text.climate_off_peak_paused_on')!;
    expect(pause.spec).toEqual({ name: 'Climate off peak paused on' });
    expect(pause.meta).toBeUndefined();
  });

  it('off-peak adds exactly two objects to the default inventory', () => {
    const base = new Set(inventoryFor(canonicalInput()).map((o) => o.id));
    const added = inventoryFor(canonicalInput(OFF_PEAK)).filter((o) => !base.has(o.id));
    expect(added.map((o) => o.id).sort()).toEqual([
      'input_number.climate_off_peak_offset',
      'input_text.climate_off_peak_paused_on',
    ]);
  });

  it('a custom offset seed produces a BYTE-IDENTICAL engine to the plain off-peak variant', () => {
    // The engine reads the helper at runtime; the config value is only its
    // creation seed. A seed that reached the generator would fork signatures
    // on a tunable, which is the phantom-update genre.
    const plain = VARIANTS.find((v) => v.name === 'off-peak')!;
    const custom = VARIANTS.find((v) => v.name === 'off-peak-custom-offset')!;
    expect(allPayloads(canonicalInput(custom.overrides))['climate_mzcs_engine']).toEqual(
      allPayloads(canonicalInput(plain.overrides))['climate_mzcs_engine'],
    );
  });

  it('off-peak composes with a custom eco preset without touching other automations', () => {
    const both = allPayloads(
      canonicalInput({ features: { ...OFF_PEAK.features, eco_preset: 'away' } }),
    );
    const eng = JSON.stringify(both['climate_mzcs_engine']);
    expect(eng).toContain("!= 'away'");
    expect(eng).toContain('mark != states(repeat.item.marker)');
    const base = allPayloads(canonicalInput());
    for (const uid of Object.keys(both)) {
      if (uid === 'climate_mzcs_engine') continue;
      expect(both[uid], uid).toEqual(base[uid]);
    }
  });
});
