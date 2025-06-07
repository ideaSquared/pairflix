import React from 'react';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from '../src/styles/GlobalStyles';
import { darkTheme, lightTheme } from '../src/styles/theme';

export const GlobalThemeDecorator = (Story, context) => {
	// Get theme from parameters or use Storybook toolbar selection
	const { theme: themeParam } = context.parameters;
	const { globals } = context;
	const selectedTheme = globals.theme || 'light';

	// Select proper theme object
	const theme = selectedTheme === 'dark' ? darkTheme : lightTheme;

	return (
		<ThemeProvider theme={theme}>
			<GlobalStyles />
			<div style={{ padding: '20px' }}>
				<Story />
			</div>
		</ThemeProvider>
	);
};
