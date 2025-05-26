import React, { useEffect, useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import styled from 'styled-components';
import { Button } from '../../../../components/common/Button';
import { Flex } from '../../../../components/common/Layout';
import { Loading } from '../../../../components/common/Loading';
import { Pagination } from '../../../../components/common/Pagination';
import { H1, Typography } from '../../../../components/common/Typography';
import { admin } from '../../../../services/api';
import {
	BanUserModal,
	ChangeRoleModal,
	ChangeStatusModal,
	CreateUserModal,
	EditUserModal,
	ErrorMessage,
	IconStyle,
	ResetPasswordModal,
	SuccessMessage,
	User,
	UserActivity,
	UserActivityModal,
	UserFilter,
	UserManagementFilters,
	UserRole,
	UserStatus,
	UserTable,
	notImplemented,
} from './user-management';

// Styled components
const UserManagementContainer = styled.div`
	padding-bottom: ${({ theme }) => theme.spacing.xl};
`;

const UserManagementContent: React.FC = () => {
	// State for user data
	const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	// State for search and filters
	const [search, setSearch] = useState('');
	const [filters, setFilters] = useState<UserManagementFilters>({
		roleFilter: '',
		statusFilter: '',
		sortBy: 'created_at',
		sortOrder: 'desc',
	});

	// Modal states
	const [showEditModal, setShowEditModal] = useState(false);
	const [userToEdit, setUserToEdit] = useState<User | null>(null);

	const [showCreateUserModal, setShowCreateUserModal] = useState(false);

	const [showBanModal, setShowBanModal] = useState(false);
	const [userToBan, setUserToBan] = useState<User | null>(null);
	const [banReason, setBanReason] = useState('');

	const [showActivityModal, setShowActivityModal] = useState(false);
	const [userForActivity, setUserForActivity] = useState<User | null>(null);
	const [userActivity, setUserActivity] = useState<UserActivity[]>([]);

	const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
	const [userToResetPassword, setUserToResetPassword] = useState<User | null>(
		null
	);
	const [newPassword, setNewPassword] = useState('');

	// States for role management
	const [showRoleModal, setShowRoleModal] = useState(false);
	const [userToChangeRole, setUserToChangeRole] = useState<User | null>(null);
	const [newRole, setNewRole] = useState<UserRole>('user');
	const [roleChangeReason, setRoleChangeReason] = useState('');

	// States for status management
	const [showStatusModal, setShowStatusModal] = useState(false);
	const [userToChangeStatus, setUserToChangeStatus] = useState<User | null>(
		null
	);
	const [newStatus, setNewStatus] = useState<UserStatus>('active');
	const [statusChangeReason, setStatusChangeReason] = useState('');

	// Success/Error message states
	const [successMessage, setSuccessMessage] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	// Load users when filters or pagination changes
	useEffect(() => {
		fetchUsers();
	}, [
		page,
		search,
		filters.roleFilter,
		filters.statusFilter,
		filters.sortBy,
		filters.sortOrder,
	]);

	// Clear success message after 3 seconds
	useEffect(() => {
		if (successMessage) {
			const timer = setTimeout(() => {
				setSuccessMessage('');
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [successMessage]);

	// Clear error message after 5 seconds
	useEffect(() => {
		if (errorMessage) {
			const timer = setTimeout(() => {
				setErrorMessage('');
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [errorMessage]);

	// Fetch users from the API
	const fetchUsers = async () => {
		try {
			setIsLoading(true);

			// Call the admin API
			const response = await admin.getUsers({
				limit: 10, // items per page
				offset: (page - 1) * 10, // calculate offset based on page number
				...(search ? { search } : {}),
				...(filters.roleFilter ? { role: filters.roleFilter } : {}),
				...(filters.statusFilter ? { status: filters.statusFilter } : {}),
				...(filters.sortBy ? { sortBy: filters.sortBy } : {}),
				...(filters.sortOrder ? { sortOrder: filters.sortOrder } : {}),
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

	// Handler for search input changes
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(e.target.value);
		setPage(1); // Reset to first page on search
	};

	// Handler for filter changes
	const handleFilterChange = (
		name: keyof UserManagementFilters,
		value: string
	) => {
		setFilters((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// Apply filters
	const applyFilters = () => {
		setPage(1); // Reset to first page when applying filters
	};

	// Clear all filters
	const clearFilters = () => {
		setFilters({
			roleFilter: '',
			statusFilter: '',
			sortBy: 'created_at',
			sortOrder: 'desc',
		});
		setPage(1);
	};

	// Edit user handlers
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
			const response = await admin.getUser(userId);
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

	// Ban user handlers
	const handleBanUser = (user: User) => {
		setUserToBan(user);
		setBanReason('');
		setShowBanModal(true);
	};

	const confirmBanUser = async () => {
		if (!userToBan) return;

		try {
			// Call the admin API to ban the user
			await admin.changeUserStatus(userToBan.id, 'banned', banReason);

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

	// Save user changes
	const saveUserChanges = async (updatedUser: User) => {
		try {
			// Call the admin API to update the user
			await admin.updateUser(updatedUser.id, {
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

	// View user activity
	const handleViewActivity = async (user: User) => {
		setUserForActivity(user);
		setUserActivity([]);

		try {
			// Fetch activity for this user
			const response = await admin.activity.getUserActivities({ userId: user.id });
			setUserActivity(response.activities || []);
			setShowActivityModal(true);
		} catch (error) {
			console.error('Error fetching user activity:', error);
			setErrorMessage('Failed to fetch user activity. Please try again.');
		}
	};

	// User status management handlers
	const unbanUser = async (user: User) => {
		try {
			// Call the admin API to unban the user
			await admin.updateUser(user.id, {
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
			await admin.updateUser(user.id, {
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
			await admin.updateUser(user.id, {
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

	// Reset password handler
	const handleResetPassword = (user: User) => {
		setUserToResetPassword(user);
		setNewPassword('');
		setShowResetPasswordModal(true);
	};

	const resetPassword = async () => {
		if (!userToResetPassword) return;

		try {
			// Call the admin API to reset the user's password
			const response = await admin.resetUserPassword(userToResetPassword.id);

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

	// Role management handler
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
			await admin.updateUser(userToChangeRole.id, {
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

	// Status management handler
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
			await admin.changeUserStatus(
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

	// Create user handler
	const handleCreateUser = async (userData: {
		username: string;
		email: string;
		password: string;
		role: UserRole;
		status: UserStatus;
	}) => {
		try {
			// Call the admin API to create a new user
			const response = await admin.createUser(userData);

			// Add the new user to the local state
			const newUser = {
				...response.user,
				id: response.user.user_id,
				// Convert timestamps and handle optional fields
				created_at: response.user.created_at,
				last_login: response.user.last_login || null,
			};

			setUsers([newUser as User, ...users]);
			setShowCreateUserModal(false);
			setSuccessMessage(`User ${userData.username} created successfully`);

			// Refresh the users list to get updated data
			fetchUsers();
		} catch (error) {
			console.error('Error creating user:', error);
			setErrorMessage('Failed to create user. Please try again.');
		}
	};

	return (
		<UserManagementContainer>
			<H1 gutterBottom>User Management</H1>
			<Flex
				justifyContent='space-between'
				alignItems='center'
				style={{ marginBottom: '1rem' }}
			>
				<Typography>View and manage user accounts and permissions</Typography>
				{/* <Button variant='primary' onClick={() => setShowCreateUserModal(true)}>
					<FiPlus style={IconStyle} /> Create User
				</Button> */}
			</Flex>

			<SuccessMessage message={successMessage} />
			<ErrorMessage message={errorMessage} />

			{/* Search and Filter Section */}
			<UserFilter
				search={search}
				onSearchChange={handleSearchChange}
				filters={filters}
				onFilterChange={handleFilterChange}
				onApplyFilters={applyFilters}
				onClearFilters={clearFilters}
				onCreateUser={() => setShowCreateUserModal(true)}
			/>

			{/* User Table */}
			{isLoading ? (
				<Loading message='Loading users...' />
			) : (
				<>
					<UserTable
						users={users}
						onEditUser={handleEditUser}
						onViewActivity={handleViewActivity}
						onResetPassword={handleResetPassword}
						onChangeRole={handleChangeRole}
						onChangeStatus={handleChangeStatus}
						onActivateUser={activateUser}
						onSuspendUser={suspendUser}
						onBanUser={handleBanUser}
					/>

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

			{/* Modals */}
			<EditUserModal
				isOpen={showEditModal}
				onClose={() => setShowEditModal(false)}
				user={userToEdit}
				onSave={saveUserChanges}
				setUserToEdit={setUserToEdit}
			/>

			<BanUserModal
				isOpen={showBanModal}
				onClose={() => setShowBanModal(false)}
				user={userToBan}
				onBan={confirmBanUser}
				banReason={banReason}
				setBanReason={setBanReason}
			/>

			<UserActivityModal
				isOpen={showActivityModal}
				onClose={() => setShowActivityModal(false)}
				user={userForActivity}
				activities={userActivity}
			/>

			<ResetPasswordModal
				isOpen={showResetPasswordModal}
				onClose={() => setShowResetPasswordModal(false)}
				user={userToResetPassword}
				onReset={resetPassword}
				newPassword={newPassword}
			/>
			<ChangeRoleModal
				isOpen={showRoleModal}
				onClose={() => setShowRoleModal(false)}
				user={userToChangeRole}
				newRole={newRole}
				setNewRole={setNewRole}
				roleChangeReason={roleChangeReason}
				setRoleChangeReason={setRoleChangeReason}
				onChangeRole={changeUserRole}
			/>

			<ChangeStatusModal
				isOpen={showStatusModal}
				onClose={() => setShowStatusModal(false)}
				user={userToChangeStatus}
				newStatus={newStatus}
				setNewStatus={setNewStatus}
				statusChangeReason={statusChangeReason}
				setStatusChangeReason={setStatusChangeReason}
				onChangeStatus={changeUserStatus}
			/>

			<CreateUserModal
				isOpen={showCreateUserModal}
				onClose={() => setShowCreateUserModal(false)}
				onSave={handleCreateUser}
			/>
		</UserManagementContainer>
	);
};

export default UserManagementContent;
