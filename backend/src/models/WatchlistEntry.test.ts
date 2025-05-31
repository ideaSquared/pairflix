import { DataTypes } from 'sequelize';
import WatchlistEntry from './WatchlistEntry';

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
				.mockImplementation(() => WatchlistEntry as any);

			// Call initialize on WatchlistEntry model
			WatchlistEntry.initialize(mockSequelize as any);

			// Verify init was called
			expect(initSpy).toHaveBeenCalled();

			// Get the attributes passed to init
			const calls = initSpy.mock.calls;
			expect(calls.length).toBeGreaterThan(0);

			const attributes = calls[0]?.[0];
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
				.mockImplementation(() => WatchlistEntry as any);

			// Call initialize on WatchlistEntry model
			WatchlistEntry.initialize(mockSequelize as any);

			// Verify init was called
			expect(initSpy).toHaveBeenCalled();

			const calls = initSpy.mock.calls;
			expect(calls.length).toBeGreaterThan(0);

			// Get the options passed to init
			const options = calls[0]?.[1];
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
		let attributes: any;

		beforeEach(() => {
			// Spy on init method to capture attributes
			const initSpy = jest
				.spyOn(WatchlistEntry, 'init')
				.mockImplementation(() => WatchlistEntry as any);
			WatchlistEntry.initialize(mockSequelize as any);

			const calls = initSpy.mock.calls;
			expect(calls.length).toBeGreaterThan(0);

			attributes = calls[0]?.[0];
			expect(attributes).toBeDefined();

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
			expect(attributes.media_type.type.toString().includes('ENUM')).toBe(true);
			// Check for movie and tv values in the type structure
			const typeStr = JSON.stringify(attributes.media_type.type);
			expect(typeStr).toContain('movie');
			expect(typeStr).toContain('tv');
			expect(attributes.media_type.allowNull).toBe(false);
		});

		it('should define status field with correct default value', () => {
			// Check that it's an ENUM type (in any form)
			expect(attributes.status.type).toBeDefined();
			expect(attributes.status.type.toString().includes('ENUM')).toBe(true);
			expect(attributes.status.allowNull).toBe(false);
			expect(attributes.status.defaultValue).toBe('to_watch');
			// Check for status values in the type structure
			const typeStr = JSON.stringify(attributes.status.type);
			expect(typeStr).toContain('to_watch');
			expect(typeStr).toContain('watching');
			expect(typeStr).toContain('finished');
			expect(typeStr).toContain('flagged');
			expect(typeStr).toContain('removed');
			expect(typeStr).toContain('active');
			expect(typeStr).toContain('watch_together_focused');
			expect(typeStr).toContain('watch_together_background');
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
