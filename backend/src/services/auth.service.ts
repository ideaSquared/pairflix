import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

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
	await user.save();

	const token = jwt.sign(
		{
			user_id: user.user_id,
			email: user.email,
			username: user.username,
			role: user.role,
			status: user.status, // Include user status in token
			preferences: user.preferences,
		},
		process.env.JWT_SECRET!,
		{ expiresIn: '7d' }
	);
	return token;
};
