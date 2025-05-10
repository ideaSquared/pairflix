import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

declare global {
	namespace Express {
		interface Request {
			user?: {
				user_id: string;
				email: string;
				username: string;
				preferences: {
					theme: 'light' | 'dark';
					viewStyle: 'list' | 'grid';
					emailNotifications: boolean;
					autoArchiveDays: number;
					favoriteGenres: string[];
				};
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
		console.log('Auth failed: No token provided');
		return res.status(401).json({ error: 'Authentication required' });
	}

	try {
		const user = jwt.verify(token, process.env.JWT_SECRET as string) as {
			user_id: string;
			email: string;
			username: string;
			preferences: {
				theme: 'light' | 'dark';
				viewStyle: 'list' | 'grid';
				emailNotifications: boolean;
				autoArchiveDays: number;
				favoriteGenres: string[];
			};
		};
		req.user = user;
		next();
	} catch (error) {
		console.error('Auth failed:', error);
		return res.status(403).json({ error: 'Invalid or expired token' });
	}
};
