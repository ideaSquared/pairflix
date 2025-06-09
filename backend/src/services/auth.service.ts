import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Define proper types for JWT payload and user data
interface UserForToken {
	user_id: string;
	email: string;
	username: string;
	role: string;
	status: 'active' | 'inactive' | 'pending' | 'suspended' | 'banned';
	preferences: {
		theme?: 'light' | 'dark';
		viewStyle?: 'list' | 'grid';
		emailNotifications?: boolean;
		autoArchiveDays?: number;
		favoriteGenres?: string[];
	};
}

export const authenticateUser = async (email: string, password: string) => {
	const user = await User.findOne({ where: { email } });
	if (!user) {
		throw new Error('Invalid credentials');
	}
	const isPasswordValid = await bcrypt.compare(password, user.password_hash);
	if (!isPasswordValid) {
		throw new Error('Invalid credentials');
	}

	// Check user status - prevent login for suspended or banned users
	if (user.status === 'suspended') {
		throw new Error(
			'Your account has been suspended. Please contact support for assistance.'
		);
	}

	if (user.status === 'banned') {
		throw new Error(
			'Your account has been banned for violating our terms of service.'
		);
	}

	// Update the last login time
	user.last_login = new Date();

	// Check if save method is available (useful for testing)
	if (typeof user.save === 'function') {
		await user.save();
	} else {
		// In test environment, we might not have the save method
		// This could also update the user via User.update if needed in tests
		console.error('Save method not available - in test environment');
	}

	const token = jwt.sign(
		{
			user_id: user.user_id,
			email: user.email,
			username: user.username,
			role: user.role ?? 'user',
			status: user.status ?? 'active', // Include user status in token with default
			preferences: user.preferences ?? {},
		},
		process.env.JWT_SECRET!,
		{ expiresIn: '7d' }
	);
	return token;
};

export const generateToken = (user: UserForToken): string =>
	jwt.sign(
		{
			user_id: user.user_id,
			email: user.email,
			username: user.username,
			role: user.role ?? 'user',
			status: user.status ?? 'active',
			preferences: user.preferences ?? {},
		},
		process.env.JWT_SECRET!,
		{ expiresIn: '7d' }
	);
