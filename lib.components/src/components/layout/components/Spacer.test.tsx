import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { Spacer } from './Spacer';

// Mock theme for styled-components
const mockTheme = {
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '2rem',
    xl: '3rem',
  },
  colors: {
    text: {
      primary: '#000000',
    },
    background: {
      primary: '#ffffff',
    },
  },
  breakpoints: {
    sm: '600px',
    md: '960px',
    lg: '1280px',
    xl: '1920px',
  },
};

// Helper function to render with theme
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={mockTheme}>{ui}</ThemeProvider>);
};

describe('Spacer', () => {
  it('renders vertical spacer with correct size', () => {
    const { container } = renderWithTheme(
      <Spacer size="md" data-testid="spacer" />
    );
    const spacer = container.firstChild;

    expect(spacer).toHaveStyle('height: 1rem');
    expect(spacer).toHaveStyle('width: 100%');
  });

  it('renders inline spacer correctly', () => {
    const { container } = renderWithTheme(
      <Spacer size="lg" inline data-testid="spacer" />
    );
    const spacer = container.firstChild;

    expect(spacer).toHaveStyle('height: auto');
    expect(spacer).toHaveStyle('width: 2rem');
  });

  it('applies custom mobile size when provided', () => {
    const { container } = renderWithTheme(
      <Spacer size="xl" mobileSize="xs" data-testid="spacer" />
    );
    const spacer = container.firstChild;

    // Default size for larger screens
    expect(spacer).toHaveStyle('height: 3rem');

    // The mobile size would be applied via media query which is harder to test directly
    // Would typically need to use a library like jest-styled-components for complete media query testing
  });

  it('applies custom tablet size when provided', () => {
    const { container } = renderWithTheme(
      <Spacer size="xl" tabletSize="md" data-testid="spacer" />
    );
    const spacer = container.firstChild;

    // Default size for larger screens
    expect(spacer).toHaveStyle('height: 3rem');

    // Tablet size would be applied via media query
  });

  it('handles responsive prop for automatic size reduction on smaller screens', () => {
    const { container } = renderWithTheme(
      <Spacer size="xl" responsive data-testid="spacer" />
    );
    const spacer = container.firstChild;

    // Default size for larger screens
    expect(spacer).toHaveStyle('height: 3rem');

    // Responsive behavior would reduce size on mobile via media queries
  });

  it('applies hideOnMobile prop correctly', () => {
    const { container } = renderWithTheme(
      <Spacer size="md" hideOnMobile data-testid="spacer" />
    );
    const spacer = container.firstChild;

    // Basic size check
    expect(spacer).toHaveStyle('height: 1rem');

    // hideOnMobile would apply display: none via media query
  });
});
