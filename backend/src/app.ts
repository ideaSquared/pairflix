import cors from 'cors';
import express from 'express';
import { errorHandler } from './middlewares/error-handler';
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

// Create Express application
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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

app.use(requestLogger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/users', userRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/activity', activityRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;
