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
		retry: false,
		staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
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
