import React, { useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth, OwnerRole } from '../../lib/auth';
import { useTheme } from '../../lib/theme-context';
import { Icon, IconName } from '../../lib/icons';
import { shadows } from '../../lib/theme';
import { initStore } from '../../lib/owner';
import * as haptics from '../../lib/haptics';

// Per-role tab config. `listings` and `jobs` are shared screen files whose label
// and visibility depend on the role — mechanics have no catalog, sellers have
// no job queue.
type TabMeta = { icon: IconName; label: string };
function tabsFor(role: OwnerRole): Record<string, TabMeta | undefined> {
  const base: Record<string, TabMeta | undefined> = {
    index: { icon: 'home', label: 'Overview' },
    jobs: role === 'seller' ? undefined : { icon: 'clipboard', label: 'Jobs' },
    listings:
      role === 'mechanic' ? undefined :
      role === 'seller' ? { icon: 'box', label: 'Listings' } :
      { icon: 'wrench', label: 'Services' },
    profile: { icon: 'user', label: 'Profile' },
  };
  return base;
}

function TabButton({ focused, meta, onPress }: { focused: boolean; meta: TabMeta; onPress: () => void }) {
  const { colors } = useTheme();
  const v = useSharedValue(focused ? 1 : 0);
  useEffect(() => { v.value = withTiming(focused ? 1 : 0, { duration: 180 }); }, [focused]);
  const pill = useAnimatedStyle(() => ({ opacity: v.value, transform: [{ scale: 0.6 + v.value * 0.4 }] }));
  const tint = focused ? colors.ink : colors.muted;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={meta.label}
      onPress={onPress}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 6 }}
    >
      <View style={{ width: 48, height: 28, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={[{ position: 'absolute', width: 48, height: 28, borderRadius: 14, backgroundColor: colors.forestTint }, pill]} />
        <Icon name={meta.icon} size={22} color={tint} strokeWidth={focused ? 2.2 : 1.9} />
      </View>
      <Text style={{ fontSize: 10, fontWeight: focused ? '700' : '600', color: tint }}>{meta.label}</Text>
    </Pressable>
  );
}

type TabBarProps = { state: { index: number; routes: { key: string; name: string }[] }; navigation: any };
function FloatingTabBar({ state, navigation, role }: TabBarProps & { role: OwnerRole }) {
  const { colors, mode } = useTheme();
  const insets = useSafeAreaInsets();
  const meta = tabsFor(role);
  return (
    <View style={{ position: 'absolute', left: 20, right: 20, bottom: insets.bottom + 10 }}>
      <BlurView
        intensity={60}
        tint={mode === 'dark' ? 'systemMaterialDark' : 'systemMaterialLight'}
        style={{
          flexDirection: 'row', height: 64, borderRadius: 22, overflow: 'hidden',
          borderWidth: 1, borderColor: colors.line,
          backgroundColor: mode === 'dark' ? 'rgba(36,30,24,0.72)' : 'rgba(253,253,251,0.82)',
          ...shadows.lg,
        }}
      >
        {state.routes.map((route, i) => {
          const m = meta[route.name];
          if (!m) return null; // hidden for this role — keep index aligned with null
          const focused = state.index === i;
          const onPress = () => {
            haptics.select();
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          return <TabButton key={route.key} focused={focused} meta={m} onPress={onPress} />;
        })}
      </BlurView>
    </View>
  );
}

export default function TabsLayout() {
  const { authed, loading, role } = useAuth();
  const { colors } = useTheme();

  useEffect(() => { if (authed) initStore(role); }, [authed, role]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  if (!authed) return <Redirect href="/welcome" />;

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <FloatingTabBar {...props} role={role} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="jobs" />
      <Tabs.Screen name="listings" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
