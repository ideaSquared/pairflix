import bcrypt from 'bcryptjs';
import User from '../models/User';
import { generateToken } from './auth.service';

// Define proper types based on User model
interface UserInstance {
	user_id: string;
	email: string;
	username: string;
	password_hash: string;
	role: string;
	status: 'active' | 'inactive' | 'pending' | 'suspended' | 'banned';
	email_verified: boolean;
	last_login?: Date;
	preferences: {
		theme: 'light' | 'dark';
		viewStyle: 'list' | 'grid';
		emailNotifications: boolean;
		autoArchiveDays: number;
		favoriteGenres: string[];
	};
	created_at: Date;
	updated_at: Date;
	save(): Promise<UserInstance>;
}

interface PublicUserData {
	user_id: string;
	username: string;
	email: string;
	role: string;
	status: string;
}

interface AuthenticatedUser {
	user_id: string;
	email: string;
	username: string;
	role: string;
	status: string;
	email_verified: boolean;
	preferences: {
		theme: 'light' | 'dark';
		viewStyle: 'list' | 'grid';
		emailNotifications: boolean;
		autoArchiveDays: number;
		favoriteGenres: string[];
	};
}

interface ServiceResponse {
	user: UserInstance;
	token: string;
}

export const findUserByEmailService = async (
	email: string,
	requestingUser: AuthenticatedUser
): Promise<PublicUserData | null> => {
	const user = await User.findOne({
		where: { email },
		attributes: ['user_id', 'username', 'email', 'role', 'status'],
	});

	// Don't return the requesting user themselves
	if (!user || user.user_id === requestingUser.user_id) {
		return null;
	}

	return user;
};

export const updateEmailService = async (
	user: AuthenticatedUser,
	newEmail: string,
	password: string
): Promise<ServiceResponse> => {
	// Check if email is already in use by another user
	const existingUser = await User.findOne({
		where: { email: newEmail },
	});

	if (existingUser && existingUser.user_id !== user.user_id) {
		throw new Error('Email is already in use');
	}

	// Get the current user from database
	const currentUser = await User.findByPk(user.user_id);
	if (!currentUser) {
		throw new Error('User not found');
	}

	// Verify current password
	const isPasswordValid = await bcrypt.compare(
		password,
		currentUser.password_hash
	);
	if (!isPasswordValid) {
		throw new Error('Invalid password');
	}

	// Update email
	currentUser.email = newEmail;
	await currentUser.save();

	// Generate new token with updated email
	const token = generateToken(currentUser);

	return { user: currentUser, token };
};

export const updatePasswordService = async (
	user: AuthenticatedUser,
	currentPassword: string,
	newPassword: string
): Promise<void> => {
	// Get the current user from database
	const currentUser = await User.findByPk(user.user_id);
	if (!currentUser) {
		throw new Error('User not found');
	}

	// Verify current password
	const isPasswordValid = await bcrypt.compare(
		currentPassword,
		currentUser.password_hash
	);
	if (!isPasswordValid) {
		throw new Error('Invalid current password');
	}

	// Hash new password
	const hashedPassword = await bcrypt.hash(newPassword, 10);

	// Update password
	currentUser.password_hash = hashedPassword;
	await currentUser.save();
};

export const updateUsernameService = async (
	user: AuthenticatedUser,
	newUsername: string
): Promise<ServiceResponse> => {
	// Validate username format
	if (!/^[a-zA-Z0-9_-]{3,30}$/.test(newUsername)) {
		throw new Error(
			'Username must be 3-30 characters and contain only letters, numbers, underscore, or hyphen'
		);
	}

	// Check if username is already in use by another user
	const existingUser = await User.findOne({
		where: { username: newUsername },
	});

	if (existingUser && existingUser.user_id !== user.user_id) {
		throw new Error('Username is already in use');
	}

	// Get the current user from database
	const currentUser = await User.findByPk(user.user_id);
	if (!currentUser) {
		throw new Error('User not found');
	}

	// Update username
	currentUser.username = newUsername;
	await currentUser.save();

	// Generate new token with updated username
	const token = generateToken(currentUser);

	return { user: currentUser, token };
};

export const updatePreferencesService = async (
	preferences: Record<string, unknown>,
	user: AuthenticatedUser
): Promise<ServiceResponse> => {
	// Get the current user from database
	const currentUser = await User.findByPk(user.user_id);
	if (!currentUser) {
		throw new Error('User not found');
	}

	// Merge new preferences with existing ones
	const currentPreferences = currentUser.preferences || {};
	const updatedPreferences = { ...currentPreferences, ...preferences };

	// Update preferences
	currentUser.preferences = updatedPreferences;
	await currentUser.save();

	// Generate new token with updated preferences
	const token = generateToken(currentUser);

	return { user: currentUser, token };
};
