import styled from 'styled-components';

/**
 * PassPreview: Vista previa de la tarjeta de lealtad
 * Recibe props dinámicas para actualizar en tiempo real
 *
 * @param {string} color - Color de fondo del pase (hex)
 * @param {string} textColor - Color del texto (hex)
 * @param {string} logoUrl - URL del logo del negocio
 * @param {string} programName - Nombre del programa (ej: "Café Lovers")
 * @param {string} businessName - Nombre del negocio
 * @param {string} rewardText - Texto de la recompensa (ej: "Café gratis")
 * @param {number} currentPoints - Puntos actuales del cliente
 * @param {number} targetPoints - Puntos necesarios para premio
 */
const PassPreview = ({
  color = '#6366F1',
  textColor = '#FFFFFF',
  logoUrl,
  programName = 'Programa de Lealtad',
  businessName = 'Mi Negocio',
  rewardText = 'Recompensa gratis',
  currentPoints = 3,
  targetPoints = 10,
}) => {
  const progress = Math.min((currentPoints / targetPoints) * 100, 100);

  return (
    <WalletContainer>
      {/* Header del wallet (simulado) */}
      <WalletHeader>
        <WalletTime>9:41</WalletTime>
        <WalletIcons>
          <span>📶</span>
          <span>🔋</span>
        </WalletIcons>
      </WalletHeader>

      {/* Tarjeta de lealtad */}
      <PassCard $bgColor={color}>
        <PassHeader>
          <LogoContainer>
            {logoUrl ? (
              <Logo src={logoUrl} alt={businessName} />
            ) : (
              <LogoPlaceholder $textColor={textColor}>
                {businessName.charAt(0)}
              </LogoPlaceholder>
            )}
          </LogoContainer>
          <HeaderText $textColor={textColor}>
            <BusinessName>{businessName}</BusinessName>
            <ProgramName>{programName}</ProgramName>
          </HeaderText>
        </PassHeader>

        <PassBody>
          <PointsSection>
            <PointsLabel $textColor={textColor}>Tus puntos</PointsLabel>
            <PointsValue $textColor={textColor}>
              {currentPoints} <PointsMax>/ {targetPoints}</PointsMax>
            </PointsValue>
          </PointsSection>

          <ProgressContainer>
            <ProgressBar $progress={progress} $textColor={textColor} />
            <ProgressDots>
              {[...Array(targetPoints)].map((_, i) => (
                <ProgressDot
                  key={i}
                  $filled={i < currentPoints}
                  $textColor={textColor}
                />
              ))}
            </ProgressDots>
          </ProgressContainer>

          <RewardSection $textColor={textColor}>
            <RewardIcon>🎁</RewardIcon>
            <RewardText>{rewardText}</RewardText>
          </RewardSection>
        </PassBody>

        <PassFooter>
          <Barcode>
            {/* Simulación de código de barras */}
            <BarcodeLines />
          </Barcode>
          <BarcodeText $textColor={textColor}>FID-12345678</BarcodeText>
        </PassFooter>

        {/* Strip decorativo superior */}
        <StripTop $textColor={textColor} />
      </PassCard>

      {/* Indicador de "Añadido a Wallet" */}
      <WalletBadge>
        <AppleLogo>🍎</AppleLogo> Wallet
      </WalletBadge>
    </WalletContainer>
  );
};

// === Styled Components ===

const WalletContainer = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #1c1c1e 0%, #000 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 44px;
`;

const WalletHeader = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  margin-bottom: 20px;
`;

const WalletTime = styled.span`
  color: white;
  font-size: 14px;
  font-weight: 600;
`;

const WalletIcons = styled.div`
  display: flex;
  gap: 4px;
  font-size: 12px;
`;

const PassCard = styled.div`
  width: 90%;
  background: ${({ $bgColor }) => $bgColor};
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
`;

const StripTop = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: ${({ $textColor }) => $textColor};
  opacity: 0.3;
`;

const PassHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  padding-top: 24px;
`;

const LogoContainer = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
`;

const Logo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const LogoPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: ${({ $textColor }) => $textColor};
  background: rgba(255, 255, 255, 0.15);
`;

const HeaderText = styled.div`
  color: ${({ $textColor }) => $textColor};
`;

const BusinessName = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 2px;
`;

const ProgramName = styled.div`
  font-size: 12px;
  opacity: 0.8;
`;

const PassBody = styled.div`
  padding: 16px 20px;
`;

const PointsSection = styled.div`
  text-align: center;
  margin-bottom: 16px;
`;

const PointsLabel = styled.div`
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${({ $textColor }) => $textColor};
  opacity: 0.7;
  margin-bottom: 4px;
`;

const PointsValue = styled.div`
  font-size: 36px;
  font-weight: bold;
  color: ${({ $textColor }) => $textColor};
`;

const PointsMax = styled.span`
  font-size: 18px;
  font-weight: normal;
  opacity: 0.6;
`;

const ProgressContainer = styled.div`
  margin-bottom: 16px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${({ $progress }) => $progress}%;
    background: ${({ $textColor }) => $textColor};
    border-radius: 2px;
    transition: width 0.3s ease;
  }
`;

const ProgressDots = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 4px;
`;

const ProgressDot = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${({ $filled, $textColor }) =>
    $filled ? $textColor : 'rgba(255, 255, 255, 0.2)'};
  border: 2px solid ${({ $textColor }) => $textColor};
  opacity: ${({ $filled }) => ($filled ? 1 : 0.4)};
  transition: all 0.2s ease;
`;

const RewardSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: ${({ $textColor }) => $textColor};
`;

const RewardIcon = styled.span`
  font-size: 18px;
`;

const RewardText = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

const PassFooter = styled.div`
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const Barcode = styled.div`
  width: 180px;
  height: 50px;
  background: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
`;

const BarcodeLines = styled.div`
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    90deg,
    #000 0px,
    #000 2px,
    transparent 2px,
    transparent 4px,
    #000 4px,
    #000 5px,
    transparent 5px,
    transparent 8px,
    #000 8px,
    #000 10px,
    transparent 10px,
    transparent 12px
  );
`;

const BarcodeText = styled.div`
  font-size: 10px;
  color: ${({ $textColor }) => $textColor};
  opacity: 0.6;
  letter-spacing: 2px;
`;

const WalletBadge = styled.div`
  margin-top: 20px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: white;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const AppleLogo = styled.span`
  font-size: 14px;
`;

export default PassPreview;
