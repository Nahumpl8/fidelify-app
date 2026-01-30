import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <Container>
      <Navbar>
        <NavLogo to="/">Fidelify</NavLogo>
        <NavLinks>
          <NavLink to="/login">Iniciar sesión</NavLink>
          <NavButton to="/register">Comenzar gratis</NavButton>
        </NavLinks>
      </Navbar>

      <Hero>
        <Logo>Fidelify</Logo>
        <Tagline>
          Tarjetas de lealtad digitales para tu negocio.
          <br />
          Sin apps. Sin tarjetas de cartón. Sin complicaciones.
        </Tagline>
        <CTAButton to="/builder">
          Prueba el Constructor de Pases
        </CTAButton>
      </Hero>

      <Features>
        <Feature>
          <FeatureIcon>📱</FeatureIcon>
          <FeatureTitle>Apple & Google Wallet</FeatureTitle>
          <FeatureDescription>
            Tus clientes guardan su tarjeta en el celular con un solo tap.
          </FeatureDescription>
        </Feature>

        <Feature>
          <FeatureIcon>🎨</FeatureIcon>
          <FeatureTitle>Tu marca, tu estilo</FeatureTitle>
          <FeatureDescription>
            Personaliza colores, logo y recompensas en minutos.
          </FeatureDescription>
        </Feature>

        <Feature>
          <FeatureIcon>📊</FeatureIcon>
          <FeatureTitle>Dashboard completo</FeatureTitle>
          <FeatureDescription>
            Ve quiénes son tus mejores clientes y envía promociones.
          </FeatureDescription>
        </Feature>
      </Features>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Navbar = styled.nav`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.space.md} ${({ theme }) => theme.space.xl};
  z-index: 100;
`;

const NavLogo = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text.inverse};

  &:hover {
    color: ${({ theme }) => theme.colors.text.inverse};
    opacity: 0.9;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.md};
`;

const NavLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text.inverse};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  opacity: 0.9;

  &:hover {
    color: ${({ theme }) => theme.colors.text.inverse};
    opacity: 1;
  }
`;

const NavButton = styled(Link)`
  padding: ${({ theme }) => theme.space.sm} ${({ theme }) => theme.space.md};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: transform ${({ theme }) => theme.transitions.fast};

  &:hover {
    transform: translateY(-1px);
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const Hero = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.space['3xl']} ${({ theme }) => theme.space.lg};
  text-align: center;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary} 0%,
    ${({ theme }) => theme.colors.secondary} 100%
  );
  color: ${({ theme }) => theme.colors.text.inverse};
  flex: 1;
`;

const Logo = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['4xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text.inverse};
  margin-bottom: ${({ theme }) => theme.space.md};
`;

const Tagline = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  max-width: 600px;
  opacity: 0.95;
  line-height: 1.6;
  margin-bottom: ${({ theme }) => theme.space.xl};
`;

const CTAButton = styled(Link)`
  display: inline-block;
  padding: ${({ theme }) => theme.space.md} ${({ theme }) => theme.space.xl};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  transition: transform ${({ theme }) => theme.transitions.fast},
    box-shadow ${({ theme }) => theme.transitions.fast};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.xl};
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const Features = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.space.xl};
  padding: ${({ theme }) => theme.space['3xl']} ${({ theme }) => theme.space.lg};
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const Feature = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.space.xl};
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${({ theme }) => theme.space.md};
`;

const FeatureTitle = styled.h3`
  margin-bottom: ${({ theme }) => theme.space.sm};
`;

const FeatureDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 0;
`;

export default Landing;
