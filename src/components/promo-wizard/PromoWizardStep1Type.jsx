import styled from 'styled-components';
import { Check } from 'lucide-react';
import { PROGRAM_TYPES } from '../../api/programs';

/**
 * PromoWizardStep1Type: Selección del tipo de promoción especial
 * Solo muestra: points, membership, coupon, gift_card, cashback
 */
const PromoWizardStep1Type = ({ selectedType, onSelectType }) => {
  // Filtrar solo los tipos de promoción especial permitidos
  const promoTypeIds = ['points', 'membership', 'coupon', 'gift_card', 'cashback'];
  const programTypes = Object.values(PROGRAM_TYPES).filter(
    (type) => promoTypeIds.includes(type.id)
  );

  return (
    <Container>
      <StepHeader>
        <StepTitle>¿Qué tipo de promoción especial deseas crear?</StepTitle>
        <StepDescription>
          Selecciona el modelo de promoción que mejor se adapte a tu negocio.
        </StepDescription>
      </StepHeader>

      <TypesGrid>
        {programTypes.map((type) => (
          <TypeCard
            key={type.id}
            $selected={selectedType === type.id}
            onClick={() => onSelectType(type.id)}
            tabIndex={0}
            role="button"
            aria-pressed={selectedType === type.id}
          >
            {selectedType === type.id && (
              <SelectedBadge>
                <Check size={14} />
              </SelectedBadge>
            )}

            <TypeIcon>{type.icon}</TypeIcon>
            <TypeName>{type.name}</TypeName>
            <TypeDescription>{type.description}</TypeDescription>

            <TypeExamples>
              {type.id === 'points' && 'Ej: "$1 = 1 punto"'}
              {type.id === 'membership' && 'Ej: "Bronce → Plata → Oro"'}
              {type.id === 'coupon' && 'Ej: "20% de descuento"'}
              {type.id === 'gift_card' && 'Ej: "Tarjeta de $500"'}
              {type.id === 'cashback' && 'Ej: "5% de vuelta"'}
            </TypeExamples>
          </TypeCard>
        ))}
      </TypesGrid>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
`;

const StepHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.space.xl};
`;

const StepTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.space.sm};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const StepDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const TypesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: ${({ theme }) => theme.space.lg};
  margin-top: ${({ theme }) => theme.space.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: ${({ theme }) => theme.space.md};
  }
`;

const TypeCard = styled.button`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: ${({ theme }) => theme.space.xl};
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ $selected, theme }) =>
    $selected ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  font-family: inherit;

  ${({ $selected, theme }) =>
    $selected &&
    `
    background: ${theme.colors.primary}08;
    box-shadow: 0 0 0 4px ${theme.colors.primary}20;
  `}

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:active {
    transform: translateY(0);
  }
`;

const SelectedBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const TypeIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${({ theme }) => theme.space.md};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TypeName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.space.xs};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const TypeDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.space.md};
  line-height: 1.4;
`;

const TypeExamples = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  padding: ${({ theme }) => theme.space.xs} ${({ theme }) => theme.space.sm};
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radii.full};
  display: inline-block;
  margin-top: auto;
`;

export default PromoWizardStep1Type;
