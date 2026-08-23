import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CARD_TYPE, CARD_NAME, CARD_VERSION } from './const';
import type { MzcsCardConfig } from './types';

/* eslint-disable no-console */
console.info(`%c ${CARD_NAME} %c v${CARD_VERSION}`, 'background:#1e88e5;color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;', 'background:#243039;color:#fff;padding:2px 6px;border-radius:0 4px 4px 0;');

@customElement(CARD_TYPE)
export class MzcsCard extends LitElement {
  // hass is injected by Home Assistant; typed loosely until the ha-adapter lands (S2).
  @property({ attribute: false }) public hass?: Record<string, unknown>;
  @state() private _config?: MzcsCardConfig;

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
  }

  public static getStubConfig(): Partial<MzcsCardConfig> {
    return { zones: [] };
  }

  public getCardSize(): number {
    return 6;
  }

  protected render() {
    if (!this._config) return html``;
    return html`
      <ha-card>
        <div class="scaffold">
          <p><b>${CARD_NAME}</b> v${CARD_VERSION}</p>
          <p>Scaffold build. Zones configured: ${this._config.zones.length}</p>
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    .scaffold {
      padding: 16px;
      color: var(--primary-text-color, #e1e6ea);
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
