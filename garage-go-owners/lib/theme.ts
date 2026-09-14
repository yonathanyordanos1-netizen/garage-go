// Garage Go — theme tokens.
//
// Warm identity kept from the approved prototype (Warm Espresso primary, Muted
// Sand accent, bone/umber neutrals). Two full palettes — light + dark — so the
// app can follow the phone's system setting or a manual override (see
// lib/theme-context.tsx). The dark palette is a warm espresso/walnut set, not a
// grey inversion.

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

  // Primary (Warm Espresso in light; a brighter warm tone in dark so fills stay legible)
  forest: string;      // token name kept for prompt compatibility = PRIMARY
  forestPressed: string;
  forestTint: string;  // wash behind active icons / badges
  onPrimary: string;   // text/icon color that sits ON a primary fill

  // Accent (Muted Sand) — stars, rings, small highlights
  accent: string;
  accentTint: string;

  // A dark branded surface (points card, vehicle card) — dark in BOTH themes
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
  ground: '#FDFDFB',
  surface: '#F5F2ED',
  card: '#FFFFFF',
  ink: '#3A2A1D',
  ink2: '#5C4D3E',
  muted: '#847A71',
  faint: '#ABA49E',
  line: '#E9E5DF',
  line2: '#E0D9D1',

  forest: '#5C3A21',
  forestPressed: '#4A2E19',
  forestTint: 'rgba(92,58,33,0.08)',
  onPrimary: '#FFFFFF',

  accent: '#C29B74',
  accentTint: 'rgba(194,155,116,0.16)',

  espresso: '#1F1813',
  onEspresso: '#F3ECE3',
  onEspressoMuted: 'rgba(243,236,227,0.62)',

  white: '#FFFFFF',

  success: '#16A34A', successTint: 'rgba(22,163,74,0.12)',
  error: '#DC2626',   errorTint: 'rgba(220,38,38,0.10)',
  warning: '#D97706', warningTint: 'rgba(217,119,6,0.12)',
  info: '#2563EB',    infoTint: 'rgba(37,99,235,0.12)',
};

const dark: Palette = {
  ground: '#161210',
  surface: '#211B16',
  card: '#241E18',
  ink: '#F1EBE2',
  ink2: '#D6CDC1',
  muted: '#9A9088',
  faint: '#6E655C',
  line: 'rgba(241,235,226,0.10)',
  line2: 'rgba(241,235,226,0.16)',

  // In dark, a solid espresso fill would disappear — the primary becomes a
  // brighter sand with dark text on it.
  forest: '#D6AE80',
  forestPressed: '#C29B6A',
  forestTint: 'rgba(214,174,128,0.14)',
  onPrimary: '#1A1410',

  accent: '#D6AE80',
  accentTint: 'rgba(214,174,128,0.14)',

  espresso: '#0F0C0A',
  onEspresso: '#F1EBE2',
  onEspressoMuted: 'rgba(241,235,226,0.60)',

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

// Warm-tinted elevation. shadowColor stays umber; on dark grounds the elevation
// reads mostly via Android's `elevation` and the card's own border.
export const shadows = {
  sm: { shadowColor: '#241813', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  md: { shadowColor: '#241813', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 4 },
  lg: { shadowColor: '#241813', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 22, elevation: 12 },
} as const;

export const font = { display: undefined as string | undefined };
