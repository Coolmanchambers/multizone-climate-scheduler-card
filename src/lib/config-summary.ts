// The gear panel's read-only Config tab (backlog item 48): everything that
// lives in the CARD EDITOR, shown where users actually look for it, with its
// current RESOLVED value. Pure and Lit-free so node tests can pin it.
//
// THE STANDING RULE (maintainer, 2026-08-31): every setting the card editor
// writes MUST appear here. When you add a config option, add its row in the
// same change - `tests/config-summary.test.ts` fails if an editor-written key
// stops influencing this summary, and docs/config-compatibility.md's checklist
// carries the step. This tab is READ-ONLY by design: editing stays in the card
// editor, the one place that owns the dashboard-stored configuration.

import type { MzcsCardConfig } from '../types';
import {
  normalizeCardConfig,
  normalizeRoomSensors,
  resolveEcoPreset,
  resolveOffPeak,
  resolveDisplay,
  DEFAULT_AGEING_MINUTES,
  DEFAULT_STALE_HOURS,
} from '../types';
import { defaultSeasons } from './provisioning';

export interface SummaryRow {
  label: string;
  value: string;
  /** Secondary line (entity ids, companions) - rendered smaller. */
  detail?: string;
}

export interface SummaryGroup {
  key: 'zones' | 'seasons' | 'features' | 'display';
  label: string;
  rows: SummaryRow[];
}

const onOff = (v: boolean): string => (v ? 'On' : 'Off');

/**
 * Build the Config tab's content from a RAW card config, through the same
 * normalization boundary the card runs on (the item-40 rule: two screens
 * describing one install must never disagree). Defaults are labeled as
 * defaults so a user can tell "I set this" from "the card assumes this".
 */
export function configSummary(raw: MzcsCardConfig): SummaryGroup[] {
  let config: MzcsCardConfig;
  try {
    config = normalizeCardConfig(raw);
  } catch {
    // A refused config still deserves a truthful screen; show the raw shape.
    config = raw;
  }

  const zones: SummaryRow[] = (config.zones ?? []).map((z) => {
    const sensors = normalizeRoomSensors(z.room_sensors);
    const rooms =
      sensors.length === 0
        ? 'no room sensors'
        : sensors
            .map((rs) => `${rs.name ?? rs.entity}${rs.last_seen ? ' (last-seen ✓)' : ''}`)
            .join(', ');
    // Trimmed like provisionInputFromConfig resolves it: a whitespace-only
    // value provisions NOTHING, so showing it would be the screen lying about
    // behavior (QA 0.7.7, the item-40 class).
    const power = typeof z.power_entity === 'string' ? z.power_entity.trim() : '';
    return {
      label: z.name,
      value: z.entity,
      detail: `${rooms}${power ? ` · power: ${power}` : ''}`,
    };
  });

  // An absent seasons block MEANS Summer+Winter (provisionInputFromConfig
  // applies defaultSeasons) - showing nothing here would be the screen lying
  // about behavior, the exact item-40 class this tab exists to prevent.
  const seasonList = config.seasons ?? defaultSeasons();
  const seasonsDefaulted = config.seasons === undefined;
  const seasons: SummaryRow[] = seasonList.map((s) => ({
    label: `${s.name || '(unnamed)'}${seasonsDefaulted ? ' (default)' : ''}`,
    value: s.default_mode,
    detail: `key: ${String(s.key)}`,
  }));
  seasons.push({
    label: 'Season switching',
    value: config.season_switch ?? 'manual',
    detail: 'Only Manual does anything today; the auto modes are the planned recommender.',
  });

  const f = config.features ?? {};
  const eco = resolveEcoPreset(f);
  const offPeak = resolveOffPeak(f);
  const features: SummaryRow[] = [
    {
      // Absent means ON with the historical three presets; only an explicitly
      // EMPTY list means off (the documented, easy-to-invert distinction).
      label: 'Fan timer presets',
      value:
        f.fan_timer === undefined
          ? '15 / 30 / 60 min (default)'
          : f.fan_timer.length > 0
            ? `${f.fan_timer.join(' / ')} min`
            : 'Off',
    },
    { label: 'Runtime anomaly alerts', value: onOff(f.anomaly_alerts ?? true) },
    {
      label: 'Fan guard helper',
      value: f.fan_guard ?? 'none',
    },
    {
      label: 'Standby preset stand-down',
      value: eco === null ? 'Off - HA owns standby' : `'${eco}'${f.eco_preset === undefined ? ' (default)' : ''}`,
    },
    {
      label: 'Off-peak comfort',
      value: offPeak ? offPeak.entity : 'Off',
      ...(offPeak
        ? { detail: `offset seed ${offPeak.offsetSeed}° - the LIVE offset is on the Tuning tab` }
        : {}),
    },
    { label: 'Comfort steering', value: onOff(f.steering === true) },
  ];

  const d = resolveDisplay(config.display);
  const display: SummaryRow[] = [
    { label: 'Last-seen age on room rows', value: d.lastSeen },
    {
      label: 'Ageing threshold',
      value: `${d.ageingMs / 60_000} min${d.ageingMs === DEFAULT_AGEING_MINUTES * 60_000 && config.display?.ageing_minutes === undefined ? ' (default)' : ''}`,
    },
    {
      label: 'Stale after',
      value: `${d.staleMs / 3_600_000} h${d.staleMs === DEFAULT_STALE_HOURS * 3_600_000 && config.display?.stale_hours === undefined ? ' (default)' : ''}`,
    },
    { label: 'Entity prefix', value: config.prefix ?? 'climate' },
    { label: 'Weather entity', value: config.weather_entity ?? 'none - outdoor tracking and learning off' },
  ];

  return [
    { key: 'zones', label: 'Zones & Rooms', rows: zones },
    { key: 'seasons', label: 'Seasons', rows: seasons },
    { key: 'features', label: 'Features', rows: features },
    { key: 'display', label: 'Display & Advanced', rows: display },
  ];
}
