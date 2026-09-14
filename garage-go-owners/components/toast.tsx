import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeInDown, FadeOutUp, LinearTransition, Easing } from 'react-native-reanimated';
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

const EASE = Easing.out(Easing.cubic);

function ToastRow({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const { colors } = useTheme();
  const meta: Record<Variant, { icon?: IconName; color?: string; tint?: string }> = {
    default: {},
    success: { icon: 'checkCircle', color: colors.success, tint: colors.successTint },
    error: { icon: 'alertCircle', color: colors.error, tint: colors.errorTint },
    info: { icon: 'info', color: colors.info, tint: colors.infoTint },
    warning: { icon: 'alertCircle', color: colors.warning, tint: colors.warningTint },
  };
  const m = meta[item.variant];
  return (
    <Animated.View
      // Smooth, timing-based drop-in — no spring overshoot / bounce.
      entering={FadeInDown.duration(220).easing(EASE)}
      exiting={FadeOutUp.duration(160).easing(EASE)}
      layout={LinearTransition.duration(200).easing(EASE)}
      style={{
        borderRadius: radius.md, backgroundColor: colors.card,
        borderWidth: 1, borderColor: m.color ?? colors.line, ...shadows.md,
        borderLeftWidth: m.color ? 4 : 1, borderLeftColor: m.color ?? colors.line,
        flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 12, paddingVertical: 11,
      }}
    >
      {m.icon && (
        <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: m.tint, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={m.icon} size={18} color={m.color} strokeWidth={2.2} />
        </View>
      )}
      <Text style={{ flex: 1, fontSize: 13, fontWeight: '500', color: colors.ink, lineHeight: 18 }}>{item.message}</Text>
      {item.action ? (
        <Pressable onPress={() => { item.action!.onPress(); onClose(); }} style={{ height: 30, paddingHorizontal: 12, borderRadius: 8, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 11.5, fontWeight: '600', color: colors.ink }}>{item.action.label}</Text>
        </Pressable>
      ) : (
        <Pressable onPress={onClose} hitSlop={8} style={{ padding: 2 }}><Icon name="x" size={16} color={colors.faint} /></Pressable>
      )}
    </Animated.View>
  );
}

export const useToast = () => useContext(ToastCtx);
