import {
  Button,
  Card,
  CardContent,
  Container,
  ErrorText,
  H2,
  Input,
  InputGroup,
  SuccessText,
} from '@pairflix/components';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
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

const SuccessContainer = styled.div`
  text-align: center;
`;

const IconWrapper = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!email || !password || !confirmPassword || !username) {
      setError('All fields are required');
      return false;
    }

    // Safe email validation without ReDoS vulnerability
    const isValidEmail = (email: string): boolean => {
      if (!email || email.length < 5 || email.length > 254) return false;

      const atIndex = email.indexOf('@');
      const lastAtIndex = email.lastIndexOf('@');
      if (atIndex === -1 || atIndex !== lastAtIndex) return false;

      const localPart = email.substring(0, atIndex);
      const domainPart = email.substring(atIndex + 1);

      if (localPart.length < 1 || localPart.length > 64) return false;
      if (domainPart.length < 1 || domainPart.length > 253) return false;
      if (domainPart.indexOf('.') === -1) return false;

      // Check for basic invalid characters
      if (/[\s<>()[\]\\,;:]/.test(email)) return false;

      return true;
    };

    if (!isValidEmail(email)) {
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
    setSuccess('');

    try {
      const response = await auth.register({ email, password, username });
      setSuccess(response.message);
      setRegisteredEmail(response.email || email);
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

  // Show success state after registration
  if (success) {
    return (
      <RegisterContainer>
        <RegisterCard>
          <CardContent>
            <SuccessContainer>
              <IconWrapper>📧</IconWrapper>
              <H2 style={{ marginBottom: '1rem' }}>Check Your Email!</H2>
              <SuccessText style={{ marginBottom: '1rem' }}>
                {success}
              </SuccessText>
              <p
                style={{
                  marginBottom: '1.5rem',
                  color: 'var(--text-secondary)',
                }}
              >
                We've sent a verification link to{' '}
                <strong>{registeredEmail}</strong>. Please check your email and
                click the link to activate your account.
              </p>
              <div style={{ marginBottom: '1rem' }}>
                <Button
                  variant="primary"
                  onClick={() => navigate('/login')}
                  isFullWidth
                >
                  Go to Login
                </Button>
              </div>
              <LoginLink>
                Didn't receive the email? Check your spam folder or{' '}
                <Link to="/register" onClick={() => window.location.reload()}>
                  try again
                </Link>
              </LoginLink>
            </SuccessContainer>
          </CardContent>
        </RegisterCard>
      </RegisterContainer>
    );
  }

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
                isFullWidth
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
                isFullWidth
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
                isFullWidth
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
                isFullWidth
              />
            </InputGroup>
            {error && <ErrorText>{error}</ErrorText>}
            <Button
              type="submit"
              variant="primary"
              disabled={!isFormValid}
              isLoading={isLoading}
              isFullWidth
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
