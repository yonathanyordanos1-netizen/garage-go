import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/theme-context';
import { Button } from '../components/ui';
import { Icon, IconName } from '../lib/icons';
import { spacing, radius } from '../lib/theme';

const logo = require('../assets/logo.jpeg');

const PERKS: { icon: IconName; title: string; body: string }[] = [
  { icon: 'clipboard', title: 'Jobs come to you', body: 'Accept or decline bookings from customers in one tap.' },
  { icon: 'trend', title: 'Track your earnings', body: 'See today’s revenue, weekly totals and pending payouts.' },
  { icon: 'box', title: 'Manage what you sell', body: 'Services, parts and stock — edit prices any time.' },
];

export default function Welcome() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.ground }}
      contentContainerStyle={{ paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24, paddingHorizontal: spacing.xl }}
      showsVerticalScrollIndicator={false}
    >
      {/* Brand block — solid espresso, matching the main app */}
      <View style={{ backgroundColor: colors.espresso, borderRadius: radius.xl, padding: 24 }}>
        <Image source={logo} style={{ width: 64, height: 64, borderRadius: 16, marginBottom: 18 }} resizeMode="contain" />
        <Text style={{ fontSize: 12.5, fontWeight: '700', letterSpacing: 1.5, color: colors.accent, marginBottom: 8 }}>
          GARAGE GO · OWNERS
        </Text>
        <Text style={{ fontSize: 27, fontWeight: '800', color: colors.onEspresso, lineHeight: 33 }}>
          Run your garage,{'\n'}not your paperwork.
        </Text>
        <Text style={{ fontSize: 14, color: colors.onEspressoMuted, marginTop: 12, lineHeight: 20 }}>
          The operator app for garages, mechanics and parts sellers.
        </Text>
      </View>

      <View style={{ paddingVertical: 24, gap: 18 }}>
        {PERKS.map((p) => (
          <View key={p.title} style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.forestTint, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={p.icon} size={21} color={colors.forest} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.ink }}>{p.title}</Text>
              <Text style={{ fontSize: 12.5, color: colors.muted, marginTop: 2, lineHeight: 18 }}>{p.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ gap: 10 }}>
        <Button label="Create operator account" onPress={() => router.push('/sign-up')} />
        <Button label="I already have an account" variant="secondary" onPress={() => router.push('/sign-in')} />
      </View>
    </ScrollView>
  );
}
