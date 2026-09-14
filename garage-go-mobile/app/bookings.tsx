import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/theme-context';
import { Card, Badge, SegmentedControl, EmptyState, IconButton } from '../components/ui';
import { Icon } from '../lib/icons';
import { getBookings, StoredBooking } from '../lib/store';

export default function Bookings() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState(0);
  const [all, setAll] = useState<StoredBooking[]>([]);

  useFocusEffect(useCallback(() => { getBookings().then(setAll); }, []));

  const key = (['upcoming', 'completed', 'cancelled'] as const)[tab];
  const list = all.filter((b) => b.status === key);
  const strip = { upcoming: colors.success, completed: colors.accent, cancelled: colors.error }[key];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.ground }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <IconButton icon="chevL" onPress={() => router.back()} />
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.ink }}>My bookings</Text>
      </View>
      <View style={{ marginTop: 16 }}>
        <SegmentedControl options={['Upcoming', 'Past', 'Cancelled']} index={tab} onChange={setTab} />
      </View>

      {list.length === 0 ? (
        <EmptyState icon="calendar" title="Nothing here yet" description={key === 'upcoming' ? 'Book a garage and your reservation will show up here.' : 'Bookings in this state will show up here.'} action={key === 'upcoming' ? { label: 'Find a garage', onPress: () => router.push('/(tabs)/search') } : undefined} />
      ) : (
        <View style={{ gap: 12, marginTop: 16 }}>
          {list.map((b) => (
            <Card key={b.code} variant="interactive" onPress={() => router.push(`/booking/${b.code}`)}>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ width: 3, backgroundColor: strip }} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 14 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.ink }}>{b.garage}</Text>
                    <Badge label={b.slot.split(' · ')[0]} variant="secondary" />
                  </View>
                  <View style={{ paddingHorizontal: 14, paddingTop: 8, gap: 5 }}>
                    <Text style={{ fontSize: 13, fontWeight: '500', color: colors.ink2 }}>{b.service}</Text>
                    <Row icon="clock" text={b.slot} />
                    <Row icon="car" text={b.vehicle} />
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, marginTop: 10, borderTopWidth: 1, borderTopColor: colors.line }}>
                    <Text style={{ fontSize: 11, color: colors.muted }}>{b.code}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Badge label={key === 'upcoming' ? 'Confirmed' : key === 'completed' ? 'Completed' : 'Cancelled'} variant={key === 'upcoming' ? 'success' : key === 'completed' ? 'secondary' : 'destructive'} />
                      <Icon name="chevR" size={14} color={colors.faint} />
                    </View>
                  </View>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function Row({ icon, text }: { icon: 'clock' | 'car'; text: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Icon name={icon} size={13} color={colors.muted} />
      <Text style={{ fontSize: 12, color: colors.muted }}>{text}</Text>
    </View>
  );
}
