/// <reference types="vite/client" />
import { BASE_URL, ADMIN_TOKEN_KEY, fetchWithAuth } from './utils';

interface LoginResponse {
	token: string;
	user: {
		id: string;
		email: string;
		role: string;
	};
}

interface AdminLoginParams {
	email: string;
	password: string;
}

export const auth = {
	async login(params: AdminLoginParams): Promise<LoginResponse> {
		const response = await fetch(`${BASE_URL}/api/admin/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(params),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || error.message || 'Login failed');
		}

		return response.json();
	},
	async validateToken(): Promise<boolean> {
		try {			const token = localStorage.getItem(ADMIN_TOKEN_KEY);
			if (!token) {
				return false;
			}
			
			const response = await fetch(`${BASE_URL}/api/admin/validate-token`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			
			if (!response.ok) {
				console.log('Token validation failed:', response.status);
				return false;
			}
			
			return true;
		} catch (error) {
			console.error('Token validation error:', error);
			return false;
		}
	},

	logout(): void {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
	},
};
