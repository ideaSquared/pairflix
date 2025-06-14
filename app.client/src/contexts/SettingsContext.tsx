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
    enableGroups: boolean; // Added new feature flag
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
    enableGroups: true, // Added with default value true
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
  refreshSettings: async () => {
    throw new Error('SettingsContext must be used within a SettingsProvider');
  },
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

      // Try to fetch admin settings, but handle 403 gracefully
      try {
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
            enableGroups: adminSettings.features.enableGroups, // Added new feature flag
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
      } catch (adminErr) {
        // If we get a 403 or authentication error, fall back to defaults
        if (
          adminErr instanceof Error &&
          (adminErr.message.includes('403') ||
            adminErr.message.includes('Forbidden') ||
            adminErr.message.includes('Authentication required'))
        ) {
          console.log(
            'User does not have admin access, using default settings'
          );
          // Use default settings for regular users
          setSettings(defaultSettings);
        } else {
          // Re-throw other errors
          throw adminErr;
        }
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
