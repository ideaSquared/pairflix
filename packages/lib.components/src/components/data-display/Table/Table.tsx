import clsx from 'clsx';
import React, { forwardRef } from 'react';
import { LoadingSpinner } from '../../feedback/Loading';
import { Typography } from '../../utility/Typography';
import {
  emptyState,
  loadingOverlay,
  sortIcon,
  table as tableStyle,
  tableActionButton,
  tableBody as tableBodyStyle,
  tableCell as tableCellStyle,
  tableContainer as tableContainerStyle,
  tableHead as tableHeadStyle,
  tableHeaderCell as tableHeaderCellStyle,
  tableRow as tableRowStyle,
} from './Table.css';

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

type CellAlign = 'left' | 'center' | 'right';

// ---- Composable table primitives ----
// Exported so consumers can build custom tables on the same styling as
// DataTable, not just as internal implementation details.

interface TableContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxHeight?: string;
}

const TableContainer = forwardRef<HTMLDivElement, TableContainerProps>(
  ({ maxHeight, className, style, ...rest }, ref) => (
    <div
      ref={ref}
      className={clsx(tableContainerStyle, className)}
      style={{ maxHeight: maxHeight ?? 'none', ...style }}
      {...rest}
    />
  )
);
TableContainer.displayName = 'TableContainer';

interface TableElementProps extends React.TableHTMLAttributes<HTMLTableElement> {
  minWidth?: string;
}

const Table = forwardRef<HTMLTableElement, TableElementProps>(
  ({ minWidth, className, style, ...rest }, ref) => (
    <table
      ref={ref}
      className={clsx(tableStyle, className)}
      style={{ minWidth: minWidth ?? '650px', ...style }}
      {...rest}
    />
  )
);
Table.displayName = 'Table';

interface TableHeadProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  sticky?: boolean;
}

const TableHead = forwardRef<HTMLTableSectionElement, TableHeadProps>(
  ({ sticky, className, ...rest }, ref) => (
    <thead
      ref={ref}
      className={clsx(tableHeadStyle({ sticky: sticky ?? false }), className)}
      {...rest}
    />
  )
);
TableHead.displayName = 'TableHead';

const TableBody = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...rest }, ref) => (
  <tbody ref={ref} className={clsx(tableBodyStyle, className)} {...rest} />
));
TableBody.displayName = 'TableBody';

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  selectable?: boolean;
  selected?: boolean;
  clickable?: boolean;
}

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ selectable, selected, clickable, className, ...rest }, ref) => (
    <tr
      ref={ref}
      className={clsx(
        tableRowStyle({
          selectable: selectable ?? false,
          selected: selected ?? false,
          clickable: clickable ?? false,
        }),
        className
      )}
      {...rest}
    />
  )
);
TableRow.displayName = 'TableRow';

interface TableHeaderCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  align?: CellAlign;
  sortable?: boolean;
}

const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  ({ align, sortable, className, ...rest }, ref) => (
    <th
      ref={ref}
      className={clsx(
        tableHeaderCellStyle({
          align: align ?? 'left',
          sortable: sortable ?? false,
        }),
        className
      )}
      {...rest}
    />
  )
);
TableHeaderCell.displayName = 'TableHeaderCell';

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: CellAlign;
}

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ align, className, ...rest }, ref) => (
    <td
      ref={ref}
      className={clsx(tableCellStyle({ align: align ?? 'left' }), className)}
      {...rest}
    />
  )
);
TableCell.displayName = 'TableCell';

interface TableActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'warning' | 'danger' | 'default';
  title?: string;
}

const TableActionButton = forwardRef<HTMLButtonElement, TableActionButtonProps>(
  ({ variant, className, ...rest }, ref) => (
    <button
      ref={ref}
      className={clsx(tableActionButton({ variant }), className)}
      {...rest}
    />
  )
);
TableActionButton.displayName = 'TableActionButton';

// Main DataTable component
const DataTable = <
  T extends Record<string, unknown> = Record<string, unknown>,
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
    <TableContainer maxHeight={maxHeight}>
      <Table minWidth={minWidth} aria-label={ariaLabel || 'Data table'}>
        <TableHead sticky={stickyHeader ?? false}>
          <tr>
            {columns.map(column => (
              <TableHeaderCell
                key={column.key}
                align={column.align ?? 'left'}
                sortable={column.sortable ?? false}
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
                  <span
                    className={sortIcon({
                      direction:
                        sortColumn === column.key
                          ? (sortDirection ?? 'asc')
                          : 'none',
                    })}
                    aria-hidden="true"
                  />
                )}
              </TableHeaderCell>
            ))}
            {rowActions && <TableHeaderCell>Actions</TableHeaderCell>}
          </tr>
        </TableHead>
        <TableBody>
          {data.length === 0 && !isLoading ? (
            <tr>
              <TableCell colSpan={columns.length + (rowActions ? 1 : 0)}>
                <div className={emptyState}>
                  <Typography variant="body1">{emptyMessage}</Typography>
                </div>
              </TableCell>
            </tr>
          ) : (
            data.map(row => {
              const rowId = getRowId(row);
              return (
                <TableRow
                  key={rowId}
                  selectable={selectable ?? false}
                  selected={selectedRows.includes(rowId)}
                  clickable={!!onRowClick || (selectable && !!onRowSelect)}
                  onClick={() => handleRowClick(row)}
                  role={selectable ? 'checkbox' : undefined}
                  aria-checked={
                    selectable ? selectedRows.includes(rowId) : undefined
                  }
                >
                  {columns.map(column => {
                    const value = row[column.key] as T[keyof T];
                    return (
                      <TableCell
                        key={column.key}
                        align={column.align ?? 'left'}
                      >
                        {column.render
                          ? column.render(value, row)
                          : (value as React.ReactNode)}
                      </TableCell>
                    );
                  })}
                  {rowActions && (
                    <TableCell align="right">{rowActions(row)}</TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      {isLoading && (
        <div className={loadingOverlay}>
          <LoadingSpinner>{loadingMessage}</LoadingSpinner>
        </div>
      )}
    </TableContainer>
  );
};

// Export all components and types
export {
  DataTable,
  Table,
  TableActionButton,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeaderCell,
  TableRow,
};

export type { TableActionButtonProps, TableColumn, TableProps };
