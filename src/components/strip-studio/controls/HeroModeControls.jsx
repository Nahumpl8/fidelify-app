import { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Image as ImageIcon, Upload, CheckCircle } from 'lucide-react';

/**
 * HeroModeControls - Controls for the Hero Minimalist (Starbucks style) visual strategy
 * Features two dropzones: Empty state and Completed state
 */
const HeroModeControls = ({
  brandingConfig = {},
  rulesConfig = {},
  updateBranding,
  uploadImage,
  simulatedProgress,
  setSimulatedProgress,
  isUploading = false,
}) => {
  const [dragOver, setDragOver] = useState(null);
  const emptyInputRef = useRef(null);
  const completedInputRef = useRef(null);

  const totalStamps = rulesConfig.target_stamps || 8;

  const handleDrop = useCallback(async (e, type) => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await uploadImage(file, type);
    }
  }, [uploadImage]);

  const handleFileSelect = useCallback(async (e, type) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadImage(file, type);
    }
  }, [uploadImage]);

  const handleRemove = useCallback((type) => {
    if (type === 'strip') {
      updateBranding({ strip_image_url: null, hero_image_url: null });
    } else if (type === 'strip_completed') {
      updateBranding({ strip_completed_image_url: null });
    }
  }, [updateBranding]);

  return (
    <Container>
      {/* Empty State Dropzone */}
      <Section>
        <SectionHeader>
          <ImageIcon size={14} />
          <span>Estado Vacio (En Progreso)</span>
        </SectionHeader>
        <DropZone
          $hasImage={!!brandingConfig.strip_image_url}
          $dragOver={dragOver === 'empty'}
          onDragOver={(e) => { e.preventDefault(); setDragOver('empty'); }}
          onDragLeave={() => setDragOver(null)}
          onDrop={(e) => handleDrop(e, 'strip')}
          onClick={() => emptyInputRef.current?.click()}
        >
          {brandingConfig.strip_image_url ? (
            <>
              <PreviewImage src={brandingConfig.strip_image_url} alt="Empty state" />
              <ImageOverlay>
                <OverlayButton onClick={(e) => { e.stopPropagation(); handleRemove('strip'); }}>
                  Eliminar
                </OverlayButton>
              </ImageOverlay>
            </>
          ) : (
            <DropContent>
              <UploadIcon><Upload size={24} /></UploadIcon>
              <DropText>Arrastra o sube imagen</DropText>
              <DropHint>Ej: Taza vacia, producto sin personalizar</DropHint>
            </DropContent>
          )}
          <input
            ref={emptyInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect(e, 'strip')}
          />
        </DropZone>
      </Section>

      {/* Completed State Dropzone */}
      <Section>
        <SectionHeader>
          <CheckCircle size={14} />
          <span>Estado Completado (100%)</span>
        </SectionHeader>
        <DropZone
          $hasImage={!!brandingConfig.strip_completed_image_url}
          $dragOver={dragOver === 'completed'}
          $completed
          onDragOver={(e) => { e.preventDefault(); setDragOver('completed'); }}
          onDragLeave={() => setDragOver(null)}
          onDrop={(e) => handleDrop(e, 'strip_completed')}
          onClick={() => completedInputRef.current?.click()}
        >
          {brandingConfig.strip_completed_image_url ? (
            <>
              <PreviewImage src={brandingConfig.strip_completed_image_url} alt="Completed state" />
              <ImageOverlay>
                <OverlayButton onClick={(e) => { e.stopPropagation(); handleRemove('strip_completed'); }}>
                  Eliminar
                </OverlayButton>
              </ImageOverlay>
            </>
          ) : (
            <DropContent>
              <UploadIcon $completed><Upload size={24} /></UploadIcon>
              <DropText>Arrastra o sube imagen</DropText>
              <DropHint>Ej: Taza llena, producto listo</DropHint>
            </DropContent>
          )}
          <input
            ref={completedInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect(e, 'strip_completed')}
          />
        </DropZone>
      </Section>

      {/* Progress Simulator */}
      <Section>
        <SectionHeader>
          <span>Simular Progreso</span>
          <ProgressValue>
            {simulatedProgress} / {totalStamps}
            {simulatedProgress >= totalStamps && ' - Completo'}
          </ProgressValue>
        </SectionHeader>
        <SliderContainer>
          <SliderLabel>0%</SliderLabel>
          <Slider
            type="range"
            min="0"
            max={totalStamps}
            step="1"
            value={simulatedProgress}
            onChange={(e) => setSimulatedProgress(parseInt(e.target.value))}
          />
          <SliderLabel>100%</SliderLabel>
        </SliderContainer>
        <ProgressBar>
          <ProgressFill $percentage={(simulatedProgress / totalStamps) * 100} />
        </ProgressBar>
      </Section>

      {/* Info Tip */}
      <InfoBox>
        <InfoIcon>💡</InfoIcon>
        <InfoText>
          La imagen cambiara automaticamente cuando el cliente alcance la meta de {totalStamps} sellos.
        </InfoText>
      </InfoBox>
    </Container>
  );
};

// ============================================
// STYLED COMPONENTS
// ============================================

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

const DropZone = styled.div`
  aspect-ratio: 3.82 / 1;
  border-radius: 12px;
  background: ${({ $hasImage, $dragOver, $completed }) =>
    $hasImage
      ? 'transparent'
      : $dragOver
        ? $completed
          ? 'rgba(17, 185, 129, 0.15)'
          : 'rgba(99, 102, 241, 0.15)'
        : 'rgba(255, 255, 255, 0.03)'};
  border: 2px dashed ${({ $hasImage, $dragOver, $completed }) =>
    $hasImage
      ? 'transparent'
      : $dragOver
        ? $completed
          ? '#11B981'
          : '#6366F1'
        : 'rgba(255, 255, 255, 0.15)'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background: ${({ $hasImage }) => $hasImage ? 'transparent' : 'rgba(255, 255, 255, 0.06)'};
    border-color: ${({ $hasImage, $completed }) => $hasImage ? 'transparent' : $completed ? '#11B981' : '#6366F1'};
  }
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ImageOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${DropZone}:hover & {
    opacity: 1;
  }
`;

const OverlayButton = styled.button`
  padding: 8px 16px;
  background: rgba(239, 68, 68, 0.9);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const DropContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const UploadIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${({ $completed }) => $completed
    ? 'linear-gradient(135deg, rgba(17, 185, 129, 0.2), rgba(17, 185, 129, 0.1))'
    : 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.1))'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $completed }) => $completed ? '#11B981' : '#6366F1'};
`;

const DropText = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
`;

const DropHint = styled.span`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
`;

const ProgressValue = styled.span`
  margin-left: auto;
  font-size: 13px;
  font-weight: 500;
  color: #11B981;
`;

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SliderLabel = styled.span`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  min-width: 30px;
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
    background: #11B981;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(17, 185, 129, 0.4);
    transition: transform 0.2s;
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  width: ${({ $percentage }) => $percentage}%;
  height: 100%;
  background: linear-gradient(90deg, #11B981, #059669);
  border-radius: 2px;
  transition: width 0.3s ease;
`;

const InfoBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  background: rgba(17, 185, 129, 0.1);
  border: 1px solid rgba(17, 185, 129, 0.2);
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

export default HeroModeControls;
