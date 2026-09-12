import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../lib/theme';
import { Icon, IconName } from '../lib/icons';
import { PrimaryButton } from '../components/ui';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useToast } from '../components/toast';

const OPTS: { t: string; d: string; icon: IconName; dark?: boolean }[] = [
  { t: 'Towing', d: 'Flatbed or hook', icon: 'truck', dark: true },
  { t: 'Battery jump', d: 'Jump or replace', icon: 'battery' },
  { t: 'Tyre change', d: 'Spare or patch', icon: 'tire' },
  { t: 'Other help', d: 'Fuel, lockout, key', icon: 'chat' },
];
const PROVIDERS = [
  { name: 'Addis Tow 24/7', eta: '14 min', price: '1,800–2,400', type: 'Flatbed truck' },
  { name: 'Lebu Roadside Crew', eta: '22 min', price: '1,500–2,000', type: 'Hook truck' },
];

export default function Roadside() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { session } = useAuth();
  const [sel, setSel] = useState(0);
  const [vehicle, setVehicle] = useState('Toyota Vitz 2014 · AA-3-12345');
  const [loading, setLoading] = useState(false);

  async function request() {
    setLoading(true);
    const { error } = await supabase.from('roadside_requests').insert({
      user_id: session!.user.id,
      type: OPTS[sel].t,
      location: 'Ring Road, near Lebu',
      vehicle,
      status: 'requested',
    });
    setLoading(false);
    if (error) return toast(error.message);
    toast('Assistance requested — help is on the way');
    router.replace('/(tabs)');
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.ground }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }}>
      <View style={{ paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
          <Icon name="chevL" size={18} color={colors.ink2} />
        </Pressable>
        <Text style={styles.h1}>Roadside assistance</Text>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <View style={styles.locBar}>
          <Icon name="pin" size={18} color={colors.terra} strokeWidth={2} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12.5, color: colors.ink, fontWeight: '600' }}>Ring Road, near Lebu</Text>
            <Text style={{ fontSize: 11, color: colors.muted }}>Location shared · accurate to 12 m</Text>
          </View>
          <Text style={{ fontSize: 11.5, color: colors.muted, fontWeight: '600' }}>Update</Text>
        </View>

        <Text style={styles.h2}>What do you need?</Text>
        <View style={styles.grid}>
          {OPTS.map((o, i) => {
            const on = sel === i;
            const bg = o.dark ? colors.surface : colors.card;
            const ink = o.dark ? '#fff' : colors.ink;
            return (
              <Pressable key={o.t} onPress={() => setSel(i)} style={[styles.opt, { backgroundColor: bg, borderColor: on ? colors.forest : colors.line2, borderWidth: on ? 2 : 1 }]}>
                <View style={[styles.optIcon, { backgroundColor: o.dark ? 'rgba(253,253,251,0.16)' : colors.forestTint }]}>
                  <Icon name={o.icon} size={20} color={o.dark ? colors.ground : colors.forest} strokeWidth={2} />
                </View>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: ink }}>{o.t}</Text>
                  <Text style={{ fontSize: 11, color: ink, opacity: 0.7 }}>{o.d}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.h2}>Vehicle</Text>
        <View style={styles.inputWrap}>
          <Icon name="car" size={18} color={colors.faint} />
          <TextInput value={vehicle} onChangeText={setVehicle} accessibilityLabel="Vehicle" style={{ flex: 1, fontSize: 13.5, color: colors.ink, padding: 0 }} />
        </View>

        <Text style={styles.h2}>Available providers</Text>
        <View style={{ gap: 10 }}>
          {PROVIDERS.map((p) => (
            <View key={p.name} style={styles.provider}>
              <View style={styles.provIcon}><Icon name="truck" size={20} color={colors.terraD} strokeWidth={2} /></View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13.5, fontWeight: '600', color: colors.ink }}>{p.name}</Text>
                <Text style={{ fontSize: 11, color: colors.muted }}>{p.type} · {p.price} ETB</Text>
              </View>
              <View style={styles.etaPill}>
                <Icon name="clock" size={11} color={colors.forest} strokeWidth={2.2} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.ink }}>{p.eta}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 18 }}>
          <PrimaryButton label="Request assistance" onPress={request} loading={loading} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  back: { width: 40, height: 40, borderRadius: 13, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  h1: { fontSize: 22, fontWeight: '700', color: colors.ink, letterSpacing: -0.5 },
  h2: { marginTop: 20, marginBottom: 12, fontSize: 16, fontWeight: '700', color: colors.ink },
  locBar: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 15, paddingHorizontal: 14, paddingVertical: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  opt: { width: '47%', flexGrow: 1, borderRadius: 18, padding: 15, gap: 10 },
  optIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 13, paddingHorizontal: 13, height: 48 },
  provider: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, borderRadius: 16, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12 },
  provIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.terraTint, alignItems: 'center', justifyContent: 'center' },
  etaPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.forestTint, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 },
});
