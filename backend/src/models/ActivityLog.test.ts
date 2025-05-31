import { DataTypes } from 'sequelize';
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

// Create a safe spy function that won't actually call the original
const createSafeSpyOn = (obj: any, method: string) => {
	const originalMethod = obj[method];
	jest.spyOn(obj, method).mockImplementation((...args) => {
		// For testing purposes only, don't actually call the real method
		return mockAssociation as any;
	});
	return () => {
		// Function to restore the original method if needed
		obj[method] = originalMethod;
	};
};

// Mock association returns
const mockAssociation = {
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
			ActivityLog.initialize(mockSequelize as any);

			// Verify init was called
			expect(initSpy).toHaveBeenCalled();

			// Get the attributes passed to init
			const calls = initSpy.mock.calls;
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
			ActivityLog.initialize(mockSequelize as any);

			// Verify init was called
			expect(initSpy).toHaveBeenCalled();

			const calls = initSpy.mock.calls;
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
			ActivityLog.initialize(mockSequelize as any);

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
		let attributes: any;

		beforeEach(() => {
			// Create a new spy that captures calls but doesn't run real implementation
			const initSpy = jest.spyOn(ActivityLog, 'init');
			ActivityLog.initialize(mockSequelize as any);

			const calls = initSpy.mock.calls;
			expect(calls.length).toBeGreaterThan(0);

			attributes = calls[0]?.[0];
			expect(attributes).toBeDefined();
		});

		it('should define log_id field correctly', () => {
			expect(attributes.log_id.type).toBe(DataTypes.UUID);
			expect(attributes.log_id.defaultValue).toBe(DataTypes.UUIDV4);
			expect(attributes.log_id.primaryKey).toBe(true);
		});

		it('should define user_id field with foreign key reference', () => {
			expect(attributes.user_id.type).toBe(DataTypes.UUID);
			expect(attributes.user_id.allowNull).toBe(false);
			expect(attributes.user_id.references).toBeDefined();
			expect(attributes.user_id.references.model).toBe('users');
			expect(attributes.user_id.references.key).toBe('user_id');
		});

		it('should define action field correctly', () => {
			expect(attributes.action.type).toBe(DataTypes.STRING);
			expect(attributes.action.allowNull).toBe(false);
		});

		it('should define context field with default value', () => {
			expect(attributes.context.type).toBe(DataTypes.STRING);
			expect(attributes.context.allowNull).toBe(false);
			expect(attributes.context.defaultValue).toBe('system');
		});

		it('should define metadata field as JSONB and nullable', () => {
			expect(attributes.metadata.type).toBe(DataTypes.JSONB);
			expect(attributes.metadata.allowNull).toBe(true);
		});

		it('should define ip_address field as nullable', () => {
			expect(attributes.ip_address.type).toBe(DataTypes.STRING);
			expect(attributes.ip_address.allowNull).toBe(true);
		});

		it('should define user_agent field as nullable TEXT', () => {
			expect(attributes.user_agent.type).toBe(DataTypes.TEXT);
			expect(attributes.user_agent.allowNull).toBe(true);
		});

		it('should define created_at field correctly', () => {
			expect(attributes.created_at.type).toBe(DataTypes.DATE);
			expect(attributes.created_at.defaultValue).toBe(DataTypes.NOW);
		});
	});
});
