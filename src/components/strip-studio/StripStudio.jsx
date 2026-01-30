import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes, css } from 'styled-components';
import { X, Eye, EyeOff, Smartphone, Monitor } from 'lucide-react';

import StripCanvas from './StripCanvas';
import StripModeToggle from './StripModeToggle';
import ClassicModeControls from './controls/ClassicModeControls';
import HeroModeControls from './controls/HeroModeControls';
import StoryModeControls from './controls/StoryModeControls';
import { AppleSafeZoneOverlay, GoogleMaskOverlay } from './overlays/SafeZoneGuides';

/**
 * StripStudio - Immersive focus mode for strip editing
 * Features cinematic transitions and full-width canvas editing
 */
const StripStudio = ({
  isOpen,
  onClose,
  brandingConfig,
  rulesConfig,
  updateBranding,
  currentProgress,
  setSimulatedProgress,
  uploadImage,
  isUploading = false,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showAppleSafeZones, setShowAppleSafeZones] = useState(false);
  const [showGoogleMask, setShowGoogleMask] = useState(false);
  const [localProgress, setLocalProgress] = useState(currentProgress);
2
  // Sync local progress with parent
  useEffect(() => {
    setLocalProgress(currentProgress);
  }, [currentProgress]);

  // Handle progress changes locally and propagate
  const handleProgressChange = useCallback((value) => {
    setLocalProgress(value);
    setSimulatedProgress?.(value);
  }, [setSimulatedProgress]);

  // Enter animation
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isClosing) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isClosing]);

  // Close with animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 350);
  }, [onClose]);

  // Handle visual strategy change
  const handleModeChange = useCallback((strategyId) => {
    const updates = { visual_strategy: strategyId };
    if (strategyId === 'iconic_grid') {
      updates.layout_mode = 'grid';
      updates.strip_type = 'classic';
    } else if (strategyId === 'hero_minimalist') {
      updates.layout_mode = 'hero';
      updates.strip_type = 'image';
    } else if (strategyId === 'progressive_story') {
      updates.layout_mode = 'progressive';
      updates.strip_type = 'progressive';
    }
    updateBranding(updates);
  }, [updateBranding]);

  // Handle image upload
  const handleUploadImage = useCallback(async (file, type) => {
    if (!uploadImage) return null;

    if (file === null) {
      // Handle removal
      if (type === 'logo') updateBranding({ logo_url: null });
      if (type === 'strip') updateBranding({ strip_image_url: null, hero_image_url: null });
      if (type === 'strip_completed') updateBranding({ strip_completed_image_url: null });
      if (type === 'strip_texture') updateBranding({ strip_texture_url: null });
      if (type === 'strip_side') updateBranding({ strip_side_image_url: null });
      if (type === 'stamp') updateBranding({ stamp_image_url: null });
      if (type === 'goal_stamp') updateBranding({ goal_stamp_image_url: null });
      return null;
    }

    try {
      const url = await uploadImage(file, type);
      if (type === 'logo') updateBranding({ logo_url: url });
      if (type === 'strip') updateBranding({ strip_image_url: url, hero_image_url: url });
      if (type === 'strip_completed') updateBranding({ strip_completed_image_url: url });
      if (type === 'strip_texture') updateBranding({ strip_texture_url: url });
      if (type === 'strip_side') updateBranding({ strip_side_image_url: url });
      if (type === 'stamp') updateBranding({ stamp_image_url: url });
      if (type === 'goal_stamp') updateBranding({ goal_stamp_image_url: url });
      return url;
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    }
  }, [uploadImage, updateBranding]);

  if (!isOpen) return null;

  const currentStrategy = brandingConfig.visual_strategy || 'iconic_grid';

  const renderControls = () => {
    switch (currentStrategy) {
      case 'hero_minimalist':
        return (
          <HeroModeControls
            brandingConfig={brandingConfig}
            rulesConfig={rulesConfig}
            updateBranding={updateBranding}
            uploadImage={handleUploadImage}
            simulatedProgress={localProgress}
            setSimulatedProgress={handleProgressChange}
            isUploading={isUploading}
          />
        );
      case 'progressive_story':
        return (
          <StoryModeControls
            brandingConfig={brandingConfig}
            rulesConfig={rulesConfig}
            updateBranding={updateBranding}
            uploadImage={handleUploadImage}
            simulatedProgress={localProgress}
            setSimulatedProgress={handleProgressChange}
            isUploading={isUploading}
          />
        );
      case 'iconic_grid':
      default:
        return (
          <ClassicModeControls
            brandingConfig={brandingConfig}
            updateBranding={updateBranding}
            uploadImage={handleUploadImage}
            isUploading={isUploading}
          />
        );
    }
  };

  return createPortal(
    <Overlay $isClosing={isClosing}>
      {/* Backdrop */}
      <Backdrop $isClosing={isClosing} onClick={handleClose} />

      {/* Studio Container */}
      <StudioContainer $isClosing={isClosing}>
        {/* Header */}
        <StudioHeader>
          <HeaderTitle>
            <StudioIcon>🎨</StudioIcon>
            Strip Studio
          </HeaderTitle>
          <HeaderActions>
            {/* Safe Zone Toggles */}
            <ToggleButton
              $active={showAppleSafeZones}
              onClick={() => setShowAppleSafeZones(!showAppleSafeZones)}
              title="Mostrar zonas seguras Apple"
            >
              <Smartphone size={16} />
              <span>Apple</span>
            </ToggleButton>
            <ToggleButton
              $active={showGoogleMask}
              onClick={() => setShowGoogleMask(!showGoogleMask)}
              title="Mostrar mascara Google"
            >
              <Monitor size={16} />
              <span>Google</span>
            </ToggleButton>
            <Divider />
            <CloseButton onClick={handleClose}>
              <X size={20} />
            </CloseButton>
          </HeaderActions>
        </StudioHeader>

        {/* Main Content */}
        <StudioContent>
          {/* Canvas Area */}
          <CanvasArea>
            <CanvasWrapper>
              <StripCanvas
                brandingConfig={brandingConfig}
                rulesConfig={rulesConfig}
                currentProgress={localProgress}
                scale={1.2}
                showSafeZones={false}
                showGoogleMask={false}
              />
              {/* Overlay guides rendered on top */}
              <OverlayContainer>
                <AppleSafeZoneOverlay visible={showAppleSafeZones} />
                <GoogleMaskOverlay visible={showGoogleMask} />
              </OverlayContainer>
            </CanvasWrapper>

            {/* Progress Simulator for Classic Mode */}
            {currentStrategy === 'iconic_grid' && (
              <ProgressSimulator>
                <ProgressLabel>Simular Progreso</ProgressLabel>
                <ProgressSlider
                  type="range"
                  min="0"
                  max={rulesConfig.target_stamps || 8}
                  step="1"
                  value={localProgress}
                  onChange={(e) => handleProgressChange(parseInt(e.target.value))}
                />
                <ProgressValue>
                  {localProgress} / {rulesConfig.target_stamps || 8}
                </ProgressValue>
              </ProgressSimulator>
            )}
          </CanvasArea>

          {/* Controls Panel */}
          <ControlsPanel>
            {/* Mode Toggle */}
            <ModeToggleWrapper>
              <StripModeToggle
                value={currentStrategy}
                onChange={handleModeChange}
              />
            </ModeToggleWrapper>

            {/* Mode-specific Controls */}
            <ControlsScroll>
              {renderControls()}
            </ControlsScroll>
          </ControlsPanel>
        </StudioContent>

        {/* Footer */}
        <StudioFooter>
          <FooterHint>
            Presiona <Kbd>ESC</Kbd> para cerrar
          </FooterHint>
          <ApplyButton onClick={handleClose}>
            Aplicar Diseno
          </ApplyButton>
        </StudioFooter>
      </StudioContainer>
    </Overlay>,
    document.body
  );
};

// ============================================
// ANIMATIONS
// ============================================

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const slideDown = keyframes`
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
`;

const stripEnter = keyframes`
  from {
    opacity: 0;
    transform: scale(0.5) translateY(100px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

// ============================================
// STYLED COMPONENTS
// ============================================

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: ${({ $isClosing }) => $isClosing ? fadeOut : fadeIn} 0.3s ease forwards;
`;

const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  animation: ${({ $isClosing }) => $isClosing ? fadeOut : fadeIn} 0.3s ease forwards;
`;

const StudioContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 1200px;
  height: 90vh;
  max-height: 800px;
  background: linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f0f1a 100%);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.05),
    0 25px 80px rgba(0, 0, 0, 0.5),
    0 0 100px rgba(99, 102, 241, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${({ $isClosing }) => $isClosing ? slideDown : slideUp} 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
`;

const StudioHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.2);
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  color: white;
  letter-spacing: -0.5px;
`;

const StudioIcon = styled.span`
  font-size: 20px;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  background: ${({ $active }) => $active ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${({ $active }) => $active ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${({ $active }) => $active ? '#818CF8' : 'rgba(255, 255, 255, 0.6)'};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 8px;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.4);
    color: #EF4444;
  }
`;

const StudioContent = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;

  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

const CanvasArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: radial-gradient(
    ellipse at center,
    rgba(99, 102, 241, 0.08) 0%,
    transparent 60%
  );
  position: relative;

  @media (max-width: 900px) {
    padding: 20px;
    min-height: 200px;
  }
`;

const CanvasWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  animation: ${stripEnter} 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: 0.1s;
  opacity: 0;

  @media (max-width: 900px) {
    max-width: 100%;
  }
`;

const OverlayContainer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

const ProgressSimulator = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const ProgressLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
`;

const ProgressSlider = styled.input`
  width: 200px;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  appearance: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #11B981;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(17, 185, 129, 0.4);
  }
`;

const ProgressValue = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #11B981;
  min-width: 50px;
`;

const ControlsPanel = styled.div`
  width: 380px;
  background: rgba(0, 0, 0, 0.3);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 900px) {
    width: 100%;
    max-height: 50%;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }
`;

const ModeToggleWrapper = styled.div`
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const ControlsScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 16px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
`;

const StudioFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.2);
`;

const FooterHint = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Kbd = styled.kbd`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-size: 11px;
  font-family: monospace;
  color: rgba(255, 255, 255, 0.7);
`;

const ApplyButton = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, #11B981, #059669);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(17, 185, 129, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(17, 185, 129, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

export default StripStudio;
