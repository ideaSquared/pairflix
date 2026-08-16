import {
  Badge,
  Card,
  CardContent,
  H2,
  Loading,
  Typography,
} from '@pairflix/components';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { matches } from '../../services/api/matches';
import * as styles from './Recommendations.css';

interface RecommendationsProps {
  limit?: number;
}

const Recommendations: React.FC<RecommendationsProps> = ({ limit = 6 }) => {
  const {
    data: recommendations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['recommendations', limit],
    queryFn: () => matches.getRecommendations(limit),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className={styles.emptyState}>
        <Typography>Unable to load recommendations at this time.</Typography>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Typography>
          No recommendations available yet. Keep updating your watchlist to get
          personalized suggestions!
        </Typography>
      </div>
    );
  }

  return (
    <div className={styles.recommendationsContainer}>
      <H2>Recommended For You Both</H2>
      <Typography variant="body2" gutterBottom>
        Content you might enjoy watching together based on your preferences
      </Typography>

      <div className={styles.recommendationsGrid}>
        {recommendations.map(item => (
          <Card
            key={`${item.media_type}-${item.tmdb_id}`}
            variant="primary"
            className={styles.recommendationCard}
          >
            <div className={styles.cardHeader}>
              {item.poster_path ? (
                <img
                  className={styles.posterImage}
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={item.title}
                />
              ) : (
                <div className={styles.posterFallback} />
              )}
              <div className={styles.scoreBadge}>
                {Math.round(item.recommendation_score * 100)}%
              </div>
            </div>

            <CardContent className={styles.cardBody}>
              <Typography variant="h3" className={styles.contentTitle}>
                {item.title}
              </Typography>
              <Badge variant="primary">
                {item.media_type === 'tv' ? 'TV Series' : 'Movie'}
              </Badge>
              <Typography className={styles.reasonText}>
                {item.recommendation_reason}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
