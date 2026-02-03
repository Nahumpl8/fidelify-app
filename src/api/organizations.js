import { supabase } from '../lib/supabase';

/**
 * Obtener el negocio del usuario actual
 */
export const getOrganization = async () => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: null, error: 'No user logged in' };

  // Primero intentar como owner
  let { data: business, error: ownerError } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_user_id', user.id)
    .single();

  // Si no es owner, buscar como employee
  if (ownerError || !business) {
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('business_id')
      .eq('auth_user_id', user.id)
      .eq('is_active', true)
      .single();

    if (empError || !employee) {
      return { data: null, error: 'No business found for user' };
    }

    const { data: empBusiness, error: bizError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', employee.business_id)
      .single();

    if (bizError) return { data: null, error: bizError };
    business = empBusiness;
  }

  return { data: business, error: null };
};

/**
 * Actualizar el negocio
 */
export const updateOrganization = async (businessId, updates) => {
  const { data, error } = await supabase
    .from('businesses')
    .update(updates)
    .eq('id', businessId)
    .select()
    .single();

  return { data, error };
};

// Alias para claridad
export const getBusiness = getOrganization;
export const updateBusiness = updateOrganization;
