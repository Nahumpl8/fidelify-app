/**
 * Fidelify UI Kit
 *
 * Componentes reutilizables que consumen el tema automáticamente
 * Diseñados para ser responsive y accesibles
 */

import styled, { css } from 'styled-components';

// ============================================
// 1. APP CARD - "Slot vs Active" Pattern
// "Islands" concept: Slate 900 background, diffuse shadow
// Active state: ALWAYS Emerald border - Never client color
// ============================================
/**
 * Card con dos estados visuales:
 * - Inactive (slot): "Island" - Slate background, subtle shadow
 * - Active: Emerald border, slightly tinted background
 *
 * @prop {boolean} $active - Estado activo/inactivo
 * @prop {boolean} $clickable - Si es clickeable (añade hover effects)
 */
export const AppCard = styled.div`
  position: relative;
  border-radius: 16px;
  padding: ${({ theme }) => theme.space[5]};
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};

  /* Mobile: Touch-friendly padding */
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.space[4]};
    border-radius: 14px;
  }

  /* STATE: Inactive (Island) */
  ${({ $active, theme }) =>
    !$active &&
    css`
      /* Island style: Slate 900 background with diffuse shadow */
      background: ${theme.mode === 'dark'
        ? 'rgba(15, 23, 42, 0.7)'
        : 'rgba(248, 250, 252, 0.9)'};
      border: 2px solid transparent;
      box-shadow: ${theme.mode === 'dark'
        ? '0 4px 16px rgba(0, 0, 0, 0.25)'
        : '0 4px 16px rgba(0, 0, 0, 0.06)'};
    `}

  /* STATE: Active - ALWAYS Emerald */
  ${({ $active, theme }) =>
    $active &&
    css`
      /* Emerald border and tinted background */
      background: ${theme.mode === 'dark'
        ? 'rgba(16, 185, 129, 0.05)'
        : 'rgba(16, 185, 129, 0.04)'};
      border: 2px solid #10B981;
      box-shadow:
        0 4px 16px rgba(16, 185, 129, 0.15),
        0 0 0 1px rgba(16, 185, 129, 0.1);

      &:hover {
        box-shadow:
          0 8px 24px rgba(16, 185, 129, 0.2),
          0 0 0 1px rgba(16, 185, 129, 0.15);
      }
    `}

  /* Clickable hover effects when inactive */
  ${({ $clickable, $active, theme }) =>
    $clickable &&
    !$active &&
    css`
      &:hover {
        background: ${theme.mode === 'dark'
          ? 'rgba(30, 41, 59, 0.8)'
          : 'rgba(241, 245, 249, 1)'};
        border-color: ${theme.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(0, 0, 0, 0.06)'};
        transform: translateY(-2px);
        box-shadow: ${theme.mode === 'dark'
          ? '0 8px 24px rgba(0, 0, 0, 0.35)'
          : '0 8px 24px rgba(0, 0, 0, 0.08)'};
      }

      &:active {
        transform: translateY(0);
      }
    `}
`;

// ============================================
// 2. APP BUTTON - Variants: primary, secondary, ghost
// ALWAYS Emerald for primary - Never client color
// ============================================
const buttonVariants = {
  primary: css`
    /* IMMUTABLE: Always Emerald 500 - Never uses theme.colors.primary to avoid client color contamination */
    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
    color: white;
    border: none;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.5);
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  `,

  secondary: css`
    /* Slate glass style - no borders */
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(15, 23, 42, 0.6)'
      : 'rgba(241, 245, 249, 0.9)'};
    color: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(248, 250, 252, 0.9)'
      : 'rgba(51, 65, 85, 0.9)'};
    border: 1px solid ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.06)'};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.mode === 'dark'
        ? 'rgba(30, 41, 59, 0.8)'
        : 'rgba(226, 232, 240, 1)'};
      border-color: #10B981;
      color: #10B981;
    }
  `,

  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(148, 163, 184, 0.9)'
      : 'rgba(71, 85, 105, 0.9)'};
    border: none;

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.mode === 'dark'
        ? 'rgba(30, 41, 59, 0.5)'
        : 'rgba(241, 245, 249, 0.9)'};
      color: ${({ theme }) => theme.mode === 'dark'
        ? 'rgba(248, 250, 252, 1)'
        : 'rgba(30, 41, 59, 1)'};
    }
  `,

  accent: css`
    /* Accent also uses Emerald */
    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
    color: white;
    border: none;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #34D399 0%, #10B981 100%);
      transform: translateY(-1px);
    }
  `,

  danger: css`
    background: ${({ theme }) => theme.colors.error};
    color: white;
    border: none;

    &:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-1px);
    }
  `,
};

export const AppButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.space[2]};
  padding: ${({ theme }) => `${theme.space[3]} ${theme.space[5]}`};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  border-radius: ${({ theme }) => theme.radii.lg};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  white-space: nowrap;
  min-height: 44px; /* Touch-friendly minimum */

  /* Apply variant styles */
  ${({ $variant = 'primary' }) => buttonVariants[$variant] || buttonVariants.primary}

  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

  /* Full width option */
  ${({ $fullWidth }) =>
    $fullWidth &&
    css`
      width: 100%;
    `}

  /* Size variants */
  ${({ $size, theme }) =>
    $size === 'sm' &&
    css`
      padding: ${theme.space[2]} ${theme.space[3]};
      font-size: ${theme.fontSizes.xs};
      min-height: 36px;
    `}

  ${({ $size, theme }) =>
    $size === 'lg' &&
    css`
      padding: ${theme.space[4]} ${theme.space[6]};
      font-size: ${theme.fontSizes.md};
      min-height: 52px;
    `}

  /* Mobile: Ensure touch targets */
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    min-height: 48px;
    padding: ${({ theme }) => `${theme.space[3]} ${theme.space[4]}`};
  }
`;

// ============================================
// 3. APP INPUT - "Filled" Style (iOS-inspired)
// NO borders by default, solid background, rounded corners
// Focus: Emerald border glow - NEVER client color
// ============================================
export const AppInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => `${theme.space[3]} ${theme.space[4]}`};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(248, 250, 252, 0.95)'
    : 'rgba(30, 41, 59, 0.95)'};

  /* FILLED STYLE: Solid background, no border */
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.8)'
    : 'rgba(241, 245, 249, 0.9)'};
  border: 2px solid transparent;
  border-radius: 14px;

  outline: none;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 44px;

  &::placeholder {
    color: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(100, 116, 139, 0.7)'
      : 'rgba(148, 163, 184, 0.9)'};
  }

  &:hover:not(:disabled):not(:focus) {
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(30, 41, 59, 0.9)'
      : 'rgba(226, 232, 240, 1)'};
  }

  &:focus {
    /* ALWAYS Emerald border on focus - Never client color */
    border-color: #10B981;
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(15, 23, 42, 0.95)'
      : 'rgba(255, 255, 255, 1)'};
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(15, 23, 42, 0.4)'
      : 'rgba(226, 232, 240, 0.6)'};
  }

  /* Error state */
  ${({ $error }) =>
    $error &&
    css`
      border-color: #EF4444;
      &:focus {
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
      }
    `}

  /* Mobile optimization */
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 16px;
    min-height: 48px;
    border-radius: 12px;
  }
`;

// ============================================
// 4. APP TEXTAREA - "Filled" Style (iOS-inspired)
// NO borders by default, solid background, rounded corners
// Focus: Emerald border glow - NEVER client color
// ============================================
export const AppTextarea = styled.textarea`
  width: 100%;
  padding: ${({ theme }) => theme.space[4]};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(248, 250, 252, 0.95)'
    : 'rgba(30, 41, 59, 0.95)'};

  /* FILLED STYLE: Solid background, no border */
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.8)'
    : 'rgba(241, 245, 249, 0.9)'};
  border: 2px solid transparent;
  border-radius: 14px;

  outline: none;
  resize: vertical;
  min-height: 100px;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);

  &::placeholder {
    color: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(100, 116, 139, 0.7)'
      : 'rgba(148, 163, 184, 0.9)'};
  }

  &:hover:not(:disabled):not(:focus) {
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(30, 41, 59, 0.9)'
      : 'rgba(226, 232, 240, 1)'};
  }

  &:focus {
    /* ALWAYS Emerald border on focus - Never client color */
    border-color: #10B981;
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(15, 23, 42, 0.95)'
      : 'rgba(255, 255, 255, 1)'};
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 16px;
    border-radius: 12px;
  }
`;

// ============================================
// 5. APP LABEL
// ============================================
export const AppLabel = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.space[2]};

  /* Required indicator */
  ${({ $required }) =>
    $required &&
    css`
      &::after {
        content: ' *';
        color: ${({ theme }) => theme.colors.error};
      }
    `}
`;

// ============================================
// 6. APP GRID - Responsive grid system
// ============================================
export const AppGrid = styled.div`
  display: grid;
  gap: ${({ $gap, theme }) => theme.space[$gap] || theme.space[4]};

  /* Desktop: Auto-fill columns */
  grid-template-columns: repeat(
    ${({ $cols }) => $cols || 'auto-fill'},
    minmax(${({ $minWidth }) => $minWidth || '280px'}, 1fr)
  );

  /* Tablet: 2 columns */
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${({ theme }) => theme.space[4]};
  }

  /* Mobile: 1 column */
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.space[3]};
  }
`;

// ============================================
// 7. APP FLEX - Flexible layout helper
// ============================================
export const AppFlex = styled.div`
  display: flex;
  flex-direction: ${({ $direction }) => $direction || 'row'};
  align-items: ${({ $align }) => $align || 'stretch'};
  justify-content: ${({ $justify }) => $justify || 'flex-start'};
  gap: ${({ $gap, theme }) => theme.space[$gap] || theme.space[4]};
  flex-wrap: ${({ $wrap }) => ($wrap ? 'wrap' : 'nowrap')};

  /* Stack vertically on mobile */
  ${({ $stackOnMobile, theme }) =>
    $stackOnMobile &&
    css`
      @media (max-width: ${theme.breakpoints.sm}) {
        flex-direction: column;
      }
    `}
`;

// ============================================
// 8. APP DIVIDER
// ============================================
export const AppDivider = styled.hr`
  border: none;
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
  margin: ${({ $spacing, theme }) => theme.space[$spacing] || theme.space[6]} 0;
`;

// ============================================
// 9. APP BADGE
// ============================================
const badgeVariants = {
  default: css`
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.text.secondary};
  `,
  primary: css`
    background: ${({ theme }) => theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.primary};
  `,
  success: css`
    background: ${({ theme }) => theme.colors.successLight};
    color: ${({ theme }) => theme.colors.success};
  `,
  warning: css`
    background: ${({ theme }) => theme.colors.warningLight};
    color: ${({ theme }) => theme.colors.warning};
  `,
  error: css`
    background: ${({ theme }) => theme.colors.errorLight};
    color: ${({ theme }) => theme.colors.error};
  `,
};

export const AppBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.space[1]} ${theme.space[2]}`};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  border-radius: ${({ theme }) => theme.radii.full};

  ${({ $variant = 'default' }) => badgeVariants[$variant]}
`;

// ============================================
// 10. APP SWITCH / TOGGLE
// ALWAYS Emerald when checked - Never client color
// ============================================
export const AppSwitch = styled.label`
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  min-height: 44px;
  padding: ${({ theme }) => theme.space[2]} 0;

  input {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
  }

  /* The track */
  span.track {
    position: relative;
    width: 48px;
    height: 28px;
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(71, 85, 105, 0.6)'
      : 'rgba(203, 213, 225, 0.9)'};
    border-radius: 9999px;
    transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* The thumb */
  span.track::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
    transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  /* Checked state - ALWAYS Emerald */
  input:checked + span.track {
    background: #10B981;
    box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
  }

  input:checked + span.track::after {
    transform: translateX(20px);
  }

  /* Focus state - Emerald glow */
  input:focus-visible + span.track {
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
  }
`;

// ============================================
// 11. THEME TOGGLE BUTTON
// ============================================
export const ThemeToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.text.primary};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

// ============================================
// 12. SECTION HEADER
// ============================================
export const SectionHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.space[6]};

  h2 {
    font-size: ${({ theme }) => theme.fontSizes['2xl']};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 0 0 ${({ theme }) => theme.space[2]} 0;

    @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
      font-size: ${({ theme }) => theme.fontSizes.xl};
    }
  }

  p {
    font-size: ${({ theme }) => theme.fontSizes.md};
    color: ${({ theme }) => theme.colors.text.secondary};
    margin: 0;

    @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
      font-size: ${({ theme }) => theme.fontSizes.sm};
    }
  }
`;

// ============================================
// 13. FORM GROUP
// ============================================
export const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.space[5]};

  &:last-child {
    margin-bottom: 0;
  }
`;

// ============================================
// 14. HELPER TEXT
// ============================================
export const HelperText = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ $error, theme }) =>
    $error ? theme.colors.error : theme.colors.text.muted};
  margin-top: ${({ theme }) => theme.space[1]};
`;

// ============================================
// 15. CONTAINER
// ============================================
export const Container = styled.div`
  width: 100%;
  max-width: ${({ $maxWidth }) => $maxWidth || '1200px'};
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.space[6]};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 0 ${({ theme }) => theme.space[4]};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 0 ${({ theme }) => theme.space[3]};
  }
`;

// ============================================
// 16. VISUALLY HIDDEN (Accessibility)
// ============================================
export const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;
