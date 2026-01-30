import { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Star,
  Gift,
  Trash2,
} from 'lucide-react';
import { useOrganization } from '../../context/OrganizationContext';
import { useAuth } from '../../context/AuthContext';
import { getCustomers, registerVisit, redeemReward, deleteCustomer } from '../../api/customers';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';

const Customers = () => {
  const { organization } = useOrganization();
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [redeemModalOpen, setRedeemModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [pointsToAdd, setPointsToAdd] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  // Dropdown menu
  const [openMenuId, setOpenMenuId] = useState(null);

  const fetchCustomers = async () => {
    if (!organization?.id) return;

    setLoading(true);
    const { data, error } = await getCustomers(organization.id);

    if (data) setCustomers(data);
    if (error) console.error('Error fetching customers:', error);

    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, [organization?.id]);

  const filteredCustomers = customers.filter((customer) => {
    const search = searchTerm.toLowerCase();
    return (
      customer.full_name?.toLowerCase().includes(search) ||
      customer.email?.toLowerCase().includes(search) ||
      customer.phone?.includes(search)
    );
  });

  const handleRegisterVisit = async () => {
    if (!selectedCustomer || pointsToAdd < 1) return;

    setActionLoading(true);

    const { data, error } = await registerVisit({
      customerId: selectedCustomer.id,
      organizationId: organization.id,
      loyaltyCardId: selectedCustomer.loyalty_card_id,
      pointsToAdd,
      description: `+${pointsToAdd} puntos por visita`,
      processedBy: user.id,
    });

    if (data) {
      // Actualizar cliente en la lista local
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === selectedCustomer.id
            ? { ...c, current_points: data.newBalance }
            : c
        )
      );
      setVisitModalOpen(false);
      setSelectedCustomer(null);
      setPointsToAdd(1);
    }

    if (error) {
      alert('Error al registrar visita: ' + error.message);
    }

    setActionLoading(false);
  };

  const handleRedeemReward = async () => {
    if (!selectedCustomer) return;

    const rewardThreshold = selectedCustomer.loyalty_cards?.reward_threshold || 10;

    setActionLoading(true);

    const { data, error } = await redeemReward({
      customerId: selectedCustomer.id,
      organizationId: organization.id,
      loyaltyCardId: selectedCustomer.loyalty_card_id,
      pointsToRedeem: rewardThreshold,
      description: selectedCustomer.loyalty_cards?.reward_description || 'Recompensa canjeada',
      processedBy: user.id,
    });

    if (data) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === selectedCustomer.id
            ? { ...c, current_points: data.newBalance, rewards_redeemed: c.rewards_redeemed + 1 }
            : c
        )
      );
      setRedeemModalOpen(false);
      setSelectedCustomer(null);
    }

    if (error) {
      alert('Error: ' + error.message);
    }

    setActionLoading(false);
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;

    const { error } = await deleteCustomer(customerId);

    if (!error) {
      setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    } else {
      alert('Error al eliminar: ' + error.message);
    }

    setOpenMenuId(null);
  };

  const openVisitModal = (customer) => {
    setSelectedCustomer(customer);
    setVisitModalOpen(true);
    setOpenMenuId(null);
  };

  const openRedeemModal = (customer) => {
    setSelectedCustomer(customer);
    setRedeemModalOpen(true);
    setOpenMenuId(null);
  };

  return (
    <Container>
      <PageHeader>
        <div>
          <PageTitle>
            <Users size={24} />
            Clientes
          </PageTitle>
          <PageSubtitle>
            {customers.length} cliente{customers.length !== 1 ? 's' : ''} registrado{customers.length !== 1 ? 's' : ''}
          </PageSubtitle>
        </div>
      </PageHeader>

      {/* Search */}
      <SearchBar>
        <SearchIcon>
          <Search size={20} />
        </SearchIcon>
        <SearchInput
          type="text"
          placeholder="Buscar por nombre, email o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchBar>

      {/* Table */}
      {loading ? (
        <LoadingState>Cargando clientes...</LoadingState>
      ) : filteredCustomers.length === 0 ? (
        <EmptyState>
          <EmptyIcon>👥</EmptyIcon>
          <EmptyTitle>
            {searchTerm ? 'Sin resultados' : 'Sin clientes aún'}
          </EmptyTitle>
          <EmptyDescription>
            {searchTerm
              ? 'Intenta con otro término de búsqueda.'
              : 'Cuando los clientes escaneen tu QR, aparecerán aquí.'}
          </EmptyDescription>
        </EmptyState>
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <Th>Cliente</Th>
                <Th>Programa</Th>
                <Th>Puntos</Th>
                <Th>Canjeados</Th>
                <Th>Última visita</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => {
                const rewardThreshold = customer.loyalty_cards?.reward_threshold || 10;
                const canRedeem = customer.current_points >= rewardThreshold;

                return (
                  <Tr key={customer.id}>
                    <Td>
                      <CustomerInfo>
                        <CustomerAvatar>
                          {(customer.full_name || customer.email)?.charAt(0).toUpperCase()}
                        </CustomerAvatar>
                        <CustomerDetails>
                          <CustomerName>
                            {customer.full_name || 'Sin nombre'}
                          </CustomerName>
                          <CustomerContact>
                            {customer.email || customer.phone}
                          </CustomerContact>
                        </CustomerDetails>
                      </CustomerInfo>
                    </Td>
                    <Td>
                      <ProgramBadge>
                        {customer.loyalty_cards?.name || 'Programa'}
                      </ProgramBadge>
                    </Td>
                    <Td>
                      <PointsCell>
                        <PointsValue>{customer.current_points}</PointsValue>
                        <PointsMax>/ {rewardThreshold}</PointsMax>
                      </PointsCell>
                      <ProgressBar>
                        <ProgressFill
                          $progress={Math.min(
                            (customer.current_points / rewardThreshold) * 100,
                            100
                          )}
                        />
                      </ProgressBar>
                    </Td>
                    <Td>
                      <RewardsBadge>
                        <Gift size={14} />
                        {customer.rewards_redeemed}
                      </RewardsBadge>
                    </Td>
                    <Td>
                      <DateText>
                        {new Date(customer.last_visit_at).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </DateText>
                    </Td>
                    <Td>
                      <ActionsCell>
                        <ActionButton onClick={() => openVisitModal(customer)}>
                          <Plus size={16} />
                          Visita
                        </ActionButton>

                        {canRedeem && (
                          <ActionButton
                            $variant="success"
                            onClick={() => openRedeemModal(customer)}
                          >
                            <Gift size={16} />
                            Canjear
                          </ActionButton>
                        )}

                        <MenuWrapper>
                          <MenuButton
                            onClick={() =>
                              setOpenMenuId(openMenuId === customer.id ? null : customer.id)
                            }
                          >
                            <MoreVertical size={16} />
                          </MenuButton>

                          {openMenuId === customer.id && (
                            <MenuDropdown>
                              <MenuItem
                                $danger
                                onClick={() => handleDeleteCustomer(customer.id)}
                              >
                                <Trash2 size={14} />
                                Eliminar
                              </MenuItem>
                            </MenuDropdown>
                          )}
                        </MenuWrapper>
                      </ActionsCell>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        </TableContainer>
      )}

      {/* Modal: Registrar Visita */}
      <Modal
        isOpen={visitModalOpen}
        onClose={() => setVisitModalOpen(false)}
        title="Registrar Visita"
      >
        {selectedCustomer && (
          <ModalContent>
            <CustomerPreview>
              <CustomerAvatar $large>
                {(selectedCustomer.full_name || selectedCustomer.email)?.charAt(0).toUpperCase()}
              </CustomerAvatar>
              <div>
                <CustomerName>{selectedCustomer.full_name || 'Sin nombre'}</CustomerName>
                <CustomerContact>{selectedCustomer.email || selectedCustomer.phone}</CustomerContact>
                <PointsBadge>
                  <Star size={14} />
                  {selectedCustomer.current_points} puntos actuales
                </PointsBadge>
              </div>
            </CustomerPreview>

            <FormGroup>
              <Label>Puntos a agregar</Label>
              <PointsInput>
                <PointsButton
                  onClick={() => setPointsToAdd(Math.max(1, pointsToAdd - 1))}
                  disabled={pointsToAdd <= 1}
                >
                  -
                </PointsButton>
                <PointsDisplay>{pointsToAdd}</PointsDisplay>
                <PointsButton onClick={() => setPointsToAdd(pointsToAdd + 1)}>
                  +
                </PointsButton>
              </PointsInput>
              <HelpText>
                Nuevo balance: {selectedCustomer.current_points + pointsToAdd} puntos
              </HelpText>
            </FormGroup>

            <ModalActions>
              <Button variant="ghost" onClick={() => setVisitModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleRegisterVisit} loading={actionLoading}>
                <Plus size={16} />
                Registrar +{pointsToAdd} punto{pointsToAdd !== 1 ? 's' : ''}
              </Button>
            </ModalActions>
          </ModalContent>
        )}
      </Modal>

      {/* Modal: Canjear Recompensa */}
      <Modal
        isOpen={redeemModalOpen}
        onClose={() => setRedeemModalOpen(false)}
        title="Canjear Recompensa"
      >
        {selectedCustomer && (
          <ModalContent>
            <CustomerPreview>
              <CustomerAvatar $large>
                {(selectedCustomer.full_name || selectedCustomer.email)?.charAt(0).toUpperCase()}
              </CustomerAvatar>
              <div>
                <CustomerName>{selectedCustomer.full_name || 'Sin nombre'}</CustomerName>
                <PointsBadge>
                  <Star size={14} />
                  {selectedCustomer.current_points} puntos actuales
                </PointsBadge>
              </div>
            </CustomerPreview>

            <RewardPreview>
              <RewardIcon>🎁</RewardIcon>
              <RewardInfo>
                <RewardTitle>
                  {selectedCustomer.loyalty_cards?.reward_description || 'Recompensa'}
                </RewardTitle>
                <RewardCost>
                  Costo: {selectedCustomer.loyalty_cards?.reward_threshold || 10} puntos
                </RewardCost>
              </RewardInfo>
            </RewardPreview>

            <HelpText>
              Balance después del canje:{' '}
              {selectedCustomer.current_points - (selectedCustomer.loyalty_cards?.reward_threshold || 10)} puntos
            </HelpText>

            <ModalActions>
              <Button variant="ghost" onClick={() => setRedeemModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleRedeemReward} loading={actionLoading}>
                <Gift size={16} />
                Confirmar Canje
              </Button>
            </ModalActions>
          </ModalContent>
        )}
      </Modal>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.space.xl};
`;

const PageTitle = styled.h1`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  margin-bottom: ${({ theme }) => theme.space.xs};
`;

const PageSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const SearchBar = styled.div`
  position: relative;
  margin-bottom: ${({ theme }) => theme.space.lg};
`;

const SearchIcon = styled.div`
  position: absolute;
  left: ${({ theme }) => theme.space.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text.muted};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.space.sm} ${({ theme }) => theme.space.md};
  padding-left: ${({ theme }) => theme.space['3xl']};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  background: ${({ theme }) => theme.colors.surface};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.space['3xl']};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.space['3xl']};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
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

const TableContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: ${({ theme }) => theme.space.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Tr = styled.tr`
  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const Td = styled.td`
  padding: ${({ theme }) => theme.space.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  vertical-align: middle;
`;

const CustomerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm};
`;

const CustomerAvatar = styled.div`
  width: ${({ $large }) => ($large ? '48px' : '40px')};
  height: ${({ $large }) => ($large ? '48px' : '40px')};
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  flex-shrink: 0;
`;

const CustomerDetails = styled.div``;

const CustomerName = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const CustomerContact = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const ProgramBadge = styled.span`
  display: inline-block;
  padding: ${({ theme }) => theme.space.xs} ${({ theme }) => theme.space.sm};
  background: ${({ theme }) => `${theme.colors.primary}15`};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const PointsCell = styled.div`
  display: flex;
  align-items: baseline;
  gap: 2px;
  margin-bottom: 4px;
`;

const PointsValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const PointsMax = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const ProgressBar = styled.div`
  width: 80px;
  height: 4px;
  background: ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.radii.full};
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background: ${({ theme }) => theme.colors.primary};
  transition: width 0.3s ease;
`;

const RewardsBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const DateText = styled.span`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const ActionsCell = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.xs};
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: ${({ theme }) => theme.space.xs} ${({ theme }) => theme.space.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  background: ${({ theme, $variant }) =>
    $variant === 'success' ? `${theme.colors.success}15` : `${theme.colors.primary}15`};
  color: ${({ theme, $variant }) =>
    $variant === 'success' ? theme.colors.success : theme.colors.primary};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme, $variant }) =>
      $variant === 'success' ? `${theme.colors.success}25` : `${theme.colors.primary}25`};
  }
`;

const MenuWrapper = styled.div`
  position: relative;
`;

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.text.muted};

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const MenuDropdown = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 4px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  min-width: 140px;
  z-index: 10;
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm};
  width: 100%;
  padding: ${({ theme }) => theme.space.sm} ${({ theme }) => theme.space.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ $danger, theme }) =>
    $danger ? theme.colors.error : theme.colors.text.secondary};

  &:hover {
    background: ${({ $danger, theme }) =>
      $danger ? `${theme.colors.error}10` : theme.colors.surfaceHover};
  }
`;

// Modal Styles
const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.lg};
`;

const CustomerPreview = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.md};
  padding: ${({ theme }) => theme.space.md};
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radii.md};
`;

const PointsBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: ${({ theme }) => theme.space.xs};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.primary};
`;

const FormGroup = styled.div``;

const Label = styled.label`
  display: block;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  margin-bottom: ${({ theme }) => theme.space.sm};
`;

const PointsInput = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.md};
`;

const PointsButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.surface};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PointsDisplay = styled.div`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  min-width: 60px;
  text-align: center;
`;

const HelpText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: ${({ theme }) => theme.space.sm};
`;

const RewardPreview = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.md};
  padding: ${({ theme }) => theme.space.lg};
  background: ${({ theme }) => `${theme.colors.success}10`};
  border: 1px solid ${({ theme }) => `${theme.colors.success}30`};
  border-radius: ${({ theme }) => theme.radii.md};
`;

const RewardIcon = styled.div`
  font-size: 32px;
`;

const RewardInfo = styled.div``;

const RewardTitle = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.success};
`;

const RewardCost = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.space.sm};
  padding-top: ${({ theme }) => theme.space.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

export default Customers;
