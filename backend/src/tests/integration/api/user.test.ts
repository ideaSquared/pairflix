import bcrypt from 'bcryptjs';
import User from '../../../models/User';
import IntegrationTestSetup from '../setup';

describe('User API Integration Tests', () => {
	const testSetup = IntegrationTestSetup.getInstance();
	let requestClient: any;
	let userToken: string;
	let testUser: any;
	const TEST_USER_ID = 'test-user-id';

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
			password_hash: await bcrypt.hash('OldPassword123!', 10),
			preferences: {
				theme: 'dark',
				viewStyle: 'grid',
				emailNotifications: true,
				autoArchiveDays: 30,
				favoriteGenres: ['action', 'comedy'],
			},
		};

		// Set up mocking for User model
		User.findByPk = jest.fn().mockImplementation(id => {
			if (id === testUser.id) return Promise.resolve(testUser);
			return Promise.resolve(null);
		});

		User.findOne = jest.fn().mockImplementation((options: any) => {
			if (options?.where?.email === testUser.email) {
				return Promise.resolve(testUser);
			}
			// For checking if a new email exists
			if (options?.where?.email === 'existing@example.com') {
				return Promise.resolve({
					id: 'other-user-id',
					email: 'existing@example.com',
				});
			}
			return Promise.resolve(null);
		});

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

		// Reset the test user modifications between tests
		testUser.email = 'test@example.com';
		testUser.username = 'testuser';
		testUser.password_hash = await bcrypt.hash('OldPassword123!', 10);
		testUser.preferences = {
			theme: 'dark',
			viewStyle: 'grid',
			emailNotifications: true,
			autoArchiveDays: 30,
			favoriteGenres: ['action', 'comedy'],
		};

		// Configure auth middleware to use reset test user
		testSetup.setTestUser(testUser);

		// Set up standard mocks
		User.findByPk = jest.fn().mockImplementation(id => {
			if (id === testUser.id) return Promise.resolve(testUser);
			return Promise.resolve(null);
		});

		User.findOne = jest.fn().mockImplementation((options: any) => {
			if (options?.where?.email === testUser.email) {
				return Promise.resolve(testUser);
			}
			if (options?.where?.email === 'existing@example.com') {
				return Promise.resolve({
					id: 'other-user-id',
					email: 'existing@example.com',
				});
			}
			return Promise.resolve(null);
		});

		User.update = jest.fn().mockResolvedValue([1, [testUser]]);
	});

	describe('PUT /api/users/password', () => {
		it('should update password successfully with valid data', async () => {
			// Mock bcrypt compare to return true (valid old password)
			const originalCompare = bcrypt.compare;
			bcrypt.compare = jest.fn().mockResolvedValue(true);

			const passwordData = {
				currentPassword: 'OldPassword123!',
				newPassword: 'NewPassword456!',
			};

			// Mock the user update
			User.update = jest.fn().mockImplementation(data => {
				// Update the password hash in our mock user
				testUser.password_hash = data.password_hash;
				return Promise.resolve([1, [testUser]]);
			});

			const response = await requestClient
				.put('/api/users/password')
				.set('Authorization', `Bearer ${userToken}`)
				.send(passwordData);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message).toContain('updated successfully');

			// Restore original bcrypt compare function
			bcrypt.compare = originalCompare;
		});

		it('should return 401 with incorrect current password', async () => {
			// Mock bcrypt compare to return false (invalid old password)
			const originalCompare = bcrypt.compare;
			bcrypt.compare = jest.fn().mockResolvedValue(false);

			const passwordData = {
				currentPassword: 'WrongPassword123!',
				newPassword: 'NewPassword456!',
			};

			const response = await requestClient
				.put('/api/users/password')
				.set('Authorization', `Bearer ${userToken}`)
				.send(passwordData);

			expect(response.status).toBe(401);
			expect(response.body).toHaveProperty('error');

			// Restore original bcrypt compare
			bcrypt.compare = originalCompare;
		});

		it('should return 400 with invalid new password', async () => {
			// Mock bcrypt compare to return true (valid old password)
			const originalCompare = bcrypt.compare;
			bcrypt.compare = jest.fn().mockResolvedValue(true);

			const passwordData = {
				currentPassword: 'OldPassword123!',
				newPassword: 'weak', // Too short / weak
			};

			const response = await requestClient
				.put('/api/users/password')
				.set('Authorization', `Bearer ${userToken}`)
				.send(passwordData);

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty('errors');

			// Restore original bcrypt compare
			bcrypt.compare = originalCompare;
		});
	});

	describe('PUT /api/users/email', () => {
		it('should update email successfully with valid data', async () => {
			const newEmail = 'newemail@example.com';

			// Mock the user update
			User.update = jest.fn().mockImplementation(data => {
				// Update the email in our mock user
				testUser.email = data.email;
				return Promise.resolve([1, [testUser]]);
			});

			const response = await requestClient
				.put('/api/users/email')
				.set('Authorization', `Bearer ${userToken}`)
				.send({ email: newEmail });

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message).toContain('updated successfully');
			expect(testUser.email).toBe(newEmail);
		});

		it('should return 400 with invalid email format', async () => {
			const invalidEmail = 'not-a-valid-email';

			const response = await requestClient
				.put('/api/users/email')
				.set('Authorization', `Bearer ${userToken}`)
				.send({ email: invalidEmail });

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty('errors');
		});

		it('should return 409 when email already exists', async () => {
			const existingEmail = 'existing@example.com';

			const response = await requestClient
				.put('/api/users/email')
				.set('Authorization', `Bearer ${userToken}`)
				.send({ email: existingEmail });

			expect(response.status).toBe(409);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message).toContain('already in use');
		});
	});

	describe('PUT /api/users/username', () => {
		it('should update username successfully with valid data', async () => {
			const newUsername = 'newusername';

			// Mock the user update
			User.update = jest.fn().mockImplementation(data => {
				// Update the username in our mock user
				testUser.username = data.username;
				return Promise.resolve([1, [testUser]]);
			});

			const response = await requestClient
				.put('/api/users/username')
				.set('Authorization', `Bearer ${userToken}`)
				.send({ username: newUsername });

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message).toContain('updated successfully');
			expect(testUser.username).toBe(newUsername);
		});

		it('should return 400 with invalid username (too short)', async () => {
			const invalidUsername = 'ab'; // Too short

			const response = await requestClient
				.put('/api/users/username')
				.set('Authorization', `Bearer ${userToken}`)
				.send({ username: invalidUsername });

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty('errors');
		});

		it('should return 409 when username already exists', async () => {
			const existingUsername = 'existinguser';

			// Mock User.findOne to simulate existing username
			User.findOne = jest.fn().mockImplementation((options: any) => {
				if (options?.where?.username === existingUsername) {
					return Promise.resolve({
						id: 'other-user-id',
						username: existingUsername,
					});
				}
				if (options?.where?.email === testUser.email) {
					return Promise.resolve(testUser);
				}
				return Promise.resolve(null);
			});

			const response = await requestClient
				.put('/api/users/username')
				.set('Authorization', `Bearer ${userToken}`)
				.send({ username: existingUsername });

			expect(response.status).toBe(409);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message).toContain('already in use');
		});
	});

	describe('PUT /api/users/preferences', () => {
		it('should update preferences successfully', async () => {
			const newPreferences = {
				theme: 'light',
				viewStyle: 'list',
				emailNotifications: false,
				autoArchiveDays: 60,
				favoriteGenres: ['drama', 'sci-fi'],
			};

			// Mock the user update
			User.update = jest.fn().mockImplementation(data => {
				// Update the preferences in our mock user
				testUser.preferences = data.preferences;
				return Promise.resolve([1, [testUser]]);
			});

			const response = await requestClient
				.put('/api/users/preferences')
				.set('Authorization', `Bearer ${userToken}`)
				.send({ preferences: newPreferences });

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('message');
			expect(response.body).toHaveProperty('preferences');
			expect(response.body.message).toContain('updated successfully');
			expect(response.body.preferences).toEqual(newPreferences);
		});

		it('should update partial preferences successfully', async () => {
			const originalPreferences = { ...testUser.preferences };
			const partialPreferences = {
				theme: 'light',
				emailNotifications: false,
			};

			// Mock the user update
			User.update = jest.fn().mockImplementation(data => {
				// Update only the specified preferences in our mock user
				testUser.preferences = {
					...testUser.preferences,
					...data.preferences,
				};
				return Promise.resolve([1, [testUser]]);
			});

			const response = await requestClient
				.put('/api/users/preferences')
				.set('Authorization', `Bearer ${userToken}`)
				.send({ preferences: partialPreferences });

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('message');
			expect(response.body).toHaveProperty('preferences');
			expect(response.body.preferences).toEqual({
				...originalPreferences,
				...partialPreferences,
			});

			// Verify only specified preferences were updated
			expect(testUser.preferences.theme).toBe('light');
			expect(testUser.preferences.emailNotifications).toBe(false);
			expect(testUser.preferences.viewStyle).toBe(
				originalPreferences.viewStyle
			);
			expect(testUser.preferences.autoArchiveDays).toBe(
				originalPreferences.autoArchiveDays
			);
		});

		it('should return 400 with invalid preferences format', async () => {
			const invalidPreferences = {
				theme: 'invalid-theme', // Invalid theme value
				viewStyle: 'grid',
				emailNotifications: 'not-a-boolean', // Should be boolean
				autoArchiveDays: 'not-a-number', // Should be number
			};

			const response = await requestClient
				.put('/api/users/preferences')
				.set('Authorization', `Bearer ${userToken}`)
				.send({ preferences: invalidPreferences });

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty('errors');
		});
	});

	describe('GET /api/users/search', () => {
		it('should find user by email', async () => {
			const searchEmail = 'search@example.com';
			const searchUser = {
				id: 'search-user-id',
				email: searchEmail,
				username: 'searchuser',
				role: 'user',
			};

			// Mock User.findOne to return our search user
			User.findOne = jest.fn().mockImplementation((options: any) => {
				if (options?.where?.email === searchEmail) {
					return Promise.resolve(searchUser);
				}
				return Promise.resolve(null);
			});

			const response = await requestClient
				.get(`/api/users/search?email=${searchEmail}`)
				.set('Authorization', `Bearer ${userToken}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('user');
			expect(response.body.user).toHaveProperty('id', searchUser.id);
			expect(response.body.user).toHaveProperty(
				'username',
				searchUser.username
			);
			expect(response.body.user).toHaveProperty('email', searchUser.email);
		});

		it('should return 404 when user not found', async () => {
			const nonExistentEmail = 'nonexistent@example.com';

			// Mock User.findOne to return null (user not found)
			User.findOne = jest.fn().mockResolvedValue(null);

			const response = await requestClient
				.get(`/api/users/search?email=${nonExistentEmail}`)
				.set('Authorization', `Bearer ${userToken}`);

			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message).toContain('not found');
		});

		it('should return 400 with invalid or missing email parameter', async () => {
			const response = await requestClient
				.get('/api/users/search')
				.set('Authorization', `Bearer ${userToken}`);

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty('errors');
		});

		it('should return 401 when not authenticated', async () => {
			const response = await requestClient.get(
				'/api/users/search?email=test@example.com'
			);

			expect(response.status).toBe(401);
			expect(response.body).toHaveProperty('error');
		});
	});
});
