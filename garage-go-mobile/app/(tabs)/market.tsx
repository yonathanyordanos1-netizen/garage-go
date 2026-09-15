import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../lib/theme-context';
import { Card, Badge, EmptyState, radius } from '../../components/ui';
import { Thumb } from '../../components/thumb';
import { Icon } from '../../lib/icons';
import { useData } from '../../lib/data';
import { formatETB } from '../../lib/utils';
import * as haptics from '../../lib/haptics';

const CATS = ['All', 'Car parts', 'Tyres', 'Oils', 'Accessories', 'Tools'];

export default function Market() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { products } = useData();
  const [cat, setCat] = useState(0);

  const list = useMemo(() => cat === 0 ? products : products.filter((p) => p.category === CATS[cat]), [products, cat]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.ground }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.ink, letterSpacing: -0.5 }}>Marketplace</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: 14, height: 48, marginTop: 14 }}>
          <Icon name="search" size={18} color={colors.faint} />
          <Text style={{ flex: 1, fontSize: 13.5, color: colors.faint }}>Search parts, tyres, oils, tools</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 12 }}>
          {CATS.map((c, i) => {
            const on = cat === i;
            return (
              <Pressable key={c} onPress={() => { haptics.select(); setCat(i); }} style={{ height: 34, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: on ? colors.ink : colors.line2, backgroundColor: on ? colors.ink : colors.card, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: on ? colors.ground : colors.ink2 }}>{c}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {list.length === 0 ? (
        <EmptyState icon="bag" title="No products here yet" description="Car parts and accessories will appear as sellers add them." />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginTop: 16 }}>
          {list.map((p, i) => (
            <View key={p.id} style={{ width: '50%', padding: 4 }}>
              <Card variant="interactive" onPress={() => router.push(`/product/${p.id}`)}>
                <View style={{ height: 128, position: 'relative' }}>
                  <Thumb width="100%" height={128} seed={i + 2} icon="bag" />
                  {p.tag && <View style={{ position: 'absolute', top: 8, left: 8 }}><Badge label={p.tag} variant="default" /></View>}
                </View>
                <View style={{ padding: 12 }}>
                  <Text numberOfLines={2} style={{ fontSize: 13, fontWeight: '600', color: colors.ink, lineHeight: 17, minHeight: 34 }}>{p.name}</Text>
                  <Text style={{ fontSize: 10.5, color: colors.muted, marginTop: 4 }}>{p.category}</Text>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: colors.forest, marginTop: 7 }}>{formatETB(p.price)}</Text>
                </View>
              </Card>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
