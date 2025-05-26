import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';

interface AuthUser {
	user_id: string;
	email: string;
	username: string;
	role: string;
}

export function useAuth() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const {
		data: user,
		isLoading,
		error,
	} = useQuery<AuthUser>({
		queryKey: ['auth'],
		queryFn: async () => {
			const token = localStorage.getItem('token');
			if (!token) {
				throw new Error('Authentication required');
			}

			// Validate the token
			const isValid = await api.auth.validateToken();
			if (!isValid) {
				localStorage.removeItem('token');
				localStorage.removeItem('user');
				throw new Error('Authentication required');
			}

			// Return the cached user data
			const userData = localStorage.getItem('user');
			if (!userData) {
				throw new Error('Authentication required');
			}

			return JSON.parse(userData);
		},
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
		staleTime: 60000, // Consider data fresh for 1 minute
		cacheTime: 60000, // Keep data in cache for 1 minute
		refetchOnWindowFocus: false, // Don't refetch when window regains focus
		enabled: !!localStorage.getItem('token'), // Only run the query if there's a token
	});

	const logout = async () => {
		// Clear local storage and invalidate queries
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		queryClient.setQueryData(['auth'], null);
		queryClient.invalidateQueries();
		navigate('/login');
	};

	const checkAuth = () => {
		// Debounce the auth check to prevent multiple calls
		if (refreshTimeoutRef.current) {
			clearTimeout(refreshTimeoutRef.current);
		}

		refreshTimeoutRef.current = setTimeout(() => {
			queryClient.invalidateQueries(['auth']);
			refreshTimeoutRef.current = null;
		}, 300);
	};

	const isAuthenticated = Boolean(user && localStorage.getItem('token'));

	return { user, isLoading, error, logout, checkAuth, isAuthenticated };
}

export default useAuth;
