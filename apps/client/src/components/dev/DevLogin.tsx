import { Button } from '@pairflix/components';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { auth } from '../../services/api';
import * as styles from './DevLogin.css';

interface TestUser {
  email: string;
  username: string;
  status: 'active' | 'banned' | 'suspended' | 'admin';
  description: string;
}

const testUsers: TestUser[] = [
  {
    email: 'useractive@example.com',
    username: 'useractive',
    status: 'active',
    description: 'Active user',
  },
  {
    email: 'userbanned@example.com',
    username: 'userbanned',
    status: 'banned',
    description: 'Banned user',
  },
  {
    email: 'usersuspended@example.com',
    username: 'usersuspended',
    status: 'suspended',
    description: 'Suspended user',
  },
  {
    email: 'admin@example.com',
    username: 'admin',
    status: 'admin',
    description: 'Admin user',
  },
  {
    email: 'user1@example.com',
    username: 'user1',
    status: 'active',
    description: 'User 1',
  },
  {
    email: 'user2@example.com',
    username: 'user2',
    status: 'active',
    description: 'User 2',
  },
  {
    email: 'user3@example.com',
    username: 'user3',
    status: 'active',
    description: 'User 3 (unverified)',
  },
  {
    email: 'user4@example.com',
    username: 'user4',
    status: 'suspended',
    description: 'User 4',
  },
  {
    email: 'user5@example.com',
    username: 'user5',
    status: 'active',
    description: 'User 5',
  },
  {
    email: 'user6@example.com',
    username: 'user6',
    status: 'active',
    description: 'User 6',
  },
  {
    email: 'user7@example.com',
    username: 'user7',
    status: 'banned',
    description: 'User 7',
  },
  {
    email: 'user8@example.com',
    username: 'user8',
    status: 'active',
    description: 'User 8 (unverified)',
  },
  {
    email: 'user9@example.com',
    username: 'user9',
    status: 'active',
    description: 'User 9',
  },
  {
    email: 'user10@example.com',
    username: 'user10',
    status: 'suspended',
    description: 'User 10',
  },
];

const DevLogin: React.FC = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Only show in development
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  const handleQuickLogin = async (email: string, username: string) => {
    setIsLoading(true);
    setError('');

    try {
      // All test users have the same password
      const { token } = await auth.login({
        email,
        password: 'password123',
      });

      localStorage.setItem('token', token);
      checkAuth();
      navigate('/watchlist');
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to login as ${username}: ${err.message}`);
      } else {
        setError(`Failed to login as ${username}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.devContainer}>
      <div className={styles.devCardWrapper}>
        <div className={styles.devHeader}>🚀 Dev Login</div>

        <div className={styles.devContent}>
          <Button
            className={styles.toggleButton}
            variant="secondary"
            onClick={() => setIsExpanded(!isExpanded)}
            isFullWidth
          >
            {isExpanded ? 'Hide Users' : 'Show Test Users'}
          </Button>

          {error && <div className={styles.errorMessage}>{error}</div>}

          {isLoading && <div className={styles.loadingText}>Logging in...</div>}

          {isExpanded && !isLoading && (
            <>
              <div className={styles.quickLoginHeader}>
                Quick Login (password: password123)
              </div>

              <div className={styles.userGrid}>
                {testUsers.map(user => (
                  <Button
                    className={styles.quickLoginButton}
                    key={user.email}
                    variant="secondary"
                    onClick={() => handleQuickLogin(user.email, user.username)}
                    title={`Login as ${user.description}`}
                  >
                    {user.username}
                    <span
                      className={styles.statusBadge({ status: user.status })}
                    >
                      {user.status}
                    </span>
                  </Button>
                ))}
              </div>

              <div className={styles.devTip}>
                💡 Different users have matches and different watchlists for
                testing
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DevLogin;
