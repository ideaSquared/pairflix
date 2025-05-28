import React from 'react';
import styled from 'styled-components';
import { Flex, Grid } from '../layout/Layout';
import { Button } from './Button';
import { Card, CardContent } from './Card';
import { H2 } from './Typography';

interface FilterGroupProps {
	title?: string;
	children: React.ReactNode;
	onApply: () => void;
	onClear: () => void;
	actionComponent?: React.ReactNode;
}

const FiltersCard = styled(Card)`
	margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const FiltersGrid = styled(Grid)`
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: ${({ theme }) => theme.spacing.md};
`;

const FilterLabel = styled.label`
	display: block;
	font-size: ${({ theme }) => theme.typography.fontSize.sm};
	font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
	margin-bottom: ${({ theme }) => theme.spacing.xs};
	color: ${({ theme }) => theme.colors.text.secondary};
`;

const FilterActions = styled(Flex)`
	margin-top: ${({ theme }) => theme.spacing.md};
	justify-content: space-between;
`;

export const FilterGroup: React.FC<FilterGroupProps> = ({
	title = 'Filters',
	children,
	onApply,
	onClear,
	actionComponent,
}) => {
	return (
		<FiltersCard>
			<CardContent>
				<H2 gutterBottom>{title}</H2>
				<FiltersGrid>{children}</FiltersGrid>

				<FilterActions>
					<div>
						<Button
							variant='primary'
							onClick={onApply}
							style={{ marginRight: '0.5rem' }}
						>
							Apply Filters
						</Button>
						<Button variant='secondary' onClick={onClear}>
							Clear Filters
						</Button>
					</div>

					{actionComponent}
				</FilterActions>
			</CardContent>
		</FiltersCard>
	);
};

export const FilterItem: React.FC<{
	label: string;
	children: React.ReactNode;
}> = ({ label, children }) => {
	return (
		<div>
			<FilterLabel>{label}</FilterLabel>
			{children}
		</div>
	);
};
