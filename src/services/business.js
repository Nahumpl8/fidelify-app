/**
 * Business Service
 * Fidelify - CRUD operations for business management
 */

import { supabase } from '../lib/supabase';

/**
 * Get business by slug (public)
 * Used for /join/{slug} registration page
 *
 * @param {string} slug - URL-friendly business identifier
 * @returns {Promise<Business|null>}
 */
export async function getBusinessBySlug(slug) {
  const { data, error } = await supabase
    .from('businesses')
    .select(
      `
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
      back_fields,
      is_active
    `
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('[getBusinessBySlug] Error:', error);
    return null;
  }

  return data;
}

/**
 * Get business by ID with full details (for owners)
 *
 * @param {string} businessId - UUID
 * @returns {Promise<Business|null>}
 */
export async function getBusiness(businessId) {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single();

  if (error) {
    console.error('[getBusiness] Error:', error);
    return null;
  }

  return data;
}

/**
 * Get all businesses owned by the current user
 *
 * @returns {Promise<Business[]>}
 */
export async function getMyBusinesses() {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getMyBusinesses] Error:', error);
    return [];
  }

  return data || [];
}

/**
 * Create a new business
 *
 * @param {Object} businessData
 * @returns {Promise<Business|null>}
 */
export async function createBusiness(businessData) {
  const { data, error } = await supabase
    .from('businesses')
    .insert(businessData)
    .select()
    .single();

  if (error) {
    console.error('[createBusiness] Error:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Update business settings
 *
 * @param {string} businessId
 * @param {Object} updates
 * @returns {Promise<Business|null>}
 */
export async function updateBusiness(businessId, updates) {
  const { data, error } = await supabase
    .from('businesses')
    .update(updates)
    .eq('id', businessId)
    .select()
    .single();

  if (error) {
    console.error('[updateBusiness] Error:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Update wallet settings specifically
 *
 * @param {string} businessId
 * @param {Object} walletSettings
 */
export async function updateWalletSettings(businessId, walletSettings) {
  // Merge with existing settings
  const { data: current } = await supabase
    .from('businesses')
    .select('wallet_settings')
    .eq('id', businessId)
    .single();

  const merged = {
    ...current?.wallet_settings,
    ...walletSettings,
  };

  return updateBusiness(businessId, { wallet_settings: merged });
}

/**
 * Get business statistics
 *
 * @param {string} businessId
 * @returns {Promise<BusinessStats>}
 */
export async function getBusinessStats(businessId) {
  // Get card counts by state
  const { data: cardStats } = await supabase
    .from('loyalty_cards')
    .select('state')
    .eq('business_id', businessId);

  // Get transaction counts for today
  const today = new Date().toISOString().split('T')[0];
  const { count: todayTransactions } = await supabase
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .eq('card_id.business_id', businessId)
    .gte('created_at', today);

  // Calculate stats
  const cards = cardStats || [];
  const activeCards = cards.filter((c) => c.state === 'ACTIVE').length;
  const totalCards = cards.length;

  return {
    totalCards,
    activeCards,
    todayTransactions: todayTransactions || 0,
  };
}

/**
 * Check if slug is available
 *
 * @param {string} slug
 * @returns {Promise<boolean>}
 */
export async function isSlugAvailable(slug) {
  const { data } = await supabase
    .from('businesses')
    .select('id')
    .eq('slug', slug.toLowerCase())
    .single();

  return !data;
}

/**
 * Generate a unique slug from business name
 *
 * @param {string} name
 * @returns {Promise<string>}
 */
export async function generateSlug(name) {
  // Basic slug generation
  let slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Check availability and add suffix if needed
  let finalSlug = slug;
  let counter = 1;

  while (!(await isSlugAvailable(finalSlug))) {
    finalSlug = `${slug}-${counter}`;
    counter++;
  }

  return finalSlug;
}

export default {
  getBusinessBySlug,
  getBusiness,
  getMyBusinesses,
  createBusiness,
  updateBusiness,
  updateWalletSettings,
  getBusinessStats,
  isSlugAvailable,
  generateSlug,
};
