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
		border-top: 1px solid ${({ theme }) => theme.colors.border};

		&:hover {
			background: ${({ theme }) => theme.colors.background.hover};
		}
	}
`;

// Table cell
export const TableCell = styled.td`
	padding: ${({ theme }) => theme.spacing.md};
	font-size: ${({ theme }) => theme.typography.fontSize.sm};
	vertical-align: middle;
`;

// Action button for tables
export const TableActionButton = styled.button`
	background: none;
	border: none;
	color: ${({ theme }) => theme.colors.primary};
	cursor: pointer;
	font-size: ${({ theme }) => theme.typography.fontSize.sm};

	&:hover {
		color: ${({ theme }) => theme.colors.primaryHover};
		text-decoration: underline;
	}
`;
