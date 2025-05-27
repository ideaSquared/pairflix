import React, {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react';
import { admin, AppSettings } from '../services/api';

interface SettingsContextType {
	settings: AppSettings | null;
	isLoading: boolean;
	error: string | null;
	refreshSettings: () => Promise<void>;
	updateSettings: (newSettings: AppSettings) => Promise<void>;
}

const defaultSettings: SettingsContextType = {
	settings: null,
	isLoading: true,
	error: null,
	refreshSettings: async () => {},
	updateSettings: async () => {},
};

const SettingsContext = createContext<SettingsContextType>(defaultSettings);

export const useSettings = () => useContext(SettingsContext);

interface SettingsProviderProps {
	children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
	children,
}) => {
	const [settings, setSettings] = useState<AppSettings | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchSettings = async (): Promise<void> => {
		try {
			setIsLoading(true);
			setError(null);
			const response = await admin.getAppSettings();
			setSettings(response.settings);

			// Log cache info for debugging
			if (response.fromCache) {
				console.log(
					'Settings loaded from cache. Last updated:',
					response.lastUpdated
				);
			}
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: 'Failed to load application settings';
			setError(errorMessage);
			console.error('Error loading settings:', errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const updateSettings = async (newSettings: AppSettings): Promise<void> => {
		try {
			setIsLoading(true);
			setError(null);
			const response = await admin.updateAppSettings(newSettings);
			setSettings(response.settings);
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: 'Failed to update application settings';
			setError(errorMessage);
			console.error('Error updating settings:', errorMessage);
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchSettings();
		// We only want to fetch settings once on initial load
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<SettingsContext.Provider
			value={{
				settings,
				isLoading,
				error,
				refreshSettings: fetchSettings,
				updateSettings,
			}}
		>
			{children}
		</SettingsContext.Provider>
	);
};
