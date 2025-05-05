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
	const token = jwt.sign(
		{ user_id: user.user_id, email: user.email },
		process.env.JWT_SECRET!,
		{ expiresIn: '7d' }
	);
	return token;
};
