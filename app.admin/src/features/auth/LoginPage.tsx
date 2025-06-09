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

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      const response = await auth.login({ email, password });
      // Store user data properly
      localStorage.setItem(ADMIN_TOKEN_KEY, response.token);
      localStorage.setItem(
        'user',
        JSON.stringify({
          user_id: response.user.id,
          email: response.user.email,
          username: response.user.email.split('@')[0], // Use email prefix as username if needed
          role: response.user.role,
        })
      );

      // Update auth state
      checkAuth();

      // Navigate after a short delay to ensure auth state is updated
      setTimeout(() => {
        navigate('/');
      }, 100);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    }
  };

  return (
    <LoginContainer maxWidth="sm">
      <LoginCard>
        <CardContent>
          <form onSubmit={handleSubmit}>
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
              />
            </InputGroup>

            <Button type="submit" variant="primary" isFullWidth>
              Login
            </Button>
          </form>
        </CardContent>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;
