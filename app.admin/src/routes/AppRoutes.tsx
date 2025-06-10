import { Loading } from '@pairflix/components';
import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../features/auth/LoginPage';
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
const SystemMonitoring = React.lazy(() => import('../pages/SystemMonitoring'));
const ActivityManagement = React.lazy(
  () => import('../features/admin/components/ActivityManagement')
);
const AuditLogContent = React.lazy(
  () => import('../features/admin/components/activity/AuditLogContent')
);
const SystemStatsContent = React.lazy(
  () => import('../features/admin/components/dashboard/SystemStatsContent')
);
const AdminSettings = React.lazy(
  () => import('../features/admin/components/AdminSettings')
);

// Auth guard for admin routes
const AdminRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Add debug logging to understand auth state
  console.log('Auth state:', {
    isAuthenticated,
    isLoading,
    userRole: user?.role,
  });

  if (isLoading) {
    return <Loading message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Ensure user has admin role
  if (user?.role !== 'admin') {
    console.log('User is not admin, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return <>{element}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loading message="Loading page..." />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

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
          path="/monitoring"
          element={<AdminRoute element={<SystemMonitoring />} />}
        />
        <Route
          path="/activity"
          element={<AdminRoute element={<ActivityManagement />} />}
        />
        <Route
          path="/logs"
          element={<AdminRoute element={<AuditLogContent />} />}
        />
        <Route
          path="/stats"
          element={<AdminRoute element={<SystemStatsContent />} />}
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
