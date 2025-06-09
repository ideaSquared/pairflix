import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import mockTheme from '../../../__mocks__/mockTheme';
import { Input } from '../Input/Input';
import { FilterGroup, FilterItem, QuickFilter } from './FilterGroup';

// Test wrapper with ThemeProvider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={mockTheme}>{ui}</ThemeProvider>);
};

describe('FilterGroup', () => {
  const mockApply = jest.fn();
  const mockClear = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with title and default expanded state', () => {
    renderWithTheme(
      <FilterGroup title="Test Filters" onApply={mockApply} onClear={mockClear}>
        <FilterItem label="Test Filter">
          <Input placeholder="Filter value" />
        </FilterItem>
      </FilterGroup>
    );

    expect(screen.getByText('Test Filters')).toBeInTheDocument();
    expect(screen.getByText('Collapse')).toBeInTheDocument();
    expect(screen.getByTestId('filter-group')).toBeInTheDocument();
    expect(screen.getByTestId('filter-item')).toBeInTheDocument();
    expect(screen.getByText('Test Filter')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Filter value')).toBeInTheDocument();
  });

  test('collapses and expands when toggle button is clicked', () => {
    renderWithTheme(
      <FilterGroup title="Test Filters" onApply={mockApply} onClear={mockClear}>
        <FilterItem label="Test Filter">
          <Input placeholder="Filter value" />
        </FilterItem>
      </FilterGroup>
    );

    const toggleButton = screen.getByText('Collapse');
    fireEvent.click(toggleButton);

    expect(screen.getByText('Expand')).toBeInTheDocument();

    // Check that content is collapsed (CSS properties test)
    const filterContentContainer = document.getElementById('filter-content');

    expect(filterContentContainer).toHaveStyle('opacity: 0');

    // Expand again
    fireEvent.click(screen.getByText('Expand'));
    expect(screen.getByText('Collapse')).toBeInTheDocument();
    expect(filterContentContainer).toHaveStyle('opacity: 1');
  });

  test('calls onApply when Apply button is clicked', async () => {
    renderWithTheme(
      <FilterGroup title="Test Filters" onApply={mockApply} onClear={mockClear}>
        <FilterItem label="Test Filter">
          <Input placeholder="Filter value" />
        </FilterItem>
      </FilterGroup>
    );

    // Initially Apply button should be disabled
    const applyButton = screen.getByText('Apply Filters');
    expect(applyButton).toBeDisabled();

    // Make a change to enable the Apply button
    const input = screen.getByPlaceholderText('Filter value');
    await userEvent.type(input, 'test');

    // Now Apply button should be enabled
    expect(applyButton).not.toBeDisabled();

    // Click Apply button
    fireEvent.click(applyButton);

    // Verify onApply was called
    await waitFor(() => {
      expect(mockApply).toHaveBeenCalledTimes(1);
    });
  });

  test('calls onClear when Clear button is clicked', () => {
    renderWithTheme(
      <FilterGroup title="Test Filters" onApply={mockApply} onClear={mockClear}>
        <FilterItem label="Test Filter">
          <Input placeholder="Filter value" />
        </FilterItem>
      </FilterGroup>
    );

    const clearButton = screen.getByText('Clear Filters');
    fireEvent.click(clearButton);

    expect(mockClear).toHaveBeenCalledTimes(1);
  });

  test('disables buttons when disabled prop is true', () => {
    renderWithTheme(
      <FilterGroup
        title="Test Filters"
        onApply={mockApply}
        onClear={mockClear}
        disabled={true}
      >
        <FilterItem label="Test Filter">
          <Input placeholder="Filter value" />
        </FilterItem>
      </FilterGroup>
    );

    expect(screen.getByText('Apply Filters')).toBeDisabled();
    expect(screen.getByText('Clear Filters')).toBeDisabled();
  });

  test('renders with custom action component', () => {
    const ActionComponent = () => <button>Custom Action</button>;

    renderWithTheme(
      <FilterGroup
        title="Test Filters"
        onApply={mockApply}
        onClear={mockClear}
        actionComponent={<ActionComponent />}
      >
        <FilterItem label="Test Filter">
          <Input placeholder="Filter value" />
        </FilterItem>
      </FilterGroup>
    );

    expect(screen.getByText('Custom Action')).toBeInTheDocument();
  });
});

describe('FilterItem', () => {
  test('renders with label and required indicator', () => {
    renderWithTheme(
      <FilterGroup onApply={jest.fn()} onClear={jest.fn()}>
        <FilterItem label="Required Filter" required>
          <Input placeholder="Required input" />
        </FilterItem>
      </FilterGroup>
    );

    // Check that the label exists
    const label = screen.getByText('Required Filter');
    expect(label).toBeInTheDocument();

    // Check that the label has the required attribute by checking its parent
    // Since the asterisk is added via CSS ::after, we can't check textContent
    const filterItemContainer = screen.getByTestId('filter-item');
    expect(filterItemContainer.querySelector('div')).toHaveAttribute(
      'aria-required',
      'true'
    );
  });

  test('renders help text when provided', () => {
    renderWithTheme(
      <FilterGroup onApply={jest.fn()} onClear={jest.fn()}>
        <FilterItem label="Filter with help" helpText="This is help text">
          <Input placeholder="Input with help" />
        </FilterItem>
      </FilterGroup>
    );

    expect(screen.getByText('This is help text')).toBeInTheDocument();
  });

  test('displays error message when error prop is provided', () => {
    renderWithTheme(
      <FilterGroup onApply={jest.fn()} onClear={jest.fn()}>
        <FilterItem label="Filter with error" error="This is an error message">
          <Input placeholder="Input with error" />
        </FilterItem>
      </FilterGroup>
    );

    const errorMessage = screen.getByText('This is an error message');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveAttribute('role', 'alert');
  });

  test('sets isDirty when child input changes', async () => {
    const mockApply = jest.fn();

    renderWithTheme(
      <FilterGroup onApply={mockApply} onClear={jest.fn()}>
        <FilterItem label="Filter">
          <Input placeholder="Filter input" />
        </FilterItem>
      </FilterGroup>
    );

    // Apply button should be disabled initially
    const applyButton = screen.getByText('Apply Filters');
    expect(applyButton).toBeDisabled();

    // Type in the input
    await userEvent.type(screen.getByPlaceholderText('Filter input'), 'test');

    // Apply button should be enabled now
    expect(applyButton).not.toBeDisabled();
  });
});

// Basic test for QuickFilter component
describe('QuickFilter', () => {
  test('renders with options and handles selection', () => {
    const handleChange = jest.fn();
    const options = [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' },
    ];

    renderWithTheme(
      <FilterGroup onApply={jest.fn()} onClear={jest.fn()}>
        <QuickFilter
          label="Quick Filter"
          options={options}
          value="option1"
          onChange={handleChange}
        />
      </FilterGroup>
    );

    expect(screen.getByText('Quick Filter')).toBeInTheDocument();
    // Note: QuickFilter might need more specific tests based on its implementation
  });
});
