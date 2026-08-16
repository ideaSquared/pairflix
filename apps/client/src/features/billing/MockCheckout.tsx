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
import { billing } from '../../services/api';
import * as styles from './MockCheckout.css';

const PRICE_LABEL = '£4.99 / month';

const MockCheckout: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const householdId = params.get('household') ?? '';
  const [error, setError] = useState<string | null>(null);

  const activate = useMutation({
    mutationFn: () => billing.mockActivate(householdId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['entitlements', householdId],
      });
      navigate('/');
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : 'Activation failed');
    },
  });

  const disabled = useMemo(
    () => !householdId || activate.isPending,
    [householdId, activate.isPending]
  );

  return (
    <Container>
      <Card className={styles.checkoutCard}>
        <CardContent>
          <div className={styles.mockBadge}>
            MOCK CHECKOUT — Stripe not wired
          </div>
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
            {activate.isPending ? 'Activating…' : `Pay ${PRICE_LABEL}`}
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default MockCheckout;
