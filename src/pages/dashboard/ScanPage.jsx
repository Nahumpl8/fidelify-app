import { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  ScanLine,
  Camera,
  User,
  Star,
  Gift,
  Plus,
  Minus,
  DollarSign,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrganization } from '../../context/OrganizationContext';
import { useAuth } from '../../context/AuthContext';
import { getCard, addStamp, addPointsForPurchase, redeemReward } from '../../services/loyalty';

/**
 * ScanPage - Escáner QR Premium con Glassmorphism
 *
 * Flujo:
 * 1. Negocio escanea QR del cliente (card_id)
 * 2. Muestra datos del cliente y balance
 * 3. Permite agregar sellos, registrar compra o canjear
 */
const ScanPage = () => {
  const navigate = useNavigate();
  const { organization } = useOrganization();
  const { user } = useAuth();
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  // Estados
  const [scanning, setScanning] = useState(true);
  const [scannedCard, setScannedCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modal de compra
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState('');

  // Cantidad de sellos
  const [stampsToAdd, setStampsToAdd] = useState(1);

  // Inicializar escáner
  useEffect(() => {
    if (scanning && scannerRef.current && !html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          rememberLastUsedCamera: true,
        },
        false
      );

      html5QrCodeRef.current.render(onScanSuccess, onScanError);
    }

    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.clear().catch(console.error);
        html5QrCodeRef.current = null;
      }
    };
  }, [scanning]);

  // Handler cuando se escanea exitosamente
  const onScanSuccess = async (decodedText) => {
    // Pausar escáner
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.clear().catch(console.error);
      html5QrCodeRef.current = null;
    }
    setScanning(false);
    setLoading(true);
    setError(null);

    try {
      // El QR contiene el card_id (UUID)
      const cardId = decodedText.trim();

      // Validar formato UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(cardId)) {
        throw new Error('Código QR no válido');
      }

      // Obtener datos de la tarjeta
      const cardData = await getCard(cardId);

      if (!cardData) {
        throw new Error('Tarjeta no encontrada');
      }

      // Verificar que la tarjeta pertenece a este negocio
      if (cardData.business_id !== organization?.id) {
        throw new Error('Esta tarjeta no pertenece a tu negocio');
      }

      setScannedCard(cardData);
    } catch (err) {
      setError(err.message || 'Error al procesar QR');
    } finally {
      setLoading(false);
    }
  };

  const onScanError = (error) => {
    // Ignorar errores de no detección (son normales)
    console.debug('QR scan error:', error);
  };

  // Reiniciar escáner
  const handleRescan = () => {
    setScannedCard(null);
    setError(null);
    setSuccess(null);
    setScanning(true);
    setStampsToAdd(1);
    setPurchaseAmount('');
  };

  // Agregar sello(s)
  const handleAddStamp = async () => {
    if (!scannedCard) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await addStamp(scannedCard.id, stampsToAdd, {
        description: `+${stampsToAdd} sello(s) por visita`,
        createdBy: user?.id,
      });

      if (result.success) {
        setSuccess({
          message: `+${stampsToAdd} sello${stampsToAdd > 1 ? 's' : ''} agregado${stampsToAdd > 1 ? 's' : ''}`,
          newBalance: result.new_balance,
          rewardUnlocked: result.reward_unlocked,
          rewardText: result.reward_text,
        });
        setScannedCard(prev => ({
          ...prev,
          current_balance: result.new_balance,
        }));
      } else {
        throw new Error(result.error || 'Error al agregar sello');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Registrar compra (puntos por monto)
  const handleRegisterPurchase = async () => {
    if (!scannedCard || !purchaseAmount) return;

    const amount = parseFloat(purchaseAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Ingresa un monto válido');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setShowPurchaseModal(false);

    try {
      const result = await addPointsForPurchase(scannedCard.id, amount, {
        description: `Compra de $${amount.toFixed(2)}`,
        createdBy: user?.id,
      });

      if (result.success) {
        setSuccess({
          message: `+${result.calculated_points} puntos`,
          subMessage: `Por compra de $${amount.toFixed(2)}`,
          newBalance: result.new_balance,
          rewardUnlocked: result.reward_unlocked,
          rewardText: result.reward_text,
        });
        setScannedCard(prev => ({
          ...prev,
          current_balance: result.new_balance,
        }));
        setPurchaseAmount('');
      } else {
        throw new Error(result.error || 'Error al registrar compra');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Canjear recompensa
  const handleRedeem = async () => {
    if (!scannedCard) return;

    const targetValue = scannedCard.business?.target_value || 10;
    if (scannedCard.current_balance < targetValue) {
      setError(`Necesita ${targetValue} puntos para canjear`);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await redeemReward(scannedCard.id, null, {
        description: scannedCard.business?.reward_text || 'Recompensa canjeada',
        createdBy: user?.id,
      });

      if (result.success) {
        setSuccess({
          message: 'Recompensa canjeada',
          subMessage: scannedCard.business?.reward_text,
          newBalance: result.new_balance,
          rewardUnlocked: false,
          isRedeem: true,
        });
        setScannedCard(prev => ({
          ...prev,
          current_balance: result.new_balance,
        }));
      } else {
        throw new Error(result.error || 'Error al canjear');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calcular progreso
  const getProgress = () => {
    if (!scannedCard?.business) return 0;
    const target = scannedCard.business.target_value || 10;
    return Math.min(100, Math.round((scannedCard.current_balance / target) * 100));
  };

  const canRedeem = scannedCard &&
    scannedCard.current_balance >= (scannedCard.business?.target_value || 10);

  const programType = scannedCard?.business?.program_type || 'seals';

  return (
    <PageContainer>
      {/* Header Minimalista */}
      <Header>
        <BackButton onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} />
        </BackButton>
        <HeaderContent>
          <HeaderIcon>
            <ScanLine size={20} />
          </HeaderIcon>
          <HeaderTitle>Escanear</HeaderTitle>
        </HeaderContent>
      </Header>

      {/* Main Content */}
      <Content>
        {/* Vista del Scanner */}
        {scanning && !scannedCard && !loading && !error && (
          <ScannerSection>
            <ScannerFrame>
              <ScannerCorner $position="top-left" />
              <ScannerCorner $position="top-right" />
              <ScannerCorner $position="bottom-left" />
              <ScannerCorner $position="bottom-right" />
              <ScannerLine />
              <ScannerArea>
                <div id="qr-reader" ref={scannerRef} />
              </ScannerArea>
            </ScannerFrame>

            <ScannerInfo>
              <ScannerInfoIcon>
                <Camera size={18} />
              </ScannerInfoIcon>
              <ScannerInfoText>
                <strong>Apunta al código QR</strong>
                <span>El cliente muestra su pase de Wallet</span>
              </ScannerInfoText>
            </ScannerInfo>
          </ScannerSection>
        )}

        {/* Loading State */}
        {loading && !scannedCard && (
          <StateCard>
            <LoadingRing>
              <LoadingRingInner />
            </LoadingRing>
            <StateTitle>Buscando cliente...</StateTitle>
            <StateSubtitle>Verificando tarjeta de fidelidad</StateSubtitle>
          </StateCard>
        )}

        {/* Error State */}
        {error && !scannedCard && (
          <StateCard $error>
            <StateIconWrapper $error>
              <AlertCircle size={28} />
            </StateIconWrapper>
            <StateTitle>{error}</StateTitle>
            <StateSubtitle>Verifica el código e intenta nuevamente</StateSubtitle>
            <RetryButton onClick={handleRescan}>
              <RefreshCw size={18} />
              Escanear de nuevo
            </RetryButton>
          </StateCard>
        )}

        {/* Resultados del Escaneo */}
        {scannedCard && (
          <ResultsContainer>
            {/* Card del Cliente */}
            <ClientCard>
              <ClientCardGlow />
              <ClientCardContent>
                <ClientAvatar>
                  <ClientAvatarLetter>
                    {scannedCard.client?.full_name?.charAt(0).toUpperCase() || 'C'}
                  </ClientAvatarLetter>
                  <ClientAvatarBadge>
                    <User size={10} />
                  </ClientAvatarBadge>
                </ClientAvatar>
                <ClientDetails>
                  <ClientName>
                    {scannedCard.client?.full_name || 'Cliente'}
                  </ClientName>
                  <ClientContact>
                    {scannedCard.client?.email || scannedCard.client?.phone || 'Sin contacto'}
                  </ClientContact>
                </ClientDetails>
              </ClientCardContent>

              {/* Balance Display Premium */}
              <BalanceDisplay>
                <BalanceHeader>
                  <BalanceIcon>
                    {programType === 'seals' ? <Star size={16} /> :
                     programType === 'cashback' ? <DollarSign size={16} /> :
                     <Sparkles size={16} />}
                  </BalanceIcon>
                  <BalanceLabel>
                    {programType === 'seals' ? 'Sellos acumulados' :
                     programType === 'cashback' ? 'Cashback disponible' : 'Puntos acumulados'}
                  </BalanceLabel>
                </BalanceHeader>

                <BalanceRow>
                  <BalanceNumber>
                    {programType === 'cashback'
                      ? `$${(scannedCard.current_balance / 100).toFixed(2)}`
                      : scannedCard.current_balance}
                  </BalanceNumber>
                  <BalanceDivider>/</BalanceDivider>
                  <BalanceTarget>
                    {scannedCard.business?.target_value || 10}
                  </BalanceTarget>
                </BalanceRow>

                <ProgressContainer>
                  <ProgressTrack>
                    <ProgressFill $progress={getProgress()} $canRedeem={canRedeem} />
                  </ProgressTrack>
                  <ProgressLabel>{getProgress()}%</ProgressLabel>
                </ProgressContainer>

                <RewardPreview $canRedeem={canRedeem}>
                  <Gift size={14} />
                  <span>{scannedCard.business?.reward_text || 'Recompensa disponible'}</span>
                  {canRedeem && <Trophy size={14} />}
                </RewardPreview>
              </BalanceDisplay>

              {/* Mensaje de Success */}
              {success && (
                <SuccessBanner $isRedeem={success.isRedeem}>
                  <SuccessIcon>
                    {success.isRedeem ? <Gift size={22} /> : <CheckCircle size={22} />}
                  </SuccessIcon>
                  <SuccessContent>
                    <SuccessMessage>{success.message}</SuccessMessage>
                    {success.subMessage && (
                      <SuccessSubMessage>{success.subMessage}</SuccessSubMessage>
                    )}
                    {success.rewardUnlocked && (
                      <RewardUnlockedBadge>
                        <Trophy size={14} />
                        {success.rewardText}
                      </RewardUnlockedBadge>
                    )}
                  </SuccessContent>
                </SuccessBanner>
              )}

              {/* Mensaje de Error */}
              {error && (
                <ErrorBanner>
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </ErrorBanner>
              )}
            </ClientCard>

            {/* Panel de Acciones */}
            <ActionsPanel>
              {/* Selector de Sellos (solo para programa de sellos) */}
              {programType === 'seals' && (
                <ActionSection>
                  <ActionSectionTitle>Agregar sellos</ActionSectionTitle>
                  <StampSelectorRow>
                    <StampAdjustButton
                      onClick={() => setStampsToAdd(Math.max(1, stampsToAdd - 1))}
                      disabled={stampsToAdd <= 1 || loading}
                    >
                      <Minus size={20} />
                    </StampAdjustButton>
                    <StampCountDisplay>
                      <StampCountNumber>{stampsToAdd}</StampCountNumber>
                      <StampCountLabel>sello{stampsToAdd > 1 ? 's' : ''}</StampCountLabel>
                    </StampCountDisplay>
                    <StampAdjustButton
                      onClick={() => setStampsToAdd(stampsToAdd + 1)}
                      disabled={loading}
                      $plus
                    >
                      <Plus size={20} />
                    </StampAdjustButton>
                  </StampSelectorRow>
                  <PrimaryActionButton onClick={handleAddStamp} disabled={loading}>
                    {loading ? <LoadingDots /> : (
                      <>
                        <Plus size={18} />
                        Agregar {stampsToAdd} sello{stampsToAdd > 1 ? 's' : ''}
                      </>
                    )}
                  </PrimaryActionButton>
                </ActionSection>
              )}

              {/* Registrar Compra (para puntos/cashback) */}
              {(programType === 'points' || programType === 'cashback' || programType === 'levels') && (
                <ActionSection>
                  <ActionSectionTitle>Registrar compra</ActionSectionTitle>
                  <SecondaryActionButton
                    onClick={() => setShowPurchaseModal(true)}
                    disabled={loading}
                  >
                    <DollarSign size={18} />
                    Ingresar monto de compra
                  </SecondaryActionButton>
                </ActionSection>
              )}

              {/* Canjear Recompensa */}
              {canRedeem && (
                <ActionSection>
                  <ActionSectionTitle>Recompensa lista</ActionSectionTitle>
                  <RedeemActionButton onClick={handleRedeem} disabled={loading}>
                    {loading ? <LoadingDots /> : (
                      <>
                        <Gift size={18} />
                        Canjear recompensa
                      </>
                    )}
                  </RedeemActionButton>
                </ActionSection>
              )}

              {/* Escanear Otro */}
              <NewScanButton onClick={handleRescan}>
                <RefreshCw size={16} />
                Escanear otro cliente
              </NewScanButton>
            </ActionsPanel>
          </ResultsContainer>
        )}
      </Content>

      {/* Modal de Compra */}
      {showPurchaseModal && (
        <ModalOverlay onClick={() => setShowPurchaseModal(false)}>
          <ModalCard onClick={e => e.stopPropagation()}>
            <ModalCloseButton onClick={() => setShowPurchaseModal(false)}>
              <X size={20} />
            </ModalCloseButton>

            <ModalIcon>
              <DollarSign size={28} />
            </ModalIcon>

            <ModalTitle>Registrar Compra</ModalTitle>
            <ModalSubtitle>
              {scannedCard?.business?.program_config?.points_per_currency || 1} punto por cada $1 gastado
            </ModalSubtitle>

            <AmountInputContainer>
              <AmountPrefix>$</AmountPrefix>
              <AmountInputField
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(e.target.value)}
                autoFocus
              />
            </AmountInputContainer>

            <ModalActions>
              <ModalCancelButton onClick={() => setShowPurchaseModal(false)}>
                Cancelar
              </ModalCancelButton>
              <ModalConfirmButton
                onClick={handleRegisterPurchase}
                disabled={!purchaseAmount || parseFloat(purchaseAmount) <= 0}
              >
                Confirmar
              </ModalConfirmButton>
            </ModalActions>
          </ModalCard>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

// ============================================
// ANIMATIONS
// ============================================
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const scanLine = keyframes`
  0%, 100% { top: 0; }
  50% { top: calc(100% - 4px); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const dotPulse = keyframes`
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
`;

// ============================================
// STYLED COMPONENTS
// ============================================

const PageContainer = styled.div`
  min-height: 100%;
  padding: 20px;
  animation: ${fadeIn} 0.3s ease-out;

  @media (max-width: 640px) {
    padding: 16px;
  }
`;

// Header
const Header = styled.header`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const BackButton = styled.button`
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(45, 39, 75, 0.6)'
      : 'rgba(255, 255, 255, 0.7)'};
  backdrop-filter: blur(12px);
  border: 1px solid ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(151, 135, 243, 0.2)'
      : 'rgba(151, 135, 243, 0.15)'};
  border-radius: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #9787F3;
    border-color: rgba(151, 135, 243, 0.4);
    transform: translateX(-2px);
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HeaderIcon = styled.div`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(151, 135, 243, 0.2), rgba(167, 139, 250, 0.2));
  border-radius: 10px;
  color: #9787F3;
`;

const HeaderTitle = styled.h1`
  font-size: 22px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const Content = styled.main`
  max-width: 440px;
  margin: 0 auto;
`;

// Scanner Section
const ScannerSection = styled.div`
  animation: ${fadeInUp} 0.4s ease-out;
`;

const ScannerFrame = styled.div`
  position: relative;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(26, 23, 48, 0.8)'
      : 'rgba(255, 255, 255, 0.8)'};
  backdrop-filter: blur(20px);
  border-radius: 28px;
  padding: 20px;
  margin-bottom: 20px;
  overflow: hidden;
`;

const ScannerCorner = styled.div`
  position: absolute;
  width: 24px;
  height: 24px;
  border-color: #9787F3;
  border-style: solid;
  border-width: 0;
  z-index: 10;

  ${({ $position }) => {
    switch ($position) {
      case 'top-left':
        return css`
          top: 16px;
          left: 16px;
          border-top-width: 3px;
          border-left-width: 3px;
          border-top-left-radius: 8px;
        `;
      case 'top-right':
        return css`
          top: 16px;
          right: 16px;
          border-top-width: 3px;
          border-right-width: 3px;
          border-top-right-radius: 8px;
        `;
      case 'bottom-left':
        return css`
          bottom: 16px;
          left: 16px;
          border-bottom-width: 3px;
          border-left-width: 3px;
          border-bottom-left-radius: 8px;
        `;
      case 'bottom-right':
        return css`
          bottom: 16px;
          right: 16px;
          border-bottom-width: 3px;
          border-right-width: 3px;
          border-bottom-right-radius: 8px;
        `;
      default:
        return '';
    }
  }}
`;

const ScannerLine = styled.div`
  position: absolute;
  left: 20px;
  right: 20px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #9787F3, transparent);
  border-radius: 2px;
  z-index: 10;
  animation: ${scanLine} 2.5s ease-in-out infinite;
  box-shadow: 0 0 12px rgba(151, 135, 243, 0.6);
`;

const ScannerArea = styled.div`
  border-radius: 16px;
  overflow: hidden;

  #qr-reader {
    border: none !important;
    background: transparent !important;

    #qr-reader__scan_region {
      min-height: 280px;
      background: ${({ theme }) =>
        theme.mode === 'dark'
          ? 'rgba(0, 0, 0, 0.3)'
          : 'rgba(0, 0, 0, 0.05)'} !important;
      border-radius: 12px;
    }

    #qr-reader__dashboard {
      padding: 12px !important;
      background: transparent !important;
    }

    #qr-reader__dashboard_section_swaplink {
      text-decoration: none !important;
      color: #9787F3 !important;
    }

    video {
      border-radius: 12px;
    }

    button {
      background: linear-gradient(135deg, #9787F3, #7C6AE8) !important;
      border: none !important;
      border-radius: 8px !important;
      color: white !important;
      padding: 8px 16px !important;
      font-weight: 500 !important;
      cursor: pointer !important;
    }
  }
`;

const ScannerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(151, 135, 243, 0.1)'
      : 'rgba(151, 135, 243, 0.08)'};
  border-radius: 16px;
  border: 1px solid rgba(151, 135, 243, 0.15);
`;

const ScannerInfoIcon = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #9787F3, #7C6AE8);
  border-radius: 12px;
  color: white;
  flex-shrink: 0;
`;

const ScannerInfoText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong {
    font-size: 14px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  span {
    font-size: 13px;
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

// State Cards (Loading, Error)
const StateCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 48px 32px;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(45, 39, 75, 0.6)'
      : 'rgba(255, 255, 255, 0.7)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${({ theme, $error }) =>
    $error
      ? 'rgba(239, 68, 68, 0.3)'
      : theme.mode === 'dark'
        ? 'rgba(151, 135, 243, 0.2)'
        : 'rgba(255, 255, 255, 0.6)'};
  border-radius: 28px;
  animation: ${fadeInUp} 0.4s ease-out;
`;

const LoadingRing = styled.div`
  position: relative;
  width: 64px;
  height: 64px;
  margin-bottom: 20px;
`;

const LoadingRingInner = styled.div`
  position: absolute;
  inset: 0;
  border: 3px solid rgba(151, 135, 243, 0.2);
  border-top-color: #9787F3;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const StateIconWrapper = styled.div`
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $error }) =>
    $error
      ? 'rgba(239, 68, 68, 0.15)'
      : 'rgba(151, 135, 243, 0.15)'};
  border-radius: 20px;
  margin-bottom: 20px;
  color: ${({ $error }) => $error ? '#EF4444' : '#9787F3'};
`;

const StateTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 8px 0;
`;

const StateSubtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.muted};
  margin: 0 0 24px 0;
`;

const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #9787F3, #7C6AE8);
  color: white;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(151, 135, 243, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(151, 135, 243, 0.4);
  }
`;

// Results Container
const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: ${fadeInUp} 0.4s ease-out;
`;

// Client Card
const ClientCard = styled.div`
  position: relative;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(45, 39, 75, 0.6)'
      : 'rgba(255, 255, 255, 0.75)'};
  backdrop-filter: blur(24px);
  border: 1px solid ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(151, 135, 243, 0.2)'
      : 'rgba(255, 255, 255, 0.8)'};
  border-radius: 28px;
  padding: 24px;
  overflow: hidden;
`;

const ClientCardGlow = styled.div`
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(151, 135, 243, 0.15) 0%, transparent 70%);
  pointer-events: none;
`;

const ClientCardContent = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const ClientAvatar = styled.div`
  position: relative;
  width: 60px;
  height: 60px;
  flex-shrink: 0;
`;

const ClientAvatarLetter = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #9787F3, #7C6AE8);
  color: white;
  font-size: 26px;
  font-weight: 600;
  border-radius: 18px;
  box-shadow: 0 4px 12px rgba(151, 135, 243, 0.3);
`;

const ClientAvatarBadge = styled.div`
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.mode === 'dark' ? '#2D274B' : '#EAEFFE'};
  border: 2px solid ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(45, 39, 75, 1)'
      : 'rgba(255, 255, 255, 1)'};
  border-radius: 50%;
  color: #9787F3;
`;

const ClientDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const ClientName = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ClientContact = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.muted};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// Balance Display
const BalanceDisplay = styled.div`
  position: relative;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(151, 135, 243, 0.15), rgba(45, 39, 75, 0.4))'
      : 'linear-gradient(135deg, rgba(151, 135, 243, 0.1), rgba(234, 239, 254, 0.5))'};
  border-radius: 20px;
  padding: 20px;
`;

const BalanceHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const BalanceIcon = styled.div`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(151, 135, 243, 0.2);
  border-radius: 8px;
  color: #9787F3;
`;

const BalanceLabel = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.03em;
`;

const BalanceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 16px;
`;

const BalanceNumber = styled.span`
  font-size: 44px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1;
`;

const BalanceDivider = styled.span`
  font-size: 28px;
  font-weight: 300;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const BalanceTarget = styled.span`
  font-size: 28px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const ProgressTrack = styled.div`
  flex: 1;
  height: 10px;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.08)'};
  border-radius: 5px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background: ${({ $canRedeem }) =>
    $canRedeem
      ? 'linear-gradient(90deg, #10B981, #34D399)'
      : 'linear-gradient(90deg, #9787F3, #A78BFA)'};
  border-radius: 5px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
`;

const ProgressLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  min-width: 40px;
  text-align: right;
`;

const RewardPreview = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: ${({ $canRedeem, theme }) =>
    $canRedeem
      ? 'rgba(16, 185, 129, 0.15)'
      : theme.mode === 'dark'
        ? 'rgba(151, 135, 243, 0.1)'
        : 'rgba(151, 135, 243, 0.08)'};
  border: 1px solid ${({ $canRedeem }) =>
    $canRedeem
      ? 'rgba(16, 185, 129, 0.3)'
      : 'rgba(151, 135, 243, 0.2)'};
  border-radius: 12px;
  color: ${({ $canRedeem }) => $canRedeem ? '#10B981' : '#9787F3'};
  font-size: 13px;
  font-weight: 500;

  span {
    flex: 1;
  }
`;

// Success/Error Banners
const SuccessBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  margin-top: 16px;
  background: ${({ $isRedeem }) =>
    $isRedeem
      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.08))'
      : 'linear-gradient(135deg, rgba(151, 135, 243, 0.15), rgba(151, 135, 243, 0.08))'};
  border: 1px solid ${({ $isRedeem }) =>
    $isRedeem
      ? 'rgba(16, 185, 129, 0.3)'
      : 'rgba(151, 135, 243, 0.3)'};
  border-radius: 16px;
  animation: ${fadeInUp} 0.3s ease-out;
`;

const SuccessIcon = styled.div`
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #10B981, #059669);
  border-radius: 12px;
  color: white;
  flex-shrink: 0;
`;

const SuccessContent = styled.div`
  flex: 1;
  padding-top: 2px;
`;

const SuccessMessage = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const SuccessSubMessage = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 2px;
`;

const RewardUnlockedBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 8px 12px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1));
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #10B981;
`;

const ErrorBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  margin-top: 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 14px;
  color: #EF4444;
  font-size: 14px;
  font-weight: 500;
`;

// Actions Panel
const ActionsPanel = styled.div`
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(45, 39, 75, 0.5)'
      : 'rgba(255, 255, 255, 0.65)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(151, 135, 243, 0.15)'
      : 'rgba(255, 255, 255, 0.6)'};
  border-radius: 24px;
  padding: 20px;
`;

const ActionSection = styled.div`
  margin-bottom: 20px;

  &:last-of-type {
    margin-bottom: 16px;
  }
`;

const ActionSectionTitle = styled.h3`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.text.muted};
  margin: 0 0 12px 0;
`;

// Stamp Selector
const StampSelectorRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 16px;
`;

const StampAdjustButton = styled.button`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme, $plus }) =>
    $plus
      ? 'linear-gradient(135deg, rgba(151, 135, 243, 0.2), rgba(151, 135, 243, 0.1))'
      : theme.mode === 'dark'
        ? 'rgba(45, 39, 75, 0.6)'
        : 'rgba(0, 0, 0, 0.05)'};
  border: 1px solid ${({ $plus }) =>
    $plus
      ? 'rgba(151, 135, 243, 0.4)'
      : 'rgba(151, 135, 243, 0.2)'};
  border-radius: 14px;
  color: ${({ $plus, theme }) =>
    $plus ? '#9787F3' : theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ $plus }) =>
      $plus
        ? 'rgba(151, 135, 243, 0.3)'
        : 'rgba(151, 135, 243, 0.15)'};
    color: #9787F3;
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const StampCountDisplay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
`;

const StampCountNumber = styled.span`
  font-size: 40px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1;
`;

const StampCountLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 2px;
`;

// Action Buttons
const PrimaryActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #9787F3, #7C6AE8);
  color: white;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(151, 135, 243, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(151, 135, 243, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecondaryActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 16px;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(151, 135, 243, 0.15)'
      : 'rgba(151, 135, 243, 0.1)'};
  backdrop-filter: blur(8px);
  color: #9787F3;
  font-size: 15px;
  font-weight: 600;
  border: 1px solid rgba(151, 135, 243, 0.3);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(151, 135, 243, 0.2);
    border-color: #9787F3;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const RedeemActionButton = styled(PrimaryActionButton)`
  background: linear-gradient(135deg, #10B981, #059669);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);

  &:hover:not(:disabled) {
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }
`;

const NewScanButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 14px;
  font-weight: 500;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #9787F3;
    border-color: rgba(151, 135, 243, 0.4);
    border-style: solid;
  }
`;

// Loading Dots
const LoadingDots = styled.div`
  display: flex;
  gap: 4px;

  &::before,
  &::after,
  & {
    content: '';
    width: 6px;
    height: 6px;
    background: white;
    border-radius: 50%;
  }

  &::before {
    animation: ${dotPulse} 1.2s ease-in-out infinite;
  }

  & {
    animation: ${dotPulse} 1.2s ease-in-out 0.15s infinite;
  }

  &::after {
    animation: ${dotPulse} 1.2s ease-in-out 0.3s infinite;
  }
`;

// Modal
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalCard = styled.div`
  position: relative;
  width: 100%;
  max-width: 380px;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(45, 39, 75, 0.95)'
      : 'rgba(255, 255, 255, 0.95)'};
  backdrop-filter: blur(24px);
  border: 1px solid ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(151, 135, 243, 0.2)'
      : 'rgba(255, 255, 255, 0.8)'};
  border-radius: 28px;
  padding: 32px 24px 24px;
  text-align: center;
  animation: ${fadeInUp} 0.3s ease-out;
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.05)'};
  border: none;
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.text.muted};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #EF4444;
  }
`;

const ModalIcon = styled.div`
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, rgba(151, 135, 243, 0.2), rgba(167, 139, 250, 0.2));
  border-radius: 20px;
  color: #9787F3;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 8px 0;
`;

const ModalSubtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.muted};
  margin: 0 0 24px 0;
`;

const AmountInputContainer = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(0, 0, 0, 0.2)'
      : 'rgba(0, 0, 0, 0.04)'};
  border: 2px solid transparent;
  border-radius: 16px;
  padding: 4px 16px;
  margin-bottom: 24px;
  transition: border-color 0.2s ease;

  &:focus-within {
    border-color: #9787F3;
  }
`;

const AmountPrefix = styled.span`
  font-size: 28px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const AmountInputField = styled.input`
  flex: 1;
  padding: 16px 8px;
  font-size: 32px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  background: transparent;
  border: none;
  outline: none;
  text-align: left;
  min-width: 0;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
    font-weight: 400;
  }

  /* Hide number spinners */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
`;

const ModalCancelButton = styled.button`
  flex: 1;
  padding: 14px;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 15px;
  font-weight: 600;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(151, 135, 243, 0.4);
    color: #9787F3;
  }
`;

const ModalConfirmButton = styled.button`
  flex: 1;
  padding: 14px;
  background: linear-gradient(135deg, #9787F3, #7C6AE8);
  color: white;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(151, 135, 243, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(151, 135, 243, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default ScanPage;
