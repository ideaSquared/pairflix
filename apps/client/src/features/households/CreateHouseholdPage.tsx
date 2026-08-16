import {
  Button,
  Container,
  H1,
  Input,
  PageContainer,
  Typography,
} from '@pairflix/components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { households as householdsApi } from '../../services/api';
import * as styles from './CreateHouseholdPage.css';

const CreateHouseholdPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (body: { name?: string }) => householdsApi.create(body),
    onSuccess: data => {
      void queryClient.invalidateQueries({ queryKey: ['households'] });
      navigate(`/households/${data.household.id}/invites`);
    },
    onError: (err: Error) => setError(err.message),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(name.trim() ? { name: name.trim() } : {});
  };

  return (
    <PageContainer maxWidth="md" padding="lg">
      <Container fluid>
        <H1 gutterBottom>Create a household</H1>
        <Typography variant="body1" gutterBottom>
          Households are how you and a partner pick what to watch together.
          You&apos;ll be able to invite someone right after.
        </Typography>
        <form className={styles.form} onSubmit={onSubmit}>
          <Input
            label="Name (optional)"
            placeholder="e.g. Movie Mondays"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={80}
          />
          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            variant="primary"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Creating…' : 'Create'}
          </Button>
        </form>
      </Container>
    </PageContainer>
  );
};

export default CreateHouseholdPage;
