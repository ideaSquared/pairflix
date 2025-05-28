import React from 'react';
import styled from 'styled-components';
import { Flex } from '../layout/Layout';
import { Button } from './Button';
import { Typography } from './Typography';

interface PaginationProps {
	page?: number; // Keep for backward compatibility
	currentPage?: number;
	totalCount?: number;
	limit?: number;
	totalPages?: number;
	onPageChange: (page: number) => void;
}

const PaginationContainer = styled(Flex)`
	padding: ${({ theme }) => theme.spacing.md};
	border-top: 1px solid ${({ theme }) => theme.colors.border};
	justify-content: space-between;
	align-items: center;
`;

const PaginationInfo = styled(Typography)`
	color: ${({ theme }) => theme.colors.text.secondary};
	font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const PaginationButton = styled(Button)<{ disabled?: boolean }>`
	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`;

export const Pagination: React.FC<PaginationProps> = ({
	page,
	currentPage,
	totalCount,
	totalPages,
	limit,
	onPageChange,
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

	return (
		<PaginationContainer>
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
			<Flex gap='sm'>
				<PaginationButton
					variant='secondary'
					onClick={() => onPageChange(activePage - 1)}
					disabled={!hasPreviousPage}
					size='small'
				>
					Previous
				</PaginationButton>
				<PaginationButton
					variant='secondary'
					onClick={() => onPageChange(activePage + 1)}
					disabled={!hasNextPage}
					size='small'
				>
					Next
				</PaginationButton>
			</Flex>
		</PaginationContainer>
	);
};
