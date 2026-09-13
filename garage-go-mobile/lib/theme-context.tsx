import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { palettes, Palette } from './theme';

export type ThemePreference = 'system' | 'light' | 'dark';
type Mode = 'light' | 'dark';

type ThemeState = {
  colors: Palette;
  mode: Mode;                 // the resolved, active mode
  preference: ThemePreference; // the user's choice ('system' follows the OS)
  setPreference: (p: ThemePreference) => void;
  ready: boolean;
};

const STORAGE_KEY = 'theme_preference';

const ThemeContext = createContext<ThemeState>({
  colors: palettes.light,
  mode: 'light',
  preference: 'system',
  setPreference: () => {},
  ready: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // `useColorScheme` reflects the phone's system Light/Dark setting live.
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [ready, setReady] = useState(false);

  // Restore the saved preference once on launch.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (v === 'light' || v === 'dark' || v === 'system') setPreferenceState(v);
      })
      .finally(() => setReady(true));
  }, []);

  function setPreference(p: ThemePreference) {
    setPreferenceState(p);
    AsyncStorage.setItem(STORAGE_KEY, p).catch(() => {});
  }

  // 'system' → follow the OS; otherwise use the explicit choice.
  const mode: Mode = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;

  const value = useMemo<ThemeState>(
    () => ({ colors: palettes[mode], mode, preference, setPreference, ready }),
    [mode, preference, ready]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
