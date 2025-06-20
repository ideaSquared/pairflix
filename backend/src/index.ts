import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { initDatabase } from './db/connection';
import { seedDatabase } from './db/seeders';
import { authenticateToken } from './middlewares/auth';
import { errorHandler } from './middlewares/error-handler';
import {
	adminRateLimit,
	authRateLimit,
	generalRateLimit,
	searchRateLimit,
} from './middlewares/rate-limiter';
import { requestLogger } from './middlewares/request-logger';
import activityRoutes from './routes/activity.routes';
import adminRoutes from './routes/admin.routes';
import authRoutes from './routes/auth.routes';
import matchRoutes from './routes/match.routes';
import searchRoutes from './routes/search.routes';
import userRoutes from './routes/user.routes';
import watchlistRoutes from './routes/watchlist.routes';
import { initScheduledTasks } from './scheduler';
import { auditLogService } from './services/audit.service';

dotenv.config();

const app = express();
const port = process.env.PORT ?? 3000;

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

// Debug middleware to log incoming requests
app.use((req, res, next) => {
	console.warn(`${req.method} ${req.url}`);
	next();
});

// Request audit logging middleware (before routes)
app.use(requestLogger);

// Routes with specific rate limiting
app.use('/api/auth', authRateLimit, authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/search', searchRateLimit, authenticateToken, searchRoutes);
app.use('/api/watchlist', authenticateToken, watchlistRoutes);
app.use('/api/matches', authenticateToken, matchRoutes);
app.use('/api/activity', authenticateToken, activityRoutes);
app.use('/api/admin', adminRateLimit, adminRoutes); // Admin routes handle their own authentication

// Global error handler middleware (after routes)
app.use(errorHandler);

async function initializeApp() {
	try {
		// Connect to database first
		await initDatabase();
		console.warn('Database connection established successfully.');

		// Only start logging after database connection is established
		// Log application startup
		await auditLogService.info('Application starting', 'server-init', {
			environment: process.env.NODE_ENV ?? 'development',
			timestamp: new Date(),
		});

		// Log successful database connection
		await auditLogService.info(
			'Database connection established',
			'server-init',
			{
				timestamp: new Date(),
			}
		);

		if (process.env.NODE_ENV === 'development') {
			await seedDatabase();
			console.warn('Development database seeded successfully.');

			// Log database seeding in development
			await auditLogService.info('Development database seeded', 'server-init', {
				timestamp: new Date(),
			});
		}

		// Initialize scheduled tasks - function does not return a promise, so no need for await or void

		initScheduledTasks();

		// Use a Promise to handle server start
		const server = app.listen(port, () => {
			console.warn(`Server running on port ${port}`);

			// Log server startup - wrapped in an async IIFE to handle the promise
			void (async () => {
				try {
					await auditLogService.info(
						`Server started on port ${port}`,
						'server-init',
						{
							port,
							environment: process.env.NODE_ENV ?? 'development',
							timestamp: new Date(),
						}
					);
				} catch (error) {
					console.warn('Failed to log server start:', error);
				}
			})();
		});

		// Handle server errors
		server.on('error', async error => {
			console.error('Server error:', error);
			try {
				await auditLogService.error('Server error', 'server-init', {
					error: error instanceof Error ? error.message : 'Unknown error',
					timestamp: new Date(),
				});
			} catch (logError) {
				console.warn('Failed to log server error:', logError);
			}
		});
	} catch (error) {
		console.error('Unable to start server:', error);

		try {
			// Log startup error
			await auditLogService.error('Failed to start server', 'server-init', {
				error: error instanceof Error ? error.message : 'Unknown error',
				stack: error instanceof Error ? error.stack : undefined,
				timestamp: new Date(),
			});
		} catch (logError) {
			console.warn('Failed to log server start failure:', logError);
		}

		process.exit(1);
	}
}

// Use void to explicitly mark that we're ignoring the promise result
void initializeApp();
