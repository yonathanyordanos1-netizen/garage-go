import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../lib/auth';
import { useTheme } from '../lib/theme-context';

export default function Index() {
  const { session, loading } = useAuth();
  const { colors, ready } = useTheme();

  if (loading || !ready) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  // Signed in → main tabs; otherwise → onboarding (3-step guide).
  return <Redirect href={session ? '/(tabs)' : '/welcome'} />;
}
