import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useOrganization } from '../../context/OrganizationContext';
import { getDashboardStats } from '../../api/stats';

/**
 * DashboardHome
 *
 * Modern "Dark Apple Minimalist" dashboard with Bento Box layout.
 * Uses Slate 950 background + Emerald 500 accents.
 */
const DashboardHome = () => {
  const { organization } = useOrganization();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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
        <PrimaryActionButton>
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
              <QuickActionButton key={action.id} href={action.href}>
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
          <EmptyStateAction>
            <QrCode size={18} />
            Ver mi QR
          </EmptyStateAction>
        </EmptyStateCard>
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

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
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

// Page Container - Slate 950 Background
const PageContainer = styled.div`
  min-height: 100%;
  background: #020617;
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
  border: 3px solid rgba(16, 185, 129, 0.2);
  border-top-color: #10B981;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const LoadingText = styled.p`
  color: #94A3B8;
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
  color: #F8FAFC;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;

  @media (max-width: 640px) {
    font-size: 24px;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 16px;
  color: #94A3B8;
  margin: 0;
`;

const PrimaryActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #10B981;
  color: white;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: #059669;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px -8px rgba(16, 185, 129, 0.5);
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

// Bento Card - Glassmorphism Dark
const BentoCard = styled.div`
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
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
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 20px 40px -20px rgba(0, 0, 0, 0.6);
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
  background: rgba(16, 185, 129, 0.15);
  border-radius: 12px;
  color: #10B981;
`;

const KPITrend = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px 8px;
  background: rgba(16, 185, 129, 0.15);
  color: #10B981;
  font-size: 12px;
  font-weight: 600;
  border-radius: 8px;
`;

const KPIValue = styled.div`
  font-size: ${({ $isPercentage }) => $isPercentage ? '36px' : '40px'};
  font-weight: 700;
  color: #F8FAFC;
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
  color: #F8FAFC;
  margin-bottom: 4px;
`;

const KPISubtitle = styled.div`
  font-size: 12px;
  color: #64748B;
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
  color: #64748B;
  margin-bottom: 20px;

  svg {
    color: #10B981;
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
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(30, 41, 59, 0.9);
    border-color: rgba(16, 185, 129, 0.3);
    transform: scale(1.02);

    svg {
      color: #10B981;
    }
  }

  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
    gap: 8px;
  }
`;

const QuickActionIcon = styled.div`
  color: #94A3B8;
  transition: color 0.2s ease;
`;

const QuickActionLabel = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: #94A3B8;
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
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%);
  border: 1px solid rgba(16, 185, 129, 0.2);
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
  background: rgba(16, 185, 129, 0.15);
  border-radius: 16px;
  color: #10B981;
  flex-shrink: 0;
`;

const EmptyStateContent = styled.div`
  flex: 1;
`;

const EmptyStateTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #F8FAFC;
  margin: 0 0 8px 0;
`;

const EmptyStateDescription = styled.p`
  font-size: 14px;
  color: #94A3B8;
  margin: 0;
  line-height: 1.5;
`;

const EmptyStateAction = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: transparent;
  color: #10B981;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: rgba(16, 185, 129, 0.1);
    border-color: #10B981;
  }
`;

export default DashboardHome;
