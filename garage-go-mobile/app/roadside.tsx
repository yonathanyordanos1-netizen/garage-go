import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/theme-context';
import { useToast } from '../components/toast';
import { Card, Badge, Button, IconButton, radius } from '../components/ui';
import { Icon, IconName } from '../lib/icons';
import { providers } from '../lib/data';
import * as haptics from '../lib/haptics';

const OPTS: { t: string; d: string; icon: IconName }[] = [
  { t: 'Towing', d: 'Flatbed or hook', icon: 'truck' },
  { t: 'Battery jump', d: 'Jump or replace', icon: 'battery' },
  { t: 'Tyre change', d: 'Spare or patch', icon: 'tire' },
  { t: 'Other help', d: 'Fuel, lockout, key', icon: 'chat' },
];

export default function Roadside() {
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const [road, setRoad] = useState(0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.ground }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <IconButton icon="chevL" onPress={() => router.back()} />
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.ink }}>Roadside assistance</Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: 12, marginTop: 16 }}>
        <Icon name="pin" size={18} color={colors.accent} strokeWidth={2} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12.5, fontWeight: '600', color: colors.ink }}>Ring Road, near Lebu</Text>
          <Text style={{ fontSize: 11, color: colors.muted, marginTop: 1 }}>Location shared · accurate to 12 m</Text>
        </View>
        <Text style={{ fontSize: 11.5, fontWeight: '600', color: colors.forest }}>Update</Text>
      </View>

      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink, marginTop: 20, marginBottom: 12 }}>What do you need?</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {OPTS.map((o, i) => {
          const on = road === i;
          return (
            <Pressable key={o.t} onPress={() => { haptics.select(); setRoad(i); }} style={{ width: '47.8%', padding: 15, borderRadius: radius.lg, borderWidth: 1, borderColor: on ? colors.forest : colors.line2, backgroundColor: on ? colors.forestTint : colors.card, gap: 10 }}>
              <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: on ? colors.forest : colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={o.icon} size={20} color={on ? colors.onPrimary : colors.ink2} strokeWidth={2} />
              </View>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.ink }}>{o.t}</Text>
                <Text style={{ fontSize: 11, color: colors.muted, marginTop: 1 }}>{o.d}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Text style={{ fontSize: 15, fontWeight: '700', color: colors.ink, marginTop: 22, marginBottom: 12 }}>Available providers</Text>
      <View style={{ gap: 10 }}>
        {providers.map((p) => (
          <Card key={p.name}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13 }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.forestTint, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="truck" size={20} color={colors.forest} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13.5, fontWeight: '700', color: colors.ink }}>{p.name}</Text>
                <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>{p.type} · {p.price} ETB</Text>
              </View>
              <Badge label={p.eta} variant="secondary" icon="clock" />
            </View>
          </Card>
        ))}
      </View>

      <View style={{ marginTop: 20 }}>
        <Button label="Request assistance" iconRight="arrowR" onPress={() => { toast.success('Provider on the way'); router.replace('/(tabs)'); }} />
      </View>
    </ScrollView>
  );
}
