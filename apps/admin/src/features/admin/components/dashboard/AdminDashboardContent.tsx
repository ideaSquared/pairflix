import {
  Button,
  Card,
  CardContent,
  Grid,
  H3,
  Loading,
  PageContainer,
  Typography,
} from '@pairflix/components';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminStatsService } from '../../../../services/adminStats.service';
import { fetchWithAuth } from '../../../../services/api';
import StatsOverview from '../shared/StatsOverview';
import * as styles from './AdminDashboardContent.css';

interface DashboardMetrics {
  users: {
    total: number;
    active: number;
    inactivePercentage: number;
  };
  content: {
    watchlistEntries: number;
    matches: number;
  };
  system: {
    status?: 'healthy' | 'unhealthy';
    recentErrors: number;
    uptime: number;
    memoryUsage: { heapUsed: number; heapTotal: number };
  };
  recentUsers?: {
    count: number;
    days: number;
    percentage: number;
    trend: 'up' | 'down';
  };
}

const AdminDashboardContent: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch metrics data
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Use the centralized admin stats service
        const metricsData = await adminStatsService.getDashboardStats();

        // Transform stats to the format expected by StatsOverview
        const formattedMetrics = {
          users: {
            total: metricsData.totalUsers,
            active: metricsData.activeUsers,
            inactivePercentage:
              metricsData.totalUsers > 0
                ? ((metricsData.totalUsers - metricsData.activeUsers) /
                    metricsData.totalUsers) *
                  100
                : 0,
          },
          content: {
            watchlistEntries: metricsData.watchlistEntries,
            matches: metricsData.totalMatches,
          },
          // Add placeholder system data for the system health card
          system: {
            recentErrors: 0,
            uptime: 0,
            memoryUsage: { heapUsed: 0, heapTotal: 0 },
          },
        };

        setMetrics(formattedMetrics);
      } catch (err) {
        setError(
          `Failed to load dashboard metrics: ${err instanceof Error ? err.message : String(err)}`
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const handleRefreshStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Force a refresh by setting the cache bust flag to true
      const metricsData = await adminStatsService.getDashboardStats(true);

      // Transform stats to the format expected by StatsOverview
      const formattedMetrics = {
        users: {
          total: metricsData.totalUsers,
          active: metricsData.activeUsers,
          inactivePercentage:
            metricsData.totalUsers > 0
              ? ((metricsData.totalUsers - metricsData.activeUsers) /
                  metricsData.totalUsers) *
                100
              : 0,
        },
        content: {
          watchlistEntries: metricsData.watchlistEntries,
          matches: metricsData.totalMatches,
        },
        // Add placeholder system data for the system health card
        system: {
          recentErrors: 0,
          uptime: 0,
          memoryUsage: { heapUsed: 0, heapTotal: 0 },
        },
      };

      setMetrics(formattedMetrics);
    } catch (err) {
      setError(
        `Failed to refresh metrics: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = async () => {
    try {
      // Clear the admin stats service cache
      adminStatsService.clearCache();
      // Call the server to clear its cache
      await fetchWithAuth('/api/admin/clear-cache', { method: 'POST' });
      // Refresh metrics after clearing cache
      handleRefreshStats();
    } catch (err) {
      setError(
        `Failed to clear cache: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  };

  if (isLoading && !metrics) {
    return (
      <PageContainer>
        <Loading message="Loading dashboard metrics..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Card variant="primary" accentColor="var(--color-error)">
          <CardContent>
            <Typography variant="body1">{error}</Typography>
            <Button onClick={handleRefreshStats} className={styles.retryButton}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {metrics && (
        <>
          <StatsOverview
            metrics={metrics}
            cards={['users', 'activeUsers', 'content', 'matches']}
          />

          <H3 className={styles.sectionTitle}>Quick Actions</H3>
          <div className={styles.actionButtons}>
            <Button variant="primary" onClick={() => navigate('/users')}>
              Manage Users
            </Button>
            <Button variant="secondary" onClick={() => navigate('/activity')}>
              View Activity Logs
            </Button>
            <Button variant="secondary" onClick={handleRefreshStats}>
              Refresh Stats
            </Button>
            <Button variant="warning" onClick={handleClearCache}>
              Clear System Cache
            </Button>
          </div>

          <H3 className={styles.sectionTitle}>Recent Activity</H3>
          <Grid className={styles.dashboardGrid} columns={2} gap="md">
            <Card>
              <CardContent>
                <H3 gutterBottom>New Users</H3>
                {metrics.recentUsers ? (
                  <div>
                    <Typography variant="body1">
                      {metrics.recentUsers.count} new users in the last{' '}
                      {metrics.recentUsers.days} days
                    </Typography>
                    <Typography
                      variant="body2"
                      className={styles.recentUsersTrend}
                    >
                      {metrics.recentUsers.percentage}%{' '}
                      {metrics.recentUsers.trend === 'up'
                        ? 'increase'
                        : 'decrease'}{' '}
                      from previous period
                    </Typography>
                  </div>
                ) : (
                  <Typography variant="body1">
                    No recent user data available
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <H3 gutterBottom>System Health</H3>
                {metrics.system ? (
                  <>
                    <Typography variant="body1">
                      {metrics.system.status === 'healthy'
                        ? 'All systems operational'
                        : 'Some system issues detected'}
                    </Typography>
                    {metrics.system.recentErrors > 0 && (
                      <Typography
                        variant="body2"
                        className={styles.systemErrorText}
                      >
                        {metrics.system.recentErrors} errors in the last 24
                        hours
                      </Typography>
                    )}
                  </>
                ) : (
                  <Typography variant="body1">
                    System health data unavailable
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <H3 className={styles.sectionTitle}>Admin Resources</H3>
          <Grid className={styles.dashboardGrid} columns={3} gap="md">
            <Card>
              <CardContent>
                <H3 gutterBottom>Documentation</H3>
                <Typography variant="body2" gutterBottom>
                  Access admin documentation and guides
                </Typography>
                <Button
                  variant="text"
                  onClick={() => window.open('/admin/docs', '_blank')}
                >
                  View Docs
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <H3 gutterBottom>Support</H3>
                <Typography variant="body2" gutterBottom>
                  Contact technical support for assistance
                </Typography>
                <Button
                  variant="text"
                  onClick={() => window.open('mailto:support@pairflix.com')}
                >
                  Contact Support
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <H3 gutterBottom>Settings</H3>
                <Typography variant="body2" gutterBottom>
                  Configure system and application settings
                </Typography>
                <Button variant="text" onClick={() => navigate('/settings')}>
                  Open Settings
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Test navigation button */}
          <div
            style={{
              margin: '20px 0',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          >
            <Typography>Test direct navigation:</Typography>
            <div style={{ marginTop: '10px' }}>
              <Link to="/users" className={styles.testNavLink}>
                Go to Users Page
              </Link>
            </div>
          </div>
        </>
      )}
    </PageContainer>
  );
};

export default AdminDashboardContent;
