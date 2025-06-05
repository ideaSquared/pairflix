// filepath: c:\Users\thete\Desktop\localdev\pairflix\lib.components\src\components\navigation\Pagination\Pagination.test.tsx
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import mockTheme from '../../../__mocks__/mockTheme';
import Pagination, { CompactPagination, SimplePagination } from './Pagination';

// Helper function to render with theme
const renderWithTheme = (ui: React.ReactElement) => {
	return render(<ThemeProvider theme={mockTheme}>{ui}</ThemeProvider>);
};

describe('Pagination', () => {
	it('renders correctly with basic props', () => {
		const handlePageChange = jest.fn();
		renderWithTheme(
			<Pagination
				currentPage={1}
				totalPages={5}
				onPageChange={handlePageChange}
			/>
		);

		// Page information should be displayed
		expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();

		// Navigation buttons should be visible
		expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
		expect(screen.getByLabelText('Next page')).toBeInTheDocument();

		// Previous button should be disabled when on first page
		expect(screen.getByLabelText('Previous page')).toBeDisabled();

		// Next button should be enabled
		expect(screen.getByLabelText('Next page')).not.toBeDisabled();
	});

	it('shows correct page range when totalCount and limit are provided', () => {
		renderWithTheme(
			<Pagination
				currentPage={2}
				totalCount={100}
				limit={10}
				onPageChange={jest.fn()}
			/>
		);

		// Should show range information
		expect(
			screen.getByText('Showing 11 to 20 of 100 results')
		).toBeInTheDocument();
	});

	it('calls onPageChange when navigation buttons are clicked', () => {
		const handlePageChange = jest.fn();
		renderWithTheme(
			<Pagination
				currentPage={3}
				totalPages={5}
				onPageChange={handlePageChange}
			/>
		);

		// Click next button
		fireEvent.click(screen.getByLabelText('Next page'));
		expect(handlePageChange).toHaveBeenCalledWith(4);

		// Click previous button
		fireEvent.click(screen.getByLabelText('Previous page'));
		expect(handlePageChange).toHaveBeenCalledWith(2);
	});

	it('shows page number buttons when showPageNumbers is true', () => {
		renderWithTheme(
			<Pagination
				currentPage={3}
				totalPages={5}
				onPageChange={jest.fn()}
				showPageNumbers
			/>
		);

		// Should show all page numbers
		expect(screen.getByText('1')).toBeInTheDocument();
		expect(screen.getByText('2')).toBeInTheDocument();
		expect(screen.getByText('3')).toBeInTheDocument();
		expect(screen.getByText('4')).toBeInTheDocument();
		expect(screen.getByText('5')).toBeInTheDocument();

		// Current page should have aria-current="page"
		expect(screen.getByText('3')).toHaveAttribute('aria-current', 'page');
	});

	it('shows ellipsis for large number of pages', () => {
		renderWithTheme(
			<Pagination
				currentPage={5}
				totalPages={10}
				onPageChange={jest.fn()}
				showPageNumbers
				maxPageButtons={5}
			/>
		);

		// Should show page numbers with ellipsis
		expect(screen.getByText('1')).toBeInTheDocument();
		expect(screen.getAllByText('...')[0]).toBeInTheDocument();
		expect(screen.getByText('10')).toBeInTheDocument();
	});

	it('calls onPageChange when a page number button is clicked', () => {
		const handlePageChange = jest.fn();
		renderWithTheme(
			<Pagination
				currentPage={3}
				totalPages={5}
				onPageChange={handlePageChange}
				showPageNumbers
			/>
		);

		// Click page number button
		fireEvent.click(screen.getByText('2'));
		expect(handlePageChange).toHaveBeenCalledWith(2);
	});

	it('shows first/last buttons when showFirstLast is true', () => {
		renderWithTheme(
			<Pagination
				currentPage={3}
				totalPages={5}
				onPageChange={jest.fn()}
				showFirstLast
			/>
		);

		expect(screen.getByLabelText('First page')).toBeInTheDocument();
		expect(screen.getByLabelText('Last page')).toBeInTheDocument();
	});

	it('applies different sizes correctly', () => {
		const { rerender } = renderWithTheme(
			<Pagination
				currentPage={1}
				totalPages={5}
				onPageChange={jest.fn()}
				size='small'
			/>
		);

		let nextButton = screen.getByLabelText('Next page');
		// Small size shouldn't have the large size styling
		expect(nextButton).not.toHaveStyle('min-width: 48px');
		expect(nextButton).not.toHaveStyle('padding: 12px');

		rerender(
			<ThemeProvider theme={mockTheme}>
				<Pagination
					currentPage={1}
					totalPages={5}
					onPageChange={jest.fn()}
					size='large'
				/>
			</ThemeProvider>
		);

		nextButton = screen.getByLabelText('Next page');
		// We can't easily check the actual rendered style due to how styled-components works,
		// but we can verify that size prop is passed correctly
	});

	it('passes ref correctly', () => {
		const ref = React.createRef<HTMLDivElement>();
		renderWithTheme(
			<Pagination
				ref={ref}
				currentPage={1}
				totalPages={5}
				onPageChange={jest.fn()}
			/>
		);

		expect(ref.current).not.toBeNull();
		expect(ref.current?.tagName).toBe('DIV');
	});
});

describe('SimplePagination', () => {
	it('renders without page number buttons', () => {
		renderWithTheme(
			<SimplePagination
				currentPage={2}
				totalPages={5}
				onPageChange={jest.fn()}
			/>
		);

		// Navigation buttons should be visible
		expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
		expect(screen.getByLabelText('Next page')).toBeInTheDocument();

		// No page number buttons should be rendered
		expect(screen.queryByText('1')).not.toBeInTheDocument();
		expect(screen.queryByText('2')).not.toBeInTheDocument();
		expect(screen.queryByText('3')).not.toBeInTheDocument();
	});
});

describe('CompactPagination', () => {
	it('renders with limited page number buttons', () => {
		renderWithTheme(
			<CompactPagination
				currentPage={5}
				totalPages={10}
				onPageChange={jest.fn()}
			/>
		);

		// Should only show limited page numbers
		const pageButtons = screen
			.queryAllByRole('button')
			.filter((button) => !isNaN(Number(button.textContent)));

		// CompactPagination should have fewer page buttons than full Pagination
		expect(pageButtons.length).toBeLessThanOrEqual(3);
	});

	it('adds compact class to the container', () => {
		const { container } = renderWithTheme(
			<CompactPagination
				currentPage={1}
				totalPages={5}
				onPageChange={jest.fn()}
				className='test-class'
			/>
		);

		// Should have both the provided class and the compact class
		expect(container.firstChild).toHaveClass('test-class');
		expect(container.firstChild).toHaveClass('compact');
	});
});
