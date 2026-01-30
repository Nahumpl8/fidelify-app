import styled from 'styled-components';

/**
 * PhoneMockup: Simula un iPhone para mostrar la vista previa del pase
 */
const PhoneMockup = ({ children }) => {
  return (
    <Phone>
      <Notch />
      <Screen>{children}</Screen>
      <HomeIndicator />
    </Phone>
  );
};

const Phone = styled.div`
  position: relative;
  width: 280px;
  height: 580px;
  background: #1a1a1a;
  border-radius: 40px;
  padding: 12px;
  box-shadow:
    0 0 0 2px #333,
    0 20px 50px rgba(0, 0, 0, 0.3),
    inset 0 0 0 2px #2a2a2a;

  /* Botones laterales */
  &::before {
    content: '';
    position: absolute;
    right: -3px;
    top: 120px;
    width: 3px;
    height: 60px;
    background: #333;
    border-radius: 0 2px 2px 0;
  }

  &::after {
    content: '';
    position: absolute;
    left: -3px;
    top: 100px;
    width: 3px;
    height: 30px;
    background: #333;
    border-radius: 2px 0 0 2px;
    box-shadow: 0 50px 0 #333, 0 90px 0 #333;
  }
`;

const Notch = styled.div`
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 28px;
  background: #1a1a1a;
  border-radius: 0 0 16px 16px;
  z-index: 10;

  /* Cámara y sensores */
  &::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 10px;
    height: 10px;
    background: #0a0a0a;
    border-radius: 50%;
    box-shadow: inset 0 0 0 2px #1f1f1f;
  }
`;

const Screen = styled.div`
  width: 100%;
  height: 100%;
  background: #000;
  border-radius: 30px;
  overflow: hidden;
  position: relative;
`;

const HomeIndicator = styled.div`
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
`;

export default PhoneMockup;
