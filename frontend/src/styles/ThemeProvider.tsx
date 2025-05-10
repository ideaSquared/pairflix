import React from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import { GlobalStyles } from './GlobalStyles';
import { darkTheme, lightTheme } from './theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { user } = useAuth();
	const theme = user?.preferences?.theme === 'light' ? lightTheme : darkTheme;

	return (
		<StyledThemeProvider theme={theme}>
			<GlobalStyles />
			{children}
		</StyledThemeProvider>
	);
};
