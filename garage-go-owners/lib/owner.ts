import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import type { OwnerRole } from './auth';
import { supabase } from './supabase';

/* ─────────────────────────── Types (mirror the DB) ─────────────────────────── */

export type JobStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export type Job = {
  id: string;
  code: string;
  customer: string;
  phone: string;
  vehicle: string;
  service: string;
  problem?: string;
  date: string;
  slot: string;
  fee: number;
  garageCut: number;
  status: JobStatus;
  assignedTo?: string;
  createdAt: number;
};

export type ServiceItem = {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  active: boolean;
};

export type Listing = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  tag?: string;
  active: boolean;
};

type StoreShape = {
  jobs: Job[];
  services: ServiceItem[];
  listings: Listing[];
  online: boolean;
};

/* ─────────────────────────── Fetch from Supabase ─────────────────────────── */

async function fetchFromSupabase(role: OwnerRole): Promise<StoreShape> {
  const empty: StoreShape = { jobs: [], services: [], listings: [], online: true };

  try {
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*, profiles:user_id(full_name, phone)')
      .order('created_at', { ascending: false });

    const jobs: Job[] = (bookings ?? []).map((b: any) => ({
      id: b.id,
      code: b.booking_code ?? '',
      customer: b.profiles?.full_name ?? 'Customer',
      phone: b.profiles?.phone ?? '',
      vehicle: b.vehicle ?? '',
      service: b.service_name ?? '',
      problem: b.problem ?? undefined,
      date: b.booking_date ?? '',
      slot: b.slot ?? '',
      fee: b.fee ?? 0,
      garageCut: b.garage_cut ?? 0,
      status: b.status as JobStatus,
      assignedTo: undefined,
      createdAt: new Date(b.created_at).getTime(),
    }));

    const { data: svcRows } = await supabase
      .from('services')
      .select('*')
      .order('name');

    const services: ServiceItem[] = (svcRows ?? []).map((s: any) => ({
      id: s.id,
      name: s.name,
      description: s.description ?? '',
      duration: s.duration ?? '',
      price: s.price ?? 0,
      active: true,
    }));

    const { data: prodRows } = await supabase
      .from('products')
      .select('*')
      .order('name');

    const listings: Listing[] = (prodRows ?? []).map((p: any) => ({
      id: p.id,
      name: p.name,
      category: p.category ?? '',
      price: p.price ?? 0,
      stock: 0,
      tag: p.tag ?? undefined,
      active: true,
    }));

    if (role === 'mechanic') return { jobs, services: [], listings: [], online: true };
    if (role === 'seller') return { jobs: [], services: [], listings, online: true };
    return { jobs, services, listings: [], online: true };
  } catch {
    return empty;
  }
}

/* ─────────────────────────── Store engine ─────────────────────────── */

const KEY = (role: OwnerRole) => `owner_store_${role}`;

let state: StoreShape = { jobs: [], services: [], listings: [], online: true };
let currentRole: OwnerRole | null = null;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  state = { ...state };
  for (const l of listeners) l();
}
async function persist() {
  if (!currentRole) return;
  try { await AsyncStorage.setItem(KEY(currentRole), JSON.stringify(state)); } catch {}
}

export async function initStore(role: OwnerRole): Promise<void> {
  if (loaded && currentRole === role) return;
  currentRole = role;

  // Try fetching from Supabase first
  const remote = await fetchFromSupabase(role);
  const hasRemoteData = remote.jobs.length > 0 || remote.services.length > 0 || remote.listings.length > 0;

  if (hasRemoteData) {
    state = remote;
  } else {
    // Fall back to cached local data if available
    try {
      const raw = await AsyncStorage.getItem(KEY(role));
      state = raw ? JSON.parse(raw) : { jobs: [], services: [], listings: [], online: true };
    } catch {
      state = { jobs: [], services: [], listings: [], online: true };
    }
  }

  loaded = true;
  emit();
  persist();
}

export function resetStore(): void {
  loaded = false;
  currentRole = null;
  state = { jobs: [], services: [], listings: [], online: true };
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function snapshot() {
  return state;
}

/* ─────────────────────────── Read hooks ─────────────────────────── */

export function useStore(): StoreShape {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

/* ─────────────────────────── Mutations ─────────────────────────── */

export function setJobStatus(id: string, status: JobStatus): void {
  state.jobs = state.jobs.map((j) => (j.id === id ? { ...j, status } : j));
  emit(); persist();
  supabase.from('bookings').update({ status }).eq('id', id).then(() => {});
}

export function assignJob(id: string, mechanic: string): void {
  state.jobs = state.jobs.map((j) => (j.id === id ? { ...j, assignedTo: mechanic } : j));
  emit(); persist();
}

export function setOnline(online: boolean): void {
  state.online = online;
  emit(); persist();
}

export function upsertService(svc: ServiceItem): void {
  const i = state.services.findIndex((s) => s.id === svc.id);
  if (i >= 0) state.services[i] = svc;
  else state.services = [svc, ...state.services];
  emit(); persist();
}
export function removeService(id: string): void {
  state.services = state.services.filter((s) => s.id !== id);
  emit(); persist();
}

export function upsertListing(item: Listing): void {
  const i = state.listings.findIndex((l) => l.id === item.id);
  if (i >= 0) state.listings[i] = item;
  else state.listings = [item, ...state.listings];
  emit(); persist();
}
export function removeListing(id: string): void {
  state.listings = state.listings.filter((l) => l.id !== id);
  emit(); persist();
}

export function newId(prefix: string): string {
  return prefix + '_' + Math.random().toString(36).slice(2, 9);
}

/* ─────────────────────────── Derived selectors ─────────────────────────── */

export function jobIsToday(j: Job): boolean {
  return j.date === new Date().toISOString().slice(0, 10);
}

export type Earnings = { today: number; week: number; pendingPayout: number; completedCount: number };

export function computeEarnings(jobs: Job[]): Earnings {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = Date.now() - 7 * 864e5;
  let t = 0, w = 0, pending = 0, count = 0;
  for (const j of jobs) {
    if (j.status !== 'completed') continue;
    count++;
    if (j.date === today) t += j.garageCut;
    if (j.createdAt >= weekAgo) w += j.garageCut;
    pending += j.garageCut;
  }
  return { today: t, week: w, pendingPayout: pending, completedCount: count };
}
