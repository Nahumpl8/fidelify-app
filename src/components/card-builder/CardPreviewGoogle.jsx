import styled, { css, keyframes } from 'styled-components';
import { useState } from 'react';
import SmartCode from '../ui/SmartCode';
import { Menu, MoreVertical } from 'lucide-react';

// CRITICAL: Import the unified StripCanvas for visual parity with Studio
import StripCanvas from '../strip-studio/StripCanvas';

// Google Wallet colored icon (stacked cards design)
const GoogleWalletIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    {/* Blue card (back) */}
    <rect x="3" y="4" width="18" height="11" rx="2" fill="#4285F4" />
    {/* Yellow card (middle) */}
    <rect x="3" y="7" width="18" height="11" rx="2" fill="#FBBC05" />
    {/* Red card (front-middle) */}
    <rect x="3" y="10" width="18" height="11" rx="2" fill="#EA4335" />
    {/* Green card (front) */}
    <rect x="3" y="13" width="18" height="8" rx="2" fill="#34A853" />
  </svg>
);

// Grid of 9 dots (Google app drawer)
const GridDotsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#5F6368">
    <circle cx="6" cy="6" r="2" />
    <circle cx="12" cy="6" r="2" />
    <circle cx="18" cy="6" r="2" />
    <circle cx="6" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="18" cy="12" r="2" />
    <circle cx="6" cy="18" r="2" />
    <circle cx="12" cy="18" r="2" />
    <circle cx="18" cy="18" r="2" />
  </svg>
);

// ============================================
// ANIMATIONS
// ============================================
const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.3); }
  50% { box-shadow: 0 0 40px rgba(255, 255, 255, 0.5); }
`;

// Field Configuration Helpers
const getFieldValue = (fieldType, data) => {
  const { customerName, isGoldActive, currentProgress, statusName, totalStamps } = data;
  switch (fieldType) {
    case 'customer_name': return customerName;
    case 'status': return isGoldActive ? '✨ Gold VIP' : statusName;
    case 'points': return `${currentProgress * 10} pts`;
    case 'stamps': return `${currentProgress} / ${totalStamps}`;
    case 'expiry': return 'Sin Vencimiento';
    default: return '';
  }
};

/**
 * CardPreviewGoogle - "Fresh Market" Style within Google App Shell
 */
const CardPreviewGoogle = ({
  programType = 'stamp',
  businessName = 'Mi Negocio',
  designConfig = {},
  logicRules = {},
  currentProgress = 3,
  customerName = 'Cliente Demo',
  isFlipped = false,
  activeFocusField = null,
  backSideConfig = {},
  isApple = false,
  stripRef = null,
}) => {
  // Rules
  const target = logicRules.target_stamps || logicRules.target || 8;
  const statusName = logicRules.status_name || 'Miembro';

  // Gold Mode
  const goldModeEnabled = logicRules.gold_mode_enabled || designConfig.gold_mode_enabled || false;
  const goldModeThreshold = logicRules.gold_trigger_threshold || designConfig.gold_mode_threshold || target;
  const goldModeColor = designConfig.gold_active_color || designConfig.gold_mode_color || '#FFD700';
  const isGoldModeActive = goldModeEnabled && currentProgress >= goldModeThreshold;

  // Colors
  const baseBackgroundColor = designConfig.background_color || designConfig.colors?.background || '#1F1F1F'; // Dark default for Fresh Market style
  const effectiveBackground = isGoldModeActive ? goldModeColor : baseBackgroundColor;

  // Images
  const logoUrl = designConfig.logo_url || designConfig.images?.logo;

  // SPOTLIGHT logic
  const isSpotlit = (sectionId) => {
    if (!activeFocusField) return false;
    const map = {
      logo: ['logo'],
      colors: ['card'],
      strip: ['footer'],
      stamps: ['footer'],
      fields: ['info'],
      barcode: ['qr'],
    };
    return (map[activeFocusField] || []).includes(sectionId);
  };

  const getOpacity = (sectionId) => {
    if (!activeFocusField || ['colors', 'goldMode'].includes(activeFocusField)) return 1;
    return isSpotlit(sectionId) ? 1 : 0.25;
  };

  return (
    <Container3D>
      <Inner $flipped={isFlipped}>

        {/* ============================================================== */}
        {/* FRONT - Google Wallet APP INTERFACE (White BG + Header)        */}
        {/* ============================================================== */}
        <Face>
          <GoogleAppShell>
            {/* 1. APP HEADER (Menu, Logo, Grid, Profile) */}
            <AppHeader>
              <HeaderLeft>
                <Menu size={24} color="#5F6368" strokeWidth={2} />
                <GoogleLogoWrapper>
                  <GoogleWalletIcon />
                  <span>Google Wallet</span>
                </GoogleLogoWrapper>
              </HeaderLeft>
              <HeaderRight>
                <GridDotsIcon />
                <AvatarCircle>A</AvatarCircle>
              </HeaderRight>
            </AppHeader>

            {/* 2. THE PASS CARD (Floating with Shadow) */}
            <CardWrapper>
              <PassCard $gold={isGoldModeActive}>

                {/* TOP HALF: Dark BG + Info + QR */}
                <TopSection $bg={effectiveBackground}>
                  {/* Logo + Business Name Row */}
                  <HeaderRow style={{ opacity: getOpacity('logo') }}>
                    <LogoCircle $spotlit={isSpotlit('logo')}>
                      {logoUrl ? <LogoImg src={logoUrl} /> : businessName.charAt(0)}
                    </LogoCircle>
                    <BusinessName>{businessName}</BusinessName>
                  </HeaderRow>

                  {/* Large Program Title */}
                  <ProgramTitle>
                    Recompensas {businessName}
                  </ProgramTitle>

                  {/* Points and Stamps Row */}
                  <DataRow style={{ opacity: getOpacity('info') }}>
                    <DataColumn>
                      <Label>Puntos</Label>
                      <Value style={{
                        fontSize: '24px', textAlign: 'left'
                      }}>{currentProgress * 10}</Value>
                    </DataColumn>
                    <DataColumn style={{ alignItems: 'flex-end' }}>
                      <Label>Sellos</Label>
                      <Value style={{
                        fontSize: '24px', textAlign: 'right'
                      }}>{currentProgress}/{target}</Value>
                    </DataColumn>
                  </DataRow>

                  {/* QR Code */}
                  <QRWrapper style={{ opacity: getOpacity('qr') }}>
                    <QRBox $spotlit={isSpotlit('qr')}>
                      <SmartCode
                        value={
                          (designConfig.qr_mode === 'custom' && designConfig.qr_custom_url)
                            ? designConfig.qr_custom_url
                            : "630120-816-306" // Sample client code
                        }
                        format="qr_code"
                        size={120}
                      />
                    </QRBox>
                    <QRText>
                      {(designConfig.qr_mode === 'custom' && designConfig.qr_custom_url)
                        ? designConfig.qr_custom_url.replace(/(^\w+:|^)\/\//, '').split('/')[0]
                        : "630120-816-306"
                      }
                    </QRText>
                  </QRWrapper>
                </TopSection>

                {/* BOTTOM HALF: The Strip (Stamps) */}
                <BottomSection $isApple={isApple}>
                  <StripCanvas
                    ref={stripRef}
                    brandingConfig={designConfig}
                    rulesConfig={logicRules}
                    currentProgress={currentProgress}
                    scale={1}
                  />
                </BottomSection>

              </PassCard>
            </CardWrapper>

          </GoogleAppShell>
        </Face>

        {/* ============================================================== */}
        {/* BACK - Google Details View                                     */}
        {/* ============================================================== */}
        <Face $back>
          <GoogleBackCard>
            <GoogleBackHeader>
              <div onClick={() => { }} style={{ cursor: 'pointer' }}>✕</div>
              <MoreVertical size={20} />
            </GoogleBackHeader>
            <GoogleBackContent>
              {/* Member Info Section */}
              <GoogleTextModule>
                <GoogleModuleLabel>Nombre de miembro</GoogleModuleLabel>
                <GoogleModuleValue>{customerName}</GoogleModuleValue>
                <GoogleModuleSubvalue>{currentProgress}/{target} sellos • {currentProgress * 10} pts</GoogleModuleSubvalue>
              </GoogleTextModule>

              <GoogleTextModule>
                <GoogleModuleLabel>ID de miembro</GoogleModuleLabel>
                <GoogleModuleValue>7712618092</GoogleModuleValue>
              </GoogleTextModule>

              {backSideConfig?.news_title && (
                <GoogleTextModule>
                  <GoogleModuleHeader>
                    <div>
                      <GoogleModuleLabel>Mensaje: {backSideConfig.news_title}</GoogleModuleLabel>
                      {backSideConfig.news_body && (
                        <GoogleModuleBody>{backSideConfig.news_body}</GoogleModuleBody>
                      )}
                    </div>
                    <GoogleExpandIcon>▼</GoogleExpandIcon>
                  </GoogleModuleHeader>
                </GoogleTextModule>
              )}

              <GoogleDivider />

              {/* Action Buttons */}
              {backSideConfig?.issuer_details?.phone && (
                <GoogleActionRow href="#">
                  <GoogleActionIcon>📞</GoogleActionIcon>
                  <GoogleActionLabel>Llamar a {businessName}</GoogleActionLabel>
                </GoogleActionRow>
              )}

              <GoogleActionRow href="#" target="_blank">
                <GoogleActionIcon>🌐</GoogleActionIcon>
                <GoogleActionLabel>Visitar sitio web</GoogleActionLabel>
              </GoogleActionRow>

              <GoogleDivider />

              <GoogleDisclaimer>
                Se está usando la tarjeta de lealtad en las herramientas de Google.
                <br /><br />
                <GoogleDisclaimerLink href="#">Datos de pases de Google</GoogleDisclaimerLink>
              </GoogleDisclaimer>
            </GoogleBackContent>
          </GoogleBackCard>
        </Face>
      </Inner>
    </Container3D>
  );
};

// ============================================
// STYLES - APP SHELL & CARD
// ============================================

const Container3D = styled.div`
  width: 395px;
  height: 760px; /* Taller for modern phones */
  perspective: 1000px;
`;

const Inner = styled.div`
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.8s;
  transform: ${({ $flipped }) => $flipped ? 'rotateY(180deg)' : 'rotateY(0)'};
  box-shadow: 0 20px 40px rgba(0,0,0,1);
`;

const Face = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  border: 4px solid #111; /* Mockup bezel */
  background: white;
  ${({ $back }) => $back && css`transform: rotateY(180deg);`}
`;

// --- APP SHELL (THE UI) ---
const GoogleAppShell = styled.div`
  width: 100%;
  height: 100%;
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
`;

const AppHeader = styled.div`
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #FFFFFF;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const GoogleLogoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  span {
    font-family: 'Google Sans', 'Roboto', sans-serif;
    font-size: 18px;
    color: #5F6368;
    font-weight: 400;
  }
`;

const AvatarCircle = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #7C4DFF;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Google Sans', 'Roboto', sans-serif;
`;

// --- THE FLOATING CARD ---
const CardWrapper = styled.div`
  flex: 1;
  padding: 8px 16px 16px 16px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
`;

const PassCard = styled.div`
  width: 100%;
  min-height: 500px;
  background: white;
  border-radius: 24px;
  margin-top: 20px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
`;

// --- TOP SECTION (DARK INFO) ---
const TopSection = styled.div`
  background: ${({ $bg }) => $bg};
  padding: 20px 24px;
  color: white;
  display: flex;
  flex-direction: column;
  flex: 1;
  border-radius: 24px 24px 0 0;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const LogoCircle = styled.div`
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 50%;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  ${({ $spotlit }) => $spotlit && css`animation: ${pulseGlow} 1.5s infinite;`}
`;

const LogoImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
`;

const BusinessName = styled.div`
  font-size: 16px;
  font-weight: 400;
  color: white;
`;

const ProgramTitle = styled.h1`
  font-size: 28px;
  font-weight: 400;
  color: white;
  margin: 16px 0 24px 0;
  line-height: 1.2;
`;

const DataRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const DataColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.span`
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 4px;
  color: white;
`;

const Value = styled.span`
  font-size: 32px;
  font-weight: 400;
  color: white;
`;

const QRWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: auto;
  margin-bottom: 8px;
`;

const QRBox = styled.div`
  background: white;
  padding: 16px;
  border-radius: 16px;
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ $spotlit }) => $spotlit && css`box-shadow: 0 0 0 4px rgba(255,255,255,0.3);`}
`;

const QRText = styled.div`
  margin-top: 12px;
  font-size: 14px;
  opacity: 0.9;
  color: white;
`;

// --- BOTTOM SECTION (STRIP / HERO) ---
// --- BOTTOM SECTION (STRIP / HERO) ---
const BottomSection = styled.div`
  width: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
  box-shadow: ${({ $isApple }) => $isApple
    ? 'none'
    : '0 10px 500px -100px rgba(0,0,0,0.9)'};
`;


// ============================================
// BACK SIDE STYLES
// ============================================
const GoogleBackCard = styled.div`
  background: #ffffff;
  height: 100%;
  display: flex;
  flex-direction: column;
  color: #202124;
  font-family: 'Roboto', sans-serif;
`;

const GoogleBackHeader = styled.div`
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  color: #5F6368;
`;

const GoogleBackContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20px;
`;

const GoogleTextModule = styled.div`
  padding: 20px 24px;
`;

const GoogleModuleHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

const GoogleModuleLabel = styled.div`
  font-size: 12px;
  color: #5F6368;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const GoogleModuleValue = styled.div`
  font-size: 16px;
  color: #202124;
`;

const GoogleModuleSubvalue = styled.div`
  font-size: 14px;
  color: #5f6368;
  margin-top: 2px;
`;

const GoogleExpandIcon = styled.span`
  font-size: 12px;
  color: #5f6368;
`;

const GoogleModuleBody = styled.div`
  font-size: 14px;
  color: #3c4043;
  line-height: 1.5;
  margin-top: 4px;
`;

const GoogleDivider = styled.div`
  height: 1px;
  background: #dadce0;
  margin: 0 24px;
`;

const GoogleActionRow = styled.a`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px 24px;
  text-decoration: none;
  &:hover { background: #f8f9fa; }
`;

const GoogleActionIcon = styled.span`
  color: #1a73e8;
  font-size: 20px;
`;

const GoogleActionLabel = styled.span`
  font-size: 16px;
  color: #1a73e8;
  font-weight: 500;
`;

const GoogleDisclaimer = styled.div`
  padding: 24px;
  font-size: 12px;
  color: #5f6368;
  text-align: center;
  line-height: 1.5;
`;

const GoogleDisclaimerLink = styled.a`
  color: #1a73e8;
  text-decoration: none;
`;

export default CardPreviewGoogle;