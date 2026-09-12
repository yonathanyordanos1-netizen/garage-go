import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../lib/theme';
import { Icon } from '../lib/icons';
import { Field, PasswordField, PhoneField, PrimaryButton } from '../components/ui';
import { SocialAuth } from '../components/social';
import { useToast } from '../components/toast';
import { signInWithPassword, signInWithOtp, verifyOtp } from '../lib/supabase';

export default function SignIn() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [tab, setTab] = useState(0); // 0 email, 1 phone
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleEmail() {
    if (!email || !password) return toast('Enter your email and password');
    setLoading(true);
    const { error } = await signInWithPassword(email.trim(), password);
    setLoading(false);
    if (error) return toast(error.message);
    router.replace('/(tabs)');
  }

  async function handleSendOtp() {
    const full = '+251' + phone.replace(/\D/g, '').replace(/^0/, '');
    setLoading(true);
    const { error } = await signInWithOtp(full);
    setLoading(false);
    if (error) return toast(error.message);
    setOtpSent(true);
    toast('Code sent to ' + full);
  }
  async function handleVerifyOtp() {
    const full = '+251' + phone.replace(/\D/g, '').replace(/^0/, '');
    setLoading(true);
    const { error } = await verifyOtp(full, otp.trim());
    setLoading(false);
    if (error) return toast(error.message);
    router.replace('/(tabs)');
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.ground }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 22, paddingBottom: insets.bottom + 30 }}
      keyboardShouldPersistTaps="handled">
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
        <Icon name="chevL" size={18} color={colors.ink2} />
      </Pressable>

      <View style={{ marginTop: 22, flexDirection: 'row', alignItems: 'center', gap: 11 }}>
        <View style={styles.logo}><Icon name="wrench" size={22} color={colors.ground} strokeWidth={2} /></View>
        <View>
          <Text style={styles.h1}>Sign in</Text>
          <Text style={styles.subtle}>Welcome back to Garage Go</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {['Email & password', 'Phone OTP'].map((t, i) => (
          <Pressable key={t} accessibilityRole="button" accessibilityLabel={`Sign in with ${t}`} onPress={() => setTab(i)}
            style={[styles.tab, tab === i && styles.tabOn]}>
            <Text style={{ fontSize: 12.5, fontWeight: '600', color: tab === i ? colors.ink : colors.muted }}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ marginTop: 18, gap: 12 }}>
        {tab === 0 ? (
          <>
            <Field label="Email" icon="mail" accessibilityLabel="Sign in with email" placeholder="dawit@email.com"
              autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
            <PasswordField label="Password" accessibilityLabel="Password input" placeholder="••••••••" value={password} onChangeText={setPassword} />
          </>
        ) : (
          <>
            <View style={{ gap: 6 }}>
              <Text style={styles.fieldLabel}>Phone number</Text>
              <PhoneField value={phone} onChangeText={setPhone} accessibilityLabel="Sign in with phone" />
            </View>
            {otpSent && (
              <Field label="6-digit code" icon="lock" accessibilityLabel="OTP code" placeholder="••••••"
                keyboardType="number-pad" value={otp} onChangeText={setOtp} />
            )}
            <Text style={styles.subtle}>We'll text you a 6-digit code to sign in.</Text>
          </>
        )}
      </View>

      <View style={{ marginTop: 18 }}>
        {tab === 0 ? (
          <PrimaryButton label="Sign in" onPress={handleEmail} loading={loading} />
        ) : otpSent ? (
          <PrimaryButton label="Verify & sign in" onPress={handleVerifyOtp} loading={loading} />
        ) : (
          <PrimaryButton label="Send code" onPress={handleSendOtp} loading={loading} />
        )}
      </View>

      <SocialAuth onGoogle={() => toast('Enable Google in Supabase Auth to use this')} onApple={() => toast('Enable Apple in Supabase Auth to use this')} />

      <Text style={styles.footer}>
        New to Garage Go?{' '}
        <Text style={styles.link} onPress={() => router.replace('/sign-up')}>Create an account</Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  back: { width: 40, height: 40, borderRadius: 13, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' },
  h1: { fontSize: 23, fontWeight: '800', color: colors.ink, letterSpacing: -0.4 },
  subtle: { marginTop: 2, fontSize: 12.5, color: colors.muted },
  fieldLabel: { fontSize: 11.5, fontWeight: '600', color: colors.ink2 },
  tabs: { marginTop: 22, flexDirection: 'row', gap: 4, backgroundColor: '#EBDFC6', borderRadius: 13, padding: 4 },
  tab: { flex: 1, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tabOn: { backgroundColor: colors.card },
  footer: { marginTop: 22, textAlign: 'center', fontSize: 13, color: colors.muted },
  link: { fontWeight: '700', color: colors.forest },
});
