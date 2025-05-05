import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db/connection';

export const login = async (req: Request, res: Response) => {
	const { email, password } = req.body;

	try {
		const result = await query(
			'SELECT user_id, email, password_hash FROM users WHERE email = $1',
			[email]
		);

		const user = result.rows[0];
		if (!user) {
			return res.status(401).json({ error: 'Invalid credentials' });
		}

		const validPassword = await bcrypt.compare(password, user.password_hash);
		if (!validPassword) {
			return res.status(401).json({ error: 'Invalid credentials' });
		}

		const token = jwt.sign(
			{ user_id: user.user_id, email: user.email },
			process.env.JWT_SECRET as string,
			{ expiresIn: '7d' }
		);

		res.json({ token });
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};
