// filepath: c:\Users\thete\Desktop\localdev\pairflix\lib.components\src\components\inputs\SearchBar\SearchBar.test.tsx
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { lightThemeClass, themeRoot } from '../../../styles/theme.css';
import { SearchBar } from './SearchBar';

// Helper function to render with the real theme class applied
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<div className={`${lightThemeClass} ${themeRoot}`}>{ui}</div>);
};

vi.useFakeTimers();

afterAll(() => {
  // Vitest reuses worker threads across test files -- fake timers installed here would otherwise
  // leak into whichever file runs next in the same worker.
  vi.useRealTimers();
});

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
    // Font size is theme-driven (a CSS custom property), which jsdom's
    // getComputedStyle can't resolve back to a literal value -- assert the
    // size variant actually swaps the applied class instead.
    const { rerender } = renderWithTheme(
      <SearchBar data-testid="search-bar" size="small" />
    );

    const smallClassName = screen.getByTestId('search-bar').className;

    rerender(
      <div className={`${lightThemeClass} ${themeRoot}`}>
        <SearchBar data-testid="search-bar" size="medium" />
      </div>
    );

    const mediumClassName = screen.getByTestId('search-bar').className;
    expect(mediumClassName).not.toBe(smallClassName);

    rerender(
      <div className={`${lightThemeClass} ${themeRoot}`}>
        <SearchBar data-testid="search-bar" size="large" />
      </div>
    );

    const largeClassName = screen.getByTestId('search-bar').className;
    expect(largeClassName).not.toBe(mediumClassName);
  });

  it('applies full width style when isFullWidth is true', () => {
    renderWithTheme(<SearchBar data-testid="search-bar" isFullWidth />);

    const searchInput = screen.getByTestId('search-bar');
    expect(searchInput).toHaveStyle('width: 100%');
  });

  it('applies error state styling when isInvalid is true', () => {
    // Border color is theme-driven; compare against the non-invalid class
    // instead of a resolved color (see the size test above).
    const { rerender } = renderWithTheme(
      <SearchBar data-testid="search-bar" />
    );
    const defaultClassName = screen.getByTestId('search-bar').className;

    rerender(
      <div className={`${lightThemeClass} ${themeRoot}`}>
        <SearchBar data-testid="search-bar" isInvalid />
      </div>
    );
    const invalidClassName = screen.getByTestId('search-bar').className;

    expect(invalidClassName).not.toBe(defaultClassName);
  });

  it('applies disabled state correctly', () => {
    renderWithTheme(<SearchBar data-testid="search-bar" disabled />);

    const searchInput = screen.getByTestId('search-bar');
    expect(searchInput).toBeDisabled();

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
    const handleChange = vi.fn();

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
      vi.advanceTimersByTime(300);
    });

    // onChange should now be called
    expect(handleChange).toHaveBeenCalledWith('test');
  });

  it('calls onSearch when search button is clicked', () => {
    const handleSearch = vi.fn();

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
    const handleSearch = vi.fn();

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
    const handleChange = vi.fn();

    renderWithTheme(
      <SearchBar data-testid="search-bar" onChange={handleChange} />
    );

    const searchInput = screen.getByTestId('search-bar');

    // Enter text in the input
    fireEvent.change(searchInput, { target: { value: 'test query' } });

    // Fast forward debounce time
    act(() => {
      vi.advanceTimersByTime(300);
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
      <div className={`${lightThemeClass} ${themeRoot}`}>
        <SearchBar data-testid="search-bar" value="updated" />
      </div>
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
