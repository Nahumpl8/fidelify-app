import styled, { css } from 'styled-components';

/**
 * Button Component - Glassmorphism Style
 * Paleta: #EAEFFE, #9787F3, #2D274B
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  ...props
}) => {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </StyledButton>
  );
};

const sizeStyles = {
  sm: css`
    padding: ${({ theme }) => theme.space[2]} ${({ theme }) => theme.space[3]};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    min-height: 36px;
    border-radius: 10px;
  `,
  md: css`
    padding: ${({ theme }) => theme.space[3]} ${({ theme }) => theme.space[5]};
    font-size: ${({ theme }) => theme.fontSizes.md};
    min-height: 44px;
    border-radius: 14px;
  `,
  lg: css`
    padding: ${({ theme }) => theme.space[4]} ${({ theme }) => theme.space[6]};
    font-size: ${({ theme }) => theme.fontSizes.lg};
    min-height: 52px;
    border-radius: 16px;
  `,
};

const variantStyles = {
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
    color: #9787F3;
    border: 1px solid rgba(151, 135, 243, 0.3);

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.mode === 'dark'
        ? 'rgba(58, 49, 144, 0.5)'
        : 'rgba(255, 255, 255, 0.85)'};
      border-color: #9787F3;
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

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.space[2]};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  white-space: nowrap;

  ${({ $size }) => sizeStyles[$size]}
  ${({ $variant }) => variantStyles[$variant]}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
`;

const Spinner = styled.span`
  width: 18px;
  height: 18px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export default Button;
