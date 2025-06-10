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
import styled from 'styled-components';
import { useAuth } from '../../hooks/useAuth';
import { auth } from '../../services/api';
import { ADMIN_TOKEN_KEY } from '../../services/api/utils';

const LoginContainer = styled(Container)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 400px;
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      const response = await auth.login({ email, password });

      if (!response.token) {
        throw new Error('No authentication token received');
      }

      // Store authentication data
      localStorage.setItem(ADMIN_TOKEN_KEY, response.token);
      localStorage.setItem(
        'user',
        JSON.stringify({
          user_id: response.user.id,
          email: response.user.email,
          username: response.user.email.split('@')[0],
          role: response.user.role,
        })
      );

      console.log('Login successful, updating auth state');

      // Update auth state
      checkAuth();

      // Navigate to dashboard
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Login error:', err);

      // Clear any partial auth data
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem('user');

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = email.trim() && password.trim();

  return (
    <LoginContainer maxWidth="sm">
      <LoginCard>
        <CardContent>
          <LoginForm onSubmit={handleSubmit}>
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

            <Button
              type="submit"
              variant="primary"
              isFullWidth
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </LoginForm>
        </CardContent>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;
