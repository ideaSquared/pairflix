import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';
import {
	ActivityManagement,
	AdminDashboard,
	AdminLayout,
	AdminSettings,
	AuditLogContent,
	ContentModeration,
	SystemMonitoring,
	SystemStatsContent,
	UserManagementContent,
} from '../../features/admin';
import LoginPage from '../../features/auth/LoginPage';
import ProfilePage from '../../features/auth/ProfilePage';
import MatchPage from '../../features/match/MatchPage';
import WatchlistPage from '../../features/watchlist/WatchlistPage';
import { useAuth } from '../../hooks/useAuth';
import MaintenanceMode from '../common/MaintenanceMode';

const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({
	element,
}) => {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return isAuthenticated ? element : <Navigate to='/login' />;
};

const AdminRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
	const { isAuthenticated, isLoading, user } = useAuth();

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!isAuthenticated) {
		return <Navigate to='/login' />;
	}

	// Check if user has admin role
	if (user?.role !== 'admin') {
		return <Navigate to='/watchlist' />;
	}

	return element;
};

const AppRoutes: React.FC = () => {
	const { settings } = useSettings();
	const { user } = useAuth();

	// Show maintenance mode for non-admin users when enabled
	if (settings?.general.maintenanceMode && user?.role !== 'admin') {
		return <MaintenanceMode />;
	}

	return (
		<Routes>
			<Route path='/login' element={<LoginPage />} />

			{/* Protected user routes */}
			<Route
				path='/watchlist'
				element={<ProtectedRoute element={<WatchlistPage />} />}
			/>
			<Route
				path='/matches'
				element={<ProtectedRoute element={<MatchPage />} />}
			/>
			<Route
				path='/profile'
				element={<ProtectedRoute element={<ProfilePage />} />}
			/>

			{/* Admin routes */}
			<Route path='/admin' element={<AdminRoute element={<AdminLayout />} />}>
				<Route index element={<AdminDashboard />} />
				<Route path='users' element={<UserManagementContent />} />
				<Route path='content' element={<ContentModeration />} />
				<Route path='monitoring' element={<SystemMonitoring />} />
				<Route path='activity' element={<ActivityManagement />} />
				<Route path='logs' element={<AuditLogContent />} />
				<Route path='stats' element={<SystemStatsContent />} />
				<Route path='settings' element={<AdminSettings />} />
			</Route>

			{/* Default route */}
			<Route path='/' element={<Navigate to='/watchlist' />} />
			<Route path='*' element={<Navigate to='/' />} />
		</Routes>
	);
};

export default AppRoutes;
