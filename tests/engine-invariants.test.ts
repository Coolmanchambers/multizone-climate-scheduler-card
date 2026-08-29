import { describe, it, expect } from 'vitest';
import { canonicalInput, allPayloads, zoneRefs, inventoryFor, VARIANTS } from './fixtures/canonical-config';

/**
 * Backlog item 6, part 3: semantic invariants.
 *
 * The goldens catch ANY change; these catch the changes that would be dangerous
 * even if somebody deliberately regenerated the goldens. They assert over the
 * PARSED payload structure rather than over strings, so an intentional rewording
 * leaves them green while a lost safety gate does not.
 *
 * Everything here guards a property that was either paid for with a live
 * incident or is a stated rule in the engine-safety notes.
 */

type Node = Record<string, unknown>;

function engine(overrides = {}): Node {
  return allPayloads(canonicalInput(overrides))['climate_mzcs_engine'] as Node;
}

/**
 * The service call a node performs, under EITHER key.
 *
 * QA finding H1: every action-level assertion used to read `node.action`
 * directly. Home Assistant still accepts `service:` as the legacy alias, so a
 * step written with `service:` was invisible to all of them - a reviewer added
 * `service: 'input_boolean.turn_off'` targeting the zone enable helper, making
 * the engine switch OFF the user's kill switch on every run, and this file
 * passed 27/27. Read both keys, everywhere, always.
 */
function actionOf(node: Node): string | undefined {
  const a = node.action ?? node.service;
  return typeof a === 'string' ? a : undefined;
}

/**
 * Every entity a service call targets, under EITHER spelling.
 *
 * QA finding NEW-2: `actionOf` closed the `service:` alias but the TARGET has a
 * legacy spelling too. Home Assistant accepts `data: { entity_id: ... }` as well
 * as `target: { entity_id: ... }`, so a step written the old way was invisible
 * to a guard that read only `target.entity_id` - a reviewer used
 * `homeassistant.turn_off` with `data.entity_id` pointing at the zone kill
 * switch and the whole suite stayed green.
 */
function targetsOf(node: Node): string[] {
  const out: string[] = [];
  for (const holder of [node.target, node.data]) {
    const e = (holder as Node | undefined)?.entity_id;
    if (typeof e === 'string') out.push(e);
    else if (Array.isArray(e)) out.push(...e.filter((x): x is string => typeof x === 'string'));
  }
  return out;
}

/** Every service call in a payload, in document order, as `action -> targets`. */
function callsOf(payload: Node): string[] {
  return walk(payload)
    .filter((n) => actionOf(n))
    .map((n) => `${actionOf(n)} -> ${targetsOf(n).join(',') || '(none)'}`);
}

/** Every node in a payload tree, so a structural search cannot miss a nesting. */
function walk(node: unknown, out: Node[] = []): Node[] {
  if (Array.isArray(node)) {
    for (const n of node) walk(n, out);
  } else if (node !== null && typeof node === 'object') {
    out.push(node as Node);
    for (const v of Object.values(node as Node)) walk(v, out);
  }
  return out;
}

/** The step in the engine's per-zone sequence carrying a given alias prefix. */
function zoneStep(payload: Node, aliasStartsWith: string): Node | undefined {
  return walk(payload).find((n) => typeof n.alias === 'string' && (n.alias as string).startsWith(aliasStartsWith));
}

/** The per-zone repeat sequence, in order. */
function zoneSequence(payload: Node): Node[] {
  const rep = walk(payload).find((n) => n.repeat && (n.repeat as Node).sequence);
  return ((rep!.repeat as Node).sequence as Node[]) ?? [];
}

describe('engine: the skip gate (invariants 1-3)', () => {
  /**
   * QA finding NEW-1, the worst hole found in any round: this gate used to be
   * asserted with four separate `toContain` substring checks. Changing the
   * FIRST `and` to `or` left every substring present, so a zone the owner had
   * switched OFF was driven again whenever block data existed - and 364 tests
   * passed.
   *
   * Substring matching cannot see boolean structure: a changed joiner, an added
   * disjunct, an inserted negation. So the gate is now pinned as an exact
   * string. It is the single most safety-critical expression the card
   * generates; if it changes at all, a human should have to say why.
   */
  const GATE_DEFAULT =
    "{{ is_state(repeat.item.enabled, 'on') and blk is not none and blk != states(repeat.item.marker)" +
    " and state_attr(repeat.item.climate, 'preset_mode') != 'eco' }}";

  it('is EXACTLY the expected boolean expression, joiners included', () => {
    const gate = zoneStep(engine(), 'Skip when zone disabled');
    expect(gate).toBeDefined();
    expect(gate!.condition).toBe('template');
    expect(gate!.value_template).toBe(GATE_DEFAULT);
  });

  it('joins every clause with AND - never OR', () => {
    // Spelled out separately so the failure message says what is wrong rather
    // than dumping two long strings.
    const t = String(zoneStep(engine(), 'Skip when zone disabled')!.value_template);
    expect(t).not.toMatch(/\bor\b/);
    expect(t.match(/\band\b/g) ?? []).toHaveLength(3);
    expect(t).not.toMatch(/\bnot\b(?!\s+none)/);
  });

  it('names a custom standby preset instead of the default, exactly', () => {
    const gate = zoneStep(engine({ features: { eco_preset: 'away' } }), 'Skip when zone disabled');
    expect(gate!.value_template).toBe(GATE_DEFAULT.replace("!= 'eco'", "!= 'away'"));
  });

  it('drops ONLY the preset clause when the stand-down is disabled', () => {
    const gate = zoneStep(engine({ features: { eco_preset: false } }), 'Skip when zone disabled');
    expect(gate!.value_template).toBe(
      "{{ is_state(repeat.item.enabled, 'on') and blk is not none and blk != states(repeat.item.marker) }}",
    );
  });

  it('strips quotes from a hand-edited preset name so the template cannot be broken', () => {
    const gate = zoneStep(engine({ features: { eco_preset: "aw'ay" } }), 'Skip when zone disabled');
    const t = String(gate!.value_template);
    expect(t).toContain("!= 'away'");
    // A stray apostrophe would terminate the Jinja string and change what the
    // condition evaluates.
    expect(t.match(/'/g)!.length % 2).toBe(0);
  });
});

describe('engine: applying a block (invariants 4-5, 7)', () => {
  const apply = () => zoneStep(engine(), 'Apply the block')!;

  it('emits BOTH setpoints for a heat_cool block', () => {
    // A dual-setpoint thermostat given only one bound silently widens or
    // narrows the other, which is a comfort and a cost problem.
    const branch = (apply().choose as Node[]).find((c) =>
      JSON.stringify(c).includes("blk_mode == 'heat_cool'"),
    )!;
    const data = walk(branch).find((n) => actionOf(n) === 'climate.set_temperature')!.data as Node;
    // QA finding H5: this used to assert only that both keys EXIST, so SWAPPING
    // them passed. A heat_cool block of cool 85 / heat 65 would then command
    // high=65, low=85 - an inverted range on live equipment.
    expect(data.target_temp_high).toBe('{{ blk_cool }}');
    expect(data.target_temp_low).toBe('{{ blk_heat }}');
    expect(data.hvac_mode).toBe('heat_cool');
  });

  it('turns the zone off with set_hvac_mode, not a temperature write', () => {
    const branch = (apply().choose as Node[]).find((c) => JSON.stringify(c).includes("blk_mode == 'off'"))!;
    const call = walk(branch).find((n) => actionOf(n)?.startsWith('climate.'))!;
    expect(actionOf(call)).toBe('climate.set_hvac_mode');
    expect((call.data as Node).hvac_mode).toBe('off');
  });

  it('applies a single target for cool/heat blocks, cool-side preferred', () => {
    const branch = (apply().choose as Node[]).find((c) =>
      JSON.stringify(c).includes('blk_cool is not none or blk_heat is not none'),
    )!;
    const data = walk(branch).find((n) => actionOf(n) === 'climate.set_temperature')!.data as Node;
    // Presence alone let the preference be inverted (H5).
    expect(data.temperature).toBe('{{ blk_cool if blk_cool is not none else blk_heat }}');
    expect(data.hvac_mode).toBe('{{ blk_mode }}');
    expect(data.target_temp_high).toBeUndefined();
  });

  it('continues past a failing zone instead of starving the rest of the loop', () => {
    // One offline thermostat must not stop the other zones being applied.
    expect(apply().continue_on_error).toBe(true);
  });

  it('does nothing when no branch matches, rather than guessing', () => {
    expect(apply().default).toEqual([]);
  });
});

describe('engine: ordering and triggers (invariants 6, 8, 9)', () => {
  it('records the applied-block marker AFTER the apply step, never before', () => {
    // Ordering paid for live: writing the marker first means a failed apply is
    // recorded as done, and the zone holds the wrong setpoint until the next
    // block boundary.
    const seq = zoneSequence(engine());
    const applyAt = seq.findIndex((s) => String(s.alias).startsWith('Apply the block'));
    const markAt = seq.findIndex((s) => actionOf(s) === 'input_text.set_value');
    expect(applyAt).toBeGreaterThanOrEqual(0);
    expect(markAt).toBeGreaterThan(applyAt);
  });

  it('resolves the season through an explicit name->key map with a lowercase fallback', () => {
    // Season display names are renameable; keys are not. The fallback keeps
    // pre-rename installs working, where key === lower(name).
    const vars = walk(engine()).find((n) => (n.variables as Node)?.season)!.variables as Node;
    expect(String(vars.season)).toContain("'Summer': 'summer'");
    expect(String(vars.season)).toContain("'Winter': 'winter'");
    expect(String(vars.season)).toContain('| lower');
  });

  it('fires on all five triggers, including the zone re-enable edge', () => {
    const triggers = engine().triggers as Node[];
    const kinds = triggers.map((t) => `${t.trigger}:${t.event ?? t.minutes ?? t.to ?? ''}`);
    expect(kinds).toContain('homeassistant:start');
    expect(kinds).toContain('time_pattern:/15');
    // Re-enabling a zone must re-assert its block immediately, not at the next
    // 15-minute tick.
    expect(triggers.some((t) => t.trigger === 'state' && t.to === 'on')).toBe(true);
    expect(triggers.filter((t) => t.trigger === 'state')).toHaveLength(3);
  });

  it('queues rather than dropping overlapping runs', () => {
    expect(engine().mode).toBe('queued');
    expect(engine().max).toBe(5);
  });
});

describe('every generated automation (invariants 10, 12, 13)', () => {
  const input = canonicalInput();
  const payloads = allPayloads(input);
  const climates = new Set(zoneRefs(input).map((z) => z.climate));

  it('never targets a hard-coded entity id outside the configured zones', () => {
    for (const [uid, p] of Object.entries(payloads)) {
      for (const node of walk(p)) {
        if (!actionOf(node)?.startsWith('climate.')) continue;
        const target = (node.target as Node)?.entity_id;
        const ok = typeof target === 'string' && (target.includes('repeat.item.') || climates.has(target));
        expect(ok, `${uid} targets ${String(target)}`).toBe(true);
      }
    }
  });

  it('NEVER writes a zone kill switch', () => {
    // Engine-safety invariant 3: the kill switch is config-only and no code
    // path may change its state. A generated automation that could flip it
    // would let the card override the user's stop button.
    for (const [uid, p] of Object.entries(payloads)) {
      for (const node of walk(p)) {
        const act = actionOf(node);
        if (!act?.startsWith('input_boolean.')) continue;
        expect.unreachable(`${uid} calls ${act} - kill switches are config-only`);
      }
      // The enable helper may only ever appear as a READ: in the repeat's
      // for_each list, or in the skip condition's template. A WRITE shows up as
      // a service call targeting it - under either action spelling AND either
      // target spelling (QA findings H1 and NEW-2: `homeassistant.turn_off`
      // with `data.entity_id` slipped past both earlier versions of this).
      for (const node of walk(p)) {
        const act = actionOf(node);
        if (!act) continue;
        for (const t of targetsOf(node)) {
          expect(
            /_enabled|repeat\.item\.enabled/.test(t),
            `${uid}: ${act} targets the zone enable helper (${t})`,
          ).toBe(false);
        }
      }
    }
  });

  it('never writes to a schedule helper - schedules belong to the editor', () => {
    for (const [uid, p] of Object.entries(payloads)) {
      for (const node of walk(p)) {
        expect(actionOf(node) ?? '', uid).not.toMatch(/^schedule\./);
      }
    }
  });

  it('the engine performs EXACTLY these calls, in this order, at these targets', () => {
    // QA finding NEW-5: assertions used `walk(...).find(...)`, which returns the
    // FIRST match. Appending a second `climate.set_temperature` with the bounds
    // swapped passed every test - and Home Assistant executes both, last write
    // wins. An exhaustive ordered list has no "first match" to hide behind.
    expect(callsOf(payloads['climate_mzcs_engine'] as Node)).toEqual([
      'climate.set_temperature -> {{ repeat.item.climate }}',
      'climate.set_hvac_mode -> {{ repeat.item.climate }}',
      'climate.set_temperature -> {{ repeat.item.climate }}',
      'input_text.set_value -> {{ repeat.item.marker }}',
    ]);
  });
});

describe('fan timer automations (invariant 11)', () => {
  it('carry no guard condition by default', () => {
    const fan = allPayloads(canonicalInput())['climate_mzcs_fan_timer_zone_one'] as Node;
    expect(fan.conditions).toEqual([]);
  });

  it('stand down while the fan-guard helper is on', () => {
    const fan = allPayloads(canonicalInput({ features: { fan_guard: 'input_boolean.hvac_fan_guard' } }))[
      'climate_mzcs_fan_timer_zone_one'
    ] as Node;
    const cond = (fan.conditions as Node[])[0]!;
    expect(cond.condition).toBe('state');
    expect(cond.entity_id).toBe('input_boolean.hvac_fan_guard');
    expect(cond.state).toBe('off');
  });

  it('fire on their own zone timer only', () => {
    const fan = allPayloads(canonicalInput())['climate_mzcs_fan_timer_zone_two'] as Node;
    const trig = (fan.triggers as Node[])[0]!;
    expect(trig.event_type).toBe('timer.finished');
    expect((trig.event_data as Node).entity_id).toBe('timer.climate_zone_two_fan');
  });

  it('run in single mode so a re-armed timer cannot stack', () => {
    expect((allPayloads(canonicalInput())['climate_mzcs_fan_timer_zone_one'] as Node).mode).toBe('single');
  });

  it('turn the fan OFF, on the right zone', () => {
    // QA finding H6: the fan tests asserted trigger, mode and guard but never
    // the action or its data, so flipping `fan_mode` to 'on' passed - the timer
    // would START the blower when it expired instead of stopping it, and run it
    // indefinitely.
    for (const [uid, slug] of [
      ['climate_mzcs_fan_timer_zone_one', 'zone_one'],
      ['climate_mzcs_fan_timer_zone_two', 'zone_two'],
      ['climate_mzcs_fan_timer_zone_three', 'zone_three'],
    ] as const) {
      const fan = allPayloads(canonicalInput())[uid] as Node;
      const call = walk(fan).find((n) => actionOf(n)?.startsWith('climate.'))!;
      expect(actionOf(call), uid).toBe('climate.set_fan_mode');
      expect((call.data as Node).fan_mode, uid).toBe('off');
      expect((call.target as Node).entity_id, uid).toBe(`climate.${slug}`);
    }
  });
});

describe('watchdog (invariant 6 support)', () => {
  // QA finding H6: the watchdog had NO invariant in this file at all. It is the
  // only thing that tells the user their schedule engine has stopped, so a
  // broken watchdog means silent failure of everything else.
  const watchdog = () => allPayloads(canonicalInput())['climate_mzcs_watchdog'] as Node;

  it('watches the engine automation itself', () => {
    const trig = (watchdog().triggers as Node[])[0]!;
    expect(trig.entity_id).toBe('automation.climate_schedule_engine');
    expect(trig.to).toEqual(['off', 'unavailable']);
  });

  it('waits 5 minutes, so a restart does not cry wolf', () => {
    // A plain reload flips the automation off and back within seconds.
    expect((watchdog().triggers as Node[])[0]!.for).toEqual({ minutes: 5 });
  });

  it('notifies rather than touching any equipment', () => {
    const calls = walk(watchdog()).map(actionOf).filter((a): a is string => !!a);
    expect(calls).toEqual(['persistent_notification.create']);
  });

  it('tells the user their thermostats still have their own schedules', () => {
    // The message has to stop someone panicking about an unheated house.
    const msg = String((walk(watchdog()).find((n) => n.data && (n.data as Node).message)!.data as Node).message);
    expect(msg).toContain('their own app schedules still work');
  });
});

describe('learning and alerting stay silent until they have data', () => {
  it('learning skips mild days and unavailable runtimes', () => {
    const p = allPayloads(canonicalInput())['climate_mzcs_runtime_learning'] as Node;
    const s = JSON.stringify(p);
    expect(s).toContain('cdd > 0.5');
    expect(s).toContain('runtime_h >= 0');
  });

  it('the alert requires a learned expectation, a margin AND an absolute hour', () => {
    // Three conditions together are what stop a fresh install notifying nightly
    // while k is still seeding.
    const p = allPayloads(canonicalInput())['climate_mzcs_runtime_alert'] as Node;
    const cond = walk(p).find((n) => String(n.alias).startsWith('Only alert'))!;
    const t = String(cond.value_template);
    expect(t).toContain('exp_h > 0');
    expect(t).toContain('margin / 100');
    expect(t).toContain('(run_h - exp_h) > 1');
  });

  it('neither one touches a thermostat', () => {
    for (const uid of ['climate_mzcs_runtime_learning', 'climate_mzcs_runtime_alert']) {
      const actions = walk(allPayloads(canonicalInput())[uid] as Node)
        .map(actionOf)
        .filter((a): a is string => !!a);
      expect(actions.filter((a) => a.startsWith('climate.')), uid).toEqual([]);
    }
  });
});

describe('provisioned helper seeds and ranges (QA H3)', () => {
  /**
   * These are the values a helper is CREATED with, and they live in
   * `DesiredObject.meta`, which the differ deliberately never compares. So
   * nothing outside a regenerable golden pinned them: a reviewer changed the
   * CDD base from 75 to 60 and narrowed the per-zone k range to
   * `{min:0,max:1,step:0.5}` - which clamps every learned value and silently
   * kills runtime learning - and the suite stayed green.
   *
   * Literals, because the README documents these numbers to users.
   */
  const inv = inventoryFor(canonicalInput());
  const byId = new Map(inv.map((o) => [o.id, o]));
  const seedOf = (id: string) => (byId.get(id)!.meta as { seed?: number } | undefined)?.seed;
  const specOf = (id: string) => byId.get(id)!.spec as Record<string, unknown>;

  it('global tunables keep their documented seed values', () => {
    expect({
      confirm_days: seedOf('input_number.climate_season_confirm_days'),
      dwell_days: seedOf('input_number.climate_season_dwell_days'),
      dev_green: seedOf('input_number.climate_dev_green_max'),
      dev_amber: seedOf('input_number.climate_dev_amber_max'),
      alert_margin: seedOf('input_number.climate_runtime_alert_margin'),
      alert_days: seedOf('input_number.climate_runtime_alert_days'),
      learn_days: seedOf('input_number.climate_runtime_learn_days'),
      cdd_base: seedOf('input_number.climate_cdd_base'),
    }).toEqual({
      confirm_days: 3,
      dwell_days: 14,
      dev_green: 2,
      dev_amber: 4,
      alert_margin: 35,
      alert_days: 3,
      learn_days: 30,
      cdd_base: 75,
    });
  });

  it('the per-zone k factor keeps a range that can express what learning writes', () => {
    // Learning writes `runtime_h / cdd` rounded to 2dp. A max below a few hours
    // per degree-day, or a step coarser than 0.01, clamps or quantises every
    // value the EMA produces and the feature dies silently.
    for (const z of ['zone_one', 'zone_two', 'zone_three']) {
      expect(specOf(`input_number.climate_${z}_k`), z).toMatchObject({ min: 0, max: 10, step: 0.01 });
    }
  });

  it('never seeds a value into the zone kill switch', () => {
    // CONTRACT 7c: zones are born OFF and no code path may set their state.
    for (const z of ['zone_one', 'zone_two', 'zone_three']) {
      const o = byId.get(`input_boolean.climate_${z}_enabled`)!;
      expect(o.meta, z).toBeUndefined();
      expect(Object.keys(o.spec as object), z).toEqual(['name']);
    }
  });

  it('seeds a schedule week only through meta, never through the compared spec', () => {
    // A seeded week in `spec` would be compared against the live registry and
    // produce a permanent phantom Update.
    const sched = inv.filter((o) => o.kind === 'schedule');
    expect(sched.length).toBeGreaterThan(0);
    for (const o of sched) {
      expect(Object.keys(o.spec as object), o.id).toEqual(['name']);
      expect((o.meta as { week?: unknown }).week, o.id).toBeDefined();
    }
  });
});

describe('the safety-critical invariants hold across EVERY variant (QA NEW-4)', () => {
  /**
   * Until now every assertion in this file ran on `canonicalInput()` alone -
   * 3 zones, 2 seasons, prefix `climate`. A reviewer made the engine emit `true`
   * instead of the enable clause when `zones.length >= 4`, and a four-zone
   * install silently lost its kill switch behind one re-pinned literal, with the
   * suite green.
   *
   * These re-run the properties that would hurt somebody, over the full matrix.
   */
  const CONFIGS: Array<[string, Record<string, unknown>]> = [
    ['default', {}],
    ...VARIANTS.map((v) => [v.name, v.overrides] as [string, Record<string, unknown>]),
  ];

  for (const [name, overrides] of CONFIGS) {
    const input = canonicalInput(overrides);
    const payloads = allPayloads(input);
    const prefix = input.prefix;
    const eng = payloads[`${prefix}_mzcs_engine`] as Node;

    it(`${name}: the engine still gates on the kill switch and the marker`, () => {
      const gate = zoneStep(eng, 'Skip when zone disabled');
      const t = String(gate!.value_template);
      expect(t).toContain("is_state(repeat.item.enabled, 'on')");
      expect(t).toContain('blk != states(repeat.item.marker)');
      expect(t).not.toMatch(/\bor\b/);
    });

    it(`${name}: no automation writes a zone kill switch`, () => {
      for (const [uid, p] of Object.entries(payloads)) {
        for (const node of walk(p as Node)) {
          if (!actionOf(node)) continue;
          for (const t of targetsOf(node)) {
            expect(/_enabled|repeat\.item\.enabled/.test(t), `${name}/${uid}: ${t}`).toBe(false);
          }
        }
      }
    });

    it(`${name}: the marker write still comes after the apply step`, () => {
      const seq = zoneSequence(eng);
      const applyAt = seq.findIndex((x) => String(x.alias).startsWith('Apply the block'));
      const markAt = seq.findIndex((x) => actionOf(x) === 'input_text.set_value');
      expect(markAt).toBeGreaterThan(applyAt);
      expect(applyAt).toBeGreaterThanOrEqual(0);
    });

    it(`${name}: every season is in the engine name->key map`, () => {
      const j = JSON.stringify(eng);
      for (const s of input.seasons) expect(j, `${name}/${s.key}`).toContain(`'${s.name}': '${s.key}'`);
    });

    it(`${name}: every climate call targets a configured zone`, () => {
      const climates = new Set(zoneRefs(input).map((z) => z.climate));
      for (const [uid, p] of Object.entries(payloads)) {
        for (const node of walk(p as Node)) {
          if (!actionOf(node)?.startsWith('climate.')) continue;
          for (const t of targetsOf(node)) {
            expect(t.includes('repeat.item.') || climates.has(t), `${name}/${uid}: ${t}`).toBe(true);
          }
        }
      }
    });
  }
});

describe('staleness detection cannot be silently removed (QA NEW-6)', () => {
  it('every desired automation carries a sig in its COMPARED spec', () => {
    // Dropping `sig` from `DesiredObject.spec` means the differ can never detect
    // a stale automation, so no install ever regenerates after a generator
    // change. Only the regenerable inventory goldens moved when a reviewer did
    // exactly that; nothing else objected.
    for (const [name, overrides] of [['default', {}], ...VARIANTS.map((v) => [v.name, v.overrides] as const)] as Array<
      [string, Record<string, unknown>]
    >) {
      const autos = inventoryFor(canonicalInput(overrides)).filter((o) => o.kind === 'automation');
      expect(autos.length, name).toBeGreaterThan(0);
      for (const a of autos) {
        const sig = (a.spec as Record<string, unknown>).sig;
        expect(typeof sig, `${name}/${a.id} has no sig in spec`).toBe('string');
        expect(String(sig), `${name}/${a.id}`).toMatch(/^[0-9a-f]{8}$/);
      }
    }
  });
});
