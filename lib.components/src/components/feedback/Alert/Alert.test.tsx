// filepath: c:\Users\thete\Desktop\localdev\pairflix\lib.components\src\components\feedback\Alert\Alert.test.tsx
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import Alert from './Alert';

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
			renderWithTheme(
				<Alert message='This is an alert message' variant='info' />
			);

			expect(screen.getByText('This is an alert message')).toBeInTheDocument();
			expect(screen.getByRole('alert')).toBeInTheDocument();
		});

		it('renders with success variant', () => {
			renderWithTheme(<Alert message='Success message' variant='success' />);

			const alert = screen.getByRole('alert');
			expect(alert).toBeInTheDocument();
			expect(alert).toHaveTextContent('Success message');
			expect(alert).toHaveTextContent('✓');
		});

		it('renders with error variant', () => {
			renderWithTheme(<Alert message='Error message' variant='error' />);

			const alert = screen.getByRole('alert');
			expect(alert).toBeInTheDocument();
			expect(alert).toHaveTextContent('Error message');
			expect(alert).toHaveTextContent('✕');
		});

		it('renders with warning variant', () => {
			renderWithTheme(<Alert message='Warning message' variant='warning' />);

			const alert = screen.getByRole('alert');
			expect(alert).toBeInTheDocument();
			expect(alert).toHaveTextContent('Warning message');
			expect(alert).toHaveTextContent('⚠');
		});

		it('renders with info variant', () => {
			renderWithTheme(<Alert message='Info message' variant='info' />);

			const alert = screen.getByRole('alert');
			expect(alert).toBeInTheDocument();
			expect(alert).toHaveTextContent('Info message');
			expect(alert).toHaveTextContent('ℹ');
		});

		it('displays title when provided', () => {
			renderWithTheme(
				<Alert
					message='Alert details'
					title='Important Information'
					variant='info'
				/>
			);
			expect(screen.getByText('Important Information')).toBeInTheDocument();
			expect(screen.getByText('Alert details')).toBeInTheDocument();
		});

		it('uses custom icon when provided', () => {
			renderWithTheme(
				<Alert message='Custom icon alert' variant='info' icon='🔔' />
			);

			const alert = screen.getByRole('alert');
			expect(alert).toBeInTheDocument();
			expect(alert).toHaveTextContent('🔔');
			expect(alert).not.toHaveTextContent('ℹ'); // Should not have default icon
		});

		it('displays close button when onClose is provided', () => {
			const handleClose = jest.fn();
			renderWithTheme(
				<Alert message='Closable alert' variant='info' onClose={handleClose} />
			);

			const closeButton = screen.getByLabelText('Close alert');
			expect(closeButton).toBeInTheDocument();
		});

		it('calls onClose when close button is clicked', () => {
			const handleClose = jest.fn();
			renderWithTheme(
				<Alert message='Closable alert' variant='info' onClose={handleClose} />
			);

			const closeButton = screen.getByLabelText('Close alert');
			fireEvent.click(closeButton);
			expect(handleClose).toHaveBeenCalledTimes(1);
		});

		it('applies custom className', () => {
			const { container } = renderWithTheme(
				<Alert
					message='Alert with custom class'
					variant='info'
					className='custom-alert'
				/>
			);

			expect(container.firstChild).toHaveClass('custom-alert');
		});
	});

	describe('Basic Rendering', () => {
		it('renders with required props', () => {
			renderWithTheme(<Alert message='Test message' />);
			expect(screen.getByText('Test message')).toBeInTheDocument();
		});

		it('renders with description', () => {
			renderWithTheme(
				<Alert message='Test message' description='More details' />
			);
			expect(screen.getByText('More details')).toBeInTheDocument();
		});

		it('renders with custom icon', () => {
			const iconTestId = 'test-icon';
			renderWithTheme(
				<Alert
					message='Test message'
					icon={<span data-testid={iconTestId}>📢</span>}
				/>
			);
			expect(screen.getByTestId(iconTestId)).toBeInTheDocument();
		});

		it('renders with actions', () => {
			renderWithTheme(
				<Alert message='Test message' actions={<button>Action</button>} />
			);
			expect(
				screen.getByRole('button', { name: 'Action' })
			).toBeInTheDocument();
		});
	});

	describe('Variants and Sizes', () => {
		it('renders all variants correctly', () => {
			const variants = ['info', 'success', 'warning', 'error'] as const;
			const { rerender } = renderWithTheme(
				<Alert message='Test' variant={variants[0]} />
			);

			variants.forEach((variant) => {
				rerender(<Alert message='Test' variant={variant} />);
				const alert = screen.getByRole('alert');
				expect(alert).toBeInTheDocument();
			});
		});

		it('renders all sizes correctly', () => {
			const sizes = ['small', 'medium', 'large'] as const;
			const { rerender } = renderWithTheme(
				<Alert message='Test' size={sizes[0]} />
			);

			sizes.forEach((size) => {
				rerender(<Alert message='Test' size={size} />);
				const alert = screen.getByRole('alert');
				expect(alert).toBeInTheDocument();
			});
		});
	});

	describe('Dismissible Behavior', () => {
		it('shows close button when dismissible', () => {
			renderWithTheme(<Alert message='Test' dismissible />);
			expect(
				screen.getByRole('button', { name: 'Close alert' })
			).toBeInTheDocument();
		});

		it('calls onDismiss when close button is clicked', () => {
			const handleDismiss = jest.fn();
			renderWithTheme(
				<Alert message='Test' dismissible onDismiss={handleDismiss} />
			);

			fireEvent.click(screen.getByRole('button', { name: 'Close alert' }));
			expect(handleDismiss).toHaveBeenCalledTimes(1);
		});

		it('does not show close button when not dismissible', () => {
			renderWithTheme(<Alert message='Test' />);
			expect(
				screen.queryByRole('button', { name: 'Close alert' })
			).not.toBeInTheDocument();
		});
	});

	describe('Visibility Control', () => {
		it('respects visible prop', () => {
			const { rerender } = renderWithTheme(
				<Alert message='Test' visible={false} />
			);
			expect(screen.queryByText('Test')).not.toBeVisible();

			rerender(<Alert message='Test' visible={true} />);
			expect(screen.getByText('Test')).toBeVisible();
		});
	});

	describe('Accessibility', () => {
		it('uses correct ARIA roles', () => {
			renderWithTheme(<Alert message='Test' />);
			expect(screen.getByRole('alert')).toBeInTheDocument();
		});

		it('uses assertive live region for errors', () => {
			renderWithTheme(<Alert message='Error' variant='error' />);
			expect(screen.getByRole('alert')).toHaveAttribute(
				'aria-live',
				'assertive'
			);
		});

		it('uses polite live region for non-errors', () => {
			renderWithTheme(<Alert message='Info' variant='info' />);
			expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
		});
	});

	describe('Animation', () => {
		it('respects animate prop', () => {
			const { rerender } = renderWithTheme(
				<Alert message='Test' animate={false} />
			);
			let alert = screen.getByRole('alert');
			expect(alert).toHaveStyle({ animation: 'none' });

			rerender(<Alert message='Test' animate={true} />);
			alert = screen.getByRole('alert');
			expect(alert).not.toHaveStyle({ animation: 'none' });
		});
	});
});
