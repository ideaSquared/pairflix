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
import { auth } from '../../services/api';
import * as styles from './RegisterPage.css';

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
    if (
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      !username.trim()
    ) {
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
      setSuccess('Registration successful!');
      setRegisteredEmail(response.email);
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

  // Show success state after registration
  if (success) {
    return (
      <Container className={styles.registerContainer}>
        <Card className={styles.registerCard}>
          <CardContent>
            <div className={styles.successContainer}>
              <div className={styles.iconWrapper}>📧</div>
              <H2 className={styles.successHeading}>Check Your Email!</H2>
              <SuccessText className={styles.successMessageSpacing}>
                {success}
              </SuccessText>
              <p
                style={{
                  marginBottom: '1.5rem',
                  color: 'var(--text-secondary)',
                }}
              >
                We&apos;ve sent a verification link to{' '}
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
              <div className={styles.loginLink}>
                Didn&apos;t receive the email? Check your spam folder or{' '}
                <Link to="/register" onClick={() => window.location.reload()}>
                  try again
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className={styles.registerContainer}>
      <Card className={styles.registerCard}>
        <CardContent>
          <H2 className={styles.createAccountHeading}>Create Account</H2>
          <form
            className={styles.registerForm}
            onSubmit={handleSubmit}
            noValidate
          >
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
              isLoading={isLoading}
              isFullWidth
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          <div className={styles.loginLink}>
            Already have an account? <Link to="/login">Sign in here</Link>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
};

export default RegisterPage;
