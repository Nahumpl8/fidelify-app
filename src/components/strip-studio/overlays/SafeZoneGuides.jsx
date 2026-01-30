import styled, { css } from 'styled-components';

/**
 * SafeZoneGuides - Visual guides for Apple and Google Wallet safe zones
 * Shows areas that may be obscured by system UI elements
 */

// Apple Wallet safe zone specifications
// Strip: 1125px × 294px @3x
// Top safe zone: ~44px for status bar elements
// Left/Right: ~16px edge padding

export const AppleSafeZoneOverlay = ({ visible }) => {
  if (!visible) return null;

  return (
    <AppleOverlay>
      <SafeZoneTop>
        <SafeZoneLabel $position="left">
          <LabelIcon>⏰</LabelIcon>
          <span>Reloj</span>
        </SafeZoneLabel>
        <SafeZoneLabel $position="right">
          <LabelIcon>📶</LabelIcon>
          <span>Iconos</span>
        </SafeZoneLabel>
      </SafeZoneTop>
      <SafeZoneGuide $position="left" />
      <SafeZoneGuide $position="right" />
      <DimensionLabel>
        1125 × 294 px (@3x)
      </DimensionLabel>
    </AppleOverlay>
  );
};

// Google Wallet specifications
// Bottom corners: 16px radius
// Variable footer height

export const GoogleMaskOverlay = ({ visible }) => {
  if (!visible) return null;

  return (
    <GoogleOverlay>
      <GoogleCornerMask $position="bottom-left" />
      <GoogleCornerMask $position="bottom-right" />
      <GoogleLabel>
        Google Wallet - Esquinas redondeadas (16px)
      </GoogleLabel>
    </GoogleOverlay>
  );
};

/**
 * Combined overlay toggle component
 */
const SafeZoneGuides = ({ showApple, showGoogle }) => {
  return (
    <>
      <AppleSafeZoneOverlay visible={showApple} />
      <GoogleMaskOverlay visible={showGoogle} />
    </>
  );
};

// ============================================
// STYLED COMPONENTS
// ============================================

const AppleOverlay = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 100;
  border: 2px dashed rgba(0, 122, 255, 0.5);
`;

const SafeZoneTop = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 15%; /* Approx 44px in @1x terms */
  background: linear-gradient(
    to bottom,
    rgba(0, 122, 255, 0.15),
    transparent
  );
  display: flex;
  justify-content: space-between;
  padding: 4px 12px;
`;

const SafeZoneLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 9px;
  color: rgba(0, 122, 255, 0.8);
  background: rgba(0, 0, 0, 0.6);
  padding: 3px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const LabelIcon = styled.span`
  font-size: 10px;
`;

const SafeZoneGuide = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 4%;
  ${({ $position }) => $position === 'left' ? css`
    left: 0;
    background: linear-gradient(to right, rgba(0, 122, 255, 0.15), transparent);
  ` : css`
    right: 0;
    background: linear-gradient(to left, rgba(0, 122, 255, 0.15), transparent);
  `}
`;

const DimensionLabel = styled.div`
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  color: rgba(0, 122, 255, 0.8);
  background: rgba(0, 0, 0, 0.6);
  padding: 3px 10px;
  border-radius: 4px;
  font-family: monospace;
`;

const GoogleOverlay = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 100;
`;

const GoogleCornerMask = styled.div`
  position: absolute;
  width: 24px;
  height: 24px;
  ${({ $position }) => $position === 'bottom-left' ? css`
    bottom: 0;
    left: 0;
  ` : css`
    bottom: 0;
    right: 0;
  `}

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    ${({ $position }) => $position === 'bottom-left' ? css`
      background: linear-gradient(
        135deg,
        transparent 60%,
        rgba(52, 168, 83, 0.4) 60%
      );
      border-bottom-left-radius: 16px;
    ` : css`
      background: linear-gradient(
        225deg,
        transparent 60%,
        rgba(52, 168, 83, 0.4) 60%
      );
      border-bottom-right-radius: 16px;
    `}
  }

  &::after {
    content: '';
    position: absolute;
    ${({ $position }) => $position === 'bottom-left' ? css`
      bottom: 0;
      left: 0;
      width: 16px;
      height: 16px;
      border: 2px dashed rgba(52, 168, 83, 0.6);
      border-top: none;
      border-right: none;
      border-bottom-left-radius: 16px;
    ` : css`
      bottom: 0;
      right: 0;
      width: 16px;
      height: 16px;
      border: 2px dashed rgba(52, 168, 83, 0.6);
      border-top: none;
      border-left: none;
      border-bottom-right-radius: 16px;
    `}
  }
`;

const GoogleLabel = styled.div`
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  color: rgba(52, 168, 83, 0.9);
  background: rgba(0, 0, 0, 0.6);
  padding: 3px 10px;
  border-radius: 4px;
  white-space: nowrap;
`;

export default SafeZoneGuides;
