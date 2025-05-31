import { DataTypes } from 'sequelize';
import User from './User';

// Mock for Sequelize
const mockSequelize = {
	define: jest.fn().mockReturnValue({
		belongsTo: jest.fn(),
		hasMany: jest.fn(),
		associate: jest.fn(),
	}),
};

// Mock Sequelize.fn
jest.mock('sequelize', () => {
	const actualSequelize = jest.requireActual('sequelize');
	return {
		...actualSequelize,
		Sequelize: jest.fn().mockImplementation(() => mockSequelize),
	};
});

describe('User Model', () => {
	beforeEach(() => {
		// Reset mocks before each test
		jest.clearAllMocks();
	});

	describe('Model initialization', () => {
		it('should initialize with correct attributes', () => {
			// Spy on init method
			const initSpy = jest
				.spyOn(User, 'init')
				.mockImplementation(() => User as any);

			// Call initialize on User model
			User.initialize(mockSequelize as any);

			// Verify init was called
			expect(initSpy).toHaveBeenCalled();

			// Get the attributes passed to init
			const calls = initSpy.mock.calls;
			expect(calls.length).toBeGreaterThan(0);

			const attributes = calls[0]?.[0];
			expect(attributes).toBeDefined();

			// Verify all required fields are defined
			expect(attributes).toHaveProperty('user_id');
			expect(attributes).toHaveProperty('email');
			expect(attributes).toHaveProperty('username');
			expect(attributes).toHaveProperty('password_hash');
			expect(attributes).toHaveProperty('role');
			expect(attributes).toHaveProperty('status');
			expect(attributes).toHaveProperty('last_login');
			expect(attributes).toHaveProperty('preferences');

			// Restore the original implementation
			initSpy.mockRestore();
		});

		it('should set correct options', () => {
			// Spy on init method
			const initSpy = jest
				.spyOn(User, 'init')
				.mockImplementation(() => User as any);

			// Call initialize on User model
			User.initialize(mockSequelize as any);

			// Verify init was called
			expect(initSpy).toHaveBeenCalled();

			const calls = initSpy.mock.calls;
			expect(calls.length).toBeGreaterThan(0);

			// Get the options passed to init
			const options = calls[0]?.[1];
			expect(options).toBeDefined();

			// Check model options
			expect(options).toHaveProperty('sequelize', mockSequelize);
			expect(options).toHaveProperty('modelName', 'User');
			expect(options).toHaveProperty('tableName', 'users');
			expect(options).toHaveProperty('timestamps', true);
			expect(options).toHaveProperty('underscored', true);

			// Restore the original implementation
			initSpy.mockRestore();
		});
	});

	describe('Field definitions', () => {
		let attributes: any;

		beforeEach(() => {
			// Spy on init method to capture attributes
			const initSpy = jest
				.spyOn(User, 'init')
				.mockImplementation(() => User as any);
			User.initialize(mockSequelize as any);

			const calls = initSpy.mock.calls;
			expect(calls.length).toBeGreaterThan(0);

			attributes = calls[0]?.[0];
			expect(attributes).toBeDefined();

			initSpy.mockRestore();
		});

		it('should define user_id field correctly', () => {
			expect(attributes.user_id.type).toBe(DataTypes.UUID);
			expect(attributes.user_id.defaultValue).toBe(DataTypes.UUIDV4);
			expect(attributes.user_id.primaryKey).toBe(true);
		});

		it('should define email field with validations', () => {
			expect(attributes.email.type).toBe(DataTypes.STRING);
			expect(attributes.email.allowNull).toBe(false);
			expect(attributes.email.unique).toBe(true);
			expect(attributes.email.validate).toHaveProperty('isEmail');
		});

		it('should define username field with validations', () => {
			expect(attributes.username.type).toBe(DataTypes.STRING);
			expect(attributes.username.allowNull).toBe(false);
			expect(attributes.username.unique).toBe(true);
			expect(attributes.username.validate).toHaveProperty('len');
			expect(attributes.username.validate.len).toEqual([3, 30]);
		});

		it('should define status field with validations', () => {
			expect(attributes.status.type).toBe(DataTypes.STRING);
			expect(attributes.status.allowNull).toBe(false);
			expect(attributes.status.defaultValue).toBe('active');
			expect(attributes.status.validate).toHaveProperty('isIn');
			expect(attributes.status.validate.isIn[0]).toEqual([
				'active',
				'inactive',
				'pending',
				'suspended',
				'banned',
			]);
		});

		it('should define preferences with correct default values', () => {
			expect(attributes.preferences.type).toBe(DataTypes.JSONB);
			expect(attributes.preferences.allowNull).toBe(false);
			expect(attributes.preferences.defaultValue).toEqual({
				theme: 'dark',
				viewStyle: 'grid',
				emailNotifications: true,
				autoArchiveDays: 30,
				favoriteGenres: [],
			});
		});
	});
});
