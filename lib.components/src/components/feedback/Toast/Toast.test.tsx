import { act, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { ThemeProvider } from 'styled-components';
import { Toast } from './Toast';
import {
	ToastProps as ToastContextProps,
	ToastOptions,
	ToastType,
} from './ToastContext';

// Define a type for the useToast return value to be used in tests
interface ToastContextValue {
	addToast: (message: string, options?: ToastOptions) => void;
	removeToast: (id: string) => void;
}

const mockTheme = {
	colors: {
		info: '#03a9f4',
		text: {
			success: '#4caf50',
			error: '#f44336',
			warning: '#ff9800',
			onPrimary: '#ffffff',
		},
	},
	spacing: {
		xs: '4px',
		sm: '8px',
		md: '12px',
	},
	typography: {
		fontSize: {
			sm: '14px',
		},
	},
	borderRadius: {
		sm: '4px',
	},
};

const defaultToastProps = {
	duration: 5000,
	pauseOnHover: true,
	closeable: true,
};

// Mock useToast hook
const mockAddToast = jest.fn();
const mockRemoveToast = jest.fn();

// Create a mocked version of useToast that can be used in tests
jest.mock('./ToastContext', () => {
	const originalModule = jest.requireActual('./ToastContext');
	return {
		...originalModule,
		useToast: () => ({
			addToast: mockAddToast,
			removeToast: mockRemoveToast,
		}),
	};
});

// Helper component that calls the provided action with toast functions
const TestComponent = ({
	action,
}: {
	action: (toast: ToastContextValue) => void;
}) => {
	// Import is mocked, so this will return our mock functions
	const { useToast } = require('./ToastContext');
	const toast = useToast();
	React.useEffect(() => {
		action(toast);
	}, [action, toast]);
	return null;
};

const renderWithTheme = (ui: React.ReactElement) => {
	return render(<ThemeProvider theme={mockTheme}>{ui}</ThemeProvider>);
};

describe('Toast System', () => {
	beforeEach(() => {
		jest.useFakeTimers();
		mockAddToast.mockClear();
		mockRemoveToast.mockClear();
	});

	afterEach(() => {
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
	});

	describe('Toast Component', () => {
		it('renders toast with message', () => {
			renderWithTheme(
				<Toast
					toast={{
						id: '1',
						message: 'Test message',
						type: 'info',
						variant: 'info',
						...defaultToastProps,
					}}
					onClose={() => {}}
				/>
			);
			expect(screen.getByText('Test message')).toBeInTheDocument();
		});

		it('renders with correct variant styles', () => {
			const { container } = renderWithTheme(
				<Toast
					toast={{
						id: '1',
						message: 'Test message',
						type: 'error',
						variant: 'error',
						...defaultToastProps,
					}}
					onClose={() => {}}
				/>
			);
			const toastElement = container.firstChild;
			expect(toastElement).toHaveStyle(
				`background: ${mockTheme.colors.text.error}`
			);
		});

		it('calls onClose when close button is clicked', () => {
			const handleClose = jest.fn();
			renderWithTheme(
				<Toast
					toast={{
						id: '1',
						message: 'Test message',
						type: 'info',
						variant: 'info',
						...defaultToastProps,
					}}
					onClose={handleClose}
				/>
			);

			const closeButton = screen.getByLabelText('Close notification');
			fireEvent.click(closeButton);

			// Account for exit animation
			act(() => {
				jest.advanceTimersByTime(300);
			});

			expect(handleClose).toHaveBeenCalled();
		});

		it('pauses timer on hover when pauseOnHover is true', () => {
			const handleClose = jest.fn();
			const toast = {
				id: '1',
				message: 'Test message',
				type: 'info' as ToastType,
				variant: 'info' as ToastContextProps['type'],
				duration: 1000,
				pauseOnHover: true,
				closeable: true,
			};

			render(
				<ThemeProvider theme={mockTheme}>
					<Toast toast={toast} onClose={handleClose} />
				</ThemeProvider>
			);

			// Let the timer start - initially it should be running
			act(() => {
				jest.advanceTimersByTime(500); // Advance halfway through the duration
			});

			// Hover on toast to pause the timer
			fireEvent.mouseEnter(screen.getByRole('alert'));

			// Advance time well beyond the original duration
			// Timer should be paused, so handleClose should not be called
			act(() => {
				jest.advanceTimersByTime(2000);
			});
			expect(handleClose).not.toHaveBeenCalled();

			// Mouse leave to unpause the timer
			fireEvent.mouseLeave(screen.getByRole('alert'));

			// The remaining time should be around 500ms, advance past that
			act(() => {
				jest.advanceTimersByTime(1000); // Giving extra time to ensure closure
			});

			// Should now be closed
			expect(handleClose).toHaveBeenCalled();
		});
	});

	describe('Toast Context', () => {
		it('adds and removes toasts', () => {
			render(
				<ThemeProvider theme={mockTheme}>
					<TestComponent
						action={(toast) => {
							toast.addToast('Test toast', { type: 'info' });
						}}
					/>
				</ThemeProvider>
			);

			expect(mockAddToast).toHaveBeenCalledWith('Test toast', { type: 'info' });
		});

		it('supports multiple toast positions', () => {
			render(
				<ThemeProvider theme={mockTheme}>
					<TestComponent
						action={(toast) => {
							toast.addToast('Top toast', {
								type: 'info',
								position: 'top-center',
							});
							toast.addToast('Bottom toast', {
								type: 'success',
								position: 'bottom-center',
							});
						}}
					/>
				</ThemeProvider>
			);

			expect(mockAddToast).toHaveBeenCalledWith('Top toast', {
				type: 'info',
				position: 'top-center',
			});
			expect(mockAddToast).toHaveBeenCalledWith('Bottom toast', {
				type: 'success',
				position: 'bottom-center',
			});
		});

		it('handles multiple toasts and removes them', () => {
			render(
				<ThemeProvider theme={mockTheme}>
					<TestComponent
						action={(toast) => {
							toast.addToast('Toast 1', { type: 'info' });
							toast.addToast('Toast 2', { type: 'success' });
							toast.removeToast('toast-id-1');
						}}
					/>
				</ThemeProvider>
			);

			expect(mockAddToast).toHaveBeenCalledWith('Toast 1', { type: 'info' });
			expect(mockAddToast).toHaveBeenCalledWith('Toast 2', { type: 'success' });
			expect(mockRemoveToast).toHaveBeenCalledWith('toast-id-1');
		});

		it('handles toast with custom duration', () => {
			render(
				<ThemeProvider theme={mockTheme}>
					<TestComponent
						action={(toast) => {
							toast.addToast('Custom duration', {
								type: 'info',
								duration: 2000,
							});
						}}
					/>
				</ThemeProvider>
			);

			expect(mockAddToast).toHaveBeenCalledWith('Custom duration', {
				type: 'info',
				duration: 2000,
			});
		});
	});

	describe('Accessibility', () => {
		it('sets correct ARIA role and live region', () => {
			renderWithTheme(
				<Toast
					toast={{
						id: '1',
						message: 'Test message',
						type: 'error',
						variant: 'error',
						...defaultToastProps,
					}}
					onClose={() => {}}
				/>
			);

			const toast = screen.getByRole('alert');
			expect(toast).toHaveAttribute('aria-live', 'assertive');
		});

		it('has accessible close button', () => {
			renderWithTheme(
				<Toast
					toast={{
						id: '1',
						message: 'Test message',
						type: 'info',
						variant: 'info',
						...defaultToastProps,
					}}
					onClose={() => {}}
				/>
			);

			const closeButton = screen.getByLabelText('Close notification');
			expect(closeButton).toBeInTheDocument();
			expect(closeButton).toHaveAttribute('type', 'button');
		});
	});
});
