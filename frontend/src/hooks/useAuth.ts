import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		checkAuth();
	}, []);

	const checkAuth = () => {
		const token = localStorage.getItem('token');
		if (token) {
			try {
				// Basic token validation (ensure it's not expired)
				const payload = JSON.parse(atob(token.split('.')[1]));
				const isValid = payload.exp * 1000 > Date.now();
				setIsAuthenticated(isValid);
				if (!isValid) {
					localStorage.removeItem('token');
					navigate('/login');
				}
			} catch (e) {
				setIsAuthenticated(false);
				localStorage.removeItem('token');
				navigate('/login');
			}
		} else {
			setIsAuthenticated(false);
		}
		setIsLoading(false);
	};

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
		checkAuth,
	};
};

export default useAuth;
