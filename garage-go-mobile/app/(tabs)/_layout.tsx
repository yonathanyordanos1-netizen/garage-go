import React, { useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';
import { useTheme } from '../../lib/theme-context';
import { Icon, IconName } from '../../lib/icons';
import { shadows } from '../../lib/theme';
import * as haptics from '../../lib/haptics';

const TABS: Record<string, { icon: IconName; label: string }> = {
  index: { icon: 'home', label: 'Home' },
  search: { icon: 'garage', label: 'Garages' },
  market: { icon: 'bag', label: 'Market' },
  profile: { icon: 'user', label: 'Profile' },
};

function TabButton({ focused, meta, onPress }: { focused: boolean; meta: { icon: IconName; label: string }; onPress: () => void }) {
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
function FloatingTabBar({ state, navigation }: TabBarProps) {
  const { colors, mode } = useTheme();
  const insets = useSafeAreaInsets();
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
          const meta = TABS[route.name];
          if (!meta) return null;
          const focused = state.index === i;
          const onPress = () => {
            haptics.select();
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          return <TabButton key={route.key} focused={focused} meta={meta} onPress={onPress} />;
        })}
      </BlurView>
    </View>
  );
}

export default function TabsLayout() {
  const { authed, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  if (!authed) return <Redirect href="/welcome" />;

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <FloatingTabBar {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="market" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
