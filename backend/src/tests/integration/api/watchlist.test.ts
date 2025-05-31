import { Model } from 'sequelize';
import WatchlistEntry from '../../../models/WatchlistEntry';
import { WatchStatus } from '../../../types'; // Updated import path
import { TestFixtures } from '../fixtures';
import IntegrationTestSetup from '../setup';

describe('Watchlist API Integration Tests', () => {
	const testSetup = IntegrationTestSetup.getInstance();
	let requestClient: any;
	let userToken: string;
	let user: any;
	let testUser;
	const TEST_USER_ID = 'test-user-id'; // Consistent user ID to use throughout tests

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
			role: 'user'
		};
		
		// Generate token with consistent user data
		userToken = testSetup.generateAuthToken(testUser);
		
		// Configure auth middleware to expect this test user
		testSetup.setTestUser(testUser);
		
		// Create mock user data to match what's set in the testAuthMiddleware
		user = testUser;
	});

	afterAll(async () => {
		await testSetup.clearData();
		await testSetup.stopServer();
		await testSetup.closeDatabase();
	});

	beforeEach(async () => {
		await testSetup.clearData();
		jest.resetAllMocks(); // Reset the mocks between tests
	});

	describe('GET /api/watchlist', () => {
		it('should return user watchlist entries', async () => {
			// Create watchlist entries for the user that match our auth middleware user ID
			const { userEntries } = await TestFixtures.createWatchlistEntries(
				'test-user-id', // This must match the user_id in our testAuthMiddleware
				'partner-id'
			);

			// Override WatchlistEntry.findAll to return our test entries
			// Use type assertion to tell TypeScript to treat the mocks as Sequelize models
			jest.spyOn(WatchlistEntry, 'findAll').mockResolvedValueOnce(userEntries as unknown as Model[]);

			const response = await requestClient
				.get('/api/watchlist')
				.set('Authorization', `Bearer ${userToken}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('entries');
			expect(Array.isArray(response.body.entries)).toBe(true);
			expect(response.body.entries.length).toBe(userEntries.length);
		});

		it('should return filtered watchlist entries when status filter is provided', async () => {
			// Create watchlist entries with different statuses
			const { userEntries } = await TestFixtures.createWatchlistEntries(
				'test-user-id',
				'partner-id'
			);
			
			// Create filtered entries with status 'want_to_watch'
			const filteredEntries = userEntries.filter(entry => 
				entry.status === WatchStatus.WANT_TO_WATCH
			);

			// Override WatchlistEntry.findAll to return filtered entries
			jest.spyOn(WatchlistEntry, 'findAll').mockResolvedValueOnce(filteredEntries as unknown as Model[]);

			const response = await requestClient
				.get('/api/watchlist?status=want_to_watch')
				.set('Authorization', `Bearer ${userToken}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('entries');
			expect(Array.isArray(response.body.entries)).toBe(true);

			// Check that all returned entries have the correct status
			response.body.entries.forEach((entry: any) => {
				expect(entry.status).toBe(WatchStatus.WANT_TO_WATCH);
			});
		});

		it('should return 401 when not authenticated', async () => {
			const response = await requestClient.get('/api/watchlist');
			expect(response.status).toBe(401);
		});
	});

	describe('POST /api/watchlist', () => {
		it('should add a new entry to watchlist', async () => {
			const newEntry = {
				tmdb_id: '987654',
				media_type: 'movie',
				title: 'New Test Movie',
				poster_path: '/path/to/poster.jpg',
				status: WatchStatus.WANT_TO_WATCH,
			};

			// Mock entry creation response
			const createdEntry = {
				...newEntry,
				entry_id: 'new-entry-id',
				user_id: 'test-user-id',
				created_at: new Date(),
				updated_at: new Date(),
			};

			// Override WatchlistEntry.findOne to return null (no existing entry)
			jest.spyOn(WatchlistEntry, 'findOne').mockResolvedValueOnce(null);

			// Override WatchlistEntry.create to return our mock entry
			jest.spyOn(WatchlistEntry, 'create').mockResolvedValueOnce(createdEntry as unknown as Model);

			const response = await requestClient
				.post('/api/watchlist')
				.set('Authorization', `Bearer ${userToken}`)
				.send(newEntry);

			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty('entry');
		});

		it('should return 400 when adding an entry with missing required fields', async () => {
			const invalidEntry = {
				// Missing tmdb_id and media_type
				title: 'Incomplete Movie',
				status: WatchStatus.WANT_TO_WATCH,
			};

			const response = await requestClient
				.post('/api/watchlist')
				.set('Authorization', `Bearer ${userToken}`)
				.send(invalidEntry);

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty('errors');
		});

		it('should return 409 when adding a duplicate entry', async () => {
			const entry = {
				tmdb_id: '987654',
				media_type: 'movie',
				title: 'Test Movie',
				poster_path: '/path/to/poster.jpg',
				status: WatchStatus.WANT_TO_WATCH,
			};

			// Mock existing entry
			const existingEntry = {
				...entry,
				entry_id: 'existing-entry-id',
				user_id: 'test-user-id',
				created_at: new Date(),
				updated_at: new Date(),
			};

			// Override WatchlistEntry.findOne to return an existing entry
			jest.spyOn(WatchlistEntry, 'findOne').mockResolvedValueOnce(existingEntry as unknown as Model);

			const response = await requestClient
				.post('/api/watchlist')
				.set('Authorization', `Bearer ${userToken}`)
				.send(entry);

			expect(response.status).toBe(409);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message).toContain('already exists');
		});

		it('should return 401 when not authenticated', async () => {
			const entry = {
				tmdb_id: '987654',
				media_type: 'movie',
				title: 'Test Movie',
				status: WatchStatus.WANT_TO_WATCH,
			};

			const response = await requestClient.post('/api/watchlist').send(entry);

			expect(response.status).toBe(401);
		});
	});

	describe('PUT /api/watchlist/:id', () => {
		it('should update an existing watchlist entry', async () => {
			const { userEntries } = await TestFixtures.createWatchlistEntries(
				'test-user-id',
				'partner-id'
			);
			const entry = userEntries[0];

			if (!entry) {
				throw new Error('Test entry was not created properly');
			}

			const updates = {
				status: WatchStatus.WATCHED,
				rating: 5,
				notes: 'This was amazing!',
				tags: ['favorite', 'action', 'best'],
			};

			// Mock the updated entry
			const updatedEntry = {
				...entry,
				...updates,
				updated_at: new Date(),
			};

			// Override WatchlistEntry.findByPk to return our test entry
			jest.spyOn(WatchlistEntry, 'findByPk')
				.mockResolvedValueOnce(entry as unknown as Model)
				.mockResolvedValueOnce(updatedEntry as unknown as Model);

			// Override WatchlistEntry.update to succeed
			jest.spyOn(WatchlistEntry, 'update').mockResolvedValueOnce([1, [updatedEntry]] as any);

			const response = await requestClient
				.put(`/api/watchlist/${entry.entry_id}`)
				.set('Authorization', `Bearer ${userToken}`)
				.send(updates);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('entry');
		});

		it('should return 404 when updating non-existent entry', async () => {
			const updates = {
				status: WatchStatus.WATCHED,
				rating: 5,
			};

			// Override WatchlistEntry.findByPk to return null (entry not found)
			jest.spyOn(WatchlistEntry, 'findByPk').mockResolvedValueOnce(null);

			const response = await requestClient
				.put('/api/watchlist/non-existent-id')
				.set('Authorization', `Bearer ${userToken}`)
				.send(updates);

			expect(response.status).toBe(404);
		});

		it('should return 403 when updating entry that belongs to another user', async () => {
			// Create another user and entries for that user
			const partnerId = 'partner-id';
			const { partnerEntries } = await TestFixtures.createWatchlistEntries(
				'test-user-id',
				partnerId
			);
			const partnerEntry = partnerEntries[0];

			if (!partnerEntry) {
				throw new Error('Test partner entry was not created properly');
			}

			// Mock the partner entry to have a different user_id
			const modifiedPartnerEntry = {
				...partnerEntry,
				user_id: partnerId // Different from test-user-id
			};

			// Override WatchlistEntry.findByPk to return the partner's entry
			jest.spyOn(WatchlistEntry, 'findByPk').mockResolvedValueOnce(modifiedPartnerEntry as unknown as Model);

			const updates = {
				status: WatchStatus.WATCHED,
				rating: 3,
			};

			const response = await requestClient
				.put(`/api/watchlist/${partnerEntry.entry_id}`)
				.set('Authorization', `Bearer ${userToken}`)
				.send(updates);

			expect(response.status).toBe(403);
		});

		it('should return 401 when not authenticated', async () => {
			const response = await requestClient
				.put('/api/watchlist/some-id')
				.send({ status: WatchStatus.WATCHED });

			expect(response.status).toBe(401);
		});
	});

	describe('DELETE /api/watchlist/:id', () => {
		it('should delete a watchlist entry', async () => {
			// Create a user entry
			const { userEntries } = await TestFixtures.createWatchlistEntries(
				'test-user-id',
				'partner-id'
			);
			const entry = userEntries[0];

			if (!entry) {
				throw new Error('Test entry was not created properly');
			}

			// Override WatchlistEntry.findByPk to return our test entry
			jest.spyOn(WatchlistEntry, 'findByPk').mockResolvedValueOnce(entry as unknown as Model);
			
			// Override WatchlistEntry.destroy to succeed
			jest.spyOn(WatchlistEntry, 'destroy').mockResolvedValueOnce(1);

			const response = await requestClient
				.delete(`/api/watchlist/${entry.entry_id}`)
				.set('Authorization', `Bearer ${userToken}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message).toContain('deleted');
		});

		it('should return 404 when deleting non-existent entry', async () => {
			// Override WatchlistEntry.findByPk to return null (entry not found)
			jest.spyOn(WatchlistEntry, 'findByPk').mockResolvedValueOnce(null);

			const response = await requestClient
				.delete('/api/watchlist/non-existent-id')
				.set('Authorization', `Bearer ${userToken}`);

			expect(response.status).toBe(404);
		});

		it('should return 403 when deleting entry that belongs to another user', async () => {
			// Create another user and entries for that user
			const partnerId = 'partner-id';
			const { partnerEntries } = await TestFixtures.createWatchlistEntries(
				'test-user-id',
				partnerId
			);
			const partnerEntry = partnerEntries[0];

			if (!partnerEntry) {
				throw new Error('Test partner entry was not created properly');
			}

			// Mock the partner entry to have a different user_id
			const modifiedPartnerEntry = {
				...partnerEntry,
				user_id: partnerId // Different from test-user-id
			};

			// Override WatchlistEntry.findByPk to return the partner's entry
			jest.spyOn(WatchlistEntry, 'findByPk').mockResolvedValueOnce(modifiedPartnerEntry as unknown as Model);

			const response = await requestClient
				.delete(`/api/watchlist/${partnerEntry.entry_id}`)
				.set('Authorization', `Bearer ${userToken}`);

			expect(response.status).toBe(403);
		});

		it('should return 401 when not authenticated', async () => {
			const response = await requestClient.delete('/api/watchlist/some-id');
			expect(response.status).toBe(401);
		});
	});

	describe('GET /api/watchlist/stats', () => {
		it('should return watchlist statistics for the user', async () => {
			// Create watchlist entries for the user
			const { userEntries } = await TestFixtures.createWatchlistEntries(
				'test-user-id',
				'partner-id'
			);

			// Override WatchlistEntry.findAll for stats query
			jest.spyOn(WatchlistEntry, 'findAll').mockResolvedValueOnce(userEntries as unknown as Model[]);

			const response = await requestClient
				.get('/api/watchlist/stats')
				.set('Authorization', `Bearer ${userToken}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('total');
			expect(response.body).toHaveProperty('by_status');
			expect(response.body).toHaveProperty('by_media_type');
		});

		it('should return 401 when not authenticated', async () => {
			const response = await requestClient.get('/api/watchlist/stats');
			expect(response.status).toBe(401);
		});
	});
});
