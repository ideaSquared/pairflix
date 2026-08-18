import { Loading } from '@pairflix/components';
import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../features/auth/LoginPage';
import TwoFactorSetupPage from '../features/auth/TwoFactorSetupPage';
import { useAuth } from '../hooks/useAuth';

// Lazy load admin components
const AdminDashboard = React.lazy(
  () => import('../features/admin/components/dashboard/AdminDashboardContent')
);
const UserManagementContent = React.lazy(
  () => import('../features/user-management/UserManagementContent')
);
const ContentModeration = React.lazy(
  () => import('../features/admin/components/content/ContentModerationContent')
);
const AuditLogContent = React.lazy(
  () => import('../features/admin/components/activity/AuditLogContent')
);
const AdminSettings = React.lazy(
  () => import('../features/admin/components/AdminSettings')
);

// Auth guard for admin routes -- requireAdmin (services/api/src/middleware/auth.ts) is the
// real gate; this mirrors it client-side for UX (avoids a round-trip 403 before showing the
// right prompt), the server enforces it regardless.
const AdminRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <Loading message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  if (!user.totpEnabled) {
    return <Navigate to="/setup-2fa" replace />;
  }

  return <>{element}</>;
};

const TwoFactorSetupRoute: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <Loading message="Checking authentication..." />;
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  if (user.totpEnabled) {
    return <Navigate to="/" replace />;
  }

  return <TwoFactorSetupPage />;
};

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loading message="Loading page..." />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/setup-2fa" element={<TwoFactorSetupRoute />} />

        {/* Admin routes - now directly rendered since AppLayout provides the layout */}
        <Route index element={<AdminRoute element={<AdminDashboard />} />} />
        <Route
          path="/users"
          element={<AdminRoute element={<UserManagementContent />} />}
        />
        <Route
          path="/content"
          element={<AdminRoute element={<ContentModeration />} />}
        />
        <Route
          path="/logs"
          element={<AdminRoute element={<AuditLogContent />} />}
        />
        <Route
          path="/settings"
          element={<AdminRoute element={<AdminSettings />} />}
        />

        {/* Redirect all other routes to admin dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
