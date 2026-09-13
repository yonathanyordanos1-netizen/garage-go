import React, { useEffect } from 'react';
import { View, Text, ScrollView, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '../lib/theme-context';
import { Button, Badge, Separator, radius, shadows } from '../components/ui';
import { Icon } from '../lib/icons';
import * as haptics from '../lib/haptics';

export default function Confirmation() {
  const { code, garage, service, slot, number } = useLocalSearchParams<{ code: string; garage: string; service: string; slot: string; number: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const pop = useSharedValue(0);
  useEffect(() => { pop.value = withSpring(1, { damping: 12, stiffness: 300 }); haptics.success(); }, []);
  const badge = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  const rows: [string, string][] = [
    ['Garage', garage || 'Bole Auto Care'],
    ['Service', service || 'Full engine diagnostics'],
    ['Date & time', slot || 'Today · 10:00'],
    ['Paid via', 'Telebirr ' + (number || '0987505315')],
  ];

  async function share() {
    try { await Share.share({ message: `Garage Go booking ${code}\n${garage} · ${slot}` }); } catch {}
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.ground }} contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24, paddingHorizontal: 22 }}>
      <View style={{ alignItems: 'center' }}>
        <Animated.View style={[{ width: 82, height: 82, borderRadius: 41, backgroundColor: colors.forestTint, alignItems: 'center', justifyContent: 'center' }, badge]}>
          <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={30} color={colors.onPrimary} strokeWidth={3} />
          </View>
        </Animated.View>
        <Animated.Text entering={FadeInDown.delay(120)} style={{ fontSize: 24, fontWeight: '800', color: colors.ink, letterSpacing: -0.4, marginTop: 20 }}>Reservation confirmed</Animated.Text>
        <Animated.Text entering={FadeInDown.delay(180)} style={{ fontSize: 13, color: colors.muted, textAlign: 'center', maxWidth: 270, marginTop: 8 }}>Show this QR code at the garage entrance to check in.</Animated.Text>
      </View>

      {/* Ticket card */}
      <Animated.View entering={FadeInDown.delay(240)} style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 18, marginTop: 24, ...shadows.sm }}>
        <View style={{ alignItems: 'center', borderWidth: 1, borderColor: colors.line, borderStyle: 'dashed', borderRadius: radius.md, padding: 20 }}>
          <QRCode value={JSON.stringify({ code, garage, service, slot })} size={168} color={colors.ink} backgroundColor="transparent" />
          <Text style={{ fontFamily: undefined, fontSize: 18, fontWeight: '600', letterSpacing: 2, color: colors.ink, marginTop: 14 }}>{code || 'GG-000000'}</Text>
          <Text style={{ fontSize: 11.5, color: colors.muted, marginTop: 4 }}>Scan at the garage entrance</Text>
        </View>

        <View style={{ marginTop: 16 }}>
          {rows.map(([k, v], i) => (
            <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 11, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.line }}>
              <Text style={{ fontSize: 12.5, color: colors.muted }}>{k}</Text>
              <Text style={{ fontSize: 12.5, fontWeight: '600', color: colors.ink, textAlign: 'right', flex: 1 }}>{v}</Text>
            </View>
          ))}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 11, borderTopWidth: 1, borderTopColor: colors.line }}>
            <Text style={{ fontSize: 12.5, color: colors.muted }}>Status</Text>
            <Badge label="Confirmed" variant="success" icon="check" />
          </View>
        </View>
      </Animated.View>

      {/* Fee split */}
      <Animated.View entering={FadeInDown.delay(300)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.espresso, borderRadius: radius.md, padding: 14, marginTop: 14 }}>
        <Icon name="birr" size={22} color={colors.onEspresso} strokeWidth={2} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12.5, fontWeight: '600', color: colors.onEspresso }}>100 ETB fee split</Text>
          <Text style={{ fontSize: 11, color: colors.onEspressoMuted, marginTop: 2 }}>50 ETB → Garage Go · 50 ETB → {garage || 'the garage'}</Text>
        </View>
      </Animated.View>

      <View style={{ marginTop: 22, gap: 10 }}>
        <Button label="Share booking" icon="share" variant="outline" onPress={share} />
        <Button label="Back to home" onPress={() => router.replace('/(tabs)')} />
      </View>
    </ScrollView>
  );
}
