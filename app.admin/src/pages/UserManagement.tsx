import { Button, H1, Loading } from '@pairflix/components';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { admin } from '../services/api';
// Simple styled component for user cards
const UserGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const UserCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const UserHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${({ status, theme }) => {
    switch (status) {
      case 'active':
        return theme.colors.success.light;
      case 'suspended':
        return theme.colors.warning.light;
      case 'banned':
        return theme.colors.error.light;
      default:
        return theme.colors.secondary.light;
    }
  }};
  color: ${({ status, theme }) => {
    switch (status) {
      case 'active':
        return theme.colors.success.dark;
      case 'suspended':
        return theme.colors.warning.dark;
      case 'banned':
        return theme.colors.error.dark;
      default:
        return theme.colors.secondary.dark;
    }
  }};
`;

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'suspended' | 'banned' | 'pending' | 'inactive';
  created_at: string;
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
      <UserHeader>
        <H1>User Management</H1>
        <Button variant="primary">Add User</Button>
      </UserHeader>

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
        <UserGrid>
          {users.length > 0 ? (
            users.map(user => (
              <UserCard key={user.id}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px',
                  }}
                >
                  <h3 style={{ margin: 0 }}>{user.username}</h3>
                  <StatusBadge status={user.status}>{user.status}</StatusBadge>
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
              </UserCard>
            ))
          ) : (
            <div>No users found. Create one to get started.</div>
          )}
        </UserGrid>
      )}
    </div>
  );
};

export default UserManagement;
