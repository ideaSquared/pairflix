// filepath: c:\Users\thete\Desktop\localdev\pairflix\lib.components\src\components\inputs\SearchBar\SearchBar.test.tsx
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { ThemeProvider } from 'styled-components';
import { SearchBar } from './SearchBar';

// Mock theme for styled-components
const mockTheme = {
  colors: {
    background: {
      input: '#ffffff',
      disabled: '#f5f5f5',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
    border: {
      default: '#e0e0e0',
    },
    primary: '#0077cc',
    primaryHover: '#0066b3',
    error: '#f44336',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
  },
  borderRadius: {
    sm: '4px',
  },
  typography: {
    fontSize: {
      sm: '14px',
      md: '16px',
      lg: '18px',
    },
  },
  breakpoints: {
    sm: '576px',
  },
};

// Helper function to render with theme
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={mockTheme}>{ui}</ThemeProvider>);
};

jest.useFakeTimers();

describe('SearchBar', () => {
  it('renders correctly with default props', () => {
    renderWithTheme(<SearchBar data-testid="search-bar" />);

    const searchInput = screen.getByTestId('search-bar');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('placeholder', 'Search...');

    // Search button should be visible by default
    const searchButton = screen.getByText('Search');
    expect(searchButton).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    renderWithTheme(<SearchBar placeholder="Find something..." />);

    const searchInput = screen.getByPlaceholderText('Find something...');
    expect(searchInput).toBeInTheDocument();
  });

  it('renders without search button when showButton is false', () => {
    renderWithTheme(<SearchBar showButton={false} />);

    expect(screen.queryByText('Search')).not.toBeInTheDocument();
  });

  it('renders with custom button text', () => {
    renderWithTheme(<SearchBar buttonText="Find" />);

    const searchButton = screen.getByText('Find');
    expect(searchButton).toBeInTheDocument();
  });

  it('applies different sizes correctly', () => {
    const { rerender } = renderWithTheme(
      <SearchBar data-testid="search-bar" size="small" />
    );

    let searchInput = screen.getByTestId('search-bar');
    expect(searchInput).toHaveStyle(
      `font-size: ${mockTheme.typography.fontSize.sm}`
    );

    rerender(
      <ThemeProvider theme={mockTheme}>
        <SearchBar data-testid="search-bar" size="medium" />
      </ThemeProvider>
    );

    searchInput = screen.getByTestId('search-bar');
    expect(searchInput).toHaveStyle(
      `font-size: ${mockTheme.typography.fontSize.md}`
    );

    rerender(
      <ThemeProvider theme={mockTheme}>
        <SearchBar data-testid="search-bar" size="large" />
      </ThemeProvider>
    );

    searchInput = screen.getByTestId('search-bar');
    expect(searchInput).toHaveStyle(
      `font-size: ${mockTheme.typography.fontSize.lg}`
    );
  });

  it('applies full width style when isFullWidth is true', () => {
    renderWithTheme(<SearchBar data-testid="search-bar" isFullWidth />);

    const searchInput = screen.getByTestId('search-bar');
    expect(searchInput).toHaveStyle('width: 100%');
  });

  it('applies error state styling when isInvalid is true', () => {
    renderWithTheme(<SearchBar data-testid="search-bar" isInvalid />);

    const searchInput = screen.getByTestId('search-bar');
    expect(searchInput).toHaveStyle(
      `border: 1px solid ${mockTheme.colors.error}`
    );
  });

  it('applies disabled state correctly', () => {
    renderWithTheme(<SearchBar data-testid="search-bar" disabled />);

    const searchInput = screen.getByTestId('search-bar');
    expect(searchInput).toBeDisabled();
    expect(searchInput).toHaveStyle(
      `background: ${mockTheme.colors.background.disabled}`
    );

    const searchButton = screen.getByText('Search');
    expect(searchButton).toBeDisabled();
  });

  it('shows clear button when text is entered and showClear is true', () => {
    renderWithTheme(<SearchBar data-testid="search-bar" />);

    const searchInput = screen.getByTestId('search-bar');

    // Initially, clear button should not be visible
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();

    // Enter text in the input
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Clear button should now be visible
    const clearButton = screen.getByLabelText('Clear search');
    expect(clearButton).toBeInTheDocument();
  });

  it('does not show clear button when showClear is false', () => {
    renderWithTheme(<SearchBar data-testid="search-bar" showClear={false} />);

    const searchInput = screen.getByTestId('search-bar');

    // Enter text in the input
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Clear button should not be visible
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
  });

  it('calls onChange with debounce when input value changes', async () => {
    const handleChange = jest.fn();

    renderWithTheme(
      <SearchBar
        data-testid="search-bar"
        onChange={handleChange}
        debounceTime={300}
      />
    );

    const searchInput = screen.getByTestId('search-bar');

    // Enter text in the input
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // onChange should not be called immediately due to debounce
    expect(handleChange).not.toHaveBeenCalled();

    // Fast forward debounce time
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // onChange should now be called
    expect(handleChange).toHaveBeenCalledWith('test');
  });

  it('calls onSearch when search button is clicked', () => {
    const handleSearch = jest.fn();

    renderWithTheme(
      <SearchBar data-testid="search-bar" onSearch={handleSearch} />
    );

    const searchInput = screen.getByTestId('search-bar');
    const searchButton = screen.getByText('Search');

    // Enter text in the input
    fireEvent.change(searchInput, { target: { value: 'test query' } });

    // Click search button
    fireEvent.click(searchButton);

    // onSearch should be called with input value
    expect(handleSearch).toHaveBeenCalledWith('test query');
  });

  it('calls onSearch when Enter key is pressed', () => {
    const handleSearch = jest.fn();

    renderWithTheme(
      <SearchBar data-testid="search-bar" onSearch={handleSearch} />
    );

    const searchInput = screen.getByTestId('search-bar');

    // Enter text in the input
    fireEvent.change(searchInput, { target: { value: 'test query' } });

    // Press Enter key
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });

    // onSearch should be called with input value
    expect(handleSearch).toHaveBeenCalledWith('test query');
  });

  it('clears input value when clear button is clicked', () => {
    const handleChange = jest.fn();

    renderWithTheme(
      <SearchBar data-testid="search-bar" onChange={handleChange} />
    );

    const searchInput = screen.getByTestId('search-bar');

    // Enter text in the input
    fireEvent.change(searchInput, { target: { value: 'test query' } });

    // Fast forward debounce time
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Click clear button
    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);

    // Input should be cleared
    expect(searchInput).toHaveValue('');

    // onChange should be called with empty string
    expect(handleChange).toHaveBeenLastCalledWith('');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();

    renderWithTheme(<SearchBar data-testid="search-bar" ref={ref} />);

    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('INPUT');
  });

  it('updates local value when value prop changes', () => {
    const { rerender } = renderWithTheme(
      <SearchBar data-testid="search-bar" value="initial" />
    );

    const searchInput = screen.getByTestId('search-bar');
    expect(searchInput).toHaveValue('initial');

    rerender(
      <ThemeProvider theme={mockTheme}>
        <SearchBar data-testid="search-bar" value="updated" />
      </ThemeProvider>
    );

    expect(searchInput).toHaveValue('updated');
  });

  it('applies aria-label correctly', () => {
    renderWithTheme(
      <SearchBar data-testid="search-bar" aria-label="Product search" />
    );

    const searchInput = screen.getByTestId('search-bar');
    expect(searchInput).toHaveAttribute('aria-label', 'Product search');
  });
});
