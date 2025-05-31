import cors from 'cors';
import express from 'express';
import { errorHandler } from './middlewares/error-handler';
import { requestLogger } from './middlewares/request-logger';

// Import routes
import activityRoutes from './routes/activity.routes';
import adminRoutes from './routes/admin.routes';
import authRoutes from './routes/auth.routes';
import matchRoutes from './routes/match.routes';
import searchRoutes from './routes/search.routes';
import userRoutes from './routes/user.routes';
import watchlistRoutes from './routes/watchlist.routes';

// Create Express application
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/activity', activityRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;
