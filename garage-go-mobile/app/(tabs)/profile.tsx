import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../lib/theme-context';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../components/toast';
import { Card, Avatar, Badge, Button, Separator, radius, shadows } from '../../components/ui';
import { Icon, IconName } from '../../lib/icons';
import { signOut } from '../../lib/supabase';

type Row = { icon: IconName; label: string; sub?: string; onPress: () => void; danger?: boolean };

export default function Profile() {
  const router = useRouter();
  const { colors } = useTheme();
  const { profile, session } = useAuth();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  const name = profile?.full_name || 'Dawit Mekonnen';
  const email = session?.user?.email || profile?.phone || '+251 91 •• •• 42';

  const sections: { header: string; rows: Row[] }[] = [
    {
      header: 'Account', rows: [
        { icon: 'clock', label: 'Booking history', sub: '24 reservations', onPress: () => router.push('/bookings') },
        { icon: 'heart', label: 'Saved garages', sub: '6 saved', onPress: () => toast.info('Coming soon') },
        { icon: 'car', label: 'My vehicles', sub: 'Toyota Vitz 2014 · +1', onPress: () => toast.info('Coming soon') },
        { icon: 'wallet', label: 'Payment methods', sub: 'Telebirr · CBE Birr', onPress: () => toast.info('Coming soon') },
      ],
    },
    {
      header: 'Preferences', rows: [
        { icon: 'bell', label: 'Notifications', onPress: () => router.push('/notifications') },
        { icon: 'gear', label: 'Settings', sub: 'Appearance, language', onPress: () => router.push('/settings') },
      ],
    },
    {
      header: 'Support', rows: [
        { icon: 'help', label: 'Help & support', onPress: () => toast.info('Coming soon') },
        { icon: 'info', label: 'About', sub: 'Garage Go v1.0.0', onPress: () => toast.info('Garage Go v1.0.0') },
      ],
    },
  ];

  async function doSignOut() {
    await signOut();
    router.replace('/welcome');
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.ground }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
        <Avatar name={name} size="xl" ring />
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.ink, letterSpacing: -0.5, marginTop: 12 }}>{name}</Text>
        <Text style={{ fontSize: 13, color: colors.muted, marginTop: 3 }}>{email}</Text>
        <Pressable onPress={() => toast.info('Coming soon')} style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.accent }}>Edit profile</Text>
        </Pressable>
      </View>

      {/* Stats */}
      <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
        <Card>
          <View style={{ flexDirection: 'row', paddingVertical: 16 }}>
            {[['24', 'Bookings'], ['6', 'Saved'], ['4.9', 'Rating']].map(([v, k], i) => (
              <View key={k} style={{ flex: 1, alignItems: 'center', borderLeftWidth: i === 0 ? 0 : 1, borderLeftColor: colors.line }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: colors.ink }}>{v}</Text>
                <Text style={{ fontSize: 11, color: colors.muted, marginTop: 1 }}>{k}</Text>
              </View>
            ))}
          </View>
        </Card>
      </View>

      {/* Points card (dark both themes) */}
      <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
        <View style={{ backgroundColor: colors.espresso, borderRadius: radius.xl, padding: 18, ...shadows.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ fontSize: 11.5, color: colors.onEspressoMuted }}>Garage Go points</Text>
              <Text style={{ fontSize: 34, fontWeight: '800', color: colors.onEspresso, marginTop: 2 }}>{profile?.points ?? 640}</Text>
            </View>
            <Badge label="Gold member" variant="warning" icon="sparkle" />
          </View>
          <Text style={{ fontSize: 11, color: colors.onEspressoMuted, marginTop: 12 }}>250 pts to Platinum</Text>
        </View>
      </View>

      {/* Menu sections */}
      {sections.map((sec) => (
        <View key={sec.header} style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.muted, letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>{sec.header}</Text>
          <Card>
            {sec.rows.map((r, i) => (
              <View key={r.label}>
                {i > 0 && <Separator />}
                <Pressable onPress={r.onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 15, height: 54 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={r.icon} size={18} color={colors.ink2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: colors.ink }}>{r.label}</Text>
                    {r.sub && <Text style={{ fontSize: 11.5, color: colors.muted, marginTop: 1 }}>{r.sub}</Text>}
                  </View>
                  <Icon name="chevR" size={16} color={colors.faint} />
                </Pressable>
              </View>
            ))}
          </Card>
        </View>
      ))}

      <View style={{ paddingHorizontal: 16, marginTop: 22 }}>
        <Button label="Sign out" icon="logout" variant="ghost" onPress={doSignOut} style={{ borderWidth: 1, borderColor: colors.line }} />
      </View>
    </ScrollView>
  );
}
