import { supabase } from './supabaseClient';

/**
 * Obtener estadísticas del dashboard
 */
export const getDashboardStats = async (organizationId) => {
  try {
    // Total de clientes
    const { count: totalCustomers, error: customersError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);

    if (customersError) throw customersError;

    // Pases activos (clientes con puntos > 0)
    const { count: activeCards, error: activeError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .gt('current_points', 0);

    if (activeError) throw activeError;

    // Total de puntos otorgados (suma de transacciones tipo 'earn')
    const { data: pointsData, error: pointsError } = await supabase
      .from('transactions')
      .select('points_change')
      .eq('organization_id', organizationId)
      .eq('type', 'earn');

    if (pointsError) throw pointsError;

    const totalPointsGiven = pointsData?.reduce(
      (sum, t) => sum + t.points_change,
      0
    ) || 0;

    // Recompensas canjeadas
    const { count: rewardsRedeemed, error: rewardsError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('type', 'redeem');

    if (rewardsError) throw rewardsError;

    // Clientes nuevos este mes
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: newCustomersThisMonth, error: newError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .gte('created_at', startOfMonth.toISOString());

    if (newError) throw newError;

    return {
      data: {
        totalCustomers: totalCustomers || 0,
        activeCards: activeCards || 0,
        totalPointsGiven,
        rewardsRedeemed: rewardsRedeemed || 0,
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
export const getRecentActivity = async (organizationId, limit = 10) => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      customers (
        full_name,
        email
      )
    `)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data, error };
};
