import styled, { css } from 'styled-components';
import { useState } from 'react';
import SmartCode from '../ui/SmartCode';
import { Crown, User, Mail, Phone, Globe, MapPin } from 'lucide-react';

// CRITICAL: Import the unified StripCanvas for visual parity with Studio
import StripCanvas from '../strip-studio/StripCanvas';

// ============================================
// 1. MATH & LOGIC (Auto-Contrast)
// ============================================

// Detecta si el fondo es oscuro o claro para poner texto blanco o negro (Regla Apple HIG)
const getContrastYIQ = (hexcolor) => {
  if (!hexcolor) return 'black';
  const r = parseInt(hexcolor.substr(1, 2), 16);
  const g = parseInt(hexcolor.substr(3, 2), 16);
  const b = parseInt(hexcolor.substr(5, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#FFFFFF';
};

// Helpers para etiquetas de campos
const getFieldLabel = (fieldType) => {
  switch (fieldType) {
    case 'customer_name': return 'TITULAR';
    case 'status': return 'ESTATUS';
    case 'points': return 'PUNTOS';
    case 'stamps': return 'SELLOS';
    case 'expiry': return 'VENCIMIENTO';
    default: return '';
  }
};

const getFieldValue = (fieldType, data) => {
  const { customerName, isGoldActive, currentProgress, totalStamps } = data;
  switch (fieldType) {
    case 'customer_name': return customerName;
    case 'status': return isGoldActive ? 'Gold VIP' : 'Activo';
    case 'points': return `${currentProgress * 100} pts`;
    case 'stamps': return `${currentProgress} / ${totalStamps}`;
    case 'expiry': return 'Sin Vencimiento';
    default: return '';
  }
};

// ============================================
// 2. COMPONENT
// ============================================

const CardPreviewApple = ({
  programType = 'stamp',
  businessName = 'Mi Negocio',
  designConfig = {},
  logicRules = {},
  currentProgress = 0,
  customerName = 'Cliente',
  identityFields = {},
  isFlipped = false,
  activeFocusField = null,
  backSideConfig = {},
  stripRef = null,
}) => {
  const isIdentity = programType === 'identity' || designConfig.template_mode === 'identity';
  const totalStamps = parseInt(logicRules.target_stamps || 8);

  // --- GOLD MODE ---
  const goldModeEnabled = logicRules.gold_mode_enabled || designConfig.gold_mode_enabled || false;
  const goldTriggerThreshold = logicRules.gold_trigger_threshold || totalStamps;
  const goldActiveColor = designConfig.gold_active_color || '#dcbb00ff';
  const isGoldActive = goldModeEnabled && currentProgress >= goldTriggerThreshold;

  // --- COLORS (Apple Controlled) ---
  const baseBgColor = designConfig.background_color || '#2c2c2e';
  const bgColor = isGoldActive ? goldActiveColor : baseBgColor;
  const textColor = getContrastYIQ(bgColor);
  const labelOpacity = 0.65;

  // --- IMAGES ---
  const images = {
    logo: designConfig.logo_url,
    profile: designConfig.profile_photo_url,
  };

  const getOpacity = (section) => {
    if (!activeFocusField || activeFocusField === 'card') return 1;
    const map = { logo: 'header', header: 'header', strip: 'strip', hero: 'strip', fields: 'fields', barcode: 'barcode' };
    const target = map[activeFocusField] || 'all';
    return (target === section || target === 'all') ? 1 : 0.3;
  };

  // --- IDENTITY MODE CONTENT (Legacy) ---
  const renderIdentityContent = () => (
    <IdentityWrapper>
      <div className="info">
        <Label $color={textColor} $op={labelOpacity}>{identityFields.label_1 || 'MIEMBRO'}</Label>
        <Value $color={textColor} $size="big">{customerName}</Value>
        <div style={{ marginTop: 12 }}>
          <Label $color={textColor} $op={labelOpacity}>{identityFields.label_2 || 'NIVEL'}</Label>
          <Value $color={textColor}>{identityFields.level || 'Básico'}</Value>
        </div>
      </div>
      <div className="photo">
        {images.profile ? <img src={images.profile} alt="profile" /> : <User size={32} color={textColor} />}
      </div>
    </IdentityWrapper>
  );

  // --- PROFESSIONAL MODE CONTENT (Business Card - Attlas Style) ---
  const renderProfessionalContent = () => {
    const professionalData = {
      name: designConfig.professional_title || businessName,
      title: designConfig.professional_subtitle || 'PROFESIONAL',
      email: designConfig.professional_email || '',
      phone: designConfig.professional_phone || '',
      website: designConfig.qr_custom_url || '',
      description: designConfig.description || designConfig.about_text || '',
    };

    return (
      <ProfessionalBody>
        <ProfessionalTopRow>
          <ProfessionalHeaderLabel $color={textColor}>BUSINESS CARD</ProfessionalHeaderLabel>
        </ProfessionalTopRow>

        <ProfessionalHero>
          <div className="text-content">
            <ProfessionalName $color={textColor}>
              {professionalData.name}
            </ProfessionalName>
            <ProfessionalTitle $color={textColor}>
              {professionalData.title}
            </ProfessionalTitle>
          </div>

          <ProfessionalAvatar>
            {images.profile ? (
              <img src={images.profile} alt="profile" />
            ) : (
              <div className="placeholder">
                <User size={32} color={textColor} />
              </div>
            )}
          </ProfessionalAvatar>
        </ProfessionalHero>

        {professionalData.description && (
          <ProfessionalAbout $color={textColor}>
            <h3>SOBRE MÍ</h3>
            <p>{professionalData.description}</p>
          </ProfessionalAbout>
        )}

        <ProfessionalContactList>
          {professionalData.email && (
            <ContactItem $color={textColor}>
              <Mail size={14} />
              <span>{professionalData.email}</span>
            </ContactItem>
          )}
          {professionalData.phone && (
            <ContactItem $color={textColor}>
              <Phone size={14} />
              <span>{professionalData.phone}</span>
            </ContactItem>
          )}
        </ProfessionalContactList>
      </ProfessionalBody>
    );
  };

  return (
    <Scene>
      <Card3D $flipped={isFlipped}>
        {/* --- FRONT SIDE --- */}
        <Face $bg={bgColor} $isGold={isGoldActive}>

          {
            designConfig.show_header === false && isGoldActive && <GoldBadge><Crown size={14} /></GoldBadge>
          }

          {/* 1. HEADER */}
          <Header style={{ opacity: getOpacity('header') }}>
            <div className="logo-col">
              {images.logo && <img src={images.logo} alt="logo" />}
              {!isIdentity && <span style={{ color: textColor }}>{designConfig.logo_text || businessName}</span>}
              {/* In Identity mode, we show just logo, text is inside body or hidden to be cleaner */}
              {isIdentity && <span style={{ color: textColor, fontSize: 14, opacity: 0.8 }}>{designConfig.logo_text || businessName}</span>}
            </div>
            {/* Lógica Header Puntos vs Sellos */}
            {designConfig.show_header !== false && !isIdentity && (
              <div className="score-col">
                <Label $color={textColor} $op={labelOpacity}>
                  {designConfig.header_label || 'PUNTOS'}
                </Label>
                <Value $color={textColor}>
                  {designConfig.header_symbol || ''}
                  {(designConfig.header_right_type === 'stamps') ? currentProgress : currentProgress}
                </Value>
              </div>
            )}
          </Header>

          {/* 2. STRIP or PROFESSIONAL CONTENT */}
          {isIdentity ? (
            // Professional/Identity mode - show business card layout instead of strip
            <div style={{ opacity: getOpacity('strip'), flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {renderProfessionalContent()}
            </div>
          ) : (
            // Normal mode - show StripCanvas with stamps
            <>
              <StripContainer style={{ opacity: getOpacity('strip') }}>
                <StripCanvas
                  ref={stripRef}
                  brandingConfig={designConfig}
                  rulesConfig={logicRules}
                  currentProgress={currentProgress}
                  scale={1}
                />
              </StripContainer>

              {/* 3. BODY - Fields */}
              <BodyContainer style={{ opacity: getOpacity('fields') }}>
                <FieldsRow $hasCenter={designConfig.field_center_type && designConfig.field_center_type !== 'none'}>
                  {designConfig.field_left_type !== 'none' && (
                    <div className="field">
                      <Label $color={textColor} $op={labelOpacity} style={{ fontSize: '15px' }}>{getFieldLabel(designConfig.field_left_type)}</Label>
                      <Value $color={textColor} style={{ fontSize: '12px' }}>{getFieldValue(designConfig.field_left_type, { customerName, isGoldActive, currentProgress, totalStamps })}</Value>
                    </div>
                  )}
                  {designConfig.field_center_type && designConfig.field_center_type !== 'none' && (
                    <div className="field center">
                      <Label style={{ fontSize: '15px' }} $color={textColor} $op={labelOpacity}>{getFieldLabel(designConfig.field_center_type)}</Label>
                      <Value $color={textColor} style={{ fontSize: '12px' }}>{getFieldValue(designConfig.field_center_type, { customerName, isGoldActive, currentProgress, totalStamps })}</Value>
                    </div>
                  )}
                  {designConfig.field_right_type !== 'none' && (
                    <div className="field right">
                      <Label style={{ fontSize: '15px' }} $color={textColor} $op={labelOpacity}>{getFieldLabel(designConfig.field_right_type)}</Label>
                      <Value $color={textColor} style={{ fontSize: '12px' }}>{getFieldValue(designConfig.field_right_type, { customerName, isGoldActive, currentProgress, totalStamps })}</Value>
                    </div>
                  )}
                </FieldsRow>
              </BodyContainer>
            </>
          )}

          {/* 4. QR CODE */}
          <BarcodeWrapper style={{ opacity: getOpacity('barcode') }}>
            <div className="white-box">
              <SmartCode
                value={
                  (designConfig.qr_mode === 'custom' && designConfig.qr_custom_url)
                    ? designConfig.qr_custom_url
                    : "630120-816-306" // Sample client code
                }
                format="qr_code"
                size={100}
              />
              <div className="code-text">
                {(designConfig.qr_mode === 'custom' && designConfig.qr_custom_url)
                  ? designConfig.qr_custom_url.replace(/(^\w+:|^)\/\//, '').split('/')[0]
                  : "630120-816-306"
                }
              </div>
            </div>
          </BarcodeWrapper>
        </Face>

        {/* --- BACK SIDE --- */}
        <Face $back $bg="#000000">
          <BackSideContainer>
            <BackContent>
              {backSideConfig?.links?.filter(l => l.type === 'social').length > 0 && (
                <BackSection>
                  <BackSectionHeader>📱 SIGUE LA CONVERSACIÓN</BackSectionHeader>
                  {backSideConfig.links.filter(l => l.type === 'social').map((link, i) => (
                    <BackLinkRow key={i}>
                      <BackLinkLabel>{link.id === 'instagram' ? '📸 Instagram:' : '🎵 TikTok:'}</BackLinkLabel>
                      <BackFieldLink href={link.url} target="_blank">{link.url}</BackFieldLink>
                    </BackLinkRow>
                  ))}
                  {backSideConfig.links.filter(l => l.id === 'menu').map((link, i) => (
                    <BackLinkRow key={`menu-${i}`}>
                      <BackLinkLabel>📋 Menú Digital:</BackLinkLabel>
                      <BackFieldLink href={link.url} target="_blank">{link.url}</BackFieldLink>
                    </BackLinkRow>
                  ))}
                </BackSection>
              )}
              {backSideConfig?.news_title && (
                <BackSection>
                  <BackSectionHeader>🔔 NOVEDADES</BackSectionHeader>
                  <BackFieldValue>{backSideConfig.news_body || backSideConfig.news_title}</BackFieldValue>
                </BackSection>
              )}
              {backSideConfig?.description && (
                <BackSection>
                  <BackSectionHeader>🙌 TU TARJETA {businessName.toUpperCase()}</BackSectionHeader>
                  <BackFieldValue>{backSideConfig.description}</BackFieldValue>
                </BackSection>
              )}
              <BackSection>
                <BackSectionHeader>👤 TITULAR</BackSectionHeader>
                <BackFieldValue>{customerName}</BackFieldValue>
              </BackSection>
              {(backSideConfig?.issuer_details?.phone || backSideConfig?.issuer_details?.address) && (
                <BackSection>
                  <BackSectionHeader>📞 CONTACTO</BackSectionHeader>
                  {backSideConfig.issuer_details?.phone && <BackFieldValue>Tel: {backSideConfig.issuer_details.phone}</BackFieldValue>}
                </BackSection>
              )}
              <BackSection>
                <BackFieldValue style={{ opacity: 0.5 }}>© {new Date().getFullYear()} {businessName}</BackFieldValue>
              </BackSection>
            </BackContent>
            <BackFooter>
              <BackFieldLink href="https://www.fidelify.mx" target="_blank">www.fidelify.mx</BackFieldLink>
            </BackFooter>
          </BackSideContainer>
        </Face>
      </Card3D>
    </Scene>
  );
};

// ============================================
// 3. STYLES (Pixel Perfect HIG)
// ============================================

const Scene = styled.div`width: 320px; height: 520px; perspective: 1000px;`;
const Card3D = styled.div`width: 100%; height: 100%; position: relative; transform-style: preserve-3d; transition: transform 0.6s; transform: ${({ $flipped }) => $flipped ? 'rotateY(180deg)' : 'none'};`;
const Face = styled.div`position: absolute; width: 100%; height: 100%; backface-visibility: hidden; background: ${({ $bg }) => $bg}; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.25); display: flex; flex-direction: column; ${({ $back }) => $back && css`transform: rotateY(180deg);`}`;
const GoldBadge = styled.div`position: absolute; top: 12px; right: 12px; background: linear-gradient(135deg, #FFD700, #FFA500); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; z-index: 50; box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);`;

const Header = styled.div`
  display: flex; 
  justify-content: space-between; 
  align-items: flex-start; 
  padding: 14px 14px 4px 14px; 
  z-index: 2; 
  transition: opacity 0.2s;
  height: 60px;

  .logo-col { 
    display: flex; 
    align-items: center; 
    gap: 6px; 
    img { height: 28px; width: auto; object-fit: contain; } 
    span { font-weight: 600; font-size: 16px; color: white; } 
  } 
  .score-col { text-align: right; }`;
const Label = styled.div`font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 11px; font-weight: 600; text-transform: uppercase; color: ${({ $color }) => $color}; opacity: ${({ $op }) => $op}; letter-spacing: 0.5px; margin-bottom: 1px;`;
const Value = styled.div`font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: ${({ $size }) => $size === 'big' ? '22px' : '17px'}; font-weight: 400; color: ${({ $color }) => $color};`;

// Strip container - wraps StripCanvas with proper sizing
const StripContainer = styled.div`
  width: 100%;
  position: relative;
  overflow: hidden;
  transition: opacity 0.2s;

  /* StripCanvas handles its own aspect ratio, but we ensure proper containment */
  & > div {
    width: 100%;
  }
`;

const BodyContainer = styled.div`flex: 1; padding: 10px 14px; display: flex; flex-direction: column; gap: 15px; transition: opacity 0.2s;`;
const FieldsRow = styled.div`
  display: flex;
  justify-content: space-between;
  .field { flex: 1; }
  .field.center { text-align: center; }
  .field.right { text-align: right; }
`;
const IdentityWrapper = styled.div`display: flex; justify-content: space-between; align-items: flex-start; margin-top: 5px; padding: 10px; max-width: 80%; margin-left: auto; margin-right: auto; .info { flex: 1; padding-right: 12px; } .photo { width: 56px; height: 56px; min-width: 56px; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; border-radius: 6px; img { width: 100%; height: 100%; object-fit: cover; border-radius: 6px; } }`;

// ============================================
// PROFESSIONAL BUSINESS CARD STYLES
// ============================================

const ProfessionalBody = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 20px 20px 20px;
  flex: 1;
`;

const ProfessionalTopRow = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
`;

const ProfessionalHeaderLabel = styled.span`
    font-size: 10px;
    letter-spacing: 1px;
    font-weight: 700;
    opacity: 0.5;
    color: ${({ $color }) => $color};
    text-transform: uppercase;
    border: 1px solid ${({ $color }) => $color};
    padding: 2px 6px;
    border-radius: 4px;
`;

const ProfessionalHero = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;

  .text-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
  }
`;

const ProfessionalName = styled.h2`
  font-family: 'Inter Tight', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: ${({ $color }) => $color};
  margin: 0;
  line-height: 1;
  letter-spacing: -1px;
`;

const ProfessionalTitle = styled.p`
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${({ $color }) => $color};
  opacity: 0.6;
  margin: 6px 0 0 0;
  letter-spacing: 0.5px;
`;

const ProfessionalAbout = styled.div`
    margin-bottom: 24px;
    
    h3 {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        color: ${({ $color }) => $color};
        opacity: 0.4;
        margin: 0 0 6px 0;
        letter-spacing: 1px;
    }

    p {
        font-size: 13px;
        line-height: 1.4;
        color: ${({ $color }) => $color};
        opacity: 0.85;
        margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
`;

const ProfessionalContactList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: auto;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: ${({ $color }) => $color};
  
  svg {
    opacity: 0.5;
    flex-shrink: 0;
  }
  
  span {
      font-weight: 500;
      opacity: 0.9;
  }
`;

const ProfessionalAvatar = styled.div`
  width: 64px;
  height: 64px;
  min-width: 64px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.1);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
  }
`;

const BarcodeWrapper = styled.div`
  padding: 10px 14px 14px 14px;
  background: transparent;
  display: flex;
  justify-content: center;
  transition: opacity 0.2s;
  
  .white-box {
    background: white;
    width: 100%;
    max-width: 180px;
    margin: 0 auto;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  }
  
  .code-text {
    margin-top: 8px;
    font-family: 'SF Mono', 'Menlo', monospace;
    font-size: 10px;
    color: #000;
    letter-spacing: 0.5px;
  }
`;

const BackSideContainer = styled.div`display: flex; flex-direction: column; height: 100%; padding: 0; color: white; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif; background: #000000;`;
const BackContent = styled.div`flex: 1; overflow-y: auto; padding: 12px 16px; &::-webkit-scrollbar { width: 4px; } &::-webkit-scrollbar-track { background: transparent; } &::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 2px; }`;
const BackSection = styled.div`padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); &:last-child { border-bottom: none; }`;
const BackSectionHeader = styled.div`font-size: 13px; font-weight: 600; color: #ffffff; margin-bottom: 8px;`;
const BackLinkRow = styled.div`display: flex; flex-direction: column; margin-bottom: 6px; &:last-child { margin-bottom: 0; }`;
const BackLinkLabel = styled.span`font-size: 13px; color: rgba(255, 255, 255, 0.7);`;
const BackFieldValue = styled.div`font-size: 14px; color: white; line-height: 1.5;`;
const BackFieldLink = styled.a`font-size: 14px; color: #0a84ff; text-decoration: none; word-break: break-all; &:hover { text-decoration: underline; }`;
const BackTermsText = styled.div`font-size: 11px; color: rgba(255, 255, 255, 0.5); line-height: 1.5;`;
const BackFooter = styled.div`padding: 12px 16px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1);`;

export default CardPreviewApple;