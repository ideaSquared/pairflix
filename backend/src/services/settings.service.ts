import dotenv from 'dotenv';
import AppSettings from '../models/AppSettings';
import { auditLogService } from './audit.service';

dotenv.config();

// Type for JSON values that can be stored in JSONB
type JsonValue =
	| string
	| number
	| boolean
	| null
	| JsonValue[]
	| { [key: string]: JsonValue };

// Define proper TypeScript interfaces for type safety
interface SettingData {
	value: unknown;
	category: string;
	description: string | null;
}

// Cache settings for performance
let appSettingsCache: Record<string, SettingData> = {};
let lastSettingsFetch: number = 0;
const SETTINGS_CACHE_TTL = 60 * 60 * 1000; // 1 hour

// List of sensitive settings that should never be stored in the database
// These should always come from environment variables
const SENSITIVE_SETTINGS = ['email.smtpPassword'];

// Category descriptions for better organization
const CATEGORIES = {
	general: 'Basic application settings',
	security: 'Security and authentication settings',
	email: 'Email and notification settings',
	media: 'Media and file upload settings',
	features: 'Feature flags and toggles',
};

/**
 * Settings Service - centralized service for all app settings functionality
 * This provides methods to get, update, and manage application settings
 */
export class SettingsService {
	/**
	 * Get all application settings
	 * @param forceRefresh Force refresh from database even if cache is valid
	 * @returns Compiled settings object
	 */
	async getSettings(forceRefresh = false): Promise<Record<string, unknown>> {
		const now = Date.now();

		// Return cached settings if available and not expired
		if (
			!forceRefresh &&
			Object.keys(appSettingsCache).length > 0 &&
			lastSettingsFetch > 0 &&
			now - lastSettingsFetch < SETTINGS_CACHE_TTL
		) {
			return this.compileSettings(appSettingsCache);
		}

		try {
			// Load all settings from database
			const dbSettings = await AppSettings.findAll();

			// No settings found, create default ones
			if (dbSettings.length === 0) {
				await this.initializeDefaultSettings();

				// Reload settings after initialization
				const newSettings = await AppSettings.findAll();
				appSettingsCache = this.convertToCache(newSettings);
			} else {
				// Update the cache with database settings
				appSettingsCache = this.convertToCache(dbSettings);
			}

			lastSettingsFetch = now;

			// Compile settings into a hierarchical object and apply environment overrides
			const compiledSettings = this.compileSettings(appSettingsCache);
			return compiledSettings;
		} catch (error) {
			console.error('Database error fetching app settings:', error);

			// If cache is empty, use default settings
			if (Object.keys(appSettingsCache).length === 0) {
				const defaultSettings = this.getDefaultSettingsMap();
				appSettingsCache = defaultSettings;
			}

			// Log the error
			await auditLogService.error(
				'Failed to load settings from database',
				'settings-service',
				{ error: error instanceof Error ? error.message : 'Unknown error' }
			);

			// Return whatever we have in cache with environment overrides
			return this.compileSettings(appSettingsCache);
		}
	}

	/**
	 * Get a single setting by key
	 * @param key Setting key
	 * @param defaultValue Default value if setting not found
	 * @returns Setting value or default
	 */
	async getSetting(key: string, defaultValue?: unknown): Promise<unknown> {
		// Ensure cache is populated
		if (Object.keys(appSettingsCache).length === 0) {
			await this.getSettings();
		}

		// Check if setting exists in cache
		if (key in appSettingsCache) {
			const settingData = appSettingsCache[key];
			if (settingData) {
				const { value } = settingData;

				// Apply environment override for sensitive settings
				if (SENSITIVE_SETTINGS.includes(key)) {
					return this.getEnvironmentOverride(key) ?? value;
				}

				return value;
			}
		}

		// Try to get from database directly if not in cache
		try {
			const setting = await AppSettings.findByPk(key);

			if (setting) {
				// Update cache
				appSettingsCache[key] = {
					value: setting.value,
					category: setting.category,
					description: setting.description,
				};

				// Apply environment override for sensitive settings
				if (SENSITIVE_SETTINGS.includes(key)) {
					return this.getEnvironmentOverride(key) ?? setting.value;
				}

				return setting.value;
			}
		} catch (error) {
			console.error(`Error fetching setting ${key}:`, error);
		}

		// Return default value if provided, otherwise null
		return defaultValue !== undefined ? defaultValue : null;
	}

	/**
	 * Update a single setting
	 * @param key Setting key
	 * @param value New value
	 * @param category Optional category
	 * @param description Optional description
	 * @param userId User ID making the change (for audit logs)
	 */
	async updateSetting(
		key: string,
		value: unknown,
		category?: string,
		description?: string,
		userId?: string
	): Promise<void> {
		try {
			const oldValue = await this.getSetting(key);

			// Don't store sensitive values in database
			if (SENSITIVE_SETTINGS.includes(key)) {
				value = '';
			}

			// Update or create the setting
			const [setting, created] = await AppSettings.findOrCreate({
				where: { key },
				defaults: {
					key, // Add the key to defaults to fix TypeScript error
					value: value as JsonValue,
					category: category ?? this.getCategoryFromKey(key),
					description: description ?? null,
				},
			});

			if (!created) {
				setting.value = value as JsonValue;
				if (category) setting.category = category;
				if (description) setting.description = description;
				await setting.save();
			}

			// Update the cache
			appSettingsCache[key] = {
				value,
				category: category ?? setting.category,
				description: description ?? setting.description,
			};

			// Log the change
			await auditLogService.info('Updated setting', 'settings-service', {
				userId,
				key,
				category: category ?? setting.category,
				changed: true,
				// Don't log actual values for sensitive settings
				value: SENSITIVE_SETTINGS.includes(key) ? '[SENSITIVE]' : value,
				oldValue: SENSITIVE_SETTINGS.includes(key) ? '[SENSITIVE]' : oldValue,
				timestamp: new Date(),
			});
		} catch (error) {
			console.error(`Error updating setting ${key}:`, error);

			// Log the error
			await auditLogService.error(
				`Failed to update setting ${key}`,
				'settings-service',
				{
					userId,
					key,
					error: error instanceof Error ? error.message : 'Unknown error',
				}
			);

			throw error;
		}
	}

	/**
	 * Update multiple settings at once
	 * @param settings Object with key-value pairs
	 * @param userId User ID making the change (for audit logs)
	 */
	async updateSettings(
		settings: Record<string, unknown>,
		userId?: string
	): Promise<void> {
		const updatePromises = Object.entries(settings).map(([key, value]) =>
			this.updateSetting(key, value, undefined, undefined, userId)
		);

		await Promise.all(updatePromises);
	}

	/**
	 * Delete a setting
	 * @param key Setting key
	 * @param userId User ID making the change (for audit logs)
	 */
	async deleteSetting(key: string, userId?: string): Promise<void> {
		try {
			const setting = await AppSettings.findByPk(key);

			if (!setting) {
				return; // Nothing to delete
			}

			const oldValue: unknown = setting.value;
			const { category } = setting;

			await setting.destroy();

			// Remove from cache
			if (key in appSettingsCache) {
				delete appSettingsCache[key];
			}

			// Log the change
			await auditLogService.warn('Deleted setting', 'settings-service', {
				userId,
				key,
				category,
				// Don't log actual values for sensitive settings
				oldValue: SENSITIVE_SETTINGS.includes(key) ? '[SENSITIVE]' : oldValue,
				timestamp: new Date(),
			});
		} catch (error) {
			console.error(`Error deleting setting ${key}:`, error);

			// Log the error
			await auditLogService.error(
				`Failed to delete setting ${key}`,
				'settings-service',
				{
					userId,
					key,
					error: error instanceof Error ? error.message : 'Unknown error',
				}
			);

			throw error;
		}
	}

	/**
	 * Clear the settings cache, forcing next retrieval from database
	 */
	clearCache(): void {
		appSettingsCache = {};
		lastSettingsFetch = 0;
	}

	/**
	 * Initialize default settings in the database
	 * This is called automatically if no settings exist
	 */
	async initializeDefaultSettings(): Promise<void> {
		const defaultSettings = this.getDefaultSettingsMap();

		try {
			// Create all default settings
			const createPromises = Object.entries(defaultSettings).map(
				([key, data]) => {
					// Don't store sensitive values in database
					const value = SENSITIVE_SETTINGS.includes(key) ? '' : data.value;

					return AppSettings.create({
						key,
						value: value as JsonValue,
						category: data.category,
						description: data.description,
					});
				}
			);

			await Promise.all(createPromises);

			await auditLogService.info(
				'Initialized default settings',
				'settings-service',
				{
					settingsCount: Object.keys(defaultSettings).length,
					timestamp: new Date(),
				}
			);
		} catch (error) {
			console.error('Error initializing default settings:', error);
			throw error;
		}
	}

	/**
	 * Compile settings from cache into a hierarchical object
	 * and apply environment overrides
	 * @param settingsCache The settings cache
	 * @returns Compiled settings object
	 */
	private compileSettings(
		settingsCache: Record<string, SettingData>
	): Record<string, unknown> {
		const result: Record<string, unknown> = {};

		// Process each setting
		Object.entries(settingsCache).forEach(([key, data]) => {
			if (!key.includes('.')) {
				// Top-level setting
				result[key] = SENSITIVE_SETTINGS.includes(key)
					? (this.getEnvironmentOverride(key) ?? data.value)
					: data.value;
			} else {
				// Nested setting (e.g., "general.siteName")
				const parts = key.split('.');
				if (!parts || parts.length === 0) return;

				let current = result;

				// Navigate through the object, creating objects as needed
				for (let i = 0; i < parts.length - 1; i++) {
					const part = parts[i];
					if (!part) continue; // Skip empty parts

					current[part] ??= {};
					current = current[part] as Record<string, unknown>;
				}

				// Set the value at the leaf node, with environment override if sensitive
				const lastPart = parts[parts.length - 1];
				if (lastPart) {
					// Ensure lastPart is defined
					current[lastPart] = SENSITIVE_SETTINGS.includes(key)
						? (this.getEnvironmentOverride(key) ?? data.value)
						: data.value;
				}
			}
		});

		// Apply additional environment overrides
		return this.applyGlobalEnvironmentOverrides(result);
	}

	/**
	 * Convert database settings to cache format
	 * @param dbSettings Database settings array
	 * @returns Cache object
	 */
	private convertToCache(
		dbSettings: AppSettings[]
	): Record<string, SettingData> {
		const cache: Record<string, SettingData> = {};

		dbSettings.forEach(setting => {
			cache[setting.key] = {
				value: setting.value,
				category: setting.category,
				description: setting.description,
			};
		});

		return cache;
	}

	/**
	 * Get environment override for a specific key
	 * @param key Setting key
	 * @returns Override value or undefined
	 */
	private getEnvironmentOverride(key: string): unknown {
		// Handle specific mappings
		switch (key) {
			case 'email.smtpPassword':
				return process.env.SMTP_PASSWORD;
			case 'email.smtpUsername':
				return process.env.SMTP_USERNAME;
			case 'email.smtpServer':
				return process.env.SMTP_SERVER;
			case 'email.smtpPort':
				return process.env.SMTP_PORT
					? parseInt(process.env.SMTP_PORT, 10)
					: undefined;
			case 'email.senderEmail':
				return process.env.EMAIL_SENDER;
			case 'email.senderName':
				return process.env.EMAIL_SENDER_NAME;
			case 'general.maintenanceMode':
				return process.env.MAINTENANCE_MODE
					? process.env.MAINTENANCE_MODE.toLowerCase() === 'true'
					: undefined;
			case 'features.enableMatching':
				return process.env.ENABLE_MATCHING
					? process.env.ENABLE_MATCHING.toLowerCase() === 'true'
					: undefined;
			default:
				return undefined;
		}
	}

	/**
	 * Apply global environment overrides to the compiled settings
	 * @param settings Compiled settings
	 * @returns Settings with global overrides
	 */
	private applyGlobalEnvironmentOverrides(
		settings: Record<string, unknown>
	): Record<string, unknown> {
		const result = { ...settings };

		// Ensure all required sections exist
		result.general ??= {};
		result.email ??= {};
		result.features ??= {};

		// Apply overrides
		if (process.env.MAINTENANCE_MODE && result.general) {
			(result.general as Record<string, unknown>).maintenanceMode =
				process.env.MAINTENANCE_MODE.toLowerCase() === 'true';
		}

		if (process.env.ENABLE_MATCHING && result.features) {
			(result.features as Record<string, unknown>).enableMatching =
				process.env.ENABLE_MATCHING.toLowerCase() === 'true';
		}

		// Additional environment variable overrides
		if (process.env.SMTP_SERVER && result.email) {
			(result.email as Record<string, unknown>).smtpServer =
				process.env.SMTP_SERVER;
		}

		if (process.env.SMTP_PORT && result.email) {
			(result.email as Record<string, unknown>).smtpPort = parseInt(
				process.env.SMTP_PORT,
				10
			);
		}

		if (process.env.SMTP_USERNAME && result.email) {
			(result.email as Record<string, unknown>).smtpUsername =
				process.env.SMTP_USERNAME;
		}

		if (process.env.SMTP_PASSWORD && result.email) {
			(result.email as Record<string, unknown>).smtpPassword =
				process.env.SMTP_PASSWORD;
		}

		if (process.env.EMAIL_SENDER && result.email) {
			(result.email as Record<string, unknown>).senderEmail =
				process.env.EMAIL_SENDER;
		}

		if (process.env.EMAIL_SENDER_NAME && result.email) {
			(result.email as Record<string, unknown>).senderName =
				process.env.EMAIL_SENDER_NAME;
		}

		return result;
	}

	/**
	 * Get the category for a setting based on its key
	 * @param key Setting key
	 * @returns Category
	 */
	private getCategoryFromKey(key: string): string {
		if (key.startsWith('general.')) return 'general';
		if (key.startsWith('security.')) return 'security';
		if (key.startsWith('email.')) return 'email';
		if (key.startsWith('media.')) return 'media';
		if (key.startsWith('features.')) return 'features';

		// For top-level keys or unknown patterns
		for (const category of Object.keys(CATEGORIES)) {
			if (key.includes(category)) return category;
		}

		return 'general'; // Default category
	}

	/**
	 * Get default settings as a flat map of key-value pairs
	 * @returns Default settings map
	 */
	private getDefaultSettingsMap(): Record<
		string,
		{ value: unknown; category: string; description: string }
	> {
		const defaultSettings: Record<
			string,
			{ value: unknown; category: string; description: string }
		> = {
			'general.siteName': {
				value: 'PairFlix',
				category: 'general',
				description: 'Name of the application shown to users',
			},
			'general.siteDescription': {
				value: 'Find your perfect movie match',
				category: 'general',
				description: 'Short description of the application',
			},
			'general.maintenanceMode': {
				value: false,
				category: 'general',
				description: 'When enabled, site displays maintenance message',
			},
			'general.defaultUserRole': {
				value: 'user',
				category: 'general',
				description: 'Default role assigned to new users',
			},

			'security.sessionTimeout': {
				value: 120,
				category: 'security',
				description: 'Session timeout in minutes (2 hours default)',
			},
			'security.maxLoginAttempts': {
				value: 5,
				category: 'security',
				description: 'Maximum login attempts before account lockout',
			},
			'security.passwordPolicy.minLength': {
				value: 8,
				category: 'security',
				description: 'Minimum password length',
			},
			'security.passwordPolicy.requireUppercase': {
				value: true,
				category: 'security',
				description: 'Require uppercase letters in passwords',
			},
			'security.passwordPolicy.requireLowercase': {
				value: true,
				category: 'security',
				description: 'Require lowercase letters in passwords',
			},
			'security.passwordPolicy.requireNumbers': {
				value: true,
				category: 'security',
				description: 'Require numbers in passwords',
			},
			'security.passwordPolicy.requireSpecialChars': {
				value: false,
				category: 'security',
				description: 'Require special characters in passwords',
			},
			'security.twoFactorAuth.enabled': {
				value: false,
				category: 'security',
				description: 'Enable two-factor authentication',
			},
			'security.twoFactorAuth.requiredForAdmins': {
				value: false,
				category: 'security',
				description: 'Require two-factor authentication for admins',
			},

			'email.smtpServer': {
				value: 'smtp.example.com',
				category: 'email',
				description: 'SMTP server address for sending emails',
			},
			'email.smtpPort': {
				value: 587,
				category: 'email',
				description: 'SMTP server port',
			},
			'email.smtpUsername': {
				value: 'notifications@pairflix.com',
				category: 'email',
				description: 'SMTP username for authentication',
			},
			'email.smtpPassword': {
				value: '',
				category: 'email',
				description: 'SMTP password for authentication (stored in env)',
			},
			'email.senderEmail': {
				value: 'notifications@pairflix.com',
				category: 'email',
				description: 'Email address shown as sender',
			},
			'email.senderName': {
				value: 'PairFlix Notifications',
				category: 'email',
				description: 'Name shown as sender',
			},
			'email.emailTemplatesPath': {
				value: '/templates/email',
				category: 'email',
				description: 'Path to email templates',
			},

			'media.maxUploadSize': {
				value: 5,
				category: 'media',
				description: 'Maximum file upload size in MB',
			},
			'media.allowedFileTypes': {
				value: ['jpg', 'jpeg', 'png', 'gif'],
				category: 'media',
				description: 'Allowed file types for uploads',
			},
			'media.imageQuality': {
				value: 85,
				category: 'media',
				description: 'JPEG image quality (0-100)',
			},
			'media.storageProvider': {
				value: 'local',
				category: 'media',
				description: 'Storage provider for uploads (local, s3, etc)',
			},

			'features.enableMatching': {
				value: true,
				category: 'features',
				description: 'Enable the matching feature',
			},
			'features.enableUserProfiles': {
				value: true,
				category: 'features',
				description: 'Enable user profiles',
			},
			'features.enableNotifications': {
				value: true,
				category: 'features',
				description: 'Enable notification system',
			},
			'features.enableActivityFeed': {
				value: true,
				category: 'features',
				description: 'Enable activity feed',
			},
		};

		return defaultSettings;
	}

	/**
	 * Get default settings as a hierarchical object (for backward compatibility)
	 * @returns Default settings object
	 */
	getDefaultSettings(): Record<string, unknown> {
		return this.compileSettings(this.getDefaultSettingsMap());
	}
}

// Create singleton instance
export const settingsService = new SettingsService();
