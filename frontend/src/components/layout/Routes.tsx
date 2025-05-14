import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuditLogDashboard } from '../../features/admin';
import LoginPage from '../../features/auth/LoginPage';
import ProfilePage from '../../features/auth/ProfilePage';
import MatchPage from '../../features/match/MatchPage';
import WatchlistPage from '../../features/watchlist/WatchlistPage';
import { useAuth } from '../../hooks/useAuth';

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
	return (
		<Routes>
			<Route path='/login' element={<LoginPage />} />
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
			<Route
				path='/admin/logs'
				element={<AdminRoute element={<AuditLogDashboard />} />}
			/>
			<Route path='/' element={<Navigate to='/watchlist' />} />
		</Routes>
	);
};

export default AppRoutes;
