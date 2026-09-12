# Garage Go — Customer App

An Ethiopian garage-reservation & roadside-assistance mobile app, built with
**React Native + Expo** and a live **Supabase** backend. This is the **customer**
app; the service-provider app (garage owners, mechanics, admin) is a separate build.

The UI uses the **Earthy & Organic** palette — Forest Green `#2D4F1E`,
Terracotta `#E27D60`, Warm Beige `#F5E6CC`, Slate Grey `#4A4A4A`.

---

## How to run

You need Node 18+ and the **Expo Go** app on your phone (App Store / Play Store).

```bash
cd garage-go-mobile
npm install
npx expo start
```

Then:
- **Phone:** open Expo Go and scan the QR code in the terminal.
- **Android emulator:** press `a` · **iOS simulator (macOS):** press `i`
- Or `npx expo run:android` / `npx expo run:ios` for a native dev build.

The Supabase URL and publishable key are already wired in `.env`
(`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`), so the app talks
to a real backend out of the box.

---

## What's functional

| Feature | Backed by |
|---|---|
| Email + password sign up / sign in | Supabase Auth (`signInWithPassword`, `signUp`) |
| Phone OTP sign in | `signInWithOtp` + `verifyOtp` *(needs an SMS provider — see below)* |
| Google / Apple continue | `signInWithOAuth` *(needs providers enabled — see below)* |
| Session persistence | AsyncStorage; you stay logged in across restarts |
| Home / Search garages | live `garages` table, distance sorted (Haversine) |
| Garage profile + services | live `garages` + `services` tables |
| Booking + 100 ETB reservation | writes a real row to `bookings` |
| Telebirr payment | **mock** `mockPayWithTelebirr()` → writes a `payments` row |
| Confirmation (booking ID + 50/50 split) | reads back the created booking |
| Emergency mechanics | live `mechanics` table; tap-to-call via `Linking` |
| Roadside assistance | writes a real row to `roadside_requests` |
| Marketplace | live `products` table |
| Profile + points + booking count | live `profiles` + `bookings` |

### Telebirr mock flow
Tapping **Pay 100 ETB** on a garage opens a sheet with the two Telebirr numbers:

- **0987505315** — Biniyam Zekariyas (Primary)
- **0997409105** — Yonathan (Secondary)

Selecting one calls `mockPayWithTelebirr(number, name, 100)` (a `setTimeout` that
resolves after ~1s — **no real gateway**), then:
1. inserts a `bookings` row (fee 100, split 50/50),
2. inserts a `payments` row (`method: 'telebirr'`, `status: 'success'`),
3. shows a **"Reservation confirmed!"** toast,
4. navigates to the confirmation screen with the booking ID and the 50 → platform /
   50 → garage split.

---

## Backend (Supabase)

Project ref: `fqffzsnromybscsvpcsm` · region `eu-central-1`.

Tables (all with Row-Level Security):
- `profiles` — auto-created on signup by a trigger; users read/update only their own.
- `garages`, `services`, `mechanics`, `products` — public read (the catalog).
- `bookings`, `payments`, `roadside_requests` — **owner-only** (`auth.uid() = user_id`).

### To make phone OTP + OAuth actually deliver
These are wired in code but need dashboard config:
- **Phone OTP:** Supabase → Authentication → Providers → Phone → add an SMS
  provider (e.g. Twilio).
- **Google / Apple:** Supabase → Authentication → Providers → enable and add the
  OAuth client IDs/secrets, plus a redirect for the `garagego://` scheme.

### For instant email testing (no inbox round-trip)
By default Supabase requires email confirmation. To let a fresh sign-up land
straight in the app, turn **Authentication → Sign In / Providers → Confirm email**
**off**. With it on, the app shows "Check your email to confirm your account" and
sends you to sign-in (this is handled gracefully in `app/sign-up.tsx`).

---

## Project structure

```
app/
  _layout.tsx            Providers (Auth, Toast, SafeArea) + root Stack
  index.tsx              Redirects by auth state
  welcome.tsx            Onboarding (no role picker — customer app only)
  get-started.tsx        Value prop + SVG illustration
  sign-in.tsx            Email/password + phone OTP tabs + social
  sign-up.tsx            Registration + social
  (tabs)/                Bottom tab navigator (auth-guarded)
    _layout.tsx          Home · Garages · Market · Profile
    index.tsx            Home
    search.tsx           Garage search + filters
    market.tsx           Marketplace
    profile.tsx          Account, points, sign out
  garage/[id].tsx        Garage profile + booking + Telebirr pay sheet
  confirmation.tsx       Booking success
  emergency.tsx          Emergency mechanic dispatch
  roadside.tsx           Roadside assistance
lib/
  supabase.ts            Client + auth helpers
  auth.tsx               Auth context (session + profile)
  theme.ts               Earthy & Organic palette / tokens
  icons.tsx              react-native-svg icon set
  utils.ts               mockPayWithTelebirr, formatETB, generateBookingId, haversineKm
components/
  ui.tsx                 Buttons, fields, chips, garage thumbnail
  social.tsx             Google / Apple buttons
  toast.tsx              Toast provider
```

---

## Design preservation note

Colours, spacing, radii and the icon set are ported from the approved Garage Go
design (Earthy & Organic palette). Fonts fall back to the system stack to keep the
build dependency-free — to match the prototype exactly, add
[`expo-font`](https://docs.expo.dev/versions/latest/sdk/font/) and load
**Outfit** (display) + **Inter** (body) + **IBM Plex Mono** (data), then set
`font.display` in `lib/theme.ts`.

> **Security:** `.env` is committed here so the app runs out of the box for review.
> The publishable/anon key is safe to ship in a client (RLS is the real boundary),
> but for a production app move configuration into EAS secrets and rotate keys.
