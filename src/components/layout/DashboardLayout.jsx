import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Menu, X } from 'lucide-react';
import ModernSidebar from './ModernSidebar';
import { useAuth } from '../../context/AuthContext';
import { useOrganization } from '../../context/OrganizationContext';

/**
 * DashboardLayout
 * 
 * Main layout wrapper with:
 * - ModernSidebar (desktop only, hover-expand)
 * - Mobile hamburger menu (future enhancement)
 * - Responsive content area
 */
const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { organization } = useOrganization();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <Container>
      {/* Desktop Sidebar */}
      <ModernSidebar />

      {/* Mobile Overlay */}
      {mobileMenuOpen && <MobileOverlay onClick={() => setMobileMenuOpen(false)} />}

      {/* Main Content Area */}
      <Main>
        {/* Mobile Header */}
        <MobileHeader>
          <MobileMenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </MobileMenuButton>
          <MobileLogo>Fidelify</MobileLogo>
          <MobileAvatar>
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </MobileAvatar>
        </MobileHeader>

        {/* Page Content */}
        <Content>
          {children}
        </Content>
      </Main>

      {/* Mobile Bottom Navigation (placeholder for future) */}
      {/* <MobileBottomNav /> */}
    </Container>
  );
};

// ============================================
// STYLED COMPONENTS
// ============================================
const SIDEBAR_COLLAPSED_WIDTH = '64px';

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
`;

const MobileOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 9998;
  
  @media (min-width: 1024px) {
    display: none;
  }
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  
  /* Desktop: Leave space for collapsed sidebar */
  @media (min-width: 1024px) {
    margin-left: ${SIDEBAR_COLLAPSED_WIDTH};
  }
  
  /* Mobile: Full width */
  @media (max-width: 1023px) {
    margin-left: 0;
  }
`;

// ============================================
// MOBILE HEADER (Only visible on mobile)
// ============================================
const MobileHeader = styled.header`
  display: none; /* Hidden on desktop */
  
  @media (max-width: 1023px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: ${({ theme }) => theme.colors.surface};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    position: sticky;
    top: 0;
    z-index: 100;
  }
`;

const MobileMenuButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  
  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const MobileLogo = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`;

const MobileAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
`;

// ============================================
// CONTENT AREA
// ============================================
const Content = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.space.lg};
  
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.space.xl};
  }
  
  /* Extra padding on large screens for better readability */
  @media (min-width: ${({ theme }) => theme.breakpoints['2xl']}) {
    padding: ${({ theme }) => theme.space['2xl']};
    max-width: 1600px;
  }
`;

export default DashboardLayout;
