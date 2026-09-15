import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../lib/theme-context';
import { useAuth } from '../../lib/auth';
import { Screen, Header } from '../../components/screen';
import { Card, Avatar } from '../../components/ui';
import { Icon, IconName } from '../../lib/icons';
import { radius, shadows } from '../../lib/theme';
import { formatETB } from '../../lib/utils';
import { useStore, setOnline, computeEarnings, jobIsToday, Job } from '../../lib/owner';
import * as haptics from '../../lib/haptics';

/* Quick action tile — the "category navigation" row. */
function QuickTile({ icon, label, tint, onPress }: { icon: IconName; label: string; tint?: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={() => { haptics.tap(); onPress(); }} style={{ flex: 1, alignItems: 'center', gap: 7 }}>
      <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: tint ?? colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line }}>
        <Icon name={icon} size={23} color={colors.forest} strokeWidth={2} />
      </View>
      <Text style={{ fontSize: 11.5, fontWeight: '600', color: colors.ink2 }} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

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
  const { jobs, listings, online } = useStore();

  const earn = computeEarnings(jobs);
  const pending = jobs.filter((j) => j.status === 'pending').length;
  const todays = jobs.filter((j) => jobIsToday(j) && (j.status === 'pending' || j.status === 'confirmed' || j.status === 'in_progress'));
  const lowStock = listings.filter((l) => l.active && l.stock <= 3);

  const firstName = (profile?.full_name || 'Operator').split(' ')[0];
  const isSeller = role === 'seller';

  const stat = isSeller
    ? { a: String(listings.filter((l) => l.active).length), aL: 'Active listings', b: String(lowStock.length), bL: 'Low stock' }
    : { a: String(pending), aL: 'New requests', b: String(todays.length), bL: 'Today’s jobs' };

  // Quick actions (category-nav pattern), tailored per role.
  const listingsHref = '/(tabs)/listings';
  const actions: { icon: IconName; label: string; onPress: () => void }[] = [
    { icon: 'search', label: 'Scan', onPress: () => router.push('/scan') },
    ...(isSeller
      ? [{ icon: 'box' as IconName, label: 'Listings', onPress: () => router.push(listingsHref) }]
      : [
          { icon: 'clipboard' as IconName, label: 'Jobs', onPress: () => router.push('/(tabs)/jobs') },
          ...(role === 'garage' ? [{ icon: 'wrench' as IconName, label: 'Services', onPress: () => router.push(listingsHref) }] : []),
        ]),
    { icon: 'power', label: online ? 'Online' : 'Offline', onPress: () => setOnline(!online) },
    { icon: 'user', label: 'Profile', onPress: () => router.push('/(tabs)/profile') },
  ];

  // Urgency alert (sale-banner pattern), only when there's something to act on.
  const alert = isSeller
    ? (lowStock.length > 0 ? { text: `${lowStock.length} item${lowStock.length === 1 ? '' : 's'} low on stock`, cta: 'Restock', onPress: () => router.push(listingsHref) } : null)
    : (pending > 0 ? { text: `${pending} new request${pending === 1 ? '' : 's'} waiting`, cta: 'Review', onPress: () => router.push('/(tabs)/jobs') } : null);

  return (
    <Screen>
      <Header
        title={`Selam, ${firstName}`}
        subtitle={isSeller ? 'Parts seller' : role === 'mechanic' ? 'Mechanic' : 'Garage'}
        right={<Pressable onPress={() => router.push('/(tabs)/profile')}><Avatar name={profile?.full_name || 'Operator'} size="md" ring /></Pressable>}
      />

      {/* Hero — earnings */}
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

      {/* Quick actions — category-nav pattern */}
      <View style={{ flexDirection: 'row', marginTop: 20, paddingHorizontal: 4 }}>
        {actions.map((a) => (
          <QuickTile key={a.label} icon={a.icon} label={a.label} tint={a.label === 'Online' ? colors.successTint : a.label === 'Offline' ? colors.surface : colors.forestTint} onPress={a.onPress} />
        ))}
      </View>

      {/* Urgency alert — sale-banner pattern */}
      {alert && (
        <Pressable onPress={() => { haptics.tap(); alert.onPress(); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.accentTint, borderRadius: radius.lg, padding: 14, marginTop: 20 }}>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="bell" size={18} color={colors.onPrimary} strokeWidth={2} />
          </View>
          <Text style={{ flex: 1, fontSize: 14, fontWeight: '700', color: colors.ink }}>{alert.text}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.forest }}>{alert.cta}</Text>
            <Icon name="chevR" size={16} color={colors.forest} />
          </View>
        </Pressable>
      )}

      {/* Featured list — today's schedule / low stock */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 4, paddingHorizontal: 4 }}>
        <Text style={{ flex: 1, fontSize: 16, fontWeight: '700', color: colors.ink }}>
          {isSeller ? 'Low stock' : 'Today’s schedule'}
        </Text>
        <Pressable onPress={() => router.push(isSeller ? listingsHref : '/(tabs)/jobs')}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.forest }}>{isSeller ? 'Manage' : 'All jobs'}</Text>
        </Pressable>
      </View>

      <Card>
        <View style={{ paddingHorizontal: 16 }}>
          {isSeller ? (
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
