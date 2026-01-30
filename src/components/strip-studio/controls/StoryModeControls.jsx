import { useState, useRef, useCallback } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { Film, Upload, Check, X } from 'lucide-react';

/**
 * StoryModeControls - Controls for the Progressive Story visual strategy
 * Features a timeline interface for uploading images for each step
 */
const StoryModeControls = ({
  brandingConfig = {},
  rulesConfig = {},
  updateBranding,
  uploadImage,
  simulatedProgress,
  setSimulatedProgress,
  isUploading = false,
}) => {
  const [selectedStep, setSelectedStep] = useState(0);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const fileInputRef = useRef(null);

  const totalStamps = rulesConfig.target_stamps || 8;
  const progressiveUrls = brandingConfig.progressive_strip_urls || [];

  const handleSlotClick = (index) => {
    setSelectedStep(index);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingIndex(selectedStep);
      try {
        const url = await uploadImage(file, `progressive_${selectedStep}`);
        const newUrls = [...progressiveUrls];
        newUrls[selectedStep] = url;
        updateBranding({ progressive_strip_urls: newUrls });
      } finally {
        setUploadingIndex(null);
      }
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [selectedStep, progressiveUrls, uploadImage, updateBranding]);

  const handleRemoveImage = (index) => {
    const newUrls = [...progressiveUrls];
    newUrls[index] = null;
    updateBranding({ progressive_strip_urls: newUrls });
  };

  return (
    <Container>
      {/* Timeline Header */}
      <Section>
        <SectionHeader>
          <Film size={14} />
          <span>Linea de Tiempo ({totalStamps} pasos)</span>
        </SectionHeader>
        <Description>
          Sube una imagen para cada paso del progreso. La imagen cambiara conforme el cliente avanza.
        </Description>
      </Section>

      {/* Timeline Slots */}
      <TimelineContainer>
        <TimelineLine />
        <TimelineSlots>
          {[...Array(totalStamps)].map((_, index) => {
            const hasImage = !!progressiveUrls[index];
            const isSelected = selectedStep === index;
            const isActive = index < simulatedProgress;
            const isCurrent = index === simulatedProgress;

            return (
              <TimelineSlot
                key={index}
                $selected={isSelected}
                $hasImage={hasImage}
                $active={isActive}
                $current={isCurrent}
                onClick={() => handleSlotClick(index)}
              >
                <SlotNumber>{index + 1}</SlotNumber>
                {hasImage ? (
                  <>
                    <SlotPreview src={progressiveUrls[index]} alt={`Step ${index + 1}`} />
                    <SlotCheck><Check size={10} /></SlotCheck>
                  </>
                ) : (
                  <SlotEmpty>
                    <Upload size={10} />
                  </SlotEmpty>
                )}
              </TimelineSlot>
            );
          })}
        </TimelineSlots>
      </TimelineContainer>

      {/* Selected Step Upload */}
      <Section>
        <SectionHeader>
          <span>Imagen Paso {selectedStep + 1}</span>
        </SectionHeader>
        <UploadArea
          $hasImage={!!progressiveUrls[selectedStep]}
          $uploading={uploadingIndex === selectedStep}
          onClick={handleUploadClick}
        >
          {uploadingIndex === selectedStep ? (
            <UploadingState>
              <Spinner />
              <span>Subiendo...</span>
            </UploadingState>
          ) : progressiveUrls[selectedStep] ? (
            <>
              <SelectedPreview src={progressiveUrls[selectedStep]} alt={`Step ${selectedStep + 1}`} />
              <UploadOverlay>
                <OverlayAction onClick={(e) => { e.stopPropagation(); handleUploadClick(); }}>
                  Cambiar
                </OverlayAction>
                <OverlayAction
                  $danger
                  onClick={(e) => { e.stopPropagation(); handleRemoveImage(selectedStep); }}
                >
                  Eliminar
                </OverlayAction>
              </UploadOverlay>
            </>
          ) : (
            <UploadContent>
              <UploadIcon><Upload size={24} /></UploadIcon>
              <UploadText>Arrastra o sube imagen</UploadText>
              <UploadHint>Imagen para el paso {selectedStep + 1}</UploadHint>
            </UploadContent>
          )}
        </UploadArea>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </Section>

      {/* Progress Simulator */}
      <Section>
        <SectionHeader>
          <span>Simular Progreso</span>
          <ProgressValue>{simulatedProgress} / {totalStamps}</ProgressValue>
        </SectionHeader>
        <SliderContainer>
          <SliderLabel>0</SliderLabel>
          <Slider
            type="range"
            min="0"
            max={totalStamps}
            step="1"
            value={simulatedProgress}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setSimulatedProgress(val);
              // Auto-select the current step for convenience
              if (val > 0 && val <= totalStamps) {
                setSelectedStep(val - 1);
              }
            }}
          />
          <SliderLabel>{totalStamps}</SliderLabel>
        </SliderContainer>
      </Section>

      {/* Upload Progress */}
      <ProgressInfo>
        <ProgressLabel>Imagenes subidas:</ProgressLabel>
        <ProgressCount>
          {progressiveUrls.filter(Boolean).length} / {totalStamps}
        </ProgressCount>
        <ProgressBarContainer>
          <ProgressBar $percentage={(progressiveUrls.filter(Boolean).length / totalStamps) * 100} />
        </ProgressBarContainer>
      </ProgressInfo>

      {/* Tip */}
      <InfoBox>
        <InfoIcon>💡</InfoIcon>
        <InfoText>
          Usa el slider para previsualizar como se vera la tarjeta en cada paso del progreso.
        </InfoText>
      </InfoBox>
    </Container>
  );
};

// ============================================
// STYLED COMPONENTS
// ============================================

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px 0;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Description = styled.p`
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.5;
`;

const TimelineContainer = styled.div`
  position: relative;
  padding: 16px 0;
`;

const TimelineLine = styled.div`
  position: absolute;
  top: 50%;
  left: 20px;
  right: 20px;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-50%);
`;

const TimelineSlots = styled.div`
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 1;
  overflow-x: auto;
  padding: 0 8px;
  gap: 8px;

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
`;

const TimelineSlot = styled.div`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 10px;
  background: ${({ $selected, $hasImage, $active }) =>
    $selected
      ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
      : $hasImage
        ? 'rgba(17, 185, 129, 0.2)'
        : $active
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(255, 255, 255, 0.03)'};
  border: 2px solid ${({ $selected, $hasImage, $current }) =>
    $selected
      ? '#6366F1'
      : $hasImage
        ? '#11B981'
        : $current
          ? 'rgba(255, 255, 255, 0.3)'
          : 'rgba(255, 255, 255, 0.08)'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: scale(1.05);
    border-color: ${({ $selected }) => $selected ? '#6366F1' : 'rgba(255, 255, 255, 0.3)'};
  }
`;

const SlotNumber = styled.span`
  position: absolute;
  top: 2px;
  left: 4px;
  font-size: 8px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
  z-index: 2;
`;

const SlotPreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
`;

const SlotCheck = styled.div`
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #11B981;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const SlotEmpty = styled.div`
  color: rgba(255, 255, 255, 0.3);
`;

const UploadArea = styled.div`
  aspect-ratio: 3.82 / 1;
  border-radius: 12px;
  background: ${({ $hasImage }) => $hasImage ? 'transparent' : 'rgba(255, 255, 255, 0.03)'};
  border: 2px dashed ${({ $hasImage }) => $hasImage ? 'transparent' : 'rgba(255, 255, 255, 0.15)'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background: ${({ $hasImage }) => $hasImage ? 'transparent' : 'rgba(255, 255, 255, 0.06)'};
    border-color: ${({ $hasImage }) => $hasImage ? 'transparent' : '#6366F1'};
  }
`;

const SelectedPreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const UploadOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${UploadArea}:hover & {
    opacity: 1;
  }
`;

const OverlayAction = styled.button`
  padding: 8px 16px;
  background: ${({ $danger }) => $danger ? 'rgba(239, 68, 68, 0.9)' : 'rgba(255, 255, 255, 0.9)'};
  border: none;
  border-radius: 8px;
  color: ${({ $danger }) => $danger ? 'white' : 'black'};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const UploadContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const UploadIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366F1;
`;

const UploadText = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
`;

const UploadHint = styled.span`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
`;

const UploadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
`;

const Spinner = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: #6366F1;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const ProgressValue = styled.span`
  margin-left: auto;
  font-size: 13px;
  font-weight: 500;
  color: #6366F1;
`;

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SliderLabel = styled.span`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  min-width: 20px;
  text-align: center;
`;

const Slider = styled.input`
  flex: 1;
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
    background: #6366F1;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
    transition: transform 0.2s;
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }
`;

const ProgressInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const ProgressLabel = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
`;

const ProgressCount = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #6366F1;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
`;

const ProgressBar = styled.div`
  width: ${({ $percentage }) => $percentage}%;
  height: 100%;
  background: linear-gradient(90deg, #6366F1, #8B5CF6);
  border-radius: 2px;
  transition: width 0.3s ease;
`;

const InfoBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 10px;
`;

const InfoIcon = styled.span`
  font-size: 16px;
`;

const InfoText = styled.p`
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
`;

export default StoryModeControls;
