import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xs};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const PickerWrapper = styled.div`
  position: relative;
`;

const ColorButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm};
  width: 100%;
  padding: ${({ theme }) => theme.space.sm};
  background: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radii.lg};
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ColorSwatch = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ $color }) => $color};
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const ColorValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: monospace;
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: ${({ theme }) => theme.space.xs};
  padding: ${({ theme }) => theme.space.md};
  background: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: 100;
`;

const PresetColors = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: ${({ theme }) => theme.space.xs};
  margin-bottom: ${({ theme }) => theme.space.md};
`;

const PresetButton = styled.button`
  width: 100%;
  aspect-ratio: 1;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ $color }) => $color};
  border: 2px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.primary : 'transparent'};
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const CustomColorInput = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.sm};
  align-items: center;
`;

const HexInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.space.sm};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: monospace;
  font-size: ${({ theme }) => theme.fontSizes.sm};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const NativeColorInput = styled.input`
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  overflow: hidden;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  &::-webkit-color-swatch {
    border: none;
    border-radius: ${({ theme }) => theme.radii.md};
  }
`;

const PRESET_COLORS = [
  '#000000',
  '#FFFFFF',
  '#6366F1',
  '#8B5CF6',
  '#EC4899',
  '#EF4444',
  '#F97316',
  '#EAB308',
  '#22C55E',
  '#14B8A6',
  '#0EA5E9',
  '#3B82F6',
];

/**
 * ColorPicker - Color selection with presets and custom input
 */
const ColorPicker = ({ label, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hexValue, setHexValue] = useState(value || '#000000');
  const containerRef = useRef(null);

  useEffect(() => {
    setHexValue(value || '#000000');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePresetClick = (color) => {
    setHexValue(color);
    onChange(color);
  };

  const handleHexChange = (e) => {
    const newValue = e.target.value;
    setHexValue(newValue);

    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const handleNativeChange = (e) => {
    const newValue = e.target.value;
    setHexValue(newValue);
    onChange(newValue);
  };

  return (
    <Container ref={containerRef}>
      {label && <Label>{label}</Label>}

      <PickerWrapper>
        <ColorButton type="button" onClick={() => setIsOpen(!isOpen)}>
          <ColorSwatch $color={value} />
          <ColorValue>{value?.toUpperCase()}</ColorValue>
        </ColorButton>

        {isOpen && (
          <Dropdown>
            <PresetColors>
              {PRESET_COLORS.map((color) => (
                <PresetButton
                  key={color}
                  type="button"
                  $color={color}
                  $active={value?.toUpperCase() === color.toUpperCase()}
                  onClick={() => handlePresetClick(color)}
                />
              ))}
            </PresetColors>

            <CustomColorInput>
              <HexInput
                type="text"
                value={hexValue}
                onChange={handleHexChange}
                placeholder="#000000"
                maxLength={7}
              />
              <NativeColorInput
                type="color"
                value={hexValue}
                onChange={handleNativeChange}
              />
            </CustomColorInput>
          </Dropdown>
        )}
      </PickerWrapper>
    </Container>
  );
};

export default ColorPicker;
