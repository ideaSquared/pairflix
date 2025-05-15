import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import {
	FilterGroup,
	FilterItem,
} from '../../../components/common/FilterGroup';
import { Input } from '../../../components/common/Input';
import { Flex } from '../../../components/common/Layout';
import { Loading } from '../../../components/common/Loading';
import { Modal } from '../../../components/common/Modal';
import { Pagination } from '../../../components/common/Pagination';
import { Select } from '../../../components/common/Select';
import {
	Table,
	TableActionButton,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeaderCell,
	TableRow,
} from '../../../components/common/Table';
import { H1, Typography } from '../../../components/common/Typography';
import api, { AdminUser } from '../../../services/api';

// Using AdminUser type directly
type User = AdminUser;

// Styled components
const UsersContainer = styled.div`
	padding-bottom: ${({ theme }) => theme.spacing.xl};
`;

const SearchContainer = styled.div`
	margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const UserRoleBadge = styled(Badge)<{ role: string }>`
	text-transform: capitalize;
`;

const getRoleBadgeVariant = (
	role: string
): 'error' | 'warning' | 'info' | 'success' | 'default' => {
	switch (role) {
		case 'admin':
			return 'error';
		case 'moderator':
			return 'warning';
		default:
			return 'info';
	}
};

const getStatusBadgeVariant = (
	status: string
): 'error' | 'warning' | 'info' | 'success' | 'default' => {
	switch (status) {
		case 'active':
			return 'success';
		case 'inactive':
			return 'default';
		case 'pending':
			return 'warning';
		case 'suspended':
			return 'error';
		default:
			return 'info';
	}
};

const UserManagement: React.FC = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [search, setSearch] = useState('');
	const [roleFilter, setRoleFilter] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [sortBy, setSortBy] = useState('created_at');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [userToDelete, setUserToDelete] = useState<User | null>(null);

	const [showEditModal, setShowEditModal] = useState(false);
	const [userToEdit, setUserToEdit] = useState<User | null>(null);

	useEffect(() => {
		fetchUsers();
	}, [page, search, roleFilter, statusFilter, sortBy, sortOrder]);

	const fetchUsers = async () => {
		try {
			setIsLoading(true);

			// Call the API with parameters that match the actual API implementation
			const response = await api.admin.getUsers({
				limit: 10, // items per page
				offset: (page - 1) * 10, // calculate offset based on page number
				...(search ? { search } : {}),
				...(roleFilter ? { role: roleFilter } : {}),
				...(statusFilter ? { status: statusFilter } : {}),
				...(sortBy ? { sortBy } : {}),
				...(sortOrder ? { sortOrder } : {}),
			});

			setUsers(response.users);
			setTotalPages(Math.ceil(response.pagination.total / 10));
		} catch (error) {
			console.error('Error fetching users:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(e.target.value);
		setPage(1); // Reset to first page on search
	};

	const applyFilters = () => {
		setPage(1); // Reset to first page when applying filters
	};

	const clearFilters = () => {
		setRoleFilter('');
		setStatusFilter('');
		setSortBy('created_at');
		setSortOrder('desc');
		setPage(1);
	};

	const handleEditUser = (user: User) => {
		setUserToEdit(user);
		setShowEditModal(true);
	};

	const handleDeleteUser = (user: User) => {
		setUserToDelete(user);
		setShowDeleteModal(true);
	};

	const confirmDelete = async () => {
		if (!userToDelete) return;

		try {
			// Call the admin API to delete the user
			await api.admin.deleteUser(userToDelete.user_id);

			// Remove user from local state
			setUsers(users.filter((user) => user.user_id !== userToDelete.user_id));
			setShowDeleteModal(false);
			setUserToDelete(null);
		} catch (error) {
			console.error('Error deleting user:', error);
		}
	};

	const saveUserChanges = async (updatedUser: User) => {
		try {
			// Call the admin API with the expected parameter structure
			await api.admin.updateUser(updatedUser.user_id, {
				username: updatedUser.username,
				email: updatedUser.email,
				role: updatedUser.role,
				status: updatedUser.status,
			});

			// Update user in local state
			setUsers(
				users.map((user) =>
					user.user_id === updatedUser.user_id ? updatedUser : user
				)
			);
			setShowEditModal(false);
			setUserToEdit(null);
		} catch (error) {
			console.error('Error updating user:', error);
		}
	};

	return (
		<UsersContainer>
			<H1 gutterBottom>User Management</H1>
			<Typography gutterBottom>
				View and manage user accounts and permissions
			</Typography>

			<SearchContainer>
				<Input
					placeholder='Search users by name or email...'
					value={search}
					onChange={handleSearchChange}
					type='search'
					fullWidth
				/>
			</SearchContainer>

			<FilterGroup
				title='Filter Users'
				onApply={applyFilters}
				onClear={clearFilters}
			>
				<FilterItem label='Role'>
					<Select
						value={roleFilter}
						onChange={(e) => setRoleFilter(e.target.value)}
						fullWidth
					>
						<option value=''>All Roles</option>
						<option value='admin'>Admin</option>
						<option value='moderator'>Moderator</option>
						<option value='user'>User</option>
					</Select>
				</FilterItem>

				<FilterItem label='Status'>
					<Select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						fullWidth
					>
						<option value=''>All Statuses</option>
						<option value='active'>Active</option>
						<option value='inactive'>Inactive</option>
						<option value='pending'>Pending</option>
						<option value='suspended'>Suspended</option>
					</Select>
				</FilterItem>

				<FilterItem label='Sort By'>
					<Select
						value={sortBy}
						onChange={(e) => setSortBy(e.target.value)}
						fullWidth
					>
						<option value='name'>Name</option>
						<option value='email'>Email</option>
						<option value='created_at'>Created Date</option>
						<option value='lastLogin'>Last Login</option>
					</Select>
				</FilterItem>

				<FilterItem label='Sort Order'>
					<Select
						value={sortOrder}
						onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
						fullWidth
					>
						<option value='asc'>Ascending</option>
						<option value='desc'>Descending</option>
					</Select>
				</FilterItem>
			</FilterGroup>

			{isLoading ? (
				<Loading message='Loading users...' />
			) : (
				<>
					<Card>
						<TableContainer>
							<Table>
								<TableHead>
									<TableRow>
										<TableHeaderCell>Name</TableHeaderCell>
										<TableHeaderCell>Email</TableHeaderCell>
										<TableHeaderCell>Role</TableHeaderCell>
										<TableHeaderCell>Status</TableHeaderCell>
										<TableHeaderCell>Created</TableHeaderCell>
										<TableHeaderCell>Last Login</TableHeaderCell>
										<TableHeaderCell>Actions</TableHeaderCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{users.length === 0 ? (
										<TableRow>
											<TableCell colSpan={7} style={{ textAlign: 'center' }}>
												No users found
											</TableCell>
										</TableRow>
									) : (
										users.map((user) => (
											<TableRow key={user.user_id}>
												<TableCell>{user.username}</TableCell>
												<TableCell>{user.email}</TableCell>
												<TableCell>
													<UserRoleBadge
														variant={getRoleBadgeVariant(user.role)}
														role={user.role}
													>
														{user.role}
													</UserRoleBadge>
												</TableCell>
												<TableCell>
													<Badge variant={getStatusBadgeVariant(user.status)}>
														{user.status}
													</Badge>
												</TableCell>
												<TableCell>
													{new Date(user.created_at).toLocaleDateString()}
												</TableCell>
												<TableCell>
													{user.last_login
														? new Date(user.last_login).toLocaleDateString()
														: 'Never'}
												</TableCell>
												<TableCell>
													<Flex gap='sm'>
														<TableActionButton
															onClick={() => handleEditUser(user)}
															title='Edit user'
														>
															<i className='fas fa-edit'></i>
														</TableActionButton>
														<TableActionButton
															variant='danger'
															onClick={() => handleDeleteUser(user)}
															title='Delete user'
														>
															<i className='fas fa-trash'></i>
														</TableActionButton>
													</Flex>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</TableContainer>
					</Card>

					<Flex justifyContent='end' gap='md' style={{ marginTop: '20px' }}>
						<Button
							variant='secondary'
							onClick={() => {
								// Add logic to export users as CSV
								console.log('Export users as CSV');
							}}
						>
							<i className='fas fa-file-export'></i> Export CSV
						</Button>

						<Button
							variant='secondary'
							onClick={() => {
								// Add logic to show archived users
								console.log('Show archived users');
							}}
						>
							<i className='fas fa-archive'></i> Show Archived
						</Button>
					</Flex>

					<Pagination
						currentPage={page}
						totalPages={totalPages}
						onPageChange={setPage}
					/>
				</>
			)}

			{/* Delete User Modal */}
			<Modal
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				title='Delete User'
			>
				<Typography gutterBottom>
					Are you sure you want to delete the user{' '}
					<strong>{userToDelete?.username}</strong>? This action cannot be
					undone.
				</Typography>

				<Flex justifyContent='end' gap='md' style={{ marginTop: '20px' }}>
					<Button variant='secondary' onClick={() => setShowDeleteModal(false)}>
						Cancel
					</Button>
					<Button variant='danger' onClick={confirmDelete}>
						Delete User
					</Button>
				</Flex>
			</Modal>

			{/* Edit User Modal */}
			{userToEdit && (
				<Modal
					isOpen={showEditModal}
					onClose={() => setShowEditModal(false)}
					title='Edit User'
				>
					{/* Simple user edit form */}
					<form>
						<div style={{ marginBottom: '16px' }}>
							<label
								htmlFor='user-name'
								style={{ display: 'block', marginBottom: '8px' }}
							>
								Name
							</label>
							<Input
								id='user-name'
								value={userToEdit.username}
								onChange={(e) =>
									setUserToEdit({ ...userToEdit, username: e.target.value })
								}
								fullWidth
							/>
						</div>

						<div style={{ marginBottom: '16px' }}>
							<label
								htmlFor='user-email'
								style={{ display: 'block', marginBottom: '8px' }}
							>
								Email
							</label>
							<Input
								id='user-email'
								type='email'
								value={userToEdit.email}
								onChange={(e) =>
									setUserToEdit({ ...userToEdit, email: e.target.value })
								}
								fullWidth
							/>
						</div>

						<div style={{ marginBottom: '16px' }}>
							<label
								htmlFor='user-role'
								style={{ display: 'block', marginBottom: '8px' }}
							>
								Role
							</label>
							<Select
								id='user-role'
								value={userToEdit.role}
								onChange={(e) =>
									setUserToEdit({
										...userToEdit,
										role: e.target.value as User['role'],
									})
								}
								fullWidth
							>
								<option value='admin'>Admin</option>
								<option value='moderator'>Moderator</option>
								<option value='user'>User</option>
							</Select>
						</div>

						<div style={{ marginBottom: '16px' }}>
							<label
								htmlFor='user-status'
								style={{ display: 'block', marginBottom: '8px' }}
							>
								Status
							</label>
							<Select
								id='user-status'
								value={userToEdit.status}
								onChange={(e) =>
									setUserToEdit({
										...userToEdit,
										status: e.target.value as User['status'],
									})
								}
								fullWidth
							>
								<option value='active'>Active</option>
								<option value='inactive'>Inactive</option>
								<option value='pending'>Pending</option>
								<option value='suspended'>Suspended</option>
							</Select>
						</div>

						<Flex justifyContent='end' gap='md' style={{ marginTop: '20px' }}>
							<Button
								variant='secondary'
								onClick={() => setShowEditModal(false)}
							>
								Cancel
							</Button>
							<Button
								variant='primary'
								onClick={() => saveUserChanges(userToEdit)}
							>
								Save Changes
							</Button>
						</Flex>
					</form>
				</Modal>
			)}
		</UsersContainer>
	);
};

export default UserManagement;
