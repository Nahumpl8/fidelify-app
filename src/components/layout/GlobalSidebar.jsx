import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Settings,
    LogOut,
    Sparkles,
    Gift
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const GlobalSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { signOut } = useAuth();

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
        { to: '/dashboard/customers', icon: Users, label: 'Clientes' },
        { to: '/dashboard/wizard', icon: CreditCard, label: 'Wizard' },
        { to: '/dashboard/promo', icon: Gift, label: 'Promoción' },
        { to: '/dashboard/settings', icon: Settings, label: 'Ajustes' },
    ];

    return (
        <SidebarContainer>
            <LogoContainer onClick={() => navigate('/dashboard')}>
                <Sparkles size={24} color="#6366F1" />
            </LogoContainer>

            <Nav>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.to;
                    return (
                        <NavItem
                            key={item.to}
                            $active={isActive}
                            onClick={() => navigate(item.to)}
                            title={item.label}
                        >
                            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            {isActive && <ActiveIndicator />}
                        </NavItem>
                    );
                })}
            </Nav>

            <Footer>
                <NavItem onClick={handleSignOut} title="Cerrar sesión">
                    <LogOut size={20} />
                </NavItem>
            </Footer>
        </SidebarContainer>
    );
};

// ============================================
// STYLED COMPONENTS
// ============================================
const SidebarContainer = styled.aside`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 64px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  z-index: 9999; /* Highest Z-Index */
`;

const LogoContainer = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.05);
  }
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
`;

const NavItem = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  color: ${({ $active }) => $active ? 'white' : 'rgba(255, 255, 255, 0.4)'};
  background: ${({ $active }) => $active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.08);
  }
`;

const ActiveIndicator = styled.div`
  position: absolute;
  left: -12px;
  width: 3px;
  height: 20px;
  background: #6366F1;
  border-radius: 0 4px 4px 0;
  box-shadow: 0 0 12px #6366F1;
`;

const Footer = styled.div`
  margin-top: auto;
`;

export default GlobalSidebar;
