import { Navigate, Route, Routes } from 'react-router-dom';
import ActivityManagement from '../features/admin/components/ActivityManagement';
import AdminSettings from '../features/admin/components/AdminSettings';
import UnifiedDashboard from '../features/admin/components/UnifiedDashboard';
import UserManagementContent from '../features/user-management/UserManagementContent';
import AdminLayout from '../layouts/AdminLayout';

export const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<UnifiedDashboard />} />
        <Route path="users" element={<UserManagementContent />} />
        <Route path="activity" element={<ActivityManagement />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
};
