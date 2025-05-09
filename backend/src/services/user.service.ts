import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const findUserByEmailService = async (
	email: string,
	requestingUser: any
) => {
	const user = await User.findOne({
		where: { email },
		attributes: ['user_id', 'email', 'username'],
	});
	if (!user || user.user_id === requestingUser.user_id) {
		return null;
	}
	return user;
};

export const updateEmailService = async (
	requestUser: any,
	newEmail: string,
	password: string
) => {
	const existingUser = await User.findOne({ where: { email: newEmail } });
	if (existingUser) {
		throw new Error('Email is already in use');
	}

	// Fetch fresh user instance
	const user = await User.findByPk(requestUser.user_id);
	if (!user) {
		throw new Error('User not found');
	}

	const isPasswordValid = await bcrypt.compare(password, user.password_hash);
	if (!isPasswordValid) {
		throw new Error('Invalid password');
	}

	user.email = newEmail;
	await user.save();

	// Generate new token with updated email
	const token = jwt.sign(
		{ user_id: user.user_id, email: user.email, username: user.username },
		process.env.JWT_SECRET!,
		{ expiresIn: '7d' }
	);

	return { user, token };
};

export const updatePasswordService = async (
	requestUser: any,
	currentPassword: string,
	newPassword: string
) => {
	// Fetch fresh user instance
	const user = await User.findByPk(requestUser.user_id);
	if (!user) {
		throw new Error('User not found');
	}

	const isPasswordValid = await bcrypt.compare(
		currentPassword,
		user.password_hash
	);
	if (!isPasswordValid) {
		throw new Error('Invalid current password');
	}

	user.password_hash = await bcrypt.hash(newPassword, 10);
	await user.save();
};

export const updateUsernameService = async (
	requestUser: any,
	newUsername: string
) => {
	// Validate username format first
	if (!/^[a-zA-Z0-9_-]{3,30}$/.test(newUsername)) {
		throw new Error(
			'Username must be 3-30 characters and contain only letters, numbers, underscore, or hyphen'
		);
	}

	// Check if username is already taken
	const existingUser = await User.findOne({ where: { username: newUsername } });
	if (existingUser) {
		throw new Error('Username is already in use');
	}

	// Fetch fresh user instance
	const user = await User.findByPk(requestUser.user_id);
	if (!user) {
		throw new Error('User not found');
	}

	user.username = newUsername;
	await user.save();

	// Generate new token with updated username
	const token = jwt.sign(
		{ user_id: user.user_id, email: user.email, username: user.username },
		process.env.JWT_SECRET!,
		{ expiresIn: '7d' }
	);

	return { user, token };
};
