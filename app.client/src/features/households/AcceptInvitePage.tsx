import {
  Button,
  Container,
  H1,
  PageContainer,
  Typography,
} from '@pairflix/components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { households as householdsApi } from '../../services/api';

const AcceptInvitePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const acceptMutation = useMutation({
    mutationFn: () => householdsApi.acceptInvite(token ?? ''),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['households'] });
      navigate('/tonight');
    },
  });

  useEffect(() => {
    if (token) acceptMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <PageContainer maxWidth="md" padding="lg">
      <Container fluid>
        <H1 gutterBottom>Joining household…</H1>
        {acceptMutation.isLoading && <Typography>Working…</Typography>}
        {acceptMutation.isError && (
          <>
            <Typography variant="body1" color="error" gutterBottom>
              That invite is invalid or has expired.
            </Typography>
            <Button
              variant="primary"
              onClick={() => navigate('/households/new')}
            >
              Create your own household
            </Button>
          </>
        )}
      </Container>
    </PageContainer>
  );
};

export default AcceptInvitePage;
