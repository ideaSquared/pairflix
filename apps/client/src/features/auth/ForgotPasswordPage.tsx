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
import { emailService } from '../../services/api';
import * as styles from './ForgotPasswordPage.css';

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
    <Container className={styles.forgotPasswordContainer} maxWidth="sm">
      <Card className={styles.forgotPasswordCard}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <H2 gutterBottom>Forgot Password</H2>

            {error && <ErrorText gutterBottom>{error}</ErrorText>}
            {success && <SuccessText gutterBottom>{success}</SuccessText>}

            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              Enter your email address and we&apos;ll send you a link to reset
              your password.
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

          <div className={styles.backToLoginLink}>
            Remember your password? <Link to="/login">Back to Login</Link>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ForgotPasswordPage;
