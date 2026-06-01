import {
  Button,
  Card,
  CardContent,
  Container,
  H1,
  Typography,
} from '@pairflix/components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { billing } from '../../services/api';
import type { Theme } from '../../styles/theme';

const MockBadge = styled.div<{ theme: Theme }>`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing.xs}
    ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.text.warning};
  color: ${({ theme }) => theme.colors.background.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  letter-spacing: 0.05em;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const CheckoutCard = styled(Card)`
  max-width: 480px;
  margin: ${({ theme }) => theme.spacing.xl} auto;
`;

const PRICE_LABEL = '£4.99 / month';

const MockCheckout: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const householdId = params.get('household') ?? '';
  const [error, setError] = useState<string | null>(null);

  const activate = useMutation(
    () => billing.mockActivate(householdId),
    {
      onSuccess: () => {
        void queryClient.invalidateQueries(['entitlements', householdId]);
        navigate('/');
      },
      onError: (err: unknown) => {
        setError(err instanceof Error ? err.message : 'Activation failed');
      },
    }
  );

  const disabled = useMemo(
    () => !householdId || activate.isLoading,
    [householdId, activate.isLoading]
  );

  return (
    <Container>
      <CheckoutCard>
        <CardContent>
          <MockBadge>MOCK CHECKOUT — Stripe not wired</MockBadge>
          <H1 gutterBottom>Upgrade to Premium</H1>
          <Typography variant="body1" gutterBottom>
            Unlimited daily picks, multi-region providers, and LLM-ranked
            recommendations.
          </Typography>
          <Typography variant="h3" gutterBottom>
            {PRICE_LABEL}
          </Typography>
          {!householdId && (
            <Typography variant="body2">
              Missing household id — append ?household=&lt;id&gt; to the URL.
            </Typography>
          )}
          {error && <Typography variant="body2">{error}</Typography>}
          <Button
            variant="primary"
            disabled={disabled}
            onClick={() => activate.mutate()}
          >
            {activate.isLoading ? 'Activating…' : `Pay ${PRICE_LABEL}`}
          </Button>
        </CardContent>
      </CheckoutCard>
    </Container>
  );
};

export default MockCheckout;
