import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../lib/theme';
import { Icon, IconName } from '../../lib/icons';
import { OutlineButton } from '../../components/ui';
import { useToast } from '../../components/toast';
import { supabase, signOut } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';

const MENU: { t: string; d: string; icon: IconName }[] = [
  { t: 'My vehicles', d: 'Toyota Vitz 2014 · +1 more', icon: 'car' },
  { t: 'Booking history', d: 'View past reservations', icon: 'clock' },
  { t: 'Saved garages', d: '6 saved', icon: 'heart' },
  { t: 'Payment methods', d: 'Telebirr · CBE Birr', icon: 'wallet' },
  { t: 'Help & support', d: 'FAQ, chat, call center', icon: 'help' },
  { t: 'Settings', d: 'Language, notifications', icon: 'gear' },
];

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { profile, session } = useAuth();
  const [bookingCount, setBookingCount] = useState(0);

  useEffect(() => {
    if (!session) return;
    supabase.from('bookings').select('id', { count: 'exact', head: true })
      .then(({ count }) => setBookingCount(count ?? 0));
  }, [session]);

  const name = profile?.full_name || 'Garage Go user';
  const initial = name[0]?.toUpperCase() ?? 'G';

  async function handleSignOut() {
    await signOut();
    router.replace('/welcome');
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.ground }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 24 }}>
      <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{initial}</Text></View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.sub}>{profile?.phone || '+251 •• •• •• ••'} · {profile?.city || 'Addis Ababa'}</Text>
      </View>

      <View style={styles.pointsCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={{ fontSize: 11.5, color: '#EDE9E3' }}>Garage Go points</Text>
            <Text style={styles.points}>{profile?.points ?? 0}</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => toast('Rewards coming soon')} style={styles.rewardBtn}>
            <Text style={{ color: colors.ground, fontSize: 11.5, fontWeight: '600' }}>View rewards</Text>
          </Pressable>
        </View>
        <View style={{ marginTop: 14, flexDirection: 'row', gap: 18 }}>
          {[[String(bookingCount), 'Bookings'], ['6', 'Saved'], ['4.9', 'Rating']].map(([v, k]) => (
            <View key={k}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>{v}</Text>
              <Text style={{ marginTop: 1, fontSize: 10.5, color: '#EDE9E3' }}>{k}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.menu}>
        {MENU.map((m, i) => (
          <Pressable key={m.t} accessibilityRole="button" accessibilityLabel={m.t}
            onPress={() => m.t === 'Booking history' ? router.push('/(tabs)/search') : toast(m.t)}
            style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: '#E6E4E0' }]}>
            <View style={styles.rowIcon}><Icon name={m.icon} size={18} color={colors.ink2} /></View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13.5, fontWeight: '600', color: colors.ink }}>{m.t}</Text>
              <Text style={{ fontSize: 11.5, color: colors.muted }}>{m.d}</Text>
            </View>
            <Icon name="chevR" size={16} color="#DEDBD7" />
          </Pressable>
        ))}
      </View>

      <View style={{ padding: 16 }}>
        <OutlineButton label="Sign out" color={colors.terraD} onPress={handleSignOut} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 76, height: 76, borderRadius: 24, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.ground, fontWeight: '700', fontSize: 28 },
  name: { marginTop: 12, fontSize: 21, fontWeight: '700', color: colors.ink },
  sub: { marginTop: 3, fontSize: 12.5, color: colors.muted },
  pointsCard: { marginHorizontal: 16, marginTop: 18, backgroundColor: colors.surface, borderRadius: 22, padding: 18 },
  points: { fontSize: 34, fontWeight: '800', color: colors.terra, lineHeight: 36 },
  rewardBtn: { borderWidth: 1, borderColor: 'rgba(253,253,251,0.24)', backgroundColor: 'rgba(253,253,251,0.08)', borderRadius: 11, height: 36, paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center' },
  menu: { marginHorizontal: 16, marginTop: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 20, overflow: 'hidden' },
  row: { paddingHorizontal: 15, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' },
});
