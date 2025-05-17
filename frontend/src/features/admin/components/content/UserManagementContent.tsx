import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
// Import the React Icons
import { FiDownload, FiEdit, FiKey, FiUserPlus } from 'react-icons/fi';
import {
	RiExchangeLine,
	RiHistoryLine,
	RiUserFollowLine,
	RiUserForbidLine,
	RiUserSettingsLine,
	RiUserUnfollowLine,
} from 'react-icons/ri';
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
import { H1, Typography } from '../../../../components/common/Typography';
import api from '../../../../services/api';

// Types
type UserRole = 'user' | 'moderator' | 'admin';
type UserStatus = 'active' | 'suspended' | 'pending' | 'inactive' | 'banned';

interface User {
	id: string;
	user_id?: string;
	username: string;
	email: string;
	role: UserRole;
	status: UserStatus;
	name?: string;
	created_at: string;
	last_login?: string | null; // Made last_login optional with ?
}

// Styled components
const UserManagementContainer = styled.div`
	padding-bottom: ${({ theme }) => theme.spacing.xl};
`;

const SearchContainer = styled.div`
	margin-bottom: ${({ theme }) => theme.spacing.md};
`;

// Styled component for password display
const PasswordDisplay = styled.div`
	margin: 20px 0;
	padding: 15px;
	background-color: #f8f9fa;
	border: 1px solid #dee2e6;
	border-radius: 4px;
	text-align: center;
	font-family: monospace;
	font-size: 18px;
`;

// Define a style for the icons
const IconStyle = { fontSize: '1.2rem' };

// Helper function for unimplemented features
const notImplemented = (feature: string) => {
	alert(`This feature (${feature}) isn't available yet.`);
};

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
		case 'inactive':
			return 'default';
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
	const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
	const [userToResetPassword, setUserToResetPassword] = useState<User | null>(
		null
	);
	const [newPassword, setNewPassword] = useState('');
	// New states for role management
	const [showRoleModal, setShowRoleModal] = useState(false);
	const [userToChangeRole, setUserToChangeRole] = useState<User | null>(null);
	const [newRole, setNewRole] = useState<UserRole>('user');
	const [roleChangeReason, setRoleChangeReason] = useState('');
	// New states for status management
	const [showStatusModal, setShowStatusModal] = useState(false);
	const [userToChangeStatus, setUserToChangeStatus] = useState<User | null>(
		null
	);
	const [newStatus, setNewStatus] = useState<UserStatus>('active');
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
		// Fetch the latest user data before editing to ensure we have up-to-date information
		fetchUserDetails(user.id)
			.then((updatedUser) => {
				setUserToEdit(updatedUser);
				setShowEditModal(true);
			})
			.catch((error) => {
				console.error('Error fetching user details:', error);
				setErrorMessage('Failed to load user details. Please try again.');
				// Fall back to the user data we already have if fetch fails
				setUserToEdit(user);
				setShowEditModal(true);
			});
	};

	// Function to fetch the latest user details
	const fetchUserDetails = async (userId: string): Promise<User> => {
		try {
			const response = await api.admin.getUser(userId);
			return {
				...response.user,
				id: response.user.user_id,
				// Ensure last_login is properly handled as optional
				last_login: response.user.last_login || null,
			} as User; // Use type assertion to ensure compatibility
		} catch (error) {
			console.error('Error fetching user details:', error);
			throw error;
		}
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
			await api.admin.changeUserStatus(userToBan.id, 'banned', banReason);

			// Update user in local state
			setUsers(
				users.map((u) =>
					u.id === userToBan.id ? { ...u, status: 'banned' } : u
				)
			);
			setShowBanModal(false);
			setUserToBan(null);
			setSuccessMessage(`User ${userToBan.username} has been banned`);
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

	const handleResetPassword = (user: User) => {
		setUserToResetPassword(user);
		setNewPassword('');
		setShowResetPasswordModal(true);
	};

	const resetPassword = async () => {
		if (!userToResetPassword) return;

		try {
			// Call the admin API to reset the user's password
			const response = await api.admin.resetUserPassword(
				userToResetPassword.id
			);

			// Set the new password in the state
			setNewPassword(response.newPassword);
			setSuccessMessage(
				`Password for ${userToResetPassword.username} has been reset`
			);
		} catch (error) {
			console.error('Error resetting password:', error);
			setErrorMessage('Failed to reset password. Please try again.');
		}
	};

	// Other handlers
	const handleChangeRole = (user: User) => {
		setUserToChangeRole(user);
		setNewRole(user.role); // Default to current role
		setRoleChangeReason('');
		setShowRoleModal(true);
	};

	const changeUserRole = async () => {
		if (!userToChangeRole || !newRole) return;

		try {
			// Call the admin API to update the user's role
			await api.admin.updateUser(userToChangeRole.id, {
				role: newRole,
				status: userToChangeRole.status,
			});

			// Update user in local state
			setUsers(
				users.map((user) =>
					user.id === userToChangeRole.id ? { ...user, role: newRole } : user
				)
			);
			setShowRoleModal(false);
			setUserToChangeRole(null);
			setSuccessMessage(
				`User ${userToChangeRole.username}'s role changed to ${newRole} successfully`
			);
		} catch (error) {
			console.error('Error changing user role:', error);
			setErrorMessage('Failed to change user role. Please try again.');
		}
	};

	const handleChangeStatus = (user: User) => {
		setUserToChangeStatus(user);
		setNewStatus(user.status); // Default to current status
		setStatusChangeReason('');
		setShowStatusModal(true);
	};

	const changeUserStatus = async () => {
		if (!userToChangeStatus || !newStatus) return;

		try {
			// Call the admin API to update the user's status
			await api.admin.changeUserStatus(
				userToChangeStatus.id,
				newStatus,
				statusChangeReason
			);

			// Update user in local state
			setUsers(
				users.map((user) =>
					user.id === userToChangeStatus.id
						? { ...user, status: newStatus }
						: user
				)
			);
			setShowStatusModal(false);
			setUserToChangeStatus(null);
			setSuccessMessage(
				`User ${userToChangeStatus.username}'s status changed to ${newStatus} successfully`
			);
		} catch (error) {
			console.error('Error changing user status:', error);
			setErrorMessage('Failed to change user status. Please try again.');
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
		<UserManagementContainer>
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
						placeholder='Search users by name, username, or email...'
						value={search}
						onChange={handleSearchChange}
						type='search'
						fullWidth
					/>
				</SearchContainer>
				<Button
					variant='primary'
					style={{ marginLeft: '20px' }}
					onClick={() => notImplemented('Create User')}
				>
					<FiUserPlus style={IconStyle} /> Create User
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
						<option value='suspended'>Suspended</option>
						<option value='pending'>Pending</option>
						<option value='inactive'>Inactive</option>
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
															<FiEdit style={IconStyle} />
														</TableActionButton>

														<TableActionButton
															onClick={() => handleViewActivity(user)}
															title='View activity'
															variant='secondary'
														>
															<RiHistoryLine style={IconStyle} />
														</TableActionButton>

														<TableActionButton
															onClick={() => handleResetPassword(user)}
															title='Reset password'
															variant='secondary'
														>
															<FiKey style={IconStyle} />
														</TableActionButton>

														<TableActionButton
															onClick={() => handleChangeRole(user)}
															title='Change role'
															variant='primary'
														>
															<RiUserSettingsLine style={IconStyle} />
														</TableActionButton>

														<TableActionButton
															onClick={() => handleChangeStatus(user)}
															title='Change status'
															variant='warning'
														>
															<RiExchangeLine style={IconStyle} />
														</TableActionButton>

														{user.status === 'suspended' ||
														user.status === 'banned' ? (
															<TableActionButton
																onClick={() => activateUser(user)}
																title='Activate user'
																variant='primary'
															>
																<RiUserFollowLine style={IconStyle} />
															</TableActionButton>
														) : (
															<>
																{user.status === 'active' ? (
																	<TableActionButton
																		onClick={() => suspendUser(user)}
																		title='Suspend user'
																		variant='warning'
																	>
																		<RiUserForbidLine style={IconStyle} />
																	</TableActionButton>
																) : user.status === 'pending' ||
																  user.status === 'inactive' ? (
																	<TableActionButton
																		onClick={() => activateUser(user)}
																		title='Activate user'
																		variant='primary'
																	>
																		<RiUserFollowLine style={IconStyle} />
																	</TableActionButton>
																) : null}

																<TableActionButton
																	variant='danger'
																	onClick={() => handleBanUser(user)}
																	title='Ban user'
																>
																	<RiUserUnfollowLine style={IconStyle} />
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

					<Flex justifyContent='end' gap='md' style={{ marginTop: '20px' }}>
						<Button
							variant='secondary'
							onClick={() => notImplemented('Export CSV')}
						>
							<FiDownload style={IconStyle} /> Export CSV
						</Button>
					</Flex>

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
								<option value='inactive'>Inactive</option>
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

			{/* Reset Password Modal */}
			<Modal
				isOpen={showResetPasswordModal}
				onClose={() => setShowResetPasswordModal(false)}
				title='Reset Password'
			>
				<Typography gutterBottom>
					Are you sure you want to reset the password for{' '}
					<strong>{userToResetPassword?.username}</strong>? This will generate a
					new password for the user.
				</Typography>

				{newPassword && (
					<PasswordDisplay>New Password: {newPassword}</PasswordDisplay>
				)}

				<Flex justifyContent='end' gap='md' style={{ marginTop: '20px' }}>
					<Button
						variant='secondary'
						onClick={() => setShowResetPasswordModal(false)}
					>
						Cancel
					</Button>
					<Button variant='primary' onClick={resetPassword}>
						Reset Password
					</Button>
				</Flex>
			</Modal>

			{/* Role Management Modal */}
			<Modal
				isOpen={showRoleModal}
				onClose={() => setShowRoleModal(false)}
				title='Change User Role'
			>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						changeUserRole();
					}}
				>
					<div style={{ marginBottom: '16px' }}>
						<Typography gutterBottom>
							Current role for <strong>{userToChangeRole?.username}</strong>:{' '}
							<Badge
								variant={
									userToChangeRole
										? getRoleBadgeVariant(userToChangeRole.role)
										: 'default'
								}
							>
								{userToChangeRole?.role}
							</Badge>
						</Typography>
					</div>

					<div style={{ marginBottom: '16px' }}>
						<label
							htmlFor='new-role'
							style={{ display: 'block', marginBottom: '8px' }}
						>
							New Role
						</label>
						<Select
							id='new-role'
							value={newRole}
							onChange={(e) => setNewRole(e.target.value as UserRole)}
							fullWidth
						>
							<option value='user'>User</option>
							<option value='moderator'>Moderator</option>
							<option value='admin'>Admin</option>
						</Select>
					</div>

					<div style={{ marginBottom: '16px' }}>
						<label
							htmlFor='role-reason'
							style={{ display: 'block', marginBottom: '8px' }}
						>
							Reason for Change (optional)
						</label>
						<Input
							id='role-reason'
							as='textarea'
							rows={3}
							value={roleChangeReason}
							onChange={(e) => setRoleChangeReason(e.target.value)}
							placeholder='Add a note explaining why the role was changed'
							fullWidth
						/>
					</div>

					<Flex justifyContent='end' gap='md' style={{ marginTop: '20px' }}>
						<Button variant='secondary' onClick={() => setShowRoleModal(false)}>
							Cancel
						</Button>
						<Button variant='primary' type='submit'>
							Change Role
						</Button>
					</Flex>
				</form>
			</Modal>

			{/* Status Management Modal */}
			<Modal
				isOpen={showStatusModal}
				onClose={() => setShowStatusModal(false)}
				title='Change User Status'
			>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						changeUserStatus();
					}}
				>
					<div style={{ marginBottom: '16px' }}>
						<Typography gutterBottom>
							Current status for <strong>{userToChangeStatus?.username}</strong>
							:{' '}
							<Badge
								variant={
									userToChangeStatus
										? getBadgeVariant(userToChangeStatus.status)
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
							onChange={(e) => setNewStatus(e.target.value as UserStatus)}
							fullWidth
						>
							<option value='active'>Active</option>
							<option value='suspended'>Suspended</option>
							<option value='pending'>Pending</option>
							<option value='inactive'>Inactive</option>
							<option value='banned'>Banned</option>
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
							onClick={() => setShowStatusModal(false)}
						>
							Cancel
						</Button>
						<Button variant='primary' type='submit'>
							Change Status
						</Button>
					</Flex>
				</form>
			</Modal>
		</UserManagementContainer>
	);
};

export default UserManagementContent;
