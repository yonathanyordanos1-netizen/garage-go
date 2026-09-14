// Shared helpers for the OTP Edge Functions. A copy of this file is bundled into
// each function at deploy time. No secrets are hardcoded — everything sensitive
// is read from Deno.env at runtime.
import { createClient } from 'jsr:@supabase/supabase-js@2';

// Ethiopian mobile in E.164: +251 followed by 9 digits (9x or 7x).
export const PHONE_RE = /^\+251\d{9}$/;

export function corsHeaders(): Record<string, string> {
  // Native apps send no browser Origin, so CORS can't gate them; the real gate
  // is the x-app-check secret + rate limits. If you also ship web, set
  // ALLOWED_ORIGIN to that exact origin instead of '*'.
  const allowed = Deno.env.get('ALLOWED_ORIGIN') ?? '*';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-app-check',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

export function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });
}

// App-check shared secret. If unset (first-run/dev), we don't hard-block, but you
// MUST set APP_CHECK_SECRET for production — see the manual steps.
export function appCheckOk(req: Request): boolean {
  const secret = Deno.env.get('APP_CHECK_SECRET');
  if (!secret) return true;
  return req.headers.get('x-app-check') === secret;
}

export function clientIp(req: Request): string | null {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip');
}

// +251XXXXXXXXX -> +2519****63  (never log full numbers)
export function maskPhone(phone: string): string {
  if (phone.length < 9) return '+251****';
  return phone.slice(0, 7) + '****' + phone.slice(-2);
}

export async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

// Cryptographically-random 6-digit code (NOT Math.random), uniform via rejection.
export function randomCode(): string {
  const max = 1_000_000;
  const limit = Math.floor(0xffffff / max) * max; // largest 24-bit multiple of 1e6
  const buf = new Uint8Array(3);
  let n: number;
  do {
    crypto.getRandomValues(buf);
    n = (buf[0] << 16) | (buf[1] << 8) | buf[2];
  } while (n >= limit);
  return (n % max).toString().padStart(6, '0');
}

export function adminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export function anonClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
