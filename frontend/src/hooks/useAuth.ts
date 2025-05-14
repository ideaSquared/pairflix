import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../services/api';

interface AuthUser {
	user_id: string;
	email: string;
	username: string;
	role: string;
	preferences?: {
		theme: 'light' | 'dark';
		viewStyle: 'list' | 'grid';
		emailNotifications: boolean;
		autoArchiveDays: number;
		favoriteGenres: string[];
	};
}

export function useAuth() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	// Force a refresh of authentication status when the hook mounts
	useEffect(() => {
		if (localStorage.getItem('token')) {
			queryClient.invalidateQueries(['auth']);
		}
	}, [queryClient]);

	const {
		data: user,
		isLoading,
		error,
	} = useQuery<AuthUser>({
		queryKey: ['auth'],
		queryFn: authApi.auth.getCurrentUser,
		retry: (failureCount, error) => {
			if (
				error instanceof Error &&
				(error.message === 'Authentication required' ||
					error.message === 'Session expired. Please login again.')
			) {
				return false;
			}
			return failureCount < 3;
		},
		staleTime: 0, // Remove stale time to ensure immediate updates
		cacheTime: 0, // Disable caching to ensure fresh data
	});

	const logout = async () => {
		// Call the server-side logout endpoint to record in audit logs
		await authApi.auth.logout();

		// Update local state
		queryClient.setQueryData(['auth'], null);
		queryClient.invalidateQueries();
		navigate('/login');
	};

	const checkAuth = () => {
		queryClient.invalidateQueries(['auth']);
	};

	const isAuthenticated = Boolean(user && localStorage.getItem('token'));

	return { user, isLoading, error, logout, checkAuth, isAuthenticated };
}

export default useAuth;
