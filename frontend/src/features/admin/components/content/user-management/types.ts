// User management related types

export type UserRole = 'user' | 'moderator' | 'admin';
export type UserStatus =
	| 'active'
	| 'suspended'
	| 'pending'
	| 'inactive'
	| 'banned';

export interface User {
	id: string;
	user_id?: string;
	username: string;
	email: string;
	role: UserRole;
	status: UserStatus;
	name?: string;
	created_at: string;
	last_login?: string | null;
}

export interface UserActivity {
	id: string;
	activity_type: string;
	details: string;
	timestamp: string;
	ip_address: string;
}

export interface UserManagementFilters {
	roleFilter: string;
	statusFilter: string;
	sortBy: string;
	sortOrder: 'asc' | 'desc';
}
