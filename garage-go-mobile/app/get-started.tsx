import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import Svg, { Rect, Path, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../lib/theme';
import { Icon } from '../lib/icons';
import { PrimaryButton } from '../components/ui';

function Illustration() {
  return (
    <Svg width="100%" height={220} viewBox="0 0 320 220" preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#F1E9D3" />
          <Stop offset="1" stopColor="#E6DCC1" />
        </LinearGradient>
      </Defs>
      <Rect width={320} height={220} fill="url(#sky)" />
      <Circle cx={255} cy={52} r={30} fill="#E27D60" opacity={0.45} />
      <Path d="M0 168h320" stroke="#CBBF9C" strokeWidth={2} opacity={0.6} />
      <Rect x={30} y={70} width={120} height={86} rx={8} fill="#2D4F1E" opacity={0.12} />
      <Path d="M30 70h120M30 70l60-26 60 26" fill="none" stroke="#2D4F1E" strokeWidth={3} opacity={0.45} />
      <Rect x={52} y={96} width={30} height={30} rx={4} fill="#2D4F1E" opacity={0.2} />
      <Rect x={98} y={96} width={30} height={30} rx={4} fill="#2D4F1E" opacity={0.2} />
      <G>
        <Path d="M150 150c4-22 12-34 30-36h44c14 0 22 8 30 22l14 6c8 3 12 8 12 16v10c0 4-3 7-7 7H160c-6 0-10-4-10-10z" fill="#2D4F1E" />
        <Path d="M186 118h34c10 0 16 6 20 16h-66c4-10 8-16 12-16z" fill="#E27D60" opacity={0.9} />
        <Circle cx={182} cy={168} r={15} fill="#2A2620" />
        <Circle cx={182} cy={168} r={6} fill="#B7AE90" />
        <Circle cx={256} cy={168} r={15} fill="#2A2620" />
        <Circle cx={256} cy={168} r={6} fill="#B7AE90" />
      </G>
      <G x={120} y={120} rotation={-25} originX={120} originY={120}>
        <Path d="M0 0h34" stroke="#E27D60" strokeWidth={7} strokeLinecap="round" />
        <Circle cx={42} cy={0} r={9} fill="#E27D60" />
      </G>
      <G x={70} y={40}>
        <Path d="M40 22C40 10 31 0 20 0S0 10 0 22c0 14 20 30 20 30S40 36 40 22z" fill="#E27D60" />
        <Circle cx={20} cy={20} r={7} fill="#fff" />
      </G>
    </Svg>
  );
}

export default function GetStarted() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const features: [any, string][] = [
    ['shield', 'Every garage & mechanic is verified'],
    ['birr', 'Pay with Telebirr, CBE Birr or Amole'],
    ['bolt', '24/7 emergency help on the road'],
  ];
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.ground }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 22, paddingBottom: insets.bottom + 24, flexGrow: 1 }}
    >
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
        <Icon name="chevL" size={18} color={colors.ink2} />
      </Pressable>

      <View style={styles.illoWrap}><Illustration /></View>

      <Text style={styles.h1}>Your car, sorted{'\n'}in three taps.</Text>
      <Text style={styles.p}>
        Find a verified garage near you, reserve a slot for a flat 100 ETB, and pay for the
        repair on site. Emergency mechanics and towing are one tap away.
      </Text>

      <View style={{ marginTop: 20, gap: 11 }}>
        {features.map(([ic, t]) => (
          <View key={t} style={styles.feature}>
            <View style={styles.featureIcon}><Icon name={ic} size={17} color={colors.forest} strokeWidth={2} /></View>
            <Text style={styles.featureText}>{t}</Text>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 'auto', paddingTop: 22 }}>
        <PrimaryButton label="Get started" onPress={() => router.push('/sign-in')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  back: { width: 40, height: 40, borderRadius: 13, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  illoWrap: { marginTop: 26, height: 220, borderRadius: 24, overflow: 'hidden', backgroundColor: '#EFE7D3' },
  h1: { marginTop: 26, fontSize: 27, fontWeight: '800', color: colors.ink, letterSpacing: -0.5, lineHeight: 30 },
  p: { marginTop: 12, fontSize: 14, lineHeight: 21, color: colors.muted },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  featureIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: colors.forestTint, alignItems: 'center', justifyContent: 'center' },
  featureText: { fontSize: 13, color: colors.ink2 },
});
