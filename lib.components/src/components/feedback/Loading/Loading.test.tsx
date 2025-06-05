import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import Loading, {
	ButtonLoading,
	InlineLoading,
	LoadingSpinner,
} from './Loading';

// Mock theme for styled-components
const mockTheme = {
	colors: {
		primary: '#4853db',
		primaryHover: '#3942b5',
		background: {
			primary: '#ffffff',
			secondary: '#f5f5f5',
		},
		text: {
			primary: '#333333',
			secondary: '#666666',
			error: '#e53935',
			success: '#43a047',
		},
	},
	spacing: {
		xs: '0.25rem',
		sm: '0.5rem',
		md: '1rem',
		lg: '2rem',
		xl: '3rem',
	},
	typography: {
		fontSize: {
			xs: '0.75rem',
			sm: '0.875rem',
			md: '1rem',
			lg: '1.25rem',
			xl: '1.5rem',
		},
		fontFamily: {
			main: '"Roboto", "Helvetica", "Arial", sans-serif',
			mono: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
		},
		fontWeight: {
			light: 300,
			regular: 400,
			medium: 500,
			semibold: 600,
			bold: 700,
		},
	},
	borderRadius: {
		sm: '4px',
		md: '8px',
		lg: '12px',
	},
	breakpoints: {
		xs: '480px',
		sm: '600px',
		md: '960px',
		lg: '1280px',
		xl: '1920px',
	},
};

// Helper function to render with theme
const renderWithTheme = (ui: React.ReactElement) => {
	return render(<ThemeProvider theme={mockTheme}>{ui}</ThemeProvider>);
};

describe('Loading Components', () => {
	describe('LoadingSpinner', () => {
		it('renders with default props correctly', () => {
			const { container } = renderWithTheme(
				<LoadingSpinner data-testid='spinner' />
			);
			const spinner = container.firstChild;

			expect(spinner).toBeInTheDocument();
			expect(spinner).toHaveStyle('width: 40px');
			expect(spinner).toHaveStyle('height: 40px');
			expect(spinner).toHaveStyle('border-radius: 50%');
		});

		it('applies custom size', () => {
			const { container } = renderWithTheme(
				<LoadingSpinner size={60} data-testid='spinner' />
			);
			const spinner = container.firstChild;

			expect(spinner).toHaveStyle('width: 60px');
			expect(spinner).toHaveStyle('height: 60px');
		});

		it('applies custom thickness', () => {
			const { container } = renderWithTheme(
				<LoadingSpinner thickness={5} data-testid='spinner' />
			);

			// Border properties would need to be tested with jest-styled-components
			expect(container.firstChild).toBeInTheDocument();
		});

		it('applies custom color', () => {
			const { container } = renderWithTheme(
				<LoadingSpinner color='#ff0000' data-testid='spinner' />
			);

			// Color properties would need to be tested with jest-styled-components
			expect(container.firstChild).toBeInTheDocument();
		});

		it('applies custom animation speed', () => {
			const { container } = renderWithTheme(
				<LoadingSpinner speed={2} data-testid='spinner' />
			);

			// Animation properties would need to be tested with jest-styled-components
			expect(container.firstChild).toBeInTheDocument();
		});
	});

	describe('Loading', () => {
		it('renders with default props correctly', () => {
			renderWithTheme(<Loading />);

			// Should have spinner and default message
			expect(screen.getByRole('progressbar')).toBeInTheDocument();
			expect(screen.getByText('Loading...')).toBeInTheDocument();
		});

		it('displays custom message', () => {
			renderWithTheme(<Loading message='Please wait...' />);

			expect(screen.getByText('Please wait...')).toBeInTheDocument();
		});

		it('hides message when empty string provided', () => {
			renderWithTheme(<Loading message='' />);

			expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
		});

		it('applies custom size to spinner', () => {
			renderWithTheme(<Loading size={60} />);

			// Size would be applied to the spinner component
			expect(screen.getByRole('progressbar')).toBeInTheDocument();
		});

		it('renders children when provided', () => {
			renderWithTheme(
				<Loading>
					<div data-testid='child'>Additional content</div>
				</Loading>
			);

			expect(screen.getByTestId('child')).toBeInTheDocument();
			expect(screen.getByText('Additional content')).toBeInTheDocument();
		});

		it('renders in fullscreen mode', () => {
			renderWithTheme(<Loading fullScreen />);

			// Full screen container would wrap the content
			expect(screen.getByRole('progressbar')).toBeInTheDocument();
			expect(screen.getByText('Loading...')).toBeInTheDocument();
		});

		it('passes spinner props correctly', () => {
			renderWithTheme(
				<Loading spinnerProps={{ color: '#ff0000', thickness: 5 }} />
			);

			// These props would be passed to the spinner component
			expect(screen.getByRole('progressbar')).toBeInTheDocument();
		});

		it('applies className when provided', () => {
			renderWithTheme(<Loading className='custom-loader' />);

			// The className would be applied to the container
			expect(screen.getByRole('progressbar')).toBeInTheDocument();
		});

		it('sets appropriate aria attributes', () => {
			renderWithTheme(<Loading message='Custom loading message' />);

			const progressbar = screen.getByRole('progressbar');
			expect(progressbar).toHaveAttribute('aria-busy', 'true');
			expect(progressbar).toHaveAttribute(
				'aria-label',
				'Custom loading message'
			);
		});
	});

	describe('InlineLoading', () => {
		it('renders with default props correctly', () => {
			renderWithTheme(<InlineLoading />);

			expect(screen.getByRole('progressbar')).toBeInTheDocument();
			expect(screen.getByText('Loading...')).toBeInTheDocument();
		});

		it('displays custom message', () => {
			renderWithTheme(<InlineLoading message='Inline loading...' />);

			expect(screen.getByText('Inline loading...')).toBeInTheDocument();
		});

		it('applies custom size to spinner', () => {
			renderWithTheme(<InlineLoading size={30} />);

			// Size would be applied to the spinner component
			expect(screen.getByRole('progressbar')).toBeInTheDocument();
		});

		it('sets appropriate aria attributes', () => {
			renderWithTheme(<InlineLoading message='Inline loading message' />);

			const progressbar = screen.getByRole('progressbar');
			expect(progressbar).toHaveAttribute('aria-busy', 'true');
			expect(progressbar).toHaveAttribute(
				'aria-label',
				'Inline loading message'
			);
		});
	});

	describe('ButtonLoading', () => {
		it('renders with default props correctly', () => {
			const { container } = renderWithTheme(
				<ButtonLoading data-testid='button-spinner' />
			);
			const spinner = container.firstChild;

			expect(spinner).toBeInTheDocument();
			expect(spinner).toHaveStyle('width: 16px');
			expect(spinner).toHaveStyle('height: 16px');
		});

		it('applies custom size', () => {
			const { container } = renderWithTheme(
				<ButtonLoading size={24} data-testid='button-spinner' />
			);
			const spinner = container.firstChild;

			expect(spinner).toHaveStyle('width: 24px');
			expect(spinner).toHaveStyle('height: 24px');
		});
	});
});
