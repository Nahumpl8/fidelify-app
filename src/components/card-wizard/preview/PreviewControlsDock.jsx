import styled from 'styled-components';

// ============================================
// PREVIEW CONTROLS DOCK
// Unified container for Platform Switch & Progress Simulator
// Fixes Light Mode contrast issues
// ============================================

const DockContainer = styled.div`
  display: flex;
  flex-direction: ${({ $compact }) => $compact ? 'row' : 'column'};
  align-items: center;
  gap: ${({ $compact }) => $compact ? '12px' : '16px'};
  width: 100%;
  max-width: ${({ $compact }) => $compact ? '340px' : '320px'};
  padding: ${({ $compact }) => $compact ? '10px 14px' : '16px'};
  border-radius: ${({ $compact }) => $compact ? '12px' : '16px'};
  margin-top: ${({ $compact }) => $compact ? '4px' : '16px'};

  /* Glassmorphism with Violet accent */
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(26, 23, 48, 0.7)'
    : 'rgba(255, 255, 255, 0.85)'};
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);

  /* Border - Violet tinted */
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(151, 135, 243, 0.15)'
    : 'rgba(151, 135, 243, 0.1)'};

  /* Shadow */
  box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 4px 16px rgba(0, 0, 0, 0.25)'
    : '0 2px 12px rgba(151, 135, 243, 0.08)'};

  @media (max-width: 640px) {
    max-width: 100%;
    padding: ${({ $compact }) => $compact ? '8px 12px' : '14px'};
    border-radius: ${({ $compact }) => $compact ? '10px' : '14px'};
  }
`;

// ============================================
// SEGMENTED CONTROL (iOS Style Platform Switch)
// ============================================
const SegmentedControl = styled.div`
  display: flex;
  padding: 4px;
  border-radius: 12px;
  gap: 4px;

  /* Background Track - Violet tinted */
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(26, 23, 48, 0.6)'
    : 'rgba(151, 135, 243, 0.08)'};
`;

const SegmentButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);

  /* Active State - Violet accent */
  background: ${({ $active, theme }) => $active
    ? (theme.mode === 'dark' ? 'rgba(151, 135, 243, 0.2)' : '#FFFFFF')
    : 'transparent'};

  /* TEXT COLOR */
  color: ${({ $active, theme }) => {
    if ($active) {
      return theme.mode === 'dark' ? '#F8FAFC' : '#9787F3';
    }
    return theme.mode === 'dark' ? 'rgba(196, 181, 253, 0.7)' : 'rgba(101, 84, 212, 0.7)';
  }};

  /* Shadow for active button */
  box-shadow: ${({ $active, theme }) => $active
    ? (theme.mode === 'dark'
      ? '0 2px 8px rgba(151, 135, 243, 0.2)'
      : '0 2px 8px rgba(151, 135, 243, 0.15)')
    : 'none'};

  &:hover {
    background: ${({ $active, theme }) => $active
      ? (theme.mode === 'dark' ? 'rgba(151, 135, 243, 0.25)' : '#FFFFFF')
      : (theme.mode === 'dark' ? 'rgba(151, 135, 243, 0.1)' : 'rgba(151, 135, 243, 0.08)')};
    color: ${({ theme }) => theme.mode === 'dark' ? '#F8FAFC' : '#9787F3'};
  }

  @media (max-width: 640px) {
    padding: 8px 12px;
    font-size: 12px;
    gap: 6px;
  }
`;

const PlatformIcon = styled.span`
  font-size: 16px;
  line-height: 1;

  @media (max-width: 640px) {
    font-size: 14px;
  }
`;

// ============================================
// PROGRESS SIMULATOR SECTION
// ============================================
const SimulatorSection = styled.div`
  display: flex;
  flex-direction: ${({ $compact }) => $compact ? 'row' : 'column'};
  align-items: center;
  gap: ${({ $compact }) => $compact ? '12px' : '12px'};
  flex: 1;
  width: ${({ $compact }) => $compact ? 'auto' : '100%'};
`;

const SectionLabel = styled.label`
  font-size: ${({ $compact }) => $compact ? '10px' : '11px'};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
  white-space: nowrap;

  /* Violet-tinted text */
  color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(196, 181, 253, 0.9)'
    : 'rgba(101, 84, 212, 0.9)'};
`;

const SliderTrack = styled.div`
  position: relative;
  width: 100%;
  height: 8px;
  border-radius: 4px;

  /* Track Background - Violet tinted */
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(26, 23, 48, 0.8)'
    : 'rgba(151, 135, 243, 0.12)'};
`;

const SliderFill = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 4px;
  width: ${({ $progress }) => $progress}%;
  transition: width 200ms ease;

  /* Violet gradient fill */
  background: linear-gradient(90deg, #9787F3, #7C6AE8);
`;

const Slider = styled.input`
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 8px;
  background: transparent;
  cursor: pointer;
  position: relative;
  z-index: 2;
  margin: 0;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    cursor: grab;
    transition: transform 150ms ease, box-shadow 150ms ease;

    /* Thumb styling - Violet accent */
    background: ${({ theme }) => theme.mode === 'dark' ? '#F8FAFC' : '#FFFFFF'};
    border: 2px solid #9787F3;
    box-shadow: 0 2px 8px rgba(151, 135, 243, 0.2);

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(151, 135, 243, 0.3);
    }

    &:active {
      cursor: grabbing;
      transform: scale(0.95);
    }
  }

  &::-moz-range-thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    cursor: grab;
    border: 2px solid #9787F3;
    background: ${({ theme }) => theme.mode === 'dark' ? '#F8FAFC' : '#FFFFFF'};
    box-shadow: 0 2px 8px rgba(151, 135, 243, 0.2);
  }

  &:focus {
    outline: none;
  }

  &:focus-visible::-webkit-slider-thumb {
    box-shadow: 0 0 0 4px rgba(151, 135, 243, 0.25), 0 2px 8px rgba(0, 0, 0, 0.2);
  }
`;

const SliderWrapper = styled.div`
  position: relative;
  width: ${({ $compact }) => $compact ? '140px' : '100%'};
  min-width: ${({ $compact }) => $compact ? '100px' : 'auto'};
  height: 22px;
  display: flex;
  align-items: center;
  flex: ${({ $compact }) => $compact ? '1' : 'unset'};

  ${SliderTrack} {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  ${Slider} {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
`;

const ValueDisplay = styled.div`
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: ${({ $compact }) => $compact ? '2px' : '4px'};
  white-space: nowrap;
`;

const CurrentValue = styled.span`
  font-size: ${({ $compact }) => $compact ? '16px' : '24px'};
  font-weight: 700;

  /* TEXT COLOR - CRITICAL FOR LIGHT MODE */
  color: ${({ theme }) => theme.mode === 'dark'
    ? '#F8FAFC'
    : '#1E293B'};
`;

const MaxValue = styled.span`
  font-size: ${({ $compact }) => $compact ? '12px' : '14px'};
  font-weight: 500;

  /* Violet-tinted text */
  color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(196, 181, 253, 0.8)'
    : 'rgba(101, 84, 212, 0.7)'};
`;

const HelpText = styled.p`
  font-size: 11px;
  text-align: center;
  margin: 0;
  line-height: 1.4;

  /* Violet-tinted text */
  color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(196, 181, 253, 0.6)'
    : 'rgba(101, 84, 212, 0.6)'};
`;

// ============================================
// MAIN COMPONENT
// ============================================
const PreviewControlsDock = ({
  platform = 'apple',
  onPlatformChange,
  progress = 0,
  onProgressChange,
  maxProgress = 10,
  progressStep = 1,
  progressLabel = 'Simular Progreso',
  showProgress = true,
  helpText = 'Mueve el slider para ver cómo cambia el pase',
  compact = false,
}) => {
  const progressPercent = maxProgress > 0 ? (progress / maxProgress) * 100 : 0;

  // Format large numbers
  const formatValue = (val) => {
    if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}k`;
    }
    return val;
  };

  // Compact mode: Only show progress simulator in horizontal layout
  if (compact) {
    return (
      <DockContainer $compact>
        <SectionLabel $compact>{progressLabel}</SectionLabel>
        <SliderWrapper $compact>
          <SliderTrack>
            <SliderFill $progress={progressPercent} />
          </SliderTrack>
          <Slider
            type="range"
            min={0}
            max={maxProgress}
            step={progressStep}
            value={progress}
            onChange={(e) => onProgressChange?.(parseInt(e.target.value, 10))}
          />
        </SliderWrapper>
        <ValueDisplay $compact>
          <CurrentValue $compact>{formatValue(progress)}</CurrentValue>
          <MaxValue $compact>/ {formatValue(maxProgress)}</MaxValue>
        </ValueDisplay>
      </DockContainer>
    );
  }

  // Full mode: Platform switch + progress simulator stacked
  return (
    <DockContainer>
      {/* Platform Segmented Control */}
      <SegmentedControl>
        <SegmentButton
          type="button"
          $active={platform === 'apple'}
          onClick={() => onPlatformChange?.('apple')}
        >
          <PlatformIcon>🍎</PlatformIcon>
          Apple Wallet
        </SegmentButton>
        <SegmentButton
          type="button"
          $active={platform === 'google'}
          onClick={() => onPlatformChange?.('google')}
        >
          <PlatformIcon>🤖</PlatformIcon>
          Google Wallet
        </SegmentButton>
      </SegmentedControl>

      {/* Progress Simulator */}
      {showProgress && (
        <SimulatorSection>
          <SectionLabel>{progressLabel}</SectionLabel>

          <SliderWrapper>
            <SliderTrack>
              <SliderFill $progress={progressPercent} />
            </SliderTrack>
            <Slider
              type="range"
              min={0}
              max={maxProgress}
              step={progressStep}
              value={progress}
              onChange={(e) => onProgressChange?.(parseInt(e.target.value, 10))}
            />
          </SliderWrapper>

          <ValueDisplay>
            <CurrentValue>{formatValue(progress)}</CurrentValue>
            <MaxValue>/ {formatValue(maxProgress)}</MaxValue>
          </ValueDisplay>

          {helpText && <HelpText>{helpText}</HelpText>}
        </SimulatorSection>
      )}
    </DockContainer>
  );
};

export default PreviewControlsDock;
