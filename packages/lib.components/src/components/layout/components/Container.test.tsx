import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { breakpoints } from '../../../styles/theme';
import { lightThemeClass, themeRoot, vars } from '../../../styles/theme.css';
import { Container } from './Container';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<div className={`${lightThemeClass} ${themeRoot}`}>{ui}</div>);
};

describe('Container', () => {
  it('renders default container correctly', () => {
    renderWithTheme(<Container data-testid="container">Content</Container>);
    const containerElement = screen.getByTestId('container');

    expect(containerElement).toBeInTheDocument();
    expect(containerElement).toHaveStyle(`max-width: ${breakpoints.lg}`);
    expect(containerElement).toHaveStyle({ paddingLeft: vars.spacing.md });
    expect(containerElement).toHaveStyle({ paddingRight: vars.spacing.md });
    expect(containerElement).toHaveStyle('margin-left: auto');
    expect(containerElement).toHaveStyle('margin-right: auto');
    expect(containerElement).toHaveTextContent('Content');
  });

  it('renders fluid container correctly', () => {
    renderWithTheme(
      <Container fluid data-testid="container">
        Fluid Content
      </Container>
    );
    const containerElement = screen.getByTestId('container');

    expect(containerElement).toHaveStyle('max-width: none');
  });

  it('applies custom max width when specified', () => {
    renderWithTheme(
      <Container maxWidth="sm" data-testid="container">
        Small Container
      </Container>
    );
    const containerElement = screen.getByTestId('container');

    expect(containerElement).toHaveStyle(`max-width: ${breakpoints.sm}`);
  });

  it('applies custom padding when specified', () => {
    renderWithTheme(
      <Container padding="lg" data-testid="container">
        Padded Container
      </Container>
    );
    const containerElement = screen.getByTestId('container');

    expect(containerElement).toHaveStyle({ paddingLeft: vars.spacing.lg });
    expect(containerElement).toHaveStyle({ paddingRight: vars.spacing.lg });
  });

  it('allows disabling centering', () => {
    renderWithTheme(
      <Container centered={false} data-testid="container">
        Not Centered
      </Container>
    );
    const containerElement = screen.getByTestId('container');

    expect(containerElement).toHaveStyle('margin-left: 0');
    expect(containerElement).toHaveStyle('margin-right: 0');
  });

  it('applies full width when specified', () => {
    renderWithTheme(
      <Container isFullWidth data-testid="container">
        Full Width
      </Container>
    );
    const containerElement = screen.getByTestId('container');

    expect(
      getComputedStyle(containerElement).getPropertyValue('--container-width')
    ).toBe('100%');
  });

  it('applies custom width when specified', () => {
    renderWithTheme(
      <Container width="50%" data-testid="container">
        Half Width
      </Container>
    );
    const containerElement = screen.getByTestId('container');

    expect(
      getComputedStyle(containerElement).getPropertyValue('--container-width')
    ).toBe('50%');
  });

  it('applies min-width when specified', () => {
    renderWithTheme(
      <Container minWidth="300px" data-testid="container">
        With Min Width
      </Container>
    );
    const containerElement = screen.getByTestId('container');

    expect(containerElement).toHaveStyle('min-width: 300px');
  });

  it('applies custom max-width when specified', () => {
    renderWithTheme(
      <Container customMaxWidth="800px" data-testid="container">
        Custom Max Width
      </Container>
    );
    const containerElement = screen.getByTestId('container');

    expect(containerElement).toHaveStyle('max-width: 800px');
  });

  it('correctly prioritizes customMaxWidth over other width settings', () => {
    renderWithTheme(
      <Container
        maxWidth="xl"
        fluid
        customMaxWidth="600px"
        data-testid="container"
      >
        Custom Over Fluid
      </Container>
    );
    const containerElement = screen.getByTestId('container');

    expect(containerElement).toHaveStyle('max-width: 600px');
  });

  // Mobile-specific props are harder to test directly due to media queries
  it('supports the noPaddingOnMobile prop', () => {
    renderWithTheme(
      <Container noPaddingOnMobile data-testid="container">
        No Mobile Padding
      </Container>
    );
    const containerElement = screen.getByTestId('container');

    // Base checks - media query effects would need a real browser
    expect(containerElement).toBeInTheDocument();
    expect(
      getComputedStyle(containerElement).getPropertyValue(
        '--container-padding-mobile'
      )
    ).toBe('0');
  });
});
