import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * Backlog item 26: unsaved schedule drafts survive the drawer being collapsed,
 * but the Save/Discard pair only exists inside the drawer body. So a user could
 * close the drawer and come back to a row that looked exactly like their saved
 * schedule while holding edits that were not running.
 *
 * The fix is that the *collapsed* row says so. This pins that, in the source-scan
 * style of render-gate.test.ts, because the suite runs in node with no DOM:
 * the unsaved signal must be computed in `_renderSchedule` - the part that always
 * renders - and not only in `_renderScheduleBody`, which renders only when open.
 */
const SRC = readFileSync(new URL('../src/multizone-climate-scheduler-card.ts', import.meta.url), 'utf8');

/** The body of a method, from its signature to the next method at the same indent. */
function methodBody(name: string): string {
  const at = SRC.indexOf(`private ${name}(`);
  expect(at, `${name} should exist`).toBeGreaterThan(-1);
  const rest = SRC.slice(at);
  const next = rest.slice(1).search(/\n  (?:private|public|protected|@state|static) /);
  return next < 0 ? rest : rest.slice(0, next + 1);
}

describe('unsaved schedule drafts are visible with the drawer closed', () => {
  const render = methodBody('_renderSchedule');

  it('computes the unsaved state in the always-rendered part of the schedule row', () => {
    expect(
      /_schedDrafts\.size\s*>\s*0/.test(render),
      '_renderSchedule must consult _schedDrafts; otherwise the only unsaved indicator ' +
        'lives in _renderScheduleBody and disappears when the drawer is collapsed',
    ).toBe(true);
  });

  it('marks the collapsed row itself, not just the open body', () => {
    // The indicator has to be attached to the row markup, which renders in both states.
    expect(/schedrow[^`]*unsaved/.test(render) || /unsavedchip/.test(render)).toBe(true);
  });

  it('explains the state somewhere reachable while the drawer is closed', () => {
    // A bare chip is a hint; the row must also be able to say what it means when
    // the body - which holds Save/Discard - is not on screen.
    expect(/!this\._schedOpen\s*&&\s*unsaved/.test(render)).toBe(true);
  });

  it('still tells the user when drafts are dropped by a zone or season change', () => {
    // The neighbouring guarantee, already shipped - kept here so a refactor of this
    // area cannot quietly remove it while satisfying the checks above.
    expect(SRC).toContain('Unsaved schedule edits were discarded');
  });
});
