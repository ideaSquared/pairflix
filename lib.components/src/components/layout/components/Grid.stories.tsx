import type { Meta, StoryObj } from '@storybook/react-webpack5';
import styled from 'styled-components';

import { Grid } from './Grid';

// Styled components for demonstration
const DemoContent = styled.div`
	font-family: ${({ theme }) => theme?.typography?.fontFamily || 'sans-serif'};
	padding: 20px;
	color: ${({ theme }) => theme?.colors?.text?.primary || '#333'};
`;

const SectionTitle = styled.h3`
	margin: 0 0 16px 0;
	font-size: 18px;
	font-weight: 500;
`;

const SectionDescription = styled.p`
	margin: 0 0 16px 0;
	color: ${({ theme }) => theme?.colors?.text?.secondary || '#666'};
	font-size: 14px;
`;

// Grid item for demonstration
const GridItem = styled.div<{ color?: string; height?: string }>`
	background-color: ${({ color, theme }) =>
		color || theme?.colors?.primary?.[500] || '#3f51b5'};
	color: white;
	padding: 16px;
	border-radius: 4px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 500;
	font-size: 14px;
	height: ${({ height }) => height || 'auto'};
	min-height: 60px;
	box-shadow: ${({ theme }) =>
		theme?.shadows?.sm || '0 2px 4px rgba(0, 0, 0, 0.1)'};
`;

const ResponsiveIndicator = styled.div`
	position: fixed;
	top: 8px;
	right: 8px;
	background-color: rgba(0, 0, 0, 0.7);
	color: white;
	padding: 4px 8px;
	font-size: 12px;
	border-radius: 4px;
	z-index: 1000;

	@media (max-width: 480px) {
		&::after {
			content: 'Mobile View';
		}
		background-color: #f44336;
	}

	@media (min-width: 481px) and (max-width: 768px) {
		&::after {
			content: 'Tablet View';
		}
		background-color: #ff9800;
	}

	@media (min-width: 769px) and (max-width: 1024px) {
		&::after {
			content: 'Desktop View';
		}
		background-color: #4caf50;
	}

	@media (min-width: 1025px) {
		&::after {
			content: 'Large Desktop View';
		}
		background-color: #2196f3;
	}
`;

const Meta: Meta<typeof Grid> = {
	title: 'Layout/Grid',
	component: Grid,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'A flexible grid layout component with responsive behavior and comprehensive CSS Grid capabilities.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		columns: {
			control: { type: 'number', min: 1, max: 12 },
			description:
				'Number of grid columns or custom grid-template-columns value',
			table: {
				defaultValue: { summary: '1' },
			},
		},
		gap: {
			control: 'select',
			options: ['xs', 'sm', 'md', 'lg', 'xl'],
			description: 'Gap between grid items using theme spacing',
			table: {
				defaultValue: { summary: 'md' },
			},
		},
		alignItems: {
			control: 'select',
			options: ['start', 'center', 'end', 'stretch'],
			description: 'Vertical alignment of grid items',
			table: {
				defaultValue: { summary: 'stretch' },
			},
		},
		justifyContent: {
			control: 'select',
			options: [
				'start',
				'center',
				'end',
				'space-between',
				'space-around',
				'flex-start',
				'flex-end',
			],
			description: 'Horizontal alignment of grid items',
			table: {
				defaultValue: { summary: 'start' },
			},
		},
		mobileColumns: {
			control: { type: 'number', min: 1, max: 6 },
			description: 'Number of columns on mobile devices',
		},
		tabletColumns: {
			control: { type: 'number', min: 1, max: 8 },
			description: 'Number of columns on tablet devices',
		},
		desktopColumns: {
			control: { type: 'number', min: 1, max: 12 },
			description: 'Number of columns on desktop devices',
		},
		autoFit: {
			control: 'boolean',
			description: 'Whether to auto-fit columns to available space',
			table: {
				defaultValue: { summary: 'false' },
			},
		},
		minColWidth: {
			control: 'text',
			description: 'Minimum width of auto-fit columns',
		},
	},
};

export default Meta;
type Story = StoryObj<typeof Grid>;

// Basic Grid
export const Basic: Story = {
	args: {
		columns: 3,
		gap: 'md',
		children: [
			<GridItem key='1'>Item 1</GridItem>,
			<GridItem key='2' color='#7e57c2'>
				Item 2
			</GridItem>,
			<GridItem key='3' color='#5c6bc0'>
				Item 3
			</GridItem>,
			<GridItem key='4' color='#4caf50'>
				Item 4
			</GridItem>,
			<GridItem key='5' color='#ff9800'>
				Item 5
			</GridItem>,
			<GridItem key='6' color='#f44336'>
				Item 6
			</GridItem>,
		],
	},
};

// Column Variations
export const ColumnVariations: Story = {
	render: () => (
		<DemoContent>
			<ResponsiveIndicator />

			<SectionTitle>Column Variations</SectionTitle>
			<SectionDescription>
				Demonstration of different column configurations.
			</SectionDescription>

			<SectionTitle style={{ fontSize: '16px', marginTop: '24px' }}>
				1 Column Grid
			</SectionTitle>
			<Grid columns={1} gap='md'>
				<GridItem>Single Column</GridItem>
				<GridItem color='#7e57c2'>Single Column</GridItem>
			</Grid>

			<SectionTitle style={{ fontSize: '16px', marginTop: '24px' }}>
				2 Column Grid
			</SectionTitle>
			<Grid columns={2} gap='md'>
				<GridItem>Two Columns</GridItem>
				<GridItem color='#7e57c2'>Two Columns</GridItem>
				<GridItem color='#5c6bc0'>Two Columns</GridItem>
				<GridItem color='#4caf50'>Two Columns</GridItem>
			</Grid>

			<SectionTitle style={{ fontSize: '16px', marginTop: '24px' }}>
				3 Column Grid
			</SectionTitle>
			<Grid columns={3} gap='md'>
				<GridItem>Three Columns</GridItem>
				<GridItem color='#7e57c2'>Three Columns</GridItem>
				<GridItem color='#5c6bc0'>Three Columns</GridItem>
				<GridItem color='#4caf50'>Three Columns</GridItem>
				<GridItem color='#ff9800'>Three Columns</GridItem>
				<GridItem color='#f44336'>Three Columns</GridItem>
			</Grid>

			<SectionTitle style={{ fontSize: '16px', marginTop: '24px' }}>
				4 Column Grid
			</SectionTitle>
			<Grid columns={4} gap='md'>
				<GridItem>Four Columns</GridItem>
				<GridItem color='#7e57c2'>Four Columns</GridItem>
				<GridItem color='#5c6bc0'>Four Columns</GridItem>
				<GridItem color='#4caf50'>Four Columns</GridItem>
				<GridItem color='#ff9800'>Four Columns</GridItem>
				<GridItem color='#f44336'>Four Columns</GridItem>
				<GridItem color='#e91e63'>Four Columns</GridItem>
				<GridItem color='#9c27b0'>Four Columns</GridItem>
			</Grid>

			<SectionTitle style={{ fontSize: '16px', marginTop: '24px' }}>
				Custom Grid Template
			</SectionTitle>
			<Grid columns='1fr 2fr 1fr' gap='md'>
				<GridItem>1fr width</GridItem>
				<GridItem color='#7e57c2'>2fr width</GridItem>
				<GridItem color='#5c6bc0'>1fr width</GridItem>
			</Grid>
		</DemoContent>
	),
};

// Gap Variations
export const GapVariations: Story = {
	render: () => (
		<DemoContent>
			<SectionTitle>Gap Variations</SectionTitle>
			<SectionDescription>
				Demonstration of different gap sizes between grid items.
			</SectionDescription>

			<SectionTitle style={{ fontSize: '16px', marginTop: '24px' }}>
				Extra Small Gap (xs)
			</SectionTitle>
			<Grid columns={3} gap='xs'>
				<GridItem>xs gap</GridItem>
				<GridItem color='#7e57c2'>xs gap</GridItem>
				<GridItem color='#5c6bc0'>xs gap</GridItem>
				<GridItem color='#4caf50'>xs gap</GridItem>
				<GridItem color='#ff9800'>xs gap</GridItem>
				<GridItem color='#f44336'>xs gap</GridItem>
			</Grid>

			<SectionTitle style={{ fontSize: '16px', marginTop: '24px' }}>
				Small Gap (sm)
			</SectionTitle>
			<Grid columns={3} gap='sm'>
				<GridItem>sm gap</GridItem>
				<GridItem color='#7e57c2'>sm gap</GridItem>
				<GridItem color='#5c6bc0'>sm gap</GridItem>
				<GridItem color='#4caf50'>sm gap</GridItem>
				<GridItem color='#ff9800'>sm gap</GridItem>
				<GridItem color='#f44336'>sm gap</GridItem>
			</Grid>

			<SectionTitle style={{ fontSize: '16px', marginTop: '24px' }}>
				Medium Gap (md) - Default
			</SectionTitle>
			<Grid columns={3} gap='md'>
				<GridItem>md gap</GridItem>
				<GridItem color='#7e57c2'>md gap</GridItem>
				<GridItem color='#5c6bc0'>md gap</GridItem>
				<GridItem color='#4caf50'>md gap</GridItem>
				<GridItem color='#ff9800'>md gap</GridItem>
				<GridItem color='#f44336'>md gap</GridItem>
			</Grid>

			<SectionTitle style={{ fontSize: '16px', marginTop: '24px' }}>
				Large Gap (lg)
			</SectionTitle>
			<Grid columns={3} gap='lg'>
				<GridItem>lg gap</GridItem>
				<GridItem color='#7e57c2'>lg gap</GridItem>
				<GridItem color='#5c6bc0'>lg gap</GridItem>
				<GridItem color='#4caf50'>lg gap</GridItem>
				<GridItem color='#ff9800'>lg gap</GridItem>
				<GridItem color='#f44336'>lg gap</GridItem>
			</Grid>

			<SectionTitle style={{ fontSize: '16px', marginTop: '24px' }}>
				Extra Large Gap (xl)
			</SectionTitle>
			<Grid columns={3} gap='xl'>
				<GridItem>xl gap</GridItem>
				<GridItem color='#7e57c2'>xl gap</GridItem>
				<GridItem color='#5c6bc0'>xl gap</GridItem>
				<GridItem color='#4caf50'>xl gap</GridItem>
				<GridItem color='#ff9800'>xl gap</GridItem>
				<GridItem color='#f44336'>xl gap</GridItem>
			</Grid>
		</DemoContent>
	),
};

// Alignment Options
export const AlignmentOptions: Story = {
	render: () => (
		<DemoContent>
			<SectionTitle>Alignment Options</SectionTitle>
			<SectionDescription>
				Demonstration of different alignment options for grid items.
			</SectionDescription>

			<SectionTitle style={{ fontSize: '16px', marginTop: '24px' }}>
				Vertical Alignment (alignItems)
			</SectionTitle>

			<SectionTitle
				style={{ fontSize: '14px', marginTop: '16px', color: '#666' }}
			>
				alignItems="start"
			</SectionTitle>
			<Grid
				columns={4}
				gap='md'
				alignItems='start'
				style={{ height: '150px', border: '1px dashed #ccc' }}
			>
				<GridItem height='60px'>Short</GridItem>
				<GridItem height='90px' color='#7e57c2'>
					Medium
				</GridItem>
				<GridItem height='120px' color='#5c6bc0'>
					Tall
				</GridItem>
				<GridItem height='75px' color='#4caf50'>
					Average
				</GridItem>
			</Grid>

			<SectionTitle
				style={{ fontSize: '14px', marginTop: '16px', color: '#666' }}
			>
				alignItems="center"
			</SectionTitle>
			<Grid
				columns={4}
				gap='md'
				alignItems='center'
				style={{ height: '150px', border: '1px dashed #ccc' }}
			>
				<GridItem height='60px'>Short</GridItem>
				<GridItem height='90px' color='#7e57c2'>
					Medium
				</GridItem>
				<GridItem height='120px' color='#5c6bc0'>
					Tall
				</GridItem>
				<GridItem height='75px' color='#4caf50'>
					Average
				</GridItem>
			</Grid>

			<SectionTitle
				style={{ fontSize: '14px', marginTop: '16px', color: '#666' }}
			>
				alignItems="end"
			</SectionTitle>
			<Grid
				columns={4}
				gap='md'
				alignItems='end'
				style={{ height: '150px', border: '1px dashed #ccc' }}
			>
				<GridItem height='60px'>Short</GridItem>
				<GridItem height='90px' color='#7e57c2'>
					Medium
				</GridItem>
				<GridItem height='120px' color='#5c6bc0'>
					Tall
				</GridItem>
				<GridItem height='75px' color='#4caf50'>
					Average
				</GridItem>
			</Grid>

			<SectionTitle
				style={{ fontSize: '14px', marginTop: '16px', color: '#666' }}
			>
				alignItems="stretch" (Default)
			</SectionTitle>
			<Grid
				columns={4}
				gap='md'
				alignItems='stretch'
				style={{ height: '150px', border: '1px dashed #ccc' }}
			>
				<GridItem>Stretch</GridItem>
				<GridItem color='#7e57c2'>Stretch</GridItem>
				<GridItem color='#5c6bc0'>Stretch</GridItem>
				<GridItem color='#4caf50'>Stretch</GridItem>
			</Grid>

			<SectionTitle style={{ fontSize: '16px', marginTop: '32px' }}>
				Horizontal Alignment (justifyContent)
			</SectionTitle>

			<SectionTitle
				style={{ fontSize: '14px', marginTop: '16px', color: '#666' }}
			>
				justifyContent="start" (Default)
			</SectionTitle>
			<Grid columns={4} gap='md' justifyContent='start'>
				<GridItem style={{ gridColumn: 'span 1' }}>Item 1</GridItem>
				<GridItem style={{ gridColumn: 'span 1' }} color='#7e57c2'>
					Item 2
				</GridItem>
			</Grid>

			<SectionTitle
				style={{ fontSize: '14px', marginTop: '16px', color: '#666' }}
			>
				justifyContent="center"
			</SectionTitle>
			<Grid columns={4} gap='md' justifyContent='center'>
				<GridItem style={{ gridColumn: 'span 1' }}>Item 1</GridItem>
				<GridItem style={{ gridColumn: 'span 1' }} color='#7e57c2'>
					Item 2
				</GridItem>
			</Grid>

			<SectionTitle
				style={{ fontSize: '14px', marginTop: '16px', color: '#666' }}
			>
				justifyContent="end"
			</SectionTitle>
			<Grid columns={4} gap='md' justifyContent='end'>
				<GridItem style={{ gridColumn: 'span 1' }}>Item 1</GridItem>
				<GridItem style={{ gridColumn: 'span 1' }} color='#7e57c2'>
					Item 2
				</GridItem>
			</Grid>

			<SectionTitle
				style={{ fontSize: '14px', marginTop: '16px', color: '#666' }}
			>
				justifyContent="space-between"
			</SectionTitle>
			<Grid columns={4} gap='md' justifyContent='space-between'>
				<GridItem style={{ gridColumn: 'span 1' }}>Item 1</GridItem>
				<GridItem style={{ gridColumn: 'span 1' }} color='#7e57c2'>
					Item 2
				</GridItem>
			</Grid>

			<SectionTitle
				style={{ fontSize: '14px', marginTop: '16px', color: '#666' }}
			>
				justifyContent="space-around"
			</SectionTitle>
			<Grid columns={4} gap='md' justifyContent='space-around'>
				<GridItem style={{ gridColumn: 'span 1' }}>Item 1</GridItem>
				<GridItem style={{ gridColumn: 'span 1' }} color='#7e57c2'>
					Item 2
				</GridItem>
			</Grid>
		</DemoContent>
	),
};

// Responsive Grid
export const ResponsiveGrid: Story = {
	render: () => (
		<DemoContent>
			<ResponsiveIndicator />

			<SectionTitle>Responsive Grid</SectionTitle>
			<SectionDescription>
				Demonstration of responsive behavior using different column counts for
				different screen sizes. Resize your browser window to see the grid
				adapt.
			</SectionDescription>

			<SectionTitle style={{ fontSize: '16px', marginTop: '24px' }}>
				Responsive Columns
			</SectionTitle>
			<Grid
				columns={4}
				desktopColumns={4}
				tabletColumns={2}
				mobileColumns={1}
				gap='md'
			>
				<GridItem>
					<div>4 cols on desktop</div>
					<div>2 cols on tablet</div>
					<div>1 col on mobile</div>
				</GridItem>
				<GridItem color='#7e57c2'>
					<div>4 cols on desktop</div>
					<div>2 cols on tablet</div>
					<div>1 col on mobile</div>
				</GridItem>
				<GridItem color='#5c6bc0'>
					<div>4 cols on desktop</div>
					<div>2 cols on tablet</div>
					<div>1 col on mobile</div>
				</GridItem>
				<GridItem color='#4caf50'>
					<div>4 cols on desktop</div>
					<div>2 cols on tablet</div>
					<div>1 col on mobile</div>
				</GridItem>
				<GridItem color='#ff9800'>
					<div>4 cols on desktop</div>
					<div>2 cols on tablet</div>
					<div>1 col on mobile</div>
				</GridItem>
				<GridItem color='#f44336'>
					<div>4 cols on desktop</div>
					<div>2 cols on tablet</div>
					<div>1 col on mobile</div>
				</GridItem>
				<GridItem color='#e91e63'>
					<div>4 cols on desktop</div>
					<div>2 cols on tablet</div>
					<div>1 col on mobile</div>
				</GridItem>
				<GridItem color='#9c27b0'>
					<div>4 cols on desktop</div>
					<div>2 cols on tablet</div>
					<div>1 col on mobile</div>
				</GridItem>
			</Grid>

			<SectionTitle style={{ fontSize: '16px', marginTop: '32px' }}>
				Default Responsive Behavior
			</SectionTitle>
			<SectionDescription>
				Without explicit responsive props, the Grid component has sensible
				defaults: Desktop: Uses the columns prop Tablet: Maximum of 2 columns
				Mobile: Single column
			</SectionDescription>
			<Grid columns={4} gap='md'>
				<GridItem>Default responsive behavior</GridItem>
				<GridItem color='#7e57c2'>Default responsive behavior</GridItem>
				<GridItem color='#5c6bc0'>Default responsive behavior</GridItem>
				<GridItem color='#4caf50'>Default responsive behavior</GridItem>
			</Grid>
		</DemoContent>
	),
};

// Auto-fit Grid
export const AutoFitGrid: Story = {
	render: () => (
		<DemoContent>
			<ResponsiveIndicator />

			<SectionTitle>Auto-fit Columns</SectionTitle>
			<SectionDescription>
				Demonstration of auto-fit columns that adapt to available space. Resize
				your browser window to see columns adapt.
			</SectionDescription>

			<SectionTitle style={{ fontSize: '16px', marginTop: '24px' }}>
				Auto-fit with 150px minimum column width
			</SectionTitle>
			<Grid autoFit minColWidth='150px' gap='md'>
				<GridItem>Auto-fit</GridItem>
				<GridItem color='#7e57c2'>Auto-fit</GridItem>
				<GridItem color='#5c6bc0'>Auto-fit</GridItem>
				<GridItem color='#4caf50'>Auto-fit</GridItem>
				<GridItem color='#ff9800'>Auto-fit</GridItem>
				<GridItem color='#f44336'>Auto-fit</GridItem>
			</Grid>

			<SectionTitle style={{ fontSize: '16px', marginTop: '24px' }}>
				Auto-fit with 250px minimum column width
			</SectionTitle>
			<Grid autoFit minColWidth='250px' gap='md'>
				<GridItem>Auto-fit (250px min)</GridItem>
				<GridItem color='#7e57c2'>Auto-fit (250px min)</GridItem>
				<GridItem color='#5c6bc0'>Auto-fit (250px min)</GridItem>
				<GridItem color='#4caf50'>Auto-fit (250px min)</GridItem>
				<GridItem color='#ff9800'>Auto-fit (250px min)</GridItem>
				<GridItem color='#f44336'>Auto-fit (250px min)</GridItem>
			</Grid>
		</DemoContent>
	),
};

// Real-world UI Patterns
export const UIPatterns: Story = {
	render: () => (
		<DemoContent>
			<SectionTitle>Common UI Patterns with Grid</SectionTitle>
			<SectionDescription>
				Real-world examples of UI patterns built with the Grid component.
			</SectionDescription>

			<SectionTitle style={{ fontSize: '16px', marginTop: '24px' }}>
				Product Cards Grid
			</SectionTitle>
			<Grid autoFit minColWidth='250px' gap='md'>
				{[1, 2, 3, 4, 5, 6].map((item) => (
					<div
						key={item}
						style={{
							border: '1px solid #e0e0e0',
							borderRadius: '6px',
							overflow: 'hidden',
							boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
						}}
					>
						<div
							style={{
								height: '180px',
								backgroundColor:
									item % 3 === 0
										? '#5c6bc0'
										: item % 3 === 1
										? '#7e57c2'
										: '#4caf50',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								color: 'white',
								fontWeight: 'bold',
							}}
						>
							Product Image
						</div>
						<div style={{ padding: '16px' }}>
							<h4 style={{ margin: '0 0 8px 0' }}>Product {item}</h4>
							<p style={{ margin: '0 0 16px 0', color: '#666' }}>
								Product description goes here. This is a short description.
							</p>
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
								}}
							>
								<span style={{ fontWeight: 'bold' }}>$29.99</span>
								<button
									style={{
										backgroundColor: '#3f51b5',
										color: 'white',
										border: 'none',
										borderRadius: '4px',
										padding: '8px 12px',
										cursor: 'pointer',
									}}
								>
									Add to Cart
								</button>
							</div>
						</div>
					</div>
				))}
			</Grid>

			<SectionTitle style={{ fontSize: '16px', marginTop: '32px' }}>
				Dashboard Layout
			</SectionTitle>
			<Grid columns='250px 1fr' gap='lg' style={{ minHeight: '400px' }}>
				<div
					style={{
						backgroundColor: '#f5f5f5',
						borderRadius: '6px',
						padding: '16px',
						display: 'flex',
						flexDirection: 'column',
						gap: '8px',
					}}
				>
					<div
						style={{
							padding: '12px',
							backgroundColor: '#3f51b5',
							color: 'white',
							borderRadius: '4px',
							fontWeight: '500',
						}}
					>
						Dashboard
					</div>
					{['Analytics', 'Users', 'Products', 'Orders', 'Settings'].map(
						(item) => (
							<div
								key={item}
								style={{
									padding: '12px',
									borderRadius: '4px',
									cursor: 'pointer',
									color: '#333',
									fontWeight: '500',
								}}
							>
								{item}
							</div>
						)
					)}
				</div>
				<div>
					<Grid columns={3} gap='md' style={{ marginBottom: '16px' }}>
						<GridItem style={{ height: '100px' }}>Total Sales</GridItem>
						<GridItem style={{ height: '100px' }} color='#7e57c2'>
							New Customers
						</GridItem>
						<GridItem style={{ height: '100px' }} color='#5c6bc0'>
							Conversion Rate
						</GridItem>
					</Grid>
					<Grid columns={2} gap='md'>
						<GridItem style={{ height: '200px' }}>
							Monthly Revenue Chart
						</GridItem>
						<GridItem style={{ height: '200px' }} color='#4caf50'>
							Traffic Sources
						</GridItem>
					</Grid>
				</div>
			</Grid>

			<SectionTitle style={{ fontSize: '16px', marginTop: '32px' }}>
				Photo Gallery
			</SectionTitle>
			<Grid autoFit minColWidth='150px' gap='sm'>
				{Array.from({ length: 12 }).map((_, index) => (
					<div
						key={index}
						style={{
							paddingBottom: '100%', // 1:1 aspect ratio
							position: 'relative',
							backgroundColor:
								index % 5 === 0
									? '#3f51b5'
									: index % 5 === 1
									? '#7e57c2'
									: index % 5 === 2
									? '#5c6bc0'
									: index % 5 === 3
									? '#4caf50'
									: '#ff9800',
							borderRadius: '4px',
							overflow: 'hidden',
						}}
					>
						<div
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								right: 0,
								bottom: 0,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								color: 'white',
								fontWeight: '500',
							}}
						>
							Photo {index + 1}
						</div>
					</div>
				))}
			</Grid>

			<SectionTitle style={{ fontSize: '16px', marginTop: '32px' }}>
				Content with Sidebar
			</SectionTitle>
			<Grid columns='1fr 3fr' gap='lg' tabletColumns='1fr' mobileColumns='1fr'>
				<div
					style={{
						backgroundColor: '#f5f5f5',
						padding: '16px',
						borderRadius: '6px',
					}}
				>
					<h4 style={{ marginTop: 0 }}>Categories</h4>
					<ul
						style={{
							listStyle: 'none',
							padding: 0,
							margin: 0,
						}}
					>
						{['Technology', 'Design', 'Business', 'Marketing', 'Lifestyle'].map(
							(item) => (
								<li
									key={item}
									style={{
										padding: '8px 0',
										borderBottom: '1px solid #e0e0e0',
									}}
								>
									{item}
								</li>
							)
						)}
					</ul>

					<h4 style={{ marginTop: '24px' }}>Recent Posts</h4>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: '12px',
						}}
					>
						{[
							'How to improve UX',
							'Top 10 design trends',
							'Productivity tips',
						].map((item) => (
							<div
								key={item}
								style={{
									fontSize: '14px',
									color: '#3f51b5',
									cursor: 'pointer',
								}}
							>
								{item}
							</div>
						))}
					</div>
				</div>

				<div>
					<h2 style={{ marginTop: 0 }}>Main Content Area</h2>
					<p>
						This is the main content area where blog posts or article content
						would appear. The sidebar can be used for categories, recent posts,
						tags, or other related content.
					</p>
					<p>
						On mobile devices, the sidebar will stack below or above the main
						content area depending on the DOM order.
					</p>
					<div
						style={{
							backgroundColor: '#f5f5f5',
							borderRadius: '6px',
							padding: '16px',
							marginTop: '24px',
						}}
					>
						<h3 style={{ marginTop: 0 }}>Featured Content</h3>
						<Grid columns={2} gap='md' mobileColumns={1}>
							<GridItem>Featured Item 1</GridItem>
							<GridItem color='#7e57c2'>Featured Item 2</GridItem>
						</Grid>
					</div>
				</div>
			</Grid>
		</DemoContent>
	),
};

// Mixed Size Items
export const MixedSizeItems: Story = {
	render: () => (
		<DemoContent>
			<SectionTitle>Grid with Mixed Size Items</SectionTitle>
			<SectionDescription>
				Creating a masonry-like layout using grid-column and grid-row spans.
			</SectionDescription>

			<Grid columns={4} gap='md' tabletColumns={2} mobileColumns={1}>
				<GridItem
					style={{ gridColumn: 'span 2', gridRow: 'span 2', height: '200px' }}
				>
					2×2 Item
				</GridItem>
				<GridItem color='#7e57c2'>1×1 Item</GridItem>
				<GridItem color='#5c6bc0'>1×1 Item</GridItem>
				<GridItem color='#4caf50' style={{ gridColumn: 'span 2' }}>
					2×1 Item
				</GridItem>
				<GridItem color='#ff9800'>1×1 Item</GridItem>
				<GridItem color='#f44336' style={{ gridColumn: 'span 3' }}>
					3×1 Item
				</GridItem>
				<GridItem color='#e91e63'>1×1 Item</GridItem>
				<GridItem color='#9c27b0' style={{ gridRow: 'span 2' }}>
					1×2 Item
				</GridItem>
				<GridItem color='#2196f3'>1×1 Item</GridItem>
				<GridItem color='#009688'>1×1 Item</GridItem>
				<GridItem color='#ffeb3b'>1×1 Item</GridItem>
			</Grid>

			<SectionDescription style={{ marginTop: '24px' }}>
				Note: When using explicit grid spans on responsive grids, you might need
				to adjust the spans for different breakpoints or use CSS media queries
				for more complex cases.
			</SectionDescription>
		</DemoContent>
	),
};
