import { Card, CardContent, H2, Typography } from '@pairflix/components';
import React from 'react';
import styled from 'styled-components';
import { useFeatureFlag } from '../../hooks/useFeatureFlag';

const MatchContainer = styled.div`
  margin: ${({ theme }) => theme.spacing.lg} 0;
`;

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
    <MatchContainer>
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
    </MatchContainer>
  );
};

export default MatchFeature;
