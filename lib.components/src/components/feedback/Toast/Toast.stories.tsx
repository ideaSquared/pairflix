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

const withTheme = (StoryFn: React.ComponentType) => (
  <ThemeProvider theme={lightTheme}>
    <StoryFn />
  </ThemeProvider>
);

const baseToast = {
  id: 'story-toast',
  message: 'This is a toast message!',
  type: 'info' as const,
  variant: 'info' as const,
  duration: 3000,
  closeable: true,
  pauseOnHover: true,
};

const InfoToastDemo = () => {
  const [open, setOpen] = useState(true);
  return open ? (
    <Toast
      toast={{ ...baseToast, id: 'info-toast', type: 'info', variant: 'info' }}
      onClose={() => setOpen(false)}
    />
  ) : null;
};

export const Info: Story = {
  render: () => <InfoToastDemo />,
  decorators: [withTheme],
};

const SuccessToastDemo = () => {
  const [open, setOpen] = useState(true);
  return open ? (
    <Toast
      toast={{
        ...baseToast,
        id: 'success-toast',
        type: 'success',
        variant: 'success',
      }}
      onClose={() => setOpen(false)}
    />
  ) : null;
};

export const Success: Story = {
  render: () => <SuccessToastDemo />,
  decorators: [withTheme],
};

const WarningToastDemo = () => {
  const [open, setOpen] = useState(true);
  return open ? (
    <Toast
      toast={{
        ...baseToast,
        id: 'warning-toast',
        type: 'warning',
        variant: 'warning',
      }}
      onClose={() => setOpen(false)}
    />
  ) : null;
};

export const Warning: Story = {
  render: () => <WarningToastDemo />,
  decorators: [withTheme],
};

const ErrorToastDemo = () => {
  const [open, setOpen] = useState(true);
  return open ? (
    <Toast
      toast={{
        ...baseToast,
        id: 'error-toast',
        type: 'error',
        variant: 'error',
      }}
      onClose={() => setOpen(false)}
    />
  ) : null;
};

export const Error: Story = {
  render: () => <ErrorToastDemo />,
  decorators: [withTheme],
};
