import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OrganizationProvider, useOrganization } from './context/OrganizationContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import GlobalStyles from './styles/GlobalStyles';
import { lightTheme, darkTheme, createOrganizationTheme } from './styles/theme';
import AuroraBackground from './components/layout/AuroraBackground';
import Router from './Router';

/**
 * OrganizationThemeWrapper: Combines theme mode (dark/light) with organization colors
 */
const OrganizationThemeWrapper = ({ children }) => {
  const { organization, loading } = useOrganization();
  const { mode } = useTheme();

  // Create theme based on mode and organization
  const theme = organization
    ? createOrganizationTheme(organization, mode)
    : mode === 'dark'
      ? darkTheme
      : lightTheme;

  // Show loading while organization loads
  if (loading) {
    const baseTheme = mode === 'dark' ? darkTheme : lightTheme;
    return (
      <StyledThemeProvider theme={baseTheme}>
        <GlobalStyles />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            fontFamily: baseTheme.fonts.body,
            color: baseTheme.colors.text.primary,
            background: baseTheme.colors.background,
          }}
        >
          Cargando...
        </div>
      </StyledThemeProvider>
    );
  }

  return (
    <StyledThemeProvider theme={theme}>
      <GlobalStyles />
      {children}
    </StyledThemeProvider>
  );
};

/**
 * App: Root component
 * Provider order: Router > Auth > Organization > Theme
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OrganizationProvider>
          <ThemeProvider defaultMode="dark">
            <OrganizationThemeWrapper>
              <AuroraBackground>
                {/* Sidebar is now inside DashboardLayout */}
                <Router />
              </AuroraBackground>
            </OrganizationThemeWrapper>
          </ThemeProvider>
        </OrganizationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
