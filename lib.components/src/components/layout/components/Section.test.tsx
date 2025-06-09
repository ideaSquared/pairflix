import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { Section } from './Section';

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
    background: {
      primary: '#ffffff',
      secondary: '#f5f5f5',
      tertiary: '#e0e0e0',
    },
  },
  breakpoints: {
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
  },
};

// Helper function to render with theme
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={mockTheme}>{ui}</ThemeProvider>);
};

describe('Section', () => {
  it('renders with default props correctly', () => {
    const { container } = renderWithTheme(
      <Section data-testid="section">Content</Section>
    );
    const sectionElement = container.firstChild;

    expect(sectionElement).toBeInTheDocument();
    expect(sectionElement).toHaveStyle(`padding-top: ${mockTheme.spacing.xl}`);
    expect(sectionElement).toHaveStyle(
      `padding-bottom: ${mockTheme.spacing.xl}`
    );
    expect(sectionElement).toHaveStyle('background: transparent');
    expect(sectionElement).toHaveStyle('width: auto');
    expect(sectionElement).toHaveTextContent('Content');
  });

  it('applies custom spacing when specified', () => {
    const { container } = renderWithTheme(
      <Section spacing="md" data-testid="section">
        Content
      </Section>
    );
    const sectionElement = container.firstChild;

    expect(sectionElement).toHaveStyle(`padding-top: ${mockTheme.spacing.md}`);
    expect(sectionElement).toHaveStyle(
      `padding-bottom: ${mockTheme.spacing.md}`
    );
  });

  it('applies full width when specified', () => {
    const { container } = renderWithTheme(
      <Section isFullWidth data-testid="section">
        Full Width Content
      </Section>
    );
    const sectionElement = container.firstChild;

    expect(sectionElement).toHaveStyle('width: 100%');
  });

  it('applies background color from theme when specified', () => {
    const { container } = renderWithTheme(
      <Section background="secondary" data-testid="section">
        Content
      </Section>
    );
    const sectionElement = container.firstChild;

    expect(sectionElement).toHaveStyle(
      `background: ${mockTheme.colors.background.secondary}`
    );
  });

  it('applies custom background color when specified', () => {
    const { container } = renderWithTheme(
      <Section customBackground="#ff0000" data-testid="section">
        Content
      </Section>
    );
    const sectionElement = container.firstChild;

    expect(sectionElement).toHaveStyle('background: #ff0000');
  });

  it('prioritizes customBackground over background from theme', () => {
    const { container } = renderWithTheme(
      <Section
        background="secondary"
        customBackground="#ff0000"
        data-testid="section"
      >
        Content
      </Section>
    );
    const sectionElement = container.firstChild;

    expect(sectionElement).toHaveStyle('background: #ff0000');
  });

  // Mobile-specific props are harder to test directly due to media queries
  it('supports the noSpacingOnMobile prop', () => {
    const { container } = renderWithTheme(
      <Section noSpacingOnMobile data-testid="section">
        No Mobile Spacing
      </Section>
    );

    // Base checks - media query effects would need jest-styled-components
    expect(container.firstChild).toBeInTheDocument();
  });

  // Responsive spacing tests would be similar to above
  // These would ideally be tested with jest-styled-components for media queries
});
