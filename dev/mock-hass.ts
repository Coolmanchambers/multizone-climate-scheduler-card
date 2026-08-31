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
    this.seedCompetingWriters();
  }

  /**
   * Foreign writers for the competing-writer scan (item 33). Each one is a
   * shape the scan MUST catch, written the way real configs are written rather
   * than the way the scanner reads them: the modern `action:` spelling, the
   * legacy `service:` + `data.entity_id` pair, a preset writer, a script, and
   * a control that must NOT be reported.
   */
  private seedCompetingWriters(): void {
    const automation = (
      objectId: string,
      alias: string,
      config: Record<string, unknown>,
    ): void => {
      this.autoConfigs.set(objectId, { id: objectId, alias, ...config });
      this.states[`automation.${objectId}`] = {
        state: 'on',
        attributes: { id: objectId, friendly_name: alias },
      };
    };
    // This card's own engine automation carries the mzcs label in a real
    // install, which is what excludes it from its own scan.
    this.entityLabels.set('automation.climate_schedule_engine', ['mzcs']);

    automation('evening_cooldown', 'Evening cooldown', {
      action: [
        {
          action: 'climate.set_temperature',
          target: { entity_id: 'climate.downstairs_thermostat' },
          data: { temperature: 74 },
        },
      ],
    });
    automation('legacy_away_mode', 'Legacy away mode', {
      action: [{ service: 'homeassistant.turn_off', data: { entity_id: 'climate.studio_mini_split' } }],
    });
    automation('night_preset', 'Night preset', {
      action: [
        {
          choose: [
            {
              conditions: [],
              sequence: [
                {
                  action: 'climate.set_preset_mode',
                  target: { entity_id: 'climate.upstairs_thermostat' },
                  data: { preset_mode: 'eco' },
                },
              ],
            },
          ],
        },
      ],
    });
    automation('porch_light', 'Porch light', {
      action: [{ action: 'light.turn_on', target: { entity_id: 'light.porch' } }],
    });

    // QA-sweep shapes: a device action (S1), a blueprint (S2), and an OFF
    // automation (P3) - each must render in the panel, not scan clean.
    automation('bedtime_device_action', 'Bedtime device action', {
      action: [
        { device_id: 'dev_up', domain: 'climate', type: 'set_hvac_mode', entity_id: 'climate.upstairs_thermostat', hvac_mode: 'off' },
      ],
    });
    automation('blueprint_scheduler', 'Blueprint scheduler', {
      use_blueprint: { path: 'community/climate_schedule.yaml', input: { thermostat: 'climate.downstairs_thermostat', temp: 74 } },
    });
    this.states['automation.legacy_away_mode'] = {
      state: 'off',
      attributes: { id: 'legacy_away_mode', friendly_name: 'Legacy away mode' },
    };

    this.scriptConfigs.set('guest_mode', {
      alias: 'Guest mode',
      sequence: [
        {
          action: 'climate.set_hvac_mode',
          target: { entity_id: 'climate.upstairs_thermostat' },
          data: { hvac_mode: 'cool' },
        },
      ],
    });
    this.states['script.guest_mode'] = { state: 'off', attributes: { friendly_name: 'Guest mode' } };
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
      callApi: this.callApi.bind(this),
    };
  }

  private mutate(fn: () => void): void {
    // Copy FIRST, then apply the change to the copy. The old order wrote the
    // new state entry into the states object every earlier snapshot still
    // shared, so between two consecutive snapshots the changed entity's entry
    // was the SAME reference - and the card's reference-equality render gate
    // correctly concluded nothing changed (its renders were riding the
    // once-a-minute wall-clock fallback instead; measured live via the item-7
    // off-peak chip going stale for up to a minute after a tap). Real HA never
    // mutates a previously handed-out state map; now neither does the mock.
    this.states = { ...this.states };
    fn();
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
        if (!e) return;
        // Honor a passed duration ("HH:MM:SS") so countdown UIs have a real
        // finishes_at, like HA provides.
        const dur = typeof data?.duration === 'string' ? data.duration : '0:30:00';
        const [h, m, s] = dur.split(':').map((x) => Number(x) || 0);
        const finishes = new Date(Date.now() + ((h! * 60 + m!) * 60 + s!) * 1000).toISOString();
        this.states[entityId] = { ...e, state: 'active', attributes: { ...e.attributes, finishes_at: finishes } };
      });
    }
    if (domain === 'timer' && service === 'cancel' && entityId) {
      this.mutate(() => {
        const e = this.states[entityId];
        if (!e) {
          return;
        }
        const { finishes_at: _f, ...attrs } = e.attributes as Record<string, unknown>;
        this.states[entityId] = { ...e, state: 'idle', attributes: attrs };
      });
    }
    if (domain === 'input_number' && service === 'set_value' && entityId) {
      this.mutate(() => {
        const e = this.states[entityId];
        if (e && typeof data?.value === 'number') this.states[entityId] = { ...e, state: String(data.value) };
      });
    }
    if (domain === 'input_select' && service === 'select_option' && entityId) {
      this.mutate(() => {
        const e = this.states[entityId];
        if (e && typeof data?.option === 'string') this.states[entityId] = { ...e, state: data.option };
      });
    }
  }

  public async callWS(msg: Record<string, unknown>): Promise<unknown> {
    this.log.push({ domain: 'ws', service: String(msg.type), data: msg });
    const t = String(msg.type);
    const createMatch = t.match(/^(timer|input_text|input_select|input_number|input_boolean|schedule)\/create$/);
    if (createMatch) {
      const domain = createMatch[1]!;
      const name = String(msg.name ?? 'unnamed');
      const objectId = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      this.mutate(() => {
        this.states[`${domain}.${objectId}`] = {
          state: domain === 'input_boolean' ? 'off' : domain === 'timer' ? 'idle' : domain === 'schedule' ? 'on' : 'unknown',
          attributes: { friendly_name: name },
        };
      });
      return { id: objectId, ...msg };
    }
    if (t === 'config/label_registry/create') return { label_id: 'mzcs' };
    if (t === 'config/entity_registry/update' && Array.isArray(msg.labels)) {
      this.entityLabels.set(String(msg.entity_id), msg.labels as string[]);
      return {};
    }
    if (t === 'config/entity_registry/update' && !msg.new_entity_id) return {};
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
    if (t === 'schedule/list') return [this.scheduleFixture, ...this.extraSchedules.values()];
    if (t === 'schedule/update') {
      const { type: _t, schedule_id: id, ...days } = msg;
      // Item 8: sensor schedules live beside the zone-schedule fixture, keyed
      // by id, so a daypart save cannot clobber the zone schedule.
      if (typeof id === 'string' && id !== this.scheduleFixture.id && this.extraSchedules.has(id)) {
        const updated = { ...this.extraSchedules.get(id)!, ...days };
        this.extraSchedules.set(id, updated);
        return updated;
      }
      this.scheduleFixture = { ...this.scheduleFixture, ...days };
      return this.scheduleFixture;
    }
    if (t === 'config/entity_registry/get_entries') {
      const ids = (msg.entity_ids as string[]) ?? [];
      return Object.fromEntries(
        ids.map((id) => {
          const labels = this.entityLabels.get(id);
          if (this.flowReg.has(id)) {
            return [id, { config_entry_id: this.flowReg.get(id), labels: labels ?? [] }];
          }
          // A registry row exists for anything with a label or any real entity;
          // returning null for a live entity would hide its area/device/labels.
          if (labels || this.states[id]) {
            return [id, { area_id: null, device_id: null, labels: labels ?? [] }];
          }
          return [id, null];
        }),
      );
    }
    if (t === 'config/device_registry/list') return [];
    if (t === 'config/entity_registry/update' && msg.new_entity_id) {
      const from = String(msg.entity_id);
      const to = String(msg.new_entity_id);
      if (this.flowReg.has(from)) {
        this.flowReg.set(to, this.flowReg.get(from)!);
        this.flowReg.delete(from);
      }
      this.mutate(() => {
        if (this.states[from]) {
          this.states[to] = this.states[from];
          delete this.states[from];
        }
      });
      return {};
    }
    if (t === 'history/history_during_period') {
      const ids = (msg.entity_ids as string[]) ?? [];
      const start = Date.parse(String(msg.start_time));
      const H = 3600_000;
      const out: Record<string, Array<{ s?: string; lu: number; a?: Record<string, unknown> }>> = {};
      for (const id of ids) {
        if (id.startsWith('binary_sensor.')) {
          const endRaw = Date.parse(String(msg.end_time));
          const end = Number.isFinite(endRaw) ? endRaw : start + 24 * H;
          // One duty cycle per day across the whole window so the 10-day view
          // has something to draw. Windows longer than two days lose their
          // first 36 hours, simulating recorder purge, so the summary's
          // 'none'/'partial' coverage paths render in the harness. (A one-day
          // detail window is never trimmed, so the oldest day's detail shows
          // more than its summary row admits - acceptable in a mock.)
          const dataStart = end - start > 48 * H ? start + 36 * H : start;
          const rows: Array<{ s?: string; lu: number; a?: Record<string, unknown> }> = [
            { s: 'off', lu: dataStart / 1000 },
          ];
          const cycle: Array<[number, string]> = [
            [6, 'on'],
            [7.5, 'off'],
            [13, 'on'],
            [13.4, 'off'],
            [14, 'on'],
            [16.2, 'off'],
            [19, 'on'],
            [21.5, 'off'],
          ];
          for (let day = start; day < end; day += 24 * H) {
            for (const [h, st] of cycle) {
              const t = day + h * H;
              if (t <= dataStart || t >= end) continue;
              rows.push({ s: st, lu: t / 1000 });
            }
          }
          out[id] = rows;
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

  /** Simulates the REST surface the executor uses: config flows + automation config. */
  private flowStep = new Map<string, number>();
  private flowData = new Map<string, Record<string, unknown>>();
  private flowCount = 0;
  public autoConfigs = new Map<string, Record<string, unknown>>();
  /**
   * Entity labels, as applied by provision-exec's labelEntity(). Real HA
   * persists these; the mock used to drop them, which made every MZCS
   * automation look UNMANAGED to the competing-writer scan and to any other
   * label-gated read.
   */
  public entityLabels = new Map<string, string[]>();
  /** Stored script configs, keyed by object id, for `config/script/config/<id>`. */
  public scriptConfigs = new Map<string, Record<string, unknown>>();
  /** entity_id -> owning config_entry_id for flow-created entities */
  public flowReg = new Map<string, string>();
  public async callApi(method: string, path: string, data?: Record<string, unknown>): Promise<unknown> {
    this.log.push({ domain: 'api', service: `${method} ${path}`, data });
    if (method === 'POST' && path === 'config/config_entries/flow') {
      const flowId = `flow_${++this.flowCount}`;
      this.flowStep.set(flowId, 0);
      const handler = String(data?.handler);
      if (handler === 'template') {
        return { flow_id: flowId, type: 'menu', step_id: 'user' };
      }
      return {
        flow_id: flowId,
        type: 'form',
        step_id: 'user',
        data_schema: [{ name: 'name' }, { name: 'entity_id' }, { name: 'type' }],
      };
    }
    const flowMatch = path.match(/^config\/config_entries\/flow\/(flow_\d+)$/);
    if (method === 'POST' && flowMatch) {
      const flowId = flowMatch[1]!;
      const step = (this.flowStep.get(flowId) ?? 0) + 1;
      this.flowStep.set(flowId, step);
      const merged = { ...(this.flowData.get(flowId) ?? {}), ...(data ?? {}) };
      this.flowData.set(flowId, merged);
      if (data && 'next_step_id' in data) {
        return {
          flow_id: flowId,
          type: 'form',
          step_id: String(data.next_step_id),
          data_schema: [
            { name: 'name' },
            { name: 'state' },
            { name: 'device_class' },
            { name: 'unit_of_measurement' },
            { name: 'state_class' },
          ],
        };
      }
      if (step >= 2) {
        const name = String(merged.name ?? `entry_${flowId}`);
        const objectId = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
        const domain = String(merged.device_class ?? '') === 'running' ? 'binary_sensor' : 'sensor';
        let entityId = `${domain}.${objectId}`;
        while (this.states[entityId] || this.flowReg.has(entityId)) entityId = `${entityId}_2`;
        this.flowReg.set(entityId, `entry_${flowId}`);
        const finalId = entityId;
        this.mutate(() => {
          this.states[finalId] = { state: 'unknown', attributes: { friendly_name: name } };
        });
        return { flow_id: flowId, type: 'create_entry', result: { entry_id: `entry_${flowId}` } };
      }
      return {
        flow_id: flowId,
        type: 'form',
        step_id: 'options',
        data_schema: [{ name: 'state' }, { name: 'start' }, { name: 'end' }],
      };
    }
    const scriptMatch = path.match(/^config\/script\/config\/(.+)$/);
    if (scriptMatch && method === 'GET') {
      const cfg = this.scriptConfigs.get(scriptMatch[1]!);
      if (!cfg) throw new Error(`script ${scriptMatch[1]} not found`);
      return cfg;
    }
    const autoMatch = path.match(/^config\/automation\/config\/(.+)$/);
    if (autoMatch) {
      const uid = autoMatch[1]!;
      const entityId = `automation.${uid}`;
      if (method === 'POST') {
        this.autoConfigs.set(uid, { ...(data ?? {}) });
        this.mutate(() => {
          this.states[entityId] = {
            state: 'on',
            attributes: { id: uid, friendly_name: String(data?.alias ?? uid) },
          };
        });
        return { result: 'ok' };
      }
      if (method === 'GET') {
        const cfg = this.autoConfigs.get(uid);
        if (!cfg) throw new Error(`automation ${uid} not found`);
        return cfg;
      }
      if (method === 'DELETE') {
        this.autoConfigs.delete(uid);
        this.mutate(() => {
          delete this.states[entityId];
        });
        return { result: 'ok' };
      }
    }
    if (method === 'DELETE') return { result: 'ok' };
    throw new Error(`MockHass.callApi: unhandled ${method} ${path}`);
  }

  /** Upstairs Summer weekend/weekday week matching the prod S7 provisioning. */
  /** Additional schedule storage items (sensor schedules etc.), keyed by id. */
  public extraSchedules = new Map<string, Record<string, unknown>>();

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
