import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { ChevronRight, ChevronLeft, Save, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

// ============================================
// STEP CONFIGURATION
// ============================================
const STEPS = [
  { number: 1, label: 'Tipo', shortLabel: '1' },
  { number: 2, label: 'Diseño', shortLabel: '2' },
  { number: 3, label: 'Contenido', shortLabel: '3' },
  { number: 4, label: 'Datos', shortLabel: '4' },
];

// ============================================
// ANIMATIONS
// ============================================
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ============================================
// MAIN CONTAINER - NOW FITS INSIDE DASHBOARD CONTENT AREA
// ============================================
const Container = styled.div`
  position: relative;
  width: 100%;
  height: calc(100vh - 48px); /* Account for DashboardLayout padding */
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background};

  @media (max-width: 1023px) {
    height: 100vh;
  }
`;

// ============================================
// HORIZONTAL STEPPER (FOR BOTH DESKTOP AND MOBILE)
// ============================================
const StepperWrapper = styled.div`
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px 16px 0 0;
  padding: 20px 24px;
  
  @media (max-width: 1023px) {
    padding: 16px 16px;
    border-radius: 0;
  }
`;

const StepperHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const StepperTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const StepIndicator = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
`;

const HorizontalStepper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  max-width: 400px;
`;

const StepperTrack = styled.div`
  position: absolute;
  top: 50%;
  left: 24px;
  right: 24px;
  height: 2px;
  background: ${({ theme }) => theme.colors.border};
  transform: translateY(-50%);
  z-index: 0;
`;

const StepperProgress = styled.div`
  position: absolute;
  top: 50%;
  left: 24px;
  height: 2px;
  background: ${({ theme }) => theme.colors.primary};
  transform: translateY(-50%);
  z-index: 1;
  width: ${({ $progress }) => $progress}%;
  transition: width 0.3s ease;
`;

const HorizontalStep = styled.button`
  position: relative;
  z-index: 2;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid ${({ $active, $completed, theme }) =>
    $active || $completed ? theme.colors.primary : theme.colors.border};
  background: ${({ $active, $completed, theme }) =>
    $active
      ? theme.colors.primary
      : $completed
        ? theme.colors.surface
        : theme.colors.background};
  color: ${({ $active, $completed, theme }) =>
    $active
      ? 'white'
      : $completed
        ? theme.colors.primary
        : theme.colors.text.muted};
  font-size: 14px;
  font-weight: 600;
  cursor: ${({ $completed }) => ($completed ? 'pointer' : 'default')};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    transform: ${({ $completed }) => ($completed ? 'scale(1.1)' : 'none')};
  }

  &:disabled {
    cursor: default;
  }

  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    font-size: 13px;
  }
`;

const StepLabel = styled.span`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 6px;
  font-size: 11px;
  font-weight: 500;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.text.muted};
  white-space: nowrap;
`;

// ============================================
// MAIN LAYOUT (Content + Preview)
// ============================================
const MainLayout = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;

  @media (max-width: 1023px) {
    flex-direction: column-reverse;
  }
`;

// ============================================
// CONTENT PANEL
// ============================================
const ContentPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  
  @media (max-width: 1023px) {
    border-right: none;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 3px;
  }
  
  @media (max-width: 1023px) {
    padding: 20px 16px;
    padding-bottom: 100px; /* Space for footer */
  }
`;

// ============================================
// PREVIEW PANEL
// ============================================
const PreviewPanel = styled.div`
  width: 50%;
  max-width: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  perspective: 2000px;
  
  @media (max-width: 1023px) {
    width: 100%;
    max-width: none;
    height: 40vh;
    min-height: 280px;
    padding: 16px;
  }
`;

// ============================================
// ACTION FOOTER
// ============================================
const ActionFooter = styled.footer`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 24px;
  background: ${({ theme }) => theme.colors.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  
  @media (max-width: 1023px) {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    padding: 12px 16px;
    padding-bottom: max(12px, env(safe-area-inset-bottom));
    background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'rgba(2, 6, 23, 0.98)'
      : 'rgba(255, 255, 255, 0.98)'};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
`;

const FooterButton = styled.button`
  height: 48px;
  padding: 0 24px;
  border-radius: 12px;
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
          background: ${theme.colors.primary};
          color: white;
          box-shadow: 0 4px 12px ${theme.colors.primary}30;

          &:hover:not(:disabled) {
            background: ${theme.colors.primaryHover};
            transform: translateY(-1px);
          }

          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `
      : css`
          background: transparent;
          color: ${theme.colors.text.secondary};
          border: 1px solid ${theme.colors.border};

          &:hover:not(:disabled) {
            background: ${theme.colors.surfaceHover};
            color: ${theme.colors.text.primary};
          }
        `}

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  
  @media (max-width: 1023px) {
    flex: 1;
    height: 52px;
  }
`;

const FooterSpacer = styled.div`
  flex: 1;
  
  @media (max-width: 1023px) {
    display: none;
  }
`;

// ============================================
// WIZARD CONTAINER COMPONENT
// ============================================
const WizardContainer = ({
  currentStep,
  onPrevStep,
  onNextStep,
  onSave,
  onStepClick,
  canProceed,
  isSubmitting,
  children,
  previewComponent,
  totalSteps = 4,
}) => {
  const { isDark } = useTheme();

  const isLastStep = currentStep === totalSteps;
  const isFirstStep = currentStep === 1;
  const stepperProgressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;

  // Handle step click (only for completed steps)
  const handleStepClick = (stepNumber) => {
    if (stepNumber < currentStep && onStepClick) {
      onStepClick(stepNumber);
    }
  };

  return (
    <Container>
      {/* ====== HORIZONTAL STEPPER (Always visible) ====== */}
      <StepperWrapper>
        <StepperHeader>
          <StepperTitle>Constructor de Pase</StepperTitle>
          <StepIndicator>Paso {currentStep} de {totalSteps}</StepIndicator>
        </StepperHeader>

        <HorizontalStepper>
          <StepperTrack />
          <StepperProgress $progress={stepperProgressPercent} />

          {STEPS.map((step) => (
            <HorizontalStep
              key={step.number}
              $active={step.number === currentStep}
              $completed={step.number < currentStep}
              onClick={() => handleStepClick(step.number)}
              disabled={step.number > currentStep}
              aria-current={step.number === currentStep ? 'step' : undefined}
            >
              {step.number < currentStep ? (
                <Check size={16} strokeWidth={3} />
              ) : (
                step.shortLabel
              )}
              <StepLabel $active={step.number === currentStep}>
                {step.label}
              </StepLabel>
            </HorizontalStep>
          ))}
        </HorizontalStepper>
      </StepperWrapper>

      {/* ====== MAIN LAYOUT ====== */}
      <MainLayout>
        {/* Content Panel */}
        <ContentPanel>
          <ScrollArea>{children}</ScrollArea>
        </ContentPanel>

        {/* Preview Panel */}
        <PreviewPanel>{previewComponent}</PreviewPanel>
      </MainLayout>

      {/* ====== ACTION FOOTER ====== */}
      <ActionFooter>
        <FooterButton
          onClick={onPrevStep}
          disabled={isFirstStep}
          aria-label="Paso anterior"
        >
          <ChevronLeft size={20} />
          Atrás
        </FooterButton>

        <FooterSpacer />

        <FooterButton
          $primary
          onClick={isLastStep ? onSave : onNextStep}
          disabled={!canProceed || isSubmitting}
          aria-label={isLastStep ? 'Guardar' : 'Siguiente paso'}
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
        </FooterButton>
      </ActionFooter>
    </Container>
  );
};

export default WizardContainer;
