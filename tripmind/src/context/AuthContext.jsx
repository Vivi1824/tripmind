import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) {
        setUser(data.session?.user || null);
        setLoading(false);
      }
    };

    initSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user || null);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  };

  const register = async (email, password) => {
    return await supabase.auth.signUp({
      email,
      password,
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);