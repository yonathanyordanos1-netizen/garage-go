import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/theme-context';
import { useToast } from '../components/toast';
import { useAuth } from '../lib/auth';
import { Button, Field, OtpInput, IconButton } from '../components/ui';
import { Icon } from '../lib/icons';
import * as haptics from '../lib/haptics';

export default function SignUp() {
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();
  const { demoSignIn } = useAuth();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const fullPhone = () => '+251 ' + phone.replace(/[^0-9]/g, '');

  function sendCode() {
    if (!name.trim()) return toast.error('Enter your full name');
    if (phone.replace(/[^0-9]/g, '').length < 9) return toast.error('Enter a valid phone number');
    setOtpSent(true);
    toast.success('Code sent to ' + fullPhone());
  }
  async function verify() {
    if (otp.length < 6) return toast.error('Enter the 6-digit code');
    setBusy(true);
    await demoSignIn(fullPhone(), name.trim());
    haptics.success();
    setBusy(false);
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
      <Text style={{ fontSize: 26, fontWeight: '800', color: colors.ink, letterSpacing: -0.5, marginTop: 16 }}>Create account</Text>
      <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>Join Garage Go with your phone number</Text>

      <View style={{ marginTop: 24, gap: 14 }}>
        {!otpSent ? (
          <>
            <Field label="Full name" icon="user" placeholder="Dawit Mekonnen" value={name} onChangeText={setName} />
            <Field label="Phone number" icon="phone" prefix="+251" placeholder="9•• •• •• ••" value={phone} onChangeText={setPhone} keyboardType="number-pad" description="We'll text you a one-time code to verify your number." />
            <Button label="Send code" onPress={sendCode} />
          </>
        ) : (
          <>
            <Text style={{ fontSize: 12.5, fontWeight: '600', color: colors.ink2 }}>Verification code</Text>
            <OtpInput value={otp} onChange={setOtp} />
            <Text style={{ fontSize: 12, color: colors.muted }}>
              Sent to <Text style={{ color: colors.ink, fontWeight: '600' }}>{fullPhone()}</Text>.{' '}
              <Text onPress={sendCode} style={{ color: colors.accent, fontWeight: '700' }}>Resend</Text>
            </Text>
            <Button label="Create account" iconRight="arrowR" onPress={verify} loading={busy} disabled={otp.length < 6} />
            <Text style={{ fontSize: 11.5, color: colors.faint, textAlign: 'center' }}>Demo: enter any 6 digits to continue.</Text>
          </>
        )}
      </View>

      <Text style={{ textAlign: 'center', fontSize: 13, color: colors.muted, marginTop: 28 }}>
        Already have an account?{' '}
        <Text onPress={() => router.replace('/sign-in')} style={{ fontWeight: '700', color: colors.ink }}>Sign in</Text>
      </Text>
    </ScrollView>
  );
}
