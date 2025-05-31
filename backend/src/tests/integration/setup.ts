import express, { Express, Request, Response, NextFunction } from 'express';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import { Server } from 'http';
import bodyParser from 'body-parser';

// Import models
import User from '../../models/User';
import WatchlistEntry from '../../models/WatchlistEntry';
import Match from '../../models/Match';
import Content from '../../models/Content';
import ActivityLog from '../../models/ActivityLog';
import AuditLog from '../../models/AuditLog';
import AppSettings from '../../models/AppSettings';
import ContentReport from '../../models/ContentReport';

// Extend Express Request to include user property
declare global {
	namespace Express {
		interface Request {
			user?: {
				user_id: string;
				email: string;
				username: string;
				role: string;
				status: string;
				preferences: {
					theme: 'dark' | 'light';
					viewStyle: 'grid' | 'list';
					emailNotifications: boolean;
					autoArchiveDays: number;
					favoriteGenres: string[];
				};
			};
		}
	}
}

/**
 * Integration test setup class - Singleton
 * Handles server setup, database mocking, and test helper functions
 */
export default class IntegrationTestSetup {
	private static instance: IntegrationTestSetup;
	private app: Express;
	private server: Server | null = null;
	private testUser: any = null;

	private constructor() {
		this.app = express();
	}

	/**
	 * Get singleton instance
	 */
	public static getInstance(): IntegrationTestSetup {
		if (!IntegrationTestSetup.instance) {
			IntegrationTestSetup.instance = new IntegrationTestSetup();
		}
		return IntegrationTestSetup.instance;
	}

	/**
	 * Initialize the test environment
	 */
	public async init(): Promise<void> {
		// Mock database models
		this.mockModelInitialization();

		// Setup Express middleware
		this.app.use(bodyParser.json());
		this.app.use(bodyParser.urlencoded({ extended: true }));

		// Set up middleware for request logging
		this.app.use((req: Request, _res: Response, next: NextFunction) => {
			console.log(`${req.method} ${req.url}`);
			next();
		});

		// Setup test routes
		this.setupRoutes();
	}

	/**
	 * Set the test user for authentication middleware
	 */
	public setTestUser(user: any): void {
		this.testUser = user;
	}

	/**
	 * Start the test server
	 */
	public async startServer(port: number = 0): Promise<void> {
		return new Promise((resolve) => {
			this.server = this.app.listen(port, () => {
				resolve();
			});
		});
	}

	/**
	 * Stop the test server
	 */
	public async stopServer(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (!this.server) {
				return resolve();
			}

			this.server.close((err) => {
				if (err) {
					return reject(err);
				}
				this.server = null;
				resolve();
			});
		});
	}

	/**
	 * Get supertest request client
	 */
	public getRequestClient(): supertest.SuperTest<supertest.Test> {
		return supertest(this.app);
	}

	/**
	 * Clear all test data
	 */
	public async clearData(): Promise<void> {
		// Reset mocked data in memory
		jest.resetAllMocks();
	}

	/**
	 * Close database connection (or cleanup mocks in our case)
	 */
	public async closeDatabase(): Promise<void> {
		console.log('Integration test database connection closed.');
	}

	/**
	 * Create test user with specified role
	 */
	public async createTestUser(role: string = 'user'): Promise<any> {
		const user = {
			id: 'test-user-id',
			username: 'testuser',
			email: 'test@example.com',
			password: 'hashedpassword',
			role: role,
			status: 'active',
			preferences: {
				theme: 'dark',
				viewStyle: 'grid',
				emailNotifications: true,
				autoArchiveDays: 30,
				favoriteGenres: ['action', 'comedy'],
			},
			created_at: new Date(),
			updated_at: new Date(),
		};

		return user;
	}

	/**
	 * Generate auth token for testing authenticated endpoints
	 */
	public generateAuthToken(user: any): string {
		return jwt.sign(
			{
				id: user.id, // Use id consistently (not user_id)
				email: user.email,
				role: user.role,
			},
			process.env.JWT_SECRET || 'test-secret',
			{ expiresIn: '1h' }
		);
	}

	/**
	 * Setup routes for testing
	 */
	private setupRoutes(): void {
		// Auth middleware for protected routes
		const testAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
			const authHeader = req.headers.authorization;
			
			if (!authHeader) {
				return res.status(401).json({ error: 'Authentication required' });
			}
			
			// For tests, we bypass JWT verification and use the test user
			if (this.testUser) {
				req.user = {
					user_id: this.testUser.id, // Use the same ID format as in the real app
					email: this.testUser.email,
					username: this.testUser.username,
					role: this.testUser.role,
					status: 'active',
					preferences: {
						theme: 'dark' as const,
						viewStyle: 'grid' as const,
						emailNotifications: true,
						autoArchiveDays: 30,
						favoriteGenres: [],
					},
				};
				return next();
			}
			
			return res.status(403).json({ error: 'Invalid token' });
		};

		// Watchlist routes
		const watchlistRouter = express.Router();
		
		// GET /api/watchlist - Get user's watchlist entries
		watchlistRouter.get('/', testAuthMiddleware, async (req: Request, res: Response) => {
			try {
				// Ensure user is defined (should be set by testAuthMiddleware)
				if (!req.user) {
					return res.status(401).json({ error: 'Authentication required' });
				}
				
				const status = req.query.status as string | undefined;
				const options: any = {
					where: { user_id: req.user.user_id }
				};
				
				if (status) {
					options.where.status = status;
				}
				
				const entries = await WatchlistEntry.findAll(options);
				
				res.status(200).json({ entries });
			} catch (error) {
				res.status(500).json({ error: 'Server error' });
			}
		});
		
		// POST /api/watchlist - Add entry to watchlist
		watchlistRouter.post('/', testAuthMiddleware, async (req: Request, res: Response) => {
			try {
				// Ensure user is defined
				if (!req.user) {
					return res.status(401).json({ error: 'Authentication required' });
				}
				
				const { tmdb_id, media_type, title } = req.body;
				
				// Basic validation
				if (!tmdb_id || !media_type) {
					return res.status(400).json({
						errors: ['Missing required fields: tmdb_id and media_type are required']
					});
				}
				
				// Check if entry already exists
				const existingEntry = await WatchlistEntry.findOne({
					where: { user_id: req.user.user_id, tmdb_id }
				});
				
				if (existingEntry) {
					return res.status(409).json({ message: 'Entry already exists in watchlist' });
				}
				
				// Create new entry
				const entry = await WatchlistEntry.create({
					...req.body,
					user_id: req.user.user_id
				});
				
				res.status(201).json({ entry });
			} catch (error) {
				res.status(500).json({ error: 'Server error' });
			}
		});
		
		// PUT /api/watchlist/:id - Update watchlist entry
		watchlistRouter.put('/:id', testAuthMiddleware, async (req: Request, res: Response) => {
			try {
				// Ensure user is defined
				if (!req.user) {
					return res.status(401).json({ error: 'Authentication required' });
				}
				
				const entry = await WatchlistEntry.findByPk(req.params.id);
				
				if (!entry) {
					return res.status(404).json({ error: 'Entry not found' });
				}
				
				// Check ownership
				if (entry.user_id !== req.user.user_id) {
					return res.status(403).json({ error: 'Not authorized to update this entry' });
				}
				
				// Update entry
				await WatchlistEntry.update(req.body, {
					where: { entry_id: req.params.id }
				});
				
				// Get updated entry
				const updatedEntry = await WatchlistEntry.findByPk(req.params.id);
				
				res.status(200).json({ entry: updatedEntry });
			} catch (error) {
				res.status(500).json({ error: 'Server error' });
			}
		});
		
		// DELETE /api/watchlist/:id - Delete watchlist entry
		watchlistRouter.delete('/:id', testAuthMiddleware, async (req: Request, res: Response) => {
			try {
				// Ensure user is defined
				if (!req.user) {
					return res.status(401).json({ error: 'Authentication required' });
				}
				
				const entry = await WatchlistEntry.findByPk(req.params.id);
				
				if (!entry) {
					return res.status(404).json({ error: 'Entry not found' });
				}
				
				// Check ownership
				if (entry.user_id !== req.user.user_id) {
					return res.status(403).json({ error: 'Not authorized to delete this entry' });
				}
				
				// Delete entry
				await WatchlistEntry.destroy({
					where: { entry_id: req.params.id }
				});
				
				res.status(200).json({ message: 'Entry deleted successfully' });
			} catch (error) {
				res.status(500).json({ error: 'Server error' });
			}
		});
		
		// GET /api/watchlist/stats - Get watchlist statistics
		watchlistRouter.get('/stats', testAuthMiddleware, async (req: Request, res: Response) => {
			try {
				// Ensure user is defined
				if (!req.user) {
					return res.status(401).json({ error: 'Authentication required' });
				}
				
				const entries = await WatchlistEntry.findAll({
					where: { user_id: req.user.user_id }
				});
				
				// Calculate stats
				const total = entries.length;
				
				const byStatus = entries.reduce((acc: any, entry: any) => {
					const status = entry.status || 'unknown';
					acc[status] = (acc[status] || 0) + 1;
					return acc;
				}, {});
				
				const byMediaType = entries.reduce((acc: any, entry: any) => {
					const mediaType = entry.media_type || 'unknown';
					acc[mediaType] = (acc[mediaType] || 0) + 1;
					return acc;
				}, {});
				
				res.status(200).json({
					total,
					by_status: byStatus,
					by_media_type: byMediaType
				});
			} catch (error) {
				res.status(500).json({ error: 'Server error' });
			}
		});
		
		// Mount watchlist router
		this.app.use('/api/watchlist', watchlistRouter);
	}

	/**
	 * Mock model initialization for testing without DB connections
	 */
	private mockModelInitialization(): void {
		// Mock methods for WatchlistEntry model
		WatchlistEntry.findAll = jest.fn().mockResolvedValue([]);
		WatchlistEntry.findOne = jest.fn().mockResolvedValue(null);
		WatchlistEntry.findByPk = jest.fn().mockResolvedValue(null);
		WatchlistEntry.create = jest.fn().mockImplementation((data) => {
			const entry = {
				...data,
				entry_id: `test-entry-${Date.now()}`,
				created_at: new Date(),
				updated_at: new Date(),
			};
			return Promise.resolve(entry);
		});
		WatchlistEntry.update = jest.fn().mockResolvedValue([1, []]);
		WatchlistEntry.destroy = jest.fn().mockResolvedValue(1);

		// Mock User model
		User.findAll = jest.fn().mockResolvedValue([]);
		User.findOne = jest.fn().mockResolvedValue(null);
		User.findByPk = jest.fn().mockResolvedValue(null);
		User.create = jest.fn().mockImplementation((data) => {
			return Promise.resolve({
				...data,
				id: data.id || `user-${Date.now()}`,
			});
		});
		User.update = jest.fn().mockResolvedValue([1, []]);
		User.destroy = jest.fn().mockResolvedValue(1);

		// Mock other models with minimal implementations
		const createBasicMock = () => ({
			findAll: jest.fn().mockResolvedValue([]),
			findOne: jest.fn().mockResolvedValue(null),
			findByPk: jest.fn().mockResolvedValue(null),
			create: jest.fn().mockImplementation((data) => Promise.resolve({ 
				...data, 
				id: `mock-${Date.now()}` 
			})),
			update: jest.fn().mockResolvedValue([1, []]),
			destroy: jest.fn().mockResolvedValue(1),
		});

		// Apply basic mocks to other models
		Object.assign(Match, createBasicMock());
		Object.assign(Content, createBasicMock());
		Object.assign(ActivityLog, createBasicMock());
		Object.assign(AuditLog, createBasicMock());
		Object.assign(AppSettings, createBasicMock());
		Object.assign(ContentReport, createBasicMock());
	}
}
