import { Navigate, Route, Routes } from 'react-router-dom';
import ActivityManagement from '../features/admin/components/ActivityManagement';
import AdminLayout from '../features/admin/components/AdminLayout';
import AdminSettings from '../features/admin/components/AdminSettings';
import UnifiedDashboard from '../features/admin/components/UnifiedDashboard';
import UserManagementContent from '../features/admin/components/UserManagement';

export const AdminRoutes = () => {
	return (
		<Routes>
			<Route path='/' element={<AdminLayout />}>
				<Route index element={<UnifiedDashboard />} />
				<Route path='users' element={<UserManagementContent />} />
				<Route path='activity' element={<ActivityManagement />} />
				<Route path='settings' element={<AdminSettings />} />
				<Route path='*' element={<Navigate to='/admin' replace />} />
			</Route>
		</Routes>
	);
};
