import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CARD_TYPE, CARD_NAME, CARD_VERSION } from './const';
import type { MzcsCardConfig, ZoneConfig } from './types';
import type { HassLike } from './ha-types';
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
  setHvacMode,
  setEco,
  startFanTimer,
  clampSetpoint,
  fetchScheduleConfig,
  updateScheduleWeek,
  applyScheduleNow,
  errorText,
  setNumberHelper,
  selectOption,
  setZoneEnabled,
  fetchDailyRuntime,
  fetchDayHistory,
  type DailyRuntime,
} from './ha-adapter';
import {
  formatHoursQuarter,
  extractRunSegments,
  extractSetpointChanges,
  segmentToPct,
  type Segment,
  type SetpointChange,
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
import type { GlobalClass } from './lib/naming';

const MANAGE_TUNABLES: Array<{ cls: GlobalClass; label: string }> = [
  { cls: 'dev_green_max', label: 'Room deviation · green up to (°)' },
  { cls: 'dev_amber_max', label: 'Room deviation · amber up to (°)' },
  { cls: 'runtime_alert_margin', label: 'Runtime alert margin (%)' },
  { cls: 'runtime_alert_days', label: 'Runtime alert · consecutive days' },
  { cls: 'runtime_learn_days', label: 'Runtime learn window (days)' },
  { cls: 'cdd_base', label: 'Cooling degree-day base (°)' },
  { cls: 'season_confirm_days', label: 'Season switch · confirm after (days)' },
  { cls: 'season_dwell_days', label: 'Season switch · min dwell (days)' },
];
import {
  detectSets,
  rangesToDayBlocks,
  nextBlockAfter,
  replaceSetBlocks,
  stripSegments,
  timeToMin,
  minToTime,
  type Week,
  type DetectedSets,
} from './lib/schedule-view';
import type { DayKey, TimeRange, ScheduleBlock } from './lib/schedule-ranges';

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
import { slugify, zoneEntityId, globalEntityId } from './lib/naming';
import { deviationColor, formatDelta, sanitizeThresholds } from './lib/deviation';
import { buildDesired, plan, actionable, type Plan, type ProvisionInput } from './lib/provisioning';
import { defaultSchedules } from './lib/default-schedules';
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
  @state() private _rtOpen = false;
  @state() private _rtDaily?: DailyRuntime[];
  private _rtLoadedFor?: string;
  @state() private _rtDayOpen: number | null = null;
  @state() private _rtDayDetail?: { segs: Segment[]; bubs: SetpointChange[]; start: number; end: number };
  @state() private _rtDayLoading = false;
  private _rtDayCache = new Map<number, { segs: Segment[]; bubs: SetpointChange[]; start: number; end: number }>();
  @state() private _rtRange: 7 | 30 = 7;
  @state() private _rt30?: DailyRuntime[];
  @state() private _dryRun?: Plan;
  @state() private _dryRunError?: string;
  @state() private _dryRunning = false;
  @state() private _execConfirm = false;
  @state() private _execRunning = false;
  @state() private _execLog: string[] = [];
  @state() private _execResult?: ExecResult;

  public setConfig(config: MzcsCardConfig): void {
    if (!config.zones || !Array.isArray(config.zones) || config.zones.length < 1) {
      throw new Error('At least one zone with a climate entity is required.');
    }
    if (config.zones.length > 4) {
      throw new Error('A maximum of 4 zones is supported.');
    }
    for (const z of config.zones) {
      if (!z.entity || !z.entity.startsWith('climate.')) {
        throw new Error(`Zone "${z.name ?? z.entity}" needs a climate.* entity.`);
      }
    }
    this._config = config;
    if (this._zoneIndex >= config.zones.length) this._zoneIndex = 0;
  }

  public static async getConfigElement(): Promise<HTMLElement> {
    await import('./editor');
    return document.createElement('multizone-climate-scheduler-card-editor');
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
    const zones = cfg.zones.map((z) => ({ slug: slugify(z.name), name: z.name, climate: z.entity }));
    const seasons = cfg.seasons ?? [
      { key: 'summer', name: 'Summer', default_mode: 'cool' as const },
      { key: 'winter', name: 'Winter', default_mode: 'heat_cool' as const },
    ];
    return {
      prefix: this._prefix,
      zones,
      seasons,
      schedules: defaultSchedules(
        zones.map((z) => z.slug),
        seasons,
      ),
      features: {
        fan_timer: (this._config?.features?.fan_timer?.length ?? 3) > 0,
        anomaly_alerts: this._config?.features?.anomaly_alerts ?? true,
        steering: false,
        fan_guard: this._config?.features?.fan_guard,
      },
    };
  }

  private async _runDryRun(): Promise<void> {
    if (!this.hass || this._dryRunning) return;
    this._dryRunning = true;
    this._dryRunError = undefined;
    try {
      const input = this._provisionInput();
      const existing = await fetchExisting(
        this.hass,
        input.prefix,
        input.zones.map((z) => z.slug),
        input.seasons.map((s) => s.key),
      );
      this._dryRun = plan(buildDesired(input), existing);
      this._execConfirm = false;
      this._execResult = undefined;
      this._execLog = [];
    } catch (e) {
      this._dryRunError = e instanceof Error ? e.message : String(e);
    } finally {
      this._dryRunning = false;
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
      const zoneRefs = cfg.zones.map((z) => ({
        slug: slugify(z.name),
        name: z.name,
        climate: z.entity,
      }));
      const result = await executePlan(hass, p, {
        prefix: input.prefix,
        zones: zoneRefs,
        seasons: input.seasons,
        fanGuard: cfg.features?.fan_guard,
        log: (line) => {
          this._execLog = [...this._execLog, line];
        },
      });
      this._execResult = result;
      // Verify step of the universal change-set rule: replan against the live
      // registry so the user sees what actually landed.
      const existing = await fetchExisting(
        hass,
        input.prefix,
        input.zones.map((z) => z.slug),
        input.seasons.map((s) => s.key),
      );
      this._dryRun = plan(buildDesired(input), existing);
    } catch (e) {
      this._execLog = [...this._execLog, `ERROR: ${e instanceof Error ? e.message : String(e)}`];
    } finally {
      this._execRunning = false;
    }
  }

  private _renderSetup() {
    const p = this._dryRun;
    return html`
      <div class="setup">
        <p class="setup-title">Setup</p>
        <p class="setup-sub">
          Preview first, then apply. Nothing is written until you confirm; existing schedules and
          customized automations are never overwritten.
        </p>
        <button class="chip" .disabled=${this._dryRunning} @click=${() => void this._runDryRun()}>
          ${this._dryRunning ? 'Reading registry…' : 'Run dry-run preview'}
        </button>
        ${this._dryRunError ? html`<p class="setup-err">${this._dryRunError}</p>` : nothing}
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
        ${this._renderManage()}
        <button class="chip" @click=${() => (this._setupOpen = false)}>Close</button>
      </div>
    `;
  }

  private _renderApply(p: Plan) {
    const n = actionable(p).length;
    const done = this._execResult;
    return html`
      ${n > 0 && !this._execRunning && !done
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
              <button class="chip" @click=${() => (this._execConfirm = true)}>
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

  private _renderManage() {
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
    if (!season && rows.length === 0) return nothing;
    const zones = (this._config?.zones ?? []).map((z) => {
      const slug = slugify(z.name);
      return {
        name: z.name,
        enableId: zoneEntityId('zone_enabled', this._prefix, slug),
        markerId: zoneEntityId('applied_block_marker', this._prefix, slug),
      };
    }).filter((z) => entityExists(hass, z.enableId));
    const allOn = zones.length > 0 && zones.every((z) => hass.states[z.enableId]?.state === 'on');
    return html`
      <p class="setup-title" style="margin-top:12px;">Manage</p>
      ${zones.length > 0
        ? html`
            <div class="managerow master">
              <span>Scheduling · all zones</span>
              <button
                class=${allOn ? 'chip togg on' : 'chip togg'}
                @click=${() => {
                  for (const z of zones) void setZoneEnabled(hass, z.enableId, z.markerId, !allOn);
                }}
              >
                ${allOn ? 'On' : 'Off'}
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
      ${rows.map(
        (t) => html`
          <div class="managerow">
            <span>${t.label}</span>
            <input
              type="number"
              .value=${hass.states[t.id]?.state ?? ''}
              @change=${(e: Event) =>
                void setNumberHelper(hass, t.id, Number((e.target as HTMLInputElement).value))}
            />
          </div>
        `,
      )}
      ${this._renderThemePicker()}
    `;
  }

  private _renderThemePicker() {
    const hass = this.hass;
    if (!hass) return nothing;
    const themeId = globalEntityId('theme', this._prefix);
    if (!entityExists(hass, themeId)) return nothing;
    const { presetKey, tokens } = resolveTheme(hass.states[themeId]?.state);
    const setTheme = (value: string) =>
      void hass.callService('input_text', 'set_value', { entity_id: themeId, value });
    return html`
      <p class="setup-title" style="margin-top:12px;">Theme</p>
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

  private _applyTheme(): void {
    const stored = this.hass?.states[globalEntityId('theme', this._prefix)]?.state;
    const { tokens } = resolveTheme(stored);
    for (const [key, cssVar] of THEME_VAR_MAP) {
      this.style.setProperty(cssVar, tokens[key]);
    }
  }

  protected render() {
    if (!this._config || !this.hass) return nothing;
    this._applyTheme();
    const zone = this._zone();
    if (!zone) return nothing;
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
    const statusHead = !s.available
      ? 'Unavailable'
      : cooling
        ? `Cooling to ${s.setpoint}`
        : heating
          ? `Heating to ${s.setpoint}`
          : s.mode === 'off'
            ? 'Off'
            : `Idle · set ${s.setpoint ?? '–'}`;

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
                    this._zoneIndex = i;
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
    if (this._rtLoadedFor !== todayId) {
      this._rtLoadedFor = todayId;
      this._rtDaily = undefined;
      queueMicrotask(() =>
        void fetchDailyRuntime(hass, todayId, 7).then((d) => {
          this._rtDaily = d;
        }),
      );
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = (this._rtDaily ?? [])
      .filter((d) => d.day < today.getTime())
      .sort((a, b) => b.day - a.day);
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
              <div class="chips" style="margin-bottom:6px;">
                <button
                  class=${this._rtRange === 7 ? 'chip mode-on' : 'chip'}
                  @click=${() => (this._rtRange = 7)}
                >
                  7 days
                </button>
                <button
                  class=${this._rtRange === 30 ? 'chip mode-on' : 'chip'}
                  @click=${() => {
                    this._rtRange = 30;
                    if (!this._rt30) {
                      void fetchDailyRuntime(hass, todayId, 30).then((d) => {
                        this._rt30 = d;
                      });
                    }
                  }}
                >
                  30 days
                </button>
              </div>
              ${this._rtRange === 30 ? this._render30() : nothing}
              ${this._rtRange === 7
                ? html`${this._renderPill(zone, 'Today', Number.isFinite(todayHours) ? todayHours : 0, todayStart, true)}`
                : nothing}
              ${this._rtRange === 7
                ? html`
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
                      ),
                    )}
                    ${days.length === 0
                      ? html`<p class="muted" style="font-size:11px;margin:6px 0;">
                          History accrues daily - past days appear as statistics build up.
                        </p>`
                      : nothing}
                    <p class="muted" style="font-size:10px;margin:6px 0 0;">
                      Tap a day for its run segments and setpoint changes.
                    </p>
                  `
                : nothing}
            </div>
          `
        : nothing}
    `;
  }

  private _render30() {
    const rows = this._rt30;
    if (!rows) return html`<p class="muted" style="font-size:11px;">Loading…</p>`;
    if (rows.length === 0) {
      return html`<p class="muted" style="font-size:11px;">
        Long-term statistics build daily - the 30-day view fills in as days accumulate.
      </p>`;
    }
    const sorted = [...rows].sort((a, b) => a.day - b.day);
    const max = Math.max(...sorted.map((r) => r.hours), 1);
    const avg = sorted.reduce((a, r) => a + r.hours, 0) / sorted.length;
    const fmtDay = (t: number) =>
      new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return html`
      <div class="cols">
        ${sorted.map(
          (r) => html`<span
            class="col"
            title="${fmtDay(r.day)}: ${formatHoursQuarter(r.hours)}"
            style="height: ${Math.max(6, (r.hours / max) * 64).toFixed(0)}px"
          ></span>`,
        )}
      </div>
      <div class="axis">
        <span>${fmtDay(sorted[0]!.day)}</span>
        <span>${fmtDay(sorted[sorted.length - 1]!.day)}</span>
      </div>
      <p class="muted" style="font-size:11px;margin:6px 0 0;">
        Avg <b class="rt-b">${formatHoursQuarter(avg)}</b> · Max
        <b class="rt-b">${formatHoursQuarter(max)}</b> · from long-term statistics (kept forever)
      </p>
    `;
  }

  private async _openDay(zone: ZoneConfig, dayStart: number): Promise<void> {
    if (this._rtDayOpen === dayStart) {
      this._rtDayOpen = null;
      return;
    }
    this._rtDayOpen = dayStart;
    const cached = this._rtDayCache.get(dayStart);
    if (cached) {
      this._rtDayDetail = cached;
      return;
    }
    if (!this.hass) return;
    this._rtDayLoading = true;
    this._rtDayDetail = undefined;
    try {
      const slug = slugify(zone.name);
      const runningId = zoneEntityId('running_sensor', this._prefix, slug);
      const dayEnd = Math.min(dayStart + 86_400_000, Date.now());
      const [runPts, setPts] = await Promise.all([
        fetchDayHistory(this.hass, runningId, dayStart, dayEnd),
        fetchDayHistory(this.hass, zone.entity, dayStart, dayEnd, 'temperature'),
      ]);
      const detail = {
        segs: extractRunSegments(runPts, dayStart, dayEnd),
        bubs: extractSetpointChanges(setPts),
        start: dayStart,
        end: dayStart + 86_400_000,
      };
      this._rtDayCache.set(dayStart, detail);
      if (this._rtDayOpen === dayStart) this._rtDayDetail = detail;
    } finally {
      this._rtDayLoading = false;
    }
  }

  private _renderPill(
    zone: ZoneConfig,
    label: string,
    hours: number,
    dayStart: number,
    isToday: boolean,
  ) {
    const pct = Math.min(100, Math.max(0, (hours / 24) * 100));
    const open = this._rtDayOpen === dayStart;
    return html`
      <button class="pillrow" @click=${() => void this._openDay(zone, dayStart)}>
        <span class="pill-label">${label}</span>
        <span class="pill-track">
          <span
            class="pill-fill ${isToday || open ? 'today-fill' : ''}"
            style="width: ${pct.toFixed(1)}%"
          ></span>
        </span>
        <span class="pill-hours">${formatHoursQuarter(hours)}</span>
      </button>
      ${open ? this._renderDayDetail() : nothing}
    `;
  }

  private _renderDayDetail() {
    if (this._rtDayLoading) return html`<p class="muted" style="font-size:11px;">Loading day…</p>`;
    const d = this._rtDayDetail;
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
    // Season keys are stable across display renames - resolve name -> key
    // through the config; lowercase fallback covers key == lower(name) installs.
    const match = this._config?.seasons?.find((s) => s.name === sel.state);
    return match?.key ?? slugify(sel.state);
  }

  private _scheduleEntityId(zone: ZoneConfig): string | null {
    const season = this._activeSeasonKey();
    if (!season) return null;
    return `schedule.${this._prefix}_${slugify(zone.name)}_${season}`;
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
      this._schedWeek = (cfg?.week as Week | undefined) ?? undefined;
      this._schedName = cfg?.name ?? '';
      this._schedError = cfg ? undefined : 'Could not load schedule config.';
    } catch (e) {
      this._schedError = errorText(e);
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
  }

  private _clearSchedEdit(): void {
    this._schedDrafts = new Map();
    this._schedSel = undefined;
  }

  private async _saveSchedDrafts(zone: ZoneConfig): Promise<void> {
    if (!this.hass || !this._schedWeek || this._schedDrafts.size === 0) return;
    const schedId = this._scheduleEntityId(zone);
    if (!schedId) return;
    const det = detectSets(this._schedWeek);
    this._schedBusy = true;
    try {
      let week = this._schedWeek;
      for (const [setKey, blocks] of this._schedDrafts) {
        const days = det.sets[setKey];
        if (days) week = replaceSetBlocks(week, days, blocks);
      }
      await updateScheduleWeek(
        this.hass,
        schedId,
        week as unknown as Record<string, unknown>,
        this._schedName,
      );
      this._schedWeek = week;
      this._clearSchedEdit();
      this._schedError = undefined;
    } catch (e) {
      this._schedError = errorText(e);
    } finally {
      this._schedBusy = false;
    }
  }

  private _schedLoadedFor?: string;

  private _renderSchedule(zone: ZoneConfig) {
    if (!this.hass) return nothing;
    const schedId = this._scheduleEntityId(zone);
    if (!schedId || !entityExists(this.hass, schedId)) return nothing;
    if (this._schedLoadedFor !== schedId && !this._schedBusy) {
      this._schedLoadedFor = schedId;
      this._schedWeek = undefined;
      this._clearSchedEdit();
      queueMicrotask(() => void this._loadWeek(zone));
    }
    const seasonName =
      this.hass.states[globalEntityId('season_select', this._prefix)]?.state ?? '';
    const week = this._schedWeek;
    const next = week ? nextBlockAfter(week, new Date()) : null;
    const nextLine = next
      ? `Next · ${fmtTime(next.time)} ${next.name} → ${next.cool_temp ?? next.heat_temp}°`
      : 'Schedule';
    return html`
      <button
        class="schedrow"
        @click=${() => {
          this._schedOpen = !this._schedOpen;
          if (!this._schedWeek) void this._loadWeek(zone);
        }}
      >
        <span>${nextLine} <span class="season">· ${seasonName}</span></span>
        <span aria-hidden="true">${this._schedOpen ? '▴' : '▾'}</span>
      </button>
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
    const det = detectSets(week);
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
    const dirty = this._schedDrafts.size > 0;
    return html`
      <div class="schedbody">
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
        ${this._schedError ? html`<p class="schederr pad">${this._schedError}</p>` : nothing}
        <div class="schedactions">
          ${dirty
            ? html`
                <button class="chip save" .disabled=${this._schedBusy}
                  @click=${() => void this._saveSchedDrafts(zone)}>
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
                    void applyScheduleNow(this.hass!, marker, 'automation.climate_schedule_engine');
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
        const t = timeToMin(cur.time) + d;
        const loT = sel.idx > 0 ? timeToMin(blk[sel.idx - 1]!.time) + 15 : 0;
        const hiT = sel.idx < blk.length - 1 ? timeToMin(blk[sel.idx + 1]!.time) - 15 : 1425;
        cur.time = minToTime(Math.max(loT, Math.min(hiT, t)));
      });
    };
    const nudgeTemp = (field: 'cool_temp' | 'heat_temp', d: number) => {
      mut((blk) => {
        const cur = blk[sel.idx]!;
        const v = (cur[field] ?? 72) + d;
        let loT = 50, hiT = 95;
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
            .value=${b.name}
            @change=${(e: Event) =>
              mut((blk) => {
                blk[sel.idx]!.name = (e.target as HTMLInputElement).value;
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
    const eco = ecoSupported(hass, entity);
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
                      ${MODE_LABELS[m] ?? m}
                    </button>
                  `,
                )}
                ${eco
                  ? html`
                      <button
                        class=${ecoActive(hass, entity) ? 'chip eco eco-on' : 'chip eco'}
                        @click=${() => void setEco(hass, entity, !ecoActive(hass, entity))}
                      >
                        Eco
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
    return html`
      <div class="rooms">
        ${zone.room_sensors.map((id) => {
          const r = roomReading(hass, id);
          if (r.temp == null || setpoint == null) {
            return html`
              <div class="room">
                <span class="rname">${r.name}</span>
                <span class="rtemp muted">${r.temp == null ? '—' : `${r.temp}°`}</span>
              </div>
            `;
          }
          // Round once so the badge color always agrees with the displayed number
          // (4.1 must not display "+4°" in red).
          const delta = Math.round(r.temp - setpoint);
          return html`
            <div class="room">
              <span class="rname">${r.name}</span>
              <span>
                <span class="badge ${deviationColor(delta, greenMax, amberMax)}"
                  >${formatDelta(delta)}</span
                >
                <span class="rtemp">${r.temp}°</span>
              </span>
            </div>
          `;
        })}
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
      padding: 8px 2px;
      border-bottom: 0.5px solid var(--mzcs-border);
      font-size: 13px;
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
    .applyrow {
      display: flex;
      gap: 8px;
      margin-top: 4px;
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
    'Nest-style climate view for 1-4 zones with seasonal scheduling, fan timers, and runtime history.',
});
