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
import styled from 'styled-components';
import { emailService } from '../../services/api';

const ResetPasswordContainer = styled(Container)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
`;

const ResetPasswordCard = styled(Card)`
  width: 100%;
  max-width: 400px;
`;

const BackToLoginLink = styled.div`
  text-align: center;
  margin-top: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
      const response = await emailService.resetPassword({ token, password });
      setSuccess(response.message);

      // Redirect to login after successful reset
      setTimeout(() => {
        navigate('/login');
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
    <ResetPasswordContainer maxWidth="sm">
      <ResetPasswordCard>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <H2 gutterBottom>Reset Password</H2>

            {error && <ErrorText gutterBottom>{error}</ErrorText>}
            {success && (
              <SuccessText gutterBottom>
                {success} Redirecting to login...
              </SuccessText>
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

          <BackToLoginLink>
            Remember your password? <Link to="/login">Back to Login</Link>
          </BackToLoginLink>
        </CardContent>
      </ResetPasswordCard>
    </ResetPasswordContainer>
  );
};

export default ResetPasswordPage;
