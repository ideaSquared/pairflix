import React, { useEffect, useState } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import { GlobalStyles } from './GlobalStyles';
import { Theme, darkTheme, lightTheme } from './theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { user, isLoading } = useAuth();
	const [theme, setTheme] = useState<Theme>(darkTheme); // Default to dark theme

	// Update theme when user preferences change or auth loads
	useEffect(() => {
		if (!isLoading) {
			const userTheme =
				user?.preferences?.theme === 'light' ? lightTheme : darkTheme;
			setTheme(userTheme);
		}
	}, [user?.preferences?.theme, isLoading]);

	return (
		<StyledThemeProvider theme={theme}>
			<GlobalStyles />
			{children}
		</StyledThemeProvider>
	);
};
