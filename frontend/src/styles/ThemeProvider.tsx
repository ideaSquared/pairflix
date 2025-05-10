import React, { useEffect, useState } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import { GlobalStyles } from './GlobalStyles';
import { darkTheme, lightTheme } from './theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { user } = useAuth();
	const [currentTheme, setCurrentTheme] = useState(
		user?.preferences?.theme === 'light' ? lightTheme : darkTheme
	);

	useEffect(() => {
		setCurrentTheme(
			user?.preferences?.theme === 'light' ? lightTheme : darkTheme
		);
	}, [user?.preferences?.theme]);

	return (
		<StyledThemeProvider theme={currentTheme}>
			<GlobalStyles />
			{children}
		</StyledThemeProvider>
	);
};
