import { DataTypes, type ModelStatic, type Sequelize } from 'sequelize';
import AuditLog from './AuditLog';

// Define proper types for mocked Sequelize
interface MockSequelizeModel {
	belongsTo: jest.MockedFunction<() => void>;
	hasMany: jest.MockedFunction<() => void>;
	associate: jest.MockedFunction<() => void>;
}

interface MockSequelize {
	define: jest.MockedFunction<() => MockSequelizeModel>;
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

// Define types for model attributes used in tests
interface TestModelAttributes {
	log_id: {
		type: typeof DataTypes.UUID;
		defaultValue: typeof DataTypes.UUIDV4;
		primaryKey: boolean;
	};
	level: {
		type: DataTypes.StringDataType;
		allowNull: boolean;
		validate: {
			isIn: string[][];
		};
	};
	message: {
		type: DataTypes.StringDataType;
		allowNull: boolean;
	};
	context: {
		type: typeof DataTypes.JSONB;
		allowNull: boolean;
	};
	source: {
		type: DataTypes.StringDataType;
		allowNull: boolean;
	};
	created_at: {
		type: typeof DataTypes.DATE;
		defaultValue: typeof DataTypes.NOW;
	};
}

describe('AuditLog Model', () => {
	beforeEach(() => {
		// Reset mocks before each test
		jest.clearAllMocks();
	});

	describe('Model initialization', () => {
		it('should initialize with correct attributes', () => {
			// Spy on init method
			const initSpy = jest
				.spyOn(AuditLog, 'init')
				.mockImplementation(() => AuditLog as ModelStatic<AuditLog>);

			// Call initialize on AuditLog model
			AuditLog.initialize(mockSequelize as unknown as Sequelize);

			// Verify init was called
			expect(initSpy).toHaveBeenCalled();

			// Get the attributes passed to init
			const { calls } = initSpy.mock;
			expect(calls.length).toBeGreaterThan(0);

			const firstCall = calls[0];
			expect(firstCall).toBeDefined();
			expect(firstCall![0]).toBeDefined();

			const attributes = firstCall![0] as unknown as TestModelAttributes;

			// Verify all required fields are defined
			expect(attributes).toHaveProperty('log_id');
			expect(attributes).toHaveProperty('level');
			expect(attributes).toHaveProperty('message');
			expect(attributes).toHaveProperty('context');
			expect(attributes).toHaveProperty('source');
			expect(attributes).toHaveProperty('created_at');

			// Restore the original implementation
			initSpy.mockRestore();
		});

		it('should set correct options', () => {
			// Spy on init method
			const initSpy = jest
				.spyOn(AuditLog, 'init')
				.mockImplementation(() => AuditLog as ModelStatic<AuditLog>);

			// Call initialize on AuditLog model
			AuditLog.initialize(mockSequelize as unknown as Sequelize);

			// Verify init was called
			expect(initSpy).toHaveBeenCalled();

			const { calls } = initSpy.mock;
			expect(calls.length).toBeGreaterThan(0);

			// Get the options passed to init
			const firstCall = calls[0];
			expect(firstCall).toBeDefined();
			expect(firstCall![1]).toBeDefined();

			const options = firstCall![1];

			// Check model options
			expect(options).toHaveProperty('sequelize', mockSequelize);
			expect(options).toHaveProperty('tableName', 'audit_logs');
			expect(options).toHaveProperty('timestamps', false); // No timestamps for this model
			expect(options).toHaveProperty('underscored', true);

			// Restore the original implementation
			initSpy.mockRestore();
		});
	});

	describe('Field definitions', () => {
		let attributes: TestModelAttributes;

		const getAttributes = (): TestModelAttributes => {
			// Spy on init method to capture attributes
			const initSpy = jest
				.spyOn(AuditLog, 'init')
				.mockImplementation(() => AuditLog as ModelStatic<AuditLog>);
			AuditLog.initialize(mockSequelize as unknown as Sequelize);

			const { calls } = initSpy.mock;
			const firstCall = calls[0];
			const result = firstCall![0] as unknown as TestModelAttributes;

			initSpy.mockRestore();
			return result;
		};

		beforeEach(() => {
			attributes = getAttributes();
		});

		it('should define log_id field correctly', () => {
			expect(attributes.log_id.type).toBe(DataTypes.UUID);
			expect(attributes.log_id.defaultValue).toBe(DataTypes.UUIDV4);
			expect(attributes.log_id.primaryKey).toBe(true);
		});

		it('should define level field with validation', () => {
			const levelType = attributes.level.type;
			expect(String(levelType).indexOf('VARCHAR')).not.toBe(-1);
			expect(levelType.options?.length).toBe(10); // VARCHAR(10)
			expect(attributes.level.allowNull).toBe(false);
			expect(attributes.level.validate).toBeDefined();
			expect(attributes.level.validate.isIn).toEqual([
				['info', 'warn', 'error', 'debug'],
			]);
		});

		it('should define message field correctly', () => {
			const messageType = attributes.message.type;
			expect(String(messageType).indexOf('VARCHAR')).not.toBe(-1);
			expect(messageType.options?.length).toBe(255); // VARCHAR(255)
			expect(attributes.message.allowNull).toBe(false);
		});

		it('should define context field as JSONB', () => {
			expect(attributes.context.type).toBe(DataTypes.JSONB);
			expect(attributes.context.allowNull).toBe(true);
		});

		it('should define source field correctly', () => {
			const sourceType = attributes.source.type;
			expect(String(sourceType).indexOf('VARCHAR')).not.toBe(-1);
			expect(sourceType.options?.length).toBe(100); // VARCHAR(100)
			expect(attributes.source.allowNull).toBe(false);
		});

		it('should define created_at field correctly', () => {
			expect(attributes.created_at.type).toBe(DataTypes.DATE);
			expect(attributes.created_at.defaultValue).toBe(DataTypes.NOW);
		});
	});
});
