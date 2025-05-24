import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Loading } from '../components/common/Loading';
import MaintenanceMode from '../components/common/MaintenanceMode';
import TestComponent from '../components/common/TestComponent';
import { useSettings } from '../contexts/SettingsContext';
import LoginPage from '../features/auth/LoginPage';
import { useAuth } from '../hooks/useAuth';

// Lazy load admin components
const AdminDashboard = React.lazy(
	() => import('../features/admin/components/dashboard/AdminDashboardContent')
);
const AdminLayout = React.lazy(
	() => import('../features/admin/components/AdminLayout')
);
const UserManagementContent = React.lazy(
	() => import('../features/admin/components/content/UserManagementContent')
);
const ContentModeration = React.lazy(
	() => import('../features/admin/components/content/ContentModerationContent')
);
const SystemMonitoring = React.lazy(
	() => import('../features/admin/components/dashboard/SystemMonitoringContent')
);
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

	if (isLoading) {
		return <Loading message='Checking authentication...' />;
	}

	if (!isAuthenticated) {
		return <Navigate to='/login' replace />;
	}

	// Ensure user has admin role
	if (user?.role !== 'admin') {
		return <Navigate to='/login' replace />;
	}

	return <>{element}</>;
};

const AppRoutes: React.FC = () => {
	const { settings } = useSettings();
	const { user } = useAuth();

	// Show maintenance mode for non-admin users when enabled
	if (settings?.general?.maintenanceMode && user?.role !== 'admin') {
		return <MaintenanceMode />;
	}

	return (
		<Suspense fallback={<Loading message='Loading page...' />}>
			<Routes>
				{/* Public routes */}
				<Route path='/login' element={<LoginPage />} />
				<Route path='/test' element={<TestComponent />} />

				{/* Admin routes - all nested under the AdminLayout */}
				<Route path='/' element={<AdminRoute element={<AdminLayout />} />}>
					<Route index element={<AdminDashboard />} />
					<Route path='users' element={<UserManagementContent />} />
					<Route path='content' element={<ContentModeration />} />
					<Route path='monitoring' element={<SystemMonitoring />} />
					<Route path='activity' element={<ActivityManagement />} />
					<Route path='logs' element={<AuditLogContent />} />
					<Route path='stats' element={<SystemStatsContent />} />
					<Route path='settings' element={<AdminSettings />} />
				</Route>

				{/* Redirect all other routes to admin dashboard */}
				<Route path='*' element={<Navigate to='/' replace />} />
			</Routes>
		</Suspense>
	);
};

export default AppRoutes;
