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
import { useAuth } from '../../hooks/useAuth';
import { auth } from '../../services/api';
import * as styles from './LoginPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await auth.login({ email, password });
      checkAuth();
      navigate('/tonight');
    } catch (err) {
      // Extract the specific error message from the response if available
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        setError(err.message as string);
      } else {
        setError('Invalid email or password');
      }
    }
  };

  return (
    <Container className={styles.loginContainer} maxWidth="sm">
      <Card className={styles.loginCard}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <H2 gutterBottom>Login to PairFlix</H2>
            {error && <ErrorText gutterBottom>{error}</ErrorText>}

            <InputGroup $isFullWidth>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                isFullWidth
              />
            </InputGroup>

            <InputGroup $isFullWidth>
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

          <div className={styles.registerLink}>
            <Link to="/forgot-password">Forgot your password?</Link>
          </div>

          <div className={styles.registerLink}>
            Don&apos;t have an account?{' '}
            <Link to="/register">Create one here</Link>
          </div>

          {/* Development mode helper */}
          {process.env.NODE_ENV === 'development' && (
            <div
              style={{
                marginTop: '1rem',
                padding: '12px',
                background: 'rgba(255, 107, 53, 0.1)',
                border: '1px solid #ff6b35',
                borderRadius: '4px',
                fontSize: '12px',
              }}
            >
              <strong style={{ color: '#ff6b35' }}>🔧 Dev Mode</strong>
              <br />
              Password for all test users:{' '}
              <code
                style={{
                  background: 'rgba(0,0,0,0.1)',
                  padding: '2px 4px',
                  borderRadius: '2px',
                }}
              >
                password123
              </code>
              <br />
              <small style={{ color: '#666' }}>
                Try: useractive@example.com, admin@example.com,
                user1@example.com, etc.
                <br />
                Or use the Dev Login panel (bottom right) for quick switching!
              </small>
            </div>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default LoginPage;
