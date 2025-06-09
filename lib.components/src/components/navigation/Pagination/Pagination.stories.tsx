import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { darkTheme, lightTheme } from '../../../styles/theme';
import Pagination, { CompactPagination, SimplePagination } from './Pagination';

/**
 * The Pagination component provides navigation controls for paginated content.
 * It supports various configurations including page numbers, first/last buttons, and different size variants.
 */
const meta: Meta<typeof Pagination> = {
  title: 'Navigation/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
    componentSubtitle: 'Navigation component for paginated content',
    docs: {
      description: {
        component:
          'A flexible pagination component that provides intuitive navigation through paginated data with various configuration options.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeProvider theme={lightTheme}>
        <div style={{ padding: '1rem', width: '100%', maxWidth: '800px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    currentPage: {
      description: 'Current active page (1-based)',
      control: { type: 'number', min: 1 },
      table: {
        type: { summary: 'number' },
      },
    },
    totalCount: {
      description: 'Total number of items',
      control: { type: 'number', min: 0 },
      table: {
        type: { summary: 'number' },
      },
    },
    limit: {
      description: 'Number of items per page',
      control: { type: 'number', min: 1 },
      table: {
        type: { summary: 'number' },
      },
    },
    totalPages: {
      description:
        'Total number of pages (calculated from totalCount and limit if not provided)',
      control: { type: 'number', min: 1 },
      table: {
        type: { summary: 'number' },
      },
    },
    onPageChange: {
      description: 'Callback function called when page changes',
      action: 'page changed',
      table: {
        type: { summary: '(page: number) => void' },
      },
    },
    showPageNumbers: {
      description: 'Whether to show page number buttons',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    maxPageButtons: {
      description: 'Maximum number of page buttons to display',
      control: { type: 'number', min: 3 },
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '5' },
      },
    },
    size: {
      description: 'Size variant of the pagination buttons',
      options: ['small', 'medium', 'large'],
      control: { type: 'radio' },
      table: {
        type: { summary: "'small' | 'medium' | 'large'" },
        defaultValue: { summary: "'medium'" },
      },
    },
    showFirstLast: {
      description: 'Whether to show first/last page buttons',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

/**
 * Default pagination with next/previous buttons only.
 * This is the simplest configuration for the Pagination component.
 */
export const Default: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
    onPageChange: page => console.log(`Page changed to ${page}`),
  },
};

/**
 * Pagination with page number buttons.
 * This configuration shows numbered buttons for easy navigation to specific pages.
 */
export const WithPageNumbers: Story = {
  args: {
    currentPage: 3,
    totalPages: 10,
    showPageNumbers: true,
    onPageChange: page => console.log(`Page changed to ${page}`),
  },
};

/**
 * Pagination with 'First' and 'Last' buttons.
 * This configuration adds quick navigation to the first and last pages.
 */
export const WithFirstLastButtons: Story = {
  args: {
    currentPage: 5,
    totalPages: 20,
    showPageNumbers: true,
    showFirstLast: true,
    onPageChange: page => console.log(`Page changed to ${page}`),
  },
};

/**
 * Demonstrates the three size variants: small, medium (default), and large.
 */
export const DifferentSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3>Small</h3>
        <Pagination
          currentPage={1}
          totalPages={10}
          showPageNumbers
          size="small"
          onPageChange={page => console.log(`Page changed to ${page}`)}
        />
      </div>
      <div>
        <h3>Medium (Default)</h3>
        <Pagination
          currentPage={1}
          totalPages={10}
          showPageNumbers
          size="medium"
          onPageChange={page => console.log(`Page changed to ${page}`)}
        />
      </div>
      <div>
        <h3>Large</h3>
        <Pagination
          currentPage={1}
          totalPages={10}
          showPageNumbers
          size="large"
          onPageChange={page => console.log(`Page changed to ${page}`)}
        />
      </div>
    </div>
  ),
};

/**
 * Simple pagination that only shows previous/next buttons.
 * Uses the SimplePagination component which is a specialized version of the full Pagination.
 */
export const Simple: Story = {
  render: () => (
    <SimplePagination
      currentPage={1}
      totalPages={10}
      onPageChange={page => console.log(`Page changed to ${page}`)}
    />
  ),
};

/**
 * Compact pagination with reduced UI for space-constrained scenarios.
 * Uses the CompactPagination component which limits the number of visible page buttons.
 */
export const Compact: Story = {
  render: () => (
    <CompactPagination
      currentPage={5}
      totalPages={20}
      showPageNumbers
      onPageChange={page => console.log(`Page changed to ${page}`)}
    />
  ),
};

/**
 * Demonstrates how the pagination handles many pages with ellipsis.
 * When there are many pages, ellipsis (...) is shown to represent skipped pages.
 */
export const WithManyPages: Story = {
  args: {
    currentPage: 7,
    totalPages: 100,
    showPageNumbers: true,
    maxPageButtons: 5,
    onPageChange: page => console.log(`Page changed to ${page}`),
  },
};

/**
 * Shows the pagination with total count and items per page.
 * Displays "Showing X to Y of Z results" information.
 */
export const WithTotalCount: Story = {
  args: {
    currentPage: 2,
    totalCount: 100,
    limit: 10,
    showPageNumbers: true,
    onPageChange: page => console.log(`Page changed to ${page}`),
  },
};

/**
 * Example with custom styling applied to the pagination component.
 */
export const CustomizedPagination: Story = {
  render: () => (
    <ThemeProvider theme={lightTheme}>
      <Pagination
        currentPage={3}
        totalPages={10}
        showPageNumbers
        showFirstLast
        className="custom-pagination"
        onPageChange={page => console.log(`Page changed to ${page}`)}
        style={{
          background: '#f0f7ff',
          padding: '10px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      />
    </ThemeProvider>
  ),
};

/**
 * Pagination with dark theme.
 * Shows how the component adapts to the dark theme.
 */
export const DarkTheme: Story = {
  decorators: [
    Story => (
      <ThemeProvider theme={darkTheme}>
        <div
          style={{
            padding: '1rem',
            background: '#121212',
            borderRadius: '8px',
          }}
        >
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  args: {
    currentPage: 3,
    totalPages: 10,
    showPageNumbers: true,
    onPageChange: page => console.log(`Page changed to ${page}`),
  },
};

/**
 * An interactive pagination example that maintains its own state.
 * This demonstrates how the pagination would work in a real application.
 */
export const Interactive: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [currentPage, setCurrentPage] = useState(1);
    const totalItems = 237;
    const itemsPerPage = 10;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <p>
            <strong>Interactive example:</strong> Try navigating through the
            pages
          </p>
          <p>
            Current page: {currentPage} of {totalPages}
          </p>
        </div>
        <Pagination
          currentPage={currentPage}
          totalCount={totalItems}
          limit={itemsPerPage}
          showPageNumbers
          showFirstLast
          onPageChange={page => setCurrentPage(page)}
        />
      </div>
    );
  },
};

/**
 * Demonstrates the accessibility features of the pagination component.
 * Highlights the ARIA attributes and keyboard navigation support.
 */
export const AccessibilityFeatures: Story = {
  render: () => (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <h3>Accessibility Features</h3>
        <ul>
          <li>ARIA attributes for screen readers</li>
          <li>Current page marked with aria-current="page"</li>
          <li>Descriptive aria-labels on buttons</li>
          <li>Keyboard navigable</li>
        </ul>
      </div>
      <Pagination
        currentPage={3}
        totalPages={10}
        showPageNumbers
        onPageChange={page => console.log(`Page changed to ${page}`)}
      />
    </div>
  ),
};
