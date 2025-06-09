import { DataTypes, type Sequelize } from 'sequelize';
import ActivityLog from './ActivityLog';
import User from './User';

// Mock for Sequelize
const mockSequelize = {
	define: jest.fn().mockReturnValue({
		belongsTo: jest.fn(),
		hasMany: jest.fn(),
		associate: jest.fn(),
	}),
};

// Mock association returns with proper typing
interface MockAssociation {
	sourceKey: string;
	foreignKey: string;
	as: string;
}

// Create a safe spy function that won't actually call the original

const createSafeSpyOn = (obj: any, method: string) => {
	const originalMethod = obj[method] as unknown;

	jest.spyOn(obj, method).mockImplementation(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		(..._args) =>
			// For testing purposes only, don't actually call the real method
			mockAssociation
	);
	return () => {
		// Function to restore the original method if needed

		obj[method] = originalMethod as (typeof obj)[typeof method];
	};
};

// Mock association returns
const mockAssociation: MockAssociation = {
	sourceKey: '',
	foreignKey: '',
	as: '',
};

// Mock Sequelize.fn
jest.mock('sequelize', () => {
	const actualSequelize = jest.requireActual('sequelize');

	return {
		...actualSequelize,
		Sequelize: jest.fn().mockImplementation(() => mockSequelize),
	};
});

describe('ActivityLog Model', () => {
	// Create restore functions
	let restoreBelongsTo: () => void;
	let restoreHasMany: () => void;
	let restoreInit: () => void;

	beforeEach(() => {
		// Reset mocks before each test
		jest.clearAllMocks();

		// Mock the association methods to return appropriate values but prevent actual calls
		restoreBelongsTo = createSafeSpyOn(ActivityLog, 'belongsTo');
		restoreHasMany = createSafeSpyOn(User, 'hasMany');

		// Also mock init to prevent actual initialization
		restoreInit = createSafeSpyOn(ActivityLog, 'init');
	});

	afterEach(() => {
		// Restore original methods
		restoreBelongsTo();
		restoreHasMany();
		restoreInit();
	});

	describe('Model initialization', () => {
		it('should initialize with correct attributes', () => {
			// Create a new spy that captures calls but doesn't run real implementation
			const initSpy = jest.spyOn(ActivityLog, 'init');

			// Call initialize on ActivityLog model
			ActivityLog.initialize(mockSequelize as unknown as Sequelize);

			// Verify init was called
			expect(initSpy).toHaveBeenCalled();

			// Get the attributes passed to init
			const { calls } = initSpy.mock;
			expect(calls.length).toBeGreaterThan(0);

			const attributes = calls[0]?.[0];
			expect(attributes).toBeDefined();

			// Verify all required fields are defined
			expect(attributes).toHaveProperty('log_id');
			expect(attributes).toHaveProperty('user_id');
			expect(attributes).toHaveProperty('action');
			expect(attributes).toHaveProperty('context');
			expect(attributes).toHaveProperty('metadata');
			expect(attributes).toHaveProperty('ip_address');
			expect(attributes).toHaveProperty('user_agent');
			expect(attributes).toHaveProperty('created_at');
		});

		it('should set correct options', () => {
			// Create a new spy that captures calls but doesn't run real implementation
			const initSpy = jest.spyOn(ActivityLog, 'init');

			// Call initialize on ActivityLog model
			ActivityLog.initialize(mockSequelize as unknown as Sequelize);

			// Verify init was called
			expect(initSpy).toHaveBeenCalled();

			const { calls } = initSpy.mock;
			expect(calls.length).toBeGreaterThan(0);

			// Get the options passed to init
			const options = calls[0]?.[1];
			expect(options).toBeDefined();

			// Check model options
			expect(options).toHaveProperty('sequelize', mockSequelize);
			expect(options).toHaveProperty('tableName', 'activity_log');
			expect(options).toHaveProperty('timestamps', false); // No timestamps for this model
			expect(options).toHaveProperty('underscored', true);
		});

		it('should set up associations correctly', () => {
			// Our mocks are already set up in beforeEach
			const belongsToSpy = jest.spyOn(ActivityLog, 'belongsTo');
			const hasManyspy = jest.spyOn(User, 'hasMany');

			// Call initialize - with our mocks this won't actually run init()
			ActivityLog.initialize(mockSequelize as unknown as Sequelize);

			// Check if belongsTo was called with User model
			expect(belongsToSpy).toHaveBeenCalledWith(User, {
				foreignKey: 'user_id',
				as: 'user',
			});

			// Check if User.hasMany was called with ActivityLog
			expect(hasManyspy).toHaveBeenCalledWith(ActivityLog, {
				foreignKey: 'user_id',
				as: 'activities',
			});
		});
	});

	describe('Field definitions', () => {
		let attributes: Record<string, unknown>;

		beforeEach(() => {
			// Create a new spy that captures calls but doesn't run real implementation
			const initSpy = jest.spyOn(ActivityLog, 'init');
			ActivityLog.initialize(mockSequelize as unknown as Sequelize);

			const { calls } = initSpy.mock;
			attributes = calls[0]?.[0] as Record<string, unknown>;
		});

		it('should define log_id field correctly', () => {
			expect(attributes).toBeDefined();
			const logId = attributes.log_id as Record<string, unknown>;
			expect(logId.type).toBe(DataTypes.UUID);
			expect(logId.defaultValue).toBe(DataTypes.UUIDV4);
			expect(logId.primaryKey).toBe(true);
		});

		it('should define user_id field with foreign key reference', () => {
			expect(attributes).toBeDefined();
			const userId = attributes.user_id as Record<string, unknown>;
			expect(userId.type).toBe(DataTypes.UUID);
			expect(userId.allowNull).toBe(false);
			expect(userId.references).toBeDefined();
			const references = userId.references as Record<string, unknown>;
			expect(references.model).toBe('users');
			expect(references.key).toBe('user_id');
		});

		it('should define action field correctly', () => {
			expect(attributes).toBeDefined();
			const action = attributes.action as Record<string, unknown>;
			expect(action.type).toBe(DataTypes.STRING);
			expect(action.allowNull).toBe(false);
		});

		it('should define context field with default value', () => {
			expect(attributes).toBeDefined();
			const context = attributes.context as Record<string, unknown>;
			expect(context.type).toBe(DataTypes.STRING);
			expect(context.allowNull).toBe(false);
			expect(context.defaultValue).toBe('system');
		});

		it('should define metadata field as JSONB and nullable', () => {
			expect(attributes).toBeDefined();
			const metadata = attributes.metadata as Record<string, unknown>;
			expect(metadata.type).toBe(DataTypes.JSONB);
			expect(metadata.allowNull).toBe(true);
		});

		it('should define ip_address field as nullable', () => {
			expect(attributes).toBeDefined();
			const ipAddress = attributes.ip_address as Record<string, unknown>;
			expect(ipAddress.type).toBe(DataTypes.STRING);
			expect(ipAddress.allowNull).toBe(true);
		});

		it('should define user_agent field as nullable TEXT', () => {
			expect(attributes).toBeDefined();
			const userAgent = attributes.user_agent as Record<string, unknown>;
			expect(userAgent.type).toBe(DataTypes.TEXT);
			expect(userAgent.allowNull).toBe(true);
		});

		it('should define created_at field correctly', () => {
			expect(attributes).toBeDefined();
			const createdAt = attributes.created_at as Record<string, unknown>;
			expect(createdAt.type).toBe(DataTypes.DATE);
			expect(createdAt.defaultValue).toBe(DataTypes.NOW);
		});
	});
});
