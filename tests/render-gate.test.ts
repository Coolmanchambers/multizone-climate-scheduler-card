import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { zoneEntityId, globalEntityId, zoneScheduleId } from '../src/lib/naming';

/**
 * The render gate (shouldUpdate) re-renders only when a WATCHED entity changed.
 * An unwatched read means the card silently shows stale data, so this scans the
 * source for entity-class reads and requires the gate's lists to cover them.
 */
const SRC = readFileSync(new URL('../src/multizone-climate-scheduler-card.ts', import.meta.url), 'utf8');

/** Quoted names inside `const <name> ... = [ ... ]`, without dynamic regex. */
function declaredClasses(constName: string): string[] {
  const at = SRC.indexOf(`const ${constName}`);
  if (at < 0) return [];
  // Skip past the type annotation, whose `[]` would otherwise match first.
  const eq = SRC.indexOf('=', at);
  const open = SRC.indexOf('[', eq);
  const close = SRC.indexOf(']', open);
  if (open < 0 || close < 0) return [];
  return [...SRC.slice(open, close).matchAll(/'([a-z_]+)'/g)].map((m) => m[1]!);
}

function readClasses(fn: 'zoneEntityId' | 'globalEntityId'): string[] {
  const re = new RegExp(fn + "\\('([a-z_]+)'", 'g');
  return [...new Set([...SRC.matchAll(re)].map((m) => m[1]!))];
}

describe('render gate watch list', () => {
  it('watches every per-zone entity class the card reads', () => {
    const watched = new Set(declaredClasses('ZONE_WATCH'));
    expect(watched.size).toBeGreaterThan(0);
    const missing = readClasses('zoneEntityId').filter((c) => !watched.has(c));
    expect(missing, `zone classes read but not watched: ${missing.join(', ')}`).toEqual([]);
  });

  it('watches every global entity class the card reads', () => {
    const tunables = [...SRC.matchAll(/cls: '([a-z_]+)'/g)].map((m) => m[1]!);
    const watched = new Set([...declaredClasses('GLOBAL_WATCH'), ...tunables]);
    expect(watched.size).toBeGreaterThan(0);
    const missing = readClasses('globalEntityId').filter((c) => !watched.has(c));
    expect(missing, `global classes read but not watched: ${missing.join(', ')}`).toEqual([]);
  });

  it('the watched classes resolve to the ids those generators produce', () => {
    expect(zoneEntityId('zone_enabled', 'climate', 'upstairs')).toBe(
      'input_boolean.climate_upstairs_enabled',
    );
    expect(globalEntityId('season_select', 'climate')).toBe('input_select.climate_season');
    expect(zoneScheduleId('climate', 'upstairs', 'summer')).toBe('schedule.climate_upstairs_summer');
  });

  it('keeps the gate reference-based with a wall-clock fallback', () => {
    // Time-derived output (next block, runtime) must still refresh when no
    // watched entity changed, so the minute tick is part of the contract.
    expect(SRC).toContain('prev.states[id] !== next.states[id]');
    expect(SRC).toContain('_renderedMinute');
  });
});
