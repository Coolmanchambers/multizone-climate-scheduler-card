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
} from './ha-adapter';
import {
  detectSets,
  rangesToDayBlocks,
  nextBlockAfter,
  editBlockInSet,
  type Week,
} from './lib/schedule-view';
import type { DayKey, TimeRange } from './lib/schedule-ranges';

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
import { buildDesired, plan, type Plan, type ProvisionInput } from './lib/provisioning';
import { defaultSchedules } from './lib/default-schedules';
import { fetchExisting } from './registry-read';

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
console.info(`%c ${CARD_NAME} %c v${CARD_VERSION}`, 'background:#1e88e5;color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;', 'background:#243039;color:#fff;padding:2px 6px;border-radius:0 4px 4px 0;');

@customElement(CARD_TYPE)
export class MzcsCard extends LitElement {
  @property({ attribute: false }) public hass?: HassLike;
  @state() private _config?: MzcsCardConfig;
  @state() private _zoneIndex = 0;
  @state() private _ctrlOpen = false;
  @state() private _setupOpen = false;
  @state() private _schedOpen = false;
  @state() private _schedWeek?: Week;
  @state() private _schedError?: string;
  @state() private _schedBusy = false;
  @state() private _dryRun?: Plan;
  @state() private _dryRunError?: string;
  @state() private _dryRunning = false;

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

  public static getStubConfig(): Partial<MzcsCardConfig> {
    return { zones: [] };
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
    const zones = cfg.zones.map((z) => ({ slug: slugify(z.name), name: z.name }));
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
    } catch (e) {
      this._dryRunError = e instanceof Error ? e.message : String(e);
    } finally {
      this._dryRunning = false;
    }
  }

  private _renderSetup() {
    const p = this._dryRun;
    return html`
      <div class="setup">
        <p class="setup-title">Setup · dry run</p>
        <p class="setup-sub">
          Read-only preview of what Setup would create. Nothing is written from this screen.
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
            `
          : nothing}
        <button class="chip" @click=${() => (this._setupOpen = false)}>Close</button>
      </div>
    `;
  }

  protected render() {
    if (!this._config || !this.hass) return nothing;
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
          ${this._renderSchedule(zone)}
        </div>
      </ha-card>
    `;
  }

  private _activeSeasonKey(): string | null {
    const sel = this.hass?.states[globalEntityId('season_select', this._prefix)];
    return sel && sel.state !== 'unknown' ? slugify(sel.state) : null;
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
      this._schedError = cfg ? undefined : 'Could not load schedule config.';
    } catch (e) {
      this._schedError = e instanceof Error ? e.message : String(e);
    } finally {
      this._schedBusy = false;
    }
  }

  private async _saveBlockEdit(
    zone: ZoneConfig,
    setDays: DayKey[],
    originalTime: string,
    patch: { time?: string; cool_temp?: number },
  ): Promise<void> {
    if (!this.hass || !this._schedWeek) return;
    const schedId = this._scheduleEntityId(zone);
    if (!schedId) return;
    this._schedBusy = true;
    try {
      const newWeek = editBlockInSet(this._schedWeek, setDays, originalTime, patch);
      await updateScheduleWeek(
        this.hass,
        schedId,
        newWeek as unknown as Record<string, unknown>,
      );
      this._schedWeek = newWeek;
      this._schedError = undefined;
    } catch (e) {
      this._schedError = e instanceof Error ? e.message : String(e);
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
    if (this._schedError) return html`<p class="schederr pad">${this._schedError}</p>`;
    const week = this._schedWeek;
    if (!week) return html`<p class="muted pad">No schedule data.</p>`;
    const det = detectSets(week);
    const today = new Date().getDay();
    const todayKey = (['sunday','monday','tuesday','wednesday','thursday','friday','saturday'] as DayKey[])[today]!;
    return html`
      <div class="schedbody">
        ${Object.entries(det.sets).map(([setKey, days]) => {
          const blocks = rangesToDayBlocks((week[days[0]!] ?? []) as TimeRange[]);
          const isToday = days.includes(todayKey);
          return html`
            <p class="sethead">
              ${SET_LABELS[setKey] ?? setKey}${isToday ? html` <span class="today">today</span>` : nothing}
            </p>
            ${blocks.map(
              (b) => html`
                <div class="blockrow">
                  <input
                    class="btime"
                    type="time"
                    .value=${b.time}
                    @change=${(e: Event) =>
                      void this._saveBlockEdit(zone, days, b.time, {
                        time: (e.target as HTMLInputElement).value,
                      })}
                  />
                  <span class="bname">${b.name}</span>
                  <input
                    class="btemp"
                    type="number"
                    .value=${String(b.cool_temp ?? b.heat_temp ?? '')}
                    @change=${(e: Event) =>
                      void this._saveBlockEdit(zone, days, b.time, {
                        cool_temp: Number((e.target as HTMLInputElement).value),
                      })}
                  />
                </div>
              `,
            )}
          `;
        })}
        <div class="schedactions">
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
          <span class="muted">Edits apply at the next block; Apply now re-asserts immediately.</span>
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
    .wrap {
      padding: 12px;
      color: var(--primary-text-color, #e1e6ea);
    }
    .tabs {
      display: flex;
      gap: 4px;
      background: var(--secondary-background-color, #16202a);
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
      color: var(--secondary-text-color, #9fb0bd);
      font-size: 12px;
      cursor: pointer;
    }
    .tab.on {
      background: var(--card-background-color, #2b3844);
      color: var(--primary-text-color, #fff);
      font-weight: 500;
    }
    .hero {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--secondary-background-color, #243039);
      border-radius: 12px;
      padding: 12px 14px;
    }
    .dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--disabled-text-color, #9fb0bd);
      flex: none;
    }
    .dot.cool {
      background: #1e88e5;
    }
    .dot.heat {
      background: #f59e0b;
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
      color: var(--secondary-text-color, #9fb0bd);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .fan {
      color: #1e88e5;
    }
    .nudge {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 0.5px solid var(--divider-color, #3d4a55);
      background: var(--card-background-color, #2b3844);
      color: var(--primary-text-color, #e8edf1);
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
      color: var(--secondary-text-color, #9fb0bd);
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
      background: var(--card-background-color, #2b3844);
      border: 0.5px solid var(--divider-color, #3d4a55);
      color: var(--secondary-text-color, #9fb0bd);
      font-size: 12px;
      cursor: pointer;
    }
    .chip.mode-on {
      background: #1e88e5;
      border-color: #1e88e5;
      color: #fff;
    }
    .chip.eco {
      border-color: #2bb673;
      color: #2bb673;
    }
    .chip.eco-on {
      background: #2bb673;
      color: #fff;
    }
    .fanrow {
      margin-top: 8px;
      align-items: center;
    }
    .fanlbl {
      font-size: 12px;
      color: var(--secondary-text-color, #9fb0bd);
      padding: 6px 0;
    }
    .rooms {
      border-top: 0.5px solid var(--divider-color, #33414c);
      margin-top: 6px;
    }
    .room {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 2px;
      border-bottom: 0.5px solid var(--divider-color, #33414c);
      font-size: 13px;
    }
    .room:last-child {
      border-bottom: none;
    }
    .rtemp {
      font-size: 14px;
    }
    .muted {
      color: var(--disabled-text-color, #7a8894);
    }
    .badge {
      font-size: 11px;
      border-radius: 9px;
      padding: 2px 7px;
      margin-right: 8px;
      color: #16202a;
    }
    .badge.green {
      background: #2bb673;
    }
    .badge.amber {
      background: #f59e0b;
    }
    .badge.red {
      background: #e5484d;
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
      color: var(--secondary-text-color, #9fb0bd);
    }
    .setup-err {
      color: #e5484d;
      font-size: 12px;
    }
    .planwrap {
      width: 100%;
      max-height: 320px;
      overflow-y: auto;
      border: 0.5px solid var(--divider-color, #33414c);
      border-radius: 10px;
      padding: 8px 10px;
    }
    .plan-h {
      margin: 6px 0 2px;
      font-size: 13px;
      font-weight: 500;
    }
    .plan-h.del {
      color: #e5484d;
    }
    .plan-h.quiet {
      color: var(--secondary-text-color, #9fb0bd);
      font-weight: 400;
    }
    .plan-list {
      margin: 0 0 4px;
      padding-left: 18px;
      font-size: 11px;
      color: var(--secondary-text-color, #9fb0bd);
    }
    .plan-list.del li {
      color: #e5484d;
    }
    .schedrow {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--secondary-background-color, #243039);
      border: none;
      border-radius: 12px;
      color: var(--primary-text-color, #c8d4dc);
      font-size: 12px;
      padding: 10px 12px;
      margin-top: 10px;
      cursor: pointer;
    }
    .season {
      color: #f59e0b;
    }
    .schedbody {
      background: var(--secondary-background-color, #243039);
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
      color: #1e88e5;
      font-weight: 400;
    }
    .blockrow {
      display: grid;
      grid-template-columns: 92px 1fr 56px;
      gap: 8px;
      align-items: center;
      padding: 3px 0;
      font-size: 12px;
    }
    .btime,
    .btemp {
      background: var(--card-background-color, #16202a);
      border: 0.5px solid var(--divider-color, #3d4a55);
      border-radius: 6px;
      color: var(--primary-text-color, #e8edf1);
      padding: 4px 6px;
      font-size: 12px;
    }
    .bname {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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
      color: #e5484d;
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
