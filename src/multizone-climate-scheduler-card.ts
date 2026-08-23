import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CARD_TYPE, CARD_NAME, CARD_VERSION } from './const';
import type { MzcsCardConfig, ZoneConfig } from './types';
import type { HassLike } from './ha-types';
import { climateSummary, fanTimerActive, setTemperature } from './ha-adapter';
import { slugify, zoneEntityId } from './lib/naming';

/* eslint-disable no-console */
console.info(`%c ${CARD_NAME} %c v${CARD_VERSION}`, 'background:#1e88e5;color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;', 'background:#243039;color:#fff;padding:2px 6px;border-radius:0 4px 4px 0;');

@customElement(CARD_TYPE)
export class MzcsCard extends LitElement {
  @property({ attribute: false }) public hass?: HassLike;
  @state() private _config?: MzcsCardConfig;
  @state() private _zoneIndex = 0;

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
    void setTemperature(this.hass, zone.entity, s.setpoint + delta);
  }

  protected render() {
    if (!this._config || !this.hass) return nothing;
    const zone = this._zone();
    if (!zone) return nothing;
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
        </div>
      </ha-card>
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
