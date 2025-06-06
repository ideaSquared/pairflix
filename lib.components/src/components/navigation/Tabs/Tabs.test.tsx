// filepath: c:\Users\thete\Desktop\localdev\pairflix\lib.components\src\components\navigation\Tabs\Tabs.test.tsx
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { ThemeProvider } from 'styled-components';
import { Tab, TabList, TabPanel, Tabs } from './Tabs';

const mockTheme = {
	colors: {
		primary: '#0077cc',
		gray: {
			200: '#e2e8f0',
		},
		white: '#ffffff',
		text: {
			primary: '#000000',
		},
		border: {
			default: '#e0e0e0',
		},
	},
	breakpoints: {
		mobile: '@media (max-width: 768px)',
	},
	spacing: {
		sm: '8px',
		md: '16px',
	},
	typography: {
		fontSize: {
			md: '16px',
		},
	},
};

// Sample tabs data for testing
const mockTabs = [
	{ id: 'tab1', label: 'Tab 1' },
	{ id: 'tab2', label: 'Tab 2' },
	{ id: 'tab3', label: 'Tab 3', disabled: true },
	{ id: 'tab4', label: 'Tab 4', tooltip: 'Tab 4 tooltip' },
];

// Test component with proper TypeScript props
const TabsExample: React.FC<{
	defaultValue?: string;
	value?: string;
	onChange?: (value: string) => void;
	vertical?: boolean;
}> = ({ defaultValue, value, onChange, vertical }) => (
	<Tabs
		defaultValue={defaultValue}
		value={value}
		onChange={onChange}
		vertical={vertical}
	>
		<TabList>
			<Tab value='tab1'>Tab 1</Tab>
			<Tab value='tab2'>Tab 2</Tab>
			<Tab value='tab3' disabled>
				Tab 3
			</Tab>
			<Tab value='tab4'>Tab 4</Tab>
		</TabList>
		<TabPanel value='tab1'>Content 1</TabPanel>
		<TabPanel value='tab2'>Content 2</TabPanel>
		<TabPanel value='tab3'>Content 3</TabPanel>
		<TabPanel value='tab4'>Content 4</TabPanel>
	</Tabs>
);

// Helper function with proper types
const renderWithTheme = (ui: React.ReactElement) => {
	return render(<ThemeProvider theme={mockTheme}>{ui}</ThemeProvider>);
};

describe('Tabs', () => {
	describe('Basic Rendering', () => {
		it('renders all tabs and panels', () => {
			renderWithTheme(<TabsExample />);

			expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument();
			expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument();
			expect(screen.getByRole('tab', { name: 'Tab 3' })).toBeInTheDocument();

			expect(screen.getByRole('tabpanel')).toBeInTheDocument();
		});

		it('renders with correct ARIA attributes', () => {
			renderWithTheme(<TabsExample defaultValue='tab1' />);

			const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
			const panel1 = screen.getByRole('tabpanel');

			expect(tab1).toHaveAttribute('aria-selected', 'true');
			expect(tab1).toHaveAttribute('aria-controls', expect.any(String));
			expect(panel1).toHaveAttribute('aria-labelledby', tab1.id);
		});

		it('applies custom className', () => {
			const { container } = renderWithTheme(
				<Tabs className='custom-tabs' defaultValue='tab1'>
					<TabList>
						<Tab value='tab1'>Tab 1</Tab>
					</TabList>
					<TabPanel value='tab1'>Content 1</TabPanel>
				</Tabs>
			);
			expect(container.firstChild).toHaveClass('custom-tabs');
		});
	});

	describe('Selection Behavior', () => {
		it('selects first non-disabled tab by default', () => {
			renderWithTheme(<TabsExample />);

			const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
			expect(tab1).toHaveAttribute('aria-selected', 'true');
			expect(screen.getByText('Content 1')).toBeInTheDocument();
		});

		it('handles controlled selection', () => {
			const handleChange = jest.fn();
			renderWithTheme(<TabsExample value='tab2' onChange={handleChange} />);

			const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
			expect(tab2).toHaveAttribute('aria-selected', 'true');
			expect(screen.getByText('Content 2')).toBeInTheDocument();
		});

		it('handles uncontrolled selection with defaultValue', () => {
			renderWithTheme(<TabsExample defaultValue='tab2' />);

			const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
			expect(tab2).toHaveAttribute('aria-selected', 'true');
			expect(screen.getByText('Content 2')).toBeInTheDocument();
		});

		it('calls onChange when tab is clicked', () => {
			const handleChange = jest.fn();
			renderWithTheme(<TabsExample onChange={handleChange} />);

			fireEvent.click(screen.getByRole('tab', { name: 'Tab 2' }));
			expect(handleChange).toHaveBeenCalledWith('tab2');
		});
	});

	describe('Keyboard Navigation', () => {
		it('supports arrow key navigation', () => {
			renderWithTheme(<TabsExample defaultValue='tab1' />);

			const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
			const tab2 = screen.getByRole('tab', { name: 'Tab 2' });

			tab1.focus();
			fireEvent.keyDown(tab1, { key: 'ArrowRight' });
			expect(tab2).toHaveAttribute('aria-selected', 'true');
		});

		it('skips disabled tabs in keyboard navigation', () => {
			const handleChange = jest.fn();
			renderWithTheme(
				<TabsExample defaultValue='tab2' onChange={handleChange} />
			);

			const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
			const tab4 = screen.getByRole('tab', { name: 'Tab 4' });

			tab2.focus();
			fireEvent.keyDown(tab2, { key: 'ArrowRight' });

			// After pressing right from Tab 2, it should skip disabled Tab 3 and select Tab 4
			expect(handleChange).toHaveBeenCalledWith('tab4');
		});

		it('supports Home and End keys', () => {
			const handleChange = jest.fn();
			renderWithTheme(
				<TabsExample defaultValue='tab2' onChange={handleChange} />
			);

			const tab2 = screen.getByRole('tab', { name: 'Tab 2' });

			tab2.focus();
			fireEvent.keyDown(tab2, { key: 'Home' });
			expect(handleChange).toHaveBeenCalledWith('tab1');

			// Reset mock to test End key separately
			handleChange.mockReset();
			fireEvent.keyDown(tab2, { key: 'End' });
			expect(handleChange).toHaveBeenCalledWith('tab4');
		});
	});

	describe('Disabled State', () => {
		it('prevents selection of disabled tabs', () => {
			renderWithTheme(<TabsExample defaultValue='tab1' />);

			const tab3 = screen.getByRole('tab', { name: 'Tab 3' });
			fireEvent.click(tab3);

			expect(tab3).toHaveAttribute('aria-selected', 'false');
			expect(screen.queryByText('Content 3')).not.toBeVisible();
		});

		it('applies correct styling to disabled tabs', () => {
			renderWithTheme(<TabsExample />);

			const disabledTab = screen.getByRole('tab', { name: 'Tab 3' });
			expect(disabledTab).toBeDisabled();
			expect(disabledTab).toHaveStyle({ cursor: 'not-allowed' });
		});
	});

	describe('Vertical Layout', () => {
		it('renders in vertical orientation', () => {
			renderWithTheme(<TabsExample vertical />);

			const tabList = screen.getByRole('tablist');
			expect(tabList).toHaveStyle({ flexDirection: 'column' });
		});

		it('supports keyboard navigation in vertical mode', () => {
			renderWithTheme(<TabsExample vertical defaultValue='tab1' />);

			const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
			const tab2 = screen.getByRole('tab', { name: 'Tab 2' });

			tab1.focus();
			fireEvent.keyDown(tab1, { key: 'ArrowDown' });
			expect(tab2).toHaveAttribute('aria-selected', 'true');

			fireEvent.keyDown(tab2, { key: 'ArrowUp' });
			expect(tab1).toHaveAttribute('aria-selected', 'true');
		});
	});

	it('forwards ref correctly', () => {
		const ref = React.createRef<HTMLDivElement>();

		render(
			<ThemeProvider theme={mockTheme}>
				<Tabs ref={ref} defaultValue='tab1'>
					<TabList>
						<Tab value='tab1'>Tab 1</Tab>
					</TabList>
					<TabPanel value='tab1'>Content 1</TabPanel>
				</Tabs>
			</ThemeProvider>
		);

		expect(ref.current).toBeInstanceOf(HTMLDivElement);
	});

	it('allows custom aria-label', () => {
		render(
			<ThemeProvider theme={mockTheme}>
				<Tabs defaultValue='tab1'>
					<TabList aria-label='Custom Tab Navigation'>
						<Tab value='tab1'>Tab 1</Tab>
					</TabList>
					<TabPanel value='tab1'>Content 1</TabPanel>
				</Tabs>
			</ThemeProvider>
		);

		const tablist = screen.getByRole('tablist');
		expect(tablist).toHaveAttribute('aria-label', 'Custom Tab Navigation');
	});
});
