import { Button, H1, Typography } from '@pairflix/components';
import React, { useState } from 'react';
import AdminDashboardContent from './dashboard/AdminDashboardContent';
import SystemMonitoringContent from './dashboard/SystemMonitoringContent';
import SystemStatsContent from './dashboard/SystemStatsContent';
import * as styles from './UnifiedDashboard.css';

// Tab options for the dashboard
type DashboardTab = 'overview' | 'monitoring' | 'details';

/**
 * UnifiedDashboard component that combines AdminDashboard, SystemMonitoring, and SystemStats
 * into a single tabbed interface.
 */
const UnifiedDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <H1 gutterBottom>Admin Dashboard</H1>
        <Typography>
          Manage and monitor your platform with comprehensive statistics and
          controls.
        </Typography>
      </div>

      <div className={styles.tabContainer}>
        <Button
          variant="text"
          className={styles.tabButton({ active: activeTab === 'overview' })}
          onClick={() => handleTabChange('overview')}
        >
          Overview
        </Button>
        <Button
          variant="text"
          className={styles.tabButton({ active: activeTab === 'monitoring' })}
          onClick={() => handleTabChange('monitoring')}
        >
          System Monitoring
        </Button>
        <Button
          variant="text"
          className={styles.tabButton({ active: activeTab === 'details' })}
          onClick={() => handleTabChange('details')}
        >
          System Details
        </Button>
      </div>

      {activeTab === 'overview' && <AdminDashboardContent />}
      {activeTab === 'monitoring' && <SystemMonitoringContent />}
      {activeTab === 'details' && <SystemStatsContent />}
    </>
  );
};

export default UnifiedDashboard;
