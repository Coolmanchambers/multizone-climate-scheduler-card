import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CARD_TYPE, CARD_NAME, CARD_VERSION, EDITOR_TYPE } from './const';
import { buildDiagnostics } from './lib/diagnostics';
import type { MzcsCardConfig, ZoneConfig } from './types';
import { resolveEcoPreset, resolveOffPeak, normalizeRoomSensors, normalizeCardConfig, resolveDisplay } from './types';
import { formatAge, ageVisible, ageing } from './lib/last-seen';
import type { HassLike } from './ha-types';
import { execContextFor } from './provision-exec';
import { planIdShape } from './lib/provisioning';
import {
  climateSummary,
  fanTimerActive,
  setTemperature,
  entityExists,
  hvacModes,
  ecoSupported,
  ecoActive,
  numberHelperValue,
  roomReading,
  reportReference,
  setHvacMode,
  setEco,
  startFanTimer,
  clampSetpoint,
  fetchScheduleConfig,
  updateScheduleWeek,
  applyScheduleNow,
  errorText,
  type RecorderResult,
  setNumberHelper,
  selectOption,
  setZoneEnabled,
  fetchDailyRuntimeFromHistory,
  fetchDayHistory,
  scanCompetingWriters,
} from './ha-adapter';
import type { Finding, ScanResult } from './lib/competing-writers';
import {
  formatHoursQuarter,
  extractRunSegments,
  extractSetpointChanges,
  segmentToPct,
  type Segment,
  type SetpointChange,
  type DailyRuntimeDay,
} from './lib/segments';
import { computeVerdict } from './lib/verdict';
import {
  resolveTheme,
  serializeCustomTheme,
  customSeedFrom,
  THEME_PRESETS,
  type ThemeTokens,
} from './lib/theme';

const THEME_VAR_MAP: Array<[keyof ThemeTokens, string]> = [
  ['accent', '--mzcs-accent'],
  ['accentBright', '--mzcs-accent-bright'],
  ['good', '--mzcs-good'],
  ['warn', '--mzcs-warn'],
  ['bad', '--mzcs-bad'],
  ['bg', '--mzcs-bg'],
  ['surface', '--mzcs-surface'],
  ['chip', '--mzcs-chip'],
  ['track', '--mzcs-track'],
  ['border', '--mzcs-border'],
  ['text', '--mzcs-text'],
  ['textDim', '--mzcs-text-dim'],
];

const CUSTOM_COLOR_LABELS: Array<{ key: keyof ThemeTokens; label: string }> = [
  { key: 'bg', label: 'Card background' },
  { key: 'surface', label: 'Panels (hero / rows)' },
  { key: 'chip', label: 'Buttons and chips' },
  { key: 'track', label: 'Tracks and wells' },
  { key: 'border', label: 'Borders' },
  { key: 'text', label: 'Text' },
  { key: 'textDim', label: 'Muted text' },
  { key: 'accent', label: 'Accent (cooling / active)' },
  { key: 'accentBright', label: 'Accent bright (today / highlights)' },
  { key: 'good', label: 'Good (eco / normal)' },
  { key: 'warn', label: 'Warn (heat / season / high)' },
  { key: 'bad', label: 'Alert (out of range)' },
];
import type { GlobalClass, ZoneClass } from './lib/naming';

// Only tunables something actually CONSUMES are shown. The provisioned
// alert-days and season confirm/dwell helpers are reserved for the post-v1
// consecutive-days alert and season recommender - dead controls would imply
// behavior that does not exist yet (scan S13-conformance 1/2).
type SetupTab = 'zones' | 'tuning' | 'objects' | 'setup' | 'config' | 'appearance' | 'danger';
type DayDetail = { segs: Segment[]; bubs: SetpointChange[]; start: number; end: number };
type ObjectStatus = 'managed' | 'missing' | 'customized' | 'unmanaged' | 'extra';
interface ObjectRow {
  id: string;
  kind: string;
  name: string;
  status: ObjectStatus;
}

/** True when no zone enable-helper exists yet (nothing provisioned to manage). */
function zonesEmptyGuard(hass: HassLike, prefix: string, zones: Array<{ name: string }>): boolean {
  return !zones.some((z) => z.name && entityExists(hass, zoneEntityId('zone_enabled', prefix, slugify(z.name))));
}

/** Per-zone entity classes the card renders from (see _watchedEntities).
 * The three steering classes (item 8) exist only on steering installs; on
 * every other install the ids never exist and cost the gate nothing. */
const ZONE_WATCH: ZoneClass[] = [
  'fan_timer',
  'running_sensor',
  'runtime_today',
  'expected_runtime',
  'applied_block_marker',
  'zone_enabled',
  'room_override_timer',
  'target_room_select',
  'steer_target',
  'sensor_schedule',
];
/** Global entity classes the card renders from, beyond MANAGE_TUNABLES.
 * off_peak_paused_on: the chip and adjusted next-block line read it (item 7);
 * on installs without the feature the id simply never exists, which the
 * reference-equality gate handles for free. */
const GLOBAL_WATCH: GlobalClass[] = ['season_select', 'theme', 'off_peak_paused_on'];

const MANAGE_TUNABLES: Array<{ cls: GlobalClass; label: string }> = [
  { cls: 'dev_green_max', label: 'Room deviation · green up to (°)' },
  { cls: 'dev_amber_max', label: 'Room deviation · amber up to (°)' },
  { cls: 'runtime_alert_margin', label: 'Runtime alert margin (%)' },
  { cls: 'runtime_learn_days', label: 'Runtime learn window (days)' },
  { cls: 'cdd_base', label: 'Cooling degree-day base (°)' },
  // Provisioned only when features.off_peak_entity is set; the entityExists
  // filter hides the row everywhere else (item 7).
  { cls: 'off_peak_offset', label: 'Off-peak comfort offset (°)' },
  // Steering tunables (item 8) - provisioned only under features.steering,
  // hidden everywhere else by the same filter. override_minutes on the Tuning
  // tab is the spec's explicit ask.
  { cls: 'override_minutes', label: 'Steering override duration (min)' },
  { cls: 'steer_min_setpoint', label: 'Steering lowest setpoint (°)' },
  { cls: 'steer_max_setpoint', label: 'Steering highest setpoint (°)' },
  { cls: 'steer_max_offset', label: 'Steering max offset from block (°)' },
];
import {
  detectSets,
  draftsChangeWeek,
  rangesToDayBlocks,
  nextBlockAfter,
  replaceSetBlocks,
  stripSegments,
  stripSegmentsFromRanges,
  weekHasGaps,
  timeToMin,
  minToTime,
  type Week,
  type DetectedSets,
} from './lib/schedule-view';
import { transitionSets, daysForSet, ALL_DAYS } from './lib/schedule-ranges';
import type { DayKey, TimeRange, ScheduleBlock } from './lib/schedule-ranges';
import type { DayGranularity } from './types';

/** SE2 strip color: cool blue → warm amber in RGB (no green detour). */
function tempColor(t: number, lo: number, hi: number): string {
  const k = hi > lo ? Math.max(0, Math.min(1, (t - lo) / (hi - lo))) : 0.5;
  const a = [41, 121, 230], b = [226, 122, 49];
  return `rgb(${a.map((v, i) => Math.round(v + (b[i]! - v) * k)).join(',')})`;
}

function fmtTime(t: string): string {
  const [hRaw, m] = t.split(':');
  let h = Number(hRaw);
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 === 0 ? 12 : h % 12;
  return `${h}:${m} ${ap}`;
}

const SET_LABELS: Record<string, string> = {
  all: 'Every day',
  wd: 'Weekdays',
  we: 'Weekend',
};
import { slugify, zoneEntityId, globalEntityId, zoneScheduleId, automationEntityId, resolveSeasonKey } from './lib/naming';
import { deviationColor, formatDelta, formatRoomTemp, sanitizeThresholds } from './lib/deviation';
import {
  buildDesired,
  plan,
  actionable,
  provisionInputFromConfig,
  defaultSeasons,
  steeringRooms,
  MZCS_LABEL,
  type Plan,
  type ProvisionInput,
} from './lib/provisioning';
import { defaultSchedules } from './lib/default-schedules';
import { configSummary, type SummaryGroup } from './lib/config-summary';
import { fetchExisting } from './registry-read';
import { executePlan, type ExecResult } from './provision-exec';

const MODE_LABELS: Record<string, string> = {
  heat: 'Heat',
  cool: 'Cool',
  heat_cool: 'Heat·Cool',
  off: 'Off',
  auto: 'Auto',
  dry: 'Dry',
  fan_only: 'Fan only',
};

/**
 * Chip label for a mode outside MODE_LABELS. Brands expose vendor modes
 * (`energy_saver`, `whole_home_dehumidify`); the raw id rendered as-is reads
 * as a bug (item 35, measured in the harness). The SERVICE CALL always sends
 * the raw mode - this only shapes the label.
 */
function modeLabel(m: string): string {
  const known = MODE_LABELS[m];
  if (known) return known;
  const words = m.replace(/_/g, ' ').trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : m;
}

/* eslint-disable no-console */
console.info(`%c ${CARD_NAME} %c v${CARD_VERSION}`, 'background:var(--mzcs-accent);color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;', 'background:#243039;color:#fff;padding:2px 6px;border-radius:0 4px 4px 0;');

@customElement(CARD_TYPE)
export class MzcsCard extends LitElement {
  @property({ attribute: false }) public hass?: HassLike;
  @state() private _config?: MzcsCardConfig;
  @state() private _zoneIndex = 0;
  @state() private _ctrlOpen = false;
  @state() private _setupOpen = false;
  @state() private _schedOpen = false;
  @state() private _schedWeek?: Week;
  private _schedName = '';
  @state() private _schedError?: string;
  @state() private _schedBusy = false;
  @state() private _schedSel?: { setKey: string; idx: number };
  @state() private _schedDrafts = new Map<string, ScheduleBlock[]>();
  /** Set keys the user genuinely edited (not merely produced by a clone). */
  private _schedEdited = new Set<string>();
  @state() private _schedNotice?: string;
  /** pending day-granularity change (draft; applied on Save) */
  @state() private _schedGran?: DayGranularity;
  @state() private _rtOpen = false;
  /**
   * Runtime reads are stored as ONE discriminated value each, not as a data
   * field beside an error field. The paired form let three code paths clear one
   * and forget the other, so a stale failure hid good data and one zone's error
   * was reported against another's (QA R1-R4). With a single field the question
   * cannot be got wrong.
   */
  @state() private _rtDays?: RecorderResult<DailyRuntimeDay>;
  // Per-day maps/sets so several days can be expanded at once (backlog item
  // 46): a single open-day slot made tapping a second day collapse the first.
  // Lit tracks identity, so every mutation assigns a NEW Set/Map.
  @state() private _rtDayErr = new Map<number, string>();
  private _rtLoadedFor?: string;
  @state() private _rtDaysOpen = new Set<number>();
  @state() private _rtDayLoading = new Set<number>();
  private _rtDayCache = new Map<number, DayDetail>();
  @state() private _dryRun?: Plan;
  /** Which flow produced _dryRun. A teardown plan must NEVER render on the
   * Setup tab (it would show as an innocuous-looking all-delete preview), and
   * the Danger tab must never execute a setup plan. */
  private _dryRunKind?: 'setup' | 'teardown';
  @state() private _dryRunError?: string;
  @state() private _dryRunning = false;
  /**
   * Competing-writer scan (item 33). Deliberately its OWN state, never folded
   * into the dry-run result: this check must not be able to fail the plan, and
   * the plan's counts are the install's health canary.
   */
  @state() private _cwScan?: ScanResult;
  @state() private _cwScanning = false;
  @state() private _cwError?: string;
  private _cwScannedFor?: string;
  @state() private _execConfirm = false;
  @state() private _execRunning = false;
  @state() private _execLog: string[] = [];
  @state() private _execResult?: ExecResult;
  @state() private _tdArmed = false;
  @state() private _tdRunning = false;
  /** settings panel tab; danger lives on its own so it is never beside Close */
  @state() private _setupTab: SetupTab = 'zones';
  /** danger flow: are-you-sure shown, and the typed confirmation text */
  @state() private _tdAsk = false;
  @state() private _tdConfirm = '';
  @state() private _diagText?: string;
  /** Whether the text currently on screen contains identifiers - not what the box says (QA D7). */
  @state() private _diagTextHasIds = false;
  @state() private _diagIds = false;
  @state() private _diagStatus?: 'copied' | 'selected';

  @state() private _objects?: ObjectRow[];
  @state() private _objectsLoading = false;
  @state() private _objectsError?: string;
  private _objectsLoadedFor?: string;
  /** Local-day stamp the runtime history was fetched for (with _rtLoadedFor). */
  private _rtLoadedDay?: number;

  public setConfig(config: MzcsCardConfig): void {
    // Normalization lives in ONE place (docs/config-compatibility.md R1), and
    // deliberately not here: tests cannot import this element, so inline
    // normalization is unreachable by anything but a source scan.
    const normalized = normalizeCardConfig(config);
    this._config = normalized;
    if (this._zoneIndex >= Math.max(normalized.zones.length, 1)) this._zoneIndex = 0;
    // A config change invalidates any previewed plan (QA-R C1-1): Apply must
    // never execute a plan computed for a different config.
    this._dryRun = undefined;
    // A report describes a configuration; keeping it on screen after an edit
    // leaves a copyable artifact about a config that no longer exists (QA D6).
    this._diagText = undefined;
    this._diagTextHasIds = false;
    this._dryRunKind = undefined;
    // A scan describes one set of zones; keeping it after an edit would report
    // conflicts against thermostats the card no longer manages.
    this._cwScan = undefined;
    this._cwError = undefined;
    this._cwScannedFor = undefined;
    this._execConfirm = false;
    this._execResult = undefined;
    this._execLog = [];
    // The Danger tab's armed state and the Objects tab's loaded-for key both
    // describe the previous config (0.7.7 review C7): an armed teardown with
    // its plan cleared rendered no buttons until a tab switch, and the object
    // statuses stayed stale after a seasons/features change.
    this._tdAsk = false;
    this._tdArmed = false;
    this._tdConfirm = '';
    this._objectsLoadedFor = undefined;
  }

  public static async getConfigElement(): Promise<HTMLElement> {
    await import('./editor');
    return document.createElement(EDITOR_TYPE);
  }

  public static getStubConfig(): Partial<MzcsCardConfig> {
    return { prefix: 'climate', zones: [] };
  }

  public getCardSize(): number {
    return 6;
  }

  private get _prefix(): string {
    return this._config?.prefix ?? 'climate';
  }

  private _zone(): ZoneConfig | undefined {
    return this._config?.zones[this._zoneIndex];
  }

  private _nudge(delta: number): void {
    const zone = this._zone();
    if (!zone || !this.hass) return;
    const s = climateSummary(this.hass, zone.entity);
    if (s.setpoint == null) return;
    const attrs = this.hass.states[zone.entity]?.attributes;
    const target = clampSetpoint(
      s.setpoint + delta,
      s.setpoint,
      attrs?.min_temp,
      attrs?.max_temp,
    );
    if (target === s.setpoint) return;
    void setTemperature(this.hass, zone.entity, target);
  }

  private _provisionInput(): ProvisionInput {
    const cfg = this._config!;
    // The mapping itself is pure and lives in provisioning.ts so the engine
    // harness drives its variant matrix through the SAME code the card uses.
    const seasons = cfg.seasons ?? defaultSeasons();
    const schedules = defaultSchedules(
      cfg.zones.map((z) => slugify(z.name)),
      seasons,
    );
    return provisionInputFromConfig({ ...cfg, prefix: this._prefix, seasons }, schedules, slugify);
  }

  /**
   * The ONE way the card snapshots the registry: every consumer (dry-run,
   * teardown, freshness gate, post-apply verify) must pass the identical
   * zone/season shape or the freshness gate compares different snapshots
   * (QA-R B1-3/C1-1; scan S13-health).
   */
  private _fetchExistingFor(input: ProvisionInput): ReturnType<typeof fetchExisting> {
    return fetchExisting(
      this.hass!,
      input.prefix,
      input.zones.map((z) => z.slug),
      // String(): a legacy keyless season's schedule id embeds "undefined"
      // and must still parse (0.7.7 refutation LOW-4).
      input.seasons.map((s) => String(s.key)),
    );
  }

  private async _runDryRun(): Promise<void> {
    if (!this.hass || this._dryRunning) return;
    this._dryRunning = true;
    this._dryRunError = undefined;
    try {
      const input = this._provisionInput();
      const existing = await this._fetchExistingFor(input);
      this._dryRun = plan(buildDesired(input), existing);
      this._dryRunKind = 'setup';
      this._execConfirm = false;
      this._execResult = undefined;
      this._execLog = [];
      this._tdArmed = false;
    } catch (e) {
      this._dryRunError = e instanceof Error ? e.message : String(e);
    } finally {
      this._dryRunning = false;
    }
    // Detached on purpose: the plan renders immediately and the conflict panel
    // fills in when the sweep finishes. Its own try/catch means a scan failure
    // can never fail the dry-run or move the plan counts.
    void this._runCompetingScan();
  }

  /**
   * Sweep every automation and script for anything else that writes to a
   * managed zone (item 33). Runs alongside the dry-run because that is the one
   * control every user provably presses during setup - a standalone button
   * would be seen by nobody, and this is the failure mode the README shouts
   * about. Advisory only: it never blocks Apply.
   */
  /** The scan cache key for the CURRENT config, or null when nothing to scan. */
  private _cwKey(): string | null {
    const zones = (this._config?.zones ?? []).filter((z) => z.entity);
    if (zones.length === 0) return null;
    return `${this._prefix}|${zones.map((z) => z.entity).join(',')}`;
  }

  private async _runCompetingScan(force = false): Promise<void> {
    if (!this.hass || !this._config || this._cwScanning) return;
    const zones = this._config.zones.filter((z) => z.entity);
    const key = this._cwKey();
    if (!key) return;
    if (!force && this._cwScannedFor === key && this._cwScan) return;
    this._cwScanning = true;
    this._cwError = undefined;
    let discarded = false;
    try {
      const result = await scanCompetingWriters(this.hass, this._prefix, MZCS_LABEL, zones);
      // Token guard (QA P1, same race as QA-R C1-7's _schedLoadedFor): the
      // config may have changed while the sweep ran. A late result for the OLD
      // config must never re-populate state setConfig just cleared - it would
      // name thermostats the card no longer manages, or show an all-clear the
      // new config never earned.
      if (this._cwKey() === key) {
        this._cwScan = result;
        this._cwScannedFor = key;
      } else {
        discarded = true;
      }
    } catch (e) {
      // A failed scan must read as "could not look", never as "nothing found"
      // (the same distinction backlog item 27 fixed for the runtime drawer).
      this._cwScan = undefined;
      this._cwScannedFor = undefined;
      if (this._cwKey() === key) this._cwError = e instanceof Error ? e.message : String(e);
      // Same token guard as the success branch (re-verification F6): a stale
      // scan that FAILED must also re-trigger for the live config, or the
      // panel goes blank until the next dry-run press.
      else discarded = true;
    } finally {
      this._cwScanning = false;
    }
    // A dry-run pressed for the NEW config during the old scan was dropped by
    // the _cwScanning early-return; the discard re-triggers so that press is
    // honored rather than silently lost.
    if (discarded) void this._runCompetingScan();
  }

  /** Teardown preview: everything managed under this prefix becomes a delete. */
  private async _armTeardown(): Promise<void> {
    if (!this.hass || this._dryRunning || this._tdRunning) return;
    this._dryRunning = true;
    this._dryRunError = undefined;
    try {
      const input = this._provisionInput();
      const existing = await this._fetchExistingFor(input);
      const p = plan([], existing);
      // Deletion order: automations first (the engine stops before its
      // entities vanish), then sensors, schedules, helpers.
      const rank: Record<string, number> = { automation: 0, template_sensor: 1, stats_sensor: 1, schedule: 2, helper: 3 };
      p.delete.sort((a, b) => (rank[a.kind] ?? 9) - (rank[b.kind] ?? 9));
      // The user may have switched tabs or closed the panel while the registry
      // fetch was in flight; _resetDangerState() disarmed the flow, and this
      // late result must not resurrect it (Fable review F1).
      if (!this._tdAsk || this._setupTab !== 'danger' || !this._setupOpen) return;
      this._dryRun = p;
      this._dryRunKind = 'teardown';
      this._tdArmed = true;
      this._execConfirm = false;
      this._execResult = undefined;
      this._execLog = [];
    } catch (e) {
      this._dryRunError = e instanceof Error ? e.message : String(e);
    } finally {
      this._dryRunning = false;
    }
  }

  private async _runTeardown(): Promise<void> {
    const hass = this.hass;
    const cfg = this._config;
    const p = this._dryRunKind === 'teardown' ? this._dryRun : undefined;
    if (!hass || !cfg || !p || this._tdRunning) return;
    // HARD gate, independent of the button's disabled state: the typed
    // confirmation must match the install's prefix, and it is single-use -
    // consumed here so a completed run can never leave a pre-filled box that
    // re-fires without retyping (Fable review F3/F5).
    if (this._tdConfirm.trim() !== this._prefix) return;
    this._tdConfirm = '';
    if (!hass.callWS || !hass.callApi) {
      this._execLog = ['This HA frontend session does not expose the required APIs (callWS/callApi).'];
      return;
    }
    this._tdRunning = true;
    this._tdArmed = false;
    this._execLog = [];
    try {
      const input = this._provisionInput();
      // Freshness gate, mirroring _runApply (QA-R B1-3/C1-1): the armed list
      // may be minutes old. Recompute the teardown against the LIVE registry
      // and refuse if it no longer matches what the user confirmed - they must
      // review the refreshed list and type the prefix again (Fable review F4).
      const liveExisting = await this._fetchExistingFor(input);
      // Post-await flow re-check (invariant 8; 0.7.7 review C5): a closed
      // panel, a different tab, or a replaced config/preview must not tear
      // down on the captured locals. The typed prefix was already consumed
      // above, so nothing re-fires without retyping.
      if (!this._setupOpen || this._setupTab !== 'danger' || this._config !== cfg || this._dryRun !== p) {
        this._execLog = ['Teardown cancelled: the panel changed while the registry was being read. Arm it again.'];
        return;
      }
      const fresh = plan([], liveExisting);
      const rank: Record<string, number> = { automation: 0, template_sensor: 1, stats_sensor: 1, schedule: 2, helper: 3 };
      fresh.delete.sort((a, b) => (rank[a.kind] ?? 9) - (rank[b.kind] ?? 9));
      if (planIdShape(fresh) !== planIdShape(p)) {
        this._dryRun = fresh;
        this._dryRunKind = 'teardown';
        this._tdArmed = true;
        this._tdRunning = false;
        this._execLog = ['The registry changed since this preview was made. Review the refreshed list and confirm again.'];
        return;
      }
      // Stand every zone down FIRST so the thermostats' own app schedules take
      // over before any object disappears.
      for (const z of input.zones) {
        const en = zoneEntityId('zone_enabled', input.prefix, z.slug);
        if (entityExists(hass, en)) {
          try {
            await hass.callService('input_boolean', 'turn_off', { entity_id: en });
            this._execLog = [...this._execLog, `Disabled scheduling for ${z.name}`];
          } catch {
            this._execLog = [...this._execLog, `NOTE: could not disable ${en}`];
          }
        }
      }
      const result = await executePlan(
        hass,
        fresh,
        execContextFor(input, (line) => {
          this._execLog = [...this._execLog, line];
        }),
      );
      this._execResult = result;
      const existing = await this._fetchExistingFor(input);
      this._dryRun = plan(buildDesired(input), existing);
      this._dryRunKind = 'setup';
    } catch (e) {
      this._execLog = [...this._execLog, `ERROR: ${e instanceof Error ? e.message : String(e)}`];
    } finally {
      this._tdRunning = false;
    }
  }

  private async _runApply(): Promise<void> {
    const hass = this.hass;
    const cfg = this._config;
    const p = this._dryRun;
    if (!hass || !cfg || !p || this._execRunning) return;
    if (!hass.callWS || !hass.callApi) {
      this._execLog = ['This HA frontend session does not expose the required APIs (callWS/callApi).'];
      return;
    }
    this._execRunning = true;
    this._execConfirm = false;
    this._execLog = [];
    try {
      const input = this._provisionInput();
      // Freshness gate (QA-R B1-3/C1-1): recompute the plan against the LIVE
      // registry and refuse to execute if it no longer matches the preview -
      // protects against stale previews, config edits, and a second device
      // applying concurrently.
      const preExisting = await this._fetchExistingFor(input);
      // The registry read took time: the user may have closed the panel,
      // left the tab, or a dashboard save may have replaced the config and
      // cleared the preview. None of those may proceed on the captured
      // locals (invariant 8; 0.7.7 review C5).
      if (!this._setupOpen || this._setupTab !== 'setup' || this._config !== cfg || this._dryRun !== p) {
        this._execLog = ['Apply cancelled: the panel changed while the registry was being read. Run the dry-run again.'];
        return;
      }
      const fresh = plan(buildDesired(input), preExisting);
      if (planIdShape(fresh) !== planIdShape(p)) {
        this._dryRun = fresh;
        this._dryRunKind = 'setup';
        this._execRunning = false;
        this._execLog = ['The registry changed since this preview was made. Review the refreshed plan and apply again.'];
        return;
      }
      const result = await executePlan(
        hass,
        fresh,
        execContextFor(input, (line) => {
          this._execLog = [...this._execLog, line];
        }),
      );
      this._execResult = result;
      // Verify step of the universal change-set rule: replan against the live
      // registry so the user sees what actually landed.
      const existing = await this._fetchExistingFor(input);
      this._dryRun = plan(buildDesired(input), existing);
    } catch (e) {
      this._execLog = [...this._execLog, `ERROR: ${e instanceof Error ? e.message : String(e)}`];
    } finally {
      this._execRunning = false;
    }
  }

  /** Leave every armed/typed destructive state behind when the view changes. */
  private _resetDangerState(): void {
    this._tdAsk = false;
    this._tdArmed = false;
    this._tdConfirm = '';
    if (this._dryRunKind === 'teardown') {
      this._dryRun = undefined;
      this._dryRunKind = undefined;
    }
  }

  private _setSetupTab(tab: SetupTab): void {
    if (tab === this._setupTab) return;
    this._resetDangerState();
    this._execConfirm = false;
    this._setupTab = tab;
    if (tab === 'objects') void this._loadObjects();
  }

  private _closeSetup(): void {
    this._resetDangerState();
    this._execConfirm = false;
    this._setupOpen = false;
  }

  /**
   * Inventory for the Objects tab. Fetched ONLY on demand (tab open / refresh)
   * and cached: the card re-renders on every hass update, so a render-path
   * fetch would hammer the websocket on a busy instance.
   */
  private async _loadObjects(force = false): Promise<void> {
    if (!this.hass || this._objectsLoading) return;
    const key = `${this._prefix}|${(this._config?.zones ?? []).map((z) => z.name).join(',')}`;
    if (!force && this._objectsLoadedFor === key && this._objects) return;
    this._objectsLoading = true;
    this._objectsError = undefined;
    try {
      const input = this._provisionInput();
      const existing = await this._fetchExistingFor(input);
      const desired = buildDesired(input);
      const byId = new Map(existing.map((e) => [e.id, e]));
      const desiredIds = new Set(desired.map((d) => d.id));
      const rows: ObjectRow[] = desired.map((d) => {
        const e = byId.get(d.id);
        const status: ObjectStatus = !e
          ? 'missing'
          : !e.managed
            ? 'unmanaged'
            : e.pristine === false
              ? 'customized'
              : 'managed';
        return { id: d.id, kind: d.kind, name: String(d.spec.name ?? d.spec.alias ?? d.id), status };
      });
      // Managed leftovers the config no longer wants - these are what a future
      // Apply would delete, so surfacing them here is worth the extra rows.
      for (const e of existing) {
        if (e.managed && !desiredIds.has(e.id)) {
          rows.push({ id: e.id, kind: e.kind, name: String(e.spec.name ?? e.spec.alias ?? e.id), status: 'extra' });
        }
      }
      this._objects = rows;
      this._objectsLoadedFor = key;
    } catch (err) {
      this._objectsError = err instanceof Error ? err.message : String(err);
    } finally {
      this._objectsLoading = false;
    }
  }

  private _renderSetup() {
    const tabs: Array<{ key: SetupTab; label: string }> = [
      { key: 'zones', label: 'Zones' },
      { key: 'tuning', label: 'Tuning' },
      { key: 'objects', label: 'Objects' },
      { key: 'setup', label: 'Setup' },
      { key: 'config', label: 'Config' },
      { key: 'appearance', label: 'Theme' },
      { key: 'danger', label: 'Danger' },
    ];
    const tab = this._setupTab;
    return html`
      <div class="setup">
        <div class="setuphead">
          <p class="setup-title" style="margin:0;">Settings</p>
          <button class="chip" @click=${() => this._closeSetup()}>Close</button>
        </div>
        <div class="settabs">
          ${tabs.map(
            (t) => html`
              <button
                class=${t.key === tab
                  ? t.key === 'danger'
                    ? 'settab on danger'
                    : 'settab on'
                  : t.key === 'danger'
                    ? 'settab dangertab'
                    : 'settab'}
                @click=${() => this._setSetupTab(t.key)}
              >
                ${t.label}
              </button>
            `,
          )}
        </div>
        ${tab === 'zones' ? this._renderZonesTab() : nothing}
        ${tab === 'tuning' ? this._renderTuningTab() : nothing}
        ${tab === 'objects' ? this._renderObjectsTab() : nothing}
        ${tab === 'setup' ? this._renderSetupTab() : nothing}
        ${tab === 'config' ? this._renderConfigTab() : nothing}
        ${tab === 'appearance' ? this._renderThemePicker() : nothing}
        ${tab === 'danger' ? this._renderTeardown() : nothing}
      </div>
    `;
  }

  // ---- Config tab (backlog item 48): read-only mirror of the card editor ----
  // STANDING RULE: every editor-written setting appears here; add the row in
  // the same change that adds the option (see src/lib/config-summary.ts).

  @state() private _configTab: SummaryGroup['key'] = 'zones';

  private _renderConfigTab() {
    if (!this._config) return nothing;
    const groups = configSummary(this._config);
    const active = groups.find((g) => g.key === this._configTab) ?? groups[0]!;
    return html`
      <div>
        <p class="cfgcallout">
          These settings are <b>read-only here</b>. To change any of them, edit the dashboard,
          then use the edit wizard on this card (the pencil icon on the card itself).
        </p>
        <div class="cfgtabs">
          ${groups.map(
            (g) => html`
              <button
                class=${g.key === active.key ? 'cfgtab on' : 'cfgtab'}
                @click=${() => (this._configTab = g.key)}
              >
                ${g.label}
              </button>
            `,
          )}
        </div>
        ${active.rows.map(
          (r) => html`
            <div class="cfgrow">
              <div class="cfgmain">
                <span class="cfglabel">${r.label}</span>
                <span class="cfgvalue">${r.value}</span>
              </div>
              ${r.detail ? html`<p class="cfgdetail">${r.detail}</p>` : nothing}
            </div>
          `,
        )}
      </div>
    `;
  }

  private _renderSetupTab() {
    const p = this._dryRunKind === 'setup' ? this._dryRun : undefined;
    return html`
      <div>
        <p class="setup-sub">
          Preview first, then apply. Nothing is written until you confirm; existing schedules and
          customized automations are never overwritten.
        </p>
        <button
          class="chip"
          .disabled=${this._dryRunning || this._execRunning || this._execConfirm}
          @click=${() => void this._runDryRun()}
        >
          ${this._dryRunning ? 'Reading registry…' : 'Run dry-run preview'}
        </button>
        ${this._dryRunError ? html`<p class="setup-err">${this._dryRunError}</p>` : nothing}
        ${this._renderCompetingWriters()}
        ${p
          ? html`
              <div class="planwrap">
                ${(
                  [
                    ['Create', p.create, ''],
                    ['Adopt', p.adopt, ''],
                    ['Update', p.update, ''],
                    ['Delete', p.delete, 'del'],
                    ['Unchanged', p.noop, 'quiet'],
                  ] as const
                ).map(
                  ([label, items, cls]) => html`
                    <p class="plan-h ${cls}">${label} (${items.length})</p>
                    ${items.length > 0 && label !== 'Unchanged'
                      ? html`<ul class="plan-list ${cls}">
                          ${items.map((a) => html`<li>${a.id}</li>`)}
                        </ul>`
                      : nothing}
                  `,
                )}
              </div>
              ${this._renderApply(p)}
            `
          : nothing}
      </div>
    `;
  }

  /** One conflict row: who writes, what they call, and how they reach the zone. */
  private _cwRow(f: Finding) {
    const zone = f.zoneName ?? 'a scheduled zone';
    const how =
      f.via === 'area'
        ? ` on ${zone} (targets its area)`
        : f.via === 'device'
          ? ` on ${zone} (targets its device)`
          : f.via === 'label'
            ? ` on ${zone} (targets a label it carries)`
            : f.via === 'all'
              ? ` on every entity, including ${zone}`
              : f.via === 'template'
                ? ' on a templated target that may be a scheduled zone'
                : f.via === 'floor'
                  ? ' on a floor target that may include a scheduled zone'
                  : f.via === 'group'
                    ? ' on a group that may contain a scheduled zone'
                    : f.via === 'blueprint'
                      ? ` - ${zone} is one of its configured inputs`
                      : ` on ${zone}`;
    const svc =
      f.service === '(templated service)'
        ? 'a templated service'
        : f.service === '(blueprint)'
          ? 'a blueprint automation'
          : f.service;
    // Off automations stay listed - one toggle re-arms them - but the row says
    // so, because "turn it off" advice plus a row that never clears otherwise
    // reads as the scan being broken (QA P3).
    const off = f.sourceEnabled === false ? ' - currently off' : '';
    return html`
      <li>
        <span class="cw-src">${f.sourceName}</span>
        <span class="cw-det">${svc}${how}${off}</span>
      </li>
    `;
  }

  /**
   * Competing-writer panel (item 33). Three states that must stay distinct:
   * scanning, could-not-look, and looked-and-found-nothing. Collapsing the last
   * two is the defect item 27 fixed for the runtime drawer, and it would be
   * worse here - a false all-clear on the failure mode this exists to catch.
   */
  private _renderCompetingWriters() {
    if (this._cwScanning) {
      return html`<p class="setup-sub">Checking for other automations that control these thermostats…</p>`;
    }
    if (this._cwError) {
      return html`
        <p class="setup-err">
          Could not check for competing automations: ${this._cwError} Apply is not blocked by this
          check.
        </p>
      `;
    }
    const scan = this._cwScan;
    if (!scan) return nothing;
    const rescan = html`
      <button class="chip" .disabled=${this._cwScanning} @click=${() => void this._runCompetingScan(true)}>
        Re-scan
      </button>
    `;
    const foot = [
      `Scanned ${scan.scanned} automation${scan.scanned === 1 ? '' : 's'} and scripts`,
      scan.skippedOwn > 0 ? `, excluding ${scan.skippedOwn} of this card's own` : '',
      scan.blueprints > 0
        ? `. ${scan.blueprints} blueprint automation${scan.blueprints === 1 ? ' was' : 's were'} checked by ${scan.blueprints === 1 ? 'its' : 'their'} configured inputs only`
        : '',
      scan.unreadable > 0
        ? `. ${scan.unreadable} could not be read (automations and scripts defined in YAML are not readable here)`
        : '',
      scan.capped ? '. Coverage was capped, so some were not scanned' : '',
      scan.degraded ? '. Area matching was reduced for this scan (a registry read failed)' : '',
      '. Scenes and systems outside Home Assistant automations (Node-RED, vendor apps) are not scanned.',
    ].join('');
    // The green universal negative renders ONLY when it was earned: something
    // was actually scanned and nothing reduced coverage. A capped, degraded or
    // unreadable-heavy scan gets the hedged line instead - "scanned 0, found
    // nothing" rendering as an all-clear was QA P2, confirmed by 3 reviewers.
    const clean = scan.conflicts.length === 0 && scan.notes.length === 0;
    // scanned === 0 is fine ONLY when nothing was skipped over to get there:
    // an instance with no other automations earns the all-clear trivially; one
    // where everything was unreadable does not (QA P2's exact scenario).
    const earned =
      clean && !scan.capped && scan.unreadable === 0 && !scan.degraded && scan.blueprints === 0;
    return html`
      <div class="cwwrap">
        ${earned
          ? html`<p class="cw-h ok">No automation or script writes to these thermostats.</p>`
          : nothing}
        ${clean && !earned
          ? html`<p class="cw-h ok">
              No conflicts found among what could be checked - but coverage was partial, see below.
            </p>`
          : nothing}
        ${scan.conflicts.length > 0
          ? html`
              <p class="cw-h bad">Something else also writes to these thermostats (${scan.conflicts.length})</p>
              <p class="setup-sub">
                These will fight the schedule engine. The symptom is setpoints that appear to change
                themselves at odd times. Turn them off, delete them, or narrow them so they no
                longer target a scheduled zone. Rows stay listed while the automation exists - a
                disabled one is marked "currently off", because one toggle re-arms it.
              </p>
              <ul class="cw-list">${scan.conflicts.map((f) => this._cwRow(f))}</ul>
            `
          : nothing}
        ${scan.notes.length > 0
          ? html`
              <p class="cw-h warn">Also worth knowing (${scan.notes.length})</p>
              <p class="setup-sub">
                These do not fight the setpoint, but they change how the engine behaves. Something
                else writing the standby preset can make the schedule quietly stop applying, because
                the engine stands down while that preset is on.
              </p>
              <ul class="cw-list">${scan.notes.map((f) => this._cwRow(f))}</ul>
            `
          : nothing}
        <p class="cw-foot">${foot} This check is advisory and never blocks Apply.</p>
        ${rescan}
      </div>
    `;
  }

  private _renderTeardown() {
    const p = this._dryRunKind === 'teardown' ? this._dryRun : undefined;
    const need = this._prefix;
    const typed = this._tdConfirm.trim() === need;
    const busy = this._dryRunning || this._execRunning;
    return html`
      <p class="setup-sub danger-lead">
        This removes every helper, schedule, sensor and automation this card created. Your
        thermostats keep working - they fall back to their own app schedules. Do this
        <em>before</em> deleting the card or uninstalling from HACS, because these objects
        keep running without it.
      </p>
      ${!this._tdAsk && !this._tdArmed && !this._tdRunning
        ? html`
            <button class="chip danger" .disabled=${busy} @click=${() => (this._tdAsk = true)}>
              Remove everything this card manages…
            </button>
          `
        : nothing}
      ${this._tdAsk && !this._tdArmed
        ? html`
            <p class="setup-sub"><strong>Are you sure?</strong> Nothing is deleted yet - the next
            step shows you the exact list first.</p>
            <div class="applyrow">
              <button class="chip danger" .disabled=${busy} @click=${() => void this._armTeardown()}>
                Yes, show me what will be deleted
              </button>
              <button class="chip" @click=${() => this._resetDangerState()}>Cancel</button>
            </div>
          `
        : nothing}
      ${this._tdArmed && p
        ? html`
            <div class="planwrap">
              <p class="plan-h del">Will be deleted (${p.delete.length})</p>
              <ul class="plan-list del">
                ${p.delete.map((a) => html`<li>${a.id}</li>`)}
              </ul>
            </div>
            <p class="setup-sub">
              Zone scheduling is turned off first, so your thermostats' own app schedules take
              over before anything is removed. Automations you have customized are kept and
              listed for manual review.
            </p>
            <label class="confirmrow">
              <span>Type <code>${need}</code> to confirm</span>
              <input
                .value=${this._tdConfirm}
                placeholder=${need}
                autocomplete="off"
                @input=${(e: Event) => (this._tdConfirm = (e.target as HTMLInputElement).value)}
              />
            </label>
            <div class="applyrow">
              <button
                class=${typed ? 'chip danger' : 'chip'}
                .disabled=${!typed || busy}
                @click=${() => void this._runTeardown()}
              >
                Permanently delete ${p.delete.length} objects
              </button>
              <button class="chip" @click=${() => this._resetDangerState()}>Cancel</button>
            </div>
          `
        : nothing}
      ${this._tdRunning ? html`<p class="setup-sub">Removing…</p>` : nothing}
      ${this._execLog.length > 0 && (this._tdRunning || this._tdArmed === false)
        ? html`<ul class="plan-list exec-log">
            ${this._execLog.map((l) => html`<li>${l}</li>`)}
          </ul>`
        : nothing}
    `;
  }

  /**
   * Assemble the diagnostics text. Deliberately NOT written straight to the
   * clipboard: this contains the user's configuration, so they see it before it
   * goes anywhere. `_diagIds` is theirs to set and always starts false.
   */
  private _buildDiag() {
    const hass = this.hass;
    const cfg = this._config;
    if (!hass || !cfg) return;
    // Every zone, never filtered: a zone with no enable helper is a CONTRACT 7c
    // violation and the most useful thing in the report, and dropping it also
    // shifted every later zone's redacted label onto the wrong zone (QA D1/D2).
    const zoneEnabled = (cfg.zones ?? []).map((z, index) => {
      const id = zoneEntityId('zone_enabled', this._prefix, slugify(z.name));
      return {
        zone: z.name,
        index,
        state: entityExists(hass, id) ? (hass.states[id]?.state ?? 'unknown') : 'not provisioned',
      };
    });
    const plan = this._dryRun;
    this._diagText = buildDiagnostics({
      cardVersion: CARD_VERSION,
      haVersion: hass.config?.version,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      config: cfg,
      plan: plan
        ? {
            create: plan.create.length,
            adopt: plan.adopt.length,
            update: plan.update.length,
            delete: plan.delete.length,
            noop: plan.noop.length,
          }
        : null,
      planKind: this._dryRunKind,
      objectStatuses: this._objects ? this._objects.map((o) => o.status) : null,
      zoneEnabled,
      activeSeason: hass.states[globalEntityId('season_select', this._prefix)]?.state,
      identifiers: this._diagIds,
    });
    this._diagTextHasIds = this._diagIds;
    this._diagStatus = undefined;
  }

  /**
   * Home Assistant is commonly served over plain http on a LAN, where
   * `navigator.clipboard` does not exist. Falling back to selecting the text
   * keeps the button honest instead of silently doing nothing.
   */
  private async _copyDiag(ta: HTMLTextAreaElement) {
    const text = this._diagText ?? '';
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        this._diagStatus = 'copied';
        return;
      }
    } catch {
      /* fall through to selection */
    }
    // Home Assistant is commonly served over plain http on a LAN, where
    // `navigator.clipboard` does not exist. Selecting the text is the fallback,
    // but on iOS Safari - the wall tablet, i.e. the case this is for -
    // `select()` on a readonly textarea raises no selection at all, and saying
    // nothing left the button indistinguishable from broken (QA C1).
    ta.readOnly = false;
    ta.focus();
    ta.setSelectionRange(0, text.length);
    ta.readOnly = true;
    this._diagStatus = 'selected';
  }

  private _renderObjectsTab() {
    const rows = this._objects;
    const groups: Array<{ label: string; kinds: string[] }> = [
      { label: 'Schedules', kinds: ['schedule'] },
      { label: 'Helpers', kinds: ['helper'] },
      { label: 'Sensors', kinds: ['template_sensor', 'stats_sensor'] },
      { label: 'Automations', kinds: ['automation'] },
    ];
    const STATUS: Record<ObjectStatus, { label: string; cls: string; hint: string }> = {
      managed: { label: 'Managed', cls: 'ok', hint: 'Created and managed by this card.' },
      missing: { label: 'Missing', cls: 'warn', hint: 'Expected but not present - run Apply on the Setup tab.' },
      customized: { label: 'Customized', cls: 'warn', hint: 'You edited this - the card will never overwrite or delete it.' },
      unmanaged: { label: 'Unmanaged', cls: 'warn', hint: 'Matches this naming scheme but is not labeled - Apply would adopt it.' },
      extra: { label: 'Not in config', cls: 'del', hint: 'Managed but no longer in your config - Apply would delete it.' },
    };
    return html`
      <p class="setup-sub">
        Everything this card creates and manages, all labeled <code>mzcs</code> in Home
        Assistant. Read-only - tap a row to open it.
      </p>
      <button class="chip" .disabled=${this._objectsLoading} @click=${() => void this._loadObjects(true)}>
        ${this._objectsLoading ? 'Reading registry…' : 'Refresh'}
      </button>
      ${this._objectsError ? html`<p class="setup-err">${this._objectsError}</p>` : nothing}
      ${rows
        ? html`
            ${groups.map((g) => {
              const items = rows.filter((r) => g.kinds.includes(r.kind));
              if (items.length === 0) return nothing;
              return html`
                <p class="plan-h">${g.label} (${items.length})</p>
                ${items.map((r) => {
                  const st = STATUS[r.status];
                  return html`
                    <div class="objrow" title=${st.hint} @click=${() => this._moreInfo(r.id)}>
                      <span class="objname">${r.name}</span>
                      <span class="objid">${r.id.replace(/^automation:/, 'automation.')}</span>
                      <span class="objstat ${st.cls}">${st.label}</span>
                    </div>
                  `;
                })}
              `;
            })}
          `
        : this._objectsLoading
          ? nothing
          : html`<p class="setup-sub">Nothing loaded yet.</p>`}
      ${this._renderDiagnostics()}
    `;
  }

  private _renderDiagnostics() {
    return html`
      <p class="plan-h">Diagnostics</p>
      <p class="setup-sub">
        A summary of this card's version, configuration and last preview, for a bug report.
        <b>Entity ids and the names you gave your zones and rooms are left out</b> - the report is
        still useful without them. Tick the box only if a maintainer asks for them.
      </p>
      <label class="diagopt">
        <input
          type="checkbox"
          .checked=${this._diagIds}
          @change=${(e: Event) => {
            this._diagIds = (e.target as HTMLInputElement).checked;
            if (this._diagText) this._buildDiag();
          }}
        />
        Include entity ids and names
      </label>
      <button class="chip" @click=${() => this._buildDiag()}>
        ${this._diagText ? 'Rebuild' : 'Build report'}
      </button>
      ${this._diagText
        ? html`
            <textarea class="diagbox" readonly .value=${this._diagText} @focus=${(e: Event) =>
              (e.target as HTMLTextAreaElement).select()}></textarea>
            <button
              class="chip"
              @click=${() => {
                const ta = this.renderRoot.querySelector('.diagbox') as HTMLTextAreaElement | null;
                if (ta) void this._copyDiag(ta);
              }}
            >
              ${this._diagStatus === 'copied' ? 'Copied' : 'Copy'}
            </button>
            ${this._diagStatus === 'selected'
              ? html`<p class="setup-sub">
                  This browser will not let a page write to the clipboard, which is normal when
                  Home Assistant is served over plain http. The report is selected above - copy it
                  yourself.
                </p>`
              : nothing}
            ${this._diagTextHasIds
              ? html`<p class="setup-err">
                  This report now contains your entity ids and the names of your zones and rooms.
                </p>`
              : nothing}
          `
        : nothing}
    `;
  }

  /** Open HA's own more-info dialog for a managed object. */
  private _moreInfo(id: string): void {
    if (id.startsWith('automation:')) {
      const uid = id.slice('automation:'.length);
      const hass = this.hass;
      let found: string | undefined;
      if (hass) {
        for (const entityId in hass.states) {
          if (entityId.startsWith('automation.') && hass.states[entityId]?.attributes.id === uid) {
            found = entityId;
            break;
          }
        }
      }
      if (!found) return;
      id = found;
    }
    this.dispatchEvent(
      new CustomEvent('hass-more-info', {
        detail: { entityId: id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _renderApply(p: Plan) {
    const n = actionable(p).length;
    const done = this._execResult;
    return html`
      ${n > 0 && !this._execRunning && !done && !this._tdArmed && !this._tdRunning
        ? this._execConfirm
          ? html`
              <div class="applyrow">
                <button class="chip danger" @click=${() => void this._runApply()}>
                  Confirm: apply ${n} change${n === 1 ? '' : 's'}
                </button>
                <button class="chip" @click=${() => (this._execConfirm = false)}>Cancel</button>
              </div>
            `
          : html`
              <button class="chip" .disabled=${this._dryRunning} @click=${() => (this._execConfirm = true)}>
                Apply ${n} change${n === 1 ? '' : 's'}…
              </button>
            `
        : nothing}
      ${this._execRunning ? html`<p class="setup-sub">Applying…</p>` : nothing}
      ${this._execLog.length > 0
        ? html`<ul class="plan-list exec-log">
            ${this._execLog.map((l) => html`<li>${l}</li>`)}
          </ul>`
        : nothing}
      ${done
        ? html`<p class="setup-sub ${done.ok ? '' : 'setup-err'}">
            ${done.ok
              ? `Done - ${done.created} created, ${done.adopted} adopted, ${done.updated} updated, ${done.deleted} deleted${done.skipped ? `, ${done.skipped} kept as-is` : ''}. The plan above has been re-verified against the live registry.`
              : 'Apply failed - created objects from this run were rolled back. See the log above.'}
          </p>`
        : nothing}
    `;
  }

  private _renderZonesTab() {
    const hass = this.hass;
    if (!hass) return nothing;
    const seasonSel = globalEntityId('season_select', this._prefix);
    const season = hass.states[seasonSel];
    const options = Array.isArray(season?.attributes.options)
      ? (season!.attributes.options as string[])
      : [];
    const rows = MANAGE_TUNABLES.map((t) => ({
      ...t,
      id: globalEntityId(t.cls, this._prefix),
    })).filter((t) => entityExists(hass, t.id));
    if (!season && zonesEmptyGuard(hass, this._prefix, this._config?.zones ?? [])) {
      return html`<p class="setup-sub">Zone switches appear here once the card is provisioned.</p>`;
    }
    const zones = (this._config?.zones ?? []).map((z) => {
      const slug = slugify(z.name);
      return {
        name: z.name,
        enableId: zoneEntityId('zone_enabled', this._prefix, slug),
        markerId: zoneEntityId('applied_block_marker', this._prefix, slug),
      };
    }).filter((z) => entityExists(hass, z.enableId));
    const allOn = zones.length > 0 && zones.every((z) => hass.states[z.enableId]?.state === 'on');
    const anyOn = zones.some((z) => hass.states[z.enableId]?.state === 'on');
    return html`
      ${zones.length > 0
        ? html`
            <div class="managerow master">
              <span>Scheduling · all zones</span>
              <button
                class=${allOn ? 'chip togg on' : 'chip togg'}
                @click=${() => {
                  // Kill switch bias: with ANY zone on, the master acts as
                  // all-off. It must never re-enable a zone the user
                  // deliberately disabled (QA-R C1-5).
                  for (const z of zones) void setZoneEnabled(hass, z.enableId, z.markerId, !anyOn);
                }}
              >
                ${allOn ? 'On' : anyOn ? 'Mixed' : 'Off'}
              </button>
            </div>
            ${zones.map((z) => {
              const on = hass.states[z.enableId]?.state === 'on';
              return html`
                <div class="managerow">
                  <span>${z.name} scheduling</span>
                  <button
                    class=${on ? 'chip togg on' : 'chip togg'}
                    @click=${() => void setZoneEnabled(hass, z.enableId, z.markerId, !on)}
                  >
                    ${on ? 'On' : 'Off'}
                  </button>
                </div>
              `;
            })}
            <p class="muted" style="font-size:11px;margin:2px 0 6px;">
              Off = the engine stands down and the thermostat's own app schedule takes over.
              Turn a zone On only once its schedule is complete and you have disabled the
              schedule in the thermostat's own app - otherwise the two will fight.
            </p>
            <p class="muted" style="font-size:11px;margin:6px 0 2px;">
              Adding or removing zones, room sensors and their labels is done in the dashboard
              card editor - edit the dashboard, then the pencil on this card. It is not on this
              screen.
            </p>
          `
        : nothing}
      ${season
        ? html`
            <div class="managerow">
              <span>Active season</span>
              <select
                @change=${(e: Event) =>
                  void selectOption(hass, seasonSel, (e.target as HTMLSelectElement).value)}
              >
                ${options.map(
                  (o) => html`<option .value=${o} ?selected=${o === season.state}>${o}</option>`,
                )}
              </select>
            </div>
          `
        : nothing}
      ${this._renderDaypartsSection()}
    `;
  }

  private _renderTuningTab() {
    const hass = this.hass;
    if (!hass) return nothing;
    const rows = MANAGE_TUNABLES.map((t) => ({
      ...t,
      id: globalEntityId(t.cls, this._prefix),
    })).filter((t) => entityExists(hass, t.id));
    if (rows.length === 0) {
      return html`<p class="setup-sub">Tuning helpers appear here once the card is provisioned.</p>`;
    }
    return html`
      ${rows.map(
        (t) => html`
          <div class="managerow">
            <span>${t.label}</span>
            <input
              type="number"
              .value=${hass.states[t.id]?.state ?? ''}
              @change=${(e: Event) => {
                const el = e.target as HTMLInputElement;
                const v = el.value.trim();
                const n = Number(v);
                // Clearing the field must not write 0 to a live helper (QA-R C2 note).
                if (v === '' || !Number.isFinite(n)) {
                  el.value = hass.states[t.id]?.state ?? '';
                  return;
                }
                void setNumberHelper(hass, t.id, n).catch(() => {
                  el.value = hass.states[t.id]?.state ?? '';
                });
              }}
            />
          </div>
        `,
      )}
      <p class="muted" style="font-size:10px;margin:6px 0 0;">
        These are the LIVE values, stored in Home Assistant helpers. Their defaults and
        starting seeds come from the card's configuration - see the Config tab.
      </p>
    `;
  }

  private _renderThemePicker() {
    const hass = this.hass;
    if (!hass) return nothing;
    const themeId = globalEntityId('theme', this._prefix);
    if (!entityExists(hass, themeId)) return nothing;
    const { presetKey, tokens } = resolveTheme(hass.states[themeId]?.state);
    // A refused write (the theme helper's max on installs provisioned before
    // 0.7.7 is HA's default 100, two short of a 12-token custom theme) used
    // to vanish into an unhandled rejection: the preset stayed and the colour
    // pickers never appeared, with nothing on screen (0.7.7 review C1).
    const setTheme = (value: string) => {
      this._themeError = undefined;
      hass.callService('input_text', 'set_value', { entity_id: themeId, value }).catch((e: unknown) => {
        const max = Number(hass.states[themeId]?.attributes.max);
        const hint =
          value.length > (Number.isFinite(max) ? max : 100)
            ? ` The theme helper allows ${Number.isFinite(max) ? max : 100} characters and this theme needs ${value.length}: raise its "Maximum length" to 255 in Settings > Devices & services > Helpers (${themeId}).`
            : '';
        this._themeError = `Could not save the theme: ${errorText(e)}.${hint}`;
      });
    };
    return html`
      <div class="chips">
        ${Object.entries(THEME_PRESETS).map(
          ([key, p]) => html`
            <button
              class=${presetKey === key ? 'chip mode-on' : 'chip'}
              @click=${() => setTheme(key)}
            >
              <span class="swatch" style="background:${p.tokens.accent}"></span>${p.label}
            </button>
          `,
        )}
        <button
          class=${presetKey === 'custom' ? 'chip mode-on' : 'chip'}
          @click=${() => setTheme(serializeCustomTheme(customSeedFrom(tokens)))}
        >
          Custom
        </button>
      </div>
      ${this._themeError ? html`<p class="muted" style="margin:4px 0 0;">${this._themeError}</p>` : nothing}
      ${presetKey === 'custom'
        ? html`
            ${CUSTOM_COLOR_LABELS.map(
              (c) => html`
                <div class="managerow">
                  <span>${c.label}</span>
                  <input
                    type="color"
                    .value=${tokens[c.key]}
                    @change=${(e: Event) => {
                      const next = { ...tokens, [c.key]: (e.target as HTMLInputElement).value };
                      setTheme(serializeCustomTheme(next));
                    }}
                  />
                </div>
              `,
            )}
            <p class="muted" style="font-size:11px;margin:2px 0 0;">
              Colors apply live to every device showing the card.
            </p>
          `
        : nothing}
    `;
  }

  private _appliedTheme?: string;
  @state() private _themeError?: string;
  private _renderedMinute = -1;
  private _tick?: ReturnType<typeof setInterval>;

  public connectedCallback(): void {
    super.connectedCallback();
    // The render gate suppresses renders when no watched entity changed, so
    // time-derived output (next-block line, runtime figures, the staleness
    // transition) needs its own heartbeat - a frozen sensor produces no state
    // change of its own to trigger the render that would label it.
    this._renderedMinute = -1;
    this._tick = setInterval(() => this.requestUpdate(), 30_000);
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._tick) clearInterval(this._tick);
    this._tick = undefined;
  }

  private _applyTheme(): void {
    const stored = this.hass?.states[globalEntityId('theme', this._prefix)]?.state;
    // Runs every render (every hass update on a busy instance) - identical
    // theme strings resolve to identical tokens, so skip the 12 CSSOM writes
    // unless the stored value actually changed (scan S13-A2).
    const key = `${this._prefix}|${stored ?? ''}`;
    if (key === this._appliedTheme) return;
    this._appliedTheme = key;
    const { tokens } = resolveTheme(stored);
    for (const [k, cssVar] of THEME_VAR_MAP) {
      this.style.setProperty(cssVar, tokens[k]);
    }
  }

  /**
   * Every entity id this card reads. The render gate below compares only these
   * between hass objects, so ANY new hass.states[...] read in a renderer must
   * be represented here or the card will show stale data. A test cross-checks
   * this list against the card's reads.
   */
  private _watchedIds?: { key: string; ids: string[] };

  private _watchedEntities(): string[] {
    const cfg = this._config;
    if (!cfg) return [];
    // Rebuilt only when the config or active season changes - this runs on the
    // hottest path in the card.
    const memoKey = `${this._prefix}|${this._activeSeasonKey() ?? ''}|${JSON.stringify(cfg.zones)}|${JSON.stringify(cfg.seasons)}|${resolveOffPeak(cfg.features)?.entity ?? ''}`;
    if (this._watchedIds?.key === memoKey) return this._watchedIds.ids;
    const p = this._prefix;
    const ids: string[] = [];
    for (const z of cfg.zones ?? []) {
      if (z.entity) ids.push(z.entity);
      for (const rs of normalizeRoomSensors(z.room_sensors)) {
        ids.push(rs.entity);
        // Item 36: the age label and the stale gate read the companion, so its
        // updates must break through the render gate like any other read.
        if (rs.last_seen) ids.push(rs.last_seen);
      }
      if (!z.name) continue;
      const slug = slugify(z.name);
      for (const cls of ZONE_WATCH) ids.push(zoneEntityId(cls, p, slug));
      for (const s of cfg.seasons ?? []) ids.push(zoneScheduleId(p, slug, s.key));
      // The renderer resolves the ACTIVE season, which can differ from the
      // configured list (no `seasons` key, or the helper holds a name the
      // config no longer has). Watch what is actually read.
      const active = this._activeSeasonKey();
      if (active) ids.push(zoneScheduleId(p, slug, active));
    }
    for (const cls of GLOBAL_WATCH) ids.push(globalEntityId(cls, p));
    for (const t of MANAGE_TUNABLES) ids.push(globalEntityId(t.cls, p));
    // Item 7: the chip and the adjusted next-block line also read the user's
    // own day entity (the pause helper is in GLOBAL_WATCH, the offset in
    // MANAGE_TUNABLES).
    const offPeak = resolveOffPeak(cfg.features);
    if (offPeak) ids.push(offPeak.entity);
    this._watchedIds = { key: memoKey, ids };
    return ids;
  }

  /**
   * HA hands the card a NEW hass object on every state change anywhere - on a
   * 3,400-entity instance that is constant. Re-render only when something this
   * card actually reads changed (state objects are immutable, so reference
   * equality is exact), or when the wall-clock minute advanced, since the
   * next-block line and runtime figures are time-derived.
   */
  protected willUpdate(changed: Map<string, unknown>): void {
    // The drawer's week was read once per zone/season and never again, so an
    // edit made in HA's native schedule editor or on another device (a
    // supported second editing surface, CONTRACT §4) never showed here until
    // a zone switch or reload (0.7.7 review C3). The schedule entity is
    // already on the watch list: when its state object changes and nothing
    // is drafted, re-read the week. A boundary crossing costs one extra read.
    if (!changed.has('hass') || !this.hass) return;
    const prev = changed.get('hass') as HassLike | undefined;
    const schedId = this._schedLoadedFor;
    if (!prev || !schedId || this._schedBusy || this._schedDrafts.size > 0) return;
    if (prev.states[schedId] === this.hass.states[schedId]) return;
    const zone = this._zone();
    if (zone && this._scheduleEntityId(zone) === schedId) queueMicrotask(() => void this._loadWeek(zone));
  }

  protected shouldUpdate(changed: Map<string, unknown>): boolean {
    if (changed.size > 1 || !changed.has('hass')) return true;
    const prev = changed.get('hass') as HassLike | undefined;
    const next = this.hass;
    if (!prev || !next) return true;
    const minute = Math.floor(Date.now() / 60000);
    if (minute !== this._renderedMinute) {
      this._renderedMinute = minute;
      return true;
    }
    for (const id of this._watchedEntities()) {
      if (prev.states[id] !== next.states[id]) return true;
    }
    return false;
  }

  protected render() {
    if (!this._config || !this.hass) return nothing;
    this._applyTheme();
    const zone = this._zone();
    if (!zone || !zone.entity || !zone.entity.startsWith('climate.')) {
      return html`<ha-card>
        <div class="wrap"><p class="muted pad">Pick a thermostat for each zone in the card editor to get started.</p></div>
      </ha-card>`;
    }
    if (this._setupOpen) {
      return html`<ha-card><div class="wrap">${this._renderSetup()}</div></ha-card>`;
    }
    const s = climateSummary(this.hass, zone.entity);
    const fanOn = fanTimerActive(
      this.hass,
      zoneEntityId('fan_timer', this._prefix, slugify(zone.name)),
    );
    const cooling = s.action === 'cooling';
    const heating = s.action === 'heating';
    // heat_cool thermostats carry target_temp_low/high instead of a single
    // temperature - never render "Cooling to null" (QA-R C2-7).
    const zattrs = this.hass.states[zone.entity]?.attributes ?? {};
    const range =
      zattrs.target_temp_low != null && zattrs.target_temp_high != null
        ? `${zattrs.target_temp_low}–${zattrs.target_temp_high}`
        : null;
    const target = s.setpoint ?? range ?? '–';
    const statusHead = !s.available
      ? 'Unavailable'
      : cooling
        ? `Cooling to ${target}`
        : heating
          ? `Heating to ${target}`
          : s.mode === 'off'
            ? 'Off'
            : `Idle · set ${target}`;

    return html`
      <ha-card>
        <div class="wrap">
          <div class="tabs" role="tablist">
            ${this._config.zones.map(
              (z, i) => html`
                <button
                  role="tab"
                  aria-selected=${i === this._zoneIndex}
                  class=${i === this._zoneIndex ? 'tab on' : 'tab'}
                  @click=${() => {
                    if (this._zoneIndex === i) return;
                    this._zoneIndex = i;
                    // Day-detail caches are zone-specific - never serve
                    // another zone's day details (QA-R C2-6). The daily pills
                    // re-key on the running sensor id in _renderRuntime.
                    this._rtDayCache.clear();
                    this._rtDaysOpen = new Set();
                    this._rtDayErr = new Map();
                    this._rtDayLoading = new Set();
                  }}
                >
                  ${z.name}
                </button>
              `,
            )}
            <button
              class="tab gear"
              aria-label="Setup"
              @click=${() => {
                this._setupOpen = true;
              }}
            >
              ⚙
            </button>
          </div>

          <div class="hero">
            <span
              class="dot ${cooling ? 'cool' : heating ? 'heat' : ''}"
              aria-hidden="true"
            ></span>
            <div class="mid">
              <p class="name">${zone.name}</p>
              <p class="status">
                ${statusHead}${s.inside != null ? ` · inside ${s.inside}°` : ''}${s.humidity !=
                null
                  ? ` · ${s.humidity}% RH`
                  : ''}${fanOn ? html`<span class="fan"> · fan on</span>` : ''}
              </p>
            </div>
            <button
              class="nudge"
              aria-label="Lower setpoint"
              .disabled=${s.setpoint == null}
              @click=${() => this._nudge(-1)}
            >
              −
            </button>
            <span class="set">${s.setpoint ?? '–'}</span>
            <button
              class="nudge"
              aria-label="Raise setpoint"
              .disabled=${s.setpoint == null}
              @click=${() => this._nudge(1)}
            >
              +
            </button>
          </div>

          ${this._renderControls(zone.entity)} ${this._renderRooms(zone, s.setpoint)}
          ${this._renderSchedule(zone)} ${this._renderRuntime(zone)}
        </div>
      </ha-card>
    `;
  }

  private _renderRuntime(zone: ZoneConfig) {
    if (!this.hass) return nothing;
    const hass = this.hass;
    const slug = slugify(zone.name);
    const todayId = zoneEntityId('runtime_today', this._prefix, slug);
    if (!entityExists(hass, todayId)) return nothing;
    const todayHours = Number(hass.states[todayId]?.state);
    const todayLabel = Number.isFinite(todayHours) ? formatHoursQuarter(todayHours) : '–';
    // Past days come from the RUNNING sensor's raw history, not from
    // long-term statistics of the runtime sensor: history_stats entries carry
    // no state_class, so those statistics never exist, on any install - the
    // 0.7.2 bug. Ten days matches HA's default recorder retention.
    const runningId = zoneEntityId('running_sensor', this._prefix, slug);
    // Keyed on the zone AND the local day (0.7.7 review C3): a wall tablet
    // never switches zone or reloads, so the row fetched as "today" froze at
    // its fetch-time total and became a wrong past day at midnight, and the
    // days since never appeared.
    const localDay = new Date();
    localDay.setHours(0, 0, 0, 0);
    const dayKey = localDay.getTime();
    if (this._rtLoadedFor !== runningId || this._rtLoadedDay !== dayKey) {
      // The previous day's drill-in was captured mid-day; drop it so a tap
      // re-reads the completed day.
      if (this._rtLoadedDay !== undefined && this._rtLoadedDay !== dayKey) this._rtDayCache.delete(this._rtLoadedDay);
      this._rtLoadedFor = runningId;
      this._rtLoadedDay = dayKey;
      this._rtDays = undefined;
      queueMicrotask(() =>
        void fetchDailyRuntimeFromHistory(hass, runningId, 10).then((d) => {
          // The user may have switched zone while this was in flight; without
          // this guard the old zone's result lands on the new zone's panel.
          if (this._rtLoadedFor === runningId) this._rtDays = d;
        }),
      );
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const rows = this._rtDays?.ok ? this._rtDays.rows : [];
    // Days with NO recorded history are omitted, not drawn as zero-runtime
    // days - an empty bar would assert a fact nobody has (the item-27 class).
    const days = rows
      .filter((d) => d.day < today.getTime() && d.coverage !== 'none')
      .sort((a, b) => b.day - a.day);
    const purgedDays = rows.filter(
      (d) => d.day < today.getTime() && d.coverage === 'none',
    ).length;
    const todayStart = today.getTime();
    const expected = Number(
      hass.states[zoneEntityId('expected_runtime', this._prefix, slug)]?.state,
    );
    const margin =
      numberHelperValue(hass, globalEntityId('runtime_alert_margin', this._prefix)) ?? 35;
    const hoursElapsed = (Date.now() - todayStart) / 3600_000;
    const verdict = computeVerdict(
      Number.isFinite(todayHours) ? todayHours : 0,
      expected,
      margin,
      hoursElapsed,
    );
    return html`
      <button class="schedrow" @click=${() => (this._rtOpen = !this._rtOpen)}>
        <span
          >Runtime · Today <b class="rt-b">${todayLabel}</b>${verdict.label
            ? html` <span class="verdict ${verdict.status}">· ${verdict.label}</span>`
            : nothing}</span
        >
        <span aria-hidden="true">${this._rtOpen ? '▴' : '▾'}</span>
      </button>
      ${this._rtOpen
        ? html`
            <div class="schedbody">
              ${this._renderPill(zone, 'Today', Number.isFinite(todayHours) ? todayHours : 0, todayStart, true)}
              ${days.map((d) =>
                this._renderPill(
                  zone,
                  new Date(d.day).toLocaleDateString(undefined, {
                    weekday: 'short',
                    day: 'numeric',
                  }),
                  d.hours,
                  d.day,
                  false,
                  d.coverage === 'partial',
                ),
              )}
              ${this._rtDays && !this._rtDays.ok
                ? html`<p class="rt-fail">
                    Could not read history from Home Assistant, so this is not "no
                    runtime yet" - it is unknown. ${this._rtDays.error}
                  </p>`
                : this._rtDays && days.length === 0
                  ? html`<p class="muted" style="font-size:11px;margin:6px 0;">
                      No recorded history for this zone yet - past days appear as the
                      recorder collects them.
                    </p>`
                  : nothing}
              ${purgedDays > 0 && days.length > 0
                ? html`<p class="muted" style="font-size:10px;margin:6px 0 0;">
                    Recorded history covers the last ${days.length + 1} days - older days
                    are gone once the recorder purges them.
                  </p>`
                : days.some((d) => d.coverage === 'partial')
                  ? html`<p class="muted" style="font-size:10px;margin:6px 0 0;">
                      The oldest day shows ≥ because the recorder has already trimmed
                      its start.
                    </p>`
                  : nothing}
              <p class="muted" style="font-size:10px;margin:6px 0 0;">
                Tap a day for its run segments and setpoint changes.
              </p>
            </div>
          `
        : nothing}
    `;
  }

  private async _openDay(zone: ZoneConfig, dayStart: number): Promise<void> {
    if (this._rtDaysOpen.has(dayStart)) {
      this._rtDaysOpen = new Set([...this._rtDaysOpen].filter((d) => d !== dayStart));
      if (this._rtDayErr.has(dayStart)) {
        const errs = new Map(this._rtDayErr);
        errs.delete(dayStart);
        this._rtDayErr = errs;
      }
      return;
    }
    this._rtDaysOpen = new Set(this._rtDaysOpen).add(dayStart);
    // Completed days are cached for good; today's detail is still accruing,
    // so re-read it on every open (0.7.7 review C3).
    if (this._rtDayCache.has(dayStart) && dayStart + 86_400_000 <= Date.now()) return;
    if (!this.hass) return;
    this._rtDayLoading = new Set(this._rtDayLoading).add(dayStart);
    try {
      const slug = slugify(zone.name);
      const runningId = zoneEntityId('running_sensor', this._prefix, slug);
      const dayEnd = Math.min(dayStart + 86_400_000, Date.now());
      const [runRes, setRes] = await Promise.all([
        fetchDayHistory(this.hass, runningId, dayStart, dayEnd),
        fetchDayHistory(this.hass, zone.entity, dayStart, dayEnd, 'temperature'),
      ]);
      // The run history is what the timeline IS; a failure there must not be
      // drawn as a day with no runs. Setpoint bubbles are decoration on top, so
      // losing those alone still leaves a truthful timeline.
      if (!runRes.ok) {
        // A slow failure for a day the user has since closed must not leave a
        // stale error waiting behind that pill's next tap.
        if (this._rtDaysOpen.has(dayStart)) {
          this._rtDayErr = new Map(this._rtDayErr).set(dayStart, runRes.error);
        }
        return;
      }
      const runPts = runRes.rows;
      const setPts = setRes.ok ? setRes.rows : [];
      const detail = {
        segs: extractRunSegments(runPts, dayStart, dayEnd),
        bubs: extractSetpointChanges(setPts),
        start: dayStart,
        end: dayStart + 86_400_000,
      };
      // The tab handler clears the cache synchronously on a zone switch; a
      // read still in flight for the OLD zone must not land in the new zone's
      // cache and be served on its next tap (0.7.7 review C2).
      if (this._rtLoadedFor !== runningId) return;
      this._rtDayCache.set(dayStart, detail);
    } finally {
      this._rtDayLoading = new Set([...this._rtDayLoading].filter((d) => d !== dayStart));
    }
  }

  private _renderPill(
    zone: ZoneConfig,
    label: string,
    hours: number,
    dayStart: number,
    isToday: boolean,
    partial = false,
  ) {
    const pct = Math.min(100, Math.max(0, (hours / 24) * 100));
    const open = this._rtDaysOpen.has(dayStart);
    return html`
      <button
        class="pillrow"
        title=${partial
          ? 'The recorder has trimmed the start of this day; its total is at least this much.'
          : nothing}
        @click=${() => void this._openDay(zone, dayStart)}
      >
        <span class="pill-label">${label}</span>
        <span class="pill-track">
          <span
            class="pill-fill ${isToday || open ? 'today-fill' : ''}"
            style="width: ${pct.toFixed(1)}%"
          ></span>
        </span>
        <span class="pill-hours">${partial ? '≥ ' : ''}${formatHoursQuarter(hours)}</span>
      </button>
      ${open ? this._renderDayDetail(dayStart) : nothing}
    `;
  }

  private _renderDayDetail(dayStart: number) {
    if (this._rtDayLoading.has(dayStart))
      return html`<p class="muted" style="font-size:11px;">Loading day…</p>`;
    const err = this._rtDayErr.get(dayStart);
    if (err !== undefined) {
      return html`<p class="rt-fail">
        Could not read this day's history, so it is unknown rather than a day with no
        runs. ${err}
      </p>`;
    }
    const d = this._rtDayCache.get(dayStart);
    if (!d) return nothing;
    return html`
      <div class="daydetail">
        <div class="bubblerow">
          ${d.bubs.slice(0, 12).map((b) => {
            const left = ((b.t - d.start) / (d.end - d.start)) * 100;
            return html`<span class="bubble" style="left: ${left.toFixed(1)}%"
              >${Math.round(b.value)}</span
            >`;
          })}
        </div>
        <div class="segtrack">
          ${d.segs.map((s) => {
            const { left, width } = segmentToPct(s, d.start, d.end);
            return html`<span
              class="seg"
              style="left: ${left.toFixed(2)}%; width: ${Math.max(0.4, width).toFixed(2)}%"
            ></span>`;
          })}
        </div>
        <div class="axis">
          <span>12A</span><span>6A</span><span>12P</span><span>6P</span><span>12A</span>
        </div>
      </div>
    `;
  }

  private _activeSeasonKey(): string | null {
    const sel = this.hass?.states[globalEntityId('season_select', this._prefix)];
    if (!sel || sel.state === 'unknown') return null;
    // Season keys are stable across display renames, so resolve name -> key
    // through the config. `?? slugify(name)` used to stand in for a missing
    // key, which named an entity that does not exist: the engine's id template
    // embeds String(key), so a keyless season provisioned `..._undefined` and
    // the drawer looked for `..._summer` (item 39, measured).
    return resolveSeasonKey(this._config?.seasons, sel.state);
  }

  private _scheduleEntityId(zone: ZoneConfig): string | null {
    const season = this._activeSeasonKey();
    if (!season || !zone.name) return null;
    // Must go through the generator: a hand-assembled id can silently diverge
    // from the render gate's watch list (live QA finding).
    return zoneScheduleId(this._prefix, slugify(zone.name), season);
  }

  private async _loadWeek(zone: ZoneConfig): Promise<void> {
    if (!this.hass) return;
    const schedId = this._scheduleEntityId(zone);
    if (!schedId || !entityExists(this.hass, schedId)) {
      this._schedWeek = undefined;
      return;
    }
    this._schedBusy = true;
    try {
      const cfg = await fetchScheduleConfig(this.hass, schedId);
      // Token guard (QA-R C1-7): the zone/season may have changed while this
      // fetch was in flight - never render another schedule's week here.
      if (this._schedLoadedFor !== schedId) return;
      this._schedWeek = (cfg?.week as Week | undefined) ?? undefined;
      this._schedName = cfg?.name ?? '';
      this._schedError = cfg ? undefined : 'Could not load schedule config.';
    } catch (e) {
      if (this._schedLoadedFor === schedId) this._schedError = errorText(e);
    } finally {
      this._schedBusy = false;
    }
  }

  /** Blocks for a set: unsaved draft when one exists, else the saved week. */
  private _setBlocks(week: Week, setKey: string, days: DayKey[]): ScheduleBlock[] {
    return (
      this._schedDrafts.get(setKey) ??
      rangesToDayBlocks((week[days[0]!] ?? []) as TimeRange[])
    );
  }

  /** Mutate a set's draft (cloning from the saved week on first touch). */
  private _mutateDraft(setKey: string, days: DayKey[], fn: (blocks: ScheduleBlock[]) => void): void {
    if (!this._schedWeek) return;
    const draft =
      this._schedDrafts.get(setKey) ??
      rangesToDayBlocks((this._schedWeek[days[0]!] ?? []) as TimeRange[]).map((b) => ({ ...b }));
    fn(draft);
    const m = new Map(this._schedDrafts);
    m.set(setKey, draft);
    this._schedDrafts = m;
    this._schedEdited.add(setKey);
    this._schedNotice = undefined;
  }

  private _clearSchedEdit(): void {
    this._schedDrafts = new Map();
    this._schedEdited = new Set();
    this._schedSel = undefined;
    this._schedGran = undefined;
  }

  /** Set structure honoring a pending granularity change (CONTRACT §2 / G2). */
  private _activeDet(week: Week): DetectedSets {
    if (!this._schedGran) return detectSets(week);
    const g = this._schedGran;
    const keys = g === 'all' ? ['all'] : g === 'wdwe' ? ['wd', 'we'] : [...ALL_DAYS];
    return { granularity: g, sets: Object.fromEntries(keys.map((k) => [k, daysForSet(g, k)])) };
  }

  /**
   * Switch day granularity as a DRAFT: expand clones the source set (a no-op
   * until a day diverges), collapse keeps the survivor set - per CONTRACT §2.
   * Nothing writes until Save.
   */
  private _switchGranularity(to: DayGranularity): void {
    const week = this._schedWeek;
    if (!week) return;
    if (this._activeDet(week).granularity === to) return;
    // Transition from what is SAVED, not from the current on-screen
    // granularity. Chaining wdwe -> all -> days used to feed each clone into
    // the next, so a stored weekend was silently replaced by the weekday
    // schedule; a lingering unsaved switch made that reachable just by
    // reopening the drawer. Deriving from the stored week makes switching
    // idempotent and non-destructive.
    const storedDet = detectSets(week);
    const curSets: Record<string, ScheduleBlock[]> = {};
    for (const [k, days] of Object.entries(storedDet.sets)) {
      // A set the user actually edited still wins over the stored value.
      const edited = this._schedEdited.has(k) ? this._schedDrafts.get(k) : undefined;
      curSets[k] = (edited ?? rangesToDayBlocks((week[days[0]!] ?? []) as TimeRange[])).map((b) => ({ ...b }));
    }
    const newSets = transitionSets(storedDet.granularity, to, curSets);
    const m = new Map<string, ScheduleBlock[]>();
    for (const [k, blocks] of Object.entries(newSets)) m.set(k, blocks.map((b) => ({ ...b })));
    this._schedDrafts = m;
    this._schedGran = to;
    this._schedSel = undefined;
    this._schedNotice = undefined;
  }

  private async _saveSchedDrafts(): Promise<void> {
    // Save target is PINNED to the schedule the drafts were edited against
    // (QA-R C1-4) - a season flip racing the click must not write the old
    // season's week over the new season's entity.
    const schedId = this._schedLoadedFor;
    if (!this.hass || !this._schedWeek || this._schedDrafts.size === 0 || !schedId) return;
    const det = this._activeDet(this._schedWeek);
    this._schedBusy = true;
    try {
      // Fresh-base merge (QA-R C1-2): refetch the week so days edited
      // concurrently elsewhere (native HA editor, another device) survive -
      // only the sets drafted HERE are replaced.
      const freshCfg = await fetchScheduleConfig(this.hass, schedId);
      let week = ((freshCfg?.week as Week | undefined) ?? this._schedWeek) as Week;
      for (const [setKey, blocks] of this._schedDrafts) {
        const days = det.sets[setKey];
        if (days) week = replaceSetBlocks(week, days, blocks);
      }
      await updateScheduleWeek(
        this.hass,
        schedId,
        week as unknown as Record<string, unknown>,
        freshCfg?.name ?? this._schedName,
      );
      if (this._schedLoadedFor === schedId) {
        this._schedWeek = week;
        this._clearSchedEdit();
        this._schedError = undefined;
      }
    } catch (e) {
      this._schedError = errorText(e);
    } finally {
      this._schedBusy = false;
    }
  }

  private _schedLoadedFor?: string;

  /**
   * Live off-peak status (item 7), or null when the feature is not configured.
   * `adjusting` mirrors the engine's own condition - entity ON and not paused
   * for today. The pause helper holds an ISO INSTANT (tz-safe absolute time);
   * the engine derives "paused today" in the SERVER's local day, the chip in
   * the browser's - a phone across midnight from the install can disagree on
   * the label for a couple of hours, but the authoritative gate no longer
   * pauses the wrong day (QA findings C4/E-L4).
   */
  private _offPeakState(): { on: boolean; paused: boolean; adjusting: boolean; offset: number } | null {
    const op = resolveOffPeak(this._config?.features);
    if (!op || !this.hass) return null;
    const on = this.hass.states[op.entity]?.state === 'on';
    const pausedTs = Date.parse(this.hass.states[globalEntityId('off_peak_paused_on', this._prefix)]?.state ?? '');
    const paused = Number.isFinite(pausedTs) && new Date(pausedTs).toDateString() === new Date().toDateString();
    const offRaw = Number(this.hass.states[globalEntityId('off_peak_offset', this._prefix)]?.state);
    const offset = Number.isFinite(offRaw) ? offRaw : op.offsetSeed;
    return { on, paused, adjusting: on && !paused, offset };
  }

  /** A wrong off-peak flag needs a same-day escape hatch (item 7 design
   * decision). Pausing writes the CURRENT INSTANT (ISO, absolute) into the
   * pause helper; the engine skips the offset while that instant falls on its
   * own local today. Resuming clears it. Expires at midnight on its own. */
  private async _toggleOffPeakPause(paused: boolean): Promise<void> {
    if (!this.hass) return;
    const id = globalEntityId('off_peak_paused_on', this._prefix);
    if (!entityExists(this.hass, id)) return; // not provisioned yet - Apply first
    try {
      await this.hass.callService('input_text', 'set_value', {
        entity_id: id,
        value: paused ? '' : new Date().toISOString(),
      });
    } catch {
      // The chip re-renders from live state, so a failed write simply leaves
      // the current state visible; nothing to roll back.
    }
  }

  // ---- Comfort steering (item 8, temporary override path) ----

  @state() private _steerSheet?: { zone: string; room: string; label: string };
  @state() private _steerTemp = 76;
  @state() private _steerMins = 60;
  @state() private _steerError?: string;

  /** Live steering status for a zone, or null when the feature is off or its
   * objects are not provisioned yet (Apply first). */
  private _steeringFor(zone: ZoneConfig): {
    slug: string;
    timerId: string;
    selectId: string;
    targetId: string;
    active: boolean;
    label: string;
    finishesAt?: string;
  } | null {
    if (this._config?.features?.steering !== true || !this.hass || !zone.name) return null;
    const slug = slugify(zone.name);
    const timerId = zoneEntityId('room_override_timer', this._prefix, slug);
    if (!entityExists(this.hass, timerId)) return null;
    const timer = this.hass.states[timerId];
    const selectId = zoneEntityId('target_room_select', this._prefix, slug);
    const finishesAt = timer?.attributes.finishes_at;
    return {
      slug,
      timerId,
      selectId,
      targetId: zoneEntityId('steer_target', this._prefix, slug),
      active: timer?.state === 'active',
      label: this.hass.states[selectId]?.state ?? 'Thermostat',
      ...(typeof finishesAt === 'string' ? { finishesAt } : {}),
    };
  }

  /** The PROVISIONED labels for a zone's rooms, entity -> label, from the ONE
   * shared builder (steeringRooms) - never the hass friendly name and never a
   * re-implementation of the label rule (QA INFO-6): the select's options are
   * config-derived and must match exactly, sanitization included. */
  private _steerLabels(zone: ZoneConfig): Map<string, string> {
    return new Map(steeringRooms(zone.room_sensors).map((r) => [r.entity, r.label]));
  }

  private _openSteerSheet(zone: ZoneConfig, roomEntity: string, label: string, defTemp: number | null): void {
    const om = Number(this.hass?.states[globalEntityId('override_minutes', this._prefix)]?.state);
    this._steerMins = Number.isFinite(om) && om > 0 ? Math.min(480, Math.max(15, Math.round(om))) : 60;
    // Clamped into the steer_target helper's own 50-95 bounds - an
    // out-of-range set_value throws server-side (QA finding 2).
    this._steerTemp = Math.min(95, Math.max(50, defTemp != null ? Math.round(defTemp) : 76));
    this._steerError = undefined;
    this._steerSheet = { zone: slugify(zone.name), room: roomEntity, label };
  }

  private async _startSteer(zone: ZoneConfig, roomLabel: string): Promise<void> {
    const st = this._steeringFor(zone);
    if (!st || !this.hass) return;
    const hass = this.hass;
    const mins = Math.min(480, Math.max(5, Math.round(this._steerMins)));
    const dur = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}:00`;
    const temp = Math.min(95, Math.max(50, Math.round(this._steerTemp)));
    // TARGET first, then the room, then the timer (QA finding 2): a live
    // override re-reads both continuously, so writing the room before its
    // target would steer the new room toward the OLD room's target for a
    // moment - and permanently if the target write then failed. With this
    // order a mid-override room switch is coherent at every step.
    const prevTarget = Number(hass.states[st.targetId]?.state);
    const prevSelect = hass.states[st.selectId]?.state;
    try {
      await hass.callService('input_number', 'set_value', { entity_id: st.targetId, value: temp });
      await hass.callService('input_select', 'select_option', { entity_id: st.selectId, option: roomLabel });
      await hass.callService('timer', 'start', { entity_id: st.timerId, duration: dur });
      this._steerSheet = undefined;
    } catch (e) {
      this._steerError = errorText(e);
      // Best-effort restore so a partial failure cannot leave a LIVE override
      // pointed at a half-written room/target pair.
      try {
        if (Number.isFinite(prevTarget)) {
          await hass.callService('input_number', 'set_value', { entity_id: st.targetId, value: prevTarget });
        }
        if (typeof prevSelect === 'string' && prevSelect) {
          await hass.callService('input_select', 'select_option', { entity_id: st.selectId, option: prevSelect });
        }
      } catch {
        // The sheet already shows the original error; live state tells the truth.
      }
    }
  }

  private async _cancelSteer(zone: ZoneConfig): Promise<void> {
    const st = this._steeringFor(zone);
    if (!st || !this.hass) return;
    try {
      // The automation reverts on the timer.cancelled event (marker cleared,
      // engine re-asserts) - the card only cancels the timer.
      await this.hass.callService('timer', 'cancel', { entity_id: st.timerId });
    } catch {
      // Live state re-render shows the truth either way.
    }
  }

  // ---- Daypart (sensor schedule) editor, item 8 stage 4 ----
  // The long-term half: which room matters by time of day. Stored in the
  // provisioned sensor_schedule (same blocks all 7 days, block data
  // {sensor: entity | 'thermostat'}); the steering automation's daypart pilot
  // consumes it. Kept deliberately lean: start time + target per row.

  @state() private _dpZone?: string;
  @state() private _dpRows?: Array<{ time: string; sensor: string }>;
  @state() private _dpSaving = false;
  @state() private _dpError?: string;
  @state() private _dpNonUniform = false;

  /** STRICT read of a sensor schedule's storage item. Unlike
   * fetchScheduleConfig this THROWS on any failure - a swallowed error used to
   * render an empty editor whose Save then wiped the zone's real schedule (QA
   * finding 1: the card could not tell "empty" from "load failed"). */
  private async _fetchDaypartItem(slug: string): Promise<Record<string, unknown>> {
    if (!this.hass?.callWS) throw new Error('Home Assistant connection unavailable.');
    const objectId = zoneEntityId('sensor_schedule', this._prefix, slug).split('.')[1]!;
    const items = (await this.hass.callWS({ type: 'schedule/list' })) as Array<Record<string, unknown>>;
    const item = items.find((i) => i.id === objectId);
    if (!item) throw new Error(`The sensor schedule (${objectId}) could not be read - not saving anything.`);
    return item;
  }

  private async _toggleDayparts(slug: string): Promise<void> {
    if (this._dpZone === slug) {
      this._dpZone = undefined;
      this._dpRows = undefined;
      this._dpError = undefined;
      return;
    }
    // No shared busy flag: rows stay undefined (= loading) until THIS zone's
    // fetch lands, so a rapid A->B switch can never surface B's editor with
    // A's (or nobody's) rows (QA finding 5).
    this._dpZone = slug;
    this._dpRows = undefined;
    this._dpError = undefined;
    this._dpNonUniform = false;
    try {
      const item = await this._fetchDaypartItem(slug);
      const day = (d: string) => JSON.stringify(item[d] ?? []);
      const monday = (item.monday ?? []) as Array<{ from?: string; data?: { sensor?: string } }>;
      const rows = monday
        .map((b) => ({ time: String(b.from ?? '00:00:00').slice(0, 5), sensor: b.data?.sensor ?? 'thermostat' }))
        .sort((a, b) => a.time.localeCompare(b.time));
      if (this._dpZone !== slug) return; // user moved on - discard
      this._dpRows = rows;
      // QA finding 3: saving stamps these rows onto EVERY day. If the days
      // currently differ (edited in HA's own helper UI), say so before Save
      // silently flattens them.
      this._dpNonUniform = ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].some(
        (d) => day(d) !== day('monday'),
      );
    } catch (e) {
      if (this._dpZone === slug) this._dpError = errorText(e);
    }
  }

  private async _saveDayparts(slug: string): Promise<void> {
    if (!this.hass || !this._dpRows) return;
    const rows = [...this._dpRows].sort((a, b) => a.time.localeCompare(b.time));
    if (new Set(rows.map((r) => r.time)).size !== rows.length) {
      this._dpError = 'Two dayparts start at the same time - give each its own start.';
      return;
    }
    // Contiguous by construction: each daypart runs to the next one's start,
    // the last to midnight. An empty list clears the schedule (pilot inert).
    const ranges = rows.map((r, i) => ({
      from: `${r.time}:00`,
      to: i + 1 < rows.length ? `${rows[i + 1]!.time}:00` : '24:00:00',
      data: { sensor: r.sensor },
    }));
    const week: Record<string, unknown> = {};
    for (const d of ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']) week[d] = ranges;
    this._dpSaving = true;
    this._dpError = undefined;
    try {
      // Strict re-read: a save must never proceed from a state the storage
      // cannot currently confirm (same QA finding 1 rule as the load).
      const item = await this._fetchDaypartItem(slug);
      const schedId = zoneEntityId('sensor_schedule', this._prefix, slug);
      await updateScheduleWeek(this.hass, schedId, week, String(item.name ?? schedId.split('.')[1]!));
      this._dpNonUniform = false;
    } catch (e) {
      this._dpError = errorText(e);
    } finally {
      this._dpSaving = false;
    }
  }

  private _renderDaypartsSection() {
    const hass = this.hass;
    if (!hass || this._config?.features?.steering !== true) return nothing;
    const zones = (this._config?.zones ?? [])
      .filter((z) => z.name)
      .map((z) => ({
        z,
        slug: slugify(z.name),
        schedId: zoneEntityId('sensor_schedule', this._prefix, slugify(z.name)),
        rooms: steeringRooms(z.room_sensors),
      }))
      .filter((x) => x.rooms.length > 0 && entityExists(hass, x.schedId));
    if (zones.length === 0) return nothing;
    return html`
      <p class="setup-sub" style="margin-top:12px;">
        Room by time of day - long-term steering. During a daypart mapped to a room, the zone
        steers its scheduled setpoint to THAT room; a manual override from the main screen
        wins until it expires.
      </p>
      ${zones.map(({ z, slug, rooms }) => {
        const open = this._dpZone === slug;
        return html`
          <div class="managerow">
            <span>${z.name} · sensor schedule</span>
            <button class="chip" @click=${() => void this._toggleDayparts(slug)}>
              ${open ? 'Close' : 'Edit'}
            </button>
          </div>
          ${!open
            ? nothing
            : this._dpError
              ? html`<p class="steerrefusal">${this._dpError}</p>`
              : !this._dpRows
                ? html`<p class="muted pad">Loading…</p>`
                : html`
                  <div class="dprows">
                    ${this._dpNonUniform
                      ? html`<p class="steerrefusal">
                          This schedule currently differs between days (edited outside the card).
                          Saving applies the rows below to EVERY day.
                        </p>`
                      : nothing}
                    ${this._dpRows.map(
                      (row, i) => html`
                        <div class="dprow">
                          <input
                            type="time"
                            .value=${row.time}
                            @change=${(e: Event) => {
                              const rows = [...this._dpRows!];
                              rows[i] = { ...rows[i]!, time: (e.target as HTMLInputElement).value || '00:00' };
                              this._dpRows = rows;
                            }}
                          />
                          <select
                            @change=${(e: Event) => {
                              const rows = [...this._dpRows!];
                              rows[i] = { ...rows[i]!, sensor: (e.target as HTMLSelectElement).value };
                              this._dpRows = rows;
                            }}
                          >
                            <option value="thermostat" ?selected=${row.sensor === 'thermostat'}>Thermostat</option>
                            ${rooms.map(
                              (r) => html`<option .value=${r.entity} ?selected=${row.sensor === r.entity}>
                                ${r.label}
                              </option>`,
                            )}
                          </select>
                          <button
                            class="steercancel"
                            title="Remove this daypart"
                            @click=${() => (this._dpRows = this._dpRows!.filter((_, j) => j !== i))}
                          >
                            ✕
                          </button>
                        </div>
                      `,
                    )}
                    <div class="steerrow">
                      <button
                        class="chip"
                        @click=${() =>
                          (this._dpRows = [...(this._dpRows ?? []), { time: '06:00', sensor: 'thermostat' }])}
                      >
                        Add daypart
                      </button>
                      <button
                        class="steerstart"
                        ?disabled=${this._dpSaving}
                        @click=${() => void this._saveDayparts(slug)}
                      >
                        ${this._dpSaving ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                    <p class="muted" style="font-size:10px;margin:6px 0 0;">
                      Each daypart runs until the next one starts; the last runs to midnight.
                      "Thermostat" means normal scheduling for that stretch. The same rows apply
                      to every day of the week. Takes effect within a few minutes of saving.
                    </p>
                  </div>
                `}
        `;
      })}
    `;
  }

  /** Minutes left on an active override, from the timer's finishes_at. */
  private _steerRemaining(finishesAt?: string): string | null {
    if (!finishesAt) return null;
    const ms = Date.parse(finishesAt) - Date.now();
    if (!Number.isFinite(ms) || ms <= 0) return null;
    const m = Math.ceil(ms / 60_000);
    return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
  }

  private _renderSchedule(zone: ZoneConfig) {
    if (!this.hass) return nothing;
    const schedId = this._scheduleEntityId(zone);
    if (!schedId || !entityExists(this.hass, schedId)) return nothing;
    if (this._schedLoadedFor !== schedId) {
      // QA-R C1-3: never silently eat unsaved edits - tell the user. QA S2: only
      // when there was something to lose, and cleared otherwise so the notice
      // cannot resurface later against a different zone's schedule.
      this._schedNotice =
        this._schedWeek && draftsChangeWeek(this._schedWeek, this._activeDet(this._schedWeek), this._schedDrafts)
          ? 'Unsaved schedule edits were discarded (zone or season changed).'
          : undefined;
      this._schedLoadedFor = schedId;
      this._schedWeek = undefined;
      this._clearSchedEdit();
      queueMicrotask(() => void this._loadWeek(zone));
    }
    const seasonName =
      this.hass.states[globalEntityId('season_select', this._prefix)]?.state ?? '';
    const week = this._schedWeek;
    const next = week ? nextBlockAfter(week, new Date()) : null;
    const nextTemp = next ? (next.cool_temp ?? next.heat_temp) : null;
    // Item 7: while off-peak is active the engine applies an adjusted setpoint,
    // so the next-block text shows the ADJUSTED number - otherwise the card
    // displays the schedule's raw value while the thermostat sits offset° away
    // from it, which reads as a bug (spec §6). Direction mirrors the engine's
    // single-target rule: the cool side moves down, a heat-only block moves up.
    const offPeak = this._offPeakState();
    // Adjust the displayed target only when the next block lands TODAY - the
    // day entity's current state says nothing about tomorrow's blocks, and
    // showing tomorrow's number adjusted recreates the exact card-vs-
    // thermostat mismatch this display exists to prevent (QA finding 6).
    const now = new Date();
    const nextIsToday =
      next?.minutesUntil != null && next.minutesUntil < 1440 - (now.getHours() * 60 + now.getMinutes());
    // heat_cool blocks get the engine's deadband-CAPPED adjustment (hc_adj):
    // the offset can never shrink the range below a 2-degree gap, so the
    // preview must not show a number the engine will not write (0.7.7 review).
    const previewOffset =
      next && offPeak && next.cool_temp != null && next.heat_temp != null
        ? Math.max(0, Math.min(offPeak.offset, (next.cool_temp - next.heat_temp - 2) / 2))
        : (offPeak?.offset ?? 0);
    const shownTemp =
      next && nextTemp != null && offPeak?.adjusting && nextIsToday
        ? next.cool_temp != null
          ? nextTemp - previewOffset
          : nextTemp + previewOffset
        : nextTemp;
    const nextLine = next
      ? `Next · ${fmtTime(next.time)} ${next.name}${shownTemp != null ? ` → ${shownTemp}°` : ''}`
      : 'Schedule';
    // Drafts outlive the drawer being collapsed, and a collapsed row that looks
    // identical to a saved schedule is how someone comes back believing their
    // week is what they see. Say so on the row itself, not only inside the body.
    // "Would saving change anything", not "do drafts exist". A granularity
    // switch clones values without altering them, and calling that unsaved told
    // users a running schedule was not running (QA S1).
    const unsaved = week ? draftsChangeWeek(week, this._activeDet(week), this._schedDrafts) : false;
    return html`
      <button
        class="schedrow ${unsaved ? 'unsaved' : ''}"
        @click=${() => {
          this._schedOpen = !this._schedOpen;
          if (!this._schedWeek) void this._loadWeek(zone);
        }}
      >
        <span>
          ${nextLine} <span class="season">· ${seasonName}</span>
          ${offPeak?.on
            ? html`<span
                class="opchip ${offPeak.paused ? 'paused' : ''}"
                role="button"
                title=${offPeak.paused
                  ? 'Off-peak comfort is paused for today - tap to resume'
                  : `Off-peak day: comfort offset ${offPeak.offset}° is applied - tap to pause for today`}
                @click=${(e: Event) => {
                  e.stopPropagation();
                  void this._toggleOffPeakPause(offPeak.paused);
                }}
                >${offPeak.paused ? 'Off-peak paused' : 'Off-peak'}</span
              >`
            : nothing}
          ${unsaved ? html`<span class="unsavedchip">unsaved</span>` : nothing}
        </span>
        <span aria-hidden="true">${this._schedOpen ? '▴' : '▾'}</span>
      </button>
      ${!this._schedOpen && this._schedNotice
        ? html`<p class="unsavedhint">${this._schedNotice}</p>`
        : nothing}
      ${!this._schedOpen && unsaved
        ? html`<p class="unsavedhint">
            This schedule has changes you have not saved. They are not running - open the
            schedule to save or discard them.
          </p>`
        : nothing}
      ${this._schedOpen ? this._renderScheduleBody(zone) : nothing}
    `;
  }

  private _renderScheduleBody(zone: ZoneConfig) {
    if (this._schedBusy && !this._schedWeek) return html`<p class="muted pad">Loading…</p>`;
    const week = this._schedWeek;
    if (!week) {
      return this._schedError
        ? html`<p class="schederr pad">${this._schedError}</p>`
        : html`<p class="muted pad">No schedule data.</p>`;
    }
    const det = this._activeDet(week);
    const entries = Object.entries(det.sets);
    const today = new Date().getDay();
    const todayKey = (['sunday','monday','tuesday','wednesday','thursday','friday','saturday'] as DayKey[])[today]!;
    // Shared color scale across every set so identical temps match everywhere.
    const temps: number[] = [];
    for (const [setKey, days] of entries) {
      for (const b of this._setBlocks(week, setKey, days)) {
        if (b.cool_temp != null) temps.push(b.cool_temp);
        if (b.heat_temp != null) temps.push(b.heat_temp);
      }
    }
    let lo = temps.length ? Math.min(...temps) : 70;
    let hi = temps.length ? Math.max(...temps) : 80;
    if (hi - lo < 6) { const mid = (hi + lo) / 2; lo = mid - 3; hi = mid + 3; }
    const small = det.granularity === 'days';
    const dirty = draftsChangeWeek(week, this._activeDet(week), this._schedDrafts);
    // Schedules with OFF gaps (authored in HA's native grid editor) are shown
    // read-only: the card's contiguous block model would silently convert the
    // inactive periods into active coverage on save (QA-R A1-3).
    const gaps = weekHasGaps(week);
    if (gaps) {
      return html`
        <div class="schedbody">
          ${entries.map(([setKey, days], ei) => {
            const rsegs = stripSegmentsFromRanges((week[days[0]!] ?? []) as TimeRange[]);
            const isToday = days.includes(todayKey);
            const label = SET_LABELS[setKey] ?? setKey.charAt(0).toUpperCase() + setKey.slice(1);
            return html`
              <p class="sethead">${label}${isToday ? html` <span class="today">today</span>` : nothing}</p>
              <div class="sstrip ${small ? 'small' : ''}">
                ${rsegs.map((s) => {
                  const w = ((s.toMin - s.fromMin) / 1440) * 100;
                  const t = s.block ? (s.block.cool_temp ?? s.block.heat_temp) : null;
                  return html`<span
                    class="sseg ro"
                    style="width:${w}%;background:${s.block && t != null ? tempColor(t, lo, hi) : 'var(--mzcs-track)'}"
                  >
                    <span class="segt">${s.block ? `${t ?? '–'}°` : 'Off'}</span>
                  </span>`;
                })}
              </div>
              ${!small || ei === entries.length - 1
                ? html`<div class="saxis">
                    <span>12A</span><span>4A</span><span>8A</span><span>12P</span><span>4P</span><span>8P</span><span>12A</span>
                  </div>`
                : nothing}
            `;
          })}
          <p class="muted pad">
            This schedule has inactive (off) periods set in Home Assistant's own editor. Edit it
            there - the card leaves it untouched to preserve those periods.
          </p>
        </div>
      `;
    }
    return html`
      <div class="schedbody">
        <div class="chips granchips">
          ${(
            [
              ['all', 'Every day'],
              ['wdwe', 'Weekday · Weekend'],
              ['days', 'Individual days'],
            ] as Array<[DayGranularity, string]>
          ).map(
            ([g, glabel]) => html`
              <button
                class=${det.granularity === g ? 'chip mode-on' : 'chip'}
                .disabled=${this._schedBusy}
                @click=${() => this._switchGranularity(g)}
              >
                ${glabel}
              </button>
            `,
          )}
        </div>
        ${entries.map(([setKey, days], ei) => {
          const blocks = this._setBlocks(week, setKey, days);
          const segs = stripSegments(blocks);
          const isToday = days.includes(todayKey);
          const hc = blocks.some((b) => b.mode === 'heat_cool');
          const label = SET_LABELS[setKey] ?? setKey.charAt(0).toUpperCase() + setKey.slice(1);
          const strip = html`
            <div class="sstrip ${small ? 'small' : ''} ${hc ? 'hc' : ''}">
              ${segs.map((s) => {
                const idx = blocks.indexOf(s.block);
                const sel =
                  !s.wrap && this._schedSel?.setKey === setKey && this._schedSel?.idx === idx;
                const w = ((s.toMin - s.fromMin) / 1440) * 100;
                const pick = () => {
                  this._schedSel = { setKey, idx };
                };
                if (hc) {
                  const ct = s.block.cool_temp, ht = s.block.heat_temp;
                  return html`
                    <button class="sseg hcseg ${sel ? 'sel' : ''}" style="width:${w}%" @click=${pick}>
                      <span class="hchalf" style="background:${ct != null ? tempColor(ct, lo, hi) : 'var(--mzcs-track)'}">
                        <span class="segt">${ct ?? '–'}°</span>
                        ${w > 15 && !small ? html`<span class="segn">${s.block.name}</span>` : nothing}
                      </span>
                      <span class="hchalf" style="background:${ht != null ? tempColor(ht, lo, hi) : 'var(--mzcs-track)'}">
                        <span class="segt">${ht ?? '–'}°</span>
                      </span>
                    </button>
                  `;
                }
                const t = s.block.cool_temp ?? s.block.heat_temp;
                return html`
                  <button
                    class="sseg ${sel ? 'sel' : ''}"
                    style="width:${w}%;background:${t != null ? tempColor(t, lo, hi) : 'var(--mzcs-track)'}"
                    @click=${pick}
                  >
                    <span class="segt">${t ?? '–'}°</span>
                    ${w > 9 && !small ? html`<span class="segn">${s.block.name}</span>` : nothing}
                  </button>
                `;
              })}
            </div>
          `;
          const showAxis = !small || ei === entries.length - 1;
          return html`
            <p class="sethead">
              ${label}${isToday ? html` <span class="today">today</span>` : nothing}
            </p>
            ${hc
              ? html`<div class="hcwrap">
                  <div class="hcgutter"><span class="gc">Cool</span><span class="gh">Heat</span></div>
                  ${strip}
                </div>`
              : strip}
            ${showAxis
              ? html`<div class="saxis ${hc ? 'indent' : ''}">
                  <span>12A</span><span>4A</span><span>8A</span><span>12P</span><span>4P</span><span>8P</span><span>12A</span>
                </div>`
              : nothing}
          `;
        })}
        ${this._renderBlockEditor(det)}
        ${this._schedNotice ? html`<p class="muted pad">${this._schedNotice}</p>` : nothing}
        ${this._schedError ? html`<p class="schederr pad">${this._schedError}</p>` : nothing}
        <div class="schedactions">
          ${dirty
            ? html`
                <button class="chip save" .disabled=${this._schedBusy}
                  @click=${() => void this._saveSchedDrafts()}>
                  ${this._schedBusy ? 'Saving…' : 'Save changes'}
                </button>
                <button class="chip" .disabled=${this._schedBusy} @click=${() => this._clearSchedEdit()}>
                  Discard
                </button>
              `
            : html`
                <button
                  class="chip"
                  .disabled=${this._schedBusy}
                  @click=${() => {
                    const marker = zoneEntityId('applied_block_marker', this._prefix, slugify(zone.name));
                    void applyScheduleNow(this.hass!, marker, automationEntityId(this._prefix, 'engine'));
                  }}
                >
                  Apply now
                </button>
                <span class="muted">Tap a block to edit. Changes apply at the next block; Apply now re-asserts immediately.</span>
              `}
        </div>
      </div>
    `;
  }

  private _renderBlockEditor(det: DetectedSets) {
    const sel = this._schedSel;
    const week = this._schedWeek;
    if (!sel || !week) return nothing;
    const days = det.sets[sel.setKey];
    if (!days) return nothing;
    const blocks = this._setBlocks(week, sel.setKey, days);
    const b = blocks[sel.idx];
    if (!b) return nothing;
    const mut = (fn: (d: ScheduleBlock[]) => void) => this._mutateDraft(sel.setKey, days, fn);
    const nudgeTime = (d: number) => {
      mut((blk) => {
        const cur = blk[sel.idx]!;
        const curMin = timeToMin(cur.time);
        const t = curMin + d;
        const loT = sel.idx > 0 ? timeToMin(blk[sel.idx - 1]!.time) + 15 : 0;
        // Never move a late-night block EARLIER because of the 23:45 cap:
        // a block already past the cap simply cannot advance (QA-R A1-6).
        const hiT = sel.idx < blk.length - 1 ? timeToMin(blk[sel.idx + 1]!.time) - 15 : Math.max(1425, curMin);
        cur.time = minToTime(Math.max(loT, Math.min(hiT, t)));
      });
    };
    const nudgeTemp = (field: 'cool_temp' | 'heat_temp', d: number) => {
      mut((blk) => {
        const cur = blk[sel.idx]!;
        // Unit-aware clamps (QA-R C2-1): hardcoded Fahrenheit bounds slam a
        // Celsius setpoint to 50. Values below 45 read as °C.
        const ref = cur[field] ?? cur.cool_temp ?? cur.heat_temp ?? 72;
        const celsius = ref < 45;
        const v = (cur[field] ?? (celsius ? 22 : 72)) + d;
        let loT = celsius ? 5 : 45;
        let hiT = celsius ? 35 : 95;
        if (cur.mode === 'heat_cool') {
          if (field === 'cool_temp' && cur.heat_temp != null) loT = cur.heat_temp + 2;
          if (field === 'heat_temp' && cur.cool_temp != null) hiT = cur.cool_temp - 2;
        }
        cur[field] = Math.max(loT, Math.min(hiT, v));
      });
    };
    const stepper = (label: string, value: string, minus: () => void, plus: () => void) => html`
      <div class="managerow">
        <span>${label}</span>
        <span class="stepgrp">
          <button class="stepbtn" @click=${minus}>−</button>
          <span class="stepval">${value}</span>
          <button class="stepbtn" @click=${plus}>+</button>
        </span>
      </div>
    `;
    return html`
      <div class="bedit">
        <div class="managerow">
          <span>Block name</span>
          <input
            class="bname-in"
            type="text"
            maxlength="40"
            .value=${b.name}
            @change=${(e: Event) =>
              mut((blk) => {
                // Bounded (0.7.7): the block name is part of the engine's
                // composed applied-block marker, which older installs store
                // in a 100-character input_text.
                blk[sel.idx]!.name = (e.target as HTMLInputElement).value.slice(0, 40);
              })}
          />
        </div>
        ${stepper('Starts', fmtTime(b.time), () => nudgeTime(-15), () => nudgeTime(15))}
        ${b.mode === 'heat_cool'
          ? html`
              ${stepper('Cool to', `${b.cool_temp ?? '–'}°`, () => nudgeTemp('cool_temp', -1), () => nudgeTemp('cool_temp', 1))}
              ${stepper('Heat to', `${b.heat_temp ?? '–'}°`, () => nudgeTemp('heat_temp', -1), () => nudgeTemp('heat_temp', 1))}
            `
          : b.mode === 'heat'
            ? stepper('Heat to', `${b.heat_temp ?? '–'}°`, () => nudgeTemp('heat_temp', -1), () => nudgeTemp('heat_temp', 1))
            : stepper('Cool to', `${b.cool_temp ?? '–'}°`, () => nudgeTemp('cool_temp', -1), () => nudgeTemp('cool_temp', 1))}
        <div class="bedit-actions">
          <button
            class="chip danger"
            .disabled=${blocks.length <= 1}
            @click=${() => {
              mut((blk) => {
                blk.splice(sel.idx, 1);
              });
              this._schedSel = undefined;
            }}
          >
            Remove
          </button>
          <button
            class="chip"
            @click=${() => {
              const next = sel.idx < blocks.length - 1 ? timeToMin(blocks[sel.idx + 1]!.time) : 1440;
              const cur = timeToMin(b.time);
              if (next - cur < 45) return;
              const t = minToTime(Math.round((cur + Math.max(30, (next - cur) / 2)) / 15) * 15);
              mut((blk) => {
                blk.splice(sel.idx + 1, 0, {
                  time: t,
                  name: 'New block',
                  mode: b.mode,
                  cool_temp: b.cool_temp,
                  heat_temp: b.heat_temp,
                });
              });
              this._schedSel = { setKey: sel.setKey, idx: sel.idx + 1 };
            }}
          >
            Add block after
          </button>
          <button class="chip" @click=${() => (this._schedSel = undefined)}>Close</button>
        </div>
      </div>
    `;
  }

  private _renderControls(entity: string) {
    if (!this.hass) return nothing;
    const hass = this.hass;
    const zone = this._zone();
    if (!zone) return nothing;
    const modes = hvacModes(hass, entity);
    const cur = hass.states[entity]?.state;
    // The chip mirrors the engine's stand-down gate: hidden when disabled,
    // and it toggles whichever preset the config names (default 'eco').
    const ecoPreset = resolveEcoPreset(this._config?.features);
    const eco = ecoPreset !== null && ecoSupported(hass, entity, ecoPreset);
    const ecoLabel = ecoPreset === 'eco' ? 'Eco' : (ecoPreset ?? '').charAt(0).toUpperCase() + (ecoPreset ?? '').slice(1);
    const timerId = zoneEntityId('fan_timer', this._prefix, slugify(zone.name));
    const fanDurations = this._config?.features?.fan_timer ?? [15, 30, 60];
    const hasTimer = entityExists(hass, timerId);
    return html`
      <button class="expander" @click=${() => (this._ctrlOpen = !this._ctrlOpen)}>
        <span>Mode</span>
        <span aria-hidden="true">${this._ctrlOpen ? '▴' : '▾'}</span>
      </button>
      ${this._ctrlOpen
        ? html`
            <div class="ctrl">
              <div class="chips">
                ${modes.map(
                  (m) => html`
                    <button
                      class=${cur === m ? 'chip mode-on' : 'chip'}
                      @click=${() => void setHvacMode(hass, entity, m)}
                    >
                      ${modeLabel(m)}
                    </button>
                  `,
                )}
                ${eco
                  ? html`
                      <button
                        class=${ecoActive(hass, entity, ecoPreset!) ? 'chip eco eco-on' : 'chip eco'}
                        @click=${() => void setEco(hass, entity, !ecoActive(hass, entity, ecoPreset!), ecoPreset!)}
                      >
                        ${ecoLabel}
                      </button>
                    `
                  : nothing}
              </div>
              ${hasTimer
                ? html`
                    <div class="chips fanrow">
                      <span class="fanlbl">Fan</span>
                      ${fanDurations.map(
                        (m) => html`
                          <button
                            class="chip"
                            @click=${() => void startFanTimer(hass, entity, timerId, m)}
                          >
                            ${m}m
                          </button>
                        `,
                      )}
                    </div>
                  `
                : nothing}
            </div>
          `
        : nothing}
    `;
  }

  private _renderRooms(zone: ZoneConfig, setpoint: number | null) {
    if (!this.hass || !zone.room_sensors || zone.room_sensors.length === 0) return nothing;
    const hass = this.hass;
    const { greenMax, amberMax } = sanitizeThresholds(
      numberHelperValue(hass, globalEntityId('dev_green_max', this._prefix)),
      numberHelperValue(hass, globalEntityId('dev_amber_max', this._prefix)),
    );
    const sensors = normalizeRoomSensors(zone.room_sensors);
    const display = resolveDisplay(this._config?.display);
    // Reference "now" from HA's own freshest report among this zone's entities,
    // so a wall tablet with a drifted clock cannot fake staleness (live QA).
    // Configured last_seen companions join the set: drift-immunity applies to
    // the age label as much as to the stale gate (item 36).
    const ref = reportReference(hass, [
      zone.entity,
      ...sensors.map((x) => x.entity),
      ...sensors.flatMap((x) => (x.last_seen ? [x.last_seen] : [])),
    ]);
    const steer = this._steeringFor(zone);
    const steerLabels = steer ? this._steerLabels(zone) : undefined;
    return html`
      <div class="rooms">
        ${sensors.map((rs) => {
          const reading = roomReading(hass, rs.entity, ref, {
            staleMs: display.staleMs,
            lastSeenEntity: rs.last_seen,
          });
          const r = { ...reading, name: rs.name?.trim() || reading.name };
          // Age label only when a companion is usable (ageMs present) and the
          // display setting says so. The 30s heartbeat re-renders it, but the
          // age is measured against the zone's server-derived reference, so it
          // ADVANCES only as some watched entity reports - the same
          // drift-immunity trade the stale gate has always made. A zone frozen
          // wholesale freezes its ages along with everything else on the card.
          const age = ageVisible(display.lastSeen, r.ageMs, display.ageingMs)
            ? html`<span
                class="agechip ${ageing(r.ageMs, display.ageingMs) ? 'ageing' : ''}"
                title="Last seen ${formatAge(r.ageMs!)}${formatAge(r.ageMs!) === 'now' ? '' : ' ago'} - the device's own last report time."
                >${formatAge(r.ageMs!)}</span
              >`
            : nothing;
          // Steering (item 8): tap a room to steer the zone toward it. The
          // label comes from the shared steeringRooms builder so it always
          // matches an option of the generated select (sanitization included).
          const steerLabel = steerLabels?.get(rs.entity);
          const isSteering = Boolean(steer?.active && steerLabel != null && steer.label === steerLabel);
          const sheetOpen =
            steer && this._steerSheet && this._steerSheet.zone === steer.slug && this._steerSheet.room === rs.entity;
          // A stale/unreadable sensor refuses to START an override (spec §4) -
          // visibly: the row stays inert and says why on tap-target hover.
          // Steering is Fahrenheit-only in v1 (its band helpers are bounded
          // 50-95 and the automation's clamp floors at 68): a Celsius zone
          // (setpoint reads below 45, the block editor's own unit heuristic)
          // must not open a sheet that would arm an override it cannot mean
          // (0.7.7 review C4).
          const fahrenheit = setpoint != null && setpoint >= 45;
          const canOpen = Boolean(steer && steerLabel != null && !isSteering && !r.stale && r.temp != null && fahrenheit);
          const openSheet = () => {
            if (canOpen) this._openSteerSheet(zone, rs.entity, steerLabel!, setpoint);
          };
          const steerChip = isSteering
            ? html`<span class="steerchip" title="Steering this room to the override target.">
                  steering${this._steerRemaining(steer?.finishesAt) ? ` · ${this._steerRemaining(steer?.finishesAt)}` : ''}</span
                ><button
                  class="steercancel"
                  title="Cancel this override - the schedule takes the zone back."
                  @click=${(e: Event) => {
                    e.stopPropagation();
                    void this._cancelSteer(zone);
                  }}
                >
                  ✕
                </button>`
            : nothing;
          const row =
            r.temp == null || setpoint == null || r.stale
              ? html`
                  <div
                    class="room ${isSteering ? 'steering' : ''}"
                    title=${r.stale
                      ? 'This sensor has not reported recently - the reading below may be out of date, so steering to it is refused.'
                      : nothing}
                  >
                    <span class="rname">${r.name}</span>
                    <span class="rtemp muted">
                      ${steerChip}${age}${r.temp == null
                        ? '—'
                        : r.stale
                          ? html`<span class="stalechip">stale</span>${formatRoomTemp(r.temp)}°`
                          : `${formatRoomTemp(r.temp)}°`}
                    </span>
                  </div>
                `
              : html`
                  <div
                    class="room ${isSteering ? 'steering' : ''} ${canOpen ? 'steerable' : ''}"
                    @click=${openSheet}
                  >
                    <span class="rname">${r.name}</span>
                    <span>
                      ${steerChip}${age}<span
                        class="badge ${deviationColor(Math.round(r.temp - setpoint), greenMax, amberMax)}"
                        >${formatDelta(Math.round(r.temp - setpoint))}</span
                      >
                      <span class="rtemp">${formatRoomTemp(r.temp)}°</span>
                    </span>
                  </div>
                `;
          return html`${row}${sheetOpen && steerLabel != null ? this._renderSteerSheet(zone, steerLabel) : nothing}`;
        })}
        ${steer?.active && ![...(steerLabels?.values() ?? [])].includes(steer.label)
          ? html`
              <!-- QA finding 8: a room renamed/removed mid-override must not
                   hide the only cancel affordance while the override keeps
                   driving the thermostat. -->
              <div class="room steering">
                <span class="rname">${steer.label}</span>
                <span>
                  <span class="steerchip" title="An override is active for a room no longer in this zone's config.">
                    steering${this._steerRemaining(steer.finishesAt) ? ` · ${this._steerRemaining(steer.finishesAt)}` : ''}</span
                  ><button
                    class="steercancel"
                    title="Cancel this override - the schedule takes the zone back."
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      void this._cancelSteer(zone);
                    }}
                  >
                    ✕
                  </button>
                </span>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private _renderSteerSheet(zone: ZoneConfig, roomLabel: string) {
    const hass = this.hass;
    if (!hass) return nothing;
    const enabledId = zoneEntityId('zone_enabled', this._prefix, slugify(zone.name));
    const zoneOff = hass.states[enabledId]?.state !== 'on';
    const preset = resolveEcoPreset(this._config?.features);
    const standby = preset !== null && hass.states[zone.entity]?.attributes.preset_mode === preset;
    const notCool = hass.states[zone.entity]?.state !== 'cool';
    const refusal = zoneOff
      ? 'Zone scheduling is switched off - the kill switch outranks steering.'
      : standby
        ? `The '${preset}' standby preset is active - steering never overrides standby.`
        : null;
    return html`
      <div class="steersheet">
        <p class="steertitle">Steer this zone until ${roomLabel} reaches:</p>
        <div class="steerrow">
          <button class="ctl" @click=${() => (this._steerTemp = Math.max(50, this._steerTemp - 1))}>−</button>
          <span class="steerval">${this._steerTemp}°</span>
          <button class="ctl" @click=${() => (this._steerTemp = Math.min(95, this._steerTemp + 1))}>+</button>
          <span class="steergap"></span>
          <button class="ctl" @click=${() => (this._steerMins = Math.max(15, this._steerMins - 15))}>−</button>
          <span class="steerval">${this._steerMins} min</span>
          <button class="ctl" @click=${() => (this._steerMins = Math.min(480, this._steerMins + 15))}>+</button>
        </div>
        <p class="muted" style="font-size:10px;margin:4px 0 0;">
          The rest of the zone may overshoot while this room catches up - that is the point.
          It reverts to the schedule when the time is up.${notCool
            ? ' Note: steering only acts while the zone is on a cooling block.'
            : ''}
        </p>
        ${refusal ? html`<p class="steerrefusal">${refusal}</p>` : nothing}
        ${this._steerError ? html`<p class="steerrefusal">${this._steerError}</p>` : nothing}
        <div class="steerrow">
          <button
            class="steerstart"
            ?disabled=${Boolean(refusal)}
            @click=${() => void this._startSteer(zone, roomLabel)}
          >
            Start
          </button>
          <button class="steerclose" @click=${() => (this._steerSheet = undefined)}>Close</button>
        </div>
      </div>
    `;
  }

  static styles = css`
    :host {
      --mzcs-accent: #1e88e5;
      --mzcs-accent-bright: #42a5f5;
      --mzcs-good: #2bb673;
      --mzcs-warn: #f59e0b;
      --mzcs-bad: #e5484d;
      --mzcs-bg: #1c262e;
      --mzcs-surface: #243039;
      --mzcs-chip: #2b3844;
      --mzcs-track: #16202a;
      --mzcs-border: #3d4a55;
      --mzcs-text: #e8edf1;
      --mzcs-text-dim: #9fb0bd;
    }
    ha-card {
      background: var(--mzcs-bg);
    }
    .wrap {
      padding: 12px;
      color: var(--mzcs-text);
    }
    .tabs {
      display: flex;
      gap: 4px;
      background: var(--mzcs-track);
      border-radius: 10px;
      padding: 3px;
      margin-bottom: 12px;
    }
    .tab {
      flex: 1;
      padding: 8px 0;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: var(--mzcs-text-dim);
      font-size: 12px;
      cursor: pointer;
    }
    .tab.on {
      background: var(--mzcs-chip);
      color: var(--mzcs-text);
      font-weight: 500;
    }
    .hero {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--mzcs-surface);
      border-radius: 12px;
      padding: 12px 14px;
    }
    .dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--mzcs-text-dim);
      flex: none;
    }
    .dot.cool {
      background: var(--mzcs-accent);
    }
    .dot.heat {
      background: var(--mzcs-warn);
    }
    .mid {
      flex: 1;
      min-width: 0;
    }
    .name {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
    }
    .status {
      margin: 0;
      font-size: 12px;
      color: var(--mzcs-text-dim);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .fan {
      color: var(--mzcs-accent);
    }
    .nudge {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 0.5px solid var(--mzcs-border);
      background: var(--mzcs-chip);
      color: var(--mzcs-text);
      font-size: 18px;
      cursor: pointer;
      flex: none;
    }
    .set {
      font-size: 24px;
      font-weight: 500;
      width: 36px;
      text-align: center;
      flex: none;
    }
    .expander {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: none;
      border: none;
      color: var(--mzcs-text-dim);
      font-size: 12px;
      padding: 10px 4px 6px;
      cursor: pointer;
    }
    .ctrl {
      padding: 2px 2px 8px;
    }
    .chips {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .chip {
      padding: 6px 12px;
      border-radius: 14px;
      background: var(--mzcs-chip);
      border: 0.5px solid var(--mzcs-border);
      color: var(--mzcs-text-dim);
      font-size: 12px;
      cursor: pointer;
    }
    .chip.mode-on {
      background: var(--mzcs-accent);
      border-color: var(--mzcs-accent);
      color: #fff;
    }
    .chip.eco {
      border-color: var(--mzcs-good);
      color: var(--mzcs-good);
    }
    .chip.eco-on {
      background: var(--mzcs-good);
      color: #fff;
    }
    .fanrow {
      margin-top: 8px;
      align-items: center;
    }
    .fanlbl {
      font-size: 12px;
      color: var(--mzcs-text-dim);
      padding: 6px 0;
    }
    .rooms {
      border-top: 0.5px solid var(--mzcs-border);
      margin-top: 6px;
    }
    .room {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      padding: 8px 2px;
      border-bottom: 0.5px solid var(--mzcs-border);
      font-size: 13px;
    }
    /* 300px discipline (items 36/31): the room NAME is what gives - it
       truncates - while the age chip + badge + reading stay on one line.
       Without min-width:0 a long single-word name refuses to shrink and
       pushes the row wider than the card; without nowrap the temperature
       wraps under its badge. */
    .room .rname {
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .room > span:last-child {
      flex: 0 0 auto;
      white-space: nowrap;
    }
    .room:last-child {
      border-bottom: none;
    }
    .rtemp {
      font-size: 14px;
    }
    .muted {
      color: var(--mzcs-text-dim);
    }
    .badge {
      font-size: 11px;
      border-radius: 9px;
      padding: 2px 7px;
      margin-right: 8px;
      color: #16202a;
    }
    .badge.green {
      background: var(--mzcs-good);
    }
    .badge.amber {
      background: var(--mzcs-warn);
    }
    .badge.red {
      background: var(--mzcs-bad);
    }
    .tab.gear {
      flex: 0 0 40px;
      font-size: 14px;
    }
    .setup {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: flex-start;
    }
    .setup-title {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
    }
    .setup-sub {
      margin: 0;
      font-size: 12px;
      color: var(--mzcs-text-dim);
    }
    .setup-err {
      color: var(--mzcs-bad);
      font-size: 12px;
    }
    .planwrap {
      width: 100%;
      max-height: 320px;
      overflow-y: auto;
      border: 0.5px solid var(--mzcs-border);
      border-radius: 10px;
      padding: 8px 10px;
    }
    .plan-h {
      margin: 6px 0 2px;
      font-size: 13px;
      font-weight: 500;
    }
    .plan-h.del {
      color: var(--mzcs-bad);
    }
    .plan-h.quiet {
      color: var(--mzcs-text-dim);
      font-weight: 400;
    }
    .plan-list {
      margin: 0 0 4px;
      padding-left: 18px;
      font-size: 11px;
      color: var(--mzcs-text-dim);
    }
    .plan-list.del li {
      color: var(--mzcs-bad);
    }
    .cwwrap {
      width: 100%;
      border: 0.5px solid var(--mzcs-border);
      border-radius: 10px;
      padding: 8px 10px;
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: flex-start;
    }
    .cw-h {
      margin: 2px 0 0;
      font-size: 13px;
      font-weight: 500;
    }
    .cw-h.bad {
      color: var(--mzcs-bad);
    }
    .cw-h.warn {
      color: var(--mzcs-warn);
    }
    .cw-h.ok {
      color: var(--mzcs-text-dim);
      font-weight: 400;
    }
    .cw-list {
      margin: 0;
      padding-left: 18px;
      font-size: 11px;
      width: 100%;
      box-sizing: border-box;
    }
    .cw-list li {
      margin-bottom: 3px;
    }
    .cw-src {
      display: block;
      color: var(--mzcs-text);
      word-break: break-word;
    }
    .cw-det {
      display: block;
      color: var(--mzcs-text-dim);
      word-break: break-word;
    }
    .cw-foot {
      margin: 2px 0 0;
      font-size: 11px;
      color: var(--mzcs-text-dim);
    }
    .applyrow {
      display: flex;
      gap: 8px;
      margin-top: 4px;
    }
    .granchips {
      margin: 6px 0 2px;
      flex-wrap: wrap;
      gap: 6px;
    }
    .chip.danger {
      background: var(--mzcs-bad);
      border-color: var(--mzcs-bad);
      color: #fff;
    }
    .plan-list.exec-log {
      max-height: 160px;
      overflow-y: auto;
      width: 100%;
      box-sizing: border-box;
    }
    .schedrow {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--mzcs-surface);
      border: none;
      border-radius: 12px;
      color: var(--mzcs-text);
      font-size: 12px;
      padding: 10px 12px;
      margin-top: 10px;
      cursor: pointer;
    }
    .season {
      color: var(--mzcs-warn);
    }
    .schedbody {
      background: var(--mzcs-surface);
      border-radius: 0 0 12px 12px;
      padding: 4px 12px 10px;
      margin-top: -8px;
    }
    .sethead {
      margin: 8px 0 2px;
      font-size: 12px;
      font-weight: 500;
    }
    .today {
      font-size: 10px;
      color: var(--mzcs-accent);
      font-weight: 400;
    }
    .sstrip {
      display: flex;
      height: 46px;
      border-radius: 9px;
      overflow: hidden;
      border: 0.5px solid var(--mzcs-border);
      flex: 1;
    }
    .sstrip.small {
      height: 32px;
    }
    .sstrip.hc {
      height: 58px;
    }
    .sseg {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #fff;
      min-width: 0;
      position: relative;
      border: none;
      border-right: 0.5px solid rgba(0, 0, 0, 0.35);
      padding: 0;
      cursor: pointer;
      font: inherit;
    }
    .sseg:last-child {
      border-right: none;
    }
    .sseg.ro {
      cursor: default;
    }
    .sseg.sel::after {
      content: '';
      position: absolute;
      inset: 0;
      border: 2px solid #fff;
      pointer-events: none;
    }
    .segt {
      font-size: 13px;
      font-weight: 700;
      line-height: 1.1;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
    }
    .sstrip.small .segt {
      font-size: 11px;
    }
    .segn {
      font-size: 9px;
      opacity: 0.9;
      white-space: nowrap;
      overflow: hidden;
      max-width: 94%;
      text-overflow: ellipsis;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
    }
    .hcseg {
      background: transparent;
    }
    .hchalf {
      flex: 1;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      min-height: 0;
    }
    .hchalf .segt {
      font-size: 11.5px;
    }
    .hcwrap {
      display: flex;
      align-items: stretch;
      gap: 5px;
    }
    .hcgutter {
      width: 34px;
      display: flex;
      flex-direction: column;
      border-radius: 7px;
      overflow: hidden;
    }
    .hcgutter span {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      background: var(--mzcs-chip);
    }
    .hcgutter .gc {
      color: #6fb1ff;
    }
    .hcgutter .gh {
      color: #e8843c;
    }
    .saxis {
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: var(--mzcs-text-dim);
      margin-top: 2px;
      padding: 0 1px;
    }
    .saxis.indent {
      margin-left: 39px;
    }
    .bedit {
      background: var(--mzcs-chip);
      border: 0.5px solid var(--mzcs-border);
      border-radius: 10px;
      padding: 8px 10px;
      margin-top: 10px;
    }
    .bedit .managerow {
      padding: 4px 0;
    }
    .bname-in {
      background: var(--mzcs-track);
      border: 0.5px solid var(--mzcs-border);
      border-radius: 6px;
      color: var(--mzcs-text);
      padding: 5px 8px;
      font-size: 12px;
      width: 130px;
    }
    .stepgrp {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .stepbtn {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 0.5px solid var(--mzcs-border);
      background: var(--mzcs-track);
      color: var(--mzcs-text);
      font-size: 15px;
      cursor: pointer;
      line-height: 1;
    }
    .stepval {
      min-width: 62px;
      text-align: center;
      font-size: 12.5px;
      font-weight: 600;
    }
    .bedit-actions {
      display: flex;
      gap: 8px;
      margin-top: 8px;
      flex-wrap: wrap;
    }
    .chip.save {
      background: var(--mzcs-accent);
      border-color: var(--mzcs-accent);
      color: #fff;
    }
    .schedactions {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 8px;
      font-size: 11px;
    }
    .pad {
      padding: 8px 12px;
    }
    .schederr {
      color: var(--mzcs-bad);
      font-size: 12px;
    }
    .managerow {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      font-size: 12px;
      padding: 3px 0;
    }
    .rt-b {
      color: var(--mzcs-text);
      font-weight: 500;
    }
    .verdict.normal {
      color: var(--mzcs-good);
    }
    .verdict.high {
      color: var(--mzcs-warn);
    }
    .verdict.learning {
      color: var(--mzcs-text-dim);
    }
    .cols {
      display: flex;
      align-items: flex-end;
      gap: 2px;
      height: 64px;
    }
    .col {
      flex: 1;
      border-radius: 2px 2px 0 0;
      background: var(--mzcs-accent);
      display: block;
    }
    .pillrow {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
      font-size: 12px;
    }
    .pill-label {
      width: 56px;
      flex: none;
    }
    .pill-track {
      flex: 1;
      height: 12px;
      border-radius: 6px;
      background: var(--mzcs-track);
      overflow: hidden;
      display: block;
    }
    .pill-fill {
      display: block;
      height: 12px;
      border-radius: 6px;
      background: var(--mzcs-accent);
    }
    .pill-fill.today-fill {
      background: var(--mzcs-accent-bright);
    }
    .pill-hours {
      width: 48px;
      text-align: right;
      flex: none;
    }
    button.pillrow {
      width: 100%;
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      text-align: left;
    }
    .daydetail {
      padding: 14px 2px 6px;
    }
    .bubblerow {
      position: relative;
      height: 14px;
    }
    .bubble {
      position: absolute;
      top: -10px;
      width: 20px;
      height: 20px;
      margin-left: -10px;
      border-radius: 50%;
      background: var(--mzcs-accent);
      color: #fff;
      font-size: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .segtrack {
      position: relative;
      height: 12px;
      border-radius: 6px;
      background: var(--mzcs-track);
      overflow: hidden;
    }
    .seg {
      position: absolute;
      top: 0;
      height: 12px;
      background: var(--mzcs-accent);
      display: block;
    }
    .axis {
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: var(--mzcs-text-dim);
      margin-top: 2px;
    }
    .managerow.master {
      font-weight: 500;
    }
    .swatch {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 6px;
      vertical-align: -1px;
    }
    .managerow input[type='color'] {
      width: 44px;
      height: 26px;
      padding: 1px;
    }
    .chip.togg {
      min-width: 44px;
    }
    .chip.togg.on {
      background: var(--mzcs-good);
      border-color: var(--mzcs-good);
      color: #fff;
    }
    .setuphead {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 8px;
    }
    .settabs {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      background: var(--mzcs-track);
      border-radius: 10px;
      padding: 3px;
      margin-bottom: 10px;
    }
    .settab {
      flex: 1 1 auto;
      background: transparent;
      border: 0;
      border-radius: 8px;
      color: var(--mzcs-muted);
      font-size: 12px;
      padding: 6px 8px;
      cursor: pointer;
    }
    .settab.on {
      background: var(--mzcs-surface);
      color: var(--mzcs-text);
    }
    /* The danger tab is visually set apart at rest, not just when selected. */
    .settab.dangertab {
      color: var(--mzcs-bad);
    }
    .settab.on.danger {
      background: var(--mzcs-bad);
      color: #fff;
    }
    .danger-lead {
      border-left: 2px solid var(--mzcs-bad);
      padding-left: 8px;
    }
    .confirmrow {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin: 8px 0;
      font-size: 12px;
      color: var(--mzcs-muted);
    }
    .confirmrow code {
      color: var(--mzcs-text);
      background: var(--mzcs-track);
      border-radius: 4px;
      padding: 1px 4px;
    }
    .confirmrow input {
      background: var(--mzcs-track);
      border: 1px solid var(--mzcs-bad);
      border-radius: 6px;
      color: var(--mzcs-text);
      padding: 6px 8px;
      font-size: 13px;
    }
    .objrow {
      display: grid;
      width: 100%;
      box-sizing: border-box;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 0 8px;
      align-items: center;
      padding: 6px 0;
      border-bottom: 0.5px solid var(--mzcs-border);
      cursor: pointer;
    }
    .objname {
      font-size: 13px;
      color: var(--mzcs-text);
    }
    .objid {
      grid-column: 1;
      font-size: 10px;
      color: var(--mzcs-muted);
      word-break: break-all;
    }
    .objstat {
      grid-row: 1 / span 2;
      grid-column: 2;
      justify-self: end;
      align-self: center;
      font-size: 10px;
      border-radius: 999px;
      padding: 2px 7px;
      white-space: nowrap;
    }
    .objstat.ok {
      background: var(--mzcs-good);
      color: #16202a;
    }
    .objstat.warn {
      background: var(--mzcs-warn);
      color: #16202a;
    }
    .objstat.del {
      background: var(--mzcs-bad);
      color: #fff;
    }
    .schedrow.unsaved {
      border-left: 2px solid var(--mzcs-warn);
    }
    .unsavedchip {
      font-size: 10px;
      border-radius: 999px;
      padding: 1px 6px;
      margin-left: 6px;
      background: var(--mzcs-warn);
      color: #16202a;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .opchip {
      font-size: 10px;
      border-radius: 999px;
      padding: 1px 6px;
      margin-left: 6px;
      background: var(--mzcs-accent);
      color: #16202a;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      cursor: pointer;
    }
    .opchip.paused {
      background: transparent;
      color: var(--mzcs-muted);
      border: 1px solid var(--mzcs-muted);
    }
    .room.steerable {
      cursor: pointer;
    }
    .room.steering {
      background: rgba(30, 136, 229, 0.14);
      border-radius: 8px;
    }
    .steerchip {
      font-size: 10px;
      border-radius: 999px;
      padding: 1px 6px;
      margin-right: 6px;
      background: var(--mzcs-accent);
      color: #16202a;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .steercancel {
      background: none;
      border: none;
      color: var(--mzcs-text-dim);
      cursor: pointer;
      font-size: 12px;
      padding: 0 4px;
    }
    .steersheet {
      background: var(--mzcs-surface);
      border: 1px solid var(--mzcs-border);
      border-radius: 10px;
      padding: 10px;
      margin: 4px 0 8px;
    }
    .steertitle {
      margin: 0 0 6px;
      font-size: 12px;
      color: var(--mzcs-text);
    }
    .steerrow {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
    }
    .steerval {
      min-width: 52px;
      text-align: center;
      font-weight: 600;
    }
    .steergap {
      flex: 1;
    }
    .ctl {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 1px solid var(--mzcs-border);
      background: var(--mzcs-chip);
      color: var(--mzcs-text);
      cursor: pointer;
      font-size: 14px;
    }
    .steerrefusal {
      margin: 6px 0 0;
      font-size: 11px;
      color: var(--mzcs-warn);
    }
    .steerstart {
      background: var(--mzcs-accent);
      color: #16202a;
      border: none;
      border-radius: 8px;
      padding: 6px 16px;
      font-weight: 600;
      cursor: pointer;
    }
    .steerstart:disabled {
      opacity: 0.4;
      cursor: default;
    }
    .steerclose {
      background: var(--mzcs-chip);
      color: var(--mzcs-text);
      border: 1px solid var(--mzcs-border);
      border-radius: 8px;
      padding: 6px 12px;
      cursor: pointer;
    }
    .dprows {
      background: var(--mzcs-surface);
      border: 1px solid var(--mzcs-border);
      border-radius: 10px;
      padding: 10px;
      margin: 4px 0 8px;
    }
    .dprow {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 4px 0;
    }
    .dprow input,
    .dprow select {
      background: var(--mzcs-track);
      color: var(--mzcs-text);
      border: 1px solid var(--mzcs-border);
      border-radius: 6px;
      padding: 4px 6px;
    }
    .cfgcallout {
      background: var(--mzcs-surface);
      border: 1px solid var(--mzcs-accent);
      border-radius: 10px;
      padding: 8px 10px;
      font-size: 12px;
      color: var(--mzcs-text);
      margin: 0 0 8px;
    }
    .cfgtabs {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 0 0 8px;
    }
    .cfgtab {
      background: var(--mzcs-chip);
      color: var(--mzcs-text-dim);
      border: 1px solid var(--mzcs-border);
      border-radius: 999px;
      padding: 3px 10px;
      font-size: 11px;
      cursor: pointer;
    }
    .cfgtab.on {
      background: var(--mzcs-accent);
      color: #16202a;
      border-color: var(--mzcs-accent);
    }
    .cfgrow {
      padding: 6px 2px;
      border-bottom: 1px solid var(--mzcs-track);
    }
    .cfgmain {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      align-items: baseline;
    }
    .cfglabel {
      color: var(--mzcs-text);
      font-size: 13px;
    }
    .cfgvalue {
      color: var(--mzcs-text-dim);
      font-size: 12px;
      text-align: right;
      overflow-wrap: anywhere;
    }
    .cfgdetail {
      margin: 2px 0 0;
      font-size: 11px;
      color: var(--mzcs-text-dim);
      overflow-wrap: anywhere;
    }
    .unsavedhint {
      font-size: 11px;
      margin: 4px 2px 0;
      color: var(--mzcs-warn);
    }
    .rt-fail {
      font-size: 11px;
      margin: 6px 0;
      color: var(--mzcs-warn);
    }
    .diagopt {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12.5px;
      color: var(--mzcs-text-dim);
      margin: 6px 0;
    }
    .diagbox {
      width: 100%;
      min-height: 150px;
      margin-top: 8px;
      background: var(--mzcs-track);
      color: var(--mzcs-text);
      border: 0.5px solid var(--mzcs-border);
      border-radius: 6px;
      padding: 8px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 11px;
      line-height: 1.45;
      resize: vertical;
      white-space: pre;
    }
    .stalechip {
      font-size: 10px;
      border-radius: 999px;
      padding: 1px 6px;
      margin-right: 6px;
      background: var(--mzcs-track);
      border: 0.5px solid var(--mzcs-border);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    /* Item 36: last-seen age. Muted so a healthy row stays quiet; amber once
       past the ageing threshold. Sized like the stale chip so the two never
       fight for the row's height. */
    .agechip {
      font-size: 10px;
      border-radius: 999px;
      padding: 1px 6px;
      margin-right: 6px;
      color: var(--mzcs-text-dim);
      background: var(--mzcs-track);
      border: 0.5px solid var(--mzcs-border);
      letter-spacing: 0.03em;
    }
    .agechip.ageing {
      color: var(--mzcs-warn);
      border-color: var(--mzcs-warn);
    }
    .managerow input,
    .managerow select {
      width: 90px;
      background: var(--mzcs-track);
      border: 0.5px solid var(--mzcs-border);
      border-radius: 6px;
      color: var(--mzcs-text);
      padding: 4px 6px;
      font-size: 12px;
    }
  `;
}

declare global {
  interface Window {
    customCards?: Array<{ type: string; name: string; description: string; preview?: boolean }>;
  }
}

window.customCards = window.customCards ?? [];
window.customCards.push({
  type: CARD_TYPE,
  name: CARD_NAME,
  description:
    'Multi-zone climate view for 1-4 zones with seasonal scheduling, fan timers, and runtime history.',
});
