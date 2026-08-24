// The ONLY module allowed to interpret HA entity shapes (CONTRACT / plan risk #1).
import type { HassLike } from './ha-types';

export interface ClimateSummary {
  available: boolean;
  mode: string; // hvac state: cool/heat/heat_cool/off
  action: string; // hvac_action: cooling/heating/idle/off
  setpoint: number | null; // single-target modes
  targetLow: number | null;
  targetHigh: number | null;
  inside: number | null;
  humidity: number | null;
}

export function climateSummary(hass: HassLike, entityId: string): ClimateSummary {
  const e = hass.states[entityId];
  if (!e || e.state === 'unavailable' || e.state === 'unknown') {
    return {
      available: false,
      mode: 'unavailable',
      action: '',
      setpoint: null,
      targetLow: null,
      targetHigh: null,
      inside: null,
      humidity: null,
    };
  }
  const a = e.attributes;
  const num = (v: unknown): number | null => (typeof v === 'number' ? v : null);
  return {
    available: true,
    mode: e.state,
    action: typeof a.hvac_action === 'string' ? a.hvac_action : '',
    setpoint: num(a.temperature),
    targetLow: num(a.target_temp_low),
    targetHigh: num(a.target_temp_high),
    inside: num(a.current_temperature),
    humidity: num(a.current_humidity),
  };
}

export function fanTimerActive(hass: HassLike, timerEntityId: string): boolean {
  return hass.states[timerEntityId]?.state === 'active';
}

export function entityExists(hass: HassLike, entityId: string): boolean {
  return hass.states[entityId] !== undefined;
}

export function hvacModes(hass: HassLike, entityId: string): string[] {
  const m = hass.states[entityId]?.attributes.hvac_modes;
  return Array.isArray(m) ? m.filter((x): x is string => typeof x === 'string') : [];
}

export function ecoSupported(hass: HassLike, entityId: string, preset = 'eco'): boolean {
  const p = hass.states[entityId]?.attributes.preset_modes;
  return Array.isArray(p) && p.includes(preset);
}

export function ecoActive(hass: HassLike, entityId: string, preset = 'eco'): boolean {
  return hass.states[entityId]?.attributes.preset_mode === preset;
}

export function numberHelperValue(hass: HassLike, entityId: string): number | null {
  const e = hass.states[entityId];
  if (!e) return null;
  const v = Number(e.state);
  return Number.isFinite(v) ? v : null;
}

export interface RoomReading {
  entityId: string;
  name: string;
  temp: number | null;
  /** sensor has not reported recently - show the reading as untrustworthy */
  stale?: boolean;
}

/**
 * A room sensor that has not reported for this long is treated as stale. Room
 * sensors normally report every few minutes; a frozen one keeps publishing its
 * last value, so the card would otherwise show a confident, wrong number (seen
 * live: a Zigbee sensor pinned at one value for 17 hours).
 */
export const ROOM_STALE_MS = 3 * 60 * 60 * 1000;

export function roomReading(hass: HassLike, entityId: string, now = Date.now()): RoomReading {
  const e = hass.states[entityId];
  const name =
    typeof e?.attributes.friendly_name === 'string'
      ? e.attributes.friendly_name.replace(/ (Temperature|temperature)$/, '')
      : entityId.split('.')[1] ?? entityId;
  const v = e ? Number(e.state) : NaN;
  const ts = e?.last_updated ? Date.parse(e.last_updated) : NaN;
  const stale = Number.isFinite(ts) && now - ts > ROOM_STALE_MS;
  return { entityId, name, temp: Number.isFinite(v) ? v : null, stale };
}

export function setHvacMode(hass: HassLike, entityId: string, mode: string): Promise<unknown> {
  return hass.callService('climate', 'set_hvac_mode', { entity_id: entityId, hvac_mode: mode });
}

export function setEco(hass: HassLike, entityId: string, on: boolean, preset = 'eco'): Promise<unknown> {
  return hass.callService('climate', 'set_preset_mode', {
    entity_id: entityId,
    preset_mode: on ? preset : 'none',
  });
}

export function supportsFanOn(hass: HassLike, climateEntityId: string): boolean {
  const m = hass.states[climateEntityId]?.attributes.fan_modes;
  return Array.isArray(m) && m.includes('on');
}

/** Turn the fan on (when the unit supports plain on/off) and start the timer. */
export async function startFanTimer(
  hass: HassLike,
  climateEntityId: string,
  timerEntityId: string,
  minutes: number,
): Promise<void> {
  if (supportsFanOn(hass, climateEntityId)) {
    await hass.callService('climate', 'set_fan_mode', {
      entity_id: climateEntityId,
      fan_mode: 'on',
    });
  }
  const mm = String(minutes % 60).padStart(2, '0');
  const hh = String(Math.floor(minutes / 60)).padStart(2, '0');
  await hass.callService('timer', 'start', {
    entity_id: timerEntityId,
    duration: `${hh}:${mm}:00`,
  });
}

/**
 * Clamp a target setpoint to the entity's min/max ONLY when those bounds are
 * plausible for the current setpoint's unit. Real-world quirk this guards:
 * SmartThings mini-splits report min_temp/max_temp in Celsius (7/35) while
 * temperatures are Fahrenheit - naive clamping would slam 78°F down to 35.
 */
export function clampSetpoint(
  target: number,
  current: number | null,
  min: unknown,
  max: unknown,
): number {
  const lo = typeof min === 'number' ? min : null;
  const hi = typeof max === 'number' ? max : null;
  const boundsPlausible =
    lo != null && hi != null && lo < hi && current != null && current >= lo && current <= hi;
  if (!boundsPlausible) return target;
  return Math.min(hi, Math.max(lo, target));
}

export interface ScheduleConfig {
  id: string;
  name?: string;
  week: Record<string, unknown>;
}

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export async function fetchScheduleConfig(
  hass: HassLike,
  scheduleEntityId: string,
): Promise<ScheduleConfig | null> {
  if (!hass.callWS) return null;
  const objectId = scheduleEntityId.split('.')[1];
  try {
    const items = (await hass.callWS({ type: 'schedule/list' })) as Array<
      Record<string, unknown>
    >;
    const item = items.find((i) => i.id === objectId);
    if (!item) return null;
    const week: Record<string, unknown> = {};
    for (const d of DAY_KEYS) if (item[d]) week[d] = item[d];
    return { id: String(item.id), name: typeof item.name === 'string' ? item.name : undefined, week };
  } catch {
    return null;
  }
}

export function updateScheduleWeek(
  hass: HassLike,
  scheduleEntityId: string,
  week: Record<string, unknown>,
  name: string,
): Promise<unknown> {
  if (!hass.callWS) return Promise.reject(new Error('callWS unavailable'));
  const objectId = scheduleEntityId.split('.')[1];
  // schedule/update validates `name` as required - omitting it 400s.
  const payload: Record<string, unknown> = {
    type: 'schedule/update',
    schedule_id: objectId,
    name,
  };
  for (const d of DAY_KEYS) payload[d] = (week as Record<string, unknown>)[d] ?? [];
  return hass.callWS(payload);
}

export function setNumberHelper(
  hass: HassLike,
  entityId: string,
  value: number,
): Promise<unknown> {
  return hass.callService('input_number', 'set_value', { entity_id: entityId, value });
}

export function selectOption(
  hass: HassLike,
  entityId: string,
  option: string,
): Promise<unknown> {
  return hass.callService('input_select', 'select_option', { entity_id: entityId, option });
}

/**
 * Enable/disable a zone's scheduling. On ENABLE the applied-block marker is
 * cleared so the engine re-asserts the current block at the next trigger -
 * without this, a stale marker matching the current block name would leave the
 * external app's setpoints in place indefinitely.
 */
export async function setZoneEnabled(
  hass: HassLike,
  enableEntityId: string,
  markerEntityId: string,
  on: boolean,
): Promise<void> {
  // Clear the marker BEFORE enabling - the engine triggers instantly on the
  // enable edge, and clearing afterwards races it (stale marker = skipped
  // resume until the next tick).
  if (on) {
    try {
      await hass.callService('input_text', 'set_value', { entity_id: markerEntityId, value: '' });
    } catch {
      // A missing marker (partial provisioning) must not block the toggle
      // (QA-R C1-8); with no marker the engine treats the block as unapplied
      // and re-asserts anyway.
    }
  }
  await hass.callService('input_boolean', on ? 'turn_on' : 'turn_off', {
    entity_id: enableEntityId,
  });
}

export interface DailyRuntime {
  /** local midnight epoch ms for the day */
  day: number;
  hours: number;
}

/**
 * Daily runtime totals from long-term statistics of the history_stats sensor
 * (resets at midnight → the day's max IS the day's total). Today's live value
 * comes from the sensor state instead; LTS lags by up to an hour.
 */
export async function fetchDailyRuntime(
  hass: HassLike,
  runtimeSensorId: string,
  days: number,
): Promise<DailyRuntime[]> {
  if (!hass.callWS) return [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  try {
    const res = (await hass.callWS({
      type: 'recorder/statistics_during_period',
      start_time: start.toISOString(),
      statistic_ids: [runtimeSensorId],
      period: 'day',
      types: ['max'],
    })) as Record<string, Array<{ start: number; max?: number | null }>>;
    const rows = res?.[runtimeSensorId] ?? [];
    return rows
      .filter((r) => typeof r.max === 'number')
      .map((r) => ({ day: r.start, hours: r.max as number }));
  } catch {
    return [];
  }
}

import type { HistoryPoint } from './lib/segments';

interface WsHistoryRow {
  s?: string;
  lu?: number;
  a?: Record<string, unknown>;
}

/** Normalize a history/history_during_period row list to HistoryPoints. */
export function wsHistoryToPoints(
  rows: WsHistoryRow[],
  attribute?: string,
): HistoryPoint[] {
  const out: HistoryPoint[] = [];
  for (const r of rows) {
    if (typeof r.lu !== 'number') continue;
    const t = r.lu * 1000;
    if (attribute) {
      const v = r.a?.[attribute];
      if (v == null) continue;
      out.push({ t, state: String(v) });
    } else if (typeof r.s === 'string') {
      out.push({ t, state: r.s });
    }
  }
  return out;
}

/**
 * Raw history for one day. minimal (state-only) for binary sensors; full rows
 * (attributes) only when `attribute` is requested - the plan's history-volume
 * mitigation: attribute-bearing queries are per-tapped-day only.
 */
export async function fetchDayHistory(
  hass: HassLike,
  entityId: string,
  dayStart: number,
  dayEnd: number,
  attribute?: string,
): Promise<HistoryPoint[]> {
  if (!hass.callWS) return [];
  try {
    const res = (await hass.callWS({
      type: 'history/history_during_period',
      start_time: new Date(dayStart).toISOString(),
      end_time: new Date(dayEnd).toISOString(),
      entity_ids: [entityId],
      minimal_response: !attribute,
      no_attributes: !attribute,
      significant_changes_only: false,
    })) as Record<string, WsHistoryRow[]>;
    return wsHistoryToPoints(res?.[entityId] ?? [], attribute);
  } catch {
    return [];
  }
}

export function errorText(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (e && typeof e === 'object' && 'message' in e) return String((e as { message: unknown }).message);
  return JSON.stringify(e);
}

/** Clear the zone's applied-block marker and re-trigger the engine (Apply now). */
export async function applyScheduleNow(
  hass: HassLike,
  markerEntityId: string,
  engineAutomationEntityId: string,
): Promise<void> {
  await hass.callService('input_text', 'set_value', {
    entity_id: markerEntityId,
    value: '',
  });
  await hass.callService('automation', 'trigger', {
    entity_id: engineAutomationEntityId,
  });
}

export function setTemperature(
  hass: HassLike,
  entityId: string,
  temp: number,
): Promise<unknown> {
  return hass.callService('climate', 'set_temperature', {
    entity_id: entityId,
    temperature: temp,
  });
}
