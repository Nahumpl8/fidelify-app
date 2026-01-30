import { useState } from 'react';
import styled from 'styled-components';
import PhoneMockup from '../../components/pass-builder/PhoneMockup';
import PassPreview from '../../components/pass-builder/PassPreview';

/**
 * Builder: Página del constructor de pases
 * Pantalla dividida: Formulario (izq) | Vista previa (der)
 */
const Builder = () => {
  // Estado del pase - se actualiza en tiempo real
  const [passConfig, setPassConfig] = useState({
    businessName: 'Mi Cafetería',
    programName: 'Programa Café Lovers',
    color: '#6366F1',
    textColor: '#FFFFFF',
    logoUrl: '',
    rewardText: 'Café gratis',
    targetPoints: 10,
    currentPoints: 3,
  });

  // Handler genérico para actualizar campos
  const handleChange = (field, value) => {
    setPassConfig((prev) => ({ ...prev, [field]: value }));
  };

  // Handler para subida de logo
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('logoUrl', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Container>
      {/* Panel izquierdo: Formulario */}
      <FormPanel>
        <FormHeader>
          <Title>Constructor de Pases</Title>
          <Subtitle>
            Personaliza tu tarjeta de lealtad en tiempo real
          </Subtitle>
        </FormHeader>

        <Form>
          {/* Sección: Información del Negocio */}
          <Section>
            <SectionTitle>Información del Negocio</SectionTitle>

            <FormGroup>
              <Label htmlFor="businessName">Nombre del Negocio</Label>
              <Input
                id="businessName"
                type="text"
                value={passConfig.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                placeholder="Ej: La Cafetería de Ana"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="programName">Nombre del Programa</Label>
              <Input
                id="programName"
                type="text"
                value={passConfig.programName}
                onChange={(e) => handleChange('programName', e.target.value)}
                placeholder="Ej: Programa Café Lovers"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="logo">Logo del Negocio</Label>
              <FileInputWrapper>
                <FileInput
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
                <FileInputLabel htmlFor="logo">
                  {passConfig.logoUrl ? 'Cambiar logo' : 'Subir logo'}
                </FileInputLabel>
                {passConfig.logoUrl && (
                  <LogoPreview src={passConfig.logoUrl} alt="Logo preview" />
                )}
              </FileInputWrapper>
            </FormGroup>
          </Section>

          {/* Sección: Diseño */}
          <Section>
            <SectionTitle>Diseño</SectionTitle>

            <ColorRow>
              <FormGroup>
                <Label htmlFor="color">Color de Fondo</Label>
                <ColorInputWrapper>
                  <ColorInput
                    id="color"
                    type="color"
                    value={passConfig.color}
                    onChange={(e) => handleChange('color', e.target.value)}
                  />
                  <ColorValue>{passConfig.color}</ColorValue>
                </ColorInputWrapper>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="textColor">Color del Texto</Label>
                <ColorInputWrapper>
                  <ColorInput
                    id="textColor"
                    type="color"
                    value={passConfig.textColor}
                    onChange={(e) => handleChange('textColor', e.target.value)}
                  />
                  <ColorValue>{passConfig.textColor}</ColorValue>
                </ColorInputWrapper>
              </FormGroup>
            </ColorRow>

            <PresetColors>
              <PresetLabel>Colores predefinidos:</PresetLabel>
              <PresetList>
                {[
                  '#6366F1',
                  '#EC4899',
                  '#10B981',
                  '#F59E0B',
                  '#EF4444',
                  '#8B5CF6',
                  '#06B6D4',
                  '#1a1a1a',
                ].map((preset) => (
                  <PresetButton
                    key={preset}
                    $color={preset}
                    $active={passConfig.color === preset}
                    onClick={() => handleChange('color', preset)}
                    type="button"
                  />
                ))}
              </PresetList>
            </PresetColors>
          </Section>

          {/* Sección: Recompensas */}
          <Section>
            <SectionTitle>Programa de Recompensas</SectionTitle>

            <FormGroup>
              <Label htmlFor="rewardText">Recompensa</Label>
              <Input
                id="rewardText"
                type="text"
                value={passConfig.rewardText}
                onChange={(e) => handleChange('rewardText', e.target.value)}
                placeholder="Ej: Café gratis, 20% descuento"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="targetPoints">
                Puntos necesarios: {passConfig.targetPoints}
              </Label>
              <RangeInput
                id="targetPoints"
                type="range"
                min="5"
                max="20"
                value={passConfig.targetPoints}
                onChange={(e) =>
                  handleChange('targetPoints', parseInt(e.target.value))
                }
              />
              <RangeLabels>
                <span>5</span>
                <span>20</span>
              </RangeLabels>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="currentPoints">
                Puntos de prueba: {passConfig.currentPoints}
              </Label>
              <RangeInput
                id="currentPoints"
                type="range"
                min="0"
                max={passConfig.targetPoints}
                value={passConfig.currentPoints}
                onChange={(e) =>
                  handleChange('currentPoints', parseInt(e.target.value))
                }
              />
            </FormGroup>
          </Section>

          <SaveButton type="button">
            Guardar y Generar Pase
          </SaveButton>
        </Form>
      </FormPanel>

      {/* Panel derecho: Vista previa */}
      <PreviewPanel>
        <PreviewLabel>Vista previa en tiempo real</PreviewLabel>
        <PhoneMockup>
          <PassPreview
            color={passConfig.color}
            textColor={passConfig.textColor}
            logoUrl={passConfig.logoUrl}
            businessName={passConfig.businessName}
            programName={passConfig.programName}
            rewardText={passConfig.rewardText}
            targetPoints={passConfig.targetPoints}
            currentPoints={passConfig.currentPoints}
          />
        </PhoneMockup>
      </PreviewPanel>
    </Container>
  );
};

// === Styled Components ===

const Container = styled.div`
  display: flex;
  min-height: 100vh;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    flex-direction: column;
  }
`;

const FormPanel = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.space.xl};
  overflow-y: auto;
  max-height: 100vh;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    max-height: none;
    order: 2;
  }
`;

const FormHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.space.xl};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  margin-bottom: ${({ theme }) => theme.space.xs};
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xl};
`;

const Section = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.space.lg};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  margin-bottom: ${({ theme }) => theme.space.md};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.space.md};

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.space.xs};
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.space.sm} ${({ theme }) => theme.space.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const FileInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.md};
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  padding: ${({ theme }) => theme.space.sm} ${({ theme }) => theme.space.md};
  background: ${({ theme }) => theme.colors.background};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const LogoPreview = styled.img`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.md};
  object-fit: cover;
`;

const ColorRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.space.md};
`;

const ColorInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm};
`;

const ColorInput = styled.input`
  width: 48px;
  height: 48px;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  padding: 0;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  &::-webkit-color-swatch {
    border: 2px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.md};
  }
`;

const ColorValue = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const PresetColors = styled.div`
  margin-top: ${({ theme }) => theme.space.md};
`;

const PresetLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const PresetList = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.sm};
  margin-top: ${({ theme }) => theme.space.sm};
  flex-wrap: wrap;
`;

const PresetButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ $color }) => $color};
  border: 2px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.text.primary : 'transparent'};
  cursor: pointer;
  transition: transform ${({ theme }) => theme.transitions.fast};

  &:hover {
    transform: scale(1.1);
  }
`;

const RangeInput = styled.input`
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  background: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.full};
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 50%;
    cursor: pointer;
    transition: transform ${({ theme }) => theme.transitions.fast};

    &:hover {
      transform: scale(1.1);
    }
  }
`;

const RangeLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: ${({ theme }) => theme.space.xs};
`;

const SaveButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.space.md};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text.inverse};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  border-radius: ${({ theme }) => theme.radii.lg};
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const PreviewPanel = styled.div`
  flex: 1;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.text.primary} 0%,
    #2a2a2a 100%
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.space.xl};
  position: sticky;
  top: 0;
  height: 100vh;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    position: relative;
    height: auto;
    min-height: 700px;
    order: 1;
  }
`;

const PreviewLabel = styled.span`
  color: rgba(255, 255, 255, 0.6);
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.space.lg};
`;

export default Builder;
