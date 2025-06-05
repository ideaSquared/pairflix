// filepath: c:\Users\thete\Desktop\localdev\pairflix\lib.components\src\components\feedback\Alert\Alert.test.tsx
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import Alert, { Toast } from './Alert';

// Mock theme for styled-components
const mockTheme = {
	colors: {
		primary: '#2196f3',
		text: {
			success: '#4caf50',
			error: '#f44336',
			warning: '#ff9800',
		},
	},
	spacing: {
		xs: '4px',
		sm: '8px',
		md: '16px',
		lg: '24px',
		xl: '32px',
	},
	typography: {
		fontSize: {
			sm: '14px',
			md: '16px',
			lg: '18px',
		},
		fontWeight: {
			bold: 700,
		},
	},
	borderRadius: {
		sm: '4px',
	},
};

// Helper function to render with theme
const renderWithTheme = (ui: React.ReactElement) => {
	return render(<ThemeProvider theme={mockTheme}>{ui}</ThemeProvider>);
};

describe('Alert', () => {
	describe('Alert Component', () => {
		it('renders basic alert with content', () => {
			renderWithTheme(<Alert variant='info'>This is an alert message</Alert>);

			expect(screen.getByText('This is an alert message')).toBeInTheDocument();
			expect(screen.getByRole('alert')).toBeInTheDocument();
		});

		it('renders with success variant', () => {
			renderWithTheme(<Alert variant='success'>Success message</Alert>);

			const alert = screen.getByRole('alert');
			expect(alert).toBeInTheDocument();
			expect(alert).toHaveTextContent('Success message');
			expect(alert).toHaveTextContent('✓');
		});

		it('renders with error variant', () => {
			renderWithTheme(<Alert variant='error'>Error message</Alert>);

			const alert = screen.getByRole('alert');
			expect(alert).toBeInTheDocument();
			expect(alert).toHaveTextContent('Error message');
			expect(alert).toHaveTextContent('✕');
		});

		it('renders with warning variant', () => {
			renderWithTheme(<Alert variant='warning'>Warning message</Alert>);

			const alert = screen.getByRole('alert');
			expect(alert).toBeInTheDocument();
			expect(alert).toHaveTextContent('Warning message');
			expect(alert).toHaveTextContent('⚠');
		});

		it('renders with info variant', () => {
			renderWithTheme(<Alert variant='info'>Info message</Alert>);

			const alert = screen.getByRole('alert');
			expect(alert).toBeInTheDocument();
			expect(alert).toHaveTextContent('Info message');
			expect(alert).toHaveTextContent('ℹ');
		});

		it('displays title when provided', () => {
			renderWithTheme(
				<Alert variant='info' title='Important Information'>
					Alert details
				</Alert>
			);

			expect(screen.getByText('Important Information')).toBeInTheDocument();
			expect(screen.getByText('Alert details')).toBeInTheDocument();
		});

		it('uses custom icon when provided', () => {
			renderWithTheme(
				<Alert variant='info' icon='🔔'>
					Custom icon alert
				</Alert>
			);

			const alert = screen.getByRole('alert');
			expect(alert).toBeInTheDocument();
			expect(alert).toHaveTextContent('🔔');
			expect(alert).not.toHaveTextContent('ℹ'); // Should not have default icon
		});

		it('displays close button when onClose is provided', () => {
			const handleClose = jest.fn();
			renderWithTheme(
				<Alert variant='info' onClose={handleClose}>
					Closable alert
				</Alert>
			);

			const closeButton = screen.getByLabelText('Close alert');
			expect(closeButton).toBeInTheDocument();
		});

		it('calls onClose when close button is clicked', () => {
			const handleClose = jest.fn();
			renderWithTheme(
				<Alert variant='info' onClose={handleClose}>
					Closable alert
				</Alert>
			);

			const closeButton = screen.getByLabelText('Close alert');
			fireEvent.click(closeButton);
			expect(handleClose).toHaveBeenCalledTimes(1);
		});

		it('applies custom className', () => {
			const { container } = renderWithTheme(
				<Alert variant='info' className='custom-alert'>
					Alert with custom class
				</Alert>
			);

			expect(container.firstChild).toHaveClass('custom-alert');
		});
	});

	describe('Toast Component', () => {
		beforeEach(() => {
			jest.useFakeTimers();
		});

		afterEach(() => {
			jest.useRealTimers();
		});

		it('renders toast with default props', () => {
			renderWithTheme(<Toast variant='info'>Toast message</Toast>);

			expect(screen.getByRole('alert')).toBeInTheDocument();
			expect(screen.getByText('Toast message')).toBeInTheDocument();
		});

		it('auto-dismisses after specified duration', () => {
			const handleClose = jest.fn();
			renderWithTheme(
				<Toast variant='info' duration={3000} onClose={handleClose}>
					Auto-dismiss toast
				</Toast>
			);

			// Timer should not have fired yet
			expect(handleClose).not.toHaveBeenCalled();

			// Fast-forward time
			act(() => {
				jest.advanceTimersByTime(3000);
			});

			// onClose should have been called
			expect(handleClose).toHaveBeenCalledTimes(1);
		});

		it('does not auto-dismiss when duration is 0', () => {
			const handleClose = jest.fn();
			renderWithTheme(
				<Toast variant='info' duration={0} onClose={handleClose}>
					Persistent toast
				</Toast>
			);

			// Fast-forward time significantly
			act(() => {
				jest.advanceTimersByTime(10000);
			});

			// onClose should not have been called
			expect(handleClose).not.toHaveBeenCalled();
		});

		it('cleans up timer on unmount', () => {
			const handleClose = jest.fn();
			const { unmount } = renderWithTheme(
				<Toast variant='info' duration={3000} onClose={handleClose}>
					Unmounting toast
				</Toast>
			);

			// Unmount component before timer fires
			unmount();

			// Advance time past when timer would have fired
			act(() => {
				jest.advanceTimersByTime(5000);
			});

			// onClose should not have been called
			expect(handleClose).not.toHaveBeenCalled();
		});
	});
});
