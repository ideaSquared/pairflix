import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Input } from '../Input';
import { FilterGroup } from './FilterGroup';

const meta: Meta<typeof FilterGroup> = {
  title: 'Inputs/FilterGroup',
  component: FilterGroup,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof FilterGroup>;

const DefaultDemo = () => {
  const [value, setValue] = useState('');
  return (
    <FilterGroup
      title="User Filters"
      onApply={() => alert('Filters applied!')}
      onClear={() => setValue('')}
    >
      <div>
        <label htmlFor="username">Username</label>
        <Input
          id="username"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Enter username"
        />
      </div>
    </FilterGroup>
  );
};

export const Default: Story = {
  render: () => <DefaultDemo />,
};

export const Collapsed: Story = {
  render: () => (
    <FilterGroup
      title="Collapsed Filters"
      defaultExpanded={false}
      onApply={() => {
        // Handle apply action
      }}
      onClear={() => {
        // Handle clear action
      }}
    >
      <div>Some filter content</div>
    </FilterGroup>
  ),
};

export const FullWidth: Story = {
  render: () => (
    <div style={{ width: 600 }}>
      <FilterGroup
        title="Full Width Filters"
        isFullWidth
        onApply={() => {
          // Handle apply action
        }}
        onClear={() => {
          // Handle clear action
        }}
      >
        <div>Some filter content</div>
      </FilterGroup>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <FilterGroup
      title="Disabled Filters"
      disabled
      onApply={() => {
        // Handle apply action
      }}
      onClear={() => {
        // Handle clear action
      }}
    >
      <div>Some filter content</div>
    </FilterGroup>
  ),
};
