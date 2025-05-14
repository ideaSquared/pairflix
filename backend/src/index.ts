import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { initDatabase } from './db/connection';
import { seedDatabase } from './db/seeders';
import { authenticateToken } from './middlewares/auth';
import activityRoutes from './routes/activity.routes';
import authRoutes from './routes/auth.routes';
import matchRoutes from './routes/match.routes';
import searchRoutes from './routes/search.routes';
import userRoutes from './routes/user.routes';
import watchlistRoutes from './routes/watchlist.routes';

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

async function initializeApp() {
	try {
		await initDatabase();
		console.log('Database connection established successfully.');

		if (process.env.NODE_ENV === 'development') {
			await seedDatabase();
			console.log('Development database seeded successfully.');
		}

		app.listen(port, () => {
			console.log(`Server running on port ${port}`);
		});
	} catch (error) {
		console.error('Unable to start server:', error);
		process.exit(1);
	}
}

initializeApp();
