import { Card, CardContent, Grid, Typography } from '@pairflix/components';
import React from 'react';
import {
  FaExclamationTriangle,
  FaHeart,
  FaHome,
  FaUserCheck,
  FaUsers,
} from 'react-icons/fa';
import type { DashboardStats } from '../../../../services/api/admin';
import * as styles from './StatsOverview.css';

interface FlexProps {
  alignItems?: string;
  children?: React.ReactNode;
}

const Flex: React.FC<FlexProps> = ({ children, alignItems, ...props }) => (
  <div
    className={styles.flex}
    style={{ alignItems: alignItems || 'flex-start' }}
    {...props}
  >
    {children}
  </div>
);

const formatNumber = (num: number) => new Intl.NumberFormat().format(num);

export type StatsCardType =
  | 'totalUsers'
  | 'activeUsers'
  | 'totalHouseholds'
  | 'premiumHouseholds'
  | 'errors';

interface MetricsCardProps {
  type: StatsCardType;
  metrics: DashboardStats;
}

const CARD_ICONS: Record<StatsCardType, React.ReactNode> = {
  totalUsers: <FaUsers />,
  activeUsers: <FaUserCheck />,
  totalHouseholds: <FaHome />,
  premiumHouseholds: <FaHeart />,
  errors: <FaExclamationTriangle />,
};

const CARD_LABELS: Record<StatsCardType, string> = {
  totalUsers: 'Total Users',
  activeUsers: 'Active Users',
  totalHouseholds: 'Total Households',
  premiumHouseholds: 'Premium Households',
  errors: 'Recent Errors',
};

const CARD_VALUES: Record<StatsCardType, (metrics: DashboardStats) => number> =
  {
    totalUsers: metrics => metrics.totalUsers,
    activeUsers: metrics => metrics.activeUsers,
    totalHouseholds: metrics => metrics.totalHouseholds,
    premiumHouseholds: metrics => metrics.premiumHouseholds,
    errors: metrics => metrics.recentErrorCount,
  };

const MetricsCard: React.FC<MetricsCardProps> = ({ type, metrics }) => (
  <Card className={styles.statsCard}>
    <CardContent>
      <Flex alignItems="center">
        <div className={styles.statIcon}>{CARD_ICONS[type]}</div>
        <div>
          <div className={styles.statValue}>
            {formatNumber(CARD_VALUES[type](metrics))}
          </div>
          <Typography className={styles.statLabel}>
            {CARD_LABELS[type]}
          </Typography>
        </div>
      </Flex>
      {type === 'activeUsers' && (
        <Typography variant="body2">in the last 7 days</Typography>
      )}
      {type === 'errors' && (
        <Typography variant="body2">in the last 7 days</Typography>
      )}
    </CardContent>
  </Card>
);

interface StatsOverviewProps {
  metrics: DashboardStats;
  cards?: StatsCardType[];
  columns?: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  metrics,
  cards = [
    'totalUsers',
    'activeUsers',
    'totalHouseholds',
    'premiumHouseholds',
    'errors',
  ],
  columns = 4,
}) => (
  <Grid columns={columns} gap="md">
    {cards.map(cardType => (
      <MetricsCard key={cardType} type={cardType} metrics={metrics} />
    ))}
  </Grid>
);

export default StatsOverview;
