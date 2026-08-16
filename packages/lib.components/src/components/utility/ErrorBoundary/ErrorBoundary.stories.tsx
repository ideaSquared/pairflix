import type { Meta, StoryObj } from '@storybook/react';
import { ErrorBoundary, ErrorFallback } from './ErrorBoundary';

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Utility/ErrorBoundary',
  component: ErrorBoundary,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

const BuggyComponent = () => {
  throw new Error('This is a test error!');
};

export const DefaultFallback: Story = {
  render: () => (
    <ErrorBoundary>
      <BuggyComponent />
    </ErrorBoundary>
  ),
};

export const CustomFallback: Story = {
  render: () => (
    <ErrorBoundary
      fallback={<ErrorFallback error={new Error('Custom error!')} />}
    >
      <BuggyComponent />
    </ErrorBoundary>
  ),
};
