/**
 * API Service for making HTTP requests with authentication
 */
import { ADMIN_TOKEN_KEY } from '../contexts/AdminAuthContext';

class ApiService {
	private baseUrl: string;

	constructor() {
		this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
	}

	private getAuthHeader(): Headers {
		const token = localStorage.getItem(ADMIN_TOKEN_KEY);
		const headers = new Headers({
			'Content-Type': 'application/json',
		});

		if (token) {
			headers.set('Authorization', `Bearer ${token}`);
		}

		return headers;
	}

	/**
	 * Make a GET request to the API
	 */
	async get(
		endpoint: string,
		queryParams: Record<string, string> = {}
	): Promise<any> {
		const url = new URL(`${this.baseUrl}${endpoint}`);

		// Add query parameters if provided
		Object.entries(queryParams).forEach(([key, value]) => {
			url.searchParams.append(key, value);
		});

		const response = await fetch(url.toString(), {
			method: 'GET',
			headers: this.getAuthHeader(),
			credentials: 'include', // Include cookies if server uses them
		});

		if (!response.ok) {
			throw await this.handleError(response);
		}

		return response.json();
	}

	/**
	 * Make a POST request to the API
	 */
	async post(endpoint: string, data?: any): Promise<any> {
		const response = await fetch(`${this.baseUrl}${endpoint}`, {
			method: 'POST',
			headers: this.getAuthHeader(),
			credentials: 'include', // Include cookies if server uses them
			body: data ? JSON.stringify(data) : undefined,
		});

		if (!response.ok) {
			throw await this.handleError(response);
		}

		return response.json();
	}

	/**
	 * Make a PUT request to the API
	 */
	async put(endpoint: string, data?: any): Promise<any> {
		const response = await fetch(`${this.baseUrl}${endpoint}`, {
			method: 'PUT',
			headers: this.getAuthHeader(),
			credentials: 'include', // Include cookies if server uses them
			body: data ? JSON.stringify(data) : undefined,
		});

		if (!response.ok) {
			throw await this.handleError(response);
		}

		return response.json();
	}

	/**
	 * Make a DELETE request to the API
	 */
	async delete(endpoint: string): Promise<any> {
		const response = await fetch(`${this.baseUrl}${endpoint}`, {
			method: 'DELETE',
			headers: this.getAuthHeader(),
			credentials: 'include', // Include cookies if server uses them
		});

		if (!response.ok) {
			throw await this.handleError(response);
		}

		return response.json();
	}

	/**
	 * Handle API error responses
	 */
	private async handleError(response: Response) {
		// Special handling for authentication errors
		if (response.status === 401) {
			console.warn('Authentication error - clearing token');
			localStorage.removeItem(ADMIN_TOKEN_KEY);
			
			// Get current URL path
			const currentPath = window.location.pathname;
			// Only redirect to login if not already on login page
			if (!currentPath.includes('/login')) {
				console.log('Redirecting to login page due to authentication error');
				// Give a small delay to allow error handling to complete
				setTimeout(() => {
					window.location.href = '/login';
				}, 100);
			}
		}

		let errorMessage = 'An unknown error occurred';

		try {
			const errorData = await response.json();
			errorMessage = errorData.error || errorData.message || errorMessage;
		} catch (e) {
			// If we can't parse the JSON, use the status text
			errorMessage = response.statusText || errorMessage;
		}

		const error = new Error(errorMessage);
		(error as any).status = response.status;
		return error;
	}
}

// Export singleton instance
export const apiService = new ApiService();
