import styled from 'styled-components';

// Table container with overflow handling
export const TableContainer = styled.div`
	overflow-x: auto;
`;

// Main table component
export const Table = styled.table`
	width: 100%;
	border-collapse: collapse;
`;

// Table header
export const TableHead = styled.thead`
	background: ${({ theme }) => theme.colors.background.secondary};
`;

// Table row
export const TableRow = styled.tr`
	border-top: 1px solid ${({ theme }) => theme.colors.border.light};

	&:hover {
		background: ${({ theme }) => theme.colors.background.hover};
	}
`;

// Table header cell
export const TableHeaderCell = styled.th`
	padding: ${({ theme }) => theme.spacing.md};
	text-align: left;
	font-size: ${({ theme }) => theme.typography.fontSize.xs};
	font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
	color: ${({ theme }) => theme.colors.text.secondary};
	text-transform: uppercase;
`;

// Table body
export const TableBody = styled.tbody`
	& tr {
		border-top: 1px solid ${({ theme }) => theme.colors.border.light};

		&:hover {
			background: ${({ theme }) => theme.colors.background.hover};
		}
	}
`;

// Table cell
export const TableCell = styled.td<{
	align?: 'left' | 'center' | 'right';
	colSpan?: number;
}>`
	padding: ${({ theme }) => theme.spacing.md};
	font-size: ${({ theme }) => theme.typography.fontSize.sm};
	vertical-align: middle;
	text-align: ${({ align }) => align || 'left'};
`;

// Action button for tables
interface TableActionButtonProps {
	variant?: 'primary' | 'secondary' | 'danger' | 'warning';
}

export const TableActionButton = styled.button<TableActionButtonProps>`
	background: none;
	border: none;
	cursor: pointer;
	font-size: ${({ theme }) => theme.typography.fontSize.sm};
	color: ${({ theme, variant }) => {
		switch (variant) {
			case 'danger':
				return theme.colors.text.error;
			case 'warning':
				return theme.colors.text.warning;
			case 'secondary':
				return theme.colors.text.secondary;
			default:
				return theme.colors.primary;
		}
	}};

	&:hover {
		opacity: 0.8;
	}
`;
