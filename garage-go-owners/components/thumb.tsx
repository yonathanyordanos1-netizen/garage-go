import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../lib/theme-context';
import { Icon, IconName } from '../lib/icons';

// A styled placeholder that stands in for a real photo — warm gradient panel with
// a faint line-art motif. Same footprint an <Image> would occupy.
export function Thumb({ width, height, seed = 0, radius = 0, icon }: {
  width: number | string; height: number; seed?: number; radius?: number; icon?: IconName;
}) {
  const { colors, mode } = useTheme();
  const top = mode === 'dark' ? '#2A231C' : '#F0EDE7';
  const bottom = mode === 'dark' ? '#211B16' : '#F6F3EE';
  const stroke = colors.accent;
  return (
    <View style={{ width: width as any, height, borderRadius: radius, overflow: 'hidden', backgroundColor: colors.surface }}>
      <Svg width="100%" height="100%" viewBox="0 0 220 120" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id={`t${seed}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={top} />
            <Stop offset="1" stopColor={bottom} />
          </LinearGradient>
        </Defs>
        <Rect width="220" height="120" fill={`url(#t${seed})`} />
        <Path d="M40 88h30l6-14h20l6 14h30" fill="none" stroke={stroke} strokeWidth={3} strokeLinecap="round" opacity={0.4} />
        <Circle cx={70} cy={90} r={7} fill={stroke} opacity={0.22} />
        <Circle cx={150} cy={90} r={7} fill={stroke} opacity={0.22} />
        <Path d="M60 60 96 40l40 22" fill="none" stroke={stroke} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" opacity={0.35} />
      </Svg>
      {icon && (
        <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
          <Icon name={icon} size={30} color={colors.faint} strokeWidth={1.6} />
        </View>
      )}
    </View>
  );
}
