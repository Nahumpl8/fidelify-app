import styled from 'styled-components';
import { Layout, Image as ImageIcon, Film } from 'lucide-react';

const VISUAL_STRATEGIES = [
  {
    id: 'iconic_grid',
    name: 'Clasico',
    subtitle: 'Grid de Iconos',
    Icon: Layout,
  },
  {
    id: 'hero_minimalist',
    name: 'Minimalista',
    subtitle: 'Estilo Starbucks',
    Icon: ImageIcon,
  },
  {
    id: 'progressive_story',
    name: 'Historia',
    subtitle: 'Progresivo',
    Icon: Film,
  },
];

/**
 * StripModeToggle - Mode selector tabs for the three visual strategies
 */
const StripModeToggle = ({ value, onChange }) => {
  return (
    <Container>
      {VISUAL_STRATEGIES.map((strategy) => (
        <ModeButton
          key={strategy.id}
          $active={value === strategy.id}
          onClick={() => onChange(strategy.id)}
        >
          <IconWrapper $active={value === strategy.id}>
            <strategy.Icon size={18} />
          </IconWrapper>
          <TextWrapper>
            <ModeName $active={value === strategy.id}>{strategy.name}</ModeName>
            <ModeSubtitle>{strategy.subtitle}</ModeSubtitle>
          </TextWrapper>
        </ModeButton>
      ))}
      <ActiveIndicator $activeIndex={VISUAL_STRATEGIES.findIndex(s => s.id === value)} />
    </Container>
  );
};

// ============================================
// STYLED COMPONENTS
// ============================================

const Container = styled.div`
  display: flex;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  padding: 4px;
  position: relative;
  gap: 4px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ActiveIndicator = styled.div`
  display: none;
`;

const ModeButton = styled.button`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.2s ease;
  position: relative;
  z-index: 1;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const IconWrapper = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $active }) => $active
    ? 'linear-gradient(135deg, #11B981, #059669)'
    : 'rgba(255, 255, 255, 0.08)'};
  color: white;
  transition: all 0.25s ease;
  box-shadow: ${({ $active }) => $active ? '0 4px 12px rgba(17, 185, 129, 0.3)' : 'none'};
`;

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const ModeName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ $active }) => $active ? 'white' : 'rgba(255, 255, 255, 0.7)'};
  transition: color 0.2s ease;
`;

const ModeSubtitle = styled.span`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 2px;
`;

export default StripModeToggle;
