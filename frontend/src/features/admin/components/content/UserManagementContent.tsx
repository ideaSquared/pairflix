import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Badge } from '../../../../components/common/Badge';
import { Button } from '../../../../components/common/Button';
import { Card } from '../../../../components/common/Card';
import {
	FilterGroup,
	FilterItem,
} from '../../../../components/common/FilterGroup';
import { Input } from '../../../../components/common/Input';
import { Flex } from '../../../../components/common/Layout';
import { Loading } from '../../../../components/common/Loading';
import { Modal } from '../../../../components/common/Modal';
import { Pagination } from '../../../../components/common/Pagination';
import { Select } from '../../../../components/common/Select';
import {
	Table,
	TableActionButton,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeaderCell,
	TableRow,
} from '../../../../components/common/Table';
import { Typography } from '../../../../components/common/Typography';
import api from '../../../../services/api';

// Types
type UserRole = 'user' | 'moderator' | 'admin';
type UserStatus = 'active' | 'suspended' | 'pending' | 'banned' | 'inactive';

interface User {
	id: string;
	user_id?: string;
	username: string;
	email: string;
	role: UserRole;
	status: UserStatus;
	name?: string;
	created_at: string;
	last_login: string | null;
}

// Styled components
const SearchContainer = styled.div`
	margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const getBadgeVariant = (
	status: UserStatus
): 'error' | 'warning' | 'info' | 'success' | 'default' => {
	switch (status) {
		case 'active':
			return 'success';
		case 'suspended':
			return 'warning';
		case 'pending':
			return 'info';
		case 'banned':
			return 'error';
		default:
			return 'default';
	}
};

const getRoleBadgeVariant = (
	role: UserRole
): 'error' | 'warning' | 'info' | 'success' | 'default' => {
	switch (role) {
		case 'admin':
			return 'error';
		case 'moderator':
			return 'warning';
		case 'user':
			return 'info';
		default:
			return 'default';
	}
};

const UserManagementContent: React.FC = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [search, setSearch] = useState('');
	const [roleFilter, setRoleFilter] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [sortBy, setSortBy] = useState('created_at');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

	// Modal states
	const [showEditModal, setShowEditModal] = useState(false);
	const [userToEdit, setUserToEdit] = useState<User | null>(null);
	const [showBanModal, setShowBanModal] = useState(false);
	const [userToBan, setUserToBan] = useState<User | null>(null);
	const [banReason, setBanReason] = useState('');
	const [showActivityModal, setShowActivityModal] = useState(false);
	const [userForActivity, setUserForActivity] = useState<User | null>(null);
	const [userActivity, setUserActivity] = useState<any[]>([]);

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

			// Call the admin API
			const response = await api.admin.getUsers({
				limit: 10, // items per page
				offset: (page - 1) * 10, // calculate offset based on page number
				...(search ? { search } : {}),
				...(roleFilter ? { role: roleFilter } : {}),
				...(statusFilter ? { status: statusFilter } : {}),
				...(sortBy ? { sortBy } : {}),
				...(sortOrder ? { sortOrder } : {}),
			});

			// Map the API response to match our User interface
			const processedUsers = response.users.map((user) => ({
				...user,
				id: user.user_id, // Use user_id from API as our id property
			}));

			setUsers(processedUsers as User[]);
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

	const handleBanUser = (user: User) => {
		setUserToBan(user);
		setBanReason('');
		setShowBanModal(true);
	};

	const banUser = async (user: User) => {
		if (!userToBan) return;

		try {
			// Call the admin API to ban the user
			await api.admin.changeUserStatus(userToBan.id, 'suspended', banReason);

			// Update user in local state
			setUsers(
				users.map((u) =>
					u.id === userToBan.id ? { ...u, status: 'suspended' } : u
				)
			);
			setShowBanModal(false);
			setUserToBan(null);
			setSuccessMessage(`User ${userToBan.username} has been suspended`);
		} catch (error) {
			console.error('Error banning user:', error);
			setErrorMessage('Failed to ban user. Please try again.');
		}
	};

	const confirmBanUser = async () => {
		if (!userToBan) return;
		await banUser(userToBan);
	};

	const saveUserChanges = async (updatedUser: User) => {
		try {
			// Call the admin API to update the user
			await api.admin.updateUser(updatedUser.id, {
				role: updatedUser.role,
				status: updatedUser.status,
			});

			// Update user in local state
			setUsers(
				users.map((user) => (user.id === updatedUser.id ? updatedUser : user))
			);
			setShowEditModal(false);
			setUserToEdit(null);
			setSuccessMessage(`User ${updatedUser.username} updated successfully`);
		} catch (error) {
			console.error('Error updating user:', error);
			setErrorMessage('Failed to update user. Please try again.');
		}
	};

	const handleViewActivity = async (user: User) => {
		setUserForActivity(user);
		setUserActivity([]);

		try {
			// Fetch activity for this user
			const response = await api.admin.getUserActivities({ userId: user.id });
			setUserActivity(response.activities || []);
			setShowActivityModal(true);
		} catch (error) {
			console.error('Error fetching user activity:', error);
			setErrorMessage('Failed to fetch user activity. Please try again.');
		}
	};

	const unbanUser = async (user: User) => {
		try {
			// Call the admin API to unban the user
			await api.admin.updateUser(user.id, {
				status: 'active',
				role: user.role,
			});

			// Update user in local state
			setUsers(
				users.map((u) => (u.id === user.id ? { ...u, status: 'active' } : u))
			);
			setSuccessMessage(`User ${user.username} has been unbanned`);
		} catch (error) {
			console.error('Error unbanning user:', error);
			setErrorMessage('Failed to unban user. Please try again.');
		}
	};

	const suspendUser = async (user: User) => {
		try {
			// Call the admin API to suspend the user
			await api.admin.updateUser(user.id, {
				status: 'suspended',
				role: user.role,
			});

			// Update user in local state
			setUsers(
				users.map((u) => (u.id === user.id ? { ...u, status: 'suspended' } : u))
			);
			setSuccessMessage(`User ${user.username} has been suspended`);
		} catch (error) {
			console.error('Error suspending user:', error);
			setErrorMessage('Failed to suspend user. Please try again.');
		}
	};

	const activateUser = async (user: User) => {
		try {
			// Call the admin API to activate the user
			await api.admin.updateUser(user.id, {
				status: 'active',
				role: user.role,
			});

			// Update user in local state
			setUsers(
				users.map((u) => (u.id === user.id ? { ...u, status: 'active' } : u))
			);
			setSuccessMessage(`User ${user.username} has been activated`);
		} catch (error) {
			console.error('Error activating user:', error);
			setErrorMessage('Failed to activate user. Please try again.');
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
		<>
			{renderSuccessMessage()}
			{renderErrorMessage()}

			<Flex
				justifyContent='space-between'
				alignItems='center'
				style={{ marginBottom: '20px' }}
			>
				<SearchContainer style={{ flex: 1 }}>
					<Input
						placeholder='Search users by name, username, or email...'
						value={search}
						onChange={handleSearchChange}
						type='search'
						fullWidth
					/>
				</SearchContainer>
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
						<option value='suspended'>Suspended</option>
						<option value='pending'>Pending</option>
						<option value='banned'>Banned</option>
					</Select>
				</FilterItem>

				<FilterItem label='Sort By'>
					<Select
						value={sortBy}
						onChange={(e) => setSortBy(e.target.value)}
						fullWidth
					>
						<option value='username'>Username</option>
						<option value='name'>Name</option>
						<option value='created_at'>Join Date</option>
						<option value='last_login'>Last Login</option>
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
										<TableHeaderCell>Username</TableHeaderCell>
										<TableHeaderCell>Name</TableHeaderCell>
										<TableHeaderCell>Email</TableHeaderCell>
										<TableHeaderCell>Role</TableHeaderCell>
										<TableHeaderCell>Status</TableHeaderCell>
										<TableHeaderCell>Joined</TableHeaderCell>
										<TableHeaderCell>Last Login</TableHeaderCell>
										<TableHeaderCell>Actions</TableHeaderCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{users.length === 0 ? (
										<TableRow>
											<TableCell colSpan={8} style={{ textAlign: 'center' }}>
												No users found
											</TableCell>
										</TableRow>
									) : (
										users.map((user) => (
											<TableRow key={user.id}>
												<TableCell>{user.username}</TableCell>
												<TableCell>{user.name}</TableCell>
												<TableCell>{user.email}</TableCell>
												<TableCell>
													<Badge variant={getRoleBadgeVariant(user.role)}>
														{user.role}
													</Badge>
												</TableCell>
												<TableCell>
													<Badge variant={getBadgeVariant(user.status)}>
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
															onClick={() => handleViewActivity(user)}
															title='View activity'
															variant='secondary'
														>
															<i className='fas fa-history'></i>
														</TableActionButton>

														{user.status === 'banned' ? (
															<TableActionButton
																onClick={() => unbanUser(user)}
																title='Unban user'
																variant='primary'
															>
																<i className='fas fa-user-check'></i>
															</TableActionButton>
														) : (
															<>
																{user.status === 'active' ? (
																	<TableActionButton
																		onClick={() => suspendUser(user)}
																		title='Suspend user'
																		variant='warning'
																	>
																		<i className='fas fa-user-clock'></i>
																	</TableActionButton>
																) : user.status === 'suspended' ||
																  user.status === 'pending' ? (
																	<TableActionButton
																		onClick={() => activateUser(user)}
																		title='Activate user'
																		variant='primary'
																	>
																		<i className='fas fa-user-check'></i>
																	</TableActionButton>
																) : null}

																<TableActionButton
																	variant='danger'
																	onClick={() => handleBanUser(user)}
																	title='Ban user'
																>
																	<i className='fas fa-user-slash'></i>
																</TableActionButton>
															</>
														)}
													</Flex>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</TableContainer>
					</Card>

					<Pagination
						currentPage={page}
						totalPages={totalPages}
						onPageChange={setPage}
					/>
				</>
			)}

			{/* Edit User Modal */}
			{userToEdit && (
				<Modal
					isOpen={showEditModal}
					onClose={() => setShowEditModal(false)}
					title='Edit User'
				>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							if (userToEdit) saveUserChanges(userToEdit);
						}}
					>
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
										role: e.target.value as UserRole,
									})
								}
								fullWidth
							>
								<option value='user'>User</option>
								<option value='moderator'>Moderator</option>
								<option value='admin'>Admin</option>
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
										status: e.target.value as UserStatus,
									})
								}
								fullWidth
							>
								<option value='active'>Active</option>
								<option value='suspended'>Suspended</option>
								<option value='pending'>Pending</option>
								<option value='banned'>Banned</option>
							</Select>
						</div>

						<div style={{ marginBottom: '16px' }}>
							<Typography style={{ fontWeight: 'bold', marginBottom: '8px' }}>
								User Information (Read-only)
							</Typography>
							<div style={{ marginBottom: '8px' }}>
								<span style={{ fontWeight: 'bold' }}>Username:</span>{' '}
								{userToEdit.username}
							</div>
							<div style={{ marginBottom: '8px' }}>
								<span style={{ fontWeight: 'bold' }}>Name:</span>{' '}
								{userToEdit.name}
							</div>
							<div>
								<span style={{ fontWeight: 'bold' }}>Email:</span>{' '}
								{userToEdit.email}
							</div>
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

			{/* Ban User Modal */}
			<Modal
				isOpen={showBanModal}
				onClose={() => setShowBanModal(false)}
				title='Ban User'
			>
				<Typography gutterBottom>
					Are you sure you want to ban <strong>{userToBan?.username}</strong>?
					This will prevent the user from logging in and using the platform.
				</Typography>

				<div style={{ marginBottom: '16px', marginTop: '16px' }}>
					<label
						htmlFor='ban-reason'
						style={{ display: 'block', marginBottom: '8px' }}
					>
						Reason for Ban
					</label>
					<Input
						id='ban-reason'
						as='textarea'
						rows={3}
						value={banReason}
						onChange={(e) => setBanReason(e.target.value)}
						placeholder='Explain why this user is being banned'
						fullWidth
					/>
				</div>

				<Flex justifyContent='end' gap='md' style={{ marginTop: '20px' }}>
					<Button variant='secondary' onClick={() => setShowBanModal(false)}>
						Cancel
					</Button>
					<Button variant='danger' onClick={confirmBanUser}>
						Ban User
					</Button>
				</Flex>
			</Modal>

			{/* View Activity Modal */}
			<Modal
				isOpen={showActivityModal}
				onClose={() => setShowActivityModal(false)}
				title='User Activity'
				size='large'
			>
				{userForActivity && (
					<>
						<div style={{ marginBottom: '20px' }}>
							<Typography variant='h4' gutterBottom>
								{userForActivity.name} ({userForActivity.username})
							</Typography>
							<Typography>Showing recent activity for this user</Typography>
						</div>

						{userActivity.length === 0 ? (
							<Typography>No activity found for this user.</Typography>
						) : (
							<Card>
								<TableContainer>
									<Table>
										<TableHead>
											<TableRow>
												<TableHeaderCell>Date</TableHeaderCell>
												<TableHeaderCell>Activity Type</TableHeaderCell>
												<TableHeaderCell>Details</TableHeaderCell>
												<TableHeaderCell>IP Address</TableHeaderCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{userActivity.map((activity) => (
												<TableRow key={activity.id}>
													<TableCell>
														{new Date(activity.timestamp).toLocaleString()}
													</TableCell>
													<TableCell>{activity.activity_type}</TableCell>
													<TableCell>{activity.details}</TableCell>
													<TableCell>{activity.ip_address}</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</TableContainer>
							</Card>
						)}

						<Flex justifyContent='end' gap='md' style={{ marginTop: '20px' }}>
							<Button
								variant='secondary'
								onClick={() => setShowActivityModal(false)}
							>
								Close
							</Button>
						</Flex>
					</>
				)}
			</Modal>
		</>
	);
};

export default UserManagementContent;
