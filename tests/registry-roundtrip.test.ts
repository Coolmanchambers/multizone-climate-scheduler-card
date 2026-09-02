import { describe, it, expect } from 'vitest';
import { canonicalInput, allGeneratedPayloads, VARIANTS } from './fixtures/canonical-config';
import { buildDesired, plan, actionable, type ProvisionInput } from '../src/lib/provisioning';
import { fetchExisting } from '../src/registry-read';
import type { HassLike } from '../src/ha-types';

/**
 * 0.7.7 review (adversary HIGH-2): nothing round-tripped an APPLIED install
 * through the real `fetchExisting`. A one-line mutation there (`unit:
 * undefined` instead of omitting the key) produced seven phantom Updates on
 * the canonical install and the suite stayed green. Invariant 7 - a user who
 * changes nothing sees all-Unchanged forever - is asserted here on the READ
 * side: a registry that holds exactly what Apply wrote must replan to zero
 * actionable, for the default and every variant.
 *
 * The fake registry answers the same websocket/REST calls the real one does,
 * shaped from the desired inventory the way Home Assistant stores it.
 */
const slug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

function appliedRegistry(input: ProvisionInput): HassLike {
  const desired = buildDesired(input);
  const payloads = allGeneratedPayloads(input);
  const states: Record<string, { state: string; attributes: Record<string, unknown> }> = {};
  const lists: Record<string, Array<Record<string, unknown>>> = {
    timer: [],
    input_select: [],
    input_number: [],
    schedule: [],
  };
  const uniq = new Map<string, string>();
  for (const d of desired) {
    if (d.id.startsWith('automation:')) {
      const uid = d.id.slice('automation:'.length);
      const p = payloads[uid]!;
      states[`automation.${slug(String(p.alias))}`] = {
        state: 'on',
        attributes: { id: uid, friendly_name: p.alias },
      };
      continue;
    }
    const dot = d.id.indexOf('.');
    const domain = d.id.slice(0, dot);
    const objectId = d.id.slice(dot + 1);
    states[d.id] = { state: '0', attributes: { friendly_name: d.spec.name } };
    if (domain in lists) {
      // One adopted helper whose STORAGE id differs from its entity object_id
      // (created under another name, entity renamed to the contract id), with
      // a decoy item sitting under the object_id: the read must join through
      // the registry unique_id, or it compares the decoy's spec (0.7.7
      // adversary2 HIGH: with unique_id == object_id everywhere this test
      // could not see an object_id join).
      const storageId = d.id.endsWith('_cdd_base') ? `${objectId}_storage` : objectId;
      const item: Record<string, unknown> = { id: storageId, name: d.spec.name };
      if (domain === 'input_number') {
        Object.assign(item, { min: d.spec.min, max: d.spec.max, step: d.spec.step });
        if (d.spec.unit) item.unit_of_measurement = d.spec.unit;
      }
      if (domain === 'input_select') item.options = d.spec.options;
      if (domain === 'timer') item.restore = d.spec.restore;
      lists[domain]!.push(item);
      if (storageId !== objectId) {
        lists[domain]!.push({ id: objectId, name: 'Decoy under the object id', min: 0, max: 1, step: 1 });
      }
      uniq.set(d.id, storageId);
    }
  }
  return {
    states,
    callService: async () => undefined,
    callWS: async (msg) => {
      const t = String(msg.type);
      if (t === 'config/entity_registry/get_entries') {
        const ids = (msg.entity_ids as string[]) ?? [];
        return Object.fromEntries(
          ids.map((id) => [id, { labels: ['mzcs'], ...(uniq.has(id) ? { unique_id: uniq.get(id) } : {}) }]),
        );
      }
      if (t.endsWith('/list')) return lists[t.slice(0, -'/list'.length)] ?? [];
      return {};
    },
    callApi: async (method, path) => {
      const m = path.match(/^config\/automation\/config\/(.+)$/);
      if (method === 'GET' && m && payloads[m[1]!]) return payloads[m[1]!];
      throw new Error('not found');
    },
  };
}

describe('an applied install replans to all-Unchanged through the REAL fetchExisting', () => {
  const rows = [{ name: 'default', overrides: {} as Record<string, unknown> }, ...VARIANTS];
  for (const v of rows) {
    it(`${v.name}: zero actionable, every desired object a noop`, async () => {
      const input = canonicalInput(v.overrides as Parameters<typeof canonicalInput>[0]);
      const desired = buildDesired(input);
      const existing = await fetchExisting(
        appliedRegistry(input),
        input.prefix,
        input.zones.map((z) => z.slug),
        input.seasons.map((s) => String(s.key)),
      );
      const p = plan(desired, existing);
      expect(actionable(p).map((a) => `${a.op} ${a.id}`), v.name).toEqual([]);
      expect(p.noop.length, v.name).toBe(desired.length);
      // and nothing foreign was invented on the read side either
      expect(existing.length, v.name).toBe(desired.length);
    });
  }
});
