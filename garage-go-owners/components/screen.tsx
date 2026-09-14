import React from 'react';
import { View, Text, ScrollView, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/theme-context';

// Space reserved at the bottom so content clears the floating tab bar
// (64 pill + 10 gap + safe-area handled by caller).
export const TAB_CLEARANCE = 96;

export function Screen({
  children, scroll = true, padded = true, bottomClear = true, style,
}: {
  children: React.ReactNode; scroll?: boolean; padded?: boolean; bottomClear?: boolean; style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const pad = {
    paddingHorizontal: padded ? 20 : 0,
    paddingBottom: (bottomClear ? TAB_CLEARANCE : 0) + insets.bottom,
  };
  if (!scroll) {
    return <View style={[{ flex: 1, backgroundColor: colors.ground }, pad, style]}>{children}</View>;
  }
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.ground }}
      contentContainerStyle={[pad, style]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

// Standard screen header: title (optional subtitle) on the left, optional right
// slot. Kept deliberately plain to match the main app's calm hierarchy.
export function Header({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top + 8, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.ink, letterSpacing: -0.5 }}>{title}</Text>
        {subtitle && <Text style={{ fontSize: 13, color: colors.muted, marginTop: 3 }}>{subtitle}</Text>}
      </View>
      {right}
    </View>
  );
}
