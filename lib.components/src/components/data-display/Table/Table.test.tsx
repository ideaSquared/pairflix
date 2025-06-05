// filepath: c:\Users\thete\Desktop\localdev\pairflix\lib.components\src\components\data-display\Table\Table.test.tsx
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { DataTable, TableActionButton, TableColumn } from './Table';

// Mock theme for styled-components
const mockTheme = {
	colors: {
		background: {
			paper: '#ffffff',
			hover: '#f5f5f5',
			secondary: '#f8f9fa',
			selected: '#e8f4fd',
		},
		border: {
			light: '#e0e0e0',
		},
		text: {
			primary: '#212529',
			secondary: '#6c757d',
			warning: '#ffc107',
			error: '#dc3545',
		},
		primary: '#0077cc',
		secondary: '#6c757d',
	},
	borderRadius: {
		md: '8px',
	},
	spacing: {
		xs: '4px',
		sm: '8px',
		md: '16px',
		lg: '24px',
		xl: '32px',
	},
	typography: {
		fontWeight: {
			medium: 500,
		},
	},
};

// Mock LoadingSpinner component
jest.mock('../../feedback/Loading', () => ({
	LoadingSpinner: ({ children }: { children: React.ReactNode }) => (
		<div data-testid='loading-spinner'>{children}</div>
	),
}));

// Mock Typography component
jest.mock('../../utility/Typography', () => ({
	Typography: ({
		children,
		variant,
	}: {
		children: React.ReactNode;
		variant?: string;
	}) => (
		<div data-testid={`typography-${variant || 'default'}`}>{children}</div>
	),
}));

// Helper function to render with theme
const renderWithTheme = (ui: React.ReactElement) => {
	return render(<ThemeProvider theme={mockTheme}>{ui}</ThemeProvider>);
};

// Test data
interface TestUser extends Record<string, unknown> {
	id: string;
	name: string;
	email: string;
	role: string;
	active: boolean;
}

const testColumns: TableColumn<TestUser>[] = [
	{ key: 'name', header: 'Name' },
	{ key: 'email', header: 'Email' },
	{ key: 'role', header: 'Role' },
	{
		key: 'active',
		header: 'Status',
		render: (value) => (value ? 'Active' : 'Inactive'),
		align: 'center',
	},
];

const testData: TestUser[] = [
	{
		id: '1',
		name: 'John Doe',
		email: 'john@example.com',
		role: 'Admin',
		active: true,
	},
	{
		id: '2',
		name: 'Jane Smith',
		email: 'jane@example.com',
		role: 'User',
		active: true,
	},
	{
		id: '3',
		name: 'Bob Johnson',
		email: 'bob@example.com',
		role: 'Guest',
		active: false,
	},
];

describe('DataTable', () => {
	it('renders columns and data correctly', () => {
		renderWithTheme(
			<DataTable<TestUser> columns={testColumns} data={testData} />
		);

		// Check headers
		expect(screen.getByText('Name')).toBeInTheDocument();
		expect(screen.getByText('Email')).toBeInTheDocument();
		expect(screen.getByText('Role')).toBeInTheDocument();
		expect(screen.getByText('Status')).toBeInTheDocument();

		// Check data
		expect(screen.getByText('John Doe')).toBeInTheDocument();
		expect(screen.getByText('jane@example.com')).toBeInTheDocument();
		expect(screen.getByText('Guest')).toBeInTheDocument();

		// Check rendered values - use getAllByText for multiple matches
		const activeElements = screen.getAllByText('Active');
		expect(activeElements).toHaveLength(2); // John and Jane are both active
		expect(screen.getByText('Inactive')).toBeInTheDocument();
	});

	it('shows empty state message when no data is available', () => {
		renderWithTheme(
			<DataTable<TestUser>
				columns={testColumns}
				data={[]}
				emptyMessage='No users found'
			/>
		);

		expect(screen.getByText('No users found')).toBeInTheDocument();
	});

	it('shows loading state when isLoading is true', () => {
		renderWithTheme(
			<DataTable<TestUser>
				columns={testColumns}
				data={testData}
				isLoading={true}
				loadingMessage='Loading users...'
			/>
		);

		expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
		expect(screen.getByText('Loading users...')).toBeInTheDocument();
	});

	it('handles sort when clicking on sortable columns', () => {
		const handleSort = jest.fn();
		const sortableColumns: TableColumn<TestUser>[] = [
			{ key: 'name', header: 'Name', sortable: true },
			{ key: 'email', header: 'Email', sortable: true },
			{ key: 'role', header: 'Role' },
			{ key: 'active', header: 'Status' },
		];

		renderWithTheme(
			<DataTable<TestUser>
				columns={sortableColumns}
				data={testData}
				onSort={handleSort}
				sortColumn='name'
				sortDirection='asc'
			/>
		);

		// Click on a sortable column
		fireEvent.click(screen.getByText('Name'));
		expect(handleSort).toHaveBeenCalledWith('name', 'desc');

		// Click on another sortable column
		fireEvent.click(screen.getByText('Email'));
		expect(handleSort).toHaveBeenCalledWith('email', 'asc');
	});

	it('handles row selection when selectable is true', () => {
		const handleRowSelect = jest.fn();

		renderWithTheme(
			<DataTable<TestUser>
				columns={testColumns}
				data={testData}
				selectable
				selectedRows={['1']}
				onRowSelect={handleRowSelect}
			/>
		);

		// Find rows and check that first row has the selected styling (via attributes)
		const rows = screen.getAllByRole('checkbox');
		expect(rows[0]).toHaveAttribute('aria-checked', 'true');
		expect(rows[1]).toHaveAttribute('aria-checked', 'false');

		// Click on an unselected row
		const secondRow = rows[1];
		expect(secondRow).toBeDefined();
		fireEvent.click(secondRow!);
		expect(handleRowSelect).toHaveBeenCalledWith('2');
	});

	it('handles row click when onRowClick is provided', () => {
		const handleRowClick = jest.fn();

		renderWithTheme(
			<DataTable<TestUser>
				columns={testColumns}
				data={testData}
				onRowClick={handleRowClick}
			/>
		);

		// Click on a row
		fireEvent.click(screen.getByText('John Doe'));
		expect(handleRowClick).toHaveBeenCalledWith(testData[0]);
	});

	it('renders row actions when provided', () => {
		const handleEdit = jest.fn();
		const handleDelete = jest.fn();

		renderWithTheme(
			<DataTable<TestUser>
				columns={testColumns}
				data={testData}
				rowActions={(row) => (
					<>
						<button onClick={() => handleEdit(row.id)}>Edit</button>
						<button onClick={() => handleDelete(row.id)}>Delete</button>
					</>
				)}
			/>
		);

		// Headers should include Actions column
		expect(screen.getByText('Actions')).toBeInTheDocument();

		// Actions should be rendered for each row
		const editButtons = screen.getAllByText('Edit');
		const deleteButtons = screen.getAllByText('Delete');
		expect(editButtons.length).toBe(3);
		expect(deleteButtons.length).toBe(3);

		// Click on an action button
		const firstEditButton = editButtons[0];
		expect(firstEditButton).toBeDefined();
		fireEvent.click(firstEditButton!);
		expect(handleEdit).toHaveBeenCalledWith('1');
	});

	it('uses custom getRowId function when provided', () => {
		const handleRowSelect = jest.fn();

		renderWithTheme(
			<DataTable<TestUser>
				columns={testColumns}
				data={testData}
				selectable
				onRowSelect={handleRowSelect}
				getRowId={(row) => `user-${row.id}`}
			/>
		);

		// Click on a row
		fireEvent.click(screen.getByText('John Doe'));
		expect(handleRowSelect).toHaveBeenCalledWith('user-1');
	});

	it('applies minWidth to the table', () => {
		const { container } = renderWithTheme(
			<DataTable<TestUser>
				columns={testColumns}
				data={testData}
				minWidth='800px'
			/>
		);

		const table = container.querySelector('table');
		expect(table).not.toBeNull();
		expect(table).toHaveStyle('min-width: 800px');
	});

	it('applies maxHeight to the container', () => {
		const { container } = renderWithTheme(
			<DataTable<TestUser>
				columns={testColumns}
				data={testData}
				maxHeight='400px'
			/>
		);

		const tableContainer = container.firstChild as HTMLElement;
		expect(tableContainer).not.toBeNull();
		expect(tableContainer).toHaveStyle('max-height: 400px');
	});

	it('applies stickyHeader when provided', () => {
		const { container } = renderWithTheme(
			<DataTable<TestUser> columns={testColumns} data={testData} stickyHeader />
		);

		const thead = container.querySelector('thead');
		expect(thead).not.toBeNull();
		expect(thead).toHaveStyle('position: sticky');
		expect(thead).toHaveStyle('top: 0');
		expect(thead).toHaveStyle('z-index: 1');
	});
});

describe('TableActionButton', () => {
	it('renders with default variant', () => {
		renderWithTheme(<TableActionButton>Action</TableActionButton>);

		const button = screen.getByText('Action');
		expect(button).toBeInTheDocument();
		expect(button).toHaveStyle(
			`background-color: ${mockTheme.colors.background.secondary}`
		);
	});

	it('applies different variants correctly', () => {
		const { rerender } = renderWithTheme(
			<TableActionButton variant='primary'>Primary</TableActionButton>
		);

		let button = screen.getByText('Primary');
		expect(button).toHaveStyle(`background-color: ${mockTheme.colors.primary}`);
		expect(button).toHaveStyle('color: #ffffff');

		rerender(
			<ThemeProvider theme={mockTheme}>
				<TableActionButton variant='danger'>Danger</TableActionButton>
			</ThemeProvider>
		);

		button = screen.getByText('Danger');
		expect(button).toHaveStyle(
			`background-color: ${mockTheme.colors.text.error}`
		);
		expect(button).toHaveStyle('color: #ffffff');
	});

	it('handles disabled state', () => {
		renderWithTheme(<TableActionButton disabled>Disabled</TableActionButton>);

		const button = screen.getByText('Disabled');
		expect(button).toBeDisabled();
	});

	it('handles click events', () => {
		const handleClick = jest.fn();

		renderWithTheme(
			<TableActionButton onClick={handleClick}>Click Me</TableActionButton>
		);

		const button = screen.getByText('Click Me');
		fireEvent.click(button);

		expect(handleClick).toHaveBeenCalledTimes(1);
	});
});
