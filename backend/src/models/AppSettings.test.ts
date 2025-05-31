import { DataTypes } from 'sequelize';
import AppSettings from './AppSettings';

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

describe('AppSettings Model', () => {
	beforeEach(() => {
		// Reset mocks before each test
		jest.clearAllMocks();
	});

	describe('Model initialization', () => {
		it('should initialize with correct attributes', () => {
			// Spy on init method
			const initSpy = jest
				.spyOn(AppSettings, 'init')
				.mockImplementation(() => AppSettings as any);

			// Call initialize on AppSettings model
			AppSettings.initialize(mockSequelize as any);

			// Verify init was called
			expect(initSpy).toHaveBeenCalled();

			// Get the attributes passed to init
			const calls = initSpy.mock.calls;
			expect(calls.length).toBeGreaterThan(0);

			const attributes = calls[0]?.[0];
			expect(attributes).toBeDefined();

			// Verify all required fields are defined
			expect(attributes).toHaveProperty('key');
			expect(attributes).toHaveProperty('value');
			expect(attributes).toHaveProperty('category');
			expect(attributes).toHaveProperty('description');
			expect(attributes).toHaveProperty('created_at');
			expect(attributes).toHaveProperty('updated_at');

			// Restore the original implementation
			initSpy.mockRestore();
		});

		it('should set correct options', () => {
			// Spy on init method
			const initSpy = jest
				.spyOn(AppSettings, 'init')
				.mockImplementation(() => AppSettings as any);

			// Call initialize on AppSettings model
			AppSettings.initialize(mockSequelize as any);

			// Verify init was called
			expect(initSpy).toHaveBeenCalled();

			const calls = initSpy.mock.calls;
			expect(calls.length).toBeGreaterThan(0);

			// Get the options passed to init
			const options = calls[0]?.[1];
			expect(options).toBeDefined();

			// Check model options
			expect(options).toHaveProperty('sequelize', mockSequelize);
			expect(options).toHaveProperty('modelName', 'AppSettings');
			expect(options).toHaveProperty('tableName', 'app_settings');
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
				.spyOn(AppSettings, 'init')
				.mockImplementation(() => AppSettings as any);
			AppSettings.initialize(mockSequelize as any);

			const calls = initSpy.mock.calls;
			expect(calls.length).toBeGreaterThan(0);

			attributes = calls[0]?.[0];
			expect(attributes).toBeDefined();

			initSpy.mockRestore();
		});

		it('should define key field as primary key', () => {
			expect(attributes.key.type).toBe(DataTypes.STRING);
			expect(attributes.key.allowNull).toBe(false);
			expect(attributes.key.primaryKey).toBe(true);
		});

		it('should define value field as JSONB', () => {
			expect(attributes.value.type).toBe(DataTypes.JSONB);
			expect(attributes.value.allowNull).toBe(false);
		});

		it('should define category field with default value', () => {
			expect(attributes.category.type).toBe(DataTypes.STRING);
			expect(attributes.category.allowNull).toBe(false);
			expect(attributes.category.defaultValue).toBe('general');
		});

		it('should define description field as nullable', () => {
			expect(attributes.description.type).toBe(DataTypes.STRING);
			expect(attributes.description.allowNull).toBe(true);
		});

		it('should define created_at and updated_at fields correctly', () => {
			expect(attributes.created_at.type).toBe(DataTypes.DATE);
			expect(attributes.created_at.defaultValue).toBe(DataTypes.NOW);

			expect(attributes.updated_at.type).toBe(DataTypes.DATE);
			expect(attributes.updated_at.defaultValue).toBe(DataTypes.NOW);
		});
	});
});
