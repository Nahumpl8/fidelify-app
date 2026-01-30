import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import {
  ChevronLeft, ChevronRight, Check, Save, Sparkles,
  Eye, X, LayoutDashboard, Users, LogOut, ChevronDown, Settings, HelpCircle
} from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { palette } from '../../styles/theme';



// ============================================
// STEP CONFIGURATION
// ============================================
const STEPS = [
  { number: 1, label: 'Tipo de Negocio' },
  { number: 2, label: 'Diseño del pase' },
  { number: 3, label: 'Información' },
  { number: 4, label: 'Guardar diseño' },
];

// ============================================
// ANIMATIONS
// ============================================
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeInScale = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
`;

// ============================================
// MAIN LAYOUT WRAPPER
// ============================================
const LayoutWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  overflow: hidden;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'linear-gradient(135deg, #020617 0%, #0F172A 30%, #1E1B4B 60%, #0F172A 100%)'
    : 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)'};
  
  /* Subtle animated gradient overlay */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16, 185, 129, 0.08) 0%, transparent 60%)'
    : 'none'};
    pointer-events: none;
  }
`;

// ============================================
// FLOATING RAIL WITH DARK GLASS EFFECT (PILAR 2)
// ============================================
const FloatingRail = styled.nav`
  position: fixed;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;

  width: 76px;
  padding: 20px 12px;

  /* DARK GLASS EFFECT - Slate 800 very transparent */
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(30, 41, 59, 0.4)'
    : 'rgba(255, 255, 255, 0.85)'};
  backdrop-filter: blur(24px) saturate(120%);
  -webkit-backdrop-filter: blur(24px) saturate(120%);

  /* Subtle light border */
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.08)'};
  border-radius: 40px;

  /* Premium depth shadows with inner top light */
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 0 ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(255, 255, 255, 0.8)'},
    0 20px 40px ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(0, 0, 0, 0.4)'
      : 'rgba(0, 0, 0, 0.1)'};

  /* Subtle gradient highlight overlay */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 40px;
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, transparent 50%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, transparent 50%)'};
    pointer-events: none;
  }

  /* Hide on mobile/tablet */
  @media (max-width: 1024px) {
    display: none;
  }
`;

// ============================================
// LOGO WITH DROPDOWN MENU
// ============================================
const LogoWrapper = styled.div`
  position: relative;
`;

const RailLogo = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin-bottom: 16px;
  border: none;
  cursor: pointer;

  /* ALWAYS Emerald - Never client color */
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  border-radius: 14px;

  font-size: 20px;
  font-weight: 800;
  color: white;
  letter-spacing: -0.5px;

  box-shadow:
    0 4px 12px rgba(16, 185, 129, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);

  transition: all 0.2s ease;

  /* Menu indicator badge */
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    right: -4px;
    width: 14px;
    height: 14px;
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(30, 41, 59, 0.95)'
      : 'rgba(255, 255, 255, 0.95)'};
    border-radius: 4px;
    border: 1px solid ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)'};
    display: flex;
    align-items: center;
    justify-content: center;
    background-image: linear-gradient(
      to bottom,
      transparent 3px,
      ${({ theme }) => theme.colors.text.secondary} 3px,
      ${({ theme }) => theme.colors.text.secondary} 4px,
      transparent 4px,
      transparent 6px,
      ${({ theme }) => theme.colors.text.secondary} 6px,
      ${({ theme }) => theme.colors.text.secondary} 7px,
      transparent 7px,
      transparent 9px,
      ${({ theme }) => theme.colors.text.secondary} 9px,
      ${({ theme }) => theme.colors.text.secondary} 10px,
      transparent 10px
    );
    background-size: 8px 14px;
    background-position: center;
    background-repeat: no-repeat;
  }

  &:hover {
    transform: scale(1.05);
    box-shadow:
      0 6px 16px rgba(16, 185, 129, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
`;

const LogoDropdown = styled.div`
  position: absolute;
  left: calc(100% + 12px);
  top: 0;
  z-index: 200;
  
  min-width: 180px;
  padding: 8px;
  
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.95)'
    : 'rgba(255, 255, 255, 0.98)'};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 16px;
  
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.3),
    0 0 0 1px ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.03)'};
  
  animation: ${fadeInScale} 0.15s ease-out;
  transform-origin: left top;
`;

const DropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: none;
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  svg {
    opacity: 0.7;
  }
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.05)'};
    color: ${({ theme }) => theme.colors.text.primary};
    
    svg {
      opacity: 1;
    }
  }
  
  ${({ $danger }) => $danger && css`
    color: #EF4444;
    
    &:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #EF4444;
    }
  `}
`;

const DropdownDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.08)'};
  margin: 6px 0;
`;

const RailDivider = styled.div`
  width: 24px;
  height: 1px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
  margin: 8px 0 16px;
`;

// ============================================
// VERTICAL STEPPER
// ============================================
const VerticalStepper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  flex: 1;
`;

const StepItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  
`;

const StepCircle = styled.button`
  position: relative;
  z-index: 2;
  width: 40px;
  height: 40px;
  border-radius: 50%;

  /* ALWAYS Emerald for active/completed - Never client color */
  border: 2px solid ${({ $active, $completed, theme }) =>
    $active || $completed
      ? '#10B981'
      : theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.1)'};

  background: ${({ $active, $completed, theme }) =>
    $completed
      ? '#10B981'
      : $active
        ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
        : theme.mode === 'dark'
          ? 'rgba(15, 23, 42, 0.6)'
          : 'rgba(255, 255, 255, 0.8)'};

  color: ${({ $active, $completed, theme }) =>
    $active || $completed
      ? 'white'
      : theme.mode === 'dark'
        ? 'rgba(248, 250, 252, 0.4)'
        : 'rgba(0, 0, 0, 0.4)'};

  font-size: 14px;
  font-weight: 600;
  cursor: ${({ $completed }) => ($completed ? 'pointer' : 'default')};
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  display: flex;
  align-items: center;
  justify-content: center;

  ${({ $active }) => $active && css`
    box-shadow:
      0 0 0 4px rgba(16, 185, 129, 0.15),
      0 4px 12px rgba(16, 185, 129, 0.35);
  `}

  &:hover:not(:disabled) {
    transform: ${({ $completed }) => ($completed ? 'scale(1.1)' : 'none')};
    ${({ $completed }) => $completed && css`
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.25);
    `}
  }

  &:disabled {
    cursor: default;
  }
`;

const StepLabel = styled.span`
  margin-top: 6px;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.3px;
  text-align: center;

  /* ALWAYS Emerald for active state - Never client color */
  color: ${({ $active, theme }) => {
    if ($active) {
      return '#10B981'; // Emerald 500 - Both modes
    } else if (theme.mode === 'dark') {
      return 'rgba(148, 163, 184, 0.6)'; // Slate 400 dimmed
    } else {
      return 'rgba(71, 85, 105, 0.7)'; // Slate 600 dimmed
    }
  }};
  transition: color 0.2s ease;
`;

const StepLine = styled.div`
  width: 2px;
  height: 24px;
  margin: 4px 0;
  background: ${({ $completed, theme }) =>
    $completed
      ? theme.colors.primary
      : theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.1)'};
  transition: background 0.3s ease;
`;

// ============================================
// RAIL FOOTER (NAV BUTTONS)
// ============================================
const RailFooter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.08)'};
`;

const NavButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  ${({ $variant, theme }) =>
    $variant === 'primary'
      ? css`
          /* ALWAYS Emerald gradient - Never client color */
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
          box-shadow:
            0 4px 12px rgba(16, 185, 129, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);

          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow:
              0 6px 20px rgba(16, 185, 129, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
          }

          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `
      : css`
          /* Secondary: Slate glass style */
          background: ${theme.mode === 'dark'
            ? 'rgba(15, 23, 42, 0.6)'
            : 'rgba(241, 245, 249, 0.8)'};
          color: ${theme.mode === 'dark'
            ? 'rgba(148, 163, 184, 0.8)'
            : 'rgba(71, 85, 105, 0.8)'};
          border: 1px solid ${theme.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.05)'
            : 'rgba(0, 0, 0, 0.06)'};

          &:hover:not(:disabled) {
            background: ${theme.mode === 'dark'
              ? 'rgba(30, 41, 59, 0.8)'
              : 'rgba(226, 232, 240, 0.9)'};
            color: ${theme.mode === 'dark'
              ? 'rgba(248, 250, 252, 0.9)'
              : 'rgba(30, 41, 59, 0.9)'};
          }
        `}

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    transform: none !important;
  }
`;

// ============================================
// MAIN CONTENT AREA (CENTER)
// ============================================
const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  /* Offset for rail on desktop */
  margin-left: 116px;
  
  @media (max-width: 1024px) {
    margin-left: 0;
  }
`;

const ContentScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 40px;
  padding-bottom: 120px;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
    border-radius: 3px;
  }
  
  @media (max-width: 1024px) {
    padding: 24px 16px;
    padding-top: 80px;
    padding-bottom: 100px;
  }
`;

const FadeInTransition = styled.div`
  animation: ${fadeIn} 0.4s ease-out;
  max-width: 700px;
  width: 100%;
  
  @media (min-width: 1440px) {
    max-width: 800px;
  }
`;

// ============================================
// RIGHT PANEL (STICKY PREVIEW) - FIXED CENTERING
// ============================================
const RightPanel = styled.aside`
  width: 620px;
  min-width: 420px;
  height: 100vh;
  position: sticky;
  top: 0;
  flex-shrink: 0;
  
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  overflow-y: auto;
  
  /* Subtle gradient overlay */
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'linear-gradient(270deg, rgba(15, 187, 130, 0.25) 0%, transparent 100%)'
    : 'linear-gradient(270deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%)'};
  
  /* Custom scrollbar for small screens */
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: rgba(16, 185, 129, 0.2);
    border-radius: 2px;
  }
  
  @media (max-width: 1280px) {
    width: 380px;
    min-width: 380px;
    padding: 24px 16px;
  }
  
  @media (max-width: 1024px) {
    display: none;
  }
`;

const PreviewContainer = styled.div`
  position: relative;
  animation: ${float} 6s ease-in-out infinite;
  
  /* Glow effect behind phone */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 220px;
    height: 420px;
    transform: translate(-50%, -50%);
    background: radial-gradient(ellipse, ${({ theme }) => theme.colors.primary}25 0%, transparent 70%);
    filter: blur(50px);
    z-index: -1;
  }
`;

// ============================================
// MOBILE HEADER
// ============================================
const MobileHeader = styled.header`
  display: none;
  
  @media (max-width: 1024px) {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(2, 6, 23, 0.95)'
    : 'rgba(255, 255, 255, 0.95)'};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.08)'};
  }
`;

const MobileLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const MobileLogoIcon = styled.button`
  width: 32px;
  height: 32px;
  /* ALWAYS Emerald - Never client color */
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
      : 'linear-gradient(135deg, #10B981 0%, #059669 100%)'};
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
  color: white;
  cursor: pointer;
  transition: transform 0.2s ease;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);

  &:hover {
    transform: scale(1.05);
  }
`;

const MobileTitle = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const MobileStepIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MobileStepDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  /* ALWAYS Emerald for active/completed - Never client color */
  background: ${({ $active, $completed, theme }) =>
    $completed || $active
      ? '#10B981'
      : theme.mode === 'dark'
        ? 'rgba(148, 163, 184, 0.3)'
        : 'rgba(100, 116, 139, 0.3)'};
  transition: all 0.2s ease;

  ${({ $active }) => $active && css`
    width: 24px;
    border-radius: 4px;
  `}
`;

// ============================================
// MOBILE FOOTER WITH PREVIEW FAB
// ============================================
const MobileFooter = styled.footer`
  display: none;
  
  @media (max-width: 1024px) {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    padding-bottom: max(12px, env(safe-area-inset-bottom));
    
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(2, 6, 23, 0.98)'
    : 'rgba(255, 255, 255, 0.98)'};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.08)'};
  }
`;

const MobileNavButton = styled.button`
  flex: 1;
  height: 52px;
  border-radius: 14px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ $primary, theme }) =>
    $primary
      ? css`
          /* ALWAYS Emerald - Never client color */
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);

          &:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(16, 185, 129, 0.45);
          }
        `
      : css`
          /* Secondary: Slate glass style */
          background: ${theme.mode === 'dark'
            ? 'rgba(15, 23, 42, 0.6)'
            : 'rgba(241, 245, 249, 0.9)'};
          color: ${theme.mode === 'dark'
            ? 'rgba(148, 163, 184, 0.9)'
            : 'rgba(71, 85, 105, 0.9)'};
          border: 1px solid ${theme.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.05)'
            : 'rgba(0, 0, 0, 0.06)'};

          &:hover:not(:disabled) {
            background: ${theme.mode === 'dark'
              ? 'rgba(30, 41, 59, 0.8)'
              : 'rgba(226, 232, 240, 1)'};
          }
        `}

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const PreviewFAB = styled.button`
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 16px;
  border: none;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(16, 185, 129, 0.15)'
    : 'rgba(16, 185, 129, 0.1)'};
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  animation: ${pulse} 2s ease-in-out infinite;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    animation: none;
  }
`;

// ============================================
// MOBILE PREVIEW MODAL
// ============================================
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 500;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContent = styled.div`
  position: relative;
  max-width: 320px;
  width: 100%;
  animation: ${fadeInScale} 0.3s ease-out;
  
  /* Scale down the preview inside */
  & > div {
    transform: scale(0.85);
    transform-origin: top center;
  }
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: -48px;
  right: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.1);
  }
`;

const ModalPreviewWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

// ============================================
// MOBILE LOGO DROPDOWN (DRAWER STYLE)
// ============================================
const MobileMenuOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 400;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  animation: ${fadeIn} 0.15s ease-out;
`;

const MobileMenuDrawer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  max-width: 80vw;
  z-index: 401;
  
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.98)'
    : 'rgba(255, 255, 255, 0.98)'};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  
  padding: 24px 16px;
  padding-top: max(24px, env(safe-area-inset-top));
  
  animation: ${fadeIn} 0.2s ease-out;
  
  display: flex;
  flex-direction: column;
`;

const MobileMenuHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 20px;
  margin-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.08)'};
`;

const MobileMenuLogo = styled.div`
  width: 44px;
  height: 44px;
  /* ALWAYS Emerald - Never client color */
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 18px;
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
`;

const MobileMenuTitle = styled.div`
  flex: 1;
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 0;
  }
  
  p {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.text.muted};
    margin: 4px 0 0 0;
  }
`;

const MobileMenuItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 12px;
  border: none;
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  
  font-size: 15px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  
  svg {
    opacity: 0.6;
  }
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.05)'};
    
    svg {
      opacity: 1;
    }
  }
  
  ${({ $danger }) => $danger && css`
    color: #EF4444;
    margin-top: auto;
    
    &:hover {
      background: rgba(239, 68, 68, 0.1);
    }
  `}
`;

// ============================================
// COMPONENT
// ============================================
const WizardLayout = ({
  currentStep,
  totalSteps = 4,
  onPrevStep,
  onNextStep,
  onSave,
  onStepClick,
  canProceed,
  isSubmitting,
  children,
  previewComponent,
}) => {
  const navigate = useNavigate();
  const [showLogoMenu, setShowLogoMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const logoRef = useRef(null);

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  const { isDark, toggleTheme } = useTheme();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (logoRef.current && !logoRef.current.contains(e.target)) {
        setShowLogoMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStepClick = (stepNumber) => {
    if (stepNumber < currentStep && onStepClick) {
      onStepClick(stepNumber);
    }
  };

  const handleNavigation = (path) => {
    setShowLogoMenu(false);
    setShowMobileMenu(false);
    navigate(path);
  };

  const handleLogout = () => {
    setShowLogoMenu(false);
    setShowMobileMenu(false);
    // Add logout logic here
    navigate('/login');
  };

  return (
    <LayoutWrapper>
      {/* ============ FLOATING RAIL (DESKTOP) ============ */}
      <FloatingRail>
        <LogoWrapper ref={logoRef}>
          <RailLogo onClick={() => setShowLogoMenu(!showLogoMenu)}>
            F.
          </RailLogo>

          {showLogoMenu && (
            <LogoDropdown>
              <DropdownItem onClick={() => handleNavigation('/dashboard')}>
                <LayoutDashboard size={16} />
                Dashboard
              </DropdownItem>
              <DropdownItem onClick={() => handleNavigation('/dashboard/customers')}>
                <Users size={16} />
                Clientes
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem onClick={() => handleNavigation('/settings')}>
                <Settings size={16} />
                Configuración
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem onClick={() => handleNavigation('/help')}>
                <HelpCircle size={16} />
                Ayuda
              </DropdownItem>
              <DropdownItem>
                <ThemeToggle showLabel />
                <span>{
                  isDark ? '¿Modo claro?' : '¿Modo oscuro?'
                }</span>
              </DropdownItem>
              <DropdownItem $danger onClick={handleLogout}>
                <LogOut size={16} />
                Cerrar Sesión
              </DropdownItem>
            </LogoDropdown>
          )}
        </LogoWrapper>
        <RailDivider />

        <VerticalStepper>
          {STEPS.map((step, index) => (
            <StepItem key={step.number}>
              <StepCircle
                $active={step.number === currentStep}
                $completed={step.number < currentStep}
                onClick={() => handleStepClick(step.number)}
                disabled={step.number > currentStep}
                aria-current={step.number === currentStep ? 'step' : undefined}
              >
                {step.number < currentStep ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  step.number
                )}
              </StepCircle>
              <StepLabel $active={step.number === currentStep}>
                {step.label}
              </StepLabel>
              {index < STEPS.length - 1 && (
                <StepLine $completed={step.number < currentStep} />
              )}
            </StepItem>
          ))}
        </VerticalStepper>

        <RailFooter>
          <NavButton
            onClick={onPrevStep}
            disabled={isFirstStep}
            aria-label="Paso anterior"
          >
            <ChevronLeft size={20} />
          </NavButton>
          <NavButton
            $variant="primary"
            onClick={isLastStep ? onSave : onNextStep}
            disabled={!canProceed || isSubmitting}
            aria-label={isLastStep ? 'Guardar' : 'Siguiente'}
          >
            {isSubmitting ? (
              <Sparkles size={18} />
            ) : isLastStep ? (
              <Save size={18} />
            ) : (
              <ChevronRight size={20} />
            )}
          </NavButton>
        </RailFooter>
      </FloatingRail>

      {/* ============ MOBILE HEADER ============ */}
      <MobileHeader>
        <MobileLogo>
          <MobileLogoIcon onClick={() => setShowMobileMenu(true)}>
            F.
          </MobileLogoIcon>
          <MobileTitle>Constructor de Pase</MobileTitle>
        </MobileLogo>
        <MobileStepIndicator>
          {STEPS.map((step) => (
            <MobileStepDot
              key={step.number}
              $active={step.number === currentStep}
              $completed={step.number < currentStep}
            />
          ))}
        </MobileStepIndicator>
      </MobileHeader>

      {/* ============ MOBILE MENU DRAWER ============ */}
      {showMobileMenu && createPortal(
        <>
          <MobileMenuOverlay onClick={() => setShowMobileMenu(false)} />
          <MobileMenuDrawer>
            <MobileMenuHeader>
              <MobileMenuLogo>F.</MobileMenuLogo>
              <MobileMenuTitle>
                <h3>Fidelify</h3>
                <p>Constructor de Pases</p>
              </MobileMenuTitle>
            </MobileMenuHeader>

            <MobileMenuItem onClick={() => handleNavigation('/dashboard')}>
              <LayoutDashboard size={20} />
              Dashboard
            </MobileMenuItem>
            <MobileMenuItem onClick={() => handleNavigation('/dashboard/customers')}>
              <Users size={20} />
              Clientes
            </MobileMenuItem>
            <MobileMenuItem onClick={() => handleNavigation('/settings')}>
              <Settings size={16} />
              Configuración
            </MobileMenuItem>
            <DropdownDivider />
            <MobileMenuItem onClick={() => handleNavigation('/help')}>
              <HelpCircle size={16} />
              Ayuda
            </MobileMenuItem>
            <MobileMenuItem>
              <ThemeToggle showLabel />
              <span>{
                isDark ? '¿Modo claro?' : '¿Modo oscuro?'
              }</span>
            </MobileMenuItem>

            <MobileMenuItem $danger onClick={handleLogout}>
              <LogOut size={20} />
              Cerrar Sesión
            </MobileMenuItem>
          </MobileMenuDrawer>
        </>,
        document.body
      )}

      {/* ============ MAIN CONTENT ============ */}
      <MainContent>
        <ContentScroll>
          <FadeInTransition key={currentStep}>
            {children}
          </FadeInTransition>
        </ContentScroll>
      </MainContent>

      {/* ============ RIGHT PANEL (DESKTOP) ============ */}
      <RightPanel>
        <PreviewContainer>
          {previewComponent}
        </PreviewContainer>
      </RightPanel>

      {/* ============ MOBILE FOOTER WITH FAB ============ */}
      <MobileFooter>
        <MobileNavButton
          onClick={onPrevStep}
          disabled={isFirstStep}
        >
          <ChevronLeft size={20} />
          Atrás
        </MobileNavButton>

        <PreviewFAB
          onClick={() => setShowPreviewModal(true)}
          aria-label="Ver Preview"
        >
          <Eye size={22} />
        </PreviewFAB>

        <MobileNavButton
          $primary
          onClick={isLastStep ? onSave : onNextStep}
          disabled={!canProceed || isSubmitting}
        >
          {isSubmitting ? (
            'Guardando...'
          ) : isLastStep ? (
            <>
              Guardar
              <Save size={18} />
            </>
          ) : (
            <>
              Siguiente
              <ChevronRight size={20} />
            </>
          )}
        </MobileNavButton>
      </MobileFooter>

      {/* ============ MOBILE PREVIEW MODAL ============ */}
      {showPreviewModal && createPortal(
        <ModalOverlay onClick={() => setShowPreviewModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalCloseButton onClick={() => setShowPreviewModal(false)}>
              <X size={20} />
            </ModalCloseButton>
            <ModalPreviewWrapper>
              {previewComponent}
            </ModalPreviewWrapper>
          </ModalContent>
        </ModalOverlay>,
        document.body
      )}
    </LayoutWrapper>
  );
};

export default WizardLayout;
