import { describe, it, expect } from 'vitest';
import {
  resolveTheme,
  serializeCustomTheme,
  customSeedFrom,
  THEME_PRESETS,
  DEFAULT_THEME,
  type ThemeTokens,
} from '../src/lib/theme';

describe('resolveTheme', () => {
  it('resolves presets by name, including full surface palettes', () => {
    const ember = resolveTheme('ember');
    expect(ember.presetKey).toBe('ember');
    expect(ember.tokens.accent).toBe('#f4511e');
    expect(ember.tokens.bg).toBe('#241c18');
  });

  it('ha-default maps every token to an HA theme variable', () => {
    const r = resolveTheme('ha-default');
    expect(r.presetKey).toBe('ha-default');
    for (const v of Object.values(r.tokens)) expect(v.startsWith('var(--')).toBe(true);
  });

  it('falls back to default on unknown/empty values', () => {
    for (const v of [undefined, null, '', 'unknown', 'nonsense', 'custom:junk']) {
      const r = resolveTheme(v as string | null | undefined);
      expect(r.presetKey).toBe(DEFAULT_THEME);
      expect(r.tokens).toEqual(THEME_PRESETS[DEFAULT_THEME]!.tokens);
    }
  });

  it('round-trips a 12-token custom theme', () => {
    const tokens: ThemeTokens = {
      accent: '#123456',
      accentBright: '#654321',
      good: '#00aa00',
      warn: '#ffcc00',
      bad: '#cc0000',
      bg: '#111111',
      surface: '#222222',
      chip: '#333333',
      track: '#0a0a0a',
      border: '#444444',
      text: '#eeeeee',
      textDim: '#999999',
    };
    const r = resolveTheme(serializeCustomTheme(tokens));
    expect(r.presetKey).toBe('custom');
    expect(r.tokens).toEqual(tokens);
  });

  it('accepts legacy 5-part customs with Nest Blue surfaces', () => {
    const r = resolveTheme('custom:#123456,#654321,#00aa00,#ffcc00,#cc0000');
    expect(r.presetKey).toBe('custom');
    expect(r.tokens.accent).toBe('#123456');
    expect(r.tokens.bg).toBe(THEME_PRESETS['nest-blue']!.tokens.bg);
  });

  it('rejects custom strings with bad hex', () => {
    expect(resolveTheme('custom:#123456,#654321,#00aa00,#ffcc00,red').presetKey).toBe(
      DEFAULT_THEME,
    );
  });
});

describe('customSeedFrom', () => {
  it('passes hex palettes through and replaces var() palettes with Nest Blue', () => {
    expect(customSeedFrom(THEME_PRESETS.ember!.tokens)).toEqual(THEME_PRESETS.ember!.tokens);
    expect(customSeedFrom(THEME_PRESETS['ha-default']!.tokens)).toEqual(
      THEME_PRESETS['nest-blue']!.tokens,
    );
  });
});
