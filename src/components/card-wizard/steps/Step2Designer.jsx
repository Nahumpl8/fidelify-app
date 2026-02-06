import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes, css } from 'styled-components';
import { useOrganization } from '../../../context/OrganizationContext';
import ImageUploader from '../shared/ImageUploader';
import { StripStudio } from '../../strip-studio';
import {
  Star, Heart, Check, Coffee, Scissors, Gift, Award, Crown, Sparkles, Utensils, Beer, ShoppingBag,
  Zap, Smile, ThumbsUp, Music, Book, Camera, Car, Briefcase, User, Settings, Layout, Palette, Target,
  Image as ImageIcon, ChevronRight, ChevronLeft, Bell, X, Grip, Soup, MapPin, BellRing, Layers, Wand2, Film, Upload, Eye, QrCode,
  ScanLine
} from 'lucide-react';

// ============================================
// ANIMATIONS
// ============================================
const slideInRight = keyframes`
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
`;
const slideInLeft = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

// Standard micro-steps for loyalty programs (stamps/points)
const MICRO_STEPS_STANDARD = [
  { id: 'rules', title: 'Reglas', subtitle: 'Lógica', icon: Target, focusTarget: 'rules' },
  { id: 'identity', title: 'Identidad', subtitle: 'Marca', icon: User, focusTarget: 'logo' },
  { id: 'style', title: 'Estilo', subtitle: 'Colores', icon: Palette, focusTarget: 'colors' },
  { id: 'layout', title: 'Diseño', subtitle: 'Grid', icon: Layout, focusTarget: 'strip' },
  { id: 'extras', title: 'Extras', subtitle: 'Opciones', icon: Settings, focusTarget: 'fields' },
];

// Professional mode micro-steps (no strip/layout, focused on identity)
const MICRO_STEPS_PROFESSIONAL = [
  { id: 'rules', title: 'Tipo', subtitle: 'Programa', icon: Target, focusTarget: 'rules' },
  { id: 'identity', title: 'Perfil', subtitle: 'Contacto', icon: User, focusTarget: 'logo' },
  { id: 'style', title: 'Estilo', subtitle: 'Colores', icon: Palette, focusTarget: 'colors' },
  { id: 'extras', title: 'Extras', subtitle: 'Opciones', icon: Settings, focusTarget: 'fields' },
];

// Default for backward compatibility
const MICRO_STEPS = MICRO_STEPS_STANDARD;

const EXTENDED_ICON_OPTIONS = [
  // Shapes
  { id: 'star', name: 'Estrella', Icon: Star },
  { id: 'heart', name: 'Corazon', Icon: Heart },
  { id: 'check', name: 'Check', Icon: Check },
  { id: 'crown', name: 'Corona', Icon: Crown },
  { id: 'sparkles', name: 'Brillos', Icon: Sparkles },
  { id: 'zap', name: 'Rayo', Icon: Zap },
  { id: 'smile', name: 'Carita', Icon: Smile },
  { id: 'thumbsUp', name: 'Like', Icon: ThumbsUp },
  // Food
  { id: 'coffee', name: 'Cafe', Icon: Coffee },
  { id: 'utensils', name: 'Cubiertos', Icon: Utensils },
  { id: 'beer', name: 'Cerveza', Icon: Beer },
  { id: 'gift', name: 'Regalo', Icon: Gift },
  // Services
  { id: 'scissors', name: 'Tijeras', Icon: Scissors },
  { id: 'car', name: 'Auto', Icon: Car },
  { id: 'camera', name: 'Camara', Icon: Camera },
  { id: 'music', name: 'Musica', Icon: Music },
  // Business
  { id: 'shoppingBag', name: 'Bolsa', Icon: ShoppingBag },
  { id: 'award', name: 'Premio', Icon: Award },
  { id: 'book', name: 'Libro', Icon: Book },
  { id: 'briefcase', name: 'Maletin', Icon: Briefcase },
  { id: 'soup', name: 'Caldo', Icon: Soup },
];

const PRESET_PALETTES = [
  { bg: '#212121', text: '#FFFFFF', name: 'Midnight' },
  { bg: '#F44336', text: '#FFFFFF', name: 'Red' },
  { bg: '#E91E63', text: '#FFFFFF', name: 'Pink' },
  { bg: '#9C27B0', text: '#FFFFFF', name: 'Purple' },
  { bg: '#673AB7', text: '#FFFFFF', name: 'Deep Purple' },
  { bg: '#3F51B5', text: '#FFFFFF', name: 'Indigo' },
  { bg: '#2196F3', text: '#FFFFFF', name: 'Blue' },
  { bg: '#03A9F4', text: '#FFFFFF', name: 'Light Blue' },
  { bg: '#00BCD4', text: '#FFFFFF', name: 'Cyan' },
  { bg: '#009688', text: '#FFFFFF', name: 'Teal' },
  { bg: '#4CAF50', text: '#FFFFFF', name: 'Green' },
  { bg: '#8BC34A', text: '#FFFFFF', name: 'Light Green' },
  { bg: '#FFEB3B', text: '#212121', name: 'Yellow' },
  { bg: '#FFC107', text: '#212121', name: 'Amber' },
  { bg: '#FF9800', text: '#FFFFFF', name: 'Orange' },
  { bg: '#FF5722', text: '#FFFFFF', name: 'Deep Orange' },
  { bg: '#795548', text: '#FFFFFF', name: 'Brown' },
  { bg: '#607D8B', text: '#FFFFFF', name: 'Blue Grey' },
];

const CASHBACK_MODES = [
  { id: 'percentage', name: '% Cashback', suffix: '%' },
  { id: 'fixed_amount', name: 'Monto Fijo', suffix: '$' },
  { id: 'per_visit', name: 'Por Visita', suffix: 'pts' },
];

// Currency Options for Points
const CURRENCY_OPTIONS = [
  { id: 'pts', name: 'Puntos', symbol: 'pts' },
  { id: 'mxn', name: 'Pesos MXN', symbol: '$' },
  { id: 'usd', name: 'Dólares USD', symbol: 'USD' },
  { id: 'eur', name: 'Euros', symbol: '€' },
  { id: 'stars', name: 'Estrellas', symbol: '⭐' },
  { id: 'coins', name: 'Monedas', symbol: '🪙' },
  { id: 'custom', name: 'Personalizado', symbol: '' },
];

// Points Display Mode
const POINTS_DISPLAY_MODES = [
  { id: 'number', name: 'Número', example: '150 pts' },
  { id: 'percentage', name: 'Porcentaje', example: '75%' },
  { id: 'fraction', name: 'Fracción', example: '3/10' },
];

// Strip Layout Options for Iconic Grid
const STRIP_LAYOUTS = [
  { id: 'center', name: 'Centrado', description: 'Grid en el centro, sin imagen lateral' },
  { id: 'left', name: 'Sellos a la Izquierda', description: 'Grid a la izquierda, imagen a la derecha' },
  { id: 'right', name: 'Sellos a la Derecha', description: 'Grid a la derecha, imagen a la izquierda' },
];

// Visual Strategies for premium wallet design
const VISUAL_STRATEGIES = [
  {
    id: 'iconic_grid',
    name: 'Clásico',
    subtitle: 'Grid de Iconos',
    description: 'Iconos sobre fondo sólido o patrón. Ideal para sellos tradicionales.',
    Icon: Layout,
  },
  {
    id: 'hero_minimalist',
    name: 'Minimalista',
    subtitle: 'Estilo Starbucks',
    description: 'Imagen dominante sin iconos. Cambia al completar.',
    Icon: ImageIcon,
  },
  {
    id: 'progressive_story',
    name: 'Historia Visual',
    subtitle: 'Avanzado',
    description: 'La imagen cambia en cada paso del progreso.',
    Icon: Film,
  },
];

// ============================================
// STYLED COMPONENTS (GLASSMORPHISM)
// ============================================

const Root = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  /* No background here, handled by parent panel */
`;

/* Micro-Steps Navigation (Top Bar) - DARK GLASS */
const StepperContainer = styled.div`
  display: flex;
  padding: 16px;
  gap: 8px;
  justify-content: space-between;

  /* DARK GLASS EFFECT */
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(30, 41, 59, 0.4)'
    : 'rgba(255, 255, 255, 0.8)'};
  backdrop-filter: blur(20px) saturate(120%);
  -webkit-backdrop-filter: blur(20px) saturate(120%);
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.06)'};

  @media (max-width: 640px) {
    padding: 12px 8px;
    gap: 4px;
  }
`;

const StepIndicator = styled.button`
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  opacity: ${({ $active }) => $active ? 1 : 0.4};
  flex: 1;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.8;
  }
`;

const StepIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);

  /* ALWAYS Emerald when active - Never client color */
  background: ${({ $active }) =>
    $active ? 'linear-gradient(135deg, #9787F3, #7C6AE8)' : 'transparent'};
  border: 1px solid ${({ $active }) => $active ? '#9787F3' : 'transparent'};
  color: ${({ $active, theme }) => $active
    ? 'white'
    : theme.mode === 'dark'
      ? 'rgba(148, 163, 184, 0.7)'
      : 'rgba(71, 85, 105, 0.7)'};
  box-shadow: ${({ $active }) => $active
    ? '0 4px 12px rgba(151, 135, 243, 0.45)'
    : 'none'};

  @media (max-width: 640px) {
    width: 28px;
    height: 28px;
    border-radius: 10px;
  }
`;

const StepLabelText = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.glass.text};
  letter-spacing: 0.3px;

  @media (max-width: 640px) {
    font-size: 9px;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-y: auto;

  @media (max-width: 1024px) {
    padding: 20px 16px;
  }

  @media (max-width: 640px) {
    padding: 16px 12px;
  }
`;

const StepHeader = styled.div`
  margin-bottom: 24px;
  text-align: center;
`;

const StepTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.glass.text};
  margin: 0;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);

  @media (max-width: 640px) {
    font-size: 18px;
  }
`;

const StepSubtitle = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.glass.textMuted};
  margin: 4px 0 0;
`;

const AnimatedContent = styled.div`
  flex: 1;
  animation: ${({ $direction }) => $direction === 'forward' ? slideInRight : slideInLeft} 0.3s ease;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StepFooter = styled.div`
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;

  /* DARK GLASS border */
  border-top: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.06)'};
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(30, 41, 59, 0.2)'
    : 'rgba(255, 255, 255, 0.4)'};

  @media (max-width: 640px) {
    padding: 12px 16px;
    gap: 8px;
  }
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);

  ${({ $secondary, theme }) => $secondary ? css`
    /* Secondary: ISLANDS style */
    background: ${theme.mode === 'dark'
      ? 'rgba(15, 23, 42, 0.7)'
      : 'rgba(248, 250, 252, 0.9)'};
    border: 1px solid transparent;
    color: ${theme.mode === 'dark'
      ? 'rgba(148, 163, 184, 0.9)'
      : 'rgba(71, 85, 105, 0.9)'};
    box-shadow: ${theme.mode === 'dark'
      ? '0 2px 8px rgba(0, 0, 0, 0.15)'
      : '0 2px 8px rgba(0, 0, 0, 0.03)'};

    &:hover {
      background: ${theme.mode === 'dark'
        ? 'rgba(30, 41, 59, 0.8)'
        : 'rgba(241, 245, 249, 1)'};
      color: ${theme.mode === 'dark'
        ? 'rgba(248, 250, 252, 0.95)'
        : 'rgba(30, 41, 59, 0.95)'};
      transform: translateY(-1px);
    }
  ` : css`
    /* Primary: ALWAYS Emerald - Never client color */
    background: linear-gradient(135deg, #9787F3, #7C6AE8);
    border: none;
    color: white;
    box-shadow: 0 4px 12px rgba(151, 135, 243, 0.4);

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(151, 135, 243, 0.5);
    }
  `}

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 640px) {
    flex: 1;
    justify-content: center;
    padding: 12px 14px;
    font-size: 12px;
  }
`;

/* Input & Form Elements */
const CompactGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;

  @media (max-width: 640px) {
    gap: 12px;
  }
`;

const SplitGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  width: 100%;

  @media (max-width: 640px) {
    gap: 16px;
  }
`;

const TwoColGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const ThreeColGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;
const AppleOnlyBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 9px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 6px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;
const InputGroup = styled.div`display: flex; flex-direction: column; gap: 8px;`;

const Label = styled.label`
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.glass.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CompactInput = styled.input`
  padding: 12px 14px;
  border-radius: 14px;
  font-size: 14px;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);

  /* FILLED STYLE: Solid background, NO border by default */
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.8)'
    : 'rgba(241, 245, 249, 0.9)'};
  border: 2px solid transparent;
  color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(248, 250, 252, 0.95)'
    : 'rgba(30, 41, 59, 0.95)'};

  &:hover:not(:focus) {
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(30, 41, 59, 0.9)'
      : 'rgba(226, 232, 240, 1)'};
  }

  &:focus {
    /* ALWAYS Emerald border on focus - Never client color */
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(15, 23, 42, 0.95)'
      : 'rgba(255, 255, 255, 1)'};
    border-color: #9787F3;
    outline: none;
    box-shadow: 0 0 0 3px rgba(151, 135, 243, 0.15);
  }

  &::placeholder {
    color: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(100, 116, 139, 0.7)'
      : 'rgba(148, 163, 184, 0.9)'};
  }
`;

const CompactTextArea = styled.textarea`
  padding: 12px 14px;
  border-radius: 14px;
  font-size: 14px;
  resize: none;
  font-family: inherit;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);

  /* FILLED STYLE: Solid background, NO border by default */
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.8)'
    : 'rgba(241, 245, 249, 0.9)'};
  border: 2px solid transparent;
  color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(248, 250, 252, 0.95)'
    : 'rgba(30, 41, 59, 0.95)'};

  &:hover:not(:focus) {
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(30, 41, 59, 0.9)'
      : 'rgba(226, 232, 240, 1)'};
  }

  &:focus {
    /* ALWAYS Emerald border on focus - Never client color */
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(15, 23, 42, 0.95)'
      : 'rgba(255, 255, 255, 1)'};
    border-color: #9787F3;
    outline: none;
    box-shadow: 0 0 0 3px rgba(151, 135, 243, 0.15);
  }

  &::placeholder {
    color: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(100, 116, 139, 0.7)'
      : 'rgba(148, 163, 184, 0.9)'};
  }
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.glass.text};
  margin: 0 0 4px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Badge = styled.span`
  /* ALWAYS Emerald - Never client color */
  background: rgba(151, 135, 243, 0.12);
  color: #9787F3;
  font-size: 9px;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid rgba(151, 135, 243, 0.2);
  font-weight: 600;
  letter-spacing: 0.3px;
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
  margin: 4px 0;
`;

/* Cards & Toggles - ISLANDS CONCEPT */
const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: 14px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);

  /* ISLANDS: Slate background, NO heavy border */
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.7)'
    : 'rgba(248, 250, 252, 0.9)'};
  border: 1px solid transparent;
  color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(148, 163, 184, 0.9)'
    : 'rgba(71, 85, 105, 0.9)'};
  box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 2px 8px rgba(0, 0, 0, 0.15)'
    : '0 2px 8px rgba(0, 0, 0, 0.03)'};

  &:hover {
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(30, 41, 59, 0.8)'
      : 'rgba(241, 245, 249, 1)'};
    color: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(248, 250, 252, 0.95)'
      : 'rgba(30, 41, 59, 0.95)'};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.mode === 'dark'
      ? '0 4px 12px rgba(0, 0, 0, 0.2)'
      : '0 4px 12px rgba(0, 0, 0, 0.05)'};
  }
`;

const Toggle = styled.div`
  width: 40px;
  height: 22px;
  border-radius: 12px;
  position: relative;
  /* ALWAYS Emerald when active - Never client color */
  background: ${({ $active, theme }) => $active
    ? '#9787F3'
    : theme.mode === 'dark'
      ? 'rgba(71, 85, 105, 0.6)'
      : 'rgba(203, 213, 225, 0.9)'};
  transition: background 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${({ $active }) => $active
    ? '0 0 12px rgba(151, 135, 243, 0.5)'
    : 'none'};

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ $active }) => $active ? '20px' : '2px'};
    width: 18px;
    height: 18px;
    background: white;
    border-radius: 50%;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
`;

const SelectionCard = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 13px;
  font-weight: 500;

  /* ISLANDS CONCEPT: Slate 900 background, diffuse shadow, NO heavy borders */
  background: ${({ $selected, theme }) => $selected
    ? 'rgba(151, 135, 243, 0.08)'
    : theme.mode === 'dark'
      ? 'rgba(15, 23, 42, 0.7)'
      : 'rgba(248, 250, 252, 0.9)'};

  /* SELECTED: 2px Emerald border - NEVER client color */
  border: 2px solid ${({ $selected }) => $selected
    ? '#9787F3'
    : 'transparent'};

  color: ${({ $selected, theme }) => $selected
    ? (theme.mode === 'dark' ? 'rgba(248, 250, 252, 1)' : 'rgba(30, 41, 59, 1)')
    : (theme.mode === 'dark' ? 'rgba(148, 163, 184, 0.9)' : 'rgba(71, 85, 105, 0.9)')};

  box-shadow: ${({ $selected, theme }) => $selected
    ? '0 4px 16px rgba(151, 135, 243, 0.2)'
    : theme.mode === 'dark'
      ? '0 2px 8px rgba(0, 0, 0, 0.2)'
      : '0 2px 8px rgba(0, 0, 0, 0.04)'};

  &:hover {
    background: ${({ $selected, theme }) => $selected
      ? 'rgba(151, 135, 243, 0.12)'
      : theme.mode === 'dark'
        ? 'rgba(30, 41, 59, 0.8)'
        : 'rgba(241, 245, 249, 1)'};
    transform: translateY(-1px);
    box-shadow: ${({ $selected, theme }) => $selected
      ? '0 6px 20px rgba(151, 135, 243, 0.25)'
      : theme.mode === 'dark'
        ? '0 4px 12px rgba(0, 0, 0, 0.3)'
        : '0 4px 12px rgba(0, 0, 0, 0.06)'};
  }
`;

const TypeCard = styled(SelectionCard)`
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  padding: 20px;
  /* ALWAYS Emerald glow when selected - Never client color */
  box-shadow: ${({ $selected, theme }) => $selected
    ? '0 0 20px rgba(151, 135, 243, 0.35), 0 4px 16px rgba(151, 135, 243, 0.2)'
    : theme.mode === 'dark'
      ? '0 2px 8px rgba(0, 0, 0, 0.2)'
      : '0 2px 8px rgba(0, 0, 0, 0.04)'};
`;

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 4px;

  /* Scrollbar */
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: ${({ theme }) => theme.colors.border}; border-radius: 2px; }

  @media (max-width: 768px) {
    grid-template-columns: repeat(5, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
  }
`;

const IconOption = styled.button`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);

  /* ALWAYS Emerald when selected - Never client color */
  background: ${({ $selected, theme }) => $selected
    ? '#9787F3'
    : theme.mode === 'dark'
      ? 'rgba(15, 23, 42, 0.7)'
      : 'rgba(248, 250, 252, 0.9)'};
  color: ${({ $selected, theme }) => $selected
    ? 'white'
    : theme.mode === 'dark'
      ? 'rgba(148, 163, 184, 0.8)'
      : 'rgba(71, 85, 105, 0.8)'};
  border: 2px solid ${({ $selected }) => $selected
    ? '#9787F3'
    : 'transparent'};

  box-shadow: ${({ $selected, theme }) => $selected
    ? '0 0 16px rgba(151, 135, 243, 0.5), 0 0 32px rgba(151, 135, 243, 0.2)'
    : theme.mode === 'dark'
      ? '0 1px 4px rgba(0, 0, 0, 0.15)'
      : '0 1px 4px rgba(0, 0, 0, 0.03)'};

  &:hover {
    background: ${({ $selected, theme }) => $selected
      ? '#7C6AE8'
      : theme.mode === 'dark'
        ? 'rgba(30, 41, 59, 0.8)'
        : 'rgba(241, 245, 249, 1)'};
    color: ${({ $selected, theme }) => $selected
      ? 'white'
      : theme.mode === 'dark'
        ? 'rgba(248, 250, 252, 0.9)'
        : 'rgba(30, 41, 59, 0.9)'};
    transform: scale(1.05);
  }
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const FieldSelect = styled.select`
  width: 100%;
  padding: 12px 14px;
  border-radius: 14px;
  font-size: 13px;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);

  /* FILLED STYLE: Solid background, NO border */
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.8)'
    : 'rgba(241, 245, 249, 0.9)'};
  border: 2px solid transparent;
  color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(248, 250, 252, 0.95)'
    : 'rgba(30, 41, 59, 0.95)'};

  &:hover:not(:focus) {
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(30, 41, 59, 0.9)'
      : 'rgba(226, 232, 240, 1)'};
  }

  &:focus {
    outline: none;
    /* ALWAYS Emerald border on focus */
    border-color: #9787F3;
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(15, 23, 42, 0.95)'
      : 'rgba(255, 255, 255, 1)'};
    box-shadow: 0 0 0 3px rgba(151, 135, 243, 0.15);
  }

  option {
    background: ${({ theme }) => theme.mode === 'dark'
      ? '#0F172A'
      : '#FFFFFF'};
    color: ${({ theme }) => theme.mode === 'dark'
      ? '#F8FAFC'
      : '#1E293B'};
  }
`;

const ConfigBox = styled.div`
  padding: 16px;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  /* ISLANDS CONCEPT: Slate background, subtle shadow */
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.6)'
    : 'rgba(248, 250, 252, 0.9)'};
  border: 1px dashed ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(71, 85, 105, 0.4)'
    : 'rgba(203, 213, 225, 0.8)'};
  box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 2px 8px rgba(0, 0, 0, 0.15)'
    : '0 2px 8px rgba(0, 0, 0, 0.03)'};
`;

// Visual Strategy Card - Premium Selection UI
// ALWAYS Emerald when selected - Never client color
const StrategyCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 16px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  position: relative;
  overflow: hidden;

  /* ISLANDS + EMERALD when selected */
  background: ${({ $selected, theme }) => $selected
    ? 'linear-gradient(135deg, rgba(151, 135, 243, 0.12), rgba(151, 135, 243, 0.05))'
    : theme.mode === 'dark'
      ? 'rgba(15, 23, 42, 0.7)'
      : 'rgba(248, 250, 252, 0.9)'};
  border: 2px solid ${({ $selected }) => $selected
    ? '#9787F3'
    : 'transparent'};
  box-shadow: ${({ $selected, theme }) => $selected
    ? '0 8px 24px rgba(151, 135, 243, 0.25)'
    : theme.mode === 'dark'
      ? '0 2px 12px rgba(0, 0, 0, 0.2)'
      : '0 2px 12px rgba(0, 0, 0, 0.04)'};

  /* Top accent bar - Emerald gradient */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ $selected }) => $selected
      ? 'linear-gradient(90deg, #9787F3, #7C6AE8)'
      : 'transparent'};
    transition: background 0.2s ease;
  }

  &:hover {
    background: ${({ $selected, theme }) => $selected
      ? 'linear-gradient(135deg, rgba(151, 135, 243, 0.15), rgba(151, 135, 243, 0.08))'
      : theme.mode === 'dark'
        ? 'rgba(30, 41, 59, 0.8)'
        : 'rgba(241, 245, 249, 1)'};
    transform: translateY(-2px);
    box-shadow: ${({ $selected, theme }) => $selected
      ? '0 12px 32px rgba(151, 135, 243, 0.3)'
      : theme.mode === 'dark'
        ? '0 6px 20px rgba(0, 0, 0, 0.3)'
        : '0 6px 20px rgba(0, 0, 0, 0.06)'};
  }
`;

const StrategyHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
`;

const StrategyIconBox = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);

  /* ALWAYS Emerald gradient when selected */
  background: ${({ $selected, theme }) => $selected
    ? 'linear-gradient(135deg, #9787F3, #7C6AE8)'
    : theme.mode === 'dark'
      ? 'rgba(30, 41, 59, 0.8)'
      : 'rgba(241, 245, 249, 0.9)'};
  color: ${({ $selected, theme }) => $selected
    ? 'white'
    : theme.mode === 'dark'
      ? 'rgba(148, 163, 184, 0.8)'
      : 'rgba(71, 85, 105, 0.8)'};
  box-shadow: ${({ $selected }) => $selected
    ? '0 4px 12px rgba(151, 135, 243, 0.45)'
    : 'none'};
`;

const StrategyTitles = styled.div`
  flex: 1;
`;

const StrategyName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.glass.text};
`;

const StrategySubtitle = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.glass.textMuted};
  margin-top: 2px;
`;

const StrategyDescription = styled.p`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.glass.textMuted};
  margin: 0;
  line-height: 1.4;
`;

// Progressive Image Upload Grid
const ProgressiveGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 8px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 6px;
  }
`;

const ProgressiveSlot = styled.div`
  aspect-ratio: 3.82 / 1;
  border-radius: 8px;
  background: ${({ $hasImage, theme }) => $hasImage ? 'transparent' : theme.colors.backgroundAlt};
  border: 1px dashed ${({ $hasImage, theme }) => $hasImage ? theme.colors.primary + '80' : theme.colors.border};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    border-color: ${({ theme }) => theme.colors.border};
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const SlotNumber = styled.span`
  font-size: 9px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.muted};
  position: absolute;
  top: 2px;
  left: 4px;
`;

const SlotUploadIcon = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
`;

// Gold Mode Enhanced Controls
const GoldModeBox = styled.div`
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.05));
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin-top: 8px;
`;

const GoldModeHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #FFD700;
  font-weight: 600;
  font-size: 13px;
`;

// Layer Preview for Iconic Grid
const LayerPreviewBox = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 10px;
  padding: 12px;
  margin-top: 12px;
`;

const LayerItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};

  &:last-child {
    border-bottom: none;
  }
`;

const LayerNumber = styled.span`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.muted};
`;

// HERO SECTION: Strip Studio Launch
const StudioHeroSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px 16px;
  background: linear-gradient(135deg, rgba(151, 135, 243, 0.15), rgba(151, 135, 243, 0.1));
  border: 1px solid rgba(151, 135, 243, 0.25);
  border-radius: 16px;
  margin-bottom: 12px;
  backdrop-filter: blur(20px);

  @media (max-width: 640px) {
    padding: 24px 12px;
    border-radius: 12px;
  }
`;

const StudioHeroIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, #A78BFA, #9787F3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  box-shadow: 0 8px 24px rgba(151, 135, 243, 0.4);
  svg { color: white; }

  @media (max-width: 640px) {
    width: 48px;
    height: 48px;
    border-radius: 12px;
  }
`;

const StudioHeroTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.glass.text};
  margin: 0 0 8px;
  letter-spacing: -0.3px;
`;

const StudioHeroSubtitle = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.glass.textSecondary};
  margin: 0 0 16px;
  max-width: 220px;
  line-height: 1.5;
`;

const StudioHeroButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  border-radius: 12px;
  background: linear-gradient(135deg, #A78BFA, #7C6AE8);
  border: none;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 16px rgba(151, 135, 243, 0.5);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(151, 135, 243, 0.6);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 640px) {
    width: 100%;
    justify-content: center;
    padding: 12px 20px;
    font-size: 13px;
  }
`;

const StudioPreviewHint = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: ${({ theme }) => theme.colors.glass.bgSubtle};
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  border-radius: 10px;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.glass.textMuted};
  backdrop-filter: blur(10px);

  svg {
    color: rgba(151, 135, 243, 0.7);
    flex-shrink: 0;
  }
`;

// Strip Layout Selector
const LayoutSelectorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 8px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 6px;
  }
`;

const LayoutOption = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);

  /* ISLANDS + EMERALD when selected */
  background: ${({ $selected, theme }) => $selected
    ? 'rgba(151, 135, 243, 0.08)'
    : theme.mode === 'dark'
      ? 'rgba(15, 23, 42, 0.7)'
      : 'rgba(248, 250, 252, 0.9)'};
  border: 2px solid ${({ $selected }) => $selected
    ? '#9787F3'
    : 'transparent'};
  box-shadow: ${({ $selected, theme }) => $selected
    ? '0 4px 16px rgba(151, 135, 243, 0.2)'
    : theme.mode === 'dark'
      ? '0 2px 8px rgba(0, 0, 0, 0.15)'
      : '0 2px 8px rgba(0, 0, 0, 0.03)'};

  &:hover {
    background: ${({ $selected, theme }) => $selected
      ? 'rgba(151, 135, 243, 0.12)'
      : theme.mode === 'dark'
        ? 'rgba(30, 41, 59, 0.8)'
        : 'rgba(241, 245, 249, 1)'};
    transform: translateY(-1px);
  }
`;

const LayoutPreview = styled.div`
  width: 48px;
  height: 16px;
  border-radius: 3px;
  background: ${({ theme }) => theme.colors.glass.bg};
  display: flex;
  align-items: center;
  justify-content: ${({ $layout }) =>
    $layout === 'left' ? 'flex-start' :
      $layout === 'right' ? 'flex-end' : 'center'};
  padding: 2px;
  gap: 2px;
  overflow: hidden;
`;

const LayoutStampsBox = styled.div`
  width: ${({ $hasImage }) => $hasImage ? '50%' : '70%'};
  height: 100%;
  background: rgba(17, 185, 129, 0.4);
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LayoutImageBox = styled.div`
  width: 50%;
  height: 100%;
  background: rgba(151, 135, 243, 0.4);
  border-radius: 2px;
`;

const LayoutOptionLabel = styled.span`
  font-size: 10px;
  font-weight: 500;
  color: ${({ $selected, theme }) => $selected
    ? (theme.mode === 'dark' ? 'rgba(248, 250, 252, 0.95)' : 'rgba(30, 41, 59, 0.95)')
    : (theme.mode === 'dark' ? 'rgba(100, 116, 139, 0.8)' : 'rgba(100, 116, 139, 0.8)')};
`;

const ModernColorPicker = ({ label, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  const toggleOpen = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX
      });
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      // Logic handled by backdrop or check if target is in portal
      // Simplified: Close on any click outside trigger for now usually works if we use a backdrop
      // But let's verify if click is inside popover.
      // Since popover is in portal, wrapperRef.contains won't work easily without a ref to the portal content.
      // We'll use a transparent backdrop for simplicity.
    };
    // document.addEventListener('mousedown', handleClickOutside);
    // return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Label>{label}</Label>
        <ColorTrigger ref={triggerRef} onClick={toggleOpen}>
          <ColorPreview $color={value} />
          <ColorValue>{value}</ColorValue>
        </ColorTrigger>
      </div>

      {isOpen && createPortal(
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'transparent' }}
            onClick={() => setIsOpen(false)}
          />
          <Popover style={{ top: coords.top, left: coords.left, position: 'fixed', zIndex: 9999 }}>
            <div style={{ marginBottom: 12, fontSize: 13, fontWeight: 600, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Selecciona un color</span>
              <div style={{ position: 'relative', width: 24, height: 24, overflow: 'hidden', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)' }}>
                {/* Native Picker Trigger */}
                <div style={{ background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)', width: '100%', height: '100%' }} />
                <input
                  type="color"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  style={{ position: 'absolute', inset: -4, width: '150%', height: '150%', opacity: 0, cursor: 'pointer' }}
                />
              </div>
            </div>

            <PresetGrid>
              {PRESET_PALETTES.map((preset) => (
                <PresetOption
                  key={preset.bg}
                  $color={preset.bg}
                  onClick={() => { onChange(preset.bg); setIsOpen(false); }}
                  title={preset.name}
                />
              ))}
            </PresetGrid>
            <div style={{ marginTop: 12 }}>
              <CompactInput
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#000000"
              />
            </div>
          </Popover>
        </>,
        document.body
      )}
    </>
  );
};

const ColorTrigger = styled.div`
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);

  /* FILLED STYLE */
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.8)'
    : 'rgba(241, 245, 249, 0.9)'};
  border: 2px solid transparent;

  &:hover {
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(30, 41, 59, 0.9)'
      : 'rgba(226, 232, 240, 1)'};
    border-color: rgba(151, 135, 243, 0.3);
  }
`;

const ColorPreview = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background-color: ${({ $color }) => $color};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.xs};
`;

const ColorValue = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.glass.textSecondary};
  font-family: monospace;
`;

const Popover = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  width: 240px;
  background: rgba(26, 26, 46, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  z-index: 200;
`;

const PresetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
`;

const PresetOption = styled.button`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 6px;
  background: ${({ $color }) => $color};
  border: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
    z-index: 2;
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

// Strip Studio Launch Button
const StudioLaunchButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px;
  background: ${({ theme }) => theme.colors.primaryLight};
  border: 2px solid ${({ theme }) => theme.colors.primary}50;
  border-radius: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryMuted};
    border-color: ${({ theme }) => theme.colors.primary}80;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px ${({ theme }) => theme.colors.primary}33;
  }

  &:active {
    transform: translateY(0);
  }

  svg:first-child {
    color: ${({ theme }) => theme.colors.primary};
  }

  svg:last-child {
    margin-left: auto;
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const StudioButtonText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;

  span:first-child {
    font-size: 14px;
    font-weight: 600;
  }
`;

const SelectQRType = styled.select`
  width: 100%;
  padding: 12px 14px;
  border-radius: 14px;
  font-size: 13px;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);

  /* FILLED STYLE */
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.8)'
    : 'rgba(241, 245, 249, 0.9)'};
  border: 2px solid transparent;
  color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(248, 250, 252, 0.95)'
    : 'rgba(30, 41, 59, 0.95)'};

  &:focus {
    outline: none;
    /* ALWAYS Emerald border on focus */
    border-color: #9787F3;
    box-shadow: 0 0 0 3px rgba(151, 135, 243, 0.15);
  }

  option {
    background: ${({ theme }) => theme.mode === 'dark'
      ? '#0F172A'
      : '#FFFFFF'};
    color: ${({ theme }) => theme.mode === 'dark'
      ? '#F8FAFC'
      : '#1E293B'};
  }
`;

const StudioButtonHint = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const ButtonQrAndExample = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
`;

const QrExampleBox = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 32px;
    height: 32px;
    object-fit: contain;
  }
`;

const QR = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

// QR Configuration Styles
const QRDestinationTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

const QRDestinationTab = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-weight: 500;

  /* ALWAYS Emerald when active */
  border: 2px solid ${({ $active }) => $active
    ? '#9787F3'
    : 'transparent'};
  background: ${({ $active, theme }) => $active
    ? 'rgba(151, 135, 243, 0.1)'
    : theme.mode === 'dark'
      ? 'rgba(15, 23, 42, 0.7)'
      : 'rgba(248, 250, 252, 0.9)'};
  color: ${({ $active, theme }) => $active
    ? '#9787F3'
    : theme.mode === 'dark'
      ? 'rgba(148, 163, 184, 0.8)'
      : 'rgba(71, 85, 105, 0.8)'};
  box-shadow: ${({ $active, theme }) => $active
    ? '0 4px 12px rgba(151, 135, 243, 0.2)'
    : theme.mode === 'dark'
      ? '0 2px 8px rgba(0, 0, 0, 0.15)'
      : '0 2px 8px rgba(0, 0, 0, 0.03)'};

  span {
    font-size: 13px;
  }

  small {
    font-size: 10px;
    opacity: 0.7;
  }

  &:hover {
    border-color: #9787F3;
    background: rgba(151, 135, 243, 0.08);
    transform: translateY(-1px);
  }
`;

const QRAutoInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 10px;

  /* ALWAYS Emerald accent */
  background: rgba(151, 135, 243, 0.08);
  border-left: 3px solid #9787F3;

  span {
    font-size: 12px;
    color: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(148, 163, 184, 0.9)'
      : 'rgba(71, 85, 105, 0.9)'};
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

// Form Controls
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
`;

const FormLabel = styled.label`
  display: flex;
  flex-direction: column;
  gap: 2px;

  span {
    font-size: 13px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.glass.text};
  }
`;

const FormHint = styled.small`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.glass.textMuted};
  font-weight: 400;
`;

const Input = styled.input`
  padding: 12px 14px;
  border-radius: 14px;
  font-size: 13px;
  font-family: inherit;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);

  /* FILLED STYLE: Solid background, NO border */
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.8)'
    : 'rgba(241, 245, 249, 0.9)'};
  border: 2px solid transparent;
  color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(248, 250, 252, 0.95)'
    : 'rgba(30, 41, 59, 0.95)'};

  &:hover:not(:focus) {
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(30, 41, 59, 0.9)'
      : 'rgba(226, 232, 240, 1)'};
  }

  &:focus {
    outline: none;
    /* ALWAYS Emerald border on focus */
    border-color: #9787F3;
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(15, 23, 42, 0.95)'
      : 'rgba(255, 255, 255, 1)'};
    box-shadow: 0 0 0 3px rgba(151, 135, 243, 0.15);
  }

  &::placeholder {
    color: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(100, 116, 139, 0.7)'
      : 'rgba(148, 163, 184, 0.9)'};
  }
`;

const ImageUploaderRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;





// ============================================
// MAIN COMPONENT
// ============================================

const Step2Designer = ({
  formState,
  updateField,
  updateBranding,
  updateRules,
  updateStripConfig,
  uploadImage,
  uploadProgressiveImages,
  setActiveFocusField,
  onBack, // [REPAIR] Added onBack prop
  simulatedProgress = 0,
  setSimulatedProgress,
}) => {
  const { organization } = useOrganization();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState('forward');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);

  const { branding_config, rules_config = {}, name, description, type: programType, selectedTemplate } = formState;

  // [REPAIR] Smart Filtering Logic
  const isProfessional = selectedTemplate === 'professional' || programType === 'identity';
  const isRetailOrFood = ['coffee', 'retail', 'restaurant', 'gym', 'salon', 'other'].includes(selectedTemplate);

  // Use appropriate micro-steps based on mode
  const ACTIVE_STEPS = isProfessional ? MICRO_STEPS_PROFESSIONAL : MICRO_STEPS_STANDARD;

  // Sync Focus
  useEffect(() => {
    setActiveFocusField?.(ACTIVE_STEPS[currentStep]?.focusTarget);
  }, [currentStep, setActiveFocusField, ACTIVE_STEPS]);

  // Reset step if it's out of bounds when switching modes
  useEffect(() => {
    if (currentStep >= ACTIVE_STEPS.length) {
      setCurrentStep(ACTIVE_STEPS.length - 1);
    }
  }, [ACTIVE_STEPS.length, currentStep]);

  // Nav Handlers
  const changeStep = (newStep) => {
    if (newStep === currentStep || isAnimating) return;
    setIsAnimating(true);
    setDirection(newStep > currentStep ? 'forward' : 'backward');
    setTimeout(() => {
      setCurrentStep(newStep);
      setIsAnimating(false);
    }, 200);
  };

  const handleNext = () => currentStep < ACTIVE_STEPS.length - 1 && changeStep(currentStep + 1);

  // [REPAIR] Fix Back Button Logic
  const handlePrev = () => {
    if (currentStep > 0) {
      changeStep(currentStep - 1);
    } else if (onBack) {
      onBack(); // Go back to Step 1
    }
  };

  // Upload Helpers
  const handleUpload = async (file, type) => {
    // Handle remove (null) case
    if (file === null) {
      if (type === 'logo') updateBranding({ logo_url: null });
      if (type === 'icon') updateBranding({ icon_url: null });
      if (type === 'strip') updateBranding({ strip_image_url: null, hero_image_url: null });
      if (type === 'strip_completed') updateBranding({ strip_completed_image_url: null });
      if (type === 'strip_texture') updateBranding({ strip_texture_url: null });
      if (type === 'strip_side') updateBranding({ strip_side_image_url: null });
      if (type === 'stamp') updateBranding({ stamp_image_url: null });
      if (type === 'profile') updateBranding({ profile_photo_url: null });
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadImage(file, type);
      if (type === 'logo') updateBranding({ logo_url: url });
      if (type === 'icon') updateBranding({ icon_url: url });
      if (type === 'strip') updateBranding({ strip_image_url: url, hero_image_url: url });
      if (type === 'strip_completed') updateBranding({ strip_completed_image_url: url });
      if (type === 'strip_texture') updateBranding({ strip_texture_url: url });
      if (type === 'strip_side') updateBranding({ strip_side_image_url: url });
      if (type === 'stamp') updateBranding({ stamp_image_url: url });
      if (type === 'profile') updateBranding({ profile_photo_url: url });
    } finally { setIsUploading(false); }
  };

  // Geolocation Handler
  const handleGetLocation = () => {
    if (!navigator.geolocation) return alert('Geolocalización no soportada');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateRules({
          location: {
            ...rules_config.location,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          }
        });
      },
      (err) => alert('Error obteniendo ubicación: ' + err.message)
    );
  };

  const toggleProgramFeature = (feature) => {
    if (programType === 'identity') return feature === 'stamp' && updateField('type', 'stamp');
    const hasStamps = programType === 'stamp' || programType === 'mixed';
    const hasPoints = programType === 'cashback' || programType === 'mixed';
    let newType = programType;
    if (feature === 'stamp') {
      if (hasStamps && !hasPoints) return;
      if (hasStamps) newType = 'cashback';
      else newType = hasPoints ? 'mixed' : 'stamp';
    } else if (feature === 'cashback') {
      if (hasPoints && !hasStamps) return;
      if (hasPoints) newType = 'stamp';
      else newType = hasStamps ? 'mixed' : 'cashback';
    }
    updateField('type', newType);
  };

  const renderContent = () => {
    const currentStepId = ACTIVE_STEPS[currentStep]?.id;
    switch (currentStepId) {
      case 'rules':
        return (
          <CompactGrid>
            <SectionTitle>
              Tipo de Programa
              {programType === 'identity' && <Badge>Profesional</Badge>}
            </SectionTitle>

            {/* [REPAIR] Smart Filtering: Hide Identity option for Retail/Food */}
            {!isRetailOrFood && (
              <ToggleRow onClick={() => updateField('type', programType === 'identity' ? 'stamp' : 'identity')}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Briefcase size={16} />
                  <span>Tarjeta de Identidad</span>
                </div>
                <Toggle $active={programType === 'identity'} />
              </ToggleRow>
            )}

            {programType !== 'identity' && (
              <>
                <Divider />
                <Label style={{ marginBottom: 8 }}>Logica de Premios</Label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <TypeCard
                    $selected={programType === 'stamp' || programType === 'mixed'}
                    onClick={() => toggleProgramFeature('stamp')}
                  >
                    <Star size={20} /> <span>Sellos</span>
                  </TypeCard>

                  <TypeCard
                    $selected={programType === 'cashback' || programType === 'mixed'}
                    onClick={() => toggleProgramFeature('cashback')}
                  >
                    <Sparkles size={20} /> <span>Puntos</span>
                  </TypeCard>
                </div>

                {(programType === 'stamp' || programType === 'mixed') && (
                  <ConfigBox>
                    <SectionTitle style={{ fontSize: 12 }}><Star size={14} /> Configuración de Sellos</SectionTitle>
                    <TwoColGrid>
                      <InputGroup>
                        <Label>Meta</Label>
                        <CompactInput
                          type="number" min="1" max="20"
                          value={rules_config.target_stamps || ''}
                          onChange={(e) => updateRules({ target_stamps: parseInt(e.target.value) || 8 })}
                          placeholder="8"
                        />
                      </InputGroup>
                      <InputGroup>
                        <Label>Premio</Label>
                        <CompactInput
                          value={rules_config.reward_name || ''}
                          onChange={(e) => updateRules({ reward_name: e.target.value })}
                          placeholder="Premio Final"
                        />
                      </InputGroup>
                    </TwoColGrid>
                  </ConfigBox>
                )}

                {/* Enhanced Points Configuration with Selectors */}
                {(programType === 'cashback' || programType === 'mixed') && (
                  <ConfigBox>
                    <SectionTitle style={{ fontSize: 12 }}><Sparkles size={14} /> Configuración de Puntos</SectionTitle>

                    {/* Display Mode Selector */}
                    <InputGroup>
                      <Label>¿Cómo mostrar el progreso?</Label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                        {POINTS_DISPLAY_MODES.map(mode => (
                          <SelectionCard
                            key={mode.id}
                            $selected={(rules_config.points_display_mode || 'number') === mode.id}
                            onClick={() => updateRules({ points_display_mode: mode.id })}
                            style={{ padding: '10px', flexDirection: 'column', alignItems: 'center' }}
                          >
                            <span style={{ fontWeight: 600 }}>{mode.name}</span>
                            <span style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>{mode.example}</span>
                          </SelectionCard>
                        ))}
                      </div>
                    </InputGroup>

                    {/* Cashback Mode */}
                    <InputGroup>
                      <Label>Modo de Acumulación</Label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {CASHBACK_MODES.map(mode => (
                          <SelectionCard
                            key={mode.id}
                            $selected={rules_config.cashback_mode === mode.id}
                            onClick={() => updateRules({ cashback_mode: mode.id })}
                            style={{ padding: '10px' }}
                          >
                            <span>{mode.name}</span>
                          </SelectionCard>
                        ))}
                      </div>
                    </InputGroup>

                    <TwoColGrid>
                      <InputGroup>
                        <Label>Valor por Acción</Label>
                        <CompactInput
                          type="number"
                          value={rules_config.cashback_value || ''}
                          onChange={(e) => updateRules({ cashback_value: parseFloat(e.target.value) || 0 })}
                          placeholder="10"
                        />
                      </InputGroup>
                      <InputGroup>
                        <Label>Moneda / Unidad</Label>
                        <FieldSelect
                          value={rules_config.currency_type || 'pts'}
                          onChange={(e) => {
                            const selected = CURRENCY_OPTIONS.find(c => c.id === e.target.value);
                            updateRules({
                              currency_type: e.target.value,
                              currency_symbol: selected?.symbol || '',
                              currency_name: selected?.name || ''
                            });
                          }}
                        >
                          {CURRENCY_OPTIONS.map(curr => (
                            <option key={curr.id} value={curr.id}>{curr.symbol} {curr.name}</option>
                          ))}
                        </FieldSelect>
                      </InputGroup>
                    </TwoColGrid>

                    {/* Custom Currency Name */}
                    {rules_config.currency_type === 'custom' && (
                      <TwoColGrid>
                        <InputGroup>
                          <Label>Símbolo Personalizado</Label>
                          <CompactInput
                            value={rules_config.currency_symbol || ''}
                            onChange={(e) => updateRules({ currency_symbol: e.target.value })}
                            placeholder="★"
                            maxLength={3}
                          />
                        </InputGroup>
                        <InputGroup>
                          <Label>Nombre Personalizado</Label>
                          <CompactInput
                            value={rules_config.currency_name || ''}
                            onChange={(e) => updateRules({ currency_name: e.target.value })}
                            placeholder="Recompensas"
                          />
                        </InputGroup>
                      </TwoColGrid>
                    )}
                  </ConfigBox>
                )}
              </>
            )}
          </CompactGrid>
        );

      case 'identity':
        // Conditional rendering based on program type
        if (isProfessional) {
          // Professional / Services Mode - Digital Business Card
          return (
            <CompactGrid>
              {/* PROFILE SECTION */}
              <SectionTitle><User size={14} /> Perfil Profesional</SectionTitle>

              <ImageUploaderRow>
                <ImageUploader
                  label="Foto de Perfil"
                  value={branding_config.profile_photo_url}
                  onChange={(f) => handleUpload(f, 'profile')}
                  isLoading={isUploading}
                  description="Foto circular que aparece en la tarjeta"
                  variant="circular"
                />
                <ImageUploader
                  label="Logo Empresa"
                  value={branding_config.logo_url}
                  onChange={(f) => handleUpload(f, 'logo')}
                  isLoading={isUploading}
                  description="Logo en el header de la tarjeta"
                />
              </ImageUploaderRow>

              <TwoColGrid>
                <InputGroup>
                  <Label>Nombre / Título Principal</Label>
                  <CompactInput
                    value={branding_config.professional_title || ''}
                    onChange={(e) => updateBranding({ professional_title: e.target.value })}
                    placeholder="Juan Pérez"
                  />
                </InputGroup>
                <InputGroup>
                  <Label>Cargo / Subtítulo</Label>
                  <CompactInput
                    value={branding_config.professional_subtitle || ''}
                    onChange={(e) => updateBranding({ professional_subtitle: e.target.value })}
                    placeholder="Agente Inmobiliario"
                  />
                </InputGroup>
              </TwoColGrid>

              <TwoColGrid>
                <InputGroup>
                  <Label>📧 Email</Label>
                  <CompactInput
                    type="email"
                    value={branding_config.professional_email || ''}
                    onChange={(e) => updateBranding({ professional_email: e.target.value })}
                    placeholder="contacto@ejemplo.com"
                  />
                </InputGroup>
                <InputGroup>
                  <Label>📱 Teléfono</Label>
                  <CompactInput
                    type="tel"
                    value={branding_config.professional_phone || ''}
                    onChange={(e) => updateBranding({ professional_phone: e.target.value })}
                    placeholder="+52 555 123 4567"
                  />
                </InputGroup>
              </TwoColGrid>

              <InputGroup style={{ marginTop: 12 }}>
                <Label>📝 Sobre Mí / Descripción</Label>
                <CompactInput
                  as="textarea"
                  rows={3}
                  value={branding_config.description || ''}
                  onChange={(e) => updateBranding({ description: e.target.value })}
                  placeholder="Breve descripción profesional..."
                  style={{ height: 'auto', paddingTop: 8 }}
                />
              </InputGroup>

              <Divider />

              {/* BRANDING SECTION */}
              <SectionTitle>Marca de Empresa</SectionTitle>

              <InputGroup>
                <Label>Nombre de Empresa</Label>
                <CompactInput
                  value={branding_config.logo_text || ''}
                  onChange={(e) => updateBranding({ logo_text: e.target.value })}
                  placeholder={organization?.name || 'Mi Empresa'}
                />
              </InputGroup>

              <ModernColorPicker
                label="Color de Fondo"
                value={branding_config.background_color || '#1E3A5F'}
                onChange={(c) => updateBranding({ background_color: c, primary_color: c })}
              />

              <Divider />

              {/* QR SECTION - Forced to Custom URL */}
              <SectionTitle><QrCode size={14} /> Enlace de Contacto</SectionTitle>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
                Al escanear el QR, los usuarios serán redirigidos a tu enlace personal.
              </p>

              <InputGroup>
                <Label>URL de Contacto</Label>
                <CompactInput
                  type="url"
                  value={branding_config.qr_custom_url || ''}
                  onChange={(e) => updateBranding({
                    qr_type: 'qr_code',
                    qr_mode: 'custom',
                    qr_custom_url: e.target.value
                  })}
                  placeholder="https://linktr.ee/tunombre"
                />
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
                  💡 Usa tu Linktree, WhatsApp, o página web personal
                </p>
              </InputGroup>
            </CompactGrid>
          );
        }

        // Standard Mode - Brand Identity for Stamp/Points Programs
        return (
          <CompactGrid>
            {/* LOGO & BRAND SECTION */}
            <SectionTitle><User size={14} /> Identidad de Marca</SectionTitle>

            <ImageUploaderRow>
              <ImageUploader
                label="Logo del Negocio"
                value={branding_config.logo_url}
                onChange={(f) => handleUpload(f, 'logo')}
                isLoading={isUploading}
                description="Logo que aparece en el header de la tarjeta"
              />
            </ImageUploaderRow>

            <InputGroup>
              <Label>Nombre del Negocio</Label>
              <CompactInput
                value={branding_config.logo_text || ''}
                onChange={(e) => updateBranding({ logo_text: e.target.value })}
                placeholder={organization?.name || 'Mi Negocio'}
              />
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
                Este nombre aparecerá en el header de tu tarjeta de lealtad
              </p>
            </InputGroup>

            <InputGroup>
              <Label>Nombre del Programa</Label>
              <CompactInput
                value={name || ''}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Programa de Lealtad"
              />
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
                Ej: "Mis Cafecitos", "Puntos Fresh", "Cliente VIP"
              </p>
            </InputGroup>
          </CompactGrid>
        );

      case 'style':
        return (
          <CompactGrid>
            <SectionTitle>Paleta de Color</SectionTitle>
            <ColorGrid>
              <ModernColorPicker
                label="Fondo Tarjeta"
                value={branding_config.background_color}
                onChange={(c) => updateBranding({ background_color: c, primary_color: c })}
              />
              <ModernColorPicker
                label="Color Texto"
                value={branding_config.label_color || '#FFFFFF'}
                onChange={(c) => updateBranding({ label_color: c, text_color: c })}
              />
            </ColorGrid>

            <Divider />
            {programType !== 'identity' && (
              <>
                <SectionTitle>Sellos / Puntos</SectionTitle>
                <ColorGrid>
                  <ModernColorPicker
                    label="Fondo Strip"
                    value={branding_config.strip_background_color || '#FDF6EC'}
                    onChange={(c) => updateBranding({ strip_background_color: c })}
                  />
                </ColorGrid>
                <Divider />
              </>
            )}
            <SectionTitle>Configuración del Código QR</SectionTitle>

            {/* QR Destination - Two clear options with SelectionCard */}
            <FormGroup>
              <FormLabel>
                <span>Destino del Código QR</span>
                <FormHint>¿Qué sucede cuando escanean el código?</FormHint>
              </FormLabel>

              {/* For Identity/Professional: Always custom URL (no choice) */}
              {formState.type === 'identity' ? (
                <>
                  <Input
                    type="url"
                    placeholder="https://tudominio.com/perfil"
                    value={branding_config.qr_custom_url || ''}
                    onChange={(e) => updateBranding({ qr_type: 'qr_code', qr_mode: 'custom', qr_custom_url: e.target.value })}
                  />
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
                    Al escanear, los usuarios serán redirigidos a esta URL.
                  </p>
                </>
              ) : (
                <>
                  {/* Two SelectionCards side by side */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {/* Option A: Código único de cliente (Default) */}
                    <SelectionCard
                      $selected={branding_config.qr_mode !== 'custom'}
                      onClick={() => updateBranding({ qr_type: 'qr_code', qr_mode: 'auto', qr_custom_url: null })}
                      style={{ justifyContent: 'center', flexDirection: 'column', gap: '8px', padding: '16px', textAlign: 'center' }}
                    >
                      <User size={24} />
                      <span style={{ fontWeight: 600 }}>Código único de cliente</span>
                    </SelectionCard>

                    {/* Option B: Sitio Web / Enlace */}
                    <SelectionCard
                      $selected={branding_config.qr_mode === 'custom'}
                      onClick={() => updateBranding({ qr_type: 'qr_code', qr_mode: 'custom' })}
                      style={{ justifyContent: 'center', flexDirection: 'column', gap: '8px', padding: '16px', textAlign: 'center' }}
                    >
                      <QrCode size={24} />
                      <span style={{ fontWeight: 600 }}>Sitio Web / Enlace</span>
                    </SelectionCard>
                  </div>

                  {/* Contextual info or input based on selection */}
                  {branding_config.qr_mode !== 'custom' ? (
                    <QRAutoInfo>
                      <span>✓ Cada cliente tendrá un código único</span>
                      <span>Identifica al cliente al escanear para sumar sellos</span>
                    </QRAutoInfo>
                  ) : (
                    <>
                      <Input
                        type="url"
                        placeholder="https://tudominio.com/menu"
                        value={branding_config.qr_custom_url || ''}
                        onChange={(e) => updateBranding({ qr_custom_url: e.target.value })}
                        style={{ marginTop: 12 }}
                      />
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
                        Todos los clientes tendrán la misma URL en su código.
                      </p>
                    </>
                  )}
                </>
              )}
            </FormGroup>

          </CompactGrid>
        );

      case 'layout':
        return (
          <CompactGrid>
            {/* HERO: Strip Studio Launch Button */}
            <StudioHeroSection>
              <StudioHeroIcon>
                <Wand2 size={28} />
              </StudioHeroIcon>
              <StudioHeroTitle>Strip Studio</StudioHeroTitle>
              <StudioHeroSubtitle>
                Editor visual avanzado para personalizar colores, iconos, distribución y efectos de tus sellos.
              </StudioHeroSubtitle>
              <StudioHeroButton onClick={() => setStudioOpen(true)}>
                <Sparkles size={18} />
                <span>Abrir Strip Studio</span>
                <ChevronRight size={18} />
              </StudioHeroButton>
            </StudioHeroSection>

            {/* Mini Preview Info */}
            <StudioPreviewHint>
              <Eye size={14} />
              <span>Los cambios se reflejan en tiempo real en la vista previa del celular.</span>
            </StudioPreviewHint>
          </CompactGrid>
        );

      case 'extras':
        const goldThreshold = rules_config.gold_trigger_threshold || rules_config.target_stamps || 8;
        const maxStamps = rules_config.target_stamps || 8;

        return (
          <CompactGrid>
            {programType !== 'identity' ? (
              <>
                <SectionTitle><BellRing size={14} /> Notificaciones</SectionTitle>

                {/* [REPAIR] Simplified Notifications UX */}
                <ToggleRow
                  onClick={() => updateBranding({
                    change_message: branding_config.change_message ? '' : '¡Ganaste un sello! Tienes %@'
                  })}
                >
                  <span>Notificar al sumar Sello</span>
                  <Toggle $active={!!branding_config.change_message} />
                </ToggleRow>

                <ToggleRow
                  onClick={() => updateRules({
                    reward_notification: !rules_config.reward_notification
                  })}
                >
                  <span>Notificar al llegar a la Meta</span>
                  <Toggle $active={!!rules_config.reward_notification} />
                </ToggleRow>

                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 8, padding: '0 12px' }}>
                  Se enviarán notificaciones push automáticas a los usuarios.
                </p>

                <Divider />
                <SectionTitle>Funciones Avanzadas</SectionTitle>

                {/* Gold Mode Toggle */}
                <ToggleRow onClick={() => updateRules({ gold_mode_enabled: !rules_config.gold_mode_enabled })}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Crown size={16} color={rules_config.gold_mode_enabled ? '#FFD700' : 'inherit'} />
                    <span>Gold Mode (VIP)</span>
                  </div>
                  <Toggle $active={!!rules_config.gold_mode_enabled} />
                </ToggleRow>

                {/* Enhanced Gold Mode Configuration */}
                {rules_config.gold_mode_enabled && (
                  <GoldModeBox>
                    <GoldModeHeader>
                      <Crown size={16} />
                      Configuración Gold Mode
                    </GoldModeHeader>

                    <InputGroup>
                      <Label>¿A los cuántos sellos cambia de color?</Label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <CompactInput
                          type="number"
                          min="1"
                          max={maxStamps}
                          value={goldThreshold}
                          onChange={(e) => updateRules({ gold_trigger_threshold: parseInt(e.target.value) || maxStamps })}
                          style={{ width: 80 }}
                        />
                        <span style={{ fontSize: 12, color: 'rgba(255, 215, 0, 0.7)' }}>
                          de {maxStamps} sellos
                        </span>
                      </div>
                      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                        {goldThreshold === maxStamps
                          ? 'Solo al completar la tarjeta'
                          : goldThreshold < maxStamps
                            ? `"Desbloquea Gold a mitad de camino" (sello ${goldThreshold})`
                            : 'Después de completar'}
                      </p>
                    </InputGroup>

                    <ModernColorPicker
                      label="Color Gold Activo"
                      value={branding_config.gold_active_color || '#FFD700'}
                      onChange={(c) => updateBranding({ gold_active_color: c })}
                    />

                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>
                      💡 Usa el slider de "Simular Progreso" para ver el efecto Gold en acción.
                    </p>
                  </GoldModeBox>
                )}

                <Divider />
                <SectionTitle>Header Tarjeta</SectionTitle>
                <ToggleRow onClick={() => updateBranding({ show_header: !branding_config.show_header })}>
                  <span>Mostrar Header Puntos</span>
                  <Toggle $active={branding_config.show_header !== false} />
                </ToggleRow>

                {branding_config.show_header !== false && (
                  <>
                    <InputGroup style={{ marginTop: 12 }}>
                      <Label>Tipo de Valor</Label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <SelectionCard
                          $selected={(branding_config.header_right_type || 'points') === 'stamps'}
                          onClick={() => updateBranding({
                            header_right_type: 'stamps',
                            header_label: 'SELLOS',
                            header_symbol: ''
                          })}
                          style={{ padding: '8px', justifyContent: 'center' }}
                        >
                          <span>Sellos</span>
                        </SelectionCard>
                        <SelectionCard
                          $selected={(branding_config.header_right_type || 'points') === 'points'}
                          onClick={() => updateBranding({
                            header_right_type: 'points',
                            header_label: 'PUNTOS',
                            header_symbol: 'pts'
                          })}
                          style={{ padding: '8px', justifyContent: 'center' }}
                        >
                          <span>Puntos</span>
                        </SelectionCard>
                      </div>
                    </InputGroup>
                  </>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                <p>La tarjeta profesional no requiere configuración de fidelización.</p>
                <p style={{ marginTop: 8 }}>Solo se mostrarán los datos de contacto y el QR.</p>
              </div>
            )}

            {branding_config.show_header !== false && (
              <TwoColGrid>
                <InputGroup>
                  <Label>Etiqueta</Label>
                  <CompactInput
                    value={branding_config.header_label}
                    onChange={(e) => updateBranding({ header_label: e.target.value })}
                    placeholder="PUNTOS"
                  />
                </InputGroup>
                <InputGroup>
                  <Label>Simbolo</Label>
                  <CompactInput
                    value={branding_config.header_symbol}
                    onChange={(e) => updateBranding({ header_symbol: e.target.value })}
                    placeholder="$"
                  />
                </InputGroup>
              </TwoColGrid>
            )}

            <Divider />
            <SectionTitle><Layout size={14} /> Campos Inferiores</SectionTitle>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
              Configura qué información aparece debajo del strip
            </p>

            <ThreeColGrid>
              <InputGroup style={{ textAlign: 'center', gap: '12px' }}>
                <Label style={{ fontWeight: 'bold', fontSize: '14px' }}>Campo Izquierdo<AppleOnlyBadge style={{ marginTop: '4px', fontSize: '10px' }}>Google y Apple</AppleOnlyBadge></Label>
                <FieldSelect
                  value={branding_config.field_left_type || 'customer_name'}
                  onChange={(e) => updateBranding({ field_left_type: e.target.value })}
                >
                  <option value="customer_name">Nombre del Cliente</option>
                  <option value="status">Nivel / Estatus</option>
                  <option value="points">Puntos Acumulados</option>
                  <option value="stamps">Sellos</option>
                  <option value="expiry">Fecha de Vencimiento</option>
                  <option value="none">Ninguno</option>
                </FieldSelect>
              </InputGroup>
              <InputGroup style={{ textAlign: 'center', gap: '12px' }}>
                <Label style={{ fontWeight: 'bold', fontSize: '14px' }}>Campo Central <AppleOnlyBadge style={{ marginTop: '4px', fontSize: '10px' }}>Solo Apple</AppleOnlyBadge></Label>
                <FieldSelect
                  value={branding_config.field_center_type || 'none'}
                  onChange={(e) => updateBranding({ field_center_type: e.target.value })}
                >
                  <option value="none">Ninguno</option>
                  <option value="customer_name">Nombre del Cliente</option>
                  <option value="status">Nivel / Estatus</option>
                  <option value="points">Puntos Acumulados</option>
                  <option value="stamps">Sellos</option>
                  <option value="expiry">Fecha de Vencimiento</option>
                </FieldSelect>
              </InputGroup>
              <InputGroup style={{ textAlign: 'center', gap: '12px' }}>
                <Label style={{ fontWeight: 'bold', fontSize: '14px' }}>Campo Derecho<AppleOnlyBadge style={{ marginTop: '4px', fontSize: '10px' }}>Google y Apple</AppleOnlyBadge></Label>
                <FieldSelect
                  value={branding_config.field_right_type || 'status'}
                  onChange={(e) => updateBranding({ field_right_type: e.target.value })}
                >
                  <option value="customer_name">Nombre del Cliente</option>
                  <option value="status">Nivel / Estatus</option>
                  <option value="points">Puntos Acumulados</option>
                  <option value="stamps">Sellos</option>
                  <option value="expiry">Fecha de Vencimiento</option>
                  <option value="none">Ninguno</option>
                </FieldSelect>
              </InputGroup>
            </ThreeColGrid>
          </CompactGrid>
        );

      default: return null;
    }
  };

  return (
    <Root>
      <StepperContainer>
        {ACTIVE_STEPS.map((step, idx) => (
          <StepIndicator key={step.id} onClick={() => changeStep(idx)} $active={idx === currentStep}>
            <StepIcon $active={idx === currentStep} $completed={idx < currentStep}>
              <step.icon size={16} />
            </StepIcon>
            <StepLabelText>{step.title}</StepLabelText>
          </StepIndicator>
        ))}
      </StepperContainer>

      <ContentArea>
        <StepHeader>
          <StepTitle>{ACTIVE_STEPS[currentStep]?.title}</StepTitle>
          <StepSubtitle>{ACTIVE_STEPS[currentStep]?.subtitle}</StepSubtitle>
        </StepHeader>
        <AnimatedContent key={currentStep} $direction={direction}>
          {renderContent()}
        </AnimatedContent>

        <StepFooter>
          <NavButton onClick={handlePrev} disabled={currentStep === 0} $secondary>
            <ChevronLeft size={16} /> Atrás
          </NavButton>
          <NavButton onClick={handleNext} disabled={currentStep === ACTIVE_STEPS.length - 1} $secondary>
            Siguiente <ChevronRight size={16} />
          </NavButton>
        </StepFooter>
      </ContentArea>

      {/* Strip Studio Modal */}
      {studioOpen && (
        <StripStudio
          isOpen={studioOpen}
          onClose={() => setStudioOpen(false)}
          brandingConfig={branding_config}
          rulesConfig={rules_config}
          updateBranding={updateBranding}
          currentProgress={simulatedProgress}
          setSimulatedProgress={setSimulatedProgress}
          uploadImage={uploadImage}
          isUploading={isUploading}
        />
      )}
    </Root>
  );
};

export default Step2Designer;
