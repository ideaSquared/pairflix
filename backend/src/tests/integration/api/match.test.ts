import { Model } from 'sequelize';
import Match from '../../../models/Match';
import User from '../../../models/User';
import WatchlistEntry from '../../../models/WatchlistEntry';
import IntegrationTestSetup from '../setup';

describe('Match API Integration Tests', () => {
	const testSetup = IntegrationTestSetup.getInstance();
	let requestClient: any;
	let userToken: string;
	let testUser: any;
	const TEST_USER_ID = 'test-user-id';
	const PARTNER_USER_ID = 'partner-user-id';

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

		// Generate token with consistent user data
		userToken = testSetup.generateAuthToken(testUser);

		// Configure auth middleware to expect this test user
		testSetup.setTestUser(testUser);
	});

	afterAll(async () => {
		await testSetup.clearData();
		await testSetup.stopServer();
		await testSetup.closeDatabase();
	});

	beforeEach(async () => {
		await testSetup.clearData();
		jest.resetAllMocks(); // Reset mocks between tests

		// Mock User.findByPk for partner user lookups
		User.findByPk = jest.fn().mockImplementation(id => {
			if (id === TEST_USER_ID) {
				return Promise.resolve(testUser);
			}
			if (id === PARTNER_USER_ID) {
				return Promise.resolve({
					id: PARTNER_USER_ID,
					email: 'partner@example.com',
					username: 'partner',
					role: 'user',
				});
			}
			return Promise.resolve(null);
		});
	});

	describe('GET /api/matches', () => {
		it('should get all matches for the user', async () => {
			// Create mock matches
			const mockMatches = [
				{
					match_id: 'match-1',
					user1_id: TEST_USER_ID,
					user2_id: PARTNER_USER_ID,
					content_id: 'content-1',
					tmdb_id: '12345',
					title: 'Test Movie',
					poster_path: '/path/to/poster.jpg',
					media_type: 'movie',
					status: 'pending',
					created_at: new Date(),
					updated_at: new Date(),
				},
				{
					match_id: 'match-2',
					user1_id: TEST_USER_ID,
					user2_id: PARTNER_USER_ID,
					content_id: 'content-2',
					tmdb_id: '23456',
					title: 'Another Movie',
					poster_path: '/path/to/another.jpg',
					media_type: 'movie',
					status: 'accepted',
					created_at: new Date(),
					updated_at: new Date(),
				},
			];

			// Mock Match.findAll to return our test matches
			Match.findAll = jest
				.fn()
				.mockResolvedValue(mockMatches as unknown as Model[]);

			const response = await requestClient
				.get('/api/matches')
				.set('Authorization', `Bearer ${userToken}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('matches');
			expect(Array.isArray(response.body.matches)).toBe(true);
			expect(response.body.matches.length).toBe(2);
			expect(response.body.matches[0]).toHaveProperty('match_id', 'match-1');
			expect(response.body.matches[1]).toHaveProperty('match_id', 'match-2');
		});

		it('should filter matches by status if provided', async () => {
			// Create mock matches with different statuses
			const mockMatches = [
				{
					match_id: 'match-1',
					user1_id: TEST_USER_ID,
					user2_id: PARTNER_USER_ID,
					content_id: 'content-1',
					tmdb_id: '12345',
					title: 'Test Movie',
					poster_path: '/path/to/poster.jpg',
					media_type: 'movie',
					status: 'accepted',
					created_at: new Date(),
					updated_at: new Date(),
				},
			];

			// Mock Match.findAll to check filter and return filtered matches
			Match.findAll = jest.fn().mockImplementation((options: any) => {
				// Verify filter is applied
				if (options?.where?.status === 'accepted') {
					return Promise.resolve(mockMatches as unknown as Model[]);
				}
				// Should not reach here in this test
				return Promise.resolve([]);
			});

			const response = await requestClient
				.get('/api/matches?status=accepted')
				.set('Authorization', `Bearer ${userToken}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('matches');
			expect(Array.isArray(response.body.matches)).toBe(true);
			expect(response.body.matches.length).toBe(1);
			expect(response.body.matches[0]).toHaveProperty('status', 'accepted');
		});

		it('should return empty array if no matches found', async () => {
			// Mock Match.findAll to return empty array
			Match.findAll = jest.fn().mockResolvedValue([]);

			const response = await requestClient
				.get('/api/matches')
				.set('Authorization', `Bearer ${userToken}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('matches');
			expect(Array.isArray(response.body.matches)).toBe(true);
			expect(response.body.matches.length).toBe(0);
		});

		it('should return 401 when not authenticated', async () => {
			const response = await requestClient.get('/api/matches');

			expect(response.status).toBe(401);
			expect(response.body).toHaveProperty('error');
		});
	});

	describe('POST /api/matches', () => {
		it('should create a match successfully', async () => {
			// Mock entry to match with
			const partnerEntry = {
				entry_id: 'partner-entry-1',
				user_id: PARTNER_USER_ID,
				tmdb_id: '12345',
				media_type: 'movie',
				title: 'Test Movie',
				status: 'want_to_watch',
			};

			// Mock user entry
			const userEntry = {
				entry_id: 'user-entry-1',
				user_id: TEST_USER_ID,
				tmdb_id: '12345',
				media_type: 'movie',
				title: 'Test Movie',
				status: 'want_to_watch',
			};

			// Mock WatchlistEntry.findOne to return partner's entry
			WatchlistEntry.findOne = jest.fn().mockImplementation((options: any) => {
				if (
					options?.where?.user_id === PARTNER_USER_ID &&
					options?.where?.tmdb_id === '12345'
				) {
					return Promise.resolve(partnerEntry as unknown as Model);
				}
				if (
					options?.where?.user_id === TEST_USER_ID &&
					options?.where?.tmdb_id === '12345'
				) {
					return Promise.resolve(userEntry as unknown as Model);
				}
				return Promise.resolve(null);
			});

			// Mock Match.findOne to check for existing match (return null to indicate no existing match)
			Match.findOne = jest.fn().mockResolvedValue(null);

			// Mock Match.create to return the new match
			const createdMatch = {
				match_id: 'new-match-id',
				user1_id: TEST_USER_ID,
				user2_id: PARTNER_USER_ID,
				content_id: 'content-id',
				tmdb_id: '12345',
				title: 'Test Movie',
				poster_path: '/path/to/poster.jpg',
				media_type: 'movie',
				status: 'pending',
				created_at: new Date(),
				updated_at: new Date(),
			};

			Match.create = jest
				.fn()
				.mockResolvedValue(createdMatch as unknown as Model);

			const matchData = {
				partner_id: PARTNER_USER_ID,
				tmdb_id: '12345',
			};

			const response = await requestClient
				.post('/api/matches')
				.set('Authorization', `Bearer ${userToken}`)
				.send(matchData);

			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty('match');
			expect(response.body.match).toHaveProperty('match_id', 'new-match-id');
			expect(response.body.match).toHaveProperty('user1_id', TEST_USER_ID);
			expect(response.body.match).toHaveProperty('user2_id', PARTNER_USER_ID);
		});

		it('should return 400 when partner ID is missing', async () => {
			const invalidMatchData = {
				// Missing partner_id
				tmdb_id: '12345',
			};

			const response = await requestClient
				.post('/api/matches')
				.set('Authorization', `Bearer ${userToken}`)
				.send(invalidMatchData);

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty('errors');
		});

		it('should return 400 when tmdb_id is missing', async () => {
			const invalidMatchData = {
				partner_id: PARTNER_USER_ID,
				// Missing tmdb_id
			};

			const response = await requestClient
				.post('/api/matches')
				.set('Authorization', `Bearer ${userToken}`)
				.send(invalidMatchData);

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty('errors');
		});

		it('should return 404 when partner user does not exist', async () => {
			// Mock User.findByPk to return null for the partner user
			User.findByPk = jest.fn().mockImplementation(id => {
				if (id === TEST_USER_ID) {
					return Promise.resolve(testUser);
				}
				// Partner user not found
				return Promise.resolve(null);
			});

			const matchData = {
				partner_id: 'nonexistent-partner',
				tmdb_id: '12345',
			};

			const response = await requestClient
				.post('/api/matches')
				.set('Authorization', `Bearer ${userToken}`)
				.send(matchData);

			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message).toContain('Partner not found');
		});

		it("should return 404 when the content is not in partner's watchlist", async () => {
			// Mock WatchlistEntry.findOne to return null (content not in partner's watchlist)
			WatchlistEntry.findOne = jest.fn().mockResolvedValue(null);

			const matchData = {
				partner_id: PARTNER_USER_ID,
				tmdb_id: '12345',
			};

			const response = await requestClient
				.post('/api/matches')
				.set('Authorization', `Bearer ${userToken}`)
				.send(matchData);

			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message).toContain(
				"not found in partner's watchlist"
			);
		});

		it("should return 404 when the content is not in user's watchlist", async () => {
			// Mock entry to match with (in partner's watchlist)
			const partnerEntry = {
				entry_id: 'partner-entry-1',
				user_id: PARTNER_USER_ID,
				tmdb_id: '12345',
				media_type: 'movie',
				title: 'Test Movie',
				status: 'want_to_watch',
			};

			// Mock WatchlistEntry.findOne to return partner's entry but no user entry
			WatchlistEntry.findOne = jest.fn().mockImplementation((options: any) => {
				if (
					options?.where?.user_id === PARTNER_USER_ID &&
					options?.where?.tmdb_id === '12345'
				) {
					return Promise.resolve(partnerEntry as unknown as Model);
				}
				// User doesn't have this content in watchlist
				return Promise.resolve(null);
			});

			const matchData = {
				partner_id: PARTNER_USER_ID,
				tmdb_id: '12345',
			};

			const response = await requestClient
				.post('/api/matches')
				.set('Authorization', `Bearer ${userToken}`)
				.send(matchData);

			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message).toContain('not found in your watchlist');
		});

		it('should return 409 when match already exists', async () => {
			// Mock entries for both users
			const partnerEntry = {
				entry_id: 'partner-entry-1',
				user_id: PARTNER_USER_ID,
				tmdb_id: '12345',
				media_type: 'movie',
				title: 'Test Movie',
				status: 'want_to_watch',
			};

			const userEntry = {
				entry_id: 'user-entry-1',
				user_id: TEST_USER_ID,
				tmdb_id: '12345',
				media_type: 'movie',
				title: 'Test Movie',
				status: 'want_to_watch',
			};

			// Mock WatchlistEntry.findOne to return entries for both users
			WatchlistEntry.findOne = jest.fn().mockImplementation((options: any) => {
				if (
					options?.where?.user_id === PARTNER_USER_ID &&
					options?.where?.tmdb_id === '12345'
				) {
					return Promise.resolve(partnerEntry as unknown as Model);
				}
				if (
					options?.where?.user_id === TEST_USER_ID &&
					options?.where?.tmdb_id === '12345'
				) {
					return Promise.resolve(userEntry as unknown as Model);
				}
				return Promise.resolve(null);
			});

			// Mock Match.findOne to return an existing match
			const existingMatch = {
				match_id: 'existing-match',
				user1_id: TEST_USER_ID,
				user2_id: PARTNER_USER_ID,
				content_id: 'content-id',
				tmdb_id: '12345',
				title: 'Test Movie',
				status: 'pending',
			};

			Match.findOne = jest
				.fn()
				.mockResolvedValue(existingMatch as unknown as Model);

			const matchData = {
				partner_id: PARTNER_USER_ID,
				tmdb_id: '12345',
			};

			const response = await requestClient
				.post('/api/matches')
				.set('Authorization', `Bearer ${userToken}`)
				.send(matchData);

			expect(response.status).toBe(409);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message).toContain('already exists');
		});

		it('should return 401 when not authenticated', async () => {
			const matchData = {
				partner_id: PARTNER_USER_ID,
				tmdb_id: '12345',
			};

			const response = await requestClient.post('/api/matches').send(matchData);

			expect(response.status).toBe(401);
			expect(response.body).toHaveProperty('error');
		});
	});

	describe('PUT /api/matches/:match_id/status', () => {
		it('should update match status successfully', async () => {
			// Create mock existing match
			const existingMatch = {
				match_id: 'match-123',
				user1_id: PARTNER_USER_ID, // Partner created the match
				user2_id: TEST_USER_ID, // Current user is recipient
				content_id: 'content-id',
				tmdb_id: '12345',
				title: 'Test Movie',
				poster_path: '/path/to/poster.jpg',
				media_type: 'movie',
				status: 'pending',
				created_at: new Date(),
				updated_at: new Date(),
			};

			// Mock Match.findByPk to return the match
			Match.findByPk = jest
				.fn()
				.mockResolvedValue(existingMatch as unknown as Model);

			// Mock Match.update to return success
			Match.update = jest
				.fn()
				.mockResolvedValue([1, [{ ...existingMatch, status: 'accepted' }]]);

			const response = await requestClient
				.put('/api/matches/match-123/status')
				.set('Authorization', `Bearer ${userToken}`)
				.send({ status: 'accepted' });

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message).toContain('updated successfully');
			expect(response.body).toHaveProperty('match');
			expect(response.body.match).toHaveProperty('status', 'accepted');
		});

		it('should return 400 when status is invalid', async () => {
			const response = await requestClient
				.put('/api/matches/match-123/status')
				.set('Authorization', `Bearer ${userToken}`)
				.send({ status: 'invalid-status' });

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty('errors');
		});

		it('should return 404 when match does not exist', async () => {
			// Mock Match.findByPk to return null (match not found)
			Match.findByPk = jest.fn().mockResolvedValue(null);

			const response = await requestClient
				.put('/api/matches/nonexistent-match/status')
				.set('Authorization', `Bearer ${userToken}`)
				.send({ status: 'accepted' });

			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message).toContain('Match not found');
		});

		it('should return 403 when user is not involved in the match', async () => {
			// Create mock match with different users
			const otherUsersMatch = {
				match_id: 'match-123',
				user1_id: 'other-user-1',
				user2_id: 'other-user-2',
				content_id: 'content-id',
				tmdb_id: '12345',
				title: 'Test Movie',
				status: 'pending',
			};

			// Mock Match.findByPk to return the match
			Match.findByPk = jest
				.fn()
				.mockResolvedValue(otherUsersMatch as unknown as Model);

			const response = await requestClient
				.put('/api/matches/match-123/status')
				.set('Authorization', `Bearer ${userToken}`)
				.send({ status: 'accepted' });

			expect(response.status).toBe(403);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message).toContain('not authorized');
		});

		it('should return 403 when match initiator tries to accept their own match', async () => {
			// Create mock match where current user is the initiator
			const selfInitiatedMatch = {
				match_id: 'match-123',
				user1_id: TEST_USER_ID, // Current user created the match
				user2_id: PARTNER_USER_ID,
				content_id: 'content-id',
				tmdb_id: '12345',
				title: 'Test Movie',
				status: 'pending',
			};

			// Mock Match.findByPk to return the match
			Match.findByPk = jest
				.fn()
				.mockResolvedValue(selfInitiatedMatch as unknown as Model);

			const response = await requestClient
				.put('/api/matches/match-123/status')
				.set('Authorization', `Bearer ${userToken}`)
				.send({ status: 'accepted' });

			expect(response.status).toBe(403);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message).toContain(
				'cannot accept your own match request'
			);
		});

		it('should return 401 when not authenticated', async () => {
			const response = await requestClient
				.put('/api/matches/match-123/status')
				.send({ status: 'accepted' });

			expect(response.status).toBe(401);
			expect(response.body).toHaveProperty('error');
		});
	});
});
