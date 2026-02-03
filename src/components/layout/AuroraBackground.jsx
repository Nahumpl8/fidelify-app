import styled, { keyframes } from 'styled-components';

/**
 * AuroraBackground
 *
 * Fondo animado con efecto aurora usando la paleta violeta/púrpura.
 * Colores: #EAEFFE (claro), #9787F3 (primario), #2D274B (oscuro)
 */

const moveInCircle = keyframes`
  0% { transform: rotate(0deg); }
  50% { transform: rotate(180deg); }
  100% { transform: rotate(360deg); }
`;

const moveVertical = keyframes`
  0% { transform: translateY(-50%); }
  50% { transform: translateY(50%); }
  100% { transform: translateY(-50%); }
`;

const moveHorizontal = keyframes`
  0% { transform: translateX(-50%) translateY(-10%); }
  50% { transform: translateX(50%) translateY(10%); }
  100% { transform: translateX(-50%) translateY(-10%); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
`;

const BackgroundContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  overflow: hidden;
  /* Base: Tu color oscuro con tinte púrpura */
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? '#1A1730'
      : '#EAEFFE'
  };
`;

const AmbientLight = styled.div`
  position: absolute;
  filter: blur(100px);
  border-radius: 50%;
  will-change: transform;

  /* g1: Violeta principal - Grande, arriba izquierda */
  &.g1 {
    background: radial-gradient(
      circle at center,
      rgba(151, 135, 243, 0.7) 0%,
      rgba(151, 135, 243, 0) 70%
    );
    width: 90%;
    height: 90%;
    top: -20%;
    left: -20%;
    animation: ${moveInCircle} 30s ease-in-out infinite;
    opacity: ${({ theme }) => theme.mode === 'dark' ? 0.5 : 0.3};
  }

  /* g2: Lavanda claro - Medio, derecha */
  &.g2 {
    background: radial-gradient(
      circle at center,
      rgba(234, 239, 254, 0.9) 0%,
      rgba(234, 239, 254, 0) 70%
    );
    width: 70%;
    height: 70%;
    top: 10%;
    right: -15%;
    animation: ${moveVertical} 25s ease-in-out infinite;
    opacity: ${({ theme }) => theme.mode === 'dark' ? 0.3 : 0.5};
  }

  /* g3: Púrpura oscuro - Abajo izquierda */
  &.g3 {
    background: radial-gradient(
      circle at center,
      rgba(45, 39, 75, 0.8) 0%,
      rgba(45, 39, 75, 0) 70%
    );
    width: 60%;
    height: 60%;
    bottom: -10%;
    left: -10%;
    animation: ${moveHorizontal} 35s ease-in-out infinite;
    opacity: ${({ theme }) => theme.mode === 'dark' ? 0.6 : 0.2};
  }

  /* g4: Violeta brillante - Centro pulsante */
  &.g4 {
    background: radial-gradient(
      circle at center,
      rgba(167, 139, 250, 0.6) 0%,
      rgba(124, 106, 232, 0) 60%
    );
    width: 50%;
    height: 50%;
    top: 40%;
    left: 40%;
    animation: ${pulse} 8s ease-in-out infinite;
    opacity: ${({ theme }) => theme.mode === 'dark' ? 0.4 : 0.25};
  }

  /* g5: Acento rosa suave - Arriba derecha */
  &.g5 {
    background: radial-gradient(
      circle at center,
      rgba(196, 181, 253, 0.5) 0%,
      rgba(196, 181, 253, 0) 70%
    );
    width: 40%;
    height: 40%;
    top: -5%;
    right: 10%;
    animation: ${moveInCircle} 20s ease-in-out infinite reverse;
    opacity: ${({ theme }) => theme.mode === 'dark' ? 0.35 : 0.3};
  }
`;

const GridOverlay = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(
      ${({ theme }) => theme.mode === 'dark'
        ? 'rgba(151, 135, 243, 0.03)'
        : 'rgba(45, 39, 75, 0.02)'
      } 1px, transparent 1px),
    linear-gradient(
      90deg,
      ${({ theme }) => theme.mode === 'dark'
        ? 'rgba(151, 135, 243, 0.03)'
        : 'rgba(45, 39, 75, 0.02)'
      } 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
  /* Fades out towards edges for a vignette look */
  mask-image: radial-gradient(circle at center, black 30%, transparent 90%);
  -webkit-mask-image: radial-gradient(circle at center, black 30%, transparent 90%);
`;

const NoiseOverlay = styled.div`
  position: absolute;
  inset: 0;
  opacity: ${({ theme }) => theme.mode === 'dark' ? 0.04 : 0.02};
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E");
`;

/* Viñeta sutil para profundidad */
const VignetteOverlay = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse at center,
    transparent 40%,
    ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(26, 23, 48, 0.4)'
      : 'rgba(45, 39, 75, 0.08)'
    } 100%
  );
`;

const AuroraBackground = ({ children }) => {
  return (
    <>
      <BackgroundContainer>
        <AmbientLight className="g1" />
        <AmbientLight className="g2" />
        <AmbientLight className="g3" />
        <AmbientLight className="g4" />
        <AmbientLight className="g5" />
        <GridOverlay />
        <NoiseOverlay />
        <VignetteOverlay />
      </BackgroundContainer>
      <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
        {children}
      </div>
    </>
  );
};

export default AuroraBackground;
