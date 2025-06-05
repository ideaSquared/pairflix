// filepath: c:\Users\thete\Desktop\localdev\pairflix\lib.components\src\components\navigation\Tabs\Tabs.test.tsx
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { ThemeProvider } from 'styled-components';
import { TabItem, Tabs } from './Tabs';

// Mock theme for styled-components
const mockTheme = {
	colors: {
		primary: '#0077cc',
		gray: {
			200: '#e2e8f0',
		},
		white: '#ffffff',
	},
	breakpoints: {
		mobile: '@media (max-width: 768px)',
	},
};

// Sample tabs data for testing
const mockTabs: TabItem[] = [
	{ id: 'tab1', label: 'Tab 1' },
	{ id: 'tab2', label: 'Tab 2' },
	{ id: 'tab3', label: 'Tab 3', disabled: true },
	{ id: 'tab4', label: 'Tab 4', tooltip: 'Tab 4 tooltip' },
];

// Helper function to render tabs with theme
const renderWithTheme = (
	props: Partial<React.ComponentProps<typeof Tabs>> = {}
) => {
	const defaultProps = {
		tabs: mockTabs,
		activeTab: 'tab1',
		onChange: jest.fn(),
	};

	return render(
		<ThemeProvider theme={mockTheme}>
			<Tabs {...defaultProps} {...props} />
		</ThemeProvider>
	);
};

describe('Tabs', () => {
	it('renders all tabs correctly', () => {
		renderWithTheme();

		expect(screen.getByText('Tab 1')).toBeInTheDocument();
		expect(screen.getByText('Tab 2')).toBeInTheDocument();
		expect(screen.getByText('Tab 3')).toBeInTheDocument();
		expect(screen.getByText('Tab 4')).toBeInTheDocument();
	});

	it('marks the active tab correctly', () => {
		renderWithTheme({ activeTab: 'tab2' });

		const tab2 = screen.getByText('Tab 2').closest('button');
		expect(tab2).toHaveAttribute('aria-selected', 'true');

		const tab1 = screen.getByText('Tab 1').closest('button');
		expect(tab1).toHaveAttribute('aria-selected', 'false');
	});

	it('calls onChange when a tab is clicked', () => {
		const handleChange = jest.fn();
		renderWithTheme({ onChange: handleChange });

		fireEvent.click(screen.getByText('Tab 2'));
		expect(handleChange).toHaveBeenCalledWith('tab2');
	});

	it('does not call onChange when a disabled tab is clicked', () => {
		const handleChange = jest.fn();
		renderWithTheme({ onChange: handleChange });

		fireEvent.click(screen.getByText('Tab 3'));
		expect(handleChange).not.toHaveBeenCalled();
	});

	it('renders tabs as disabled when specified', () => {
		renderWithTheme();

		const disabledTab = screen.getByText('Tab 3').closest('button');
		expect(disabledTab).toBeDisabled();
	});

	it('renders with tooltip when provided', () => {
		renderWithTheme();

		const tabWithTooltip = screen.getByText('Tab 4').closest('button');
		expect(tabWithTooltip).toHaveAttribute('title', 'Tab 4 tooltip');
	});

	it('renders icons when provided', () => {
		const tabsWithIcons: TabItem[] = [
			{
				id: 'tab1',
				label: 'Tab 1',
				icon: <span data-testid='icon-1'>🏠</span>,
			},
			{
				id: 'tab2',
				label: 'Tab 2',
				icon: <span data-testid='icon-2'>📚</span>,
			},
		];

		renderWithTheme({ tabs: tabsWithIcons });

		expect(screen.getByTestId('icon-1')).toBeInTheDocument();
		expect(screen.getByTestId('icon-2')).toBeInTheDocument();
	});

	it('renders in vertical layout when specified', () => {
		const { container } = renderWithTheme({ vertical: true });

		// Check if the TabsContainer has vertical styling
		const tabContainer = container.firstChild;
		expect(tabContainer).toHaveStyle('flex-direction: column');

		// Vertical tabs should have right border but no bottom border
		expect(tabContainer).toHaveStyle(
			`border-right: 1px solid ${mockTheme.colors.gray[200]}`
		);
		expect(tabContainer).not.toHaveStyle(
			`border-bottom: 1px solid ${mockTheme.colors.gray[200]}`
		);
	});

	it('renders in horizontal layout by default', () => {
		const { container } = renderWithTheme();

		// Check if the TabsContainer has horizontal styling
		const tabContainer = container.firstChild;
		expect(tabContainer).toHaveStyle('flex-direction: row');

		// Horizontal tabs should have bottom border but no right border
		expect(tabContainer).toHaveStyle(
			`border-bottom: 1px solid ${mockTheme.colors.gray[200]}`
		);
		expect(tabContainer).not.toHaveStyle(
			`border-right: 1px solid ${mockTheme.colors.gray[200]}`
		);
	});

	it('renders with full width when specified', () => {
		const { container } = renderWithTheme({ fullWidth: true });

		const tabContainer = container.firstChild;
		expect(tabContainer).toHaveStyle('width: 100%');
	});

	it('renders with auto width by default', () => {
		const { container } = renderWithTheme();

		const tabContainer = container.firstChild;
		expect(tabContainer).toHaveStyle('width: auto');
	});

	it('has correct accessibility attributes', () => {
		renderWithTheme();

		// Check tablist role
		const tablist = screen.getByRole('tablist');
		expect(tablist).toHaveAttribute('aria-label', 'Navigation tabs');

		// Check tab roles and attributes
		const tabs = screen.getAllByRole('tab');
		expect(tabs).toHaveLength(4);

		// Check first tab has correct aria attributes
		const firstTab = screen.getByText('Tab 1').closest('button');
		expect(firstTab).toHaveAttribute('aria-selected', 'true');
		expect(firstTab).toHaveAttribute('aria-controls', 'tab1-panel');
		expect(firstTab).toHaveAttribute('id', 'tab1-tab');

		// Check second tab has correct aria attributes
		const secondTab = screen.getByText('Tab 2').closest('button');
		expect(secondTab).toHaveAttribute('aria-selected', 'false');
		expect(secondTab).toHaveAttribute('aria-controls', 'tab2-panel');
		expect(secondTab).toHaveAttribute('id', 'tab2-tab');
	});

	it('can be customized with className', () => {
		const { container } = renderWithTheme({ className: 'custom-tabs' });

		const tabContainer = container.firstChild;
		expect(tabContainer).toHaveClass('custom-tabs');
	});

	it('forwards ref correctly', () => {
		const ref = React.createRef<HTMLDivElement>();

		render(
			<ThemeProvider theme={mockTheme}>
				<Tabs tabs={mockTabs} activeTab='tab1' onChange={() => {}} ref={ref} />
			</ThemeProvider>
		);

		expect(ref.current).toBeInstanceOf(HTMLDivElement);
		expect(ref.current?.getAttribute('role')).toBe('tablist');
	});

	it('allows custom aria-label', () => {
		renderWithTheme({ ariaLabel: 'Custom Tab Navigation' });

		const tablist = screen.getByRole('tablist');
		expect(tablist).toHaveAttribute('aria-label', 'Custom Tab Navigation');
	});
});
