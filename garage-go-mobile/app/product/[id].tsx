import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../lib/theme-context';
import { useToast } from '../../components/toast';
import { Badge, Separator, Avatar, Button, radius } from '../../components/ui';
import { Thumb } from '../../components/thumb';
import { Icon } from '../../lib/icons';
import { useData } from '../../lib/data';
import { formatETB } from '../../lib/utils';
import * as haptics from '../../lib/haptics';

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { products } = useData();
  const [saved, setSaved] = useState(false);
  const p = products.find((x) => x.id === id) ?? products[0];

  if (!p) return null;

  const floatBtn = { width: 40, height: 40, borderRadius: radius.md, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' } as const;

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={{ height: 300 }}>
          <Thumb width="100%" height={300} seed={5} icon="bag" />
          <View style={{ position: 'absolute', top: insets.top + 8, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Pressable onPress={() => router.back()} style={floatBtn}><Icon name="chevL" size={18} color="#3A2A1D" /></Pressable>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable onPress={() => toast.info('Share coming soon')} style={floatBtn}><Icon name="share" size={17} color="#3A2A1D" /></Pressable>
              <Pressable onPress={() => { haptics.select(); setSaved((s) => !s); }} style={floatBtn}>
                <Icon name="heart" size={18} color={saved ? '#DC2626' : '#3A2A1D'} />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -24, padding: 20 }}>
          {p.category && <Badge label={p.category} variant="secondary" />}
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.ink, letterSpacing: -0.3, marginTop: 10 }}>{p.name}</Text>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.forest, marginTop: 8 }}>{formatETB(p.price)}</Text>

          <Separator style={{ marginVertical: 18 }} />

          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.muted, letterSpacing: 0.5 }}>SELLER</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 }}>
            <Avatar name={p.seller ?? 'Seller'} size="md" />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.ink }}>{p.seller}</Text>
                <Icon name="shield" size={13} color={colors.forest} strokeWidth={2} />
              </View>
            </View>
          </View>

          <Separator style={{ marginVertical: 18 }} />

          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.muted, letterSpacing: 0.5 }}>DESCRIPTION</Text>
          <Text style={{ fontSize: 13.5, lineHeight: 22, color: colors.ink2, marginTop: 8 }}>
            Genuine {p.name} — {p.category}. Sourced and inspected by {p.seller}. Fits most models in this class; message the seller to confirm compatibility with your vehicle before you buy.
          </Text>
        </View>
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 12, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.line }}>
        <View style={{ flex: 1 }}>
          <Button label="Call" icon="phone" variant="outline" onPress={() => { if (p.seller_phone) Linking.openURL('tel:' + p.seller_phone); }} />
        </View>
        <View style={{ flex: 1.6 }}>
          <Button label="Chat with seller" icon="chat" onPress={() => router.push({ pathname: '/chat/[id]', params: { id: p.seller_phone ?? '', name: p.seller ?? '', product: p.name } })} />
        </View>
      </View>
    </View>
  );
}
