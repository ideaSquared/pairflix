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
  background: ${props => props.theme.colors.background.card};
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
  font-size: ${props => props.theme.typography.fontSize.md};
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
`;

const ActivityTime = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const ActivityContent = styled.div`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.text.primary};
`;

const ActivityDetails = styled.div`
  margin-top: 0.5rem;
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
`;

const ActivityIcon = styled.span`
  margin-right: 0.5rem;
`;

const getActivityDescription = (activity: Activity): string => {
  // Map the backend activity data to user-friendly descriptions
  const action = activity.action;
  const metadata = activity.metadata || {};

  switch (action) {
    case 'WATCHLIST_ADD':
      return `added ${String(metadata.title) || 'a movie/show'} to their watchlist`;
    case 'WATCHLIST_UPDATE':
      return `updated ${String(metadata.title) || 'a movie/show'} status to ${String(metadata.status) || 'unknown'}`;
    case 'WATCHLIST_RATE':
      return `rated ${String(metadata.title) || 'a movie/show'} ${String(metadata.rating) || '?'}/10`;
    case 'WATCHLIST_REMOVE':
      return `removed ${String(metadata.title) || 'a movie/show'} from their watchlist`;
    case 'USER_LOGIN':
      return 'logged in';
    case 'USER_PROFILE_UPDATE':
      return 'updated their profile';
    case 'MATCH_CREATE':
      return 'created a new match';
    case 'MATCH_ACCEPTED':
      return 'accepted a match';
    default:
      return `performed action: ${action}`;
  }
};

const getActivityIcon = (activity: Activity): string => {
  const action = activity.action;

  switch (action) {
    case 'WATCHLIST_ADD':
      return '➕';
    case 'WATCHLIST_UPDATE':
      return '🔄';
    case 'WATCHLIST_RATE':
      return '⭐';
    case 'WATCHLIST_REMOVE':
      return '➖';
    case 'USER_LOGIN':
      return '🚪';
    case 'USER_PROFILE_UPDATE':
      return '👤';
    case 'MATCH_CREATE':
    case 'MATCH_ACCEPTED':
      return '💕';
    default:
      return '👀';
  }
};

interface ActivityFeedProps {
  limit?: number;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ limit = 20 }) => {
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['activities', limit],
    queryFn: () => api.activity.getRecent(limit),
  });

  const activities = response?.activities || [];

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
      {activities.map(activity => {
        const note = activity.metadata?.note;
        const noteString = typeof note === 'string' ? note : null;

        return (
          <ActivityItem key={activity.log_id}>
            <ActivityHeader>
              <ActivityTitle>
                {activity.user?.username || 'Unknown User'}
              </ActivityTitle>
              <ActivityTime>
                {formatDistanceToNow(new Date(activity.created_at), {
                  addSuffix: true,
                })}
              </ActivityTime>
            </ActivityHeader>
            <ActivityContent>
              <ActivityIcon>{getActivityIcon(activity)}</ActivityIcon>
              {getActivityDescription(activity)}
            </ActivityContent>
            {noteString && <ActivityDetails>"{noteString}"</ActivityDetails>}
          </ActivityItem>
        );
      })}
    </FeedContainer>
  );
};

export default ActivityFeed;
