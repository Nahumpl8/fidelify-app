import { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';

// ============================================
// MAIN CONTAINER - Optimized for Viewport Fit
// ============================================
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  gap: 8px;
  padding: 12px 20px;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding: 8px 10px;
    gap: 6px;
  }
`;

// Main Content Area - Horizontal: Phone + Platform Switch
const MainContent = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 16px;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
  }
`;

// Vertical Platform Switch (to the right of phone)
const PlatformSwitchColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (max-width: 480px) {
    flex-direction: row;
    order: -1;
  }
`;

const PlatformButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 20px;

  /* Active/Inactive State - Violet accent */
  background: ${({ $active, theme }) => $active
    ? (theme.mode === 'dark' ? 'rgba(151, 135, 243, 0.2)' : 'rgba(151, 135, 243, 0.15)')
    : (theme.mode === 'dark' ? 'rgba(26, 23, 48, 0.6)' : 'rgba(234, 239, 254, 0.9)')};

  border: 2px solid ${({ $active }) => $active
    ? '#9787F3'
    : 'transparent'};

  box-shadow: ${({ $active, theme }) => $active
    ? '0 2px 8px rgba(151, 135, 243, 0.3)'
    : (theme.mode === 'dark' ? '0 2px 8px rgba(0, 0, 0, 0.2)' : '0 2px 8px rgba(151, 135, 243, 0.08)')};

  &:hover {
    transform: scale(1.05);
    background: ${({ $active, theme }) => $active
      ? (theme.mode === 'dark' ? 'rgba(151, 135, 243, 0.25)' : 'rgba(151, 135, 243, 0.2)')
      : (theme.mode === 'dark' ? 'rgba(45, 39, 75, 0.8)' : 'rgba(234, 239, 254, 1)')};
  }

  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
`;

// Platform Toggle moved to PreviewControlsDock component
import CardPreviewApple from '../../card-builder/CardPreviewApple';
import CardPreviewGoogle from '../../card-builder/CardPreviewGoogle';
import PreviewControlsDock from './PreviewControlsDock';

// ============================================
// ANIMATIONS
// ============================================
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const float = keyframes`
  0%, 100% { transform: rotateY(-12deg) rotateX(2deg) translateY(0); }
  50% { transform: rotateY(-12deg) rotateX(2deg) translateY(-15px); }
`;

const reflection = keyframes`
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

// ============================================
// PHONE MOCKUP CONTAINER - 3D HERO
// ============================================
const PhoneContainer = styled.div`
  position: relative;
  transform-style: preserve-3d;
  animation: ${float} 6s ease-in-out infinite;

  /* Laptop Scaling for 50/50 Split */
  @media (min-width: 1025px) and (max-width: 1400px) {
    transform: scale(0.85);
  }

  /* Mobile: Disable 3D Perspective */
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    transform: none;
    animation: none;
    margin-top: 20px;
    margin-bottom: 20px;
    transform: scale(0.9);
  }

  /* Deep Ambient Glow - Violet */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) translateZ(-100px);
    width: 400px;
    height: 700px;
    background: radial-gradient(
      ellipse at center,
      rgba(151, 135, 243, 0.3) 0%,
      rgba(124, 106, 232, 0.18) 40%,
      transparent 70%
    );
    filter: blur(60px);
    z-index: -1;
    pointer-events: none;
  }
`;

// ============================================
// iPHONE 15 PRO MOCKUP - Natural Titanium Finish
// ============================================
const IPhoneFrame = styled.div`
  position: relative;
  width: 300px;
  height: 600px;
  /* Titanium Natural frame gradient */
  background: linear-gradient(
    165deg,
    #c5c5c5 0%,
    #ff8543 15%,
    #ff6e20 50%,
    #ff8543 85%,
    #ff5900 100%
  );
  border-radius: 54px;
  padding: 8px;
  box-shadow:
    /* Outer highlight */
    0 0 0 0.5px rgba(255,255,255,0.2),
    /* Deep shadow */
    0 30px 80px rgba(0, 0, 0, 0.5),
    0 15px 40px rgba(0, 0, 0, 0.3),
    /* Ambient light reflection */
    inset 0 1px 0 rgba(255,255,255,0.15),
    inset 0 -1px 0 rgba(0,0,0,0.3);

  /* Titanium brushed metal texture effect */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 54px;
    background:
      linear-gradient(
        120deg,
        hsla(0, 0%, 100%, 0.12) 0%,
        transparent 25%,
        transparent 75%,
        rgba(255,255,255,0.08) 100%
      ),
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 1px,
        rgba(255,255,255,0.02) 1px,
        rgba(255,255,255,0.02) 2px
      );
    pointer-events: none;
  }

  /* Side buttons - Volume + Silent Switch */
  &::after {
    content: '';
    position: absolute;
    left: -2.5px;
    top: 100px;
    width: 2.5px;
    height: 28px;
    background: linear-gradient(180deg, #5a5a5c 0%, #3a3a3c 50%, #2a2a2c 100%);
    border-radius: 2px 0 0 2px;
    box-shadow:
      0 -50px 0 8px transparent,
      0 40px 0 0 #3a3a3c,
      inset 1px 0 0 rgba(255,255,255,0.2);
  }
`;

const IPhonePowerButton = styled.div`
  position: absolute;
  right: -2.5px;
  top: 140px;
  width: 2.5px;
  height: 70px;
  background: linear-gradient(180deg, #5a5a5c 0%, #3a3a3c 50%, #2c2a2a 100%);
  border-radius: 0 2px 2px 0;
  box-shadow: inset -1px 0 0 rgba(255,255,255,0.2);
`;

/* Silent Switch / Action Button */
const IPhoneActionButton = styled.div`
  position: absolute;
  left: -2.5px;
  top: 58px;
  width: 2.5px;
  height: 24px;
  background: linear-gradient(180deg, #5a5a5c 0%, #3a3a3c 50%, #2a2a2c 100%);
  border-radius: 2px 0 0 2px;
  box-shadow: inset 1px 0 0 rgba(255,255,255,0.2);
`;

// ============================================
// iPHONE SCREEN - Super Retina XDR Display
// ============================================
const IPhoneScreen = styled.div`
  width: 100%;
  height: 100%;
  background: #141414;
  border-radius: 46px;
  position: relative;

  /* STRICT CLIPPING - Prevents content overflow */
  overflow: hidden;
  isolation: isolate;

  /* Mask for perfect corner clipping */
  -webkit-mask-image: -webkit-radial-gradient(white, black);
  mask-image: radial-gradient(white, black);

  /* Subtle screen bezel effect */
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05);
`;

// Dynamic Island - iPhone 15 Pro accurate
const IPhoneDynamicIsland = styled.div`
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 106px;
  height: 32px;
  background: #000;
  border-radius: 22px;
  z-index: 100;

  /* Subtle outline */
  &::after {
    content: '';
    position: absolute;
    inset: -0.5px;
    border-radius: 23px;
    background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
    z-index: -1;
  }

  /* Front camera lens with realistic optics */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);
    width: 11px;
    height: 11px;
    background: radial-gradient(
      circle at 40% 35%,
      #2a2a4e 0%,
      #1a1a2e 30%,
      #0a0a1e 60%,
      #000 100%
    );
    border-radius: 50%;
    box-shadow:
      inset 1px 1px 2px rgba(100, 100, 180, 0.4),
      inset -0.5px -0.5px 1px rgba(0, 0, 0, 0.5),
      0 0 0 1.5px #1c1c1e;
  }
`;

const IPhoneHomeIndicator = styled.div`
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 130px;
  height: 5px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 3px;
  z-index: 100;
  transition: background 0.2s ease;
`;

const IPhoneStatusBar = styled.div`
  position: absolute;
  top: 16px;
  left: 32px;
  right: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 99;
  color: white;
  font-size: 12px;
  font-weight: 600;
`;

const StatusTime = styled.span`
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: -0.3px;
  color: black;
`;

const StatusIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;

  /* Using actual SVG-like shapes for status icons */
  span {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
  }
`;

// ============================================
// SAMSUNG GALAXY A25 MOCKUP - Compact version
// ============================================
const GalaxyFrame = styled.div`
  position: relative;
  width: 290px;
  height: 590px;
  background: #DFDAD9;
  border-radius: 34px;
  padding: 6px;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.08),
    0 25px 60px rgba(0, 0, 0, 0.5),
    inset 0 0 0 1px rgba(255,255,255,0.03);
`;

// ============================================
// GALAXY SCREEN - WITH STRICT CLIPPING MASK
// ============================================
const GalaxyScreen = styled.div`
  width: 100%;
  height: 100%;
  background: #ffffff;
  border-radius: 30px;
  position: relative;

  /* STRICT CLIPPING - Prevents content overflow */
  overflow: hidden;
  isolation: isolate;

  /* Mask for perfect corner clipping */
  -webkit-mask-image: -webkit-radial-gradient(white, black);
  mask-image: radial-gradient(white, black);
`;

const GalaxyPunchHole = styled.div`
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  background: radial-gradient(circle, #35355b 0%, #0a0a1e 50%, #000 100%);
  border-radius: 50%;
  z-index: 100;
`;

const GalaxyStatusBar = styled.div`
  position: absolute;
  top: 8px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 99;
  color: white;
  font-size: 11px;
`;

const GalaxyHomeIndicator = styled.div`
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 90px;
  height: 4px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 2px;
  z-index: 100000;
`;

// ============================================
// CARD CONTAINER - Safe area with proper scaling
// ============================================
const CardContainer = styled.div`
  position: absolute;
  top: ${({ $isApple }) => $isApple ? '56px' : '25px'};
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 10px;
  padding-top: 12px;

  /* Ensure content stays within bounds */
  overflow: hidden;
`;

const CardWrapper = styled.div`
  transform: scale(${({ $scale }) => $scale || 0.75});
  transform-origin: top center;
  width: fit-content;
`;

// ============================================
// EMPTY STATE - Theme Aware
// ============================================
const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.space['2xl']};
  text-align: center;

  /* Theme Aware */
  color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(148, 163, 184, 0.8)'
    : 'rgba(71, 85, 105, 0.8)'};
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${({ theme }) => theme.space.md};
  animation: ${fadeIn} 0.5s ease-out;
`;

const EmptyText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin: 0;
  line-height: 1.6;

  /* Theme Aware */
  color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(248, 250, 252, 0.8)'
    : 'rgba(30, 41, 59, 0.8)'};
`;

const EmptyHint = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  margin-top: ${({ theme }) => theme.space.xs};

  /* Theme Aware */
  color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(148, 163, 184, 0.6)'
    : 'rgba(100, 116, 139, 0.7)'};
`;

// ============================================
// FLIP INDICATOR - Theme Aware
// ============================================
const FlipIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  margin-top: 8px;
  animation: ${fadeIn} 0.3s ease;

  /* Glassmorphism with Violet accent */
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(26, 23, 48, 0.7)'
    : 'rgba(234, 239, 254, 0.9)'};
  color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(196, 181, 253, 0.9)'
    : '#9787F3'};
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(151, 135, 243, 0.2)'
    : 'rgba(151, 135, 243, 0.15)'};
  backdrop-filter: blur(12px);
`;

const FlipIcon = styled.span`
  font-size: 14px;
`;

// ============================================
// STEP LABEL - Theme Aware
// ============================================
const StepLabel = styled.div`
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 500;

  /* TEXT COLOR - Theme Aware */
  color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(148, 163, 184, 0.7)'
    : 'rgba(71, 85, 105, 0.7)'};
`;

// ============================================
// MAIN COMPONENT
// ============================================
const WizardPreview = ({
  formState,
  simulatedProgress,
  setSimulatedProgress,
  organizationName = 'Mi Negocio',
  currentStep = 1,
  activeFocusField = null,
}) => {
  const [platform, setPlatform] = useState('apple');

  const { type, name, branding_config, rules_config, back_side_config } = formState;

  // Determine if card should be flipped (Step 3 = Back side content)
  const isFlipped = currentStep === 3;

  // If no type selected, show empty state
  if (!type) {
    return (
      <Container>
        <EmptyState>
          <EmptyIcon>🎴</EmptyIcon>
          <EmptyText>
            Selecciona un giro de negocio
            <EmptyHint>El preview se actualizara automaticamente</EmptyHint>
          </EmptyText>
        </EmptyState>
      </Container>
    );
  }

  // Build props for preview components
  const previewProps = {
    programType: type,
    programName: name || 'Mi Programa',
    businessName: organizationName,
    designConfig: {
      layout_mode: branding_config.layout_mode || 'grid',
      barcode_type: branding_config.barcode_type || 'pdf417',
      background_color: branding_config.background_color,
      label_color: branding_config.label_color,
      text_color: branding_config.text_color || branding_config.label_color,
      colors: {
        background: branding_config.background_color,
        label: branding_config.label_color,
        text: branding_config.text_color || branding_config.label_color,
      },
      logo_url: branding_config.logo_url,
      logo_text: branding_config.logo_text,
      profile_photo_url: branding_config.profile_photo_url,
      strip_image_url: branding_config.strip_image_url,
      hero_image_url: branding_config.hero_image_url,
      strip_completed_image_url: branding_config.strip_completed_image_url,
      stamp_image_url: branding_config.stamp_image_url,
      goal_stamp_image_url: branding_config.goal_stamp_image_url,
      stamp_active_color: branding_config.stamp_active_color,
      stamp_inactive_color: branding_config.stamp_inactive_color,
      stamp_source: branding_config.stamp_source,
      stamp_icon: branding_config.stamp_icon,
      strip_style: branding_config.strip_style,
      images: {
        logo: branding_config.logo_url,
        strip_image: getStripImage(branding_config, simulatedProgress, rules_config),
        hero_image_google: branding_config.hero_image_url,
      },
      strip_config: branding_config.strip_config,
      // Strip background color
      strip_background_color: branding_config.strip_background_color,
      // Strip texture for layered rendering (Fresh Market style)
      strip_texture_url: branding_config.strip_texture_url,
      // Visual Strategy (iconic_grid, hero_minimalist, progressive_story)
      visual_strategy: branding_config.visual_strategy || 'iconic_grid',
      // Progressive strip URLs for progressive_story mode
      progressive_strip_urls: branding_config.progressive_strip_urls || [],
      // Icon styling
      icon_spacing: branding_config.icon_spacing,
      icon_drop_shadow: branding_config.icon_drop_shadow,
      // Split Strip Layout
      strip_layout: branding_config.strip_layout || 'center',
      strip_side_image_url: branding_config.strip_side_image_url,
      strip_side_image_fit: branding_config.strip_side_image_fit || 'cover',
      // Dual-Color Icon System
      stamp_fill_color: branding_config.stamp_fill_color || '#FFD700',
      stamp_stroke_color: branding_config.stamp_stroke_color || '#B8860B',
      stamp_inactive_fill: branding_config.stamp_inactive_fill || 'transparent',
      stamp_inactive_stroke: branding_config.stamp_inactive_stroke || '#CCCCCC',
      icon_stroke_width: branding_config.icon_stroke_width || 2,
      // Stamp scaling and styling
      icon_scale: branding_config.icon_scale,
      stamp_scale: branding_config.stamp_scale,
      stamp_style: branding_config.stamp_style,
      inactive_style: branding_config.inactive_style,
      // Circle background colors
      stamp_circle_active_bg: branding_config.stamp_circle_active_bg,
      stamp_circle_inactive_bg: branding_config.stamp_circle_inactive_bg,
      stamp_circle_active_border: branding_config.stamp_circle_active_border,
      stamp_circle_inactive_border: branding_config.stamp_circle_inactive_border,
      // Grid configuration
      grid_manual_enabled: branding_config.grid_manual_enabled,
      grid_manual_cols: branding_config.grid_manual_cols,
      grid_manual_rows: branding_config.grid_manual_rows,
      grid_vertical_align: branding_config.grid_vertical_align,
      split_ratio: branding_config.split_ratio,
      // Header configuration
      show_header: branding_config.show_header,
      header_label: branding_config.header_label,
      header_symbol: branding_config.header_symbol,
      header_value_mode: branding_config.header_value_mode,
      header_value_source: branding_config.header_value_source,
      // Gold mode configuration - pass through from branding_config
      gold_mode_enabled: rules_config.gold_mode_enabled || branding_config.gold_mode_enabled,
      gold_mode_threshold: rules_config.gold_trigger_threshold || branding_config.gold_mode_threshold,
      gold_mode_color: branding_config.gold_mode_color,
      gold_active_color: branding_config.gold_active_color || '#FFD700',
      // Dynamic fields configuration
      field_left_type: branding_config.field_left_type || 'customer_name',
      field_center_type: branding_config.field_center_type || 'none',
      field_right_type: branding_config.field_right_type || 'status',
      // QR/Barcode configuration
      qr_type: branding_config.qr_type || 'qr_code',
      qr_mode: branding_config.qr_mode || 'auto',
      qr_custom_url: branding_config.qr_custom_url,
    },
    logicRules: {
      target_stamps: rules_config.target_stamps || 10,
      target: rules_config.target_stamps || 10,
      reward_name: rules_config.reward_name || 'Recompensa',
      reward: rules_config.reward_name || 'Recompensa',
      qr_url: rules_config.qr_url || null,
      gold_mode_enabled: rules_config.gold_mode_enabled,
      gold_trigger_threshold: rules_config.gold_trigger_threshold,
      ...rules_config,
    },
    currentProgress: simulatedProgress,
    // New props for flip and spotlight
    isFlipped: isFlipped,
    activeFocusField: activeFocusField,
    backSideConfig: back_side_config || {},
  };

  const maxProgress = rules_config.target_stamps || 10;

  // Get current time for status bar
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).replace(' ', '');

  // Get step label
  const getStepLabel = () => {
    switch (currentStep) {
      case 1: return 'Tipo de Negocio';
      case 2: return 'Diseño Visual';
      case 3: return 'Información de la Tarjeta/Negocio';
      case 4: return `Reglas del Programa '${name}'`;
      default: return '';
    }
  };

  return (
    <Container>
      {/* Step Label */}
      <StepLabel>{getStepLabel()}</StepLabel>

      {/* Main Content Area: Phone + Platform Switch Side by Side */}
      <MainContent>
        {/* Phone Preview */}
        <PhoneContainer key={platform}>
          {platform === 'apple' ? (
            <IPhoneFrame>
              <IPhonePowerButton />
              <IPhoneActionButton />
              <IPhoneScreen>
                <IPhoneDynamicIsland />
                <IPhoneStatusBar>
                  <StatusTime>{currentTime}</StatusTime>
                  <div style={{ width: '126px' }} />
                  <StatusIcons>
                    <span>
                      <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
                        <rect x="0" y="4" width="3" height="8" rx="1" fill="white" fillOpacity="0.9" />
                        <rect x="5" y="3" width="3" height="9" rx="1" fill="white" fillOpacity="0.9" />
                        <rect x="10" y="1" width="3" height="11" rx="1" fill="white" fillOpacity="0.7" />
                        <rect x="15" y="0" width="3" height="12" rx="1" fill="white" fillOpacity="0.5" />
                      </svg>
                    </span>
                    <span>
                      <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
                        <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="white" strokeOpacity="0.4" />
                        <rect x="22.5" y="3.5" width="2" height="5" rx="1" fill="white" fillOpacity="0.4" />
                        <rect x="2" y="2" width="17" height="8" rx="1.5" fill="white" />
                      </svg>
                    </span>
                  </StatusIcons>
                </IPhoneStatusBar>
                <CardContainer $isApple>
                  <CardWrapper $scale={0.82}>
                    <CardPreviewApple {...previewProps} isApple={true} />
                  </CardWrapper>
                </CardContainer>
                <IPhoneHomeIndicator />
              </IPhoneScreen>
            </IPhoneFrame>
          ) : (
            <GalaxyFrame>
              <GalaxyScreen>
                <GalaxyPunchHole />
                <GalaxyStatusBar>
                  <StatusTime style={{ fontSize: '11px' }}>{currentTime}</StatusTime>
                  <StatusIcons>
                    <span>
                      <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
                        <rect x="0" y="4" width="3" height="8" rx="1" fill="black" fillOpacity="0.9" />
                        <rect x="5" y="3" width="3" height="9" rx="1" fill="black" fillOpacity="0.9" />
                        <rect x="10" y="1" width="3" height="11" rx="1" fill="black" fillOpacity="0.7" />
                        <rect x="15" y="0" width="3" height="12" rx="1" fill="black" fillOpacity="0.5" />
                      </svg>
                    </span>
                    <span>
                      <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
                        <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="black" strokeOpacity="0.4" />
                        <rect x="22.5" y="3.5" width="2" height="5" rx="1" fill="black" fillOpacity="0.4" />
                        <rect x="2" y="2" width="17" height="8" rx="1.5" fill="black" />
                      </svg>
                    </span>
                  </StatusIcons>
                </GalaxyStatusBar>
                <CardContainer $isApple={false}>
                  <CardWrapper $scale={0.72}>
                    <CardPreviewGoogle {...previewProps} isApple={false} />
                  </CardWrapper>
                </CardContainer>
                <GalaxyHomeIndicator />
              </GalaxyScreen>
            </GalaxyFrame>
          )}
        </PhoneContainer>

        {/* Platform Switch - Vertical buttons to the right */}
        <PlatformSwitchColumn>
          <PlatformButton
            type="button"
            $active={platform === 'apple'}
            onClick={() => setPlatform('apple')}
            title="Apple Wallet"
          >
            🍎
          </PlatformButton>
          <PlatformButton
            type="button"
            $active={platform === 'google'}
            onClick={() => setPlatform('google')}
            title="Google Wallet"
          >
            🤖
          </PlatformButton>
        </PlatformSwitchColumn>
      </MainContent>

      {/* Flip Indicator - show when on step 3 */}
      {isFlipped && (
        <FlipIndicator>
          <FlipIcon>🔄</FlipIcon>
          Viendo el reverso de la tarjeta
        </FlipIndicator>
      )}

      {/* Compact Progress Simulator - Only when needed */}
      {type !== 'identity' && !isFlipped && (
        <PreviewControlsDock
          progress={simulatedProgress}
          onProgressChange={setSimulatedProgress}
          maxProgress={type === 'stamp' || type === 'mixed' ? maxProgress : 5000}
          progressStep={type === 'stamp' || type === 'mixed' ? 1 : 50}
          progressLabel={type === 'cashback' ? 'Simular Puntos' : 'Simular Progreso'}
          compact={true}
        />
      )}
    </Container>
  );
};

/**
 * Get the appropriate strip image based on progress and visual strategy
 */
function getStripImage(branding_config, progress, rules_config = {}) {
  const visualStrategy = branding_config.visual_strategy || 'iconic_grid';
  const totalStamps = rules_config.target_stamps || 8;

  // Progressive Story Mode: Image changes per step
  if (visualStrategy === 'progressive_story') {
    const progressiveUrls = branding_config.progressive_strip_urls || [];
    if (progressiveUrls.length > 0) {
      const index = Math.min(progress, progressiveUrls.length - 1);
      return progressiveUrls[index] || progressiveUrls[0];
    }
  }

  // Hero Minimalist Mode: Show completed image when target reached
  if (visualStrategy === 'hero_minimalist') {
    if (progress >= totalStamps && branding_config.strip_completed_image_url) {
      return branding_config.strip_completed_image_url;
    }
    return branding_config.strip_image_url || branding_config.hero_image_url;
  }

  // Legacy strip_config support
  const stripConfig = branding_config.strip_config;
  if (
    stripConfig?.mode === 'progressive' &&
    stripConfig.progressive_urls?.length > 0
  ) {
    const index = Math.min(progress, stripConfig.progressive_urls.length - 1);
    return stripConfig.progressive_urls[index];
  }

  return stripConfig?.static_url || branding_config.strip_image_url || null;
}

export default WizardPreview;
