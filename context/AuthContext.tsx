import { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  organizationId: string | null;
  isLoading: boolean;
  isGuest: boolean;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  organizationId: null,
  isLoading: true,
  isGuest: false,
  signInAnonymously: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchOrg(session.user.id);
      } else {
        // Check for guest mode
        checkGuestMode();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setIsGuest(false); // If we have a session, we are not a guest anymore (or upgraded)
        fetchOrg(session.user.id);
      } else {
        setOrganizationId(null);
        // We might be logging out, so check guest mode again or just rely on manual sign in
         checkGuestMode();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkGuestMode() {
    try {
      const guestFlag = await AsyncStorage.getItem('is_guest');
      if (guestFlag === 'true') {
        setIsGuest(true);
      } else {
        setIsGuest(false);
      }
    } catch (e) {
      console.error('Error checking guest mode', e);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchOrg(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .single();
    setOrganizationId(data?.organization_id ?? null);
    setIsLoading(false);
  }

  async function signInAnonymously() {
    try {
      await AsyncStorage.setItem('is_guest', 'true');
      setIsGuest(true);
    } catch (e) {
      console.error('Error signing in anonymously', e);
    }
  }

  async function signOut() {
    try {
      if (session) {
        await supabase.auth.signOut();
      }
      await AsyncStorage.removeItem('is_guest');
      setIsGuest(false);
      setSession(null);
      setOrganizationId(null);
    } catch (e) {
      console.error('Error signing out', e);
    }
  }

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      organizationId,
      isLoading,
      isGuest,
      signInAnonymously,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}
