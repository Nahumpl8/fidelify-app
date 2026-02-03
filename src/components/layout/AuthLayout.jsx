import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';

/**
 * AuthLayout: Layout para páginas de autenticación
 * Estilo Glassmorphism con la paleta violeta
 * Colores: #EAEFFE, #9787F3, #2D274B
 */
const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <Container>
      {/* Background animado */}
      <BackgroundGradient />
      <BackgroundOrb className="orb1" />
      <BackgroundOrb className="orb2" />
      <BackgroundOrb className="orb3" />

      {/* Panel izquierdo: Branding */}
      <BrandingPanel>
        <BrandingContent>
          <Logo to="/">Fidelify</Logo>
          <Tagline>
            La plataforma de lealtad
            <br />
            para negocios modernos
          </Tagline>
          <Features>
            <Feature>
              <FeatureIcon>
                <CheckIcon />
              </FeatureIcon>
              <span>Tarjetas digitales para Apple y Google Wallet</span>
            </Feature>
            <Feature>
              <FeatureIcon>
                <CheckIcon />
              </FeatureIcon>
              <span>Dashboard con métricas en tiempo real</span>
            </Feature>
            <Feature>
              <FeatureIcon>
                <CheckIcon />
              </FeatureIcon>
              <span>Envío de promociones masivas</span>
            </Feature>
          </Features>
        </BrandingContent>
      </BrandingPanel>

      {/* Panel derecho: Formulario */}
      <FormPanel>
        <FormContainer>
          <Header>
            <Title>{title}</Title>
            {subtitle && <Subtitle>{subtitle}</Subtitle>}
          </Header>
          {children}
        </FormContainer>
      </FormPanel>
    </Container>
  );
};

// Animaciones
const float = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.8; }
`;

// Check icon SVG
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path
      d="M10 3L4.5 8.5L2 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  position: relative;
  overflow: hidden;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
  }
`;

const BackgroundGradient = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(145deg, #1A1730 0%, #2D274B 50%, #3A3190 100%)'
      : 'linear-gradient(145deg, #EAEFFE 0%, #E0E5FF 50%, #F5F3FF 100%)'
  };
  z-index: 0;
`;

const BackgroundOrb = styled.div`
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 1;
  animation: ${float} 20s ease-in-out infinite, ${pulse} 4s ease-in-out infinite;

  &.orb1 {
    width: 500px;
    height: 500px;
    background: ${({ theme }) =>
      theme.mode === 'dark'
        ? 'rgba(151, 135, 243, 0.3)'
        : 'rgba(151, 135, 243, 0.2)'
    };
    top: -100px;
    left: -100px;
    animation-delay: 0s;
  }

  &.orb2 {
    width: 400px;
    height: 400px;
    background: ${({ theme }) =>
      theme.mode === 'dark'
        ? 'rgba(167, 139, 250, 0.25)'
        : 'rgba(167, 139, 250, 0.15)'
    };
    bottom: -50px;
    right: -50px;
    animation-delay: -7s;
  }

  &.orb3 {
    width: 300px;
    height: 300px;
    background: ${({ theme }) =>
      theme.mode === 'dark'
        ? 'rgba(196, 181, 253, 0.2)'
        : 'rgba(196, 181, 253, 0.15)'
    };
    top: 50%;
    left: 30%;
    animation-delay: -14s;
  }
`;

const BrandingPanel = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.space[8]};
  position: relative;
  z-index: 2;

  /* Glassmorphism overlay */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${({ theme }) =>
      theme.mode === 'dark'
        ? 'linear-gradient(135deg, rgba(151, 135, 243, 0.1) 0%, rgba(45, 39, 75, 0.3) 100%)'
        : 'linear-gradient(135deg, rgba(151, 135, 243, 0.08) 0%, rgba(255, 255, 255, 0.3) 100%)'
    };
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.space[6]};
    min-height: auto;
  }
`;

const BrandingContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 480px;
`;

const Logo = styled(Link)`
  display: inline-block;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #9787F3 0%, #A78BFA 50%, #C4B5FD 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: ${({ theme }) => theme.space[4]};
  text-decoration: none;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

const Tagline = styled.p`
  font-size: 1.5rem;
  line-height: 1.4;
  margin-bottom: ${({ theme }) => theme.space[8]};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 1.25rem;
    margin-bottom: ${({ theme }) => theme.space[4]};
  }
`;

const Features = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[4]};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const Feature = styled.li`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[3]};
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const FeatureIcon = styled.span`
  width: 28px;
  height: 28px;
  /* Glass effect */
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(151, 135, 243, 0.2)'
      : 'rgba(151, 135, 243, 0.15)'
  };
  backdrop-filter: blur(8px);
  border: 1px solid rgba(151, 135, 243, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9787F3;
  flex-shrink: 0;
`;

const FormPanel = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.space[6]};
  position: relative;
  z-index: 2;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.space[4]};
  }
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 420px;

  /* Glassmorphism card */
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(45, 39, 75, 0.4)'
      : 'rgba(255, 255, 255, 0.6)'
  };
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(151, 135, 243, 0.15)'
      : 'rgba(255, 255, 255, 0.6)'
  };
  border-radius: 24px;
  padding: ${({ theme }) => theme.space[8]};
  box-shadow: ${({ theme }) =>
    theme.mode === 'dark'
      ? '0 16px 64px rgba(0, 0, 0, 0.4)'
      : '0 16px 64px rgba(151, 135, 243, 0.12)'
  };

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.space[5]};
    border-radius: 20px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.space[6]};
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.space[2]};
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.md};
`;

export default AuthLayout;
