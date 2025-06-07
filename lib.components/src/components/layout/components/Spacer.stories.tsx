import type { Meta, StoryObj } from '@storybook/react-webpack5';
import styled from 'styled-components';

import { Spacer } from './Spacer';

// Styled components for demonstration
const Container = styled.div`
	font-family: ${({ theme }) => theme?.typography?.fontFamily || 'sans-serif'};
	color: ${({ theme }) => theme?.colors?.text?.primary || '#333'};
	padding: 20px;
	max-width: 800px;
	margin: 0 auto;
`;

const DemoBox = styled.div<{ color?: string }>`
	background-color: ${({ color, theme }) =>
		color || theme?.colors?.primary?.main || '#007bff'};
	padding: 16px;
	color: white;
	text-align: center;
	border-radius: 4px;
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

	@media (min-width: 769px) {
		&::after {
			content: 'Desktop View';
		}
		background-color: #4caf50;
	}
`;

export default {
	title: 'Layout/Spacer',
	component: Spacer,
	parameters: {
		layout: 'padded',
	},
	argTypes: {
		size: {
			control: 'select',
			options: ['xs', 'sm', 'md', 'lg', 'xl'],
			description: 'Size of the spacer',
		},
		responsive: {
			control: 'boolean',
			description:
				'Whether the spacer should be responsive (reduce size on mobile)',
		},
		inline: {
			control: 'boolean',
			description:
				'Whether the spacer should be horizontal instead of vertical',
		},
		hideOnMobile: {
			control: 'boolean',
			description: 'Whether to hide the spacer on mobile',
		},
		mobileSize: {
			control: 'select',
			options: ['xs', 'sm', 'md', 'lg', 'xl'],
			description: 'Custom size for mobile viewport',
		},
		tabletSize: {
			control: 'select',
			options: ['xs', 'sm', 'md', 'lg', 'xl'],
			description: 'Custom size for tablet viewport',
		},
	},
} satisfies Meta<typeof Spacer>;

type Story = StoryObj<typeof Spacer>;

// Vertical spacer examples with different sizes
export const VerticalSpacers: Story = {
	render: () => (
		<Container>
			<ResponsiveIndicator />
			<DemoBox>Content Block 1</DemoBox>
			<Spacer size='xs' />
			<DemoBox>After XS Spacer</DemoBox>
			<Spacer size='sm' />
			<DemoBox>After SM Spacer</DemoBox>
			<Spacer size='md' />
			<DemoBox>After MD Spacer</DemoBox>
			<Spacer size='lg' />
			<DemoBox>After LG Spacer</DemoBox>
			<Spacer size='xl' />
			<DemoBox>After XL Spacer</DemoBox>
		</Container>
	),
};

// Horizontal spacer examples
export const HorizontalSpacers: Story = {
	render: () => (
		<Container>
			<ResponsiveIndicator />
			<div style={{ display: 'flex', alignItems: 'center' }}>
				<DemoBox>Block 1</DemoBox>
				<Spacer size='xs' inline />
				<DemoBox>Block 2</DemoBox>
				<Spacer size='sm' inline />
				<DemoBox>Block 3</DemoBox>
				<Spacer size='md' inline />
				<DemoBox>Block 4</DemoBox>
			</div>
		</Container>
	),
};

// Responsive spacer that changes on mobile
export const ResponsiveSpacers: Story = {
	render: () => (
		<Container>
			<ResponsiveIndicator />
			<p>Resize to mobile view to see spacing changes</p>
			<DemoBox>Content Block 1</DemoBox>
			<Spacer size='xl' responsive />
			<DemoBox>Content Block 2 (after responsive XL spacer)</DemoBox>
			<Spacer size='xl' />
			<DemoBox>Content Block 3 (after non-responsive XL spacer)</DemoBox>
		</Container>
	),
};

// Spacer with custom mobile and tablet sizes
export const CustomResponsiveSizes: Story = {
	render: () => (
		<Container>
			<ResponsiveIndicator />
			<p>Resize to see different sizes on different viewports</p>
			<DemoBox>Content Block 1</DemoBox>
			<Spacer size='xl' mobileSize='xs' tabletSize='md' />
			<DemoBox>Content Block 2</DemoBox>
			<p>This spacer uses XL on desktop, MD on tablet, and XS on mobile</p>
		</Container>
	),
};

// Hidden on mobile example
export const HiddenOnMobile: Story = {
	render: () => (
		<Container>
			<ResponsiveIndicator />
			<p>Resize to mobile to see spacer disappear</p>
			<DemoBox>Content Block 1</DemoBox>
			<Spacer size='xl' hideOnMobile />
			<DemoBox>Content Block 2</DemoBox>
			<p>The spacer above will disappear on mobile</p>
		</Container>
	),
};

// Interactive playground
export const Playground: Story = {
	args: {
		size: 'md',
		responsive: false,
		inline: false,
		hideOnMobile: false,
	},
	render: (args) => (
		<Container>
			<ResponsiveIndicator />
			<p>Interactive playground: adjust props in the controls below</p>
			{args.inline ? (
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<DemoBox>Block 1</DemoBox>
					<Spacer {...args} />
					<DemoBox>Block 2</DemoBox>
				</div>
			) : (
				<>
					<DemoBox>Block 1</DemoBox>
					<Spacer {...args} />
					<DemoBox>Block 2</DemoBox>
				</>
			)}
		</Container>
	),
};
