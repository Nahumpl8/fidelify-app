import { supabase } from '../lib/supabase';

/**
 * Google Wallet strip image dimensions
 */
const STRIP_WIDTH = 1032;
const STRIP_HEIGHT = 336;

/**
 * Stamp icon characters by program type
 */
const STAMP_ICONS = {
  stamp: { active: '\u25CF', inactive: '\u25CB' },   // ● / ○
  cashback: { active: '\u2713', inactive: '\u25CB' }, // ✓ / ○
  points: { active: '\u2605', inactive: '\u2606' },   // ★ / ☆
  membership: { active: '\u2666', inactive: '\u25C7' }, // ◆ / ◇
  default: { active: '\u25CF', inactive: '\u25CB' },
};

/**
 * Darken a hex color by a percentage
 */
function darkenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * percent / 100));
  const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(255 * percent / 100));
  const b = Math.max(0, (num & 0x0000FF) - Math.round(255 * percent / 100));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

/**
 * Generate a strip image PNG as a Blob using Canvas API
 *
 * @param {Object} options
 * @param {string} options.businessName - Name of the business
 * @param {string} options.bgColor - Background hex color (e.g. '#4CAF50')
 * @param {string} options.textColor - Text color (default '#FFFFFF')
 * @param {number} options.current - Current stamp/point count
 * @param {number} options.total - Total stamps/points needed
 * @param {string} options.rewardText - Reward description
 * @param {string} options.programType - 'stamp' | 'cashback' | 'points' | etc
 * @returns {Promise<Blob>} PNG blob
 */
export async function generateStripImageBlob({
  businessName = 'Mi Negocio',
  bgColor = '#4CAF50',
  textColor = '#FFFFFF',
  current = 0,
  total = 10,
  rewardText = 'Recompensa',
  programType = 'stamp',
}) {
  const canvas = document.createElement('canvas');
  canvas.width = STRIP_WIDTH;
  canvas.height = STRIP_HEIGHT;
  const ctx = canvas.getContext('2d');

  // Background gradient
  const darkBg = darkenColor(bgColor, 20);
  const gradient = ctx.createLinearGradient(0, 0, STRIP_WIDTH, STRIP_HEIGHT);
  gradient.addColorStop(0, bgColor);
  gradient.addColorStop(1, darkBg);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, STRIP_WIDTH, STRIP_HEIGHT);

  // Subtle overlay pattern
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  for (let i = 0; i < STRIP_WIDTH; i += 40) {
    ctx.fillRect(i, 0, 20, STRIP_HEIGHT);
  }

  // Text settings
  ctx.textAlign = 'center';
  ctx.fillStyle = textColor;

  // Business name (top)
  ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(businessName, STRIP_WIDTH / 2, 55);

  // Stamp grid
  const icons = STAMP_ICONS[programType] || STAMP_ICONS.default;
  const safeTotal = Math.max(1, Math.min(total, 30));
  const cols = Math.min(safeTotal, 10);
  const rows = Math.ceil(safeTotal / cols);

  const gridWidth = STRIP_WIDTH * 0.7;
  const gridCenterX = STRIP_WIDTH / 2;
  const gridCenterY = STRIP_HEIGHT / 2 + 10;
  const cellW = gridWidth / cols;
  const cellH = Math.min(cellW, 70);
  const gridStartX = gridCenterX - (cols * cellW) / 2;
  const gridStartY = gridCenterY - (rows * cellH) / 2;

  const iconSize = Math.min(cellW * 0.6, cellH * 0.7, 48);
  ctx.font = `${iconSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textBaseline = 'middle';

  for (let i = 0; i < safeTotal; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = gridStartX + col * cellW + cellW / 2;
    const y = gridStartY + row * cellH + cellH / 2;

    const isActive = i < current;
    ctx.fillStyle = isActive ? textColor : `${textColor}44`;
    ctx.fillText(isActive ? icons.active : icons.inactive, x, y);
  }

  // Progress counter
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = textColor;
  ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`${current} / ${safeTotal}`, STRIP_WIDTH / 2, STRIP_HEIGHT - 65);

  // Reward text (bottom)
  ctx.font = '22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = `${textColor}CC`;
  const truncatedReward = rewardText.length > 50 ? rewardText.substring(0, 47) + '...' : rewardText;
  ctx.fillText(truncatedReward, STRIP_WIDTH / 2, STRIP_HEIGHT - 30);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

/**
 * Generate strip image and upload to Supabase Storage
 *
 * @param {Object} options - Same as generateStripImageBlob
 * @param {string} orgId - Organization/business UUID
 * @returns {Promise<string|null>} Public URL or null on failure
 */
export async function generateAndUploadStripImage(options, orgId) {
  if (!orgId) {
    console.warn('[generateStripImage] No orgId provided, skipping upload');
    return null;
  }

  try {
    const blob = await generateStripImageBlob(options);
    if (!blob) {
      console.warn('[generateStripImage] Canvas toBlob returned null');
      return null;
    }

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
      console.error('[generateStripImage] Upload failed:', uploadError.message);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('program-assets')
      .getPublicUrl(filePath);

    console.log('[generateStripImage] Uploaded strip image:', publicUrl);
    return publicUrl;
  } catch (err) {
    console.error('[generateStripImage] Error:', err);
    return null;
  }
}

/**
 * Check if a URL is a valid HTTPS URL (not base64, not null)
 */
export function isValidImageUrl(url) {
  if (!url) return false;
  if (url.startsWith('data:')) return false;
  return url.startsWith('https://') || url.startsWith('http://');
}
