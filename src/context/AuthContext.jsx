import { createContext, useState, useEffect } from 'react';
import { useContext } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);

      if (session?.user) {
        fetchPreferences(session.user.id);
      }

      setLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);

      if (session?.user) {
        fetchPreferences(session.user.id);
      } else {
        setPreferences(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchPreferences(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      setPreferences(data?.preferences || null);
    } catch (error) {
      console.log('Error fetching preferences: ', error);

      setPreferences(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, preferences }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
