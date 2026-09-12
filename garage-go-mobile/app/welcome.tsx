import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../lib/theme';
import { Icon } from '../lib/icons';

export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#20361A', '#2D4F1E', '#3D6329']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 20 }]}
    >
      <View style={{ alignItems: 'flex-end' }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Skip onboarding" onPress={() => router.replace('/(tabs)')} hitSlop={8}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <View style={{ alignItems: 'center', marginTop: 22 }}>
        <View style={styles.emblem}>
          <View style={styles.emblemOuter} />
          <View style={styles.emblemInner} />
          <Icon name="wrench" size={36} color={colors.ground} strokeWidth={2} />
        </View>
        <Text style={styles.title}>Welcome to{'\n'}Garage Go</Text>
        <Text style={styles.sub}>
          On-demand garages, mechanics and roadside help across Ethiopia — verified,
          transparent, one tap away.
        </Text>
        <View style={styles.trustRow}>
          {[['shield', 'Verified'], ['birr', 'Flat 100 ETB'], ['bolt', '24/7']].map(([ic, t]) => (
            <View key={t} style={styles.trust}>
              <Icon name={ic as any} size={14} color={colors.terra} strokeWidth={2} />
              <Text style={styles.trustText}>{t}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ marginTop: 'auto' }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Get started"
          onPress={() => router.push('/get-started')}
          style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.9 : 1 }]}
        >
          <Text style={styles.ctaText}>Get started</Text>
        </Pressable>
        <Text style={styles.footer}>
          Already have an account?{' '}
          <Text style={styles.link} onPress={() => router.push('/sign-in')}>Sign in</Text>
        </Text>
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.dot, { width: i === 0 ? 18 : 6, backgroundColor: i === 0 ? colors.terra : 'rgba(245,230,204,0.28)' }]} />
          ))}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 22 },
  skip: { fontSize: 13, fontWeight: '600', color: '#C9BE9E', padding: 6 },
  emblem: { width: 100, height: 100, alignItems: 'center', justifyContent: 'center' },
  emblemOuter: { position: 'absolute', width: 100, height: 100, borderRadius: 32, backgroundColor: 'rgba(245,230,204,0.06)', borderWidth: 1, borderColor: 'rgba(245,230,204,0.16)' },
  emblemInner: { position: 'absolute', width: 70, height: 70, borderRadius: 24, backgroundColor: 'rgba(226,125,96,0.16)', borderWidth: 1, borderColor: 'rgba(226,125,96,0.4)' },
  title: { marginTop: 26, textAlign: 'center', fontSize: 31, fontWeight: '800', color: colors.ground, letterSpacing: -0.6, lineHeight: 34 },
  sub: { marginTop: 13, textAlign: 'center', fontSize: 14, lineHeight: 21, color: '#CDC3A6', maxWidth: 290 },
  trustRow: { marginTop: 18, flexDirection: 'row', gap: 16 },
  trust: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  trustText: { color: '#B7AE90', fontSize: 11.5, fontWeight: '500' },
  cta: { height: 54, borderRadius: 16, backgroundColor: colors.terra, alignItems: 'center', justifyContent: 'center' },
  ctaText: { fontSize: 15, fontWeight: '700', color: '#3A1D12' },
  footer: { marginTop: 16, textAlign: 'center', fontSize: 13, color: '#C9BE9E' },
  link: { fontWeight: '700', color: colors.ground },
  dots: { marginTop: 18, flexDirection: 'row', gap: 6, justifyContent: 'center' },
  dot: { height: 6, borderRadius: 999 },
});
