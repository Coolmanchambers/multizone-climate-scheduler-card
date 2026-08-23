// Card theming. A theme owns the WHOLE card look - surfaces, text, and accents -
// not just alert colors. Stored in input_text.{prefix}_theme as a preset name or
// "custom:<12 hex values>". The "ha-default" preset maps every token to Home
// Assistant's own theme variables so the card blends with the native UI.

export interface ThemeTokens {
  accent: string;
  accentBright: string;
  good: string;
  warn: string;
  bad: string;
  bg: string;
  surface: string;
  chip: string;
  track: string;
  border: string;
  text: string;
  textDim: string;
}

const NEST_BLUE: ThemeTokens = {
  accent: '#1e88e5',
  accentBright: '#42a5f5',
  good: '#2bb673',
  warn: '#f59e0b',
  bad: '#e5484d',
  bg: '#1c262e',
  surface: '#243039',
  chip: '#2b3844',
  track: '#16202a',
  border: '#3d4a55',
  text: '#e8edf1',
  textDim: '#9fb0bd',
};

export const THEME_PRESETS: Record<string, { label: string; tokens: ThemeTokens }> = {
  'nest-blue': { label: 'Nest Blue', tokens: NEST_BLUE },
  ember: {
    label: 'Ember',
    tokens: {
      accent: '#f4511e',
      accentBright: '#ff7043',
      good: '#66bb6a',
      warn: '#ffb300',
      bad: '#d32f2f',
      bg: '#241c18',
      surface: '#2f2521',
      chip: '#3a2d27',
      track: '#1a1310',
      border: '#54413a',
      text: '#f2e9e4',
      textDim: '#b8a69b',
    },
  },
  forest: {
    label: 'Forest',
    tokens: {
      accent: '#43a047',
      accentBright: '#66bb6a',
      good: '#9ccc65',
      warn: '#ffa000',
      bad: '#e53935',
      bg: '#18211b',
      surface: '#212d25',
      chip: '#2a382e',
      track: '#111813',
      border: '#3d4f43',
      text: '#e6efe8',
      textDim: '#9fb3a5',
    },
  },
  orchid: {
    label: 'Orchid',
    tokens: {
      accent: '#7e57c2',
      accentBright: '#9575cd',
      good: '#26a69a',
      warn: '#ffb300',
      bad: '#ec407a',
      bg: '#1f1b2a',
      surface: '#292336',
      chip: '#342c44',
      track: '#161221',
      border: '#4a4060',
      text: '#eae6f2',
      textDim: '#a89fbd',
    },
  },
  'ha-default': {
    label: 'HA Default',
    tokens: {
      accent: 'var(--primary-color, #03a9f4)',
      accentBright: 'var(--light-primary-color, var(--primary-color, #03a9f4))',
      good: 'var(--success-color, #2bb673)',
      warn: 'var(--warning-color, #f59e0b)',
      bad: 'var(--error-color, #e5484d)',
      bg: 'var(--ha-card-background, var(--card-background-color, #fff))',
      surface: 'var(--secondary-background-color, #f0f0f0)',
      chip: 'var(--secondary-background-color, #f0f0f0)',
      track: 'var(--divider-color, #e0e0e0)',
      border: 'var(--divider-color, #e0e0e0)',
      text: 'var(--primary-text-color, #212121)',
      textDim: 'var(--secondary-text-color, #727272)',
    },
  },
};

export const DEFAULT_THEME = 'nest-blue';
const HEX = /^#[0-9a-f]{6}$/i;
const ORDER: Array<keyof ThemeTokens> = [
  'accent',
  'accentBright',
  'good',
  'warn',
  'bad',
  'bg',
  'surface',
  'chip',
  'track',
  'border',
  'text',
  'textDim',
];

export function serializeCustomTheme(tokens: ThemeTokens): string {
  return `custom:${ORDER.map((k) => tokens[k]).join(',')}`;
}

/**
 * Custom themes are always all-hex (var() references belong to presets only),
 * so serialization stays stable and portable. A custom seeded from ha-default
 * starts from Nest Blue's hex values instead.
 */
export function customSeedFrom(tokens: ThemeTokens): ThemeTokens {
  const allHex = ORDER.every((k) => HEX.test(tokens[k]));
  return allHex ? { ...tokens } : { ...NEST_BLUE };
}

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
    // Back-compat: 5-part accent-only customs keep Nest Blue surfaces.
    if (parts.length === 5 && parts.every((p) => HEX.test(p.trim()))) {
      const [accent, accentBright, good, warn, bad] = parts.map((p) => p.trim().toLowerCase());
      return {
        presetKey: 'custom',
        tokens: { ...NEST_BLUE, accent: accent!, accentBright: accentBright!, good: good!, warn: warn!, bad: bad! },
      };
    }
    if (parts.length === ORDER.length && parts.every((p) => HEX.test(p.trim()))) {
      const tokens = Object.fromEntries(
        ORDER.map((k, i) => [k, parts[i]!.trim().toLowerCase()]),
      ) as unknown as ThemeTokens;
      return { presetKey: 'custom', tokens };
    }
  }
  return fallback;
}
