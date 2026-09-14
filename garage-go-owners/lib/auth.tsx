import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

// The Owners app serves three operator personas. They map onto the shared
// `profiles.role` check constraint: 'garage' | 'mechanic' | seller. The DB has
// no dedicated 'seller' role, so sellers are stored as role 'garage' too but
// flagged locally; `OwnerRole` is the app-facing type used for navigation.
export type OwnerRole = 'garage' | 'mechanic' | 'seller';

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  phone_verified: boolean;
  role: string;            // raw DB role ('customer' | 'garage' | 'mechanic' | 'admin')
  points: number;
  city: string | null;
  avatar_url: string | null;
};

// Dev-only local session (EXPO_PUBLIC_DEV_OTP=1). Lets you explore the operator
// console before the real SMS backend is wired. A real Supabase session wins.
type DemoUser = { name: string; phone: string; role: OwnerRole; business?: string };
const DEMO_KEY = 'owner_demo_session';
const ROLE_KEY = 'owner_role';

function demoProfile(d: DemoUser): Profile {
  return {
    id: 'demo',
    full_name: d.name || 'Operator',
    phone: d.phone,
    phone_verified: true,
    role: d.role === 'mechanic' ? 'mechanic' : 'garage',
    points: 0,
    city: 'Addis Ababa',
    avatar_url: null,
  };
}

// The DB role is coarse; we persist the finer app role (seller vs garage) locally.
function inferRole(profile: Profile | null, stored: OwnerRole | null): OwnerRole {
  if (stored) return stored;
  if (profile?.role === 'mechanic') return 'mechanic';
  return 'garage';
}

type AuthState = {
  session: Session | null;
  profile: Profile | null;
  role: OwnerRole;
  authed: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  setRole: (r: OwnerRole) => Promise<void>;
  demoSignIn: (args: { phone: string; name?: string; role: OwnerRole; business?: string }) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  session: null,
  profile: null,
  role: 'garage',
  authed: false,
  loading: true,
  refreshProfile: async () => {},
  setRole: async () => {},
  demoSignIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [demo, setDemo] = useState<DemoUser | null>(null);
  const [storedRole, setStoredRole] = useState<OwnerRole | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile((data as Profile) ?? null);
  }
  async function refreshProfile() {
    if (session?.user) await loadProfile(session.user.id);
  }

  useEffect(() => {
    Promise.all([
      supabase.auth.getSession(),
      AsyncStorage.getItem(DEMO_KEY),
      AsyncStorage.getItem(ROLE_KEY),
    ]).then(([{ data }, demoRaw, roleRaw]) => {
      setSession(data.session);
      if (data.session?.user) loadProfile(data.session.user.id);
      if (demoRaw) { try { setDemo(JSON.parse(demoRaw)); } catch {} }
      if (roleRaw === 'garage' || roleRaw === 'mechanic' || roleRaw === 'seller') setStoredRole(roleRaw);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) loadProfile(s.user.id);
      else setProfile(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function setRole(r: OwnerRole) {
    setStoredRole(r);
    await AsyncStorage.setItem(ROLE_KEY, r);
  }

  async function demoSignIn({ phone, name, role, business }: { phone: string; name?: string; role: OwnerRole; business?: string }) {
    const d: DemoUser = { name: name || '', phone, role, business };
    await AsyncStorage.setItem(DEMO_KEY, JSON.stringify(d));
    await AsyncStorage.setItem(ROLE_KEY, role);
    setDemo(d);
    setStoredRole(role);
  }

  async function signOut() {
    try { await supabase.auth.signOut(); } catch {}
    await AsyncStorage.multiRemove([DEMO_KEY, ROLE_KEY]);
    setDemo(null);
    setStoredRole(null);
    setSession(null);
    setProfile(null);
  }

  const effectiveProfile = session ? profile : demo ? demoProfile(demo) : null;
  const role = inferRole(effectiveProfile, demo?.role ?? storedRole);

  return (
    <AuthContext.Provider
      value={{
        session,
        profile: effectiveProfile,
        role,
        authed: !!session || !!demo,
        loading,
        refreshProfile,
        setRole,
        demoSignIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
