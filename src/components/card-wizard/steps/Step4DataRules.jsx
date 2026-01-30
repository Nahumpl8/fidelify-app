import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xl};
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.md};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const SectionDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xs};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.space.md};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.fontSizes.md};
  background: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const InputRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.space.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${({ theme }) => theme.space.sm};
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.md};
  padding: ${({ theme }) => theme.space.md};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.radii.lg};
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background.tertiary};
  }
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  accent-color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
`;

const CheckboxLabel = styled.div`
  flex: 1;
`;

const CheckboxTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CheckboxDescription = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const RequiredBadge = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.primary}10;
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.radii.sm};
`;

const SwitchContainer = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.space.md};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.radii.lg};
  cursor: pointer;
`;

const SwitchInfo = styled.div``;

const SwitchTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const SwitchDescription = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Switch = styled.div`
  position: relative;
  width: 48px;
  height: 28px;
  background: ${({ $checked, theme }) =>
    $checked ? theme.colors.primary : theme.colors.border.light};
  border-radius: 14px;
  transition: background 0.2s ease;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ $checked }) => ($checked ? '22px' : '2px')};
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
    transition: left 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const HiddenCheckbox = styled.input`
  display: none;
`;

const DATA_FIELDS = [
  { name: 'first_name', label: 'Nombre', description: 'Nombre del cliente' },
  { name: 'email', label: 'Email', description: 'Correo electronico', alwaysRequired: true },
  { name: 'phone', label: 'Telefono', description: 'Numero de telefono' },
  { name: 'birthday', label: 'Cumpleanos', description: 'Fecha de nacimiento' },
  { name: 'photo', label: 'Foto', description: 'Foto de perfil' },
];

/**
 * Step4DataRules - Data collection and program rules
 */
const Step4DataRules = ({
  formState,
  updateRules,
  updateDataCollection,
  updateFeatures,
}) => {
  const { type, rules_config, data_collection_config, features_config } = formState;

  const handleFieldToggle = (fieldName, key, value) => {
    const currentFields = data_collection_config.fields || [];
    const fieldIndex = currentFields.findIndex((f) => f.name === fieldName);

    if (fieldIndex >= 0) {
      const newFields = [...currentFields];
      newFields[fieldIndex] = { ...newFields[fieldIndex], [key]: value };
      updateDataCollection({ fields: newFields });
    }
  };

  const getFieldConfig = (fieldName) => {
    const fields = data_collection_config.fields || [];
    return fields.find((f) => f.name === fieldName) || { enabled: false, required: false };
  };

  return (
    <Container>

      {/* Data Collection */}
      <Section>
        <SectionTitle>¿Qué datos te interesan de tu cliente?</SectionTitle>
        <SectionDescription>
          Selecciona que datos solicitar al cliente al registrarse
        </SectionDescription>

        <CheckboxGroup>
          {DATA_FIELDS.map((field) => {
            const config = getFieldConfig(field.name);
            const isAlwaysRequired = field.alwaysRequired;

            return (
              <CheckboxItem key={field.name}>
                <Checkbox
                  type="checkbox"
                  checked={config.enabled || isAlwaysRequired}
                  disabled={isAlwaysRequired}
                  onChange={(e) =>
                    handleFieldToggle(field.name, 'enabled', e.target.checked)
                  }
                />
                <CheckboxLabel>
                  <CheckboxTitle>
                    {field.label}
                    {isAlwaysRequired && <RequiredBadge>Requerido</RequiredBadge>}
                  </CheckboxTitle>
                  <CheckboxDescription>{field.description}</CheckboxDescription>
                </CheckboxLabel>
                {config.enabled && !isAlwaysRequired && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Checkbox
                      type="checkbox"
                      checked={config.required}
                      onChange={(e) =>
                        handleFieldToggle(field.name, 'required', e.target.checked)
                      }
                    />
                    <span style={{ fontSize: '12px' }}>Obligatorio</span>
                  </label>
                )}
              </CheckboxItem>
            );
          })}
        </CheckboxGroup>
      </Section>

      {/* Features */}
      <Section>
        <SectionTitle>Funcionalidades Extra</SectionTitle>

        <SwitchContainer>
          <SwitchInfo>
            <SwitchTitle>UTM Tracking</SwitchTitle>
            <SwitchDescription>
              Rastrea de donde vienen tus clientes con parametros UTM
            </SwitchDescription>
          </SwitchInfo>
          <HiddenCheckbox
            type="checkbox"
            checked={features_config.utm_tracking || false}
            onChange={(e) => updateFeatures({ utm_tracking: e.target.checked })}
          />
          <Switch $checked={features_config.utm_tracking || false} />
        </SwitchContainer>

        <SwitchContainer>
          <SwitchInfo>
            <SwitchTitle>Programa de Referidos</SwitchTitle>
            <SwitchDescription>
              Recompensa a clientes que refieran nuevos usuarios
            </SwitchDescription>
          </SwitchInfo>
          <HiddenCheckbox
            type="checkbox"
            checked={features_config.referral_program?.enabled || false}
            onChange={(e) =>
              updateFeatures({
                referral_program: {
                  ...features_config.referral_program,
                  enabled: e.target.checked,
                },
              })
            }
          />
          <Switch $checked={features_config.referral_program?.enabled || false} />
        </SwitchContainer>
      </Section>
    </Container>
  );
};

export default Step4DataRules;
