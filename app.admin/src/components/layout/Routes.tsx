import { UserManagementContent } from '@/features/admin';
import { Loading } from '@pairflix/components';
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ActivityManagement from '../../features/admin/components/ActivityManagement';
import AdminLayout from '../../features/admin/components/AdminLayout';
import AdminSettings from '../../features/admin/components/AdminSettings';
import ContentManagement from '../../features/admin/components/dashboard/ContentManagement';
import SystemMonitoringContent from '../../features/admin/components/dashboard/SystemMonitoringContent';
import SystemStatsContent from '../../features/admin/components/dashboard/SystemStatsContent';
import UnifiedDashboard from '../../features/admin/components/UnifiedDashboard';
import LoginPage from '../../features/auth/LoginPage';
import { useAuth } from '../../hooks/useAuth';

// Auth guard for admin routes
const AdminRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <Loading message="Checking authentication..." />;
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return element;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected admin routes */}
      <Route path="/" element={<AdminRoute element={<AdminLayout />} />}>
        <Route index element={<UnifiedDashboard />} />
        <Route path="users" element={<UserManagementContent />} />
        <Route path="content" element={<ContentManagement />} />
        <Route path="monitoring" element={<SystemMonitoringContent />} />
        <Route path="activity" element={<ActivityManagement />} />
        <Route path="stats" element={<SystemStatsContent />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
