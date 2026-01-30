import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages - Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Pages - Public
import Landing from './pages/public/Landing';

// Pages - Dashboard
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import Overview from './pages/dashboard/Overview';
import Customers from './pages/dashboard/Customers';
import ClientsPage from './pages/dashboard/ClientsPage';
import ClientDetailPage from './pages/dashboard/ClientDetailPage';
import Settings from './pages/dashboard/Settings';

// Pages - Builder
import PassBuilder from './pages/pass-builder/Builder';
import CardWizard from './pages/card-wizard/CardWizard';
import SpecialPromo from './pages/promo-wizard/SpecialPromo';


/**
 * ProtectedRoute: Redirige a login si no hay sesión
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

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

  return children;
};

/**
 * PublicOnlyRoute: Redirige al dashboard si ya hay sesión
 */
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

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

      {/* Rutas de autenticación */}
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

      {/* Dashboard - Rutas protegidas */}
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
