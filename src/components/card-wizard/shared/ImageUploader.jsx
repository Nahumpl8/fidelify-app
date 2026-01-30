import { useRef, useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.glass?.textSecondary || theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const UploadArea = styled.div`
  position: relative;
  border: 2px dashed
    ${({ $hasImage, $isDragging, theme }) =>
    $isDragging
      ? theme.colors.primary
      : $hasImage
        ? theme.colors.primary + '66'
        : theme.colors.glass?.border || 'rgba(255, 255, 255, 0.15)'};
  border-radius: 12px;
  background: ${({ $isDragging, theme }) =>
    $isDragging
      ? `${theme.colors.primary}15`
      : theme.colors.glass?.bg || 'rgba(0, 0, 0, 0.2)'};
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => `${theme.colors.primary}10`};
  }

  aspect-ratio: ${({ $aspectRatio }) => $aspectRatio || '1'};
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Placeholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: ${({ theme }) => theme.space.xl};
  text-align: center;
`;

const PlaceholderIcon = styled.span`
  font-size: 24px;
  margin-bottom: 8px;
  opacity: 0.7;
`;

const PlaceholderText = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.glass?.textMuted || theme.colors.text.muted};
  margin: 0;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => theme.colors.backdrop};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid ${({ theme }) => theme.colors.borderLight};
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(220, 38, 38, 0.9);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s ease;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

  ${UploadArea}:hover & {
    opacity: 1;
  }

  &:hover {
    background: rgba(220, 38, 38, 1);
    transform: scale(1.1);
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

/**
 * ImageUploader - Single image upload with preview
 */
const ImageUploader = ({
  label,
  value,
  onChange,
  onRemove,
  isLoading = false,
  aspectRatio = '1',
  accept = 'image/*',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleClick = () => {
    if (!isLoading) {
      inputRef.current?.click();
    }
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onChange(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    } else if (onChange) {
      // Fallback: call onChange with null to clear the image
      onChange(null);
    }
  };

  return (
    <Container>
      {label && <Label>{label}</Label>}

      <UploadArea
        $hasImage={!!value}
        $isDragging={isDragging}
        $aspectRatio={aspectRatio}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {value ? (
          <>
            <PreviewImage src={value} alt="Preview" />
            <RemoveButton type="button" onClick={handleRemove} title="Eliminar imagen">
              ✕
            </RemoveButton>
          </>
        ) : (
          <Placeholder>
            <PlaceholderIcon>📷</PlaceholderIcon>
            <PlaceholderText>
              {isDragging
                ? 'Suelta la imagen aqui'
                : 'Arrastra una imagen o haz clic'}
            </PlaceholderText>
          </Placeholder>
        )}

        {isLoading && (
          <LoadingOverlay>
            <Spinner />
          </LoadingOverlay>
        )}
      </UploadArea>

      <HiddenInput
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
      />
    </Container>
  );
};

export default ImageUploader;
