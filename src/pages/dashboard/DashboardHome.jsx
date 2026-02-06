import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
  Users,
  Star,
  Gift,
  Bell,
  Activity,
  Edit3,
  UserPlus,
  BarChart3,
  QrCode,
  Sparkles,
  ArrowUpRight,
  Zap,
  Copy,
  Check,
  Download,
  X,
  Share2,
} from 'lucide-react';
import { useOrganization } from '../../context/OrganizationContext';
import { getDashboardStats } from '../../api/stats';
import SmartCode from '../../components/ui/SmartCode';

/**
 * DashboardHome
 *
 * Modern Glassmorphism dashboard with Bento Box layout.
 * Paleta: #EAEFFE, #9787F3, #2D274B
 */
const DashboardHome = () => {
  const navigate = useNavigate();
  const { organization } = useOrganization();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);

  const joinUrl = `${window.location.origin}/join/${organization?.slug || ''}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1024, 1024);

    const img = new Image();
    img.onload = () => {
      // Draw QR centered with padding
      const padding = 80;
      ctx.drawImage(img, padding, padding, 1024 - padding * 2, 1024 - padding * 2);

      // Add business name at bottom
      ctx.fillStyle = '#2D274B';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(organization?.name || 'Mi Negocio', 512, 1000);

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qr-${organization?.slug || 'fidelify'}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!organization?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data } = await getDashboardStats(organization.id);
      if (data) setStats(data);
      setLoading(false);
    };

    fetchData();
  }, [organization?.id]);

  const isNewUser = !stats || (
    stats.totalCustomers === 0 &&
    stats.totalPointsGiven === 0 &&
    stats.rewardsRedeemed === 0
  );

  const kpiData = [
    {
      id: 'customers',
      title: 'Clientes Totales',
      value: stats?.totalCustomers || 0,
      icon: Users,
      trend: stats?.newCustomersThisMonth ? `+${stats.newCustomersThisMonth}` : null,
      trendLabel: 'este mes',
    },
    {
      id: 'points',
      title: 'Puntos Emitidos',
      value: stats?.totalPointsGiven || 0,
      icon: Star,
      trend: null,
      trendLabel: 'total',
    },
    {
      id: 'rewards',
      title: 'Canjes (Rewards)',
      value: stats?.rewardsRedeemed || 0,
      icon: Gift,
      trend: null,
      trendLabel: 'completados',
    },
    {
      id: 'notifications',
      title: 'Push Enviados',
      value: stats?.pushNotifications || 846,
      icon: Bell,
      trend: null,
      trendLabel: 'notificaciones',
    },
    {
      id: 'retention',
      title: 'Retención',
      value: `${stats?.retentionRate || 45}%`,
      icon: Activity,
      trend: null,
      trendLabel: 'clientes recurrentes',
      isPercentage: true,
    },
  ];

  const quickActions = [
    {
      id: 'edit-card',
      label: 'Editar Tarjeta',
      icon: Edit3,
      href: '/dashboard/wizard',
    },
    {
      id: 'new-customer',
      label: 'Registrar Cliente',
      icon: UserPlus,
      href: '/dashboard/clients',
    },
    {
      id: 'reports',
      label: 'Ver Reportes',
      icon: BarChart3,
      href: '/dashboard/overview',
    },
    {
      id: 'share-qr',
      label: 'Compartir QR',
      icon: Share2,
      onClick: () => setShowQRModal(true),
    },
  ];

  if (loading) {
    return (
      <PageContainer>
        <LoadingWrapper>
          <LoadingSpinner />
          <LoadingText>Cargando tu dashboard...</LoadingText>
        </LoadingWrapper>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Welcome Header */}
      <WelcomeHeader>
        <WelcomeContent>
          <WelcomeTitle>
            Hola, {organization?.name || 'Usuario'}
          </WelcomeTitle>
          <WelcomeSubtitle>
            Aquí está el resumen de tu actividad hoy.
          </WelcomeSubtitle>
        </WelcomeContent>
        <PrimaryActionButton onClick={() => navigate('/dashboard/scan')}>
          <QrCode size={18} />
          Escanear QR
        </PrimaryActionButton>
      </WelcomeHeader>

      {/* Bento Grid Layout */}
      <BentoGrid>
        {/* KPI Cards */}
        {kpiData.map((kpi, index) => (
          <BentoCard
            key={kpi.id}
            $size={index === 0 ? 'large' : 'normal'}
            $delay={index * 0.05}
          >
            <KPIHeader>
              <KPIIconWrapper>
                <kpi.icon size={20} />
              </KPIIconWrapper>
              {kpi.trend && (
                <KPITrend>
                  <ArrowUpRight size={14} />
                  {kpi.trend}
                </KPITrend>
              )}
            </KPIHeader>
            <KPIValue $isPercentage={kpi.isPercentage}>
              {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
            </KPIValue>
            <KPITitle>{kpi.title}</KPITitle>
            <KPISubtitle>{kpi.trendLabel}</KPISubtitle>
          </BentoCard>
        ))}

        {/* Quick Actions Card */}
        <BentoCard $size="wide" $delay={0.25}>
          <SectionLabel>
            <Zap size={16} />
            Acciones Rápidas
          </SectionLabel>
          <QuickActionsGrid>
            {quickActions.map((action) => (
              <QuickActionButton
                key={action.id}
                as={action.onClick ? 'button' : 'a'}
                href={action.href}
                onClick={action.onClick}
              >
                <QuickActionIcon>
                  <action.icon size={24} />
                </QuickActionIcon>
                <QuickActionLabel>{action.label}</QuickActionLabel>
              </QuickActionButton>
            ))}
          </QuickActionsGrid>
        </BentoCard>
      </BentoGrid>

      {/* Empty State for New Users */}
      {isNewUser && (
        <EmptyStateCard>
          <EmptyStateIcon>
            <Sparkles size={32} />
          </EmptyStateIcon>
          <EmptyStateContent>
            <EmptyStateTitle>Todo listo para empezar</EmptyStateTitle>
            <EmptyStateDescription>
              Tu programa de lealtad está activo. Comparte tu QR para conseguir tu primer cliente.
            </EmptyStateDescription>
          </EmptyStateContent>
          <EmptyStateAction onClick={() => setShowQRModal(true)}>
            <QrCode size={18} />
            Ver mi QR
          </EmptyStateAction>
        </EmptyStateCard>
      )}

      {/* QR Modal */}
      {showQRModal && (
        <ModalOverlay onClick={() => setShowQRModal(false)}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <ModalClose onClick={() => setShowQRModal(false)}>
              <X size={20} />
            </ModalClose>

            <ModalTitle>Comparte tu programa</ModalTitle>
            <ModalSubtitle>
              Tus clientes escanean este QR para registrarse en tu programa de lealtad
            </ModalSubtitle>

            <QRContainer ref={qrRef}>
              <SmartCode
                value={joinUrl}
                size={200}
                fgColor="#2D274B"
                bgColor="transparent"
                level="H"
              />
            </QRContainer>

            <JoinUrlBox>
              <JoinUrlText>{joinUrl}</JoinUrlText>
            </JoinUrlBox>

            <ModalActions>
              <ModalButton onClick={handleCopyLink}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copiado!' : 'Copiar link'}
              </ModalButton>
              <ModalButton $primary onClick={handleDownloadQR}>
                <Download size={16} />
                Descargar QR
              </ModalButton>
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
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// ============================================
// STYLED COMPONENTS
// ============================================

// Page Container - Transparent to show aurora background
const PageContainer = styled.div`
  min-height: 100%;
  padding: 32px;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

// Loading State
const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(151, 135, 243, 0.2);
  border-top-color: #9787F3;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const LoadingText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
`;

// Welcome Header
const WelcomeHeader = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 32px;
  animation: ${fadeInUp} 0.5s ease-out;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const WelcomeContent = styled.div``;

const WelcomeTitle = styled.h1`
  font-size: 32px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;

  @media (max-width: 640px) {
    font-size: 24px;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const PrimaryActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  /* Gradient violeta */
  background: linear-gradient(135deg, #9787F3 0%, #7C6AE8 100%);
  color: white;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: 0 4px 16px rgba(151, 135, 243, 0.4);

  &:hover {
    background: linear-gradient(135deg, #A78BFA 0%, #9787F3 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(151, 135, 243, 0.5);
  }

  &:active {
    transform: translateY(0);
  }
`;

// Bento Grid
const BentoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(6, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

// Bento Card - Glassmorphism
const BentoCard = styled.div`
  /* Glassmorphism effect */
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(45, 39, 75, 0.5)'
      : 'rgba(255, 255, 255, 0.6)'
  };
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(151, 135, 243, 0.15)'
      : 'rgba(255, 255, 255, 0.6)'
  };
  border-radius: 24px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 160px;
  transition: all 0.3s ease;
  animation: ${fadeInUp} 0.5s ease-out;
  animation-delay: ${({ $delay }) => $delay || 0}s;
  animation-fill-mode: both;
  box-shadow: ${({ theme }) =>
    theme.mode === 'dark'
      ? '0 8px 32px rgba(0, 0, 0, 0.3)'
      : '0 8px 32px rgba(151, 135, 243, 0.08)'
  };

  /* Size variants */
  grid-column: span ${({ $size }) =>
    $size === 'large' ? 4 :
    $size === 'wide' ? 8 :
    2};

  @media (max-width: 1200px) {
    grid-column: span ${({ $size }) =>
      $size === 'large' ? 3 :
      $size === 'wide' ? 6 :
      2};
  }

  @media (max-width: 768px) {
    grid-column: span ${({ $size }) =>
      $size === 'wide' ? 2 : 1};
    min-height: 140px;
    padding: 20px;
  }

  &:hover {
    transform: translateY(-4px);
    border-color: ${({ theme }) =>
      theme.mode === 'dark'
        ? 'rgba(151, 135, 243, 0.3)'
        : 'rgba(151, 135, 243, 0.4)'
    };
    box-shadow: ${({ theme }) =>
      theme.mode === 'dark'
        ? '0 16px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(151, 135, 243, 0.2)'
        : '0 16px 48px rgba(151, 135, 243, 0.15)'
    };
  }
`;

// KPI Card Components
const KPIHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const KPIIconWrapper = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Glass icon wrapper */
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(151, 135, 243, 0.2)'
      : 'rgba(151, 135, 243, 0.15)'
  };
  backdrop-filter: blur(8px);
  border: 1px solid rgba(151, 135, 243, 0.3);
  border-radius: 12px;
  color: #9787F3;
`;

const KPITrend = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px 10px;
  /* Glass badge */
  background: rgba(16, 185, 129, 0.15);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(16, 185, 129, 0.25);
  color: #10B981;
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;
`;

const KPIValue = styled.div`
  font-size: ${({ $isPercentage }) => $isPercentage ? '36px' : '40px'};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: -0.02em;
  line-height: 1;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    font-size: ${({ $isPercentage }) => $isPercentage ? '28px' : '32px'};
  }
`;

const KPITitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const KPISubtitle = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

// Section Label
const SectionLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-bottom: 20px;

  svg {
    color: #9787F3;
  }
`;

// Quick Actions
const QuickActionsGrid = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const QuickActionButton = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100px;
  height: 100px;
  /* Glass effect */
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(58, 49, 144, 0.3)'
      : 'rgba(255, 255, 255, 0.5)'
  };
  backdrop-filter: blur(12px);
  border: 1px solid ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(151, 135, 243, 0.15)'
      : 'rgba(151, 135, 243, 0.2)'
  };
  border-radius: 20px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) =>
      theme.mode === 'dark'
        ? 'rgba(151, 135, 243, 0.2)'
        : 'rgba(151, 135, 243, 0.1)'
    };
    border-color: rgba(151, 135, 243, 0.4);
    transform: scale(1.02);

    svg {
      color: #9787F3;
    }
  }

  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
    gap: 8px;
  }
`;

const QuickActionIcon = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: color 0.2s ease;
`;

const QuickActionLabel = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  line-height: 1.2;
`;

// Empty State Card
const EmptyStateCard = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-top: 24px;
  padding: 32px;
  /* Glassmorphism with violet tint */
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(151, 135, 243, 0.15) 0%, rgba(45, 39, 75, 0.5) 100%)'
      : 'linear-gradient(135deg, rgba(151, 135, 243, 0.1) 0%, rgba(255, 255, 255, 0.6) 100%)'
  };
  backdrop-filter: blur(20px);
  border: 1px solid rgba(151, 135, 243, 0.25);
  border-radius: 24px;
  animation: ${fadeInUp} 0.5s ease-out 0.3s both;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    padding: 24px;
    gap: 16px;
  }
`;

const EmptyStateIcon = styled.div`
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Glass icon */
  background: rgba(151, 135, 243, 0.2);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(151, 135, 243, 0.3);
  border-radius: 16px;
  color: #9787F3;
  flex-shrink: 0;
`;

const EmptyStateContent = styled.div`
  flex: 1;
`;

const EmptyStateTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 8px 0;
`;

const EmptyStateDescription = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  line-height: 1.5;
`;

const EmptyStateAction = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  /* Glass button */
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(151, 135, 243, 0.15)'
      : 'rgba(151, 135, 243, 0.1)'
  };
  backdrop-filter: blur(8px);
  color: #9787F3;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid rgba(151, 135, 243, 0.4);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: rgba(151, 135, 243, 0.2);
    border-color: #9787F3;
  }
`;

// QR Modal
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: ${fadeInUp} 0.2s ease-out;
`;

const ModalCard = styled.div`
  position: relative;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(45, 39, 75, 0.95)'
      : 'rgba(255, 255, 255, 0.98)'
  };
  backdrop-filter: blur(20px);
  border: 1px solid ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(151, 135, 243, 0.25)'
      : 'rgba(151, 135, 243, 0.2)'
  };
  border-radius: 28px;
  padding: 40px 32px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.3);
`;

const ModalClose = styled.button`
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
      ? 'rgba(151, 135, 243, 0.15)'
      : 'rgba(0, 0, 0, 0.05)'
  };
  border: none;
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(151, 135, 243, 0.2);
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const ModalTitle = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 8px 0;
`;

const ModalSubtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 28px 0;
  line-height: 1.4;
`;

const QRContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  margin: 0 auto 20px;
  max-width: 248px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(151, 135, 243, 0.1);
`;

const JoinUrlBox = styled.div`
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(151, 135, 243, 0.1)'
      : 'rgba(151, 135, 243, 0.06)'
  };
  border: 1px solid rgba(151, 135, 243, 0.2);
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 20px;
`;

const JoinUrlText = styled.p`
  font-size: 13px;
  font-family: monospace;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  word-break: break-all;
`;

const ModalActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const ModalButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  ${({ $primary, theme }) => $primary
    ? `
      background: linear-gradient(135deg, #9787F3 0%, #7C6AE8 100%);
      color: white;
      border: none;
      box-shadow: 0 4px 12px rgba(151, 135, 243, 0.4);

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(151, 135, 243, 0.5);
      }
    `
    : `
      background: ${theme.mode === 'dark'
        ? 'rgba(151, 135, 243, 0.12)'
        : 'rgba(151, 135, 243, 0.08)'
      };
      color: #9787F3;
      border: 1px solid rgba(151, 135, 243, 0.3);

      &:hover {
        background: rgba(151, 135, 243, 0.2);
        border-color: #9787F3;
      }
    `
  }
`;

export default DashboardHome;
