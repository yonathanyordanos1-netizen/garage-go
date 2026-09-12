import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../lib/theme';
import { Icon } from '../../lib/icons';
import { GarageThumb } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import { haversineKm, distanceLabel, USER_LOCATION } from '../../lib/utils';

type Garage = {
  id: string; name: string; area: string; rating: number; reviews_count: number;
  price_from: number; hours: string; lat: number; lng: number; tags: string[];
};
const CHIPS = ['All services', 'Engine', 'Tyres', 'Electrical', 'Body work', 'AC & cooling'];

export default function Search() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [chip, setChip] = useState(0);
  const [garages, setGarages] = useState<Garage[]>([]);

  useEffect(() => {
    supabase.from('garages').select('*').then(({ data }) => {
      const rows = (data as Garage[]) ?? [];
      rows.sort((a, b) => haversineKm(USER_LOCATION, a) - haversineKm(USER_LOCATION, b));
      setGarages(rows);
    });
  }, []);

  const filtered = chip === 0 ? garages : garages.filter((g) => g.tags?.some((t) => CHIPS[chip].toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(CHIPS[chip].split(' ')[0].toLowerCase())));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.ground }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 24 }}>
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={styles.h1}>Find a garage</Text>
        <View style={styles.locBar}>
          <Icon name="pin" size={18} color={colors.terra} strokeWidth={2} />
          <TextInput defaultValue="Bole, Addis Ababa" accessibilityLabel="Search location"
            style={{ flex: 1, fontSize: 13.5, color: colors.ink, padding: 0 }} />
          <Text style={{ fontSize: 11.5, color: colors.muted, fontWeight: '600' }}>Change</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }} contentContainerStyle={{ gap: 8 }}>
          {CHIPS.map((c, i) => (
            <Pressable key={c} onPress={() => setChip(i)} style={[styles.chip, { backgroundColor: chip === i ? colors.ink : colors.card, borderColor: chip === i ? colors.ink : colors.line2 }]}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: chip === i ? '#fff' : colors.ink2 }}>{c}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.metaRow}>
        <Text style={{ fontSize: 12.5, color: colors.muted }}>{filtered.length} garages nearby</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Icon name="filter" size={15} color={colors.forest} />
          <Text style={{ fontSize: 12.5, color: colors.muted, fontWeight: '600' }}>Sort: Distance</Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, gap: 12 }}>
        {filtered.map((g) => {
          const dist = distanceLabel(haversineKm(USER_LOCATION, g));
          return (
            <Pressable key={g.id} onPress={() => router.push(`/garage/${g.id}`)} style={styles.card}>
              <View style={{ width: 78, height: 78, borderRadius: 14, overflow: 'hidden' }}>
                <GarageThumb width={78} height={78} seed={g.name.length} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.ink }}>{g.name}</Text>
                  <Icon name="shield" size={13} color={colors.forest} strokeWidth={2} />
                </View>
                <Text style={{ marginTop: 3, fontSize: 11.5, color: colors.muted }}>{g.area} · {dist}</Text>
                <Text style={{ marginTop: 2, fontSize: 11, color: colors.success, fontWeight: '600' }}>{g.hours}</Text>
                <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Icon name="star" size={12} color={colors.terra} />
                    <Text style={{ fontSize: 11.5, fontWeight: '600', color: colors.ink }}>{g.rating}</Text>
                    <Text style={{ fontSize: 11.5, color: colors.faint }}>({g.reviews_count})</Text>
                  </View>
                  <Text style={{ fontSize: 11.5, fontWeight: '700', color: colors.ink }}>From {g.price_from} ETB</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 24, fontWeight: '700', color: colors.ink, letterSpacing: -0.5 },
  locBar: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 15, paddingHorizontal: 14, height: 48 },
  chip: { borderWidth: 1, borderRadius: 999, height: 34, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  metaRow: { paddingHorizontal: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  card: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, borderRadius: 18, padding: 12, flexDirection: 'row', gap: 12 },
});
