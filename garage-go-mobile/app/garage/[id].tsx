import React, { useEffect, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView, TextInput, Modal, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../lib/theme';
import { Icon } from '../../lib/icons';
import { GarageThumb, Tag } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../components/toast';
import { mockPayWithTelebirr, TELEBIRR_NUMBERS } from '../../lib/utils';

type Garage = { id: string; name: string; area: string; rating: number; reviews_count: number; hours: string; tags: string[] };
type Service = { id: string; name: string; description: string | null; price: number; duration: string | null };

const DAYS = [['Mon', '15'], ['Tue', '16'], ['Wed', '17'], ['Thu', '18'], ['Fri', '19'], ['Sat', '20']];
const SLOTS = ['08:30', '10:00', '11:30', '14:00', '15:30', '17:00'];

export default function GarageProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { session } = useAuth();

  const [garage, setGarage] = useState<Garage | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [service, setService] = useState(1);
  const [day, setDay] = useState(2);
  const [slot, setSlot] = useState(1);
  const [vehicle, setVehicle] = useState('Toyota Vitz 2014 · AA-3-12345');
  const [problem, setProblem] = useState('');
  const [sheet, setSheet] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.from('garages').select('*').eq('id', id).single().then(({ data }) => setGarage(data as Garage));
    supabase.from('services').select('*').eq('garage_id', id).order('price').then(({ data }) => setServices((data as Service[]) ?? []));
  }, [id]);

  async function pay(index: number) {
    const tb = TELEBIRR_NUMBERS[index];
    setPaying(true);
    // 1) Mock the Telebirr charge (resolves after ~1s).
    const result = await mockPayWithTelebirr(tb.number, tb.owner, 100);
    // 2) Persist a real booking row.
    const { data: booking, error: bErr } = await supabase
      .from('bookings')
      .insert({
        user_id: session!.user.id,
        garage_id: id,
        service_id: services[service]?.id ?? null,
        booking_date: new Date().toISOString().slice(0, 10),
        slot: SLOTS[slot],
        vehicle,
        problem,
        status: 'confirmed',
      })
      .select()
      .single();

    if (bErr || !booking) {
      setPaying(false);
      return toast(bErr?.message ?? 'Could not save booking');
    }

    // 3) Persist the payment row (50/50 split lives on the booking).
    await supabase.from('payments').insert({
      booking_id: booking.id,
      user_id: session!.user.id,
      method: 'telebirr',
      telebirr_number: tb.number,
      telebirr_owner: tb.owner,
      amount: 100,
      status: 'success',
    });

    setPaying(false);
    setSheet(false);
    toast('Reservation confirmed!');
    router.push({
      pathname: '/confirmation',
      params: {
        code: booking.booking_code,
        garage: garage?.name ?? '',
        service: services[service]?.name ?? '',
        slot: SLOTS[slot],
        vehicle,
        telebirr: tb.number,
        ref: result.reference,
      },
    });
  }

  if (!garage) {
    return <View style={{ flex: 1, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={colors.forest} /></View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
        <View style={{ height: 210 }}>
          <GarageThumb width="100%" height={210} seed={0} />
          <View style={[styles.topBar, { top: insets.top + 8 }]}>
            <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.circleBtn}>
              <Icon name="chevL" size={18} color={colors.ink2} />
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Save garage" onPress={() => toast('Saved to your garages')} style={styles.circleBtn}>
              <Icon name="heart" size={18} color={colors.terra} />
            </Pressable>
          </View>
        </View>

        <View style={styles.sheetTop}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.h1}>{garage.name}</Text>
                <Icon name="shield" size={16} color={colors.forest} strokeWidth={2} />
              </View>
              <Text style={{ marginTop: 5, fontSize: 12, color: colors.muted }}>{garage.area} · {garage.hours}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="star" size={14} color={colors.terra} />
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.ink }}>{garage.rating}</Text>
              </View>
              <Text style={{ fontSize: 11, color: colors.faint }}>{garage.reviews_count} reviews</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }} contentContainerStyle={{ gap: 7 }}>
            {(garage.tags ?? []).concat(['Warranty']).map((t) => <Tag key={t} label={t} />)}
          </ScrollView>

          {/* Service */}
          <Text style={styles.h2}>Choose a service</Text>
          <View style={{ gap: 9 }}>
            {services.map((s, i) => {
              const on = service === i;
              return (
                <Pressable key={s.id} onPress={() => setService(i)} style={[styles.serviceRow, { borderColor: on ? colors.forest : colors.line, backgroundColor: on ? colors.forestTint2 : colors.card }]}>
                  <View style={[styles.radio, { borderColor: on ? colors.forest : '#CBC2AC', backgroundColor: on ? colors.forest : colors.card }]}>
                    {on ? <Icon name="check" size={12} color="#fff" strokeWidth={3} /> : null}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.ink }}>{s.name}</Text>
                    {s.duration ? <Text style={{ fontSize: 11, color: colors.muted }}>{s.duration}{s.description ? ' · ' + s.description : ''}</Text> : null}
                  </View>
                  <Text style={{ fontSize: 12.5, fontWeight: '700', color: colors.ink }}>{s.price} ETB</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Date */}
          <Text style={styles.h2}>Pick a date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {DAYS.map(([d, n], i) => {
              const on = day === i;
              return (
                <Pressable key={n} onPress={() => setDay(i)} style={[styles.day, { borderColor: on ? colors.ink : colors.line2, backgroundColor: on ? colors.ink : colors.card }]}>
                  <Text style={{ fontSize: 10.5, color: on ? '#B7AE90' : colors.faint }}>{d}</Text>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: on ? '#fff' : colors.ink }}>{n}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Slot */}
          <Text style={styles.h2}>Time slot</Text>
          <View style={styles.slotGrid}>
            {SLOTS.map((t, i) => {
              const off = i === 3;
              const on = slot === i && !off;
              return (
                <Pressable key={t} disabled={off} onPress={() => setSlot(i)}
                  style={[styles.slot, { borderColor: on ? colors.forest : colors.line2, backgroundColor: on ? colors.forestTint : off ? '#EFE9DC' : colors.card }]}>
                  <Text style={{ fontSize: 12.5, fontWeight: '600', color: on ? colors.forest : off ? '#B9B19C' : colors.ink2 }}>{t}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Vehicle + problem */}
          <Text style={styles.h2}>Vehicle & problem</Text>
          <View style={{ gap: 10 }}>
            <View style={styles.inputWrap}>
              <Icon name="car" size={18} color={colors.faint} />
              <TextInput value={vehicle} onChangeText={setVehicle} accessibilityLabel="Vehicle" style={{ flex: 1, fontSize: 13.5, color: colors.ink, padding: 0 }} />
            </View>
            <TextInput value={problem} onChangeText={setProblem} placeholder="Describe the problem (optional)" placeholderTextColor={colors.faint}
              accessibilityLabel="Describe the problem" multiline style={styles.textarea} />
          </View>
        </View>
      </ScrollView>

      {/* Sticky pay bar */}
      <View style={[styles.payBar, { paddingBottom: insets.bottom + 14 }]}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: colors.muted }}>Reservation fee</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.ink }}>100 ETB</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Pay 100 ETB reservation fee" onPress={() => setSheet(true)} style={styles.payBtn}>
          <Text style={{ color: '#fff', fontSize: 14.5, fontWeight: '700' }}>Pay 100 ETB</Text>
        </Pressable>
      </View>

      {/* Telebirr pay sheet */}
      <Modal visible={sheet} transparent animationType="slide" onRequestClose={() => !paying && setSheet(false)}>
        <Pressable style={styles.backdrop} onPress={() => !paying && setSheet(false)} />
        <View style={[styles.paySheet, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.grabber} />
          {paying ? (
            <View style={{ alignItems: 'center', paddingVertical: 26, gap: 14 }}>
              <ActivityIndicator size="large" color={colors.terra} />
              <Text style={{ color: colors.muted, fontSize: 13 }}>Confirming with Telebirr…</Text>
            </View>
          ) : (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={styles.tbLogo}><Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>T</Text></View>
                <View>
                  <Text style={{ fontSize: 17, fontWeight: '700', color: colors.ink }}>Pay with Telebirr</Text>
                  <Text style={{ fontSize: 12, color: colors.muted }}>100 ETB reservation fee</Text>
                </View>
              </View>
              <View style={{ marginTop: 14, gap: 10 }}>
                {TELEBIRR_NUMBERS.map((t, i) => (
                  <Pressable key={t.number} accessibilityRole="button" accessibilityLabel={`Pay with Telebirr ${t.number}`} onPress={() => pay(i)} style={styles.tbRow}>
                    <View style={styles.tbIcon}><Icon name="phone" size={18} color={colors.terraD} strokeWidth={2} /></View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.ink }}>{t.number}</Text>
                      <Text style={{ fontSize: 11.5, color: colors.muted }}>{t.owner} · {t.label}</Text>
                    </View>
                    <Icon name="chevR" size={16} color={colors.forest} />
                  </Pressable>
                ))}
              </View>
              <Text style={styles.mockNote}>Mock payment — no real transaction is made.</Text>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  circleBtn: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  sheetTop: { marginTop: -26, backgroundColor: colors.ground, borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 16, paddingTop: 20 },
  h1: { fontSize: 21, fontWeight: '700', color: colors.ink },
  h2: { marginTop: 20, marginBottom: 10, fontSize: 15, fontWeight: '700', color: colors.ink },
  serviceRow: { borderWidth: 1, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 11 },
  radio: { width: 20, height: 20, borderRadius: 999, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  day: { width: 52, height: 60, borderWidth: 1, borderRadius: 13, alignItems: 'center', justifyContent: 'center', gap: 2 },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: { width: '31%', flexGrow: 1, height: 40, borderWidth: 1, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 13, paddingHorizontal: 13, height: 48 },
  textarea: { borderWidth: 1, borderColor: colors.line, borderRadius: 13, padding: 11, minHeight: 60, fontSize: 13, color: colors.ink, backgroundColor: colors.card, textAlignVertical: 'top' },
  payBar: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.ground, borderTopWidth: 1, borderTopColor: colors.line, paddingHorizontal: 16, paddingTop: 13, flexDirection: 'row', alignItems: 'center', gap: 12 },
  payBtn: { backgroundColor: colors.forest, borderRadius: 14, height: 52, paddingHorizontal: 26, alignItems: 'center', justifyContent: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(30,26,20,0.5)' },
  paySheet: { backgroundColor: colors.ground, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 18 },
  grabber: { width: 40, height: 5, borderRadius: 999, backgroundColor: '#D6CBB2', alignSelf: 'center', marginBottom: 14 },
  tbLogo: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.terra, alignItems: 'center', justifyContent: 'center' },
  tbRow: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, borderRadius: 15, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12 },
  tbIcon: { width: 40, height: 40, borderRadius: 11, backgroundColor: colors.terraTint, alignItems: 'center', justifyContent: 'center' },
  mockNote: { marginTop: 14, textAlign: 'center', fontSize: 11, color: colors.faint },
});
