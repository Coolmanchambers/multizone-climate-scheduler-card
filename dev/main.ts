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
    {
      entity: 'climate.nest_upstairs',
      name: 'Upstairs',
      room_sensors: [
        'sensor.guest_room_temperature',
        'sensor.bedroom_1_temperature',
        'sensor.bedroom_2_temperature',
        'sensor.loft_temperature',
        'sensor.dead_sensor_temperature',
      ],
    },
    { entity: 'climate.owner_s_office_mini_split', name: 'Office' },
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

// Shot mode (docs screenshots): `#shot=<view>` hides the harness chrome and
// pre-opens one panel so a headless capture gets a clean, real render.
// Views: main | controls | schedule | runtime | setup
const shot = new URLSearchParams(location.hash.slice(1)).get('shot');
if (shot) {
  document.querySelectorAll('h1, .controls, pre').forEach((el) => el.remove());
  document.body.style.padding = '16px 8px';
  // Match a real dashboard column; the harness default (400px) truncates the
  // hero summary line that a live card shows in full.
  const main = document.querySelector('main') as HTMLElement | null;
  if (main) main.style.maxWidth = '500px';
  // The fixtures already carry neutral room names; only the deliberately-dead
  // fixture sensor is relabelled, so docs screenshots read as a normal home.
  hass.set('sensor.dead_sensor_temperature', {
    attributes: { friendly_name: 'Spare Sensor Temperature' },
  });
  // A realistic post-Apply install, so the Setup/Manage screenshot shows the
  // per-zone kill switches (all OFF, exactly as a fresh Apply leaves them)
  // and the full tuning set rather than the sparse fixture subset.
  for (const slug of ['downstairs', 'upstairs', 'office']) {
    hass.set(`input_boolean.climate_${slug}_enabled`, {
      state: 'off',
      attributes: { friendly_name: `Climate ${slug} enabled` },
    });
    hass.set(`input_text.climate_${slug}_applied_block`, { state: '' });
  }
  for (const [cls, value] of [
    ['runtime_alert_margin', '35'],
    ['runtime_learn_days', '30'],
    ['cdd_base', '75'],
  ] as const) {
    hass.set(`input_number.climate_${cls}`, { state: value });
  }
  const c = card as unknown as Record<string, unknown>;
  const openPanel = () => {
    // Upstairs is the fully-fixtured zone (schedule + runtime + room sensors).
    c._zoneIndex = 1;
    if (shot === 'controls') c._ctrlOpen = true;
    if (shot === 'runtime') c._rtOpen = true;
    if (shot === 'setup') c._setupOpen = true;
    if (shot.startsWith('tab-')) {
      c._setupOpen = true;
      c._setupTab = shot.slice(4);
      if (shot === 'tab-objects') void (card as unknown as { _loadObjects(): Promise<void> })._loadObjects();
    }
    if (shot === 'preview') {
      c._setupOpen = true;
      void (card as unknown as { _runDryRun(): Promise<void> })._runDryRun();
    }
    if (shot === 'schedule') c._schedOpen = true;
    (card as unknown as { requestUpdate(): void }).requestUpdate();
  };
  setTimeout(openPanel, 60);
  setTimeout(openPanel, 400);
}

// Harness controls
document.getElementById('btn-fan')?.addEventListener('click', () => {
  void hass.callService('timer', 'start', { entity_id: 'timer.climate_upstairs_fan' });
});
document.getElementById('btn-cool')?.addEventListener('click', () => {
  hass.set('climate.nest_upstairs', {
    attributes: { hvac_action: 'cooling' },
  });
});
document.getElementById('btn-unavail')?.addEventListener('click', () => {
  hass.set('climate.nest_downstairs', { state: 'unavailable' });
});
const logEl = document.getElementById('svc-log');
setInterval(() => {
  if (logEl) logEl.textContent = hass.log
    .slice(-5)
    .map((l) => `${l.domain}.${l.service} ${JSON.stringify(l.data ?? {})}`)
    .join('\n');
}, 500);
