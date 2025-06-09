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
import styled from 'styled-components';
import { ActivityStats } from '../../../../services/api/admin';

// Styled components
const StatsCard = styled(Card)`
  height: 100%;
  transition:
    transform 0.3s ease-in-out,
    box-shadow 0.3s ease-in-out;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) =>
      theme?.shadows?.lg || '0 10px 15px rgba(0, 0, 0, 0.1)'};
  }
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  margin: 0.5rem 0;
`;

const StatLabel = styled(Typography)`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const MetricLabel = styled(Typography)`
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

interface FlexProps {
  justifyContent?: string;
  alignItems?: string;
  children?: React.ReactNode;
}

const StyledFlex = styled.div<FlexProps>`
  display: flex;
  justify-content: ${({ justifyContent }) => justifyContent || 'flex-start'};
  align-items: ${({ alignItems }) => alignItems || 'flex-start'};
`;

const Flex: React.FC<FlexProps> = ({ children, ...props }) => (
  <StyledFlex {...props}>{children}</StyledFlex>
);

const StatIcon = styled.div`
  font-size: 1.5rem;
  margin-right: 1rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const StatusIndicator = styled.div<{ status: 'good' | 'warning' | 'error' }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${({ status, theme }) =>
    status === 'good'
      ? theme.colors.success
      : status === 'warning'
        ? theme.colors.warning
        : theme.colors.error};
`;

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
        <StatsCard>
          <CardContent>
            <Flex alignItems="center">
              {icon && <StatIcon>{renderIcon(type)}</StatIcon>}
              <div>
                <StatValue>{formatNumber(metrics.users.total)}</StatValue>
                <StatLabel>Total Users</StatLabel>
              </div>
            </Flex>
          </CardContent>
        </StatsCard>
      );

    case 'activeUsers':
      if (!metrics.users) return null;
      return (
        <StatsCard>
          <CardContent>
            <Flex alignItems="center">
              {icon && <StatIcon>{renderIcon(type)}</StatIcon>}
              <div>
                <StatValue>{formatNumber(metrics.users.active)}</StatValue>
                <StatLabel>Active Users</StatLabel>
              </div>
            </Flex>
            <Typography variant="body2">
              {metrics.users.inactivePercentage?.toFixed(1)}% inactive
            </Typography>
          </CardContent>
        </StatsCard>
      );

    case 'content':
      if (!metrics.content) return null;
      return (
        <StatsCard>
          <CardContent>
            <Flex alignItems="center">
              {icon && <StatIcon>{renderIcon(type)}</StatIcon>}
              <div>
                <StatValue>
                  {formatNumber(metrics.content.watchlistEntries)}
                </StatValue>
                <StatLabel>Content Entries</StatLabel>
              </div>
            </Flex>
          </CardContent>
        </StatsCard>
      );

    case 'matches':
      if (!metrics.content) return null;
      return (
        <StatsCard>
          <CardContent>
            <Flex alignItems="center">
              {icon && <StatIcon>{renderIcon(type)}</StatIcon>}
              <div>
                <StatValue>{formatNumber(metrics.content.matches)}</StatValue>
                <StatLabel>Total Matches</StatLabel>
              </div>
            </Flex>
          </CardContent>
        </StatsCard>
      );

    case 'activity':
      if (!metrics.activity) return null;
      return (
        <StatsCard>
          <CardContent>
            <MetricLabel>Recent Activity</MetricLabel>
            <StatValue>{formatNumber(metrics.activity.last24Hours)}</StatValue>
            <Typography variant="body2">
              actions in the last 24 hours
            </Typography>
          </CardContent>
        </StatsCard>
      );

    case 'errors':
      if (!metrics.system) return null;
      return (
        <StatsCard>
          <CardContent>
            <MetricLabel>Recent Errors</MetricLabel>
            <StatValue>{metrics.system.recentErrors}</StatValue>
            <Typography variant="body2">in the last 7 days</Typography>
          </CardContent>
        </StatsCard>
      );

    case 'systemHealth':
      if (!metrics.system) return null;
      return (
        <StatsCard>
          <CardContent>
            <MetricLabel>System Health</MetricLabel>
            <Flex alignItems="center">
              <StatusIndicator status={getSystemStatus()} />
              <StatValue style={{ fontSize: '1.5rem', marginLeft: '4px' }}>
                {getSystemStatus() === 'good'
                  ? 'Good'
                  : getSystemStatus() === 'warning'
                    ? 'Warning'
                    : 'Alert'}
              </StatValue>
            </Flex>
            <Typography variant="body2">
              {metrics.system.recentErrors} errors in the last 7 days
            </Typography>
          </CardContent>
        </StatsCard>
      );

    case 'memory':
      if (!metrics.system || !metrics.system.memoryUsage) return null;
      return (
        <StatsCard>
          <CardContent>
            <MetricLabel>Memory Usage</MetricLabel>
            <StatValue>
              {formatBytes(metrics.system.memoryUsage.heapUsed)}
            </StatValue>
            <Typography variant="body2">
              of {formatBytes(metrics.system.memoryUsage.heapTotal)}
            </Typography>
          </CardContent>
        </StatsCard>
      );

    case 'uptime':
      if (!metrics.system) return null;
      return (
        <StatsCard>
          <CardContent>
            <MetricLabel>Server Uptime</MetricLabel>
            <StatValue>{formatUptime(metrics.system.uptime)}</StatValue>
          </CardContent>
        </StatsCard>
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
    <StatsCard>
      <CardContent>
        <H2 gutterBottom>User Activity</H2>
        <Typography variant="body2" gutterBottom>
          Top activity types in the last {timeRange} days:
        </Typography>

        {activityStats.activityByType
          ?.slice(0, 5)
          .map((item, index: number) => (
            <StyledFlex key={index} justifyContent="space-between">
              <Typography variant="body2">{item.action}</Typography>
              <Badge>{item.count}</Badge>
            </StyledFlex>
          ))}

        <Typography variant="body2" gutterBottom style={{ marginTop: '1rem' }}>
          Most active users:
        </Typography>

        {activityStats.mostActiveUsers
          ?.slice(0, 3)
          .map((item, index: number) => (
            <StyledFlex key={index} justifyContent="space-between">
              <Typography variant="body2">
                {item.user?.username || `User ${item.user_id}`}
              </Typography>
              <Badge>{item.count} actions</Badge>
            </StyledFlex>
          ))}
      </CardContent>
    </StatsCard>
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
