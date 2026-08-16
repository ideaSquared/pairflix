import { DataTypes, type Sequelize } from 'sequelize';
import ContentReport from './ContentReport';

// Define interfaces for type safety
interface ContentReportAttributes {
	id: {
		type: typeof DataTypes.UUID;
		defaultValue: typeof DataTypes.UUIDV4;
		primaryKey: boolean;
	};
	content_id: {
		type: typeof DataTypes.UUID;
		allowNull: boolean;
		references: {
			model: string;
			key: string;
		};
	};
	user_id: {
		type: typeof DataTypes.UUID;
		allowNull: boolean;
		references: {
			model: string;
			key: string;
		};
	};
	reason: {
		type: typeof DataTypes.STRING;
		allowNull: boolean;
	};
	details: {
		type: typeof DataTypes.TEXT;
		allowNull: boolean;
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

interface ContentReportModelOptions {
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
		Sequelize: jest.fn().mockImplementation(() => ({
			define: jest.fn().mockReturnValue({
				belongsTo: jest.fn(),
				hasMany: jest.fn(),
				associate: jest.fn(),
			}),
		})),
	};
});

describe('ContentReport Model', () => {
	beforeEach(() => {
		// Reset mocks before each test
		jest.clearAllMocks();
	});

	describe('Model initialization', () => {
		it('should initialize with correct attributes', () => {
			// Spy on init method
			const initSpy = jest
				.spyOn(ContentReport, 'init')
				.mockImplementation(() => ContentReport);

			// Call initialize on ContentReport model
			ContentReport.initialize(mockSequelize as unknown as Sequelize);

			// Verify init was called
			expect(initSpy).toHaveBeenCalled();

			// Get the attributes passed to init
			const { calls } = initSpy.mock;
			expect(calls.length).toBeGreaterThan(0);

			const attributes = calls[0]?.[0] as unknown as ContentReportAttributes;
			expect(attributes).toBeDefined();

			// Verify all required fields are defined
			expect(attributes).toHaveProperty('id');
			expect(attributes).toHaveProperty('content_id');
			expect(attributes).toHaveProperty('user_id');
			expect(attributes).toHaveProperty('reason');
			expect(attributes).toHaveProperty('details');
			expect(attributes).toHaveProperty('status');
			expect(attributes).toHaveProperty('created_at');
			expect(attributes).toHaveProperty('updated_at');

			// Restore the original implementation
			initSpy.mockRestore();
		});

		it('should set correct options', () => {
			// Spy on init method
			const initSpy = jest
				.spyOn(ContentReport, 'init')
				.mockImplementation(() => ContentReport);

			// Call initialize on ContentReport model
			ContentReport.initialize(mockSequelize as unknown as Sequelize);

			// Verify init was called
			expect(initSpy).toHaveBeenCalled();

			const { calls } = initSpy.mock;
			expect(calls.length).toBeGreaterThan(0);

			// Get the options passed to init
			const options = calls[0]?.[1] as ContentReportModelOptions;
			expect(options).toBeDefined();

			// Check model options
			expect(options).toHaveProperty('sequelize', mockSequelize);
			expect(options).toHaveProperty('modelName', 'ContentReport');
			expect(options).toHaveProperty('tableName', 'content_reports');
			expect(options).toHaveProperty('timestamps', true);
			expect(options).toHaveProperty('createdAt', 'created_at');
			expect(options).toHaveProperty('updatedAt', 'updated_at');

			// Restore the original implementation
			initSpy.mockRestore();
		});
	});

	describe('Field definitions', () => {
		let attributes: ContentReportAttributes;

		beforeEach(() => {
			// Spy on init method to capture attributes
			const initSpy = jest
				.spyOn(ContentReport, 'init')
				.mockImplementation(() => ContentReport);
			ContentReport.initialize(mockSequelize as unknown as Sequelize);

			const { calls } = initSpy.mock;
			if (calls.length > 0) {
				attributes = calls[0]?.[0] as unknown as ContentReportAttributes;
			}

			initSpy.mockRestore();
		});

		it('should define id field correctly', () => {
			expect(attributes.id.type).toBe(DataTypes.UUID);
			expect(attributes.id.defaultValue).toBe(DataTypes.UUIDV4);
			expect(attributes.id.primaryKey).toBe(true);
		});

		it('should define content_id field with foreign key reference', () => {
			expect(attributes.content_id.type).toBe(DataTypes.UUID);
			expect(attributes.content_id.allowNull).toBe(false);
			expect(attributes.content_id.references).toBeDefined();
			expect(attributes.content_id.references.key).toBe('id');
		});

		it('should define user_id field with foreign key reference', () => {
			expect(attributes.user_id.type).toBe(DataTypes.UUID);
			expect(attributes.user_id.allowNull).toBe(false);
			expect(attributes.user_id.references).toBeDefined();
			expect(attributes.user_id.references.key).toBe('user_id');
		});

		it('should define reason field correctly', () => {
			expect(attributes.reason.type).toBe(DataTypes.STRING);
			expect(attributes.reason.allowNull).toBe(false);
		});

		it('should define details field as optional', () => {
			expect(attributes.details.type).toBe(DataTypes.TEXT);
			expect(attributes.details.allowNull).toBe(true);
		});

		it('should define status as ENUM with correct values and default', () => {
			// Check that it's an ENUM type
			expect(attributes.status.type).toBeDefined();
			expect(attributes.status.allowNull).toBe(false);
			expect(attributes.status.defaultValue).toBe('pending');
			// Check if status values include expected ENUM values
			const statusType = attributes.status.type as { values?: string[] };
			expect(Array.isArray(statusType.values)).toBe(true);
			expect(statusType.values).toContain('pending');
		});

		it('should define timestamp fields correctly', () => {
			expect(attributes.created_at.type).toBe(DataTypes.DATE);
			expect(attributes.created_at.defaultValue).toBe(DataTypes.NOW);

			expect(attributes.updated_at.type).toBe(DataTypes.DATE);
			expect(attributes.updated_at.defaultValue).toBe(DataTypes.NOW);
		});
	});
});
