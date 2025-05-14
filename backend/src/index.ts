import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { initDatabase } from './db/connection';
import { seedDatabase } from './db/seeders';
import { authenticateToken } from './middlewares/auth';
import { errorHandler } from './middlewares/error-handler';
import { requestLogger } from './middlewares/request-logger';
import activityRoutes from './routes/activity.routes';
import adminRoutes from './routes/admin.routes';
import authRoutes from './routes/auth.routes';
import matchRoutes from './routes/match.routes';
import searchRoutes from './routes/search.routes';
import userRoutes from './routes/user.routes';
import watchlistRoutes from './routes/watchlist.routes';
import { auditLogService } from './services/audit.service';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configure CORS
app.use(
	cors({
		origin:
			process.env.NODE_ENV === 'production'
				? ['https://your-production-domain.com']
				: [
						'http://localhost:5173',
						'http://localhost:3000',
						'http://127.0.0.1:5173',
						'http://127.0.0.1:3000',
					],
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
		exposedHeaders: ['Authorization'],
	})
);

app.use(express.json());

// Pre-flight OPTIONS request handler - Apply CORS headers to all routes
app.options('*', cors());

// Request audit logging middleware (before routes)
app.use(requestLogger);

// Debug middleware to log incoming requests
app.use((req, res, next) => {
	console.log(`${req.method} ${req.url}`);
	// console.log('Headers:', req.headers);
	next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/search', authenticateToken, searchRoutes);
app.use('/api/watchlist', authenticateToken, watchlistRoutes);
app.use('/api/matches', authenticateToken, matchRoutes);
app.use('/api/activity', authenticateToken, activityRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);

// Global error handler middleware (after routes)
app.use(errorHandler);

async function initializeApp() {
	try {
		// Connect to database first
		await initDatabase();
		console.log('Database connection established successfully.');

		// Only start logging after database connection is established
		// Log application startup
		await auditLogService.info('Application starting', 'server-init', {
			environment: process.env.NODE_ENV || 'development',
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
			console.log('Development database seeded successfully.');

			// Log database seeding in development
			await auditLogService.info('Development database seeded', 'server-init', {
				timestamp: new Date(),
			});
		}

		app.listen(port, () => {
			console.log(`Server running on port ${port}`);

			// Log server startup
			auditLogService.info(`Server started on port ${port}`, 'server-init', {
				port,
				environment: process.env.NODE_ENV || 'development',
				timestamp: new Date(),
			});
		});
	} catch (error) {
		console.error('Unable to start server:', error);

		// Log startup error
		await auditLogService.error('Failed to start server', 'server-init', {
			error: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined,
			timestamp: new Date(),
		});

		process.exit(1);
	}
}

initializeApp();
