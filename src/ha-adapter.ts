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
 *
 * Staleness is measured from `last_reported`, which advances on every report
 * even when the value is unchanged. `last_updated` only moves when the value
 * changes, so using it would flag a healthy but steady sensor as stale. Cores
 * without `last_reported` fall back to `last_updated` - a heuristic that can
 * over-report staleness on coarse sensors, so it is only used when the better
 * field is missing.
 */
export const ROOM_STALE_MS = 3 * 60 * 60 * 1000;

/**
 * A server-side "now" for staleness: the newest report timestamp across the
 * given entities. Comparing HA timestamps against the BROWSER clock would let a
 * drifted wall tablet mark every sensor stale (or hide a dead one); comparing
 * them against HA's own freshest report is drift-immune. Falls back to the
 * browser clock when nothing carries a timestamp.
 */
export function reportReference(hass: HassLike, entityIds: string[]): number {
  let newest = 0;
  for (const id of entityIds) {
    const e = hass.states[id];
    const raw = e?.last_reported ?? e?.last_updated;
    const t = raw ? Date.parse(raw) : NaN;
    if (Number.isFinite(t) && t > newest) newest = t;
  }
  return newest > 0 ? newest : Date.now();
}

export function roomReading(hass: HassLike, entityId: string, now = Date.now()): RoomReading {
  const e = hass.states[entityId];
  const name =
    typeof e?.attributes.friendly_name === 'string'
      ? e.attributes.friendly_name.replace(/ (Temperature|temperature)$/, '')
      : entityId.split('.')[1] ?? entityId;
  const v = e ? Number(e.state) : NaN;
  const reported = e?.last_reported ?? e?.last_updated;
  const ts = reported ? Date.parse(reported) : NaN;
  // A future timestamp means clock disagreement, never staleness.
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

/**
 * A recorder read that either succeeded (possibly with nothing in it) or did
 * not happen at all.
 *
 * These used to return a bare array, so a failed query and a genuinely empty
 * history were the same value - and the card rendered both as "History accrues
 * daily...", telling the user to wait for data that was never coming. Empty and
 * broken are different facts and the caller has to be able to tell them apart.
 */
export type RecorderResult<T> = { ok: true; rows: T[] } | { ok: false; error: string };

import { dailyRuntimeFromHistory, type DailyRuntimeDay, type HistoryPoint } from './lib/segments';

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
): Promise<RecorderResult<HistoryPoint>> {
  if (!hass.callWS) {
    return { ok: false, error: 'This Home Assistant connection cannot read history.' };
  }
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
    return { ok: true, rows: wsHistoryToPoints(res?.[entityId] ?? [], attribute) };
  } catch (e) {
    return { ok: false, error: errorText(e) };
  }
}

/**
 * Daily runtime for the last `days` days, summed from the running sensor's raw
 * recorder history.
 *
 * This REPLACES a long-term-statistics query that could never return rows: the
 * runtime sensors are created through HA's history_stats config flow, that flow
 * exposes no `state_class` field, and HA only generates long-term statistics
 * for sensors that declare one. The statistics existed on no install, ever, so
 * the multi-day views sat on their empty state permanently - the live bug
 * behind 0.7.2. Raw history is bounded by the recorder's purge window (10 days
 * by default), which is why every returned day carries its coverage.
 */
export async function fetchDailyRuntimeFromHistory(
  hass: HassLike,
  runningSensorId: string,
  days: number,
): Promise<RecorderResult<DailyRuntimeDay>> {
  if (!hass.callWS) {
    return { ok: false, error: 'This Home Assistant connection cannot read history.' };
  }
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  try {
    const res = (await hass.callWS({
      type: 'history/history_during_period',
      start_time: start.toISOString(),
      end_time: new Date().toISOString(),
      entity_ids: [runningSensorId],
      minimal_response: true,
      no_attributes: true,
      significant_changes_only: false,
    })) as Record<string, WsHistoryRow[]>;
    const points = wsHistoryToPoints(res?.[runningSensorId] ?? []);
    return { ok: true, rows: dailyRuntimeFromHistory(points, days, Date.now()) };
  } catch (e) {
    return { ok: false, error: errorText(e) };
  }
}

/**
 * Home Assistant rejects a websocket command with whatever it likes: an Error,
 * an object carrying `message` or `code`, or - when a sleeping tablet drops its
 * socket - a bare numeric code. The old fallback was `JSON.stringify`, which
 * returns the VALUE `undefined` for `undefined` input despite this function's
 * `: string` type. A falsy "error" then read as "no error", and a failed history
 * read rendered as "no data yet" - the defect the failure path exists to
 * prevent. Every branch here returns a non-empty, readable string (QA R5).
 */
export function errorText(e: unknown): string {
  try {
    return errorTextInner(e);
  } catch {
    // This runs inside catch blocks; if IT throws, the rejection escapes and
    // the caller's failure handling never runs. A hostile object (a throwing
    // getter, a Proxy) must degrade, not propagate.
    return 'Home Assistant gave no reason.';
  }
}

function errorTextInner(e: unknown): string {
  if (e instanceof Error && e.message) return e.message;
  if (e && typeof e === 'object') {
    const o = e as { message?: unknown; code?: unknown };
    if (typeof o.message === 'string' && o.message) return o.message;
    if (o.message != null && String(o.message)) return String(o.message);
    if (o.code != null) return describeCode(o.code);
  }
  if (typeof e === 'number' || typeof e === 'string') {
    const asText = String(e);
    if (asText) return describeCode(e);
  }
  return 'Home Assistant gave no reason.';
}

/**
 * HA's own numeric/string websocket codes mean nothing to a user, and printing
 * a bare "3" reads like a bug in the card rather than a dropped connection.
 */
function describeCode(code: unknown): string {
  const raw = String(code);
  if (/connection|closed|lost|3/i.test(raw)) {
    return `The connection to Home Assistant dropped (${raw}).`;
  }
  return `Home Assistant reported error ${raw}.`;
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

/* ------------------------------------------------------------------ *
 * Competing-writer scan (backlog item 33)
 * ------------------------------------------------------------------ */

import {
  isOwnAutomation,
  summarizeScan,
  type ScanResult,
  type WriterSource,
  type ZoneRef,
} from './lib/competing-writers';

/**
 * Upper bound on configs fetched in one scan. Not a performance tuning knob: a
 * pathological instance must degrade honestly (the result says coverage was
 * capped) rather than hang the browser mid-setup.
 */
export const WRITER_SCAN_CAP = 500;

/** Parallel REST reads. High enough to stay quick, low enough not to flood the session. */
const WRITER_SCAN_CONCURRENCY = 6;

interface RegistryEntry {
  /** the registry uuid - modern device actions target entities BY this (QA S1) */
  id?: string;
  area_id?: string | null;
  device_id?: string | null;
  labels?: string[];
}

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const worker = async (): Promise<void> => {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      out[i] = await fn(items[i]!);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

/**
 * Registry rows for specific entities: the area, device and labels the card
 * needs to answer "does this target reach a managed zone?".
 *
 * Unlike the label read in registry-read.ts, a failure here is FATAL to its
 * caller and must not be swallowed. Without labels the scan cannot recognise
 * this card's own automations, and it would then report the engine's own
 * setpoint writes as conflicts - a scan that cries wolf about itself.
 */
async function fetchRegistryEntries(
  hass: HassLike,
  entityIds: string[],
): Promise<Map<string, RegistryEntry>> {
  const out = new Map<string, RegistryEntry>();
  if (entityIds.length === 0) return out;
  if (!hass.callWS) {
    // Returning an empty map here contradicted this function's own contract
    // and made the scan accuse the card's OWN engine (QA P4): with no labels,
    // isOwnAutomation fails for every own automation and their setpoint writes
    // are reported as conflicts the user is told to turn off.
    throw new Error(
      'This Home Assistant connection cannot read the entity registry, so the conflict check could not run.',
    );
  }
  const res = (await hass.callWS({
    type: 'config/entity_registry/get_entries',
    entity_ids: entityIds,
  })) as Record<string, RegistryEntry | null>;
  for (const [id, entry] of Object.entries(res ?? {})) if (entry) out.set(id, entry);
  return out;
}

/**
 * Zone rows for the matcher. An entity's effective area is its own when it has
 * one and its device's otherwise - the same rule the Home Assistant frontend
 * applies. Without the device fallback, an automation targeting the area a
 * thermostat sits in would not match, and the user would be told they are clear.
 */
async function fetchZoneRefs(
  hass: HassLike,
  zones: Array<{ entity: string; name: string }>,
  entries: Map<string, RegistryEntry>,
): Promise<{ refs: ZoneRef[]; degraded: boolean }> {
  const needDeviceArea = zones.some((z) => {
    const e = entries.get(z.entity);
    return !!e && !e.area_id && !!e.device_id;
  });
  let degraded = false;
  let deviceAreas = new Map<string, string | null>();
  if (needDeviceArea && hass.callWS) {
    try {
      const devices = (await hass.callWS({ type: 'config/device_registry/list' })) as Array<{
        id?: string;
        area_id?: string | null;
      }>;
      for (const d of devices ?? []) if (d?.id) deviceAreas.set(d.id, d.area_id ?? null);
    } catch {
      // Area inheritance is a widening of the match, so losing it cannot create
      // a false alarm - but lost coverage IS the false-all-clear direction, so
      // it is DISCLOSED via the degraded flag, never silent (QA P5).
      deviceAreas = new Map();
      degraded = true;
    }
  }
  const refs = zones.map((z) => {
    const e = entries.get(z.entity);
    const areaId = e?.area_id ?? (e?.device_id ? deviceAreas.get(e.device_id) ?? null : null);
    return {
      entityId: z.entity,
      name: z.name,
      areaId,
      deviceId: e?.device_id ?? null,
      registryId: e?.id ?? null,
      labels: e?.labels ?? [],
    };
  });
  return { refs, degraded };
}

interface Candidate {
  entityId: string;
  name: string;
  kind: 'automation' | 'script';
  /** REST path for the stored config, or null when there is nothing to fetch */
  path: string | null;
}

/**
 * Scan every automation and script in the instance for anything that writes to
 * a managed zone's thermostat.
 *
 * A full sweep, deliberately, rather than a `search/related` prefilter. The
 * prefilter is faster but its failure mode is a FALSE ALL-CLEAR - it is
 * unverified on this project, and whether it expands area targets in the needed
 * direction is unknown. A slow correct answer beats a fast one that might tell a
 * user their thermostats are uncontested when they are not.
 *
 * Read-only. Never called from the render path.
 */
export async function scanCompetingWriters(
  hass: HassLike,
  prefix: string,
  ownLabel: string,
  zones: Array<{ entity: string; name: string }>,
): Promise<ScanResult> {
  if (!hass.callApi) {
    throw new Error(
      'This Home Assistant connection cannot read automation configurations, so the conflict check could not run.',
    );
  }
  const candidates: Candidate[] = [];
  const automationConfigIds = new Map<string, unknown>();
  for (const entityId in hass.states) {
    const st = hass.states[entityId];
    if (!st) continue;
    const name = String(st.attributes.friendly_name ?? entityId);
    if (entityId.startsWith('automation.')) {
      const cfgId = st.attributes.id;
      automationConfigIds.set(entityId, cfgId);
      candidates.push({
        entityId,
        name,
        kind: 'automation',
        // A YAML automation with no id has no config API entry at all. It is
        // counted as unreadable rather than quietly treated as clean.
        path: typeof cfgId === 'string' && cfgId ? `config/automation/config/${cfgId}` : null,
      });
    } else if (entityId.startsWith('script.')) {
      const objectId = entityId.slice('script.'.length);
      candidates.push({
        entityId,
        name,
        kind: 'script',
        path: objectId ? `config/script/config/${objectId}` : null,
      });
    }
  }

  const entries = await fetchRegistryEntries(hass, [
    ...zones.map((z) => z.entity),
    ...candidates.filter((c) => c.kind === 'automation').map((c) => c.entityId),
  ]);
  const { refs: zoneRefs, degraded } = await fetchZoneRefs(hass, zones, entries);

  let skippedOwn = 0;
  const mine: Candidate[] = [];
  for (const c of candidates) {
    if (
      c.kind === 'automation' &&
      isOwnAutomation(
        automationConfigIds.get(c.entityId),
        entries.get(c.entityId)?.labels ?? [],
        prefix,
        ownLabel,
      )
    ) {
      skippedOwn++;
      continue;
    }
    mine.push(c);
  }

  const capped = mine.length > WRITER_SCAN_CAP;
  const scanning = capped ? mine.slice(0, WRITER_SCAN_CAP) : mine;

  let unreadable = 0;
  const fetched = await mapLimit(scanning, WRITER_SCAN_CONCURRENCY, async (c) => {
    if (!c.path) return null;
    try {
      const config = await hass.callApi!('GET', c.path);
      const state = hass.states[c.entityId]?.state;
      // Off AUTOMATIONS stay findings - one toggle re-arms them - but the row
      // says "currently off" so the disable-then-rescan workflow is honest
      // about why the row is still there (QA P3). Scripts are exempt: a
      // script's state is 'off' whenever it is merely idle, not disabled, so
      // deriving enabled from it would mark every script "currently off".
      const enabled =
        c.kind === 'automation' ? (state === 'on' ? true : state === 'off' ? false : undefined) : undefined;
      return { id: c.entityId, name: c.name, kind: c.kind, enabled, config } as WriterSource;
    } catch {
      return null;
    }
  });
  const sources: WriterSource[] = [];
  for (const f of fetched) {
    if (f) sources.push(f);
    else unreadable++;
  }

  return summarizeScan(sources, zoneRefs, { unreadable, skippedOwn, capped, degraded });
}
