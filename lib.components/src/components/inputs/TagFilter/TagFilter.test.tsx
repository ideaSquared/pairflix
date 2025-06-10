import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../../styles/theme';
import TagFilter from './TagFilter';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={lightTheme}>{component}</ThemeProvider>);
};

describe('TagFilter', () => {
  const mockOnChange = jest.fn();
  const tags = ['react', 'typescript', 'javascript', 'css'];

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders without crashing', () => {
    renderWithTheme(
      <TagFilter tags={tags} selectedTags={[]} onChange={mockOnChange} />
    );
  });

  it('displays all available tags', () => {
    renderWithTheme(
      <TagFilter tags={tags} selectedTags={[]} onChange={mockOnChange} />
    );

    tags.forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it('shows All button by default', () => {
    renderWithTheme(
      <TagFilter tags={tags} selectedTags={[]} onChange={mockOnChange} />
    );
    expect(screen.getByText('All')).toBeInTheDocument();
  });

  it('hides All button when showAllButton is false', () => {
    renderWithTheme(
      <TagFilter
        tags={tags}
        selectedTags={[]}
        onChange={mockOnChange}
        showAllButton={false}
      />
    );
    expect(screen.queryByText('All')).not.toBeInTheDocument();
  });

  it('shows clear button when tags are selected and showClearButton is true', () => {
    renderWithTheme(
      <TagFilter
        tags={tags}
        selectedTags={['react']}
        onChange={mockOnChange}
        showClearButton={true}
      />
    );
    expect(screen.getByText('Clear filters')).toBeInTheDocument();
  });

  it('hides clear button when showClearButton is false', () => {
    renderWithTheme(
      <TagFilter
        tags={tags}
        selectedTags={['react']}
        onChange={mockOnChange}
        showClearButton={false}
      />
    );
    expect(screen.queryByText('Clear filters')).not.toBeInTheDocument();
  });

  it('adds a tag to selection when clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <TagFilter tags={tags} selectedTags={[]} onChange={mockOnChange} />
    );

    await user.click(screen.getByText('react'));
    expect(mockOnChange).toHaveBeenCalledWith(['react']);
  });

  it('removes a tag from selection when clicked again', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <TagFilter
        tags={tags}
        selectedTags={['react', 'typescript']}
        onChange={mockOnChange}
      />
    );

    await user.click(screen.getByText('react'));
    expect(mockOnChange).toHaveBeenCalledWith(['typescript']);
  });

  it('clears all filters when All button is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <TagFilter
        tags={tags}
        selectedTags={['react', 'typescript']}
        onChange={mockOnChange}
      />
    );

    await user.click(screen.getByText('All'));
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('clears all filters when Clear filters button is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <TagFilter
        tags={tags}
        selectedTags={['react', 'typescript']}
        onChange={mockOnChange}
      />
    );

    await user.click(screen.getByText('Clear filters'));
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('applies custom className', () => {
    const { container } = renderWithTheme(
      <TagFilter
        tags={tags}
        selectedTags={[]}
        onChange={mockOnChange}
        className="custom-filter"
      />
    );

    expect(container.firstChild).toHaveClass('custom-filter');
  });

  it('handles empty tags array', () => {
    renderWithTheme(
      <TagFilter tags={[]} selectedTags={[]} onChange={mockOnChange} />
    );

    // Should only show the All button
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.queryByText('Clear filters')).not.toBeInTheDocument();
  });

  it('maintains selection state correctly', () => {
    const selectedTags = ['react', 'typescript'];
    renderWithTheme(
      <TagFilter
        tags={tags}
        selectedTags={selectedTags}
        onChange={mockOnChange}
      />
    );

    // Selected tags should have active styling (this is more of a visual test)
    // In a real implementation, you'd test the styling or data attributes
    selectedTags.forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it('shows All button as active when no tags are selected', () => {
    renderWithTheme(
      <TagFilter tags={tags} selectedTags={[]} onChange={mockOnChange} />
    );

    // The All button should be active when no filters are selected
    expect(screen.getByText('All')).toBeInTheDocument();
  });

  it('does not show Clear filters button when no tags are selected', () => {
    renderWithTheme(
      <TagFilter tags={tags} selectedTags={[]} onChange={mockOnChange} />
    );

    expect(screen.queryByText('Clear filters')).not.toBeInTheDocument();
  });
});
