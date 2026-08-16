import type { Meta, StoryObj } from '@storybook/react';
import { FaCheck, FaTimes } from 'react-icons/fa';
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

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="success">Success</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="warning">Warning</Button>
      <Button variant="text">Text</Button>
      <Button variant="outline">Outline</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Button size="small">Small</Button>
      <Button size="medium">Medium</Button>
      <Button size="large">Large</Button>
    </div>
  ),
};

export const Loading: Story = {
  render: () => <Button isLoading>Loading...</Button>,
};

export const Disabled: Story = {
  render: () => <Button disabled>Disabled</Button>,
};

export const FullWidth: Story = {
  render: () => <Button isFullWidth>Full Width</Button>,
};

export const WithIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Button leftIcon={<FaCheck />}>Left Icon</Button>
      <Button rightIcon={<FaTimes />}>Right Icon</Button>
      <Button leftIcon={<FaCheck />} rightIcon={<FaTimes />}>
        Both Icons
      </Button>
    </div>
  ),
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
};
