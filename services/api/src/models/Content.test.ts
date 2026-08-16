import { DataTypes, type Sequelize } from 'sequelize';
import Content from './Content';

// Define proper TypeScript interfaces for Content model
interface ContentAttributes {
	id: {
		type: typeof DataTypes.UUID;
		defaultValue: typeof DataTypes.UUIDV4;
		primaryKey: boolean;
	};
	title: {
		type: typeof DataTypes.STRING;
		allowNull: boolean;
	};
	type: {
		type: typeof DataTypes.ENUM;
		allowNull: boolean;
	};
	status: {
		type: typeof DataTypes.ENUM;
		allowNull: boolean;
		defaultValue: string;
	};
	tmdb_id: {
		type: typeof DataTypes.INTEGER;
		allowNull: boolean;
	};
	reported_count: {
		type: typeof DataTypes.INTEGER;
		allowNull: boolean;
		defaultValue: number;
	};
	removal_reason: {
		type: typeof DataTypes.TEXT;
		allowNull: boolean;
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

interface ContentModelOptions {
	sequelize: MockSequelizeInstance;
	modelName: string;
	tableName: string;
	timestamps: boolean;
	createdAt: string;
	updatedAt: string;
}

interface MockModel {
	belongsTo: jest.MockedFunction<() => void>;
	hasMany: jest.MockedFunction<() => void>;
	associate: jest.MockedFunction<() => void>;
}

interface MockSequelizeInstance {
	define: jest.MockedFunction<() => MockModel>;
}

// Mock for Sequelize with proper typing
const mockSequelize: MockSequelizeInstance = {
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

describe('Content Model', () => {
	beforeEach(() => {
		// Reset mocks before each test
		jest.clearAllMocks();
	});

	describe('Model initialization', () => {
		it('should initialize with correct attributes', () => {
			// Spy on init method
			const initSpy = jest
				.spyOn(Content, 'init')
				.mockImplementation(() => Content);

			// Call initialize on Content model
			Content.initialize(mockSequelize as unknown as Sequelize);

			// Verify init was called
			expect(initSpy).toHaveBeenCalled();

			// Get the attributes passed to init
			const { calls } = initSpy.mock;
			expect(calls.length).toBeGreaterThan(0);

			const attributes = calls[0]?.[0] as unknown as ContentAttributes;
			expect(attributes).toBeDefined();

			// Verify all required fields are defined
			expect(attributes).toHaveProperty('id');
			expect(attributes).toHaveProperty('title');
			expect(attributes).toHaveProperty('type');
			expect(attributes).toHaveProperty('status');
			expect(attributes).toHaveProperty('tmdb_id');
			expect(attributes).toHaveProperty('reported_count');
			expect(attributes).toHaveProperty('removal_reason');
			expect(attributes).toHaveProperty('created_at');
			expect(attributes).toHaveProperty('updated_at');

			// Restore the original implementation
			initSpy.mockRestore();
		});

		it('should set correct options', () => {
			// Spy on init method
			const initSpy = jest
				.spyOn(Content, 'init')
				.mockImplementation(() => Content);

			// Call initialize on Content model
			Content.initialize(mockSequelize as unknown as Sequelize);

			// Verify init was called
			expect(initSpy).toHaveBeenCalled();

			const { calls } = initSpy.mock;
			expect(calls.length).toBeGreaterThan(0);

			// Get the options passed to init
			const options = calls[0]?.[1] as unknown as ContentModelOptions;
			expect(options).toBeDefined();

			// Check model options
			expect(options).toHaveProperty('sequelize', mockSequelize);
			expect(options).toHaveProperty('modelName', 'Content');
			expect(options).toHaveProperty('tableName', 'content');
			expect(options).toHaveProperty('timestamps', true);
			expect(options).toHaveProperty('createdAt', 'created_at');
			expect(options).toHaveProperty('updatedAt', 'updated_at');

			// Restore the original implementation
			initSpy.mockRestore();
		});
	});

	describe('Field definitions', () => {
		let attributes: ContentAttributes;

		beforeEach(() => {
			// Spy on init method to capture attributes
			const initSpy = jest
				.spyOn(Content, 'init')
				.mockImplementation(() => Content);
			Content.initialize(mockSequelize as unknown as Sequelize);

			const { calls } = initSpy.mock;
			if (calls.length > 0) {
				attributes = calls[0]?.[0] as unknown as ContentAttributes;
			}

			initSpy.mockRestore();
		});

		it('should define id field correctly', () => {
			expect(attributes.id.type).toBe(DataTypes.UUID);
			expect(attributes.id.defaultValue).toBe(DataTypes.UUIDV4);
			expect(attributes.id.primaryKey).toBe(true);
		});

		it('should define title field correctly', () => {
			expect(attributes.title.type).toBe(DataTypes.STRING);
			expect(attributes.title.allowNull).toBe(false);
		});

		it('should define type as ENUM with correct values', () => {
			// Check that it's an ENUM type
			expect(attributes.type.type).toBeDefined();
			expect(attributes.type.type.toString().includes('ENUM')).toBe(true);

			// Check for type values in the type structure
			const typeStr = JSON.stringify(attributes.type.type);
			expect(typeStr).toContain('movie');
			expect(typeStr).toContain('show');
			expect(typeStr).toContain('episode');

			expect(attributes.type.allowNull).toBe(false);
		});

		it('should define status as ENUM with correct values and default', () => {
			// Check that it's an ENUM type
			expect(attributes.status.type).toBeDefined();
			expect(attributes.status.type.toString().includes('ENUM')).toBe(true);

			// Check for status values in the type structure
			const typeStr = JSON.stringify(attributes.status.type);
			expect(typeStr).toContain('active');
			expect(typeStr).toContain('pending');
			expect(typeStr).toContain('flagged');
			expect(typeStr).toContain('removed');

			expect(attributes.status.allowNull).toBe(false);
			expect(attributes.status.defaultValue).toBe('pending');
		});

		it('should define tmdb_id field correctly', () => {
			expect(attributes.tmdb_id.type).toBe(DataTypes.INTEGER);
			expect(attributes.tmdb_id.allowNull).toBe(false);
		});

		it('should define reported_count field with default value', () => {
			expect(attributes.reported_count.type).toBe(DataTypes.INTEGER);
			expect(attributes.reported_count.allowNull).toBe(false);
			expect(attributes.reported_count.defaultValue).toBe(0);
		});

		it('should define removal_reason field as optional', () => {
			expect(attributes.removal_reason.type).toBe(DataTypes.TEXT);
			expect(attributes.removal_reason.allowNull).toBe(true);
		});

		it('should define created_at and updated_at fields correctly', () => {
			expect(attributes.created_at.type).toBe(DataTypes.DATE);
			expect(attributes.created_at.defaultValue).toBe(DataTypes.NOW);

			expect(attributes.updated_at.type).toBe(DataTypes.DATE);
			expect(attributes.updated_at.defaultValue).toBe(DataTypes.NOW);
		});
	});
});
