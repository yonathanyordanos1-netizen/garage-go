import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../lib/auth';
import { colors } from '../lib/theme';

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.terra} size="large" />
      </View>
    );
  }

  // Signed in → main tabs; otherwise → onboarding.
  return <Redirect href={session ? '/(tabs)' : '/welcome'} />;
}
