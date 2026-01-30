import styled from 'styled-components';

const StepperContainer = styled.div`
  display: flex;
  flex-direction: ${({ $orientation }) => ($orientation === 'vertical' ? 'column' : 'row')};
  align-items: ${({ $orientation }) => ($orientation === 'vertical' ? 'flex-start' : 'center')};
  gap: ${({ theme }) => theme.space.md};
  
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm};
  position: relative;
`;

const StepCircle = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  transition: all 0.3s ease;
  z-index: 2;

  ${({ $status, theme }) => {
    switch ($status) {
      case 'completed':
        return `
          background: ${theme.colors.success};
          color: white;
          border: 2px solid ${theme.colors.success};
        `;
      case 'active':
        return `
          background: ${theme.colors.primary};
          color: white;
          border: 2px solid ${theme.colors.primary};
          box-shadow: 0 0 15px ${theme.colors.primary}60;
        `;
      default:
        return `
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.4);
          border: 2px solid rgba(255, 255, 255, 0.1);
        `;
    }
  }}
`;

const StepLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  color: ${({ $active, theme }) =>
    $active ? 'white' : 'rgba(255, 255, 255, 0.4)'};
  transition: color 0.3s ease;
  white-space: nowrap;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: ${({ $showOnMobile }) => ($showOnMobile ? 'block' : 'none')};
  }
`;

const StepConnector = styled.div`
  /* Horizontal Connector */
  ${({ $orientation, $completed, theme }) =>
    $orientation !== 'vertical' &&
    `
    width: 40px;
    height: 2px;
    background: ${$completed ? theme.colors.success : 'rgba(255, 255, 255, 0.1)'};
    
    @media (max-width: ${theme.breakpoints.md}) {
      width: 20px;
    }
  `}

  /* Vertical Connector */
  ${({ $orientation, $completed, theme }) =>
    $orientation === 'vertical' &&
    `
    position: absolute;
    top: 32px;
    left: 15px;
    width: 2px;
    height: 20px; /* Gap spacing */
    background: ${$completed ? theme.colors.success : 'rgba(255, 255, 255, 0.1)'};
    z-index: 1;
  `}
  
  transition: background 0.3s ease;
`;

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/**
 * WizardStepper - Step indicator for the wizard
 */
const WizardStepper = ({ steps, currentStep, orientation = 'horizontal' }) => {
  const getStepStatus = (stepNumber) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'active';
    return 'pending';
  };

  return (
    <StepperContainer $orientation={orientation}>
      {steps.map((step, index) => {
        const status = getStepStatus(step.number);
        const isLast = index === steps.length - 1;

        return (
          <Step key={step.number}>
            <StepCircle $status={status}>
              {status === 'completed' ? <CheckIcon /> : step.number}
            </StepCircle>
            <StepLabel $active={status === 'active'}>{step.label}</StepLabel>
            {!isLast && (
              <StepConnector
                $completed={status === 'completed'}
                $orientation={orientation}
              />
            )}
          </Step>
        );
      })}
    </StepperContainer>
  );
};


export default WizardStepper;
