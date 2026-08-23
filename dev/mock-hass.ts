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
    if (domain === 'climate' && service === 'set_hvac_mode' && entityId) {
      this.mutate(() => {
        const e = this.states[entityId];
        if (e && typeof data?.hvac_mode === 'string') {
          this.states[entityId] = { ...e, state: data.hvac_mode };
        }
      });
    }
    if (domain === 'climate' && service === 'set_preset_mode' && entityId) {
      this.mutate(() => {
        const e = this.states[entityId];
        if (e && typeof data?.preset_mode === 'string') {
          this.states[entityId] = {
            ...e,
            attributes: { ...e.attributes, preset_mode: data.preset_mode },
          };
        }
      });
    }
    if (domain === 'input_boolean' && (service === 'turn_on' || service === 'turn_off') && entityId) {
      this.mutate(() => {
        const e = this.states[entityId];
        if (e) this.states[entityId] = { ...e, state: service === 'turn_on' ? 'on' : 'off' };
      });
    }
    if (domain === 'input_text' && service === 'set_value' && entityId) {
      this.mutate(() => {
        const e = this.states[entityId];
        if (e) this.states[entityId] = { ...e, state: String(data?.value ?? '') };
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
    const t = String(msg.type);
    if (t === 'timer/list') {
      return Object.keys(this.states)
        .filter((id) => id.startsWith('timer.'))
        .map((id) => ({
          id: id.slice('timer.'.length),
          name: this.states[id]?.attributes.friendly_name,
          restore: false,
        }));
    }
    if (t === 'input_number/list') {
      return Object.keys(this.states)
        .filter((id) => id.startsWith('input_number.'))
        .map((id) => ({ id: id.slice('input_number.'.length), min: 1, max: 15, step: 1 }));
    }
    if (t === 'input_select/list') return [];
    if (t === 'schedule/list') return [this.scheduleFixture];
    if (t === 'schedule/update') {
      const { type: _t, schedule_id: _id, ...days } = msg;
      this.scheduleFixture = { ...this.scheduleFixture, ...days };
      return this.scheduleFixture;
    }
    if (t === 'config/entity_registry/get_entries') return {};
    if (t === 'history/history_during_period') {
      const ids = (msg.entity_ids as string[]) ?? [];
      const start = Date.parse(String(msg.start_time));
      const H = 3600_000;
      const out: Record<string, Array<{ s?: string; lu: number; a?: Record<string, unknown> }>> = {};
      for (const id of ids) {
        if (id.startsWith('binary_sensor.')) {
          out[id] = [
            { s: 'off', lu: start / 1000 },
            { s: 'on', lu: (start + 6 * H) / 1000 },
            { s: 'off', lu: (start + 7.5 * H) / 1000 },
            { s: 'on', lu: (start + 13 * H) / 1000 },
            { s: 'off', lu: (start + 13.4 * H) / 1000 },
            { s: 'on', lu: (start + 14 * H) / 1000 },
            { s: 'off', lu: (start + 16.2 * H) / 1000 },
            { s: 'on', lu: (start + 19 * H) / 1000 },
            { s: 'off', lu: (start + 21.5 * H) / 1000 },
          ];
        } else {
          out[id] = [
            { s: 'cool', lu: start / 1000, a: { temperature: 76 } },
            { s: 'cool', lu: (start + 6 * H) / 1000, a: { temperature: 78 } },
            { s: 'cool', lu: (start + 14 * H) / 1000, a: { temperature: 76 } },
            { s: 'cool', lu: (start + 16 * H) / 1000, a: { temperature: 79 } },
            { s: 'cool', lu: (start + 21.5 * H) / 1000, a: { temperature: 76 } },
          ];
        }
      }
      return out;
    }
    if (t === 'recorder/statistics_during_period') {
      const ids = (msg.statistic_ids as string[]) ?? [];
      const out: Record<string, Array<{ start: number; max: number }>> = {};
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const vals = [9.5, 10.25, 11.5, 9.5, 9.25, 9.5];
      for (const id of ids) {
        out[id] = vals.map((v, i) => ({
          start: today.getTime() - (i + 1) * 86400000,
          max: v,
        }));
      }
      return out;
    }
    return {};
  }

  /** Upstairs Summer weekend/weekday week matching the prod S7 provisioning. */
  public scheduleFixture: Record<string, unknown> = (() => {
    const wd = [
      { from: '00:00:00', to: '06:00:00', data: { block: 'Sleep', mode: 'cool', cool_temp: 76 } },
      { from: '06:00:00', to: '08:00:00', data: { block: 'Wake', mode: 'cool', cool_temp: 78 } },
      { from: '08:00:00', to: '14:00:00', data: { block: 'Away', mode: 'cool', cool_temp: 80 } },
      { from: '14:00:00', to: '16:00:00', data: { block: 'Pre-cool', mode: 'cool', cool_temp: 76 } },
      { from: '16:00:00', to: '18:45:00', data: { block: 'On-peak', mode: 'cool', cool_temp: 79 } },
      { from: '18:45:00', to: '21:30:00', data: { block: 'Evening', mode: 'cool', cool_temp: 77 } },
      { from: '21:30:00', to: '24:00:00', data: { block: 'Sleep', mode: 'cool', cool_temp: 76 } },
    ];
    const we = [
      { from: '00:00:00', to: '07:30:00', data: { block: 'Sleep', mode: 'cool', cool_temp: 76 } },
      { from: '07:30:00', to: '21:30:00', data: { block: 'Wake', mode: 'cool', cool_temp: 78 } },
      { from: '21:30:00', to: '24:00:00', data: { block: 'Sleep', mode: 'cool', cool_temp: 76 } },
    ];
    return {
      id: 'climate_upstairs_summer',
      name: 'Climate Upstairs Summer',
      monday: wd,
      tuesday: wd,
      wednesday: wd,
      thursday: wd,
      friday: wd,
      saturday: we,
      sunday: we,
    };
  })();

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
