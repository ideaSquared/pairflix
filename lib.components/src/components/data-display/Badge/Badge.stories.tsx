import type { Meta, StoryObj } from '@storybook/react-webpack5';
import styled from 'styled-components';

import { Badge, StatusBadge } from './Badge';

const BadgeRow = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 16px;
	gap: 16px;
`;

const BadgeContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 24px;
	padding: 16px;
`;

const AbsoluteContainer = styled.div`
	position: relative;
	width: 40px;
	height: 40px;
	background-color: #e0e0e0;
	border-radius: 4px;
	margin-right: 16px;
`;

const meta: Meta<typeof Badge> = {
	title: 'Data Display/Badge',
	component: Badge,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Badge component for displaying status indicators, counts, or labels.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: [
				'primary',
				'secondary',
				'success',
				'error',
				'warning',
				'info',
				'default',
				'custom',
			],
			description: 'The visual style of the badge',
			defaultValue: 'default',
		},
		size: {
			control: 'radio',
			options: ['small', 'medium', 'large'],
			description: 'The size of the badge',
			defaultValue: 'medium',
		},
		outlined: {
			control: 'boolean',
			description: 'Whether the badge has an outlined style',
			defaultValue: false,
		},
		pill: {
			control: 'boolean',
			description: 'Whether the badge has fully rounded corners',
			defaultValue: false,
		},
		dot: {
			control: 'boolean',
			description: 'Whether to display the badge as a dot without content',
			defaultValue: false,
		},
		count: {
			control: 'number',
			description: 'Numeric value to display in the badge',
		},
		maxCount: {
			control: 'number',
			description: 'Maximum count to display before showing a + suffix',
			defaultValue: 99,
		},
		backgroundColor: {
			control: 'color',
			description: 'Custom background color (only when variant is custom)',
			if: { arg: 'variant', eq: 'custom' },
		},
		textColor: {
			control: 'color',
			description: 'Custom text color (only when variant is custom)',
			if: { arg: 'variant', eq: 'custom' },
		},
		animate: {
			control: 'boolean',
			description: 'Whether to animate the badge when it appears',
			defaultValue: false,
		},
		children: {
			control: 'text',
			description: 'The content of the badge',
		},
	},
};

export default meta;
type Story = StoryObj<typeof Badge>;

// Basic usage
export const Default: Story = {
	args: {
		children: 'Badge',
	},
};

// Different variants
export const Variants: Story = {
	render: () => (
		<BadgeContainer>
			<BadgeRow>
				<Badge variant='primary'>Primary</Badge>
				<Badge variant='secondary'>Secondary</Badge>
				<Badge variant='success'>Success</Badge>
				<Badge variant='error'>Error</Badge>
				<Badge variant='warning'>Warning</Badge>
				<Badge variant='info'>Info</Badge>
				<Badge variant='default'>Default</Badge>
			</BadgeRow>
			<BadgeRow>
				<Badge variant='custom' backgroundColor='#8A2BE2' textColor='#FFFFFF'>
					Custom
				</Badge>
			</BadgeRow>
		</BadgeContainer>
	),
};

// Different sizes
export const Sizes: Story = {
	render: () => (
		<BadgeContainer>
			<BadgeRow>
				<Badge size='small'>Small</Badge>
				<Badge size='medium'>Medium</Badge>
				<Badge size='large'>Large</Badge>
			</BadgeRow>
		</BadgeContainer>
	),
};

// Outlined badges
export const Outlined: Story = {
	render: () => (
		<BadgeContainer>
			<BadgeRow>
				<Badge variant='primary' outlined>
					Primary
				</Badge>
				<Badge variant='secondary' outlined>
					Secondary
				</Badge>
				<Badge variant='success' outlined>
					Success
				</Badge>
				<Badge variant='error' outlined>
					Error
				</Badge>
				<Badge variant='warning' outlined>
					Warning
				</Badge>
				<Badge variant='info' outlined>
					Info
				</Badge>
				<Badge variant='default' outlined>
					Default
				</Badge>
			</BadgeRow>
		</BadgeContainer>
	),
};

// Pill badges
export const Pill: Story = {
	render: () => (
		<BadgeContainer>
			<BadgeRow>
				<Badge pill>Default</Badge>
				<Badge variant='primary' pill>
					Primary
				</Badge>
				<Badge variant='success' pill>
					Success
				</Badge>
				<Badge variant='error' pill>
					Error
				</Badge>
			</BadgeRow>
		</BadgeContainer>
	),
};

// Dot badges
export const Dot: Story = {
	render: () => (
		<BadgeContainer>
			<BadgeRow>
				<Badge dot />
				<Badge variant='primary' dot />
				<Badge variant='success' dot />
				<Badge variant='error' dot />
				<Badge variant='warning' dot />
				<Badge variant='info' dot />
			</BadgeRow>
		</BadgeContainer>
	),
};

// Count badges
export const Count: Story = {
	render: () => (
		<BadgeContainer>
			<BadgeRow>
				<Badge count={5} />
				<Badge count={25} />
				<Badge count={100} />
				<Badge count={0} />
			</BadgeRow>
			<BadgeRow>
				<Badge variant='primary' count={5} />
				<Badge variant='success' count={25} />
				<Badge variant='error' count={100} />
			</BadgeRow>
			<BadgeRow>
				<Badge variant='primary' count={5} size='small' />
				<Badge variant='success' count={25} size='medium' />
				<Badge variant='error' count={100} size='large' />
			</BadgeRow>
			<BadgeRow>
				<Badge count={1000} maxCount={999} />
				<Badge count={500} maxCount={99} />
			</BadgeRow>
		</BadgeContainer>
	),
};

// Absolute positioned badges
export const AbsolutePositioning: Story = {
	render: () => (
		<BadgeContainer>
			<BadgeRow>
				<AbsoluteContainer>
					<Badge variant='error' count={5} absolute position='top-right' />
				</AbsoluteContainer>
				<AbsoluteContainer>
					<Badge variant='error' count={5} absolute position='top-left' />
				</AbsoluteContainer>
				<AbsoluteContainer>
					<Badge variant='error' count={5} absolute position='bottom-right' />
				</AbsoluteContainer>
				<AbsoluteContainer>
					<Badge variant='error' count={5} absolute position='bottom-left' />
				</AbsoluteContainer>
			</BadgeRow>
			<BadgeRow>
				<AbsoluteContainer>
					<Badge variant='primary' dot absolute position='top-right' />
				</AbsoluteContainer>
				<AbsoluteContainer>
					<Badge variant='success' dot absolute position='top-left' />
				</AbsoluteContainer>
				<AbsoluteContainer>
					<Badge variant='warning' dot absolute position='bottom-right' />
				</AbsoluteContainer>
				<AbsoluteContainer>
					<Badge variant='info' dot absolute position='bottom-left' />
				</AbsoluteContainer>
			</BadgeRow>
		</BadgeContainer>
	),
};

// Animated badges
export const Animated: Story = {
	render: () => (
		<BadgeContainer>
			<BadgeRow>
				<Badge animate>Animated</Badge>
				<Badge variant='primary' animate>
					Primary
				</Badge>
				<Badge variant='success' animate count={5} />
				<Badge variant='error' animate dot />
			</BadgeRow>
		</BadgeContainer>
	),
};

// Status badges
export const StatusBadges: Story = {
	render: () => (
		<BadgeContainer>
			<BadgeRow>
				<StatusBadge status='active' />
				<StatusBadge status='inactive' />
				<StatusBadge status='pending' />
				<StatusBadge status='blocked' />
				<StatusBadge status='archived' />
				<StatusBadge status='custom status' />
			</BadgeRow>
		</BadgeContainer>
	),
};

// Combined features
export const CombinedFeatures: Story = {
	render: () => (
		<BadgeContainer>
			<BadgeRow>
				<Badge variant='primary' pill outlined>
					Primary Pill Outlined
				</Badge>
				<Badge variant='success' size='large' pill>
					Success Large Pill
				</Badge>
				<Badge variant='error' count={25} outlined />
				<Badge
					variant='custom'
					backgroundColor='#673AB7'
					textColor='#FFFFFF'
					pill
				>
					Custom Purple
				</Badge>
			</BadgeRow>
		</BadgeContainer>
	),
};
