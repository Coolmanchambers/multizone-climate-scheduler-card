// Visual config editor (S12a). Rendered by HA inside the card editor dialog.
// Uses HA's own ha-selector elements (entity pickers etc.) - those custom
// elements only register once a stock card editor has loaded, hence the
// loadCardHelpers bootstrap in connectedCallback.
import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HassLike } from './ha-types';
import type { MzcsCardConfig, ZoneConfig, SeasonConfig, BlockMode, LastSeenMode } from './types';
import { normalizeCardConfig, normalizeRoomSensors, tidyRoomSensorRow, resolveDisplay, DEFAULT_AGEING_MINUTES, DEFAULT_STALE_HOURS } from './types';
import { lastSeenSuggestion, planBulkLastSeen, applyBulkLastSeen, withLastSeen, type BulkLastSeenRow } from './lib/last-seen';
import { defaultSeasons } from './lib/provisioning';
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

@customElement(EDITOR_TYPE)
export class MzcsCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: HassLike;
  @state() private _config?: MzcsCardConfig;
  @state() private _ready = false;
  /** Bulk "find last-seen entities" preview; null = not open (item 36). */
  @state() private _bulkLastSeen: BulkLastSeenRow[] | null = null;
  /**
   * Companions the user cleared THIS editor session. The bulk action skips
   * them so "no" sticks (item 36 non-negotiable 5); the single-row suggestion
   * may still show, because it never writes without a click.
   */
  private _clearedLastSeen = new Set<string>();

  public setConfig(config: MzcsCardConfig): void {
    // Read what the CARD reads (item 40, docs/config-compatibility.md R1).
    // Measured against v0.7.2: a legacy scalar `fan_timer: 20` reached the
    // checkbox as a number, `(20).length` is undefined so the box rendered OFF,
    // and one click wrote [15, 30, 60] over the user's 20. Normalizing first
    // turns it into [20], so the box reads ON and the value survives.
    //
    // The refusal is CAUGHT, not propagated: an over-limit or malformed config
    // is exactly when a user needs the editor to OPEN so they can fix it, and a
    // throw out of setConfig replaces the form with an error.
    let base: MzcsCardConfig;
    try {
      base = normalizeCardConfig(config);
    } catch {
      base = config;
    }
    // A new config invalidates any open bulk preview: its zone indexes and
    // skip decisions were computed against the old one (QA finding, 2026-08-30).
    this._bulkLastSeen = null;
    this._config = {
      // Spread the whole config first: top-level keys this editor has no UI for
      // - `view_layout` and anything Lovelace adds later - were silently dropped
      // on the first edit, because the old shape listed fields one by one
      // (measured against v0.7.2). `features` had this fix already (QA-R C2-8);
      // the level above it did not.
      ...base,
      type: config.type,
      prefix: base.prefix ?? 'climate',
      zones: base.zones ?? [],
      seasons: base.seasons ?? defaultSeasons(),
      season_switch: base.season_switch ?? 'manual',
      weather_entity: base.weather_entity,
      features: {
        ...base.features,
        fan_timer: base.features?.fan_timer ?? [15, 30, 60],
        anomaly_alerts: base.features?.anomaly_alerts ?? true,
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

  private _applyLastSeen(zoneIndex: number, sensorEntity: string, value: string | null): void {
    const zone = this._config?.zones?.[zoneIndex];
    if (!zone) return;
    if (value) this._clearedLastSeen.delete(sensorEntity);
    else this._clearedLastSeen.add(sensorEntity);
    this._setZone(zoneIndex, { room_sensors: withLastSeen(zone.room_sensors, sensorEntity, value) });
  }

  /**
   * Item 36: explicit optional companion per room sensor. The convention match
   * is offered as an ACTION, never a pre-filled value - a pre-filled field
   * becomes a write the moment the user saves, whether or not they noticed it.
   * The field accepts ANY timestamp entity; the sibling only drives the offer.
   */
  private _renderLastSeenField(zoneIndex: number, sensorEntity: string, current?: string) {
    const suggestion =
      !current && this.hass ? lastSeenSuggestion(this.hass, sensorEntity) : null;
    return html`
      <div class="lastseenrow">
        ${this._selector(
          { entity: { domain: 'sensor', device_class: 'timestamp' } },
          current ?? '',
          (v) => this._applyLastSeen(zoneIndex, sensorEntity, String(v ?? '').trim() || null),
          'Last-seen entity (optional)',
        )}
        ${suggestion
          ? html`<button
              class="link suggest"
              title="Fills the field with this entity. Nothing is written until you save."
              @click=${() => this._applyLastSeen(zoneIndex, sensorEntity, suggestion)}
            >
              Use ${suggestion}
            </button>`
          : nothing}
      </div>
    `;
  }

  /** Bulk companion discovery: preview everything it would write, then apply. */
  private _renderBulkLastSeen(zones: ZoneConfig[]) {
    const hass = this.hass;
    if (!hass || zones.every((z) => normalizeRoomSensors(z.room_sensors).length === 0)) {
      return nothing;
    }
    if (this._bulkLastSeen === null) {
      return html`<button
        class="link"
        @click=${() => {
          this._bulkLastSeen = planBulkLastSeen(zones, hass, this._clearedLastSeen);
        }}
      >
        Find last-seen entities
      </button>`;
    }
    if (this._bulkLastSeen.length === 0) {
      return html`<p class="muted">
        No matching last-seen entities for the unassigned room sensors.
        <button class="link" @click=${() => (this._bulkLastSeen = null)}>Close</button>
      </p>`;
    }
    return html`
      <div class="bulkpreview">
        <p class="muted">Applying will set:</p>
        ${this._bulkLastSeen.map(
          (r) => html`<p class="bulkrow">${r.sensorEntity} &rarr; ${r.lastSeen}</p>`,
        )}
        <span>
          <button class="link" @click=${() => this._applyBulkLastSeen()}>Apply</button>
          <button class="link danger" @click=${() => (this._bulkLastSeen = null)}>Cancel</button>
        </span>
      </div>
    `;
  }

  private _applyBulkLastSeen(): void {
    const rows = this._bulkLastSeen ?? [];
    const hass = this.hass;
    this._bulkLastSeen = null;
    if (!hass || rows.length === 0) return;
    // Re-planned at apply time against the CURRENT config - the stored preview
    // is only ever an upper bound on what gets written (see applyBulkLastSeen).
    this._emit({
      zones: applyBulkLastSeen(this._config?.zones ?? [], rows, hass, this._clearedLastSeen),
    });
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
                  // Keep every field the user already set (label, last_seen) as
                  // the selection changes - rebuilding rows from the id alone
                  // silently drops them (the item-36 trap).
                  const ids = ((v as string[]) ?? []).filter(Boolean);
                  const byId = new Map(
                    normalizeRoomSensors(z.room_sensors).map((rs) => [rs.entity, rs]),
                  );
                  this._setZone(i, {
                    room_sensors: ids.map((id) =>
                      tidyRoomSensorRow(byId.get(id) ?? { entity: id }),
                    ),
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
                            tidyRoomSensorRow(
                              x.entity === rs.entity ? { ...x, name: label || undefined } : x,
                            ),
                          ),
                        });
                      }}
                    />
                  </label>
                  ${this._renderLastSeenField(i, rs.entity, rs.last_seen)}
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
        ${this._renderBulkLastSeen(zones)}

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

        <h4>Display</h4>
        <label class="fieldrow">
          Last-seen age on room rows
          <select
            .value=${resolveDisplay(c.display).lastSeen}
            @change=${(e: Event) =>
              // this._config, not the render-scope config: change events can
              // land faster than Lit re-renders, and a stale spread here would
              // silently drop the edit before it (browser-measured).
              this._emit({
                display: {
                  ...this._config?.display,
                  last_seen: (e.target as HTMLSelectElement).value as LastSeenMode,
                },
              })}
          >
            <option value="always">Always</option>
            <option value="ageing">Only when ageing</option>
            <option value="off">Off</option>
          </select>
        </label>
        <p class="muted">
          Shows how long since a room sensor's device actually reported, on rows whose
          last-seen entity is set and reporting. Rows without one are unaffected.
        </p>
        <label class="fieldrow">
          Ageing threshold (minutes)
          <input
            type="number"
            min="1"
            .value=${String(resolveDisplay(c.display).ageingMs / 60_000)}
            @change=${(e: Event) => {
              const v = Number((e.target as HTMLInputElement).value);
              const display = { ...this._config?.display } as NonNullable<MzcsCardConfig['display']>;
              if (Number.isFinite(v) && v > 0) display.ageing_minutes = v;
              else delete display.ageing_minutes;
              this._emit({ display });
            }}
          />
        </label>
        <label class="fieldrow">
          Stale after (hours)
          <input
            type="number"
            min="1"
            .value=${String(resolveDisplay(c.display).staleMs / 3_600_000)}
            @change=${(e: Event) => {
              const v = Number((e.target as HTMLInputElement).value);
              const display = { ...this._config?.display } as NonNullable<MzcsCardConfig['display']>;
              if (Number.isFinite(v) && v > 0) display.stale_hours = v;
              else delete display.stale_hours;
              this._emit({ display });
            }}
          />
        </label>
        <p class="muted">
          A reading older than this is greyed out and marked stale instead of trusted.
        </p>

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
    .lastseenrow {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin: 0 0 6px 12px;
    }
    .lastseenrow .suggest {
      align-self: flex-start;
      font-size: 12px;
    }
    .bulkpreview {
      border: 1px dashed var(--divider-color, #444);
      border-radius: 8px;
      padding: 8px;
    }
    .bulkpreview .bulkrow {
      margin: 2px 0;
      font-size: 12px;
      font-family: monospace;
    }
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
