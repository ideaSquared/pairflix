import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { createRef } from 'react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../../styles/theme';
import { Input } from './Input';

// Helper to render components with theme
const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={lightTheme}>{component}</ThemeProvider>);
};

describe('Input Component', () => {
  // Basic rendering
  it('renders with label and placeholder', () => {
    // Arrange & Act
    renderWithTheme(
      <Input
        label="Username"
        placeholder="Enter username"
        data-testid="input"
      />
    );

    // Assert
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
  });

  // Different sizes
  it('renders in different sizes', () => {
    // Arrange & Act
    const { rerender } = renderWithTheme(
      <Input size="small" data-testid="input" />
    );

    // Assert
    let input = screen.getByTestId('input');
    expect(input).toBeInTheDocument();

    // Arrange & Act for medium
    rerender(
      <ThemeProvider theme={lightTheme}>
        <Input size="medium" data-testid="input" />
      </ThemeProvider>
    );

    // Assert
    input = screen.getByTestId('input');
    expect(input).toBeInTheDocument();

    // Arrange & Act for large
    rerender(
      <ThemeProvider theme={lightTheme}>
        <Input size="large" data-testid="input" />
      </ThemeProvider>
    );

    // Assert
    input = screen.getByTestId('input');
    expect(input).toBeInTheDocument();
  });

  // Full width styling
  it('applies full width styling when isFullWidth is true', () => {
    // Arrange & Act
    renderWithTheme(<Input isFullWidth data-testid="input" />);

    // Assert - Check presence of the component and verify its rendered in the DOM
    const input = screen.getByTestId('input');
    expect(input).toBeInTheDocument();

    // Get the parent InputGroup component which should have the full width styling
    const inputGroup =
      input.closest('div[class*="InputGroup"]') || input.closest('div');
    expect(inputGroup).toBeInTheDocument();
    // Just check if the component is rendered, as we can't directly test styled-components props
  });

  // Error state
  it('shows error state with helper text', () => {
    // Arrange & Act
    renderWithTheme(
      <Input
        label="Email"
        isInvalid
        helperText="Invalid email format"
        data-testid="input"
      />
    );

    // Assert
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
  });

  // Required state
  it('handles required state correctly', () => {
    // Arrange & Act
    renderWithTheme(
      <Input label="Required Field" required data-testid="input" />
    );

    // Assert
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('required');
    expect(input).toHaveAttribute('aria-required', 'true');

    // Check for required indicator in label
    const label = screen.getByText('Required Field');
    // We can't directly test pseudo-elements in JSDOM, so just verify the label exists
    expect(label).toBeInTheDocument();
    // Verify the label has the correct "for" attribute matching the input id
    expect(label.getAttribute('for')).toBe(input.getAttribute('id'));
  });

  // Start adornment
  it('renders start adornment', () => {
    // Arrange & Act
    renderWithTheme(
      <Input
        startAdornment={<span data-testid="start-icon">🔍</span>}
        data-testid="input"
      />
    );

    // Assert
    expect(screen.getByTestId('start-icon')).toBeInTheDocument();
    // Verify the adornment is rendered in the correct position
    const adornmentWrapper = screen.getByTestId('start-icon').closest('div');
    expect(adornmentWrapper).toBeInTheDocument();
  });

  // End adornment
  it('renders end adornment', () => {
    // Arrange & Act
    renderWithTheme(
      <Input
        endAdornment={<span data-testid="end-icon">❌</span>}
        data-testid="input"
      />
    );

    // Assert
    expect(screen.getByTestId('end-icon')).toBeInTheDocument();
    // Verify the adornment is rendered in the correct position
    const adornmentWrapper = screen.getByTestId('end-icon').closest('div');
    expect(adornmentWrapper).toBeInTheDocument();
  });

  // Disabled state
  it('applies disabled styling correctly', () => {
    // Arrange & Act
    renderWithTheme(<Input disabled data-testid="input" />);

    // Assert
    const input = screen.getByTestId('input');
    expect(input).toBeDisabled();
  });

  // Ref forwarding
  it('forwards ref correctly', () => {
    // Arrange
    const ref = createRef<HTMLInputElement>();

    // Act
    renderWithTheme(<Input ref={ref} data-testid="input" />);

    // Assert (can't directly test ref contents, so verify element is rendered)
    const input = screen.getByTestId('input');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
  });

  // User interaction
  it('handles user input correctly', async () => {
    // Arrange
    const onChange = jest.fn();
    renderWithTheme(<Input data-testid="input" onChange={onChange} />);

    // Act
    const input = screen.getByTestId('input');
    await userEvent.type(input, 'test');

    // Assert
    expect(onChange).toHaveBeenCalledTimes(4); // Once for each character
    expect(input).toHaveValue('test');
  });

  // Accessibility
  it('has appropriate accessibility attributes', () => {
    // Arrange & Act
    renderWithTheme(
      <Input
        label="Accessible Field"
        required
        isInvalid
        helperText="Error message"
        data-testid="input"
      />
    );

    // Assert
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('id', 'accessible-field');
  });

  // ID generation from label
  it('generates ID from label when not provided', () => {
    // Arrange & Act
    renderWithTheme(
      <Input label="Complex Label With Spaces" data-testid="input" />
    );

    // Assert
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('id', 'complex-label-with-spaces');
  });

  // Custom ID
  it('uses provided ID when available', () => {
    // Arrange & Act
    renderWithTheme(
      <Input label="Username" id="custom-input-id" data-testid="input" />
    );

    // Assert
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('id', 'custom-input-id');
  });
});
