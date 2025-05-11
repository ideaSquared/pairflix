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
		if (!req.user) {
			return res.status(500).json({ error: 'Unknown error occurred' });
		}
		res.json(req.user);
	} catch (error) {
		// Always return 500 error when there's an issue with retrieving the current user
		res.status(500).json({ error: 'Unknown error occurred' });
	}
};
