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
import { admin } from '../../services/api';
import type {
  AdminUserSummary,
  UserRole,
  UserStatus,
} from '../../services/api/admin';
import CreateUserModal from './CreateUserModal';
import * as styles from './UserManagementContent.css';
import UserActionsMenu from './UserActionsMenu';

// Define a type that extends AdminUserSummary and satisfies Record<string, unknown>
type AdminUserRecord = AdminUserSummary & Record<string, unknown>;

// Simple notification system
interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error';
}

const UserManagementContent = () => {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  // Derived rather than tracked separately -- limit is fixed, so this can't drift out of
  // sync with total the way a second piece of state (updated in every total-changing handler) could.
  const totalPages = Math.ceil(total / limit);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationCounter, setNotificationCounter] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const addNotification = useCallback(
    (message: string, type: 'success' | 'error') => {
      const id = notificationCounter + 1;
      setNotificationCounter(id);
      setNotifications(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
    },
    [notificationCounter]
  );

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await admin.users.list({ page, limit });
        setUsers(response.data);
        setTotal(response.pagination.total);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        addNotification('Failed to load users.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, limit, addNotification]);

  const handleStatusChange = async (
    userId: string,
    status: UserStatus,
    reason?: string
  ) => {
    try {
      await admin.users.changeStatus(userId, status, reason);
      setUsers(prev =>
        prev.map(user => (user.id === userId ? { ...user, status } : user))
      );
      addNotification(`User status changed to ${status}.`, 'success');
    } catch (error) {
      console.error('Failed to change user status:', error);
      addNotification('Failed to change user status.', 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await admin.users.remove(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
      setTotal(prev => prev - 1);
      addNotification('User deleted successfully.', 'success');
    } catch (error) {
      console.error('Failed to delete user:', error);
      addNotification('Failed to delete user.', 'error');
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      await admin.users.resetPassword(userId);
      addNotification('Password reset email sent.', 'success');
    } catch (error) {
      console.error('Failed to reset password:', error);
      addNotification('Failed to send password reset email.', 'error');
    }
  };

  const handleCreateUser = async (data: {
    username: string;
    email: string;
    password: string;
    role: UserRole;
    status: UserStatus;
  }) => {
    const created = await admin.users.create(data);
    setUsers(prev => [created, ...prev]);
    setTotal(prev => prev + 1);
    setShowCreateModal(false);
    addNotification('User created successfully.', 'success');
  };

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
      key: 'createdAt',
      header: 'Created At',
      render: createdAt => new Date(createdAt as string).toLocaleDateString(),
    },
  ];

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
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
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
                getRowId={row => row.id}
                rowActions={renderActions}
                minWidth="1000px"
                aria-label="User management table"
                stickyHeader
              />
              {/* Pagination controls */}
              <div className={styles.paginationWrapper}>
                <div className={styles.paginationInfo}>
                  Showing {(page - 1) * limit + 1} to{' '}
                  {Math.min((page - 1) * limit + users.length, total)} of{' '}
                  {total} users
                </div>
                <CompactPagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateUser}
        />
      )}
    </PageContainer>
  );
};

export default UserManagementContent;
