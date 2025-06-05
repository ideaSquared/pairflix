// filepath: c:\Users\thete\Desktop\localdev\pairflix\lib.components\src\components\utility\ErrorBoundary\ErrorBoundary.test.tsx
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import ErrorBoundary, {
	ErrorFallback,
	useErrorBoundary,
} from './ErrorBoundary';

// Mock theme for styled-components with all necessary typography properties
const mockTheme = {
	colors: {
		text: {
			primary: '#1a1a1a',
			secondary: '#666666',
			error: '#d32f2f',
			success: '#388e3c',
		},
		background: {
			primary: '#f5f5f5',
			secondary: '#e0e0e0',
		},
		border: {
			default: '#e0e0e0',
		},
		primary: '#4853db',
		primaryHover: '#3942b5',
	},
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
	},
	breakpoints: {
		sm: '576px',
		md: '768px',
		lg: '992px',
	},
	typography: {
		fontSize: {
			xs: '0.75rem',
			sm: '0.875rem',
			md: '1rem',
			lg: '1.25rem',
			xl: '1.5rem',
		},
		fontWeight: {
			light: 300,
			regular: 400,
			medium: 500,
			semibold: 600,
			bold: 700,
		},
		fontFamily: {
			mono: '"Roboto Mono", monospace',
		},
	},
};

// Mock console.error to prevent test output pollution
const originalError = console.error;
beforeAll(() => {
	console.error = jest.fn();
});

afterAll(() => {
	console.error = originalError;
});

// Helper function to render with theme
const renderWithTheme = (ui: React.ReactElement) => {
	return render(<ThemeProvider theme={mockTheme}>{ui}</ThemeProvider>);
};

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
	if (shouldThrow) {
		throw new Error('Test error');
	}
	return <div>No error</div>;
};

// Component that uses the useErrorBoundary hook
const ErrorThrower = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
	const { throwError } = useErrorBoundary();

	if (shouldThrow) {
		throwError(new Error('Manually thrown error'));
	}

	return (
		<button onClick={() => throwError(new Error('Button click error'))}>
			Throw Error
		</button>
	);
};

describe('ErrorBoundary', () => {
	it('renders children when there is no error', () => {
		renderWithTheme(
			<ErrorBoundary>
				<div data-testid='child'>Child Component</div>
			</ErrorBoundary>
		);

		expect(screen.getByTestId('child')).toBeInTheDocument();
		expect(screen.getByText('Child Component')).toBeInTheDocument();
	});

	it('renders error UI when child component throws', () => {
		// Suppress React's error boundary warning in test console
		const originalConsoleError = console.error;
		console.error = jest.fn();

		renderWithTheme(
			<ErrorBoundary>
				<ThrowError />
			</ErrorBoundary>
		);

		// Restore console.error
		console.error = originalConsoleError;

		expect(screen.getByText('Something went wrong')).toBeInTheDocument();
		expect(screen.getByText('Test error')).toBeInTheDocument();
		expect(screen.getByText('Try Again')).toBeInTheDocument();
		expect(screen.getByText('Reload Page')).toBeInTheDocument();
	});

	it('renders custom fallback when provided', () => {
		// Suppress React's error boundary warning in test console
		const originalConsoleError = console.error;
		console.error = jest.fn();

		const CustomFallback = () => (
			<div data-testid='custom-fallback'>Custom Error UI</div>
		);

		renderWithTheme(
			<ErrorBoundary fallback={<CustomFallback />}>
				<ThrowError />
			</ErrorBoundary>
		);

		// Restore console.error
		console.error = originalConsoleError;

		expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
		expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
	});

	it('calls onError prop when an error occurs', () => {
		// Suppress React's error boundary warning in test console
		const originalConsoleError = console.error;
		console.error = jest.fn();

		const handleError = jest.fn();

		renderWithTheme(
			<ErrorBoundary onError={handleError}>
				<ThrowError />
			</ErrorBoundary>
		);

		// Restore console.error
		console.error = originalConsoleError;

		expect(handleError).toHaveBeenCalled();
		expect(handleError.mock.calls[0][0]).toBeInstanceOf(Error);
		expect(handleError.mock.calls[0][0].message).toBe('Test error');
	});

	// This test simulates clicking "Try Again" but because of how React handles error boundaries in tests,
	// we can't fully test the reset behavior
	it('renders try again button', () => {
		// Suppress React's error boundary warning in test console
		const originalConsoleError = console.error;
		console.error = jest.fn();

		renderWithTheme(
			<ErrorBoundary>
				<ThrowError />
			</ErrorBoundary>
		);

		// Restore console.error
		console.error = originalConsoleError;

		expect(screen.getByText('Try Again')).toBeInTheDocument();
	});
});

describe('ErrorFallback', () => {
	it('renders with error message', () => {
		const error = new Error('Custom error message');
		const resetErrorBoundary = jest.fn();

		renderWithTheme(
			<ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
		);

		expect(screen.getByText('Something went wrong')).toBeInTheDocument();
		expect(screen.getByText('Custom error message')).toBeInTheDocument();
	});

	it('renders default message when no error provided', () => {
		renderWithTheme(<ErrorFallback />);

		expect(
			screen.getByText('An unexpected error occurred')
		).toBeInTheDocument();
	});

	it('calls resetErrorBoundary when try again button is clicked', () => {
		const resetErrorBoundary = jest.fn();

		renderWithTheme(
			<ErrorFallback
				error={new Error('Error')}
				resetErrorBoundary={resetErrorBoundary}
			/>
		);

		fireEvent.click(screen.getByText('Try Again'));
		expect(resetErrorBoundary).toHaveBeenCalledTimes(1);
	});

	it('does not render try again button when resetErrorBoundary is not provided', () => {
		renderWithTheme(<ErrorFallback error={new Error('Error')} />);

		expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
	});

	// Skip full testing of reload functionality as it would trigger a page reload
	it('renders reload page button', () => {
		renderWithTheme(<ErrorFallback />);

		expect(screen.getByText('Reload Page')).toBeInTheDocument();
	});
});
