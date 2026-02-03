import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Registro de nuevo usuario + negocio
  const signUp = async ({ email, password, fullName, businessName }) => {
    try {
      // 1. Crear usuario en auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      const userId = authData.user.id;

      // 2. Crear negocio (business)
      const slug = businessName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert({
          name: businessName,
          slug: `${slug}-${Date.now().toString(36)}`,
          owner_user_id: userId,
        })
        .select()
        .single();

      if (businessError) throw businessError;

      // 3. Crear employee como owner
      const { error: employeeError } = await supabase.from('employees').insert({
        business_id: business.id,
        auth_user_id: userId,
        name: fullName,
        email: email,
        role: 'owner',
        permissions: {
          can_add_stamps: true,
          can_redeem: true,
          can_adjust: true,
          can_view_reports: true,
          can_manage_settings: true,
        },
      });

      if (employeeError) throw employeeError;

      return { data: authData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Login
  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  // Logout
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  // Reset password
  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
