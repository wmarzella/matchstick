/**
 * Matchstick design system.
 *
 * Values are copied verbatim from the match.box production CSS bundle
 * (see docs/matchbox-reference.css). The site themes the entire UI around
 * a single foreground/background pair plus an accent; text hierarchy is the
 * foreground color at descending alpha (.95 / .8 / .5 / .3), borders at
 * .2 / .35. We reproduce that exactly here.
 *
 * Fonts: match.box uses Louize (serif display), system-ui (body), and
 * Berkeley Mono (mono). Those are commercial; we substitute the closest
 * SIL OFL faces — Instrument Serif, Hanken Grotesk, Space Mono.
 */

/* Foreground / background, straight from the bundle's default theme. */
export const FG_RGB = '216, 207, 197'; // #d8cfc5
export const BG_RGB = '9, 17, 13'; // #09110d

export const palette = {
  // Surfaces (literal)
  background: '#09110d', // body background — rgb(9,17,13)
  surface: '#0d1511', // --color-surface
  surfaceSunken: '#09110d',
  cream: '#d8cfc5', // --color-foreground base
  creamBright: '#ece4d4',
  fg: '#d8cfc5',

  // Accent colors — literal (--color-*)
  red: '#ff003d',
  orange: '#ff5c00',
  yellow: '#ffe500',
  green: '#64f873',
  aqua: '#00e0ff',
  blue: '#0038ff',
  purple: '#ad00ff',

  // Faded companions (--color-*-faded)
  redFaded: '#ffd9e2',
  orangeFaded: '#ffe2d1',
  yellowFaded: '#fff8ba',
  greenFaded: '#d5fdd9',
  aquaFaded: '#baf7ff',
  blueFaded: '#d9e1ff',
  purpleFaded: '#f3d9ff',

  // Status (--color-status-*)
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

/** Text color readable on a given accent (--color-text-on-*). */
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
 * Foreground at descending alpha — the literal text ramp.
 * --color-text-primary   = fg / .95
 * --color-text-secondary = fg / .8 * .95
 * --color-text-hint      = fg / .5 * .95
 * --color-text-whisper   = fg / .3 * .95
 */
const fg = (mult: number) => `rgba(${FG_RGB}, ${(mult * 0.95).toFixed(3)})`;
export const text = {
  primary: fg(1),
  secondary: fg(0.8),
  hint: fg(0.5),
  whisper: fg(0.3),
} as const;

export const border = {
  default: fg(0.2), // --color-border
  active: fg(0.35), // --color-border-active
  bright: fg(0.6),
} as const;

/** On-cream (light surface) ink. */
export const ink = {
  primary: `rgba(${BG_RGB}, 0.95)`,
  secondary: `rgba(${BG_RGB}, 0.7)`,
  hint: `rgba(${BG_RGB}, 0.45)`,
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

/**
 * Type scale — literal. --heading-size-base resolves so that:
 *   h1 = base × 2.370, h2 = base × 1.778, h3 = base × 1.333, h4 = base.
 * Body renders ~16.4px; headings use the serif at weight ~620.
 */
export const type = {
  base: 17,
  h4: 17,
  h3: 23,
  h2: 30,
  h1: 40,
  hero: 48,
} as const;

/** --input-border-radius is .75rem (12px). Cards/trays scale from there. */
export const radius = {
  input: 12,
  card: 12,
  tray: 20,
  pill: 9999,
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

/**
 * Letterspaced uppercase button treatment — literal from .login-page__button:
 * text-transform uppercase, letter-spacing .075em, font-weight 600.
 * (match.box uses the body font here; we keep mono for the labels' character.)
 */
export const monoLabel = {
  fontFamily: fonts.monoBold,
  letterSpacing: 2,
  textTransform: 'uppercase' as const,
};

/**
 * Per-accent theme object. match.box recolors the whole surface around the
 * event accent; callers pass an AccentName and get the resolved colors.
 */
export interface AccentTheme {
  accent: string;
  onAccent: string;
  faded: string;
}
export const accentTheme = (name: AccentName): AccentTheme => ({
  accent: palette[name],
  onAccent: textOnAccent[name],
  faded: fadedOf[name],
});
