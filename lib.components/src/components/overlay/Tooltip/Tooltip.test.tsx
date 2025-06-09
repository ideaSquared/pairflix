import { fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { ThemeProvider } from 'styled-components';
import { Tooltip } from './Tooltip';

// Mock theme for testing
const mockTheme = {
  colors: {
    text: {
      primary: '#000000',
      onPrimary: '#ffffff',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
  },
  typography: {
    fontSize: {
      sm: '14px',
    },
  },
  borderRadius: {
    sm: '4px',
  },
  shadows: {
    sm: '0 2px 8px rgba(0,0,0,0.15)',
  },
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={mockTheme}>{component}</ThemeProvider>);
};

// Mock timers for delay testing
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe('Tooltip', () => {
  describe('Basic Rendering', () => {
    it('renders trigger element', () => {
      renderWithTheme(
        <Tooltip content="Tooltip content">
          <button>Hover me</button>
        </Tooltip>
      );
      expect(screen.getByText('Hover me')).toBeInTheDocument();
    });

    it('renders tooltip content when open is true', () => {
      renderWithTheme(
        <Tooltip content="Tooltip content" open={true}>
          <button>Hover me</button>
        </Tooltip>
      );

      // Check that tooltip is rendered when controlled
      const tooltip = screen.queryByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(screen.getAllByText('Tooltip content')).toHaveLength(2); // Visual and accessibility content
    });
  });

  describe('Trigger Behaviors', () => {
    it('trigger element has correct attributes', () => {
      renderWithTheme(
        <Tooltip content="Tooltip content">
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      // Check that trigger has the necessary data attributes from Radix
      expect(trigger).toHaveAttribute('data-state');
    });

    it('supports custom side prop', () => {
      renderWithTheme(
        <Tooltip content="Tooltip content" open={true} side="bottom">
          <button>Hover me</button>
        </Tooltip>
      );

      const tooltip = screen.queryByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      // Check that the content wrapper has positioning attributes
      const tooltipContent = document.querySelector('[data-side="bottom"]');
      expect(tooltipContent).toBeInTheDocument();
    });

    it('supports focus events', () => {
      renderWithTheme(
        <Tooltip content="Tooltip content">
          <button>Focus me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Focus me');
      fireEvent.focus(trigger);
      // Verify focus doesn't cause errors and trigger has correct state
      expect(trigger).toHaveAttribute('data-state');
    });

    it('shows/hides with controlled mode', () => {
      const { rerender } = renderWithTheme(
        <Tooltip content="Tooltip content" open={false}>
          <button>Click me</button>
        </Tooltip>
      );

      // Initially hidden
      let tooltip = screen.queryByRole('tooltip');
      expect(tooltip).not.toBeInTheDocument();

      // Show tooltip
      rerender(
        <ThemeProvider theme={mockTheme}>
          <Tooltip content="Tooltip content" open={true}>
            <button>Click me</button>
          </Tooltip>
        </ThemeProvider>
      );

      tooltip = screen.queryByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('accepts delayDuration prop', () => {
      renderWithTheme(
        <Tooltip content="Tooltip content" delayDuration={500}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      // Verify the tooltip component renders without error with delayDuration
      expect(trigger).toBeInTheDocument();
    });
  });

  describe('Controlled Mode', () => {
    it('respects open prop in controlled mode', () => {
      const { rerender } = renderWithTheme(
        <Tooltip content="Tooltip content" open={false}>
          <button>Hover me</button>
        </Tooltip>
      );

      let tooltip = screen.queryByRole('tooltip');
      expect(tooltip).not.toBeInTheDocument();

      rerender(
        <ThemeProvider theme={mockTheme}>
          <Tooltip content="Tooltip content" open={true}>
            <button>Hover me</button>
          </Tooltip>
        </ThemeProvider>
      );

      tooltip = screen.queryByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
    });

    it('accepts onOpenChange callback', () => {
      const handleOpenChange = jest.fn();
      renderWithTheme(
        <Tooltip content="Tooltip content" onOpenChange={handleOpenChange}>
          <button>Hover me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover me');
      // Verify the tooltip component renders without error with onOpenChange
      expect(trigger).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA role', () => {
      renderWithTheme(
        <Tooltip content="Tooltip content" open={true}>
          <button>Hover me</button>
        </Tooltip>
      );
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('trigger is focusable for keyboard users', () => {
      renderWithTheme(
        <Tooltip content="Tooltip content">
          <button>Focus me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Focus me');
      fireEvent.focus(trigger);

      expect(trigger).toHaveAttribute('data-state');
    });
  });

  describe('Controlled State', () => {
    it('respects defaultOpen prop', () => {
      renderWithTheme(
        <Tooltip content="Tooltip content" defaultOpen={true}>
          <button>Hover me</button>
        </Tooltip>
      );

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
    });
  });
});
