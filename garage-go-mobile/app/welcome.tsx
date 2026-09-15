import React, { useRef, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, useWindowDimensions, Image,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/theme-context';
import { Button } from '../components/ui';
import * as haptics from '../lib/haptics';

const logo = require('../assets/icon.png');

type Step = { eyebrow: string; title: string; body: string; cta: string };

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
            <View style={{ backgroundColor: colors.surface, borderRadius: 28, padding: 24, alignItems: 'center', overflow: 'hidden' }}>
              <Image source={logo} style={{ width: 148, height: 148, borderRadius: 34, borderWidth: 1, borderColor: colors.line2 }} resizeMode="cover" />
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
