import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/theme-context';
import { useToast } from '../components/toast';
import { Button, Field, Separator, IconButton } from '../components/ui';
import { Icon } from '../lib/icons';
import { signUp } from '../lib/supabase';
import * as haptics from '../lib/haptics';

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}

export default function SignUp() {
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const score = strength(password);
  const labels = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const scoreColors = [colors.error, colors.error, colors.warning, colors.warning, colors.success];

  async function submit() {
    if (!name.trim()) return toast.error('Enter your full name');
    if (!email.trim()) return toast.error('Enter your email');
    if (password.length < 8) return toast.error('Password must be at least 8 characters');
    if (password !== confirm) return toast.error('Passwords do not match');
    setBusy(true);
    const { data, error } = await signUp(email.trim(), password, { full_name: name.trim(), role: 'customer' });
    setBusy(false);
    if (error) return toast.error(error.message);
    haptics.success();
    if (data.session) {
      router.replace('/(tabs)');
    } else {
      toast.success('Check your email to confirm your account');
      router.replace('/sign-in');
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.ground }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24, paddingHorizontal: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <IconButton icon="chevL" onPress={() => router.back()} label="Back" />

      <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center', marginTop: 22 }}>
        <Icon name="wrench" size={26} color={colors.onPrimary} strokeWidth={2} />
      </View>
      <Text style={{ fontSize: 26, fontWeight: '800', color: colors.ink, letterSpacing: -0.5, marginTop: 16 }}>Create account</Text>
      <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>Join Garage Go — book garages instantly</Text>

      <View style={{ marginTop: 22, gap: 14 }}>
        <Field label="Full name" icon="user" placeholder="Dawit Mekonnen" value={name} onChangeText={setName} />
        <Field label="Email" icon="mail" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <View>
          <Field label="Password" icon="lock" placeholder="At least 8 characters" value={password} onChangeText={setPassword} secure />
          {password.length > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <View style={{ flex: 1, flexDirection: 'row', gap: 4 }}>
                {[0, 1, 2, 3].map((i) => (
                  <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < score ? scoreColors[score] : colors.line }} />
                ))}
              </View>
              <Text style={{ fontSize: 10.5, fontWeight: '600', color: scoreColors[score], width: 44, textAlign: 'right' }}>{labels[score]}</Text>
            </View>
          )}
        </View>
        <Field label="Confirm password" icon="lock" placeholder="Re-enter password" value={confirm} onChangeText={setConfirm} secure error={confirm.length > 0 && confirm !== password ? 'Passwords do not match' : undefined} />
        <Button label="Create account" iconRight="arrowR" onPress={submit} loading={busy} />
      </View>

      <Separator label="or continue with" style={{ marginTop: 24 }} />
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
        <View style={{ flex: 1 }}><Button label="Google" variant="outline" onPress={() => toast.info('Google sign-in coming soon')} /></View>
        <View style={{ flex: 1 }}><Button label="Apple" icon="apple" variant="outline" onPress={() => toast.info('Apple sign-in coming soon')} /></View>
      </View>

      <Text style={{ textAlign: 'center', fontSize: 13, color: colors.muted, marginTop: 24 }}>
        Already have an account?{' '}
        <Text onPress={() => router.replace('/sign-in')} style={{ fontWeight: '700', color: colors.ink }}>Sign in</Text>
      </Text>
    </ScrollView>
  );
}
