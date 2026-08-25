import { describe, it, expect } from 'vitest';
import { errorText } from '../src/ha-adapter';

/**
 * QA finding R5. `errorText` is typed `: string` but fell through to
 * `JSON.stringify(e)`, which returns the *value* `undefined` for `undefined`
 * input - so the caller's `if (error)` went false and the card rendered
 * "History accrues daily...", the exact message the failure path exists to
 * replace. Home Assistant's websocket client also rejects in-flight commands
 * with a bare numeric code when the socket drops, which surfaced as "3".
 *
 * Every branch must return a non-empty, human-readable string.
 */
describe('errorText always returns a usable message', () => {
  it('never returns a non-string, whatever it is handed', () => {
    for (const input of [undefined, null, 0, NaN, '', false, Symbol('x'), () => 1, {}, []]) {
      const out = errorText(input);
      expect(typeof out, `errorText(${String(input)}) must be a string`).toBe('string');
      expect(out.length, `errorText(${String(input)}) must not be empty`).toBeGreaterThan(0);
    }
  });

  it('keeps a real Error message', () => {
    expect(errorText(new Error('recorder is not running'))).toBe('recorder is not running');
  });

  it('keeps an object message', () => {
    expect(errorText({ message: 'database is locked' })).toBe('database is locked');
  });

  it('turns a bare websocket error code into something a person can read', () => {
    // HA rejects with codes like this when a sleeping tablet drops its socket.
    const out = errorText(3);
    expect(out).not.toBe('3');
    expect(out.toLowerCase()).toContain('connection');
  });

  it('names the code when Home Assistant sends its string form', () => {
    const out = errorText({ code: 'connection_lost' });
    expect(out.toLowerCase()).toContain('connection');
  });

  it('falls back to a readable phrase rather than an empty or literal-undefined string', () => {
    expect(errorText(undefined)).toMatch(/[a-z]/i);
    expect(errorText(undefined)).not.toBe('undefined');
  });

  it('degrades rather than throwing on a hostile object (Fable pass)', () => {
    // errorText runs inside catch blocks; if it throws, the rejection escapes
    // and the failure handling it exists to feed never runs.
    const hostile = { get message(): string { throw new Error('trap'); } };
    expect(() => errorText(hostile)).not.toThrow();
    expect(errorText(hostile).length).toBeGreaterThan(0);
  });
});
