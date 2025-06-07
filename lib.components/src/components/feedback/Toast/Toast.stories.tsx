import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../../styles/theme';
import { Toast } from './Toast';

const meta: Meta<typeof Toast> = {
	title: 'Feedback/Toast',
	component: Toast,
	tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Toast>;

const withTheme = (StoryFn: any) => (
	<ThemeProvider theme={lightTheme}>
		<StoryFn />
	</ThemeProvider>
);

const baseToast = {
	message: 'This is a toast message!',
	duration: 3000,
	closeable: true,
	pauseOnHover: true,
};

export const Info: Story = {
	render: (args) => {
		const [open, setOpen] = useState(true);
		return open ? (
			<Toast
				toast={{ ...baseToast, variant: 'info' }}
				onClose={() => setOpen(false)}
			/>
		) : null;
	},
	decorators: [withTheme],
};

export const Success: Story = {
	render: (args) => {
		const [open, setOpen] = useState(true);
		return open ? (
			<Toast
				toast={{ ...baseToast, variant: 'success' }}
				onClose={() => setOpen(false)}
			/>
		) : null;
	},
	decorators: [withTheme],
};

export const Warning: Story = {
	render: (args) => {
		const [open, setOpen] = useState(true);
		return open ? (
			<Toast
				toast={{ ...baseToast, variant: 'warning' }}
				onClose={() => setOpen(false)}
			/>
		) : null;
	},
	decorators: [withTheme],
};

export const Error: Story = {
	render: (args) => {
		const [open, setOpen] = useState(true);
		return open ? (
			<Toast
				toast={{ ...baseToast, variant: 'error' }}
				onClose={() => setOpen(false)}
			/>
		) : null;
	},
	decorators: [withTheme],
};
