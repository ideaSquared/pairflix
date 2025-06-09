import type { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../../styles/theme';
import { ErrorBoundary, ErrorFallback } from './ErrorBoundary';

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Utility/ErrorBoundary',
  component: ErrorBoundary,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

const withTheme = (StoryFn: React.ComponentType) => (
  <ThemeProvider theme={lightTheme}>
    <StoryFn />
  </ThemeProvider>
);

const BuggyComponent = () => {
  throw new Error('This is a test error!');
};

export const DefaultFallback: Story = {
  render: () => (
    <ErrorBoundary>
      <BuggyComponent />
    </ErrorBoundary>
  ),
  decorators: [withTheme],
};

export const CustomFallback: Story = {
  render: () => (
    <ErrorBoundary
      fallback={<ErrorFallback error={new Error('Custom error!')} />}
    >
      <BuggyComponent />
    </ErrorBoundary>
  ),
  decorators: [withTheme],
};
