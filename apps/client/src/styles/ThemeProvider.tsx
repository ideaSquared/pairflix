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
  const [mode, setMode] = useState<ThemeMode>('dark'); // Default to dark theme

  // Update theme when user preferences change or auth loads
  useEffect(() => {
    if (!isLoading) {
      setMode(user?.preferences?.theme === 'light' ? 'light' : 'dark');
    }
  }, [user?.preferences?.theme, isLoading]);

  const modeClass = mode === 'dark' ? darkThemeClass : lightThemeClass;

  return <div className={`${modeClass} ${themeRoot}`}>{children}</div>;
};
