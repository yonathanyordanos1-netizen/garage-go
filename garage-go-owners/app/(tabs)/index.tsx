import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../lib/theme-context';
import { useAuth } from '../../lib/auth';
import { Screen, Header } from '../../components/screen';
import { Card, Toggle, Avatar } from '../../components/ui';
import { Icon } from '../../lib/icons';
import { radius, shadows } from '../../lib/theme';
import { formatETB } from '../../lib/utils';
import { useStore, setOnline, computeEarnings, jobIsToday, Job } from '../../lib/owner';

function JobRow({ job, onPress, last }: { job: Job; onPress: () => void; last: boolean }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.line }}>
      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.ink, width: 46 }}>{job.slot}</Text>
      <View style={{ width: 1, height: 30, backgroundColor: colors.line }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.ink }} numberOfLines={1}>{job.service}</Text>
        <Text style={{ fontSize: 12, color: colors.muted, marginTop: 1 }} numberOfLines={1}>{job.customer}</Text>
      </View>
      {job.status === 'pending'
        ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.warning }} />
        : <Icon name="chevR" size={18} color={colors.faint} />}
    </Pressable>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { colors } = useTheme();
  const { profile, role } = useAuth();
  const { jobs, services, listings, online } = useStore();

  const earn = computeEarnings(jobs);
  const pending = jobs.filter((j) => j.status === 'pending').length;
  const todays = jobs.filter((j) => jobIsToday(j) && (j.status === 'pending' || j.status === 'confirmed' || j.status === 'in_progress'));
  const lowStock = listings.filter((l) => l.active && l.stock <= 3);

  const firstName = (profile?.full_name || 'Operator').split(' ')[0];
  const onlineLabel = role === 'seller' ? 'Shop open' : role === 'mechanic' ? 'Available for jobs' : 'Accepting bookings';

  // Two headline numbers shown inside the espresso card, per role.
  const stat = role === 'seller'
    ? { a: String(listings.filter((l) => l.active).length), aL: 'Active listings', b: String(lowStock.length), bL: 'Low stock' }
    : { a: String(pending), aL: 'New requests', b: String(todays.length), bL: 'Today’s jobs' };

  return (
    <Screen>
      <Header
        title={`Selam, ${firstName}`}
        subtitle={role === 'seller' ? 'Parts seller' : role === 'mechanic' ? 'Mechanic' : 'Garage'}
        right={<Pressable onPress={() => router.push('/(tabs)/profile')}><Avatar name={profile?.full_name || 'Operator'} size="md" ring /></Pressable>}
      />

      {/* Earnings — solid branded surface, like the main app */}
      <View style={{ backgroundColor: colors.espresso, borderRadius: radius.xl, padding: 20, ...shadows.md }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.onEspressoMuted }}>Earned today</Text>
        <Text style={{ fontSize: 34, fontWeight: '800', color: colors.onEspresso, marginTop: 4, letterSpacing: -0.5 }}>{formatETB(earn.today)}</Text>
        <View style={{ flexDirection: 'row', marginTop: 18 }}>
          {[
            { v: formatETB(earn.week), l: 'This week' },
            { v: stat.a, l: stat.aL },
            { v: stat.b, l: stat.bL },
          ].map((s, i) => (
            <View key={s.l} style={{ flex: 1, borderLeftWidth: i === 0 ? 0 : 1, borderLeftColor: 'rgba(255,255,255,0.12)', paddingLeft: i === 0 ? 0 : 14 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: colors.onEspresso }}>{s.v}</Text>
              <Text style={{ fontSize: 11, color: colors.onEspressoMuted, marginTop: 2 }}>{s.l}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Availability */}
      <Card style={{ marginTop: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
          <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: online ? colors.successTint : colors.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="power" size={19} color={online ? colors.success : colors.muted} strokeWidth={2.2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14.5, fontWeight: '700', color: colors.ink }}>{onlineLabel}</Text>
            <Text style={{ fontSize: 12, color: colors.muted, marginTop: 1 }}>{online ? 'Customers can find you now.' : 'You’re hidden from customers.'}</Text>
          </View>
          <Toggle value={online} onValueChange={setOnline} />
        </View>
      </Card>

      {/* Scan */}
      <Card variant="interactive" onPress={() => router.push('/scan')} style={{ marginTop: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
          <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: colors.forestTint, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="search" size={19} color={colors.forest} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14.5, fontWeight: '700', color: colors.ink }}>Scan a reservation</Text>
            <Text style={{ fontSize: 12, color: colors.muted, marginTop: 1 }}>Check in a customer by their booking QR.</Text>
          </View>
          <Icon name="chevR" size={18} color={colors.faint} />
        </View>
      </Card>

      {/* Main list */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 4, paddingHorizontal: 4 }}>
        <Text style={{ flex: 1, fontSize: 16, fontWeight: '700', color: colors.ink }}>
          {role === 'seller' ? 'Low stock' : 'Today’s schedule'}
        </Text>
        <Pressable onPress={() => router.push(role === 'seller' ? '/(tabs)/listings' : '/(tabs)/jobs')}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.forest }}>{role === 'seller' ? 'Manage' : 'All jobs'}</Text>
        </Pressable>
      </View>

      <Card>
        <View style={{ paddingHorizontal: 16 }}>
          {role === 'seller' ? (
            lowStock.length === 0 ? (
              <Text style={{ fontSize: 13, color: colors.muted, paddingVertical: 18, textAlign: 'center' }}>Everything is well stocked.</Text>
            ) : lowStock.map((l, i) => (
              <View key={l.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: i === lowStock.length - 1 ? 0 : 1, borderBottomColor: colors.line }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.ink }} numberOfLines={1}>{l.name}</Text>
                  <Text style={{ fontSize: 12, color: colors.muted, marginTop: 1 }}>{formatETB(l.price)}</Text>
                </View>
                <Text style={{ fontSize: 12.5, fontWeight: '700', color: l.stock === 0 ? colors.error : colors.warning }}>
                  {l.stock === 0 ? 'Out of stock' : `${l.stock} left`}
                </Text>
              </View>
            ))
          ) : (
            todays.length === 0 ? (
              <Text style={{ fontSize: 13, color: colors.muted, paddingVertical: 18, textAlign: 'center' }}>No jobs scheduled for today.</Text>
            ) : todays.map((j, i) => (
              <JobRow key={j.id} job={j} last={i === todays.length - 1} onPress={() => router.push(`/job/${j.id}`)} />
            ))
          )}
        </View>
      </Card>
    </Screen>
  );
}
