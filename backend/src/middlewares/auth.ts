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

	// console.log('Auth middleware:', {
	// 	hasAuthHeader: !!authHeader,
	// 	token: token ? 'present' : 'missing',
	// });

	if (!token) {
		console.log('Auth failed: No token provided');
		return res.status(401).json({ error: 'Authentication required' });
	}

	try {
		const user = jwt.verify(token, process.env.JWT_SECRET as string) as {
			user_id: string;
			email: string;
		};
		// console.log('Auth successful:', { user_id: user.user_id });
		req.user = user;
		next();
	} catch (error) {
		console.error('Auth failed:', error);
		return res.status(403).json({ error: 'Invalid or expired token' });
	}
};
