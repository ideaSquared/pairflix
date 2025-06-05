import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { Flex } from './Flex';

// Mock theme for styled-components
const mockTheme = {
	spacing: {
		xs: '0.25rem',
		sm: '0.5rem',
		md: '1rem',
		lg: '2rem',
		xl: '3rem',
	},
};

// Helper function to render with theme
const renderWithTheme = (ui: React.ReactElement) => {
	return render(<ThemeProvider theme={mockTheme}>{ui}</ThemeProvider>);
};

describe('Flex', () => {
	it('renders with default props correctly', () => {
		const { container } = renderWithTheme(
			<Flex data-testid='flex'>Content</Flex>
		);
		const flexElement = container.firstChild;

		expect(flexElement).toBeInTheDocument();
		expect(flexElement).toHaveStyle('display: flex');
		expect(flexElement).toHaveStyle('flex-direction: row');
		expect(flexElement).toHaveStyle(`gap: ${mockTheme.spacing.md}`);
		expect(flexElement).toHaveStyle('align-items: stretch');
		expect(flexElement).toHaveStyle('justify-content: start');
		expect(flexElement).toHaveStyle('flex-wrap: nowrap');
		expect(flexElement).toHaveStyle('width: auto');
		expect(flexElement).toHaveStyle('height: auto');
		expect(flexElement).toHaveTextContent('Content');
	});

	it('applies column direction correctly', () => {
		const { container } = renderWithTheme(
			<Flex direction='column' data-testid='flex'>
				Column Flex
			</Flex>
		);
		const flexElement = container.firstChild;

		expect(flexElement).toHaveStyle('flex-direction: column');
	});

	it('applies reverse direction', () => {
		const { container } = renderWithTheme(
			<Flex reverse data-testid='flex'>
				Reversed Flex
			</Flex>
		);
		const flexElement = container.firstChild;

		expect(flexElement).toHaveStyle('flex-direction: row-reverse');
	});

	it('applies column reverse direction', () => {
		const { container } = renderWithTheme(
			<Flex direction='column' reverse data-testid='flex'>
				Column Reverse Flex
			</Flex>
		);
		const flexElement = container.firstChild;

		expect(flexElement).toHaveStyle('flex-direction: column-reverse');
	});

	it('applies custom gap size', () => {
		const { container } = renderWithTheme(
			<Flex gap='lg' data-testid='flex'>
				Content
			</Flex>
		);
		const flexElement = container.firstChild;

		expect(flexElement).toHaveStyle(`gap: ${mockTheme.spacing.lg}`);
	});

	it('applies custom alignItems', () => {
		const { container } = renderWithTheme(
			<Flex alignItems='center' data-testid='flex'>
				Content
			</Flex>
		);
		const flexElement = container.firstChild;

		expect(flexElement).toHaveStyle('align-items: center');
	});

	it('applies custom justifyContent', () => {
		const { container } = renderWithTheme(
			<Flex justifyContent='space-between' data-testid='flex'>
				Content
			</Flex>
		);
		const flexElement = container.firstChild;

		expect(flexElement).toHaveStyle('justify-content: space-between');
	});

	it('applies wrap style when specified', () => {
		const { container } = renderWithTheme(
			<Flex wrap='wrap' data-testid='flex'>
				Content
			</Flex>
		);
		const flexElement = container.firstChild;

		expect(flexElement).toHaveStyle('flex-wrap: wrap');
	});

	it('applies fullWidth when specified', () => {
		const { container } = renderWithTheme(
			<Flex fullWidth data-testid='flex'>
				Full Width
			</Flex>
		);
		const flexElement = container.firstChild;

		expect(flexElement).toHaveStyle('width: 100%');
	});

	it('applies fullHeight when specified', () => {
		const { container } = renderWithTheme(
			<Flex fullHeight data-testid='flex'>
				Full Height
			</Flex>
		);
		const flexElement = container.firstChild;

		expect(flexElement).toHaveStyle('height: 100%');
	});

	it('applies flex property when specified', () => {
		const { container } = renderWithTheme(
			<Flex flex='1 0 auto' data-testid='flex'>
				Content
			</Flex>
		);
		const flexElement = container.firstChild;

		expect(flexElement).toHaveStyle('flex: 1 0 auto');
	});

	it('applies grow property when specified', () => {
		const { container } = renderWithTheme(
			<Flex grow={1} data-testid='flex'>
				Content
			</Flex>
		);
		const flexElement = container.firstChild;

		expect(flexElement).toHaveStyle('flex-grow: 1');
	});

	it('applies shrink property when specified', () => {
		const { container } = renderWithTheme(
			<Flex shrink={0} data-testid='flex'>
				Content
			</Flex>
		);
		const flexElement = container.firstChild;

		expect(flexElement).toHaveStyle('flex-shrink: 0');
	});

	it('applies basis property when specified', () => {
		const { container } = renderWithTheme(
			<Flex basis='50%' data-testid='flex'>
				Content
			</Flex>
		);
		const flexElement = container.firstChild;

		expect(flexElement).toHaveStyle('flex-basis: 50%');
	});

	it('centers content when center prop is true', () => {
		const { container } = renderWithTheme(
			<Flex center data-testid='flex'>
				Content
			</Flex>
		);
		const flexElement = container.firstChild;

		expect(flexElement).toHaveStyle('align-items: center');
		expect(flexElement).toHaveStyle('justify-content: center');
	});

	it('applies inline-flex display when specified', () => {
		const { container } = renderWithTheme(
			<Flex inline data-testid='flex'>
				Content
			</Flex>
		);
		const flexElement = container.firstChild;

		expect(flexElement).toHaveStyle('display: inline-flex');
	});
});
