import styled, { keyframes } from 'styled-components';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * ThemeToggle
 * 
 * Elegant toggle button for switching between dark and light mode.
 * - Shows Sun icon when in dark mode (inviting to switch to light)
 * - Shows Moon icon when in light mode (inviting to switch to dark)
 * - Includes smooth rotation animation on toggle
 */
const ThemeToggle = ({ showLabel = false, compact = false }) => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <ToggleButton
            onClick={toggleTheme}
            $compact={compact}
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
            <IconWrapper key={isDark ? 'sun' : 'moon'}>
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </IconWrapper>
            {showLabel && (
                <ToggleLabel>
                    {isDark ? 'Modo claro' : 'Modo oscuro'}
                </ToggleLabel>
            )}
        </ToggleButton>
    );
};

// ============================================
// ANIMATIONS
// ============================================
const rotateIn = keyframes`
  from {
    opacity: 0;
    transform: rotate(-90deg) scale(0.5);
  }
  to {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }
`;

// ============================================
// STYLED COMPONENTS
// ============================================
const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  height: ${({ $compact }) => $compact ? '36px' : '44px'};
  border-radius: 10px;
  border: none;
  cursor: pointer;
  padding: 0px 4px;
  background: transparent;
  transition: background 0.2s, transform 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: scale(1.02);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const IconWrapper = styled.div`
  width: 36px;
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: ${({ theme }) =>
        theme.mode === 'dark'
            ? 'rgba(250, 204, 21, 0.15)'
            : 'rgba(99, 102, 241, 0.15)'
    };
  color: ${({ theme }) =>
        theme.mode === 'dark'
            ? '#FBBF24' /* Amber for sun */
            : '#818CF8' /* Indigo for moon */
    };
  animation: ${rotateIn} 0.3s ease-out;
  transition: background 0.3s, color 0.3s;
`;

const ToggleLabel = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  opacity: 0;
  transform: translateX(-10px);
  transition: opacity 0.2s 0.1s, transform 0.2s 0.1s;
`;

export default ThemeToggle;
