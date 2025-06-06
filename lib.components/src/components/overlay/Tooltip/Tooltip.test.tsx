import { act, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { ThemeProvider } from 'styled-components';
import { Tooltip } from './Tooltip';

// Mock theme for testing
const mockTheme = {
	colors: {
		text: {
			primary: '#000000',
			onPrimary: '#ffffff',
		},
	},
	spacing: {
		xs: '4px',
		sm: '8px',
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

const renderWithTheme = (component: React.ReactElement) => {
	return render(<ThemeProvider theme={mockTheme}>{component}</ThemeProvider>);
};

// Mock timers for delay testing
beforeEach(() => {
	jest.useFakeTimers();
});

afterEach(() => {
	jest.runOnlyPendingTimers();
	jest.useRealTimers();
});

describe('Tooltip', () => {
	describe('Basic Rendering', () => {
		it('renders trigger element', () => {
			renderWithTheme(
				<Tooltip content='Tooltip content'>
					<button>Hover me</button>
				</Tooltip>
			);
			expect(screen.getByText('Hover me')).toBeInTheDocument();
		});

		it('renders tooltip content when triggered', () => {
			renderWithTheme(
				<Tooltip content='Tooltip content'>
					<button>Hover me</button>
				</Tooltip>
			);

			const trigger = screen.getByText('Hover me');
			fireEvent.mouseEnter(trigger);
			act(() => {
				jest.advanceTimersByTime(200); // Default show delay
			});

			// Use queryByRole instead of getByRole to avoid errors when it's not visible
			const tooltip = screen.queryByRole('tooltip');
			expect(tooltip).toBeInTheDocument();
			expect(screen.getByText('Tooltip content')).toBeInTheDocument();
		});
	});

	describe('Trigger Behaviors', () => {
		it('shows on hover by default', () => {
			renderWithTheme(
				<Tooltip content='Tooltip content'>
					<button>Hover me</button>
				</Tooltip>
			);

			const trigger = screen.getByText('Hover me');
			fireEvent.mouseEnter(trigger);
			act(() => {
				jest.advanceTimersByTime(200);
			});

			// Check aria-hidden attribute instead of visibility
			const tooltip = document.querySelector('[role="tooltip"]');
			expect(tooltip).toBeInTheDocument();
			expect(tooltip).toHaveAttribute('aria-hidden', 'false');
		});

		it('hides on mouse leave', () => {
			renderWithTheme(
				<Tooltip content='Tooltip content'>
					<button>Hover me</button>
				</Tooltip>
			);

			const trigger = screen.getByText('Hover me');

			// Show tooltip
			fireEvent.mouseEnter(trigger);
			act(() => {
				jest.advanceTimersByTime(200);
			});

			// Hide tooltip
			fireEvent.mouseLeave(trigger);
			act(() => {
				jest.advanceTimersByTime(0); // Default hide delay
			});

			// Check aria-hidden attribute instead of visibility
			const tooltip = document.querySelector('[role="tooltip"]');
			expect(tooltip).toHaveAttribute('aria-hidden', 'true');
		});

		it('shows on focus', () => {
			renderWithTheme(
				<Tooltip content='Tooltip content'>
					<button>Focus me</button>
				</Tooltip>
			);

			const trigger = screen.getByText('Focus me');
			fireEvent.focus(trigger);
			act(() => {
				jest.advanceTimersByTime(200);
			});

			expect(screen.getByRole('tooltip')).toBeVisible();
		});

		it('shows/hides on click when click trigger is specified', () => {
			renderWithTheme(
				<Tooltip content='Tooltip content' trigger={['click']}>
					<button>Click me</button>
				</Tooltip>
			);

			const trigger = screen.getByText('Click me');

			// Show on first click
			fireEvent.click(trigger);
			act(() => {
				jest.advanceTimersByTime(200);
			});

			// Check aria-hidden attribute instead of visibility
			let tooltip = document.querySelector('[role="tooltip"]');
			expect(tooltip).toHaveAttribute('aria-hidden', 'false');

			// Hide on second click
			fireEvent.click(trigger);
			act(() => {
				jest.advanceTimersByTime(0);
			});

			tooltip = document.querySelector('[role="tooltip"]');
			expect(tooltip).toHaveAttribute('aria-hidden', 'true');
		});
	});

	describe('Delays', () => {
		it('respects custom show delay', () => {
			renderWithTheme(
				<Tooltip content='Tooltip content' showDelay={500}>
					<button>Hover me</button>
				</Tooltip>
			);

			const trigger = screen.getByText('Hover me');
			fireEvent.mouseEnter(trigger);

			// Tooltip should not be visible before delay
			act(() => {
				jest.advanceTimersByTime(400);
			});

			let tooltip = document.querySelector('[role="tooltip"]');
			expect(tooltip).toHaveAttribute('aria-hidden', 'true');

			// Tooltip should be visible after delay
			act(() => {
				jest.advanceTimersByTime(100);
			});

			tooltip = document.querySelector('[role="tooltip"]');
			expect(tooltip).toHaveAttribute('aria-hidden', 'false');
		});

		it('respects custom hide delay', () => {
			renderWithTheme(
				<Tooltip content='Tooltip content' hideDelay={300}>
					<button>Hover me</button>
				</Tooltip>
			);

			const trigger = screen.getByText('Hover me');

			// Show tooltip
			fireEvent.mouseEnter(trigger);
			act(() => {
				jest.advanceTimersByTime(200);
			});

			let tooltip = document.querySelector('[role="tooltip"]');
			expect(tooltip).toHaveAttribute('aria-hidden', 'false');

			// Hide tooltip
			fireEvent.mouseLeave(trigger);

			// Should still be visible before hide delay
			act(() => {
				jest.advanceTimersByTime(200);
			});

			tooltip = document.querySelector('[role="tooltip"]');
			expect(tooltip).toHaveAttribute('aria-hidden', 'false');

			// Should be hidden after hide delay
			act(() => {
				jest.advanceTimersByTime(100);
			});

			tooltip = document.querySelector('[role="tooltip"]');
			expect(tooltip).toHaveAttribute('aria-hidden', 'true');
		});
	});

	describe('Controlled Mode', () => {
		it('respects visible prop in controlled mode', () => {
			const { rerender } = renderWithTheme(
				<Tooltip content='Tooltip content' visible={false}>
					<button>Hover me</button>
				</Tooltip>
			);

			let tooltip = document.querySelector('[role="tooltip"]');
			expect(tooltip).toHaveAttribute('aria-hidden', 'true');

			rerender(
				<ThemeProvider theme={mockTheme}>
					<Tooltip content='Tooltip content' visible={true}>
						<button>Hover me</button>
					</Tooltip>
				</ThemeProvider>
			);

			tooltip = document.querySelector('[role="tooltip"]');
			expect(tooltip).toHaveAttribute('aria-hidden', 'false');
		});

		it('calls onVisibleChange when visibility changes', () => {
			const handleVisibleChange = jest.fn();
			renderWithTheme(
				<Tooltip
					content='Tooltip content'
					onVisibleChange={handleVisibleChange}
				>
					<button>Hover me</button>
				</Tooltip>
			);

			const trigger = screen.getByText('Hover me');

			// Show tooltip
			fireEvent.mouseEnter(trigger);
			act(() => {
				jest.advanceTimersByTime(200);
			});
			expect(handleVisibleChange).toHaveBeenLastCalledWith(true);

			// Hide tooltip
			fireEvent.mouseLeave(trigger);
			act(() => {
				jest.advanceTimersByTime(0);
			});
			expect(handleVisibleChange).toHaveBeenLastCalledWith(false);
		});
	});

	describe('Accessibility', () => {
		it('has correct ARIA role', () => {
			renderWithTheme(
				<Tooltip content='Tooltip content' visible={true}>
					<button>Hover me</button>
				</Tooltip>
			);
			expect(screen.getByRole('tooltip')).toBeInTheDocument();
		});

		it('shows on focus for keyboard users', () => {
			renderWithTheme(
				<Tooltip content='Tooltip content'>
					<button>Focus me</button>
				</Tooltip>
			);

			const trigger = screen.getByText('Focus me');
			fireEvent.focus(trigger);
			act(() => {
				jest.advanceTimersByTime(200);
			});

			expect(screen.getByRole('tooltip')).toBeVisible();
		});
	});

	describe('Disabled State', () => {
		it('does not show tooltip when disabled', () => {
			renderWithTheme(
				<Tooltip content='Tooltip content' disabled>
					<button>Hover me</button>
				</Tooltip>
			);

			const trigger = screen.getByText('Hover me');
			fireEvent.mouseEnter(trigger);
			act(() => {
				jest.advanceTimersByTime(200);
			});

			const tooltip = document.querySelector('[role="tooltip"]');
			expect(tooltip).toHaveAttribute('aria-hidden', 'true');
		});
	});
});
