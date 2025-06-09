import type { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider } from 'styled-components';
import { darkTheme, lightTheme } from '../../../styles/theme';
import { Link } from './Link';

/**
 * The Link component is a navigation element that allows users to navigate between pages or sections.
 * It supports various visual styles, states, and accessibility features.
 */
const meta: Meta<typeof Link> = {
  title: 'Navigation/Link',
  component: Link,
  parameters: {
    layout: 'centered',
    componentSubtitle: 'Navigation component for internal and external links',
    docs: {
      description: {
        component:
          'A versatile Link component for navigation with support for different visual styles, states, and accessibility features.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeProvider theme={lightTheme}>
        <div style={{ padding: '1rem' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    href: {
      control: 'text',
      description: 'URL for the link',
    },
    external: {
      control: 'boolean',
      description: 'Whether the link should open in a new tab',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    variant: {
      control: { type: 'radio' },
      options: ['primary', 'secondary', 'tertiary'],
      description: 'Visual style variant',
      table: {
        defaultValue: { summary: 'primary' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the link is disabled',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    active: {
      control: 'boolean',
      description: 'Whether the link represents the current page/location',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler function',
    },
    className: {
      control: 'text',
      description: 'Custom CSS class name',
    },
    children: {
      control: 'text',
      description: 'Link content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Link>;

/**
 * Default link with standard appearance.
 */
export const Default: Story = {
  args: {
    href: '#',
    children: 'Default Link',
  },
};

/**
 * Examples of different visual variants available for the Link component.
 */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Link href="#" variant="primary">
        Primary Link
      </Link>
      <Link href="#" variant="secondary">
        Secondary Link
      </Link>
      <Link href="#" variant="tertiary">
        Tertiary Link
      </Link>
    </div>
  ),
};

/**
 * External link that opens in a new tab with proper security attributes.
 */
export const External: Story = {
  args: {
    href: 'https://example.com',
    external: true,
    children: 'External Link',
  },
};

/**
 * Link in disabled state with reduced opacity and no interactivity.
 */
export const Disabled: Story = {
  args: {
    href: '#',
    disabled: true,
    children: 'Disabled Link',
  },
};

/**
 * Link representing the current page/location with active styling.
 */
export const Active: Story = {
  args: {
    href: '#',
    active: true,
    children: 'Active Link (Current Page)',
  },
};

/**
 * Link with custom click handler function.
 */
export const WithClickHandler: Story = {
  args: {
    href: '#',
    onClick: () => window.alert('Link clicked!'),
    children: 'Click to trigger handler',
  },
};

/**
 * Link with custom CSS styling applied.
 */
export const CustomStyling: Story = {
  render: () => (
    <div>
      <Link
        href="#"
        className="custom-link"
        style={{
          fontSize: '1.2rem',
          fontWeight: 'bold',
          padding: '0.5rem',
          background: '#e0e0ff',
          borderRadius: '4px',
        }}
      >
        Custom Styled Link
      </Link>
    </div>
  ),
};

/**
 * Dark theme variant of the Link component.
 */
export const DarkTheme: Story = {
  decorators: [
    Story => (
      <ThemeProvider theme={darkTheme}>
        <div
          style={{
            padding: '1rem',
            background: '#121212',
            minHeight: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  args: {
    href: '#',
    children: 'Dark Theme Link',
  },
};

/**
 * Demonstration of different states in a single view.
 */
export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <strong>Standard Links:</strong>
        <div style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
          <Link href="#">Default Link</Link>
        </div>
      </div>
      <div>
        <strong>Link Variants:</strong>
        <div
          style={{
            marginLeft: '1rem',
            marginTop: '0.5rem',
            display: 'flex',
            gap: '1rem',
          }}
        >
          <Link href="#" variant="primary">
            Primary
          </Link>
          <Link href="#" variant="secondary">
            Secondary
          </Link>
          <Link href="#" variant="tertiary">
            Tertiary
          </Link>
        </div>
      </div>
      <div>
        <strong>Link States:</strong>
        <div
          style={{
            marginLeft: '1rem',
            marginTop: '0.5rem',
            display: 'flex',
            gap: '1rem',
          }}
        >
          <Link href="#" active>
            Active
          </Link>
          <Link href="#" disabled>
            Disabled
          </Link>
          <Link href="https://example.com" external>
            External
          </Link>
        </div>
      </div>
    </div>
  ),
};

/**
 * Demonstration of accessibility features of the Link component.
 * This story shows keyboard navigation and proper ARIA attributes.
 */
export const Accessibility: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <p>
          The Link component supports keyboard navigation and proper ARIA
          attributes:
        </p>
        <ul style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
          <li>Keyboard navigation with Enter and Space keys</li>
          <li>aria-disabled attribute for disabled links</li>
          <li>aria-current for current/active pages</li>
          <li>Focus management with visible focus indicators</li>
        </ul>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <p>
          <strong>Try tabbing to these links and using Enter/Space:</strong>
        </p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <Link href="#">Standard Link</Link>
          <Link href="#" active>
            Active Link
          </Link>
          <Link href="#" disabled>
            Disabled Link
          </Link>
          <Link
            href="#"
            onClick={() => window.alert('Link clicked via keyboard!')}
          >
            Interactive Link
          </Link>
        </div>
      </div>
    </div>
  ),
};
