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

/* ── Custom phone OTP (SMSEthiopia via Edge Functions) ─────────────────────── */
// Dev bypass: when EXPO_PUBLIC_DEV_OTP=1, the sign-in/up screens skip the real
// SMS backend and log in locally (any 6-digit code). Turn OFF for production.
export const DEV_OTP = process.env.EXPO_PUBLIC_DEV_OTP === '1';

// The app-check shared secret; must equal APP_CHECK_SECRET set on the functions.
const APP_CHECK = process.env.EXPO_PUBLIC_APP_CHECK_SECRET;
function appCheckHeaders(): Record<string, string> | undefined {
  return APP_CHECK ? { 'x-app-check': APP_CHECK } : undefined;
}
// supabase-js puts a non-2xx response into `error.context` (a Response).
async function readInvokeError(error: any): Promise<{ error?: string; retry_after?: number; attempts_left?: number }> {
  try {
    if (error?.context && typeof error.context.json === 'function') return await error.context.json();
  } catch {}
  return {};
}

export type OtpSendResult =
  | { ok: true; resendIn: number; smsRemaining: number | null }
  | { ok: false; error: string; retryAfter?: number };

export async function otpSend(phone: string): Promise<OtpSendResult> {
  try {
    const { data, error } = await supabase.functions.invoke('send-otp', { body: { phone }, headers: appCheckHeaders() });
    if (error) { const b = await readInvokeError(error); return { ok: false, error: b.error ?? 'send_failed', retryAfter: b.retry_after }; }
    return { ok: true, resendIn: data?.resend_in ?? 60, smsRemaining: data?.sms_remaining ?? null };
  } catch { return { ok: false, error: 'network' }; }
}

export type OtpVerifyResult = { ok: true } | { ok: false; error: string; attemptsLeft?: number };

export async function otpVerify(phone: string, code: string, fullName?: string): Promise<OtpVerifyResult> {
  try {
    const { data, error } = await supabase.functions.invoke('verify-otp', { body: { phone, code, full_name: fullName }, headers: appCheckHeaders() });
    if (error) { const b = await readInvokeError(error); return { ok: false, error: b.error ?? 'server_error', attemptsLeft: b.attempts_left }; }
    if (!data?.access_token || !data?.refresh_token) return { ok: false, error: 'server_error' };
    const { error: sErr } = await supabase.auth.setSession({ access_token: data.access_token, refresh_token: data.refresh_token });
    if (sErr) return { ok: false, error: 'server_error' };
    return { ok: true };
  } catch { return { ok: false, error: 'network' }; }
}

// Friendly, phone-existence-safe messages for the OTP error codes.
export function otpMessage(error: string, extra?: { retryAfter?: number; attemptsLeft?: number }): string {
  switch (error) {
    case 'invalid_phone': return 'Enter a valid Ethiopian number (+251 then 9 digits).';
    case 'rate_limited': return extra?.retryAfter ? `Too many requests. Try again in ${extra.retryAfter}s.` : 'Too many requests. Please wait a moment.';
    case 'expired': return 'That code expired. Tap Resend to get a new one.';
    case 'invalid_code': return extra?.attemptsLeft != null ? `Wrong code. ${extra.attemptsLeft} attempt${extra.attemptsLeft === 1 ? '' : 's'} left.` : 'Wrong code. Please try again.';
    case 'too_many_attempts': return 'Too many wrong attempts. Request a new code.';
    case 'sms_provider_not_configured': return 'SMS service isn’t set up yet. Add the SMSEthiopia key to enable codes.';
    case 'server_misconfigured': return 'Sign-in isn’t available yet — the server needs its secrets configured.';
    case 'sms_quota_exhausted': return 'Daily SMS limit reached. Please try later.';
    case 'send_failed': return 'Couldn’t send the code right now. Please try again.';
    case 'server_error': return 'Something went wrong on our end. Please try again.';
    case 'network': return 'Network error. Check your connection and try again.';
    default: return 'Couldn’t complete that. Please try again.';
  }
}
