import html2canvas from 'html2canvas';
import { supabase } from '../lib/supabase';

/**
 * Google Wallet heroImage dimensions
 */
const GOOGLE_HERO_WIDTH = 1032;
const GOOGLE_HERO_HEIGHT = 336;

/**
 * Capture a DOM element as a PNG blob, resized to Google Wallet heroImage dimensions
 *
 * @param {HTMLElement} element - The DOM element to capture (StripCanvas wrapper)
 * @returns {Promise<Blob|null>} PNG blob or null on failure
 */
export async function captureElementAsBlob(element) {
  if (!element) {
    console.warn('[captureStrip] No element provided');
    return null;
  }

  try {
    // Capture the DOM element at 2x scale for quality
    const sourceCanvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
    });

    // Resize to Google Wallet heroImage dimensions
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = GOOGLE_HERO_WIDTH;
    outputCanvas.height = GOOGLE_HERO_HEIGHT;
    const ctx = outputCanvas.getContext('2d');

    // Draw the captured image scaled to fit
    ctx.drawImage(sourceCanvas, 0, 0, GOOGLE_HERO_WIDTH, GOOGLE_HERO_HEIGHT);

    return new Promise((resolve) => {
      outputCanvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  } catch (err) {
    console.error('[captureStrip] html2canvas error:', err);
    return null;
  }
}

/**
 * Capture a DOM element and upload to Supabase Storage
 *
 * @param {HTMLElement} element - The DOM element to capture
 * @param {string} orgId - Organization/business UUID
 * @returns {Promise<string|null>} Public URL or null on failure
 */
export async function captureAndUploadStrip(element, orgId) {
  if (!orgId) {
    console.warn('[captureStrip] No orgId provided');
    return null;
  }

  try {
    const blob = await captureElementAsBlob(element);
    if (!blob) return null;

    const fileName = `strip_hero_${Date.now()}.png`;
    const filePath = `${orgId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('program-assets')
      .upload(filePath, blob, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('[captureStrip] Upload failed:', uploadError.message);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('program-assets')
      .getPublicUrl(filePath);

    console.log('[captureStrip] Uploaded strip image:', publicUrl);
    return publicUrl;
  } catch (err) {
    console.error('[captureStrip] Error:', err);
    return null;
  }
}
