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
    // Scoped to MANAGE_TUNABLES: a loose `cls: '...'` scan also matches
    // unrelated maps (the Objects-tab status chips), which would launder a
    // future unwatched class into "covered".
    const tunables = declaredClasses('MANAGE_TUNABLES');
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

  it('never hand-assembles an entity id outside the naming generators', () => {
    // A template-literal id cannot be seen by the class scan above, so it can
    // diverge from the watch list silently. This is exactly how the schedule
    // entity slipped through review: the reader built its own id while the
    // watch list used zoneScheduleId.
    const handmade = [
      ...SRC.matchAll(/`(schedule|automation|sensor|binary_sensor|input_[a-z]+|timer)\.\$\{/g),
    ].map((m) => m[0]);
    expect(handmade, `hand-assembled ids must use src/lib/naming.ts: ${handmade.join(', ')}`).toEqual([]);
  });

  it('reads no hard-coded literal entity id', () => {
    const literals = [...SRC.matchAll(/states\['([a-z_]+\.[a-z0-9_]+)'\]/g)].map((m) => m[1]!);
    expect(literals, `literal entity reads bypass the watch list: ${literals.join(', ')}`).toEqual([]);
  });

  it('watches the schedule entity the renderer actually resolves', () => {
    // The renderer resolves the ACTIVE season, which can differ from the
    // configured seasons list; the watch list must cover both.
    expect(SRC).toContain('const active = this._activeSeasonKey();');
    expect(SRC).toContain('if (active) ids.push(zoneScheduleId(p, slug, active));');
  });

  it('watches the last_seen companions the room rows read (item 36)', () => {
    // Companion ids come from config, not a naming generator, so the class
    // scans above cannot see them. A source scan is second-class evidence, but
    // it stops the watch push being quietly removed: without it a companion
    // update would not break through the gate and the age label would freeze.
    expect(SRC).toContain('if (rs.last_seen) ids.push(rs.last_seen);');
    // And the renderer actually consumes the companion via the adapter opts.
    expect(SRC).toContain('lastSeenEntity: rs.last_seen');
  });

  it('backs the wall-clock fallback with a real timer', () => {
    // Both QA reviewers flagged that the minute branch only ran when hass
    // traffic happened to arrive. A frozen sensor generates no traffic.
    expect(SRC).toContain('setInterval(');
    expect(SRC).toContain('clearInterval(');
  });

  it('keeps the gate reference-based with a wall-clock fallback', () => {
    // Time-derived output (next block, runtime) must still refresh when no
    // watched entity changed, so the minute tick is part of the contract.
    expect(SRC).toContain('prev.states[id] !== next.states[id]');
    expect(SRC).toContain('_renderedMinute');
  });
});
