import { supabase } from '../lib/supabase';

/**
 * Obtener todos los clientes del negocio (via loyalty_cards)
 */
export const getCustomers = async (businessId) => {
  const { data, error } = await supabase
    .from('loyalty_cards')
    .select(`
      id,
      current_balance,
      lifetime_balance,
      rewards_redeemed,
      state,
      tier_level,
      last_visit_at,
      total_visits,
      created_at,
      client:clients (
        id,
        full_name,
        email,
        phone,
        avatar_url,
        birthday
      ),
      business:businesses (
        name,
        target_value,
        reward_text,
        program_type
      )
    `)
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  // Transformar para mantener compatibilidad con el frontend
  const customers = data?.map(card => ({
    id: card.client?.id,
    card_id: card.id,
    full_name: card.client?.full_name,
    email: card.client?.email,
    phone: card.client?.phone,
    avatar_url: card.client?.avatar_url,
    birthday: card.client?.birthday,
    current_points: card.current_balance,
    lifetime_points: card.lifetime_balance,
    rewards_redeemed: card.rewards_redeemed,
    state: card.state,
    tier_level: card.tier_level,
    last_visit_at: card.last_visit_at,
    total_visits: card.total_visits,
    created_at: card.created_at,
    loyalty_cards: card.business ? {
      name: card.business.name,
      reward_threshold: card.business.target_value,
      reward_description: card.business.reward_text,
    } : null,
  })) || [];

  return { data: customers, error };
};

/**
 * Obtener un cliente por ID de tarjeta
 */
export const getCustomer = async (cardId) => {
  const { data: card, error } = await supabase
    .from('loyalty_cards')
    .select(`
      id,
      current_balance,
      lifetime_balance,
      rewards_redeemed,
      state,
      tier_level,
      last_visit_at,
      total_visits,
      created_at,
      client:clients (
        id,
        full_name,
        email,
        phone,
        avatar_url,
        birthday
      ),
      business:businesses (
        name,
        target_value,
        reward_text,
        program_type
      )
    `)
    .eq('id', cardId)
    .single();

  if (error || !card) return { data: null, error };

  const customer = {
    id: card.client?.id,
    card_id: card.id,
    full_name: card.client?.full_name,
    email: card.client?.email,
    phone: card.client?.phone,
    avatar_url: card.client?.avatar_url,
    birthday: card.client?.birthday,
    current_points: card.current_balance,
    lifetime_points: card.lifetime_balance,
    rewards_redeemed: card.rewards_redeemed,
    state: card.state,
    tier_level: card.tier_level,
    last_visit_at: card.last_visit_at,
    total_visits: card.total_visits,
    created_at: card.created_at,
    loyalty_cards: card.business ? {
      name: card.business.name,
      reward_threshold: card.business.target_value,
      reward_description: card.business.reward_text,
    } : null,
  };

  return { data: customer, error: null };
};

/**
 * Crear un nuevo cliente y su tarjeta de lealtad
 */
export const createCustomer = async (customerData) => {
  const { business_id, full_name, email, phone, birthday } = customerData;

  // 1. Crear o encontrar el cliente
  let client;

  // Buscar si ya existe por email o phone
  if (email) {
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .ilike('email', email)
      .single();

    if (existing) {
      client = existing;
    }
  }

  if (!client && phone) {
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('phone', phone)
      .single();

    if (existing) {
      client = existing;
    }
  }

  // Si no existe, crear nuevo cliente
  if (!client) {
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({
        full_name,
        email,
        phone,
        birthday,
      })
      .select()
      .single();

    if (clientError) return { data: null, error: clientError };
    client = newClient;
  }

  // 2. Crear la tarjeta de lealtad
  const { data: card, error: cardError } = await supabase
    .from('loyalty_cards')
    .insert({
      business_id,
      client_id: client.id,
    })
    .select()
    .single();

  if (cardError) {
    // Si ya existe la tarjeta, obtenerla
    if (cardError.code === '23505') {
      const { data: existingCard } = await supabase
        .from('loyalty_cards')
        .select('*')
        .eq('business_id', business_id)
        .eq('client_id', client.id)
        .single();

      return { data: existingCard, error: null };
    }
    return { data: null, error: cardError };
  }

  return { data: card, error: null };
};

/**
 * Actualizar un cliente
 */
export const updateCustomer = async (clientId, updates) => {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', clientId)
    .select()
    .single();

  return { data, error };
};

/**
 * Eliminar un cliente (soft delete - suspender tarjeta)
 */
export const deleteCustomer = async (cardId) => {
  const { error } = await supabase
    .from('loyalty_cards')
    .update({ state: 'SUSPENDED' })
    .eq('id', cardId);

  return { error };
};

/**
 * Registrar una visita (agregar puntos/sellos)
 */
export const registerVisit = async ({
  cardId,
  businessId,
  pointsToAdd,
  description = 'Visita registrada',
  processedBy,
}) => {
  // Usar la función RPC add_stamp
  const { data, error } = await supabase.rpc('add_stamp', {
    p_card_id: cardId,
    p_amount: pointsToAdd,
    p_description: description,
    p_created_by: processedBy,
  });

  if (error) return { data: null, error };

  return {
    data: {
      transaction: data,
      newBalance: data.new_balance,
    },
    error: null,
  };
};

/**
 * Canjear recompensa (restar puntos)
 */
export const redeemReward = async ({
  cardId,
  pointsToRedeem,
  description = 'Recompensa canjeada',
  processedBy,
}) => {
  // Usar la función RPC redeem_reward
  const { data, error } = await supabase.rpc('redeem_reward', {
    p_card_id: cardId,
    p_amount: pointsToRedeem,
    p_description: description,
    p_created_by: processedBy,
  });

  if (error) return { data: null, error };

  return {
    data: {
      transaction: data,
      newBalance: data.new_balance,
    },
    error: null,
  };
};
