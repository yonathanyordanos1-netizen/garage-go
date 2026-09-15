import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/theme-context';
import { Card, Badge, EmptyState, IconButton } from '../components/ui';
import { Thumb } from '../components/thumb';
import { Icon } from '../lib/icons';
import { useData } from '../lib/data';
import { getSaved } from '../lib/store';
import { formatETB } from '../lib/utils';

export default function Saved() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { garages } = useData();
  const [ids, setIds] = useState<string[]>([]);

  useFocusEffect(useCallback(() => { getSaved().then(setIds); }, []));
  const list = garages.filter((g) => ids.includes(g.id));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.ground }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <IconButton icon="chevL" onPress={() => router.back()} />
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.ink }}>Saved garages</Text>
      </View>

      {list.length === 0 ? (
        <EmptyState icon="heart" title="No saved garages" description="Tap the heart on a garage to save it for later." action={{ label: 'Browse garages', onPress: () => router.push('/(tabs)/search') }} />
      ) : (
        <View style={{ gap: 12, marginTop: 16 }}>
          {list.map((g, i) => (
            <Card key={g.id} variant="interactive" onPress={() => router.push(`/garage/${g.id}`)}>
              <View style={{ flexDirection: 'row', padding: 12, gap: 12, alignItems: 'center' }}>
                <Thumb width={72} height={72} seed={i} radius={12} icon="garage" />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.ink }}>{g.name}</Text>
                    {g.verified && <Icon name="shield" size={12} color={colors.forest} strokeWidth={2} />}
                  </View>
                  <Text style={{ fontSize: 11.5, color: colors.muted, marginTop: 3 }}>{g.area}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 7 }}>
                    <Icon name="star" size={12} color="#C29B74" />
                    <Text style={{ fontSize: 11.5, color: colors.ink }}>{g.rating}</Text>
                    <Badge label={`From ${formatETB(g.price_from)}`} variant="secondary" />
                  </View>
                </View>
                <Icon name="chevR" size={18} color={colors.faint} />
              </View>
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
