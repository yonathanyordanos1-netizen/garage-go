import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../lib/theme-context';
import { useToast } from '../../components/toast';
import { useAuth } from '../../lib/auth';
import { Badge, Button, StepIndicator, IconButton, Separator, radius } from '../../components/ui';
import { Sheet } from '../../components/sheet';
import { Thumb } from '../../components/thumb';
import { Icon } from '../../lib/icons';
import { garages, services, timeSlots, primaryVehicle } from '../../lib/data';
import { generateBookingId, mockPayWithTelebirr, TELEBIRR_NUMBERS } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { addBooking, toggleSaved, getSaved } from '../../lib/store';
import * as haptics from '../../lib/haptics';

function nextDays(n: number) {
  const out: { label: string; date: number; today: boolean; key: string }[] = [];
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now); d.setDate(now.getDate() + i);
    out.push({ label: wd[d.getDay()], date: d.getDate(), today: i === 0, key: d.toISOString().slice(0, 10) });
  }
  return out;
}

export default function GarageDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();
  const { session } = useAuth();
  const insets = useSafeAreaInsets();

  const g = garages.find((x) => x.id === id) ?? garages[0];
  const days = nextDays(14);

  const [svc, setSvc] = useState(0);
  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [paying, setPaying] = useState(false);

  const step = slot != null ? 2 : 1;

  useEffect(() => { getSaved().then((ids) => setSaved(ids.includes(g.id))); }, [g.id]);
  async function onToggleSave() { haptics.select(); setSaved(await toggleSaved(g.id)); }

  async function confirmPay() {
    setPaying(true);
    haptics.tap();
    const chosen = TELEBIRR_NUMBERS[0];
    await mockPayWithTelebirr(chosen.number, chosen.owner, 100);
    const code = generateBookingId();
    const slotLabel = `${days[day].label} ${days[day].date} · ${timeSlots[slot ?? 0]}`;
    // Persist locally (works in dev mode / offline; source of truth for the UI).
    await addBooking({
      code, garage: g.name, service: services[svc].n, slot: slotLabel,
      vehicle: `${primaryVehicle.make} ${primaryVehicle.model} ${primaryVehicle.year}`,
      status: 'upcoming', fee: 100, createdAt: Date.now(),
    });
    // Best-effort write to Supabase (won't block the UX if the table/policy differs).
    try {
      if (session?.user) {
        const { data: b } = await supabase.from('bookings').insert({
          user_id: session.user.id, garage_name: g.name, service: services[svc].n,
          slot: `${days[day].label} ${days[day].date} · ${timeSlots[slot ?? 0]}`,
          fee: 100, platform_share: 50, garage_share: 50, code, status: 'confirmed',
        }).select().single();
        if (b?.id) {
          await supabase.from('payments').insert({ booking_id: b.id, user_id: session.user.id, method: 'telebirr', amount: 100, status: 'success', number: chosen.number });
        }
      }
    } catch {}
    setPaying(false);
    setPayOpen(false);
    haptics.success();
    toast.success('Reservation confirmed!');
    router.replace({
      pathname: '/confirmation',
      params: { code, garage: g.name, service: services[svc].n, slot: `${days[day].label} ${days[day].date} · ${timeSlots[slot ?? 0]}`, number: chosen.number },
    });
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        <View style={{ height: 220 }}>
          <Thumb width="100%" height={220} seed={0} icon="garage" />
          <View style={{ position: 'absolute', top: insets.top + 8, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
            <IconButton icon="chevL" onPress={() => router.back()} />
            <IconButton icon="heart" tint={saved ? colors.error : colors.ink2} onPress={onToggleSave} />
          </View>
        </View>

        <View style={{ backgroundColor: colors.ground, borderTopLeftRadius: 26, borderTopRightRadius: 26, marginTop: -26, padding: 16 }}>
          <StepIndicator steps={['Service', 'Schedule', 'Confirm']} current={step} />

          <View style={{ flexDirection: 'row', marginTop: 20 }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 21, fontWeight: '700', color: colors.ink }}>{g.name}</Text>
                <Icon name="shield" size={16} color={colors.forest} strokeWidth={2} />
              </View>
              <Text style={{ fontSize: 12, color: colors.muted, marginTop: 5 }}>{g.area} · {g.dist} · {g.hours}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="star" size={14} color="#C29B74" />
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.ink }}>{g.rating}</Text>
              </View>
              <Text style={{ fontSize: 11, color: colors.faint }}>{g.reviews} reviews</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7, marginTop: 12 }}>
            {[...new Set([...g.tags, 'AC', 'Warranty'])].map((t, i) => <Badge key={`${t}-${i}`} label={t} variant="secondary" />)}
          </ScrollView>

          {/* Service selection */}
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.ink, marginTop: 22, marginBottom: 10 }}>Choose a service</Text>
          <View style={{ gap: 9 }}>
            {services.map((s, i) => {
              const on = svc === i;
              return (
                <Pressable key={s.n} onPress={() => { haptics.select(); setSvc(i); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 11, padding: 13, borderRadius: radius.md, borderWidth: 1, borderColor: on ? colors.forest : colors.line, backgroundColor: on ? colors.forestTint : colors.card }}>
                  <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: on ? colors.forest : colors.line2, alignItems: 'center', justifyContent: 'center' }}>
                    {on && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.forest }} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.ink }}>{s.n}</Text>
                    <Text style={{ fontSize: 11, color: colors.muted }}>{s.d}</Text>
                  </View>
                  <Text style={{ fontSize: 12.5, fontWeight: '700', color: colors.ink }}>{s.p} ETB</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Date */}
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.ink, marginTop: 22, marginBottom: 10 }}>Pick a date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {days.map((d, i) => {
              const on = day === i;
              return (
                <Pressable key={d.key} onPress={() => { haptics.select(); setDay(i); }} style={{ width: 56, height: 68, borderRadius: radius.md, borderWidth: 1, borderColor: on ? colors.forest : colors.line2, backgroundColor: on ? colors.forest : colors.card, alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                  <Text style={{ fontSize: 10.5, color: on ? colors.onPrimary : colors.muted }}>{d.label}</Text>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: on ? colors.onPrimary : colors.ink }}>{d.date}</Text>
                  {d.today && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: on ? colors.onPrimary : colors.accent }} />}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Time */}
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.ink, marginTop: 22, marginBottom: 10 }}>Time slot</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {timeSlots.map((t, i) => {
              const off = i === 3;
              const on = slot === i && !off;
              return (
                <Pressable key={t} disabled={off} onPress={() => { haptics.select(); setSlot(i); }} style={{ width: '31.5%', height: 44, borderRadius: radius.sm, borderWidth: 1, borderColor: on ? colors.forest : colors.line2, backgroundColor: on ? colors.forestTint : off ? colors.surface : colors.card, alignItems: 'center', justifyContent: 'center', opacity: off ? 0.5 : 1 }}>
                  <Text style={{ fontSize: 12.5, fontWeight: '600', color: on ? colors.forest : off ? colors.faint : colors.ink2, textDecorationLine: off ? 'line-through' : 'none' }}>{t}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Vehicle */}
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.ink, marginTop: 22, marginBottom: 10 }}>Vehicle</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="car" size={20} color={colors.ink2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13.5, fontWeight: '700', color: colors.ink }}>{primaryVehicle.make} {primaryVehicle.model} {primaryVehicle.year}</Text>
              <Text style={{ fontSize: 11.5, color: colors.muted }}>{primaryVehicle.plate}</Text>
            </View>
            <Badge label="Primary" variant="secondary" />
          </View>
        </View>
      </ScrollView>

      {/* Sticky bar */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 13, paddingBottom: insets.bottom + 14, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.line }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: colors.muted }}>Reservation fee</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.ink }}>100 ETB</Text>
        </View>
        <View style={{ flex: 1.4 }}>
          <Button label={slot == null ? 'Pick a time' : 'Continue'} disabled={slot == null} iconRight="arrowR" onPress={() => setPayOpen(true)} />
        </View>
      </View>

      {/* Payment sheet */}
      <Sheet open={payOpen} onClose={() => setPayOpen(false)} snapPoints={['62%']} title="Complete payment" description="Pay via Telebirr to confirm your booking">
        <View style={{ alignItems: 'center', paddingVertical: 6 }}>
          <Text style={{ fontSize: 32, fontWeight: '800', color: colors.ink }}>100 ETB</Text>
          <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>Reservation fee · 50 platform / 50 garage</Text>
        </View>
        <Separator style={{ marginVertical: 16 }} />
        <Text style={{ fontSize: 12, fontWeight: '600', color: colors.ink2, marginBottom: 10 }}>Pay to</Text>
        <View style={{ gap: 8 }}>
          {TELEBIRR_NUMBERS.map((t) => (
            <View key={t.number} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card }}>
              <View style={{ width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.forestTint, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="phone" size={18} color={colors.forest} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.ink }}>{t.number}</Text>
                <Text style={{ fontSize: 11.5, color: colors.muted }}>{t.owner} · {t.label}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={{ marginTop: 20 }}>
          <Button label={paying ? 'Processing…' : 'Confirm & pay'} loading={paying} onPress={confirmPay} />
        </View>
        <Text style={{ fontSize: 11, color: colors.faint, textAlign: 'center', marginTop: 12 }}>Mock payment — no real transaction is made.</Text>
      </Sheet>
    </View>
  );
}
