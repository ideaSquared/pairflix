import { Button } from '@pairflix/components';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../hooks/useAuth';
import { auth } from '../../services/api';

const DevContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 300px;
`;

const DevCardWrapper = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
`;

const DevHeader = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  margin: ${({ theme }) =>
    `-${theme.spacing.md} -${theme.spacing.md} ${theme.spacing.sm} -${theme.spacing.md}`};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: ${({ theme }) =>
    `${theme.borderRadius.sm} ${theme.borderRadius.sm} 0 0`};
`;

const UserGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const QuickLoginButton = styled(Button)`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  padding: ${({ theme }) => theme.spacing.xs};
  min-height: auto;
`;

const StatusBadge = styled.span<{ status: string }>`
  font-size: 10px;
  padding: 2px 4px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  margin-left: 4px;
  background: ${({ status, theme }) => {
    switch (status) {
      case 'active':
        return theme.colors.text.success;
      case 'banned':
        return theme.colors.text.error;
      case 'suspended':
        return theme.colors.text.warning;
      case 'admin':
        return theme.colors.primary;
      default:
        return theme.colors.text.secondary;
    }
  }};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ToggleButton = styled(Button)`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  padding: ${({ theme }) => theme.spacing.xs};
  min-height: auto;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const LoadingText = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xs};
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.text.error};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs};
  background: ${({ theme }) => theme.colors.text.error}20;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const DevTip = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs};
  background: ${({ theme }) => theme.colors.background.hover};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const QuickLoginHeader = styled.div`
  font-size: 14px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const DevContent = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
`;

const EtherealSection = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
  margin-top: ${({ theme }) => theme.spacing.sm};
  padding-top: ${({ theme }) => theme.spacing.sm};
`;

const EtherealHeader = styled.div`
  font-size: 14px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CredentialRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
`;

const CredentialLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const CredentialValue = styled.span`
  font-family: monospace;
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.background.hover};
  padding: 2px 4px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 10px;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EtherealButton = styled(Button)`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  padding: ${({ theme }) => theme.spacing.xs};
  min-height: auto;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const CopyButton = styled(Button)`
  font-size: 10px;
  padding: 2px 6px;
  min-height: auto;
  margin-left: 4px;
`;

interface TestUser {
  email: string;
  username: string;
  status: string;
  description: string;
}

interface EtherealCredentials {
  user: string;
  pass: string;
  previewUrl: string;
}

interface EtherealCredentialsResponse {
  message: string;
  credentials: EtherealCredentials | null;
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
  const [showEthereal, setShowEthereal] = useState(false);
  const [etherealCredentials, setEtherealCredentials] =
    useState<EtherealCredentials | null>(null);
  const [etherealLoading, setEtherealLoading] = useState(false);
  const [etherealError, setEtherealError] = useState('');

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

  const fetchEtherealCredentials = async () => {
    setEtherealLoading(true);
    setEtherealError('');

    try {
      console.log('Fetching Ethereal credentials...');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const fullUrl = `${apiUrl}/api/email/ethereal-credentials`;
      console.log('Full URL:', fullUrl);

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      console.log('Response status:', response.status);
      console.log(
        'Response headers:',
        Object.fromEntries(response.headers.entries())
      );

      // Get the raw response text first to debug
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        // Try to parse as JSON, fallback to text error
        let errorMessage = 'Failed to fetch credentials';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Parse the response as JSON
      const data: EtherealCredentialsResponse = JSON.parse(responseText);
      setEtherealCredentials(data.credentials);
    } catch (err) {
      console.error('Error fetching credentials:', err);
      setEtherealError(
        err instanceof Error ? err.message : 'Failed to fetch credentials'
      );
    } finally {
      setEtherealLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const openEtherealLogin = () => {
    if (etherealCredentials?.previewUrl) {
      window.open(etherealCredentials.previewUrl, '_blank');
    }
  };

  return (
    <DevContainer>
      <DevCardWrapper>
        <DevHeader>🚀 Dev Login</DevHeader>

        <DevContent>
          <ToggleButton
            variant="secondary"
            onClick={() => setIsExpanded(!isExpanded)}
            isFullWidth
          >
            {isExpanded ? 'Hide Users' : 'Show Test Users'}
          </ToggleButton>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          {isLoading && <LoadingText>Logging in...</LoadingText>}

          {isExpanded && !isLoading && (
            <>
              <QuickLoginHeader>
                Quick Login (password: password123)
              </QuickLoginHeader>

              <UserGrid>
                {testUsers.map(user => (
                  <QuickLoginButton
                    key={user.email}
                    variant="secondary"
                    onClick={() => handleQuickLogin(user.email, user.username)}
                    title={`Login as ${user.description}`}
                  >
                    {user.username}
                    <StatusBadge status={user.status}>
                      {user.status}
                    </StatusBadge>
                  </QuickLoginButton>
                ))}
              </UserGrid>

              <DevTip>
                💡 Different users have matches and different watchlists for
                testing
              </DevTip>
            </>
          )}

          <EtherealSection>
            <ToggleButton
              variant="secondary"
              onClick={() => setShowEthereal(!showEthereal)}
              isFullWidth
            >
              {showEthereal
                ? 'Hide Ethereal Credentials'
                : 'Show Ethereal Credentials'}
            </ToggleButton>

            {showEthereal && (
              <>
                <EtherealHeader>📧 Test Email Server</EtherealHeader>

                {etherealError && <ErrorMessage>{etherealError}</ErrorMessage>}

                {!etherealCredentials && !etherealLoading && (
                  <EtherealButton
                    variant="secondary"
                    onClick={fetchEtherealCredentials}
                    isFullWidth
                  >
                    Fetch Credentials
                  </EtherealButton>
                )}

                {etherealLoading && (
                  <LoadingText>Fetching credentials...</LoadingText>
                )}

                {etherealCredentials && (
                  <>
                    <CredentialRow>
                      <CredentialLabel>Username:</CredentialLabel>
                      <CredentialValue>
                        {etherealCredentials.user}
                      </CredentialValue>
                      <CopyButton
                        variant="secondary"
                        onClick={() =>
                          copyToClipboard(etherealCredentials.user)
                        }
                      >
                        Copy
                      </CopyButton>
                    </CredentialRow>

                    <CredentialRow>
                      <CredentialLabel>Password:</CredentialLabel>
                      <CredentialValue>
                        {etherealCredentials.pass}
                      </CredentialValue>
                      <CopyButton
                        variant="secondary"
                        onClick={() =>
                          copyToClipboard(etherealCredentials.pass)
                        }
                      >
                        Copy
                      </CopyButton>
                    </CredentialRow>

                    <EtherealButton
                      variant="primary"
                      onClick={openEtherealLogin}
                      isFullWidth
                    >
                      🔗 Open Ethereal Mail
                    </EtherealButton>

                    <DevTip>
                      💡 Use these credentials to view test emails at{' '}
                      <a
                        href="https://ethereal.email"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        ethereal.email
                      </a>
                    </DevTip>
                  </>
                )}

                {!etherealCredentials && !etherealLoading && !etherealError && (
                  <DevTip>
                    💡 Click "Fetch Credentials" to get your test email server
                    login details
                  </DevTip>
                )}
              </>
            )}
          </EtherealSection>
        </DevContent>
      </DevCardWrapper>
    </DevContainer>
  );
};

export default DevLogin;
