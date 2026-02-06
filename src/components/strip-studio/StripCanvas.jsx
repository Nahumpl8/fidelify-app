import { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import {
  Star, Coffee, Scissors, Heart, Smile, Check, Gift, Sparkles,
  Zap, Crown, ThumbsUp, Award, Soup, Beer, ShoppingBag, Music,
  Book, Camera, Car, Briefcase
} from 'lucide-react';

// Icon mapping
const ICON_MAP = {
  star: Star, coffee: Coffee, scissors: Scissors, heart: Heart,
  smile: Smile, check: Check, gift: Gift, sparkles: Sparkles,
  zap: Zap, crown: Crown, thumbsUp: ThumbsUp, award: Award,
  soup: Soup, beer: Beer, shoppingBag: ShoppingBag, music: Music,
  book: Book, camera: Camera, car: Car, briefcase: Briefcase,
};

/**
 * Grid Configuration - Optimized for various stamp counts
 */
const getGridConfig = (total, isSplit, designConfig = {}) => {
  // Manual override
  if (designConfig?.grid_manual_enabled) {
    return {
      cols: designConfig.grid_manual_cols || 5,
      rows: designConfig.grid_manual_rows || 2
    };
  }

  // Auto-calculation
  if (total <= 4) return { cols: total, rows: 1 };
  if (total <= 5) return { cols: isSplit ? total : 5, rows: 1 };
  if (total <= 6) return { cols: isSplit ? 3 : 6, rows: isSplit ? 2 : 1 };
  if (total <= 8) return { cols: isSplit ? 4 : 4, rows: 2 };
  if (total <= 10) return { cols: 5, rows: 2 };
  if (total <= 12) return { cols: isSplit ? 4 : 6, rows: isSplit ? 3 : 2 };

  // Large counts
  const cols = Math.min(6, Math.ceil(Math.sqrt(total * 1.5)));
  return { cols, rows: Math.ceil(total / cols) };
};

/**
 * StripCanvas - Unified strip renderer for Studio and Phone Mockups
 *
 * KEY: This component renders at 100% width of its container
 * and maintains the Apple Wallet Store Card aspect ratio (1125x432 @3x = ~2.6:1)
 */
const StripCanvas = forwardRef(({
  brandingConfig = {},
  rulesConfig = {},
  currentProgress = 0,
  scale = 1,
  showSafeZones = false,
  showGoogleMask = false,
}, ref) => {
  const visualStrategy = brandingConfig.visual_strategy || 'iconic_grid';
  const totalStamps = parseInt(rulesConfig.target_stamps || 10);
  const stripLayout = brandingConfig.strip_layout || 'left';
  const isSplit = stripLayout === 'left' || stripLayout === 'right';
  const grid = getGridConfig(totalStamps, isSplit, brandingConfig);

  // Get strip image based on strategy
  const getStripImage = () => {
    const progressiveUrls = brandingConfig.progressive_strip_urls || [];

    if (visualStrategy === 'progressive_story' && progressiveUrls.length > 0) {
      const index = Math.min(currentProgress, progressiveUrls.length - 1);
      return progressiveUrls[index] || progressiveUrls[0];
    }
    if (visualStrategy === 'hero_minimalist') {
      if (currentProgress >= totalStamps && brandingConfig.strip_completed_image_url) {
        return brandingConfig.strip_completed_image_url;
      }
      return brandingConfig.strip_image_url || brandingConfig.hero_image_url;
    }
    return brandingConfig.strip_image_url || brandingConfig.hero_image_url;
  };

  const renderStampsGrid = () => {
    const iconScale = brandingConfig.icon_scale ?? 0.7;
    const stampScale = brandingConfig.stamp_scale ?? 0.85;
    const spacing = brandingConfig.icon_spacing ?? 4;
    const isMinimal = brandingConfig.stamp_style === 'minimal';
    const strokeWidth = brandingConfig.icon_stroke_width || 2;
    const iconDropShadow = brandingConfig.icon_drop_shadow !== false;
    const inactiveStyle = brandingConfig.inactive_style || 'normal';

    // Colors with better defaults for visibility
    const activeFill = brandingConfig.stamp_fill_color || '#FFD700';
    const activeStroke = brandingConfig.stamp_stroke_color || '#B8860B';
    const inactiveFill = brandingConfig.stamp_inactive_fill ?? 'transparent';
    const inactiveStroke = brandingConfig.stamp_inactive_stroke || 'rgba(120, 120, 140, 0.5)';

    // Circle backgrounds - subtle but visible
    const stampCircleActiveBg = isMinimal ? 'transparent' : (brandingConfig.stamp_circle_active_bg || 'rgba(255, 255, 255, 0.15)');
    const stampCircleInactiveBg = isMinimal ? 'transparent' : (brandingConfig.stamp_circle_inactive_bg || 'rgba(200, 200, 220, 0.12)');
    const stampCircleActiveBorder = isMinimal ? 'transparent' : (brandingConfig.stamp_circle_active_border || 'rgba(255, 255, 255, 0.25)');
    const stampCircleInactiveBorder = isMinimal ? 'transparent' : (brandingConfig.stamp_circle_inactive_border || 'rgba(150, 150, 170, 0.25)');

    const customStampImage = brandingConfig.stamp_image_url;
    const customGoalImage = brandingConfig.goal_stamp_image_url;
    const Icon = ICON_MAP[brandingConfig.stamp_icon] || Soup;

    return (
      <GridContainer
        $cols={grid.cols}
        $rows={grid.rows}
        $gap={spacing}
        $vAlign={brandingConfig.grid_vertical_align || 'center'}
      >
        {[...Array(totalStamps)].map((_, i) => {
          const isActive = i < currentProgress;
          const isLast = i === totalStamps - 1;

          // Inactive style logic
          const shouldShowIcon = isActive || inactiveStyle === 'normal';
          const shouldHideCompletely = !isActive && inactiveStyle === 'hidden';
          const isOutlineOnly = !isActive && inactiveStyle === 'outline_only';

          const iconProps = {
            size: '100%',
            fill: isActive ? activeFill : inactiveFill,
            color: isActive ? activeStroke : inactiveStroke,
            stroke: isActive ? activeStroke : inactiveStroke,
            strokeWidth: strokeWidth,
          };

          if (shouldHideCompletely) {
            return <StampCell key={i} $active={false} $stampScale={stampScale} style={{ opacity: 0 }} />;
          }

          const renderContent = () => {
            if (!shouldShowIcon) return null;

            // Last stamp: Gift or custom goal image
            if (isLast) {
              if (customGoalImage) {
                return <CustomStampImg src={customGoalImage} $active={isActive} />;
              }
              return <Gift {...iconProps} />;
            }

            // Regular stamps
            if (customStampImage) {
              return <CustomStampImg src={customStampImage} $active={isActive} />;
            }
            return <Icon {...iconProps} />;
          };

          return (
            <StampCell
              key={i}
              $active={isActive}
              $stampScale={stampScale}
              $iconScale={iconScale}
              $activeBg={stampCircleActiveBg}
              $inactiveBg={isOutlineOnly ? 'transparent' : stampCircleInactiveBg}
              $dropShadow={iconDropShadow && isActive}
              $hasCustomImage={!!(customStampImage || (isLast && customGoalImage))}
              $activeBorder={stampCircleActiveBorder}
              $inactiveBorder={stampCircleInactiveBorder}
              $isMinimal={isMinimal}
            >
              {renderContent()}
            </StampCell>
          );
        })}
      </GridContainer>
    );
  };

  const renderStripContent = () => {
    const stripBgColor = brandingConfig.strip_background_color || '#FFFFFF';
    const stripTextureUrl = brandingConfig.strip_texture_url;
    const stripSideImageUrl = brandingConfig.strip_side_image_url;
    const stripSideImageFit = brandingConfig.strip_side_image_fit || 'contain';
    const stripImage = getStripImage();

    if (visualStrategy === 'hero_minimalist') {
      return stripImage ? (
        <HeroImageWrapper>
          <img src={stripImage} alt="strip" />
        </HeroImageWrapper>
      ) : <EmptyStrip>Sube una imagen Hero</EmptyStrip>;
    }

    if (visualStrategy === 'progressive_story') {
      return stripImage ? (
        <HeroImageWrapper>
          <img src={stripImage} alt="strip" />
          <ProgressIndicator>{currentProgress} / {totalStamps}</ProgressIndicator>
        </HeroImageWrapper>
      ) : <EmptyStrip>Sube imagenes progresivas</EmptyStrip>;
    }

    // Iconic Grid (Default)
    const splitRatio = brandingConfig.split_ratio || 35;

    return (
      <IconicStripContainer $bgColor={stripBgColor}>
        {stripTextureUrl && (
          <TextureLayer><img src={stripTextureUrl} alt="texture" /></TextureLayer>
        )}
        <SplitLayoutWrapper $layout={stripLayout}>
          {stripLayout === 'left' && stripSideImageUrl && (
            <SideImageContainer $ratio={splitRatio}>
              <SideImage src={stripSideImageUrl} alt="side" $fit={stripSideImageFit} />
            </SideImageContainer>
          )}
          <IconsLayer $hasTexture={!!stripTextureUrl} $layout={stripLayout} $hasSideImage={!!stripSideImageUrl}>
            {renderStampsGrid()}
          </IconsLayer>
          {stripLayout === 'right' && stripSideImageUrl && (
            <SideImageContainer $ratio={splitRatio}>
              <SideImage src={stripSideImageUrl} alt="side" $fit={stripSideImageFit} />
            </SideImageContainer>
          )}
        </SplitLayoutWrapper>
      </IconicStripContainer>
    );
  };

  return (
    <CanvasContainer $scale={scale}>
      <StripWrapper ref={ref}>
        {renderStripContent()}
        {showSafeZones && (
          <SafeZoneOverlay>
            <SafeZoneLabel $position="top-left">Reloj</SafeZoneLabel>
            <SafeZoneLabel $position="top-right">Iconos</SafeZoneLabel>
          </SafeZoneOverlay>
        )}
        {showGoogleMask && (
          <GoogleMaskOverlay>
            <GoogleCorner $position="bottom-left" />
            <GoogleCorner $position="bottom-right" />
          </GoogleMaskOverlay>
        )}
      </StripWrapper>
    </CanvasContainer>
  );
});

// ============================================
// STYLED COMPONENTS
// ============================================

const CanvasContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(${({ $scale }) => $scale});
  transform-origin: center center;
`;

// KEY: 100% width, aspect ratio maintains proportions
const StripWrapper = styled.div`
  width: 100%;
  aspect-ratio: 1125 / 432; /* Apple Wallet Store Card @3x (~2.6:1) */
  position: relative;
  overflow: hidden;
`;

const IconicStripContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: ${({ $bgColor }) => $bgColor};
  overflow: hidden;
`;

const TextureLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.8;
  }
`;

const SplitLayoutWrapper = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: stretch;
`;

const SideImageContainer = styled.div`
  flex: 0 0 ${({ $ratio }) => $ratio || 35}%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 8px;
`;

const SideImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: ${({ $fit }) => $fit || 'contain'};
`;

const IconsLayer = styled.div`
  ${({ $layout, $hasSideImage }) => ($layout && $layout !== 'center' && $hasSideImage) ? css`
    flex: 1;
    min-width: 0;
  ` : css`
    position: absolute;
    inset: 0;
  `}
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 8px;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ $cols }) => $cols}, 1fr);
  grid-template-rows: repeat(${({ $rows }) => $rows}, ${({ $vAlign }) => $vAlign === 'stretch' ? '1fr' : 'auto'});
  align-content: ${({ $vAlign }) => $vAlign || 'center'};
  gap: ${({ $gap }) => $gap}px;
  width: 100%;
  height: 100%;
  padding: 4px;
  justify-items: center;
  align-items: center;
`;

const StampCell = styled.div`
  aspect-ratio: 1 / 1;
  width: auto;
  height: auto;
  max-width: ${({ $hasCustomImage, $stampScale }) =>
    $hasCustomImage ? '100%' : `${($stampScale || 0.85) * 100}%`};
  max-height: ${({ $hasCustomImage, $stampScale }) =>
    $hasCustomImage ? '100%' : `${($stampScale || 0.85) * 100}%`};
  min-width: 24px;
  min-height: 24px;
  align-self: center;
  justify-self: center;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform: ${({ $active }) => $active ? 'scale(1.05)' : 'scale(1)'};

  ${({ $hasCustomImage }) => $hasCustomImage ? css`
    background: transparent !important;
    border: none !important;
    border-radius: 0;
  ` : css`
    border-radius: 50%;
    background: ${({ $active, $activeBg, $inactiveBg }) => $active ? $activeBg : $inactiveBg};
    border: ${({ $isMinimal, $active, $activeBorder, $inactiveBorder }) =>
      $isMinimal ? 'none' : `1.5px solid ${$active ? $activeBorder : $inactiveBorder}`};
    ${({ $dropShadow }) => $dropShadow && css`
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.1);
    `}
  `}

  & > svg, & > img {
    width: ${({ $hasCustomImage, $iconScale }) =>
      $hasCustomImage ? '100%' : `${($iconScale || 0.7) * 100}%`};
    height: ${({ $hasCustomImage, $iconScale }) =>
      $hasCustomImage ? '100%' : `${($iconScale || 0.7) * 100}%`};
    object-fit: contain;
  }

  & > svg {
    ${({ $dropShadow, $active }) => $dropShadow && css`
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, ${$active ? '0.3' : '0.15'}));
    `}
  }
`;

const CustomStampImg = styled.img`
  object-fit: contain;
  filter: ${({ $active }) => $active ? 'none' : 'grayscale(100%) opacity(0.35)'};
  transition: all 0.2s ease;
`;

const HeroImageWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const EmptyStrip = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(100,100,120,0.1), rgba(100,100,120,0.05));
  color: rgba(100, 100, 120, 0.6);
  font-size: 14px;
  font-weight: 500;
`;

const ProgressIndicator = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
`;

// Safe Zone Overlays
const SafeZoneOverlay = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  border: 2px dashed rgba(255, 100, 100, 0.5);
  z-index: 100;
`;

const SafeZoneLabel = styled.div`
  position: absolute;
  ${({ $position }) => $position === 'top-left' ? css`
    top: 4px;
    left: 8px;
  ` : css`
    top: 4px;
    right: 8px;
  `}
  font-size: 9px;
  color: rgba(255, 100, 100, 0.9);
  background: rgba(0, 0, 0, 0.6);
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// Google Mask Overlays
const GoogleMaskOverlay = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 100;
`;

const GoogleCorner = styled.div`
  position: absolute;
  width: 20px;
  height: 20px;
  ${({ $position }) => $position === 'bottom-left' ? css`
    bottom: 0;
    left: 0;
    border-bottom-left-radius: 16px;
    background: linear-gradient(135deg, transparent 60%, rgba(255,0,0,0.3) 60%);
  ` : css`
    bottom: 0;
    right: 0;
    border-bottom-right-radius: 16px;
    background: linear-gradient(225deg, transparent 60%, rgba(255,0,0,0.3) 60%);
  `}
`;

export default StripCanvas;
