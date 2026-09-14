// Garage Go OWNERS — theme tokens.
//
// The customer app wears a warm espresso identity. The Owners app is the
// operator console — a cooler, more "dashboard" identity (deep teal primary,
// slate neutrals, a signal-amber accent). Token NAMES are kept identical to the
// customer app (`forest` = PRIMARY, `accent`, `espresso`, …) so the shared
// `components/ui.tsx` renders unchanged; only the values differ. Two full
// palettes — light + dark — driven by lib/theme-context.tsx.

export type Palette = {
  ground: string;      // app canvas
  surface: string;     // subtle raised fill (chips, inputs, segmented tracks)
  card: string;        // card / sheet surface
  ink: string;         // primary text / strong structure
  ink2: string;        // body text
  muted: string;       // secondary text
  faint: string;       // tertiary text / placeholders
  line: string;        // hairline borders / separators
  line2: string;       // slightly stronger border

  // Primary (Deep Teal in light; a brighter cyan-teal in dark so fills stay legible)
  forest: string;      // token name kept for component compatibility = PRIMARY
  forestPressed: string;
  forestTint: string;  // wash behind active icons / badges
  onPrimary: string;   // text/icon color that sits ON a primary fill

  // Accent (Signal Amber) — earnings, highlights, small emphasis
  accent: string;
  accentTint: string;

  // A dark branded surface (earnings card, hero) — dark in BOTH themes
  espresso: string;
  onEspresso: string;
  onEspressoMuted: string;

  white: string;

  // Semantic
  success: string; successTint: string;
  error: string;   errorTint: string;
  warning: string; warningTint: string;
  info: string;    infoTint: string;
};

const light: Palette = {
  ground: '#F7F9FA',
  surface: '#EDF1F3',
  card: '#FFFFFF',
  ink: '#12222B',
  ink2: '#37505C',
  muted: '#6B818C',
  faint: '#A2B2BA',
  line: '#E3E9EC',
  line2: '#D6DEE2',

  forest: '#0E6E7E',
  forestPressed: '#0A5866',
  forestTint: 'rgba(14,110,126,0.10)',
  onPrimary: '#FFFFFF',

  accent: '#E0912F',
  accentTint: 'rgba(224,145,47,0.16)',

  espresso: '#0F2D3A',
  onEspresso: '#E8F1F3',
  onEspressoMuted: 'rgba(232,241,243,0.62)',

  white: '#FFFFFF',

  success: '#15A34A', successTint: 'rgba(21,163,74,0.12)',
  error: '#DC2626',   errorTint: 'rgba(220,38,38,0.10)',
  warning: '#D97706', warningTint: 'rgba(217,119,6,0.12)',
  info: '#2563EB',    infoTint: 'rgba(37,99,235,0.12)',
};

const dark: Palette = {
  ground: '#0B171D',
  surface: '#132630',
  card: '#152C37',
  ink: '#E9F1F3',
  ink2: '#C3D2D8',
  muted: '#8497A0',
  faint: '#5C6E77',
  line: 'rgba(233,241,243,0.10)',
  line2: 'rgba(233,241,243,0.16)',

  // In dark, a solid deep-teal fill would recede — the primary becomes a
  // brighter cyan-teal with dark text on it.
  forest: '#3FC2D1',
  forestPressed: '#33A7B5',
  forestTint: 'rgba(63,194,209,0.14)',
  onPrimary: '#06161B',

  accent: '#F1AE52',
  accentTint: 'rgba(241,174,82,0.16)',

  espresso: '#071319',
  onEspresso: '#E9F1F3',
  onEspressoMuted: 'rgba(233,241,243,0.60)',

  white: '#FFFFFF',

  success: '#4ADE80', successTint: 'rgba(74,222,128,0.14)',
  error: '#F87171',   errorTint: 'rgba(248,113,113,0.14)',
  warning: '#FBBF24', warningTint: 'rgba(251,191,36,0.14)',
  info: '#60A5FA',    infoTint: 'rgba(96,165,250,0.14)',
};

export const palettes = { light, dark };

// Static default (light) — used by the icon set's default color and any code
// that hasn't opted into the theme context. Screens should use useTheme().
export const colors = light;

export const radius = { sm: 10, md: 14, lg: 18, xl: 22, pill: 999 };

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

// Cool-tinted elevation. shadowColor stays a deep slate-teal.
export const shadows = {
  sm: { shadowColor: '#0B222B', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 1 },
  md: { shadowColor: '#0B222B', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.10, shadowRadius: 10, elevation: 4 },
  lg: { shadowColor: '#0B222B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.14, shadowRadius: 22, elevation: 12 },
} as const;

export const font = { display: undefined as string | undefined };
