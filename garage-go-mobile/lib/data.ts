import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

/* ── Types (mirror the Supabase schema) ──────────────────────────────────── */

export type Garage = {
  id: string;
  name: string;
  area: string | null;
  rating: number;
  reviews_count: number;
  price_from: number;
  hours: string | null;
  verified: boolean;
  tags: string[];
  image_url: string | null;
};

export type Service = {
  id: string;
  garage_id: string | null;
  name: string;
  description: string | null;
  price: number;
  duration: string | null;
};

export type Mechanic = {
  id: string;
  name: string;
  phone: string | null;
  area: string | null;
  experience: string | null;
  rating: number;
  verified: boolean;
  tags: string[];
};

export type Product = {
  id: string;
  name: string;
  category: string | null;
  price: number;
  seller: string | null;
  seller_phone: string | null;
  image_url: string | null;
  tag: string | null;
};

export type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number | null;
  plate: string | null;
  mileage: number | null;
  next_service_km: number | null;
  is_primary: boolean;
};

export type RoadsideProvider = {
  name: string;
  eta: string;
  price: string;
  rating: number;
  type: string;
};

export const timeSlots = ['08:30', '10:00', '11:30', '14:00', '15:30', '17:00'];

export const providers: RoadsideProvider[] = [
  { name: 'Addis Tow 24/7', eta: '14 min', price: '1,800–2,400', rating: 4.8, type: 'Flatbed truck' },
  { name: 'Lebu Roadside Crew', eta: '22 min', price: '1,500–2,000', rating: 4.6, type: 'Hook truck' },
];

/* ── Context ─────────────────────────────────────────────────────────────── */

type DataState = {
  garages: Garage[];
  services: Service[];
  mechanics: Mechanic[];
  products: Product[];
  vehicle: Vehicle | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const DataContext = createContext<DataState>({
  garages: [],
  services: [],
  mechanics: [],
  products: [],
  vehicle: null,
  loading: true,
  refresh: async () => {},
});

export function DataProvider({ userId, children }: { userId?: string; children: React.ReactNode }) {
  const [garages, setGarages] = useState<Garage[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const [g, s, m, p] = await Promise.all([
      supabase.from('garages').select('*').order('name'),
      supabase.from('services').select('*').order('name'),
      supabase.from('mechanics').select('*').order('name'),
      supabase.from('products').select('*').order('name'),
    ]);
    setGarages((g.data ?? []).map((r: any) => ({ ...r, rating: Number(r.rating) })));
    setServices(s.data ?? []);
    setMechanics((m.data ?? []).map((r: any) => ({ ...r, rating: Number(r.rating) })));
    setProducts(p.data ?? []);

    if (userId) {
      const { data: v } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_primary', true)
        .maybeSingle();
      setVehicle(v ?? null);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [userId]);

  return React.createElement(
    DataContext.Provider,
    { value: { garages, services, mechanics, products, vehicle, loading, refresh: load } },
    children,
  );
}

export function useData() {
  return useContext(DataContext);
}

export function servicesForGarage(services: Service[], garageId: string): Service[] {
  return services.filter((s) => s.garage_id === garageId);
}
