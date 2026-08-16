import { DataTypes, type ModelStatic, type Sequelize } from 'sequelize';
import User from './User';

// Define interfaces for type safety
interface UserAttributes {
	user_id: {
		type: typeof DataTypes.UUID;
		defaultValue: typeof DataTypes.UUIDV4;
		primaryKey: boolean;
	};
	email: {
		type: typeof DataTypes.STRING;
		allowNull: boolean;
		unique: boolean;
		validate: {
			isEmail: boolean;
		};
	};
	username: {
		type: typeof DataTypes.STRING;
		allowNull: boolean;
		unique: boolean;
		validate: {
			len: [number, number];
			is: RegExp;
		};
	};
	password_hash: {
		type: typeof DataTypes.STRING;
		allowNull: boolean;
	};
	role: {
		type: typeof DataTypes.STRING;
		allowNull: boolean;
		defaultValue: string;
	};
	status: {
		type: typeof DataTypes.STRING;
		allowNull: boolean;
		defaultValue: string;
		validate: {
			isIn: [string[]];
		};
	};
	last_login: {
		type: typeof DataTypes.DATE;
		allowNull: boolean;
	};
	preferences: {
		type: typeof DataTypes.JSONB;
		allowNull: boolean;
		defaultValue: {
			theme: string;
			viewStyle: string;
			emailNotifications: boolean;
			autoArchiveDays: number;
			favoriteGenres: string[];
		};
	};
	created_at: typeof DataTypes.DATE;
	updated_at: typeof DataTypes.DATE;
}

interface UserModelOptions {
	sequelize: Sequelize;
	modelName: string;
	tableName: string;
	timestamps: boolean;
	underscored: boolean;
}

interface MockSequelize {
	define: jest.MockedFunction<
		() => {
			belongsTo: jest.MockedFunction<() => void>;
			hasMany: jest.MockedFunction<() => void>;
			associate: jest.MockedFunction<() => void>;
		}
	>;
}

// Mock for Sequelize
const mockSequelize: MockSequelize = {
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
				.mockImplementation(() => User as ModelStatic<User>);

			// Call initialize on User model
			User.initialize(mockSequelize as unknown as Sequelize);

			// Verify init was called
			expect(initSpy).toHaveBeenCalled();

			// Get the attributes passed to init
			const { calls } = initSpy.mock;
			expect(calls.length).toBeGreaterThan(0);

			const attributes = calls[0]?.[0] as unknown as UserAttributes;
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
				.mockImplementation(() => User as ModelStatic<User>);

			// Call initialize on User model
			User.initialize(mockSequelize as unknown as Sequelize);

			// Verify init was called
			expect(initSpy).toHaveBeenCalled();

			const { calls } = initSpy.mock;
			expect(calls.length).toBeGreaterThan(0);

			// Get the options passed to init
			const options = calls[0]?.[1] as UserModelOptions;
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
		let attributes: UserAttributes;

		beforeEach(() => {
			// Spy on init method to capture attributes
			const initSpy = jest
				.spyOn(User, 'init')
				.mockImplementation(() => User as ModelStatic<User>);
			User.initialize(mockSequelize as unknown as Sequelize);

			const { calls } = initSpy.mock;
			if (calls.length > 0) {
				attributes = calls[0]?.[0] as unknown as UserAttributes;
			}

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
