import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from '../styles/theme';

// ============================================
// THEME CONTEXT
// ============================================
const ThemeContext = createContext({
  mode: 'dark',
  toggleTheme: () => {},
  setMode: () => {},
  isDark: true,
});

// ============================================
// STORAGE KEY
// ============================================
const THEME_STORAGE_KEY = 'fidelify-theme-mode';

// ============================================
// THEME PROVIDER COMPONENT
// ============================================
export const ThemeProvider = ({ children, defaultMode = 'dark' }) => {
  // Initialize from localStorage or system preference
  const [mode, setModeState] = useState(() => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
      // Check system preference
      if (window.matchMedia?.('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    }
    return defaultMode;
  });

  // Get current theme object
  const theme = mode === 'dark' ? darkTheme : lightTheme;
  const isDark = mode === 'dark';

  // Toggle between modes
  const toggleTheme = useCallback(() => {
    setModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Set specific mode
  const setMode = useCallback((newMode) => {
    if (newMode === 'light' || newMode === 'dark') {
      setModeState(newMode);
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, mode);

    // Update document attribute for CSS selectors
    document.documentElement.setAttribute('data-theme', mode);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        mode === 'dark' ? '#020617' : '#F8FAFC'
      );
    }
  }, [mode]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      // Only auto-switch if user hasn't set a preference
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (!stored) {
        setModeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const contextValue = {
    mode,
    toggleTheme,
    setMode,
    isDark,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

// ============================================
// HOOK
// ============================================
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
