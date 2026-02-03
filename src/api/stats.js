import { supabase } from '../lib/supabase';

/**
 * Obtener estadísticas del dashboard
 */
export const getDashboardStats = async (businessId) => {
  try {
    // Total de tarjetas (clientes)
    const { count: totalCustomers, error: customersError } = await supabase
      .from('loyalty_cards')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId);

    if (customersError) throw customersError;

    // Tarjetas activas (con balance > 0)
    const { count: activeCards, error: activeError } = await supabase
      .from('loyalty_cards')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('state', 'ACTIVE')
      .gt('current_balance', 0);

    if (activeError) throw activeError;

    // Total de puntos/sellos otorgados
    const { data: earnData, error: earnError } = await supabase
      .from('transactions')
      .select('amount, card_id')
      .eq('type', 'EARN')
      .in('card_id',
        supabase
          .from('loyalty_cards')
          .select('id')
          .eq('business_id', businessId)
      );

    // Alternativa si el subquery no funciona
    const { data: cards } = await supabase
      .from('loyalty_cards')
      .select('id')
      .eq('business_id', businessId);

    const cardIds = cards?.map(c => c.id) || [];

    let totalPointsGiven = 0;
    if (cardIds.length > 0) {
      const { data: txData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'EARN')
        .in('card_id', cardIds);

      totalPointsGiven = txData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
    }

    // Recompensas canjeadas
    let rewardsRedeemed = 0;
    if (cardIds.length > 0) {
      const { count } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'REDEEM')
        .in('card_id', cardIds);

      rewardsRedeemed = count || 0;
    }

    // Clientes nuevos este mes
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: newCustomersThisMonth, error: newError } = await supabase
      .from('loyalty_cards')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .gte('created_at', startOfMonth.toISOString());

    if (newError) throw newError;

    return {
      data: {
        totalCustomers: totalCustomers || 0,
        activeCards: activeCards || 0,
        totalPointsGiven,
        rewardsRedeemed,
        newCustomersThisMonth: newCustomersThisMonth || 0,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Obtener actividad reciente
 */
export const getRecentActivity = async (businessId, limit = 10) => {
  // Primero obtener las tarjetas del negocio
  const { data: cards } = await supabase
    .from('loyalty_cards')
    .select('id')
    .eq('business_id', businessId);

  const cardIds = cards?.map(c => c.id) || [];

  if (cardIds.length === 0) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      card:loyalty_cards (
        id,
        client:clients (
          full_name,
          email
        )
      )
    `)
    .in('card_id', cardIds)
    .order('created_at', { ascending: false })
    .limit(limit);

  // Transformar para compatibilidad
  const activity = data?.map(tx => ({
    ...tx,
    customers: tx.card?.client ? {
      full_name: tx.card.client.full_name,
      email: tx.card.client.email,
    } : null,
  })) || [];

  return { data: activity, error };
};
