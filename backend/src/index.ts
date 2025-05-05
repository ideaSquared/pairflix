import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { authenticateToken } from './middlewares/auth';
import authRoutes from './routes/auth.routes';
import watchlistRoutes from './routes/watchlist.routes';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route (public)
app.get('/health', (req, res) => {
	res.json({ status: 'ok' });
});

// Auth routes (public)
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api', authenticateToken);
app.use('/api/watchlist', watchlistRoutes);

// Start server
app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
