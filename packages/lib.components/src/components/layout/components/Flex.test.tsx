import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { lightThemeClass, themeRoot, vars } from '../../../styles/theme.css';
import { Flex } from './Flex';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<div className={`${lightThemeClass} ${themeRoot}`}>{ui}</div>);
};

const directionOf = (el: HTMLElement) =>
  getComputedStyle(el).getPropertyValue('--flex-direction-base');

describe('Flex', () => {
  it('renders with default props correctly', () => {
    renderWithTheme(<Flex data-testid="flex">Content</Flex>);
    const flexElement = screen.getByTestId('flex');

    expect(flexElement).toBeInTheDocument();
    expect(flexElement).toHaveStyle('display: flex');
    expect(directionOf(flexElement)).toBe('row');
    expect(
      getComputedStyle(flexElement).getPropertyValue('--flex-gap-base')
    ).toBe(vars.spacing.md);
    expect(flexElement).toHaveStyle('align-items: stretch');
    expect(flexElement).toHaveStyle('justify-content: start');
    expect(flexElement).toHaveStyle('flex-wrap: nowrap');
    expect(flexElement).toHaveStyle('width: auto');
    expect(flexElement).toHaveStyle('height: auto');
    expect(flexElement).toHaveTextContent('Content');
  });

  it('applies column direction correctly', () => {
    renderWithTheme(
      <Flex direction="column" data-testid="flex">
        Column Flex
      </Flex>
    );
    const flexElement = screen.getByTestId('flex');

    expect(directionOf(flexElement)).toBe('column');
  });

  it('applies reverse direction', () => {
    renderWithTheme(
      <Flex reverse data-testid="flex">
        Reversed Flex
      </Flex>
    );
    const flexElement = screen.getByTestId('flex');

    expect(directionOf(flexElement)).toBe('row-reverse');
  });

  it('applies column reverse direction', () => {
    renderWithTheme(
      <Flex direction="column" reverse data-testid="flex">
        Column Reverse Flex
      </Flex>
    );
    const flexElement = screen.getByTestId('flex');

    expect(directionOf(flexElement)).toBe('column-reverse');
  });

  it('applies custom gap size', () => {
    renderWithTheme(
      <Flex gap="lg" data-testid="flex">
        Content
      </Flex>
    );
    const flexElement = screen.getByTestId('flex');

    expect(
      getComputedStyle(flexElement).getPropertyValue('--flex-gap-base')
    ).toBe(vars.spacing.lg);
  });

  it('applies custom alignItems', () => {
    renderWithTheme(
      <Flex alignItems="center" data-testid="flex">
        Content
      </Flex>
    );
    const flexElement = screen.getByTestId('flex');

    expect(flexElement).toHaveStyle('align-items: center');
  });

  it('applies custom justifyContent', () => {
    renderWithTheme(
      <Flex justifyContent="space-between" data-testid="flex">
        Content
      </Flex>
    );
    const flexElement = screen.getByTestId('flex');

    expect(flexElement).toHaveStyle('justify-content: space-between');
  });

  it('applies wrap style when specified', () => {
    renderWithTheme(
      <Flex wrap="wrap" data-testid="flex">
        Content
      </Flex>
    );
    const flexElement = screen.getByTestId('flex');

    expect(flexElement).toHaveStyle('flex-wrap: wrap');
  });

  it('applies isFullWidth when specified', () => {
    renderWithTheme(
      <Flex isFullWidth data-testid="flex">
        Full Width
      </Flex>
    );
    const flexElement = screen.getByTestId('flex');

    expect(flexElement).toHaveStyle('width: 100%');
  });

  it('applies fullHeight when specified', () => {
    renderWithTheme(
      <Flex fullHeight data-testid="flex">
        Full Height
      </Flex>
    );
    const flexElement = screen.getByTestId('flex');

    expect(flexElement).toHaveStyle('height: 100%');
  });

  it('applies flex property when specified', () => {
    renderWithTheme(
      <Flex flex="1 0 auto" data-testid="flex">
        Content
      </Flex>
    );
    const flexElement = screen.getByTestId('flex');

    expect(flexElement).toHaveStyle('flex: 1 0 auto');
  });

  it('applies grow property when specified', () => {
    renderWithTheme(
      <Flex grow={1} data-testid="flex">
        Content
      </Flex>
    );
    const flexElement = screen.getByTestId('flex');

    expect(flexElement).toHaveStyle('flex-grow: 1');
  });

  it('applies shrink property when specified', () => {
    renderWithTheme(
      <Flex shrink={0} data-testid="flex">
        Content
      </Flex>
    );
    const flexElement = screen.getByTestId('flex');

    expect(flexElement).toHaveStyle('flex-shrink: 0');
  });

  it('applies basis property when specified', () => {
    renderWithTheme(
      <Flex basis="50%" data-testid="flex">
        Content
      </Flex>
    );
    const flexElement = screen.getByTestId('flex');

    expect(flexElement).toHaveStyle('flex-basis: 50%');
  });

  it('centers content when center prop is true', () => {
    renderWithTheme(
      <Flex center data-testid="flex">
        Content
      </Flex>
    );
    const flexElement = screen.getByTestId('flex');

    expect(flexElement).toHaveStyle('align-items: center');
    expect(flexElement).toHaveStyle('justify-content: center');
  });

  it('applies inline-flex display when specified', () => {
    renderWithTheme(
      <Flex inline data-testid="flex">
        Content
      </Flex>
    );
    const flexElement = screen.getByTestId('flex');

    expect(flexElement).toHaveStyle('display: inline-flex');
  });
});
