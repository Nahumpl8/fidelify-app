import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages - Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ClientLogin from './pages/auth/ClientLogin';

// Pages - Public
import Landing from './pages/public/Landing';
import JoinPage from './pages/public/JoinPage';

// Pages - Client Portal
import ClientPortal from './pages/client/ClientPortal';
import ClientCardDetail from './pages/client/ClientCardDetail';

// Pages - Dashboard
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import Overview from './pages/dashboard/Overview';
import Customers from './pages/dashboard/Customers';
import ClientsPage from './pages/dashboard/ClientsPage';
import ClientDetailPage from './pages/dashboard/ClientDetailPage';
import ScanPage from './pages/dashboard/ScanPage';
import Settings from './pages/dashboard/Settings';

// Pages - Builder
import PassBuilder from './pages/pass-builder/Builder';
import CardWizard from './pages/card-wizard/CardWizard';
import SpecialPromo from './pages/promo-wizard/SpecialPromo';


/**
 * ProtectedRoute: Solo business owners, redirige clients al portal
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, isClient } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        Verificando sesión...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Client users go to their portal
  if (isClient()) {
    return <Navigate to="/portal" replace />;
  }

  return children;
};

/**
 * ClientRoute: Solo clientes autenticados
 */
const ClientRoute = ({ children }) => {
  const { isAuthenticated, loading, isClient } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        Verificando sesión...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/client/login" replace />;
  }

  // Business users go to their dashboard
  if (!isClient()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

/**
 * PublicOnlyRoute: Redirige según rol si ya hay sesión
 */
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading, isClient } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        Cargando...
      </div>
    );
  }

  if (isAuthenticated) {
    if (isClient()) {
      return <Navigate to="/portal" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

/**
 * DashboardRoute: Wrapper para rutas del dashboard
 */
const DashboardRoute = ({ children }) => {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
};

/**
 * Router: Configuración de todas las rutas
 */
const Router = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Landing />} />

      {/* Registro de clientes por slug del negocio */}
      <Route path="/join/:slug" element={<JoinPage />} />

      {/* Rutas de autenticación - Business */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPassword />
          </PublicOnlyRoute>
        }
      />

      {/* Rutas de autenticación - Client */}
      <Route
        path="/client/login"
        element={
          <PublicOnlyRoute>
            <ClientLogin />
          </PublicOnlyRoute>
        }
      />

      {/* Portal del cliente */}
      <Route
        path="/portal"
        element={
          <ClientRoute>
            <ClientPortal />
          </ClientRoute>
        }
      />
      <Route
        path="/portal/card/:cardId"
        element={
          <ClientRoute>
            <ClientCardDetail />
          </ClientRoute>
        }
      />

      {/* Dashboard - Rutas protegidas (business) */}
      <Route
        path="/dashboard"
        element={
          <DashboardRoute>
            <DashboardHome />
          </DashboardRoute>
        }
      />
      <Route
        path="/dashboard/overview"
        element={
          <DashboardRoute>
            <Overview />
          </DashboardRoute>
        }
      />
      <Route
        path="/dashboard/customers"
        element={
          <DashboardRoute>
            <Customers />
          </DashboardRoute>
        }
      />
      <Route
        path="/dashboard/clients"
        element={
          <DashboardRoute>
            <ClientsPage />
          </DashboardRoute>
        }
      />
      <Route
        path="/dashboard/clients/:id"
        element={
          <DashboardRoute>
            <ClientDetailPage />
          </DashboardRoute>
        }
      />
      <Route
        path="/dashboard/scan"
        element={
          <DashboardRoute>
            <ScanPage />
          </DashboardRoute>
        }
      />
      <Route
        path="/dashboard/builder"
        element={
          <DashboardRoute>
            <PassBuilder />
          </DashboardRoute>
        }
      />
      <Route
        path="/dashboard/wizard"
        element={
          <ProtectedRoute>
            <CardWizard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/promo"
        element={
          <DashboardRoute>
            <SpecialPromo />
          </DashboardRoute>
        }
      />
      <Route
        path="/dashboard/settings"
        element={
          <DashboardRoute>
            <Settings />
          </DashboardRoute>
        }
      />

      {/* Builder público (demo) */}
      <Route path="/builder" element={<PassBuilder />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default Router;
