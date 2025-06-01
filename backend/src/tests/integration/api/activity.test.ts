import { Model } from 'sequelize';
import ActivityLog from '../../../models/ActivityLog';
import User from '../../../models/User';
import IntegrationTestSetup from '../setup';

describe('Activity API Integration Tests', () => {
	const testSetup = IntegrationTestSetup.getInstance();
	let requestClient: any;
	let userToken: string;
	let adminToken: string;
	let testUser: any;
	let adminUser: any;
	const TEST_USER_ID = 'test-user-id';
	const PARTNER_USER_ID = 'partner-user-id';
	const ADMIN_USER_ID = 'admin-user-id';

	beforeAll(async () => {
		// Initialize the test environment
		await testSetup.init();
		await testSetup.startServer();
		requestClient = testSetup.getRequestClient();

		// Create a consistent test user
		testUser = {
			id: TEST_USER_ID,
			email: 'test@example.com',
			username: 'testuser',
			role: 'user',
		};

		// Create admin user
		adminUser = {
			id: ADMIN_USER_ID,
			email: 'admin@example.com',
			username: 'adminuser',
			role: 'admin',
		};

		// Generate tokens
		userToken = testSetup.generateAuthToken(testUser);
		adminToken = testSetup.generateAuthToken(adminUser);
	});

	afterAll(async () => {
		await testSetup.clearData();
		await testSetup.stopServer();
		await testSetup.closeDatabase();
	});

	beforeEach(async () => {
		await testSetup.clearData();
		jest.resetAllMocks(); // Reset mocks between tests
	});

	// Helper function to create mock activity logs
	const createMockActivities = (userId: string, count: number = 3) => {
		return Array.from({ length: count }).map((_, index) => ({
			activity_id: `activity-${userId}-${index + 1}`,
			user_id: userId,
			action_type: ['watchlist_add', 'watchlist_update', 'match_create'][
				index % 3
			],
			entity_type: ['watchlist_entry', 'match'][index % 2],
			entity_id: `entity-${index}`,
			metadata: {
				title: `Test ${index + 1}`,
				media_type: index % 2 === 0 ? 'movie' : 'tv',
				status:
					index % 3 === 0
						? 'want_to_watch'
						: index % 3 === 1
							? 'watching'
							: 'watched',
			},
			created_at: new Date(Date.now() - index * 86400000), // Days ago
			updated_at: new Date(Date.now() - index * 86400000),
		}));
	};

	describe('GET /api/activity/me', () => {
		it("should return user's own activity logs", async () => {
			// Configure auth middleware to expect test user
			testSetup.setTestUser(testUser);

			// Create mock activities for the test user
			const mockActivities = createMockActivities(TEST_USER_ID);

			// Mock ActivityLog.findAll to return user's activities
			ActivityLog.findAll = jest
				.fn()
				.mockResolvedValue(mockActivities as unknown as Model[]);

			const response = await requestClient
				.get('/api/activity/me')
				.set('Authorization', `Bearer ${userToken}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('activities');
			expect(Array.isArray(response.body.activities)).toBe(true);
			expect(response.body.activities.length).toBe(mockActivities.length);
			expect(response.body.activities[0]).toHaveProperty(
				'user_id',
				TEST_USER_ID
			);
		});

		it('should apply limit and offset parameters', async () => {
			// Configure auth middleware to expect test user
			testSetup.setTestUser(testUser);

			// Create a larger set of mock activities
			const allActivities = createMockActivities(TEST_USER_ID, 10);

			// Mock ActivityLog.findAll to check and respect limit and offset
			ActivityLog.findAll = jest.fn().mockImplementation((options: any) => {
				const limit = options?.limit || 10;
				const offset = options?.offset || 0;
				return Promise.resolve(
					allActivities.slice(offset, offset + limit) as unknown as Model[]
				);
			});

			const response = await requestClient
				.get('/api/activity/me?limit=3&offset=2')
				.set('Authorization', `Bearer ${userToken}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('activities');
			expect(Array.isArray(response.body.activities)).toBe(true);
			expect(response.body.activities.length).toBe(3); // Limit of 3

			// Verify the findAll was called with correct params
			expect(ActivityLog.findAll).toHaveBeenCalledWith(
				expect.objectContaining({
					limit: 3,
					offset: 2,
				})
			);
		});

		it('should return empty array if no activities found', async () => {
			// Configure auth middleware to expect test user
			testSetup.setTestUser(testUser);

			// Mock ActivityLog.findAll to return empty array
			ActivityLog.findAll = jest.fn().mockResolvedValue([]);

			const response = await requestClient
				.get('/api/activity/me')
				.set('Authorization', `Bearer ${userToken}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('activities');
			expect(Array.isArray(response.body.activities)).toBe(true);
			expect(response.body.activities.length).toBe(0);
		});

		it('should return 401 when not authenticated', async () => {
			const response = await requestClient.get('/api/activity/me');

			expect(response.status).toBe(401);
			expect(response.body).toHaveProperty('error');
		});
	});

	describe('GET /api/activity/partner', () => {
		it("should return partner's activity logs when partnership exists", async () => {
			// Configure auth middleware to expect test user
			testSetup.setTestUser(testUser);

			// Create mock activities for the partner user
			const mockPartnerActivities = createMockActivities(PARTNER_USER_ID);

			// Mock a function to find the partner relationship
			const mockPartnerFunction = jest.fn().mockResolvedValue({
				partner_id: PARTNER_USER_ID,
			});

			// Replace or mock the actual function that would find partners in your system
			// This might be in a service or controller - adjust according to your implementation
			// For example, if it's a User model method:
			User.findOne = jest.fn().mockImplementation((options: any) => {
				if (options?.where?.id === TEST_USER_ID) {
					return Promise.resolve({
						...testUser,
						getPartnership: mockPartnerFunction,
					});
				}
				return Promise.resolve(null);
			});

			// Mock ActivityLog.findAll to return partner's activities
			ActivityLog.findAll = jest
				.fn()
				.mockResolvedValue(mockPartnerActivities as unknown as Model[]);

			const response = await requestClient
				.get('/api/activity/partner')
				.set('Authorization', `Bearer ${userToken}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('activities');
			expect(Array.isArray(response.body.activities)).toBe(true);
			expect(response.body.activities.length).toBe(
				mockPartnerActivities.length
			);
			expect(response.body.activities[0]).toHaveProperty(
				'user_id',
				PARTNER_USER_ID
			);
		});

		it('should return 404 when user has no partner', async () => {
			// Configure auth middleware to expect test user
			testSetup.setTestUser(testUser);

			// Mock finding user but no partnership exists
			User.findOne = jest.fn().mockImplementation((options: any) => {
				if (options?.where?.id === TEST_USER_ID) {
					return Promise.resolve({
						...testUser,
						getPartnership: jest.fn().mockResolvedValue(null),
					});
				}
				return Promise.resolve(null);
			});

			const response = await requestClient
				.get('/api/activity/partner')
				.set('Authorization', `Bearer ${userToken}`);

			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message).toContain('No partner found');
		});

		it('should return 401 when not authenticated', async () => {
			const response = await requestClient.get('/api/activity/partner');

			expect(response.status).toBe(401);
			expect(response.body).toHaveProperty('error');
		});
	});

	describe('GET /api/activity/feed', () => {
		it('should return combined activity feed', async () => {
			// Configure auth middleware to expect test user
			testSetup.setTestUser(testUser);

			// Create mock activities for both user and partner
			const userActivities = createMockActivities(TEST_USER_ID, 2);
			const partnerActivities = createMockActivities(PARTNER_USER_ID, 2);

			// Combined and sorted by date (most recent first)
			const combinedActivities = [...userActivities, ...partnerActivities].sort(
				(a, b) => b.created_at.getTime() - a.created_at.getTime()
			);

			// Mock the partner relationship
			User.findOne = jest.fn().mockImplementation((options: any) => {
				if (options?.where?.id === TEST_USER_ID) {
					return Promise.resolve({
						...testUser,
						getPartnership: jest.fn().mockResolvedValue({
							partner_id: PARTNER_USER_ID,
						}),
					});
				}
				return Promise.resolve(null);
			});

			// Mock ActivityLog.findAll for combined query
			ActivityLog.findAll = jest.fn().mockImplementation((options: any) => {
				// Check if this is the combined query (has $or operator or similar)
				if (
					options?.where?.user_id?.$in &&
					options.where.user_id.$in.includes(TEST_USER_ID) &&
					options.where.user_id.$in.includes(PARTNER_USER_ID)
				) {
					return Promise.resolve(combinedActivities as unknown as Model[]);
				}
				return Promise.resolve([]);
			});

			const response = await requestClient
				.get('/api/activity/feed')
				.set('Authorization', `Bearer ${userToken}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('activities');
			expect(Array.isArray(response.body.activities)).toBe(true);
			expect(response.body.activities.length).toBe(combinedActivities.length);

			// Verify activities are from both users
			const userIds = response.body.activities.map((a: any) => a.user_id);
			expect(userIds).toContain(TEST_USER_ID);
			expect(userIds).toContain(PARTNER_USER_ID);
		});

		it("should return only user's activities when no partner exists", async () => {
			// Configure auth middleware to expect test user
			testSetup.setTestUser(testUser);

			// Create mock activities for the user
			const userActivities = createMockActivities(TEST_USER_ID, 3);

			// Mock finding user but no partnership exists
			User.findOne = jest.fn().mockImplementation((options: any) => {
				if (options?.where?.id === TEST_USER_ID) {
					return Promise.resolve({
						...testUser,
						getPartnership: jest.fn().mockResolvedValue(null),
					});
				}
				return Promise.resolve(null);
			});

			// Mock ActivityLog.findAll to return only user's activities
			ActivityLog.findAll = jest.fn().mockImplementation((options: any) => {
				if (options?.where?.user_id === TEST_USER_ID) {
					return Promise.resolve(userActivities as unknown as Model[]);
				}
				return Promise.resolve([]);
			});

			const response = await requestClient
				.get('/api/activity/feed')
				.set('Authorization', `Bearer ${userToken}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('activities');
			expect(Array.isArray(response.body.activities)).toBe(true);
			expect(response.body.activities.length).toBe(userActivities.length);

			// All activities should be from the user
			response.body.activities.forEach((activity: any) => {
				expect(activity.user_id).toBe(TEST_USER_ID);
			});
		});

		it('should return 401 when not authenticated', async () => {
			const response = await requestClient.get('/api/activity/feed');

			expect(response.status).toBe(401);
			expect(response.body).toHaveProperty('error');
		});
	});

	describe('GET /api/activity/user/:userId', () => {
		it('should return activity logs for specified user when admin', async () => {
			// Configure auth middleware to expect admin user
			testSetup.setTestUser(adminUser);

			// Create mock activities for target user
			const targetUserId = 'target-user-id';
			const targetActivities = createMockActivities(targetUserId, 3);

			// Mock ActivityLog.findAll to return target user's activities
			ActivityLog.findAll = jest
				.fn()
				.mockResolvedValue(targetActivities as unknown as Model[]);

			const response = await requestClient
				.get(`/api/activity/user/${targetUserId}`)
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('activities');
			expect(Array.isArray(response.body.activities)).toBe(true);
			expect(response.body.activities.length).toBe(targetActivities.length);

			// Activities should be from the target user
			response.body.activities.forEach((activity: any) => {
				expect(activity.user_id).toBe(targetUserId);
			});
		});

		it("should return 403 when non-admin tries to access another user's activities", async () => {
			// Configure auth middleware to expect regular user
			testSetup.setTestUser(testUser);

			const targetUserId = 'another-user-id';

			const response = await requestClient
				.get(`/api/activity/user/${targetUserId}`)
				.set('Authorization', `Bearer ${userToken}`);

			expect(response.status).toBe(403);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message).toContain('Unauthorized');
		});

		it('should allow users to access their own activities via this endpoint', async () => {
			// Configure auth middleware to expect test user
			testSetup.setTestUser(testUser);

			// Create mock activities for the user
			const userActivities = createMockActivities(TEST_USER_ID, 3);

			// Mock ActivityLog.findAll to return user's activities
			ActivityLog.findAll = jest
				.fn()
				.mockResolvedValue(userActivities as unknown as Model[]);

			const response = await requestClient
				.get(`/api/activity/user/${TEST_USER_ID}`)
				.set('Authorization', `Bearer ${userToken}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('activities');
			expect(Array.isArray(response.body.activities)).toBe(true);
			expect(response.body.activities.length).toBe(userActivities.length);
		});

		it('should return 404 when user not found', async () => {
			// Configure auth middleware to expect admin user
			testSetup.setTestUser(adminUser);

			// Mock User.findByPk to return null (user not found)
			User.findByPk = jest.fn().mockResolvedValue(null);

			const nonExistentUserId = 'nonexistent-user';

			const response = await requestClient
				.get(`/api/activity/user/${nonExistentUserId}`)
				.set('Authorization', `Bearer ${adminToken}`);

			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message).toContain('User not found');
		});

		it('should return 401 when not authenticated', async () => {
			const response = await requestClient.get(
				`/api/activity/user/${TEST_USER_ID}`
			);

			expect(response.status).toBe(401);
			expect(response.body).toHaveProperty('error');
		});
	});
});
