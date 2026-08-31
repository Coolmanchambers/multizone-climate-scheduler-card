import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { canonicalInput, allGeneratedPayloads, signaturesFor, VARIANTS, zoneRefs } from './fixtures/canonical-config';
import { parseSignature } from '../src/lib/automation-payloads';
import { resolveEcoPreset, resolveOffPeak } from '../src/types';
import {
  engineAutomation,
  watchdogAutomation,
  learningAutomation,
  runtimeAlertAutomation,
  fanAutomation,
  steeringAutomation,
} from '../src/lib/automation-payloads';
import type { ProvisionInput } from '../src/lib/provisioning';

/**
 * QA finding NEW-3: the executor has a THIRD hand-built uid -> generator map.
 *
 * `automationPayload()` in `src/provision-exec.ts` decides what actually gets
 * WRITTEN to Home Assistant. `automationSignatures()` in automation-payloads.ts
 * decides what the differ SIGNS. The test fixture has a third copy. Nothing
 * compared them, so dropping one argument at the executor - `fanAutomation(p,
 * zone)` instead of `fanAutomation(p, zone, ctx.fanGuard)` - made the executor
 * write fan automations without their guard while the differ signed them WITH
 * it: a permanent phantom Update on every dry-run, and a fan guard that
 * silently does not exist. The whole suite stayed green.
 *
 * This file is the missing seam. It reproduces the executor's mapping from its
 * own source and asserts it agrees with the signed payloads, for every variant.
 */

const EXEC_SRC = readFileSync(new URL('../src/provision-exec.ts', import.meta.url), 'utf8');

/**
 * The executor's mapping, transcribed. Kept deliberately close to the original
 * so a divergence is visible in review; the source scan below is what catches a
 * change that this transcription silently fails to track.
 */
function executorPayload(uid: string, input: ProvisionInput): Record<string, unknown> | null {
  const p = input.prefix;
  const zones = zoneRefs(input);
  const seasons = input.seasons;
  const ecoPreset = resolveEcoPreset(input.features);
  const fanGuard = input.features.fan_guard;
  const offPeakEntity = resolveOffPeak(input.features)?.entity ?? null;
  if (uid === `${p}_mzcs_engine`)
    return engineAutomation(p, zones, seasons, ecoPreset, offPeakEntity, input.features.steering);
  if (uid === `${p}_mzcs_steering`) return steeringAutomation(p, zones, seasons, ecoPreset);
  if (uid === `${p}_mzcs_watchdog`) return watchdogAutomation(p);
  if (uid === `${p}_mzcs_runtime_learning`) return learningAutomation(p, zones);
  if (uid === `${p}_mzcs_runtime_alert`) return runtimeAlertAutomation(p, zones);
  const fanMatch = uid.match(new RegExp(`^${p}_mzcs_fan_timer_(.+)$`));
  if (fanMatch) {
    const zone = zones.find((z) => z.slug === fanMatch[1]);
    return zone ? fanAutomation(p, zone, fanGuard) : null;
  }
  return null;
}

const CONFIGS: Array<[string, Record<string, unknown>]> = [
  ['default', {}],
  ...VARIANTS.map((v) => [v.name, v.overrides] as [string, Record<string, unknown>]),
];

describe('what the executor WRITES equals what the differ SIGNS', () => {
  for (const [name, overrides] of CONFIGS) {
    const input = canonicalInput(overrides);
    const signed = allGeneratedPayloads(input);
    const sigs = signaturesFor(input);

    it(`${name}: every generated payload matches the executor's for the same uid`, () => {
      for (const uid of Object.keys(signed)) {
        expect(executorPayload(uid, input), `${name}/${uid}`).toEqual(signed[uid]);
      }
    });

    it(`${name}: and its signature matches the one the differ would compare`, () => {
      // The specific harm: differ signs WITH the fan guard, executor writes
      // WITHOUT it -> the live automation never matches its own signature, so
      // every dry-run plans an Update that changes nothing.
      for (const uid of Object.keys(signed)) {
        const written = executorPayload(uid, input);
        expect(parseSignature(written!.description), `${name}/${uid}`).toBe(sigs[uid]);
      }
    });

    it(`${name}: the executor produces a payload for every automation it may create`, () => {
      for (const uid of Object.keys(signed)) {
        expect(executorPayload(uid, input), `${name}/${uid} would SKIP with no payload`).not.toBeNull();
      }
    });
  }

  it('an unknown uid yields no payload rather than a wrong one', () => {
    expect(executorPayload('climate_mzcs_not_a_thing', canonicalInput())).toBeNull();
    expect(executorPayload('other_prefix_mzcs_engine', canonicalInput())).toBeNull();
  });

  it('a fan uid for a zone that is not configured yields no payload', () => {
    expect(executorPayload('climate_mzcs_fan_timer_ghost_zone', canonicalInput())).toBeNull();
  });
});

describe('the executor mapping above still mirrors its source', () => {
  // The transcription is only as good as its fidelity. These scans fail if the
  // real mapping gains a generator, loses an argument, or changes a uid shape,
  // which is the exact class of drift finding NEW-3 described.
  const body = EXEC_SRC.slice(
    EXEC_SRC.indexOf('function automationPayload('),
    EXEC_SRC.indexOf('async function createOne('),
  );

  it('passes the eco preset to the engine generator', () => {
    expect(body).toMatch(/engineAutomation\(\s*p,\s*ctx\.zones,\s*ctx\.seasons,/);
    expect(body).toContain('ctx.ecoPreset');
  });

  it('passes the off-peak entity to the engine generator', () => {
    // Dropping this argument is exactly finding NEW-3's shape: the executor
    // would write an engine without the off-peak step while the differ signs
    // one WITH it, and every off-peak install would plan a permanent Update.
    expect(body).toContain('ctx.offPeakEntity');
  });

  it('passes the steering flag to the engine and maps the steering uid', () => {
    expect(body).toContain('ctx.steering');
    expect(body).toMatch(/steeringAutomation\(p,\s*ctx\.zones,\s*ctx\.seasons,/);
  });

  it('passes the fan guard to the fan generator', () => {
    // Dropping this argument is the finding. It must be present.
    expect(body).toMatch(/fanAutomation\(p,\s*zone,\s*ctx\.fanGuard\)/);
  });

  it('passes the zone list to the learning and alert generators', () => {
    expect(body).toMatch(/learningAutomation\(p,\s*ctx\.zones\)/);
    expect(body).toMatch(/runtimeAlertAutomation\(p,\s*ctx\.zones\)/);
  });

  it('covers exactly the six generator kinds, no more and no fewer', () => {
    const kinds = ['engine', 'watchdog', 'runtime_learning', 'runtime_alert', 'fan_timer', 'steering'];
    for (const k of kinds) expect(body, k).toContain(`_mzcs_${k}`);
    const generatorCalls = body.match(/\b\w+Automation\(/g) ?? [];
    expect(new Set(generatorCalls)).toEqual(
      new Set([
        'engineAutomation(',
        'watchdogAutomation(',
        'learningAutomation(',
        'runtimeAlertAutomation(',
        'fanAutomation(',
        'steeringAutomation(',
      ]),
    );
  });
});

describe('QA-E6: steering-off re-apply releases in-flight overrides', () => {
  // The revert logic lives in the automation the delete removes, and deleting
  // an active timer fires NO cancelled event - without this, a zone strands at
  // the steered setpoint until the next block transition.
  it('the executor cancels a room_override timer and clears its zone marker before deleting it', () => {
    const deleteBlock = EXEC_SRC.slice(EXEC_SRC.indexOf("phase = 'delete'"));
    expect(deleteBlock).toContain("parsed?.cls === 'room_override_timer'");
    expect(deleteBlock).toMatch(/callService\('timer',\s*'cancel'/);
    expect(deleteBlock).toMatch(/zoneEntityId\('applied_block_marker', ctx\.prefix, parsed\.zone\)/);
  });
});
