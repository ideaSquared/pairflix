import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../components/common/Button';
import { Card, CardContent, CardHeader } from '../../components/common/Card';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeaderCell,
	TableRow,
} from '../../components/common/Table';
import api from '../../services/api';
import { AdminUser } from '../../services/api/admin';
import UserActionsMenu from './UserActionsMenu';

// Custom notification component
const NotificationContainer = styled.div`
	position: fixed;
	top: 20px;
	right: 20px;
	z-index: 1000;
`;

const NotificationItem = styled.div<{ type: 'success' | 'error' }>`
	background-color: ${({ type, theme }) =>
		type === 'success' ? theme.colors.text.success : theme.colors.text.error};
	color: white;
	padding: 12px 20px;
	border-radius: 4px;
	margin-bottom: 10px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	animation: fadeIn 0.3s ease-in-out;

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
`;

// Simple notification system
interface Notification {
	id: number;
	message: string;
	type: 'success' | 'error';
}

// Interface for pagination structure from API
interface PaginationInfo {
	total: number;
	limit: number;
	offset: number;
	hasMore: boolean;
}

const PageContainer = styled.div`
	height: 100%;
	width: 100%;
	padding: 16px;
`;

const PageHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16px;
`;

const PageTitle = styled.h2`
	font-size: 24px;
	margin: 0;
`;

const PaginationContainer = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 16px;
`;

const PaginationInfo = styled.div`
	font-size: 14px;
`;

const PaginationButtons = styled.div`
	display: flex;
	gap: 8px;
`;

const LoadingIndicator = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	height: 200px;
`;

const UserManagementContent = () => {
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [pagination, setPagination] = useState<PaginationInfo>({
		total: 0,
		limit: 10,
		offset: 0,
		hasMore: false,
	});
	const [notifications, setNotifications] = useState<Notification[]>([]);

	// Helper function for notifications
	const addNotification = (message: string, type: 'success' | 'error') => {
		const id = Date.now();
		setNotifications((prev) => [...prev, { id, message, type }]);

		// Auto remove after 5 seconds
		setTimeout(() => {
			setNotifications((prev) =>
				prev.filter((notification) => notification.id !== id)
			);
		}, 5000);
	};

	const fetchUsers = async () => {
		try {
			const response = await api.admin.users.getAll({
				limit: pagination.limit,
				offset: pagination.offset,
			});

			if (response && response.users) {
				setUsers(response.users);
				if (response.pagination) {
					setPagination(response.pagination);
				}
			} else {
				console.error('Unexpected API response structure:', response);
				addNotification('Unexpected data format from server', 'error');
			}
		} catch (error) {
			addNotification('Failed to fetch users', 'error');
			console.error('Error fetching users:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, [pagination.limit, pagination.offset]);

	const handleStatusChange = async (
		userId: string,
		newStatus: AdminUser['status'],
		reason?: string
	) => {
		try {
			await api.admin.users.changeStatus(userId, newStatus, reason);
			await fetchUsers();
			addNotification('User status updated successfully', 'success');
		} catch (error) {
			addNotification('Failed to update user status', 'error');
			console.error('Error updating user status:', error);
		}
	};

	const handleDeleteUser = async (userId: string) => {
		try {
			await api.admin.users.delete(userId);
			await fetchUsers();
			addNotification('User deleted successfully', 'success');
		} catch (error) {
			addNotification('Failed to delete user', 'error');
			console.error('Error deleting user:', error);
		}
	};

	const handleResetPassword = async (userId: string) => {
		try {
			const response = await api.admin.users.resetPassword(userId);
			addNotification(
				`Password reset successfully. New password: ${response.newPassword}`,
				'success'
			);
		} catch (error) {
			addNotification('Failed to reset password', 'error');
			console.error('Error resetting password:', error);
		}
	};

	const handlePageChange = (newOffset: number) => {
		setPagination((prev) => ({
			...prev,
			offset: newOffset,
		}));
	};

	const handleLimitChange = (newLimit: number) => {
		setPagination((prev) => ({
			...prev,
			limit: newLimit,
			offset: 0, // Reset to first page when changing page size
		}));
	};

	return (
		<PageContainer>
			<Card>
				<CardHeader>
					<PageHeader>
						<PageTitle>User Management</PageTitle>
						<Button
							variant='primary'
							onClick={() => {
								/* TODO: Implement create user dialog */
							}}
						>
							Create User
						</Button>
					</PageHeader>
				</CardHeader>
				<CardContent>
					{loading ? (
						<LoadingIndicator>Loading users...</LoadingIndicator>
					) : (
						<>
							<TableContainer>
								<Table>
									<TableHead>
										<TableRow>
											<TableHeaderCell>Username</TableHeaderCell>
											<TableHeaderCell>Email</TableHeaderCell>
											<TableHeaderCell>Role</TableHeaderCell>
											<TableHeaderCell>Status</TableHeaderCell>
											<TableHeaderCell>Created At</TableHeaderCell>
											<TableHeaderCell>Actions</TableHeaderCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{users.length > 0 ? (
											users.map((user) => (
												<TableRow key={user.user_id}>
													<TableCell>{user.username}</TableCell>
													<TableCell>{user.email}</TableCell>
													<TableCell>{user.role}</TableCell>
													<TableCell>{user.status}</TableCell>
													<TableCell>
														{new Date(user.created_at).toLocaleDateString()}
													</TableCell>
													<TableCell>
														<UserActionsMenu
															user={user}
															onStatusChange={handleStatusChange}
															onDelete={handleDeleteUser}
															onResetPassword={handleResetPassword}
														/>
													</TableCell>
												</TableRow>
											))
										) : (
											<TableRow>
												<TableCell colSpan={6} align='center'>
													No users found
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</TableContainer>

							<PaginationContainer>
								<PaginationInfo>
									Showing {Math.min(pagination.offset + 1, pagination.total)} to{' '}
									{Math.min(
										pagination.offset + pagination.limit,
										pagination.total
									)}{' '}
									of {pagination.total} users
								</PaginationInfo>
								<PaginationButtons>
									<Button
										variant='secondary'
										size='small'
										disabled={pagination.offset === 0}
										onClick={() =>
											handlePageChange(
												Math.max(0, pagination.offset - pagination.limit)
											)
										}
									>
										Previous
									</Button>
									<Button
										variant='secondary'
										size='small'
										disabled={
											pagination.offset + pagination.limit >= pagination.total
										}
										onClick={() =>
											handlePageChange(pagination.offset + pagination.limit)
										}
									>
										Next
									</Button>
								</PaginationButtons>
							</PaginationContainer>
						</>
					)}
				</CardContent>
			</Card>

			{/* Notifications */}
			<NotificationContainer>
				{notifications.map((notification) => (
					<NotificationItem key={notification.id} type={notification.type}>
						{notification.message}
					</NotificationItem>
				))}
			</NotificationContainer>
		</PageContainer>
	);
};

export default UserManagementContent;
