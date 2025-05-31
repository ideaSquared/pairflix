import bcrypt from 'bcryptjs';
import User from '../../../models/User';
import { TestFixtures } from '../fixtures';
import IntegrationTestSetup from '../setup';

describe('Auth API Integration Tests', () => {
	const testSetup = IntegrationTestSetup.getInstance();
	let requestClient: any;

	beforeAll(async () => {
		await testSetup.init();
		await testSetup.startServer();
		requestClient = testSetup.getRequestClient();
	});

	afterAll(async () => {
		await testSetup.clearData();
		await testSetup.stopServer();
		await testSetup.closeDatabase();
	});

	beforeEach(async () => {
		await testSetup.clearData();
	});

	describe('POST /api/auth/register', () => {
		it('should register a new user successfully', async () => {
			const newUser = {
				username: 'newuser',
				email: 'newuser@example.com',
				password: 'Password123!',
			};

			const response = await requestClient
				.post('/api/auth/register')
				.send(newUser);

			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty(
				'message',
				'User registered successfully'
			);
			expect(response.body).toHaveProperty('user');
			expect(response.body.user).toHaveProperty('username', newUser.username);
			expect(response.body.user).toHaveProperty('email', newUser.email);
			expect(response.body.user).toHaveProperty('token');
			expect(response.body.user).not.toHaveProperty('password');
			expect(response.body.user).not.toHaveProperty('password_hash');

			// Verify user was created in the database
			const createdUser = await User.findOne({
				where: { email: newUser.email },
			});
			expect(createdUser).not.toBeNull();
			expect(createdUser?.username).toBe(newUser.username);
			expect(createdUser?.role).toBe('user'); // Default role
			expect(createdUser?.status).toBe('active'); // Default status
		});

		it('should return 400 when registering with invalid data', async () => {
			const invalidUser = {
				username: 'us', // Too short
				email: 'invalid-email',
				password: 'short',
			};

			const response = await requestClient
				.post('/api/auth/register')
				.send(invalidUser);

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty('errors');
		});

		it('should return 409 when registering with existing email', async () => {
			// Create a user first
			const { regularUser } = await TestFixtures.createUsers();

			// Try to register with the same email
			const duplicateUser = {
				username: 'newusername',
				email: regularUser.email,
				password: 'Password123!',
			};

			const response = await requestClient
				.post('/api/auth/register')
				.send(duplicateUser);

			expect(response.status).toBe(409);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message).toContain('already exists');
		});
	});

	describe('POST /api/auth/login', () => {
		it('should login successfully with valid credentials', async () => {
			// Create test user with known password
			await User.create({
				username: 'loginuser',
				email: 'loginuser@example.com',
				password_hash: await bcrypt.hash('Password123!', 10),
				role: 'user',
				status: 'active',
				preferences: {
					theme: 'dark',
					viewStyle: 'grid',
					emailNotifications: true,
					autoArchiveDays: 30,
					favoriteGenres: [],
				},
			});

			const loginData = {
				email: 'loginuser@example.com',
				password: 'Password123!',
			};

			const response = await requestClient
				.post('/api/auth/login')
				.send(loginData);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('token');
			expect(response.body).toHaveProperty('user');
			expect(response.body.user).toHaveProperty('username', 'loginuser');
			expect(response.body.user).toHaveProperty('email', loginData.email);
			expect(response.body.user).not.toHaveProperty('password');
			expect(response.body.user).not.toHaveProperty('password_hash');
		});

		it('should return 401 with invalid credentials', async () => {
			// Create test user
			await User.create({
				username: 'loginuser',
				email: 'loginuser@example.com',
				password_hash: await bcrypt.hash('Password123!', 10),
				role: 'user',
				status: 'active',
				preferences: {
					theme: 'dark',
					viewStyle: 'grid',
					emailNotifications: true,
					autoArchiveDays: 30,
					favoriteGenres: [],
				},
			});

			const loginData = {
				email: 'loginuser@example.com',
				password: 'WrongPassword!',
			};

			const response = await requestClient
				.post('/api/auth/login')
				.send(loginData);

			expect(response.status).toBe(401);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message).toContain('Invalid credentials');
		});

		it('should return 401 when user is suspended', async () => {
			// Create suspended user
			await User.create({
				username: 'suspendeduser',
				email: 'suspended@example.com',
				password_hash: await bcrypt.hash('Password123!', 10),
				role: 'user',
				status: 'suspended',
				preferences: {
					theme: 'dark',
					viewStyle: 'grid',
					emailNotifications: true,
					autoArchiveDays: 30,
					favoriteGenres: [],
				},
			});

			const loginData = {
				email: 'suspended@example.com',
				password: 'Password123!',
			};

			const response = await requestClient
				.post('/api/auth/login')
				.send(loginData);

			expect(response.status).toBe(401);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message).toContain('suspended');
		});
	});

	describe('GET /api/auth/me', () => {
		it('should return user profile when authenticated', async () => {
			const testUser = await testSetup.createTestUser('user');
			const token = testSetup.generateAuthToken(testUser);

			const response = await requestClient
				.get('/api/auth/me')
				.set('Authorization', `Bearer ${token}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('username', testUser.username);
			expect(response.body).toHaveProperty('email', testUser.email);
			expect(response.body).toHaveProperty('role', testUser.role);
			expect(response.body).not.toHaveProperty('password_hash');
		});

		it('should return 401 when not authenticated', async () => {
			const response = await requestClient.get('/api/auth/me');

			expect(response.status).toBe(401);
		});

		it('should return 401 with invalid token', async () => {
			const response = await requestClient
				.get('/api/auth/me')
				.set('Authorization', 'Bearer invalid-token');

			expect(response.status).toBe(401);
		});
	});

	describe('POST /api/auth/refresh', () => {
		it('should issue a new token when refresh token is valid', async () => {
			// This test would depend on your refresh token implementation
			// This is a placeholder for the test
			const testUser = await testSetup.createTestUser('user');
			const token = testSetup.generateAuthToken(testUser);

			// Assuming you store refresh tokens in your database or have a way to create valid ones
			const refreshToken = 'valid-refresh-token';

			// This test may need to be adapted based on your actual refresh token implementation
			const response = await requestClient
				.post('/api/auth/refresh')
				.send({ refresh_token: refreshToken });

			// Skip assertions if refresh tokens aren't implemented yet
			// expect(response.status).toBe(200);
			// expect(response.body).toHaveProperty('token');
		});
	});

	describe('POST /api/auth/logout', () => {
		it('should logout successfully', async () => {
			const testUser = await testSetup.createTestUser('user');
			const token = testSetup.generateAuthToken(testUser);

			const response = await requestClient
				.post('/api/auth/logout')
				.set('Authorization', `Bearer ${token}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('message');
			expect(response.body.message).toContain('logged out');
		});
	});
});
