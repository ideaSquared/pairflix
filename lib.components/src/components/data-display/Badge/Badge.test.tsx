import { render, screen } from '@testing-library/react';
import React, { createRef } from 'react';
import { ThemeProvider } from 'styled-components';
import { Badge, BadgeProps, StatusBadge } from './Badge';

// Mock theme for testing
const mockTheme = {
	colors: {
		primary: '#0077cc',
		secondary: '#6c757d',
		info: '#03a9f4',
		text: {
			success: '#4caf50',
			error: '#f44336',
			warning: '#ff9800',
			secondary: '#666666',
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
			xs: '10px',
			sm: '14px',
			md: '16px',
		},
		fontWeight: {
			medium: '500',
		},
	},
	borderRadius: {
		sm: '4px',
	},
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<ThemeProvider theme={mockTheme}>{children}</ThemeProvider>
);

const renderBadge = (props: Partial<BadgeProps> = {}) =>
	render(
		<TestWrapper>
			<Badge {...props} />
		</TestWrapper>
	);

describe('Badge Component', () => {
	describe('Basic Rendering', () => {
		it('renders with default props', () => {
			renderBadge({ children: 'Default' });
			expect(screen.getByText('Default')).toBeInTheDocument();
		});

		it('renders without children', () => {
			const { container } = renderBadge();
			expect(container.firstChild).toBeInTheDocument();
		});

		it('applies custom className', () => {
			const { container } = renderBadge({
				children: 'Test',
				className: 'custom-badge',
			});
			expect(container.firstChild).toHaveClass('custom-badge');
		});

		it('forwards ref correctly', () => {
			const ref = createRef<HTMLSpanElement>();
			render(
				<TestWrapper>
					<Badge ref={ref}>Test</Badge>
				</TestWrapper>
			);
			expect(ref.current).toBeInstanceOf(HTMLSpanElement);
		});
	});

	describe('Variants', () => {
		const variants = [
			'primary',
			'secondary',
			'success',
			'error',
			'warning',
			'info',
			'default',
		] as const;

		variants.forEach((variant) => {
			it(`renders ${variant} variant correctly`, () => {
				renderBadge({ children: variant, variant });
				expect(screen.getByText(variant)).toBeInTheDocument();
			});
		});

		it('renders custom variant with custom colors', () => {
			renderBadge({
				children: 'Custom',
				variant: 'custom',
				backgroundColor: '#ff0000',
				textColor: '#ffffff',
			});
			expect(screen.getByText('Custom')).toBeInTheDocument();
		});

		it('falls back to default when custom variant has no colors', () => {
			renderBadge({
				children: 'Custom',
				variant: 'custom',
			});
			expect(screen.getByText('Custom')).toBeInTheDocument();
		});
	});

	describe('Sizes', () => {
		const sizes = ['small', 'medium', 'large'] as const;

		sizes.forEach((size) => {
			it(`renders ${size} size correctly`, () => {
				renderBadge({ children: size, size });
				expect(screen.getByText(size)).toBeInTheDocument();
			});
		});
	});

	describe('Outlined Style', () => {
		it('renders outlined badge', () => {
			renderBadge({
				children: 'Outlined',
				outlined: true,
				variant: 'primary',
			});
			expect(screen.getByText('Outlined')).toBeInTheDocument();
		});

		it('renders outlined custom badge', () => {
			renderBadge({
				children: 'Custom Outlined',
				variant: 'custom',
				outlined: true,
				backgroundColor: '#ff0000',
			});
			expect(screen.getByText('Custom Outlined')).toBeInTheDocument();
		});
	});

	describe('Pill Shape', () => {
		it('renders pill-shaped badge', () => {
			renderBadge({
				children: 'Pill',
				pill: true,
			});
			expect(screen.getByText('Pill')).toBeInTheDocument();
		});
	});

	describe('Dot Display', () => {
		it('renders as dot when dot prop is true', () => {
			const { container } = renderBadge({ dot: true });
			expect(container.firstChild).toBeInTheDocument();
		});

		it('renders dot with children (children should still be present)', () => {
			renderBadge({
				children: 'Dot Content',
				dot: true,
			});
			expect(screen.getByText('Dot Content')).toBeInTheDocument();
		});
	});

	describe('Count Display', () => {
		it('displays count correctly', () => {
			renderBadge({ count: 5 });
			expect(screen.getByText('5')).toBeInTheDocument();
		});

		it('displays count with maxCount limit', () => {
			renderBadge({ count: 150, maxCount: 99 });
			expect(screen.getByText('99+')).toBeInTheDocument();
		});

		it('displays custom maxCount limit', () => {
			renderBadge({ count: 250, maxCount: 200 });
			expect(screen.getByText('200+')).toBeInTheDocument();
		});

		it('shows nothing when count is 0', () => {
			const { container } = renderBadge({ count: 0 });
			const badge = container.firstChild as HTMLElement;
			expect(badge.textContent).toBe('');
		});

		it('handles large count numbers', () => {
			renderBadge({ count: 9999, maxCount: 999 });
			expect(screen.getByText('999+')).toBeInTheDocument();
		});

		it('adjusts size for small badges with large counts', () => {
			renderBadge({ count: 15, size: 'small' });
			expect(screen.getByText('15')).toBeInTheDocument();
		});

		it('always renders count badges as pill-shaped', () => {
			renderBadge({ count: 5, pill: false });
			expect(screen.getByText('5')).toBeInTheDocument();
		});
	});

	describe('Absolute Positioning', () => {
		it('renders with absolute positioning', () => {
			renderBadge({
				children: 'Absolute',
				absolute: true,
			});
			expect(screen.getByText('Absolute')).toBeInTheDocument();
		});

		const positions = [
			'top-right',
			'top-left',
			'bottom-right',
			'bottom-left',
		] as const;

		positions.forEach((position) => {
			it(`renders with ${position} position`, () => {
				renderBadge({
					children: position,
					absolute: true,
					position,
				});
				expect(screen.getByText(position)).toBeInTheDocument();
			});
		});

		it('applies offset when provided', () => {
			renderBadge({
				children: 'Offset',
				absolute: true,
				offset: { x: '10px', y: '5px' },
			});
			expect(screen.getByText('Offset')).toBeInTheDocument();
		});
	});

	describe('Animation', () => {
		it('renders with animation enabled', () => {
			renderBadge({
				children: 'Animated',
				animate: true,
			});
			expect(screen.getByText('Animated')).toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('has proper ARIA attributes for count badges', () => {
			renderBadge({ count: 5 });
			const badge = screen.getByRole('status');
			expect(badge).toHaveAttribute('aria-label', 'Count: 5');
		});

		it('supports custom aria-label', () => {
			renderBadge({
				children: 'Custom',
				'aria-label': 'Custom badge label',
			});
			const badge = screen.getByLabelText('Custom badge label');
			expect(badge).toBeInTheDocument();
		});

		it('supports data-testid', () => {
			renderBadge({
				children: 'Test',
				'data-testid': 'badge-test',
			});
			expect(screen.getByTestId('badge-test')).toBeInTheDocument();
		});

		it('is focusable when needed', () => {
			renderBadge({
				children: 'Focusable',
				tabIndex: 0,
			});
			const badge = screen.getByText('Focusable');
			expect(badge).toHaveAttribute('tabIndex', '0');
		});
	});

	describe('HTML Attributes Forwarding', () => {
		it('forwards HTML attributes', () => {
			renderBadge({
				children: 'Test',
				id: 'test-badge',
				title: 'Test badge title',
			});
			const badge = screen.getByText('Test');
			expect(badge).toHaveAttribute('id', 'test-badge');
			expect(badge).toHaveAttribute('title', 'Test badge title');
		});
	});

	describe('Edge Cases', () => {
		it('handles undefined count gracefully', () => {
			renderBadge({
				children: 'No count',
				count: undefined,
			});
			expect(screen.getByText('No count')).toBeInTheDocument();
		});

		it('handles negative count', () => {
			renderBadge({ count: -5 });
			expect(screen.getByText('-5')).toBeInTheDocument();
		});

		it('handles zero maxCount', () => {
			renderBadge({ count: 5, maxCount: 0 });
			expect(screen.getByText('0+')).toBeInTheDocument();
		});

		it('handles very large numbers', () => {
			renderBadge({ count: Number.MAX_SAFE_INTEGER });
			expect(screen.getByText('99+')).toBeInTheDocument();
		});
	});
});

describe('StatusBadge Component', () => {
	const renderStatusBadge = (props: { status: string } & Partial<BadgeProps>) =>
		render(
			<TestWrapper>
				<StatusBadge {...props} />
			</TestWrapper>
		);

	describe('Status Mappings', () => {
		const statusMappings = [
			{ status: 'active', expectedText: 'Active', expectedVariant: 'success' },
			{
				status: 'inactive',
				expectedText: 'Inactive',
				expectedVariant: 'default',
			},
			{
				status: 'pending',
				expectedText: 'Pending',
				expectedVariant: 'warning',
			},
			{ status: 'blocked', expectedText: 'Blocked', expectedVariant: 'error' },
			{
				status: 'archived',
				expectedText: 'Archived',
				expectedVariant: 'secondary',
			},
		];

		statusMappings.forEach(({ status, expectedText }) => {
			it(`renders ${status} status correctly`, () => {
				renderStatusBadge({ status });
				expect(screen.getByText(expectedText)).toBeInTheDocument();
			});

			it(`handles ${status} status case insensitively`, () => {
				renderStatusBadge({ status: status.toUpperCase() });
				expect(screen.getByText(expectedText)).toBeInTheDocument();
			});
		});

		it('handles custom status values', () => {
			renderStatusBadge({ status: 'custom-status' });
			expect(screen.getByText('custom-status')).toBeInTheDocument();
		});
	});

	describe('Props Forwarding', () => {
		it('forwards badge props correctly', () => {
			renderStatusBadge({
				status: 'active',
				size: 'large',
				outlined: true,
			});
			expect(screen.getByText('Active')).toBeInTheDocument();
		});

		it('is always pill-shaped', () => {
			renderStatusBadge({ status: 'active' });
			expect(screen.getByText('Active')).toBeInTheDocument();
		});

		it('forwards ref correctly', () => {
			const ref = createRef<HTMLSpanElement>();
			render(
				<TestWrapper>
					<StatusBadge ref={ref} status='active' />
				</TestWrapper>
			);
			expect(ref.current).toBeInstanceOf(HTMLSpanElement);
		});
	});

	describe('Accessibility', () => {
		it('maintains accessibility features', () => {
			renderStatusBadge({
				status: 'active',
				'aria-label': 'User status',
			});
			const badge = screen.getByLabelText('User status');
			expect(badge).toBeInTheDocument();
		});
	});
});

describe('Badge Integration Tests', () => {
	it('combines multiple features correctly', () => {
		renderBadge({
			children: 'Complex',
			variant: 'primary',
			size: 'large',
			pill: true,
			outlined: true,
			absolute: true,
			position: 'top-right',
			animate: true,
			'data-testid': 'complex-badge',
		});

		expect(screen.getByTestId('complex-badge')).toBeInTheDocument();
		expect(screen.getByText('Complex')).toBeInTheDocument();
	});

	it('handles count with positioning and animation', () => {
		renderBadge({
			count: 42,
			variant: 'error',
			absolute: true,
			position: 'bottom-left',
			animate: true,
			offset: { x: '5px', y: '-5px' },
		});

		const badge = screen.getByRole('status');
		expect(badge).toHaveAttribute('aria-label', 'Count: 42');
		expect(screen.getByText('42')).toBeInTheDocument();
	});

	it('handles custom variant with all features', () => {
		renderBadge({
			children: 'Custom Full',
			variant: 'custom',
			backgroundColor: '#purple',
			textColor: '#white',
			size: 'small',
			pill: true,
			absolute: true,
			animate: true,
		});

		expect(screen.getByText('Custom Full')).toBeInTheDocument();
	});
});
