import { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Settings as SettingsIcon,
  Building,
  Palette,
  Image,
  Save,
  Check,
} from 'lucide-react';
import { useOrganization } from '../../context/OrganizationContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const Settings = () => {
  const { organization, updateOrganization } = useOrganization();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    primary_color: '#6366F1',
    secondary_color: '#4F46E5',
    logo_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewLogo, setPreviewLogo] = useState(null);

  // Cargar datos de la organización
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        primary_color: organization.primary_color || '#bebfff',
        secondary_color: organization.secondary_color || '#4F46E5',
        logo_url: organization.logo_url || '',
      });
      setPreviewLogo(organization.logo_url);
    }
  }, [organization]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('El archivo es muy grande. Máximo 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setPreviewLogo(base64);
        handleChange('logo_url', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    const { error } = await updateOrganization({
      name: formData.name,
      primary_color: formData.primary_color,
      secondary_color: formData.secondary_color,
      logo_url: formData.logo_url,
    });

    setSaving(false);

    if (error) {
      alert('Error al guardar: ' + error);
    } else {
      setSaved(true);
      // El ThemeProvider se actualiza automáticamente porque
      // updateOrganization actualiza el estado en OrganizationContext
    }
  };

  const presetColors = [
    { primary: '#6366F1', secondary: '#4F46E5', name: 'Índigo' },
    { primary: '#EC4899', secondary: '#DB2777', name: 'Rosa' },
    { primary: '#10B981', secondary: '#059669', name: 'Esmeralda' },
    { primary: '#F59E0B', secondary: '#D97706', name: 'Ámbar' },
    { primary: '#EF4444', secondary: '#DC2626', name: 'Rojo' },
    { primary: '#8B5CF6', secondary: '#7C3AED', name: 'Violeta' },
    { primary: '#06B6D4', secondary: '#0891B2', name: 'Cyan' },
    { primary: '#1a1a1a', secondary: '#0a0a0a', name: 'Oscuro' },
  ];

  return (
    <Container>
      <PageHeader>
        <div>
          <PageTitle>
            <SettingsIcon size={24} />
            Configuración
          </PageTitle>
          <PageSubtitle>
            Personaliza la apariencia de tu programa de lealtad
          </PageSubtitle>
        </div>
        <Button onClick={handleSave} loading={saving} disabled={saving}>
          {saved ? (
            <>
              <Check size={16} />
              Guardado
            </>
          ) : (
            <>
              <Save size={16} />
              Guardar cambios
            </>
          )}
        </Button>
      </PageHeader>

      <SettingsGrid>
        {/* Información del Negocio */}
        <Section>
          <SectionHeader>
            <SectionIcon>
              <Building size={20} />
            </SectionIcon>
            <SectionTitle>Información del Negocio</SectionTitle>
          </SectionHeader>

          <SectionContent>
            <Input
              label="Nombre del negocio"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Mi Negocio"
            />
          </SectionContent>
        </Section>

        {/* Logo */}
        <Section>
          <SectionHeader>
            <SectionIcon>
              <Image size={20} />
            </SectionIcon>
            <SectionTitle>Logo</SectionTitle>
          </SectionHeader>

          <SectionContent>
            <LogoUploadArea>
              <LogoPreview>
                {previewLogo ? (
                  <LogoImage src={previewLogo} alt="Logo" />
                ) : (
                  <LogoPlaceholder>
                    {formData.name?.charAt(0) || 'F'}
                  </LogoPlaceholder>
                )}
              </LogoPreview>

              <LogoUploadInfo>
                <LogoUploadTitle>Logo del negocio</LogoUploadTitle>
                <LogoUploadDesc>
                  PNG, JPG o GIF. Máximo 2MB. Se recomienda 512x512px.
                </LogoUploadDesc>
                <LogoUploadButton as="label">
                  Subir imagen
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{ display: 'none' }}
                  />
                </LogoUploadButton>
              </LogoUploadInfo>
            </LogoUploadArea>
          </SectionContent>
        </Section>

        {/* Colores */}
        <Section $fullWidth>
          <SectionHeader>
            <SectionIcon>
              <Palette size={20} />
            </SectionIcon>
            <SectionTitle>Colores de Marca</SectionTitle>
          </SectionHeader>

          <SectionContent>
            <ColorDescription>
              Estos colores se aplicarán a tu dashboard y tarjetas de lealtad.
              Los cambios se reflejan en tiempo real.
            </ColorDescription>

            <ColorsRow>
              <ColorPicker>
                <ColorLabel>Color Primario</ColorLabel>
                <ColorInputWrapper>
                  <ColorInput
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                  />
                  <ColorValue>{formData.primary_color}</ColorValue>
                </ColorInputWrapper>
              </ColorPicker>

              <ColorPicker>
                <ColorLabel>Color Secundario</ColorLabel>
                <ColorInputWrapper>
                  <ColorInput
                    type="color"
                    value={formData.secondary_color}
                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                  />
                  <ColorValue>{formData.secondary_color}</ColorValue>
                </ColorInputWrapper>
              </ColorPicker>
            </ColorsRow>

            <PresetSection>
              <PresetLabel>Paletas predefinidas:</PresetLabel>
              <PresetGrid>
                {presetColors.map((preset) => (
                  <PresetCard
                    key={preset.name}
                    $active={
                      formData.primary_color === preset.primary &&
                      formData.secondary_color === preset.secondary
                    }
                    onClick={() => {
                      handleChange('primary_color', preset.primary);
                      handleChange('secondary_color', preset.secondary);
                    }}
                  >
                    <PresetColors>
                      <PresetColor $color={preset.primary} />
                      <PresetColor $color={preset.secondary} />
                    </PresetColors>
                    <PresetName>{preset.name}</PresetName>
                  </PresetCard>
                ))}
              </PresetGrid>
            </PresetSection>
          </SectionContent>
        </Section>

        {/* Vista previa */}
        <Section $fullWidth>
          <SectionHeader>
            <SectionTitle>Vista Previa</SectionTitle>
          </SectionHeader>

          <PreviewContainer>
            <PreviewCard $bgColor={formData.primary_color}>
              <PreviewCardHeader>
                {previewLogo ? (
                  <PreviewLogo src={previewLogo} alt="Logo" />
                ) : (
                  <PreviewLogoPlaceholder $color={formData.secondary_color}>
                    {formData.name?.charAt(0) || 'F'}
                  </PreviewLogoPlaceholder>
                )}
                <PreviewCardTitle>{formData.name || 'Mi Negocio'}</PreviewCardTitle>
              </PreviewCardHeader>

              <PreviewCardBody>
                <PreviewPoints>
                  <PreviewPointsLabel>Tus puntos</PreviewPointsLabel>
                  <PreviewPointsValue>7 / 10</PreviewPointsValue>
                </PreviewPoints>

                <PreviewProgressBar>
                  <PreviewProgressFill style={{ width: '70%' }} />
                </PreviewProgressBar>

                <PreviewReward>
                  🎁 Recompensa: Café gratis
                </PreviewReward>
              </PreviewCardBody>
            </PreviewCard>

            <PreviewDescription>
              Así se verá tu tarjeta de lealtad en Apple/Google Wallet
            </PreviewDescription>
          </PreviewContainer>
        </Section>
      </SettingsGrid>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.space.xl};
  gap: ${({ theme }) => theme.space.md};
  flex-wrap: wrap;
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

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.space.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.section`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  overflow: hidden;
  grid-column: ${({ $fullWidth }) => ($fullWidth ? '1 / -1' : 'auto')};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm};
  padding: ${({ theme }) => theme.space.md} ${({ theme }) => theme.space.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const SectionIcon = styled.div`
  color: ${({ theme }) => theme.colors.primary};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  margin: 0;
`;

const SectionContent = styled.div`
  padding: ${({ theme }) => theme.space.lg};
`;

const LogoUploadArea = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.lg};
`;

const LogoPreview = styled.div`
  width: 80px;
  height: 80px;
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  flex-shrink: 0;
`;

const LogoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const LogoPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const LogoUploadInfo = styled.div``;

const LogoUploadTitle = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  margin-bottom: ${({ theme }) => theme.space.xs};
`;

const LogoUploadDesc = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
  margin-bottom: ${({ theme }) => theme.space.sm};
`;

const LogoUploadButton = styled.button`
  display: inline-block;
  padding: ${({ theme }) => theme.space.xs} ${({ theme }) => theme.space.md};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const ColorDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.space.lg};
`;

const ColorsRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.xl};
  flex-wrap: wrap;
  margin-bottom: ${({ theme }) => theme.space.xl};
`;

const ColorPicker = styled.div``;

const ColorLabel = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  margin-bottom: ${({ theme }) => theme.space.sm};
`;

const ColorInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm};
`;

const ColorInput = styled.input`
  width: 56px;
  height: 56px;
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

const PresetSection = styled.div``;

const PresetLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
  margin-bottom: ${({ theme }) => theme.space.sm};
`;

const PresetGrid = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.sm};
  flex-wrap: wrap;
`;

const PresetCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.space.xs};
  padding: ${({ theme }) => theme.space.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 2px solid ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const PresetColors = styled.div`
  display: flex;
  gap: 2px;
`;

const PresetColor = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: ${({ $color }) => $color};
`;

const PresetName = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const PreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.space.xl};
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border-radius: ${({ theme }) => theme.radii.md};
`;

const PreviewCard = styled.div`
  width: 280px;
  background: ${({ $bgColor }) => $bgColor};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
`;

const PreviewCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm};
  padding: ${({ theme }) => theme.space.md};
`;

const PreviewLogo = styled.img`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.md};
  object-fit: cover;
`;

const PreviewLogoPlaceholder = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ $color }) => $color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const PreviewCardTitle = styled.div`
  color: white;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const PreviewCardBody = styled.div`
  padding: ${({ theme }) => theme.space.md};
`;

const PreviewPoints = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.space.md};
`;

const PreviewPointsLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const PreviewPointsValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: white;
`;

const PreviewProgressBar = styled.div`
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  margin-bottom: ${({ theme }) => theme.space.md};
`;

const PreviewProgressFill = styled.div`
  height: 100%;
  background: white;
  border-radius: 2px;
`;

const PreviewReward = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.space.sm};
  background: rgba(255, 255, 255, 0.15);
  border-radius: ${({ theme }) => theme.radii.md};
  color: white;
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const PreviewDescription = styled.p`
  margin-top: ${({ theme }) => theme.space.lg};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: rgba(255, 255, 255, 0.6);
`;

export default Settings;
