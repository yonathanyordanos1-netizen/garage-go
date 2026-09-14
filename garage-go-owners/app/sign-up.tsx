import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/theme-context';
import { useToast } from '../components/toast';
import { Button, Field, OtpInput, IconButton } from '../components/ui';
import { Icon, IconName } from '../lib/icons';
import { otpSend, otpVerify, otpMessage, DEV_OTP } from '../lib/supabase';
import { useAuth, OwnerRole } from '../lib/auth';
import { radius } from '../lib/theme';
import * as haptics from '../lib/haptics';

const logo = require('../assets/logo.jpeg');

const ROLES: { key: OwnerRole; icon: IconName; title: string; body: string; nameLabel: string; namePlaceholder: string }[] = [
  { key: 'garage', icon: 'garage', title: 'Garage', body: 'Take service bookings, assign mechanics, get paid.', nameLabel: 'Garage name', namePlaceholder: 'e.g. Bole Auto Care' },
  { key: 'mechanic', icon: 'wrench', title: 'Mechanic', body: 'Receive jobs, mark them done, build your rating.', nameLabel: 'Your full name', namePlaceholder: 'e.g. Abebe Tesfaye' },
  { key: 'seller', icon: 'box', title: 'Parts seller', body: 'List parts, oils and tyres in the Garage Go market.', nameLabel: 'Shop name', namePlaceholder: 'e.g. Addis Auto Parts' },
];

export default function SignUp() {
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();
  const { demoSignIn } = useAuth();
  const insets = useSafeAreaInsets();

  const [role, setRole] = useState<OwnerRole>('garage');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const active = ROLES.find((r) => r.key === role)!;
  const digits = phone.replace(/\D/g, '');
  const fullPhone = '+251' + digits;

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  function startCooldown(seconds: number) {
    setCooldown(seconds);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setCooldown((s) => { if (s <= 1) { if (timer.current) clearInterval(timer.current); return 0; } return s - 1; });
    }, 1000);
  }

  async function sendCode() {
    if (!name.trim()) return toast.error(`Enter your ${active.nameLabel.toLowerCase()}.`);
    if (digits.length !== 9) return toast.error('Enter a valid Ethiopian number (+251 then 9 digits).');
    if (DEV_OTP) {
      setOtpSent(true); setOtp(''); startCooldown(60);
      return toast.success('Dev mode — enter any 6 digits');
    }
    setSending(true);
    const r = await otpSend(fullPhone);
    setSending(false);
    if (!r.ok) return toast.error(otpMessage(r.error, { retryAfter: r.retryAfter }));
    setOtpSent(true); setOtp(''); startCooldown(r.resendIn);
    toast.success('Code sent to ' + fullPhone);
  }

  async function verify() {
    if (otp.length < 6) return toast.error('Enter the 6-digit code.');
    if (DEV_OTP) {
      await demoSignIn({ phone: fullPhone, name: name.trim(), role, business: name.trim() });
      haptics.success();
      return router.replace('/(tabs)');
    }
    setVerifying(true);
    const r = await otpVerify(fullPhone, otp, name.trim());
    setVerifying(false);
    if (!r.ok) {
      if (r.error === 'expired' || r.error === 'too_many_attempts') setOtp('');
      return toast.error(otpMessage(r.error, { attemptsLeft: r.attemptsLeft }));
    }
    haptics.success();
    router.replace('/(tabs)');
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.ground }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24, paddingHorizontal: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <IconButton icon="chevL" onPress={() => (otpSent ? (setOtpSent(false), setOtp('')) : router.back())} label="Back" />

      {!otpSent ? (
        <>
          <Text style={{ fontSize: 26, fontWeight: '800', color: colors.ink, letterSpacing: -0.5, marginTop: 22 }}>Create your account</Text>
          <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>First, tell us how you use Garage Go.</Text>

          <View style={{ gap: 10, marginTop: 22 }}>
            {ROLES.map((r) => {
              const on = r.key === role;
              return (
                <Pressable
                  key={r.key}
                  onPress={() => { haptics.select(); setRole(r.key); }}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16,
                    borderRadius: radius.lg, borderWidth: 1.5,
                    borderColor: on ? colors.forest : colors.line,
                    backgroundColor: on ? colors.forestTint : colors.card,
                  }}
                >
                  <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: on ? colors.forest : colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={r.icon} size={22} color={on ? colors.onPrimary : colors.ink2} strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15.5, fontWeight: '700', color: colors.ink }}>{r.title}</Text>
                    <Text style={{ fontSize: 12.5, color: colors.muted, marginTop: 2, lineHeight: 17 }}>{r.body}</Text>
                  </View>
                  <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: on ? colors.forest : colors.line2, alignItems: 'center', justifyContent: 'center' }}>
                    {on && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.forest }} />}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={{ marginTop: 22, gap: 14 }}>
            <Field label={active.nameLabel} icon="user" placeholder={active.namePlaceholder} value={name} onChangeText={setName} autoCapitalize="words" />
            <Field label="Phone number" icon="phone" prefix="+251" placeholder="9•• •• •• ••" value={phone} onChangeText={setPhone} keyboardType="number-pad" description="Customers reach you on this number." />
            <Button label="Send code" onPress={sendCode} loading={sending} disabled={digits.length !== 9 || !name.trim()} />
          </View>
        </>
      ) : (
        <>
          <Image source={logo} style={{ width: 72, height: 72, borderRadius: 18, marginTop: 22 }} resizeMode="contain" />
          <Text style={{ fontSize: 26, fontWeight: '800', color: colors.ink, letterSpacing: -0.5, marginTop: 16 }}>Verify your number</Text>
          <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>Enter the 6-digit code we sent you.</Text>

          <View style={{ marginTop: 24, gap: 14 }}>
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
            <Button label="Create account" iconRight="arrowR" onPress={verify} loading={verifying} disabled={otp.length < 6} />
          </View>
        </>
      )}
    </ScrollView>
  );
}
