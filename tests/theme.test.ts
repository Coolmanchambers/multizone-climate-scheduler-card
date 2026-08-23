import { describe, it, expect } from 'vitest';
import {
  resolveTheme,
  serializeCustomTheme,
  THEME_PRESETS,
  DEFAULT_THEME,
} from '../src/lib/theme';

describe('resolveTheme', () => {
  it('resolves presets by name', () => {
    expect(resolveTheme('ember').presetKey).toBe('ember');
    expect(resolveTheme('ember').tokens.accent).toBe('#f4511e');
  });

  it('falls back to default on unknown/empty/unknown-state values', () => {
    for (const v of [undefined, null, '', 'unknown', 'nonsense', 'custom:junk']) {
      const r = resolveTheme(v as string | null | undefined);
      expect(r.presetKey).toBe(DEFAULT_THEME);
      expect(r.tokens).toEqual(THEME_PRESETS[DEFAULT_THEME]!.tokens);
    }
  });

  it('round-trips a custom theme', () => {
    const tokens = {
      accent: '#123456',
      accentBright: '#654321',
      good: '#00aa00',
      warn: '#ffcc00',
      bad: '#cc0000',
    };
    const r = resolveTheme(serializeCustomTheme(tokens));
    expect(r.presetKey).toBe('custom');
    expect(r.tokens).toEqual(tokens);
  });

  it('rejects custom strings with bad hex', () => {
    expect(resolveTheme('custom:#123456,#654321,#00aa00,#ffcc00,red').presetKey).toBe(
      DEFAULT_THEME,
    );
  });
});
