import { Request, Response } from 'express';
import { authenticateUser } from '../services/auth.service';

export const login = async (req: Request, res: Response) => {
	const { email, password } = req.body;
	try {
		const token = await authenticateUser(email, password);
		res.json({ token });
	} catch (error) {
		if (error instanceof Error) {
			res.status(401).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};

export const getCurrentUser = async (req: Request, res: Response) => {
	try {
		// req.user is set by the authenticateToken middleware
		res.json(req.user);
	} catch (error) {
		if (error instanceof Error) {
			res.status(401).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};
