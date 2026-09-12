import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  // Surfaces a clear error instead of a cryptic network failure if .env is missing.
  console.warn('Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // persists the session on the device
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // not applicable in a native app
  },
});

// ── Auth helpers (thin wrappers used by the sign-in / sign-up screens) ──
export function signInWithPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export function signUp(
  email: string,
  password: string,
  meta: { full_name?: string; phone?: string; role?: string }
) {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: meta },
  });
}

// Phone OTP — request a code, then verify it. Requires an SMS provider
// (e.g. Twilio) configured in Supabase Auth settings to actually deliver.
export function signInWithOtp(phone: string) {
  return supabase.auth.signInWithOtp({ phone });
}
export function verifyOtp(phone: string, token: string) {
  return supabase.auth.verifyOtp({ phone, token, type: 'sms' });
}

// OAuth — needs the Google / Apple providers enabled in the Supabase dashboard.
export function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({ provider: 'google' });
}
export function signInWithApple() {
  return supabase.auth.signInWithOAuth({ provider: 'apple' });
}

export function signOut() {
  return supabase.auth.signOut();
}
