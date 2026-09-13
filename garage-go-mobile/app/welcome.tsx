import React, { useRef, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, useWindowDimensions,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import Svg, { Path, Circle, Rect, G, Line } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/theme-context';
import { Button } from '../components/ui';
import * as haptics from '../lib/haptics';

type Step = { eyebrow: string; title: string; body: string; cta: string };

// A warm line-art hero shared across steps, tinted by theme.
function Hero({ kind, ink, accent }: { kind: number; ink: string; accent: string }) {
  return (
    <Svg width="100%" height={210} viewBox="0 0 320 210">
      <Line x1={24} y1={168} x2={296} y2={168} stroke={accent} strokeOpacity={0.4} strokeWidth={2} />
      {kind === 0 && (
        <>
          <G stroke={ink} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M96 70 150 40l54 30" />
            <Path d="M108 64v88M192 64v88M108 152h84" />
            <Rect x={132} y={98} width={36} height={54} rx={3} />
            <Path d="M132 120h36" />
          </G>
          <Circle cx={244} cy={58} r={22} fill={accent} opacity={0.18} />
          <Circle cx={244} cy={58} r={22} stroke={accent} strokeWidth={2} fill="none" />
        </>
      )}
      {kind === 1 && (
        <>
          <G fill="none" stroke={ink} strokeLinejoin="round">
            <Path d="M96 150c3-18 10-30 26-31h44c14 0 22 7 30 20l14 6c8 3 12 8 12 14v8c0 4-3 6-6 6H104c-5 0-8-3-8-8z" strokeWidth={2.8} />
            <Path d="M132 119h30c9 0 15 5 19 14" strokeWidth={2.4} strokeLinecap="round" />
          </G>
          <Circle cx={128} cy={168} r={12} fill="none" stroke={ink} strokeWidth={2.6} />
          <Circle cx={200} cy={168} r={12} fill="none" stroke={ink} strokeWidth={2.6} />
          <G transform="translate(214 70)"><Path d="M0 22c0-8-6-14-14-14S-22 14-22 22c0 10 14 22 14 22S0 32 0 22z" fill={accent} opacity={0.9} /><Circle cx={-8} cy={20} r={5} fill="#fff" /></G>
        </>
      )}
      {kind === 2 && (
        <>
          <G stroke={ink} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M120 70 60 130h34l-8 46 60-66h-32l8-40z" fill={accent} fillOpacity={0.18} />
          </G>
          <Circle cx={228} cy={150} r={30} stroke={ink} strokeWidth={2.6} fill="none" />
          <Path d="M228 134v16l10 8" stroke={ink} strokeWidth={2.6} strokeLinecap="round" fill="none" />
        </>
      )}
    </Svg>
  );
}

export default function Welcome() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const pad = 24;
  const pageW = width;
  const scroller = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  const steps: Step[] = [
    { eyebrow: 'GET STARTED', title: 'Welcome to\nGarage Go', body: "Ethiopia's trusted garage and roadside network — verified, transparent, one tap away.", cta: 'Get Started' },
    { eyebrow: 'BOOK & CONFIRM', title: 'Book a garage\nin three taps', body: 'Reserve a verified garage, pick a time slot, and confirm with Telebirr for a flat 100 ETB.', cta: 'Continue' },
    { eyebrow: 'ON THE ROAD', title: 'Help when\nyou break down', body: 'Emergency mechanics, battery, tyre, fuel or a flatbed tow — dispatched to your location.', cta: 'Create account' },
  ];

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const p = Math.round(e.nativeEvent.contentOffset.x / pageW);
    if (p !== page) { setPage(p); haptics.select(); }
  }
  function advance() {
    if (page < steps.length - 1) scroller.current?.scrollTo({ x: (page + 1) * pageW, animated: true });
    else router.push('/sign-up');
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 18 }}>
      {/* Top row: dots + Skip */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: pad }}>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          {steps.map((_, i) => (
            <View key={i} style={{ width: i === page ? 22 : 7, height: 7, borderRadius: 99, backgroundColor: i === page ? colors.forest : colors.line2 }} />
          ))}
        </View>
        <Pressable onPress={() => router.push('/sign-in')} hitSlop={8} accessibilityLabel="Skip">
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.muted, padding: 6 }}>Skip</Text>
        </Pressable>
      </View>

      {/* Pager */}
      <ScrollView
        ref={scroller}
        horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        style={{ flexGrow: 0 }}
      >
        {steps.map((s, i) => (
          <View key={i} style={{ width: pageW, paddingHorizontal: pad, paddingTop: 18 }}>
            <View style={{ backgroundColor: colors.surface, borderRadius: 28, paddingVertical: 12, overflow: 'hidden' }}>
              <Hero kind={i} ink={colors.ink} accent={colors.accent} />
            </View>
            <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1, color: colors.accent, marginTop: 26 }}>{s.eyebrow}</Text>
            <Text style={{ fontSize: 32, fontWeight: '800', color: colors.ink, letterSpacing: -0.8, lineHeight: 37, marginTop: 8 }}>{s.title}</Text>
            <Text style={{ fontSize: 14.5, lineHeight: 22, color: colors.muted, marginTop: 12, maxWidth: 320 }}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>

      {/* CTA + sign in */}
      <View style={{ marginTop: 'auto', paddingHorizontal: pad, paddingTop: 20 }}>
        <Button label={steps[page].cta} onPress={advance} iconRight="arrowR" size="lg" />
        <Text style={{ textAlign: 'center', fontSize: 13.5, color: colors.muted, marginTop: 16 }}>
          Already have an account?{' '}
          <Text onPress={() => router.push('/sign-in')} style={{ fontWeight: '700', color: colors.ink, textDecorationLine: 'underline' }}>Sign in</Text>
        </Text>
      </View>
    </View>
  );
}
