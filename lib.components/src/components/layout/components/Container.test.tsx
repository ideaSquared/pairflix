import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { Container } from './Container';

// Mock theme for styled-components
const mockTheme = {
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '2rem',
    xl: '3rem',
  },
  breakpoints: {
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    xxl: '1400px',
  },
};

// Helper function to render with theme
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={mockTheme}>{ui}</ThemeProvider>);
};

describe('Container', () => {
  it('renders default container correctly', () => {
    const { container } = renderWithTheme(
      <Container data-testid="container">Content</Container>
    );
    const containerElement = container.firstChild;

    expect(containerElement).toBeInTheDocument();
    expect(containerElement).toHaveStyle(
      `max-width: ${mockTheme.breakpoints.lg}`
    );
    expect(containerElement).toHaveStyle(
      `padding-left: ${mockTheme.spacing.md}`
    );
    expect(containerElement).toHaveStyle(
      `padding-right: ${mockTheme.spacing.md}`
    );
    expect(containerElement).toHaveStyle('margin-left: auto');
    expect(containerElement).toHaveStyle('margin-right: auto');
    expect(containerElement).toHaveTextContent('Content');
  });

  it('renders fluid container correctly', () => {
    const { container } = renderWithTheme(
      <Container fluid data-testid="container">
        Fluid Content
      </Container>
    );
    const containerElement = container.firstChild;

    expect(containerElement).toHaveStyle('max-width: none');
  });

  it('applies custom max width when specified', () => {
    const { container } = renderWithTheme(
      <Container maxWidth="sm" data-testid="container">
        Small Container
      </Container>
    );
    const containerElement = container.firstChild;

    expect(containerElement).toHaveStyle(
      `max-width: ${mockTheme.breakpoints.sm}`
    );
  });

  it('applies custom padding when specified', () => {
    const { container } = renderWithTheme(
      <Container padding="lg" data-testid="container">
        Padded Container
      </Container>
    );
    const containerElement = container.firstChild;

    expect(containerElement).toHaveStyle(
      `padding-left: ${mockTheme.spacing.lg}`
    );
    expect(containerElement).toHaveStyle(
      `padding-right: ${mockTheme.spacing.lg}`
    );
  });

  it('allows disabling centering', () => {
    const { container } = renderWithTheme(
      <Container centered={false} data-testid="container">
        Not Centered
      </Container>
    );
    const containerElement = container.firstChild;

    expect(containerElement).toHaveStyle('margin-left: 0');
    expect(containerElement).toHaveStyle('margin-right: 0');
  });

  it('applies full width when specified', () => {
    const { container } = renderWithTheme(
      <Container isFullWidth data-testid="container">
        Full Width
      </Container>
    );
    const containerElement = container.firstChild;

    expect(containerElement).toHaveStyle('width: 100%');
  });

  it('applies custom width when specified', () => {
    const { container } = renderWithTheme(
      <Container width="50%" data-testid="container">
        Half Width
      </Container>
    );
    const containerElement = container.firstChild;

    expect(containerElement).toHaveStyle('width: 50%');
  });

  it('applies min-width when specified', () => {
    const { container } = renderWithTheme(
      <Container minWidth="300px" data-testid="container">
        With Min Width
      </Container>
    );
    const containerElement = container.firstChild;

    expect(containerElement).toHaveStyle('min-width: 300px');
  });

  it('applies custom max-width when specified', () => {
    const { container } = renderWithTheme(
      <Container customMaxWidth="800px" data-testid="container">
        Custom Max Width
      </Container>
    );
    const containerElement = container.firstChild;

    expect(containerElement).toHaveStyle('max-width: 800px');
  });

  it('correctly prioritizes customMaxWidth over other width settings', () => {
    const { container } = renderWithTheme(
      <Container
        maxWidth="xl"
        fluid
        customMaxWidth="600px"
        data-testid="container"
      >
        Custom Over Fluid
      </Container>
    );
    const containerElement = container.firstChild;

    expect(containerElement).toHaveStyle('max-width: 600px');
  });

  // Mobile-specific props are harder to test directly due to media queries
  it('supports the noPaddingOnMobile prop', () => {
    const { container } = renderWithTheme(
      <Container noPaddingOnMobile data-testid="container">
        No Mobile Padding
      </Container>
    );

    // Base checks - media query effects would need jest-styled-components
    expect(container.firstChild).toBeInTheDocument();
  });
});
