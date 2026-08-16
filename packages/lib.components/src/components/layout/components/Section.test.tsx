import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { lightThemeClass, themeRoot, vars } from '../../../styles/theme.css';
import { Section } from './Section';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<div className={`${lightThemeClass} ${themeRoot}`}>{ui}</div>);
};

describe('Section', () => {
  it('renders with default props correctly', () => {
    renderWithTheme(<Section data-testid="section">Content</Section>);
    const sectionElement = screen.getByTestId('section');

    expect(sectionElement).toBeInTheDocument();
    expect(sectionElement).toHaveStyle({ paddingTop: vars.spacing.xl });
    expect(sectionElement).toHaveStyle({ paddingBottom: vars.spacing.xl });
    expect(sectionElement).toHaveStyle('background: transparent');
    expect(sectionElement).toHaveStyle('width: auto');
    expect(sectionElement).toHaveTextContent('Content');
  });

  it('applies custom spacing when specified', () => {
    renderWithTheme(
      <Section spacing="md" data-testid="section">
        Content
      </Section>
    );
    const sectionElement = screen.getByTestId('section');

    expect(sectionElement).toHaveStyle({ paddingTop: vars.spacing.md });
    expect(sectionElement).toHaveStyle({ paddingBottom: vars.spacing.md });
  });

  it('applies full width when specified', () => {
    renderWithTheme(
      <Section isFullWidth data-testid="section">
        Full Width Content
      </Section>
    );
    const sectionElement = screen.getByTestId('section');

    expect(sectionElement).toHaveStyle('width: 100%');
  });

  it('applies background color from theme when specified', () => {
    renderWithTheme(
      <Section background="secondary" data-testid="section">
        Content
      </Section>
    );
    const sectionElement = screen.getByTestId('section');

    expect(sectionElement).toHaveStyle({
      background: vars.colors.background.secondary,
    });
  });

  it('applies custom background color when specified', () => {
    renderWithTheme(
      <Section customBackground="#ff0000" data-testid="section">
        Content
      </Section>
    );
    const sectionElement = screen.getByTestId('section');

    expect(sectionElement).toHaveStyle('background: #ff0000');
  });

  it('prioritizes customBackground over background from theme', () => {
    renderWithTheme(
      <Section
        background="secondary"
        customBackground="#ff0000"
        data-testid="section"
      >
        Content
      </Section>
    );
    const sectionElement = screen.getByTestId('section');

    expect(sectionElement).toHaveStyle('background: #ff0000');
  });

  // Mobile-specific props are harder to test directly due to media queries
  it('supports the noSpacingOnMobile prop', () => {
    renderWithTheme(
      <Section noSpacingOnMobile data-testid="section">
        No Mobile Spacing
      </Section>
    );
    const sectionElement = screen.getByTestId('section');

    // Base checks - media query effects would need a real browser
    expect(sectionElement).toBeInTheDocument();
    expect(
      getComputedStyle(sectionElement).getPropertyValue(
        '--section-spacing-mobile'
      )
    ).toBe('0');
  });

  // Responsive spacing tests would be similar to above
  // These would ideally be tested in a real browser for media queries
});
