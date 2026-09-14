// send-otp — validates the phone, enforces rate limits, generates a random code,
// stores only its HMAC hash, and delivers it via SMSEthiopia. Never stores or
// logs the raw code or a full phone number. Never silently "succeeds" on a
// provider failure.
import {
  PHONE_RE, corsHeaders, json, appCheckOk, clientIp, maskPhone, hmacHex, randomCode, adminClient,
} from './otp.ts';

const RESEND_SECONDS = 60;
const CODE_TTL_SECONDS = 300;

// ─────────────────────────────────────────────────────────────────────────────
// ⛔ SMSEthiopia integration is PENDING the dashboard snippet (endpoint / auth
// header / request body). Per the brief we do NOT guess the API format. Once you
// paste it, this is the only function that changes — wire the real fetch here:
//
//   const apiKey = Deno.env.get('SMSETHIOPIA_API_KEY')!;   // from `supabase secrets set`
//   const res = await fetch('<ENDPOINT>', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json', /* <auth header> */ },
//     body: JSON.stringify({ /* <to>: phone, <text>: message, ... */ }),
//     signal: AbortSignal.timeout(10_000),
//   });
//   if (!res.ok) throw new Error('provider_http_' + res.status);
//   const data = await res.json();
//   // if the provider returns an error field even on HTTP 200, throw here too.
//   return { ref: String(data.<message_id> ?? '') };
// ─────────────────────────────────────────────────────────────────────────────
async function sendSms(_phone: string, _message: string): Promise<{ ref?: string }> {
  throw new Error('sms_provider_not_configured');
}

Deno.serve(async (req) => {
  const headers = corsHeaders();
  if (req.method === 'OPTIONS') return new Response(null, { headers });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, headers);
  if (!appCheckOk(req)) return json({ error: 'unauthorized' }, 401, headers);

  const OTP_SECRET = Deno.env.get('OTP_HMAC_SECRET');
  if (!OTP_SECRET) { console.error('missing OTP_HMAC_SECRET'); return json({ error: 'server_misconfigured' }, 500, headers); }

  let body: { phone?: string };
  try { body = await req.json(); } catch { return json({ error: 'bad_request' }, 400, headers); }
  const phone = String(body?.phone ?? '').trim();
  if (!PHONE_RE.test(phone)) return json({ error: 'invalid_phone' }, 400, headers);

  const ip = clientIp(req);
  const db = adminClient();
  const now = Date.now();
  const since60 = new Date(now - 60_000).toISOString();
  const since1h = new Date(now - 3_600_000).toISOString();

  // ── Rate limits (429 + Retry-After) ──
  const { count: last60 } = await db.from('otp_codes').select('id', { count: 'exact', head: true }).eq('phone', phone).gte('created_at', since60);
  if ((last60 ?? 0) > 0) return json({ error: 'rate_limited', retry_after: RESEND_SECONDS }, 429, { ...headers, 'Retry-After': String(RESEND_SECONDS) });

  const { count: phoneHour } = await db.from('otp_codes').select('id', { count: 'exact', head: true }).eq('phone', phone).gte('created_at', since1h);
  if ((phoneHour ?? 0) >= 5) return json({ error: 'rate_limited', retry_after: 3600 }, 429, { ...headers, 'Retry-After': '3600' });

  if (ip) {
    const { count: ipHour } = await db.from('otp_codes').select('id', { count: 'exact', head: true }).eq('ip_address', ip).gte('created_at', since1h);
    if ((ipHour ?? 0) >= 10) return json({ error: 'rate_limited', retry_after: 3600 }, 429, { ...headers, 'Retry-After': '3600' });
  }

  // ── Trial guard (100 free SMS) ──
  const { data: usage } = await db.rpc('otp_sms_usage');
  const remaining: number | null = usage?.[0]?.remaining_estimate ?? null;
  if (remaining !== null && remaining <= 0) return json({ error: 'sms_quota_exhausted' }, 503, headers);

  // ── Generate + hash (bound to phone). Raw code is never persisted or logged. ──
  const code = randomCode();
  const codeHash = await hmacHex(OTP_SECRET, phone + ':' + code);
  const expiresAt = new Date(now + CODE_TTL_SECONDS * 1000).toISOString();

  const { error: insErr } = await db.from('otp_codes').insert({ phone, code_hash: codeHash, expires_at: expiresAt, ip_address: ip });
  if (insErr) { console.error('otp_insert_failed', maskPhone(phone)); return json({ error: 'server_error' }, 500, headers); }

  // ── Deliver ──
  const message = `Your Garage Go code is ${code}. It expires in 5 minutes.`;
  try {
    const { ref } = await sendSms(phone, message);
    await db.from('sms_send_log').insert({ phone_masked: maskPhone(phone), status: 'sent', provider_ref: ref ?? null, ip_address: ip });
    console.log('otp_sent', maskPhone(phone));
    return json({ ok: true, expires_in: CODE_TTL_SECONDS, resend_in: RESEND_SECONDS, sms_remaining: remaining !== null ? remaining - 1 : null }, 200, headers);
  } catch (e) {
    const msg = String((e as Error)?.message ?? e);
    await db.from('sms_send_log').insert({ phone_masked: maskPhone(phone), status: 'failed', error: msg.slice(0, 200), ip_address: ip });
    console.error('otp_send_failed', maskPhone(phone), msg);
    if (msg === 'sms_provider_not_configured') return json({ error: 'sms_provider_not_configured' }, 503, headers);
    return json({ error: 'send_failed' }, 502, headers);
  }
});
