import {
  Badge,
  Card,
  CardContent,
  ErrorText,
  Flex,
  H2,
  Typography,
} from '@pairflix/components';
import React from 'react';
import type { RecommendationCard } from '../../services/api/households';
import * as styles from './RecommendationResultCard.css';

type RecommendationResultCardProps = {
  card: RecommendationCard;
  rationale: string;
  /** The bottom action slot -- each caller owns its own buttons (and any error text for them)
   * since which actions are available depends on whether the caller has an authenticated
   * household to act against. */
  actions: React.ReactNode;
  /** Omit to render provider badges as plain (non-interactive) badges instead of "Watch on X"
   * launch buttons -- the launch endpoint is household-scoped and unavailable to a caller with
   * no household, e.g. the anonymous landing-page demo. */
  onLaunchProvider?: (providerName: string) => void;
  launchError?: string | undefined;
};

const RecommendationResultCard: React.FC<RecommendationResultCardProps> = ({
  card,
  rationale,
  actions,
  onLaunchProvider,
  launchError,
}) => {
  const providerBadges = card.providers.flatrate ?? [];

  return (
    <Card variant="primary" className={styles.resultCard}>
      <CardContent>
        <Flex gap="lg" alignItems="flex-start">
          {card.posterPath && (
            <img
              className={styles.poster}
              src={`https://image.tmdb.org/t/p/w500${card.posterPath}`}
              alt={card.title}
            />
          )}
          <div>
            <H2>{card.title}</H2>
            <Flex gap="sm" className={styles.badgeRow}>
              {card.year && <Badge variant="secondary">{card.year}</Badge>}
              {card.runtime && (
                <Badge variant="secondary">{card.runtime} min</Badge>
              )}
              {providerBadges.map(p =>
                onLaunchProvider ? (
                  <button
                    className={styles.providerLaunchButton}
                    key={p.provider_id}
                    type="button"
                    onClick={() => onLaunchProvider(p.provider_name)}
                  >
                    Watch on {p.provider_name}
                  </button>
                ) : (
                  <Badge variant="secondary" key={p.provider_id}>
                    {p.provider_name}
                  </Badge>
                )
              )}
            </Flex>
            {launchError && <ErrorText>{launchError}</ErrorText>}
            <Typography variant="body2" className={styles.rationale}>
              {rationale}
            </Typography>
            <Typography variant="body2">{card.overview}</Typography>

            {actions}
          </div>
        </Flex>
      </CardContent>
    </Card>
  );
};

export default RecommendationResultCard;
