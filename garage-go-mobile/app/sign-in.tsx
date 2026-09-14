import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/theme-context';
import { useToast } from '../components/toast';
import { Button, Field, OtpInput, IconButton } from '../components/ui';
import { Icon } from '../lib/icons';
import { otpSend, otpVerify, otpMessage, DEV_OTP } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import * as haptics from '../lib/haptics';

export default function SignIn() {
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();
  const { demoSignIn } = useAuth();
  const insets = useSafeAreaInsets();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const digits = phone.replace(/\D/g, '');
  const fullPhone = '+251' + digits; // must match ^\+251\d{9}$ (no spaces)

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  function startCooldown(seconds: number) {
    setCooldown(seconds);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) { if (timer.current) clearInterval(timer.current); return 0; }
        return s - 1;
      });
    }, 1000);
  }

  async function sendCode() {
    if (digits.length !== 9) return toast.error('Enter a valid Ethiopian number (+251 then 9 digits).');
    if (DEV_OTP) {
      setOtpSent(true); setOtp(''); startCooldown(60);
      return toast.success('Dev mode — enter any 6 digits');
    }
    setSending(true);
    const r = await otpSend(fullPhone);
    setSending(false);
    if (!r.ok) return toast.error(otpMessage(r.error, { retryAfter: r.retryAfter }));
    setOtpSent(true);
    setOtp('');
    startCooldown(r.resendIn);
    toast.success('Code sent to ' + fullPhone);
  }

  async function verify() {
    if (otp.length < 6) return toast.error('Enter the 6-digit code.');
    if (DEV_OTP) {
      await demoSignIn(fullPhone);
      haptics.success();
      return router.replace('/(tabs)');
    }
    setVerifying(true);
    const r = await otpVerify(fullPhone, otp);
    setVerifying(false);
    if (!r.ok) {
      if (r.error === 'expired' || r.error === 'too_many_attempts') setOtp('');
      return toast.error(otpMessage(r.error, { attemptsLeft: r.attemptsLeft }));
    }
    haptics.success();
    router.replace('/(tabs)'); // onAuthStateChange has set the session
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
      <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>Sign in with your phone number</Text>

      <View style={{ marginTop: 26, gap: 14 }}>
        {!otpSent ? (
          <>
            <Field label="Phone number" icon="phone" prefix="+251" placeholder="9•• •• •• ••" value={phone} onChangeText={setPhone} keyboardType="number-pad" description="We'll text you a one-time code to verify it's you." />
            <Button label="Send code" onPress={sendCode} loading={sending} disabled={digits.length !== 9} />
          </>
        ) : (
          <>
            <Text style={{ fontSize: 12.5, fontWeight: '600', color: colors.ink2 }}>Verification code</Text>
            <OtpInput value={otp} onChange={setOtp} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: colors.muted, flex: 1 }}>
                Sent to <Text style={{ color: colors.ink, fontWeight: '600' }}>{fullPhone}</Text>
              </Text>
              {cooldown > 0 ? (
                <Text style={{ fontSize: 12, color: colors.faint }}>Resend in {cooldown}s</Text>
              ) : (
                <Pressable onPress={sendCode} disabled={sending}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: colors.accent }}>Resend code</Text>
                </Pressable>
              )}
            </View>
            <Button label="Verify & sign in" iconRight="arrowR" onPress={verify} loading={verifying} disabled={otp.length < 6} />
            <Pressable onPress={() => { setOtpSent(false); setOtp(''); }} style={{ alignSelf: 'center' }}>
              <Text style={{ fontSize: 12.5, color: colors.muted }}>Change number</Text>
            </Pressable>
          </>
        )}
      </View>

      <Text style={{ textAlign: 'center', fontSize: 13, color: colors.muted, marginTop: 28 }}>
        Don't have an account?{' '}
        <Text onPress={() => router.push('/sign-up')} style={{ fontWeight: '700', color: colors.ink }}>Sign up</Text>
      </Text>
    </ScrollView>
  );
}
