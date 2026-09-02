import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { planIdShape, type Plan } from '../src/lib/provisioning';

/**
 * 0.7.7 review (adversary HIGH-3): the destructive flows' freshness gate -
 * re-plan against the live registry, refuse on drift - lived inline in two
 * card methods and no test exercised it; removing the whole refusal block kept
 * the suite green. The comparison is now a library function with unit tests,
 * and the card's two flows are scanned for using it AND for re-checking the
 * user is still in the flow after the registry read (invariant 8).
 */
const mk = (over: Partial<Plan> = {}): Plan => ({ create: [], adopt: [], update: [], delete: [], noop: [], ...over });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const act = (op: 'create' | 'adopt' | 'update' | 'delete', id: string): any => ({ op, id, kind: 'helper', spec: {}, from: {} });

describe('planIdShape', () => {
  it('is order-independent within an operation', () => {
    const a = mk({ create: [act('create', 'x.a'), act('create', 'x.b')] });
    const b = mk({ create: [act('create', 'x.b'), act('create', 'x.a')] });
    expect(planIdShape(a)).toBe(planIdShape(b));
  });

  it('changes when an id appears, disappears, or moves between operations', () => {
    const base = mk({ create: [act('create', 'x.a')], delete: [act('delete', 'x.z')] });
    expect(planIdShape(mk({ create: [act('create', 'x.a')] }))).not.toBe(planIdShape(base));
    expect(planIdShape(mk({ create: [act('create', 'x.a'), act('create', 'x.b')], delete: [act('delete', 'x.z')] }))).not.toBe(
      planIdShape(base),
    );
    expect(planIdShape(mk({ update: [act('update', 'x.a')], delete: [act('delete', 'x.z')] }))).not.toBe(planIdShape(base));
  });

  it('ignores noops (they carry no action)', () => {
    const a = mk({ delete: [act('delete', 'x.z')] });
    const b = mk({ delete: [act('delete', 'x.z')], noop: [{ op: 'noop', id: 'x.n', kind: 'helper' }] });
    expect(planIdShape(a)).toBe(planIdShape(b));
  });
});

describe('the card gates BOTH destructive flows on it, after the live re-plan', () => {
  const src = readFileSync(new URL('../src/multizone-climate-scheduler-card.ts', import.meta.url), 'utf8');
  const bodyOf = (method: string): string => {
    const start = src.indexOf(`private async ${method}(`);
    expect(start, method).toBeGreaterThan(-1);
    const next = src.indexOf('\n  private ', start + 1);
    return src.slice(start, next < 0 ? undefined : next);
  };

  for (const method of ['_runApply', '_runTeardown']) {
    it(`${method}: refuses on drift between the previewed and the fresh plan`, () => {
      const body = bodyOf(method);
      expect(body).toMatch(/if \(planIdShape\(fresh\) !== planIdShape\(p\)\) \{[\s\S]*?return;/);
      // The comparison happens AFTER the live registry read, on its result.
      expect(body.indexOf('await this._fetchExistingFor(input)')).toBeLessThan(body.indexOf('planIdShape(fresh)'));
    });

    it(`${method}: re-checks the user is still in the flow after the registry await (invariant 8)`, () => {
      const body = bodyOf(method);
      const awaitAt = body.indexOf('await this._fetchExistingFor(input)');
      const recheck = body.indexOf('this._config !== cfg || this._dryRun !== p');
      expect(recheck, 'post-await flow re-check').toBeGreaterThan(awaitAt);
      expect(body.indexOf('executePlan(')).toBeGreaterThan(recheck);
    });
  }
});
