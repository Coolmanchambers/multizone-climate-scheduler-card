import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * Backlog item 26 / QA S1, S2, T1.
 *
 * Unsaved schedule drafts outlive the drawer being collapsed, but Save and
 * Discard render only inside the drawer body — so a collapsed row could look
 * exactly like a saved schedule while holding changes that were not running.
 *
 * The first version of this file was itself a QA finding: it scanned raw source
 * including comments (so a mention in a comment satisfied it) and pinned the
 * textual order of a boolean conjunction (so an equivalent rewrite broke it
 * while a genuinely wrong nesting still passed). It now strips comments and
 * asserts order-insensitively.
 */
const RAW = readFileSync(new URL('../src/multizone-climate-scheduler-card.ts', import.meta.url), 'utf8');

/** Source with comments removed, so a claim in prose cannot satisfy a check. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

/** The body of a method, from its signature to the next member at the same indent. */
function methodBody(name: string): string {
  const src = stripComments(RAW);
  const at = src.indexOf(`private ${name}(`);
  expect(at, `${name} should exist`).toBeGreaterThan(-1);
  const rest = src.slice(at);
  const next = rest.slice(1).search(/\n  (?:private|public|protected|@state|static) /);
  return next < 0 ? rest : rest.slice(0, next + 1);
}

describe('unsaved schedule state is truthful and visible when collapsed', () => {
  const render = methodBody('_renderSchedule');
  const body = methodBody('_renderScheduleBody');

  it('asks whether saving would CHANGE the week, not merely whether drafts exist', () => {
    // QA S1: a granularity switch clones values without altering them, so
    // draft-presence flagged a running schedule as unsaved.
    expect(
      /draftsChangeWeek\s*\(/.test(render),
      '_renderSchedule must derive its unsaved state from draftsChangeWeek',
    ).toBe(true);
    expect(
      /_schedDrafts\.size\s*>\s*0/.test(render),
      'draft-presence must not be used as the unsaved signal',
    ).toBe(false);
  });

  it('uses the same question inside the drawer, so the row and the buttons cannot disagree', () => {
    expect(/draftsChangeWeek\s*\(/.test(body)).toBe(true);
    expect(/_schedDrafts\.size\s*>\s*0/.test(body)).toBe(false);
  });

  it('marks the collapsed row itself, not only the open body', () => {
    // The chip must appear in the row markup, which renders in both states.
    expect(/unsavedchip/.test(render)).toBe(true);
    expect(/unsavedchip/.test(body)).toBe(false);
  });

  it('explains the state while the drawer is closed, whichever way the guard is written', () => {
    // Order-insensitive: the point is that the closed state and the unsaved
    // state are both consulted in the always-rendered method.
    expect(/_schedOpen/.test(render)).toBe(true);
    expect(/unsavedhint/.test(render)).toBe(true);
    expect(/unsavedhint/.test(body), 'the hint must not live only in the open body').toBe(false);
  });

  it('surfaces the discarded-edits notice where a collapsed user can see it', () => {
    // QA S2: the notice used to render only inside the drawer - the one state
    // the collapsed hint invites the user to stay in.
    expect(/_schedNotice/.test(render)).toBe(true);
  });

  it('still warns when drafts are dropped by a zone or season change', () => {
    expect(stripComments(RAW)).toContain('Unsaved schedule edits were discarded');
  });
});
