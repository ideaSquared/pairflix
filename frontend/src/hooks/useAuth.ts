import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
	user_id: string;
	email: string;
	username: string;
}

export const useAuth = () => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [user, setUser] = useState<User | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		checkAuth();
	}, []);

	const checkAuth = () => {
		const token = localStorage.getItem('token');
		if (token) {
			try {
				// Parse the JWT payload
				const payload = JSON.parse(atob(token.split('.')[1]));
				const isValid = payload.exp * 1000 > Date.now();

				if (isValid) {
					setIsAuthenticated(true);
					setUser({
						user_id: payload.user_id,
						email: payload.email,
						username: payload.username,
					});
				} else {
					localStorage.removeItem('token');
					setIsAuthenticated(false);
					setUser(null);
					navigate('/login');
				}
			} catch (e) {
				setIsAuthenticated(false);
				setUser(null);
				localStorage.removeItem('token');
				navigate('/login');
			}
		} else {
			setIsAuthenticated(false);
			setUser(null);
		}
		setIsLoading(false);
	};

	const login = (token: string) => {
		localStorage.setItem('token', token);
		setIsAuthenticated(true);
		const payload = JSON.parse(atob(token.split('.')[1]));
		setUser({
			user_id: payload.user_id,
			email: payload.email,
			username: payload.username,
		});
		navigate('/watchlist');
	};

	const logout = () => {
		localStorage.removeItem('token');
		setIsAuthenticated(false);
		setUser(null);
		navigate('/login');
	};

	return {
		isAuthenticated,
		isLoading,
		user,
		login,
		logout,
		checkAuth,
	};
};

export default useAuth;
