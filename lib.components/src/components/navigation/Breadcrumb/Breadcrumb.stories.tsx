import type { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../../styles/theme';
import { Breadcrumb } from './Breadcrumb';

/**
 * Breadcrumb navigation component that displays a hierarchy of links to help users navigate through the application.
 *
 * Breadcrumbs improve navigation by showing users their current location and providing a way to navigate back through the hierarchy.
 */
const meta: Meta<typeof Breadcrumb> = {
  title: 'Navigation/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    layout: 'centered',
    componentSubtitle: 'Navigation component showing hierarchical paths',
    docs: {
      description: {
        component:
          'Breadcrumbs help users visualize their current location and navigate between hierarchical levels.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeProvider theme={lightTheme}>
        <div style={{ padding: '1rem', maxWidth: '600px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    items: {
      description: 'Array of breadcrumb items to display',
      control: 'object',
    },
    separator: {
      description: 'Custom separator between items',
      control: 'text',
    },
    maxItems: {
      description: 'Maximum items to show before truncating',
      control: { type: 'number', min: 1 },
    },
    className: {
      description: 'Additional CSS class',
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

/**
 * Basic example of a breadcrumb showing the standard usage with default separator.
 */
export const Default: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Movies', href: '/movies' },
      { label: 'Action', href: '/movies/action' },
      { label: 'The Dark Knight' },
    ],
  },
};

/**
 * Example showing a custom separator (>) instead of the default slash.
 */
export const CustomSeparator: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Movies', href: '/movies' },
      { label: 'Action', href: '/movies/action' },
      { label: 'The Dark Knight' },
    ],
    separator: '>',
  },
};

/**
 * Example using a component as a separator instead of a string.
 */
export const ComponentSeparator: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Movies', href: '/movies' },
      { label: 'Action', href: '/movies/action' },
      { label: 'The Dark Knight' },
    ],
    separator: <span style={{ color: 'blue', fontWeight: 'bold' }}>❯</span>,
  },
};

/**
 * Example demonstrating how breadcrumbs handle truncation when there are many items.
 * This helps keep the breadcrumb navigation compact while still providing context.
 */
export const Truncated: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Movies', href: '/movies' },
      { label: 'Genres', href: '/movies/genres' },
      { label: 'Action', href: '/movies/genres/action' },
      { label: 'Superhero', href: '/movies/genres/action/superhero' },
      { label: 'Batman', href: '/movies/genres/action/superhero/batman' },
      { label: 'The Dark Knight' },
    ],
    maxItems: 3,
  },
};

/**
 * Example showing how breadcrumbs behave with click handlers instead of hrefs.
 * This is useful for single-page applications or custom navigation behavior.
 */
export const WithClickHandlers: Story = {
  args: {
    items: [
      {
        label: 'Home',
        onClick: () => alert('Home clicked!'),
      },
      {
        label: 'Movies',
        onClick: () => alert('Movies clicked!'),
      },
      {
        label: 'Action',
        onClick: () => alert('Action clicked!'),
      },
      {
        label: 'The Dark Knight',
      },
    ],
  },
};

/**
 * Example with custom styling applied to the breadcrumb container.
 */
export const CustomStyling: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Movies', href: '/movies' },
      { label: 'The Dark Knight' },
    ],
    className: 'custom-breadcrumb',
  },
  decorators: [
    Story => (
      <ThemeProvider theme={lightTheme}>
        <style>
          {`
            .custom-breadcrumb {
              background-color: #f5f5f5;
              padding: 12px 16px;
              border-radius: 8px;
              font-weight: bold;
            }
          `}
        </style>
        <div style={{ padding: '1rem', maxWidth: '600px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

/**
 * Single item breadcrumb, typically used when at the root level.
 */
export const SingleItem: Story = {
  args: {
    items: [{ label: 'Home' }],
  },
};

/**
 * Example showing how the breadcrumb handles mobile viewports.
 */
export const MobileView: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Movies', href: '/movies' },
      { label: 'Action', href: '/movies/action' },
      { label: 'The Dark Knight' },
    ],
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
