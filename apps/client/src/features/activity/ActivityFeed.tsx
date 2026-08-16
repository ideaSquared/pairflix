import { Loading } from '@pairflix/components';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import api, { type Activity } from '../../services/api';
import * as styles from './ActivityFeed.css';

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
      <div className={styles.emptyState}>
        Failed to load activity feed. Please try again later.
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return <div className={styles.emptyState}>No recent activity to show.</div>;
  }

  return (
    <div className={styles.feedContainer}>
      {activities.map(activity => {
        const note = activity.metadata?.note;
        const noteString = typeof note === 'string' ? note : null;

        return (
          <div className={styles.activityItem} key={activity.log_id}>
            <div className={styles.activityHeader}>
              <h3 className={styles.activityTitle}>
                {activity.user?.username || 'Unknown User'}
              </h3>
              <span className={styles.activityTime}>
                {formatDistanceToNow(new Date(activity.created_at), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <div className={styles.activityContent}>
              <span className={styles.activityIcon}>
                {getActivityIcon(activity)}
              </span>
              {getActivityDescription(activity)}
            </div>
            {noteString && (
              <div className={styles.activityDetails}>
                &quot;{noteString}&quot;
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ActivityFeed;
