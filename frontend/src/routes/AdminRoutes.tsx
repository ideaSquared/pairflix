import { Navigate, Route, Routes } from 'react-router-dom';
import AdminDashboard from '../features/admin/components/AdminDashboard';
import AdminLayout from '../features/admin/components/AdminLayout';
import AdminSettings from '../features/admin/components/AdminSettings';
import AuditLogDashboard from '../features/admin/components/AuditLogDashboard';
import SystemStats from '../features/admin/components/SystemStats';
import UserManagement from '../features/admin/components/UserManagement';

export const AdminRoutes = () => {
	return (
		<Routes>
			<Route path='/' element={<AdminLayout />}>
				<Route index element={<AdminDashboard />} />
				<Route path='users' element={<UserManagement />} />
				<Route path='logs' element={<AuditLogDashboard />} />
				<Route path='stats' element={<SystemStats />} />
				<Route path='settings' element={<AdminSettings />} />
				<Route path='*' element={<Navigate to='/admin' replace />} />
			</Route>
		</Routes>
	);
};
