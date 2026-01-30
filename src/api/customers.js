import { supabase } from './supabaseClient';

/**
 * Obtener todos los clientes de la organización
 */
export const getCustomers = async (organizationId) => {
  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      loyalty_cards (
        name,
        reward_threshold,
        reward_description
      )
    `)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  return { data, error };
};

/**
 * Obtener un cliente por ID
 */
export const getCustomer = async (customerId) => {
  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      loyalty_cards (
        name,
        reward_threshold,
        reward_description
      )
    `)
    .eq('id', customerId)
    .single();

  return { data, error };
};

/**
 * Crear un nuevo cliente
 */
export const createCustomer = async (customerData) => {
  const { data, error } = await supabase
    .from('customers')
    .insert(customerData)
    .select()
    .single();

  return { data, error };
};

/**
 * Actualizar un cliente
 */
export const updateCustomer = async (customerId, updates) => {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', customerId)
    .select()
    .single();

  return { data, error };
};

/**
 * Eliminar un cliente
 */
export const deleteCustomer = async (customerId) => {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', customerId);

  return { error };
};

/**
 * Registrar una visita (agregar puntos)
 */
export const registerVisit = async ({
  customerId,
  organizationId,
  loyaltyCardId,
  pointsToAdd,
  description = 'Visita registrada',
  processedBy,
}) => {
  // 1. Obtener puntos actuales del cliente
  const { data: customer, error: fetchError } = await supabase
    .from('customers')
    .select('current_points, lifetime_points')
    .eq('id', customerId)
    .single();

  if (fetchError) return { data: null, error: fetchError };

  const newCurrentPoints = customer.current_points + pointsToAdd;
  const newLifetimePoints = customer.lifetime_points + pointsToAdd;

  // 2. Actualizar puntos del cliente
  const { error: updateError } = await supabase
    .from('customers')
    .update({
      current_points: newCurrentPoints,
      lifetime_points: newLifetimePoints,
      last_visit_at: new Date().toISOString(),
    })
    .eq('id', customerId);

  if (updateError) return { data: null, error: updateError };

  // 3. Crear transacción
  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .insert({
      organization_id: organizationId,
      customer_id: customerId,
      loyalty_card_id: loyaltyCardId,
      type: 'earn',
      points_change: pointsToAdd,
      points_balance_after: newCurrentPoints,
      description,
      processed_by: processedBy,
    })
    .select()
    .single();

  if (transactionError) return { data: null, error: transactionError };

  return {
    data: {
      transaction,
      newBalance: newCurrentPoints,
    },
    error: null,
  };
};

/**
 * Canjear recompensa (restar puntos)
 */
export const redeemReward = async ({
  customerId,
  organizationId,
  loyaltyCardId,
  pointsToRedeem,
  description = 'Recompensa canjeada',
  processedBy,
}) => {
  // 1. Obtener puntos actuales
  const { data: customer, error: fetchError } = await supabase
    .from('customers')
    .select('current_points, rewards_redeemed')
    .eq('id', customerId)
    .single();

  if (fetchError) return { data: null, error: fetchError };

  if (customer.current_points < pointsToRedeem) {
    return { data: null, error: { message: 'Puntos insuficientes' } };
  }

  const newCurrentPoints = customer.current_points - pointsToRedeem;

  // 2. Actualizar cliente
  const { error: updateError } = await supabase
    .from('customers')
    .update({
      current_points: newCurrentPoints,
      rewards_redeemed: customer.rewards_redeemed + 1,
    })
    .eq('id', customerId);

  if (updateError) return { data: null, error: updateError };

  // 3. Crear transacción
  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .insert({
      organization_id: organizationId,
      customer_id: customerId,
      loyalty_card_id: loyaltyCardId,
      type: 'redeem',
      points_change: -pointsToRedeem,
      points_balance_after: newCurrentPoints,
      description,
      processed_by: processedBy,
    })
    .select()
    .single();

  if (transactionError) return { data: null, error: transactionError };

  return {
    data: {
      transaction,
      newBalance: newCurrentPoints,
    },
    error: null,
  };
};
