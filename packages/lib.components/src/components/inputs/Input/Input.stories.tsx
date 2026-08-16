import type { Meta, StoryObj } from '@storybook/react';
import { FaLock, FaUser } from 'react-icons/fa';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Inputs/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    label: 'Username',
    placeholder: 'Enter your username',
  },
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const WithHelperText: Story = {
  args: {
    helperText: 'This is a helper text',
  },
};

export const Error: Story = {
  args: {
    isInvalid: true,
    helperText: 'This field is required',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Input size="small" label="Small" placeholder="Small" />
      <Input size="medium" label="Medium" placeholder="Medium" />
      <Input size="large" label="Large" placeholder="Large" />
    </div>
  ),
};

export const WithAdornments: Story = {
  render: () => (
    <Input
      label="With Icons"
      startAdornment={<FaUser />}
      endAdornment={<FaLock />}
      placeholder="With icons"
    />
  ),
};

export const FullWidth: Story = {
  args: {
    isFullWidth: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Disabled',
    placeholder: 'Disabled input',
  },
};

export const Playground: Story = {};
