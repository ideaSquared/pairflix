import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'Overlay/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <Tooltip content="This is a tooltip!">
      <button>Hover me</button>
    </Tooltip>
  ),
};

export const Placement: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: 32,
        justifyContent: 'center',
        marginTop: 40,
      }}
    >
      <Tooltip content="Top" side="top">
        <button>Top</button>
      </Tooltip>
      <Tooltip content="Right" side="right">
        <button>Right</button>
      </Tooltip>
      <Tooltip content="Bottom" side="bottom">
        <button>Bottom</button>
      </Tooltip>
      <Tooltip content="Left" side="left">
        <button>Left</button>
      </Tooltip>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Tooltip
      content={
        <span>
          Tooltip with <b>bold</b> content
        </span>
      }
    >
      <input placeholder="Focus or hover me" />
    </Tooltip>
  ),
};
