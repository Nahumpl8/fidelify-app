/**
 * Wallet Service
 * Fidelify - Apple/Google Wallet integration
 *
 * Este servicio maneja la generación y distribución de pases digitales
 * para Apple Wallet (.pkpass) y Google Wallet (JWT).
 */

import { supabase } from '../lib/supabase';

// URL base de las Edge Functions
const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL + '/functions/v1';

/**
 * ============================================================
 * APPLE WALLET
 * ============================================================
 */

/**
 * Generate Apple Wallet pass (.pkpass)
 *
 * @param {string} cardId - UUID de la loyalty_card
 * @returns {Promise<{success: boolean, downloadUrl?: string, error?: string}>}
 *
 * @example
 * const result = await generateApplePass('card-uuid');
 * if (result.success) {
 *   downloadApplePass(result.downloadUrl);
 * }
 */
export async function generateApplePass(cardId) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch(`${FUNCTIONS_URL}/generate-apple-pass`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: session?.access_token
          ? `Bearer ${session.access_token}`
          : '',
      },
      body: JSON.stringify({ cardId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate Apple pass');
    }

    return data;
  } catch (error) {
    console.error('[generateApplePass] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Download and trigger Apple Wallet add
 * En iOS Safari, esto abrirá automáticamente el diálogo de "Agregar a Wallet"
 *
 * @param {string} downloadUrl - URL del archivo .pkpass
 */
export function downloadApplePass(downloadUrl) {
  if (!downloadUrl) {
    console.error('[downloadApplePass] No download URL provided');
    return;
  }

  // Crear link temporal y hacer click
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = 'fidelify-pass.pkpass';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * ============================================================
 * GOOGLE WALLET
 * ============================================================
 */

/**
 * Generate Google Wallet pass link
 *
 * @param {string} cardId - UUID de la loyalty_card
 * @returns {Promise<{success: boolean, saveUrl?: string, objectId?: string, error?: string}>}
 *
 * @example
 * const result = await generateGooglePass('card-uuid');
 * if (result.success) {
 *   openGoogleWalletSave(result.saveUrl);
 * }
 */
export async function generateGooglePass(cardId) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch(`${FUNCTIONS_URL}/generate-google-pass`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: session?.access_token
          ? `Bearer ${session.access_token}`
          : '',
      },
      body: JSON.stringify({ cardId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate Google pass');
    }

    return data;
  } catch (error) {
    console.error('[generateGooglePass] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Open Google Wallet save URL in new tab
 * Esto abrirá la página de Google para agregar el pase
 *
 * @param {string} saveUrl - URL de "Add to Google Wallet"
 */
export function openGoogleWalletSave(saveUrl) {
  if (!saveUrl) {
    console.error('[openGoogleWalletSave] No save URL provided');
    return;
  }

  window.open(saveUrl, '_blank', 'noopener,noreferrer');
}

/**
 * ============================================================
 * PREVIEW / WIZARD
 * ============================================================
 */

/**
 * Generate a preview Google Wallet pass from wizard config
 * No database lookup - uses provided config directly
 *
 * @param {Object} config - Wizard configuration
 * @param {string} config.businessName - Business name
 * @param {string} config.programName - Program name
 * @param {string} config.programType - 'stamp', 'points', 'cashback'
 * @param {string} config.logoUrl - Logo URL (optional)
 * @param {string} config.backgroundColor - Hex color
 * @param {number} config.targetValue - Target stamps/points
 * @param {string} config.rewardText - Reward description
 * @param {number} config.currentBalance - Demo balance for preview
 * @returns {Promise<{success: boolean, saveUrl?: string, error?: string}>}
 */
export async function previewGooglePass(config) {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/preview-google-pass`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate preview');
    }

    return data;
  } catch (error) {
    console.error('[previewGooglePass] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update an existing Google Wallet pass
 * Called after balance changes (stamps, points, purchases)
 *
 * @param {string} cardId - UUID de la loyalty_card
 * @returns {Promise<{success: boolean, newBalance?: number, error?: string}>}
 */
export async function updateGooglePass(cardId) {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/update-google-pass`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cardId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update Google pass');
    }

    return data;
  } catch (error) {
    console.error('[updateGooglePass] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * ============================================================
 * HELPERS
 * ============================================================
 */

/**
 * Detectar si el dispositivo soporta Apple Wallet
 * @returns {boolean}
 */
export function supportsAppleWallet() {
  // Apple Wallet está disponible en iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isMacOS = /Macintosh/.test(navigator.userAgent);
  return isIOS || isMacOS;
}

/**
 * Detectar si el dispositivo soporta Google Wallet
 * @returns {boolean}
 */
export function supportsGoogleWallet() {
  // Google Wallet está disponible en Android y web
  const isAndroid = /Android/.test(navigator.userAgent);
  // En web también funciona
  return isAndroid || !supportsAppleWallet();
}

/**
 * Obtener la plataforma de wallet recomendada
 * @returns {'apple' | 'google' | 'both'}
 */
export function getRecommendedWalletPlatform() {
  if (supportsAppleWallet() && !supportsGoogleWallet()) return 'apple';
  if (supportsGoogleWallet() && !supportsAppleWallet()) return 'google';
  return 'both';
}

export default {
  // Apple Wallet
  generateApplePass,
  downloadApplePass,
  supportsAppleWallet,

  // Google Wallet
  generateGooglePass,
  openGoogleWalletSave,
  supportsGoogleWallet,
  updateGooglePass,

  // Preview / Wizard
  previewGooglePass,

  // Helpers
  getRecommendedWalletPlatform,
};
