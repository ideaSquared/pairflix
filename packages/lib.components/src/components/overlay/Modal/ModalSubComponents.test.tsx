// filepath: c:\Users\thete\Desktop\localdev\pairflix\lib.components\src\components\overlay\Modal\ModalSubComponents.test.tsx
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { lightThemeClass, themeRoot, vars } from '../../../styles/theme.css';
import { StyledModalBody, StyledModalFooter } from './ModalSubComponents';

// The divider border color has no matching design token (the original
// theme access was already mismatched and always fell back to this
// literal), so it's asserted directly.
const dividerBorderColor = '#e0e0e0';

// Helper function to render components with theme
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<div className={`${lightThemeClass} ${themeRoot}`}>{ui}</div>);
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

    const bodyElement = container.firstChild?.firstChild;
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
      <div className={`${lightThemeClass} ${themeRoot}`}>
        <StyledModalFooter justifyContent="center" data-testid="footer">
          <button>Button</button>
        </StyledModalFooter>
      </div>
    );

    footerElement = screen.getByTestId('footer');
    expect(footerElement).toHaveStyle('justify-content: center');

    // Test space-between justification
    rerender(
      <div className={`${lightThemeClass} ${themeRoot}`}>
        <StyledModalFooter justifyContent="space-between" data-testid="footer">
          <button>Button</button>
        </StyledModalFooter>
      </div>
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

    const footerElement = container.firstChild?.firstChild;
    expect(footerElement).toHaveStyle(
      `border-top: 1px solid ${dividerBorderColor}`
    );
    expect(footerElement).toHaveStyle({ paddingTop: vars.spacing.md });
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

    const footerElement = container.firstChild?.firstChild;
    expect(footerElement).not.toHaveStyle(
      `border-top: 1px solid ${dividerBorderColor}`
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
