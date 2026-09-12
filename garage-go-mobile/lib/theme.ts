// Earthy & Organic palette — the single source of truth for colour in the app.
export const colors = {
  ground: '#F5E6CC', // Warm Beige
  card: '#FFFDF7',
  ink: '#2E2B25', // warm charcoal (headings)
  ink2: '#4A4A4A', // Slate Grey (body)
  muted: '#8A8478',
  faint: '#B3AC9C',
  line: '#E7DCC4',
  line2: '#DED2B8',
  forest: '#2D4F1E', // Forest Green
  forestD: '#24401A',
  forestL: '#3D6329',
  forestTint: '#EAF0E4',
  forestTint2: '#EEF3E7',
  terra: '#E27D60', // Terracotta
  terraD: '#CE6A4E',
  terraTint: '#FBEDE6',
  slate: '#4A4A4A',
  white: '#FFFFFF',
  warn: '#B45309',
};

export const radius = { sm: 11, md: 14, lg: 18, xl: 22, pill: 999 };

export const font = {
  // System fonts keep the build dependency-free. Swap for Outfit/Inter via
  // expo-font + useFonts if you want the exact prototype typefaces.
  display: undefined as string | undefined,
};

export const shadow = {
  card: {
    shadowColor: '#2E2B25',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
};
