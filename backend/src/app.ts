import cors from 'cors';
import express from 'express';
import { authenticateToken } from './middlewares/auth';
import { errorHandler } from './middlewares/error-handler';
import {
	adminRateLimit,
	authRateLimit,
	generalRateLimit,
	searchRateLimit,
} from './middlewares/rate-limiter';
import { requestLogger } from './middlewares/request-logger';

// Import routes
import activityRoutes from './routes/activity.routes';
import adminRoutes from './routes/admin.routes';
import authRoutes from './routes/auth.routes';
import emailRoutes from './routes/email.routes';
import groupRoutes from './routes/groups';
import matchRoutes from './routes/match.routes';
import searchRoutes from './routes/search.routes';
import userRoutes from './routes/user.routes';
import watchlistRoutes from './routes/watchlist.routes';

export function createApp() {
	const app = express();

	// Define allowed origins
	const allowedOrigins =
		process.env.NODE_ENV === 'production'
			? ['https://your-production-domain.com']
			: [
					'http://localhost:5174',
					'http://localhost:5173',
					'http://localhost:3000',
					'http://127.0.0.1:5173',
					'http://127.0.0.1:5174',
					'http://127.0.0.1:3000',
				];

	// CORS configuration
	const corsOptions = {
		origin(
			origin: string | undefined,
			callback: (err: Error | null, allow?: boolean) => void
		) {
			// Allow requests with no origin (like mobile apps, curl requests)
			if (!origin) return callback(null, true);

			if (allowedOrigins.indexOf(origin) !== -1) {
				callback(null, true);
			} else {
				callback(new Error('Not allowed by CORS'));
			}
		},
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
		allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
		exposedHeaders: ['Authorization'],
		preflightContinue: false,
		optionsSuccessStatus: 204,
	};

	// Apply CORS for all routes
	app.use(cors(corsOptions));

	// Handle preflight requests explicitly
	app.options('*', cors(corsOptions));

	app.use(express.json());

	// Global rate limiting (apply to all routes)
	app.use(generalRateLimit);

	// Health check endpoint (before request logger to avoid logging)
	app.get('/api/health', (req, res) => {
		res.status(200).json({
			status: 'healthy',
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			version: process.env.npm_package_version || '1.0.0',
			environment: process.env.NODE_ENV || 'development',
		});
	});

	// Debug middleware to log incoming requests (development only)
	if (process.env.NODE_ENV === 'development') {
		app.use((req, res, next) => {
			console.warn(`${req.method} ${req.url}`);
			next();
		});
	}

	// Request audit logging middleware (before routes)
	app.use(requestLogger);

	// Routes with specific rate limiting
	app.use('/api/auth', authRateLimit, authRoutes);
	app.use('/api/email', emailRoutes);
	app.use('/api/users', userRoutes); // Fixed: should be /users not /user
	app.use('/api/search', searchRateLimit, authenticateToken, searchRoutes);
	app.use('/api/watchlist', authenticateToken, watchlistRoutes);
	app.use('/api/matches', authenticateToken, matchRoutes);
	app.use('/api/activity', authenticateToken, activityRoutes);
	app.use('/api/admin', adminRateLimit, adminRoutes);
	app.use('/api/groups', groupRoutes);

	// Global error handler middleware (after routes)
	app.use(errorHandler);

	return app;
}

export default createApp;
