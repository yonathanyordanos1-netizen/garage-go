import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../lib/theme';
import { Icon } from '../../lib/icons';
import { GarageThumb } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/toast';

type Product = { id: string; name: string; category: string; price: number; seller: string; seller_phone: string; tag: string | null };
const CATS = ['All', 'Car parts', 'Tyres', 'Oils', 'Accessories', 'Tools'];

export default function Market() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    supabase.from('products').select('*').order('created_at').then(({ data }) => setProducts((data as Product[]) ?? []));
  }, []);

  function contactSeller() {
    const p = products[0];
    if (p?.seller_phone) {
      Linking.openURL('tel:' + p.seller_phone.replace(/\s/g, '')).catch(() => toast('Opening chat with seller…'));
    } else toast('Opening chat with seller…');
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 24 }}>
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={styles.h1}>Marketplace</Text>
          <View style={styles.searchBar}>
            <Icon name="search" size={18} color={colors.faint} />
            <TextInput placeholder="Search parts, tyres, oils, tools" placeholderTextColor={colors.faint}
              accessibilityLabel="Search parts" style={{ flex: 1, fontSize: 13.5, color: colors.ink, padding: 0 }} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }} contentContainerStyle={{ gap: 8 }}>
            {CATS.map((c, i) => (
              <View key={c} style={[styles.chip, { backgroundColor: i === 0 ? colors.ink : colors.card, borderColor: i === 0 ? colors.ink : colors.line2 }]}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: i === 0 ? '#fff' : colors.ink2 }}>{c}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.grid}>
          {products.map((p, i) => (
            <View key={p.id} style={styles.card}>
              <View style={{ height: 96 }}>
                <GarageThumb width="100%" height={96} seed={i + 1} />
                {p.tag ? (
                  <View style={styles.tag}><Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>{p.tag}</Text></View>
                ) : null}
              </View>
              <View style={{ padding: 12 }}>
                <Text numberOfLines={2} style={{ fontSize: 12.5, fontWeight: '600', color: colors.ink }}>{p.name}</Text>
                <Text style={{ marginTop: 4, fontSize: 10.5, color: colors.muted }}>{p.category}</Text>
                <Text style={{ marginTop: 7, fontSize: 14, fontWeight: '800', color: colors.forest }}>{p.price.toLocaleString()} ETB</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Pressable accessibilityRole="button" accessibilityLabel="Contact seller" onPress={contactSeller} style={[styles.fab, { bottom: insets.bottom + 16 }]}>
        <Icon name="chat" size={19} color={colors.ground} strokeWidth={2} />
        <Text style={{ color: colors.ground, fontSize: 13.5, fontWeight: '700' }}>Contact seller</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 24, fontWeight: '700', color: colors.ink, letterSpacing: -0.5 },
  searchBar: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 15, paddingHorizontal: 14, height: 48 },
  chip: { borderWidth: 1, borderRadius: 999, height: 34, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  grid: { paddingHorizontal: 16, paddingTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%', flexGrow: 1, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, borderRadius: 18, overflow: 'hidden' },
  tag: { position: 'absolute', top: 8, left: 8, backgroundColor: colors.terra, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  fab: { position: 'absolute', right: 18, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: colors.forest, borderRadius: 16, height: 52, paddingHorizontal: 20, shadowColor: colors.forest, shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
});
