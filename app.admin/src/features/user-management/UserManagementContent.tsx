import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CompactPagination,
} from '@pairflix/components';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import api from '../../services/api';
import { AdminUser } from '../../services/api/admin';
import UserActionsMenu from './UserActionsMenu';
// Import DataTable components
import { DataTable, TableColumn } from '@pairflix/components';

// Define a type that extends AdminUser and satisfies Record<string, unknown>
type AdminUserRecord = AdminUser & Record<string, unknown>;

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

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
`;

const PaginationInfo = styled.div`
  font-size: 14px;
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 100%;
`;

const UserManagementContent = () => {
  // State for users, pagination, loading, modal, and notifications
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationCounter, setNotificationCounter] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Add notification
  const addNotification = useCallback(
    (message: string, type: 'success' | 'error') => {
      const id = notificationCounter + 1;
      setNotificationCounter(id);
      const notification = {
        id,
        message,
        type,
      };
      setNotifications(prev => [...prev, notification]);
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
    },
    [notificationCounter]
  );

  // Load users on mount and when pagination changes
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await api.admin.users.getAll({
          limit: pagination.limit,
          offset: pagination.offset,
        });
        setUsers(response.users);
        setPagination({
          total: response.pagination.total,
          limit: response.pagination.limit,
          offset: response.pagination.offset,
          hasMore: response.pagination.hasMore,
        });
      } catch (error) {
        console.error('Failed to fetch users:', error);
        addNotification('Failed to load users.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [pagination.offset, pagination.limit, addNotification]);

  // Calculate total pages
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const newOffset = (newPage - 1) * pagination.limit;
    setPagination(prev => ({
      ...prev,
      offset: newOffset,
    }));
  };

  // Handle user status change
  const handleStatusChange = async (
    userId: string,
    status: 'active' | 'inactive' | 'suspended' | 'pending' | 'banned'
  ) => {
    try {
      await api.admin.users.changeStatus(userId, status);
      // Update the user in the local state
      setUsers(prev =>
        prev.map(user => (user.user_id === userId ? { ...user, status } : user))
      );
      addNotification(`User status changed to ${status}.`, 'success');
    } catch (error) {
      console.error('Failed to change user status:', error);
      addNotification('Failed to change user status.', 'error');
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    try {
      await api.admin.users.delete(userId);
      // Remove the user from local state
      setUsers(prev => prev.filter(user => user.user_id !== userId));
      addNotification('User deleted successfully.', 'success');
    } catch (error) {
      console.error('Failed to delete user:', error);
      addNotification('Failed to delete user.', 'error');
    }
  };

  // Handle password reset
  const handleResetPassword = async (userId: string) => {
    try {
      await api.admin.users.resetPassword(userId);
      addNotification('Password reset email sent.', 'success');
    } catch (error) {
      console.error('Failed to reset password:', error);
      addNotification('Failed to send password reset email.', 'error');
    }
  };

  // Define columns with type safety
  const columns: TableColumn<AdminUserRecord>[] = [
    {
      key: 'username',
      header: 'Username',
    },
    {
      key: 'email',
      header: 'Email',
    },
    {
      key: 'role',
      header: 'Role',
    },
    {
      key: 'status',
      header: 'Status',
    },
    {
      key: 'created_at',
      header: 'Created At',
      render: created_at => new Date(created_at as string).toLocaleDateString(),
    },
  ];

  // Define row actions for the DataTable
  const renderActions = (user: AdminUserRecord) => (
    <UserActionsMenu
      user={user}
      onStatusChange={handleStatusChange}
      onDelete={handleDeleteUser}
      onResetPassword={handleResetPassword}
    />
  );

  return (
    <PageContainer>
      {/* Notifications */}
      <NotificationContainer>
        {notifications.map(notification => (
          <NotificationItem key={notification.id} type={notification.type}>
            {notification.message}
          </NotificationItem>
        ))}
      </NotificationContainer>

      <Card>
        <CardHeader>
          <PageHeader>
            <PageTitle>User Management</PageTitle>
            <Button
              variant="primary"
              onClick={() => {
                // TODO: Implement create user modal
                console.log('Create user functionality coming soon');
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
              {' '}
              <DataTable<AdminUserRecord>
                columns={columns}
                data={users as AdminUserRecord[]}
                emptyMessage="No users found"
                getRowId={row => row.user_id}
                rowActions={renderActions}
                minWidth="1000px"
                aria-label="User management table"
                stickyHeader
              />
              {/* Pagination controls */}
              <PaginationWrapper>
                <PaginationInfo>
                  Showing {pagination.offset + 1} to{' '}
                  {Math.min(pagination.offset + users.length, pagination.total)}{' '}
                  of {pagination.total} users
                </PaginationInfo>
                <CompactPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </PaginationWrapper>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create user modal would go here */}
    </PageContainer>
  );
};

export default UserManagementContent;
