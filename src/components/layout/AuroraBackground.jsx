import styled, { keyframes } from 'styled-components';

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

const BackgroundContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  overflow: hidden;
  background: #080a10; /* Deep dark base */
`;

const AmbientLight = styled.div`
  position: absolute;
  filter: blur(80px);
  opacity: 0.6;
  border-radius: 50%;
  animation: ${moveInCircle} 20s linear infinite;

  &.g1 {
    background: radial-gradient(circle at center, rgba(18, 113, 255, 0.8) 0, rgba(18, 113, 255, 0) 50%) no-repeat;
    width: 80%;
    height: 80%;
    top: -10%;
    left: -10%;
    transform-origin: center center;
    opacity: 0.5;
  }

  &.g2 {
    background: radial-gradient(circle at center, rgba(221, 74, 255, 0.8) 0, rgba(221, 74, 255, 0) 50%) no-repeat;
    width: 60%;
    height: 60%;
    top: 20%;
    left: 50%;
    transform-origin: calc(50% - 400px);
    animation: ${moveVertical} 30s ease infinite;
    opacity: 0.4;
  }

  &.g3 {
    background: radial-gradient(circle at center, rgba(100, 220, 255, 0.8) 0, rgba(100, 220, 255, 0) 50%) no-repeat;
    width: 50%;
    height: 50%;
    top: 40%;
    left: -20%;
    transform-origin: calc(50% + 400px);
    animation: ${moveHorizontal} 40s ease infinite;
    opacity: 0.3;
  }

  &.g4 {
    background: radial-gradient(circle at center, rgba(200, 50, 50, 0.8) 0, rgba(200, 50, 50, 0) 50%) no-repeat;
    width: 70%;
    height: 70%;
    bottom: -20%;
    right: -20%;
    transform-origin: calc(50% - 200px);
    animation: ${moveInCircle} 40s ease infinite reverse;
    opacity: 0.2;
  }
`;

const GridOverlay = styled.div`
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
  /* Fades out towards edges for a vignette look */
  mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
  -webkit-mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
`;

const NoiseOverlay = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0.03;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E");
`;

const AuroraBackground = ({ children }) => {
    return (
        <>
            <BackgroundContainer>
                <AmbientLight className="g1" />
                <AmbientLight className="g2" />
                <AmbientLight className="g3" />
                <AmbientLight className="g4" />
                <GridOverlay />
                <NoiseOverlay />
            </BackgroundContainer>
            <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
                {children}
            </div>
        </>
    );
};

export default AuroraBackground;
