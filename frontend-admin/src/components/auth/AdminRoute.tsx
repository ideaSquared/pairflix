import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

type AdminRouteProps = {
	element: React.ReactElement;
};

export const AdminRoute: React.FC<AdminRouteProps> = ({ element }) => {
	const { isAuthenticated, isLoading, user } = useAdminAuth();

	if (isLoading) {
		return <div className='loading'>Loading authentication status...</div>;
	}

	if (!isAuthenticated) {
		return <Navigate to='/login' replace />;
	}

	// Ensure the user has admin privileges
	if (user?.role !== 'admin') {
		return <Navigate to='/login' replace />;
	}

	return element;
};
