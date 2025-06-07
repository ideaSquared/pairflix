import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { useState } from 'react';
import styled from 'styled-components';

import Alert from './Alert';

const Container = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
	padding: 16px;
	max-width: 600px;
`;

const Button = styled.button`
	padding: 8px 16px;
	background-color: #f0f0f0;
	border: 1px solid #ccc;
	border-radius: 4px;
	cursor: pointer;
	font-size: 14px;
	display: inline-flex;
	align-items: center;

	&:hover {
		background-color: #e0e0e0;
	}
`;

// Custom icons for demonstration
const CustomIcons = {
	info: <span style={{ fontSize: '18px' }}>🔍</span>,
	success: <span style={{ fontSize: '18px' }}>🎉</span>,
	warning: <span style={{ fontSize: '18px' }}>⚡</span>,
	error: <span style={{ fontSize: '18px' }}>⛔</span>,
};

const meta: Meta<typeof Alert> = {
	title: 'Feedback/Alert',
	component: Alert,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Alert component for displaying status messages, notifications, warnings, and errors.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ['info', 'success', 'warning', 'error'],
			description: 'The visual style of the alert',
			defaultValue: 'info',
		},
		size: {
			control: 'radio',
			options: ['small', 'medium', 'large'],
			description: 'The size of the alert',
			defaultValue: 'medium',
		},
		message: {
			control: 'text',
			description: 'Main alert message',
		},
		title: {
			control: 'text',
			description: 'Optional title for the alert',
		},
		description: {
			control: 'text',
			description: 'Optional additional description',
		},
		dismissible: {
			control: 'boolean',
			description: 'Whether the alert can be dismissed',
			defaultValue: false,
		},
		visible: {
			control: 'boolean',
			description: 'Whether alert is visible',
			defaultValue: true,
		},
		animate: {
			control: 'boolean',
			description: 'Whether to show alert with animation',
			defaultValue: true,
		},
		icon: {
			control: 'boolean',
			description: 'Whether to show icon (demo purposes only)',
			defaultValue: true,
		},
		children: {
			control: 'text',
			description: 'Alert content as children',
		},
	},
};

export default meta;
type Story = StoryObj<typeof Alert>;

// Basic alerts
export const Default: Story = {
	args: {
		message: 'This is an informational alert',
		variant: 'info',
	},
};

// Alert variants
export const Variants: Story = {
	render: () => (
		<Container>
			<Alert variant='info' message='This is an information alert' />
			<Alert variant='success' message='This is a success alert' />
			<Alert variant='warning' message='This is a warning alert' />
			<Alert variant='error' message='This is an error alert' />
		</Container>
	),
};

// Alert sizes
export const Sizes: Story = {
	render: () => (
		<Container>
			<Alert size='small' message='This is a small alert' />
			<Alert size='medium' message='This is a medium alert' />
			<Alert size='large' message='This is a large alert' />
		</Container>
	),
};

// With description
export const WithDescription: Story = {
	render: () => (
		<Container>
			<Alert
				variant='info'
				message='Information about your account'
				description='This is additional information that provides more details about the main message.'
			/>
			<Alert
				variant='success'
				message='Profile successfully updated'
				description='Your profile changes have been saved. Other users will now see your updated information.'
			/>
			<Alert
				variant='warning'
				message='Storage space low'
				description='Your account is using 90% of allocated storage. Consider upgrading your plan or removing unused content.'
			/>
			<Alert
				variant='error'
				message='Payment failed'
				description="We couldn't process your payment. Please check your payment details and try again."
			/>
		</Container>
	),
};

// With title
export const WithTitle: Story = {
	render: () => (
		<Container>
			<Alert
				variant='info'
				title='Account Information'
				message="We've updated our terms of service."
			/>
			<Alert
				variant='success'
				title='Success!'
				message='Your profile has been updated.'
			/>
			<Alert
				variant='warning'
				title='Warning'
				message='Your subscription expires soon.'
			/>
			<Alert
				variant='error'
				title='Error'
				message='We encountered a problem processing your request.'
			/>
		</Container>
	),
};

// With complete content
export const CompleteAlerts: Story = {
	render: () => (
		<Container>
			<Alert
				variant='info'
				title='Account Update'
				message="We've updated our terms of service"
				description='Please review the new terms before continuing to use our services. These changes will take effect starting next month.'
			/>
			<Alert
				variant='success'
				title='Upload Complete'
				message='All files have been uploaded successfully'
				description='Your 5 files have been processed and are now available in your library. Total size: 25MB.'
			/>
			<Alert
				variant='warning'
				title='Limited Access'
				message='Some features are temporarily unavailable'
				description='Due to scheduled maintenance, some features may be unavailable until 2:00 PM UTC. We apologize for any inconvenience.'
			/>
			<Alert
				variant='error'
				title='Connection Error'
				message='Unable to connect to the server'
				description='Please check your internet connection and try again. If the problem persists, the server might be temporarily down.'
			/>
		</Container>
	),
};

// With custom icons
export const CustomIconsExample: Story = {
	render: () => (
		<Container>
			<Alert
				variant='info'
				message='Information with custom icon'
				icon={CustomIcons.info}
			/>
			<Alert
				variant='success'
				message='Success with custom icon'
				icon={CustomIcons.success}
			/>
			<Alert
				variant='warning'
				message='Warning with custom icon'
				icon={CustomIcons.warning}
			/>
			<Alert
				variant='error'
				message='Error with custom icon'
				icon={CustomIcons.error}
			/>
		</Container>
	),
};

// Without icons
export const WithoutIcons: Story = {
	render: () => (
		<Container>
			<Alert
				variant='info'
				message='Information alert without icon'
				icon={null}
			/>
			<Alert
				variant='success'
				message='Success alert without icon'
				icon={null}
			/>
			<Alert
				variant='warning'
				message='Warning alert without icon'
				icon={null}
			/>
			<Alert variant='error' message='Error alert without icon' icon={null} />
		</Container>
	),
};

// Dismissible alerts
export const DismissibleAlerts: Story = {
	render: () => {
		// For demonstration purposes, using states for visibility
		const [alerts, setAlerts] = useState({
			info: true,
			success: true,
			warning: true,
			error: true,
		});

		const handleDismiss = (type: keyof typeof alerts) => {
			setAlerts((prev) => ({ ...prev, [type]: false }));
		};

		const resetAlerts = () => {
			setAlerts({
				info: true,
				success: true,
				warning: true,
				error: true,
			});
		};

		return (
			<Container>
				{alerts.info && (
					<Alert
						variant='info'
						message='This alert can be dismissed'
						dismissible={true}
						onDismiss={() => handleDismiss('info')}
					/>
				)}
				{alerts.success && (
					<Alert
						variant='success'
						message='You completed the task successfully'
						dismissible={true}
						onDismiss={() => handleDismiss('success')}
					/>
				)}
				{alerts.warning && (
					<Alert
						variant='warning'
						message='This action cannot be undone'
						dismissible={true}
						onDismiss={() => handleDismiss('warning')}
					/>
				)}
				{alerts.error && (
					<Alert
						variant='error'
						message='An error occurred during the process'
						dismissible={true}
						onDismiss={() => handleDismiss('error')}
					/>
				)}
				{(!alerts.info ||
					!alerts.success ||
					!alerts.warning ||
					!alerts.error) && <Button onClick={resetAlerts}>Reset Alerts</Button>}
			</Container>
		);
	},
};

// With actions
export const WithActions: Story = {
	render: () => (
		<Container>
			<Alert
				variant='info'
				message='New features available'
				description="We've added new features to help you be more productive."
				actions={
					<>
						<Button>Learn More</Button>
						<Button>Dismiss</Button>
					</>
				}
			/>
			<Alert
				variant='warning'
				message='Your subscription is expiring soon'
				description='Your subscription will expire in 7 days.'
				actions={
					<>
						<Button>Renew Now</Button>
						<Button>Remind Later</Button>
					</>
				}
			/>
			<Alert
				variant='error'
				message='Failed to save changes'
				description='There was an error saving your changes. Please try again.'
				actions={
					<>
						<Button>Try Again</Button>
						<Button>Contact Support</Button>
					</>
				}
			/>
		</Container>
	),
};

// Animated alerts
export const AnimatedAlerts: Story = {
	render: () => {
		const [visible, setVisible] = useState(false);

		const toggleAlerts = () => {
			setVisible(!visible);
		};

		return (
			<Container>
				<Button onClick={toggleAlerts}>
					{visible ? 'Hide Alerts' : 'Show Alerts'}
				</Button>

				{visible && (
					<>
						<Alert
							variant='info'
							message='This alert animates in'
							animate={true}
						/>
						<Alert
							variant='success'
							message='This alert also animates in'
							animate={true}
						/>
						<Alert
							variant='warning'
							message='This one has animation too'
							animate={true}
						/>
						<Alert
							variant='error'
							message='All these alerts have animation'
							animate={true}
						/>
					</>
				)}
			</Container>
		);
	},
};

// With custom children
export const WithCustomChildren: Story = {
	render: () => (
		<Container>
			<Alert variant='info'>
				<div>
					<h4 style={{ margin: 0 }}>Custom Content Alert</h4>
					<p style={{ margin: '8px 0' }}>
						This alert contains <strong>custom HTML content</strong> instead of
						using the message prop.
					</p>
					<div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
						<Button>Action 1</Button>
						<Button>Action 2</Button>
					</div>
				</div>
			</Alert>
			<Alert variant='success'>
				<div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
						<span style={{ fontSize: '24px' }}>🏆</span>
						<span style={{ fontWeight: 'bold', fontSize: '18px' }}>
							Achievement Unlocked!
						</span>
					</div>
					<p style={{ margin: '8px 0' }}>
						You've watched 100 movies. You're now a Movie Master!
					</p>
					<div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
						Share this achievement with your friends!
					</div>
				</div>
			</Alert>
		</Container>
	),
};

// Different layouts and edge cases
export const LayoutAndEdgeCases: Story = {
	render: () => (
		<Container>
			{/* Very short message */}
			<Alert variant='info' message='Info' />

			{/* Very long message */}
			<Alert
				variant='warning'
				message='This is a very long alert message that should wrap to multiple lines when it reaches the end of the container. This demonstrates how the alert handles long content without breaking the layout.'
			/>

			{/* With very long title and description */}
			<Alert
				variant='error'
				title='This is a very long alert title that demonstrates text wrapping behavior for titles within the alert component'
				message='Error message'
				description='This is a very long description that provides additional details about the alert message. It demonstrates how the component handles long descriptions and ensures they wrap correctly within the container without causing layout issues.'
			/>

			{/* With multiple action buttons */}
			<Alert
				variant='success'
				message='Operation completed'
				actions={
					<>
						<Button>Primary Action</Button>
						<Button>Secondary Action</Button>
						<Button>Tertiary Action</Button>
						<Button>Another Action</Button>
					</>
				}
			/>
		</Container>
	),
};
