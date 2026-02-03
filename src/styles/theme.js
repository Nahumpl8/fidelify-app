/**
 * Fidelify Design System - Theme Configuration
 *
 * Sistema de temas con estilo Glassmorphism Premium
 * Paleta: Violet + Deep Purple (Modern Glass Style)
 *
 * Colores base:
 * - #EAEFFE - Azul lavanda claro (superficies, fondos light)
 * - #9787F3 - Violeta vibrante (color primario)
 * - #2D274B - Azul oscuro profundo (textos, fondos dark)
 */

// ============================================
// COLOR PALETTE - VIOLET & DEEP PURPLE
// ============================================
const palette = {
  // Deep Purple - Neutrals with violet undertone
  deep: {
    50: '#EAEFFE',   // Tu color claro
    100: '#E0E5FF',
    200: '#C7CFFE',
    300: '#AEB8FC',
    400: '#9787F3',   // Tu color primario
    500: '#7C6AE8',
    600: '#6554D4',
    700: '#4E40B8',
    800: '#3A3190',
    900: '#2D274B',   // Tu color oscuro
    950: '#1A1730',
  },
  // Violet - Primary accent (derivados de tu #9787F3)
  violet: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#9787F3',   // Tu color primario exacto
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },
  // Semantic colors (ajustados para armonizar)
  emerald: {
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
  },
  amber: {
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
  },
  red: {
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
  },
  blue: {
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
  },
};

// ============================================
// SHARED CONFIG (Both modes)
// ============================================
const shared = {
  // Typography
  fonts: {
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },

  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    md: '1rem',       // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },

  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Spacing Scale
  space: {
    px: '1px',
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    // Legacy aliases
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },

  // Border Radius
  radii: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Breakpoints (Mobile First)
  breakpoints: {
    xs: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Media query helpers
  media: {
    xs: '@media (min-width: 480px)',
    sm: '@media (min-width: 640px)',
    md: '@media (min-width: 768px)',
    lg: '@media (min-width: 1024px)',
    xl: '@media (min-width: 1280px)',
    '2xl': '@media (min-width: 1536px)',
    // Max-width for mobile-first overrides
    mobile: '@media (max-width: 639px)',
    tablet: '@media (max-width: 1023px)',
    touch: '@media (hover: none) and (pointer: coarse)',
  },

  // Transitions
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    theme: '300ms ease', // For theme switching
  },

  // Z-Index Scale
  zIndices: {
    base: 0,
    dropdown: 100,
    sticky: 200,
    modal: 300,
    popover: 400,
    tooltip: 500,
    toast: 600,
  },
};

// ============================================
// LIGHT THEME - PREMIUM GLASSMORPHISM
// ============================================
export const lightTheme = {
  ...shared,
  mode: 'light',

  colors: {
    // Primary brand - Violet (#9787F3)
    primary: '#9787F3',
    primaryHover: '#7C6AE8',
    primaryLight: 'rgba(151, 135, 243, 0.15)',
    primaryMuted: 'rgba(151, 135, 243, 0.08)',

    // Secondary - Deep Purple
    secondary: '#2D274B',

    // Accent (CTA, highlights)
    accent: '#9787F3',
    accentHover: '#A78BFA',
    accentLight: 'rgba(151, 135, 243, 0.12)',

    // Backgrounds - Soft lavender gradient for glassmorphism
    background: 'linear-gradient(145deg, #EAEFFE 0%, #E0E5FF 50%, #F5F3FF 100%)',
    backgroundSolid: '#EAEFFE',
    backgroundAlt: 'rgba(234, 239, 254, 0.9)',
    surface: 'rgba(255, 255, 255, 0.75)',
    surfaceHover: 'rgba(255, 255, 255, 0.85)',
    surfaceActive: 'rgba(255, 255, 255, 0.95)',

    // Cards with Glass effect
    cardInactive: 'rgba(255, 255, 255, 0.5)',
    cardActive: 'rgba(255, 255, 255, 0.8)',
    cardActiveHover: 'rgba(255, 255, 255, 0.9)',

    // Text - Deep purple tones
    text: {
      primary: '#2D274B',
      secondary: '#4E40B8',
      muted: '#6554D4',
      inverse: '#FFFFFF',
      onPrimary: '#FFFFFF',
    },

    // Borders - Subtle glass effect
    border: 'rgba(151, 135, 243, 0.2)',
    borderLight: 'rgba(151, 135, 243, 0.1)',
    borderFocus: '#9787F3',

    // Input fields - Glass effect
    input: {
      bg: 'rgba(255, 255, 255, 0.7)',
      border: 'rgba(151, 135, 243, 0.2)',
      borderFocus: '#9787F3',
      placeholder: '#6554D4',
    },

    // Glass utilities for components
    glass: {
      bg: 'rgba(255, 255, 255, 0.65)',
      bgHover: 'rgba(255, 255, 255, 0.8)',
      bgSubtle: 'rgba(255, 255, 255, 0.4)',
      bgDark: 'rgba(45, 39, 75, 0.05)',
      border: 'rgba(151, 135, 243, 0.15)',
      borderHover: 'rgba(151, 135, 243, 0.3)',
      text: '#2D274B',
      textSecondary: '#4E40B8',
      textMuted: '#6554D4',
    },

    // Semantic states
    success: '#10B981',
    successLight: 'rgba(16, 185, 129, 0.15)',
    warning: '#F59E0B',
    warningLight: 'rgba(245, 158, 11, 0.15)',
    error: '#EF4444',
    errorLight: 'rgba(239, 68, 68, 0.15)',
    info: '#9787F3',
    infoLight: 'rgba(151, 135, 243, 0.15)',

    // Overlays
    overlay: 'rgba(45, 39, 75, 0.4)',
    backdrop: 'rgba(234, 239, 254, 0.9)',
  },

  shadows: {
    xs: '0 1px 2px rgba(45, 39, 75, 0.05)',
    sm: '0 1px 3px rgba(45, 39, 75, 0.08), 0 1px 2px rgba(45, 39, 75, 0.04)',
    md: '0 4px 6px -1px rgba(45, 39, 75, 0.1), 0 2px 4px -1px rgba(45, 39, 75, 0.06)',
    lg: '0 10px 15px -3px rgba(45, 39, 75, 0.1), 0 4px 6px -2px rgba(45, 39, 75, 0.05)',
    xl: '0 20px 25px -5px rgba(45, 39, 75, 0.12), 0 10px 10px -5px rgba(45, 39, 75, 0.04)',
    // Glass card shadows with violet tint
    card: '0 8px 32px rgba(151, 135, 243, 0.12)',
    cardHover: '0 16px 48px rgba(151, 135, 243, 0.18)',
    // Focus ring - Violet
    focus: '0 0 0 4px rgba(151, 135, 243, 0.3)',
    // Glass glow - Violet
    glow: '0 0 24px rgba(151, 135, 243, 0.35)',
    // Inner shadow
    inset: 'inset 0 2px 4px rgba(45, 39, 75, 0.06)',
  },
};

// ============================================
// DARK THEME - PREMIUM GLASSMORPHISM
// ============================================
export const darkTheme = {
  ...shared,
  mode: 'dark',

  colors: {
    // Primary brand - Bright Violet for dark mode
    primary: '#A78BFA',               // Brighter violet for visibility
    primaryHover: '#C4B5FD',          // Even brighter on hover
    primaryLight: 'rgba(167, 139, 250, 0.2)',
    primaryMuted: 'rgba(167, 139, 250, 0.1)',

    // Secondary - Deep Purple
    secondary: '#9787F3',

    // Accent - HIGH VISIBILITY violet
    accent: '#C4B5FD',
    accentHover: '#DDD6FE',
    accentLight: 'rgba(196, 181, 253, 0.2)',

    // Backgrounds - Deep purple gradient for glassmorphism
    background: 'linear-gradient(145deg, #1A1730 0%, #2D274B 50%, #3A3190 100%)',
    backgroundSolid: '#1A1730',
    backgroundAlt: 'rgba(26, 23, 48, 0.9)',
    surface: 'rgba(45, 39, 75, 0.7)',
    surfaceHover: 'rgba(58, 49, 144, 0.6)',
    surfaceActive: 'rgba(58, 49, 144, 0.8)',

    // Cards with Glass effect
    cardInactive: 'rgba(26, 23, 48, 0.7)',
    cardActive: 'rgba(45, 39, 75, 0.8)',
    cardActiveHover: 'rgba(58, 49, 144, 0.7)',

    // Text - High contrast on dark
    text: {
      primary: '#EAEFFE',             // Tu color claro
      secondary: '#C4B5FD',           // Violet claro
      muted: '#9787F3',               // Tu color primario como muted
      inverse: '#1A1730',             // Para fondos claros
      onPrimary: '#FFFFFF',
    },

    // Borders - Glass effect with violet tint
    border: 'rgba(151, 135, 243, 0.2)',
    borderLight: 'rgba(151, 135, 243, 0.1)',
    borderFocus: '#A78BFA',

    // Input fields - Glass effect
    input: {
      bg: 'rgba(26, 23, 48, 0.6)',
      border: 'rgba(151, 135, 243, 0.2)',
      borderFocus: '#A78BFA',
      placeholder: '#9787F3',
    },

    // Glass utilities for components
    glass: {
      bg: 'rgba(45, 39, 75, 0.5)',
      bgHover: 'rgba(58, 49, 144, 0.5)',
      bgSubtle: 'rgba(151, 135, 243, 0.08)',
      bgDark: 'rgba(26, 23, 48, 0.8)',
      border: 'rgba(151, 135, 243, 0.15)',
      borderHover: 'rgba(151, 135, 243, 0.25)',
      text: '#EAEFFE',
      textSecondary: '#C4B5FD',
      textMuted: '#9787F3',
    },

    // Semantic states - Bright for dark mode
    success: '#34D399',
    successLight: 'rgba(52, 211, 153, 0.2)',
    warning: '#FBBF24',
    warningLight: 'rgba(251, 191, 36, 0.2)',
    error: '#F87171',
    errorLight: 'rgba(248, 113, 113, 0.2)',
    info: '#A78BFA',
    infoLight: 'rgba(167, 139, 250, 0.2)',

    // Overlays
    overlay: 'rgba(26, 23, 48, 0.85)',
    backdrop: 'rgba(26, 23, 48, 0.95)',
  },

  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.3)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
    // Glass card shadows with violet glow
    card: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(151, 135, 243, 0.1)',
    cardHover: '0 16px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(151, 135, 243, 0.2)',
    // Focus ring - Violet glow
    focus: '0 0 0 4px rgba(167, 139, 250, 0.35)',
    // Glow effect - Violet
    glow: '0 0 24px rgba(167, 139, 250, 0.4)',
    // Inner shadow
    inset: 'inset 0 2px 4px rgba(0, 0, 0, 0.4)',
  },
};

// ============================================
// DEFAULT EXPORT & HELPERS
// ============================================
const defaultTheme = lightTheme;

/**
 * Create organization-branded theme
 */
export const createOrganizationTheme = (organization, mode = 'light') => {
  const baseTheme = mode === 'dark' ? darkTheme : lightTheme;

  if (!organization) return baseTheme;

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: organization.primary_color || baseTheme.colors.primary,
      primaryHover: organization.secondary_color || baseTheme.colors.primaryHover,
    },
    organization: {
      name: organization.name,
      logoUrl: organization.logo_url,
      slug: organization.slug,
    },
  };
};

/**
 * Get theme by mode name
 */
export const getTheme = (mode) => {
  return mode === 'dark' ? darkTheme : lightTheme;
};

export { palette };
export default defaultTheme;
