import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { useState } from 'react';
import styled from 'styled-components';

import { Button } from '../../inputs/Button';
import { Badge } from '../Badge';
import { DataTable, TableActionButton, TableColumn } from './Table';

const Container = styled.div`
  padding: 16px;
  width: 100%;
  max-width: 1000px;
`;

const ActionContainer = styled.div`
  display: flex;
  gap: 8px;
`;

// Interface for our sample data
interface User extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  createdAt: string;
}

// Sample data
const users: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin',
    status: 'active',
    lastLogin: '2025-06-01T10:30:00',
    createdAt: '2023-01-15T09:00:00',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'User',
    status: 'active',
    lastLogin: '2025-06-03T14:45:00',
    createdAt: '2023-02-20T11:30:00',
  },
  {
    id: '3',
    name: 'Michael Johnson',
    email: 'michael.j@example.com',
    role: 'Editor',
    status: 'inactive',
    lastLogin: '2025-05-15T09:20:00',
    createdAt: '2023-03-05T15:20:00',
  },
  {
    id: '4',
    name: 'Emily Wilson',
    email: 'emily.w@example.com',
    role: 'User',
    status: 'pending',
    lastLogin: '2025-06-05T16:10:00',
    createdAt: '2023-04-10T08:45:00',
  },
  {
    id: '5',
    name: 'Robert Brown',
    email: 'robert.b@example.com',
    role: 'Editor',
    status: 'active',
    lastLogin: '2025-06-02T11:25:00',
    createdAt: '2023-05-18T13:15:00',
  },
];

// Format date for display
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Standard columns for the user table
const getStandardColumns = (): TableColumn<User>[] => [
  {
    key: 'name',
    header: 'Name',
    sortable: true,
  },
  {
    key: 'email',
    header: 'Email',
  },
  {
    key: 'role',
    header: 'Role',
    sortable: true,
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: value => {
      const status = value as 'active' | 'inactive' | 'pending';
      let variant: 'success' | 'error' | 'warning' = 'success';

      switch (status) {
        case 'active':
          variant = 'success';
          break;
        case 'inactive':
          variant = 'error';
          break;
        case 'pending':
          variant = 'warning';
          break;
      }

      return (
        <Badge variant={variant} pill>
          {status}
        </Badge>
      );
    },
  },
  {
    key: 'lastLogin',
    header: 'Last Login',
    sortable: true,
    render: value => formatDate(value as string),
  },
  {
    key: 'createdAt',
    header: 'Created At',
    sortable: true,
    render: value => formatDate(value as string),
  },
];

// Helper component for tables with sorting
const SortableTable = () => {
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [data, setData] = useState<User[]>([...users]);

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSortColumn(column);
    setSortDirection(direction);

    const sortedData = [...data].sort((a, b) => {
      const valueA = a[column as keyof User];
      const valueB = b[column as keyof User];

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return direction === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      return 0;
    });

    setData(sortedData);
  };

  return (
    <DataTable<User>
      columns={getStandardColumns()}
      data={data}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      onSort={handleSort}
      aria-label="Sortable Users Table"
    />
  );
};

// Helper component for selectable tables
const SelectableTable = () => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const handleRowSelect = (rowId: string) => {
    setSelectedRows(prev =>
      prev.includes(rowId) ? prev.filter(id => id !== rowId) : [...prev, rowId]
    );
  };

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        {selectedRows.length > 0 ? (
          <div>
            <span>Selected {selectedRows.length} user(s): </span>
            <Button
              variant="danger"
              size="small"
              onClick={() => setSelectedRows([])}
            >
              Clear Selection
            </Button>
          </div>
        ) : (
          <span>Click rows to select them</span>
        )}
      </div>
      <DataTable<User>
        columns={getStandardColumns()}
        data={users}
        selectable={true}
        selectedRows={selectedRows}
        onRowSelect={handleRowSelect}
        aria-label="Selectable Users Table"
      />
    </div>
  );
};

// Helper component for tables with row actions
const TableWithActions = () => {
  const columns = getStandardColumns().slice(0, 5); // Using fewer columns to make room for actions

  const handleView = (user: User) => {
    alert(`Viewing user: ${user.name}`);
  };

  const handleEdit = (user: User) => {
    alert(`Editing user: ${user.name}`);
  };

  const handleDelete = (user: User) => {
    alert(`Deleting user: ${user.name}`);
  };

  const renderRowActions = (row: User) => (
    <ActionContainer>
      <TableActionButton
        variant="default"
        onClick={() => handleView(row)}
        title="View"
      >
        👁️
      </TableActionButton>
      <TableActionButton
        variant="primary"
        onClick={() => handleEdit(row)}
        title="Edit"
      >
        ✏️
      </TableActionButton>
      <TableActionButton
        variant="danger"
        onClick={() => handleDelete(row)}
        title="Delete"
      >
        🗑️
      </TableActionButton>
    </ActionContainer>
  );

  return (
    <DataTable<User>
      columns={columns}
      data={users}
      rowActions={renderRowActions}
      aria-label="Users Table with Actions"
    />
  );
};

const meta: Meta<typeof DataTable> = {
  title: 'Data Display/Table',
  component: DataTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A versatile data table component for displaying structured data in rows and columns.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    columns: {
      description: 'Array of column definition objects',
    },
    data: {
      description: 'Array of data objects to display in the table',
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether the table is in loading state',
      defaultValue: false,
    },
    loadingMessage: {
      control: 'text',
      description: 'Message to display when table is loading',
      defaultValue: 'Loading...',
    },
    emptyMessage: {
      control: 'text',
      description: 'Message to display when table has no data',
      defaultValue: 'No data available',
    },
    stickyHeader: {
      control: 'boolean',
      description:
        'Whether the table header should stick to the top when scrolling',
      defaultValue: false,
    },
    selectable: {
      control: 'boolean',
      description: 'Whether rows can be selected',
      defaultValue: false,
    },
    minWidth: {
      control: 'text',
      description: 'Minimum width of the table',
      defaultValue: '650px',
    },
    maxHeight: {
      control: 'text',
      description:
        'Maximum height of the table container, enables vertical scrolling',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DataTable>;

// Basic Table
export const Default: Story = {
  render: () => (
    <Container>
      <DataTable<User>
        columns={getStandardColumns()}
        data={users}
        aria-label="Users Table"
      />
    </Container>
  ),
};

// Sortable Table
export const Sortable: Story = {
  render: () => (
    <Container>
      <SortableTable />
    </Container>
  ),
};

// Loading State Table
export const Loading: Story = {
  render: () => (
    <Container>
      <DataTable<User>
        columns={getStandardColumns()}
        data={users}
        isLoading={true}
        loadingMessage="Loading users data..."
        aria-label="Loading Table"
      />
    </Container>
  ),
};

// Empty Table
export const Empty: Story = {
  render: () => (
    <Container>
      <DataTable<User>
        columns={getStandardColumns()}
        data={[]}
        emptyMessage="No users found"
        aria-label="Empty Table"
      />
    </Container>
  ),
};

// Selectable Table
export const Selectable: Story = {
  render: () => (
    <Container>
      <SelectableTable />
    </Container>
  ),
};

// Table with Actions
export const WithActions: Story = {
  render: () => (
    <Container>
      <TableWithActions />
    </Container>
  ),
};

// Table with Row Click
export const ClickableRows: Story = {
  render: () => (
    <Container>
      <DataTable<User>
        columns={getStandardColumns()}
        data={users}
        onRowClick={row => alert(`Clicked on user: ${row.name}`)}
        aria-label="Clickable Rows Table"
      />
    </Container>
  ),
};

// Table with Sticky Header
export const StickyHeader: Story = {
  render: () => (
    <Container>
      <DataTable<User>
        columns={getStandardColumns()}
        data={[...users, ...users, ...users]} // More data to demonstrate scrolling
        stickyHeader={true}
        maxHeight="300px"
        aria-label="Table with Sticky Header"
      />
    </Container>
  ),
};

// Table with Custom Cell Rendering
export const CustomCellRendering: Story = {
  render: () => {
    const customColumns: TableColumn<User>[] = [
      {
        key: 'name',
        header: 'User',
        render: (value, row) => (
          <div>
            <div style={{ fontWeight: 'bold' }}>{value as string}</div>
            <div style={{ fontSize: '0.8em', color: '#666' }}>{row.email}</div>
          </div>
        ),
      },
      {
        key: 'role',
        header: 'Access Level',
        render: value => {
          const role = value as string;
          let color = '#666';

          switch (role) {
            case 'Admin':
              color = '#8A2BE2'; // Purple for admin
              break;
            case 'Editor':
              color = '#1E90FF'; // Blue for editor
              break;
            default:
              color = '#666'; // Gray for regular users
          }

          return (
            <span
              style={{
                padding: '4px 8px',
                background: `${color}20`,
                color,
                borderRadius: '4px',
                fontWeight: 'bold',
              }}
            >
              {role}
            </span>
          );
        },
      },
      {
        key: 'status',
        header: 'Status',
        render: value => {
          const status = value as 'active' | 'inactive' | 'pending';
          let variant: 'success' | 'error' | 'warning' = 'success';

          switch (status) {
            case 'active':
              variant = 'success';
              break;
            case 'inactive':
              variant = 'error';
              break;
            case 'pending':
              variant = 'warning';
              break;
          }

          return (
            <Badge variant={variant} pill>
              {status}
            </Badge>
          );
        },
      },
      {
        key: 'lastLogin',
        header: 'Last Seen',
        render: value => {
          const date = new Date(value as string);
          const now = new Date();
          const diffInDays = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
          );

          return (
            <div>
              <div>{formatDate(value as string)}</div>
              <div style={{ fontSize: '0.8em', color: '#666' }}>
                {diffInDays === 0
                  ? 'Today'
                  : `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`}
              </div>
            </div>
          );
        },
      },
    ];

    return (
      <Container>
        <DataTable<User>
          columns={customColumns}
          data={users}
          aria-label="Table with Custom Cell Rendering"
        />
      </Container>
    );
  },
};

// Table with Text Alignment
export const TextAlignment: Story = {
  render: () => {
    const alignedColumns: TableColumn<User>[] = [
      {
        key: 'id',
        header: 'ID',
        align: 'center',
        width: '80px',
      },
      {
        key: 'name',
        header: 'Name',
        align: 'left',
      },
      {
        key: 'email',
        header: 'Email',
        align: 'left',
      },
      {
        key: 'role',
        header: 'Role',
        align: 'center',
      },
      {
        key: 'status',
        header: 'Status',
        align: 'center',
        render: value => {
          const status = value as 'active' | 'inactive' | 'pending';
          let variant: 'success' | 'error' | 'warning' = 'success';

          switch (status) {
            case 'active':
              variant = 'success';
              break;
            case 'inactive':
              variant = 'error';
              break;
            case 'pending':
              variant = 'warning';
              break;
          }

          return (
            <Badge variant={variant} pill>
              {status}
            </Badge>
          );
        },
      },
      {
        key: 'lastLogin',
        header: 'Last Login',
        align: 'right',
        render: value => formatDate(value as string),
      },
    ];

    return (
      <Container>
        <DataTable<User>
          columns={alignedColumns}
          data={users}
          aria-label="Table with Text Alignment"
        />
      </Container>
    );
  },
};

// Table with Column Widths
export const ColumnWidths: Story = {
  render: () => {
    const widthColumns: TableColumn<User>[] = [
      {
        key: 'id',
        header: 'ID',
        width: '60px',
      },
      {
        key: 'name',
        header: 'Name',
        width: '20%',
      },
      {
        key: 'email',
        header: 'Email',
        width: '30%',
      },
      {
        key: 'role',
        header: 'Role',
        width: '100px',
      },
      {
        key: 'status',
        header: 'Status',
        width: '120px',
        render: value => {
          const status = value as 'active' | 'inactive' | 'pending';
          let variant: 'success' | 'error' | 'warning' = 'success';

          switch (status) {
            case 'active':
              variant = 'success';
              break;
            case 'inactive':
              variant = 'error';
              break;
            case 'pending':
              variant = 'warning';
              break;
          }

          return (
            <Badge variant={variant} pill>
              {status}
            </Badge>
          );
        },
      },
    ];

    return (
      <Container>
        <DataTable<User>
          columns={widthColumns}
          data={users}
          aria-label="Table with Column Widths"
        />
      </Container>
    );
  },
};
