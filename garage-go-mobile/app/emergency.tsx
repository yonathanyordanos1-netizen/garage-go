import React from 'react';
import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/theme-context';
import { useToast } from '../components/toast';
import { Card, Badge, Button, IconButton, radius } from '../components/ui';
import { Icon } from '../lib/icons';
import { useData } from '../lib/data';

export default function Emergency() {
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { mechanics } = useData();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.ground }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <IconButton icon="chevL" onPress={() => router.back()} />
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.ink }}>Emergency mechanic</Text>
      </View>

      <View style={{ backgroundColor: colors.espresso, borderRadius: radius.xl, padding: 20, marginTop: 16, overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error }} />
          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.onEspresso, letterSpacing: 0.5 }}>STRANDED?</Text>
        </View>
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.onEspresso, marginTop: 8, lineHeight: 25 }}>I need a mechanic{'\n'}now</Text>
        <Text style={{ fontSize: 12.5, color: colors.onEspressoMuted, marginTop: 8, maxWidth: 240 }}>Share your location and we'll dispatch the nearest verified mechanic.</Text>
        <Pressable onPress={() => toast.info('Locating nearby mechanics…')} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', marginTop: 14, height: 46, paddingHorizontal: 18, borderRadius: radius.md, backgroundColor: colors.onEspresso }}>
          <Icon name="pin" size={17} color={colors.espresso} strokeWidth={2} />
          <Text style={{ fontSize: 13.5, fontWeight: '700', color: colors.espresso }}>Locate me & dispatch</Text>
        </Pressable>
      </View>

      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink, marginTop: 22, marginBottom: 12 }}>Verified mechanics nearby</Text>
      <View style={{ gap: 11 }}>
        {mechanics.map((m) => (
          <Card key={m.id}>
            <View style={{ padding: 13 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
                <View style={{ width: 46, height: 46, borderRadius: 13, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: colors.onPrimary, fontWeight: '700', fontSize: 16 }}>{m.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.ink }}>{m.name}</Text>
                    {m.verified && <Icon name="shield" size={13} color={colors.forest} strokeWidth={2} />}
                  </View>
                  <Text style={{ fontSize: 11.5, color: colors.muted, marginTop: 2 }}>{m.area} · {m.experience}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Icon name="star" size={12} color="#C29B74" />
                    <Text style={{ fontSize: 11.5, fontWeight: '600', color: colors.ink }}>{m.rating}</Text>
                  </View>
                </View>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginTop: 10 }}>
                {m.tags.map((t) => <Badge key={t} label={t} variant="outline" />)}
              </ScrollView>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 11 }}>
                <View style={{ flex: 1 }}>
                  <Button label="Request now" size="sm" onPress={() => toast.success(`Requesting ${m.name}…`)} />
                </View>
                {m.phone && <IconButton icon="phone" onPress={() => Linking.openURL('tel:' + m.phone)} label={`Call ${m.name}`} />}
              </View>
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
