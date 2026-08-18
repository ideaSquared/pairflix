import {
  Button,
  Card,
  CardContent,
  H3,
  Loading,
  PageContainer,
  Typography,
} from '@pairflix/components';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { admin } from '../../../../services/api';
import type { DashboardStats } from '../../../../services/api/admin';
import StatsOverview from '../shared/StatsOverview';
import * as styles from './AdminDashboardContent.css';

const AdminDashboardContent: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setStats(await admin.dashboard.getStats());
    } catch (err) {
      setError(
        `Failed to load dashboard metrics: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading && !stats) {
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
            <Button onClick={fetchStats} className={styles.retryButton}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {stats && (
        <>
          <StatsOverview metrics={stats} />

          <H3 className={styles.sectionTitle}>Quick Actions</H3>
          <div className={styles.actionButtons}>
            <Button variant="primary" onClick={() => navigate('/users')}>
              Manage Users
            </Button>
            <Button variant="secondary" onClick={() => navigate('/logs')}>
              View Audit Logs
            </Button>
            <Button variant="secondary" onClick={fetchStats}>
              Refresh Stats
            </Button>
          </div>

          <H3 className={styles.sectionTitle}>Admin Resources</H3>
          <div className={styles.actionButtons}>
            <Button variant="text" onClick={() => navigate('/content')}>
              Content Moderation
            </Button>
            <Button variant="text" onClick={() => navigate('/settings')}>
              Settings
            </Button>
          </div>
        </>
      )}
    </PageContainer>
  );
};

export default AdminDashboardContent;
