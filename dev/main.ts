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
    { entity: 'climate.downstairs_thermostat', name: 'Downstairs' },
    {
      entity: 'climate.upstairs_thermostat',
      name: 'Upstairs',
      room_sensors: [
        // Item 36: the full age range - "now", minutes, tens of minutes, amber
        // hours, and a device dead for a day.
        { entity: 'sensor.bedroom_3_temperature', name: 'Bedroom 3', last_seen: 'sensor.bedroom_3_last_seen' },
        { entity: 'sensor.bedroom_1_temperature', name: 'Bedroom 1', last_seen: 'sensor.bedroom_1_last_seen' },
        { entity: 'sensor.bedroom_2_temperature', last_seen: 'sensor.bedroom_2_last_seen' },
        { entity: 'sensor.landing_temperature', last_seen: 'sensor.landing_last_seen' },
        { entity: 'sensor.dead_sensor_temperature', last_seen: 'sensor.dead_sensor_last_seen' },
      ],
    },
    { entity: 'climate.studio_mini_split', name: 'Studio' },
  ],
};

const hass = new MockHass();
// Item 36 companions, seeded relative to the real clock so the harness shows
// stable ages: fresh (3m), ageing (2h), and a device dead for a day whose temp
// entity still holds a value - the exact blind spot the feature closes.
const seenAgo = (ms: number) => new Date(Date.now() - ms).toISOString();
for (const [id, ms] of [
  ['sensor.bedroom_3_last_seen', 30 * 1000],
  ['sensor.bedroom_1_last_seen', 3 * 60_000],
  ['sensor.bedroom_2_last_seen', 20 * 60_000],
  ['sensor.landing_last_seen', 2 * 3_600_000],
  ['sensor.dead_sensor_last_seen', 26 * 3_600_000],
] as const) {
  hass.set(id, {
    state: seenAgo(ms),
    attributes: { device_class: 'timestamp', friendly_name: id },
  });
}
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
  for (const slug of ['downstairs', 'upstairs', 'studio']) {
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
      c._setupTab = 'setup';
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
  hass.set('climate.upstairs_thermostat', {
    attributes: { hvac_action: 'cooling' },
  });
});
document.getElementById('btn-unavail')?.addEventListener('click', () => {
  hass.set('climate.downstairs_thermostat', { state: 'unavailable' });
});
const logEl = document.getElementById('svc-log');
setInterval(() => {
  if (logEl) logEl.textContent = hass.log
    .slice(-5)
    .map((l) => `${l.domain}.${l.service} ${JSON.stringify(l.data ?? {})}`)
    .join('\n');
}, 500);
