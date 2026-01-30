import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  max-width: 300px;
  padding: ${({ theme }) => theme.space.lg};
  background: rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.radii.lg};
  backdrop-filter: blur(10px);
`;

const Label = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  color: white;
  margin-bottom: ${({ theme }) => theme.space.md};
  text-align: center;
`;

const SliderContainer = styled.div`
  position: relative;
  width: 100%;
`;

const Slider = styled.input`
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${({ theme }) => theme.radii.full};
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
    cursor: grab;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.1);
    }

    &:active {
      cursor: grabbing;
      transform: scale(0.95);
    }
  }

  &::-moz-range-thumb {
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
    cursor: grab;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
`;

const ValueDisplay = styled.div`
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: ${({ theme }) => theme.space.xs};
  margin-top: ${({ theme }) => theme.space.md};
`;

const CurrentValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: 700;
  color: white;
`;

const MaxValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: rgba(255, 255, 255, 0.7);
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${({ theme }) => theme.radii.full};
  margin-top: ${({ theme }) => theme.space.md};
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #4ade80, #22c55e);
  border-radius: ${({ theme }) => theme.radii.full};
  width: ${({ $progress }) => $progress}%;
  transition: width 0.3s ease;
`;

const HelpText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  margin-top: ${({ theme }) => theme.space.md};
  margin-bottom: 0;
`;

/**
 * ProgressSimulator - Slider to simulate customer progress
 * This is key for demonstrating progressive strip images
 */
const ProgressSimulator = ({
  value,
  onChange,
  max = 10,
  step = 1,
  label = 'Simular Progreso',
}) => {
  const progress = (value / max) * 100;

  // Format large numbers for display
  const formatValue = (val) => {
    if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}k`;
    }
    return val;
  };

  return (
    <Container>
      <Label>{label}</Label>

      <SliderContainer>
        <Slider
          type="range"
          min={0}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
        />
      </SliderContainer>

      <ValueDisplay>
        <CurrentValue>{formatValue(value)}</CurrentValue>
        <MaxValue>/ {formatValue(max)}</MaxValue>
      </ValueDisplay>

      <ProgressBar>
        <ProgressFill $progress={progress} />
      </ProgressBar>

      <HelpText>
        Mueve el slider para ver como cambia el pase
      </HelpText>
    </Container>
  );
};

export default ProgressSimulator;
