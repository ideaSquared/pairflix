import { DataTypes } from 'sequelize';
import AuditLog from './AuditLog';

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
				.mockImplementation(() => AuditLog as any);

			// Call initialize on AuditLog model
			AuditLog.initialize(mockSequelize as any);

			// Verify init was called
			expect(initSpy).toHaveBeenCalled();

			// Get the attributes passed to init
			const calls = initSpy.mock.calls;
			expect(calls.length).toBeGreaterThan(0);

			const attributes = calls[0]?.[0];
			expect(attributes).toBeDefined();

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
				.mockImplementation(() => AuditLog as any);

			// Call initialize on AuditLog model
			AuditLog.initialize(mockSequelize as any);

			// Verify init was called
			expect(initSpy).toHaveBeenCalled();

			const calls = initSpy.mock.calls;
			expect(calls.length).toBeGreaterThan(0);

			// Get the options passed to init
			const options = calls[0]?.[1];
			expect(options).toBeDefined();

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
		let attributes: any;

		beforeEach(() => {
			// Spy on init method to capture attributes
			const initSpy = jest
				.spyOn(AuditLog, 'init')
				.mockImplementation(() => AuditLog as any);
			AuditLog.initialize(mockSequelize as any);

			const calls = initSpy.mock.calls;
			expect(calls.length).toBeGreaterThan(0);

			attributes = calls[0]?.[0];
			expect(attributes).toBeDefined();

			initSpy.mockRestore();
		});

		it('should define log_id field correctly', () => {
			expect(attributes.log_id.type).toBe(DataTypes.UUID);
			expect(attributes.log_id.defaultValue).toBe(DataTypes.UUIDV4);
			expect(attributes.log_id.primaryKey).toBe(true);
		});

		it('should define level field with validation', () => {
			expect(attributes.level.type.toString().indexOf('VARCHAR')).not.toBe(-1);
			expect(attributes.level.type.options.length).toBe(10); // VARCHAR(10)
			expect(attributes.level.allowNull).toBe(false);
			expect(attributes.level.validate).toBeDefined();
			expect(attributes.level.validate.isIn).toEqual([
				['info', 'warn', 'error', 'debug'],
			]);
		});

		it('should define message field correctly', () => {
			expect(attributes.message.type.toString().indexOf('VARCHAR')).not.toBe(
				-1
			);
			expect(attributes.message.type.options.length).toBe(255); // VARCHAR(255)
			expect(attributes.message.allowNull).toBe(false);
		});

		it('should define context field as JSONB', () => {
			expect(attributes.context.type).toBe(DataTypes.JSONB);
			expect(attributes.context.allowNull).toBe(true);
		});

		it('should define source field correctly', () => {
			expect(attributes.source.type.toString().indexOf('VARCHAR')).not.toBe(-1);
			expect(attributes.source.type.options.length).toBe(100); // VARCHAR(100)
			expect(attributes.source.allowNull).toBe(false);
		});

		it('should define created_at field correctly', () => {
			expect(attributes.created_at.type).toBe(DataTypes.DATE);
			expect(attributes.created_at.defaultValue).toBe(DataTypes.NOW);
		});
	});
});
