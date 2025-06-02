import React, {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
import { admin } from '../services/api';

// Simple app settings interface with user preferences
interface AppSettings {
	general: {
		siteName: string;
		siteDescription: string;
	};
	preferences: {
		theme: 'light' | 'dark';
	};
	features: {
		enableNotifications: boolean;
		enableUserProfiles: boolean;
		enableMatching: boolean; // Added new feature flag
	};
	security: {
		sessionTimeout: number; // session timeout in minutes
		passwordPolicy: {
			// Added missing property
			minLength: number;
			requireUppercase: boolean;
			requireLowercase: boolean;
			requireNumbers: boolean;
			requireSpecialChars: boolean;
		};
	};
}

interface SettingsContextType {
	settings: AppSettings;
	isLoading: boolean;
	error: string | null;
	refreshSettings: () => Promise<void>;
}

const defaultSettings: AppSettings = {
	general: {
		siteName: 'PairFlix',
		siteDescription: 'Find your perfect movie match',
	},
	preferences: {
		theme: 'dark',
	},
	features: {
		enableNotifications: true,
		enableUserProfiles: false, // Added missing property with default value
		enableMatching: true, // Added with default value true
	},
	security: {
		sessionTimeout: 30, // default session timeout in minutes
		passwordPolicy: {
			// Added missing property
			minLength: 8,
			requireUppercase: true,
			requireLowercase: true,
			requireNumbers: true,
			requireSpecialChars: false,
		},
	},
};

const SettingsContext = createContext<SettingsContextType>({
	settings: defaultSettings,
	isLoading: false,
	error: null,
	refreshSettings: async () => {},
});

export const useSettings = () => useContext(SettingsContext);

interface SettingsProviderProps {
	children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
	children,
}) => {
	const [settings, setSettings] = useState<AppSettings>(defaultSettings);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Function to fetch settings from the API
	const fetchSettings = useCallback(async (): Promise<void> => {
		try {
			setIsLoading(true);
			setError(null);

			const response = await admin.getAppSettings();

			// Map the admin settings to our client settings structure
			const adminSettings = response.settings;

			setSettings({
				general: {
					siteName: adminSettings.general.siteName,
					siteDescription: adminSettings.general.siteDescription,
				},
				preferences: {
					// Admin settings doesn't have preferences at root level - use general preferences instead
					theme: adminSettings.general.maintenanceMode ? 'light' : 'dark', // Default to dark theme
				},
				features: {
					enableNotifications: adminSettings.features.enableNotifications,
					enableUserProfiles: adminSettings.features.enableUserProfiles, // Added missing property
					enableMatching: adminSettings.features.enableMatching, // Added new feature flag
				},
				security: {
					sessionTimeout: adminSettings.security.sessionTimeout,
					passwordPolicy: adminSettings.security.passwordPolicy, // Added missing property
				},
			});

			if (response.fromCache) {
				console.log(
					'Settings loaded from cache. Last updated:',
					response.lastUpdated
				);
			}
		} catch (err) {
			console.error('Error loading settings:', err);
			setError(
				err instanceof Error
					? err.message
					: 'Failed to load application settings'
			);
			// Fall back to default settings on error
			setSettings(defaultSettings);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Fetch settings when component mounts
	useEffect(() => {
		fetchSettings();
	}, [fetchSettings]);

	return (
		<SettingsContext.Provider
			value={{
				settings,
				isLoading,
				error,
				refreshSettings: fetchSettings,
			}}
		>
			{children}
		</SettingsContext.Provider>
	);
};
