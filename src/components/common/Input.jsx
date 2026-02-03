import styled from 'styled-components';

/**
 * Input Component - Glassmorphism Style
 * Paleta: #EAEFFE, #9787F3, #2D274B
 */
const Input = ({
  label,
  error,
  id,
  type = 'text',
  ...props
}) => {
  return (
    <Wrapper>
      {label && <Label htmlFor={id}>{label}</Label>}
      <StyledInput
        id={id}
        type={type}
        $hasError={!!error}
        {...props}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[2]};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const StyledInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => `${theme.space[3]} ${theme.space[4]}`};
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text.primary};

  /* Glassmorphism effect */
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(26, 23, 48, 0.6)'
    : 'rgba(255, 255, 255, 0.7)'};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 2px solid ${({ theme, $hasError }) =>
    $hasError
      ? '#EF4444'
      : theme.mode === 'dark'
        ? 'rgba(151, 135, 243, 0.15)'
        : 'rgba(151, 135, 243, 0.2)'};
  border-radius: 14px;
  outline: none;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 48px;

  &:hover:not(:disabled):not(:focus) {
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(45, 39, 75, 0.6)'
      : 'rgba(255, 255, 255, 0.85)'};
    border-color: ${({ theme, $hasError }) =>
      $hasError
        ? '#EF4444'
        : theme.mode === 'dark'
          ? 'rgba(151, 135, 243, 0.25)'
          : 'rgba(151, 135, 243, 0.35)'};
  }

  &:focus {
    border-color: ${({ $hasError }) => $hasError ? '#EF4444' : '#9787F3'};
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(45, 39, 75, 0.8)'
      : 'rgba(255, 255, 255, 0.95)'};
    box-shadow: 0 0 0 4px ${({ $hasError }) =>
      $hasError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(151, 135, 243, 0.15)'};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Mobile optimization - prevent zoom on iOS */
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 16px;
    min-height: 52px;
    border-radius: 12px;
  }
`;

const ErrorMessage = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: #EF4444;
`;

export default Input;
