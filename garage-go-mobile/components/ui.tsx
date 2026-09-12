import React, { useState } from 'react';
import {
  ActivityIndicator, Pressable, StyleSheet, Text, TextInput,
  TextInputProps, View, ViewStyle,
} from 'react-native';
import Svg, { Rect, Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors, radius } from '../lib/theme';
import { Icon, IconName } from '../lib/icons';

export function PrimaryButton({
  label, onPress, loading, disabled, style, variant = 'forest',
}: {
  label: string; onPress: () => void; loading?: boolean; disabled?: boolean;
  style?: ViewStyle; variant?: 'forest' | 'terra' | 'ink';
}) {
  // Accent (sand) buttons take Raw Umber text for AA contrast; the umber
  // button takes Bone White text.
  const bg = variant === 'ink' ? colors.ink : colors.forest;
  const fg = variant === 'ink' ? colors.white : colors.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn, { backgroundColor: bg, opacity: disabled ? 0.55 : pressed ? 0.9 : 1 }, style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : <Text style={[styles.btnText, { color: fg }]}>{label}</Text>}
    </Pressable>
  );
}

export function OutlineButton({ label, onPress, color = colors.ink, style }: {
  label: string; onPress: () => void; color?: string; style?: ViewStyle;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
      style={({ pressed }) => [styles.outlineBtn, { opacity: pressed ? 0.85 : 1 }, style]}>
      <Text style={[styles.btnText, { color, fontSize: 13.5 }]}>{label}</Text>
    </Pressable>
  );
}

export function Field({
  label, icon, accessibilityLabel, ...props
}: { label?: string; icon?: IconName; accessibilityLabel?: string } & TextInputProps) {
  return (
    <View style={{ gap: 6 }}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <View style={styles.inputWrap}>
        {icon ? <Icon name={icon} size={18} color={colors.faint} /> : null}
        <TextInput
          accessibilityLabel={accessibilityLabel ?? label}
          placeholderTextColor={colors.faint}
          style={styles.input}
          {...props}
        />
      </View>
    </View>
  );
}

export function PasswordField({
  label, accessibilityLabel, ...props
}: { label?: string; accessibilityLabel?: string } & TextInputProps) {
  const [show, setShow] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <View style={styles.inputWrap}>
        <Icon name="lock" size={18} color={colors.faint} />
        <TextInput
          accessibilityLabel={accessibilityLabel ?? label}
          placeholderTextColor={colors.faint}
          secureTextEntry={!show}
          style={styles.input}
          {...props}
        />
        <Pressable accessibilityRole="button" accessibilityLabel={show ? 'Hide password' : 'Show password'} onPress={() => setShow((s) => !s)} hitSlop={8}>
          <Icon name={show ? 'eyeoff' : 'eye'} size={18} color={colors.faint} />
        </Pressable>
      </View>
    </View>
  );
}

export function PhoneField({ value, onChangeText, accessibilityLabel }: {
  value: string; onChangeText: (t: string) => void; accessibilityLabel?: string;
}) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.prefix}>+251</Text>
      <TextInput
        accessibilityLabel={accessibilityLabel ?? 'Phone number'}
        placeholder="9•• •• •• ••"
        placeholderTextColor={colors.faint}
        keyboardType="phone-pad"
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
      />
    </View>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, {
      backgroundColor: active ? colors.ink : colors.card,
      borderColor: active ? colors.ink : colors.line2,
    }]}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: active ? colors.white : colors.ink2 }}>{label}</Text>
    </Pressable>
  );
}

export function Tag({ label }: { label: string }) {
  return (
    <View style={styles.tag}>
      <Text style={{ fontSize: 10.5, fontWeight: '600', color: '#3A2A1D' }}>{label}</Text>
    </View>
  );
}

// Illustrated placeholder thumbnail (matches the prototype's earthy garage card art).
export function GarageThumb({ width, height, seed = 0 }: { width: number | string; height: number; seed?: number }) {
  const hues = ['#F0EDE7', '#ECE8E1', '#F1EDE6', '#EEEAE3'];
  const g = hues[seed % hues.length];
  const id = 'gt' + seed;
  return (
    <Svg width={width as any} height={height} viewBox="0 0 220 120" preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={g} />
          <Stop offset="1" stopColor="#F6F3EE" />
        </LinearGradient>
      </Defs>
      <Rect width={220} height={120} fill={`url(#${id})`} />
      <Rect x={24} y={52} width={172} height={42} rx={6} fill="#fff" opacity={0.5} />
      <Rect x={24} y={34} width={172} height={20} rx={4} fill="#D8D2C8" opacity={0.6} />
      <Path d="M40 88h30l6-14h20l6 14h30" fill="none" stroke="#3A2A1D" strokeWidth={3} strokeLinecap="round" opacity={0.5} />
      <Circle cx={70} cy={90} r={7} fill="#3A2A1D" opacity={0.22} />
      <Circle cx={150} cy={90} r={7} fill="#3A2A1D" opacity={0.22} />
      <Circle cx={176} cy={28} r={10} fill="#C29B74" opacity={0.55} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  btn: { height: 52, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 15, fontWeight: '700' },
  outlineBtn: { height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line2, backgroundColor: colors.card },
  fieldLabel: { fontSize: 11.5, fontWeight: '600', color: colors.ink2 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.line, borderRadius: 13, paddingHorizontal: 13, height: 48,
  },
  input: { flex: 1, fontSize: 13.5, color: colors.ink, padding: 0 },
  prefix: { fontVariant: ['tabular-nums'], fontSize: 13.5, fontWeight: '600', color: colors.ink2, paddingRight: 9, borderRightWidth: 1, borderRightColor: colors.line },
  chip: { borderWidth: 1, borderRadius: radius.pill, height: 34, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  tag: { backgroundColor: '#E6E4E0', borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 4 },
});
