import { DataTypes, type ModelStatic, type Sequelize } from 'sequelize';
import Match from './Match';

// Define interfaces for type safety
interface MatchAttributes {
	match_id: {
		type: typeof DataTypes.UUID;
		defaultValue: typeof DataTypes.UUIDV4;
		primaryKey: boolean;
	};
	user1_id: {
		type: typeof DataTypes.UUID;
		allowNull: boolean;
		references: {
			model: unknown;
			key: string;
		};
	};
	user2_id: {
		type: typeof DataTypes.UUID;
		allowNull: boolean;
		references: {
			model: unknown;
			key: string;
		};
	};
	entry_id: {
		type: typeof DataTypes.UUID;
		allowNull: boolean;
		references: {
			model: unknown;
			key: string;
		};
	};
	status: {
		type: ReturnType<typeof DataTypes.ENUM>;
		allowNull: boolean;
		defaultValue: string;
	};
	created_at: {
		type: typeof DataTypes.DATE;
		defaultValue: typeof DataTypes.NOW;
	};
	updated_at: {
		type: typeof DataTypes.DATE;
		defaultValue: typeof DataTypes.NOW;
	};
}

interface MatchModelOptions {
	sequelize: Sequelize;
	modelName: string;
	tableName: string;
	timestamps: boolean;
	createdAt: string;
	updatedAt: string;
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
				.mockImplementation(() => Match as ModelStatic<Match>);

			// Call initialize on Match model
			Match.initialize(mockSequelize as unknown as Sequelize);

			// Verify init was called
			expect(initSpy).toHaveBeenCalled();

			// Get the attributes passed to init
			const { calls } = initSpy.mock;
			expect(calls.length).toBeGreaterThan(0);

			const attributes = calls[0]?.[0] as unknown as MatchAttributes;
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
				.mockImplementation(() => Match as ModelStatic<Match>);

			// Call initialize on Match model
			Match.initialize(mockSequelize as unknown as Sequelize);

			// Verify init was called
			expect(initSpy).toHaveBeenCalled();

			const { calls } = initSpy.mock;
			expect(calls.length).toBeGreaterThan(0);

			// Get the options passed to init
			const options = calls[0]?.[1] as MatchModelOptions;
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
		let attributes: MatchAttributes;

		beforeEach(() => {
			// Spy on init method to capture attributes
			const initSpy = jest
				.spyOn(Match, 'init')
				.mockImplementation(() => Match as ModelStatic<Match>);
			Match.initialize(mockSequelize as unknown as Sequelize);

			const { calls } = initSpy.mock;
			if (calls.length > 0) {
				attributes = calls[0]?.[0] as unknown as MatchAttributes;
			}

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
			const statusTypeStr = String(attributes.status.type);
			expect(
				statusTypeStr.includes('ENUM') ||
					Array.isArray(
						(attributes.status.type as { values?: string[] }).values
					)
			).toBe(true);

			// Check for status values in the type structure
			const statusType = attributes.status.type as { values?: string[] };
			expect(statusType.values).toBeDefined();
			expect(Array.isArray(statusType.values)).toBe(true);
			expect(statusType.values).toContain('pending');
			expect(statusType.values).toContain('accepted');
			expect(statusType.values).toContain('rejected');

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
