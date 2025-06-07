import type { Meta, StoryObj } from '@storybook/react-webpack5';
import styled from 'styled-components';

import Card from './Card';

const CardContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 24px;
	padding: 16px;
	max-width: 600px;
`;

const CardRow = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 16px;
`;

const CardColumn = styled.div`
	flex: 1;
	min-width: 250px;
`;

const CardContent = styled.div`
	padding: 8px;
`;

const CardDemo = styled.div`
	padding: 16px;
	background-color: #f5f5f5;
`;

const meta: Meta<typeof Card> = {
	title: 'Data Display/Card',
	component: Card,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'A versatile Card component for displaying content in a contained, styled container.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ['primary', 'secondary', 'outlined', 'stats'],
			description: 'The visual style of the card',
			defaultValue: 'primary',
		},
		elevation: {
			control: 'radio',
			options: ['low', 'medium', 'high'],
			description: 'Elevation level (shadow intensity)',
			defaultValue: 'low',
		},
		isInteractive: {
			control: 'boolean',
			description: 'Whether the card has hover effects and appears clickable',
			defaultValue: false,
		},
		accentColor: {
			control: 'color',
			description: 'Custom accent color for the primary variant',
		},
		// Stats card specific props
		title: {
			control: 'text',
			description: 'Title for stats cards',
			if: { arg: 'variant', eq: 'stats' },
		},
		value: {
			control: 'text',
			description: 'Value to display in stats cards',
			if: { arg: 'variant', eq: 'stats' },
		},
		valueColor: {
			control: 'color',
			description: 'Color for the value in stats cards',
			if: { arg: 'variant', eq: 'stats' },
		},
		caption: {
			control: 'text',
			description: 'Caption text for stats cards',
			if: { arg: 'variant', eq: 'stats' },
		},
		children: {
			description: 'Content for standard card variants',
			if: { arg: 'variant', neq: 'stats' },
		},
	},
};

export default meta;
type Story = StoryObj<typeof Card>;

// Basic card
export const Default: Story = {
	args: {
		children: (
			<CardContent>
				<h3>Card Title</h3>
				<p>This is a standard card with default styling.</p>
			</CardContent>
		),
	},
};

// Card variants
export const Variants: Story = {
	render: () => (
		<CardContainer>
			<CardRow>
				<CardColumn>
					<Card variant='primary'>
						<CardContent>
							<h3>Primary Card</h3>
							<p>Has an accent border on the left side.</p>
						</CardContent>
					</Card>
				</CardColumn>
				<CardColumn>
					<Card variant='secondary'>
						<CardContent>
							<h3>Secondary Card</h3>
							<p>Has a border around the card.</p>
						</CardContent>
					</Card>
				</CardColumn>
			</CardRow>
			<CardRow>
				<CardColumn>
					<Card variant='outlined'>
						<CardContent>
							<h3>Outlined Card</h3>
							<p>Has an outline with transparent background.</p>
						</CardContent>
					</Card>
				</CardColumn>
				<CardColumn>
					<Card
						variant='stats'
						title='Total Users'
						value={1250}
						caption='Last 30 days'
					/>
				</CardColumn>
			</CardRow>
		</CardContainer>
	),
};

// Elevation levels
export const Elevation: Story = {
	render: () => (
		<CardContainer>
			<CardRow>
				<CardColumn>
					<Card elevation='low'>
						<CardContent>
							<h3>Low Elevation</h3>
							<p>Subtle shadow effect.</p>
						</CardContent>
					</Card>
				</CardColumn>
				<CardColumn>
					<Card elevation='medium'>
						<CardContent>
							<h3>Medium Elevation</h3>
							<p>More pronounced shadow.</p>
						</CardContent>
					</Card>
				</CardColumn>
			</CardRow>
			<CardRow>
				<CardColumn>
					<Card elevation='high'>
						<CardContent>
							<h3>High Elevation</h3>
							<p>Strong shadow for emphasis.</p>
						</CardContent>
					</Card>
				</CardColumn>
			</CardRow>
		</CardContainer>
	),
};

// Interactive cards
export const Interactive: Story = {
	render: () => (
		<CardContainer>
			<CardRow>
				<CardColumn>
					<Card isInteractive variant='primary'>
						<CardContent>
							<h3>Interactive Card</h3>
							<p>Hover over me to see the effect.</p>
						</CardContent>
					</Card>
				</CardColumn>
				<CardColumn>
					<Card isInteractive variant='secondary'>
						<CardContent>
							<h3>Interactive Secondary</h3>
							<p>A different style with hover effect.</p>
						</CardContent>
					</Card>
				</CardColumn>
			</CardRow>
			<CardRow>
				<CardColumn>
					<Card isInteractive variant='outlined'>
						<CardContent>
							<h3>Interactive Outlined</h3>
							<p>Outlined style with hover effect.</p>
						</CardContent>
					</Card>
				</CardColumn>
				<CardColumn>
					<Card
						isInteractive
						variant='stats'
						title='Conversion Rate'
						value='15.4%'
						valueColor='#4CAF50'
						caption='Up 2.3% from last month'
					/>
				</CardColumn>
			</CardRow>
		</CardContainer>
	),
};

// Custom accent colors
export const AccentColors: Story = {
	render: () => (
		<CardContainer>
			<CardRow>
				<CardColumn>
					<Card variant='primary' accentColor='#E91E63'>
						<CardContent>
							<h3>Pink Accent</h3>
							<p>Card with a custom accent color.</p>
						</CardContent>
					</Card>
				</CardColumn>
				<CardColumn>
					<Card variant='primary' accentColor='#9C27B0'>
						<CardContent>
							<h3>Purple Accent</h3>
							<p>Card with a different accent color.</p>
						</CardContent>
					</Card>
				</CardColumn>
			</CardRow>
			<CardRow>
				<CardColumn>
					<Card variant='primary' accentColor='#2196F3'>
						<CardContent>
							<h3>Blue Accent</h3>
							<p>Card with a blue accent color.</p>
						</CardContent>
					</Card>
				</CardColumn>
				<CardColumn>
					<Card variant='primary' accentColor='#4CAF50'>
						<CardContent>
							<h3>Green Accent</h3>
							<p>Card with a green accent color.</p>
						</CardContent>
					</Card>
				</CardColumn>
			</CardRow>
		</CardContainer>
	),
};

// Stats cards
export const StatsCards: Story = {
	render: () => (
		<CardContainer>
			<CardRow>
				<CardColumn>
					<Card
						variant='stats'
						title='Total Users'
						value={2456}
						caption='Active accounts'
					/>
				</CardColumn>
				<CardColumn>
					<Card
						variant='stats'
						title='Revenue'
						value='$12,450'
						valueColor='#4CAF50'
						caption='This quarter'
					/>
				</CardColumn>
			</CardRow>
			<CardRow>
				<CardColumn>
					<Card
						variant='stats'
						title='Conversion Rate'
						value='8.5%'
						valueColor='#2196F3'
						caption='Last 30 days'
					/>
				</CardColumn>
				<CardColumn>
					<Card
						variant='stats'
						title='Bounce Rate'
						value='32%'
						valueColor='#FF9800'
						caption='Could use improvement'
					/>
				</CardColumn>
			</CardRow>
		</CardContainer>
	),
};

// Nested content example
export const WithNestedContent: Story = {
	render: () => (
		<CardContainer>
			<Card variant='primary'>
				<CardContent>
					<h2>Featured Movies</h2>
					<p>Top picks for this week</p>
					<CardRow style={{ marginTop: '16px' }}>
						<Card variant='secondary' isInteractive>
							<CardContent>
								<h4>The Matrix</h4>
								<p>Sci-Fi, Action</p>
							</CardContent>
						</Card>
						<Card variant='secondary' isInteractive>
							<CardContent>
								<h4>Inception</h4>
								<p>Sci-Fi, Thriller</p>
							</CardContent>
						</Card>
					</CardRow>
				</CardContent>
			</Card>
		</CardContainer>
	),
};

// Card in different background contexts
export const BackgroundContexts: Story = {
	render: () => (
		<CardContainer>
			<CardDemo style={{ backgroundColor: '#ffffff' }}>
				<h4>Light Background</h4>
				<CardRow>
					<Card variant='primary'>
						<CardContent>Primary Card</CardContent>
					</Card>
					<Card variant='outlined'>
						<CardContent>Outlined Card</CardContent>
					</Card>
				</CardRow>
			</CardDemo>

			<CardDemo style={{ backgroundColor: '#333333', color: 'white' }}>
				<h4>Dark Background</h4>
				<CardRow>
					<Card variant='primary'>
						<CardContent>Primary Card</CardContent>
					</Card>
					<Card variant='outlined'>
						<CardContent>Outlined Card</CardContent>
					</Card>
				</CardRow>
			</CardDemo>
		</CardContainer>
	),
};
