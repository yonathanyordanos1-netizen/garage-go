// Owner domain layer — the operator console's source of truth.
//
// Offline-first: state lives in-memory, is persisted to AsyncStorage, and is
// seeded on first launch so every screen renders with realistic content in dev
// mode (no live Supabase session needed). Screens subscribe with the exported
// hooks (built on useSyncExternalStore) so a status change on one screen
// updates the dashboard, jobs list, and earnings everywhere at once.
//
// When a real Supabase session exists the screens still read/write this store
// for instant UX; wiring the same mutations to Supabase (bookings.status,
// services, products) is a thin follow-up — the shapes here mirror the DB.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import type { OwnerRole } from './auth';

/* ─────────────────────────── Types (mirror the DB) ─────────────────────────── */

export type JobStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export type Job = {
  id: string;
  code: string;             // bookings.booking_code, e.g. GG-482193
  customer: string;
  phone: string;
  vehicle: string;
  service: string;
  problem?: string;
  date: string;             // ISO date
  slot: string;             // e.g. "10:00"
  fee: number;              // total charged to the customer (ETB)
  garageCut: number;        // what the operator keeps after platform fee
  status: JobStatus;
  assignedTo?: string;      // mechanic name
  createdAt: number;
};

export type ServiceItem = {
  id: string;
  name: string;
  description: string;
  duration: string;         // e.g. "45–60 min"
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
  online: boolean;          // garage/mechanic accepting new work
};

/* ─────────────────────────── Seed content ─────────────────────────── */

const now = Date.now();
const iso = (dayOffset: number) => new Date(now + dayOffset * 864e5).toISOString().slice(0, 10);

function seed(role: OwnerRole): StoreShape {
  const jobs: Job[] = [
    { id: 'j1', code: 'GG-482193', customer: 'Dawit Mekonnen', phone: '+251911248763', vehicle: 'Toyota Vitz 2014 · AA-3-12345', service: 'Full engine diagnostics', problem: 'Check-engine light on, rough idle', date: iso(0), slot: '10:00', fee: 650, garageCut: 550, status: 'pending', createdAt: now - 12 * 6e4 },
    { id: 'j2', code: 'GG-771020', customer: 'Sara Alemu', phone: '+251913550219', vehicle: 'Hyundai i20 2018 · AA-2-88771', service: 'Oil & filter change', problem: 'Due for service at 90,000 km', date: iso(0), slot: '11:30', fee: 480, garageCut: 400, status: 'pending', createdAt: now - 40 * 6e4 },
    { id: 'j3', code: 'GG-118845', customer: 'Yonas Girma', phone: '+251921764108', vehicle: 'Suzuki Dzire 2020 · AA-1-40219', service: 'Brake pad replacement', problem: 'Squealing on the front axle', date: iso(0), slot: '14:00', fee: 900, garageCut: 780, status: 'confirmed', assignedTo: 'Abebe T.', createdAt: now - 3 * 36e5 },
    { id: 'j4', code: 'GG-905513', customer: 'Helen Tadesse', phone: '+251911000010', vehicle: 'Toyota Corolla 2016 · AA-3-55120', service: 'AC regas & check', date: iso(1), slot: '09:00', fee: 1200, garageCut: 1040, status: 'confirmed', createdAt: now - 20 * 36e5 },
    { id: 'j5', code: 'GG-330076', customer: 'Nahom Fikru', phone: '+251911000011', vehicle: 'Nissan Sunny 2012 · AA-2-11002', service: 'Full engine diagnostics', date: iso(-1), slot: '15:30', fee: 650, garageCut: 550, status: 'completed', assignedTo: 'Abebe T.', createdAt: now - 30 * 36e5 },
    { id: 'j6', code: 'GG-660941', customer: 'Meron Haile', phone: '+251911000012', vehicle: 'Kia Rio 2019 · AA-1-77340', service: 'Oil & filter change', date: iso(-2), slot: '12:00', fee: 480, garageCut: 400, status: 'completed', createdAt: now - 52 * 36e5 },
  ];

  const services: ServiceItem[] = [
    { id: 's1', name: 'Full engine diagnostics', description: 'OBD scan + written report', duration: '45–60 min', price: 650, active: true },
    { id: 's2', name: 'Oil & filter change', description: 'Labour only, parts extra', duration: '30 min', price: 480, active: true },
    { id: 's3', name: 'Brake pad replacement', description: 'Front or rear axle, labour', duration: '1–2 hrs', price: 900, active: true },
    { id: 's4', name: 'AC regas & check', description: 'Leak test + refrigerant top-up', duration: '1 hr', price: 1200, active: true },
    { id: 's5', name: 'Wheel alignment', description: '4-wheel computerised', duration: '45 min', price: 700, active: false },
  ];

  const listings: Listing[] = [
    { id: 'l1', name: 'Bosch S4 Battery 60Ah', category: 'Battery', price: 4200, stock: 8, tag: 'New', active: true },
    { id: 'l2', name: 'Michelin 195/65 R15 (set of 4)', category: 'Tyres', price: 38000, stock: 3, tag: 'Popular', active: true },
    { id: 'l3', name: 'Total 5W-30 Synthetic 4L', category: 'Oils', price: 2650, stock: 22, active: true },
    { id: 'l4', name: 'Brake pad set — Vitz (front)', category: 'Car parts', price: 1900, stock: 0, active: false },
    { id: 'l5', name: 'OBD2 Scanner ELM327', category: 'Tools', price: 1100, stock: 5, tag: 'Deal', active: true },
  ];

  // Mechanics don't own a service catalog or listings; they only see jobs.
  if (role === 'mechanic') return { jobs, services: [], listings: [], online: true };
  if (role === 'seller') return { jobs: [], services: [], listings, online: true };
  return { jobs, services, listings: [], online: true };
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

// Load (or seed) the store for a role. Called once from the tab layout.
export async function initStore(role: OwnerRole): Promise<void> {
  if (loaded && currentRole === role) return;
  currentRole = role;
  try {
    const raw = await AsyncStorage.getItem(KEY(role));
    state = raw ? JSON.parse(raw) : seed(role);
  } catch {
    state = seed(role);
  }
  loaded = true;
  emit();
  if (!(await AsyncStorage.getItem(KEY(role)))) persist();
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
