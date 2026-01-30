import styled from 'styled-components';
import { Link } from 'react-router-dom';

/**
 * AuthLayout: Layout compartido para páginas de autenticación
 * Pantalla dividida: Branding (izq) | Formulario (der)
 */
const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <Container>
      {/* Panel izquierdo: Branding */}
      <BrandingPanel>
        <Logo to="/">Fidelify</Logo>
        <Tagline>
          La plataforma de lealtad
          <br />
          para negocios modernos
        </Tagline>
        <Features>
          <Feature>
            <FeatureIcon>✓</FeatureIcon>
            <span>Tarjetas digitales para Apple y Google Wallet</span>
          </Feature>
          <Feature>
            <FeatureIcon>✓</FeatureIcon>
            <span>Dashboard con métricas en tiempo real</span>
          </Feature>
          <Feature>
            <FeatureIcon>✓</FeatureIcon>
            <span>Envío de promociones masivas</span>
          </Feature>
        </Features>
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

const Container = styled.div`
  display: flex;
  min-height: 100vh;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
  }
`;

const BrandingPanel = styled.div`
  flex: 1;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary} 0%,
    ${({ theme }) => theme.colors.secondary} 100%
  );
  padding: ${({ theme }) => theme.space['3xl']};
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.inverse};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.space.xl};
    min-height: 200px;
  }
`;

const Logo = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text.inverse};
  margin-bottom: ${({ theme }) => theme.space.lg};

  &:hover {
    color: ${({ theme }) => theme.colors.text.inverse};
    opacity: 0.9;
  }
`;

const Tagline = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  line-height: 1.4;
  margin-bottom: ${({ theme }) => theme.space.xl};
  opacity: 0.95;
`;

const Features = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.md};
`;

const Feature = styled.li`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm};
  font-size: ${({ theme }) => theme.fontSizes.md};
  opacity: 0.9;
`;

const FeatureIcon = styled.span`
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
`;

const FormPanel = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.space.xl};
  background: ${({ theme }) => theme.colors.background};
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 400px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.space.xl};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  margin-bottom: ${({ theme }) => theme.space.xs};
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

export default AuthLayout;
