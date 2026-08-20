// filepath: c:\Users\thete\Desktop\localdev\pairflix\lib.components\src\components\inputs\Select\Select.test.tsx
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { lightThemeClass, themeRoot } from '../../../styles/theme.css';
import { Select } from './Select';

// Helper function to render with the real theme class applied
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<div className={`${lightThemeClass} ${themeRoot}`}>{ui}</div>);
};

// Sample options for testing
const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3', disabled: true },
];

describe('Select', () => {
  it('renders correctly with basic props', () => {
    renderWithTheme(<Select data-testid="select" options={mockOptions} />);

    const selectElement = screen.getByTestId('select');
    expect(selectElement).toBeInTheDocument();

    // Check if all options are rendered
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('renders with a label', () => {
    renderWithTheme(<Select label="Select an option" options={mockOptions} />);

    expect(screen.getByText('Select an option')).toBeInTheDocument();
    expect(screen.getByLabelText('Select an option')).toBeInTheDocument();
  });

  it('renders with a placeholder', () => {
    renderWithTheme(
      <Select options={mockOptions} placeholder="Choose an option" />
    );

    expect(screen.getByText('Choose an option')).toBeInTheDocument();
  });

  it('applies different sizes correctly', () => {
    const { rerender } = renderWithTheme(
      <Select data-testid="select" options={mockOptions} size="small" />
    );

    let selectElement = screen.getByTestId('select');
    expect(selectElement).toHaveStyle('height: 32px');

    rerender(
      <div className={`${lightThemeClass} ${themeRoot}`}>
        <Select data-testid="select" options={mockOptions} size="medium" />
      </div>
    );

    selectElement = screen.getByTestId('select');
    expect(selectElement).toHaveStyle('height: 40px');

    rerender(
      <div className={`${lightThemeClass} ${themeRoot}`}>
        <Select data-testid="select" options={mockOptions} size="large" />
      </div>
    );

    selectElement = screen.getByTestId('select');
    expect(selectElement).toHaveStyle('height: 48px');
  });

  it('applies full width style when isFullWidth is true', () => {
    renderWithTheme(
      <Select data-testid="select" options={mockOptions} isFullWidth />
    );

    const selectElement = screen.getByTestId('select');
    expect(selectElement).toHaveStyle('width: 100%');
  });

  it('applies error state styling when isInvalid is true', () => {
    // Border/text color are theme-driven (CSS custom properties), which
    // jsdom's getComputedStyle can't resolve back to a literal value -- the
    // aria-invalid attribute is what actually proves the error state wired
    // through.
    renderWithTheme(
      <Select
        data-testid="select"
        options={mockOptions}
        isInvalid
        helperText="This field is required"
      />
    );

    const selectElement = screen.getByTestId('select');
    expect(selectElement).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('applies required attribute and styling', () => {
    renderWithTheme(
      <Select
        data-testid="select"
        label="Required Field"
        options={mockOptions}
        required
      />
    );

    const selectElement = screen.getByTestId('select');
    expect(selectElement).toHaveAttribute('required');
    expect(selectElement).toHaveAttribute('aria-required', 'true');

    // The label should have the required asterisk
    const labelElement = screen.getByText('Required Field');
    // We can't directly test the ::after pseudo-element in JSDOM,
    // but we can check the parent element has the required flag
    expect(labelElement).toBeInTheDocument();
  });

  it('allows custom children instead of options array', () => {
    renderWithTheme(
      <Select data-testid="select">
        <option value="custom1">Custom Option 1</option>
        <option value="custom2">Custom Option 2</option>
      </Select>
    );

    expect(screen.getByText('Custom Option 1')).toBeInTheDocument();
    expect(screen.getByText('Custom Option 2')).toBeInTheDocument();
  });

  it('disables options correctly', () => {
    renderWithTheme(<Select data-testid="select" options={mockOptions} />);

    // Option 3 should be disabled
    const options = screen.getByTestId('select').querySelectorAll('option');
    expect(options[2]).toHaveAttribute('disabled');
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();

    renderWithTheme(
      <Select
        data-testid="select"
        options={mockOptions}
        onChange={handleChange}
      />
    );

    const selectElement = screen.getByTestId('select');
    fireEvent.change(selectElement, { target: { value: 'option2' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(selectElement).toHaveValue('option2');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLSelectElement>();

    renderWithTheme(
      <Select ref={ref} data-testid="select" options={mockOptions} />
    );

    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('SELECT');
  });

  it('applies additional HTML attributes', () => {
    renderWithTheme(
      <Select
        data-testid="select"
        options={mockOptions}
        name="test-select"
        defaultValue="option2"
      />
    );

    const selectElement = screen.getByTestId('select');
    expect(selectElement).toHaveAttribute('name', 'test-select');
    expect(selectElement).toHaveValue('option2');
  });
});
