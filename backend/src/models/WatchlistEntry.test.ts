import { DataTypes, type ModelStatic, type Sequelize } from 'sequelize';
import WatchlistEntry from './WatchlistEntry';

// Define interfaces for type safety
interface WatchlistEntryAttributes {
	entry_id: {
		type: typeof DataTypes.UUID;
		defaultValue: typeof DataTypes.UUIDV4;
		primaryKey: boolean;
	};
	user_id: {
		type: typeof DataTypes.UUID;
		allowNull: boolean;
		references: {
			model: unknown;
			key: string;
		};
	};
	tmdb_id: {
		type: typeof DataTypes.INTEGER;
		allowNull: boolean;
	};
	media_type: {
		type: {
			toString(): string;
		};
		allowNull: boolean;
	};
	status: {
		type: {
			toString(): string;
		};
		allowNull: boolean;
		defaultValue: string;
	};
	rating: {
		type: typeof DataTypes.INTEGER;
		allowNull: boolean;
		validate: {
			min: number;
			max: number;
		};
	};
	notes: {
		type: typeof DataTypes.TEXT;
		allowNull: boolean;
	};
	tags: {
		type: {
			key: string;
		};
		allowNull: boolean;
		defaultValue: string[];
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

interface WatchlistEntryModelOptions {
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

describe('WatchlistEntry Model', () => {
	beforeEach(() => {
		// Reset mocks before each test
		jest.clearAllMocks();
	});

	describe('Model initialization', () => {
		it('should initialize with correct attributes', () => {
			// Spy on init method
			const initSpy = jest
				.spyOn(WatchlistEntry, 'init')
				.mockImplementation(
					() => WatchlistEntry as ModelStatic<WatchlistEntry>
				);

			// Call initialize on WatchlistEntry model
			WatchlistEntry.initialize(mockSequelize as unknown as Sequelize);

			// Verify init was called
			expect(initSpy).toHaveBeenCalled();

			// Get the attributes passed to init
			const { calls } = initSpy.mock;
			expect(calls.length).toBeGreaterThan(0);

			const attributes = calls[0]?.[0] as unknown as WatchlistEntryAttributes;
			expect(attributes).toBeDefined();

			// Verify all required fields are defined
			expect(attributes).toHaveProperty('entry_id');
			expect(attributes).toHaveProperty('user_id');
			expect(attributes).toHaveProperty('tmdb_id');
			expect(attributes).toHaveProperty('media_type');
			expect(attributes).toHaveProperty('status');
			expect(attributes).toHaveProperty('rating');
			expect(attributes).toHaveProperty('notes');
			expect(attributes).toHaveProperty('tags');
			expect(attributes).toHaveProperty('created_at');
			expect(attributes).toHaveProperty('updated_at');

			// Restore the original implementation
			initSpy.mockRestore();
		});

		it('should set correct options', () => {
			// Spy on init method
			const initSpy = jest
				.spyOn(WatchlistEntry, 'init')
				.mockImplementation(
					() => WatchlistEntry as ModelStatic<WatchlistEntry>
				);

			// Call initialize on WatchlistEntry model
			WatchlistEntry.initialize(mockSequelize as unknown as Sequelize);

			// Verify init was called
			expect(initSpy).toHaveBeenCalled();

			const { calls } = initSpy.mock;
			expect(calls.length).toBeGreaterThan(0);

			// Get the options passed to init
			const options = calls[0]?.[1] as WatchlistEntryModelOptions;
			expect(options).toBeDefined();

			// Check model options
			expect(options).toHaveProperty('sequelize', mockSequelize);
			expect(options).toHaveProperty('modelName', 'WatchlistEntry');
			expect(options).toHaveProperty('tableName', 'watchlist_entries');
			expect(options).toHaveProperty('timestamps', true);
			expect(options).toHaveProperty('createdAt', 'created_at');
			expect(options).toHaveProperty('updatedAt', 'updated_at');

			// Restore the original implementation
			initSpy.mockRestore();
		});
	});

	describe('Field definitions', () => {
		let attributes: WatchlistEntryAttributes;

		beforeEach(() => {
			// Spy on init method to capture attributes
			const initSpy = jest
				.spyOn(WatchlistEntry, 'init')
				.mockImplementation(
					() => WatchlistEntry as ModelStatic<WatchlistEntry>
				);
			WatchlistEntry.initialize(mockSequelize as unknown as Sequelize);

			const { calls } = initSpy.mock;
			if (calls.length > 0) {
				attributes = calls[0]?.[0] as unknown as WatchlistEntryAttributes;
			}

			initSpy.mockRestore();
		});

		it('should define entry_id field correctly', () => {
			expect(attributes.entry_id.type).toBe(DataTypes.UUID);
			expect(attributes.entry_id.defaultValue).toBe(DataTypes.UUIDV4);
			expect(attributes.entry_id.primaryKey).toBe(true);
		});

		it('should define user_id field with foreign key reference', () => {
			expect(attributes.user_id.type).toBe(DataTypes.UUID);
			expect(attributes.user_id.allowNull).toBe(false);
			expect(attributes.user_id.references).toBeDefined();
			expect(attributes.user_id.references.key).toBe('user_id');
		});

		it('should define tmdb_id field correctly', () => {
			expect(attributes.tmdb_id.type).toBe(DataTypes.INTEGER);
			expect(attributes.tmdb_id.allowNull).toBe(false);
		});

		it('should define media_type as ENUM with correct values', () => {
			// Check that it's an ENUM type (in any form)
			expect(attributes.media_type.type).toBeDefined();
			const mediaTypeStr = attributes.media_type.type.toString();
			expect(mediaTypeStr.includes('ENUM')).toBe(true);
			// Check for movie and tv values in the type structure
			const typeStr = JSON.stringify(attributes.media_type.type);
			expect(typeStr.includes('movie')).toBe(true);
			expect(typeStr.includes('tv')).toBe(true);
			expect(attributes.media_type.allowNull).toBe(false);
		});

		it('should define status field with correct default value', () => {
			// Check that it's an ENUM type (in any form)
			expect(attributes.status.type).toBeDefined();
			const statusTypeStr = attributes.status.type.toString();
			expect(statusTypeStr.includes('ENUM')).toBe(true);
			expect(attributes.status.allowNull).toBe(false);
			expect(attributes.status.defaultValue).toBe('to_watch');
			// Check for status values in the type structure
			const typeStr = JSON.stringify(attributes.status.type);
			expect(typeStr.includes('to_watch')).toBe(true);
			expect(typeStr.includes('watching')).toBe(true);
			expect(typeStr.includes('finished')).toBe(true);
			expect(typeStr.includes('flagged')).toBe(true);
			expect(typeStr.includes('removed')).toBe(true);
			expect(typeStr.includes('active')).toBe(true);
			expect(typeStr.includes('watch_together_focused')).toBe(true);
			expect(typeStr.includes('watch_together_background')).toBe(true);
		});

		it('should define rating field with validation', () => {
			expect(attributes.rating.type).toBe(DataTypes.INTEGER);
			expect(attributes.rating.allowNull).toBe(true);
			expect(attributes.rating.validate).toBeDefined();
			expect(attributes.rating.validate.min).toBe(1);
			expect(attributes.rating.validate.max).toBe(5);
		});

		it('should define notes field correctly', () => {
			expect(attributes.notes.type).toBe(DataTypes.TEXT);
			expect(attributes.notes.allowNull).toBe(true);
		});

		it('should define tags field with default value', () => {
			expect(attributes.tags.type.key).toBe('ARRAY');
			expect(attributes.tags.allowNull).toBe(true);
			expect(attributes.tags.defaultValue).toEqual([]);
		});
	});
});
