import React from 'react';
import styled from 'styled-components';
import { Button } from './Button';
import { Flex } from './Layout';
import { Typography } from './Typography';

interface PaginationProps {
	page?: number; // Keep for backward compatibility
	currentPage?: number;
	totalCount?: number;
	limit?: number;
	totalPages?: number;
	onPageChange: (page: number) => void;
	showPageNumbers?: boolean; // Add numbered page buttons
	maxPageButtons?: number; // Maximum number of page buttons to show
	className?: string;
}

const PaginationContainer = styled(Flex)`
	padding: ${({ theme }) => theme?.spacing?.md || '12px'};
	border-top: 1px solid ${({ theme }) => theme?.colors?.border || '#e0e0e0'};
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	gap: ${({ theme }) => theme?.spacing?.md || '12px'};

	@media (max-width: ${({ theme }) => theme?.breakpoints?.sm || '576px'}) {
		padding: ${({ theme }) => theme?.spacing?.sm || '8px'};
		justify-content: center;
	}
`;

const PaginationInfo = styled(Typography)`
	color: ${({ theme }) => theme?.colors?.text?.secondary || '#666666'};
	font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '14px'};

	@media (max-width: ${({ theme }) => theme?.breakpoints?.sm || '576px'}) {
		width: 100%;
		text-align: center;
	}
`;

const PaginationButton = styled(Button)<{
	disabled?: boolean;
	active?: boolean;
}>`
	min-width: 40px;
	padding: ${({ theme }) => theme?.spacing?.sm || '8px'};

	${({ active, theme }) =>
		active &&
		`
		background: ${theme?.colors?.primary || '#0077cc'};
		color: ${theme?.colors?.text?.onPrimary || '#ffffff'};
		
		&:hover {
			background: ${theme?.colors?.primary || '#0077cc'};
			opacity: 0.9;
		}
	`}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (max-width: ${({ theme }) => theme?.breakpoints?.sm || '576px'}) {
		min-width: 36px;
		padding: ${({ theme }) => theme?.spacing?.xs || '4px'};
	}
`;

const generatePageNumbers = (
	currentPage: number,
	totalPages: number,
	maxButtons: number = 5
) => {
	let pages: (number | string)[] = [];

	if (totalPages <= maxButtons) {
		// Show all pages if total pages is less than max buttons
		pages = Array.from({ length: totalPages }, (_, i) => i + 1);
	} else {
		// Always show first page
		pages.push(1);

		if (currentPage > 3) {
			pages.push('...');
		}

		// Show pages around current page
		for (
			let i = Math.max(2, currentPage - 1);
			i <= Math.min(totalPages - 1, currentPage + 1);
			i++
		) {
			pages.push(i);
		}

		if (currentPage < totalPages - 2) {
			pages.push('...');
		}

		// Always show last page
		pages.push(totalPages);
	}

	return pages;
};

/**
 * Pagination component for navigating through paginated data
 */
export const Pagination: React.FC<PaginationProps> = ({
	page,
	currentPage,
	totalCount,
	totalPages,
	limit,
	onPageChange,
	showPageNumbers = false,
	maxPageButtons = 5,
	className,
}) => {
	// Use currentPage if provided, otherwise fall back to page
	const activePage = currentPage ?? page ?? 1;

	// Calculate totalPages if not directly provided
	const actualTotalPages =
		totalPages ?? (totalCount && limit ? Math.ceil(totalCount / limit) : 1);

	// Only calculate from/to if we have totalCount and limit
	let from, to;
	if (totalCount !== undefined && limit !== undefined) {
		from = (activePage - 1) * limit + 1;
		to = Math.min(activePage * limit, totalCount);
	}

	const hasNextPage = activePage < actualTotalPages;
	const hasPreviousPage = activePage > 1;

	// Generate array of page numbers to display
	const pageNumbers = showPageNumbers
		? generatePageNumbers(activePage, actualTotalPages, maxPageButtons)
		: [];

	return (
		<PaginationContainer className={className}>
			{totalCount !== undefined && limit !== undefined && (
				<PaginationInfo>
					Showing {from} to {to} of {totalCount} results
				</PaginationInfo>
			)}
			{!totalCount && (
				<PaginationInfo>
					Page {activePage} of {actualTotalPages}
				</PaginationInfo>
			)}
			<Flex gap='sm' wrap='wrap' justifyContent='center'>
				<PaginationButton
					variant='secondary'
					onClick={() => onPageChange(activePage - 1)}
					disabled={!hasPreviousPage}
					size='small'
					aria-label='Previous page'
				>
					Previous
				</PaginationButton>

				{showPageNumbers && (
					<Flex gap='sm' wrap='wrap' justifyContent='center'>
						{pageNumbers.map((pageNum, index) => {
							if (pageNum === '...') {
								return (
									<PaginationButton
										key={`ellipsis-${index}`}
										variant='secondary'
										size='small'
										disabled
									>
										...
									</PaginationButton>
								);
							}

							return (
								<PaginationButton
									key={pageNum}
									variant='secondary'
									onClick={() => onPageChange(Number(pageNum))}
									active={activePage === pageNum}
									size='small'
									aria-label={`Go to page ${pageNum}`}
									aria-current={activePage === pageNum ? 'page' : undefined}
								>
									{pageNum}
								</PaginationButton>
							);
						})}
					</Flex>
				)}

				<PaginationButton
					variant='secondary'
					onClick={() => onPageChange(activePage + 1)}
					disabled={!hasNextPage}
					size='small'
					aria-label='Next page'
				>
					Next
				</PaginationButton>
			</Flex>
		</PaginationContainer>
	);
};

/**
 * Simple Pagination component that only shows Previous/Next buttons
 */
export const SimplePagination: React.FC<
	Omit<PaginationProps, 'showPageNumbers' | 'maxPageButtons'>
> = (props) => {
	return <Pagination {...props} showPageNumbers={false} />;
};

/**
 * Compact Pagination component for limited space
 */
export const CompactPagination: React.FC<PaginationProps> = (props) => {
	return (
		<Pagination
			{...props}
			showPageNumbers
			maxPageButtons={3}
			className={`${props.className || ''} compact`}
		/>
	);
};
