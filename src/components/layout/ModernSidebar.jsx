import { useNavigate, useLocation } from 'react-router-dom';
import styled, { css } from 'styled-components';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrganization } from '../../context/OrganizationContext';
import ThemeToggle from '../ui/ThemeToggle';

/**
 * ModernSidebar
 * 
 * Glassmorphism sidebar with hover-expand behavior
 * - Collapsed: 64px (icons only)
 * - Expanded: 240px (icons + text)
 * - Mobile: Hidden (use bottom nav or hamburger menu)
 */
const ModernSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { organization } = useOrganization();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/clients', icon: Users, label: 'Clientes' },
    { to: '/dashboard/wizard', icon: CreditCard, label: 'Constructor' },
    { to: '/dashboard/settings', icon: Settings, label: 'Configuración' },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <SidebarContainer>
      {/* TOP: Logo */}
      <LogoSection>
        <LogoIcon onClick={() => navigate('/dashboard')}>
          <Sparkles size={22} />
        </LogoIcon>
        <LogoText onClick={() => navigate('/dashboard')}>
          Fidelify
        </LogoText>
      </LogoSection>

      {/* MIDDLE: Navigation */}
      <NavSection>
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            $active={isActive(item.to)}
            onClick={() => navigate(item.to)}
          >
            <NavIcon $active={isActive(item.to)}>
              <item.icon size={20} strokeWidth={isActive(item.to) ? 2.5 : 2} />
            </NavIcon>
            <NavLabel $active={isActive(item.to)}>{item.label}</NavLabel>
            {isActive(item.to) && <ActiveIndicator />}
          </NavItem>
        ))}
      </NavSection>

      {/* BOTTOM: Theme Toggle, Profile & Logout */}
      <BottomSection>
        {/* Theme Toggle */}
        <ThemeToggle showLabel />

        {/* User Profile */}
        <ProfileItem onClick={() => navigate('/dashboard/settings')}>
          <ProfileAvatar $color={organization?.primary_color}>
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </ProfileAvatar>
          <ProfileInfo>
            <ProfileName>{user?.email?.split('@')[0] || 'Usuario'}</ProfileName>
            <ProfileRole>Admin</ProfileRole>
          </ProfileInfo>
        </ProfileItem>

        {/* Logout */}
        <LogoutItem onClick={handleSignOut}>
          <LogoutIcon>
            <LogOut size={20} />
          </LogoutIcon>
          <LogoutLabel>Cerrar sesión</LogoutLabel>
        </LogoutItem>
      </BottomSection>
    </SidebarContainer>
  );
};

// ============================================
// CONSTANTS
// ============================================
const COLLAPSED_WIDTH = '64px';
const EXPANDED_WIDTH = '240px';

// ============================================
// STYLED COMPONENTS
// ============================================
const SidebarContainer = styled.aside`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: ${COLLAPSED_WIDTH};
  z-index: 9999;

  /* Dark Premium Glass Effect */
  background-color: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(24px) saturate(120%);
  -webkit-backdrop-filter: blur(24px) saturate(120%);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.02);

  display: flex;
  flex-direction: column;
  padding: 16px 0;

  /* Hover Expand */
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  &:hover {
    width: ${EXPANDED_WIDTH};

    /* Show text labels on hover */
    span, .profile-info {
      opacity: 1;
      transform: translateX(0);
    }
  }

  /* MOBILE: Hide completely */
  @media (max-width: 1023px) {
    display: none;
  }
`;

// ============================================
// LOGO SECTION
// ============================================
const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  margin-bottom: 32px;
  height: 40px;
`;

const LogoIcon = styled.button`
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #10B981, #059669);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: none;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
  }
`;

const LogoText = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: white;
  white-space: nowrap;
  opacity: 0;
  transform: translateX(-10px);
  transition: opacity 0.2s 0.1s, transform 0.2s 0.1s;
  cursor: pointer;
  
  &:hover {
    color: #10B981;
  }
`;

// ============================================
// NAVIGATION SECTION
// ============================================
const NavSection = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 12px;
  flex: 1;
`;

const NavItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  height: 44px;
  padding: 0 12px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  position: relative;
  background: ${({ $active }) => $active ? 'rgba(16, 185, 129, 0.15)' : 'transparent'};
  transition: background 0.2s;
  
  &:hover {
    background: ${({ $active }) => $active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)'};
  }
`;

const NavIcon = styled.div`
  width: 40px;
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Slate 400 normal, Emerald 500 active */
  color: ${({ $active }) => $active ? '#10B981' : '#94A3B8'};
  transition: color 0.2s;

  ${NavItem}:hover & {
    color: ${({ $active }) => $active ? '#10B981' : '#FFFFFF'};
  }
`;

const NavLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
  /* Slate 300 normal, White active */
  color: ${({ $active }) => $active ? '#FFFFFF' : '#CBD5E1'};
  white-space: nowrap;
  opacity: 0;
  transform: translateX(-10px);
  transition: opacity 0.2s 0.1s, transform 0.2s 0.1s, color 0.2s;

  ${NavItem}:hover & {
    color: #FFFFFF;
  }
`;

const ActiveIndicator = styled.div`
  position: absolute;
  left: -12px;
  width: 3px;
  height: 24px;
  background: #10B981;
  border-radius: 0 4px 4px 0;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.6);
`;

// ============================================
// BOTTOM SECTION (Profile & Logout)
// ============================================
const BottomSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 12px;
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 16px;
`;

const ProfileItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  height: 48px;
  padding: 0 12px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  background: transparent;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
`;

const ProfileAvatar = styled.div`
  width: 36px;
  min-width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${({ $color }) => $color || 'linear-gradient(135deg, #10B981, #059669)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  opacity: 0;
  transform: translateX(-10px);
  transition: opacity 0.2s 0.1s, transform 0.2s 0.1s;
`;

const ProfileName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
`;

const ProfileRole = styled.span`
  font-size: 11px;
  color: #64748B; /* Slate 500 */
`;

const LogoutItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  height: 44px;
  padding: 0 12px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  background: transparent;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(239, 68, 68, 0.15);
    
    ${() => LogoutIcon} {
      color: #F87171;
    }
    
    ${() => LogoutLabel} {
      color: #F87171;
    }
  }
`;

const LogoutIcon = styled.div`
  width: 40px;
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94A3B8; /* Slate 400 */
  transition: color 0.2s;
`;

const LogoutLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #CBD5E1; /* Slate 300 */
  white-space: nowrap;
  opacity: 0;
  transform: translateX(-10px);
  transition: opacity 0.2s 0.1s, transform 0.2s 0.1s, color 0.2s;
`;

export default ModernSidebar;
