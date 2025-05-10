const baseTheme = {
	spacing: {
		xs: '0.25rem',
		sm: '0.5rem',
		md: '1rem',
		lg: '1.5rem',
		xl: '2rem',
	},
	borderRadius: {
		sm: '4px',
		md: '8px',
		lg: '12px',
	},
	typography: {
		fontFamily:
			'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
		fontSize: {
			xs: '0.75rem',
			sm: '0.875rem',
			md: '1rem',
			lg: '1.25rem',
			xl: '1.5rem',
		},
		fontWeight: {
			normal: 400,
			medium: 500,
			bold: 700,
		},
	},
	breakpoints: {
		sm: '600px',
		md: '960px',
		lg: '1280px',
		xl: '1920px',
	},
};

export const darkTheme = {
	...baseTheme,
	colors: {
		primary: '#646cff',
		primaryHover: '#747bff',
		secondary: '#4a4a4a',
		background: {
			primary: '#121212',
			secondary: '#1a1a1a',
			input: '#2a2a2a',
			card: '#1a1a1a',
		},
		border: '#3a3a3a',
		text: {
			primary: '#ffffff',
			secondary: '#999999',
			error: '#ff4444',
			success: '#00ff00',
			warning: '#ffd700',
		},
		status: {
			toWatch: '#646cff',
			toWatchTogether: '#9370db',
			wouldLikeToWatchTogether: '#ff69b4',
			watching: '#ffd700',
			finished: '#00ff00',
		},
	},
};

export const lightTheme = {
	...baseTheme,
	colors: {
		primary: '#646cff',
		primaryHover: '#747bff',
		secondary: '#e0e0e0',
		background: {
			primary: '#ffffff',
			secondary: '#f5f5f5',
			input: '#ffffff',
			card: '#ffffff',
		},
		border: '#e0e0e0',
		text: {
			primary: '#000000',
			secondary: '#666666',
			error: '#ff0000',
			success: '#008000',
			warning: '#ffa500',
		},
		status: {
			toWatch: '#646cff',
			toWatchTogether: '#9370db',
			wouldLikeToWatchTogether: '#ff69b4',
			watching: '#ffa500',
			finished: '#008000',
		},
	},
};

export type Theme = typeof darkTheme;
