import { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';

// ============================================
// ANIMATIONS
// ============================================
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// ============================================
// INDUSTRY TEMPLATES CONFIGURATION
// ============================================
export const INDUSTRY_TEMPLATES = {
  coffee: {
    id: 'coffee',
    name: 'Cafeteria',
    icon: '☕',
    description: 'Perfecto para cafes y panaderias',
    example: 'Le Duo, Starbucks',
    color: '#6F4E37',
    // Pre-filled configuration
    config: {
      type: 'stamp',
      name: 'Mis Cafecitos',
      branding_config: {
        layout_mode: 'progressive',
        primary_color: '#6F4E37',
        background_color: '#6F4E37',
        label_color: '#FFFFFF',
        text_color: '#FFFFFF',
        stamp_inactive_color: '#D4A574',
        stamp_active_color: '#FFFFFF',
        barcode_type: 'qr',
      },
      rules_config: {
        target_stamps: 8,
        reward_name: 'Cafe Gratis',
        stamp_value: 1,
        auto_redeem: true,
      },
      features_config: {
        utm_tracking: true,
        referral_program: {
          enabled: false,
          reward_stamps: 1,
        },
      },
    },
  },
  dental: {
    id: 'dental',
    name: 'Consultorios o Clinicas',
    icon: '🩺',
    description: 'Nutriólogos, Clinicas dentales, etc',
    example: 'Consultorios, Clinicas',
    color: '#0EA5E9',
    config: {
      type: 'stamp',
      name: 'Mi Salud Dental',
      branding_config: {
        layout_mode: 'hero',
        primary_color: '#0EA5E9',
        background_color: '#0EA5E9',
        label_color: '#FFFFFF',
        text_color: '#FFFFFF',
        stamp_inactive_color: '#BAE6FD',
        stamp_active_color: '#FFFFFF',
        barcode_type: 'qr',
      },
      rules_config: {
        target_stamps: 6,
        reward_name: 'Limpieza Gratis',
        stamp_value: 1,
        auto_redeem: false,
      },
      features_config: {
        utm_tracking: true,
        referral_program: {
          enabled: true,
          reward_stamps: 2,
          referral_reward: 'Limpieza Dental Gratis',
        },
      },
      back_side_config: {
        description: 'Programa de lealtad para pacientes frecuentes. Acumula visitas y obtiene beneficios.',
      },
    },
  },
  retail: {
    id: 'retail',
    name: 'Retail / Abarrotes',
    icon: '🛒',
    description: 'Tiendas y supermercados',
    example: 'Fresh Market, Mini Super',
    color: '#22C55E',
    config: {
      type: 'stamp',
      name: 'Puntos Fresh',
      branding_config: {
        layout_mode: 'progressive',
        primary_color: '#22C55E',
        background_color: '#22C55E',
        label_color: '#FFFFFF',
        text_color: '#FFFFFF',
        stamp_inactive_color: '#86EFAC',
        stamp_active_color: '#FFFFFF',
        barcode_type: 'pdf417',
      },
      rules_config: {
        target_stamps: 10,
        reward_name: 'Descuento $50',
        stamp_value: 1,
        auto_redeem: true,
      },
      features_config: {
        utm_tracking: true,
        referral_program: {
          enabled: false,
          reward_stamps: 1,
        },
      },
    },
  },
  gym: {
    id: 'gym',
    name: 'Gimnasio / Club',
    icon: '💪',
    description: 'Gimnasios y clubes deportivos',
    example: 'Sport City, Smart Fit',
    color: '#8B5CF6',
    config: {
      type: 'membership',
      name: 'Membresia Premium',
      branding_config: {
        layout_mode: 'hero',
        primary_color: '#8B5CF6',
        background_color: '#8B5CF6',
        label_color: '#FFFFFF',
        text_color: '#FFFFFF',
        stamp_inactive_color: '#C4B5FD',
        stamp_active_color: '#FFFFFF',
        barcode_type: 'qr',
      },
      rules_config: {
        tiers: [
          { name: 'Basico', min_points: 0, benefits: ['Acceso gimnasio'] },
          { name: 'Premium', min_points: 1000, benefits: ['Clases grupales', 'Casillero'] },
          { name: 'VIP', min_points: 5000, benefits: ['Entrenador personal', 'Spa'] },
        ],
        initial_tier: 'Basico',
      },
      features_config: {
        utm_tracking: true,
        referral_program: {
          enabled: true,
          reward_stamps: 1,
          referral_reward: 'Mes Gratis',
        },
      },
      data_collection_config: {
        fields: [
          { name: 'first_name', required: true, enabled: true },
          { name: 'email', required: true, enabled: true },
          { name: 'phone', required: true, enabled: true },
          { name: 'birthday', required: false, enabled: true },
          { name: 'photo', required: false, enabled: true },
        ],
      },
    },
  },
  restaurant: {
    id: 'restaurant',
    name: 'Restaurante',
    icon: '🍽️',
    description: 'Restaurantes y fondas',
    example: 'La Casa de Toño',
    color: '#F59E0B',
    config: {
      type: 'stamp',
      name: 'Cliente Frecuente',
      branding_config: {
        layout_mode: 'grid',
        primary_color: '#F59E0B',
        background_color: '#F59E0B',
        label_color: '#FFFFFF',
        text_color: '#FFFFFF',
        stamp_inactive_color: '#FCD34D',
        stamp_active_color: '#FFFFFF',
        barcode_type: 'qr',
      },
      rules_config: {
        target_stamps: 10,
        reward_name: 'Comida Gratis',
        stamp_value: 1,
        auto_redeem: true,
      },
      features_config: {
        utm_tracking: true,
        referral_program: {
          enabled: false,
          reward_stamps: 1,
        },
      },
    },
  },
  salon: {
    id: 'salon',
    name: 'Salon de Belleza',
    icon: '💅',
    description: 'Esteticas y spas',
    example: 'Salon Beauty, Spa Relax',
    color: '#EC4899',
    config: {
      type: 'stamp',
      name: 'Beauty Rewards',
      branding_config: {
        layout_mode: 'hero',
        primary_color: '#EC4899',
        background_color: '#EC4899',
        label_color: '#FFFFFF',
        text_color: '#FFFFFF',
        stamp_inactive_color: '#F9A8D4',
        stamp_active_color: '#FFFFFF',
        barcode_type: 'qr',
      },
      rules_config: {
        target_stamps: 8,
        reward_name: 'Servicio Gratis',
        stamp_value: 1,
        auto_redeem: false,
      },
      features_config: {
        utm_tracking: true,
        referral_program: {
          enabled: true,
          reward_stamps: 2,
          referral_reward: 'Manicure Gratis',
        },
      },
    },
  },
  professional: {
    id: 'professional',
    name: 'Profesional / Servicios',
    icon: '💼',
    description: 'Abogados, Real Estate, Consultores',
    example: 'Abogados, Inmobiliarias',
    color: '#1E3A5F',
    config: {
      type: 'identity',
      name: 'Tarjeta de Presentacion',
      branding_config: {
        layout_mode: 'hero',
        primary_color: '#1E3A5F',
        background_color: '#1E3A5F',
        label_color: '#FFFFFF',
        text_color: '#FFFFFF',
        barcode_type: 'qr',
        show_stamps: false,
        show_points: false,
        hero_required: true,
        qr_content_type: 'vcard', // 'vcard' | 'url' | 'validation'
      },
      rules_config: {
        // No stamp rules for identity cards
      },
      features_config: {
        utm_tracking: true,
        referral_program: {
          enabled: false,
        },
      },
      data_collection_config: {
        fields: [
          { name: 'first_name', required: true, enabled: true },
          { name: 'last_name', required: true, enabled: true },
          { name: 'email', required: true, enabled: true },
          { name: 'phone', required: true, enabled: true },
          { name: 'job_title', required: false, enabled: true },
          { name: 'company', required: false, enabled: true },
          { name: 'photo', required: false, enabled: true },
        ],
      },
      identity_fields: {
        // Custom fields for business card
        field1: { label: 'Telefono', value: '' },
        field2: { label: 'Email', value: '' },
        field3: { label: 'Puesto', value: '' },
      },
    },
  },
  other: {
    id: 'other',
    name: 'Otro / Personalizado',
    icon: '⚡',
    description: 'Configura desde cero',
    example: 'Cualquier negocio',
    color: '#6366F1',
    config: {
      type: 'stamp',
      name: '',
      branding_config: {
        layout_mode: 'grid',
        primary_color: '#6366F1',
        background_color: '#6366F1',
        label_color: '#FFFFFF',
        text_color: '#FFFFFF',
        stamp_inactive_color: '#A5B4FC',
        stamp_active_color: '#FFFFFF',
        barcode_type: 'qr',
      },
      rules_config: {
        target_stamps: 10,
        reward_name: 'Recompensa',
        stamp_value: 1,
        auto_redeem: false,
      },
      features_config: {
        utm_tracking: true,
        referral_program: {
          enabled: false,
          reward_stamps: 1,
        },
      },
    },
  },
};

// ============================================
// STYLED COMPONENTS
// ============================================
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  animation: ${fadeIn} 0.4s ease-out;

  @media (max-width: 640px) {
    gap: 12px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.space.md};

  @media (max-width: 640px) {
    margin-bottom: ${({ theme }) => theme.space.sm};
  }
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.space.sm} 0;

  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.fontSizes.xl};
  }

  @media (max-width: 480px) {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    margin-bottom: ${({ theme }) => theme.space.xs};
  }
`;

const SectionDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  line-height: 1.5;

  @media (max-width: 480px) {
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: ${({ theme }) => theme.space.sm};
  }

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${({ theme }) => theme.space.sm};
  }

  @media (max-width: 380px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const TemplateCard = styled.button`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0px;
  background: ${({ $selected, $color, theme }) =>
    $selected
      ? `linear-gradient(135deg, ${$color}15 0%, ${$color}25 100%)`
      : theme.colors.backgroundAlt};
  border: 2px solid
    ${({ $selected, $color, theme }) =>
    $selected ? $color : theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.radii.xl};
  cursor: pointer;
  transition: all 0.25s ease;
  text-align: center;
  overflow: hidden;

  &:hover {
    border-color: ${({ $color }) => $color};
    transform: translateY(-4px);
    box-shadow: 0 12px 24px ${({ $color }) => $color}20;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${({ $color }) => $color}40;
  }

  ${({ $selected }) =>
    $selected &&
    css`
      animation: ${pulse} 0.3s ease;
    `}

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.space.lg} ${({ theme }) => theme.space.sm};
  }

  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.space.md} ${({ theme }) => theme.space.sm};
    border-radius: ${({ theme }) => theme.radii.lg};

    &:hover {
      transform: translateY(-2px);
    }
  }
`;

const TemplateIconWrapper = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${({ $color }) => $color}15;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.space.md};
  transition: all 0.25s ease;

  ${TemplateCard}:hover & {
    transform: scale(1.1);
    background: ${({ $color }) => $color}25;
  }

  @media (max-width: 768px) {
    width: 56px;
    height: 56px;
    margin-bottom: ${({ theme }) => theme.space.sm};
  }

  @media (max-width: 480px) {
    width: 48px;
    height: 48px;
    margin-bottom: 8px;
  }
`;

const TemplateIcon = styled.span`
  font-size: 32px;

  @media (max-width: 768px) {
    font-size: 28px;
  }

  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

const TemplateName = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.space.xs};

  @media (max-width: 480px) {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    margin-bottom: 4px;
  }
`;

const TemplateDescription = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.4;

  @media (max-width: 480px) {
    font-size: 11px;
    line-height: 1.3;
  }
`;

const SelectedBadge = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.space.sm};
  right: ${({ theme }) => theme.space.sm};
  background: ${({ $color }) => $color};
  color: white;
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px ${({ $color }) => $color}40;

  @media (max-width: 480px) {
    top: 4px;
    right: 4px;
    padding: 2px 6px;
    font-size: 10px;
    gap: 2px;
  }
`;

const CheckIcon = styled.span`
  font-size: 12px;
`;

const SelectedPreview = styled.div`
  margin-top: ${({ theme }) => theme.space.xl};
  padding: ${({ theme }) => theme.space.lg};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.xl};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  animation: ${fadeIn} 0.3s ease-out;

  @media (max-width: 768px) {
    margin-top: ${({ theme }) => theme.space.lg};
    padding: ${({ theme }) => theme.space.md};
  }

  @media (max-width: 480px) {
    margin-top: ${({ theme }) => theme.space.md};
    padding: ${({ theme }) => theme.space.sm};
    border-radius: ${({ theme }) => theme.radii.lg};
  }
`;

const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.md};
  margin-bottom: ${({ theme }) => theme.space.md};

  @media (max-width: 480px) {
    gap: ${({ theme }) => theme.space.sm};
    margin-bottom: ${({ theme }) => theme.space.sm};
  }
`;

const PreviewIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${({ $color }) => $color}15;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;

  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    font-size: 20px;
  }
`;

const PreviewInfo = styled.div`
  flex: 1;
`;

const PreviewTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 4px 0;

  @media (max-width: 480px) {
    font-size: ${({ theme }) => theme.fontSizes.md};
    margin-bottom: 2px;
  }
`;

const PreviewSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;

  @media (max-width: 480px) {
    font-size: ${({ theme }) => theme.fontSizes.xs};
  }
`;

const PreviewTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space.sm};

  @media (max-width: 480px) {
    gap: 6px;
  }
`;

const PreviewTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};

  @media (max-width: 480px) {
    padding: 4px 8px;
    gap: 4px;
    font-size: 10px;
  }
`;

const TagIcon = styled.span`
  font-size: 14px;
  background: ${({ theme }) =>
    theme === 'dark' ? '#34D399' : '#fff'
  }

  @media (max-width: 480px) { 
    font-size: 12px;
  }
`;

// ============================================
// MAIN COMPONENT
// ============================================
const Step1Template = ({ selectedTemplate, onSelectTemplate }) => {
  const templates = Object.values(INDUSTRY_TEMPLATES);
  const selected = INDUSTRY_TEMPLATES[selectedTemplate];

  const getLayoutLabel = (mode) => {
    switch (mode) {
      case 'grid': return 'Rejilla de Sellos';
      case 'progressive': return 'Imagen Progresiva';
      case 'hero': return 'Hero / Minimal';
      default: return mode;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'stamp': return 'Sellos';
      case 'membership': return 'Membresia';
      case 'coupon': return 'Cupon';
      case 'cashback': return 'Cashback';
      case 'identity': return 'Tarjeta de Presentacion';
      default: return type;
    }
  };

  return (
    <Container>
      <Header>
        <SectionTitle>Cual es tu giro de negocio?</SectionTitle>
        <SectionDescription>
          Selecciona una opcion y pre-configuraremos tu tarjeta de lealtad
        </SectionDescription>
      </Header>

      <TemplateGrid>
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            type="button"
            $selected={selectedTemplate === template.id}
            $color={template.color}
            onClick={() => onSelectTemplate(template.id)}
          >
            <TemplateIconWrapper $color={template.color}>
              <TemplateIcon>{template.icon}</TemplateIcon>
            </TemplateIconWrapper>
            <TemplateName>{template.name}</TemplateName>
            <TemplateDescription>{template.description}</TemplateDescription>
            {selectedTemplate === template.id && (
              <SelectedBadge $color={template.color}>
                <CheckIcon>✓</CheckIcon>
                Seleccionado
              </SelectedBadge>
            )}
          </TemplateCard>
        ))}
      </TemplateGrid>

      {/* Preview of selected template */}
      {selected && (
        <SelectedPreview>
          <PreviewHeader>
            <PreviewIcon $color={selected.color}>
              {selected.icon}
            </PreviewIcon>
            <PreviewInfo>
              <PreviewTitle>
                {selected.config.name || `Programa ${selected.name}`}
              </PreviewTitle>
              <PreviewSubtitle>
                Ejemplo: {selected.example}
              </PreviewSubtitle>
            </PreviewInfo>
          </PreviewHeader>
          <PreviewTags>
            <PreviewTag>
              <TagIcon>📋</TagIcon>
              {getTypeLabel(selected.config.type)}
            </PreviewTag>
            <PreviewTag>
              <TagIcon>🎨</TagIcon>
              {getLayoutLabel(selected.config.branding_config.layout_mode)}
            </PreviewTag>
            {selected.config.type === 'stamp' && (
              <PreviewTag>
                <TagIcon>🎯</TagIcon>
                {selected.config.rules_config.target_stamps} sellos para premio
              </PreviewTag>
            )}
            {selected.config.type === 'identity' && (
              <PreviewTag>
                <TagIcon>📇</TagIcon>
                Sin sistema de puntos
              </PreviewTag>
            )}
            {selected.config.features_config?.referral_program?.enabled && (
              <PreviewTag>
                <TagIcon>👥</TagIcon>
                Programa de Referidos
              </PreviewTag>
            )}
          </PreviewTags>
        </SelectedPreview>
      )}
    </Container>
  );
};

export default Step1Template;
