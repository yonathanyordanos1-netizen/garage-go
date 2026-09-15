import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../lib/theme-context';
import { useAuth } from '../../lib/auth';
import { Card, Badge, ProgressBar, Avatar, radius, shadows } from '../../components/ui';
import { Thumb } from '../../components/thumb';
import { Icon, IconName } from '../../lib/icons';
import { useData } from '../../lib/data';
import { formatETB } from '../../lib/utils';

const CATS: { icon: IconName; label: string; href: string }[] = [
  { icon: 'garage', label: 'Garages', href: '/(tabs)/search' },
  { icon: 'users', label: 'Mechanic', href: '/emergency' },
  { icon: 'bolt', label: 'SOS', href: '/emergency' },
  { icon: 'truck', label: 'Towing', href: '/roadside' },
  { icon: 'bag', label: 'Market', href: '/(tabs)/market' },
];

export default function Home() {
  const router = useRouter();
  const { colors } = useTheme();
  const { profile } = useAuth();
  const { garages, vehicle } = useData();
  const insets = useSafeAreaInsets();
  const name = (profile?.full_name || 'there').split(' ')[0];

  const serviceLeft = vehicle ? Math.max(0, (vehicle.next_service_km ?? 0) - (vehicle.mileage ?? 0)) : 0;
  const progress = vehicle ? Math.min(1, (vehicle.mileage ?? 0) / (vehicle.next_service_km || 1)) : 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.ground }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 110 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="pin" size={13} color={colors.accent} strokeWidth={2} />
              <Text style={{ fontSize: 11.5, fontWeight: '600', color: colors.muted }}>Bole Medhanialem</Text>
              <Icon name="chevR" size={11} color={colors.muted} />
            </View>
            <Text style={{ fontSize: 24, fontWeight: '700', color: colors.ink, letterSpacing: -0.5, marginTop: 6 }}>Selam, {name}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable onPress={() => router.push('/notifications')} style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="bell" size={19} color={colors.ink2} />
              <View style={{ position: 'absolute', top: 11, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error, borderWidth: 1.5, borderColor: colors.card }} />
            </Pressable>
            <Avatar name={profile?.full_name || ''} size="md" ring />
          </View>
        </View>

        {/* Search — stays on this screen, navigates to the search tab */}
        <Pressable
          onPress={() => router.push('/(tabs)/search')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: 14, height: 50, marginTop: 16, ...shadows.sm }}
        >
          <Icon name="search" size={19} color={colors.faint} />
          <Text style={{ flex: 1, fontSize: 14, color: colors.faint }}>Search garage, service or part</Text>
          <Icon name="sliders" size={18} color={colors.accent} />
        </Pressable>
      </View>

      {/* Vehicle card */}
      {vehicle && (
        <View style={{ paddingHorizontal: 20, marginTop: 18 }}>
          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            style={{ backgroundColor: colors.espresso, borderRadius: radius.lg, padding: 16, ...shadows.md }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="car" size={22} color={colors.onEspresso} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.onEspresso }}>{vehicle.make} {vehicle.model} {vehicle.year}</Text>
                <Text style={{ fontSize: 11.5, color: colors.onEspressoMuted, marginTop: 2 }}>{vehicle.plate}</Text>
              </View>
              <Badge label="Primary" variant="secondary" />
            </View>
            <View style={{ marginTop: 14 }}>
              <ProgressBar value={progress} track="rgba(255,255,255,0.10)" fill={colors.accent} height={5} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <Text style={{ fontSize: 11, color: colors.onEspressoMuted }}>Service in {serviceLeft.toLocaleString()} km</Text>
                <Text style={{ fontSize: 11, color: colors.onEspressoMuted }}>{Math.round(progress * 100)}%</Text>
              </View>
            </View>
          </Pressable>
        </View>
      )}

      {/* Categories */}
      <View style={{ marginTop: 22 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingHorizontal: 20 }}>
          {CATS.map((c) => (
            <Pressable key={c.label} onPress={() => router.push(c.href as any)} style={{ alignItems: 'center', gap: 8, width: 64 }}>
              <View style={{ width: 60, height: 60, borderRadius: 20, backgroundColor: colors.forestTint, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={c.icon} size={24} color={colors.forest} strokeWidth={2} />
              </View>
              <Text numberOfLines={1} style={{ fontSize: 11, fontWeight: '600', color: colors.ink2 }}>{c.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Popular garages */}
      <SectionHeader title="Popular garages" onSeeAll={() => router.push('/(tabs)/search')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 20, paddingBottom: 4 }}>
        {garages.map((g, i) => (
          <Card key={g.id} variant="interactive" onPress={() => router.push(`/garage/${g.id}`)} style={{ width: 210 }}>
            {i === 0 && <View style={{ height: 3, backgroundColor: colors.forest }} />}
            <View style={{ height: 118, position: 'relative' }}>
              <Thumb width={210} height={118} seed={i} icon="garage" />
              <View style={{ position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.94)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }}>
                <Icon name="star" size={11} color="#C29B74" />
                <Text style={{ fontSize: 10.5, fontWeight: '600', color: '#3A2A1D' }}>{g.rating}</Text>
              </View>
            </View>
            <View style={{ padding: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Text numberOfLines={1} style={{ flex: 1, fontSize: 13.5, fontWeight: '700', color: colors.ink }}>{g.name}</Text>
                {g.verified && <Icon name="shield" size={13} color={colors.forest} strokeWidth={2} />}
              </View>
              <Text numberOfLines={1} style={{ fontSize: 11.5, color: colors.muted, marginTop: 4 }}>{g.area}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <Badge label={g.tags?.[0] ?? 'Service'} variant="secondary" />
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.ink }}>From {g.price_from} ETB</Text>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>

      {/* Nearby */}
      <SectionHeader title="Nearby you" onSeeAll={() => router.push('/(tabs)/search')} />
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        {garages.slice(0, 3).map((g, i) => (
          <Card key={g.id} variant="interactive" onPress={() => router.push(`/garage/${g.id}`)}>
            <View style={{ flexDirection: 'row', padding: 11, gap: 12, alignItems: 'center' }}>
              <Thumb width={72} height={72} seed={i + 1} radius={15} icon="garage" />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.ink }}>{g.name}</Text>
                  {g.verified && <Icon name="shield" size={12} color={colors.forest} strokeWidth={2} />}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 }}>
                  <Icon name="star" size={12} color="#C29B74" />
                  <Text style={{ fontSize: 11.5, color: colors.ink }}>{g.rating}</Text>
                  <Text style={{ fontSize: 11.5, color: colors.muted }}>· {g.area}</Text>
                </View>
                <View style={{ marginTop: 7 }}>
                  <Badge label={`From ${formatETB(g.price_from)}`} variant="secondary" />
                </View>
              </View>
              <Icon name="chevR" size={18} color={colors.faint} />
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12 }}>
      <Text style={{ fontSize: 17, fontWeight: '700', color: colors.ink }}>{title}</Text>
      <Pressable onPress={onSeeAll}><Text style={{ fontSize: 12.5, fontWeight: '600', color: colors.muted }}>See all</Text></Pressable>
    </View>
  );
}
