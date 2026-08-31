import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { canonicalInput, allPayloads, inventoryFor, STEERING_ZONES } from './fixtures/canonical-config';
import { engineAutomation, steeringAutomation, type ZoneRef } from '../src/lib/automation-payloads';
import { steeringRooms, type ProvisionSeason } from '../src/lib/provisioning';

// Read at module scope like every other source scan in this suite - an
// in-test read raced other workers' cold-cache transforms on this synced
// filesystem and flaked.
const CARD_SRC = readFileSync(new URL('../src/multizone-climate-scheduler-card.ts', import.meta.url), 'utf8');
const PROVISIONING_SRC = readFileSync(new URL('../src/lib/provisioning.ts', import.meta.url), 'utf8');

/**
 * Item 8 - comfort steering, v1 (temporary override path, COOL-ONLY).
 *
 * Safety-critical strings pinned EXACTLY (substring checks on boolean
 * templates are banned - QA NEW-1). The steering spec's required tests
 * (mzcs_steering_design.md §8) at the engine level: default byte-identity,
 * the engine skip clause only under the flag, compensation math + clamps,
 * refusals, and revert ordering (marker cleared by the revert branch).
 */

type Node = Record<string, unknown>;
const STEER = { zones: STEERING_ZONES, features: { steering: true as const } };

const ZONES: ZoneRef[] = [
  {
    slug: 'zone_one',
    name: 'Zone One',
    climate: 'climate.zone_one',
    rooms: [{ label: 'Room A', entity: 'sensor.room_a_temperature' }],
  },
  { slug: 'zone_two', name: 'Zone Two', climate: 'climate.zone_two' },
];
const SEASONS: ProvisionSeason[] = [
  { key: 'summer', name: 'Summer', default_mode: 'cool' },
  { key: 'winter', name: 'Winter', default_mode: 'heat_cool' },
];

function walk(node: unknown, out: Node[] = []): Node[] {
  if (Array.isArray(node)) for (const n of node) walk(n, out);
  else if (node !== null && typeof node === 'object') {
    out.push(node as Node);
    for (const v of Object.values(node as Node)) walk(v, out);
  }
  return out;
}
const byAlias = (p: Node, prefix: string): Node | undefined =>
  walk(p).find((n) => typeof n.alias === 'string' && (n.alias as string).startsWith(prefix));

describe('spec §8.1/§8.2 - the engine changes ONLY under the flag', () => {
  it('steering off (or omitted) produces the byte-identical default engine', () => {
    const base = engineAutomation('climate', ZONES, SEASONS, 'eco');
    expect(engineAutomation('climate', ZONES, SEASONS, 'eco', null, false)).toEqual(base);
  });

  it('steering on adds the override_timer for_each key and the gate term, exactly', () => {
    const eng = allPayloads(canonicalInput(STEER))['climate_mzcs_engine'] as Node;
    const rep = walk(eng).find((n) => n.repeat) as Node;
    const item = ((rep.repeat as Node).for_each as Node[])[0]!;
    expect(item.override_timer).toBe('timer.climate_zone_one_room_override');
    const gate = byAlias(eng, 'Skip when zone disabled')!;
    // Compound term (QA finding M5): the engine reclaims the zone the moment
    // a scheduled block transitions away from cooling mid-override.
    expect(gate.value_template).toBe(
      "{{ is_state(repeat.item.enabled, 'on') and blk is not none and blk != states(repeat.item.marker) and state_attr(repeat.item.climate, 'preset_mode') != 'eco' and not (is_state(repeat.item.override_timer, 'active') and blk_mode == 'cool') }}",
    );
  });
});

describe('the steering automation, pinned', () => {
  const st = allPayloads(canonicalInput(STEER))['climate_mzcs_steering'] as Node;

  it('reverts by clearing the applied-block marker, resolved through the generated map', () => {
    const resolve = byAlias(st, "Resolve which zone's override ended")!;
    expect((resolve.variables as Node).marker).toBe(
      "{{ {'timer.climate_zone_one_room_override': 'input_text.climate_zone_one_applied_block', " +
        "'timer.climate_zone_two_room_override': 'input_text.climate_zone_two_applied_block', " +
        "'timer.climate_zone_three_room_override': 'input_text.climate_zone_three_applied_block'}.get(trigger.event.data.entity_id) }}",
    );
    const clear = byAlias(st, 'Clear the applied-block marker')!;
    expect(clear.action).toBe('input_text.set_value');
    expect(clear.target).toEqual({ entity_id: '{{ marker }}' });
    expect(clear.data).toEqual({ value: '' });
  });

  it('reverts on BOTH timer.finished and timer.cancelled, per zone', () => {
    const triggers = st.triggers as Node[];
    for (const ev of ['timer.finished', 'timer.cancelled']) {
      const of = triggers.filter((t) => t.event_type === ev);
      expect(of.map((t) => (t.event_data as Node).entity_id).sort(), ev).toEqual([
        'timer.climate_zone_one_room_override',
        'timer.climate_zone_three_room_override',
        'timer.climate_zone_two_room_override',
      ]);
    }
  });

  it('is COOL-ONLY: the steer gate requires a cooling block with a cool setpoint', () => {
    const gate = byAlias(st, 'Steer only an enabled zone')!;
    expect(gate.value_template).toBe(
      "{{ is_state(repeat.item.timer, 'active') and is_state(repeat.item.enabled, 'on') and room is not none and blk_mode == 'cool' and blk_cool is not none and state_attr(repeat.item.climate, 'preset_mode') != 'eco' }}",
    );
  });

  it('computes the compensation, clamped block-offset first then the absolute band (band wins)', () => {
    const step = byAlias(st, 'Compute the commanded setpoint')!;
    expect((step.variables as Node).commanded).toBe(
      '{{ [ [ [ [ (t_thermo | float) - (t_room - t_target), (blk_cool | float) - moff ] | max, (blk_cool | float) + moff ] | min, smin ] | max, smax ] | min | round(1) }}',
    );
  });

  it('QA-E5: freshness includes the last_seen companion - the item-36 blind spot stays closed mid-override', () => {
    // last_reported alone is refreshed by a restart's retained-MQTT replay for
    // a DEAD device; when a row configured a companion, the automation now
    // requires it fresh too, exactly like the card's own stale gate.
    const vars = byAlias(st, 'Read the room, the thermostat and the target')!.variables as Node;
    expect(vars.room_fresh).toBe('{{ states(room) | float(-999) > -900 and states[room] is not none and now() - states[room].last_reported < timedelta(hours=3) and (repeat.item.seens.get(room) is none or ((states(repeat.item.seens.get(room)) | as_datetime) is not none and now() - (states(repeat.item.seens.get(room)) | as_datetime) < timedelta(hours=3))) }}');
    const gate = byAlias(st, 'Refuse stale or unreadable inputs')!;
    // The setpoint-attribute term (QA E-INFO-6) stops a doomed write loop when
    // a thermostat is manually in a mode that exposes no `temperature`.
    expect(gate.value_template).toBe(
      "{{ room_fresh and t_target > -900 and t_thermo is not none and state_attr(repeat.item.climate, 'temperature') is not none }}",
    );
  });

  it('QA-E5: the seens map carries exactly the configured companions', () => {
    const rep = walk(st).find((n) => n.repeat) as Node;
    const items = (rep.repeat as Node).for_each as Node[];
    expect(items[0]!.seens).toEqual({ 'sensor.room_a_temperature': 'sensor.room_a_last_seen' });
    expect(items[1]!.seens).toEqual({});
  });

  it('cancels the override when a zone is disabled mid-override - and touches nothing else of the kill switch', () => {
    const cancel = byAlias(st, 'Cancel this override')!;
    expect(cancel.action).toBe('timer.cancel');
    expect(cancel.target).toEqual({ entity_id: '{{ repeat.item.timer }}' });
    for (const n of walk(st)) {
      const t = JSON.stringify(n.target ?? '');
      if (n.action === 'input_boolean.turn_on' || n.action === 'input_boolean.turn_off') {
        throw new Error(`steering writes an input_boolean: ${t}`);
      }
    }
  });

  it('steers only zones that HAVE room sensors; labels fall back to the entity id', () => {
    const rep = walk(st).find((n) => n.repeat) as Node;
    const items = (rep.repeat as Node).for_each as Node[];
    expect(items.map((i) => i.zone)).toEqual(['zone_one', 'zone_two']);
    expect(items[1]!.rooms).toEqual({ 'sensor.room_c_temperature': 'sensor.room_c_temperature' });
    // The pilot's reverse map, entity -> label, must mirror rooms exactly.
    expect(items[0]!.labels).toEqual({
      'sensor.room_a_temperature': 'Room A',
      'sensor.room_b_temperature': 'Room B',
    });
  });

  it('QA-E2: the pilot gate range-guards blk_cool and requires a FRESH daypart room, pinned', () => {
    // Without the 50-95 guard the target write throws server-side and aborts
    // the WHOLE zone loop (starving later zones' kill-switch checks - and
    // always, on Celsius installs). Without dp_fresh the pilot arms an
    // override on a dead sensor and locks the engine out for a whole daypart.
    const gate = (byAlias(st, 'Daypart pilot')!.choose as Node[])[0]!.conditions as Node[];
    expect(gate[0]!.value_template).toBe(
      "{{ dp_label is not none and is_state(repeat.item.timer, 'idle') and is_state(repeat.item.enabled, 'on') and blk_mode == 'cool' and blk_cool is not none and blk_cool | float(0) >= 50 and blk_cool | float(0) <= 95 and dp_fresh and state_attr(repeat.item.climate, 'preset_mode') != 'eco' }}",
    );
    const vars = byAlias(st, "Resolve this zone's steering inputs")!.variables as Node;
    expect(vars.dp_fresh).toBe('{{ dp_room is not none and states(dp_room) | float(-999) > -900 and states[dp_room] is not none and now() - states[dp_room].last_reported < timedelta(hours=3) and (repeat.item.seens.get(dp_room) is none or ((states(repeat.item.seens.get(dp_room)) | as_datetime) is not none and now() - (states(repeat.item.seens.get(dp_room)) | as_datetime) < timedelta(hours=3))) }}');
  });

  it('QA-E2: every pilot write carries continue_on_error so one zone cannot starve the loop', () => {
    const pilot = (byAlias(st, 'Daypart pilot')!.choose as Node[])[0]!.sequence as Node[];
    expect(pilot).toHaveLength(3);
    for (const step of pilot) expect(step.continue_on_error, String(step.alias)).toBe(true);
  });

  it('QA-M4: queue depth is 25 so sensor chatter cannot drop a revert event as easily', () => {
    expect(st.mode).toBe('queued');
    expect(st.max).toBe(25);
  });

  it('daypart pilot: runs the override until the daypart ends, with a floor and a fallback', () => {
    const start = byAlias(st, 'Run the override until the daypart ends')!;
    expect(start.action).toBe('timer.start');
    expect((start.data as Node).duration).toBe(
      "{{ [ ((state_attr(repeat.item.sensor_schedule, 'next_event') - now()).total_seconds() | int) if state_attr(repeat.item.sensor_schedule, 'next_event') is not none else 1800, 300 ] | max }}",
    );
  });

  it('daypart pilot: targets the SCHEDULED setpoint, so dayparts steer the schedule, not a stale manual target', () => {
    const tgt = byAlias(st, 'Target the scheduled setpoint at that room')!;
    expect(tgt.action).toBe('input_number.set_value');
    expect(tgt.data).toEqual({ value: '{{ blk_cool | float }}' });
  });

  it('the steering write carries continue_on_error and never sets an hvac_mode', () => {
    const write = byAlias(st, 'Steer the zone toward the target room')!;
    expect(write.continue_on_error).toBe(true);
    expect(write.data).toEqual({ temperature: '{{ commanded }}' });
  });

  it('strips quotes from a hand-edited preset so the steer gate cannot be broken', () => {
    const p = steeringAutomation('climate', ZONES, SEASONS, "aw'ay");
    const gate = byAlias(p, 'Steer only an enabled zone')!;
    const t = String(gate.value_template);
    expect(t).toContain("!= 'away'");
    expect(t.match(/'/g)!.length % 2).toBe(0);
  });
});

describe('inventory', () => {
  it('steering adds exactly its per-zone objects, the four tunables and the automation', () => {
    const base = new Set(inventoryFor(canonicalInput({ zones: STEERING_ZONES })).map((o) => o.id));
    const added = inventoryFor(canonicalInput(STEER))
      .filter((o) => !base.has(o.id))
      .map((o) => o.id);
    expect(added.sort()).toEqual(
      [
        ...['zone_one', 'zone_two', 'zone_three'].flatMap((z) => [
          `input_select.climate_${z}_target_room`,
          `timer.climate_${z}_room_override`,
          `input_number.climate_${z}_steer_target`,
          `schedule.climate_${z}_sensor_schedule`,
        ]),
        'input_number.climate_override_minutes',
        'input_number.climate_steer_min_setpoint',
        'input_number.climate_steer_max_setpoint',
        'input_number.climate_steer_max_offset',
        'automation:climate_mzcs_steering',
      ].sort(),
    );
  });

  it('target_room options derive from the room sensors; a room-less zone gets only Thermostat', () => {
    const inv = inventoryFor(canonicalInput(STEER));
    const spec = (id: string) => inv.find((o) => o.id === id)!.spec as Record<string, unknown>;
    expect(spec('input_select.climate_zone_one_target_room').options).toEqual(['Thermostat', 'Room A', 'Room B']);
    expect(spec('input_select.climate_zone_three_target_room').options).toEqual(['Thermostat']);
  });

  it('room sensors change NOTHING without steering', () => {
    // The rooms field is built only under the flag, so a config that merely
    // HAS room sensors provisions and signs byte-identically to one without.
    expect(inventoryFor(canonicalInput({ zones: STEERING_ZONES }))).toEqual(inventoryFor(canonicalInput()));
  });
});

describe('QA-E4: room label sanitization (steeringRooms is THE single builder)', () => {
  it('a room named "Thermostat" cannot defeat the not-steering sentinel', () => {
    expect(steeringRooms([{ entity: 'sensor.room_a_temperature', name: 'Thermostat' }])).toEqual([
      { label: 'sensor.room_a_temperature', entity: 'sensor.room_a_temperature' },
    ]);
    expect(steeringRooms([{ entity: 'sensor.room_a_temperature', name: '  thermostat ' }])).toEqual([
      { label: 'sensor.room_a_temperature', entity: 'sensor.room_a_temperature' },
    ]);
  });

  it('duplicate labels fall back to the entity id; duplicate entities are dropped', () => {
    expect(
      steeringRooms([
        { entity: 'sensor.room_a_temperature', name: 'Same' },
        { entity: 'sensor.room_b_temperature', name: 'Same' },
        { entity: 'sensor.room_a_temperature', name: 'Again' },
      ]),
    ).toEqual([
      { label: 'Same', entity: 'sensor.room_a_temperature' },
      { label: 'sensor.room_b_temperature', entity: 'sensor.room_b_temperature' },
    ]);
  });

  it('the label rule has ONE implementation - no hand-copy of `name ?? entity` outside it (QA INFO-6)', () => {
    expect((CARD_SRC.match(/name \?\? r\.entity/g) ?? []).length, 'card').toBe(0);
    expect((PROVISIONING_SRC.match(/name \?\? r\.entity/g) ?? []).length, 'provisioning').toBe(1);
  });
});
