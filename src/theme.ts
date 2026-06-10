/**
 * Matchstick design system.
 *
 * Visual language: warm cream + near-black green surface, seven vivid
 * accent colors (one per event theme), serif display headings, grotesk
 * body text, and letterspaced mono labels.
 *
 * Fonts (all SIL OFL, bundled in assets/fonts):
 *  - Instrument Serif  — display headings
 *  - Hanken Grotesk    — body text
 *  - Space Mono        — labels, buttons, numbers
 */

export const palette = {
  // Surfaces
  surface: '#0d1511', // near-black with a green undertone
  surfaceRaised: '#121a15',
  surfaceSunken: '#0a100c',
  cream: '#ece4d4', // warm paper
  creamBright: '#f6f0e4',

  // Foreground on dark
  fg: '#f3efe6',

  // Accent colors — one per event theme
  red: '#ff003d',
  orange: '#ff5c00',
  yellow: '#ffe500',
  green: '#64f873',
  aqua: '#00e0ff',
  blue: '#0038ff',
  purple: '#ad00ff',

  // Faded companions (used for chips/badges on light surfaces)
  redFaded: '#ffd9e2',
  orangeFaded: '#ffe2d1',
  yellowFaded: '#fff8ba',
  greenFaded: '#d5fdd9',
  aquaFaded: '#baf7ff',
  blueFaded: '#d9e1ff',
  purpleFaded: '#f3d9ff',

  // Status
  statusGreen: '#0de37c',
  statusYellow: '#fcd34d',
  statusRed: '#f32b3c',
} as const;

export type AccentName =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'aqua'
  | 'blue'
  | 'purple';

export const ACCENTS: AccentName[] = [
  'red',
  'orange',
  'yellow',
  'green',
  'aqua',
  'blue',
  'purple',
];

/** Text color readable on top of a given accent. */
export const textOnAccent: Record<AccentName, string> = {
  red: '#ffffff',
  orange: '#ffffff',
  yellow: '#000000',
  green: '#000000',
  aqua: '#000000',
  blue: '#ffffff',
  purple: '#ffffff',
};

export const fadedOf: Record<AccentName, string> = {
  red: palette.redFaded,
  orange: palette.orangeFaded,
  yellow: palette.yellowFaded,
  green: palette.greenFaded,
  aqua: palette.aquaFaded,
  blue: palette.blueFaded,
  purple: palette.purpleFaded,
};

/**
 * Opacity-based text hierarchy on the dark surface
 * (primary .95, secondary .8, hint .5, whisper .3 — matches the
 * alpha ramp used across the reference design).
 */
const a = (alpha: number) => `rgba(243, 239, 230, ${alpha})`;
export const text = {
  primary: a(0.95),
  secondary: a(0.8),
  hint: a(0.5),
  whisper: a(0.3),
} as const;

export const border = {
  default: a(0.2),
  active: a(0.35),
  bright: a(0.6),
} as const;

/** On-cream (light surface) ink. */
export const ink = {
  primary: 'rgba(13, 21, 17, 0.95)',
  secondary: 'rgba(13, 21, 17, 0.7)',
  hint: 'rgba(13, 21, 17, 0.45)',
} as const;

export const fonts = {
  serif: 'InstrumentSerif-Regular',
  serifItalic: 'InstrumentSerif-Italic',
  sans: 'HankenGrotesk-400',
  sansMedium: 'HankenGrotesk-500',
  sansSemiBold: 'HankenGrotesk-600',
  sansBold: 'HankenGrotesk-700',
  sansExtraBold: 'HankenGrotesk-800',
  mono: 'SpaceMono-Regular',
  monoBold: 'SpaceMono-Bold',
} as const;

/** Modular type scale (perfect-fourth-ish: ×1.333, ×1.778, ×2.37). */
export const type = {
  base: 17,
  h4: 17,
  h3: 23,
  h2: 30,
  h1: 40,
  hero: 48,
} as const;

export const radius = {
  input: 14, // ≈0.8rem
  card: 18,
  tray: 22,
  pill: 999,
} as const;

export const space = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/** Letterspaced mono button/label treatment. */
export const monoLabel = {
  fontFamily: fonts.monoBold,
  letterSpacing: 2,
  textTransform: 'uppercase' as const,
};
