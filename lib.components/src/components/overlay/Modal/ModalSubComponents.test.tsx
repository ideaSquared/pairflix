// filepath: c:\Users\thete\Desktop\localdev\pairflix\lib.components\src\components\overlay\Modal\ModalSubComponents.test.tsx
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { StyledModalBody, StyledModalFooter } from './ModalSubComponents';

// Mock theme for styled-components
const mockTheme = {
  colors: {
    border: {
      default: '#e0e0e0',
    },
  },
  spacing: {
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
  },
  breakpoints: {
    sm: '576px',
  },
};

// Helper function to render components with theme
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={mockTheme}>{ui}</ThemeProvider>);
};

describe('ModalBody', () => {
  it('renders children correctly', () => {
    renderWithTheme(
      <StyledModalBody>
        <p data-testid="body-content">Modal body content</p>
      </StyledModalBody>
    );

    expect(screen.getByTestId('body-content')).toBeInTheDocument();
    expect(screen.getByText('Modal body content')).toBeInTheDocument();
  });

  it('applies no padding when noPadding is true', () => {
    const { container } = renderWithTheme(
      <StyledModalBody noPadding data-testid="body-no-padding">
        Content
      </StyledModalBody>
    );

    const bodyElement = container.firstChild;
    expect(bodyElement).toHaveStyle('padding: 0');
  });

  it('passes additional props correctly', () => {
    renderWithTheme(
      <StyledModalBody data-testid="body-with-props" aria-label="Modal body">
        Content
      </StyledModalBody>
    );

    const bodyElement = screen.getByTestId('body-with-props');
    expect(bodyElement).toHaveAttribute('aria-label', 'Modal body');
  });

  it('applies custom className correctly', () => {
    renderWithTheme(
      <StyledModalBody
        className="custom-body-class"
        data-testid="body-with-class"
      >
        Content
      </StyledModalBody>
    );

    const bodyElement = screen.getByTestId('body-with-class');
    expect(bodyElement).toHaveClass('custom-body-class');
  });
});

describe('ModalFooter', () => {
  it('renders children correctly', () => {
    renderWithTheme(
      <StyledModalFooter>
        <button data-testid="cancel-button">Cancel</button>
        <button data-testid="confirm-button">Confirm</button>
      </StyledModalFooter>
    );

    expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-button')).toBeInTheDocument();
  });

  it('applies different justification styles correctly', () => {
    const { rerender } = renderWithTheme(
      <StyledModalFooter justifyContent="start" data-testid="footer">
        <button>Button</button>
      </StyledModalFooter>
    );

    let footerElement = screen.getByTestId('footer');
    expect(footerElement).toHaveStyle('justify-content: start');

    // Test center justification
    rerender(
      <ThemeProvider theme={mockTheme}>
        <StyledModalFooter justifyContent="center" data-testid="footer">
          <button>Button</button>
        </StyledModalFooter>
      </ThemeProvider>
    );

    footerElement = screen.getByTestId('footer');
    expect(footerElement).toHaveStyle('justify-content: center');

    // Test space-between justification
    rerender(
      <ThemeProvider theme={mockTheme}>
        <StyledModalFooter justifyContent="space-between" data-testid="footer">
          <button>Button</button>
        </StyledModalFooter>
      </ThemeProvider>
    );

    footerElement = screen.getByTestId('footer');
    expect(footerElement).toHaveStyle('justify-content: space-between');
  });

  it('applies divider when withDivider is true', () => {
    const { container } = renderWithTheme(
      <StyledModalFooter withDivider={true} data-testid="footer-with-divider">
        <button>Button</button>
      </StyledModalFooter>
    );

    const footerElement = container.firstChild;
    expect(footerElement).toHaveStyle(
      `border-top: 1px solid ${mockTheme.colors.border.default}`
    );
    expect(footerElement).toHaveStyle(`padding-top: ${mockTheme.spacing.md}`);
  });

  it('does not apply divider when withDivider is false', () => {
    const { container } = renderWithTheme(
      <StyledModalFooter
        withDivider={false}
        data-testid="footer-without-divider"
      >
        <button>Button</button>
      </StyledModalFooter>
    );

    const footerElement = container.firstChild;
    expect(footerElement).not.toHaveStyle(
      `border-top: 1px solid ${mockTheme.colors.border.default}`
    );
  });

  it('applies custom className correctly', () => {
    renderWithTheme(
      <StyledModalFooter
        className="custom-footer-class"
        data-testid="footer-with-class"
      >
        <button>Button</button>
      </StyledModalFooter>
    );

    const footerElement = screen.getByTestId('footer-with-class');
    expect(footerElement).toHaveClass('custom-footer-class');
  });
});
