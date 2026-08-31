// Item 36 - room sensor "last seen" companion. Pure helpers shared by the card
// (age display) and the editor (suggestion + bulk find). Lit-free so every
// decision here is unit-testable in a node environment.

import type { HassLike } from '../ha-types';
import type { LastSeenMode, RoomSensorConfig, ZoneConfig } from '../types';
import { normalizeRoomSensors, tidyRoomSensorRow } from '../types';

/**
 * Compact single-unit age for the room rows. Single unit on purpose: at the
 * 300px wall-panel width the age, the deviation badge and the reading all
 * compete for the row, and "2h 5m" buys precision nobody reads at the cost of
 * the room name (item 31). Under a minute reads "now" - a device that just
 * spoke is not aging.
 */
export function formatAge(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '';
  const s = Math.floor(ms / 1000);
  if (s < 60) return 'now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

/**
 * Whether a row's age label renders. `ageMs === undefined` means no usable
 * companion - never show anything, whatever the mode says (item 36
 * non-negotiable 1: no companion is a first-class state).
 */
export function ageVisible(mode: LastSeenMode, ageMs: number | undefined, ageingMs: number): boolean {
  if (ageMs === undefined || mode === 'off') return false;
  if (mode === 'always') return true;
  return ageMs >= ageingMs;
}

/** Whether an age has crossed the ageing threshold (drives the amber styling). */
export function ageing(ageMs: number | undefined, ageingMs: number): boolean {
  return ageMs !== undefined && ageMs >= ageingMs;
}

/**
 * The naming-convention candidate for a temperature entity: the Zigbee2MQTT
 * sibling pattern `<base>_temperature` -> `<base>_last_seen`. Convention drives
 * the SUGGESTION only - the config field accepts any timestamp entity.
 */
export function lastSeenCandidateId(tempEntityId: string): string | null {
  if (!/_temperature$/.test(tempEntityId)) return null;
  return tempEntityId.replace(/_temperature$/, '_last_seen');
}

/**
 * A candidate worth offering: exists, is a timestamp entity, and is currently
 * usable - a dead entity is not a better source (non-negotiable 6). Returns
 * the entity id to offer, or null to offer nothing.
 */
export function lastSeenSuggestion(hass: HassLike, tempEntityId: string): string | null {
  const candidate = lastSeenCandidateId(tempEntityId);
  if (!candidate) return null;
  const e = hass.states[candidate];
  if (!e) return null;
  if (e.attributes.device_class !== 'timestamp') return null;
  if (e.state === 'unavailable' || e.state === 'unknown' || !e.state) return null;
  return candidate;
}

export interface BulkLastSeenRow {
  zoneIndex: number;
  sensorEntity: string;
  lastSeen: string;
}

/**
 * Everything the bulk "find last-seen entities" action WOULD write, for the
 * preview-before-write step. Skips sensors that already carry a value and any
 * entity in `exclude` (the editor session's deliberately-cleared set, so "no"
 * sticks - non-negotiable 5).
 */
export function planBulkLastSeen(
  zones: ZoneConfig[],
  hass: HassLike,
  exclude: ReadonlySet<string> = new Set(),
): BulkLastSeenRow[] {
  const out: BulkLastSeenRow[] = [];
  zones.forEach((z, zoneIndex) => {
    for (const rs of normalizeRoomSensors(z.room_sensors)) {
      if (rs.last_seen) continue;
      if (exclude.has(rs.entity)) continue;
      const suggestion = lastSeenSuggestion(hass, rs.entity);
      if (suggestion) out.push({ zoneIndex, sensorEntity: rs.entity, lastSeen: suggestion });
    }
  });
  return out;
}

/**
 * The bulk APPLY step. Never replays the preview verbatim: it re-plans against
 * the CURRENT zones and applies only the (sensor, companion) pairs that were
 * previewed. A row the user filled by hand or cleared while the preview sat
 * open drops out (skip-filled and skip-cleared are re-enforced at write time -
 * "no" sticks, item 36 non-negotiable 5), and zone membership is re-derived so
 * a config edited underneath a stale preview cannot be written by index.
 * QA-confirmed 2x that replaying the stored preview violated all three.
 */
export function applyBulkLastSeen(
  zones: ZoneConfig[],
  preview: readonly BulkLastSeenRow[],
  hass: HassLike,
  exclude: ReadonlySet<string> = new Set(),
): ZoneConfig[] {
  const previewed = new Set(preview.map((r) => `${r.sensorEntity}|${r.lastSeen}`));
  const rows = planBulkLastSeen(zones, hass, exclude).filter((r) =>
    previewed.has(`${r.sensorEntity}|${r.lastSeen}`),
  );
  if (rows.length === 0) return zones;
  return zones.map((z, zoneIndex) => {
    const mine = rows.filter((r) => r.zoneIndex === zoneIndex);
    if (mine.length === 0) return z;
    let sensors = z.room_sensors;
    for (const r of mine) sensors = withLastSeen(sensors, r.sensorEntity, r.lastSeen);
    return { ...z, room_sensors: sensors };
  });
}

/**
 * Apply one companion assignment to a zone's room_sensors list, preserving
 * every other row exactly (string rows stay strings). `lastSeen: null` clears.
 */
export function withLastSeen(
  sensors: Array<string | RoomSensorConfig> | undefined,
  sensorEntity: string,
  lastSeen: string | null,
): Array<string | RoomSensorConfig> {
  return (sensors ?? []).map((row) => {
    // Junk rows (a bare `-` in hand-written YAML parses to null) are the
    // normalizer's problem; an editor gesture must never throw on them
    // (QA-executed: this threw a TypeError before the guard).
    if (row == null || (typeof row !== 'string' && typeof row.entity !== 'string')) return row;
    const rs = typeof row === 'string' ? { entity: row } : row;
    if (rs.entity !== sensorEntity) return row;
    return tidyRoomSensorRow({ ...rs, last_seen: lastSeen ?? undefined });
  });
}
