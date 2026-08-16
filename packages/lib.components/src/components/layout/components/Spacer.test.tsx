import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { lightThemeClass, themeRoot, vars } from '../../../styles/theme.css';
import { Spacer } from './Spacer';
import { hideOnMobileClass } from './Spacer.css';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<div className={`${lightThemeClass} ${themeRoot}`}>{ui}</div>);
};

const baseSizeOf = (el: HTMLElement) =>
  getComputedStyle(el).getPropertyValue('--spacer-size-base');

describe('Spacer', () => {
  it('renders vertical spacer with correct size', () => {
    renderWithTheme(<Spacer size="md" data-testid="spacer" />);
    const spacer = screen.getByTestId('spacer');

    expect(baseSizeOf(spacer)).toBe(vars.spacing.md);
    expect(spacer).toHaveStyle('width: 100%');
  });

  it('renders inline spacer correctly', () => {
    renderWithTheme(<Spacer size="lg" inline data-testid="spacer" />);
    const spacer = screen.getByTestId('spacer');

    expect(spacer).toHaveStyle('height: auto');
    expect(baseSizeOf(spacer)).toBe(vars.spacing.lg);
  });

  it('applies custom mobile size when provided', () => {
    renderWithTheme(<Spacer size="xl" mobileSize="xs" data-testid="spacer" />);
    const spacer = screen.getByTestId('spacer');

    // Default size for larger screens
    expect(baseSizeOf(spacer)).toBe(vars.spacing.xl);

    // The mobile size would be applied via media query which is harder to
    // test directly -- verify the mobile tier custom property itself instead.
    expect(
      getComputedStyle(spacer).getPropertyValue('--spacer-size-mobile')
    ).toBe(vars.spacing.xs);
  });

  it('applies custom tablet size when provided', () => {
    renderWithTheme(<Spacer size="xl" tabletSize="md" data-testid="spacer" />);
    const spacer = screen.getByTestId('spacer');

    // Default size for larger screens
    expect(baseSizeOf(spacer)).toBe(vars.spacing.xl);

    // Tablet size would be applied via media query -- verify the tablet
    // tier custom property itself instead.
    expect(
      getComputedStyle(spacer).getPropertyValue('--spacer-size-tablet')
    ).toBe(vars.spacing.md);
  });

  it('handles responsive prop for automatic size reduction on smaller screens', () => {
    renderWithTheme(<Spacer size="xl" responsive data-testid="spacer" />);
    const spacer = screen.getByTestId('spacer');

    // Default size for larger screens
    expect(baseSizeOf(spacer)).toBe(vars.spacing.xl);

    // Responsive behavior reduces the size on mobile via the mobile tier
    // custom property (xl downgrades to md).
    expect(
      getComputedStyle(spacer).getPropertyValue('--spacer-size-mobile')
    ).toBe(vars.spacing.md);
  });

  it('applies hideOnMobile prop correctly', () => {
    renderWithTheme(<Spacer size="md" hideOnMobile data-testid="spacer" />);
    const spacer = screen.getByTestId('spacer');

    // Basic size check
    expect(baseSizeOf(spacer)).toBe(vars.spacing.md);

    // hideOnMobile applies display: none via a media-scoped modifier class
    expect(spacer.classList.contains(hideOnMobileClass)).toBe(true);
  });
});
