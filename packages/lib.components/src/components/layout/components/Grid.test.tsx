import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { lightThemeClass, themeRoot, vars } from '../../../styles/theme.css';
import { Grid } from './Grid';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<div className={`${lightThemeClass} ${themeRoot}`}>{ui}</div>);
};

const colsOf = (el: HTMLElement) =>
  getComputedStyle(el).getPropertyValue('--grid-cols-base');

describe('Grid', () => {
  it('renders correctly with default props', () => {
    renderWithTheme(
      <Grid data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>
    );

    const gridElement = screen.getByTestId('grid');
    expect(gridElement).toHaveStyle('display: grid');
    expect(gridElement).toHaveStyle({
      display: 'grid',
      gap: vars.spacing.md,
      alignItems: 'stretch',
      justifyContent: 'start',
    });
  });

  it('renders with specified number of columns', () => {
    renderWithTheme(
      <Grid columns={3} data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </Grid>
    );

    const gridElement = screen.getByTestId('grid');
    expect(gridElement).toHaveStyle({ display: 'grid' });
    expect(colsOf(gridElement)).toBe('repeat(3, 1fr)');
  });

  it('renders with custom string column template', () => {
    renderWithTheme(
      <Grid columns="200px 1fr 2fr" data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </Grid>
    );

    const gridElement = screen.getByTestId('grid');
    expect(colsOf(gridElement)).toBe('200px 1fr 2fr');
  });

  it('applies different gap sizes', () => {
    const { rerender } = renderWithTheme(
      <Grid gap="xs" data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>
    );

    let gridElement = screen.getByTestId('grid');
    expect(gridElement).toHaveStyle({ gap: vars.spacing.xs });

    rerender(
      <div className={`${lightThemeClass} ${themeRoot}`}>
        <Grid gap="lg" data-testid="grid">
          <div>Item 1</div>
          <div>Item 2</div>
        </Grid>
      </div>
    );

    gridElement = screen.getByTestId('grid');
    expect(gridElement).toHaveStyle({ gap: vars.spacing.lg });
  });

  it('applies alignItems property', () => {
    renderWithTheme(
      <Grid alignItems="center" data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>
    );

    const gridElement = screen.getByTestId('grid');
    expect(gridElement).toHaveStyle('align-items: center');
  });

  it('applies justifyContent property', () => {
    renderWithTheme(
      <Grid justifyContent="space-between" data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>
    );

    const gridElement = screen.getByTestId('grid');
    expect(gridElement).toHaveStyle('justify-content: space-between');
  });

  it('applies autoFit with minColWidth', () => {
    renderWithTheme(
      <Grid autoFit minColWidth="250px" data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>
    );

    const gridElement = screen.getByTestId('grid');
    expect(gridElement).toHaveStyle('display: grid');
    expect(colsOf(gridElement)).toBe('repeat(auto-fit, minmax(250px, 1fr))');
  });

  it('applies responsive column props for different devices', () => {
    renderWithTheme(
      <Grid
        columns={4}
        desktopColumns={4}
        tabletColumns={2}
        mobileColumns={1}
        data-testid="grid"
      >
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
        <div>Item 4</div>
      </Grid>
    );

    // We can't easily test media queries in Jest, but we can verify that the component
    // accepts the props without errors and computes the right per-tier values. The
    // actual media query switching would need to be tested in a browser environment.
    const gridElement = screen.getByTestId('grid');
    expect(gridElement).toBeInTheDocument();
    expect(gridElement).toHaveStyle('display: grid');
    expect(
      getComputedStyle(gridElement).getPropertyValue('--grid-cols-desktop')
    ).toBe('repeat(4, 1fr)');
    expect(
      getComputedStyle(gridElement).getPropertyValue('--grid-cols-tablet')
    ).toBe('repeat(2, 1fr)');
    expect(
      getComputedStyle(gridElement).getPropertyValue('--grid-cols-mobile')
    ).toBe('repeat(1, 1fr)');
  });

  it('accepts and passes additional HTML attributes', () => {
    renderWithTheme(
      <Grid data-testid="grid" className="custom-grid" id="test-grid">
        <div>Item 1</div>
      </Grid>
    );

    const gridElement = screen.getByTestId('grid');
    expect(gridElement).toHaveClass('custom-grid');
    expect(gridElement).toHaveAttribute('id', 'test-grid');
  });
});
