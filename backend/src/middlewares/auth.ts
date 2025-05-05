import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

declare global {
	namespace Express {
		interface Request {
			user?: {
				user_id: string;
				email: string;
			};
		}
	}
}

export const authenticateToken = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (!token) {
		return res.status(401).json({ error: 'Authentication required' });
	}

	try {
		const user = jwt.verify(token, process.env.JWT_SECRET as string) as {
			user_id: string;
			email: string;
		};
		req.user = user;
		next();
	} catch (error) {
		return res.status(403).json({ error: 'Invalid or expired token' });
	}
};
