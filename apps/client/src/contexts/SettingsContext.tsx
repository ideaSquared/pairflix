import React, { createContext, type ReactNode, useContext } from 'react';

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
  refreshSettings: async () => {
    throw new Error('SettingsContext must be used within a SettingsProvider');
  },
});

export const useSettings = () => useContext(SettingsContext);

interface SettingsProviderProps {
  children: ReactNode;
}

/**
 * These were previously synced from the admin app settings endpoint, but that surface was already
 * functionally decorative (see docs/roadmap.md's billing/admin writeup -- almost nothing read the
 * old Express settings beyond the settings screen itself), and the new settings table has nothing
 * seeded that maps onto this shape at all (no admin UI writes these keys yet). Serving the
 * defaults directly is more honest than a fetch that only ever 403s or resolves to an empty tree.
 */
export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
}) => {
  return (
    <SettingsContext.Provider
      value={{
        settings: defaultSettings,
        isLoading: false,
        error: null,
        refreshSettings: async () => {},
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
