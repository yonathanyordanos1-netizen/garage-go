import React from 'react';
import { View, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/theme-context';
import { Button } from '../components/ui';
import { spacing } from '../lib/theme';

const logo = require('../assets/logo.jpeg');

export default function Welcome() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground, paddingHorizontal: spacing.xl, paddingTop: insets.top, paddingBottom: insets.bottom + 20 }}>
      {/* Brand — centered */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Image source={logo} style={{ width: 88, height: 88, borderRadius: 22 }} resizeMode="contain" />
        <Text style={{ fontSize: 28, fontWeight: '800', color: colors.ink, letterSpacing: -0.5, marginTop: 24 }}>
          Garage Go Owners
        </Text>
        <Text style={{ fontSize: 15, color: colors.muted, marginTop: 8, textAlign: 'center', lineHeight: 21, maxWidth: 300 }}>
          Manage bookings, jobs and listings — all in one place.
        </Text>
      </View>

      {/* Actions */}
      <View style={{ gap: 10 }}>
        <Button label="Get started" onPress={() => router.push('/sign-up')} />
        <Button label="I already have an account" variant="ghost" onPress={() => router.push('/sign-in')} />
      </View>
    </View>
  );
}
