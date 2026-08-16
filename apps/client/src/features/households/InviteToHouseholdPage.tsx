import {
  Button,
  Container,
  H1,
  Input,
  PageContainer,
  Typography,
} from '@pairflix/components';
import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { households as householdsApi } from '../../services/api';
import type { InviteSummary } from '../../services/api/households';
import * as styles from './InviteToHouseholdPage.css';

const InviteToHouseholdPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [email, setEmail] = useState('');
  const [invite, setInvite] = useState<InviteSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inviteMutation = useMutation({
    mutationFn: () =>
      householdsApi.invite(
        id ?? '',
        email.trim() ? { email: email.trim() } : {}
      ),
    onSuccess: data => setInvite(data.invite),
    onError: (err: Error) => setError(err.message),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    inviteMutation.mutate();
  };

  const inviteUrl = invite
    ? `${window.location.origin}/household-invites/${invite.token}`
    : null;

  return (
    <PageContainer maxWidth="md" padding="lg">
      <Container fluid>
        <H1 gutterBottom>Invite a partner</H1>
        <Typography variant="body1" gutterBottom>
          Generate an invite link to share. The recipient opens the link and
          accepts to join your household.
        </Typography>
        <form className={styles.form} onSubmit={onSubmit}>
          <Input
            label="Their email (optional, for your records)"
            placeholder="partner@example.com"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            variant="primary"
            disabled={inviteMutation.isPending}
          >
            {inviteMutation.isPending ? 'Generating…' : 'Generate invite link'}
          </Button>
        </form>

        {inviteUrl && (
          <Container fluid className={styles.inviteLinkContainer}>
            <Typography variant="body2" gutterBottom>
              Send this link. It expires in 7 days.
            </Typography>
            <code className={styles.linkBox}>{inviteUrl}</code>
          </Container>
        )}
      </Container>
    </PageContainer>
  );
};

export default InviteToHouseholdPage;
