import '../src/multizone-climate-scheduler-card';
import { MockHass } from './mock-hass';
import type { MzcsCardConfig } from '../src/types';

// ha-card doesn't exist outside HA; give it a minimal look so the harness renders.
if (!customElements.get('ha-card')) {
  customElements.define(
    'ha-card',
    class extends HTMLElement {
      connectedCallback() {
        this.style.display = 'block';
        this.style.background = '#1c262e';
        this.style.borderRadius = '14px';
      }
    },
  );
}

const config: MzcsCardConfig = {
  type: 'custom:multizone-climate-scheduler-card',
  prefix: 'climate',
  zones: [
    { entity: 'climate.nest_downstairs', name: 'Downstairs' },
    { entity: 'climate.nest_upstairs', name: 'Upstairs' },
    { entity: 'climate.owner_s_office_mini_split', name: "the owner's Office" },
  ],
};

const hass = new MockHass();
const card = document.createElement('multizone-climate-scheduler-card') as HTMLElement & {
  hass: import('../src/ha-types').HassLike;
  setConfig(c: MzcsCardConfig): void;
};
card.setConfig(config);
card.hass = hass.snapshot();
hass.onChange(() => {
  card.hass = hass.snapshot();
});
document.getElementById('mount')!.appendChild(card);

// Harness controls
document.getElementById('btn-fan')!.addEventListener('click', () => {
  void hass.callService('timer', 'start', { entity_id: 'timer.climate_upstairs_fan' });
});
document.getElementById('btn-cool')!.addEventListener('click', () => {
  hass.set('climate.nest_upstairs', {
    attributes: { hvac_action: 'cooling' },
  });
});
document.getElementById('btn-unavail')!.addEventListener('click', () => {
  hass.set('climate.nest_downstairs', { state: 'unavailable' });
});
const logEl = document.getElementById('svc-log')!;
setInterval(() => {
  logEl.textContent = hass.log
    .slice(-5)
    .map((l) => `${l.domain}.${l.service} ${JSON.stringify(l.data ?? {})}`)
    .join('\n');
}, 500);
