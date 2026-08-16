import {
  darkThemeClass,
  lightThemeClass,
  themeRoot,
} from '@pairflix/components';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

type ThemeMode = 'light' | 'dark';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoading } = useAuth();
  const [mode, setMode] = useState<ThemeMode>('dark'); // Default to dark theme for admin

  // Use dark theme by default for admin interface
  // Theme can be controlled by admin settings if needed in the future
  useEffect(() => {
    if (!isLoading && user) {
      // For now, always use dark theme for admin interface
      // In the future, this could be controlled by admin settings
      setMode('dark');
    }
  }, [user, isLoading]);

  const modeClass = mode === 'dark' ? darkThemeClass : lightThemeClass;

  return <div className={`${modeClass} ${themeRoot}`}>{children}</div>;
};
