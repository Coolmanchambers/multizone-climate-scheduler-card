// Fixture-driven mock hass for the dev harness. Implements exactly the surface
// in src/ha-types.ts plus a mutation hook so the harness can re-render.
import type { HassEntity, HassLike } from '../src/ha-types';
import statesFixture from './fixtures/states.json';

type Listener = () => void;

export class MockHass implements HassLike {
  public states: Record<string, HassEntity | undefined>;
  public log: Array<{ domain: string; service: string; data?: Record<string, unknown> }> = [];
  private listeners: Listener[] = [];

  constructor() {
    this.states = {};
    for (const [id, v] of Object.entries(statesFixture)) {
      if (id.startsWith('_')) continue;
      const e = v as { state: string; attributes: Record<string, unknown> };
      this.states[id] = { state: e.state, attributes: { ...e.attributes } };
    }
  }

  public onChange(fn: Listener): void {
    this.listeners.push(fn);
  }

  /**
   * Real HA hands cards a NEW hass object on every state change; Lit's property
   * change detection depends on that identity change. Snapshot mimics it.
   */
  public snapshot(): HassLike {
    return {
      states: this.states,
      callService: this.callService.bind(this),
      callWS: this.callWS.bind(this),
    };
  }

  private mutate(fn: () => void): void {
    fn();
    // New object identity so Lit's @property change detection fires.
    this.states = { ...this.states };
    for (const l of this.listeners) l();
  }

  public async callService(
    domain: string,
    service: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    this.log.push({ domain, service, data });
    const entityId = typeof data?.entity_id === 'string' ? data.entity_id : undefined;
    if (domain === 'climate' && service === 'set_temperature' && entityId) {
      this.mutate(() => {
        const e = this.states[entityId];
        if (e && typeof data?.temperature === 'number') {
          this.states[entityId] = {
            ...e,
            attributes: { ...e.attributes, temperature: data.temperature },
          };
        }
      });
    }
    if (domain === 'timer' && service === 'start' && entityId) {
      this.mutate(() => {
        const e = this.states[entityId];
        if (e) this.states[entityId] = { ...e, state: 'active' };
      });
    }
  }

  public async callWS(msg: Record<string, unknown>): Promise<unknown> {
    this.log.push({ domain: 'ws', service: String(msg.type), data: msg });
    return {};
  }

  /** Harness helper: flip an entity's state/attributes and notify. */
  public set(entityId: string, patch: Partial<HassEntity>): void {
    this.mutate(() => {
      const e = this.states[entityId] ?? { state: 'unknown', attributes: {} };
      this.states[entityId] = {
        state: patch.state ?? e.state,
        attributes: { ...e.attributes, ...(patch.attributes ?? {}) },
      };
    });
  }
}
