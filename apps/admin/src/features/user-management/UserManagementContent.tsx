import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CompactPagination,
  DataTable,
  PageContainer,
  type TableColumn,
} from '@pairflix/components';
import { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';
import type { AdminUser } from '../../services/api/admin';
import * as styles from './UserManagementContent.css';
import UserActionsMenu from './UserActionsMenu';

// Define a type that extends AdminUser and satisfies Record<string, unknown>
type AdminUserRecord = AdminUser & Record<string, unknown>;

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
      <div className={styles.notificationContainer}>
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={styles.notificationItem({ type: notification.type })}
          >
            {notification.message}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className={styles.pageHeader}>
            <h2 className={styles.pageTitle}>User Management</h2>
            <Button
              variant="primary"
              onClick={() => {
                // TODO: Implement create user modal
              }}
            >
              Create User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className={styles.loadingIndicator}>Loading users...</div>
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
              <div className={styles.paginationWrapper}>
                <div className={styles.paginationInfo}>
                  Showing {pagination.offset + 1} to{' '}
                  {Math.min(pagination.offset + users.length, pagination.total)}{' '}
                  of {pagination.total} users
                </div>
                <CompactPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create user modal would go here */}
    </PageContainer>
  );
};

export default UserManagementContent;
