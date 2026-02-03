/**
 * Fidelify UI Kit
 *
 * Componentes reutilizables con estilo Glassmorphism Premium
 * Paleta: #EAEFFE (claro), #9787F3 (primario), #2D274B (oscuro)
 */

import styled, { css } from 'styled-components';

// ============================================
// 1. APP CARD - Glassmorphism "Frosted Glass"
// ============================================
/**
 * Card con efecto vidrio esmerilizado estilo iOS
 * - Inactive: Glass sutil
 * - Active: Glass con borde violeta
 *
 * @prop {boolean} $active - Estado activo/inactivo
 * @prop {boolean} $clickable - Si es clickeable
 */
export const AppCard = styled.div`
  position: relative;
  border-radius: 20px;
  padding: ${({ theme }) => theme.space[5]};
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};

  /* Glassmorphism base */
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(45, 39, 75, 0.5)'
      : 'rgba(255, 255, 255, 0.6)'
  };
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(151, 135, 243, 0.15)'
      : 'rgba(255, 255, 255, 0.6)'
  };
  box-shadow: ${({ theme }) =>
    theme.mode === 'dark'
      ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
      : '0 8px 32px rgba(151, 135, 243, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
  };

  /* Mobile: Touch-friendly padding */
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.space[4]};
    border-radius: 16px;
  }

  /* STATE: Active - Violeta border */
  ${({ $active }) =>
    $active &&
    css`
      background: ${({ theme }) =>
        theme.mode === 'dark'
          ? 'rgba(151, 135, 243, 0.15)'
          : 'rgba(151, 135, 243, 0.08)'
      };
      border: 2px solid #9787F3;
      box-shadow:
        0 8px 32px rgba(151, 135, 243, 0.2),
        0 0 0 1px rgba(151, 135, 243, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);

      &:hover {
        box-shadow:
          0 12px 40px rgba(151, 135, 243, 0.25),
          0 0 0 1px rgba(151, 135, 243, 0.2);
      }
    `}

  /* Clickable hover effects when inactive */
  ${({ $clickable, $active, theme }) =>
    $clickable &&
    !$active &&
    css`
      &:hover {
        background: ${theme.mode === 'dark'
          ? 'rgba(58, 49, 144, 0.4)'
          : 'rgba(255, 255, 255, 0.8)'};
        border-color: ${theme.mode === 'dark'
          ? 'rgba(151, 135, 243, 0.3)'
          : 'rgba(151, 135, 243, 0.4)'};
        transform: translateY(-4px);
        box-shadow: ${theme.mode === 'dark'
          ? '0 16px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(151, 135, 243, 0.2)'
          : '0 16px 48px rgba(151, 135, 243, 0.15), 0 0 0 1px rgba(151, 135, 243, 0.2)'};
      }

      &:active {
        transform: translateY(-2px);
      }
    `}
`;

// ============================================
// 2. APP BUTTON - Glassmorphism Variants
// ============================================
const buttonVariants = {
  primary: css`
    /* Gradient violeta con glass effect */
    background: linear-gradient(135deg, #9787F3 0%, #7C6AE8 100%);
    color: white;
    border: none;
    box-shadow: 0 4px 16px rgba(151, 135, 243, 0.4);

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #A78BFA 0%, #9787F3 100%);
      box-shadow: 0 8px 24px rgba(151, 135, 243, 0.5);
      transform: translateY(-2px);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  `,

  secondary: css`
    /* Glass button */
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(45, 39, 75, 0.5)'
      : 'rgba(255, 255, 255, 0.6)'};
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    color: ${({ theme }) => theme.mode === 'dark'
      ? '#EAEFFE'
      : '#2D274B'};
    border: 1px solid ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(151, 135, 243, 0.2)'
      : 'rgba(151, 135, 243, 0.3)'};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.mode === 'dark'
        ? 'rgba(58, 49, 144, 0.5)'
        : 'rgba(255, 255, 255, 0.85)'};
      border-color: #9787F3;
      color: #9787F3;
      transform: translateY(-1px);
    }
  `,

  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.text.secondary};
    border: none;

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.mode === 'dark'
        ? 'rgba(151, 135, 243, 0.1)'
        : 'rgba(151, 135, 243, 0.08)'};
      color: ${({ theme }) => theme.colors.text.primary};
    }
  `,

  accent: css`
    /* Glass con borde violeta */
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(151, 135, 243, 0.15)'
      : 'rgba(151, 135, 243, 0.1)'};
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    color: #9787F3;
    border: 1px solid rgba(151, 135, 243, 0.3);

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.mode === 'dark'
        ? 'rgba(151, 135, 243, 0.25)'
        : 'rgba(151, 135, 243, 0.15)'};
      border-color: #9787F3;
      transform: translateY(-1px);
    }
  `,

  danger: css`
    background: rgba(239, 68, 68, 0.15);
    backdrop-filter: blur(12px);
    color: #EF4444;
    border: 1px solid rgba(239, 68, 68, 0.3);

    &:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.2);
      border-color: #EF4444;
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
  border-radius: 14px;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  min-height: 44px;

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
      border-radius: 10px;
    `}

  ${({ $size, theme }) =>
    $size === 'lg' &&
    css`
      padding: ${theme.space[4]} ${theme.space[6]};
      font-size: ${theme.fontSizes.md};
      min-height: 52px;
      border-radius: 16px;
    `}

  /* Mobile: Ensure touch targets */
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    min-height: 48px;
    padding: ${({ theme }) => `${theme.space[3]} ${theme.space[4]}`};
  }
`;

// ============================================
// 3. APP INPUT - Glassmorphism "Filled" Style
// ============================================
export const AppInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => `${theme.space[3]} ${theme.space[4]}`};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text.primary};

  /* Glass effect */
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(26, 23, 48, 0.6)'
    : 'rgba(255, 255, 255, 0.7)'};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 2px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(151, 135, 243, 0.15)'
    : 'rgba(151, 135, 243, 0.2)'};
  border-radius: 14px;

  outline: none;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 48px;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }

  &:hover:not(:disabled):not(:focus) {
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(45, 39, 75, 0.6)'
      : 'rgba(255, 255, 255, 0.85)'};
    border-color: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(151, 135, 243, 0.25)'
      : 'rgba(151, 135, 243, 0.35)'};
  }

  &:focus {
    border-color: #9787F3;
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(45, 39, 75, 0.8)'
      : 'rgba(255, 255, 255, 0.95)'};
    box-shadow: 0 0 0 4px rgba(151, 135, 243, 0.15);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Error state */
  ${({ $error }) =>
    $error &&
    css`
      border-color: #EF4444;
      &:focus {
        box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15);
      }
    `}

  /* Mobile optimization */
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 16px;
    min-height: 52px;
    border-radius: 12px;
  }
`;

// ============================================
// 4. APP TEXTAREA - Glassmorphism
// ============================================
export const AppTextarea = styled.textarea`
  width: 100%;
  padding: ${({ theme }) => theme.space[4]};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text.primary};

  /* Glass effect */
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(26, 23, 48, 0.6)'
    : 'rgba(255, 255, 255, 0.7)'};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 2px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(151, 135, 243, 0.15)'
    : 'rgba(151, 135, 243, 0.2)'};
  border-radius: 14px;

  outline: none;
  resize: vertical;
  min-height: 120px;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }

  &:hover:not(:disabled):not(:focus) {
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(45, 39, 75, 0.6)'
      : 'rgba(255, 255, 255, 0.85)'};
  }

  &:focus {
    border-color: #9787F3;
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(45, 39, 75, 0.8)'
      : 'rgba(255, 255, 255, 0.95)'};
    box-shadow: 0 0 0 4px rgba(151, 135, 243, 0.15);
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
        color: #EF4444;
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
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(151, 135, 243, 0.15)'
    : 'rgba(151, 135, 243, 0.2)'};
  margin: ${({ $spacing, theme }) => theme.space[$spacing] || theme.space[6]} 0;
`;

// ============================================
// 9. APP BADGE - Glassmorphism
// ============================================
const badgeVariants = {
  default: css`
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(151, 135, 243, 0.15)'
      : 'rgba(151, 135, 243, 0.1)'};
    color: ${({ theme }) => theme.colors.text.secondary};
    border: 1px solid ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(151, 135, 243, 0.2)'
      : 'rgba(151, 135, 243, 0.15)'};
  `,
  primary: css`
    background: rgba(151, 135, 243, 0.2);
    color: #9787F3;
    border: 1px solid rgba(151, 135, 243, 0.3);
  `,
  success: css`
    background: rgba(16, 185, 129, 0.15);
    color: #10B981;
    border: 1px solid rgba(16, 185, 129, 0.25);
  `,
  warning: css`
    background: rgba(245, 158, 11, 0.15);
    color: #F59E0B;
    border: 1px solid rgba(245, 158, 11, 0.25);
  `,
  error: css`
    background: rgba(239, 68, 68, 0.15);
    color: #EF4444;
    border: 1px solid rgba(239, 68, 68, 0.25);
  `,
};

export const AppBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.space[1]} ${theme.space[3]}`};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  border-radius: 20px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);

  ${({ $variant = 'default' }) => badgeVariants[$variant]}
`;

// ============================================
// 10. APP SWITCH / TOGGLE - Glassmorphism
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

  /* The track - glass effect */
  span.track {
    position: relative;
    width: 52px;
    height: 28px;
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(45, 39, 75, 0.6)'
      : 'rgba(151, 135, 243, 0.2)'};
    backdrop-filter: blur(8px);
    border: 1px solid ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(151, 135, 243, 0.2)'
      : 'rgba(151, 135, 243, 0.25)'};
    border-radius: 9999px;
    transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* The thumb */
  span.track::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 22px;
    height: 22px;
    background: white;
    border-radius: 50%;
    transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  /* Checked state - Violeta */
  input:checked + span.track {
    background: linear-gradient(135deg, #9787F3 0%, #7C6AE8 100%);
    border-color: transparent;
    box-shadow: 0 0 16px rgba(151, 135, 243, 0.4);
  }

  input:checked + span.track::after {
    transform: translateX(24px);
  }

  /* Focus state */
  input:focus-visible + span.track {
    box-shadow: 0 0 0 4px rgba(151, 135, 243, 0.25);
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
  border-radius: 12px;
  /* Glass effect */
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(45, 39, 75, 0.5)'
    : 'rgba(255, 255, 255, 0.6)'};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(151, 135, 243, 0.2)'
    : 'rgba(151, 135, 243, 0.25)'};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(58, 49, 144, 0.5)'
      : 'rgba(255, 255, 255, 0.85)'};
    color: #9787F3;
    border-color: #9787F3;
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
  color: ${({ $error }) =>
    $error ? '#EF4444' : '${({ theme }) => theme.colors.text.muted}'};
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

// ============================================
// 17. GLASS PANEL - Contenedor glassmorphism
// ============================================
export const GlassPanel = styled.div`
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(45, 39, 75, 0.4)'
      : 'rgba(255, 255, 255, 0.5)'
  };
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(151, 135, 243, 0.15)'
      : 'rgba(255, 255, 255, 0.6)'
  };
  border-radius: ${({ $radius }) => $radius || '20px'};
  padding: ${({ $padding, theme }) => $padding || theme.space[5]};
  box-shadow: ${({ theme }) =>
    theme.mode === 'dark'
      ? '0 8px 32px rgba(0, 0, 0, 0.3)'
      : '0 8px 32px rgba(151, 135, 243, 0.08)'
  };
`;

// ============================================
// 18. ICON BUTTON - Glassmorphism
// ============================================
export const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ $size }) => $size === 'sm' ? '36px' : $size === 'lg' ? '52px' : '44px'};
  height: ${({ $size }) => $size === 'sm' ? '36px' : $size === 'lg' ? '52px' : '44px'};
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);

  /* Glass effect */
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(45, 39, 75, 0.5)'
    : 'rgba(255, 255, 255, 0.6)'};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(151, 135, 243, 0.15)'
    : 'rgba(151, 135, 243, 0.2)'};
  color: ${({ theme }) => theme.colors.text.secondary};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(151, 135, 243, 0.2)'
      : 'rgba(151, 135, 243, 0.1)'};
    color: #9787F3;
    border-color: rgba(151, 135, 243, 0.4);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: ${({ $size }) => $size === 'sm' ? '16px' : $size === 'lg' ? '24px' : '20px'};
    height: ${({ $size }) => $size === 'sm' ? '16px' : $size === 'lg' ? '24px' : '20px'};
  }
`;
