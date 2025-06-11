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
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { emailService } from '../../services/api';

const ForgotPasswordContainer = styled(Container)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
`;

const ForgotPasswordCard = styled(Card)`
  width: 100%;
  max-width: 400px;
`;

const BackToLoginLink = styled.div`
  text-align: center;
  margin-top: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await emailService.forgotPassword({ email });
      setSuccess(response.message);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        setError(err.message as string);
      } else {
        setError('An error occurred while processing your request');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ForgotPasswordContainer maxWidth="sm">
      <ForgotPasswordCard>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <H2 gutterBottom>Forgot Password</H2>

            {error && <ErrorText gutterBottom>{error}</ErrorText>}
            {success && <SuccessText gutterBottom>{success}</SuccessText>}

            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              Enter your email address and we'll send you a link to reset your
              password.
            </p>

            <InputGroup $isFullWidth>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                isFullWidth
                disabled={isLoading}
              />
            </InputGroup>

            <Button
              type="submit"
              variant="primary"
              isFullWidth
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>

          <BackToLoginLink>
            Remember your password? <Link to="/login">Back to Login</Link>
          </BackToLoginLink>
        </CardContent>
      </ForgotPasswordCard>
    </ForgotPasswordContainer>
  );
};

export default ForgotPasswordPage;
