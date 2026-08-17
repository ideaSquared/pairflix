import {
  Button,
  Card,
  CardContent,
  ErrorText,
  H2,
  Input,
  InputGroup,
  Container,
  SuccessText,
} from '@pairflix/components';
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { emailService } from '../../services/api';
import * as styles from './EmailVerificationPage.css';

const EmailVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAuth } = useAuth();
  const token = searchParams.get('token');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);
  const [resendEmail, setResendEmail] = useState('');

  React.useEffect(() => {
    if (token && !hasVerified) {
      handleVerification();
    } else if (!token) {
      setError('Invalid or missing verification token');
    }
  }, [token, hasVerified]);

  const handleVerification = async () => {
    if (!token) {
      setError('Invalid or missing verification token');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await emailService.verifyEmail({ token });
      setSuccess('Your email has been verified.');
      setHasVerified(true);
      checkAuth();

      setTimeout(() => {
        navigate('/tonight');
      }, 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        setError(err.message as string);
      } else {
        setError('An error occurred while verifying your email');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!resendEmail) {
      setError('Enter your email address to resend the verification link');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await emailService.resendVerification({ email: resendEmail });
      setSuccess('If that address is registered, a new link is on its way.');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        setError(err.message as string);
      } else {
        setError('An error occurred while sending verification email');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className={styles.verificationContainer} maxWidth="sm">
      <Card className={styles.verificationCard}>
        <CardContent>
          {isLoading ? (
            <>
              <div className={styles.iconWrapper}>⏳</div>
              <H2 gutterBottom>Verifying Email...</H2>
              <p>Please wait while we verify your email address.</p>
            </>
          ) : success ? (
            <>
              <div className={styles.iconWrapper}>✅</div>
              <H2 gutterBottom>Email Verified!</H2>
              <SuccessText gutterBottom>{success}</SuccessText>
              <p>Redirecting to Tonight...</p>
            </>
          ) : error ? (
            <>
              <div className={styles.iconWrapper}>❌</div>
              <H2 gutterBottom>Verification Failed</H2>
              <ErrorText gutterBottom>{error}</ErrorText>

              {error.includes('expired') && (
                <>
                  <p>
                    Your verification link has expired. Enter your email to
                    request a new one.
                  </p>
                  <InputGroup $isFullWidth>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={resendEmail}
                      onChange={e => setResendEmail(e.target.value)}
                      isFullWidth
                      disabled={isLoading}
                    />
                  </InputGroup>
                  <Button
                    variant="primary"
                    onClick={handleResendVerification}
                    disabled={isLoading}
                  >
                    Send New Verification Email
                  </Button>
                </>
              )}

              <div className={styles.actionLinks}>
                <Link to="/login">Back to Login</Link>|
                <Link to="/register">Create New Account</Link>
              </div>
            </>
          ) : (
            <>
              <div className={styles.iconWrapper}>📧</div>
              <H2 gutterBottom>Verify Your Email</H2>
              <p>
                We&apos;re processing your email verification. This should only
                take a moment.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default EmailVerificationPage;
