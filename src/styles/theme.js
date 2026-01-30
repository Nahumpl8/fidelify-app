/**
 * Fidelify Design System - Theme Configuration
 *
 * Sistema de temas completo con soporte para Light/Dark mode
 * Paleta: Slate + Indigo (SaaS Premium Style)
 */

// ============================================
// COLOR PALETTE - SLATE & INDIGO
// ============================================
const palette = {
  // Slate - Neutrals with blue undertone
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },
  // Indigo - Primary accent
  indigo: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#030304',
  },
  // Semantic colors
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
// LIGHT THEME - MODERN GLASSMORPHISM
// ============================================
export const lightTheme = {
  ...shared,
  mode: 'light',

  colors: {
    // Primary brand - Emerald (consistent with dark mode)
    primary: '#10B981',
    primaryHover: '#059669',
    primaryLight: 'rgba(16, 185, 129, 0.12)',
    primaryMuted: 'rgba(16, 185, 129, 0.08)',

    // Accent (CTA, success actions)
    accent: '#10B981',
    accentHover: '#059669',
    accentLight: 'rgba(16, 185, 129, 0.1)',

    // Backgrounds - Gradient base for glassmorphism
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    backgroundSolid: '#F8FAFC',
    backgroundAlt: 'rgba(255, 255, 255, 0.7)',
    surface: 'rgba(255, 255, 255, 0.8)',
    surfaceHover: 'rgba(255, 255, 255, 0.9)',
    surfaceActive: 'rgba(255, 255, 255, 0.95)',

    // Cards with "Slot vs Active" logic
    cardInactive: 'rgba(255, 255, 255, 0.4)',
    cardActive: 'rgba(255, 255, 255, 0.8)',
    cardActiveHover: 'rgba(255, 255, 255, 0.9)',

    // Text - High contrast
    text: {
      primary: '#1E293B',
      secondary: '#475569',
      muted: '#64748B',
      inverse: '#FFFFFF',
      onPrimary: '#FFFFFF',
    },

    // Borders - Glass effect
    border: 'rgba(0, 0, 0, 0.1)',
    borderLight: 'rgba(0, 0, 0, 0.05)',
    borderFocus: '#10B981',

    // Input fields - Glass effect
    input: {
      bg: 'rgba(255, 255, 255, 0.6)',
      border: 'rgba(0, 0, 0, 0.1)',
      borderFocus: '#10B981',
      placeholder: '#94A3B8',
    },

    // Glass utilities for components
    glass: {
      bg: 'rgba(255, 255, 255, 0.7)',
      bgHover: 'rgba(255, 255, 255, 0.85)',
      bgSubtle: 'rgba(255, 255, 255, 0.5)',
      bgDark: 'rgba(0, 0, 0, 0.05)',
      border: 'rgba(0, 0, 0, 0.08)',
      borderHover: 'rgba(0, 0, 0, 0.15)',
      text: '#1E293B',
      textSecondary: '#475569',
      textMuted: '#64748B',
    },

    // Semantic states
    success: '#10B981',
    successLight: 'rgba(16, 185, 129, 0.15)',
    warning: '#F59E0B',
    warningLight: 'rgba(245, 158, 11, 0.15)',
    error: '#EF4444',
    errorLight: 'rgba(239, 68, 68, 0.15)',
    info: '#3B82F6',
    infoLight: 'rgba(59, 130, 246, 0.15)',

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.4)',
    backdrop: 'rgba(255, 255, 255, 0.8)',
  },

  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    // Glass card shadows
    card: '0 8px 32px rgba(0, 0, 0, 0.1)',
    cardHover: '0 12px 40px rgba(0, 0, 0, 0.15)',
    // Focus ring
    focus: '0 0 0 4px rgba(16, 185, 129, 0.25)',
    // Glass glow
    glow: '0 0 20px rgba(16, 185, 129, 0.3)',
    // Inner shadow
    inset: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
  },
};

// ============================================
// DARK THEME - MODERN GLASSMORPHISM
// ============================================
export const darkTheme = {
  ...shared,
  mode: 'dark',

  colors: {
    // Primary brand - EMERALD for dark mode (Bright for visibility)
    primary: '#10B981',               // Emerald 500 - Main brand
    primaryHover: '#34D399',          // Emerald 400 - Brighter on hover
    primaryLight: 'rgba(16, 185, 129, 0.15)',
    primaryMuted: 'rgba(16, 185, 129, 0.08)',

    // Accent - HIGH VISIBILITY green
    accent: '#34D399',                // Emerald 400
    accentHover: '#6EE7B7',           // Emerald 300
    accentLight: 'rgba(52, 211, 153, 0.2)',

    // Backgrounds - Dark gradient for glassmorphism
    background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #172554 100%)',
    backgroundSolid: '#020617',
    backgroundAlt: 'rgba(0, 0, 0, 0.2)',
    surface: 'rgba(30, 41, 59, 0.8)',
    surfaceHover: 'rgba(51, 65, 85, 0.8)',
    surfaceActive: 'rgba(51, 65, 85, 0.9)',

    // Cards with "Slot vs Active" logic
    cardInactive: 'rgba(15, 23, 42, 0.6)',
    cardActive: 'rgba(30, 41, 59, 0.8)',
    cardActiveHover: 'rgba(51, 65, 85, 0.8)',

    // Text - MAXIMUM CONTRAST
    text: {
      primary: '#F1F5F9',             // Slate 100 - Almost white
      secondary: '#94A3B8',           // Slate 400 - Readable secondary
      muted: '#64748B',               // Slate 500 - Subtle
      inverse: '#020617',             // For light backgrounds
      onPrimary: '#FFFFFF',
    },

    // Borders - Glass effect
    border: 'rgba(255, 255, 255, 0.1)',
    borderLight: 'rgba(255, 255, 255, 0.05)',
    borderFocus: '#10B981',

    // Input fields - Glass effect
    input: {
      bg: 'rgba(0, 0, 0, 0.3)',
      border: 'rgba(255, 255, 255, 0.1)',
      borderFocus: '#10B981',
      placeholder: '#64748B',
    },

    // Glass utilities for components
    glass: {
      bg: 'rgba(0, 0, 0, 0.2)',
      bgHover: 'rgba(0, 0, 0, 0.3)',
      bgSubtle: 'rgba(255, 255, 255, 0.03)',
      bgDark: 'rgba(0, 0, 0, 0.4)',
      border: 'rgba(255, 255, 255, 0.08)',
      borderHover: 'rgba(255, 255, 255, 0.15)',
      text: '#F1F5F9',
      textSecondary: '#94A3B8',
      textMuted: '#64748B',
    },

    // Semantic states - BRIGHTER for dark mode
    success: '#34D399',               // Emerald 400
    successLight: 'rgba(52, 211, 153, 0.15)',
    warning: '#FBBF24',               // Amber 400
    warningLight: 'rgba(251, 191, 36, 0.15)',
    error: '#F87171',                 // Red 400
    errorLight: 'rgba(248, 113, 113, 0.15)',
    info: '#60A5FA',                  // Blue 400
    infoLight: 'rgba(96, 165, 250, 0.15)',

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.8)',
    backdrop: 'rgba(2, 6, 23, 0.95)',
  },

  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.3)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
    // Glass card shadows with glow
    card: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
    cardHover: '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
    // Focus ring - Emerald glow
    focus: '0 0 0 4px rgba(16, 185, 129, 0.3)',
    // Glow effect
    glow: '0 0 20px rgba(16, 185, 129, 0.4)',
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
