import { UserRole, UserStatus } from './types';

// Helper function for unimplemented features
export const notImplemented = (feature: string) => {
	alert(`This feature (${feature}) isn't available yet.`);
};

// Get badge variant based on user status
export const getBadgeVariant = (
	status: UserStatus
): 'error' | 'warning' | 'info' | 'success' | 'default' => {
	switch (status) {
		case 'active':
			return 'success';
		case 'suspended':
			return 'warning';
		case 'pending':
			return 'info';
		case 'inactive':
			return 'default';
		case 'banned':
			return 'error';
		default:
			return 'default';
	}
};

// Get badge variant based on user role
export const getRoleBadgeVariant = (
	role: UserRole
): 'error' | 'warning' | 'info' | 'success' | 'default' => {
	switch (role) {
		case 'admin':
			return 'error';
		case 'moderator':
			return 'warning';
		case 'user':
			return 'info';
		default:
			return 'default';
	}
};

// Define a style for the icons
export const IconStyle = { fontSize: '1.2rem' };