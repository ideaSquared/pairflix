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
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { emailService } from '../../services/api';
import * as styles from './ResetPasswordPage.css';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAuth } = useAuth();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await emailService.resetPassword({ token, password });
      setSuccess('Your password has been reset.');
      checkAuth();

      setTimeout(() => {
        navigate('/tonight');
      }, 2000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        setError(err.message as string);
      } else {
        setError('An error occurred while resetting your password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className={styles.resetPasswordContainer} maxWidth="sm">
      <Card className={styles.resetPasswordCard}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <H2 gutterBottom>Reset Password</H2>

            {error && <ErrorText gutterBottom>{error}</ErrorText>}
            {success && (
              <SuccessText gutterBottom>{success} Redirecting...</SuccessText>
            )}

            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              Enter your new password below.
            </p>

            <InputGroup $isFullWidth>
              <Input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                isFullWidth
                disabled={isLoading || !token}
                minLength={8}
              />
            </InputGroup>

            <InputGroup $isFullWidth>
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                isFullWidth
                disabled={isLoading || !token}
                minLength={8}
              />
            </InputGroup>

            <Button
              type="submit"
              variant="primary"
              isFullWidth
              disabled={isLoading || !token}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>

          <div className={styles.backToLoginLink}>
            Remember your password? <Link to="/login">Back to Login</Link>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ResetPasswordPage;
