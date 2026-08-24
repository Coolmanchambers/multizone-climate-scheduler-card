// Read-only registry snapshot for the provisioning dry-run (S5b).
// Runs in the browser with the user's session - same websocket commands the
// core helpers UI uses. NEVER writes.
import type { HassLike } from './ha-types';
import { parseEntityId } from './lib/naming';
import { parseSignature } from './lib/automation-payloads';
import type { ExistingObject, ObjectKind } from './lib/provisioning';
import { MZCS_LABEL } from './lib/provisioning';

interface ListItem {
  id?: string;
  name?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  [k: string]: unknown;
}

const KIND_BY_CLASS: Record<string, ObjectKind> = {
  fan_timer: 'helper',
  room_override_timer: 'helper',
  target_room_select: 'helper',
  applied_block_marker: 'helper',
  zone_enabled: 'helper',
  theme: 'helper',
  k_factor: 'helper',
  season_select: 'helper',
  season_mode: 'helper',
  season_confirm_days: 'helper',
  season_dwell_days: 'helper',
  dev_green_max: 'helper',
  dev_amber_max: 'helper',
  runtime_alert_margin: 'helper',
  runtime_alert_days: 'helper',
  runtime_learn_days: 'helper',
  cdd_base: 'helper',
  override_minutes: 'helper',
  steer_min_setpoint: 'helper',
  steer_max_setpoint: 'helper',
  steer_max_offset: 'helper',
  running_sensor: 'template_sensor',
  expected_runtime: 'template_sensor',
  next_block_sensor: 'template_sensor',
  outdoor_temp_sensor: 'template_sensor',
  outdoor_daily_mean: 'stats_sensor',
  runtime_today: 'stats_sensor',
  zone_schedule: 'schedule',
  sensor_schedule: 'schedule',
};

async function listDomain(hass: HassLike, domain: string): Promise<ListItem[]> {
  if (!hass.callWS) return [];
  try {
    const res = await hass.callWS({ type: `${domain}/list` });
    return Array.isArray(res) ? (res as ListItem[]) : [];
  } catch (e) {
    // A failed list must FAIL the snapshot, not degrade it: swallowing it
    // makes every managed item of this domain extract a state-fallback spec,
    // and the differ then plans spurious Updates off a wrong picture
    // (scan S13-D2). The wizard surfaces this as the dry-run error.
    throw new Error(`Could not read the ${domain} list from Home Assistant: ${e instanceof Error ? e.message : String(e)}`);
  }
}

async function labelsFor(hass: HassLike, entityIds: string[]): Promise<Map<string, string[]>> {
  const out = new Map<string, string[]>();
  if (!hass.callWS || entityIds.length === 0) return out;
  try {
    const res = (await hass.callWS({
      type: 'config/entity_registry/get_entries',
      entity_ids: entityIds,
    })) as Record<string, { labels?: string[] } | null>;
    for (const [id, entry] of Object.entries(res ?? {})) {
      if (entry?.labels) out.set(id, entry.labels);
    }
  } catch {
    // Label read unavailable → everything parse-matched reads as unmanaged (adopt-safe).
  }
  return out;
}

/**
 * Snapshot every entity that belongs to this card's naming contract.
 * managed = carries the mzcs label. Spec extraction is per-domain minimal:
 * exactly the keys buildDesired() emits, so specEqual() compares like-for-like.
 */
export async function fetchExisting(
  hass: HassLike,
  prefix: string,
  zones: string[],
  seasons: string[],
): Promise<ExistingObject[]> {
  const candidates: Array<{ id: string; kind: ObjectKind }> = [];
  for (const entityId of Object.keys(hass.states)) {
    const parsed = parseEntityId(entityId, prefix, zones, seasons);
    if (!parsed) continue;
    const kind = KIND_BY_CLASS[parsed.cls];
    if (kind) candidates.push({ id: entityId, kind });
  }
  // ORPHAN season schedules: a season removed from the config no longer parses
  // (the parser is given only current season keys), which would make its
  // schedule invisible and silently orphan it instead of planning the delete
  // (QA-R B1-6, hit live in QA-2). Any schedule under a known zone whose tail
  // is not a class suffix is claimed as a schedule candidate; the mzcs label
  // still decides whether it is managed (foreign schedules stay untouchable).
  const sortedZones = [...zones].sort((a, b) => b.length - a.length);
  for (const entityId of Object.keys(hass.states)) {
    if (!entityId.startsWith(`schedule.${prefix}_`)) continue;
    if (candidates.some((c) => c.id === entityId)) continue;
    const rest = entityId.slice(`schedule.${prefix}_`.length);
    for (const z of sortedZones) {
      if (!rest.startsWith(`${z}_`)) continue;
      const tail = rest.slice(z.length + 1);
      if (tail && tail !== 'sensor_schedule') candidates.push({ id: entityId, kind: 'schedule' });
      break;
    }
  }

  const [timers, selects, numbers, schedules, labels] = await Promise.all([
    listDomain(hass, 'timer'),
    listDomain(hass, 'input_select'),
    listDomain(hass, 'input_number'),
    listDomain(hass, 'schedule'),
    labelsFor(
      hass,
      candidates.map((c) => c.id),
    ),
  ]);
  const listByObjectId = (items: ListItem[], domain: string) => {
    const m = new Map<string, ListItem>();
    for (const it of items) if (it.id) m.set(`${domain}.${it.id}`, it);
    return m;
  };
  const configs = new Map<string, ListItem>([
    ...listByObjectId(timers, 'timer'),
    ...listByObjectId(selects, 'input_select'),
    ...listByObjectId(numbers, 'input_number'),
    ...listByObjectId(schedules, 'schedule'),
  ]);

  const out: ExistingObject[] = [];
  for (const c of candidates) {
    const cfg = configs.get(c.id);
    const st = hass.states[c.id];
    let spec: Record<string, unknown> = {};
    if (c.id.startsWith('input_number.') && cfg) {
      const unit = (cfg as { unit_of_measurement?: string }).unit_of_measurement;
      spec = { name: cfg.name, min: cfg.min, max: cfg.max, step: cfg.step, ...(unit != null ? { unit } : {}) };
    } else if (c.id.startsWith('input_select.') && cfg) {
      spec = { name: cfg.name, options: cfg.options };
    } else if (c.id.startsWith('timer.') && cfg) {
      spec = { name: cfg.name, restore: cfg.restore ?? false };
    } else if (c.id.startsWith('schedule.') && cfg) {
      // Name-only by design: live schedule BLOCKS are owned by the card's
      // schedule editor after provisioning; the wizard's week is a creation
      // seed (meta), so a re-run Apply never stomps user schedule edits.
      spec = { name: cfg.name };
    } else if (st) {
      spec = { name: st.attributes.friendly_name ?? c.id };
    }
    out.push({
      id: c.id,
      kind: c.kind,
      spec,
      managed: (labels.get(c.id) ?? []).includes(MZCS_LABEL),
    });
  }

  // Automations: match by the unique-id-bearing attributes.id on automation
  // entities. managed = carries the mzcs LABEL, same rule as every other kind -
  // an id that merely looks like ours must never make a foreign automation
  // delete-eligible (QA-R finding A2-4). The embedded [mzcs-sig:...] is read
  // from the stored config so the differ can detect stale generated content;
  // unreadable configs report an 'unknown' sig (plans an Update; the executor's
  // pristine check then decides).
  const autoIds: Array<{ cfgId: string; entityId: string; alias: string }> = [];
  for (const [entityId, st] of Object.entries(hass.states)) {
    if (!entityId.startsWith('automation.') || !st) continue;
    const cfgId = st.attributes.id;
    if (typeof cfgId === 'string' && cfgId.startsWith(`${prefix}_mzcs_`)) {
      autoIds.push({ cfgId, entityId, alias: String(st.attributes.friendly_name ?? cfgId) });
    }
  }
  const [sigs, autoLabels] = await Promise.all([
    Promise.all(
      autoIds.map(async ({ cfgId }) => {
        if (!hass.callApi) return 'unknown';
        try {
          const cfg = (await hass.callApi('GET', `config/automation/config/${cfgId}`)) as Record<string, unknown>;
          return parseSignature(cfg?.description) ?? 'unknown';
        } catch {
          return 'unknown';
        }
      }),
    ),
    labelsFor(
      hass,
      autoIds.map((a) => a.entityId),
    ),
  ]);
  autoIds.forEach(({ cfgId, entityId, alias }, i) => {
    out.push({
      id: `automation:${cfgId}`,
      kind: 'automation',
      spec: { alias, sig: sigs[i]! },
      managed: (autoLabels.get(entityId) ?? []).includes(MZCS_LABEL),
    });
  });
  return out;
}
