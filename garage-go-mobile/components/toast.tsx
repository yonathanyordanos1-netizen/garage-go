import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { colors } from '../lib/theme';

type ToastFn = (message: string) => void;
const ToastContext = createContext<ToastFn>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState('');
  const opacity = useRef(new Animated.Value(0)).current;

  const show = useCallback((message: string) => {
    setMsg(message);
    Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 350, useNativeDriver: true }).start();
    }, 2100);
  }, [opacity]);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <Animated.View pointerEvents="none" style={[styles.toast, { opacity }]}>
        <Text style={styles.text}>{msg}</Text>
      </Animated.View>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  toast: {
    position: 'absolute', top: 64, alignSelf: 'center', zIndex: 100,
    backgroundColor: colors.surface, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 11,
    shadowColor: colors.forest, shadowOpacity: 0.4, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 8,
  },
  text: { color: colors.ground, fontSize: 13, fontWeight: '600' },
});
