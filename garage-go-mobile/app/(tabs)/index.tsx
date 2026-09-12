import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { colors, shadow } from '../../lib/theme';
import { Icon, IconName } from '../../lib/icons';
import { GarageThumb } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { haversineKm, distanceLabel, USER_LOCATION } from '../../lib/utils';

type Garage = { id: string; name: string; area: string; rating: number; price_from: number; lat: number; lng: number };

const QUICK: { label: string; icon: IconName; chip: string; ink: string; go: string }[] = [
  { label: 'Book garage', icon: 'car', chip: colors.forest, ink: '#fff', go: '/(tabs)/search' },
  { label: 'Find mechanic', icon: 'users', chip: colors.slate, ink: '#fff', go: '/emergency' },
  { label: 'Emergency', icon: 'bolt', chip: colors.terra, ink: '#fff', go: '/emergency' },
  { label: 'Towing', icon: 'truck', chip: colors.forestL, ink: '#fff', go: '/roadside' },
];

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const [garages, setGarages] = useState<Garage[]>([]);

  useEffect(() => {
    supabase.from('garages').select('id,name,area,rating,price_from,lat,lng').order('rating', { ascending: false })
      .then(({ data }) => setGarages((data as Garage[]) ?? []));
  }, []);

  const firstName = (profile?.full_name || 'there').split(' ')[0];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.ground }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 24 }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Icon name="pin" size={13} color={colors.terra} strokeWidth={2} />
              <Text style={{ fontSize: 11.5, fontWeight: '500', color: colors.muted }}>Bole Medhanialem, Addis Ababa</Text>
              <Icon name="chevR" size={11} color={colors.muted} />
            </View>
            <Text style={styles.hello}>Selam, {firstName}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable accessibilityRole="button" accessibilityLabel="Notifications" style={styles.iconBtn}>
              <Icon name="bell" size={19} color={colors.ink2} />
            </Pressable>
            <View style={styles.avatar}><Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}</Text></View>
          </View>
        </View>

        <View style={[styles.searchBar, shadow.card]}>
          <Icon name="search" size={19} color={colors.faint} />
          <TextInput placeholder="Search garage, service or part" placeholderTextColor={colors.faint}
            accessibilityLabel="Search garages, services or parts"
            onFocus={() => router.push('/(tabs)/search')} style={{ flex: 1, fontSize: 14, color: colors.ink, padding: 0 }} />
          <Icon name="filter" size={19} color={colors.terra} />
        </View>
      </View>

      {/* Quick actions */}
      <View style={styles.quickRow}>
        {QUICK.map((q) => (
          <Pressable key={q.label} accessibilityRole="button" accessibilityLabel={q.label} onPress={() => router.push(q.go as any)}
            style={{ alignItems: 'center', gap: 8, flex: 1 }}>
            <View style={[styles.quickChip, { backgroundColor: q.chip }]}>
              <Icon name={q.icon} size={24} color={q.ink} strokeWidth={2} />
            </View>
            <Text style={styles.quickLabel}>{q.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Vehicle card */}
      <View style={styles.darkCard}>
        <View style={{ width: 48, height: 48 }}>
          <Svg width={48} height={48} viewBox="0 0 48 48">
            <Circle cx={24} cy={24} r={20} fill="none" stroke="rgba(245,230,204,0.16)" strokeWidth={5} />
            <Circle cx={24} cy={24} r={20} fill="none" stroke={colors.terra} strokeWidth={5} strokeLinecap="round"
              strokeDasharray={125.6} strokeDashoffset={38} transform="rotate(-90 24 24)" />
          </Svg>
          <Text style={styles.ring}>70%</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="car" size={14} color={colors.terra} strokeWidth={2} />
            <Text style={{ fontSize: 13.5, fontWeight: '600', color: '#fff' }}>Toyota Vitz 2014</Text>
          </View>
          <Text style={styles.plate}>AA-3-12345 · service in 1,200 km</Text>
        </View>
        <Icon name="chevR" size={15} color="#A69C7E" />
      </View>

      {/* Popular garages */}
      <View style={{ marginTop: 26 }}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Popular garages</Text>
          <Text style={styles.seeAll} onPress={() => router.push('/(tabs)/search')}>See all</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
          {garages.map((g, i) => {
            const dist = distanceLabel(haversineKm(USER_LOCATION, { lat: g.lat, lng: g.lng }));
            return (
              <Pressable key={g.id} onPress={() => router.push(`/garage/${g.id}`)} style={styles.gCard}>
                <View style={{ height: 102 }}>
                  <GarageThumb width="100%" height={102} seed={i} />
                  <View style={styles.ratingPill}>
                    <Icon name="star" size={11} color={colors.terra} />
                    <Text style={{ color: '#fff', fontSize: 10.5, fontWeight: '600' }}>{g.rating}</Text>
                  </View>
                </View>
                <View style={{ padding: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Text numberOfLines={1} style={{ fontSize: 13.5, fontWeight: '600', color: colors.ink, flex: 1 }}>{g.name}</Text>
                    <Icon name="shield" size={13} color={colors.forest} strokeWidth={2} />
                  </View>
                  <Text style={{ marginTop: 4, fontSize: 11.5, color: colors.muted }}>{g.area} · {dist}</Text>
                  <Text style={{ marginTop: 7, fontSize: 11.5, fontWeight: '600', color: colors.ink }}>From {g.price_from} ETB</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Fee card */}
      <View style={styles.feeCard}>
        <Icon name="birr" size={28} color={colors.terra} strokeWidth={2} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>100 ETB reservation fee</Text>
          <Text style={{ marginTop: 3, fontSize: 11, color: '#C9BE9E' }}>50 ETB to Garage Go · 50 ETB to your garage. Repairs paid on site.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hello: { marginTop: 8, fontSize: 26, fontWeight: '700', color: colors.ink, letterSpacing: -0.6 },
  iconBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', ...shadow.card },
  avatar: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.ground, fontWeight: '700', fontSize: 15 },
  searchBar: { marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderRadius: 16, paddingHorizontal: 15, height: 50 },
  quickRow: { paddingHorizontal: 16, paddingTop: 22, flexDirection: 'row', gap: 10 },
  quickChip: { width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center', color: colors.ink2 },
  darkCard: { marginHorizontal: 16, marginTop: 22, backgroundColor: colors.forest, borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 13 },
  ring: { position: 'absolute', width: 48, height: 48, textAlign: 'center', lineHeight: 48, fontSize: 11.5, fontWeight: '700', color: '#fff' },
  plate: { marginTop: 3, fontSize: 11, color: '#C9BE9E' },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.ink },
  seeAll: { fontSize: 12.5, fontWeight: '600', color: colors.forest },
  gCard: { width: 204, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, borderRadius: 18, overflow: 'hidden' },
  ratingPill: { position: 'absolute', top: 9, left: 9, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(46,43,37,0.86)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  feeCard: { marginHorizontal: 16, marginTop: 24, backgroundColor: colors.forest, borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
});
