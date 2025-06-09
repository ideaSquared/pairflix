import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useAuth } from '../hooks/useAuth';
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
  refreshSettings: async () => {
    // Default implementation - will be overridden by provider
  },
  updateSettings: async () => {
    // Default implementation - will be overridden by provider
  },
};

const SettingsContext = createContext<SettingsContextType>(defaultSettings);

export const useSettings = () => useContext(SettingsContext);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Start as false since we might not need to load
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await admin.settings.get();
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
      const response = await admin.settings.update(newSettings);
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

  // Only fetch settings when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings();
    } else {
      // Reset settings when not authenticated
      setSettings(null);
      setError(null);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

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
