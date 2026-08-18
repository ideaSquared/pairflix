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
  Typography,
} from '@pairflix/components';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { twoFactor } from '../../services/api';
import type { AdminUser } from '../../services/api/auth';
import * as styles from './TwoFactorSetupPage.css';

// requireAdmin (services/api/src/middleware/auth.ts) 403s every /api/admin/* route until
// the caller has TOTP enrolled -- AdminRoute (routes/AppRoutes.tsx) sends an admin here instead
// of the dashboard until they complete this once.
const TwoFactorSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [secret, setSecret] = useState('');
  const [otpauthUrl, setOtpauthUrl] = useState('');
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // enroll() overwrites any secret from a previous call, so it must run at most once per mount --
  // otherwise StrictMode's double-invoke (or a stray re-mount) silently invalidates the secret an
  // authenticator app already scanned, and the code the admin enters stops matching.
  const hasEnrolled = useRef(false);

  useEffect(() => {
    if (hasEnrolled.current) return;
    hasEnrolled.current = true;

    twoFactor
      .enroll()
      .then(result => {
        setSecret(result.secret);
        setOtpauthUrl(result.otpauthUrl);
      })
      .catch(err => {
        setError(
          err instanceof Error ? err.message : 'Failed to start 2FA setup'
        );
      });
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    try {
      const result = await twoFactor.verify(code);
      setBackupCodes(result.backupCodes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired code');
    } finally {
      setIsVerifying(false);
    }
  };

  if (backupCodes) {
    return (
      <Container className={styles.setupContainer} maxWidth="sm">
        <Card className={styles.setupCard}>
          <CardContent>
            <H2 gutterBottom>2FA enabled</H2>
            <SuccessText gutterBottom>
              Two-factor authentication is now active on your account.
            </SuccessText>
            <Typography variant="body2" gutterBottom>
              Save these backup codes somewhere safe -- each works once if you
              lose access to your authenticator app, and they won&apos;t be
              shown again.
            </Typography>
            <div className={styles.backupCodeList}>
              {backupCodes.map(backupCode => (
                <span key={backupCode}>{backupCode}</span>
              ))}
            </div>
            <Button
              variant="primary"
              isFullWidth
              onClick={() => {
                // Patch the cached user directly instead of refetching -- a successful verify()
                // call already tells us totpEnabled is now true, and AdminRoute reads this
                // synchronously on the very next render (see the race this avoids in TwoFactorSetupRoute:
                // an earlier version refreshed on verify, which yanked this screen away before
                // the admin could read their backup codes).
                queryClient.setQueryData<AdminUser | null>(['auth'], old =>
                  old ? { ...old, totpEnabled: true } : old
                );
                navigate('/', { replace: true });
              }}
            >
              Continue to dashboard
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className={styles.setupContainer} maxWidth="sm">
      <Card className={styles.setupCard}>
        <CardContent>
          <form className={styles.setupForm} onSubmit={handleVerify}>
            <H2 gutterBottom>Set up two-factor authentication</H2>
            <Typography variant="body2" gutterBottom>
              Admin accounts require 2FA. Scan the link below in an
              authenticator app (or enter the secret manually), then confirm
              with a code.
            </Typography>

            {error && <ErrorText gutterBottom>{error}</ErrorText>}

            {otpauthUrl && (
              <>
                <Typography variant="caption">Setup link</Typography>
                <div className={styles.secretBlock}>{otpauthUrl}</div>
                <Typography variant="caption">Manual entry secret</Typography>
                <div className={styles.secretBlock}>{secret}</div>
              </>
            )}

            <InputGroup isFullWidth>
              <Input
                type="text"
                placeholder="6-digit code"
                value={code}
                onChange={e => setCode(e.target.value)}
                required
                isFullWidth
                disabled={isVerifying || !otpauthUrl}
                autoComplete="one-time-code"
              />
            </InputGroup>

            <Button
              type="submit"
              variant="primary"
              isFullWidth
              disabled={isVerifying || !otpauthUrl || !code.trim()}
            >
              {isVerifying ? 'Verifying...' : 'Verify and enable 2FA'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default TwoFactorSetupPage;
