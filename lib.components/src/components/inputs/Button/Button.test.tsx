// filepath: c:\Users\thete\Desktop\localdev\pairflix\lib.components\src\components\inputs\Button\Button.test.tsx
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { ThemeProvider } from 'styled-components';
import mockTheme from '../../../__mocks__/mockTheme';
import Button, { ButtonProps } from './Button';

// Test rendering with theme provider
const renderWithTheme = (props: Partial<ButtonProps> = {}) => {
  const defaultProps = {
    children: 'Button Text',
  };

  return render(
    <ThemeProvider theme={mockTheme}>
      <Button {...defaultProps} {...props} />
    </ThemeProvider>
  );
};

describe('Button', () => {
  it('renders with default props', () => {
    renderWithTheme();

    const button = screen.getByRole('button', { name: 'Button Text' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
    expect(button).not.toBeDisabled();
  });

  it('renders different variants', () => {
    const variants = [
      'primary',
      'secondary',
      'success',
      'danger',
      'warning',
      'text',
      'outline',
    ] as const;

    variants.forEach(variant => {
      const { rerender } = renderWithTheme({ variant });

      const button = screen.getByRole('button', { name: 'Button Text' });
      expect(button).toBeInTheDocument();

      // Clean up before next render
      rerender(
        <ThemeProvider theme={mockTheme}>
          <></>
        </ThemeProvider>
      );
    });
  });

  it('renders different sizes', () => {
    const sizes = ['small', 'medium', 'large'] as const;

    sizes.forEach(size => {
      const { rerender } = renderWithTheme({ size });

      const button = screen.getByRole('button', { name: 'Button Text' });
      expect(button).toBeInTheDocument();

      // Clean up before next render
      rerender(
        <ThemeProvider theme={mockTheme}>
          <></>
        </ThemeProvider>
      );
    });
  });

  it('applies full width when isFullWidth is true', () => {
    renderWithTheme({ isFullWidth: true });

    // Use getComputedStyle to check if width is 100%
    const button = screen.getByRole('button');
    expect(getComputedStyle(button).width).toBe('100%');
  });

  it('disables the button when disabled prop is true', () => {
    renderWithTheme({ disabled: true });

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('shows loading state when isLoading is true', () => {
    renderWithTheme({ isLoading: true });

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');

    // Check for spinner element
    const spinner = button.querySelector('span');
    expect(spinner).toBeInTheDocument();
  });

  it('hides icons when in loading state', () => {
    renderWithTheme({
      isLoading: true,
      leftIcon: <span data-testid="left-icon">←</span>,
      rightIcon: <span data-testid="right-icon">→</span>,
    });

    // Check that icons are not rendered
    expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
  });

  it('renders left and right icons', () => {
    renderWithTheme({
      leftIcon: <span data-testid="left-icon">←</span>,
      rightIcon: <span data-testid="right-icon">→</span>,
    });

    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    renderWithTheme({ onClick: handleClick });

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = jest.fn();
    renderWithTheme({ onClick: handleClick, disabled: true });

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not call onClick when loading', () => {
    const handleClick = jest.fn();
    renderWithTheme({ onClick: handleClick, isLoading: true });

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders as submit button when type is submit', () => {
    renderWithTheme({ type: 'submit' });

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('forwards ref to the button element', () => {
    const ref = React.createRef<HTMLButtonElement>();

    render(
      <ThemeProvider theme={mockTheme}>
        <Button ref={ref}>Ref Button</Button>
      </ThemeProvider>
    );

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current?.textContent).toBe('Ref Button');
  });

  it('applies custom className', () => {
    renderWithTheme({ className: 'custom-button' });

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-button');
  });

  it('renders with form attribute when form prop is provided', () => {
    renderWithTheme({ form: 'form-id' });

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('form', 'form-id');
  });
});
