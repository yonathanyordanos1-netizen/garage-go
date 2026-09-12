import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';
import { colors } from '../../lib/theme';
import { Icon, IconName } from '../../lib/icons';

// Route → icon + label. Order is preserved: Home · Garages · Market · Profile.
const TABS: Record<string, { icon: IconName; label: string }> = {
  index: { icon: 'home', label: 'Home' },
  search: { icon: 'garage', label: 'Garages' },
  market: { icon: 'bag', label: 'Market' },
  profile: { icon: 'user', label: 'Profile' },
};

const INACTIVE = 'rgba(58,42,29,0.55)'; // Raw Umber @ 55%

function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, i) => {
        const meta = TABS[route.name];
        if (!meta) return null;
        const focused = state.index === i;
        const tint = focused ? colors.forest : INACTIVE; // sand when active

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={meta.label}
            onPress={onPress}
            style={styles.tab}
            hitSlop={8}
          >
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Icon name={meta.icon} size={23} color={tint} strokeWidth={focused ? 2.2 : 1.9} />
            </View>
            <Text style={[styles.label, { color: tint, fontWeight: focused ? '700' : '600' }]}>
              {meta.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.forest} />
      </View>
    );
  }
  if (!session) return <Redirect href="/welcome" />;

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="market" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.ground, // Warm Bone White
    borderTopWidth: 1,
    borderTopColor: 'rgba(58,42,29,0.10)', // subtle warm hairline
    paddingTop: 10,
    paddingHorizontal: 8,
    // shadow-lg equivalent, cast upward
    shadowColor: '#3A2A1D',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -3 },
    elevation: 16,
  },
  tab: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 2 },
  iconWrap: {
    width: 52,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(194,155,116,0.16)', // Muted Sand wash behind the active icon
  },
  label: { fontSize: 11, letterSpacing: 0.1 },
});
