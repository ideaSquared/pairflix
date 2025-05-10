import React from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import { GlobalStyles } from './GlobalStyles';
import { darkTheme, lightTheme } from './theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { user } = useAuth();
	
	// Directly compute theme instead of using state to avoid race conditions
	const currentTheme = user?.preferences?.theme === 'light' ? lightTheme : darkTheme;

	return (
		<StyledThemeProvider theme={currentTheme}>
			<GlobalStyles />
			{children}
		</StyledThemeProvider>
	);
};
