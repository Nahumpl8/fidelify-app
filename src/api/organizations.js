import { supabase } from './supabaseClient';

/**
 * Obtener la organización del usuario actual
 */
export const getOrganization = async () => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: null, error: 'No user logged in' };

  // Obtener profile para saber el organization_id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  if (profileError) return { data: null, error: profileError };

  // Obtener organización
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', profile.organization_id)
    .single();

  return { data, error };
};

/**
 * Actualizar la organización
 */
export const updateOrganization = async (organizationId, updates) => {
  const { data, error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', organizationId)
    .select()
    .single();

  return { data, error };
};
