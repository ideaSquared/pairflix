import bcrypt from 'bcryptjs';
import User from '../models/User';

export const findUserByEmailService = async (
	email: string,
	requestingUser: any
) => {
	const user = await User.findOne({
		where: { email },
		attributes: ['user_id', 'email'],
	});
	if (!user || user.user_id === requestingUser.user_id) {
		return null;
	}
	return user;
};

export const updateEmailService = async (
	user: any,
	newEmail: string,
	password: string
) => {
	const existingUser = await User.findOne({ where: { email: newEmail } });
	if (existingUser) {
		throw new Error('Email is already in use');
	}
	const isPasswordValid = await bcrypt.compare(password, user.password_hash);
	if (!isPasswordValid) {
		throw new Error('Invalid password');
	}
	user.email = newEmail;
	await user.save();
	return user;
};

export const updatePasswordService = async (
	user: any,
	currentPassword: string,
	newPassword: string
) => {
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
