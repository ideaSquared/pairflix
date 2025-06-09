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
  message: 'This is a toast message!',
  duration: 3000,
  closeable: true,
  pauseOnHover: true,
};

const InfoToastDemo = () => {
  const [open, setOpen] = useState(true);
  return open ? (
    <Toast
      toast={{ ...baseToast, variant: 'info' }}
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
      toast={{ ...baseToast, variant: 'success' }}
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
      toast={{ ...baseToast, variant: 'warning' }}
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
      toast={{ ...baseToast, variant: 'error' }}
      onClose={() => setOpen(false)}
    />
  ) : null;
};

export const Error: Story = {
  render: () => <ErrorToastDemo />,
  decorators: [withTheme],
};
