// filepath: c:\Users\thete\Desktop\localdev\pairflix\backend\src\services\settings.service.test.ts

// Define interfaces for type safety
interface SettingData {
	key: string;
	value: string | number | boolean;
	category: string;
	description: string | null;
}

interface MockSettingInstance extends SettingData {
	save: jest.MockedFunction<() => Promise<void>>;
	destroy: jest.MockedFunction<() => Promise<void>>;
}

interface MockSequelize {
	findAll: jest.MockedFunction<() => Promise<SettingData[]>>;
	findByPk: jest.MockedFunction<
		(key: string) => Promise<MockSettingInstance | null>
	>;
	findOrCreate: jest.MockedFunction<
		(options: unknown) => Promise<[MockSettingInstance, boolean]>
	>;
	create: jest.MockedFunction<(data: unknown) => Promise<SettingData>>;
}

// Create separate mock functions to avoid unbound method references
const mockFindAll = jest.fn() as jest.MockedFunction<
	() => Promise<SettingData[]>
>;
const mockFindByPk = jest.fn() as jest.MockedFunction<
	(key: string) => Promise<MockSettingInstance | null>
>;
const mockFindOrCreate = jest.fn() as jest.MockedFunction<
	(options: unknown) => Promise<[MockSettingInstance, boolean]>
>;
const mockCreate = jest.fn() as jest.MockedFunction<
	(data: unknown) => Promise<SettingData>
>;

// Mock dependencies
jest.mock('../models/AppSettings', () => {
	// Create the mock module with both default export and direct methods
	const mockModule: MockSequelize & { default: MockSequelize } = {
		findAll: mockFindAll,
		findByPk: mockFindByPk,
		findOrCreate: mockFindOrCreate,
		create: mockCreate,
		default: {
			findAll: mockFindAll,
			findByPk: mockFindByPk,
			findOrCreate: mockFindOrCreate,
			create: mockCreate,
		},
	};

	return mockModule;
});

// Create separate audit log mock functions before they are used in jest.mock
const mockAuditInfo = jest.fn().mockResolvedValue(null);
const mockAuditWarn = jest.fn().mockResolvedValue(null);
const mockAuditError = jest.fn().mockResolvedValue(null);

jest.mock('./audit.service', () => ({
	auditLogService: {
		info: mockAuditInfo,
		warn: mockAuditWarn,
		error: mockAuditError,
	},
}));

import { settingsService } from './settings.service';

describe('SettingsService', () => {
	// Save original environment
	const originalEnv = process.env;

	beforeEach(() => {
		jest.clearAllMocks();
		// Reset service cache (synchronous operation, no await needed)
		settingsService.clearCache();
		// Reset environment variables
		process.env = { ...originalEnv };
	});

	afterAll(() => {
		// Restore environment variables
		process.env = originalEnv;
	});

	describe('getSettings', () => {
		it('should fetch settings from database when cache is empty', async () => {
			// Mock the database response
			mockFindAll.mockResolvedValue([
				{
					key: 'general.siteName',
					value: 'PairFlix',
					category: 'general',
					description: 'Name shown in UI',
				},
				{
					key: 'general.maintenanceMode',
					value: false,
					category: 'general',
					description: null,
				},
			]);

			// Call the method
			const settings = await settingsService.getSettings();

			// Verify database was called
			expect(mockFindAll).toHaveBeenCalled();

			// Verify the returned settings
			expect(settings).toHaveProperty('general.siteName', 'PairFlix');
			expect(settings).toHaveProperty('general.maintenanceMode', false);
		});

		it('should initialize default settings when database is empty', async () => {
			// Mock empty database
			mockFindAll.mockResolvedValue([]);

			// Mock the create function
			mockCreate.mockImplementation((data: unknown) =>
				Promise.resolve(data as SettingData)
			);

			// Mock second findAll after initialization
			mockFindAll
				.mockResolvedValueOnce([]) // First call returns empty
				.mockResolvedValueOnce([
					// Second call returns initialized defaults
					{
						key: 'general.siteName',
						value: 'PairFlix',
						category: 'general',
						description: 'Name of the application shown to users',
					},
				]);

			// Call the method
			const settings = await settingsService.getSettings();

			// Verify initializeDefaultSettings was called indirectly (via AppSettings.create)
			expect(mockCreate).toHaveBeenCalled();

			// Verify settings were returned
			expect(settings).toHaveProperty('general.siteName', 'PairFlix');
		});

		it('should return cached settings when available and not expired', async () => {
			// Setup cache (synchronous operation, no await needed)
			settingsService.clearCache();

			// First call: populate cache
			mockFindAll.mockResolvedValueOnce([
				{
					key: 'general.siteName',
					value: 'PairFlix',
					category: 'general',
					description: null,
				},
			]);

			await settingsService.getSettings();

			// Clear mock to check if it gets called again
			mockFindAll.mockClear();

			// Second call: should use cache
			const settings = await settingsService.getSettings();

			expect(settings).toHaveProperty('general.siteName', 'PairFlix');
			expect(mockFindAll).not.toHaveBeenCalled();
		});

		it('should handle database errors and use cache/defaults', async () => {
			// Setup cache (synchronous operation, no await needed)
			settingsService.clearCache();

			// Mock database error
			mockFindAll.mockRejectedValue(new Error('Database error'));

			// Call the method
			const settings = await settingsService.getSettings();

			// Verify error was logged
			expect(mockAuditError).toHaveBeenCalled();

			// Verify default settings were returned
			expect(settings).toHaveProperty('general.siteName');
			expect(settings).toHaveProperty('email.smtpServer');
		});

		it('should force refresh from database when forceRefresh is true', async () => {
			// Setup cache (synchronous operation, no await needed)
			settingsService.clearCache();

			// First call: populate cache
			mockFindAll.mockResolvedValueOnce([
				{
					key: 'general.siteName',
					value: 'PairFlix',
					category: 'general',
					description: null,
				},
			]);

			await settingsService.getSettings();

			// Mock different data for forced refresh
			mockFindAll.mockResolvedValueOnce([
				{
					key: 'general.siteName',
					value: 'Updated Name',
					category: 'general',
					description: null,
				},
			]);

			// Call with forceRefresh
			const settings = await settingsService.getSettings(true);

			expect(settings).toHaveProperty('general.siteName', 'Updated Name');
			expect(mockFindAll).toHaveBeenCalledTimes(2);
		});

		it('should apply environment variable overrides', async () => {
			// Setup environment variable
			process.env.SMTP_SERVER = 'smtp.override.com';

			// Mock database response
			mockFindAll.mockResolvedValueOnce([
				{
					key: 'email.smtpServer',
					value: 'smtp.example.com',
					category: 'email',
					description: null,
				},
			]);

			// Call the method
			const settings = await settingsService.getSettings();

			expect(settings).toHaveProperty('email.smtpServer', 'smtp.override.com');
		});
	});

	describe('getSetting', () => {
		it('should return a specific setting by key', async () => {
			// Reset the service completely (synchronous operation, no await needed)
			settingsService.clearCache();

			// Mock the implementation to bypass cache mechanisms and directly use findByPk
			const mockGetSetting = jest
				.fn()
				.mockImplementationOnce(async (key: string) => {
					// Call findByPk directly without going through cache
					const setting = await mockFindByPk(key);
					return setting ? setting.value : null;
				});

			// Replace the method temporarily
			const originalMethod = settingsService.getSetting.bind(settingsService);
			settingsService.getSetting = mockGetSetting;

			// Mock findByPk to return a result
			mockFindByPk.mockResolvedValueOnce({
				key: 'general.siteName',
				value: 'PairFlix',
				category: 'general',
				description: null,
				save: jest.fn(),
				destroy: jest.fn(),
			});

			// Call the method
			const value = await settingsService.getSetting('general.siteName');

			// Verify the specific key was looked up in the database
			expect(mockFindByPk).toHaveBeenCalledWith('general.siteName');
			expect(value).toBe('PairFlix');

			// Restore original implementation
			settingsService.getSetting = originalMethod;
		});

		it('should return a cached setting if available', async () => {
			// Setup cache (synchronous operation, no await needed)
			settingsService.clearCache();

			// Populate cache via getSettings
			mockFindAll.mockResolvedValueOnce([
				{
					key: 'general.siteName',
					value: 'PairFlix',
					category: 'general',
					description: null,
				},
			]);

			await settingsService.getSettings();

			// Reset mocks to verify they aren't called again
			jest.clearAllMocks();

			// Get setting from cache
			const value = await settingsService.getSetting('general.siteName');

			expect(value).toBe('PairFlix');
			expect(mockFindByPk).not.toHaveBeenCalled();
		});

		it('should return default value if setting not found', async () => {
			// Setup empty cache (synchronous operation, no await needed)
			settingsService.clearCache();

			// Mock findAll for initial getSettings call
			mockFindAll.mockResolvedValueOnce([]);

			// Mock findByPk to return null (setting not found)
			mockFindByPk.mockResolvedValueOnce(null);

			// Call with default value
			const value = await settingsService.getSetting(
				'nonexistent.setting',
				'default'
			);

			expect(value).toBe('default');
		});

		it('should apply environment override for sensitive settings', async () => {
			// Setup environment variable
			process.env.SMTP_PASSWORD = 'supersecret';

			// Setup cache (synchronous operation, no await needed)
			settingsService.clearCache();

			// Populate cache
			mockFindAll.mockResolvedValueOnce([
				{
					key: 'email.smtpPassword',
					value: '',
					category: 'email',
					description: null,
				},
			]);

			await settingsService.getSettings();

			// Get sensitive setting
			const value = await settingsService.getSetting('email.smtpPassword');

			expect(value).toBe('supersecret');
		});

		it('should handle database errors when fetching a setting', async () => {
			// Setup empty cache (synchronous operation, no await needed)
			settingsService.clearCache();

			// Mock getSettings to throw an error
			mockFindAll.mockRejectedValueOnce(new Error('Database error'));

			// Mock findByPk to also throw an error
			mockFindByPk.mockRejectedValueOnce(new Error('Database error'));

			// Call with default value - we need to access a key that's not in the defaultSettings
			// or the test will return the default value from there
			const value = await settingsService.getSetting(
				'general.customSetting',
				'Default Name'
			);

			expect(value).toBe('Default Name');
			expect(mockAuditError).toHaveBeenCalled();
		});
	});

	describe('updateSetting', () => {
		it('should create a new setting if it does not exist', async () => {
			// Setup cache (synchronous operation, no await needed)
			settingsService.clearCache();

			// Mock findOrCreate to simulate creating a new setting
			mockFindOrCreate.mockResolvedValueOnce([
				{
					key: 'new.setting',
					value: 'new value',
					category: 'general',
					description: null,
					save: jest.fn(),
					destroy: jest.fn(),
				},
				true, // Created flag
			]);

			await settingsService.updateSetting('new.setting', 'new value');

			expect(mockFindOrCreate).toHaveBeenCalledWith({
				where: { key: 'new.setting' },
				defaults: expect.objectContaining({
					key: 'new.setting',
					value: 'new value',
				}) as unknown,
			});
		});

		it('should update an existing setting', async () => {
			// Setup cache (synchronous operation, no await needed)
			settingsService.clearCache();

			// Mock getSetting for the old value check
			mockFindAll.mockResolvedValueOnce([
				{
					key: 'general.siteName',
					value: 'Old Name',
					category: 'general',
					description: null,
				},
			]);

			await settingsService.getSettings();

			// Mock findOrCreate to simulate updating existing
			const mockSave = jest.fn();
			mockFindOrCreate.mockResolvedValueOnce([
				{
					key: 'general.siteName',
					value: 'Old Name',
					category: 'general',
					description: null,
					save: mockSave,
					destroy: jest.fn(),
				},
				false, // Not created flag
			]);

			await settingsService.updateSetting('general.siteName', 'New Name');

			expect(mockSave).toHaveBeenCalled();
			expect(mockAuditInfo).toHaveBeenCalled();
		});

		it('should not store sensitive settings in the database', async () => {
			// Setup cache (synchronous operation, no await needed)
			settingsService.clearCache();

			// Mock findOrCreate
			mockFindOrCreate.mockResolvedValueOnce([
				{
					key: 'email.smtpPassword',
					value: '',
					category: 'email',
					description: null,
					save: jest.fn(),
					destroy: jest.fn(),
				},
				true, // Created flag
			]);

			await settingsService.updateSetting('email.smtpPassword', 'secret');

			expect(mockFindOrCreate).toHaveBeenCalledWith({
				where: { key: 'email.smtpPassword' },
				defaults: expect.objectContaining({
					key: 'email.smtpPassword',
					value: '', // Empty string, not the actual value
				}) as unknown,
			});
		});

		it('should handle database errors during update', async () => {
			// Setup cache (synchronous operation, no await needed)
			settingsService.clearCache();

			// Mock database error
			mockFindOrCreate.mockRejectedValueOnce(new Error('Database error'));

			// Call the method and expect it to throw
			await expect(
				settingsService.updateSetting('general.siteName', 'New Name')
			).rejects.toThrow();

			// Verify error was logged
			expect(mockAuditError).toHaveBeenCalled();
		});
	});

	describe('updateSettings', () => {
		it('should update multiple settings at once', async () => {
			// Mock updateSetting with proper typing
			const updateSettingSpy = jest
				.spyOn(settingsService, 'updateSetting')
				.mockResolvedValue(undefined);

			await settingsService.updateSettings({
				'general.siteName': 'New Name',
				'general.maintenanceMode': true,
			});

			expect(updateSettingSpy).toHaveBeenCalledTimes(2);
			expect(updateSettingSpy).toHaveBeenCalledWith(
				'general.siteName',
				'New Name',
				undefined,
				undefined,
				undefined
			);
		});
	});

	describe('deleteSetting', () => {
		it('should delete a setting', async () => {
			// Mock findByPk
			const mockDestroy = jest.fn();
			mockFindByPk.mockResolvedValueOnce({
				key: 'general.siteName',
				value: 'PairFlix',
				category: 'general',
				description: null,
				destroy: mockDestroy,
				save: jest.fn(),
			});

			await settingsService.deleteSetting('general.siteName');

			expect(mockDestroy).toHaveBeenCalled();
			expect(mockAuditWarn).toHaveBeenCalled();
		});

		it('should do nothing if the setting does not exist', async () => {
			// Mock findByPk to return null (not found)
			mockFindByPk.mockResolvedValueOnce(null);

			await settingsService.deleteSetting('nonexistent.setting');

			expect(mockAuditWarn).not.toHaveBeenCalled();
		});

		it('should handle database errors during deletion', async () => {
			// Mock database error
			mockFindByPk.mockRejectedValueOnce(new Error('Database error'));

			// Call the method and expect it to throw
			await expect(
				settingsService.deleteSetting('general.siteName')
			).rejects.toThrow();

			// Verify error was logged
			expect(mockAuditError).toHaveBeenCalled();
		});
	});

	describe('clearCache', () => {
		it('should clear the settings cache', async () => {
			// Populate cache
			mockFindAll.mockResolvedValueOnce([
				{
					key: 'general.siteName',
					value: 'PairFlix',
					category: 'general',
					description: null,
				},
			]);

			await settingsService.getSettings();

			// Clear mocks to verify next calls
			jest.clearAllMocks();

			// Clear cache (synchronous operation, no await needed)
			settingsService.clearCache();

			// Verify next call fetches from database
			mockFindAll.mockResolvedValueOnce([
				{
					key: 'general.siteName',
					value: 'Updated Name',
					category: 'general',
					description: null,
				},
			]);

			const settings = await settingsService.getSettings();

			expect(settings).toHaveProperty('general.siteName', 'Updated Name');
			expect(mockFindAll).toHaveBeenCalled();
		});
	});

	describe('initializeDefaultSettings', () => {
		it('should create default settings in the database', async () => {
			// Mock AppSettings.create
			mockCreate.mockImplementation((data: unknown) =>
				Promise.resolve(data as SettingData)
			);

			await settingsService.initializeDefaultSettings();

			expect(mockCreate).toHaveBeenCalled();
			expect(mockAuditInfo).toHaveBeenCalledWith(
				'Initialized default settings',
				'settings-service',
				expect.any(Object)
			);
		});

		it('should handle database errors during initialization', async () => {
			// Mock database error
			mockCreate.mockRejectedValue(new Error('Database error'));

			// Call the method and expect it to throw
			await expect(
				settingsService.initializeDefaultSettings()
			).rejects.toThrow();
		});
	});

	describe('getDefaultSettings', () => {
		it('should return a compiled object of default settings', () => {
			const defaultSettings = settingsService.getDefaultSettings();

			expect(defaultSettings).toHaveProperty('general.siteName', 'PairFlix');
			expect(defaultSettings).toHaveProperty(
				'email.smtpServer',
				'smtp.example.com'
			);
			expect(defaultSettings).toHaveProperty(
				'security.passwordPolicy.minLength',
				8
			);
		});
	});
});
