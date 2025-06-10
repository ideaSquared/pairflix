import { PageContainer } from '@pairflix/components';
import React from 'react';
import styled from 'styled-components';
import ActivityFeed from './ActivityFeed';

const PageContent = styled.div`
  padding: 2rem 1rem;

  @media (max-width: 768px) {
    padding: 1rem 0.5rem;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSize.xl};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: ${props => props.theme.typography.fontSize.lg};
  }
`;

const Description = styled.p`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.text.secondary};
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    font-size: ${props => props.theme.typography.fontSize.sm};
  }
`;

const ActivityPage: React.FC = () => {
  return (
    <PageContainer maxWidth="lg" padding="lg" centered>
      <PageContent>
        <PageHeader>
          <Title>Activity Feed</Title>
          <Description>
            See what your partner has been watching and their recent activity.
          </Description>
        </PageHeader>

        <ActivityFeed limit={30} />
      </PageContent>
    </PageContainer>
  );
};

export default ActivityPage;
