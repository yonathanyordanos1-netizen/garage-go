import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, Animated, ScrollView,
  NativeSyntheticEvent, NativeScrollEvent, useWindowDimensions,
} from 'react-native';
import Svg, { Path, Circle, Rect, G, Line } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../lib/theme';
import { Icon, IconName } from '../lib/icons';

const FEATURES: { icon: IconName; title: string; body: string }[] = [
  { icon: 'garage', title: 'Book a Garage', body: 'Reserve a verified garage near you for a flat 100 ETB.' },
  { icon: 'bolt', title: 'Emergency Help', body: 'Dispatch the nearest verified mechanic when you break down.' },
  { icon: 'truck', title: 'Roadside & Towing', body: 'Battery, tyre, fuel or a flatbed — help is one tap away.' },
];

// Warm line-art hero: garage roofline + car + wrench + pin, umber strokes on bone.
function Hero() {
  return (
    <Svg width="100%" height={190} viewBox="0 0 320 190">
      {/* ground line */}
      <Line x1={20} y1={150} x2={300} y2={150} stroke={colors.line2} strokeWidth={2} />
      {/* garage building */}
      <G stroke={colors.ink} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.9}>
        <Path d="M52 74 96 48l44 26" />
        <Path d="M62 70v56M130 70v56M62 126h68" />
        <Rect x={78} y={92} width={36} height={34} rx={3} />
        <Path d="M78 108h36" />
      </G>
      {/* sun / accent disc */}
      <Circle cx={244} cy={52} r={20} fill={colors.terra} opacity={0.18} />
      <Circle cx={244} cy={52} r={20} stroke={colors.terra} strokeWidth={2} fill="none" opacity={0.6} />
      {/* car */}
      <G>
        <Path d="M150 138c3-16 9-26 22-27h30c10 0 16 6 22 16l10 4c6 2 9 6 9 12v7c0 3-2 5-5 5H157c-4 0-7-3-7-7z"
          fill="none" stroke={colors.ink} strokeWidth={2.6} strokeLinejoin="round" />
        <Path d="M176 118h22c7 0 11 4 14 11" fill="none" stroke={colors.ink} strokeWidth={2.2} strokeLinecap="round" />
        <Circle cx={172} cy={150} r={9} fill={colors.ground} stroke={colors.ink} strokeWidth={2.4} />
        <Circle cx={224} cy={150} r={9} fill={colors.ground} stroke={colors.ink} strokeWidth={2.4} />
      </G>
      {/* wrench accent (sand) */}
      <G x={120} y={96} rotation={-28} originX={0} originY={0}>
        <Path d="M0 0h26" stroke={colors.terra} strokeWidth={5} strokeLinecap="round" />
        <Circle cx={32} cy={0} r={7} fill={colors.terra} />
      </G>
      {/* location pin (sand) */}
      <G x={100} y={30}>
        <Path d="M10 30c0-8-6-14-14-14S-18 22-18 30c0 10 14 22 14 22S10 40 10 30z"
          fill="none" stroke={colors.terra} strokeWidth={2.4} />
        <Circle cx={0} cy={28} r={4} fill={colors.terra} />
      </G>
    </Svg>
  );
}

function useStagger(count: number) {
  const vals = useRef([...Array(count)].map(() => new Animated.Value(0))).current;
  useEffect(() => {
    Animated.stagger(90, vals.map((v) =>
      Animated.timing(v, { toValue: 1, duration: 460, useNativeDriver: true })
    )).start();
  }, [vals]);
  return vals.map((v) => ({
    opacity: v,
    transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
  }));
}

export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const cardW = Math.min(width, 480) - 44; // content max-width, minus padding
  const [page, setPage] = useState(0);
  const anim = useStagger(6);

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setPage(Math.round(e.nativeEvent.contentOffset.x / cardW));
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 18 }]}>
      <View style={styles.inner}>
        {/* Brand + Skip */}
        <Animated.View style={[styles.topRow, anim[0]]}>
          <View style={styles.brand}>
            <View style={styles.brandMark}><Icon name="wrench" size={17} color={colors.ground} strokeWidth={2} /></View>
            <Text style={styles.brandName}>Garage Go</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Skip onboarding" onPress={() => router.replace('/(tabs)')} hitSlop={8}>
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        </Animated.View>

        {/* Hero */}
        <Animated.View style={[styles.hero, anim[1]]}>
          <Hero />
        </Animated.View>

        {/* Headline */}
        <Animated.View style={anim[2]}>
          <Text style={styles.h1} accessibilityRole="header">Welcome to{'\n'}Garage Go</Text>
          <Text style={styles.sub}>
            On-demand garages, mechanics and roadside help across Ethiopia — verified, transparent, one tap away.
          </Text>
        </Animated.View>

        {/* Feature carousel */}
        <Animated.View style={[{ marginTop: 20 }, anim[3]]}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            snapToInterval={cardW}
            decelerationRate="fast"
          >
            {FEATURES.map((f) => (
              <View key={f.title} style={[styles.slide, { width: cardW }]} accessibilityLabel={f.title}>
                <View style={styles.slideIcon}><Icon name={f.icon} size={22} color={colors.forest} strokeWidth={2} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.slideTitle}>{f.title}</Text>
                  <Text style={styles.slideBody}>{f.body}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={styles.dots}>
            {FEATURES.map((_, i) => (
              <View key={i} style={[styles.dot, {
                width: i === page ? 20 : 6,
                backgroundColor: i === page ? colors.forest : 'rgba(58,42,29,0.18)',
              }]} />
            ))}
          </View>
        </Animated.View>

        {/* CTA */}
        <Animated.View style={[{ marginTop: 'auto' }, anim[4]]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Get started"
            onPress={() => router.push('/get-started')}
            style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.9 : 1 }]}
          >
            <Text style={styles.ctaText}>Get started</Text>
            <Icon name="chevR" size={18} color={colors.ink} strokeWidth={2.2} />
          </Pressable>
        </Animated.View>

        <Animated.View style={anim[5]}>
          <Text style={styles.footer}>
            Already have an account?{' '}
            <Text style={styles.link} accessibilityRole="link" onPress={() => router.push('/sign-in')}>Sign in</Text>
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ground, paddingHorizontal: 22 },
  inner: { flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandMark: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  brandName: { fontSize: 15, fontWeight: '700', color: colors.ink, letterSpacing: 0.2 },
  skip: { fontSize: 13, fontWeight: '600', color: colors.muted, padding: 6 },
  hero: { marginTop: 10, alignItems: 'center' },
  h1: { marginTop: 8, fontSize: 32, fontWeight: '800', color: colors.ink, letterSpacing: -0.8, lineHeight: 36 },
  sub: { marginTop: 12, fontSize: 14, lineHeight: 21, color: colors.muted, maxWidth: 300 },
  slide: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingRight: 8 },
  slideIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(194,155,116,0.16)', alignItems: 'center', justifyContent: 'center' },
  slideTitle: { fontSize: 15, fontWeight: '700', color: colors.ink },
  slideBody: { marginTop: 3, fontSize: 12.5, lineHeight: 18, color: colors.muted },
  dots: { flexDirection: 'row', gap: 6, marginTop: 16, paddingLeft: 4 },
  dot: { height: 6, borderRadius: 999 },
  cta: { height: 54, borderRadius: 16, backgroundColor: colors.forest, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 15, fontWeight: '700', color: colors.ink },
  footer: { marginTop: 16, textAlign: 'center', fontSize: 13, color: colors.muted },
  link: { fontWeight: '700', color: colors.ink },
});
