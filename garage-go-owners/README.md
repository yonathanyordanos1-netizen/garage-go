# Garage Go — Owners

The **operator console** for Garage Go: a separate Expo app for the *supply side*
of the marketplace — garage owners, mechanics, and parts sellers. It runs on the
same Supabase backend as the customer app (`../garage-go-mobile`) but from the
other direction: where customers *create* bookings and browse the market, this
app *manages* them.

## One app, three roles

The role is chosen at sign-up and drives the whole experience (see `lib/auth.tsx`
→ `OwnerRole`):

| Role | Tabs | What they do |
| --- | --- | --- |
| **Garage** | Overview · Jobs · Services · Profile | Accept/decline bookings, assign mechanics, manage a service catalog, track earnings |
| **Mechanic** | Overview · Jobs · Profile | Receive and complete assigned jobs, toggle availability |
| **Parts seller** | Overview · Listings · Profile | Manage market listings (price, stock, visibility) |

Tabs are filtered per role in `app/(tabs)/_layout.tsx`.

## QR reservation scanner

`app/scan.tsx` uses **expo-camera**'s `CameraView` to scan the QR code the
customer app prints on a booking. The payload is `{ code, garage, service, slot }`;
the scanner matches `code` against the operator's jobs and surfaces the full
reservation (customer, phone, vehicle, service, slot, payout) with a one-tap
**check-in** that advances the booking status. Reachable from the dashboard CTA,
the dashboard/Jobs header buttons, and works for every role.

## Design & backend

- **Distinct identity.** Shares the customer app's component kit (`components/ui.tsx`)
  and token *names*, but re-skinned to a cool "operator" palette — deep teal
  primary + signal-amber accent — so it reads as a different product
  (`lib/theme.ts`). Light + dark, follows the system setting.
- **State.** `lib/owner.ts` is an offline-first, `AsyncStorage`-backed store
  exposed via `useSyncExternalStore`, seeded on first launch so every screen has
  realistic content in dev mode. Its shapes mirror the Supabase tables
  (`bookings`, `services`, `products`) for a thin future sync.
- **Auth.** Phone-OTP, same as the customer app. `EXPO_PUBLIC_DEV_OTP=1` lets any
  6-digit code sign you in locally while the SMS backend is off.

## Run

```bash
npm install --legacy-peer-deps
npx expo start
```

### Toolchain pins (must be preserved)

Same as the customer app (Expo SDK 57 / RN 0.86 / React 19):
- `react-native-worklets@~0.10` is Reanimated 4.5's peer — install with
  `--legacy-peer-deps`; its Babel plugin must be **last** in `babel.config.js`.
- TypeScript pinned to `~5.9` (not the SDK's 6.x).
- `expo.install.exclude` in `package.json` keeps `expo install --check` from
  churning those pins.

Verified: `tsc --noEmit` clean, `expo export` (Android) exit 0.
