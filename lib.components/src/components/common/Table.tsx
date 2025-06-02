import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { LoadingSpinner } from './Loading';
import { Typography } from './Typography';

// Types
interface TableColumn<T = Record<string, unknown>> {
	key: keyof T & string;
	header: string;
	width?: string;
	sortable?: boolean;
	render?: (value: T[keyof T], row: T) => React.ReactNode;
	align?: 'left' | 'center' | 'right';
}

interface TableProps<T = Record<string, unknown>> {
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

// Styled component props
interface StyledTableContainerProps {
	$maxHeight?: string | undefined;
}

interface StyledTableProps {
	$minWidth?: string | undefined;
}

interface TableHeadProps {
	$sticky?: boolean | undefined;
}

interface CellProps {
	$align?: 'left' | 'center' | 'right' | undefined;
}

interface HeaderCellProps extends CellProps {
	$sortable?: boolean | undefined;
}

interface TableRowProps {
	$selectable?: boolean | undefined;
	$selected?: boolean | undefined;
	$clickable?: boolean | undefined;
}

interface SortIconProps {
	$direction?: 'asc' | 'desc' | undefined;
}

// Styled components
const StyledTableContainer = styled.div<StyledTableContainerProps>`
	width: 100%;
	overflow-x: auto;
	border-radius: ${({ theme }) => theme.borderRadius.md};
	border: 1px solid ${({ theme }) => theme.colors.border.light};
	background-color: ${({ theme }) => theme.colors.background.paper};
	max-height: ${({ $maxHeight }) => $maxHeight ?? 'none'};
	position: relative;
`;

const StyledTable = styled.table<StyledTableProps>`
	width: 100%;
	min-width: ${({ $minWidth }) => $minWidth ?? '650px'};
	border-collapse: separate;
	border-spacing: 0;
`;

const StyledTableHead = styled.thead<TableHeadProps>`
	${({ $sticky, theme }) =>
		$sticky ?? false
			? css`
					position: sticky;
					top: 0;
					z-index: 1;
					background-color: ${theme.colors.background.paper};
			  `
			: ''}
`;

const cellStyles = css<CellProps>`
	padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
	text-align: ${({ $align }) => $align ?? 'left'};
	border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const TableHeaderCell = styled.th<HeaderCellProps>`
	${cellStyles}
	background-color: ${({ theme }) => theme.colors.background.paper};
	font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
	color: ${({ theme }) => theme.colors.text.primary};
	transition: background-color 0.2s;

	${({ $sortable, theme }) =>
		$sortable ?? false
			? css`
					cursor: pointer;
					user-select: none;

					&:hover {
						background-color: ${theme.colors.background.hover};
					}
			  `
			: ''}
`;

const TableCell = styled.td<CellProps>`
	${cellStyles}
	color: ${({ theme }) => theme.colors.text.primary};
`;

const TableRow = styled.tr<TableRowProps>`
	transition: background-color 0.2s;

	${({ $selectable }) =>
		$selectable ?? false
			? css`
					cursor: pointer;
			  `
			: ''}

	${({ $selected, theme }) =>
		$selected ?? false
			? css`
					background-color: ${theme.colors.background.selected};
			  `
			: ''}

  ${({ $clickable, theme }) =>
		$clickable ?? false
			? css`
					cursor: pointer;
					&:hover {
						background-color: ${theme.colors.background.hover};
					}
			  `
			: ''}
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

const TableBody = styled.tbody`
	background-color: ${({ theme }) => theme.colors.background.paper};
`;

// Main DataTable component
const DataTable = <
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
		<StyledTableContainer $maxHeight={maxHeight ?? undefined}>
			<StyledTable
				$minWidth={minWidth ?? undefined}
				aria-label={ariaLabel || 'Data table'}
			>
				<StyledTableHead $sticky={stickyHeader ?? false}>
					<tr>
						{columns.map((column) => (
							<TableHeaderCell
								key={column.key}
								$align={column.align ?? 'left'}
								$sortable={column.sortable ?? false}
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
											sortColumn === column.key
												? sortDirection ?? 'asc'
												: undefined
										}
										aria-hidden='true'
									/>
								)}
							</TableHeaderCell>
						))}
						{rowActions && <TableHeaderCell>Actions</TableHeaderCell>}
					</tr>
				</StyledTableHead>
				<TableBody>
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
									$selectable={selectable ?? false}
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
											<TableCell
												key={column.key}
												$align={column.align ?? 'left'}
											>
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
				</TableBody>
			</StyledTable>
			{isLoading && (
				<LoadingOverlay>
					<LoadingSpinner>{loadingMessage}</LoadingSpinner>
				</LoadingOverlay>
			)}
		</StyledTableContainer>
	);
};

// TableActionButton component
interface TableActionButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'warning' | 'danger' | 'default';
	title?: string;
}

const TableActionButton = styled.button<TableActionButtonProps>`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 6px;
	margin: 0 2px;
	border-radius: 4px;
	background-color: ${({ variant, theme }) => {
		switch (variant) {
			case 'primary':
				return theme.colors.primary.main;
			case 'secondary':
				return theme.colors.secondary.main;
			case 'warning':
				return theme.colors.warning.main;
			case 'danger':
				return theme.colors.error.main;
			default:
				return theme.colors.background.light;
		}
	}};
	color: ${({ variant, theme }) => {
		switch (variant) {
			case 'primary':
			case 'secondary':
			case 'warning':
			case 'danger':
				return theme.colors.text.inverse;
			default:
				return theme.colors.text.primary;
		}
	}};
	border: none;
	cursor: pointer;
	transition: all 0.2s;

	&:hover,
	&:focus {
		opacity: 0.9;
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`;

// Export all components and types
export {
	DataTable,
	StyledTable as Table,
	TableActionButton,
	TableBody,
	TableCell,
	StyledTableContainer as TableContainer,
	StyledTableHead as TableHead,
	TableHeaderCell,
	TableRow,
};

export type { TableActionButtonProps, TableColumn, TableProps };
