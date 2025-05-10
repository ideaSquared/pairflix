import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../services/api';

export function useAuth() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const {
		data: user,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['auth'],
		queryFn: authApi.auth.getCurrentUser,
		retry: (failureCount, error) => {
			if (error instanceof Error && 
				(error.message === 'Authentication required' || 
				error.message === 'Session expired. Please login again.')) {
				return false;
			}
			return failureCount < 3;
		},
		staleTime: 0, // Remove stale time to ensure immediate updates
		cacheTime: 0, // Disable caching to ensure fresh data
	});

	const logout = () => {
		localStorage.removeItem('token');
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
