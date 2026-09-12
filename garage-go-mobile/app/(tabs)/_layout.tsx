import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../../lib/auth';
import { colors } from '../../lib/theme';
import { Icon, IconName } from '../../lib/icons';

export default function TabsLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.forest} />
      </View>
    );
  }
  // Protect the whole tab group — no session, back to onboarding.
  if (!session) return <Redirect href="/welcome" />;

  const tab = (name: IconName, label: string) => ({
    title: label,
    tabBarIcon: ({ color }: { color: string }) => <Icon name={name} size={22} color={color} strokeWidth={2} />,
  });

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.forest,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.ground,
          borderTopColor: colors.line,
          height: 64,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={tab('home', 'Home')} />
      <Tabs.Screen name="search" options={tab('car', 'Garages')} />
      <Tabs.Screen name="market" options={tab('bag', 'Market')} />
      <Tabs.Screen name="profile" options={tab('user', 'Profile')} />
    </Tabs>
  );
}
