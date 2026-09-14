// verify-otp — compares the submitted code against the stored HMAC hash with a
// constant-time check, enforces per-code (max 5) and per-window verify limits,
// distinguishes expired vs wrong codes, and on success mints a real Supabase
// session for the phone (passwordless). Never reveals whether a phone exists.
import {
  PHONE_RE, corsHeaders, json, appCheckOk, clientIp, maskPhone, hmacHex, timingSafeEqual, adminClient, anonClient,
} from './otp.ts';

const VERIFY_WINDOW_MS = 5 * 60_000;
const VERIFY_MAX_PER_WINDOW = 10;

Deno.serve(async (req) => {
  const headers = corsHeaders();
  if (req.method === 'OPTIONS') return new Response(null, { headers });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, headers);
  if (!appCheckOk(req)) return json({ error: 'unauthorized' }, 401, headers);

  const OTP_SECRET = Deno.env.get('OTP_HMAC_SECRET');
  const PW_SECRET = Deno.env.get('AUTH_PASSWORD_SECRET');
  if (!OTP_SECRET || !PW_SECRET) { console.error('missing OTP/AUTH secret'); return json({ error: 'server_misconfigured' }, 500, headers); }

  let body: { phone?: string; code?: string; full_name?: string };
  try { body = await req.json(); } catch { return json({ error: 'bad_request' }, 400, headers); }
  const phone = String(body?.phone ?? '').trim();
  const code = String(body?.code ?? '').trim();
  const fullName = body?.full_name ? String(body.full_name).slice(0, 80) : null;
  if (!PHONE_RE.test(phone) || !/^\d{6}$/.test(code)) return json({ error: 'invalid_code' }, 400, headers);

  const ip = clientIp(req);
  const db = adminClient();
  const now = Date.now();

  // ── Verify-side rate limit (separate from sends; anti-brute-force) ──
  const sinceWindow = new Date(now - VERIFY_WINDOW_MS).toISOString();
  const { count: recentVerifies } = await db.from('otp_verify_attempts').select('id', { count: 'exact', head: true }).eq('phone', phone).gte('created_at', sinceWindow);
  if ((recentVerifies ?? 0) >= VERIFY_MAX_PER_WINDOW) return json({ error: 'rate_limited', retry_after: 300 }, 429, { ...headers, 'Retry-After': '300' });
  const logAttempt = (success: boolean) => db.from('otp_verify_attempts').insert({ phone, ip_address: ip, success });

  // ── Latest unverified code ──
  const { data: rows } = await db.from('otp_codes').select('*').eq('phone', phone).eq('verified', false).order('created_at', { ascending: false }).limit(1);
  const otp = rows?.[0];
  if (!otp) { await logAttempt(false); return json({ error: 'invalid_code' }, 400, headers); }

  if (new Date(otp.expires_at).getTime() < now) {
    await logAttempt(false);
    return json({ error: 'expired' }, 400, headers); // distinct → client offers resend
  }
  if (otp.attempts >= otp.max_attempts) {
    await logAttempt(false);
    return json({ error: 'too_many_attempts' }, 400, headers);
  }

  const expectedHash = await hmacHex(OTP_SECRET, phone + ':' + code);
  if (!timingSafeEqual(expectedHash, otp.code_hash)) {
    const attempts = otp.attempts + 1;
    await db.from('otp_codes').update({ attempts }).eq('id', otp.id);
    await logAttempt(false);
    const left = Math.max(0, otp.max_attempts - attempts);
    if (left <= 0) return json({ error: 'too_many_attempts' }, 400, headers);
    return json({ error: 'invalid_code', attempts_left: left }, 400, headers);
  }

  // ── Success: consume the code ──
  await db.from('otp_codes').update({ verified: true, attempts: otp.attempts + 1 }).eq('id', otp.id);
  await logAttempt(true);

  // ── Mint a Supabase session (email/password grant under the hood → provider-
  // independent; the synthetic email is never shown to the user). ──
  const digits = phone.slice(1); // drop the '+'; GoTrue stores phone as digits
  const email = `${digits}@phone.garagego.app`;
  const password = await hmacHex(PW_SECRET, digits);

  let userId = (await db.rpc('find_user_id_by_phone', { p: digits })).data as string | null;
  if (!userId) {
    const { data: created, error: cErr } = await db.auth.admin.createUser({
      email, phone, email_confirm: true, phone_confirm: true, password,
      user_metadata: fullName ? { full_name: fullName } : {},
    });
    if (cErr || !created?.user) {
      // Race: created between lookup and now — re-fetch.
      userId = (await db.rpc('find_user_id_by_phone', { p: digits })).data as string | null;
      if (!userId) { console.error('create_user_failed', maskPhone(phone), cErr?.message); return json({ error: 'server_error' }, 500, headers); }
    } else {
      userId = created.user.id;
    }
  }

  const { data: signIn, error: sErr } = await anonClient().auth.signInWithPassword({ email, password });
  if (sErr || !signIn?.session) { console.error('session_mint_failed', maskPhone(phone), sErr?.message); return json({ error: 'server_error' }, 500, headers); }

  console.log('otp_verified', maskPhone(phone));
  return json({
    ok: true,
    access_token: signIn.session.access_token,
    refresh_token: signIn.session.refresh_token,
    user_id: userId,
  }, 200, headers);
});
