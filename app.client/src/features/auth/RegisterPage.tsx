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
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../hooks/useAuth';
import { auth } from '../../services/api';

const RegisterContainer = styled(Container)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
`;

const RegisterCard = styled(Card)`
  width: 100%;
  max-width: 400px;
`;

const RegisterForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const LoginLink = styled.div`
  text-align: center;
  margin-top: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!email || !password || !confirmPassword || !username) {
      setError('All fields are required');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please provide a valid email address');
      return false;
    }

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (
      !usernameRegex.test(username) ||
      username.length < 3 ||
      username.length > 30
    ) {
      setError(
        'Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens'
      );
      return false;
    }

    // Password validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { token } = await auth.register({ email, password, username });
      localStorage.setItem('token', token);
      checkAuth();
      navigate('/watchlist');
    } catch (err) {
      // Extract the specific error message from the response if available
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        setError(err.message as string);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    email.trim() &&
    password.trim() &&
    confirmPassword.trim() &&
    username.trim() &&
    !isLoading;

  return (
    <RegisterContainer>
      <RegisterCard>
        <CardContent>
          <H2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
            Create Account
          </H2>
          <RegisterForm onSubmit={handleSubmit}>
            <InputGroup>
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={isLoading}
                autoComplete="username"
              />
            </InputGroup>
            <InputGroup>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
              />
            </InputGroup>
            <InputGroup>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
              />
            </InputGroup>
            <InputGroup>
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
              />
            </InputGroup>
            {error && <ErrorText>{error}</ErrorText>}
            <Button
              type="submit"
              variant="primary"
              disabled={!isFormValid}
              isLoading={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </RegisterForm>
          <LoginLink>
            Already have an account? <Link to="/login">Sign in here</Link>
          </LoginLink>
        </CardContent>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default RegisterPage;
