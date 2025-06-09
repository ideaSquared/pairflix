import { Loading } from '@pairflix/components';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import styled from 'styled-components';
import api, { Activity } from '../../services/api';

const FeedContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const ActivityItem = styled.div`
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 1rem;
  box-shadow: ${props => props.theme.shadows.sm};
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }

  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`;

const ActivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ActivityTitle = styled.h3`
  font-size: ${props => props.theme.fontSizes.md};
  margin: 0;
  color: ${props => props.theme.colors.textPrimary};
`;

const ActivityTime = styled.span`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const ActivityContent = styled.div`
  font-size: ${props => props.theme.fontSizes.md};
  color: ${props => props.theme.colors.textPrimary};
`;

const ActivityDetails = styled.div`
  margin-top: 0.5rem;
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
`;

const ActivityIcon = styled.span`
  margin-right: 0.5rem;
`;

const getActivityDescription = (activity: Activity): string => {
  switch (activity.type) {
    case 'added':
      return `added ${activity.contentTitle} to their watchlist`;
    case 'updated':
      return `changed ${activity.contentTitle} status to ${activity.details.status?.replace('_', ' ')}`;
    case 'rated':
      return `rated ${activity.contentTitle} ${activity.details.rating}/10`;
    case 'completed':
      return `finished watching ${activity.contentTitle}`;
    case 'note':
      return `added a note to ${activity.contentTitle}`;
    default:
      return `updated ${activity.contentTitle}`;
  }
};

const getActivityIcon = (activity: Activity): string => {
  switch (activity.type) {
    case 'added':
      return '➕';
    case 'updated':
      return '🔄';
    case 'rated':
      return '⭐';
    case 'completed':
      return '✅';
    case 'note':
      return '📝';
    default:
      return '👀';
  }
};

interface ActivityFeedProps {
  limit?: number;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ limit = 20 }) => {
  const {
    data: activities,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['activities', limit],
    queryFn: () => api.activity.getRecent(limit),
  });

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <EmptyState>
        Failed to load activity feed. Please try again later.
      </EmptyState>
    );
  }

  if (!activities || activities.length === 0) {
    return <EmptyState>No recent activity to show.</EmptyState>;
  }

  return (
    <FeedContainer>
      {activities.map(activity => (
        <ActivityItem key={activity.id}>
          <ActivityHeader>
            <ActivityTitle>{activity.userDisplayName}</ActivityTitle>
            <ActivityTime>
              {formatDistanceToNow(new Date(activity.timestamp), {
                addSuffix: true,
              })}
            </ActivityTime>
          </ActivityHeader>
          <ActivityContent>
            <ActivityIcon>{getActivityIcon(activity)}</ActivityIcon>
            {getActivityDescription(activity)}
          </ActivityContent>
          {activity.details.note && (
            <ActivityDetails>"{activity.details.note}"</ActivityDetails>
          )}
        </ActivityItem>
      ))}
    </FeedContainer>
  );
};

export default ActivityFeed;
