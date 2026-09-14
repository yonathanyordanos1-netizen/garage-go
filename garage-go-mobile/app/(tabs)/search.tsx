import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../lib/theme-context';
import { Card, Badge, EmptyState, StarRating, Button, Separator, radius } from '../../components/ui';
import { Sheet } from '../../components/sheet';
import { Thumb } from '../../components/thumb';
import { Icon } from '../../lib/icons';
import { garages } from '../../lib/data';
import * as haptics from '../../lib/haptics';

const CATS = ['All services', 'Engine', 'Tyres', 'Electrical', 'Body work', 'AC & cooling'];
const SORTS = ['Nearest', 'Top rated', 'Price: low', 'Price: high'];

export default function Search() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState('');
  const [cat, setCat] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState(0);
  const [minRating, setMinRating] = useState(0);
  const filtersActive = sort !== 0 || minRating > 0;

  const list = useMemo(() => {
    let g = [...garages];

    // Text search — matches against name, area, and tags
    const q = query.trim().toLowerCase();
    if (q.length > 0) {
      g = g.filter((x) =>
        x.name.toLowerCase().includes(q) ||
        x.area.toLowerCase().includes(q) ||
        x.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Category filter
    const map = ['', 'Engine', 'Tyres', 'Electrical', 'Body work', 'AC'];
    if (cat > 0) g = g.filter((x) => x.tags.some((t) => t.includes(map[cat])));

    // Rating filter
    if (minRating > 0) g = g.filter((x) => x.rating >= minRating);

    // Sorting
    if (sort === 1) g.sort((a, b) => b.rating - a.rating);
    else if (sort === 2) g.sort((a, b) => a.from - b.from);
    else if (sort === 3) g.sort((a, b) => b.from - a.from);
    return g;
  }, [query, cat, sort, minRating]);

  function clearAll() {
    setQuery('');
    setCat(0);
    setSort(0);
    setMinRating(0);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: colors.ink, letterSpacing: -0.5 }}>Find a garage</Text>

          {/* Real search input */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: 14, height: 48 }}>
              <Icon name="search" size={18} color={colors.accent} strokeWidth={2} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search garage, area, or service"
                placeholderTextColor={colors.faint}
                style={{ flex: 1, fontSize: 13.5, color: colors.ink, paddingVertical: 0 }}
                returnKeyType="search"
                autoCorrect={false}
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery('')} hitSlop={8}>
                  <Icon name="x" size={16} color={colors.faint} />
                </Pressable>
              )}
            </View>
            <Pressable
              onPress={() => setFilterOpen(true)}
              style={{ width: 48, height: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon name="sliders" size={18} color={colors.ink2} />
              {filtersActive && <View style={{ position: 'absolute', top: 9, right: 10, width: 7, height: 7, borderRadius: 4, backgroundColor: colors.forest }} />}
            </Pressable>
          </View>

          {/* Category chips */}
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

        {/* Results count + sort label */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 16 }}>
          <Text style={{ fontSize: 12.5, color: colors.muted }}>
            {list.length} garage{list.length !== 1 ? 's' : ''}{query ? ` for "${query}"` : ' nearby'}
          </Text>
          <Text style={{ fontSize: 12.5, fontWeight: '600', color: colors.forest }}>Sort: {SORTS[sort]}</Text>
        </View>

        {/* Results */}
        <View style={{ paddingHorizontal: 16, marginTop: 12, gap: 12 }}>
          {list.length === 0 ? (
            <EmptyState
              icon="search"
              title={query ? `No results for "${query}"` : 'No garages found'}
              description={query ? 'Try a different name, area, or service type.' : 'Try a different category or clear your filters.'}
              action={{ label: 'Clear all', onPress: clearAll }}
            />
          ) : list.map((g, i) => (
            <Card key={g.id} variant="interactive" onPress={() => router.push(`/garage/${g.id}`)}>
              <View style={{ flexDirection: 'row', padding: 12, gap: 12 }}>
                <Thumb width={82} height={82} seed={i} radius={12} icon="garage" />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.ink }}>{g.name}</Text>
                    <Icon name="shield" size={13} color={colors.forest} strokeWidth={2} />
                  </View>
                  <Text style={{ fontSize: 11.5, color: colors.muted, marginTop: 3 }}>{g.area} · {g.dist}</Text>
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                    <Badge label={g.tags[0]} variant="secondary" />
                    <Badge label={g.dist} variant="outline" />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Icon name="star" size={12} color="#C29B74" />
                      <Text style={{ fontSize: 11.5, fontWeight: '600', color: colors.ink }}>{g.rating}</Text>
                      <Text style={{ fontSize: 11, color: colors.faint }}>({g.reviews})</Text>
                    </View>
                    <Text style={{ fontSize: 11.5, fontWeight: '700', color: colors.forest }}>From {g.from} ETB</Text>
                  </View>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* Filter sheet */}
      <Sheet open={filterOpen} onClose={() => setFilterOpen(false)} snapPoints={['62%']} title="Filter garages" description={`${list.length} garages match`}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: colors.ink2, marginBottom: 10 }}>Sort by</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {SORTS.map((s, i) => {
            const on = sort === i;
            return (
              <Pressable key={s} onPress={() => { haptics.select(); setSort(i); }} style={{ height: 36, paddingHorizontal: 14, borderRadius: radius.md, borderWidth: 1, borderColor: on ? colors.forest : colors.line, backgroundColor: on ? colors.forest : colors.card, justifyContent: 'center' }}>
                <Text style={{ fontSize: 12.5, fontWeight: '600', color: on ? colors.onPrimary : colors.ink2 }}>{s}</Text>
              </Pressable>
            );
          })}
        </View>

        <Separator style={{ marginVertical: 18 }} />
        <Text style={{ fontSize: 12, fontWeight: '600', color: colors.ink2, marginBottom: 10 }}>Minimum rating</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <StarRating value={minRating} size={28} gap={6} onChange={(n) => setMinRating(n === minRating ? 0 : n)} />
          <Text style={{ fontSize: 12, color: colors.muted }}>{minRating > 0 ? `${minRating}+ stars` : 'Any'}</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 26 }}>
          <View style={{ flex: 1 }}><Button label="Reset" variant="ghost" onPress={() => { setSort(0); setMinRating(0); }} /></View>
          <View style={{ flex: 2 }}><Button label="Apply" onPress={() => setFilterOpen(false)} /></View>
        </View>
      </Sheet>
    </View>
  );
}
