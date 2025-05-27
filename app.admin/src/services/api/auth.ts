/// <reference types="vite/client" />
import { BASE_URL, fetchWithAuth } from './utils';

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
		try {
			await fetchWithAuth(`${BASE_URL}/api/admin/validate-token`);
			return true;
		} catch (error) {
			return false;
		}
	},

	logout(): void {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
	},
};
