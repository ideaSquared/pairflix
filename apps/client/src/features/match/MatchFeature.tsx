import { Card, CardContent, H2, Typography } from '@pairflix/components';
import React from 'react';
import { useFeatureFlag } from '../../hooks/useFeatureFlag';
import * as styles from './MatchFeature.css';

const MatchFeature: React.FC = () => {
  const matchingEnabled = useFeatureFlag('enableMatching');

  if (!matchingEnabled) {
    return (
      <Card variant="primary" accentColor="var(--color-warning)">
        <CardContent>
          <H2>Match Feature Disabled</H2>
          <Typography>
            The matching feature is currently disabled by the administrator.
            Please check back later or contact support for more information.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={styles.matchContainer}>
      <Card>
        <CardContent>
          <H2>Find Your Movie Matches</H2>
          <Typography>
            Connect with others who have similar movie preferences and discover
            new films to enjoy together!
          </Typography>
          {/* Actual matching feature content would go here */}
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchFeature;
