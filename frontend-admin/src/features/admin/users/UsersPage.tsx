import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { AdminUser, adminService } from '../../../services/admin.service';

// Styled components
const PageContainer = styled.div`
	padding-bottom: 2rem;
`;

const PageHeader = styled.div`
	margin-bottom: 2rem;
`;

const H1 = styled.h1`
	color: #ffffff;
	margin-bottom: 0.5rem;
	font-size: 2rem;
`;

const SubHeading = styled.p`
	color: #b3b3b3;
	margin-bottom: 2rem;
	font-size: 1rem;
`;

const TableContainer = styled.div`
	background-color: #1e1e1e;
	border-radius: 0.5rem;
	overflow: hidden;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Table = styled.table`
	width: 100%;
	border-collapse: collapse;
`;

const TableHeader = styled.th`
	text-align: left;
	padding: 1rem;
	color: #e0e0e0;
	background-color: #2a2a2a;
	border-bottom: 1px solid #333;
`;

const TableRow = styled.tr`
	&:hover {
		background-color: #252525;
	}
`;

const TableCell = styled.td`
	padding: 1rem;
	color: #e0e0e0;
	border-bottom: 1px solid #333;
`;

const StatusBadge = styled.span<{ status: string }>`
	display: inline-block;
	padding: 0.25rem 0.5rem;
	border-radius: 1rem;
	font-size: 0.75rem;
	font-weight: 500;
	background-color: ${({ status }) => {
		switch (status) {
			case 'active':
				return '#4caf5020';
			case 'inactive':
				return '#9e9e9e20';
			case 'suspended':
				return '#ff980020';
			case 'banned':
				return '#f4433620';
			default:
				return '#e0e0e020';
		}
	}};
	color: ${({ status }) => {
		switch (status) {
			case 'active':
				return '#4caf50';
			case 'inactive':
				return '#9e9e9e';
			case 'suspended':
				return '#ff9800';
			case 'banned':
				return '#f44336';
			default:
				return '#e0e0e0';
		}
	}};
`;

const RoleBadge = styled.span<{ role: string }>`
	display: inline-block;
	padding: 0.25rem 0.5rem;
	border-radius: 1rem;
	font-size: 0.75rem;
	font-weight: 500;
	background-color: ${({ role }) => {
		switch (role) {
			case 'admin':
				return '#3f51b520';
			case 'moderator':
				return '#00bcd420';
			default:
				return '#e0e0e020';
		}
	}};
	color: ${({ role }) => {
		switch (role) {
			case 'admin':
				return '#3f51b5';
			case 'moderator':
				return '#00bcd4';
			default:
				return '#e0e0e0';
		}
	}};
`;

const ActionButton = styled.button`
	background-color: transparent;
	color: #2196f3;
	border: none;
	padding: 0.25rem 0.5rem;
	font-size: 0.875rem;
	cursor: pointer;
	transition: color 0.2s;
	margin-right: 0.5rem;

	&:hover {
		color: #64b5f6;
	}

	&:disabled {
		color: #666;
		cursor: not-allowed;
	}
`;

const FilterContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
	margin-bottom: 1.5rem;
`;

const SearchInput = styled.input`
	padding: 0.5rem 1rem;
	border-radius: 0.25rem;
	border: 1px solid #333;
	background-color: #333;
	color: #e0e0e0;
	flex: 1;
	min-width: 200px;

	&::placeholder {
		color: #999;
	}

	&:focus {
		outline: none;
		box-shadow: 0 0 0 2px #2196f380;
	}
`;

const Select = styled.select`
	padding: 0.5rem 1rem;
	border-radius: 0.25rem;
	border: 1px solid #333;
	background-color: #333;
	color: #e0e0e0;

	&:focus {
		outline: none;
		box-shadow: 0 0 0 2px #2196f380;
	}
`;

const Button = styled.button`
	padding: 0.5rem 1rem;
	border-radius: 0.25rem;
	border: none;
	background-color: #2196f3;
	color: white;
	cursor: pointer;
	transition: background-color 0.2s;

	&:hover {
		background-color: #1976d2;
	}

	&:focus {
		outline: none;
		box-shadow: 0 0 0 2px #2196f380;
	}
`;

const PaginationContainer = styled.div`
	display: flex;
	justify-content: flex-end;
	margin-top: 1.5rem;
	gap: 0.5rem;
`;

const PaginationButton = styled.button<{ active?: boolean }>`
	padding: 0.5rem 0.75rem;
	border-radius: 0.25rem;
	border: 1px solid #333;
	background-color: ${({ active }) => (active ? '#2196f3' : '#333')};
	color: ${({ active }) => (active ? 'white' : '#e0e0e0')};
	cursor: pointer;
	transition: background-color 0.2s;

	&:hover {
		background-color: ${({ active }) => (active ? '#1976d2' : '#444')};
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`;

export const UsersPage: React.FC = () => {
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Pagination
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalUsers, setTotalUsers] = useState(0);

	// Filters
	const [search, setSearch] = useState('');
	const [roleFilter, setRoleFilter] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [sortBy, setSortBy] = useState('created_at');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

	useEffect(() => {
		fetchUsers();
	}, [currentPage, search, roleFilter, statusFilter, sortBy, sortOrder]);

	const fetchUsers = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const response = await adminService.getUsers({
				limit: 10,
				offset: (currentPage - 1) * 10,
				search,
				role: roleFilter,
				status: statusFilter,
				sortBy,
				sortOrder,
			});

			setUsers(response.users);
			setTotalUsers(response.pagination.total);
			setTotalPages(Math.ceil(response.pagination.total / 10));
		} catch (err) {
			setError(
				`Failed to fetch users: ${err instanceof Error ? err.message : String(err)}`
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSearch = () => {
		setCurrentPage(1); // Reset to first page when searching
		fetchUsers();
	};

	const handleReset = () => {
		setSearch('');
		setRoleFilter('');
		setStatusFilter('');
		setSortBy('created_at');
		setSortOrder('desc');
		setCurrentPage(1);
	};

	const formatDate = (dateString: string) => {
		if (!dateString) return 'Never';
		return new Date(dateString).toLocaleString();
	};

	return (
		<PageContainer>
			<PageHeader>
				<H1>User Management</H1>
				<SubHeading>
					View and manage user accounts across the platform
				</SubHeading>
			</PageHeader>

			<FilterContainer>
				<SearchInput
					type='text'
					placeholder='Search users...'
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
				/>

				<Select
					value={roleFilter}
					onChange={(e) => setRoleFilter(e.target.value)}
				>
					<option value=''>All Roles</option>
					<option value='user'>User</option>
					<option value='moderator'>Moderator</option>
					<option value='admin'>Admin</option>
				</Select>

				<Select
					value={statusFilter}
					onChange={(e) => setStatusFilter(e.target.value)}
				>
					<option value=''>All Statuses</option>
					<option value='active'>Active</option>
					<option value='inactive'>Inactive</option>
					<option value='suspended'>Suspended</option>
					<option value='banned'>Banned</option>
					<option value='pending'>Pending</option>
				</Select>

				<Button onClick={handleSearch}>Filter</Button>
				<Button onClick={handleReset}>Reset</Button>
			</FilterContainer>

			{isLoading && <p>Loading users...</p>}

			{error && <p style={{ color: '#f44336' }}>{error}</p>}

			{!isLoading && !error && users.length === 0 && (
				<p>No users found matching the current criteria.</p>
			)}

			{!isLoading && users.length > 0 && (
				<>
					<TableContainer>
						<Table>
							<thead>
								<tr>
									<TableHeader>Username</TableHeader>
									<TableHeader>Email</TableHeader>
									<TableHeader>Role</TableHeader>
									<TableHeader>Status</TableHeader>
									<TableHeader>Created</TableHeader>
									<TableHeader>Last Login</TableHeader>
									<TableHeader>Actions</TableHeader>
								</tr>
							</thead>
							<tbody>
								{users.map((user) => (
									<TableRow key={user.user_id}>
										<TableCell>{user.username}</TableCell>
										<TableCell>{user.email}</TableCell>
										<TableCell>
											<RoleBadge role={user.role}>{user.role}</RoleBadge>
										</TableCell>
										<TableCell>
											<StatusBadge status={user.status}>
												{user.status}
											</StatusBadge>
										</TableCell>
										<TableCell>{formatDate(user.created_at)}</TableCell>
										<TableCell>
											{user.last_login ? formatDate(user.last_login) : 'Never'}
										</TableCell>
										<TableCell>
											<ActionButton>Edit</ActionButton>
											<ActionButton>View Activity</ActionButton>
										</TableCell>
									</TableRow>
								))}
							</tbody>
						</Table>
					</TableContainer>

					<PaginationContainer>
						<PaginationButton
							disabled={currentPage <= 1}
							onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
						>
							Previous
						</PaginationButton>

						{/* Show page numbers */}
						{Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
							const pageNum =
								currentPage > 3 && totalPages > 5
									? currentPage -
										3 +
										i +
										(totalPages - currentPage < 2
											? totalPages - currentPage - 2
											: 0)
									: i + 1;

							return pageNum <= totalPages ? (
								<PaginationButton
									key={pageNum}
									active={currentPage === pageNum}
									onClick={() => setCurrentPage(pageNum)}
								>
									{pageNum}
								</PaginationButton>
							) : null;
						})}

						{totalPages > 5 && currentPage < totalPages - 2 && (
							<>
								<span style={{ color: '#e0e0e0', alignSelf: 'center' }}>
									...
								</span>
								<PaginationButton onClick={() => setCurrentPage(totalPages)}>
									{totalPages}
								</PaginationButton>
							</>
						)}

						<PaginationButton
							disabled={currentPage >= totalPages}
							onClick={() =>
								setCurrentPage((prev) => Math.min(prev + 1, totalPages))
							}
						>
							Next
						</PaginationButton>
					</PaginationContainer>
				</>
			)}
		</PageContainer>
	);
};
