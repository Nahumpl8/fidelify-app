import { useState, useRef, useCallback } from 'react';
import styled, { css } from 'styled-components';
import {
  Star, Coffee, Scissors, Heart, Smile, Check, Gift, Sparkles, Zap, Crown,
  ThumbsUp, Award, Soup, Beer, ShoppingBag, Music, Book, Camera, Car, Briefcase,
  AlignLeft, AlignCenter, AlignRight, Upload, Layers, Grip,
  Grid3x3, Sparkle, CircleDot, Sticker, Paintbrush,
  AlignVerticalDistributeCenter, AlignVerticalJustifyStart, AlignVerticalJustifyEnd, Maximize2
} from 'lucide-react';
import ImageUploader from '../../card-wizard/shared/ImageUploader';

const EXTENDED_ICON_OPTIONS = [
  { id: 'star', name: 'Estrella', Icon: Star },
  { id: 'heart', name: 'Corazon', Icon: Heart },
  { id: 'check', name: 'Check', Icon: Check },
  { id: 'crown', name: 'Corona', Icon: Crown },
  { id: 'sparkles', name: 'Brillos', Icon: Sparkles },
  { id: 'zap', name: 'Rayo', Icon: Zap },
  { id: 'smile', name: 'Carita', Icon: Smile },
  { id: 'thumbsUp', name: 'Like', Icon: ThumbsUp },
  { id: 'coffee', name: 'Cafe', Icon: Coffee },
  { id: 'beer', name: 'Cerveza', Icon: Beer },
  { id: 'gift', name: 'Regalo', Icon: Gift },
  { id: 'scissors', name: 'Tijeras', Icon: Scissors },
  { id: 'car', name: 'Auto', Icon: Car },
  { id: 'camera', name: 'Camara', Icon: Camera },
  { id: 'music', name: 'Musica', Icon: Music },
  { id: 'shoppingBag', name: 'Bolsa', Icon: ShoppingBag },
  { id: 'award', name: 'Premio', Icon: Award },
  { id: 'book', name: 'Libro', Icon: Book },
  { id: 'briefcase', name: 'Maletin', Icon: Briefcase },
  { id: 'soup', name: 'Caldo', Icon: Soup },
];

const STRIP_LAYOUTS = [
  { id: 'left', name: 'Izquierda', Icon: AlignLeft },
  { id: 'center', name: 'Centro', Icon: AlignCenter },
  { id: 'right', name: 'Derecha', Icon: AlignRight },
];

/**
 * ClassicModeControls - Controls for the Iconic Grid visual strategy
 * Features 60fps slider updates with requestAnimationFrame optimization
 */
const ClassicModeControls = ({
  brandingConfig = {},
  updateBranding,
  uploadImage,
  isUploading = false,
}) => {
  const rafRef = useRef(null);
  const [localScale, setLocalScale] = useState(brandingConfig.icon_scale || 0.8);
  const [localStampScale, setLocalStampScale] = useState(brandingConfig.stamp_scale || 0.9);
  const [localSpacing, setLocalSpacing] = useState(brandingConfig.icon_spacing || 6);
  const [manualGridEnabled, setManualGridEnabled] = useState(brandingConfig.grid_manual_enabled || false);
  const [manualCols, setManualCols] = useState(brandingConfig.grid_manual_cols || 5);
  const [manualRows, setManualRows] = useState(brandingConfig.grid_manual_rows || 2);
  const [splitRatio, setSplitRatio] = useState(brandingConfig.split_ratio || 40);
  const [inactiveStyle, setInactiveStyle] = useState(brandingConfig.inactive_style || 'normal');
  const [vAlign, setVAlign] = useState(brandingConfig.grid_vertical_align || 'center');

  // 60fps optimized slider update
  const handleSliderChange = useCallback((key, value, setLocal) => {
    setLocal(value);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      updateBranding({ [key]: value });
    });
  }, [updateBranding]);

  const handleUpload = async (file, type) => {
    if (file === null) {
      if (type === 'strip_texture') updateBranding({ strip_texture_url: null });
      if (type === 'strip_side') updateBranding({ strip_side_image_url: null });
      if (type === 'stamp') updateBranding({ stamp_image_url: null });
      if (type === 'goal_stamp') updateBranding({ goal_stamp_image_url: null });
      return;
    }
    await uploadImage(file, type);
  };

  const currentLayout = brandingConfig.strip_layout || 'center';
  const showSideImage = currentLayout === 'left' || currentLayout === 'right';

  return (
    <Container>
      {/* Distribution */}
      <Section>
        <SectionHeader>
          <Grip size={14} />
          <span>Distribucion</span>
        </SectionHeader>
        <LayoutGrid>
          {STRIP_LAYOUTS.map((layout) => (
            <LayoutButton
              key={layout.id}
              $active={currentLayout === layout.id}
              onClick={() => updateBranding({ strip_layout: layout.id })}
            >
              <layout.Icon size={20} />
              <span>{layout.name}</span>
            </LayoutButton>
          ))}
        </LayoutGrid>
      </Section>

      {/* Side Image - Only for left/right layouts */}
      {showSideImage && (
        <Section>
          <SectionHeader>
            <Upload size={14} />
            <span>Imagen Lateral</span>
          </SectionHeader>
          <ImageUploader
            label={currentLayout === 'left' ? 'Imagen Derecha' : 'Imagen Izquierda'}
            value={brandingConfig.strip_side_image_url}
            onChange={(f) => handleUpload(f, 'strip_side')}
            isLoading={isUploading}
            aspectRatio="1"
            description="Imagen junto a los sellos"
          />
          <FitSelector>
            {['cover', 'contain'].map((fit) => (
              <FitButton
                key={fit}
                $active={(brandingConfig.strip_side_image_fit || 'cover') === fit}
                onClick={() => updateBranding({ strip_side_image_fit: fit })}
              >
                {fit === 'cover' ? 'Recortar' : 'Contener'}
              </FitButton>
            ))}
          </FitSelector>
        </Section>
      )}

      {/* Spacing (Gap) */}
      <Section>
        <SectionHeader>
          <span>Espaciado (Gap)</span>
          <SliderValue>{localSpacing}px</SliderValue>
        </SectionHeader>
        <Slider
          type="range"
          min="2"
          max="20"
          step="1"
          value={localSpacing}
          onChange={(e) => handleSliderChange('icon_spacing', parseInt(e.target.value), setLocalSpacing)}
        />
      </Section>

      {/* Stamp Scale (Container) */}
      <Section>
        <SectionHeader>
          <span>Tamaño del Sello (Círculo)</span>
          <SliderValue>{Math.round(localStampScale * 100)}%</SliderValue>
        </SectionHeader>
        <Slider
          type="range"
          min="0.2"
          max="1.0"
          step="0.05"
          value={localStampScale}
          onChange={(e) => handleSliderChange('stamp_scale', parseFloat(e.target.value), setLocalStampScale)}
        />
      </Section>

      {/* Icon Scale (Content) */}
      <Section>
        <SectionHeader>
          <span>Escala del Dibujo (Icono)</span>
          <SliderValue>{Math.round(localScale * 100)}%</SliderValue>
        </SectionHeader>
        <Slider
          type="range"
          min="0.2"
          max="1.0"
          step="0.05"
          value={localScale}
          onChange={(e) => handleSliderChange('icon_scale', parseFloat(e.target.value), setLocalScale)}
        />
      </Section>

      {/* Inactive Style Selector */}
      <Section>
        <SectionHeader>
          <span>Estilo Inactivo</span>
        </SectionHeader>
        <InactiveStyleGrid>
          {[
            { id: 'normal', label: 'Normal', hint: 'Icono atenuado' },
            { id: 'outline_only', label: 'Solo Borde', hint: 'Sin icono' },
            { id: 'background_only', label: 'Solo Fondo', hint: 'Sin icono' },
            { id: 'hidden', label: 'Oculto', hint: 'Invisible' },
          ].map((style) => (
            <InactiveStyleButton
              key={style.id}
              $active={inactiveStyle === style.id}
              onClick={() => {
                setInactiveStyle(style.id);
                updateBranding({ inactive_style: style.id });
              }}
            >
              <span>{style.label}</span>
              <InactiveStyleHint>{style.hint}</InactiveStyleHint>
            </InactiveStyleButton>
          ))}
        </InactiveStyleGrid>
      </Section>

      {/* Split Width Control (Only show for left/right layouts) */}
      {(brandingConfig.strip_layout === 'left' || brandingConfig.strip_layout === 'right') && (
        <Section>
          <SectionHeader>
            <span>Ancho Lateral (%)</span>
            <SliderValue>{splitRatio}%</SliderValue>
          </SectionHeader>
          <Slider
            type="range"
            min="20"
            max="70"
            step="5"
            value={splitRatio}
            onChange={(e) => handleSliderChange('split_ratio', parseInt(e.target.value), setSplitRatio)}
          />
        </Section>
      )}

      {/* Grid Presets */}
      <Section>
        <SectionHeader>
          <Sparkle size={14} />
          <span>Presets de Grid</span>
        </SectionHeader>
        <PresetGrid>
          <PresetButton
            onClick={() => {
              updateBranding({ icon_scale: 1.0, icon_spacing: 4 });
              setLocalScale(1.0);
              setLocalSpacing(4);
            }}
          >
            <CircleDot size={18} />
            <span>Burbujas</span>
            <PresetHint>Max size, touching</PresetHint>
          </PresetButton>
          <PresetButton
            onClick={() => {
              updateBranding({ icon_scale: 0.4, icon_spacing: 12 });
              setLocalScale(0.4);
              setLocalSpacing(12);
            }}
          >
            <Sparkle size={18} />
            <span>Minimal</span>
            <PresetHint>Tiny dots, airy</PresetHint>
          </PresetButton>
          <PresetButton
            onClick={() => {
              updateBranding({ icon_scale: 0.8, icon_spacing: 8 });
              setLocalScale(0.8);
              setLocalSpacing(8);
            }}
          >
            <Sticker size={18} />
            <span>Sticker</span>
            <PresetHint>Balanced</PresetHint>
          </PresetButton>
        </PresetGrid>
      </Section>

      {/* Manual Grid Override */}
      <Section>
        <SectionHeader>
          <Grid3x3 size={14} />
          <span>Grid Manual</span>
        </SectionHeader>
        <ToggleRow onClick={() => {
          const newValue = !manualGridEnabled;
          setManualGridEnabled(newValue);
          updateBranding({ grid_manual_enabled: newValue });
        }}>
          <span>Habilitar Grid Manual</span>
          <Toggle $active={manualGridEnabled} />
        </ToggleRow>
        {manualGridEnabled && (
          <ManualGridInputs>
            <GridInput>
              <GridInputLabel>Columnas</GridInputLabel>
              <GridInputField
                type="number"
                min="1"
                max="10"
                value={manualCols}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setManualCols(val);
                  updateBranding({ grid_manual_cols: val });
                }}
              />
            </GridInput>
            <GridInput>
              <GridInputLabel>Filas</GridInputLabel>
              <GridInputField
                type="number"
                min="1"
                max="5"
                value={manualRows}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setManualRows(val);
                  updateBranding({ grid_manual_rows: val });
                }}
              />
            </GridInput>
          </ManualGridInputs>
        )}
      </Section>

      {/* Vertical Alignment */}
      <Section>
        <SectionHeader>
          <AlignVerticalDistributeCenter size={14} />
          <span>Alineación Vertical</span>
        </SectionHeader>
        <VerticalAlignGrid>
          {[
            { id: 'center', label: 'Centro/Compacto', Icon: AlignVerticalDistributeCenter, hint: 'Centra filas' },
            { id: 'stretch', label: 'Estirar/Llenar', Icon: Maximize2, hint: 'Llena altura' },
            { id: 'start', label: 'Arriba', Icon: AlignVerticalJustifyStart, hint: 'Pega arriba' },
            { id: 'end', label: 'Abajo', Icon: AlignVerticalJustifyEnd, hint: 'Pega abajo' },
          ].map((align) => (
            <VerticalAlignButton
              key={align.id}
              $active={vAlign === align.id}
              onClick={() => {
                setVAlign(align.id);
                updateBranding({ grid_vertical_align: align.id });
              }}
            >
              <align.Icon size={18} />
              <span>{align.label}</span>
              <VerticalAlignHint>{align.hint}</VerticalAlignHint>
            </VerticalAlignButton>
          ))}
        </VerticalAlignGrid>
      </Section>

      {/* Icon Selection */}
      <Section>
        <SectionHeader>
          <Star size={14} />
          <span>Icono</span>
        </SectionHeader>

        {/* Custom Image Uploader */}
        <ImageUploader
          label="Imagen Personalizada"
          value={brandingConfig.stamp_image_url}
          onChange={(f) => handleUpload(f, 'stamp')}
          isLoading={isUploading}
          aspectRatio="1"
          description="Icono para sellos regulares"
        />

        {/* Goal Stamp Image Uploader */}
        <ImageUploader
          label="Imagen del Sello Meta (Premio Final)"
          value={brandingConfig.goal_stamp_image_url}
          onChange={(f) => handleUpload(f, 'goal_stamp')}
          isLoading={isUploading}
          aspectRatio="1"
          description="Reemplaza el icono de regalo del último sello"
        />

        {!brandingConfig.stamp_image_url && (
          <IconGrid>
            {EXTENDED_ICON_OPTIONS.map(({ id, Icon }) => (
              <IconButton
                key={id}
                $active={brandingConfig.stamp_icon === id}
                onClick={() => updateBranding({ stamp_icon: id })}
              >
                <Icon size={18} />
              </IconButton>
            ))}
          </IconGrid>
        )}
      </Section>

      {/* Stamp Style */}
      <Section>
        <SectionHeader>
          <span>Estilo de Sello</span>
        </SectionHeader>
        <StyleSelector>
          <StyleButton
            $active={(brandingConfig.stamp_style || 'circle') === 'circle'}
            onClick={() => updateBranding({ stamp_style: 'circle' })}
          >
            Circulo
          </StyleButton>
          <StyleButton
            $active={brandingConfig.stamp_style === 'minimal'}
            onClick={() => updateBranding({ stamp_style: 'minimal' })}
          >
            Minimalista
          </StyleButton>
        </StyleSelector>
      </Section>

      {/* Background */}
      <Section>
        <SectionHeader>
          <Layers size={14} />
          <span>Fondo Strip</span>
        </SectionHeader>
        <ColorRow>
          <ColorLabel>Color Base</ColorLabel>
          <ColorInput
            type="color"
            value={brandingConfig.strip_background_color || '#FDF6EC'}
            onChange={(e) => updateBranding({ strip_background_color: e.target.value })}
          />
          <ColorHex>{brandingConfig.strip_background_color || '#FDF6EC'}</ColorHex>
        </ColorRow>

        <ImageUploader
          label="Textura (Opcional)"
          value={brandingConfig.strip_texture_url}
          onChange={(f) => handleUpload(f, 'strip_texture')}
          isLoading={isUploading}
          aspectRatio="3.82"
          description="Se superpone al color de fondo"
        />
      </Section>

      {/* Icon Colors Section */}
      <Section>
        <SectionHeader>
          <Paintbrush size={14} />
          <span>Colores del Icono</span>
        </SectionHeader>

        {/* Active Icon Colors */}
        <ColorSubLabel>Activo</ColorSubLabel>
        <ColorGrid>
          <ColorPickerMini>
            <ColorPickerLabel>Relleno</ColorPickerLabel>
            <ColorInput
              type="color"
              value={brandingConfig.stamp_fill_color || '#FFD700'}
              onChange={(e) => updateBranding({ stamp_fill_color: e.target.value })}
            />
          </ColorPickerMini>
          <ColorPickerMini>
            <ColorPickerLabel>Contorno</ColorPickerLabel>
            <ColorInput
              type="color"
              value={brandingConfig.stamp_stroke_color || '#B8860B'}
              onChange={(e) => updateBranding({ stamp_stroke_color: e.target.value })}
            />
          </ColorPickerMini>
        </ColorGrid>

        {/* Inactive Icon Colors */}
        <ColorSubLabel>Inactivo</ColorSubLabel>
        <ColorGrid>
          <ColorPickerMini>
            <ColorPickerLabel>Relleno</ColorPickerLabel>
            <ColorInput
              type="color"
              value={brandingConfig.stamp_inactive_fill || '#888888'}
              onChange={(e) => updateBranding({ stamp_inactive_fill: e.target.value })}
            />
          </ColorPickerMini>
          <ColorPickerMini>
            <ColorPickerLabel>Contorno</ColorPickerLabel>
            <ColorInput
              type="color"
              value={brandingConfig.stamp_inactive_stroke || '#CCCCCC'}
              onChange={(e) => updateBranding({ stamp_inactive_stroke: e.target.value })}
            />
          </ColorPickerMini>
        </ColorGrid>
      </Section>

      {/* Circle Background/Border Colors */}
      <Section>
        <SectionHeader>
          <CircleDot size={14} />
          <span>Fondo del Círculo</span>
        </SectionHeader>

        <ColorSubLabel>Activo</ColorSubLabel>
        <ColorGrid>
          <ColorPickerMini>
            <ColorPickerLabel>Fondo</ColorPickerLabel>
            <ColorInput
              type="color"
              value={brandingConfig.stamp_circle_active_bg || '#FFFFFF'}
              onChange={(e) => updateBranding({ stamp_circle_active_bg: e.target.value })}
            />
          </ColorPickerMini>
          <ColorPickerMini>
            <ColorPickerLabel>Borde</ColorPickerLabel>
            <ColorInput
              type="color"
              value={brandingConfig.stamp_circle_active_border || '#FFFFFF'}
              onChange={(e) => updateBranding({ stamp_circle_active_border: e.target.value })}
            />
          </ColorPickerMini>
        </ColorGrid>

        <ColorSubLabel>Inactivo</ColorSubLabel>
        <ColorGrid>
          <ColorPickerMini>
            <ColorPickerLabel>Fondo</ColorPickerLabel>
            <ColorInput
              type="color"
              value={brandingConfig.stamp_circle_inactive_bg || '#EEEEEE'}
              onChange={(e) => updateBranding({ stamp_circle_inactive_bg: e.target.value })}
            />
          </ColorPickerMini>
          <ColorPickerMini>
            <ColorPickerLabel>Borde</ColorPickerLabel>
            <ColorInput
              type="color"
              value={brandingConfig.stamp_circle_inactive_border || '#CCCCCC'}
              onChange={(e) => updateBranding({ stamp_circle_inactive_border: e.target.value })}
            />
          </ColorPickerMini>
        </ColorGrid>
      </Section>

      {/* Shadow Toggle */}
      <Section>
        <ToggleRow onClick={() => updateBranding({ icon_drop_shadow: !brandingConfig.icon_drop_shadow })}>
          <span>Sombra en Iconos</span>
          <Toggle $active={brandingConfig.icon_drop_shadow !== false} />
        </ToggleRow>
      </Section>
    </Container>
  );
};

// ============================================
// STYLED COMPONENTS
// ============================================

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
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

const SliderValue = styled.span`
  margin-left: auto;
  font-size: 13px;
  font-weight: 500;
  color: #11B981;
  font-family: monospace;
`;

const Slider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  appearance: none;
  cursor: pointer;
  transition: background 0.2s;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #11B981;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(17, 185, 129, 0.4);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(17, 185, 129, 0.5);
  }

  &:active::-webkit-slider-thumb {
    transform: scale(0.95);
  }
`;

const LayoutGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

const LayoutButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px;
  border-radius: 10px;
  background: ${({ $active }) => $active ? 'rgba(17, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)'};
  border: 2px solid ${({ $active }) => $active ? '#11B981' : 'rgba(255, 255, 255, 0.08)'};
  color: ${({ $active }) => $active ? 'white' : 'rgba(255, 255, 255, 0.6)'};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 11px;
  font-weight: 500;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: ${({ $active }) => $active ? '#11B981' : 'rgba(255, 255, 255, 0.15)'};
  }
`;

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
  margin-top: 8px;
`;

const IconButton = styled.button`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${({ $active }) => $active ? '#11B981' : 'rgba(255, 255, 255, 0.08)'};
  color: ${({ $active }) => $active ? 'white' : 'rgba(255, 255, 255, 0.6)'};
  border: 1px solid ${({ $active }) => $active ? '#11B981' : 'rgba(255, 255, 255, 0.15)'};
  box-shadow: ${({ $active }) => $active ? '0 0 12px rgba(17, 185, 129, 0.4)' : 'none'};

  &:hover {
    background: ${({ $active }) => $active ? '#11B981' : 'rgba(255, 255, 255, 0.15)'};
    color: white;
  }
`;

const StyleSelector = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const StyleButton = styled.button`
  padding: 10px 16px;
  border-radius: 8px;
  background: ${({ $active }) => $active ? 'rgba(17, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)'};
  border: 1px solid ${({ $active }) => $active ? '#11B981' : 'rgba(255, 255, 255, 0.08)'};
  color: ${({ $active }) => $active ? 'white' : 'rgba(255, 255, 255, 0.6)'};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
`;

const FitSelector = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 8px;
`;

const FitButton = styled(StyleButton)``;

const ColorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const ColorLabel = styled.span`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
`;

const ColorInput = styled.input`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: transparent;
  padding: 0;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  &::-webkit-color-swatch {
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
  }
`;

const ColorHex = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  font-family: monospace;
  margin-left: auto;
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
`;

const Toggle = styled.div`
  width: 40px;
  height: 22px;
  border-radius: 12px;
  position: relative;
  background: ${({ $active }) => $active ? '#11B981' : 'rgba(255, 255, 255, 0.15)'};
  transition: background 0.3s;
  box-shadow: ${({ $active }) => $active ? '0 0 8px rgba(17, 185, 129, 0.4)' : 'none'};

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ $active }) => $active ? '20px' : '2px'};
    width: 18px;
    height: 18px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
`;

const PresetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

const PresetButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.25s ease;
  font-size: 11px;
  font-weight: 600;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(99, 102, 241, 0.4);
    color: white;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    color: #818CF8;
  }
`;

const PresetHint = styled.span`
  font-size: 9px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
`;

const ManualGridInputs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 8px;
`;

const GridInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const GridInputLabel = styled.label`
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const GridInputField = styled.input`
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  font-family: monospace;
  transition: all 0.2s;

  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.08);
    border-color: #11B981;
    box-shadow: 0 0 0 3px rgba(17, 185, 129, 0.1);
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    opacity: 1;
  }
`;

const InactiveStyleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`;

const InactiveStyleButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border-radius: 8px;
  background: ${({ $active }) => $active ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)'};
  border: 2px solid ${({ $active }) => $active ? '#818CF8' : 'rgba(255, 255, 255, 0.08)'};
  color: ${({ $active }) => $active ? 'white' : 'rgba(255, 255, 255, 0.7)'};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 11px;
  font-weight: 600;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(99, 102, 241, 0.4);
    transform: translateY(-1px);
  }
`;

const InactiveStyleHint = styled.span`
  font-size: 9px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
`;

// Color Picker Compact Components
const ColorSubLabel = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: rgba(99, 102, 241, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 10px 0 6px;
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const ColorPickerMini = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.06);
`;

const ColorPickerLabel = styled.span`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  flex: 1;
`;

// Vertical Alignment Selector Components
const VerticalAlignGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`;

const VerticalAlignButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border-radius: 10px;
  background: ${({ $active }) => $active ? 'rgba(17, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)'};
  border: 2px solid ${({ $active }) => $active ? '#11B981' : 'rgba(255, 255, 255, 0.08)'};
  color: ${({ $active }) => $active ? 'white' : 'rgba(255, 255, 255, 0.6)'};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 10px;
  font-weight: 600;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: ${({ $active }) => $active ? '#11B981' : 'rgba(255, 255, 255, 0.15)'};
    transform: translateY(-1px);
  }

  svg {
    color: ${({ $active }) => $active ? '#11B981' : 'rgba(255, 255, 255, 0.5)'};
  }
`;

const VerticalAlignHint = styled.span`
  font-size: 9px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
`;

export default ClassicModeControls;
