import { Button, H1, Loading } from '@pairflix/components';
import React, { useEffect, useState } from 'react';
import * as styles from './UserManagement.css';
import { admin } from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'suspended' | 'banned' | 'pending' | 'inactive';
  created_at?: string;
  last_login?: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await admin.users.getAll({
          limit: 10,
          offset: 0,
        });

        // Process the users data
        const processedUsers = response.users.map(user => ({
          ...user,
          id: user.user_id || user.user_id,
          role: user.role as 'admin' | 'user' | 'moderator',
          status: user.status as
            'active' | 'suspended' | 'banned' | 'pending' | 'inactive',
        }));

        setUsers(processedUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div>
      <div className={styles.userHeader}>
        <H1>User Management</H1>
        <Button variant="primary">Add User</Button>
      </div>

      {error && (
        <div
          style={{
            padding: '10px',
            backgroundColor: '#ffeeee',
            color: '#d32f2f',
            borderRadius: '4px',
            marginBottom: '20px',
          }}
        >
          {error}
        </div>
      )}

      {isLoading ? (
        <Loading message="Loading users..." />
      ) : (
        <div className={styles.userGrid}>
          {users.length > 0 ? (
            users.map(user => (
              <div className={styles.userCard} key={user.id}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px',
                  }}
                >
                  <h3 style={{ margin: 0 }}>{user.username}</h3>
                  <span className={styles.statusBadge({ status: user.status })}>
                    {user.status}
                  </span>
                </div>
                <div style={{ marginBottom: '5px' }}>
                  <strong>Email:</strong> {user.email}
                </div>
                <div style={{ marginBottom: '5px' }}>
                  <strong>Role:</strong> {user.role}
                </div>
                <div style={{ marginBottom: '5px' }}>
                  <strong>Created:</strong> {formatDate(user.created_at)}
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Last Login:</strong> {formatDate(user.last_login)}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Button variant="secondary" size="small">
                    Edit
                  </Button>
                  {user.status === 'active' ? (
                    <Button variant="warning" size="small">
                      Suspend
                    </Button>
                  ) : user.status === 'suspended' ? (
                    <Button variant="success" size="small">
                      Activate
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div>No users found. Create one to get started.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
