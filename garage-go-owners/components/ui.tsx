import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, Pressable, TextInput, ActivityIndicator, StyleSheet,
  ViewStyle, TextStyle, LayoutChangeEvent, TextInputProps,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat,
  interpolate, Easing,
} from 'react-native-reanimated';
import { useTheme } from '../lib/theme-context';
import { radius, shadows, spacing } from '../lib/theme';
import { Icon, IconName } from '../lib/icons';
import * as haptics from '../lib/haptics';

// Smooth ease-out for press feedback — no bounce / overshoot.
const PRESS_MS = 120;
const AnimPressable = Animated.createAnimatedComponent(Pressable);

/* ─────────────────────────── Button ─────────────────────────── */
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
type BtnSize = 'sm' | 'default' | 'lg';
export function Button({
  label, onPress, variant = 'primary', size = 'default', icon, iconRight,
  loading, disabled, full = true, style,
}: {
  label: string; onPress?: () => void; variant?: BtnVariant; size?: BtnSize;
  icon?: IconName; iconRight?: IconName; loading?: boolean; disabled?: boolean;
  full?: boolean; style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const H = size === 'sm' ? 38 : size === 'lg' ? 56 : 50;
  const FS = size === 'sm' ? 13 : size === 'lg' ? 16 : 14.5;
  const R = size === 'sm' ? radius.sm : radius.md;

  const bg = {
    primary: colors.forest, secondary: colors.surface, ghost: 'transparent',
    destructive: colors.error, outline: colors.card,
  }[variant];
  const fg = {
    primary: colors.onPrimary, secondary: colors.ink, ghost: colors.ink,
    destructive: '#fff', outline: colors.ink,
  }[variant];
  const border =
    variant === 'outline' ? colors.line2 :
    variant === 'secondary' ? colors.line :
    variant === 'primary' ? 'rgba(0,0,0,0.06)' : 'transparent';

  const isDisabled = disabled || loading;
  return (
    <AnimPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPressIn={() => { scale.value = withTiming(0.97, { duration: PRESS_MS }); }}
      onPressOut={() => { scale.value = withTiming(1, { duration: PRESS_MS }); }}
      onPress={() => { if (!isDisabled) { haptics.tap(); onPress?.(); } }}
      style={[
        aStyle,
        {
          height: H, borderRadius: R, backgroundColor: bg, borderWidth: 1, borderColor: border,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
          paddingHorizontal: full ? 0 : 20, width: full ? '100%' : undefined,
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} size="small" />
      ) : (
        <>
          {icon && <Icon name={icon} size={FS + 3} color={fg} strokeWidth={2.1} />}
          <Text style={{ color: fg, fontSize: FS, fontWeight: '700' }}>{label}</Text>
          {iconRight && <Icon name={iconRight} size={FS + 3} color={fg} strokeWidth={2.2} />}
        </>
      )}
    </AnimPressable>
  );
}

/* ─────────────────────────── Field ─────────────────────────── */
export function Field({
  label, description, error, icon, value, onChangeText, placeholder,
  secure, keyboardType, autoCapitalize, prefix, style, ...rest
}: {
  label?: string; description?: string; error?: string; icon?: IconName;
  value?: string; onChangeText?: (t: string) => void; placeholder?: string;
  secure?: boolean; prefix?: string; style?: ViewStyle;
} & Pick<TextInputProps, 'keyboardType' | 'autoCapitalize'>) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const ring = useSharedValue(0);
  useEffect(() => { ring.value = withTiming(focused ? 1 : 0, { duration: 150 }); }, [focused]);

  const ringColor = error ? colors.error : colors.accent;
  const borderColor = error ? colors.error : focused ? colors.accent : colors.line;
  const ringStyle = useAnimatedStyle(() => ({ opacity: ring.value }));

  return (
    <View style={style}>
      {label && <Text style={{ fontSize: 12.5, fontWeight: '600', color: colors.ink2, marginBottom: 6 }}>{label}</Text>}
      <View>
        {/* focus glow ring — 1px larger than the field */}
        <Animated.View pointerEvents="none" style={[
          StyleSheet.absoluteFill,
          { borderRadius: radius.md + 1, borderWidth: 2, borderColor: ringColor, margin: -3 },
          ringStyle,
        ]} />
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 9, height: 50,
          borderRadius: radius.md, borderWidth: 1, borderColor,
          backgroundColor: colors.card, paddingHorizontal: 14,
        }}>
          {icon && <Icon name={icon} size={18} color={focused ? colors.accent : colors.faint} />}
          {prefix && (
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.ink2, marginRight: 2 }}>{prefix}</Text>
          )}
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.faint}
            secureTextEntry={secure && !show}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{ flex: 1, fontSize: 14.5, color: colors.ink, paddingVertical: 0 }}
            {...rest}
          />
          {secure && (
            <Pressable onPress={() => setShow((s) => !s)} hitSlop={8} accessibilityLabel={show ? 'Hide' : 'Show'}>
              <Icon name={show ? 'eyeoff' : 'eye'} size={18} color={colors.faint} />
            </Pressable>
          )}
        </View>
      </View>
      {error ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
          <Icon name="alertCircle" size={13} color={colors.error} strokeWidth={2} />
          <Text style={{ fontSize: 11, color: colors.error }}>{error}</Text>
        </View>
      ) : description ? (
        <Text style={{ fontSize: 11.5, color: colors.muted, marginTop: 6 }}>{description}</Text>
      ) : null}
    </View>
  );
}

/* ─────────────────────────── OTP input ─────────────────────────── */
export function OtpInput({ value, onChange, length = 6 }: { value: string; onChange: (v: string) => void; length?: number }) {
  const { colors } = useTheme();
  const ref = useRef<TextInput>(null);
  const digits = value.padEnd(length).slice(0, length).split('');
  const activeIndex = Math.min(value.length, length - 1);
  return (
    <Pressable onPress={() => ref.current?.focus()} style={{ flexDirection: 'row', gap: 8 }}>
      {digits.map((d, i) => {
        const active = i === activeIndex;
        return (
          <View key={i} style={{
            flex: 1, height: 54, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center',
            borderWidth: 1.5, borderColor: active ? colors.accent : colors.line,
            backgroundColor: colors.card,
          }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.ink }}>{d.trim()}</Text>
          </View>
        );
      })}
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(t) => onChange(t.replace(/[^0-9]/g, '').slice(0, length))}
        keyboardType="number-pad"
        maxLength={length}
        style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }}
        autoFocus
      />
    </Pressable>
  );
}

/* ─────────────────────────── Card family ─────────────────────────── */
export function Card({ children, variant = 'default', onPress, style }: {
  children: React.ReactNode; variant?: 'default' | 'elevated' | 'interactive';
  onPress?: () => void; style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const base: ViewStyle = {
    backgroundColor: colors.card, borderRadius: radius.lg, overflow: 'hidden',
    borderWidth: variant === 'elevated' ? 0 : 1, borderColor: colors.line,
    ...(variant === 'elevated' ? shadows.md : shadows.sm),
  };
  if (variant === 'interactive' && onPress) {
    return (
      <AnimPressable
        onPressIn={() => { scale.value = withTiming(0.98, { duration: PRESS_MS }); }}
        onPressOut={() => { scale.value = withTiming(1, { duration: PRESS_MS }); }}
        onPress={() => { haptics.tap(); onPress(); }}
        style={[base, aStyle, style]}
      >
        {children}
      </AnimPressable>
    );
  }
  return <View style={[base, style]}>{children}</View>;
}
export function CardHeader({ title, description, right }: { title: string; description?: string; right?: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, gap: 10 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.ink }}>{title}</Text>
        {description && <Text style={{ fontSize: 12.5, color: colors.muted, marginTop: 2 }}>{description}</Text>}
      </View>
      {right}
    </View>
  );
}
export function CardContent({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[{ paddingHorizontal: 16, paddingBottom: 16 }, style]}>{children}</View>;
}
export function CardFooter({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.line, flexDirection: 'row', justifyContent: 'flex-end', gap: 8, alignItems: 'center' }}>
      {children}
    </View>
  );
}

/* ─────────────────────────── Badge ─────────────────────────── */
type BadgeVariant = 'default' | 'secondary' | 'outline' | 'success' | 'destructive' | 'warning';
export function Badge({ label, variant = 'secondary', icon }: { label: string; variant?: BadgeVariant; icon?: IconName }) {
  const { colors } = useTheme();
  const map: Record<BadgeVariant, { bg: string; fg: string; bd?: string }> = {
    default: { bg: colors.ink, fg: colors.ground },
    secondary: { bg: colors.surface, fg: colors.ink2 },
    outline: { bg: 'transparent', fg: colors.ink2, bd: colors.line2 },
    success: { bg: colors.successTint, fg: colors.success },
    destructive: { bg: colors.errorTint, fg: colors.error },
    warning: { bg: colors.warningTint, fg: colors.warning },
  };
  const c = map[variant];
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
      minHeight: 22, paddingHorizontal: 9, borderRadius: radius.pill, backgroundColor: c.bg,
      borderWidth: c.bd ? 1 : 0, borderColor: c.bd,
    }}>
      {icon && <Icon name={icon} size={11} color={c.fg} strokeWidth={2.2} />}
      <Text style={{ fontSize: 10.5, fontWeight: '600', color: c.fg }}>{label}</Text>
    </View>
  );
}

/* ─────────────────────────── Separator ─────────────────────────── */
export function Separator({ label, style }: { label?: string; style?: ViewStyle }) {
  const { colors } = useTheme();
  if (label) {
    return (
      <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 12 }, style]}>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
        <Text style={{ fontSize: 11, color: colors.faint }}>{label}</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
      </View>
    );
  }
  return <View style={[{ height: 1, backgroundColor: colors.line }, style]} />;
}

/* ─────────────────────────── Progress bar ─────────────────────────── */
export function ProgressBar({ value, track, fill, height = 4 }: { value: number; track?: string; fill?: string; height?: number }) {
  const { colors } = useTheme();
  const w = useSharedValue(0);
  useEffect(() => { w.value = withTiming(Math.max(0, Math.min(1, value)), { duration: 600 }); }, [value]);
  const aStyle = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: track ?? colors.line, overflow: 'hidden' }}>
      <Animated.View style={[{ height, borderRadius: height / 2, backgroundColor: fill ?? colors.accent }, aStyle]} />
    </View>
  );
}

/* ─────────────────────────── Toggle / Switch ─────────────────────────── */
export function Toggle({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
  const { colors } = useTheme();
  const x = useSharedValue(value ? 1 : 0);
  useEffect(() => { x.value = withTiming(value ? 1 : 0, { duration: 180 }); }, [value]);
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: interpolate(x.value, [0, 1], [2, 22]) }] }));
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => { haptics.select(); onValueChange(!value); }}
      style={{ width: 48, height: 28, borderRadius: 14, backgroundColor: value ? colors.forest : colors.line2, justifyContent: 'center' }}
    >
      <Animated.View style={[{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', ...shadows.sm }, thumb]} />
    </Pressable>
  );
}

/* ─────────────────────────── SegmentedControl ─────────────────────────── */
export function SegmentedControl({ options, index, onChange }: { options: string[]; index: number; onChange: (i: number) => void }) {
  const { colors } = useTheme();
  const [w, setW] = useState(0);
  const seg = w > 0 ? (w - 6) / options.length : 0;
  const x = useSharedValue(0);
  useEffect(() => { x.value = withTiming(index * seg, { duration: 200 }); }, [index, seg]);
  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)}
      style={{ flexDirection: 'row', height: 44, borderRadius: radius.md, backgroundColor: colors.surface, padding: 3 }}
    >
      {w > 0 && (
        <Animated.View style={[{ position: 'absolute', top: 3, left: 3, width: seg, height: 38, borderRadius: radius.sm, backgroundColor: colors.card, ...shadows.sm }, pill]} />
      )}
      {options.map((o, i) => (
        <Pressable key={o} onPress={() => { haptics.select(); onChange(i); }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 13, fontWeight: i === index ? '600' : '500', color: i === index ? colors.ink : colors.muted }}>{o}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/* ─────────────────────────── Star rating ─────────────────────────── */
export function StarRating({ value, size = 14, onChange, gap = 3 }: { value: number; size?: number; onChange?: (v: number) => void; gap?: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        const star = <Icon name="star" size={size} color={filled ? colors.accent : colors.line2} />;
        return onChange ? (
          <Pressable key={n} onPress={() => { haptics.select(); onChange(n); }} hitSlop={4}>{star}</Pressable>
        ) : <View key={n}>{star}</View>;
      })}
    </View>
  );
}

/* ─────────────────────────── Avatar ─────────────────────────── */
const AVATAR_COLORS = ['#C29B74', '#7A8B6F', '#A15C4F', '#6B7FA3', '#B08B60', '#8B7355', '#6A8C7A', '#9B7A6A'];
function hashColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
export function Avatar({ name, size = 'md', ring, status }: {
  name: string; size?: 'sm' | 'md' | 'lg' | 'xl'; ring?: boolean; status?: 'online' | 'away' | 'busy';
}) {
  const { colors } = useTheme();
  const D = size === 'sm' ? 32 : size === 'md' ? 44 : size === 'lg' ? 64 : 88;
  const statusColor = status ? { online: colors.success, away: colors.warning, busy: colors.error }[status] : undefined;
  return (
    <View style={{ width: D, height: D }}>
      <View style={{
        width: D, height: D, borderRadius: D / 2, backgroundColor: hashColor(name || '?'),
        alignItems: 'center', justifyContent: 'center',
        borderWidth: ring ? 2 : 0, borderColor: colors.accent,
      }}>
        <Text style={{ color: '#fff', fontSize: D * 0.38, fontWeight: '700' }}>{initials(name || '?')}</Text>
      </View>
      {statusColor && (
        <View style={{ position: 'absolute', right: 0, bottom: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: statusColor, borderWidth: 2, borderColor: colors.card }} />
      )}
    </View>
  );
}

/* ─────────────────────────── StepIndicator ─────────────────────────── */
export function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const on = done || active;
        return (
          <React.Fragment key={s}>
            <View style={{ alignItems: 'center', width: 64 }}>
              <View style={{
                width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                backgroundColor: on ? colors.forest : 'transparent',
                borderWidth: on ? 0 : 1.5, borderColor: colors.line2,
              }}>
                {done ? <Icon name="check" size={13} color={colors.onPrimary} strokeWidth={3} />
                  : <Text style={{ fontSize: 12, fontWeight: '700', color: on ? colors.onPrimary : colors.muted }}>{i + 1}</Text>}
              </View>
              <Text style={{ fontSize: 10.5, marginTop: 5, fontWeight: active ? '600' : '400', color: active ? colors.ink : colors.muted }}>{s}</Text>
            </View>
            {i < steps.length - 1 && (
              <View style={{ flex: 1, height: 1.5, backgroundColor: i < current ? colors.forest : colors.line, marginTop: 11 }} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

/* ─────────────────────────── Skeleton ─────────────────────────── */
export function Skeleton({ width, height, borderRadius = 8, style }: { width?: number | string; height: number; borderRadius?: number; style?: ViewStyle }) {
  const { colors } = useTheme();
  const t = useSharedValue(0);
  useEffect(() => { t.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.linear }), -1, false); }, []);
  const shimmer = useAnimatedStyle(() => ({ opacity: interpolate(t.value, [0, 0.5, 1], [0.35, 0.7, 0.35]) }));
  return (
    <View style={[{ width: width as any, height, borderRadius, backgroundColor: colors.line, overflow: 'hidden' }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface }, shimmer]} />
    </View>
  );
}
Skeleton.Circle = function Circle({ size }: { size: number }) {
  return <Skeleton width={size} height={size} borderRadius={size / 2} />;
};

/* ─────────────────────────── EmptyState ─────────────────────────── */
export function EmptyState({ icon, title, description, action, variant = 'empty' }: {
  icon: IconName; title: string; description?: string;
  action?: { label: string; onPress: () => void }; variant?: 'empty' | 'error' | 'offline';
}) {
  const { colors } = useTheme();
  const tint = variant === 'error' ? colors.errorTint : variant === 'offline' ? colors.surface : colors.forestTint;
  const iconColor = variant === 'error' ? colors.error : variant === 'offline' ? colors.muted : colors.forest;
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 24 }}>
      <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: tint, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={32} color={iconColor} strokeWidth={1.8} />
      </View>
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 14 }}>
        {[0, 1, 2].map((i) => <View key={i} style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.line2 }} />)}
      </View>
      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.ink, marginTop: 16, textAlign: 'center' }}>{title}</Text>
      {description && <Text style={{ fontSize: 13, color: colors.muted, textAlign: 'center', maxWidth: 260, marginTop: 8, lineHeight: 20 }}>{description}</Text>}
      {action && (
        <View style={{ marginTop: 20 }}>
          <Button label={action.label} onPress={action.onPress} variant="secondary" size="sm" full={false} />
        </View>
      )}
    </View>
  );
}

/* ─────────────────────────── Round icon button (back / header) ─────────────────────────── */
export function IconButton({ icon, onPress, label, tint }: { icon: IconName; onPress?: () => void; label?: string; tint?: string }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button" accessibilityLabel={label ?? icon}
      onPress={() => { haptics.tap(); onPress?.(); }}
      style={{ width: 40, height: 40, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}
    >
      <Icon name={icon} size={18} color={tint ?? colors.ink2} />
    </Pressable>
  );
}

export { spacing, radius, shadows };
