import { useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import {
  Instagram, Globe, Phone, Mail, MapPin, FileText, Megaphone,
  ChevronDown, ChevronUp, Link as LinkIcon, ExternalLink, Check,
  MessageCircle, Bell, Sparkles
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
// ============================================
// ANIMATIONS
// ============================================
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// ============================================
// MODERN GLASSMORPHISM STYLED COMPONENTS
// ============================================

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
`;

const SectionIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: ${({ $gradient }) => $gradient || 'linear-gradient(135deg, #6366f1, #8b5cf6)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px ${({ $shadowColor }) => $shadowColor || 'rgba(99, 102, 241, 0.3)'};
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: ${({ $isDark }) => $isDark ? 'white' : '#1F2937'};
  margin: 0;
  letter-spacing: -0.3px;
`;

const SectionDescription = styled.p`
  font-size: 12px;
  color: ${({ $isDark }) => $isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(31, 41, 55, 0.6)'};
  margin: 0 0 16px 42px;
`;

const ConfigCard = styled.div`
  background: ${({ $isDark }) => 
    $isDark 
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)'
      : 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.02) 100%)'};\n  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${({ $isDark }) => $isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(99, 102, 241, 0.2)'};\n  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${({ $isDark }) => $isDark ? '0 8px 32px rgba(0, 0, 0, 0.12)' : '0 4px 16px rgba(99, 102, 241, 0.1)'};

  &:hover {
    border-color: ${({ $isDark }) => $isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(99, 102, 241, 0.4)'};
    transform: translateY(-2px);
    box-shadow: ${({ $isDark }) => $isDark ? '0 12px 40px rgba(0, 0, 0, 0.15)' : '0 8px 24px rgba(99, 102, 241, 0.15)'};
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  cursor: pointer;
  background: ${({ $expanded, $accentColor, $isDark }) =>
    $expanded
      ? `${$accentColor}${$isDark ? '15' : '08'}`
      : 'transparent'};
  border-bottom: 1px solid ${({ $expanded, $isDark }) =>
    $expanded ? ($isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(99, 102, 241, 0.15)') : 'transparent'};
  transition: all 0.25s ease;

  &:hover {
    background: ${({ $accentColor, $isDark }) => `${$accentColor}${$isDark ? '10' : '06'}`};
  }
`;

const CardHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const CardIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: ${({ $gradient }) => $gradient || 'linear-gradient(135deg, #6366f1, #8b5cf6)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 6px 20px ${({ $shadowColor }) => $shadowColor || 'rgba(99, 102, 241, 0.35)'};
  transition: all 0.3s ease;
`;

const CardTitleGroup = styled.div``;

const CardTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: ${({ $isDark }) => $isDark ? 'white' : '#1F2937'};
  margin: 0;
  letter-spacing: -0.2px;
`;

const CardSubtitle = styled.p`
  font-size: 12px;
  color: ${({ $isDark }) => $isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(31, 41, 55, 0.6)'};
  margin: 3px 0 0;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 600;
  background: ${({ $active }) =>
    $active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  color: ${({ $active }) =>
    $active ? '#10B981' : 'rgba(255, 255, 255, 0.4)'};
  border: 1px solid ${({ $active }) =>
    $active ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
`;

const ExpandIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: ${({ $isDark }) => $isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(99, 102, 241, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $isDark }) => $isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(99, 102, 241, 0.6)'};
  transition: all 0.25s ease;
  transform: ${({ $expanded }) => $expanded ? 'rotate(180deg)' : 'rotate(0)'};
`;

const CardBody = styled.div`
  max-height: ${({ $expanded }) => $expanded ? '800px' : '0'};
  opacity: ${({ $expanded }) => $expanded ? 1 : 0};
  overflow: hidden;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  padding: ${({ $expanded }) => $expanded ? '20px' : '0 20px'};
  animation: ${({ $expanded }) => $expanded ? fadeIn : 'none'} 0.3s ease;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: ${({ $isDark }) => $isDark ? 'rgba(255, 255, 255, 0.8)' : '#374151'};
  letter-spacing: 0.3px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const LabelHint = styled.span`
  font-size: 10px;
  font-weight: 400;
  color: ${({ $isDark }) => $isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(31, 41, 55, 0.5)'};
  margin-left: auto;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputPrefix = styled.span`
  position: absolute;
  left: 14px;
  font-size: 13px;
  color: ${({ $isDark }) => $isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(31, 41, 55, 0.5)'};
  pointer-events: none;
  white-space: nowrap;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  padding-left: ${({ $hasPrefix }) => $hasPrefix ? '160px' : '16px'};
  border-radius: 12px;
  border: 1px solid ${({ $isDark }) => $isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(99, 102, 241, 0.2)'};
  font-size: 14px;
  font-weight: 500;
  background: ${({ $isDark }) => $isDark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.8)'};
  color: ${({ $isDark }) => $isDark ? 'white' : '#1F2937'};
  transition: all 0.25s ease;

  &:focus {
    background: ${({ $isDark }) => $isDark ? 'rgba(0, 0, 0, 0.4)' : 'white'};
    border-color: #11B981;
    outline: none;
    box-shadow: 0 0 0 4px rgba(17, 185, 129, 0.15);
  }

  &::placeholder {
    color: ${({ $isDark }) => $isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(31, 41, 55, 0.4)'};
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid ${({ $isDark }) => $isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(99, 102, 241, 0.2)'};
  font-size: 14px;
  font-weight: 500;
  background: ${({ $isDark }) => $isDark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.8)'};
  color: ${({ $isDark }) => $isDark ? 'white' : '#1F2937'};
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  line-height: 1.6;
  transition: all 0.25s ease;

  &:focus {
    background: ${({ $isDark }) => $isDark ? 'rgba(0, 0, 0, 0.4)' : 'white'};
    border-color: #11B981;
    outline: none;
    box-shadow: 0 0 0 4px rgba(17, 185, 129, 0.15);
  }

  &::placeholder {
    color: ${({ $isDark }) => $isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(31, 41, 55, 0.4)'};
  }
`;

const TwoColGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const HelpText = styled.span`
  font-size: 11px;
  color: ${({ $isDark }) => $isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(31, 41, 55, 0.6)'};
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PreviewTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: ${({ $isDark }) => 
    $isDark 
      ? 'linear-gradient(135deg, rgba(17, 185, 129, 0.15), rgba(17, 185, 129, 0.05))'
      : 'linear-gradient(135deg, rgba(17, 185, 129, 0.1), rgba(17, 185, 129, 0.05))'};
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  color: #10B981;
  margin-top: 10px;
  border: 1px solid ${({ $isDark }) => 
    $isDark 
      ? 'rgba(17, 185, 129, 0.2)' 
      : 'rgba(17, 185, 129, 0.3)'};
`;

const PreviewIcon = styled.span`
  font-size: 14px;
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ $isDark }) => 
    $isDark
      ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)'
      : 'linear-gradient(90deg, transparent, rgba(99,102,241,0.2), transparent)'};
  margin: 8px 0;
`;

const QuickTip = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: ${({ $isDark }) => 
    $isDark
      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05))'
      : 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.04))'};
  border-radius: 12px;
  border: 1px solid ${({ $isDark }) => $isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.3)'};
  margin-top: 16px;
`;

const TipIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: rgba(99, 102, 241, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #818CF8;
  flex-shrink: 0;
`;

const TipContent = styled.div`
  flex: 1;
`;

const TipTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #A5B4FC;
  margin-bottom: 4px;
`;

const TipText = styled.div`
  font-size: 11px;
  color: ${({ $isDark }) => $isDark ? 'rgba(255, 255, 255, 0.6)' : '#6B7280'};
  line-height: 1.5;
`;

// ============================================
// MAIN COMPONENT
// ============================================

const Step3Content = ({
  formState,
  updateField,
  updateBackSide,
  updateBranding,
}) => {
  const { back_side_config, branding_config } = formState;
  const { isDark } = useTheme();
  const [expandedCards, setExpandedCards] = useState({
    social: true,
    contact: false,
    legal: false,
    news: false,
  });

  const toggleCard = (cardId) => {
    setExpandedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  // Check if section has content
  const hasSocialContent = branding_config.instagram_user || branding_config.tiktok_user ||
    branding_config.website_url || branding_config.menu_url;
  const hasContactContent = back_side_config.issuer_details?.phone ||
    back_side_config.issuer_details?.email || back_side_config.issuer_details?.address;
  const hasLegalContent = back_side_config.description || back_side_config.terms_text;
  const hasNewsContent = back_side_config.news_title || back_side_config.news_body;

  // Auto-generate back fields from social inputs
  const updateSocialField = (field, value) => {
    const updates = { [field]: value };

    // Also update back_side_config with formatted links
    const currentLinks = back_side_config.links || [];
    const socialLinks = [];

    // Build social links array
    const instagram = field === 'instagram_user' ? value : branding_config.instagram_user;
    const tiktok = field === 'tiktok_user' ? value : branding_config.tiktok_user;
    const website = field === 'website_url' ? value : branding_config.website_url;
    const menu = field === 'menu_url' ? value : branding_config.menu_url;

    if (instagram) {
      socialLinks.push({
        id: 'instagram',
        label: `@${instagram}`,
        url: `https://instagram.com/${instagram}`,
        type: 'social'
      });
    }
    if (tiktok) {
      socialLinks.push({
        id: 'tiktok',
        label: `@${tiktok}`,
        url: `https://tiktok.com/@${tiktok}`,
        type: 'social'
      });
    }
    if (website) {
      socialLinks.push({
        id: 'website',
        label: 'Sitio Web',
        url: website.startsWith('http') ? website : `https://${website}`,
        type: 'link'
      });
    }
    if (menu) {
      socialLinks.push({
        id: 'menu',
        label: 'Ver Menu',
        url: menu.startsWith('http') ? menu : `https://${menu}`,
        type: 'link'
      });
    }

    // Merge with non-social links
    const nonSocialLinks = currentLinks.filter(l => !['instagram', 'tiktok', 'website', 'menu'].includes(l.id));

    updateBranding(updates);
    updateBackSide({ links: [...socialLinks, ...nonSocialLinks] });
  };

  return (
    <Container>
      {/* Card A: Social & Links */}
      <ConfigCard $isDark={isDark}>
        <CardHeader
          onClick={() => toggleCard('social')}
          $expanded={expandedCards.social}
          $accentColor="#E1306C"
          $isDark={isDark}
        >
          <CardHeaderLeft>
            <CardIcon
              $gradient="linear-gradient(135deg, #E1306C, #F77737)"
              $shadowColor="rgba(225, 48, 108, 0.35)"
            >
              <Instagram size={20} />
            </CardIcon>
            <CardTitleGroup>
              <CardTitle $isDark={isDark}>Enlaces y Redes Sociales</CardTitle>
              <CardSubtitle $isDark={isDark}>Instagram, TikTok, Sitio Web, Menu</CardSubtitle>
            </CardTitleGroup>
          </CardHeaderLeft>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <StatusBadge $active={hasSocialContent}>
              {hasSocialContent ? <><Check size={10} /> Configurado</> : 'Opcional'}
            </StatusBadge>
            <ExpandIcon $expanded={expandedCards.social} $isDark={isDark}>
              <ChevronDown size={18} />
            </ExpandIcon>
          </div>
        </CardHeader>

        <CardBody $expanded={expandedCards.social}>
          <TwoColGrid>
            <InputGroup>
              <Label $isDark={isDark}>
                <Instagram size={14} />
                Instagram
              </Label>
              <InputWrapper>
                <InputPrefix $isDark={isDark}>instagram.com/</InputPrefix>
                <Input
                  $hasPrefix
                  $isDark={isDark}
                  value={branding_config.instagram_user || ''}
                  onChange={(e) => updateSocialField('instagram_user', e.target.value)}
                  placeholder="tuusuario"
                />
              </InputWrapper>
              {branding_config.instagram_user && (
                <PreviewTag $isDark={isDark}>
                  <PreviewIcon>📸</PreviewIcon>
                  @{branding_config.instagram_user}
                </PreviewTag>
              )}
            </InputGroup>

            <InputGroup>
              <Label $isDark={isDark}>
                <MessageCircle size={14} />
                TikTok
              </Label>
              <InputWrapper>
                <InputPrefix $isDark={isDark}>tiktok.com/@</InputPrefix>
                <Input
                  $hasPrefix
                  $isDark={isDark}
                  value={branding_config.tiktok_user || ''}
                  onChange={(e) => updateSocialField('tiktok_user', e.target.value)}
                  placeholder="tuusuario"
                />
              </InputWrapper>
              {branding_config.tiktok_user && (
                <PreviewTag $isDark={isDark}>
                  <PreviewIcon>🎵</PreviewIcon>
                  @{branding_config.tiktok_user}
                </PreviewTag>
              )}
            </InputGroup>
          </TwoColGrid>

          <InputGroup>
            <Label $isDark={isDark}>
              <Globe size={14} />
              Sitio Web
              <LabelHint $isDark={isDark}>Se muestra como boton</LabelHint>
            </Label>
            <Input
              $isDark={isDark}
              value={branding_config.website_url || ''}
              onChange={(e) => updateSocialField('website_url', e.target.value)}
              placeholder="https://www.tunegocio.com"
            />
          </InputGroup>

          <InputGroup>
            <Label $isDark={isDark}>
              <ExternalLink size={14} />
              Menu / Catalogo Digital
            </Label>
            <Input
              $isDark={isDark}
              value={branding_config.menu_url || ''}
              onChange={(e) => updateSocialField('menu_url', e.target.value)}
              placeholder="https://menu.tunegocio.com"
            />
            <HelpText $isDark={isDark}>
              <Sparkles size={12} />
              Aparece como boton interactivo en el reverso del pase
            </HelpText>
          </InputGroup>
        </CardBody>
      </ConfigCard>

      {/* Card B: Contact & Location */}
      <ConfigCard $isDark={isDark}>
        <CardHeader
          onClick={() => toggleCard('contact')}
          $expanded={expandedCards.contact}
          $accentColor="#10B981"
          $isDark={isDark}
        >
          <CardHeaderLeft>
            <CardIcon
              $gradient="linear-gradient(135deg, #10B981, #059669)"
              $shadowColor="rgba(16, 185, 129, 0.35)"
            >
              <Phone size={20} />
            </CardIcon>
            <CardTitleGroup>
              <CardTitle $isDark={isDark}>Contacto y Ubicacion</CardTitle>
              <CardSubtitle $isDark={isDark}>Telefono, Email, Direccion fisica</CardSubtitle>
            </CardTitleGroup>
          </CardHeaderLeft>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <StatusBadge $active={hasContactContent}>
              {hasContactContent ? <><Check size={10} /> Configurado</> : 'Opcional'}
            </StatusBadge>
            <ExpandIcon $expanded={expandedCards.contact} $isDark={isDark}>
              <ChevronDown size={18} />
            </ExpandIcon>
          </div>
        </CardHeader>

        <CardBody $expanded={expandedCards.contact}>
          <TwoColGrid>
            <InputGroup>
              <Label $isDark={isDark}>
                <Phone size={14} />
                Telefono
              </Label>
              <Input
                $isDark={isDark}
                type="tel"
                value={back_side_config.issuer_details?.phone || ''}
                onChange={(e) => updateBackSide({
                  issuer_details: {
                    ...back_side_config.issuer_details,
                    phone: e.target.value,
                  }
                })}
                placeholder="+52 55 1234 5678"
              />
              {back_side_config.issuer_details?.phone && (
                <PreviewTag $isDark={isDark}>
                  <Phone size={12} />
                  Tap para llamar
                </PreviewTag>
              )}
            </InputGroup>

            <InputGroup>
              <Label $isDark={isDark}>
                <Mail size={14} />
                Email
              </Label>
              <Input
                $isDark={isDark}
                type="email"
                value={back_side_config.issuer_details?.email || ''}
                onChange={(e) => updateBackSide({
                  issuer_details: {
                    ...back_side_config.issuer_details,
                    email: e.target.value,
                  }
                })}
                placeholder="hola@tunegocio.com"
              />
            </InputGroup>
          </TwoColGrid>

          <InputGroup>
            <Label $isDark={isDark}>
              <MapPin size={14} />
              Direccion Fisica
            </Label>
            <Textarea
              $isDark={isDark}
              rows={2}
              value={back_side_config.issuer_details?.address || ''}
              onChange={(e) => updateBackSide({
                issuer_details: {
                  ...back_side_config.issuer_details,
                  address: e.target.value,
                }
              })}
              placeholder="Calle, Numero, Colonia, Ciudad, CP"
              style={{ minHeight: '70px' }}
            />
            <HelpText $isDark={isDark}>
              <MapPin size={12} />
              Abre automaticamente en Google Maps al tocar
            </HelpText>
          </InputGroup>
        </CardBody>
      </ConfigCard>

      {/* Card C: Legal & Terms */}
      <ConfigCard $isDark={isDark}>
        <CardHeader
          onClick={() => toggleCard('legal')}
          $expanded={expandedCards.legal}
          $accentColor="#6B7280"
          $isDark={isDark}
        >
          <CardHeaderLeft>
            <CardIcon
              $gradient="linear-gradient(135deg, #6B7280, #4B5563)"
              $shadowColor="rgba(107, 114, 128, 0.35)"
            >
              <FileText size={20} />
            </CardIcon>
            <CardTitleGroup>
              <CardTitle $isDark={isDark}>Legal y Descripcion</CardTitle>
              <CardSubtitle $isDark={isDark}>Terminos, condiciones y detalles</CardSubtitle>
            </CardTitleGroup>
          </CardHeaderLeft>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <StatusBadge $active={hasLegalContent}>
              {hasLegalContent ? <><Check size={10} /> Configurado</> : 'Recomendado'}
            </StatusBadge>
            <ExpandIcon $expanded={expandedCards.legal} $isDark={isDark}>
              <ChevronDown size={18} />
            </ExpandIcon>
          </div>
        </CardHeader>

        <CardBody $expanded={expandedCards.legal}>
          <InputGroup>
            <Label $isDark={isDark}>
              Descripcion del Programa
              <LabelHint $isDark={isDark}>Visible al cliente</LabelHint>
            </Label>
            <Textarea
              $isDark={isDark}
              value={back_side_config.description || ''}
              onChange={(e) => updateBackSide({ description: e.target.value })}
              placeholder="Describe brevemente tu programa de lealtad y los beneficios que ofreces a tus clientes..."
              style={{ minHeight: '90px' }}
            />
          </InputGroup>

          <Divider $isDark={isDark} />

          <InputGroup>
            <Label $isDark={isDark}>
              Terminos y Condiciones
            </Label>
            <Textarea
              $isDark={isDark}
              value={back_side_config.terms_text || ''}
              onChange={(e) => updateBackSide({ terms_text: e.target.value })}
              placeholder="Los puntos/sellos acumulados no tienen valor en efectivo. La tarjeta es personal e intransferible. El negocio se reserva el derecho de modificar las condiciones del programa en cualquier momento..."
              style={{ minHeight: '120px' }}
            />
            <HelpText $isDark={isDark}>
              Aparece en el reverso bajo "Terminos y Condiciones"
            </HelpText>
          </InputGroup>
        </CardBody>
      </ConfigCard>

      {/* Card D: News & Messages */}
      <ConfigCard $isDark={isDark}>
        <CardHeader
          onClick={() => toggleCard('news')}
          $expanded={expandedCards.news}
          $accentColor="#F59E0B"
          $isDark={isDark}
        >
          <CardHeaderLeft>
            <CardIcon
              $gradient="linear-gradient(135deg, #F59E0B, #D97706)"
              $shadowColor="rgba(245, 158, 11, 0.35)"
            >
              <Megaphone size={20} />
            </CardIcon>
            <CardTitleGroup>
              <CardTitle $isDark={isDark}>Novedades y Promociones</CardTitle>
              <CardSubtitle $isDark={isDark}>Mensajes destacados para tus clientes</CardSubtitle>
            </CardTitleGroup>
          </CardHeaderLeft>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <StatusBadge $active={hasNewsContent}>
              {hasNewsContent ? <><Check size={10} /> Activo</> : 'Opcional'}
            </StatusBadge>
            <ExpandIcon $expanded={expandedCards.news} $isDark={isDark}>
              <ChevronDown size={18} />
            </ExpandIcon>
          </div>
        </CardHeader>

        <CardBody $expanded={expandedCards.news}>
          <InputGroup>
            <Label $isDark={isDark}>
              <Bell size={14} />
              Titulo del Mensaje
            </Label>
            <Input
              $isDark={isDark}
              value={back_side_config.news_title || ''}
              onChange={(e) => updateBackSide({ news_title: e.target.value })}
              placeholder="Ej: Promocion de Temporada"
            />
          </InputGroup>

          <InputGroup>
            <Label $isDark={isDark}>
              Contenido del Mensaje
            </Label>
            <Textarea
              $isDark={isDark}
              value={back_side_config.news_body || ''}
              onChange={(e) => updateBackSide({ news_body: e.target.value })}
              placeholder="Ej: Aprovecha nuestras promociones especiales durante todo enero. 2x1 en cafes todos los lunes!"
              style={{ minHeight: '90px' }}
            />
          </InputGroup>

          <InputGroup>
            <Label $isDark={isDark}>
              Fecha de Expiracion
              <LabelHint $isDark={isDark}>Opcional</LabelHint>
            </Label>
            <Input
              $isDark={isDark}
              type="date"
              value={back_side_config.news_expires || ''}
              onChange={(e) => updateBackSide({ news_expires: e.target.value })}
            />
          </InputGroup>

          <QuickTip $isDark={isDark}>
            <TipIcon>
              <Sparkles size={14} />
            </TipIcon>
            <TipContent>
              <TipTitle>Consejo Pro</TipTitle>
              <TipText $isDark={isDark}>
                Puedes actualizar este mensaje en cualquier momento y se reflejara automaticamente
                en los pases de todos tus clientes sin necesidad de que hagan nada.
              </TipText>
            </TipContent>
          </QuickTip>
        </CardBody>
      </ConfigCard>
    </Container>
  );
};

export default Step3Content;
