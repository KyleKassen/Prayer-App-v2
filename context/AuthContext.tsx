import { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  organizationId: string | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({ session: null, user: null, organizationId: null, isLoading: true });

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchOrg(session.user.id);
      else setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchOrg(session.user.id);
      else {
        setOrganizationId(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchOrg(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .single();
    setOrganizationId(data?.organization_id ?? null);
    setIsLoading(false);
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, organizationId, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
