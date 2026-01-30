import { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Users,
  CreditCard,
  Star,
  Gift,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { useOrganization } from '../../context/OrganizationContext';
import { getDashboardStats, getRecentActivity } from '../../api/stats';

const Overview = () => {
  const { organization } = useOrganization();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!organization?.id) return;

      setLoading(true);

      const [statsResult, activityResult] = await Promise.all([
        getDashboardStats(organization.id),
        getRecentActivity(organization.id, 5),
      ]);

      if (statsResult.data) setStats(statsResult.data);
      if (activityResult.data) setActivity(activityResult.data);

      setLoading(false);
    };

    fetchData();
  }, [organization?.id]);

  const statCards = [
    {
      title: 'Total Clientes',
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: '#6366F1',
      change: `+${stats?.newCustomersThisMonth || 0} este mes`,
    },
    {
      title: 'Pases Activos',
      value: stats?.activeCards || 0,
      icon: CreditCard,
      color: '#10B981',
      change: 'Con puntos acumulados',
    },
    {
      title: 'Puntos Otorgados',
      value: stats?.totalPointsGiven || 0,
      icon: Star,
      color: '#F59E0B',
      change: 'Total histórico',
    },
    {
      title: 'Recompensas Canjeadas',
      value: stats?.rewardsRedeemed || 0,
      icon: Gift,
      color: '#EC4899',
      change: 'Premios entregados',
    },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Container>
        <PageHeader>
          <PageTitle>Panel de Control</PageTitle>
        </PageHeader>
        <LoadingState>Cargando estadísticas...</LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader>
        <div>
          <PageTitle>Panel de Control</PageTitle>
          <PageSubtitle>
            Bienvenido de vuelta, {organization?.name}
          </PageSubtitle>
        </div>
      </PageHeader>

      {/* Stats Grid */}
      <StatsGrid>
        {statCards.map((stat) => (
          <StatCard key={stat.title}>
            <StatIcon $color={stat.color}>
              <stat.icon size={24} />
            </StatIcon>
            <StatContent>
              <StatValue>{stat.value.toLocaleString()}</StatValue>
              <StatTitle>{stat.title}</StatTitle>
              <StatChange>
                <TrendingUp size={14} />
                {stat.change}
              </StatChange>
            </StatContent>
          </StatCard>
        ))}
      </StatsGrid>

      {/* Recent Activity */}
      <Section>
        <SectionHeader>
          <SectionTitle>
            <Clock size={20} />
            Actividad Reciente
          </SectionTitle>
        </SectionHeader>

        {activity.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📊</EmptyIcon>
            <EmptyTitle>Sin actividad aún</EmptyTitle>
            <EmptyDescription>
              Cuando tus clientes acumulen puntos, verás la actividad aquí.
            </EmptyDescription>
          </EmptyState>
        ) : (
          <ActivityList>
            {activity.map((item) => (
              <ActivityItem key={item.id}>
                <ActivityIcon $type={item.type}>
                  {item.type === 'earn' ? '+' : '-'}
                </ActivityIcon>
                <ActivityContent>
                  <ActivityMain>
                    <ActivityName>
                      {item.customers?.full_name || item.customers?.email || 'Cliente'}
                    </ActivityName>
                    <ActivityPoints $type={item.type}>
                      {item.type === 'earn' ? '+' : ''}{item.points_change} pts
                    </ActivityPoints>
                  </ActivityMain>
                  <ActivityMeta>
                    {item.description} • {formatDate(item.created_at)}
                  </ActivityMeta>
                </ActivityContent>
              </ActivityItem>
            ))}
          </ActivityList>
        )}
      </Section>

      {/* Quick Tips */}
      <Section>
        <SectionHeader>
          <SectionTitle>
            <Star size={20} />
            Próximos Pasos
          </SectionTitle>
        </SectionHeader>
        <TipsGrid>
          <Tip>
            <TipNumber>1</TipNumber>
            <TipContent>
              <TipTitle>Crea tu primera tarjeta</TipTitle>
              <TipDescription>
                Ve al Constructor y diseña tu tarjeta de lealtad personalizada.
              </TipDescription>
            </TipContent>
          </Tip>
          <Tip>
            <TipNumber>2</TipNumber>
            <TipContent>
              <TipTitle>Registra clientes</TipTitle>
              <TipDescription>
                Agrega a tus primeros clientes y comienza a dar puntos.
              </TipDescription>
            </TipContent>
          </Tip>
          <Tip>
            <TipNumber>3</TipNumber>
            <TipContent>
              <TipTitle>Personaliza tu marca</TipTitle>
              <TipDescription>
                Configura tus colores y logo en Configuración.
              </TipDescription>
            </TipContent>
          </Tip>
        </TipsGrid>
      </Section>
    </Container>
  );
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.space.xl};
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  margin-bottom: ${({ theme }) => theme.space.xs};
`;

const PageSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.space['3xl']};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: ${({ theme }) => theme.space.lg};
  margin-bottom: ${({ theme }) => theme.space.xl};
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.space.lg};
  display: flex;
  gap: ${({ theme }) => theme.space.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ $color }) => `${$color}15`};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const StatTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.space.xs};
`;

const StatChange = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.xs};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.success};
`;

const Section = styled.section`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.space.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  margin-bottom: ${({ theme }) => theme.space.lg};
`;

const SectionHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.space.lg};
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.space.xl};
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${({ theme }) => theme.space.md};
`;

const EmptyTitle = styled.h3`
  margin-bottom: ${({ theme }) => theme.space.xs};
`;

const EmptyDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.sm};
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.md};
  padding: ${({ theme }) => theme.space.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const ActivityIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ $type, theme }) =>
    $type === 'earn' ? `${theme.colors.success}15` : `${theme.colors.primary}15`};
  color: ${({ $type, theme }) =>
    $type === 'earn' ? theme.colors.success : theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActivityMain = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space.sm};
`;

const ActivityName = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ActivityPoints = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ $type, theme }) =>
    $type === 'earn' ? theme.colors.success : theme.colors.primary};
  flex-shrink: 0;
`;

const ActivityMeta = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const TipsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.space.md};
`;

const Tip = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.md};
  padding: ${({ theme }) => theme.space.md};
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radii.md};
`;

const TipNumber = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  flex-shrink: 0;
`;

const TipContent = styled.div``;

const TipTitle = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  margin-bottom: ${({ theme }) => theme.space.xs};
`;

const TipDescription = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export default Overview;
