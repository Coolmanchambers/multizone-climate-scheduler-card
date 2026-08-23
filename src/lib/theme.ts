// Card theming (Tim, pre-S12). A theme is five accent tokens layered over the
// HA theme's surfaces/text. Stored in input_text.{prefix}_theme as either a
// preset name or "custom:<accent>,<accentBright>,<good>,<warn>,<bad>".

export interface ThemeTokens {
  accent: string;
  accentBright: string;
  good: string;
  warn: string;
  bad: string;
}

export const THEME_PRESETS: Record<string, { label: string; tokens: ThemeTokens }> = {
  'nest-blue': {
    label: 'Nest Blue',
    tokens: { accent: '#1e88e5', accentBright: '#42a5f5', good: '#2bb673', warn: '#f59e0b', bad: '#e5484d' },
  },
  ember: {
    label: 'Ember',
    tokens: { accent: '#f4511e', accentBright: '#ff7043', good: '#66bb6a', warn: '#ffb300', bad: '#d32f2f' },
  },
  forest: {
    label: 'Forest',
    tokens: { accent: '#2e7d32', accentBright: '#66bb6a', good: '#9ccc65', warn: '#ffa000', bad: '#e53935' },
  },
  orchid: {
    label: 'Orchid',
    tokens: { accent: '#7e57c2', accentBright: '#9575cd', good: '#26a69a', warn: '#ffb300', bad: '#ec407a' },
  },
};

export const DEFAULT_THEME = 'nest-blue';
const HEX = /^#[0-9a-f]{6}$/i;
const ORDER: Array<keyof ThemeTokens> = ['accent', 'accentBright', 'good', 'warn', 'bad'];

export function serializeCustomTheme(tokens: ThemeTokens): string {
  return `custom:${ORDER.map((k) => tokens[k]).join(',')}`;
}

/** Parse a stored theme value. Anything malformed falls back to the default. */
export function resolveTheme(stored: string | undefined | null): {
  presetKey: string;
  tokens: ThemeTokens;
} {
  const fallback = { presetKey: DEFAULT_THEME, tokens: THEME_PRESETS[DEFAULT_THEME]!.tokens };
  if (!stored) return fallback;
  const preset = THEME_PRESETS[stored];
  if (preset) return { presetKey: stored, tokens: preset.tokens };
  if (stored.startsWith('custom:')) {
    const parts = stored.slice('custom:'.length).split(',');
    if (parts.length === ORDER.length && parts.every((p) => HEX.test(p.trim()))) {
      const tokens = Object.fromEntries(
        ORDER.map((k, i) => [k, parts[i]!.trim().toLowerCase()]),
      ) as unknown as ThemeTokens;
      return { presetKey: 'custom', tokens };
    }
  }
  return fallback;
}
