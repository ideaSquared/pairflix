import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../../features/auth/LoginPage';
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
			<Route path='/' element={<Navigate to='/watchlist' />} />
		</Routes>
	);
};

export default AppRoutes;
