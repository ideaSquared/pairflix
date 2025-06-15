import {
  Alert,
  Button,
  Card,
  CardContent,
  Flex,
  Loading,
  Typography,
} from '@pairflix/components';
import React, { useState } from 'react';
import styled from 'styled-components';

// Styled components
const CredentialsContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const CredentialItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const CredentialLabel = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CredentialValue = styled.span`
  font-family: monospace;
  color: ${({ theme }) => theme.colors.text.secondary};
  background-color: ${({ theme }) => theme.colors.background.tertiary};
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const LoginButton = styled(Button)`
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

interface EtherealCredentials {
  user: string;
  pass: string;
  previewUrl: string;
}

interface EtherealCredentialsResponse {
  message: string;
  credentials: EtherealCredentials | null;
}

const EtherealCredentials: React.FC = () => {
  const [credentials, setCredentials] = useState<EtherealCredentials | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const fetchCredentials = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/email/ethereal-credentials', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch credentials');
      }

      const data: EtherealCredentialsResponse = await response.json();
      setCredentials(data.credentials);
      setIsVisible(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch credentials'
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
      console.log(`${label} copied to clipboard`);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const openEtherealLogin = () => {
    if (credentials?.previewUrl) {
      window.open(credentials.previewUrl, '_blank');
    }
  };

  // Check if we're in development environment
  const isDevelopment =
    process.env.NODE_ENV === 'development' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  if (!isDevelopment) {
    return null; // Don't show in production
  }

  return (
    <CredentialsContainer>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🧪 Development Email Testing
          </Typography>
          <Typography variant="body2" gutterBottom>
            Access your test email server credentials for development and
            testing.
          </Typography>

          {error && (
            <Alert variant="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {!isVisible && !loading && (
            <Button onClick={fetchCredentials} variant="secondary">
              Show Ethereal Mail Credentials
            </Button>
          )}

          {loading && <Loading message="Fetching credentials..." />}

          {credentials && isVisible && (
            <>
              <CredentialItem>
                <CredentialLabel>Username:</CredentialLabel>
                <Flex gap="sm" alignItems="center">
                  <CredentialValue>{credentials.user}</CredentialValue>
                  <Button
                    onClick={() =>
                      copyToClipboard(credentials.user, 'Username')
                    }
                  >
                    Copy
                  </Button>
                </Flex>
              </CredentialItem>

              <CredentialItem>
                <CredentialLabel>Password:</CredentialLabel>
                <Flex gap="sm" alignItems="center">
                  <CredentialValue>{credentials.pass}</CredentialValue>
                  <Button
                    onClick={() =>
                      copyToClipboard(credentials.pass, 'Password')
                    }
                  >
                    Copy
                  </Button>
                </Flex>
              </CredentialItem>

              <CredentialItem>
                <CredentialLabel>Web Interface:</CredentialLabel>
                <Flex gap="sm" alignItems="center">
                  <CredentialValue>{credentials.previewUrl}</CredentialValue>
                  <Button
                    onClick={() =>
                      copyToClipboard(credentials.previewUrl, 'Preview URL')
                    }
                  >
                    Copy
                  </Button>
                </Flex>
              </CredentialItem>

              <LoginButton onClick={openEtherealLogin} variant="primary">
                🔗 Open Ethereal Mail Login
              </LoginButton>

              <Typography
                variant="caption"
                style={{ marginTop: '8px', display: 'block' }}
              >
                Use these credentials to log into the Ethereal Email web
                interface and view test emails sent by the application.
              </Typography>
            </>
          )}

          {!credentials && isVisible && !loading && (
            <Alert variant="info">
              Email service not initialized yet. Try sending an email first to
              generate credentials.
            </Alert>
          )}
        </CardContent>
      </Card>
    </CredentialsContainer>
  );
};

export default EtherealCredentials;
