import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/theme-context';
import { EmptyState, IconButton } from '../components/ui';
import { Icon, IconName } from '../lib/icons';

type Notif = { id: string; type: 'confirmed' | 'reminder' | 'promo' | 'system'; title: string; body: string; time: string; group: string; read: boolean };
const SEED: Notif[] = [
  { id: 'n1', type: 'confirmed', title: 'Booking confirmed', body: 'Your slot at Bole Auto Care is held for Wed 17 Sep, 10:00.', time: '2h ago', group: 'Today', read: false },
  { id: 'n2', type: 'reminder', title: 'Service reminder', body: 'Toyota Vitz is 1,600 km from its next service.', time: '5h ago', group: 'Today', read: false },
  { id: 'n3', type: 'promo', title: '15% off tyres this week', body: 'Selected Michelin sets are discounted at Tyre Hub Bole.', time: 'Yesterday', group: 'Earlier', read: true },
  { id: 'n4', type: 'system', title: 'Welcome to Garage Go!', body: 'Book your first garage and get 100 bonus points.', time: '3d ago', group: 'Earlier', read: true },
];

const META: Record<Notif['type'], { icon: IconName; color: (c: any) => string }> = {
  confirmed: { icon: 'checkCircle', color: (c) => c.success },
  reminder: { icon: 'clock', color: (c) => c.accent },
  promo: { icon: 'gift', color: (c) => c.warning },
  system: { icon: 'info', color: (c) => c.muted },
};

export default function Notifications() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState(SEED);
  const groups = ['Today', 'Earlier'];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.ground }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <IconButton icon="chevL" onPress={() => router.back()} />
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.ink }}>Notifications</Text>
        </View>
        <Pressable onPress={() => setItems((xs) => xs.map((x) => ({ ...x, read: true })))}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.accent }}>Mark all read</Text>
        </Pressable>
      </View>

      {items.length === 0 ? (
        <EmptyState icon="bell" title="All caught up" description="You'll see booking updates and reminders here." />
      ) : groups.map((grp) => {
        const list = items.filter((n) => n.group === grp);
        if (!list.length) return null;
        return (
          <View key={grp}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.muted, letterSpacing: 0.5, textTransform: 'uppercase', paddingHorizontal: 16, marginTop: 20, marginBottom: 4 }}>{grp}</Text>
            {list.map((n) => {
              const m = META[n.type];
              return (
                <Pressable
                  key={n.id}
                  onPress={() => setItems((xs) => xs.map((x) => x.id === n.id ? { ...x, read: true } : x))}
                  style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: n.read ? 'transparent' : colors.forestTint, borderLeftWidth: n.read ? 0 : 3, borderLeftColor: colors.forest }}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={m.icon} size={18} color={m.color(colors)} strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13.5, fontWeight: '600', color: colors.ink }}>{n.title}</Text>
                    <Text numberOfLines={2} style={{ fontSize: 12.5, color: colors.muted, marginTop: 2 }}>{n.body}</Text>
                    <Text style={{ fontSize: 11, color: colors.faint, marginTop: 4 }}>{n.time}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        );
      })}
    </ScrollView>
  );
}
