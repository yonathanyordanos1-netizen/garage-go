import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/theme-context';
import { radius, shadows } from '../lib/theme';
import { Icon, IconName } from '../lib/icons';
import * as haptics from '../lib/haptics';

type Variant = 'default' | 'success' | 'error' | 'info' | 'warning';
type ToastItem = {
  id: number; variant: Variant; message: string;
  action?: { label: string; onPress: () => void };
};
type ToastApi = {
  show: (m: string) => void;
  success: (m: string, o?: { action?: ToastItem['action'] }) => void;
  error: (m: string) => void;
  info: (m: string) => void;
  warning: (m: string) => void;
};

const ToastCtx = createContext<ToastApi>({
  show: () => {}, success: () => {}, error: () => {}, info: () => {}, warning: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const remove = useCallback((id: number) => setItems((xs) => xs.filter((x) => x.id !== id)), []);
  const push = useCallback((variant: Variant, message: string, action?: ToastItem['action']) => {
    const id = nextId.current++;
    setItems((xs) => [...xs.slice(-2), { id, variant, message, action }]); // keep max 3
    if (variant === 'error') haptics.error(); else if (variant === 'success') haptics.tap();
    setTimeout(() => remove(id), 3500);
  }, [remove]);

  const api: ToastApi = {
    show: (m) => push('default', m),
    success: (m, o) => push('success', m, o?.action),
    error: (m) => push('error', m),
    info: (m) => push('info', m),
    warning: (m) => push('warning', m),
  };

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <ToastHost items={items} onClose={remove} />
    </ToastCtx.Provider>
  );
}

function ToastHost({ items, onClose }: { items: ToastItem[]; onClose: (id: number) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', top: insets.top + 8, left: 16, right: 16, gap: 8 }}>
      {items.map((t) => <ToastRow key={t.id} item={t} onClose={() => onClose(t.id)} />)}
    </View>
  );
}

function ToastRow({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const { colors } = useTheme();
  const meta: Record<Variant, { icon?: IconName; color?: string }> = {
    default: {},
    success: { icon: 'checkCircle', color: colors.success },
    error: { icon: 'alertCircle', color: colors.error },
    info: { icon: 'info', color: colors.info },
    warning: { icon: 'alertCircle', color: colors.warning },
  };
  const m = meta[item.variant];
  return (
    <Animated.View
      entering={SlideInUp.springify().damping(18).stiffness(350)}
      exiting={SlideOutUp.duration(200)}
      style={{
        minHeight: 48, borderRadius: radius.md, backgroundColor: colors.card,
        borderWidth: 1, borderColor: colors.line, ...shadows.md,
        borderLeftWidth: m.color ? 3 : 1, borderLeftColor: m.color ?? colors.line,
        flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12,
      }}
    >
      {m.icon && <Icon name={m.icon} size={20} color={m.color} strokeWidth={2} />}
      <Text style={{ flex: 1, fontSize: 13, fontWeight: '500', color: colors.ink }}>{item.message}</Text>
      {item.action ? (
        <Pressable onPress={() => { item.action!.onPress(); onClose(); }} style={{ height: 28, paddingHorizontal: 10, borderRadius: 8, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: colors.ink }}>{item.action.label}</Text>
        </Pressable>
      ) : (
        <Pressable onPress={onClose} hitSlop={8}><Icon name="x" size={15} color={colors.faint} /></Pressable>
      )}
    </Animated.View>
  );
}

export const useToast = () => useContext(ToastCtx);
