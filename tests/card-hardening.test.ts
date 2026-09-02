import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { normalizeCardConfig } from '../src/types';
import { serializeCustomTheme, customSeedFrom, THEME_PRESETS } from '../src/lib/theme';
import type { MzcsCardConfig } from '../src/types';

/**
 * 0.7.7 fresh review (2026-09-01): card-side findings. Pure parts are
 * executed; the guards that live inside Lit handlers are pinned by source
 * scan, the pattern render-gate.test.ts established.
 */
const CARD_SRC = readFileSync(new URL('../src/multizone-climate-scheduler-card.ts', import.meta.url), 'utf8');
const EXEC_SRC = readFileSync(new URL('../src/provision-exec.ts', import.meta.url), 'utf8');

const bodyOf = (method: string): string => {
  const start = CARD_SRC.indexOf(`${method}(`);
  expect(start, method).toBeGreaterThan(-1);
  const next = CARD_SRC.indexOf('\n  private ', start + 1);
  return CARD_SRC.slice(start, next < 0 ? undefined : next);
};

describe('C6: malformed config shapes are refused at the boundary, not inside render', () => {
  const base = (): MzcsCardConfig =>
    ({ type: 'custom:x', zones: [{ entity: 'climate.a', name: 'A' }] }) as unknown as MzcsCardConfig;

  it('a non-list seasons block is refused with a readable message', () => {
    for (const seasons of [{}, 'summer', 5]) {
      const cfg = { ...base(), seasons } as unknown as MzcsCardConfig;
      expect(() => normalizeCardConfig(cfg), JSON.stringify(seasons)).toThrow(/seasons must be a list/);
    }
  });

  it('a null season row (a bare "-" in YAML) is refused', () => {
    const cfg = { ...base(), seasons: [null] } as unknown as MzcsCardConfig;
    expect(() => normalizeCardConfig(cfg)).toThrow(/Every seasons entry/);
  });

  it('a scalar room_sensors (one-line YAML typo) is refused, naming the zone', () => {
    const cfg = { ...base(), zones: [{ entity: 'climate.a', name: 'A', room_sensors: 'sensor.x' }] } as unknown as MzcsCardConfig;
    expect(() => normalizeCardConfig(cfg)).toThrow(/Zone 1: room_sensors must be a list/);
  });

  it('a null zone row is refused', () => {
    const cfg = { ...base(), zones: [null] } as unknown as MzcsCardConfig;
    expect(() => normalizeCardConfig(cfg)).toThrow(/Zone 1 must be/);
  });

  it('valid shapes (absent, empty list, string and object room sensors) still pass unchanged', () => {
    expect(() => normalizeCardConfig(base())).not.toThrow();
    const ok = {
      ...base(),
      seasons: [],
      zones: [{ entity: 'climate.a', name: 'A', room_sensors: ['sensor.x', { entity: 'sensor.y', name: 'Y' }] }],
    } as unknown as MzcsCardConfig;
    expect(normalizeCardConfig(ok).zones[0]!.room_sensors).toHaveLength(2);
  });
});

describe('C1: the theme helper can hold every custom theme', () => {
  it('every preset serialises to more than HA\'s default 100 but within the executor\'s 255', () => {
    // 12 tokens x 7 chars + 11 commas + 'custom:' = 102: HA's default max of
    // 100 refused it, silently, on every executor-provisioned install.
    for (const [key, p] of Object.entries(THEME_PRESETS)) {
      const s = serializeCustomTheme(customSeedFrom(p.tokens));
      expect(s.length, key).toBeGreaterThan(100);
      expect(s.length, key).toBeLessThanOrEqual(255);
    }
  });

  it('the executor creates input_text helpers with max 255 (creation-only, never in spec)', () => {
    expect(EXEC_SRC).toMatch(/if \(domain === 'input_text'\) Object\.assign\(body, \{ max: 255 \}\);/);
  });

  it('a refused theme write is caught and shown, never an unhandled rejection', () => {
    const body = bodyOf('private _renderThemePicker');
    expect(body).toMatch(/callService\('input_text', 'set_value', \{ entity_id: themeId, value \}\)\.catch\(/);
    expect(body).toContain('this._themeError = `Could not save the theme');
  });
});

describe('C2/C3: runtime drawer freshness and zone isolation', () => {
  it('_openDay stores a result only while its zone is still the loaded one', () => {
    const body = bodyOf('private async _openDay');
    const guard = body.indexOf('if (this._rtLoadedFor !== runningId) return;');
    const store = body.indexOf('this._rtDayCache.set(dayStart, detail)');
    expect(guard).toBeGreaterThan(-1);
    expect(store).toBeGreaterThan(guard);
  });

  it('the daily history is keyed on the zone AND the local day, and today is re-read on open', () => {
    const rt = bodyOf('private _renderRuntime');
    expect(rt).toContain('this._rtLoadedFor !== runningId || this._rtLoadedDay !== dayKey');
    const od = bodyOf('private async _openDay');
    expect(od).toContain('this._rtDayCache.has(dayStart) && dayStart + 86_400_000 <= Date.now()');
  });

  it('an external schedule edit re-reads the week when nothing is drafted', () => {
    const wu = bodyOf('protected willUpdate');
    expect(wu).toContain('this._schedDrafts.size > 0) return;');
    expect(wu).toContain('prev.states[schedId] === this.hass.states[schedId]) return;');
    expect(wu).toMatch(/queueMicrotask\(\(\) => void this\._loadWeek\(zone\)\)/);
  });
});

describe('C4/C7: steering unit gate, block-name bound, setConfig resets', () => {
  it('a Celsius zone cannot open the steering sheet', () => {
    const rooms = bodyOf('private _renderRooms');
    expect(rooms).toContain('const fahrenheit = setpoint != null && setpoint >= 45;');
    expect(rooms).toMatch(/const canOpen = Boolean\([^)]*&& fahrenheit\);/);
  });

  it('block names are bounded to 40 characters (they live inside the composed marker)', () => {
    expect(CARD_SRC).toContain('maxlength="40"');
    expect(CARD_SRC).toContain('.value.slice(0, 40)');
  });

  it('setConfig resets the Danger tab arming and the Objects tab key', () => {
    const sc = bodyOf('public setConfig');
    for (const line of ['this._tdAsk = false;', 'this._tdArmed = false;', "this._tdConfirm = '';", 'this._objectsLoadedFor = undefined;']) {
      expect(sc).toContain(line);
    }
  });

  it('the next-block off-peak preview caps a heat_cool adjustment at the deadband like hc_adj', () => {
    const sched = bodyOf('private _renderSchedule');
    expect(sched).toContain('Math.max(0, Math.min(offPeak.offset, (next.cool_temp - next.heat_temp - 2) / 2))');
  });
});
