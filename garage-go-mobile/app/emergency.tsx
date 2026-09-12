import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../lib/theme';
import { Icon } from '../lib/icons';
import { Tag } from '../components/ui';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/toast';

type Mechanic = { id: string; name: string; phone: string; area: string; experience: string; tags: string[] };

export default function Emergency() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);

  useEffect(() => {
    supabase.from('mechanics').select('*').eq('verified', true).order('rating', { ascending: false })
      .then(({ data }) => setMechanics((data as Mechanic[]) ?? []));
  }, []);

  const etas = ['6 min', '11 min', '17 min'];
  const dists = ['1.4 km', '3.2 km', '5.0 km'];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.ground }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }}>
      <View style={{ paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
          <Icon name="chevL" size={18} color={colors.ink2} />
        </Pressable>
        <Text style={styles.h1}>Emergency mechanic</Text>
      </View>

      <LinearGradient colors={['#E27D60', '#CE6A4E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon name="bolt" size={15} color="#fff" strokeWidth={2.4} />
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>STRANDED?</Text>
        </View>
        <Text style={styles.bannerTitle}>I need a mechanic{'\n'}now</Text>
        <Text style={styles.bannerSub}>Share your location and we'll dispatch the nearest verified mechanic.</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Get Emergency Help" onPress={() => toast('Locating nearby mechanics…')} style={styles.locateBtn}>
          <Icon name="pin" size={17} color="#B14B2E" strokeWidth={2} />
          <Text style={{ color: '#B14B2E', fontSize: 13.5, fontWeight: '700' }}>Locate me & dispatch</Text>
        </Pressable>
      </LinearGradient>

      <View style={{ paddingHorizontal: 16, marginTop: 22 }}>
        <Text style={styles.h2}>Verified mechanics nearby</Text>
        <View style={{ gap: 11 }}>
          {mechanics.map((m, i) => (
            <View key={m.id} style={styles.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{m.name[0]}</Text></View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.ink }}>{m.name}</Text>
                    <Icon name="shield" size={13} color={colors.forest} strokeWidth={2} />
                  </View>
                  <Text style={{ marginTop: 2, fontSize: 11.5, color: colors.muted }}>{m.area} · {m.experience} exp</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={styles.etaPill}><Text style={{ fontSize: 11, fontWeight: '700', color: colors.forest }}>{etas[i] ?? '—'}</Text></View>
                  <Text style={{ marginTop: 4, fontSize: 10.5, color: colors.faint }}>{dists[i] ?? ''}</Text>
                </View>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }} contentContainerStyle={{ gap: 6 }}>
                {(m.tags ?? []).map((t) => <Tag key={t} label={t} />)}
              </ScrollView>
              <View style={{ marginTop: 11, flexDirection: 'row', gap: 8 }}>
                <Pressable accessibilityRole="button" onPress={() => toast('Requesting ' + m.name + '…')} style={styles.requestBtn}>
                  <Text style={{ color: '#fff', fontSize: 12.5, fontWeight: '700' }}>Request now</Text>
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel={'Call ' + m.name} onPress={() => Linking.openURL('tel:' + m.phone.replace(/\s/g, ''))} style={styles.callBtn}>
                  <Icon name="phone" size={18} color={colors.ink2} />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  back: { width: 40, height: 40, borderRadius: 13, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  h1: { fontSize: 22, fontWeight: '700', color: colors.ink, letterSpacing: -0.5 },
  h2: { fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: 12 },
  banner: { marginHorizontal: 16, marginTop: 16, borderRadius: 22, padding: 20 },
  bannerTitle: { marginTop: 8, fontSize: 20, fontWeight: '800', color: '#fff', lineHeight: 23 },
  bannerSub: { marginTop: 8, fontSize: 12.5, color: '#fff', opacity: 0.94, maxWidth: 240 },
  locateBtn: { marginTop: 14, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 13, height: 46, paddingHorizontal: 20 },
  card: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, borderRadius: 18, padding: 13 },
  avatar: { width: 46, height: 46, borderRadius: 13, backgroundColor: colors.slate, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.ground, fontWeight: '700', fontSize: 16 },
  etaPill: { backgroundColor: colors.forestTint, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 },
  requestBtn: { flex: 1, backgroundColor: colors.forest, borderRadius: 12, height: 42, alignItems: 'center', justifyContent: 'center' },
  callBtn: { width: 44, borderWidth: 1, borderColor: colors.line, borderRadius: 12, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
});
