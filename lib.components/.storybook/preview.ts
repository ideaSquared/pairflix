import type { Preview } from '@storybook/react-webpack5';
import { GlobalThemeDecorator } from './preview-wrapper';

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		backgrounds: {
			disable: true, // Disable the default background tool since we're using themes
		},
	},
	decorators: [GlobalThemeDecorator],
	globalTypes: {
		theme: {
			name: 'Theme',
			description: 'Global theme for components',
			defaultValue: 'light',
			toolbar: {
				icon: 'circlehollow',
				items: [
					{ value: 'light', icon: 'sun', title: 'Light Theme' },
					{ value: 'dark', icon: 'moon', title: 'Dark Theme' },
				],
				showName: true,
			},
		},
	},
};

export default preview;
