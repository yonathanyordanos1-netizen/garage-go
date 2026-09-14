// Formatting + the Telebirr mock payment flow.

export function formatETB(amount: number): string {
  return amount.toLocaleString('en-US') + ' ETB';
}

export function generateBookingId(): string {
  const n = Math.floor(100000 + Math.random() * 899999);
  return 'GG-' + n;
}

// Great-circle distance in km between two lat/lng points.
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

export function distanceLabel(km: number): string {
  return km.toFixed(1) + ' km';
}

export const TELEBIRR_NUMBERS = [
  { number: '0987505315', owner: 'Biniyam Zekariyas', label: 'Primary' },
  { number: '0997409105', owner: 'Yonathan', label: 'Secondary' },
];

// Mock Telebirr charge. No real gateway — resolves after ~1s so the UI can
// show a spinner and then a success toast, exactly like the brief describes.
export function mockPayWithTelebirr(
  number: string,
  name: string,
  amount: number
): Promise<{ ok: true; reference: string; number: string; name: string; amount: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ok: true,
        reference: 'TB' + Math.floor(1e9 + Math.random() * 9e9),
        number,
        name,
        amount,
      });
    }, 1000);
  });
}

// A stable reference point for distance sorting (Bole Medhanialem, Addis Ababa).
export const USER_LOCATION = { lat: 8.9959, lng: 38.7896 };
