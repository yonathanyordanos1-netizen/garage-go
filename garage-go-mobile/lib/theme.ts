// Warm Editorial Minimal palette — 60 / 30 / 10.
//   Background (60%)  #FDFDFB  Warm Bone White  — surfaces, cards, empty states
//   Structure (30%)   #3A2A1D  Raw Umber        — text, icons, borders, dark surfaces
//   Accent (10%)      #C29B74  Muted Sand       — active states, CTAs, badges, ring fill
// Only colour changed from the previous palette; type, spacing, radii, shadows are unchanged.
export const colors = {
  ground: '#FDFDFB', // Warm Bone White
  card: '#FDFDFB',
  ink: '#3A2A1D', // Raw Umber — headings / structure
  ink2: '#3A2A1D', // body text
  muted: '#847A71', // Raw Umber ~62% over bone (secondary text)
  faint: '#ABA49E', // Raw Umber ~42% over bone (tertiary / placeholders)
  line: '#E6E4E0', // Raw Umber ~12% over bone (hairlines / borders)
  line2: '#DEDBD7', // Raw Umber ~16% over bone

  // Accent (Muted Sand) — the single 10% colour.
  forest: '#C29B74', // token name kept for compatibility; value is the accent
  forestD: '#B0895F', // pressed accent
  forestL: '#C29B74',
  forestTint: 'rgba(194,155,116,0.16)', // sand wash for chips / badges
  forestTint2: 'rgba(194,155,116,0.12)',
  terra: '#C29B74', // legacy accent name → same accent
  terraD: '#B0895F',
  terraTint: 'rgba(194,155,116,0.16)',

  // Dark editorial surface = Raw Umber, with bone text on top.
  surface: '#3A2A1D',
  onDark: '#FDFDFB',
  onDarkMuted: 'rgba(253,253,251,0.68)',

  slate: '#3A2A1D',
  white: '#FDFDFB',

  // Derived semantic tones kept inside the warm family.
  warn: '#A15C4F', // desaturated clay (error / danger)
  success: '#7A8B6F', // muted sage
};

export const radius = { sm: 11, md: 14, lg: 18, xl: 22, pill: 999 };

export const font = {
  // System fonts keep the build dependency-free. Swap for Outfit/Inter via
  // expo-font + useFonts if you want the exact prototype typefaces.
  display: undefined as string | undefined,
};

export const shadow = {
  // Warm-tinted elevation (unchanged token values, umber-based colour).
  card: {
    shadowColor: '#3A2A1D',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  lg: {
    shadowColor: '#3A2A1D',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -2 },
    elevation: 12,
  },
};
