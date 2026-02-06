import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';
import { useClient } from '../../context/ClientContext';
import {
  ArrowLeft, Star, Gift, Clock, TrendingUp, Smartphone,
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

const ClientCardDetail = () => {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const { loyaltyCards } = useClient();
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(true);
  const [walletLoading, setWalletLoading] = useState({});

  // Find the card from context
  const card = loyaltyCards.find(c => c.id === cardId);
  const business = card?.business;

  // Fetch transactions
  useEffect(() => {
    if (!cardId) return;

    const fetchTransactions = async () => {
      setTxLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('card_id', cardId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setTransactions(data);
      }
      setTxLoading(false);
    };

    fetchTransactions();
  }, [cardId]);

  const handleDownloadApple = async () => {
    setWalletLoading(prev => ({ ...prev, apple: true }));
    try {
      const result = await generateApplePass(cardId);
      if (result.success && result.downloadUrl) {
        downloadApplePass(result.downloadUrl);
      } else {
        alert('Error: ' + (result.error || 'No se pudo generar'));
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setWalletLoading(prev => ({ ...prev, apple: false }));
    }
  };

  const handleDownloadGoogle = async () => {
    setWalletLoading(prev => ({ ...prev, google: true }));
    try {
      const result = await generateGooglePass(cardId);
      if (result.success && result.saveUrl) {
        openGoogleWalletSave(result.saveUrl);
      } else {
        alert('Error: ' + (result.error || 'No se pudo generar'));
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setWalletLoading(prev => ({ ...prev, google: false }));
    }
  };

  if (!card || !business) {
    return (
      <PageContainer>
        <ErrorState>
          <p>Tarjeta no encontrada</p>
          <BackBtn onClick={() => navigate('/portal')}>
            <ArrowLeft size={18} /> Volver
          </BackBtn>
        </ErrorState>
      </PageContainer>
    );
  }

  const currentBalance = card.current_balance || 0;
  const targetValue = business.target_value || 10;
  const programType = business.program_type || 'seals';
  const canRedeem = currentBalance >= targetValue;
  const brandingConfig = business.branding_config || {};
  const rulesConfig = {
    target_stamps: targetValue,
    reward_text: business.reward_text,
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'EARN': return 'Visita';
      case 'REDEEM': return 'Canje';
      case 'ADJUSTMENT': return 'Ajuste';
      case 'BONUS': return 'Bonus';
      default: return type;
    }
  };

  return (
    <PageContainer>
      {/* Back nav */}
      <NavBar>
        <BackBtn onClick={() => navigate('/portal')}>
          <ArrowLeft size={18} />
          Volver
        </BackBtn>
      </NavBar>

      {/* Business Header */}
      <BusinessHeader>
        {business.logo_url ? (
          <BizLogo src={business.logo_url} alt={business.name} />
        ) : (
          <BizLogoPlaceholder>
            {business.name?.charAt(0).toUpperCase()}
          </BizLogoPlaceholder>
        )}
        <BizName>{business.name}</BizName>
      </BusinessHeader>

      {/* Strip */}
      <StripSection>
        <StripCanvas
          brandingConfig={brandingConfig}
          rulesConfig={rulesConfig}
          currentProgress={currentBalance}
          scale={1}
        />
      </StripSection>

      {/* Stats */}
      <StatsGrid>
        <StatCard>
          <StatIcon $color="#667eea"><Star size={20} /></StatIcon>
          <StatValue>{currentBalance}</StatValue>
          <StatLabel>{programType === 'seals' ? 'Sellos' : 'Puntos'}</StatLabel>
        </StatCard>
        <StatCard>
          <StatIcon $color="#48bb78"><Gift size={20} /></StatIcon>
          <StatValue>{card.rewards_redeemed || 0}</StatValue>
          <StatLabel>Canjeados</StatLabel>
        </StatCard>
        <StatCard>
          <StatIcon $color="#ed8936"><TrendingUp size={20} /></StatIcon>
          <StatValue>{card.lifetime_balance || 0}</StatValue>
          <StatLabel>Total</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Reward info */}
      {canRedeem && (
        <RewardBanner>
          <Gift size={18} />
          Tienes una recompensa disponible: {business.reward_text || 'Premio especial'}
        </RewardBanner>
      )}

      {/* Wallet Buttons */}
      <WalletSection>
        <SectionTitle>Descargar Tarjeta</SectionTitle>
        <WalletGrid>
          {supportsAppleWallet() && (
            <WalletBtn
              onClick={handleDownloadApple}
              disabled={walletLoading.apple}
            >
              <Smartphone size={16} />
              {walletLoading.apple ? 'Generando...' : 'Apple Wallet'}
            </WalletBtn>
          )}
          {supportsGoogleWallet() && (
            <WalletBtn
              $google
              onClick={handleDownloadGoogle}
              disabled={walletLoading.google}
            >
              <Smartphone size={16} />
              {walletLoading.google ? 'Generando...' : 'Google Wallet'}
            </WalletBtn>
          )}
        </WalletGrid>
      </WalletSection>

      {/* Transactions */}
      <TransactionsSection>
        <SectionTitle>
          <Clock size={18} />
          Historial
        </SectionTitle>

        {txLoading ? (
          <TxLoadingText>Cargando historial...</TxLoadingText>
        ) : transactions.length === 0 ? (
          <TxEmpty>Sin transacciones aún</TxEmpty>
        ) : (
          <TxList>
            {transactions.map(tx => (
              <TxItem key={tx.id}>
                <TxLeft>
                  <TxType>{getTypeLabel(tx.type)}</TxType>
                  <TxDate>
                    {new Date(tx.created_at).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TxDate>
                </TxLeft>
                <TxAmount $positive={tx.amount > 0}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount}
                </TxAmount>
              </TxItem>
            ))}
          </TxList>
        )}
      </TransactionsSection>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: #f7fafc;
  padding-bottom: 40px;
`;

const NavBar = styled.div`
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #edf2f7;
`;

const BackBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #667eea;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
`;

const BusinessHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 20px 16px;
  background: white;
`;

const BizLogo = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 14px;
  object-fit: cover;
  margin-bottom: 10px;
  border: 2px solid #edf2f7;
`;

const BizLogoPlaceholder = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 10px;
`;

const BizName = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
`;

const StripSection = styled.div`
  margin: 16px;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  padding: 0 16px;
  margin-bottom: 16px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 14px;
  padding: 16px 12px;
  text-align: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
`;

const StatIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${({ $color }) => `${$color}15`};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 8px;
`;

const StatValue = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: #1a202c;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: #a0aec0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 2px;
`;

const RewardBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 16px 16px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #48bb78, #38a169);
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-weight: 500;
`;

const WalletSection = styled.div`
  margin: 0 16px 16px;
  background: white;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 12px 0;
`;

const WalletGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const WalletBtn = styled.button`
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
  transition: transform 0.2s;
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

const TransactionsSection = styled.div`
  margin: 0 16px;
  background: white;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
`;

const TxLoadingText = styled.p`
  text-align: center;
  color: #a0aec0;
  font-size: 14px;
`;

const TxEmpty = styled.p`
  text-align: center;
  color: #a0aec0;
  font-size: 14px;
  padding: 16px 0;
`;

const TxList = styled.div`
  display: flex;
  flex-direction: column;
`;

const TxItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const TxLeft = styled.div``;

const TxType = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
`;

const TxDate = styled.div`
  font-size: 12px;
  color: #a0aec0;
  margin-top: 2px;
`;

const TxAmount = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${({ $positive }) => $positive ? '#48bb78' : '#e53e3e'};
`;

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 16px;
  color: #718096;
`;

export default ClientCardDetail;
