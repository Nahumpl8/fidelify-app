import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  /* ============================================
   * CSS RESET & BASE
   * ============================================ */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* ============================================
   * CSS VARIABLES (Derived from theme)
   * ============================================ */
  :root {
    --color-primary: ${({ theme }) => theme.colors.primary};
    --color-background: ${({ theme }) => theme.colors.background};
    --color-surface: ${({ theme }) => theme.colors.surface};
    --color-text-primary: ${({ theme }) => theme.colors.text.primary};
    --color-text-secondary: ${({ theme }) => theme.colors.text.secondary};
    --color-border: ${({ theme }) => theme.colors.border};
    --font-body: ${({ theme }) => theme.fonts.body};
    --transition-theme: ${({ theme }) => theme.transitions.theme};
  }

  /* ============================================
   * HTML & BODY
   * ============================================ */
  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    scroll-behavior: smooth;

    /* Prevent pull-to-refresh on mobile */
    overscroll-behavior: none;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: ${({ theme }) => theme.fontSizes.md};
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.background};
    min-height: 100vh;
    overflow-x: hidden;

    /* CRITICAL: Smooth theme transition */
    transition:
      background-color ${({ theme }) => theme.transitions.theme},
      color ${({ theme }) => theme.transitions.theme};
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ============================================
   * TYPOGRAPHY
   * ============================================ */
  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    line-height: 1.2;
    color: ${({ theme }) => theme.colors.text.primary};
    transition: color ${({ theme }) => theme.transitions.theme};
  }

  h1 { font-size: ${({ theme }) => theme.fontSizes['4xl']}; }
  h2 { font-size: ${({ theme }) => theme.fontSizes['3xl']}; }
  h3 { font-size: ${({ theme }) => theme.fontSizes['2xl']}; }
  h4 { font-size: ${({ theme }) => theme.fontSizes.xl}; }
  h5 { font-size: ${({ theme }) => theme.fontSizes.lg}; }
  h6 { font-size: ${({ theme }) => theme.fontSizes.md}; }

  /* Mobile typography scaling */
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    h1 { font-size: ${({ theme }) => theme.fontSizes['3xl']}; }
    h2 { font-size: ${({ theme }) => theme.fontSizes['2xl']}; }
    h3 { font-size: ${({ theme }) => theme.fontSizes.xl}; }
    h4 { font-size: ${({ theme }) => theme.fontSizes.lg}; }
  }

  p {
    margin-bottom: ${({ theme }) => theme.space[4]};

    &:last-child {
      margin-bottom: 0;
    }
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    transition: color ${({ theme }) => theme.transitions.fast};

    &:hover {
      color: ${({ theme }) => theme.colors.primaryHover};
    }
  }

  strong, b {
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
  }

  small {
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }

  /* ============================================
   * FORMS
   * ============================================ */
  button, input, select, textarea {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    color: inherit;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
  }

  input, textarea, select {
    background: ${({ theme }) => theme.colors.input.bg};
    border: 1px solid ${({ theme }) => theme.colors.input.border};
    transition:
      background-color ${({ theme }) => theme.transitions.theme},
      border-color ${({ theme }) => theme.transitions.fast};
  }

  /* Prevent iOS zoom on input focus */
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    input, select, textarea {
      font-size: 16px !important;
    }
  }

  /* ============================================
   * IMAGES & MEDIA
   * ============================================ */
  img, picture, video, canvas, svg {
    display: block;
    max-width: 100%;
  }

  img {
    height: auto;
  }

  /* ============================================
   * LISTS
   * ============================================ */
  ul, ol {
    list-style: none;
  }

  /* ============================================
   * TABLES
   * ============================================ */
  table {
    border-collapse: collapse;
    border-spacing: 0;
  }

  /* ============================================
   * ACCESSIBILITY - FOCUS STATES
   * ============================================ */
  :focus {
    outline: none;
  }

  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  /* Skip link for screen readers */
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    padding: ${({ theme }) => theme.space[3]};
    z-index: 9999;
    transition: top 0.3s;

    &:focus {
      top: 0;
    }
  }

  /* ============================================
   * SCROLLBAR (Custom for all elements)
   * ============================================ */
  * {
    scrollbar-width: thin;
    scrollbar-color: ${({ theme }) => theme.colors.border} transparent;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.full};

    &:hover {
      background: ${({ theme }) => theme.colors.text.muted};
    }
  }

  /* Hide scrollbar for iOS */
  @supports (-webkit-touch-callout: none) {
    ::-webkit-scrollbar {
      display: none;
    }
  }

  /* ============================================
   * SELECTION
   * ============================================ */
  ::selection {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
  }

  /* ============================================
   * UTILITY CLASSES
   * ============================================ */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Prevent text selection on UI elements */
  .no-select {
    user-select: none;
    -webkit-user-select: none;
  }

  /* ============================================
   * TRANSITIONS FOR THEME SWITCHING
   * All interactive elements should transition smoothly
   * ============================================ */
  div, span, section, article, header, footer, nav, aside, main {
    transition:
      background-color ${({ theme }) => theme.transitions.theme},
      border-color ${({ theme }) => theme.transitions.theme},
      box-shadow ${({ theme }) => theme.transitions.theme};
  }

  /* ============================================
   * TOUCH OPTIMIZATION
   * ============================================ */
  @media (hover: none) and (pointer: coarse) {
    /* Larger touch targets on mobile */
    button,
    [role="button"],
    a,
    input[type="checkbox"],
    input[type="radio"] {
      min-height: 44px;
      min-width: 44px;
    }

    /* Disable hover effects on touch devices */
    *:hover {
      transition-duration: 0ms !important;
    }
  }

  /* ============================================
   * REDUCED MOTION
   * ============================================ */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* ============================================
   * PRINT STYLES
   * ============================================ */
  @media print {
    body {
      background: white !important;
      color: black !important;
    }

    a {
      color: inherit !important;
      text-decoration: underline;
    }

    .no-print {
      display: none !important;
    }
  }
`;

export default GlobalStyles;
