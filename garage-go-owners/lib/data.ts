// Local seed content for the demo screens. Auth and booking writes still hit
// Supabase; this guarantees the catalog renders in Expo Go regardless of what's
// seeded in the database.

export type Garage = {
  id: string; name: string; area: string; dist: string; rating: number;
  reviews: number; from: number; hours: string; open: boolean; tags: string[];
};
export const garages: Garage[] = [
  { id: 'g1', name: 'Bole Auto Care', area: 'Bole', dist: '1.2 km', rating: 4.9, reviews: 214, from: 650, hours: 'Open · closes 8 PM', open: true, tags: ['Engine', 'Diagnostics', 'AC'] },
  { id: 'g2', name: 'Habesha Motors', area: 'Kazanchis', dist: '2.8 km', rating: 4.7, reviews: 168, from: 500, hours: 'Open · closes 7 PM', open: true, tags: ['Electrical', 'Body work'] },
  { id: 'g3', name: 'Gerji Garage & Tyre', area: 'Gerji', dist: '4.1 km', rating: 4.6, reviews: 97, from: 420, hours: 'Open · closes 9 PM', open: true, tags: ['Tyres', 'Suspension'] },
  { id: 'g4', name: 'Summit Car Clinic', area: 'Summit', dist: '5.6 km', rating: 4.5, reviews: 143, from: 700, hours: 'Opens 8 AM tomorrow', open: false, tags: ['Engine', 'Gearbox'] },
];

export type Service = { n: string; d: string; p: number };
export const services: Service[] = [
  { n: 'Full engine diagnostics', d: '45–60 min · OBD scan + report', p: 650 },
  { n: 'Oil & filter change', d: '30 min · parts extra', p: 480 },
  { n: 'Brake pad replacement', d: '1–2 hrs · labour only', p: 900 },
  { n: 'AC regas & check', d: '1 hr', p: 1200 },
];

export const timeSlots = ['08:30', '10:00', '11:30', '14:00', '15:30', '17:00'];

export type Mechanic = { name: string; phone: string; area: string; exp: string; eta: string; dist: string; tags: string[] };
export const mechanics: Mechanic[] = [
  { name: 'Abebe Tesfaye', phone: '+251911248763', area: 'Bole · Rwanda St.', exp: '12 yrs', eta: '6 min', dist: '1.4 km', tags: ['Engine', 'Electrical', 'Battery'] },
  { name: 'Kalkidan Bekele', phone: '+251913550219', area: 'Megenagna', exp: '8 yrs', eta: '11 min', dist: '3.2 km', tags: ['Tyres', 'Brakes'] },
  { name: 'Yonas Girma', phone: '+251921764108', area: 'CMC · Gerji', exp: '15 yrs', eta: '17 min', dist: '5.0 km', tags: ['Gearbox', 'Diagnostics'] },
];

export type RoadsideProvider = { name: string; eta: string; price: string; rating: number; type: string };
export const providers: RoadsideProvider[] = [
  { name: 'Addis Tow 24/7', eta: '14 min', price: '1,800–2,400', rating: 4.8, type: 'Flatbed truck' },
  { name: 'Lebu Roadside Crew', eta: '22 min', price: '1,500–2,000', rating: 4.6, type: 'Hook truck' },
];

export type Product = { id: string; n: string; c: string; category: string; p: number; tag?: string; seller: string; phone: string };
export const products: Product[] = [
  { id: 'p1', n: 'Bosch S4 Battery', c: 'Battery · 60Ah', category: 'Car parts', p: 4200, tag: 'New', seller: 'Addis Auto Parts', phone: '+251911000001' },
  { id: 'p2', n: 'Michelin 195/65 R15', c: 'Tyre · set of 4', category: 'Tyres', p: 38000, tag: 'Popular', seller: 'Tyre Hub Bole', phone: '+251911000002' },
  { id: 'p3', n: 'Total 5W-30 Synthetic', c: 'Engine oil · 4L', category: 'Oils', p: 2650, tag: 'New', seller: 'LubeMart', phone: '+251911000003' },
  { id: 'p4', n: 'Brake pad set — Vitz', c: 'Brakes · front', category: 'Car parts', p: 1900, seller: 'Addis Auto Parts', phone: '+251911000001' },
  { id: 'p5', n: 'LED headlight H4', c: 'Lighting · pair', category: 'Accessories', p: 1450, seller: 'AutoGlow', phone: '+251911000004' },
  { id: 'p6', n: 'OBD2 Scanner ELM327', c: 'Tools · Bluetooth', category: 'Tools', p: 1100, tag: 'Deal', seller: 'DiagPro', phone: '+251911000005' },
];

export const primaryVehicle = { make: 'Toyota', model: 'Vitz', year: 2014, plate: 'AA-3-12345', mileage: 88400, nextServiceKm: 90000 };
