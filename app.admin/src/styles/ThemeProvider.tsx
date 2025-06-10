import React, { useEffect, useState } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import { GlobalStyles } from './GlobalStyles';
import { Theme, darkTheme } from './theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoading } = useAuth();
  const [theme, setTheme] = useState<Theme>(darkTheme); // Default to dark theme for admin

  // Use dark theme by default for admin interface
  // Theme can be controlled by admin settings if needed in the future
  useEffect(() => {
    if (!isLoading && user) {
      // For now, always use dark theme for admin interface
      // In the future, this could be controlled by admin settings
      setTheme(darkTheme);
    }
  }, [user, isLoading]);

  return (
    <StyledThemeProvider theme={theme}>
      <GlobalStyles />
      {children}
    </StyledThemeProvider>
  );
};
