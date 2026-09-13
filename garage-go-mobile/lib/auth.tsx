import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  points: number;
  city: string | null;
  avatar_url: string | null;
};

type DemoUser = { name: string; phone: string };
const DEMO_KEY = 'demo_session';

// Phone OTP requires an SMS provider (e.g. Twilio) wired into Supabase Auth to
// actually deliver a code. Until that's configured, the OTP screens sign the
// user in with a local "demo" session so the app is fully usable. Real Supabase
// sessions still take priority when they exist.
function demoProfile(d: DemoUser): Profile {
  return { id: 'demo', full_name: d.name || 'Dawit Mekonnen', phone: d.phone, role: 'customer', points: 640, city: 'Addis Ababa', avatar_url: null };
}

type AuthState = {
  session: Session | null;
  profile: Profile | null;
  authed: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  demoSignIn: (phone: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  session: null,
  profile: null,
  authed: false,
  loading: true,
  refreshProfile: async () => {},
  demoSignIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [demo, setDemo] = useState<DemoUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile((data as Profile) ?? null);
  }

  async function refreshProfile() {
    if (session?.user) await loadProfile(session.user.id);
  }

  useEffect(() => {
    // Restore a real session and/or a saved demo session on launch.
    Promise.all([
      supabase.auth.getSession(),
      AsyncStorage.getItem(DEMO_KEY),
    ]).then(([{ data }, demoRaw]) => {
      setSession(data.session);
      if (data.session?.user) loadProfile(data.session.user.id);
      if (demoRaw) { try { setDemo(JSON.parse(demoRaw)); } catch {} }
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) loadProfile(s.user.id);
      else setProfile(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function demoSignIn(phone: string, name?: string) {
    const d: DemoUser = { name: name || '', phone };
    await AsyncStorage.setItem(DEMO_KEY, JSON.stringify(d));
    setDemo(d);
  }

  async function signOut() {
    try { await supabase.auth.signOut(); } catch {}
    await AsyncStorage.removeItem(DEMO_KEY);
    setDemo(null);
    setSession(null);
    setProfile(null);
  }

  const effectiveProfile = session ? profile : demo ? demoProfile(demo) : null;
  const authed = !!session || !!demo;

  return (
    <AuthContext.Provider value={{ session, profile: effectiveProfile, authed, loading, refreshProfile, demoSignIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
