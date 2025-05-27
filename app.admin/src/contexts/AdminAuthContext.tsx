import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService } from '../services/api.service';

// Constants for consistent token storage
export const ADMIN_TOKEN_KEY = 'admin_token';

type AdminUser = {
	id: string;
	email: string;
	name: string;
	role: string;
};

type AdminAuthContextType = {
	user: AdminUser | null;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
	checkAuth: () => Promise<boolean>;
	isAuthenticated: boolean;
};

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export const useAdminAuth = () => {
	const context = useContext(AdminAuthContext);
	if (!context) {
		throw new Error('useAdminAuth must be used within an AdminAuthProvider');
	}
	return context;
};

type AdminAuthProviderProps = {
	children: React.ReactNode;
};

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({
	children,
}) => {
	const [user, setUser] = useState<AdminUser | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Function to verify authentication status with the server
	const checkAuthStatus = async (): Promise<boolean> => {
		try {
			const token = localStorage.getItem(ADMIN_TOKEN_KEY);
			if (!token) {
				console.log('No admin token found in localStorage');
				return false;
			}

			// Validate token with the API
			console.log('Validating admin token with API');
			const userData = await apiService.get('/api/admin/validate-token');
			console.log('Token validated successfully:', userData);
			setUser(userData);
			return true;
		} catch (error) {
			// Clear invalid token
			console.error('Auth check error:', error);
			localStorage.removeItem(ADMIN_TOKEN_KEY);
			setUser(null);
			return false;
		}
	};

	useEffect(() => {
		// Check if user is already logged in on mount
		const initAuth = async () => {
			try {
				await checkAuthStatus();
			} finally {
				setIsLoading(false);
			}
		};

		initAuth();
	}, []);

	const login = async (email: string, password: string) => {
		setIsLoading(true);
		try {
			console.log('Attempting login for:', email);
			const data = await apiService.post('/api/admin/login', {
				email,
				password,
			});

			if (!data || !data.token) {
				throw new Error('Invalid response from server - no token received');
			}

			console.log('Login successful, storing token');
			localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
			setUser(data.user);
		} catch (error) {
			console.error('Login error:', error);
			// Ensure no corrupted auth state
			localStorage.removeItem(ADMIN_TOKEN_KEY);
			setUser(null);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const logout = () => {
		console.log('Logging out admin user');
		localStorage.removeItem(ADMIN_TOKEN_KEY);
		setUser(null);
	};

	// Expose checkAuthStatus as checkAuth to components
	const checkAuth = async (): Promise<boolean> => {
		setIsLoading(true);
		try {
			return await checkAuthStatus();
		} finally {
			setIsLoading(false);
		}
	};

	const value = {
		user,
		isLoading,
		login,
		logout,
		checkAuth,
		isAuthenticated: !!user,
	};

	return (
		<AdminAuthContext.Provider value={value}>
			{children}
		</AdminAuthContext.Provider>
	);
};
