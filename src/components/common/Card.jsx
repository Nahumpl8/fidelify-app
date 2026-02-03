import styled from 'styled-components';

/**
 * Card Component - Glassmorphism Style
 * Paleta: #EAEFFE, #9787F3, #2D274B
 */
const Card = styled.div`
  /* Glassmorphism effect */
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(45, 39, 75, 0.5)'
      : 'rgba(255, 255, 255, 0.65)'
  };
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(151, 135, 243, 0.15)'
      : 'rgba(255, 255, 255, 0.6)'
  };
  border-radius: 20px;
  box-shadow: ${({ theme }) =>
    theme.mode === 'dark'
      ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
      : '0 8px 32px rgba(151, 135, 243, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
  };
  padding: ${({ theme }) => theme.space[6]};
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.space[4]};
    border-radius: 16px;
  }
`;

export default Card;
