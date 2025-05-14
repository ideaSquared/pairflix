// Simple fix for error handling
const handleApiError = (error: any, defaultMessage: string) => {
	const errorMessage =
		error?.response?.data?.message || error?.message || defaultMessage;
	console.error(errorMessage);
	return new Error(errorMessage);
};

// Create a simple fetch implementation that doesn't rely on axios
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
	const baseURL =
		(import.meta as any).env.VITE_API_URL || 'http://localhost:3000';
	const headers = new Headers({
		'Content-Type': 'application/json',
		...Object.fromEntries(Object.entries(options.headers || {})),
	});

	const token = localStorage.getItem('token');
	if (token) {
		headers.set('Authorization', `Bearer ${token}`);
	}

	try {
		const response = await fetch(`${baseURL}${endpoint}`, {
			...options,
			headers,
		});

		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}

		return response.json();
	} catch (error) {
		throw handleApiError(error, 'API request failed');
	}
};

// Types
export interface User {
	id: string;
	name: string;
	email: string;
	role: 'admin' | 'moderator' | 'user';
	status: 'active' | 'inactive' | 'pending' | 'suspended';
	createdAt: string;
	lastLogin: string;
}

export interface GetUsersParams {
	limit?: number;
	offset?: number;
	search?: string;
	role?: string;
	status?: string;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}

export interface GetUsersResponse {
	users: User[];
	pagination: {
		total: number;
		limit: number;
		offset: number;
	};
}

export interface UpdateUserPayload {
	username?: string;
	email?: string;
	role?: string;
	status?: string;
}

// Admin API functions
const getUsers = async (
	params: GetUsersParams = {}
): Promise<GetUsersResponse> => {
	try {
		const queryParams = new URLSearchParams();
		if (params.limit) queryParams.append('limit', params.limit.toString());
		if (params.offset) queryParams.append('offset', params.offset.toString());
		if (params.search) queryParams.append('search', params.search);
		if (params.role) queryParams.append('role', params.role);
		if (params.status) queryParams.append('status', params.status);
		if (params.sortBy) queryParams.append('sortBy', params.sortBy);
		if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

		const response = await fetchWithAuth(
			`/admin/users?${queryParams.toString()}`
		);
		return response;
	} catch (error) {
		throw handleApiError(error, 'Failed to fetch users');
	}
};

const getUser = async (userId: string): Promise<User> => {
	try {
		const response = await fetchWithAuth(`/admin/users/${userId}`);
		return response;
	} catch (error) {
		throw handleApiError(error, 'Failed to fetch user details');
	}
};

const updateUser = async (
	userId: string,
	userData: UpdateUserPayload
): Promise<User> => {
	try {
		const response = await fetchWithAuth(`/admin/users/${userId}`, {
			method: 'PUT',
			body: JSON.stringify(userData),
		});
		return response;
	} catch (error) {
		throw handleApiError(error, 'Failed to update user');
	}
};

const deleteUser = async (userId: string): Promise<void> => {
	try {
		await fetchWithAuth(`/admin/users/${userId}`, {
			method: 'DELETE',
		});
	} catch (error) {
		throw handleApiError(error, 'Failed to delete user');
	}
};

// Export all admin API functions
export const adminApi = {
	getUsers,
	getUser,
	updateUser,
	deleteUser,
};
