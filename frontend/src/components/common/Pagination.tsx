import React from 'react';
import styled from 'styled-components';
import { Button } from './Button';
import { Flex } from './Layout';
import { Typography } from './Typography';

interface PaginationProps {
	page: number;
	totalCount: number;
	limit: number;
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
	totalCount,
	limit,
	onPageChange,
}) => {
	const from = (page - 1) * limit + 1;
	const to = Math.min(page * limit, totalCount);
	const hasNextPage = page * limit < totalCount;
	const hasPreviousPage = page > 1;

	return (
		<PaginationContainer>
			<PaginationInfo>
				Showing {from} to {to} of {totalCount} results
			</PaginationInfo>
			<Flex gap='sm'>
				<PaginationButton
					variant='secondary'
					onClick={() => onPageChange(page - 1)}
					disabled={!hasPreviousPage}
					size='small'
				>
					Previous
				</PaginationButton>
				<PaginationButton
					variant='secondary'
					onClick={() => onPageChange(page + 1)}
					disabled={!hasNextPage}
					size='small'
				>
					Next
				</PaginationButton>
			</Flex>
		</PaginationContainer>
	);
};
