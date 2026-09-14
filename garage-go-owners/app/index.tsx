import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../lib/auth';
import { useTheme } from '../lib/theme-context';

// Entry gate: wait for the session + theme to hydrate, then send the operator
// to the console (if signed in) or the welcome screen.
export default function Index() {
  const { authed, loading } = useAuth();
  const { colors, ready } = useTheme();

  if (loading || !ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.ground }}>
        <ActivityIndicator color={colors.forest} />
      </View>
    );
  }
  return <Redirect href={authed ? '/(tabs)' : '/welcome'} />;
}
