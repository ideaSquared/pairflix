import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../../styles/theme';
import TagInput from './TagInput';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={lightTheme}>{component}</ThemeProvider>);
};

describe('TagInput', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders without crashing', () => {
    renderWithTheme(<TagInput tags={[]} onChange={mockOnChange} />);
  });

  it('displays placeholder text', () => {
    renderWithTheme(
      <TagInput tags={[]} onChange={mockOnChange} placeholder="Enter tags..." />
    );
    expect(screen.getByPlaceholderText('Enter tags...')).toBeInTheDocument();
  });

  it('displays existing tags', () => {
    renderWithTheme(
      <TagInput tags={['react', 'typescript']} onChange={mockOnChange} />
    );
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('adds a tag when clicking Add button', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TagInput tags={[]} onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Add a tag...');
    const addButton = screen.getByRole('button', { name: 'Add' });

    await user.type(input, 'newtag');
    await user.click(addButton);

    expect(mockOnChange).toHaveBeenCalledWith(['newtag']);
  });

  it('adds a tag when pressing Enter', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TagInput tags={[]} onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Add a tag...');
    await user.type(input, 'newtag{enter}');

    expect(mockOnChange).toHaveBeenCalledWith(['newtag']);
  });

  it('trims whitespace from tags', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TagInput tags={[]} onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Add a tag...');
    await user.type(input, '  newtag  {enter}');

    expect(mockOnChange).toHaveBeenCalledWith(['newtag']);
  });

  it('does not add empty tags', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TagInput tags={[]} onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Add a tag...');
    await user.type(input, '   {enter}');

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('does not add duplicate tags', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TagInput tags={['existing']} onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Add a tag...');
    await user.type(input, 'existing{enter}');

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('removes a tag when clicking remove button', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <TagInput tags={['tag1', 'tag2']} onChange={mockOnChange} />
    );

    // Find the remove button for tag1 (×)
    const removeButtons = screen.getAllByText('×');
    expect(removeButtons).toHaveLength(2);
    await user.click(removeButtons[0]!);

    expect(mockOnChange).toHaveBeenCalledWith(['tag2']);
  });

  it('clears input after adding a tag', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TagInput tags={[]} onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Add a tag...');
    await user.type(input, 'newtag{enter}');

    expect(input).toHaveValue('');
  });

  it('respects maxTags limit', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <TagInput tags={['tag1', 'tag2']} onChange={mockOnChange} maxTags={2} />
    );

    const input = screen.getByPlaceholderText('Add a tag...');
    const addButton = screen.getByRole('button', { name: 'Add' });

    expect(input).toBeDisabled();
    expect(addButton).toBeDisabled();

    await user.type(input, 'newtag');
    await user.click(addButton);

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('shows helper text when no tags exist', () => {
    renderWithTheme(<TagInput tags={[]} onChange={mockOnChange} />);
    expect(
      screen.getByText('Press Enter or click Add to create tags')
    ).toBeInTheDocument();
  });

  it('shows max tags warning when limit reached', () => {
    renderWithTheme(
      <TagInput tags={['tag1', 'tag2']} onChange={mockOnChange} maxTags={2} />
    );
    expect(screen.getByText('Maximum 2 tags allowed')).toBeInTheDocument();
  });

  it('disables Add button when input is empty', () => {
    renderWithTheme(<TagInput tags={[]} onChange={mockOnChange} />);
    const addButton = screen.getByRole('button', { name: 'Add' });
    expect(addButton).toBeDisabled();
  });

  it('enables Add button when input has content', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TagInput tags={[]} onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Add a tag...');
    const addButton = screen.getByRole('button', { name: 'Add' });

    await user.type(input, 'test');
    expect(addButton).not.toBeDisabled();
  });
});
