import type { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../../styles/theme';
import { Tooltip } from './Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'Overlay/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Tooltip>;

const withTheme = (StoryFn: React.ComponentType) => (
  <ThemeProvider theme={lightTheme}>
    <StoryFn />
  </ThemeProvider>
);

export const Default: Story = {
  render: () => (
    <Tooltip content="This is a tooltip!">
      <button>Hover me</button>
    </Tooltip>
  ),
  decorators: [withTheme],
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
  decorators: [withTheme],
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
  decorators: [withTheme],
};
