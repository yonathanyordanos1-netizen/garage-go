import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/theme-context';
import { useToast } from '../components/toast';
import { Button, Field, OtpInput, SegmentedControl, Separator, IconButton } from '../components/ui';
import { Icon } from '../lib/icons';
import { signInWithPassword, signInWithOtp, verifyOtp } from '../lib/supabase';
import * as haptics from '../lib/haptics';

export default function SignIn() {
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  const [tab, setTab] = useState(0); // 0 = Email, 1 = Phone
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const fullPhone = () => '+251' + phone.replace(/[^0-9]/g, '');

  async function emailSignIn() {
    if (!email || !password) return toast.error('Enter your email and password');
    setBusy(true);
    const { error } = await signInWithPassword(email.trim(), password);
    setBusy(false);
    if (error) return toast.error(error.message);
    haptics.success();
    router.replace('/(tabs)');
  }
  async function sendCode() {
    if (phone.replace(/[^0-9]/g, '').length < 9) return toast.error('Enter a valid phone number');
    setBusy(true);
    const { error } = await signInWithOtp(fullPhone());
    setBusy(false);
    if (error) return toast.error(error.message);
    setOtpSent(true);
    toast.success('Code sent to ' + fullPhone());
  }
  async function verify() {
    setBusy(true);
    const { error } = await verifyOtp(fullPhone(), otp);
    setBusy(false);
    if (error) return toast.error(error.message);
    haptics.success();
    router.replace('/(tabs)');
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
      <Text style={{ fontSize: 26, fontWeight: '800', color: colors.ink, letterSpacing: -0.5, marginTop: 16 }}>Welcome back</Text>
      <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>Sign in to your Garage Go account</Text>

      <View style={{ marginTop: 24 }}>
        <SegmentedControl options={['Email', 'Phone OTP']} index={tab} onChange={(i) => { setTab(i); setOtpSent(false); }} />
      </View>

      {tab === 0 ? (
        <View style={{ marginTop: 20, gap: 14 }}>
          <Field label="Email" icon="mail" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Field label="Password" icon="lock" placeholder="••••••••" value={password} onChangeText={setPassword} secure />
          <Button label="Sign in" iconRight="arrowR" onPress={emailSignIn} loading={busy} />
          <Pressable onPress={() => toast.info('Password reset coming soon')} style={{ alignSelf: 'center' }}>
            <Text style={{ fontSize: 12.5, fontWeight: '600', color: colors.accent }}>Forgot password?</Text>
          </Pressable>
        </View>
      ) : (
        <View style={{ marginTop: 20, gap: 14 }}>
          {!otpSent ? (
            <>
              <Field label="Phone number" icon="phone" prefix="+251" placeholder="9•• •• •• ••" value={phone} onChangeText={setPhone} keyboardType="number-pad" description="We'll text you a one-time code to verify it's you." />
              <Button label="Send code" onPress={sendCode} loading={busy} />
            </>
          ) : (
            <>
              <Text style={{ fontSize: 12.5, fontWeight: '600', color: colors.ink2 }}>Verification code</Text>
              <OtpInput value={otp} onChange={setOtp} />
              <Text style={{ fontSize: 12, color: colors.muted }}>
                Sent to <Text style={{ color: colors.ink, fontWeight: '600' }}>{fullPhone()}</Text>.{' '}
                <Text onPress={sendCode} style={{ color: colors.accent, fontWeight: '700' }}>Resend</Text>
              </Text>
              <Button label="Verify & sign in" iconRight="arrowR" onPress={verify} loading={busy} disabled={otp.length < 6} />
            </>
          )}
        </View>
      )}

      <Separator label="or continue with" style={{ marginTop: 24 }} />
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
        <View style={{ flex: 1 }}><Button label="Google" variant="outline" onPress={() => toast.info('Google sign-in coming soon')} /></View>
        <View style={{ flex: 1 }}><Button label="Apple" icon="apple" variant="outline" onPress={() => toast.info('Apple sign-in coming soon')} /></View>
      </View>

      <Text style={{ textAlign: 'center', fontSize: 13, color: colors.muted, marginTop: 24 }}>
        Don't have an account?{' '}
        <Text onPress={() => router.push('/sign-up')} style={{ fontWeight: '700', color: colors.ink }}>Sign up</Text>
      </Text>
    </ScrollView>
  );
}
