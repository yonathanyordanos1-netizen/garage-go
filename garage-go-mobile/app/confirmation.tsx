import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../lib/theme';
import { Icon } from '../lib/icons';
import { PrimaryButton, OutlineButton } from '../components/ui';

export default function Confirmation() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const p = useLocalSearchParams<{ code: string; garage: string; service: string; slot: string; vehicle: string; telebirr: string }>();

  const rows: [string, string][] = [
    ['Garage', p.garage || 'Garage'],
    ['Service', p.service || 'Service'],
    ['Date & time', 'Wed 17 Sep · ' + (p.slot || '')],
    ['Vehicle', p.vehicle || ''],
    ['Paid via', 'Telebirr ' + (p.telebirr || '')],
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.ground }}
      contentContainerStyle={{ paddingTop: insets.top + 14, paddingHorizontal: 22, paddingBottom: insets.bottom + 24, flexGrow: 1 }}>
      <View style={{ alignItems: 'center', marginTop: 14 }}>
        <View style={styles.badge}><View style={styles.badgeInner}><Icon name="check" size={30} color="#fff" strokeWidth={3} /></View></View>
        <Text style={styles.h1}>Reservation confirmed</Text>
        <Text style={styles.sub}>Your slot is held. Show this booking ID at the garage.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.codeRow}>
          <View>
            <Text style={{ fontSize: 11, color: colors.muted }}>Booking ID</Text>
            <Text style={styles.code}>{p.code || 'GG-000000'}</Text>
          </View>
          <View style={styles.statusPill}><Text style={{ fontSize: 11, fontWeight: '600', color: colors.forest }}>Confirmed</Text></View>
        </View>
        {rows.map(([k, v], i) => (
          <View key={k} style={[styles.detailRow, i > 0 && { borderTopWidth: 1, borderTopColor: '#EFE7D5' }]}>
            <Text style={{ fontSize: 12.5, color: colors.muted }}>{k}</Text>
            <Text style={{ fontSize: 12.5, fontWeight: '600', color: colors.ink, flex: 1, textAlign: 'right' }}>{v}</Text>
          </View>
        ))}
      </View>

      <View style={styles.split}>
        <Icon name="birr" size={22} color={colors.terra} strokeWidth={2} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12.5, color: '#fff', fontWeight: '600' }}>100 ETB fee split</Text>
          <Text style={{ fontSize: 11, color: '#C9BE9E', marginTop: 2 }}>50 ETB → Garage Go · 50 ETB → {p.garage || 'the garage'}</Text>
        </View>
      </View>

      <View style={{ marginTop: 'auto', paddingTop: 22, gap: 10 }}>
        <PrimaryButton label="Back to home" onPress={() => router.replace('/(tabs)')} />
        <OutlineButton label="Book another garage" onPress={() => router.replace('/(tabs)/search')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  badge: { width: 82, height: 82, borderRadius: 41, backgroundColor: colors.forestTint, alignItems: 'center', justifyContent: 'center' },
  badgeInner: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' },
  h1: { marginTop: 20, fontSize: 24, fontWeight: '800', color: colors.ink, letterSpacing: -0.4 },
  sub: { marginTop: 8, fontSize: 13, color: colors.muted, textAlign: 'center', maxWidth: 260 },
  card: { marginTop: 24, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 20, padding: 18 },
  codeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.line2, borderStyle: 'dashed' },
  code: { fontSize: 18, fontWeight: '600', color: colors.ink, letterSpacing: 0.5 },
  statusPill: { backgroundColor: colors.forestTint, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 11 },
  split: { marginTop: 14, backgroundColor: colors.forest, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
});
