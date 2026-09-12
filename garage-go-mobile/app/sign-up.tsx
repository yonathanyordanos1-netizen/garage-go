import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../lib/theme';
import { Icon } from '../lib/icons';
import { Field, PasswordField, PhoneField, PrimaryButton } from '../components/ui';
import { SocialAuth } from '../components/social';
import { useToast } from '../components/toast';
import { signUp } from '../lib/supabase';

export default function SignUp() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    if (!name || !email || !password) return toast('Fill in name, email and password');
    if (password.length < 8) return toast('Password must be at least 8 characters');
    setLoading(true);
    const fullPhone = phone ? '+251' + phone.replace(/\D/g, '').replace(/^0/, '') : '';
    const { data, error } = await signUp(email.trim(), password, {
      full_name: name.trim(),
      phone: fullPhone,
      role: 'customer',
    });
    setLoading(false);
    if (error) return toast(error.message);
    // If email confirmation is ON, there is no session yet.
    if (!data.session) {
      toast('Check your email to confirm your account');
      router.replace('/sign-in');
      return;
    }
    router.replace('/(tabs)');
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.ground }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 22, paddingBottom: insets.bottom + 30 }}
      keyboardShouldPersistTaps="handled">
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
        <Icon name="chevL" size={18} color={colors.ink2} />
      </Pressable>

      <Text style={styles.h1}>Create your account</Text>
      <Text style={styles.subtle}>Join Garage Go in under a minute.</Text>

      <View style={{ marginTop: 20, gap: 12 }}>
        <Field label="Full name" icon="user" accessibilityLabel="Full name input" placeholder="Dawit Mekonnen" value={name} onChangeText={setName} />
        <Field label="Email" icon="mail" accessibilityLabel="Email input" placeholder="dawit@email.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <View style={{ gap: 6 }}>
          <Text style={styles.fieldLabel}>Phone <Text style={{ color: colors.faint, fontWeight: '400' }}>(optional)</Text></Text>
          <PhoneField value={phone} onChangeText={setPhone} accessibilityLabel="Phone input" />
        </View>
        <PasswordField label="Password" accessibilityLabel="Password input" placeholder="At least 8 characters" value={password} onChangeText={setPassword} />
      </View>

      <View style={{ marginTop: 18 }}>
        <PrimaryButton label="Sign up" onPress={handleSignUp} loading={loading} />
      </View>

      <SocialAuth onGoogle={() => toast('Enable Google in Supabase Auth to use this')} onApple={() => toast('Enable Apple in Supabase Auth to use this')} />

      <Text style={styles.footer}>
        Already have an account?{' '}
        <Text style={styles.link} onPress={() => router.replace('/sign-in')}>Sign in</Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  back: { width: 40, height: 40, borderRadius: 13, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  h1: { marginTop: 22, fontSize: 23, fontWeight: '800', color: colors.ink, letterSpacing: -0.4 },
  subtle: { marginTop: 3, fontSize: 12.5, color: colors.muted },
  fieldLabel: { fontSize: 11.5, fontWeight: '600', color: colors.ink2 },
  footer: { marginTop: 22, textAlign: 'center', fontSize: 13, color: colors.muted },
  link: { fontWeight: '700', color: colors.ink },
});
