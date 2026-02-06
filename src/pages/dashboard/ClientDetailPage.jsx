import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Star,
  Gift,
  Plus,
  Minus,
  Ban,
  Clock,
  CreditCard,
  CheckCircle2,
  Sparkles,
  Trophy,
  Coffee,
  Percent,
  X,
  Wallet,
  Tag,
  Zap,
  AlertCircle,
  RefreshCw,
  User,
  TrendingUp,
  Award,
  Smartphone,
  DollarSign,
  Loader2,
  ExternalLink,
} from 'lucide-react';

// Services
import {
  getCard,
  getCardTransactions,
  addStamp,
  addPointsForPurchase,
  redeemReward,
  calculateProgress,
} from '../../services/loyalty';
import { generateGooglePass, openGoogleWalletSave, updateGooglePass } from '../../services/wallet';

/**
 * ClientDetailPage
 *
 * Dynamic client profile connected to Supabase.
 * Features real-time balance management and transaction history.
 */

// ============================================
// HELPER FUNCTIONS
// ============================================
const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const getTransactionIcon = (type) => {
  switch (type) {
    case 'earn':
    case 'stamp':
      return { icon: Star, color: '#F59E0B' };
    case 'redeem':
      return { icon: Gift, color: '#EC4899' };
    case 'bonus':
      return { icon: Award, color: '#8B5CF6' };
    case 'adjustment':
      return { icon: TrendingUp, color: '#6366F1' };
    default:
      return { icon: Coffee, color: '#10B981' };
  }
};

// ============================================
// MAIN COMPONENT
// ============================================
const ClientDetailPage = () => {
  const { id: cardId } = useParams();
  const navigate = useNavigate();

  // Data State
  const [card, setCard] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  // Modal State
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [pointsModalMode, setPointsModalMode] = useState('add');
  const [pointsAmount, setPointsAmount] = useState('');

  // Notes State (local for now)
  const [notes, setNotes] = useState('');

  // Wallet State
  const [walletLoading, setWalletLoading] = useState(false);

  // Purchase Modal State
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState('');

  // ============================================
  // DATA FETCHING
  // ============================================
  const fetchCardData = useCallback(async () => {
    if (!cardId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch card with client and business data
      const cardData = await getCard(cardId);

      if (!cardData) {
        setError('Cliente no encontrado');
        return;
      }

      setCard(cardData);

      // Fetch transaction history
      const txns = await getCardTransactions(cardId, { limit: 20 });
      setTransactions(txns);
    } catch (err) {
      console.error('Error fetching card data:', err);
      setError('Error al cargar los datos del cliente');
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  useEffect(() => {
    fetchCardData();
  }, [fetchCardData]);

  // ============================================
  // ACTION HANDLERS
  // ============================================
  const handleAddStamp = async () => {
    if (actionLoading || !card) return;

    setActionLoading(true);
    setActionFeedback(null);

    try {
      const result = await addStamp(cardId, 1, {
        description: 'Sello agregado manualmente',
        locationName: 'Dashboard Admin',
      });

      if (result.success) {
        // Update local state optimistically
        setCard((prev) => ({
          ...prev,
          current_balance: result.new_balance,
          lifetime_balance: result.lifetime_balance,
        }));

        // Show feedback
        setActionFeedback({
          type: 'success',
          message: result.reward_unlocked
            ? `+1 sello - ${result.reward_text}`
            : `+1 sello (${result.new_balance}/${card.business?.target_value || 10})`,
        });

        // Refresh transactions
        const txns = await getCardTransactions(cardId, { limit: 20 });
        setTransactions(txns);

        // Update Google Wallet pass if linked
        if (card.google_object_id) {
          updateGooglePass(cardId).catch(console.error);
        }
      } else {
        setActionFeedback({
          type: 'error',
          message: result.error || 'Error al agregar sello',
        });
      }
    } catch (err) {
      setActionFeedback({
        type: 'error',
        message: 'Error de conexión',
      });
    } finally {
      setActionLoading(false);
      // Clear feedback after 3 seconds
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  const handleRemoveStamp = async () => {
    if (actionLoading || !card || card.current_balance <= 0) return;

    setActionLoading(true);
    setActionFeedback(null);

    try {
      // Use addStamp with negative amount for adjustments
      const result = await addStamp(cardId, -1, {
        description: 'Ajuste manual (corrección)',
        locationName: 'Dashboard Admin',
      });

      if (result.success) {
        setCard((prev) => ({
          ...prev,
          current_balance: result.new_balance,
        }));

        setActionFeedback({
          type: 'success',
          message: `-1 sello (${result.new_balance}/${card.business?.target_value || 10})`,
        });

        const txns = await getCardTransactions(cardId, { limit: 20 });
        setTransactions(txns);

        // Update Google Wallet pass if linked
        if (card.google_object_id) {
          updateGooglePass(cardId).catch(console.error);
        }
      } else {
        setActionFeedback({
          type: 'error',
          message: result.error || 'Error al ajustar sello',
        });
      }
    } catch (err) {
      setActionFeedback({
        type: 'error',
        message: 'Error de conexión',
      });
    } finally {
      setActionLoading(false);
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  const handleRedeemReward = async () => {
    if (actionLoading || !card) return;

    const targetValue = card.business?.target_value || 10;
    if (card.current_balance < targetValue) return;

    setActionLoading(true);
    setActionFeedback(null);

    try {
      const result = await redeemReward(cardId, null, {
        description: card.business?.reward_text || 'Recompensa canjeada',
      });

      if (result.success) {
        setCard((prev) => ({
          ...prev,
          current_balance: result.new_balance,
          rewards_count: (prev.rewards_count || 0) + 1,
        }));

        setActionFeedback({
          type: 'success',
          message: `Recompensa canjeada - ${result.redeemed_amount} puntos`,
        });

        const txns = await getCardTransactions(cardId, { limit: 20 });
        setTransactions(txns);

        // Update Google Wallet pass if linked
        if (card.google_object_id) {
          updateGooglePass(cardId).catch(console.error);
        }
      } else {
        setActionFeedback({
          type: 'error',
          message: result.error || 'Error al canjear',
        });
      }
    } catch (err) {
      setActionFeedback({
        type: 'error',
        message: 'Error de conexión',
      });
    } finally {
      setActionLoading(false);
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  // Points modal handlers
  const openPointsModal = (mode) => {
    setPointsModalMode(mode);
    setPointsAmount('');
    setShowPointsModal(true);
  };

  const handlePointsSubmit = async () => {
    const amount = parseInt(pointsAmount, 10);
    if (isNaN(amount) || amount <= 0) return;

    setShowPointsModal(false);
    setActionLoading(true);

    try {
      const adjustedAmount = pointsModalMode === 'add' ? amount : -amount;
      const result = await addStamp(cardId, adjustedAmount, {
        description: pointsModalMode === 'add' ? 'Puntos agregados' : 'Puntos restados',
        locationName: 'Dashboard Admin',
      });

      if (result.success) {
        setCard((prev) => ({
          ...prev,
          current_balance: result.new_balance,
          lifetime_balance: result.lifetime_balance,
        }));

        setActionFeedback({
          type: 'success',
          message: `${pointsModalMode === 'add' ? '+' : '-'}${amount} puntos`,
        });

        const txns = await getCardTransactions(cardId, { limit: 20 });
        setTransactions(txns);

        // Update Google Wallet pass if linked
        if (card.google_object_id) {
          updateGooglePass(cardId).catch(console.error);
        }
      } else {
        setActionFeedback({
          type: 'error',
          message: result.error || 'Error al ajustar puntos',
        });
      }
    } catch (err) {
      setActionFeedback({
        type: 'error',
        message: 'Error de conexión',
      });
    } finally {
      setActionLoading(false);
      setPointsAmount('');
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  // Google Wallet Handler
  const handleAddToGoogleWallet = async () => {
    if (walletLoading || !card) return;

    setWalletLoading(true);
    setActionFeedback(null);

    try {
      const result = await generateGooglePass(cardId);

      if (result.success && result.saveUrl) {
        openGoogleWalletSave(result.saveUrl);
        setActionFeedback({
          type: 'success',
          message: 'Abriendo Google Wallet...',
        });
      } else {
        setActionFeedback({
          type: 'error',
          message: result.error || 'Error al generar pase de Google Wallet',
        });
      }
    } catch (err) {
      setActionFeedback({
        type: 'error',
        message: 'Error de conexión',
      });
    } finally {
      setWalletLoading(false);
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  // Purchase Registration Handler
  const handlePurchaseSubmit = async () => {
    const amount = parseFloat(purchaseAmount);
    if (isNaN(amount) || amount <= 0) return;

    setShowPurchaseModal(false);
    setActionLoading(true);
    setActionFeedback(null);

    try {
      const result = await addPointsForPurchase(cardId, amount, {
        description: `Compra de $${amount.toFixed(2)}`,
        locationName: 'Dashboard Admin',
      });

      if (result.success) {
        setCard((prev) => ({
          ...prev,
          current_balance: result.new_balance,
          lifetime_balance: result.lifetime_balance,
        }));

        const pointsEarned = result.points_earned || result.amount_added || 0;
        setActionFeedback({
          type: 'success',
          message: `+${pointsEarned} ${programType === 'cashback' ? 'cashback' : 'puntos'} por compra de $${amount.toFixed(2)}`,
        });

        const txns = await getCardTransactions(cardId, { limit: 20 });
        setTransactions(txns);

        // Update Google Wallet pass if linked
        if (card.google_object_id) {
          updateGooglePass(cardId).catch(console.error);
        }
      } else {
        setActionFeedback({
          type: 'error',
          message: result.error || 'Error al registrar compra',
        });
      }
    } catch (err) {
      setActionFeedback({
        type: 'error',
        message: 'Error de conexión',
      });
    } finally {
      setActionLoading(false);
      setPurchaseAmount('');
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  // ============================================
  // DERIVED STATE
  // ============================================
  const client = card?.client;
  const business = card?.business;
  const programType = business?.program_type || 'seals';
  const targetValue = business?.target_value || 10;
  const currentBalance = card?.current_balance || 0;
  const canRedeemReward = currentBalance >= targetValue;
  const progressPercent = calculateProgress(currentBalance, targetValue);

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <PageContainer>
        <LoadingWrapper>
          <LoadingSpinner />
          <LoadingText>Cargando perfil del cliente...</LoadingText>
        </LoadingWrapper>
      </PageContainer>
    );
  }

  // ============================================
  // ERROR / NOT FOUND STATE
  // ============================================
  if (error || !card) {
    return (
      <PageContainer>
        <BackButton onClick={() => navigate('/dashboard/clients')}>
          <ArrowLeft size={18} />
          Volver a Clientes
        </BackButton>
        <ErrorWrapper>
          <ErrorIcon>
            <AlertCircle size={48} />
          </ErrorIcon>
          <ErrorTitle>Cliente no encontrado</ErrorTitle>
          <ErrorDescription>
            {error || 'No pudimos encontrar el cliente solicitado. Es posible que haya sido eliminado o no exista.'}
          </ErrorDescription>
          <RetryButton onClick={fetchCardData}>
            <RefreshCw size={16} />
            Reintentar
          </RetryButton>
        </ErrorWrapper>
      </PageContainer>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <PageContainer>
      {/* Back Navigation */}
      <BackButton onClick={() => navigate('/dashboard/clients')}>
        <ArrowLeft size={18} />
        Volver a Clientes
      </BackButton>

      {/* Action Feedback Toast */}
      {actionFeedback && (
        <FeedbackToast $type={actionFeedback.type}>
          {actionFeedback.type === 'success' ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          {actionFeedback.message}
        </FeedbackToast>
      )}

      {/* Main Grid Layout */}
      <ContentGrid>
        {/* ZONE 1: Profile Panel (Left - Sticky) */}
        <ProfileColumn>
          <ProfileCard>
            <ProfileHeader>
              <AvatarLarge $isVIP={card.tier === 'VIP'}>
                {client?.avatar_url ? (
                  <AvatarImage src={client.avatar_url} alt={client.full_name} />
                ) : (
                  getInitials(client?.full_name)
                )}
                {card.tier === 'VIP' && (
                  <VIPCrown>
                    <Star size={14} fill="currentColor" />
                  </VIPCrown>
                )}
              </AvatarLarge>
              <ProfileName>{client?.full_name || 'Cliente'}</ProfileName>
              <BadgeRow>
                <StatusBadge $status={card.state === 'ACTIVE' ? 'active' : 'inactive'}>
                  {card.state === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                </StatusBadge>
                {card.tier && card.tier !== 'STANDARD' && (
                  <TierBadge $tier={card.tier}>{card.tier}</TierBadge>
                )}
              </BadgeRow>
            </ProfileHeader>

            <InfoSection>
              {client?.email && (
                <InfoItem>
                  <InfoIcon><Mail size={16} /></InfoIcon>
                  <InfoContent>
                    <InfoLabel>Email</InfoLabel>
                    <InfoValue>{client.email}</InfoValue>
                  </InfoContent>
                </InfoItem>
              )}
              {client?.phone && (
                <InfoItem>
                  <InfoIcon><Phone size={16} /></InfoIcon>
                  <InfoContent>
                    <InfoLabel>Teléfono</InfoLabel>
                    <InfoValue>{client.phone}</InfoValue>
                  </InfoContent>
                </InfoItem>
              )}
              <InfoItem>
                <InfoIcon><Calendar size={16} /></InfoIcon>
                <InfoContent>
                  <InfoLabel>Miembro desde</InfoLabel>
                  <InfoValue>{formatDate(card.created_at)}</InfoValue>
                </InfoContent>
              </InfoItem>
              {card.last_activity_at && (
                <InfoItem>
                  <InfoIcon><Clock size={16} /></InfoIcon>
                  <InfoContent>
                    <InfoLabel>Última actividad</InfoLabel>
                    <InfoValue>{getRelativeTime(card.last_activity_at)}</InfoValue>
                  </InfoContent>
                </InfoItem>
              )}
            </InfoSection>

            <NotesSection>
              <NotesLabel>Notas Internas</NotesLabel>
              <NotesTextarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Agregar notas sobre este cliente..."
                rows={3}
              />
            </NotesSection>

            <DangerSection>
              <DangerButton>
                <Ban size={16} />
                Bloquear Cliente
              </DangerButton>
            </DangerSection>
          </ProfileCard>
        </ProfileColumn>

        {/* ZONE 2 & 3: Wallet and Activity (Right) */}
        <MainColumn>
          {/* Section Header */}
          <SectionHeader>
            <SectionTitle>
              <Wallet size={20} />
              {business?.name || 'Programa de Lealtad'}
            </SectionTitle>
            <ProgramTypeBadge>
              {programType === 'seals' ? 'Sellos' : 'Puntos'}
            </ProgramTypeBadge>
          </SectionHeader>

          {/* WALLET CAROUSEL */}
          <WalletWrapper>
            <WalletCarousel>
              {/* Primary Loyalty Card */}
              <PrimaryPassCard>
                <PassCardHeader>
                  <PassCardIcon>
                    <CreditCard size={20} />
                  </PassCardIcon>
                  <PassCardBadge>Lealtad</PassCardBadge>
                </PassCardHeader>

                <PassCardTitle>
                  {business?.name || 'Tarjeta Principal'}
                </PassCardTitle>

                {/* BALANCE MANAGER */}
                {programType === 'seals' ? (
                  /* SEALS MODE */
                  <BalanceSection>
                    <BalanceControls>
                      <BalanceButton
                        $variant="subtract"
                        onClick={handleRemoveStamp}
                        disabled={currentBalance <= 0 || actionLoading}
                      >
                        <Minus size={18} />
                      </BalanceButton>

                      <BalanceDisplay>
                        <BalanceValue>{currentBalance}</BalanceValue>
                        <BalanceDivider>/</BalanceDivider>
                        <BalanceMax>{targetValue}</BalanceMax>
                        <BalanceUnit>sellos</BalanceUnit>
                      </BalanceDisplay>

                      <BalanceButton
                        $variant="add"
                        onClick={handleAddStamp}
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <SmallSpinner />
                        ) : (
                          <Plus size={20} />
                        )}
                      </BalanceButton>
                    </BalanceControls>

                    <ProgressBarLarge>
                      <ProgressFillLarge
                        $percent={progressPercent}
                        $complete={canRedeemReward}
                      />
                      <StampIndicators>
                        {Array.from({ length: targetValue }).map((_, i) => (
                          <StampDot key={i} $filled={i < currentBalance} />
                        ))}
                      </StampIndicators>
                    </ProgressBarLarge>

                    {canRedeemReward && (
                      <RewardReadyBanner>
                        <CheckCircle2 size={16} />
                        {business?.reward_text || 'Recompensa lista para canjear'}
                      </RewardReadyBanner>
                    )}
                  </BalanceSection>
                ) : (
                  /* POINTS MODE */
                  <BalanceSection>
                    <PointsDisplay>
                      <PointsValue>{currentBalance.toLocaleString()}</PointsValue>
                      <PointsLabel>puntos disponibles</PointsLabel>
                    </PointsDisplay>

                    <PointsControls>
                      <PointsButton $variant="subtract" onClick={() => openPointsModal('subtract')}>
                        <Minus size={16} />
                        Ajustar
                      </PointsButton>
                      <PointsButton
                        $variant="add"
                        onClick={() => openPointsModal('add')}
                        disabled={actionLoading}
                      >
                        {actionLoading ? <SmallSpinner /> : <Plus size={16} />}
                        Sumar Puntos
                      </PointsButton>
                    </PointsControls>
                  </BalanceSection>
                )}

                {/* Mini Stats */}
                <PassCardStats>
                  <PassStat>
                    <PassStatValue>{card.lifetime_balance || 0}</PassStatValue>
                    <PassStatLabel>Total Histórico</PassStatLabel>
                  </PassStat>
                  <PassStatDivider />
                  <PassStat>
                    <PassStatValue>{card.rewards_count || 0}</PassStatValue>
                    <PassStatLabel>Canjes</PassStatLabel>
                  </PassStat>
                </PassCardStats>

                {/* Redeem Button */}
                <RedeemButton
                  onClick={handleRedeemReward}
                  disabled={!canRedeemReward || actionLoading}
                >
                  <Gift size={18} />
                  Canjear Recompensa
                </RedeemButton>
              </PrimaryPassCard>
            </WalletCarousel>
          </WalletWrapper>

          {/* QUICK ACTION BUTTONS */}
          <QuickIssueRow>
            {/* Google Wallet Button */}
            <WalletButton
              onClick={handleAddToGoogleWallet}
              disabled={walletLoading}
            >
              {walletLoading ? (
                <Loader2 size={16} className="spin" />
              ) : (
                <Smartphone size={16} />
              )}
              Google Wallet
              <ExternalLink size={12} />
            </WalletButton>

            {/* Registrar Compra - Only for points/cashback */}
            {(programType === 'points' || programType === 'cashback') && (
              <PurchaseButton
                onClick={() => setShowPurchaseModal(true)}
                disabled={actionLoading}
              >
                <DollarSign size={16} />
                Registrar Compra
              </PurchaseButton>
            )}

            <QuickIssueButton>
              <Percent size={16} />
              Crear Descuento
            </QuickIssueButton>
            <QuickIssueButton>
              <Tag size={16} />
              Emitir Gift Card
            </QuickIssueButton>
          </QuickIssueRow>

          {/* ZONE 3: Activity Timeline */}
          <ActivityCard>
            <ActivityHeader>
              <ActivityTitle>
                <Clock size={20} />
                Historial de Actividad
              </ActivityTitle>
              <TransactionCount>
                {transactions.length} transacciones
              </TransactionCount>
            </ActivityHeader>

            {transactions.length === 0 ? (
              <EmptyTimeline>
                <User size={32} />
                <span>Sin actividad registrada</span>
                <small>Las transacciones aparecerán aquí</small>
              </EmptyTimeline>
            ) : (
              <Timeline>
                {transactions.map((txn, index) => {
                  const { icon: TxnIcon, color } = getTransactionIcon(txn.type);
                  return (
                    <TimelineItem key={txn.id} $isLast={index === transactions.length - 1}>
                      <TimelineIconWrapper $color={color}>
                        <TxnIcon size={16} />
                      </TimelineIconWrapper>
                      <TimelineContent>
                        <TimelineTitle>
                          {txn.type === 'earn' && 'Puntos agregados'}
                          {txn.type === 'redeem' && 'Recompensa canjeada'}
                          {txn.type === 'adjustment' && 'Ajuste de saldo'}
                          {txn.type === 'bonus' && 'Bonus otorgado'}
                          {!['earn', 'redeem', 'adjustment', 'bonus'].includes(txn.type) && 'Transacción'}
                        </TimelineTitle>
                        <TimelineDescription>
                          {txn.description || `${txn.amount > 0 ? '+' : ''}${txn.amount} ${programType === 'seals' ? 'sellos' : 'puntos'}`}
                        </TimelineDescription>
                        <TimelineTime>{getRelativeTime(txn.created_at)}</TimelineTime>
                      </TimelineContent>
                      <TimelineAmount $positive={txn.amount > 0}>
                        {txn.amount > 0 ? '+' : ''}{txn.amount}
                      </TimelineAmount>
                    </TimelineItem>
                  );
                })}
              </Timeline>
            )}
          </ActivityCard>
        </MainColumn>
      </ContentGrid>

      {/* POINTS ADJUSTMENT MODAL */}
      {showPointsModal && (
        <ModalOverlay onClick={() => setShowPointsModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {pointsModalMode === 'add' ? 'Sumar Puntos' : 'Restar Puntos'}
              </ModalTitle>
              <ModalClose onClick={() => setShowPointsModal(false)}>
                <X size={20} />
              </ModalClose>
            </ModalHeader>
            <ModalBody>
              <ModalLabel>Cantidad de puntos</ModalLabel>
              <ModalInput
                type="number"
                placeholder="Ej: 100"
                value={pointsAmount}
                onChange={(e) => setPointsAmount(e.target.value)}
                autoFocus
              />
              <ModalHint>
                Saldo actual: {currentBalance.toLocaleString()} pts
              </ModalHint>
            </ModalBody>
            <ModalFooter>
              <ModalCancelButton onClick={() => setShowPointsModal(false)}>
                Cancelar
              </ModalCancelButton>
              <ModalConfirmButton
                $mode={pointsModalMode}
                onClick={handlePointsSubmit}
                disabled={!pointsAmount || parseInt(pointsAmount, 10) <= 0}
              >
                {pointsModalMode === 'add' ? (
                  <>
                    <Plus size={16} />
                    Sumar
                  </>
                ) : (
                  <>
                    <Minus size={16} />
                    Restar
                  </>
                )}
              </ModalConfirmButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* PURCHASE REGISTRATION MODAL */}
      {showPurchaseModal && (
        <ModalOverlay onClick={() => setShowPurchaseModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <DollarSign size={20} style={{ color: '#10B981' }} />
                Registrar Compra
              </ModalTitle>
              <ModalClose onClick={() => setShowPurchaseModal(false)}>
                <X size={20} />
              </ModalClose>
            </ModalHeader>
            <ModalBody>
              <ModalLabel>Monto de la compra ($)</ModalLabel>
              <ModalInput
                type="number"
                step="0.01"
                min="0"
                placeholder="Ej: 150.00"
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(e.target.value)}
                autoFocus
              />
              {purchaseAmount && parseFloat(purchaseAmount) > 0 && business?.program_config && (
                <PurchasePreview>
                  <PreviewIcon>
                    {programType === 'cashback' ? <Percent size={16} /> : <Star size={16} />}
                  </PreviewIcon>
                  <PreviewText>
                    {programType === 'cashback'
                      ? `+$${((parseFloat(purchaseAmount) * (business.program_config.cashback_percentage || 5)) / 100).toFixed(2)} cashback`
                      : `+${Math.floor(parseFloat(purchaseAmount) * (business.program_config.points_per_currency || 1))} puntos`}
                  </PreviewText>
                </PurchasePreview>
              )}
              <ModalHint>
                Los {programType === 'cashback' ? 'cashback' : 'puntos'} se calculan automáticamente según la configuración del programa.
              </ModalHint>
            </ModalBody>
            <ModalFooter>
              <ModalCancelButton onClick={() => setShowPurchaseModal(false)}>
                Cancelar
              </ModalCancelButton>
              <ModalConfirmButton
                $mode="add"
                onClick={handlePurchaseSubmit}
                disabled={!purchaseAmount || parseFloat(purchaseAmount) <= 0}
              >
                <CheckCircle2 size={16} />
                Registrar
              </ModalConfirmButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

// ============================================
// ANIMATIONS
// ============================================
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ============================================
// STYLED COMPONENTS
// ============================================

const PageContainer = styled.div`
  min-height: 100%;
  background: #020617;
  padding: 32px;
  animation: ${fadeIn} 0.4s ease-out;
  @media (max-width: 768px) { padding: 20px 16px; }
`;

// Loading State
const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 20px;
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 3px solid rgba(16, 185, 129, 0.2);
  border-top-color: #10B981;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const LoadingText = styled.p`
  color: #94A3B8;
  font-size: 15px;
`;

// Small Spinner for buttons
const SmallSpinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: ${spin} 0.6s linear infinite;
`;

// Error State
const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  padding: 40px;
`;

const ErrorIcon = styled.div`
  color: #EF4444;
  margin-bottom: 20px;
  opacity: 0.8;
`;

const ErrorTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #F8FAFC;
  margin: 0 0 12px 0;
`;

const ErrorDescription = styled.p`
  font-size: 15px;
  color: #94A3B8;
  margin: 0 0 24px 0;
  max-width: 400px;
`;

const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 12px;
  color: #10B981;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(16, 185, 129, 0.25);
  }
`;

// Feedback Toast
const FeedbackToast = styled.div`
  position: fixed;
  top: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  background: ${({ $type }) => $type === 'success' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)'};
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  z-index: 1000;
  animation: ${slideIn} 0.3s ease-out;
  box-shadow: 0 10px 40px -10px ${({ $type }) => $type === 'success' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'};
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  margin-bottom: 24px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #94A3B8;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #F8FAFC;
    border-color: rgba(255, 255, 255, 0.15);
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 24px;
  align-items: start;
  @media (max-width: 1024px) { grid-template-columns: 1fr; }
`;

const ProfileColumn = styled.div`
  position: sticky;
  top: 32px;
  @media (max-width: 1024px) { position: static; }
`;

const MainColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
`;

// ============================================
// PROFILE CARD
// ============================================
const ProfileCard = styled.div`
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 32px 24px;
  animation: ${fadeInUp} 0.5s ease-out;
`;

const ProfileHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 28px;
  padding-bottom: 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const AvatarLarge = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: ${({ $isVIP }) =>
    $isVIP
      ? 'linear-gradient(135deg, #F59E0B, #D97706)'
      : 'linear-gradient(135deg, #6366F1, #4F46E5)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 32px;
  margin-bottom: 16px;
  box-shadow: 0 8px 32px -8px rgba(99, 102, 241, 0.4);
  overflow: hidden;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const VIPCrown = styled.div`
  position: absolute;
  top: -8px;
  right: -4px;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #F59E0B, #D97706);
  border: 3px solid #020617;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
`;

const ProfileName = styled.h2`
  font-size: 22px;
  font-weight: 600;
  color: #F8FAFC;
  margin: 0 0 12px 0;
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 8px;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;
  background: ${({ $status }) =>
    $status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)'};
  color: ${({ $status }) => ($status === 'active' ? '#10B981' : '#94A3B8')};
`;

const TierBadge = styled.span`
  display: inline-flex;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 20px;
  background: ${({ $tier }) =>
    $tier === 'VIP'
      ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2))'
      : 'rgba(139, 92, 246, 0.15)'};
  color: ${({ $tier }) => ($tier === 'VIP' ? '#F59E0B' : '#A78BFA')};
  border: 1px solid ${({ $tier }) => ($tier === 'VIP' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(139, 92, 246, 0.3)')};
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 28px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
`;

const InfoIcon = styled.div`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  color: #64748B;
  flex-shrink: 0;
`;

const InfoContent = styled.div``;

const InfoLabel = styled.div`
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748B;
  margin-bottom: 4px;
`;

const InfoValue = styled.div`
  font-size: 14px;
  color: #F8FAFC;
`;

const NotesSection = styled.div`
  margin-bottom: 28px;
  padding-bottom: 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const NotesLabel = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748B;
  margin-bottom: 10px;
`;

const NotesTextarea = styled.textarea`
  width: 100%;
  padding: 14px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: #F8FAFC;
  font-size: 14px;
  font-family: inherit;
  line-height: 1.5;
  resize: vertical;
  min-height: 80px;
  outline: none;
  transition: all 0.2s ease;
  &::placeholder { color: #64748B; }
  &:focus {
    border-color: rgba(16, 185, 129, 0.4);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
`;

const DangerSection = styled.div``;

const DangerButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: transparent;
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 10px;
  color: #EF4444;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0.7;
  &:hover {
    opacity: 1;
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
  }
`;

// ============================================
// SECTION HEADER
// ============================================
const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #F8FAFC;
  margin: 0;
  svg { color: #10B981; }
`;

const ProgramTypeBadge = styled.span`
  padding: 6px 12px;
  background: rgba(99, 102, 241, 0.15);
  border-radius: 6px;
  color: #818CF8;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
`;

// ============================================
// WALLET CAROUSEL
// ============================================
const WalletWrapper = styled.div`
  width: 100%;
  margin: 0 -8px;
  padding: 0;
  overflow: visible;
`;

const WalletCarousel = styled.div`
  display: flex;
  align-items: stretch;
  gap: 16px;
  overflow-x: auto;
  overflow-y: visible;
  padding: 8px 8px 24px 8px;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;

  & > * { flex-shrink: 0; }

  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.15) transparent;

  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-track {
    background: rgba(255,255,255,0.05);
    border-radius: 3px;
    margin: 0 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.15);
    border-radius: 3px;
    &:hover { background: rgba(255,255,255,0.25); }
  }
`;

// ============================================
// PRIMARY PASS CARD
// ============================================
const PrimaryPassCard = styled.div`
  flex: 0 0 360px;
  min-height: 320px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 24px;
  padding: 24px;
  scroll-snap-align: start;
  animation: ${fadeInUp} 0.5s ease-out 0.1s both;
  position: relative;
  z-index: 2;
  box-shadow: 0 0 40px -10px rgba(16, 185, 129, 0.15);
`;

const PassCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const PassCardIcon = styled.div`
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 185, 129, 0.15);
  border-radius: 12px;
  color: #10B981;
`;

const PassCardBadge = styled.span`
  padding: 6px 12px;
  background: rgba(16, 185, 129, 0.15);
  color: #10B981;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 6px;
`;

const PassCardTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #F8FAFC;
  margin: 0 0 20px 0;
`;

// ============================================
// BALANCE CONTROLS
// ============================================
const BalanceSection = styled.div`
  margin-bottom: 20px;
`;

const BalanceControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 16px;
`;

const BalanceButton = styled.button`
  width: ${({ $variant }) => ($variant === 'add' ? '56px' : '44px')};
  height: ${({ $variant }) => ($variant === 'add' ? '56px' : '44px')};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ $variant }) =>
    $variant === 'add'
      ? `
    background: #10B981;
    color: white;
    &:hover:not(:disabled) {
      background: #059669;
      transform: scale(1.05);
      box-shadow: 0 8px 20px -8px rgba(16, 185, 129, 0.5);
    }
  `
      : `
    background: rgba(100, 116, 139, 0.2);
    color: #94A3B8;
    &:hover:not(:disabled) {
      background: rgba(100, 116, 139, 0.3);
      color: #F8FAFC;
    }
  `}

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const BalanceDisplay = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
`;

const BalanceValue = styled.span`
  font-size: 48px;
  font-weight: 700;
  color: #F8FAFC;
  line-height: 1;
`;

const BalanceDivider = styled.span`
  font-size: 32px;
  color: #64748B;
`;

const BalanceMax = styled.span`
  font-size: 32px;
  font-weight: 600;
  color: #64748B;
`;

const BalanceUnit = styled.span`
  font-size: 14px;
  color: #64748B;
  margin-left: 8px;
`;

const ProgressBarLarge = styled.div`
  position: relative;
  height: 12px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  overflow: hidden;
`;

const ProgressFillLarge = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${({ $percent }) => $percent}%;
  background: ${({ $complete }) =>
    $complete
      ? 'linear-gradient(90deg, #10B981, #34D399)'
      : 'linear-gradient(90deg, #6366F1, #818CF8)'};
  border-radius: 6px;
  transition: width 0.4s ease;
`;

const StampIndicators = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 6px;
`;

const StampDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ $filled }) =>
    $filled ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.2)'};
  transition: all 0.3s ease;
`;

const RewardReadyBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 12px;
  color: #10B981;
  font-size: 13px;
  font-weight: 600;
  animation: ${pulse} 2s ease-in-out infinite;
`;

// Points Mode
const PointsDisplay = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const PointsValue = styled.div`
  font-size: 48px;
  font-weight: 700;
  color: #F8FAFC;
  line-height: 1;
  margin-bottom: 4px;
`;

const PointsLabel = styled.div`
  font-size: 14px;
  color: #64748B;
`;

const PointsControls = styled.div`
  display: flex;
  gap: 12px;
`;

const PointsButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ $variant }) =>
    $variant === 'add'
      ? `
    background: #10B981;
    color: white;
    border: none;
    &:hover:not(:disabled) {
      background: #059669;
      box-shadow: 0 8px 20px -8px rgba(16, 185, 129, 0.5);
    }
  `
      : `
    background: transparent;
    color: #94A3B8;
    border: 1px solid rgba(255, 255, 255, 0.1);
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.05);
      color: #F8FAFC;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Pass Card Stats
const PassCardStats = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  padding: 16px 0;
  margin-bottom: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const PassStat = styled.div`
  text-align: center;
`;

const PassStatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #F8FAFC;
`;

const PassStatLabel = styled.div`
  font-size: 11px;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const PassStatDivider = styled.div`
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.08);
`;

const RedeemButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: transparent;
  color: #10B981;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(16, 185, 129, 0.1);
    border-color: #10B981;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    color: #64748B;
    border-color: rgba(100, 116, 139, 0.3);
  }
`;

// Quick Issue Row
const QuickIssueRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const QuickIssueButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  background: transparent;
  border: 1px dashed rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: #94A3B8;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.25);
    color: #F8FAFC;
  }
`;

const WalletButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  background: linear-gradient(135deg, #4285F4 0%, #34A853 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);

  .spin {
    animation: ${spin} 1s linear infinite;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(66, 133, 244, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const PurchaseButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 12px;
  color: #10B981;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(16, 185, 129, 0.25);
    border-color: rgba(16, 185, 129, 0.5);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PurchasePreview = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  padding: 14px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 12px;
`;

const PreviewIcon = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 185, 129, 0.2);
  border-radius: 8px;
  color: #10B981;
`;

const PreviewText = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: #10B981;
`;

// Activity Card
const ActivityCard = styled.div`
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 28px;
  animation: ${fadeInUp} 0.5s ease-out 0.3s both;
`;

const ActivityHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const ActivityTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #F8FAFC;
  margin: 0;
  svg { color: #94A3B8; }
`;

const TransactionCount = styled.span`
  font-size: 13px;
  color: #64748B;
`;

const EmptyTimeline = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  color: #64748B;
  text-align: center;

  svg { margin-bottom: 16px; opacity: 0.4; }
  span { font-size: 15px; color: #94A3B8; margin-bottom: 4px; }
  small { font-size: 13px; }
`;

const Timeline = styled.div``;

const TimelineItem = styled.div`
  display: flex;
  gap: 16px;
  position: relative;
  padding-bottom: ${({ $isLast }) => ($isLast ? '0' : '20px')};

  &:before {
    content: '';
    position: absolute;
    left: 19px;
    top: 44px;
    bottom: 0;
    width: 2px;
    background: rgba(255, 255, 255, 0.08);
    display: ${({ $isLast }) => ($isLast ? 'none' : 'block')};
  }
`;

const TimelineIconWrapper = styled.div`
  width: 40px;
  height: 40px;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $color }) => `${$color}20`};
  color: ${({ $color }) => $color};
  border-radius: 12px;
  z-index: 1;
`;

const TimelineContent = styled.div`
  flex: 1;
  padding-top: 2px;
  min-width: 0;
`;

const TimelineTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #F8FAFC;
  margin-bottom: 4px;
`;

const TimelineDescription = styled.div`
  font-size: 13px;
  color: #94A3B8;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TimelineTime = styled.div`
  font-size: 12px;
  color: #64748B;
`;

const TimelineAmount = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${({ $positive }) => ($positive ? '#10B981' : '#EF4444')};
  white-space: nowrap;
`;

// Modal
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContent = styled.div`
  width: 100%;
  max-width: 400px;
  background: #0F172A;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  animation: ${scaleIn} 0.2s ease-out;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const ModalTitle = styled.h4`
  font-size: 18px;
  font-weight: 600;
  color: #F8FAFC;
  margin: 0;
`;

const ModalClose = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: #64748B;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #F8FAFC;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const ModalLabel = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #94A3B8;
  margin-bottom: 10px;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 14px 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #F8FAFC;
  font-size: 18px;
  font-weight: 600;
  outline: none;
  transition: all 0.2s;

  &::placeholder { color: #64748B; }
  &:focus {
    border-color: rgba(16, 185, 129, 0.5);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
`;

const ModalHint = styled.p`
  font-size: 13px;
  color: #64748B;
  margin: 12px 0 0 0;
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const ModalCancelButton = styled.button`
  flex: 1;
  padding: 12px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #94A3B8;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #F8FAFC;
  }
`;

const ModalConfirmButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  ${({ $mode }) =>
    $mode === 'add'
      ? `
    background: #10B981;
    color: white;
    &:hover:not(:disabled) { background: #059669; }
  `
      : `
    background: #EF4444;
    color: white;
    &:hover:not(:disabled) { background: #DC2626; }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default ClientDetailPage;
