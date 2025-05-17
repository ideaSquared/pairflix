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
	shadows: {
		sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
		md: '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
		lg: '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10)',
		xl: '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)',
	},
};

export const darkTheme = {
	...baseTheme,
	colors: {
		primary: '#818cff', // Brightened for better contrast
		primaryHover: '#919dff',
		secondary: '#6b6b6b', // Brightened for better contrast
		background: {
			primary: '#121212',
			secondary: '#1a1a1a',
			input: '#2a2a2a',
			card: '#1a1a1a',
			paper: '#1f1f1f', // Added for modal backgrounds
			hover: '#2a2a2a', // Added for hover states
			highlight: '#2d2d2d', // Added for highlights
		},
		border: '#3a3a3a',
		overlay: 'rgba(0, 0, 0, 0.6)', // Added for modal overlay
		text: {
			primary: '#ffffff',
			secondary: '#b3b3b3', // Brightened from #999999 for better contrast
			error: '#ff6b6b', // Adjusted for better visibility
			success: '#4caf50', // Changed from #00ff00 for better contrast
			warning: '#ffd700',
		},
		status: {
			toWatch: '#818cff', // Matches primary
			toWatchTogether: '#a385eb', // Brightened for contrast
			wouldLikeToWatchTogether: '#ff8ac5', // Brightened for contrast
			watching: '#ffd700',
			finished: '#4caf50', // Matches success color
		},
	},
};

export const lightTheme = {
	...baseTheme,
	colors: {
		primary: '#4853db', // Darkened for better contrast on light backgrounds
		primaryHover: '#3942b5',
		secondary: '#6b6b6b',
		background: {
			primary: '#ffffff',
			secondary: '#f5f5f5',
			input: '#ffffff',
			card: '#ffffff',
			paper: '#ffffff', // Added for modal backgrounds
			hover: '#f0f0f0', // Added for hover states
			highlight: '#f5f7ff', // Added for highlights
		},
		border: '#d0d0d0',
		overlay: 'rgba(0, 0, 0, 0.5)', // Added for modal overlay
		text: {
			primary: '#1a1a1a',
			secondary: '#595959', // Darkened from #666666 for better contrast
			error: '#d32f2f', // Adjusted for better contrast
			success: '#2e7d32', // Adjusted for better contrast
			warning: '#ed6c02', // Adjusted from #ffa500 for better contrast
		},
		status: {
			toWatch: '#4853db', // Matches primary
			toWatchTogether: '#6c4aa6', // Darkened for contrast
			wouldLikeToWatchTogether: '#d4387c', // Adjusted for contrast
			watching: '#ed6c02', // Matches warning
			finished: '#2e7d32', // Matches success
		},
	},
};

export type Theme = typeof darkTheme;
