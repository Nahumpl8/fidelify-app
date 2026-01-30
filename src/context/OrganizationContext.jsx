import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';

const OrganizationContext = createContext(null);

export const OrganizationProvider = ({ children }) => {
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch de la organización del usuario autenticado
  const fetchOrganization = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      // Primero obtenemos el profile para saber la organization_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      if (!profile?.organization_id) {
        setOrganization(null);
        return;
      }

      // Luego obtenemos los datos completos de la organización
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.organization_id)
        .single();

      if (orgError) throw orgError;

      setOrganization(org);
    } catch (err) {
      console.error('Error fetching organization:', err);
      setError(err.message);
      setOrganization(null);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar datos de la organización
  const updateOrganization = async (updates) => {
    if (!organization?.id) return { error: 'No organization loaded' };

    try {
      const { data, error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', organization.id)
        .select()
        .single();

      if (error) throw error;

      setOrganization(data);
      return { data };
    } catch (err) {
      console.error('Error updating organization:', err);
      return { error: err.message };
    }
  };

  // Escuchar cambios de autenticación
  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchOrganization(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Suscribirse a cambios de auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchOrganization(session.user.id);
      } else {
        setOrganization(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    organization,
    loading,
    error,
    updateOrganization,
    refetch: () => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          fetchOrganization(session.user.id);
        }
      });
    },
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider');
  }
  return context;
};

export default OrganizationContext;
