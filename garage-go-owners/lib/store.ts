// Local, offline-first persistence (AsyncStorage). Used so reservations, saved
// garages, and seller chats work in dev mode (no real Supabase session) and
// offline. When a real auth session exists the booking screen also best-effort
// writes to Supabase, but this local store is the source of truth for the UI.
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ── Bookings ── */
export type StoredBooking = {
  code: string; garage: string; service: string; slot: string; vehicle: string;
  status: 'upcoming' | 'completed' | 'cancelled'; fee: number; createdAt: number;
};
const BK = 'gg_bookings';
export async function getBookings(): Promise<StoredBooking[]> {
  try { const r = await AsyncStorage.getItem(BK); return r ? JSON.parse(r) : []; } catch { return []; }
}
export async function addBooking(b: StoredBooking): Promise<void> {
  const list = await getBookings();
  list.unshift(b);
  await AsyncStorage.setItem(BK, JSON.stringify(list));
}
export async function setBookingStatus(code: string, status: StoredBooking['status']): Promise<void> {
  const list = await getBookings();
  const i = list.findIndex((x) => x.code === code);
  if (i >= 0) { list[i].status = status; await AsyncStorage.setItem(BK, JSON.stringify(list)); }
}

/* ── Saved garages ── */
const SV = 'gg_saved';
export async function getSaved(): Promise<string[]> {
  try { const r = await AsyncStorage.getItem(SV); return r ? JSON.parse(r) : []; } catch { return []; }
}
export async function toggleSaved(id: string): Promise<boolean> {
  const list = await getSaved();
  const i = list.indexOf(id);
  let saved: boolean;
  if (i >= 0) { list.splice(i, 1); saved = false; } else { list.push(id); saved = true; }
  await AsyncStorage.setItem(SV, JSON.stringify(list));
  return saved;
}

/* ── Seller chat threads ── */
export type ChatMsg = { id: string; from: 'me' | 'seller'; text: string; at: number };
const CH = (seller: string) => `gg_chat_${seller}`;
export async function getThread(seller: string): Promise<ChatMsg[]> {
  try { const r = await AsyncStorage.getItem(CH(seller)); return r ? JSON.parse(r) : []; } catch { return []; }
}
export async function saveThread(seller: string, msgs: ChatMsg[]): Promise<void> {
  await AsyncStorage.setItem(CH(seller), JSON.stringify(msgs));
}
