import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const OrganizationContext = createContext(null);

export const OrganizationProvider = ({ children }) => {
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch del negocio del usuario autenticado
  const fetchOrganization = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      // Buscar el negocio donde el usuario es owner o employee
      // Primero intentamos como owner
      let { data: business, error: ownerError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_user_id', userId)
        .single();

      // Si no es owner, buscar como employee
      if (ownerError || !business) {
        const { data: employee, error: empError } = await supabase
          .from('employees')
          .select('business_id')
          .eq('auth_user_id', userId)
          .eq('is_active', true)
          .single();

        if (empError || !employee) {
          setOrganization(null);
          return;
        }

        const { data: empBusiness, error: bizError } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', employee.business_id)
          .single();

        if (bizError) throw bizError;
        business = empBusiness;
      }

      setOrganization(business);
    } catch (err) {
      console.error('Error fetching business:', err);
      setError(err.message);
      setOrganization(null);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar datos del negocio
  const updateOrganization = async (updates) => {
    if (!organization?.id) return { error: 'No business loaded' };

    try {
      const { data, error } = await supabase
        .from('businesses')
        .update(updates)
        .eq('id', organization.id)
        .select()
        .single();

      if (error) throw error;

      setOrganization(data);
      return { data };
    } catch (err) {
      console.error('Error updating business:', err);
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
    // Alias para compatibilidad
    business: organization,
    loading,
    error,
    updateOrganization,
    updateBusiness: updateOrganization,
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

// Alias para claridad
export const useBusiness = useOrganization;

export default OrganizationContext;
