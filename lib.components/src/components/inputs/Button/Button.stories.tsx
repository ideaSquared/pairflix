import type { Meta, StoryObj } from '@storybook/react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../../styles/theme';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
	title: 'Inputs/Button',
	component: Button,
	tags: ['autodocs'],
	args: {
		children: 'Button',
	},
};
export default meta;
type Story = StoryObj<typeof Button>;

const withTheme = (StoryFn: any) => (
	<ThemeProvider theme={lightTheme}>
		<StoryFn />
	</ThemeProvider>
);

export const Variants: Story = {
	render: (args) => (
		<div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
			<Button variant='primary'>Primary</Button>
			<Button variant='secondary'>Secondary</Button>
			<Button variant='success'>Success</Button>
			<Button variant='danger'>Danger</Button>
			<Button variant='warning'>Warning</Button>
			<Button variant='text'>Text</Button>
			<Button variant='outline'>Outline</Button>
		</div>
	),
	decorators: [withTheme],
};

export const Sizes: Story = {
	render: (args) => (
		<div style={{ display: 'flex', gap: 16 }}>
			<Button size='small'>Small</Button>
			<Button size='medium'>Medium</Button>
			<Button size='large'>Large</Button>
		</div>
	),
	decorators: [withTheme],
};

export const Loading: Story = {
	render: (args) => <Button isLoading>Loading...</Button>,
	decorators: [withTheme],
};

export const Disabled: Story = {
	render: (args) => <Button disabled>Disabled</Button>,
	decorators: [withTheme],
};

export const FullWidth: Story = {
	render: (args) => <Button isFullWidth>Full Width</Button>,
	decorators: [withTheme],
};

export const WithIcons: Story = {
	render: (args) => (
		<div style={{ display: 'flex', gap: 16 }}>
			<Button leftIcon={<FaCheck />}>Left Icon</Button>
			<Button rightIcon={<FaTimes />}>Right Icon</Button>
			<Button leftIcon={<FaCheck />} rightIcon={<FaTimes />}>
				Both Icons
			</Button>
		</div>
	),
	decorators: [withTheme],
};

export const Playground: Story = {
	args: {
		variant: 'primary',
		size: 'medium',
		isLoading: false,
		disabled: false,
		isFullWidth: false,
		children: 'Button',
	},
	decorators: [withTheme],
};
