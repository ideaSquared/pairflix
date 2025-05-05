import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		const token = localStorage.getItem('token');
		setIsAuthenticated(!!token);
		setIsLoading(false);
	}, []);

	const login = (token: string) => {
		localStorage.setItem('token', token);
		setIsAuthenticated(true);
		navigate('/watchlist');
	};

	const logout = () => {
		localStorage.removeItem('token');
		setIsAuthenticated(false);
		navigate('/login');
	};

	return {
		isAuthenticated,
		isLoading,
		login,
		logout,
	};
};

export default useAuth;
