import {
  Badge,
  Card,
  CardContent,
  Grid,
  H2,
  Typography,
} from '@pairflix/components';
import React from 'react';
import {
  FaChartLine,
  FaClock,
  FaExclamationTriangle,
  FaHeart,
  FaHeartbeat,
  FaList,
  FaMemory,
  FaUserCheck,
  FaUsers,
} from 'react-icons/fa';
import type { ActivityStats } from '../../../../services/api/admin';
import * as styles from './StatsOverview.css';

interface FlexProps {
  justifyContent?: string;
  alignItems?: string;
  children?: React.ReactNode;
}

const Flex: React.FC<FlexProps> = ({
  children,
  justifyContent,
  alignItems,
  ...props
}) => (
  <div
    className={styles.flex}
    style={{
      justifyContent: justifyContent || 'flex-start',
      alignItems: alignItems || 'flex-start',
    }}
    {...props}
  >
    {children}
  </div>
);

// Helper functions for formatting
const formatNumber = (num: number) => {
  return new Intl.NumberFormat().format(num);
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatUptime = (seconds: number) => {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  let result = '';
  if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  result += `${minutes}m`;

  return result;
};

// Available stat card options
export type StatsCardType =
  | 'users'
  | 'activeUsers'
  | 'content'
  | 'matches'
  | 'activity'
  | 'errors'
  | 'systemHealth'
  | 'memory'
  | 'uptime';

interface MetricsType {
  users?: {
    total: number;
    active: number;
    inactivePercentage: number;
  };
  content?: {
    watchlistEntries: number;
    matches: number;
  };
  activity?: {
    last24Hours: number;
    lastWeek: number;
  };
  system?: {
    recentErrors: number;
    memoryUsage: {
      heapUsed: number;
      heapTotal: number;
    };
    uptime: number;
  };
}

interface MetricsCardProps {
  type: StatsCardType;
  metrics: MetricsType;
  icon?: string;
}

interface ActivityCardProps {
  activityStats: ActivityStats;
  timeRange: number;
}

// Helper function to check if a metrics object is valid
const isValidMetrics = (metrics: MetricsType): boolean => {
  return metrics && typeof metrics === 'object';
};

// Generic stats card component that can display different types of metrics
const MetricsCard: React.FC<MetricsCardProps> = ({ type, metrics, icon }) => {
  if (!isValidMetrics(metrics)) return null;

  const getSystemStatus = () => {
    if (!metrics || !metrics.system) return 'warning';

    // Determine status based on metrics
    if (metrics.system.recentErrors > 10) return 'error';
    if (metrics.system.recentErrors > 5) return 'warning';
    return 'good';
  };

  // Render the appropriate icon component based on the icon string
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'users':
        return <FaUsers />;
      case 'activeUsers':
        return <FaUserCheck />;
      case 'content':
        return <FaList />;
      case 'matches':
        return <FaHeart />;
      case 'activity':
        return <FaChartLine />;
      case 'errors':
        return <FaExclamationTriangle />;
      case 'systemHealth':
        return <FaHeartbeat />;
      case 'memory':
        return <FaMemory />;
      case 'uptime':
        return <FaClock />;
      default:
        return null;
    }
  };

  switch (type) {
    case 'users':
      if (!metrics.users) return null;
      return (
        <Card className={styles.statsCard}>
          <CardContent>
            <Flex alignItems="center">
              {icon && (
                <div className={styles.statIcon}>{renderIcon(type)}</div>
              )}
              <div>
                <div className={styles.statValue}>
                  {formatNumber(metrics.users.total)}
                </div>
                <Typography className={styles.statLabel}>
                  Total Users
                </Typography>
              </div>
            </Flex>
          </CardContent>
        </Card>
      );

    case 'activeUsers':
      if (!metrics.users) return null;
      return (
        <Card className={styles.statsCard}>
          <CardContent>
            <Flex alignItems="center">
              {icon && (
                <div className={styles.statIcon}>{renderIcon(type)}</div>
              )}
              <div>
                <div className={styles.statValue}>
                  {formatNumber(metrics.users.active)}
                </div>
                <Typography className={styles.statLabel}>
                  Active Users
                </Typography>
              </div>
            </Flex>
            <Typography variant="body2">
              {metrics.users.inactivePercentage?.toFixed(1)}% inactive
            </Typography>
          </CardContent>
        </Card>
      );

    case 'content':
      if (!metrics.content) return null;
      return (
        <Card className={styles.statsCard}>
          <CardContent>
            <Flex alignItems="center">
              {icon && (
                <div className={styles.statIcon}>{renderIcon(type)}</div>
              )}
              <div>
                <div className={styles.statValue}>
                  {formatNumber(metrics.content.watchlistEntries)}
                </div>
                <Typography className={styles.statLabel}>
                  Content Entries
                </Typography>
              </div>
            </Flex>
          </CardContent>
        </Card>
      );

    case 'matches':
      if (!metrics.content) return null;
      return (
        <Card className={styles.statsCard}>
          <CardContent>
            <Flex alignItems="center">
              {icon && (
                <div className={styles.statIcon}>{renderIcon(type)}</div>
              )}
              <div>
                <div className={styles.statValue}>
                  {formatNumber(metrics.content.matches)}
                </div>
                <Typography className={styles.statLabel}>
                  Total Matches
                </Typography>
              </div>
            </Flex>
          </CardContent>
        </Card>
      );

    case 'activity':
      if (!metrics.activity) return null;
      return (
        <Card className={styles.statsCard}>
          <CardContent>
            <Typography className={styles.metricLabel}>
              Recent Activity
            </Typography>
            <div className={styles.statValue}>
              {formatNumber(metrics.activity.last24Hours)}
            </div>
            <Typography variant="body2">
              actions in the last 24 hours
            </Typography>
          </CardContent>
        </Card>
      );

    case 'errors':
      if (!metrics.system) return null;
      return (
        <Card className={styles.statsCard}>
          <CardContent>
            <Typography className={styles.metricLabel}>
              Recent Errors
            </Typography>
            <div className={styles.statValue}>
              {metrics.system.recentErrors}
            </div>
            <Typography variant="body2">in the last 7 days</Typography>
          </CardContent>
        </Card>
      );

    case 'systemHealth':
      if (!metrics.system) return null;
      return (
        <Card className={styles.statsCard}>
          <CardContent>
            <Typography className={styles.metricLabel}>
              System Health
            </Typography>
            <Flex alignItems="center">
              <div
                className={styles.statusIndicator({
                  status: getSystemStatus(),
                })}
              />
              <div
                className={styles.statValue}
                style={{ fontSize: '1.5rem', marginLeft: '4px' }}
              >
                {getSystemStatus() === 'good'
                  ? 'Good'
                  : getSystemStatus() === 'warning'
                    ? 'Warning'
                    : 'Alert'}
              </div>
            </Flex>
            <Typography variant="body2">
              {metrics.system.recentErrors} errors in the last 7 days
            </Typography>
          </CardContent>
        </Card>
      );

    case 'memory':
      if (!metrics.system || !metrics.system.memoryUsage) return null;
      return (
        <Card className={styles.statsCard}>
          <CardContent>
            <Typography className={styles.metricLabel}>Memory Usage</Typography>
            <div className={styles.statValue}>
              {formatBytes(metrics.system.memoryUsage.heapUsed)}
            </div>
            <Typography variant="body2">
              of {formatBytes(metrics.system.memoryUsage.heapTotal)}
            </Typography>
          </CardContent>
        </Card>
      );

    case 'uptime':
      if (!metrics.system) return null;
      return (
        <Card className={styles.statsCard}>
          <CardContent>
            <Typography className={styles.metricLabel}>
              Server Uptime
            </Typography>
            <div className={styles.statValue}>
              {formatUptime(metrics.system.uptime)}
            </div>
          </CardContent>
        </Card>
      );

    default:
      return null;
  }
};

// Unified activity card that can be reused across components
export const ActivityCard: React.FC<ActivityCardProps> = ({
  activityStats,
  timeRange,
}) => {
  if (!activityStats) return null;

  return (
    <Card className={styles.statsCard}>
      <CardContent>
        <H2 gutterBottom>User Activity</H2>
        <Typography variant="body2" gutterBottom>
          Top activity types in the last {timeRange} days:
        </Typography>

        {activityStats.activityByType
          ?.slice(0, 5)
          .map((item, index: number) => (
            <Flex key={index} justifyContent="space-between">
              <Typography variant="body2">{item.action}</Typography>
              <Badge>{item.count}</Badge>
            </Flex>
          ))}

        <Typography variant="body2" gutterBottom style={{ marginTop: '1rem' }}>
          Most active users:
        </Typography>

        {activityStats.mostActiveUsers
          ?.slice(0, 3)
          .map((item, index: number) => (
            <Flex key={index} justifyContent="space-between">
              <Typography variant="body2">
                {item.user?.username || `User ${item.user_id}`}
              </Typography>
              <Badge>{item.count} actions</Badge>
            </Flex>
          ))}
      </CardContent>
    </Card>
  );
};

interface StatsOverviewProps {
  metrics: MetricsType;
  cards?: StatsCardType[];
  columns?: number;
}

// Main component for displaying stats in a grid
export const StatsOverview: React.FC<StatsOverviewProps> = ({
  metrics,
  cards = ['users', 'activeUsers', 'content', 'matches'],
  columns = 4,
}) => {
  if (!isValidMetrics(metrics)) return null;

  // Pass the card type as the icon identifier
  return (
    <Grid columns={columns} gap="md">
      {cards.map(cardType => (
        <MetricsCard
          key={cardType}
          type={cardType}
          metrics={metrics}
          icon={cardType}
        />
      ))}
    </Grid>
  );
};

export default StatsOverview;
