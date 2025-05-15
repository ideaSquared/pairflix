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

	// Delete Modal states
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [userToDelete, setUserToDelete] = useState<User | null>(null);

	// Edit User Modal states
	const [showEditModal, setShowEditModal] = useState(false);
	const [userToEdit, setUserToEdit] = useState<User | null>(null);

	// Create User Modal states
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [newUser, setNewUser] = useState({
		username: '',
		email: '',
		password: '',
		role: 'user',
		status: 'active',
	});

	// Reset Password Modal states
	const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
	const [userToResetPassword, setUserToResetPassword] = useState<User | null>(
		null
	);
	const [newPassword, setNewPassword] = useState('');

	// Change Status Modal states
	const [showChangeStatusModal, setShowChangeStatusModal] = useState(false);
	const [userToChangeStatus, setUserToChangeStatus] = useState<User | null>(
		null
	);
	const [newStatus, setNewStatus] = useState('');
	const [statusChangeReason, setStatusChangeReason] = useState('');

	// Success/Error message states
	const [successMessage, setSuccessMessage] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		fetchUsers();
	}, [page, search, roleFilter, statusFilter, sortBy, sortOrder]);

	// Show success message temporarily
	useEffect(() => {
		if (successMessage) {
			const timer = setTimeout(() => {
				setSuccessMessage('');
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [successMessage]);

	// Show error message temporarily
	useEffect(() => {
		if (errorMessage) {
			const timer = setTimeout(() => {
				setErrorMessage('');
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [errorMessage]);

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

			// Make sure we're receiving data with the correct type
			const typedUsers: User[] = response.users.map((user) => ({
				...user,
				status: user.status as 'active' | 'inactive' | 'suspended',
			}));

			setUsers(typedUsers);
			setTotalPages(Math.ceil(response.pagination.total / 10));
		} catch (error) {
			console.error('Error fetching users:', error);
			setErrorMessage('Failed to fetch users. Please try again.');
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
			setSuccessMessage(`User ${userToDelete.username} deleted successfully`);
		} catch (error) {
			console.error('Error deleting user:', error);
			setErrorMessage('Failed to delete user. Please try again.');
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
			setSuccessMessage(`User ${updatedUser.username} updated successfully`);
		} catch (error) {
			console.error('Error updating user:', error);
			setErrorMessage('Failed to update user. Please try again.');
		}
	};

	const handleCreateUser = async () => {
		try {
			// Call the admin API to create the user
			const response = await api.admin.createUser(newUser);

			// Add new user to local state
			setUsers([response.user, ...users]);
			setShowCreateModal(false);
			setNewUser({
				username: '',
				email: '',
				password: '',
				role: 'user',
				status: 'active',
			});
			setSuccessMessage(`User ${response.user.username} created successfully`);
		} catch (error) {
			console.error('Error creating user:', error);
			setErrorMessage('Failed to create user. Please try again.');
		}
	};

	const handleResetPassword = (user: User) => {
		setUserToResetPassword(user);
		setNewPassword('');
		setShowResetPasswordModal(true);
	};

	const confirmResetPassword = async () => {
		if (!userToResetPassword) return;

		try {
			// Call the admin API to reset user password
			const response = await api.admin.resetUserPassword(
				userToResetPassword.user_id
			);

			// Set the generated password
			setNewPassword(response.newPassword);
			setSuccessMessage(
				`Password for ${userToResetPassword.username} reset successfully`
			);
		} catch (error) {
			console.error('Error resetting password:', error);
			setErrorMessage('Failed to reset password. Please try again.');
		}
	};

	const handleChangeStatus = (user: User) => {
		setUserToChangeStatus(user);
		setNewStatus(user.status); // Default to current status
		setStatusChangeReason('');
		setShowChangeStatusModal(true);
	};

	const confirmChangeStatus = async () => {
		if (!userToChangeStatus || !newStatus) return;

		try {
			// Call the admin API to change user status
			await api.admin.changeUserStatus(
				userToChangeStatus.user_id,
				newStatus as 'active' | 'inactive' | 'suspended' | 'pending',
				statusChangeReason
			);

			// Update user in local state
			setUsers(
				users.map((user) =>
					user.user_id === userToChangeStatus.user_id
						? {
								...user,
								status: newStatus as 'active' | 'inactive' | 'suspended',
							}
						: user
				)
			);
			setShowChangeStatusModal(false);
			setUserToChangeStatus(null);
			setSuccessMessage(`User status changed to ${newStatus} successfully`);
		} catch (error) {
			console.error('Error changing user status:', error);
			setErrorMessage('Failed to change user status. Please try again.');
		}
	};

	const handleExportCsv = async () => {
		try {
			// Call the API to get CSV data
			const blob = await api.admin.exportUsersAsCsv({
				...(roleFilter ? { role: roleFilter } : {}),
				...(statusFilter ? { status: statusFilter } : {}),
			});

			// Create a download link
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.style.display = 'none';
			a.href = url;
			a.download = 'users.csv';
			document.body.appendChild(a);
			a.click();

			// Clean up
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
			setSuccessMessage('Users exported to CSV successfully');
		} catch (error) {
			console.error('Error exporting users to CSV:', error);
			setErrorMessage('Failed to export users. Please try again.');
		}
	};

	const renderSuccessMessage = () => {
		if (!successMessage) return null;
		return (
			<div
				style={{
					marginBottom: '20px',
					padding: '10px 20px',
					backgroundColor: '#dff0d8',
					borderColor: '#d6e9c6',
					borderRadius: '4px',
					border: '1px solid #d6e9c6',
				}}
			>
				<Typography style={{ color: '#3c763d' }}>{successMessage}</Typography>
			</div>
		);
	};

	const renderErrorMessage = () => {
		if (!errorMessage) return null;
		return (
			<div
				style={{
					marginBottom: '20px',
					padding: '10px 20px',
					backgroundColor: '#f2dede',
					borderColor: '#ebccd1',
					borderRadius: '4px',
					border: '1px solid #ebccd1',
				}}
			>
				<Typography style={{ color: '#a94442' }}>{errorMessage}</Typography>
			</div>
		);
	};

	return (
		<UsersContainer>
			<H1 gutterBottom>User Management</H1>
			<Typography gutterBottom>
				View and manage user accounts and permissions
			</Typography>

			{renderSuccessMessage()}
			{renderErrorMessage()}

			<Flex
				justifyContent='space-between'
				alignItems='center'
				style={{ marginBottom: '20px' }}
			>
				<SearchContainer style={{ flex: 1 }}>
					<Input
						placeholder='Search users by name or email...'
						value={search}
						onChange={handleSearchChange}
						type='search'
						fullWidth
					/>
				</SearchContainer>
				<Button
					variant='primary'
					style={{ marginLeft: '20px' }}
					onClick={() => setShowCreateModal(true)}
				>
					<i className='fas fa-user-plus'></i> Create User
				</Button>
			</Flex>

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
													<Flex gap='xs'>
														<TableActionButton
															onClick={() => handleEditUser(user)}
															title='Edit user'
														>
															<i className='fas fa-edit'></i>
														</TableActionButton>
														<TableActionButton
															onClick={() => handleChangeStatus(user)}
															title='Change status'
															variant='secondary'
														>
															<i className='fas fa-exchange-alt'></i>
														</TableActionButton>
														<TableActionButton
															onClick={() => handleResetPassword(user)}
															title='Reset password'
															variant='warning'
														>
															<i className='fas fa-key'></i>
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
						<Button variant='secondary' onClick={handleExportCsv}>
							<i className='fas fa-file-export'></i> Export CSV
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
					<form
						onSubmit={(e) => {
							e.preventDefault();
							if (userToEdit) saveUserChanges(userToEdit);
						}}
					>
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
							<Button variant='primary' type='submit'>
								Save Changes
							</Button>
						</Flex>
					</form>
				</Modal>
			)}

			{/* Create User Modal */}
			<Modal
				isOpen={showCreateModal}
				onClose={() => setShowCreateModal(false)}
				title='Create New User'
			>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleCreateUser();
					}}
				>
					<div style={{ marginBottom: '16px' }}>
						<label
							htmlFor='new-username'
							style={{ display: 'block', marginBottom: '8px' }}
						>
							Username *
						</label>
						<Input
							id='new-username'
							value={newUser.username}
							onChange={(e) =>
								setNewUser({ ...newUser, username: e.target.value })
							}
							required
							fullWidth
						/>
					</div>

					<div style={{ marginBottom: '16px' }}>
						<label
							htmlFor='new-email'
							style={{ display: 'block', marginBottom: '8px' }}
						>
							Email *
						</label>
						<Input
							id='new-email'
							type='email'
							value={newUser.email}
							onChange={(e) =>
								setNewUser({ ...newUser, email: e.target.value })
							}
							required
							fullWidth
						/>
					</div>

					<div style={{ marginBottom: '16px' }}>
						<label
							htmlFor='new-password'
							style={{ display: 'block', marginBottom: '8px' }}
						>
							Password *
						</label>
						<Input
							id='new-password'
							type='password'
							value={newUser.password}
							onChange={(e) =>
								setNewUser({ ...newUser, password: e.target.value })
							}
							required
							fullWidth
						/>
					</div>

					<div style={{ marginBottom: '16px' }}>
						<label
							htmlFor='new-role'
							style={{ display: 'block', marginBottom: '8px' }}
						>
							Role
						</label>
						<Select
							id='new-role'
							value={newUser.role}
							onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
							fullWidth
						>
							<option value='user'>User</option>
							<option value='moderator'>Moderator</option>
							<option value='admin'>Admin</option>
						</Select>
					</div>

					<div style={{ marginBottom: '16px' }}>
						<label
							htmlFor='new-status'
							style={{ display: 'block', marginBottom: '8px' }}
						>
							Status
						</label>
						<Select
							id='new-status'
							value={newUser.status}
							onChange={(e) =>
								setNewUser({ ...newUser, status: e.target.value })
							}
							fullWidth
						>
							<option value='active'>Active</option>
							<option value='inactive'>Inactive</option>
							<option value='pending'>Pending</option>
						</Select>
					</div>

					<Flex justifyContent='end' gap='md' style={{ marginTop: '20px' }}>
						<Button
							variant='secondary'
							onClick={() => setShowCreateModal(false)}
						>
							Cancel
						</Button>
						<Button variant='primary' type='submit'>
							Create User
						</Button>
					</Flex>
				</form>
			</Modal>

			{/* Reset Password Modal */}
			<Modal
				isOpen={showResetPasswordModal}
				onClose={() => setShowResetPasswordModal(false)}
				title='Reset User Password'
			>
				{newPassword ? (
					<>
						<Typography gutterBottom>
							The password for user{' '}
							<strong>{userToResetPassword?.username}</strong> has been reset.
							Please copy the new password and share it securely with the user.
						</Typography>

						<div
							style={{
								margin: '20px 0',
								padding: '15px',
								backgroundColor: '#f8f9fa',
								border: '1px solid #dee2e6',
								borderRadius: '4px',
								textAlign: 'center',
							}}
						>
							<Typography style={{ fontFamily: 'monospace', fontSize: '18px' }}>
								{newPassword}
							</Typography>
						</div>

						<Typography style={{ color: '#dc3545', marginBottom: '20px' }}>
							This password will not be shown again!
						</Typography>

						<Flex justifyContent='end' gap='md'>
							<Button
								variant='primary'
								onClick={() => {
									navigator.clipboard.writeText(newPassword);
									setSuccessMessage('Password copied to clipboard');
								}}
							>
								<i className='fas fa-copy'></i> Copy Password
							</Button>
							<Button
								variant='secondary'
								onClick={() => setShowResetPasswordModal(false)}
							>
								Close
							</Button>
						</Flex>
					</>
				) : (
					<>
						<Typography gutterBottom>
							Are you sure you want to reset the password for user{' '}
							<strong>{userToResetPassword?.username}</strong>?
						</Typography>

						<Typography style={{ color: '#dc3545', marginBottom: '20px' }}>
							This action will generate a new random password and invalidate the
							current one.
						</Typography>

						<Flex justifyContent='end' gap='md'>
							<Button
								variant='secondary'
								onClick={() => setShowResetPasswordModal(false)}
							>
								Cancel
							</Button>
							<Button variant='warning' onClick={confirmResetPassword}>
								Reset Password
							</Button>
						</Flex>
					</>
				)}
			</Modal>

			{/* Change Status Modal */}
			<Modal
				isOpen={showChangeStatusModal}
				onClose={() => setShowChangeStatusModal(false)}
				title='Change User Status'
			>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						confirmChangeStatus();
					}}
				>
					<div style={{ marginBottom: '16px' }}>
						<Typography gutterBottom>
							Current status for <strong>{userToChangeStatus?.username}</strong>
							:{' '}
							<Badge
								variant={
									userToChangeStatus
										? getStatusBadgeVariant(userToChangeStatus.status)
										: 'default'
								}
							>
								{userToChangeStatus?.status}
							</Badge>
						</Typography>
					</div>

					<div style={{ marginBottom: '16px' }}>
						<label
							htmlFor='new-status'
							style={{ display: 'block', marginBottom: '8px' }}
						>
							New Status
						</label>
						<Select
							id='new-status'
							value={newStatus}
							onChange={(e) => setNewStatus(e.target.value)}
							fullWidth
						>
							<option value='active'>Active</option>
							<option value='inactive'>Inactive</option>
							<option value='pending'>Pending</option>
							<option value='suspended'>Suspended</option>
						</Select>
					</div>

					<div style={{ marginBottom: '16px' }}>
						<label
							htmlFor='status-reason'
							style={{ display: 'block', marginBottom: '8px' }}
						>
							Reason for Change (optional)
						</label>
						<Input
							id='status-reason'
							as='textarea'
							rows={3}
							value={statusChangeReason}
							onChange={(e) => setStatusChangeReason(e.target.value)}
							placeholder='Add a note explaining why the status was changed'
							fullWidth
						/>
					</div>

					<Flex justifyContent='end' gap='md' style={{ marginTop: '20px' }}>
						<Button
							variant='secondary'
							onClick={() => setShowChangeStatusModal(false)}
						>
							Cancel
						</Button>
						<Button variant='primary' type='submit'>
							Change Status
						</Button>
					</Flex>
				</form>
			</Modal>
		</UsersContainer>
	);
};

export default UserManagement;
