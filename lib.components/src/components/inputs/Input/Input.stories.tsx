import type { Meta, StoryObj } from '@storybook/react';
import { FaLock, FaUser } from 'react-icons/fa';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../../styles/theme';
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

const withTheme = (StoryFn: React.ComponentType) => (
  <ThemeProvider theme={lightTheme}>
    <StoryFn />
  </ThemeProvider>
);

export const Default: Story = {
  decorators: [withTheme],
};

export const WithHelperText: Story = {
  args: {
    helperText: 'This is a helper text',
  },
  decorators: [withTheme],
};

export const Error: Story = {
  args: {
    isInvalid: true,
    helperText: 'This field is required',
  },
  decorators: [withTheme],
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Input size="small" label="Small" placeholder="Small" />
      <Input size="medium" label="Medium" placeholder="Medium" />
      <Input size="large" label="Large" placeholder="Large" />
    </div>
  ),
  decorators: [withTheme],
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
  decorators: [withTheme],
};

export const FullWidth: Story = {
  args: {
    isFullWidth: true,
  },
  decorators: [withTheme],
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Disabled',
    placeholder: 'Disabled input',
  },
  decorators: [withTheme],
};

export const Playground: Story = {
  decorators: [withTheme],
};
