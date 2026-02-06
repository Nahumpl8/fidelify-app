import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useClient } from '../../context/ClientContext';
import { useAuth } from '../../context/AuthContext';
import {
  Wallet, LogOut, CreditCard, Gift, ChevronRight, Smartphone,
} from 'lucide-react';
import StripCanvas from '../../components/strip-studio/StripCanvas';
import {
  generateApplePass,
  downloadApplePass,
  generateGooglePass,
  openGoogleWalletSave,
  supportsAppleWallet,
  supportsGoogleWallet,
} from '../../services/wallet';

const ClientPortal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { clientProfile, loyaltyCards, loading } = useClient();
  const [walletLoading, setWalletLoading] = useState({});

  const welcomeMessage = location.state?.welcomeMessage;

  const handleSignOut = async () => {
    await signOut();
    navigate('/client/login');
  };

  const handleDownloadApple = async (cardId) => {
    setWalletLoading(prev => ({ ...prev, [`${cardId}_apple`]: true }));
    try {
      const result = await generateApplePass(cardId);
      if (result.success && result.downloadUrl) {
        downloadApplePass(result.downloadUrl);
      } else {
        alert('Error: ' + (result.error || 'No se pudo generar el pase'));
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setWalletLoading(prev => ({ ...prev, [`${cardId}_apple`]: false }));
    }
  };

  const handleDownloadGoogle = async (cardId) => {
    setWalletLoading(prev => ({ ...prev, [`${cardId}_google`]: true }));
    try {
      const result = await generateGooglePass(cardId);
      if (result.success && result.saveUrl) {
        openGoogleWalletSave(result.saveUrl);
      } else {
        alert('Error: ' + (result.error || 'No se pudo generar el pase'));
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setWalletLoading(prev => ({ ...prev, [`${cardId}_google`]: false }));
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <LoadingText>Cargando tus tarjetas...</LoadingText>
      </LoadingContainer>
    );
  }

  const firstName = clientProfile?.first_name || clientProfile?.full_name?.split(' ')[0] || 'Cliente';
  const singleBusiness = loyaltyCards.length === 1 ? loyaltyCards[0].business?.name : null;

  return (
    <PageContainer>
      {/* Header */}
      <Header>
        <HeaderTop>
          <Logo>
            <Wallet size={24} />
            <span>Fidelify</span>
          </Logo>
          <LogoutButton onClick={handleSignOut}>
            <LogOut size={18} />
          </LogoutButton>
        </HeaderTop>

        <WelcomeSection>
          <WelcomeText>Hola, {firstName}!</WelcomeText>
          <WelcomeSubtext>
            Bienvenido a tu panel Fidelify
            {singleBusiness && ` de ${singleBusiness}`}
          </WelcomeSubtext>
        </WelcomeSection>

        {welcomeMessage && (
          <SuccessBanner>{welcomeMessage}</SuccessBanner>
        )}
      </Header>

      {/* Cards */}
      <CardsSection>
        {loyaltyCards.length === 0 ? (
          <EmptyState>
            <CreditCard size={56} strokeWidth={1.5} />
            <EmptyTitle>Sin tarjetas aún</EmptyTitle>
            <EmptyText>
              Registrate en un negocio para comenzar a acumular recompensas.
            </EmptyText>
          </EmptyState>
        ) : (
          <CardsList>
            {loyaltyCards.map((card) => {
              const business = card.business;
              if (!business) return null;

              const currentBalance = card.current_balance || 0;
              const targetValue = business.target_value || 10;
              const programType = business.program_type || 'seals';
              const canRedeem = currentBalance >= targetValue;
              const brandingConfig = business.branding_config || {};
              const rulesConfig = {
                target_stamps: targetValue,
                reward_text: business.reward_text,
              };

              return (
                <LoyaltyCard key={card.id}>
                  {/* Business Header */}
                  <CardHeader>
                    {business.logo_url ? (
                      <BusinessLogo src={business.logo_url} alt={business.name} />
                    ) : (
                      <BusinessLogoPlaceholder>
                        {business.name?.charAt(0).toUpperCase()}
                      </BusinessLogoPlaceholder>
                    )}
                    <BusinessInfo>
                      <BusinessName>{business.name}</BusinessName>
                      <ProgramType>
                        {programType === 'seals' ? 'Programa de Sellos' :
                         programType === 'cashback' ? 'Cashback' : 'Programa de Puntos'}
                      </ProgramType>
                    </BusinessInfo>
                  </CardHeader>

                  {/* Strip Visual */}
                  <StripSection
                    onClick={() => navigate(`/portal/card/${card.id}`)}
                  >
                    <StripCanvas
                      brandingConfig={brandingConfig}
                      rulesConfig={rulesConfig}
                      currentProgress={currentBalance}
                      scale={1}
                    />
                  </StripSection>

                  {/* Progress */}
                  <ProgressSection>
                    <ProgressInfo>
                      <ProgressLabel>Progreso</ProgressLabel>
                      <ProgressValue>
                        {currentBalance} / {targetValue}{' '}
                        {programType === 'seals' ? 'sellos' : 'puntos'}
                      </ProgressValue>
                    </ProgressInfo>
                    {canRedeem && (
                      <RewardBadge>
                        <Gift size={14} />
                        Recompensa lista
                      </RewardBadge>
                    )}
                  </ProgressSection>

                  {business.reward_text && (
                    <RewardInfo>
                      <Gift size={16} />
                      {business.reward_text}
                    </RewardInfo>
                  )}

                  {/* Wallet Buttons */}
                  <WalletActions>
                    {supportsAppleWallet() && (
                      <WalletButton
                        onClick={() => handleDownloadApple(card.id)}
                        disabled={walletLoading[`${card.id}_apple`]}
                      >
                        <Smartphone size={16} />
                        {walletLoading[`${card.id}_apple`] ? 'Generando...' : 'Apple Wallet'}
                      </WalletButton>
                    )}
                    {supportsGoogleWallet() && (
                      <WalletButton
                        $google
                        onClick={() => handleDownloadGoogle(card.id)}
                        disabled={walletLoading[`${card.id}_google`]}
                      >
                        <Smartphone size={16} />
                        {walletLoading[`${card.id}_google`] ? 'Generando...' : 'Google Wallet'}
                      </WalletButton>
                    )}
                  </WalletActions>

                  {/* View Details */}
                  <DetailsButton onClick={() => navigate(`/portal/card/${card.id}`)}>
                    Ver historial
                    <ChevronRight size={16} />
                  </DetailsButton>
                </LoyaltyCard>
              );
            })}
          </CardsList>
        )}
      </CardsSection>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 30%, #1a1a2e 100%);
  padding-bottom: 40px;
`;

const Header = styled.div`
  padding: 20px 20px 28px;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 700;
  color: white;
`;

const LogoutButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
`;

const WelcomeSection = styled.div``;

const WelcomeText = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 6px 0;
  color: white;
`;

const WelcomeSubtext = styled.p`
  font-size: 15px;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
`;

const SuccessBanner = styled.div`
  margin-top: 16px;
  padding: 12px 16px;
  background: rgba(72, 187, 120, 0.2);
  border: 1px solid rgba(72, 187, 120, 0.4);
  border-radius: 12px;
  color: #c6f6d5;
  font-size: 14px;
`;

const CardsSection = styled.div`
  padding: 0 16px;
`;

const EmptyState = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 48px 24px;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);

  svg {
    color: rgba(255, 255, 255, 0.4);
    margin-bottom: 16px;
  }
`;

const EmptyTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin: 0 0 8px 0;
`;

const EmptyText = styled.p`
  font-size: 15px;
  margin: 0;
`;

const CardsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const LoyaltyCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
`;

const BusinessLogo = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: cover;
  border: 2px solid #edf2f7;
`;

const BusinessLogoPlaceholder = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: 700;
`;

const BusinessInfo = styled.div`
  flex: 1;
`;

const BusinessName = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 2px 0;
  color: #1a202c;
`;

const ProgramType = styled.p`
  font-size: 13px;
  color: #718096;
  margin: 0;
`;

const StripSection = styled.div`
  margin: 0 -4px 16px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s;

  &:active {
    transform: scale(0.98);
  }
`;

const ProgressSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: #f7fafc;
  border-radius: 12px;
  margin-bottom: 12px;
`;

const ProgressInfo = styled.div``;

const ProgressLabel = styled.div`
  font-size: 11px;
  color: #a0aec0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 2px;
`;

const ProgressValue = styled.div`
  font-size: 17px;
  font-weight: 700;
  color: #1a202c;
`;

const RewardBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  background: linear-gradient(135deg, #48bb78, #38a169);
  color: white;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
`;

const RewardInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #fefce8;
  border: 1px solid #fde68a;
  border-radius: 10px;
  color: #92400e;
  font-size: 13px;
  margin-bottom: 14px;
`;

const WalletActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
`;

const WalletButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
  background: ${({ $google }) => $google
    ? 'linear-gradient(135deg, #4285F4, #34A853)'
    : '#000'};
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DetailsButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  background: transparent;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  color: #718096;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f7fafc;
    border-color: #cbd5e0;
  }
`;

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: rgba(255, 255, 255, 0.8);
  margin-top: 16px;
  font-size: 15px;
`;

export default ClientPortal;
