import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
  Search,
  Filter,
  UserPlus,
  MoreHorizontal,
  ChevronDown,
  Star,
  Clock,
  TrendingUp,
  Eye,
  Mail,
  Phone,
} from 'lucide-react';

/**
 * ClientsPage
 *
 * Customer management view with "Dark Premium Glass" design.
 * Features searchable, filterable table with rich client data.
 */

// ============================================
// DUMMY DATA
// ============================================
const dummyClients = [
  {
    id: '1',
    name: 'María García López',
    email: 'maria.garcia@email.com',
    phone: '+52 55 1234 5678',
    avatar: null,
    status: 'active',
    isVIP: true,
    currentProgress: 8,
    maxProgress: 10,
    totalVisits: 47,
    totalPoints: 2340,
    lastVisit: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    pendingRewards: 1,
  },
  {
    id: '2',
    name: 'Carlos Rodríguez',
    email: 'carlos.rod@gmail.com',
    phone: '+52 55 9876 5432',
    avatar: null,
    status: 'active',
    isVIP: true,
    currentProgress: 10,
    maxProgress: 10,
    totalVisits: 63,
    totalPoints: 3150,
    lastVisit: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    pendingRewards: 2,
  },
  {
    id: '3',
    name: 'Ana Martínez Ruiz',
    email: 'ana.mtz@outlook.com',
    phone: '+52 33 5555 1234',
    avatar: null,
    status: 'active',
    isVIP: false,
    currentProgress: 3,
    maxProgress: 10,
    totalVisits: 12,
    totalPoints: 450,
    lastVisit: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    pendingRewards: 0,
  },
  {
    id: '4',
    name: 'Roberto Sánchez',
    email: 'roberto.s@company.mx',
    phone: '+52 81 4444 7890',
    avatar: null,
    status: 'inactive',
    isVIP: false,
    currentProgress: 5,
    maxProgress: 10,
    totalVisits: 8,
    totalPoints: 200,
    lastVisit: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
    pendingRewards: 0,
  },
  {
    id: '5',
    name: 'Sofía Hernández',
    email: 'sofia.hdz@email.com',
    phone: '+52 55 7777 8888',
    avatar: null,
    status: 'active',
    isVIP: false,
    currentProgress: 6,
    maxProgress: 10,
    totalVisits: 23,
    totalPoints: 890,
    lastVisit: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    pendingRewards: 0,
  },
  {
    id: '6',
    name: 'Fernando Torres',
    email: 'fer.torres@gmail.com',
    phone: '+52 33 2222 3333',
    avatar: null,
    status: 'active',
    isVIP: true,
    currentProgress: 9,
    maxProgress: 10,
    totalVisits: 89,
    totalPoints: 4450,
    lastVisit: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    pendingRewards: 3,
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================
const getRelativeTime = (date) => {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem`;
  return `Hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) > 1 ? 'es' : ''}`;
};

const getInitials = (name) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

// ============================================
// MAIN COMPONENT
// ============================================
const ClientsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);

  const filterOptions = [
    { value: 'all', label: 'Todos los clientes' },
    { value: 'vip', label: 'VIP' },
    { value: 'pending', label: 'Con Premios Pendientes' },
    { value: 'inactive', label: 'Inactivos' },
  ];

  const filteredClients = useMemo(() => {
    let result = [...dummyClients];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (client) =>
          client.name.toLowerCase().includes(query) ||
          client.email.toLowerCase().includes(query) ||
          client.phone.includes(query)
      );
    }

    // Apply status filter
    switch (filter) {
      case 'vip':
        result = result.filter((c) => c.isVIP);
        break;
      case 'pending':
        result = result.filter((c) => c.pendingRewards > 0);
        break;
      case 'inactive':
        result = result.filter((c) => c.status === 'inactive');
        break;
      default:
        break;
    }

    return result;
  }, [searchQuery, filter]);

  const handleClientClick = (clientId) => {
    navigate(`/dashboard/clients/${clientId}`);
  };

  const currentFilterLabel = filterOptions.find((f) => f.value === filter)?.label;

  return (
    <PageContainer>
      {/* Header Section */}
      <PageHeader>
        <HeaderContent>
          <PageTitle>Clientes</PageTitle>
          <PageSubtitle>
            Gestiona tu base de datos y conoce a tus usuarios VIP.
          </PageSubtitle>
        </HeaderContent>
        <HeaderStats>
          <StatBadge>
            <TrendingUp size={14} />
            {dummyClients.length} registrados
          </StatBadge>
        </HeaderStats>
      </PageHeader>

      {/* Toolbar */}
      <Toolbar>
        <ToolbarLeft>
          {/* Search Input */}
          <SearchWrapper>
            <SearchIcon>
              <Search size={18} />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchWrapper>

          {/* Filter Dropdown */}
          <FilterWrapper>
            <FilterButton onClick={() => setFilterOpen(!filterOpen)}>
              <Filter size={16} />
              {currentFilterLabel}
              <ChevronDown size={16} className={filterOpen ? 'open' : ''} />
            </FilterButton>
            {filterOpen && (
              <FilterDropdown>
                {filterOptions.map((option) => (
                  <FilterOption
                    key={option.value}
                    $active={filter === option.value}
                    onClick={() => {
                      setFilter(option.value);
                      setFilterOpen(false);
                    }}
                  >
                    {option.label}
                  </FilterOption>
                ))}
              </FilterDropdown>
            )}
          </FilterWrapper>
        </ToolbarLeft>

        {/* Primary Action */}
        <PrimaryButton onClick={() => navigate('/dashboard/clients/new')}>
          <UserPlus size={18} />
          Registrar Cliente
        </PrimaryButton>
      </Toolbar>

      {/* Data Table */}
      <TableContainer>
        <StyledTable>
          <TableHead>
            <tr>
              <TableHeader>Cliente</TableHeader>
              <TableHeader>Estado</TableHeader>
              <TableHeader>Progreso</TableHeader>
              <TableHeader>Visitas</TableHeader>
              <TableHeader>Última Visita</TableHeader>
              <TableHeader $align="center">Acciones</TableHeader>
            </tr>
          </TableHead>
          <tbody>
            {filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState>
                    <Search size={32} />
                    <span>No se encontraron clientes</span>
                    <small>Intenta con otros términos de búsqueda</small>
                  </EmptyState>
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow
                  key={client.id}
                  onClick={() => handleClientClick(client.id)}
                >
                  {/* Client Info */}
                  <TableCell>
                    <ClientInfo>
                      <Avatar $isVIP={client.isVIP}>
                        {getInitials(client.name)}
                        {client.isVIP && (
                          <VIPBadge>
                            <Star size={10} fill="currentColor" />
                          </VIPBadge>
                        )}
                      </Avatar>
                      <ClientDetails>
                        <ClientName>{client.name}</ClientName>
                        <ClientMeta>
                          <Mail size={12} />
                          {client.email}
                        </ClientMeta>
                      </ClientDetails>
                    </ClientInfo>
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell>
                    <StatusBadge $status={client.status}>
                      {client.status === 'active' ? 'Activo' : 'Inactivo'}
                    </StatusBadge>
                  </TableCell>

                  {/* Progress */}
                  <TableCell>
                    <ProgressWrapper>
                      <ProgressBar>
                        <ProgressFill
                          $percent={(client.currentProgress / client.maxProgress) * 100}
                          $complete={client.currentProgress >= client.maxProgress}
                        />
                      </ProgressBar>
                      <ProgressText>
                        {client.currentProgress}/{client.maxProgress} sellos
                      </ProgressText>
                    </ProgressWrapper>
                  </TableCell>

                  {/* Total Visits */}
                  <TableCell>
                    <VisitsValue>{client.totalVisits}</VisitsValue>
                  </TableCell>

                  {/* Last Visit */}
                  <TableCell>
                    <LastVisit>
                      <Clock size={14} />
                      {getRelativeTime(client.lastVisit)}
                    </LastVisit>
                  </TableCell>

                  {/* Actions */}
                  <TableCell $align="center">
                    <ActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClientClick(client.id);
                      }}
                    >
                      <Eye size={16} />
                    </ActionButton>
                    <ActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        // Future: Open menu
                      }}
                    >
                      <MoreHorizontal size={16} />
                    </ActionButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </tbody>
        </StyledTable>
      </TableContainer>

      {/* Results Summary */}
      <ResultsSummary>
        Mostrando {filteredClients.length} de {dummyClients.length} clientes
      </ResultsSummary>
    </PageContainer>
  );
};

// ============================================
// ANIMATIONS
// ============================================
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// ============================================
// STYLED COMPONENTS
// ============================================

// Page Container
const PageContainer = styled.div`
  min-height: 100%;
  background: #020617;
  padding: 32px;
  animation: ${fadeIn} 0.4s ease-out;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

// Header
const PageHeader = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 32px;
  animation: ${fadeInUp} 0.5s ease-out;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const HeaderContent = styled.div``;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 600;
  color: #F8FAFC;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
`;

const PageSubtitle = styled.p`
  font-size: 15px;
  color: #94A3B8;
  margin: 0;
`;

const HeaderStats = styled.div`
  display: flex;
  gap: 12px;
`;

const StatBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(16, 185, 129, 0.12);
  color: #10B981;
  font-size: 13px;
  font-weight: 500;
  border-radius: 20px;
`;

// Toolbar
const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  animation: ${fadeInUp} 0.5s ease-out 0.1s both;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

// Search
const SearchWrapper = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;

  @media (max-width: 640px) {
    max-width: 100%;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748B;
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  height: 44px;
  padding: 0 16px 0 48px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: #F8FAFC;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;

  &::placeholder {
    color: #64748B;
  }

  &:focus {
    border-color: rgba(16, 185, 129, 0.5);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
`;

// Filter Dropdown
const FilterWrapper = styled.div`
  position: relative;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 16px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: #CBD5E1;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  svg.open {
    transform: rotate(180deg);
  }

  svg {
    transition: transform 0.2s ease;
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.15);
    background: rgba(30, 41, 59, 0.8);
  }
`;

const FilterDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 200px;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 8px;
  z-index: 100;
  animation: ${fadeIn} 0.15s ease-out;
`;

const FilterOption = styled.button`
  display: block;
  width: 100%;
  padding: 10px 12px;
  text-align: left;
  background: ${({ $active }) => ($active ? 'rgba(16, 185, 129, 0.15)' : 'transparent')};
  border: none;
  border-radius: 8px;
  color: ${({ $active }) => ($active ? '#10B981' : '#CBD5E1')};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ $active }) =>
      $active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  }
`;

// Primary Button
const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 20px;
  background: #10B981;
  color: white;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: #059669;
    transform: translateY(-1px);
    box-shadow: 0 8px 20px -8px rgba(16, 185, 129, 0.5);
  }

  &:active {
    transform: translateY(0);
  }
`;

// Table Container
const TableContainer = styled.div`
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  overflow: hidden;
  animation: ${fadeInUp} 0.5s ease-out 0.15s both;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background: rgba(0, 0, 0, 0.2);
`;

const TableHeader = styled.th`
  padding: 16px 20px;
  text-align: ${({ $align }) => $align || 'left'};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748B;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const TableRow = styled.tr`
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.2s ease;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 16px 20px;
  text-align: ${({ $align }) => $align || 'left'};
  vertical-align: middle;
`;

// Empty State
const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #64748B;
  text-align: center;

  svg {
    margin-bottom: 16px;
    opacity: 0.5;
  }

  span {
    font-size: 16px;
    font-weight: 500;
    color: #94A3B8;
    margin-bottom: 4px;
  }

  small {
    font-size: 14px;
  }
`;

// Client Info Cell
const ClientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const Avatar = styled.div`
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: ${({ $isVIP }) =>
    $isVIP
      ? 'linear-gradient(135deg, #F59E0B, #D97706)'
      : 'linear-gradient(135deg, #6366F1, #4F46E5)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
`;

const VIPBadge = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  background: #F59E0B;
  border: 2px solid #020617;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const ClientDetails = styled.div`
  min-width: 0;
`;

const ClientName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #F8FAFC;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ClientMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748B;

  svg {
    flex-shrink: 0;
  }
`;

// Status Badge
const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;
  background: ${({ $status }) =>
    $status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)'};
  color: ${({ $status }) => ($status === 'active' ? '#10B981' : '#94A3B8')};
`;

// Progress
const ProgressWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 100px;
`;

const ProgressBar = styled.div`
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${({ $percent }) => $percent}%;
  background: ${({ $complete }) =>
    $complete
      ? 'linear-gradient(90deg, #10B981, #34D399)'
      : 'linear-gradient(90deg, #6366F1, #818CF8)'};
  border-radius: 3px;
  transition: width 0.3s ease;
`;

const ProgressText = styled.span`
  font-size: 12px;
  color: #94A3B8;
`;

// Visits
const VisitsValue = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: #F8FAFC;
`;

// Last Visit
const LastVisit = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #94A3B8;

  svg {
    color: #64748B;
  }
`;

// Action Buttons
const ActionButton = styled.button`
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px;
  color: #64748B;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #F8FAFC;
    border-color: rgba(255, 255, 255, 0.1);
  }

  & + & {
    margin-left: 4px;
  }
`;

// Results Summary
const ResultsSummary = styled.div`
  margin-top: 16px;
  padding: 0 4px;
  font-size: 13px;
  color: #64748B;
  animation: ${fadeIn} 0.5s ease-out 0.2s both;
`;

export default ClientsPage;
