import styled from 'styled-components';
import { Check } from 'lucide-react';
import { PROGRAM_TYPES } from '../../api/programs';

/**
 * WizardStep1Type: Selección del tipo de programa
 */
const WizardStep1Type = ({ selectedType, onSelectType }) => {
  const programTypes = Object.values(PROGRAM_TYPES);

  return (
    <Container>
      <StepHeader>
        <StepTitle>¿Qué tipo de programa quieres crear?</StepTitle>
        <StepDescription>
          Selecciona el modelo de lealtad que mejor se adapte a tu negocio.
        </StepDescription>
      </StepHeader>

      <TypesGrid>
        {programTypes.map((type) => (
          <TypeCard
            key={type.id}
            $selected={selectedType === type.id}
            onClick={() => onSelectType(type.id)}
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
              {type.id === 'stamp' && 'Ej: "8 cafés = 1 gratis"'}
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

const Container = styled.div``;

const StepHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.space.xl};
`;

const StepTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  margin-bottom: ${({ theme }) => theme.space.sm};
`;

const StepDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const TypesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.space.lg};
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

  ${({ $selected, theme }) =>
    $selected &&
    `
    background: ${theme.colors.primary}08;
    box-shadow: 0 0 0 4px ${theme.colors.primary}20;
  `}

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
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
`;

const TypeIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${({ theme }) => theme.space.md};
`;

const TypeName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin-bottom: ${({ theme }) => theme.space.xs};
`;

const TypeDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.space.md};
`;

const TypeExamples = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  padding: ${({ theme }) => theme.space.xs} ${({ theme }) => theme.space.sm};
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radii.full};
`;

export default WizardStep1Type;
