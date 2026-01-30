import styled from 'styled-components';
import Input from '../common/Input';

/**
 * WizardStep2Logic: Configuración de lógica según tipo de programa
 */
const WizardStep2Logic = ({ programType, logicRules, onUpdateLogic }) => {
  const handleChange = (field, value) => {
    onUpdateLogic({ ...logicRules, [field]: value });
  };

  const renderStampLogic = () => (
    <>
      <FormRow>
        <FormGroup>
          <Label>¿Cuántos sellos para el premio?</Label>
          <NumberInput
            type="number"
            min="1"
            max="20"
            value={logicRules.target || 8}
            onChange={(e) => handleChange('target', parseInt(e.target.value))}
          />
          <HelpText>Recomendado: 8-12 sellos</HelpText>
        </FormGroup>

        <FormGroup>
          <Label>Valor de cada sello</Label>
          <NumberInput
            type="number"
            min="1"
            max="10"
            value={logicRules.stamp_value || 1}
            onChange={(e) => handleChange('stamp_value', parseInt(e.target.value))}
          />
          <HelpText>Por defecto: 1 visita = 1 sello</HelpText>
        </FormGroup>
      </FormRow>

      <FormGroup>
        <Input
          label="¿Cuál es el premio?"
          value={logicRules.reward || ''}
          onChange={(e) => handleChange('reward', e.target.value)}
          placeholder="Ej: Café gratis, Postre de cortesía"
        />
      </FormGroup>
    </>
  );

  const renderPointsLogic = () => (
    <>
      <FormRow>
        <FormGroup>
          <Label>Puntos por visita</Label>
          <NumberInput
            type="number"
            min="1"
            max="100"
            value={logicRules.points_per_visit || 10}
            onChange={(e) => handleChange('points_per_visit', parseInt(e.target.value))}
          />
        </FormGroup>

        <FormGroup>
          <Label>O puntos por peso gastado</Label>
          <CurrencyInput>
            <span>$1 =</span>
            <NumberInput
              type="number"
              min="0.1"
              max="10"
              step="0.1"
              value={logicRules.points_per_currency || 1}
              onChange={(e) => handleChange('points_per_currency', parseFloat(e.target.value))}
            />
            <span>pts</span>
          </CurrencyInput>
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup>
          <Label>Puntos para premio</Label>
          <NumberInput
            type="number"
            min="10"
            max="1000"
            value={logicRules.reward_threshold || 100}
            onChange={(e) => handleChange('reward_threshold', parseInt(e.target.value))}
          />
        </FormGroup>

        <FormGroup>
          <Input
            label="Premio"
            value={logicRules.reward || ''}
            onChange={(e) => handleChange('reward', e.target.value)}
            placeholder="Ej: 10% de descuento"
          />
        </FormGroup>
      </FormRow>
    </>
  );

  const renderCashbackLogic = () => (
    <>
      <FormRow>
        <FormGroup>
          <Label>Porcentaje de cashback</Label>
          <PercentInput>
            <NumberInput
              type="number"
              min="1"
              max="50"
              value={logicRules.percentage || 5}
              onChange={(e) => handleChange('percentage', parseInt(e.target.value))}
            />
            <span>%</span>
          </PercentInput>
          <HelpText>El cliente recibe este % de su compra</HelpText>
        </FormGroup>

        <FormGroup>
          <Label>Máximo cashback por compra</Label>
          <CurrencyInput>
            <span>$</span>
            <NumberInput
              type="number"
              min="0"
              max="1000"
              value={logicRules.max_cashback || 100}
              onChange={(e) => handleChange('max_cashback', parseInt(e.target.value))}
            />
          </CurrencyInput>
          <HelpText>0 = sin límite</HelpText>
        </FormGroup>
      </FormRow>

      <FormGroup>
        <Label>Moneda</Label>
        <Select
          value={logicRules.currency || 'MXN'}
          onChange={(e) => handleChange('currency', e.target.value)}
        >
          <option value="MXN">MXN - Peso Mexicano</option>
          <option value="USD">USD - Dólar</option>
          <option value="EUR">EUR - Euro</option>
        </Select>
      </FormGroup>
    </>
  );

  const renderCouponLogic = () => (
    <>
      <FormRow>
        <FormGroup>
          <Label>Tipo de descuento</Label>
          <Select
            value={logicRules.discount_type || 'percentage'}
            onChange={(e) => handleChange('discount_type', e.target.value)}
          >
            <option value="percentage">Porcentaje (%)</option>
            <option value="fixed">Monto fijo ($)</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Valor del descuento</Label>
          {logicRules.discount_type === 'fixed' ? (
            <CurrencyInput>
              <span>$</span>
              <NumberInput
                type="number"
                min="1"
                max="10000"
                value={logicRules.discount_value || 100}
                onChange={(e) => handleChange('discount_value', parseInt(e.target.value))}
              />
            </CurrencyInput>
          ) : (
            <PercentInput>
              <NumberInput
                type="number"
                min="1"
                max="100"
                value={logicRules.discount_value || 20}
                onChange={(e) => handleChange('discount_value', parseInt(e.target.value))}
              />
              <span>%</span>
            </PercentInput>
          )}
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup>
          <Label>Usos permitidos</Label>
          <NumberInput
            type="number"
            min="1"
            max="100"
            value={logicRules.uses_limit || 1}
            onChange={(e) => handleChange('uses_limit', parseInt(e.target.value))}
          />
          <HelpText>Cuántas veces se puede usar el cupón</HelpText>
        </FormGroup>

        <FormGroup>
          <Label>Compra mínima</Label>
          <CurrencyInput>
            <span>$</span>
            <NumberInput
              type="number"
              min="0"
              max="10000"
              value={logicRules.min_purchase || 0}
              onChange={(e) => handleChange('min_purchase', parseInt(e.target.value))}
            />
          </CurrencyInput>
          <HelpText>0 = sin mínimo</HelpText>
        </FormGroup>
      </FormRow>
    </>
  );

  const renderGiftCardLogic = () => (
    <>
      <FormRow>
        <FormGroup>
          <Label>Saldo inicial</Label>
          <CurrencyInput>
            <span>$</span>
            <NumberInput
              type="number"
              min="50"
              max="10000"
              value={logicRules.initial_balance || 500}
              onChange={(e) => handleChange('initial_balance', parseInt(e.target.value))}
            />
          </CurrencyInput>
        </FormGroup>

        <FormGroup>
          <Label>Moneda</Label>
          <Select
            value={logicRules.currency || 'MXN'}
            onChange={(e) => handleChange('currency', e.target.value)}
          >
            <option value="MXN">MXN - Peso Mexicano</option>
            <option value="USD">USD - Dólar</option>
            <option value="EUR">EUR - Euro</option>
          </Select>
        </FormGroup>
      </FormRow>

      <FormGroup>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={logicRules.is_rechargeable || false}
            onChange={(e) => handleChange('is_rechargeable', e.target.checked)}
          />
          <span>Permitir recargas</span>
        </CheckboxLabel>
        <HelpText>El cliente puede agregar más saldo</HelpText>
      </FormGroup>
    </>
  );

  const renderMembershipLogic = () => (
    <>
      <FormGroup>
        <Label>Niveles de membresía</Label>
        <TiersContainer>
          {(logicRules.tiers || [
            { name: 'Bronce', min_points: 0, benefits: ['5% descuento'] },
          ]).map((tier, index) => (
            <TierCard key={index}>
              <TierHeader>
                <TierInput
                  type="text"
                  value={tier.name}
                  onChange={(e) => {
                    const newTiers = [...(logicRules.tiers || [])];
                    newTiers[index].name = e.target.value;
                    handleChange('tiers', newTiers);
                  }}
                  placeholder="Nombre del nivel"
                />
                <TierPoints>
                  <span>desde</span>
                  <NumberInput
                    type="number"
                    min="0"
                    value={tier.min_points}
                    onChange={(e) => {
                      const newTiers = [...(logicRules.tiers || [])];
                      newTiers[index].min_points = parseInt(e.target.value);
                      handleChange('tiers', newTiers);
                    }}
                    style={{ width: '80px' }}
                  />
                  <span>pts</span>
                </TierPoints>
              </TierHeader>
              <BenefitsInput
                type="text"
                value={(tier.benefits || []).join(', ')}
                onChange={(e) => {
                  const newTiers = [...(logicRules.tiers || [])];
                  newTiers[index].benefits = e.target.value.split(',').map((b) => b.trim());
                  handleChange('tiers', newTiers);
                }}
                placeholder="Beneficios (separados por coma)"
              />
            </TierCard>
          ))}
          <AddTierButton
            type="button"
            onClick={() => {
              const newTiers = [...(logicRules.tiers || [])];
              newTiers.push({
                name: `Nivel ${newTiers.length + 1}`,
                min_points: (newTiers[newTiers.length - 1]?.min_points || 0) + 100,
                benefits: [],
              });
              handleChange('tiers', newTiers);
            }}
          >
            + Agregar nivel
          </AddTierButton>
        </TiersContainer>
      </FormGroup>
    </>
  );

  const renderLogicForm = () => {
    switch (programType) {
      case 'stamp':
        return renderStampLogic();
      case 'points':
        return renderPointsLogic();
      case 'cashback':
        return renderCashbackLogic();
      case 'coupon':
        return renderCouponLogic();
      case 'gift_card':
        return renderGiftCardLogic();
      case 'membership':
        return renderMembershipLogic();
      default:
        return <p>Selecciona un tipo de programa primero.</p>;
    }
  };

  return (
    <Container>
      <StepHeader>
        <StepTitle>Configura las reglas de tu programa</StepTitle>
        <StepDescription>
          Define cómo funcionará la lógica de recompensas.
        </StepDescription>
      </StepHeader>

      <FormContainer>{renderLogicForm()}</FormContainer>
    </Container>
  );
};

// === Styled Components ===

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

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.lg};
  max-width: 600px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.space.lg};
`;

const FormGroup = styled.div``;

const Label = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  margin-bottom: ${({ theme }) => theme.space.xs};
`;

const HelpText = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: ${({ theme }) => theme.space.xs};
`;

const NumberInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.space.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.md};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const CurrencyInput = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm};

  span {
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  input {
    flex: 1;
  }
`;

const PercentInput = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm};

  span {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.lg};
  }

  input {
    flex: 1;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.space.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  background: ${({ theme }) => theme.colors.surface};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm};
  cursor: pointer;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const TiersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.md};
`;

const TierCard = styled.div`
  padding: ${({ theme }) => theme.space.md};
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radii.md};
`;

const TierHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.md};
  margin-bottom: ${({ theme }) => theme.space.sm};
`;

const TierInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.space.xs} ${({ theme }) => theme.space.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const TierPoints = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};

  input {
    width: 80px;
    padding: 4px 8px;
  }
`;

const BenefitsInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.space.xs} ${({ theme }) => theme.space.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const AddTierButton = styled.button`
  padding: ${({ theme }) => theme.space.sm};
  border: 2px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export default WizardStep2Logic;
