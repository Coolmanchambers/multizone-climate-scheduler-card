// Visual config editor (S12a). Rendered by HA inside the card editor dialog.
// Uses HA's own ha-selector elements (entity pickers etc.) - those custom
// elements only register once a stock card editor has loaded, hence the
// loadCardHelpers bootstrap in connectedCallback.
import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HassLike } from './ha-types';
import type { MzcsCardConfig, ZoneConfig, SeasonConfig, BlockMode } from './types';
import { normalizeRoomSensors } from './types';
import { slugify } from './lib/naming';
import { EDITOR_TYPE } from './const';

declare global {
  interface Window {
    loadCardHelpers?: () => Promise<{
      createCardElement: (cfg: Record<string, unknown>) => {
        constructor: { getConfigElement?: () => unknown };
      };
    }>;
  }
}

let selectorsReady: Promise<void> | null = null;
function ensureSelectors(): Promise<void> {
  if (!selectorsReady) {
    selectorsReady = (async () => {
      if (customElements.get('ha-selector')) return;
      try {
        const helpers = await window.loadCardHelpers?.();
        const card = helpers?.createCardElement({ type: 'entities', entities: [] });
        await card?.constructor.getConfigElement?.();
        await customElements.whenDefined('ha-selector');
      } catch {
        // Editor degrades to plain inputs if selectors never register.
      }
    })();
  }
  return selectorsReady;
}

const DEFAULT_SEASONS: SeasonConfig[] = [
  { key: 'summer', name: 'Summer', default_mode: 'cool' },
  { key: 'winter', name: 'Winter', default_mode: 'heat_cool' },
];

@customElement(EDITOR_TYPE)
export class MzcsCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: HassLike;
  @state() private _config?: MzcsCardConfig;
  @state() private _ready = false;

  public setConfig(config: MzcsCardConfig): void {
    this._config = {
      type: config.type,
      prefix: config.prefix ?? 'climate',
      zones: config.zones ?? [],
      seasons: config.seasons ?? DEFAULT_SEASONS.map((s) => ({ ...s })),
      season_switch: config.season_switch ?? 'manual',
      weather_entity: config.weather_entity,
      // Spread first: fields this editor has no UI for (e.g. fan_guard) must
      // round-trip untouched, never be silently dropped (QA-R C2-8).
      features: {
        ...config.features,
        fan_timer: config.features?.fan_timer ?? [15, 30, 60],
        anomaly_alerts: config.features?.anomaly_alerts ?? true,
      },
    };
  }

  public connectedCallback(): void {
    super.connectedCallback();
    void ensureSelectors().then(() => {
      this._ready = true;
    });
  }

  /** True once any zone's schedule entity exists for this season key in HA.
   * FAIL-CLOSED: with hass briefly unavailable (startup, reconnect) we cannot
   * know, so the key is treated as provisioned and stays frozen - re-deriving
   * it would let the differ delete real schedules (QA-R C2-4). */
  private _seasonProvisioned(key: string): boolean {
    const hass = this.hass;
    const c = this._config;
    if (!hass || !c) return true;
    const prefix = c.prefix ?? 'climate';
    return (c.zones ?? []).some(
      (z) => z.name && !!hass.states[`schedule.${prefix}_${slugify(z.name)}_${key}`],
    );
  }

  private _emit(patch: Partial<MzcsCardConfig>): void {
    if (!this._config) return;
    this._config = { ...this._config, ...patch };
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _setZone(i: number, patch: Partial<ZoneConfig>): void {
    const zones = (this._config?.zones ?? []).map((z, zi) => (zi === i ? { ...z, ...patch } : z));
    this._emit({ zones });
  }


  private _selector(selector: Record<string, unknown>, value: unknown, onChange: (v: unknown) => void, label?: string) {
    if (!this._ready || !customElements.get('ha-selector')) {
      return html`<input
        .value=${typeof value === 'string' ? value : ''}
        placeholder=${label ?? ''}
        @change=${(e: Event) => onChange((e.target as HTMLInputElement).value)}
      />`;
    }
    return html`<ha-selector
      .hass=${this.hass}
      .selector=${selector}
      .value=${value}
      .label=${label}
      @value-changed=${(e: CustomEvent) => onChange(e.detail.value)}
    ></ha-selector>`;
  }

  protected render() {
    const c = this._config;
    if (!c) return nothing;
    const zones = c.zones ?? [];
    const seasons = c.seasons ?? [];
    return html`
      <div class="ed">
        <h4>Zones (1-4)</h4>
        ${zones.map(
          (z, i) => html`
            <div class="zone">
              <div class="zonehead">
                <span>Zone ${i + 1}</span>
                <button
                  class="link danger"
                  @click=${() => this._emit({ zones: zones.filter((_, zi) => zi !== i) })}
                >
                  Remove
                </button>
              </div>
              ${this._selector(
                { entity: { domain: 'climate' } },
                z.entity,
                (v) => this._setZone(i, { entity: String(v ?? '') }),
                'Thermostat',
              )}
              <input
                class="namefield"
                .value=${z.name ?? ''}
                placeholder="Display name"
                @change=${(e: Event) =>
                  this._setZone(i, { name: (e.target as HTMLInputElement).value })}
              />
              ${this._selector(
                { entity: { domain: 'sensor', device_class: 'temperature', multiple: true } },
                normalizeRoomSensors(z.room_sensors).map((rs) => rs.entity),
                (v) => {
                  // Keep any labels the user already set as the selection changes.
                  const ids = ((v as string[]) ?? []).filter(Boolean);
                  const byId = new Map(
                    normalizeRoomSensors(z.room_sensors).map((rs) => [rs.entity, rs]),
                  );
                  this._setZone(i, {
                    room_sensors: ids.map((id) => {
                      const kept = byId.get(id);
                      // Bare id unless a label exists, so configs stay tidy.
                      return kept?.name ? { entity: id, name: kept.name } : id;
                    }),
                  });
                },
                'Room sensors',
              )}
              ${normalizeRoomSensors(z.room_sensors).map(
                (rs) => html`
                  <label class="fieldrow roomlabel">
                    <span class="rooment"
                      >${this.hass?.states[rs.entity]?.attributes.friendly_name ?? rs.entity}</span
                    >
                    <input
                      .value=${rs.name ?? ''}
                      placeholder="Label on card (optional)"
                      @change=${(e: Event) => {
                        const label = (e.target as HTMLInputElement).value.trim();
                        this._setZone(i, {
                          room_sensors: normalizeRoomSensors(z.room_sensors).map((x) =>
                            x.entity === rs.entity
                              ? label
                                ? { entity: x.entity, name: label }
                                : x.entity
                              : x.name
                                ? { entity: x.entity, name: x.name }
                                : x.entity,
                          ),
                        });
                      }}
                    />
                  </label>
                `,
              )}
            </div>
          `,
        )}
        ${zones.length < 4
          ? html`<button
              class="link"
              @click=${() => this._emit({ zones: [...zones, { entity: '', name: `Zone ${zones.length + 1}` }] })}
            >
              + Add zone
            </button>`
          : nothing}

        <h4>Seasons (1-4)</h4>
        ${seasons.map(
          (s, i) => html`
            <div class="seasonrow">
              <input
                .value=${s.name}
                @change=${(e: Event) => {
                  const name = (e.target as HTMLInputElement).value;
                  // Season keys FREEZE once the season's schedules exist in HA:
                  // schedule entity ids embed the key, so re-deriving it from a
                  // renamed season would make the differ delete real schedules
                  // and re-seed placeholders. Before provisioning, the key may
                  // still follow the name (nicer entity ids).
                  const newKey = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
                  // Keep the old key when frozen, empty, or when the new key
                  // would collide with another season's key (QA-R C2-5).
                  const collides = seasons.some((x, xi) => xi !== i && x.key === newKey);
                  const key =
                    this._seasonProvisioned(s.key) || !newKey || collides ? s.key : newKey;
                  const next = seasons.map((x, xi) => (xi === i ? { ...x, name, key } : x));
                  this._emit({ seasons: next });
                }}
              />
              <select
                .value=${s.default_mode}
                @change=${(e: Event) => {
                  const mode = (e.target as HTMLSelectElement).value as BlockMode;
                  this._emit({
                    seasons: seasons.map((x, xi) => (xi === i ? { ...x, default_mode: mode } : x)),
                  });
                }}
              >
                <option value="cool">Cool</option>
                <option value="heat">Heat</option>
                <option value="heat_cool">Heat+Cool</option>
              </select>
              <button
                class="link danger"
                @click=${() => this._emit({ seasons: seasons.filter((_, xi) => xi !== i) })}
              >
                Remove
              </button>
            </div>
          `,
        )}
        ${seasons.length < 4
          ? html`<button
              class="link"
              @click=${() => {
                let n = seasons.length + 1;
                while (seasons.some((s) => s.key === `season_${n}`)) n++;
                this._emit({
                  seasons: [
                    ...seasons,
                    { key: `season_${n}`, name: `Season ${n}`, default_mode: 'cool' },
                  ],
                });
              }}
            >
              + Add season
            </button>`
          : nothing}

        <h4>Season switching</h4>
        <select
          .value=${c.season_switch ?? 'manual'}
          @change=${(e: Event) =>
            this._emit({ season_switch: (e.target as HTMLSelectElement).value as MzcsCardConfig['season_switch'] })}
        >
          <option value="manual">Manual</option>
          <option value="semi" disabled>Semi-auto (coming in a future release)</option>
          <option value="full" disabled>Full-auto (coming in a future release)</option>
        </select>
        ${this._selector(
          { entity: { domain: 'weather' } },
          c.weather_entity,
          (v) => this._emit({ weather_entity: String(v ?? '') || undefined }),
          'Weather entity (outdoor temperature for runtime learning)',
        )}

        <h4>Features</h4>
        <label class="checkrow">
          <input
            type="checkbox"
            .checked=${(c.features?.fan_timer?.length ?? 0) > 0}
            @change=${(e: Event) =>
              this._emit({
                features: {
                  ...c.features,
                  fan_timer: (e.target as HTMLInputElement).checked ? [15, 30, 60] : [],
                },
              })}
          />
          Fan timer buttons (15/30/60)
        </label>
        <label class="checkrow">
          <input
            type="checkbox"
            .checked=${c.features?.anomaly_alerts ?? true}
            @change=${(e: Event) =>
              this._emit({
                features: { ...c.features, anomaly_alerts: (e.target as HTMLInputElement).checked },
              })}
          />
          Runtime anomaly alerts
        </label>
        <label class="checkrow">
          <input
            type="checkbox"
            .checked=${c.features?.eco_preset !== false}
            @change=${(e: Event) => {
              const on = (e.target as HTMLInputElement).checked;
              const features = { ...c.features };
              if (on) delete features.eco_preset;
              else features.eco_preset = false;
              this._emit({ features });
            }}
          />
          Stand down while a standby preset is active
        </label>
        ${c.features?.eco_preset !== false
          ? html`
              <label class="fieldrow">
                Standby preset name
                <input
                  .value=${typeof c.features?.eco_preset === 'string' ? c.features.eco_preset : 'eco'}
                  @change=${(e: Event) => {
                    const el = e.target as HTMLInputElement;
                    const name = el.value.replace(/['"\\]/g, '').trim() || 'eco';
                    el.value = name;
                    const features = { ...c.features };
                    if (name === 'eco') delete features.eco_preset;
                    else features.eco_preset = name;
                    this._emit({ features });
                  }}
                />
              </label>
              <p class="muted">
                The engine leaves a zone alone while its thermostat reports this preset.
                'eco' is the most common name; other brands may use 'away', 'sleep', or similar - check
                the thermostat's preset list in Home Assistant.
              </p>
            `
          : html`
              <p class="bad">
                With this off, the schedule keeps applying setpoints even while a thermostat
                is in its Eco/away mode - overriding, and likely fighting, the device's or
                its app's own standby behavior. Only turn this off if you have disabled
                Eco/away features on the device and want Home Assistant to own standby.
              </p>
            `}

        <h4>Advanced</h4>
        <label class="fieldrow">
          Entity prefix
          <input
            .value=${c.prefix ?? 'climate'}
            @change=${(e: Event) => {
              const el = e.target as HTMLInputElement;
              const p = slugify(el.value) || 'climate';
              el.value = p;
              this._emit({ prefix: p });
            }}
          />
        </label>
      </div>
    `;
  }

  static styles = css`
    .roomlabel {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
    }
    .roomlabel .rooment {
      flex: 1 1 auto;
      opacity: 0.75;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .roomlabel input {
      flex: 0 0 45%;
    }
    .ed {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 4px 0 12px;
    }
    h4 {
      margin: 10px 0 2px;
      font-size: 14px;
    }
    .zone {
      border: 1px solid var(--divider-color, #444);
      border-radius: 10px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .zonehead {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 500;
    }
    .seasonrow {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 8px;
      align-items: center;
    }
    .link {
      background: none;
      border: none;
      color: var(--primary-color, #03a9f4);
      cursor: pointer;
      text-align: left;
      padding: 4px 0;
      font-size: 13px;
    }
    .link.danger {
      color: var(--error-color, #e5484d);
    }
    input,
    select {
      padding: 8px;
      border-radius: 6px;
      border: 1px solid var(--divider-color, #444);
      background: var(--card-background-color, transparent);
      color: var(--primary-text-color, inherit);
      font-size: 13px;
    }
    .checkrow,
    .fieldrow {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
    }
    .fieldrow input {
      width: 120px;
    }
    .ok {
      color: var(--success-color, #2bb673);
      font-size: 12px;
      margin: 0;
    }
    .bad {
      color: var(--error-color, #e5484d);
      font-size: 12px;
      margin: 0;
    }
  `;
}
