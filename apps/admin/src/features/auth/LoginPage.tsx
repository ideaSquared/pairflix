import {
  Button,
  Card,
  CardContent,
  Container,
  ErrorText,
  H2,
  Input,
  InputGroup,
} from '@pairflix/components';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import * as styles from './LoginPage.css';
import { auth } from '../../services/api';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [needsTotp, setNeedsTotp] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await auth.login({ email, password, totpCode: totpCode || undefined });
      checkAuth();
      navigate('/', { replace: true });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Login failed. Please check your credentials and try again.';

      if (message === 'TOTP code required') {
        setNeedsTotp(true);
        setError('Enter your 2FA code');
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    email.trim() && password.trim() && (!needsTotp || totpCode.trim());

  return (
    <Container className={styles.loginContainer} maxWidth="sm">
      <Card className={styles.loginCard}>
        <CardContent>
          <form className={styles.loginForm} onSubmit={handleSubmit}>
            <H2 gutterBottom>Admin Login</H2>

            {error && <ErrorText gutterBottom>{error}</ErrorText>}

            <InputGroup isFullWidth>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                isFullWidth
                disabled={isLoading}
                autoComplete="username"
              />
            </InputGroup>

            <InputGroup isFullWidth>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                isFullWidth
                disabled={isLoading}
                autoComplete="current-password"
              />
            </InputGroup>

            {needsTotp && (
              <InputGroup isFullWidth>
                <Input
                  type="text"
                  placeholder="6-digit code or backup code"
                  value={totpCode}
                  onChange={e => setTotpCode(e.target.value)}
                  required
                  isFullWidth
                  disabled={isLoading}
                  autoComplete="one-time-code"
                />
              </InputGroup>
            )}

            <Button
              type="submit"
              variant="primary"
              isFullWidth
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default LoginPage;
