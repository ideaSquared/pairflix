import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { LoadingSpinner } from './Loading';
import { Typography } from './Typography';

// Types
export interface TableColumn<T = Record<string, unknown>> {
	key: keyof T & string;
	header: string;
	width?: string;
	sortable?: boolean;
	render?: (value: T[keyof T], row: T) => React.ReactNode;
	align?: 'left' | 'center' | 'right';
}

export interface TableProps<T = Record<string, unknown>> {
	columns: TableColumn<T>[];
	data: T[];
	isLoading?: boolean;
	loadingMessage?: string;
	emptyMessage?: string;
	stickyHeader?: boolean;
	onSort?: (key: string, direction: 'asc' | 'desc') => void;
	sortColumn?: string;
	sortDirection?: 'asc' | 'desc';
	selectable?: boolean;
	selectedRows?: string[];
	onRowSelect?: (rowId: string) => void;
	onRowClick?: (row: T) => void;
	rowActions?: (row: T) => React.ReactNode;
	getRowId?: (row: T) => string;
	minWidth?: string;
	maxHeight?: string;
	'aria-label'?: string;
}

interface StyledTableContainerProps
	extends React.HTMLAttributes<HTMLDivElement> {
	$maxHeight?: string;
}

interface StyledTableProps extends React.TableHTMLAttributes<HTMLTableElement> {
	$minWidth?: string;
}

interface TableHeadProps extends React.HTMLAttributes<HTMLTableSectionElement> {
	$sticky?: boolean;
}

interface CellProps {
	$align?: 'left' | 'center' | 'right';
}

interface HeaderCellProps
	extends React.ThHTMLAttributes<HTMLTableCellElement>,
		CellProps {
	$sortable?: boolean;
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
	$selectable?: boolean;
	$selected?: boolean;
	$clickable?: boolean;
}

interface TableCellProps
	extends React.TdHTMLAttributes<HTMLTableCellElement>,
		CellProps {}

interface SortIconProps extends React.HTMLAttributes<HTMLSpanElement> {
	$direction?: 'asc' | 'desc';
}

// Styled Components
const TableContainer = styled.div<StyledTableContainerProps>`
	width: 100%;
	overflow-x: auto;
	border-radius: ${({ theme }) => theme.borderRadius.md};
	border: 1px solid ${({ theme }) => theme.colors.border.light};
	background-color: ${({ theme }) => theme.colors.background.paper};
	max-height: ${({ $maxHeight }) => $maxHeight};
	position: relative;
`;

const StyledTable = styled.table<StyledTableProps>`
	width: 100%;
	min-width: ${({ $minWidth }) => $minWidth || '650px'};
	border-collapse: separate;
	border-spacing: 0;
`;

const TableHead = styled.thead<TableHeadProps>`
	${({ $sticky, theme }) =>
		$sticky &&
		css`
			position: sticky;
			top: 0;
			z-index: 1;
			background-color: ${theme.colors.background.paper};
		`}
`;

const cellStyles = css<CellProps>`
	padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
	text-align: ${({ $align }) => $align || 'left'};
	border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const TableHeaderCell = styled.th<HeaderCellProps>`
	${cellStyles}
	background-color: ${({ theme }) => theme.colors.background.paper};
	font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
	color: ${({ theme }) => theme.colors.text.primary};
	transition: background-color 0.2s;

	${({ $sortable, theme }) =>
		$sortable &&
		css`
			cursor: pointer;
			user-select: none;

			&:hover {
				background-color: ${theme.colors.background.hover};
			}
		`}
`;

const TableCell = styled.td<CellProps>`
	${cellStyles}
	color: ${({ theme }) => theme.colors.text.primary};
`;

const TableRow = styled.tr<TableRowProps>`
	transition: background-color 0.2s;

	${({ $selectable }) =>
		$selectable &&
		css`
			cursor: pointer;
		`}

	${({ $selected, theme }) =>
		$selected &&
		css`
			background-color: ${theme.colors.background.selected};
		`}

  ${({ $clickable, theme }) =>
		$clickable &&
		css`
			cursor: pointer;
			&:hover {
				background-color: ${theme.colors.background.hover};
			}
		`}
`;

const LoadingOverlay = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(255, 255, 255, 0.8);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 2;
`;

const EmptyState = styled.div`
	padding: ${({ theme }) => theme.spacing.xl};
	text-align: center;
	color: ${({ theme }) => theme.colors.text.secondary};
`;

const SortIcon = styled.span<SortIconProps>`
	display: inline-block;
	margin-left: ${({ theme }) => theme.spacing.xs};
	opacity: ${({ $direction }) => ($direction ? 1 : 0.3)};
	transition: opacity 0.2s;

	&:after {
		content: '${({ $direction }) => ($direction === 'asc' ? '↑' : '↓')}';
	}
`;

export const DataTable = <
	T extends Record<string, unknown> = Record<string, unknown>
>({
	columns,
	data,
	isLoading,
	loadingMessage = 'Loading...',
	emptyMessage = 'No data available',
	stickyHeader,
	onSort,
	sortColumn,
	sortDirection,
	selectable,
	selectedRows = [],
	onRowSelect,
	onRowClick,
	rowActions,
	getRowId = (row: T) => row.id as string,
	minWidth,
	maxHeight,
	'aria-label': ariaLabel,
}: TableProps<T>) => {
	const [hoveredRow, setHoveredRow] = useState<string | null>(null);

	const handleHeaderClick = (column: TableColumn<T>) => {
		if (!column.sortable || !onSort) return;

		const newDirection =
			sortColumn === column.key && sortDirection === 'asc' ? 'desc' : 'asc';
		onSort(column.key, newDirection);
	};

	const handleRowClick = (row: T) => {
		if (selectable && onRowSelect) {
			onRowSelect(getRowId(row));
		} else if (onRowClick) {
			onRowClick(row);
		}
	};

	return (
		<TableContainer $maxHeight={maxHeight}>
			<StyledTable $minWidth={minWidth} aria-label={ariaLabel || 'Data table'}>
				<TableHead $sticky={stickyHeader}>
					<tr>
						{columns.map((column) => (
							<TableHeaderCell
								key={column.key}
								$align={column.align}
								$sortable={column.sortable}
								onClick={() => handleHeaderClick(column)}
								aria-sort={
									sortColumn === column.key
										? sortDirection === 'asc'
											? 'ascending'
											: 'descending'
										: undefined
								}
							>
								{column.header}
								{column.sortable && (
									<SortIcon
										$direction={
											sortColumn === column.key ? sortDirection : undefined
										}
										aria-hidden='true'
									/>
								)}
							</TableHeaderCell>
						))}
						{rowActions && <TableHeaderCell>Actions</TableHeaderCell>}
					</tr>
				</TableHead>
				<tbody>
					{data.length === 0 && !isLoading ? (
						<tr>
							<TableCell colSpan={columns.length + (rowActions ? 1 : 0)}>
								<EmptyState>
									<Typography variant='body1'>{emptyMessage}</Typography>
								</EmptyState>
							</TableCell>
						</tr>
					) : (
						data.map((row) => {
							const rowId = getRowId(row);
							return (
								<TableRow
									key={rowId}
									$selectable={selectable}
									$selected={selectedRows.includes(rowId)}
									$clickable={!!onRowClick || (selectable && !!onRowSelect)}
									onClick={() => handleRowClick(row)}
									onMouseEnter={() => setHoveredRow(rowId)}
									onMouseLeave={() => setHoveredRow(null)}
									role={selectable ? 'checkbox' : undefined}
									aria-checked={
										selectable ? selectedRows.includes(rowId) : undefined
									}
								>
									{columns.map((column) => {
										const value = row[column.key] as T[keyof T];
										return (
											<TableCell key={column.key} $align={column.align}>
												{column.render
													? column.render(value, row)
													: (value as React.ReactNode)}
											</TableCell>
										);
									})}
									{rowActions && (
										<TableCell $align='right'>{rowActions(row)}</TableCell>
									)}
								</TableRow>
							);
						})
					)}
				</tbody>
			</StyledTable>
			{isLoading && (
				<LoadingOverlay>
					<LoadingSpinner>{loadingMessage}</LoadingSpinner>
				</LoadingOverlay>
			)}
		</TableContainer>
	);
};

// Convenience exports
export {
	StyledTable as Table,
	TableCell,
	TableContainer,
	TableHead,
	TableHeaderCell,
	TableRow,
};
