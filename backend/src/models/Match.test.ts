import { DataTypes } from 'sequelize';
import Match from './Match';

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

describe('Match Model', () => {
	beforeEach(() => {
		// Reset mocks before each test
		jest.clearAllMocks();
	});

	describe('Model initialization', () => {
		it('should initialize with correct attributes', () => {
			// Spy on init method
			const initSpy = jest
				.spyOn(Match, 'init')
				.mockImplementation(() => Match as any);

			// Call initialize on Match model
			Match.initialize(mockSequelize as any);

			// Verify init was called
			expect(initSpy).toHaveBeenCalled();

			// Get the attributes passed to init
			const calls = initSpy.mock.calls;
			expect(calls.length).toBeGreaterThan(0);

			const attributes = calls[0]?.[0];
			expect(attributes).toBeDefined();

			// Verify all required fields are defined
			expect(attributes).toHaveProperty('match_id');
			expect(attributes).toHaveProperty('user1_id');
			expect(attributes).toHaveProperty('user2_id');
			expect(attributes).toHaveProperty('entry_id');
			expect(attributes).toHaveProperty('status');
			expect(attributes).toHaveProperty('created_at');
			expect(attributes).toHaveProperty('updated_at');

			// Restore the original implementation
			initSpy.mockRestore();
		});

		it('should set correct options', () => {
			// Spy on init method
			const initSpy = jest
				.spyOn(Match, 'init')
				.mockImplementation(() => Match as any);

			// Call initialize on Match model
			Match.initialize(mockSequelize as any);

			// Verify init was called
			expect(initSpy).toHaveBeenCalled();

			const calls = initSpy.mock.calls;
			expect(calls.length).toBeGreaterThan(0);

			// Get the options passed to init
			const options = calls[0]?.[1];
			expect(options).toBeDefined();

			// Check model options
			expect(options).toHaveProperty('sequelize', mockSequelize);
			expect(options).toHaveProperty('modelName', 'Match');
			expect(options).toHaveProperty('tableName', 'matches');
			expect(options).toHaveProperty('timestamps', true);
			expect(options).toHaveProperty('createdAt', 'created_at');
			expect(options).toHaveProperty('updatedAt', 'updated_at');

			// Restore the original implementation
			initSpy.mockRestore();
		});
	});

	describe('Field definitions', () => {
		let attributes: any;

		beforeEach(() => {
			// Spy on init method to capture attributes
			const initSpy = jest
				.spyOn(Match, 'init')
				.mockImplementation(() => Match as any);
			Match.initialize(mockSequelize as any);

			const calls = initSpy.mock.calls;
			expect(calls.length).toBeGreaterThan(0);

			attributes = calls[0]?.[0];
			expect(attributes).toBeDefined();

			initSpy.mockRestore();
		});

		it('should define match_id field correctly', () => {
			expect(attributes.match_id.type).toBe(DataTypes.UUID);
			expect(attributes.match_id.defaultValue).toBe(DataTypes.UUIDV4);
			expect(attributes.match_id.primaryKey).toBe(true);
		});

		it('should define user1_id field with foreign key reference', () => {
			expect(attributes.user1_id.type).toBe(DataTypes.UUID);
			expect(attributes.user1_id.allowNull).toBe(false);
			expect(attributes.user1_id.references).toBeDefined();
			expect(attributes.user1_id.references.key).toBe('user_id');
		});

		it('should define user2_id field with foreign key reference', () => {
			expect(attributes.user2_id.type).toBe(DataTypes.UUID);
			expect(attributes.user2_id.allowNull).toBe(false);
			expect(attributes.user2_id.references).toBeDefined();
			expect(attributes.user2_id.references.key).toBe('user_id');
		});

		it('should define entry_id field as nullable with reference', () => {
			expect(attributes.entry_id.type).toBe(DataTypes.UUID);
			expect(attributes.entry_id.allowNull).toBe(true);
			expect(attributes.entry_id.references).toBeDefined();
			expect(attributes.entry_id.references.key).toBe('entry_id');
		});

		it('should define status as ENUM with correct values and default', () => {
			// Check that it's an ENUM type
			expect(attributes.status.type).toBeDefined();
			expect(attributes.status.type.toString().includes('ENUM')).toBe(true);

			// Check for status values in the type structure
			const typeStr = JSON.stringify(attributes.status.type);
			expect(typeStr).toContain('pending');
			expect(typeStr).toContain('accepted');
			expect(typeStr).toContain('rejected');

			expect(attributes.status.allowNull).toBe(false);
			expect(attributes.status.defaultValue).toBe('pending');
		});

		it('should define created_at and updated_at fields correctly', () => {
			expect(attributes.created_at.type).toBe(DataTypes.DATE);
			expect(attributes.created_at.defaultValue).toBe(DataTypes.NOW);

			expect(attributes.updated_at.type).toBe(DataTypes.DATE);
			expect(attributes.updated_at.defaultValue).toBe(DataTypes.NOW);
		});
	});
});
