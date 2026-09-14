import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../lib/theme-context';
import { useAuth } from '../../lib/auth';
import { Screen, Header } from '../../components/screen';
import { Card, Avatar, Badge, SegmentedControl, Separator } from '../../components/ui';
import { Icon, IconName } from '../../lib/icons';
import { radius } from '../../lib/theme';
import { formatETB, TELEBIRR_NUMBERS } from '../../lib/utils';
import { useStore, computeEarnings, resetStore } from '../../lib/owner';
import * as haptics from '../../lib/haptics';

const ROLE_LABEL = { garage: 'Garage', mechanic: 'Mechanic', seller: 'Parts seller' } as const;

function Row({ icon, label, value, onPress, danger }: { icon: IconName; label: string; value?: string; onPress?: () => void; danger?: boolean }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress ? () => { haptics.tap(); onPress(); } : undefined}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 }}
    >
      <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: danger ? colors.errorTint : colors.surface, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={18} color={danger ? colors.error : colors.ink2} />
      </View>
      <Text style={{ flex: 1, fontSize: 14.5, fontWeight: '600', color: danger ? colors.error : colors.ink }}>{label}</Text>
      {value && <Text style={{ fontSize: 13, color: colors.muted }}>{value}</Text>}
      {onPress && !danger && <Icon name="chevR" size={18} color={colors.faint} />}
    </Pressable>
  );
}

export default function Profile() {
  const router = useRouter();
  const { colors, preference, setPreference } = useTheme();
  const { profile, role, signOut } = useAuth();
  const { jobs } = useStore();
  const earn = computeEarnings(jobs);

  const prefIndex = preference === 'system' ? 0 : preference === 'light' ? 1 : 2;

  async function handleSignOut() {
    haptics.warning();
    resetStore();
    await signOut();
    router.replace('/welcome');
  }

  return (
    <Screen>
      <Header title="Profile" />

      {/* Identity card */}
      <Card variant="elevated">
        <View style={{ padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Avatar name={profile?.full_name || 'Operator'} size="lg" ring />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.ink }}>{profile?.full_name || 'Operator'}</Text>
            <Text style={{ fontSize: 13, color: colors.muted, marginTop: 2 }}>{profile?.phone || '—'}</Text>
            <View style={{ marginTop: 8 }}>
              <Badge label={ROLE_LABEL[role]} variant="default" icon={role === 'seller' ? 'box' : role === 'mechanic' ? 'wrench' : 'garage'} />
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.line }}>
          {[
            { v: '4.8', l: 'Rating' },
            { v: String(earn.completedCount), l: 'Completed' },
            { v: formatETB(earn.pendingPayout), l: 'To be paid' },
          ].map((s, i) => (
            <View key={s.l} style={{ flex: 1, alignItems: 'center', paddingVertical: 14, borderLeftWidth: i === 0 ? 0 : 1, borderLeftColor: colors.line }}>
              <Text style={{ fontSize: 15.5, fontWeight: '800', color: colors.ink }}>{s.v}</Text>
              <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>{s.l}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Appearance */}
      <Text style={{ fontSize: 12.5, fontWeight: '700', color: colors.muted, marginTop: 22, marginBottom: 8, marginLeft: 4 }}>APPEARANCE</Text>
      <SegmentedControl
        options={['System', 'Light', 'Dark']}
        index={prefIndex}
        onChange={(i) => setPreference(i === 0 ? 'system' : i === 1 ? 'light' : 'dark')}
      />

      {/* Payouts */}
      <Text style={{ fontSize: 12.5, fontWeight: '700', color: colors.muted, marginTop: 22, marginBottom: 8, marginLeft: 4 }}>PAYOUTS · TELEBIRR</Text>
      <Card>
        {TELEBIRR_NUMBERS.map((t, i) => (
          <View key={t.number}>
            {i > 0 && <Separator />}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}>
              <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.forestTint, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="wallet" size={18} color={colors.forest} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14.5, fontWeight: '700', color: colors.ink }}>{t.number}</Text>
                <Text style={{ fontSize: 12, color: colors.muted }}>{t.owner}</Text>
              </View>
              <Badge label={t.label} variant="secondary" />
            </View>
          </View>
        ))}
      </Card>

      {/* Settings */}
      <Text style={{ fontSize: 12.5, fontWeight: '700', color: colors.muted, marginTop: 22, marginBottom: 8, marginLeft: 4 }}>SETTINGS</Text>
      <Card>
        <Row icon="garage" label={role === 'seller' ? 'Shop details' : 'Business details'} onPress={() => {}} />
        <Separator />
        <Row icon="bell" label="Notifications" onPress={() => {}} />
        <Separator />
        <Row icon="help" label="Help & support" onPress={() => {}} />
      </Card>

      <View style={{ marginTop: 12 }}>
        <Card>
          <Row icon="logout" label="Sign out" danger onPress={handleSignOut} />
        </Card>
      </View>

      <Text style={{ textAlign: 'center', fontSize: 11.5, color: colors.faint, marginTop: 18 }}>
        Garage Go Owners · v1.0.0
      </Text>
    </Screen>
  );
}
