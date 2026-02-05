/**
 * Loyalty Service
 * Fidelify - Core business logic for stamp/points management
 *
 * Este servicio encapsula toda la lógica de lealtad y se comunica
 * con las funciones RPC de Supabase para operaciones transaccionales.
 */

import { supabase } from '../lib/supabase';

/**
 * ============================================================
 * ADD STAMP - Función principal para agregar sellos/puntos
 * ============================================================
 *
 * Esta función llama al RPC `add_stamp` en PostgreSQL que:
 * 1. Valida el estado de la tarjeta
 * 2. Actualiza el balance de forma atómica
 * 3. Registra la transacción
 * 4. Verifica si se desbloqueó una recompensa
 * 5. Actualiza el tier si aplica
 *
 * @param {string} cardId - UUID de la loyalty_card
 * @param {number} amount - Cantidad de sellos/puntos a agregar (default: 1)
 * @param {Object} options - Opciones adicionales
 * @param {string} options.description - Descripción de la transacción
 * @param {string} options.locationName - Nombre de la sucursal
 * @returns {Promise<AddStampResult>}
 *
 * @example
 * const result = await addStamp('card-uuid', 1, {
 *   description: 'Visita Sucursal Centro',
 *   locationName: 'Sucursal Centro'
 * });
 *
 * if (result.success && result.reward_unlocked) {
 *   showRewardModal(result.reward_text);
 * }
 */
export async function addStamp(cardId, amount = 1, options = {}) {
  const { description = null, locationName = null, createdBy = null } = options;

  try {
    // Llamar a la función RPC de PostgreSQL
    const { data, error } = await supabase.rpc('add_stamp', {
      p_card_id: cardId,
      p_amount: amount,
      p_description: description,
      p_created_by: createdBy,
      p_location_name: locationName,
    });

    if (error) {
      console.error('[addStamp] RPC Error:', error);
      return {
        success: false,
        error: error.message,
        error_code: error.code,
      };
    }

    // La función RPC retorna un JSONB, Supabase lo parsea automáticamente
    return data;
  } catch (err) {
    console.error('[addStamp] Unexpected error:', err);
    return {
      success: false,
      error: err.message,
      error_code: 'UNEXPECTED_ERROR',
    };
  }
}

/**
 * ============================================================
 * ADD POINTS FOR PURCHASE - Calcular puntos por monto de compra
 * ============================================================
 *
 * Esta función calcula automáticamente los puntos/cashback basado en:
 * - El monto de la compra
 * - El tipo de programa (points, cashback, levels)
 * - La configuración del negocio (points_per_currency, cashback_percentage)
 *
 * @param {string} cardId - UUID de la loyalty_card
 * @param {number} purchaseAmount - Monto de la compra en moneda local
 * @param {Object} options - Opciones adicionales
 * @param {string} options.description - Descripción de la transacción
 * @param {string} options.locationName - Nombre de la sucursal
 * @param {string} options.createdBy - UUID del usuario que registra
 * @returns {Promise<AddPointsResult>}
 *
 * @example
 * const result = await addPointsForPurchase('card-uuid', 150.00, {
 *   description: 'Compra en sucursal centro',
 *   locationName: 'Sucursal Centro'
 * });
 *
 * // result incluye:
 * // - success: boolean
 * // - new_balance: número de puntos actual
 * // - calculated_points: puntos ganados en esta compra
 * // - purchase_amount: monto de la compra
 * // - program_type: 'points' | 'cashback' | 'levels'
 */
export async function addPointsForPurchase(cardId, purchaseAmount, options = {}) {
  const { description = null, locationName = null, createdBy = null } = options;

  try {
    const { data, error } = await supabase.rpc('add_points_for_purchase', {
      p_card_id: cardId,
      p_purchase_amount: purchaseAmount,
      p_description: description,
      p_created_by: createdBy,
      p_location_name: locationName,
    });

    if (error) {
      console.error('[addPointsForPurchase] RPC Error:', error);
      return {
        success: false,
        error: error.message,
        error_code: error.code,
      };
    }

    return data;
  } catch (err) {
    console.error('[addPointsForPurchase] Unexpected error:', err);
    return {
      success: false,
      error: err.message,
      error_code: 'UNEXPECTED_ERROR',
    };
  }
}

/**
 * ============================================================
 * REDEEM REWARD - Canjear una recompensa
 * ============================================================
 *
 * @param {string} cardId - UUID de la loyalty_card
 * @param {number|null} amount - Cantidad a canjear (null = target completo)
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<RedeemResult>}
 */
export async function redeemReward(cardId, amount = null, options = {}) {
  const { description = null, createdBy = null } = options;

  try {
    const { data, error } = await supabase.rpc('redeem_reward', {
      p_card_id: cardId,
      p_amount: amount,
      p_description: description,
      p_created_by: createdBy,
    });

    if (error) {
      console.error('[redeemReward] RPC Error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return data;
  } catch (err) {
    console.error('[redeemReward] Unexpected error:', err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * ============================================================
 * GET CARD - Obtener tarjeta con información del negocio
 * ============================================================
 *
 * @param {string} cardId - UUID de la loyalty_card
 * @returns {Promise<LoyaltyCard|null>}
 */
export async function getCard(cardId) {
  try {
    const { data, error } = await supabase
      .from('loyalty_cards')
      .select(
        `
        *,
        business:businesses (
          id,
          name,
          slug,
          logo_url,
          icon_url,
          strip_image_url,
          brand_color,
          background_color,
          label_color,
          program_type,
          target_value,
          reward_text,
          program_config,
          wallet_settings
        ),
        client:clients (
          id,
          full_name,
          email,
          phone,
          avatar_url
        )
      `
      )
      .eq('id', cardId)
      .single();

    if (error) {
      // Log detallado para debugging
      console.error('[getCard] Supabase Error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        cardId,
      });

      // Errores comunes de RLS
      if (error.code === 'PGRST116') {
        // "JSON object requested, multiple (or no) rows returned"
        // Esto significa que no se encontró el registro O no hay permisos
        console.warn('[getCard] Card not found or access denied (RLS)');
      }

      return null;
    }

    return data;
  } catch (err) {
    console.error('[getCard] Unexpected error:', err);
    return null;
  }
}

/**
 * ============================================================
 * GET CLIENT CARDS - Obtener todas las tarjetas de un cliente
 * ============================================================
 *
 * @param {string} clientId - UUID del cliente
 * @returns {Promise<LoyaltyCard[]>}
 */
export async function getClientCards(clientId) {
  const { data, error } = await supabase
    .from('loyalty_cards')
    .select(
      `
      *,
      business:businesses (
        id,
        name,
        slug,
        logo_url,
        strip_image_url,
        brand_color,
        background_color,
        program_type,
        target_value,
        reward_text
      )
    `
    )
    .eq('client_id', clientId)
    .eq('state', 'ACTIVE')
    .order('last_activity_at', { ascending: false });

  if (error) {
    console.error('[getClientCards] Error:', error);
    return [];
  }

  return data || [];
}

/**
 * ============================================================
 * GET CARD TRANSACTIONS - Historial de transacciones
 * ============================================================
 *
 * @param {string} cardId - UUID de la loyalty_card
 * @param {Object} options - Opciones de paginación
 * @returns {Promise<Transaction[]>}
 */
export async function getCardTransactions(cardId, options = {}) {
  const { limit = 50, offset = 0 } = options;

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('card_id', cardId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('[getCardTransactions] Error:', error);
    return [];
  }

  return data || [];
}

/**
 * ============================================================
 * CREATE LOYALTY CARD - Crear nueva tarjeta para un cliente
 * ============================================================
 *
 * @param {string} businessId - UUID del negocio
 * @param {string} clientId - UUID del cliente
 * @param {Object} options - Datos adicionales
 * @returns {Promise<LoyaltyCard|null>}
 */
export async function createLoyaltyCard(businessId, clientId, options = {}) {
  const {
    acquisitionSource = null,
    acquisitionMedium = null,
    acquisitionCampaign = null,
  } = options;

  const { data, error } = await supabase
    .from('loyalty_cards')
    .insert({
      business_id: businessId,
      client_id: clientId,
      acquisition_source: acquisitionSource,
      acquisition_medium: acquisitionMedium,
      acquisition_campaign: acquisitionCampaign,
    })
    .select()
    .single();

  if (error) {
    // Si ya existe, retornar la existente
    if (error.code === '23505') {
      // unique_violation
      const { data: existing } = await supabase
        .from('loyalty_cards')
        .select('*')
        .eq('business_id', businessId)
        .eq('client_id', clientId)
        .single();

      return existing;
    }

    console.error('[createLoyaltyCard] Error:', error);
    return null;
  }

  return data;
}

/**
 * ============================================================
 * UPDATE WALLET TOKENS - Actualizar tokens de push
 * ============================================================
 *
 * Usado cuando el usuario añade el pase a su wallet y recibimos
 * el token de push (Apple) o el object ID (Google).
 *
 * @param {string} cardId - UUID de la loyalty_card
 * @param {Object} tokens - Tokens de wallet
 */
export async function updateWalletTokens(cardId, tokens) {
  const updateData = {};

  if (tokens.applePushToken) {
    updateData.apple_push_token = tokens.applePushToken;
    updateData.apple_device_library_id = tokens.appleDeviceLibraryId;
    updateData.apple_last_updated = new Date().toISOString();
  }

  if (tokens.googleObjectId) {
    updateData.google_object_id = tokens.googleObjectId;
    updateData.google_class_id = tokens.googleClassId;
    updateData.google_last_updated = new Date().toISOString();
  }

  const { error } = await supabase
    .from('loyalty_cards')
    .update(updateData)
    .eq('id', cardId);

  if (error) {
    console.error('[updateWalletTokens] Error:', error);
    return false;
  }

  return true;
}

/**
 * ============================================================
 * GET CARDS REQUIRING WALLET UPDATE - Para push notifications
 * ============================================================
 *
 * Obtiene las tarjetas que tienen tokens de wallet y necesitan
 * ser actualizadas (después de una transacción).
 *
 * @param {string} businessId - UUID del negocio
 * @returns {Promise<LoyaltyCard[]>}
 */
export async function getCardsWithWalletTokens(businessId) {
  const { data, error } = await supabase
    .from('loyalty_cards')
    .select('id, apple_push_token, google_object_id, current_balance')
    .eq('business_id', businessId)
    .eq('state', 'ACTIVE')
    .or('apple_push_token.not.is.null,google_object_id.not.is.null');

  if (error) {
    console.error('[getCardsWithWalletTokens] Error:', error);
    return [];
  }

  return data || [];
}

/**
 * ============================================================
 * HELPER: Calculate Progress Percentage
 * ============================================================
 */
export function calculateProgress(currentBalance, targetValue) {
  if (!targetValue || targetValue <= 0) return 0;
  return Math.min(100, Math.round((currentBalance / targetValue) * 100));
}

/**
 * ============================================================
 * HELPER: Format Balance Display
 * ============================================================
 */
export function formatBalance(balance, programType, targetValue) {
  switch (programType) {
    case 'seals':
      return `${balance}/${targetValue} sellos`;
    case 'points':
      return `${balance.toLocaleString()} puntos`;
    case 'levels':
      return `${balance.toLocaleString()} XP`;
    case 'cashback':
      return `$${(balance / 100).toFixed(2)}`;
    default:
      return balance.toString();
  }
}

// Type definitions for JSDoc
/**
 * @typedef {Object} AddStampResult
 * @property {boolean} success
 * @property {string} [transaction_id]
 * @property {string} [card_id]
 * @property {number} [previous_balance]
 * @property {number} [new_balance]
 * @property {number} [lifetime_balance]
 * @property {number} [target_value]
 * @property {number} [progress_percentage]
 * @property {boolean} [reward_unlocked]
 * @property {number} [rewards_earned]
 * @property {string} [reward_text]
 * @property {string} [new_tier]
 * @property {boolean} [tier_changed]
 * @property {boolean} [requires_wallet_update]
 * @property {string} [error]
 * @property {string} [error_code]
 */

/**
 * @typedef {Object} RedeemResult
 * @property {boolean} success
 * @property {number} [redeemed_amount]
 * @property {number} [new_balance]
 * @property {boolean} [requires_wallet_update]
 * @property {string} [error]
 */

export default {
  addStamp,
  addPointsForPurchase,
  redeemReward,
  getCard,
  getClientCards,
  getCardTransactions,
  createLoyaltyCard,
  updateWalletTokens,
  getCardsWithWalletTokens,
  calculateProgress,
  formatBalance,
};
