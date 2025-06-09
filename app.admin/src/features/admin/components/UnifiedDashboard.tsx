import { Button, H1, Typography } from '@pairflix/components';
import React, { useState } from 'react';
import styled from 'styled-components';
import AdminDashboardContent from './dashboard/AdminDashboardContent';
import SystemMonitoringContent from './dashboard/SystemMonitoringContent';
import SystemStatsContent from './dashboard/SystemStatsContent';

// Styled components
const TabContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  padding-bottom: ${({ theme }) => theme.spacing.md};
`;

const TabButton = styled(Button)<{ active: boolean }>`
  opacity: ${({ active }) => (active ? 1 : 0.7)};
  font-weight: ${({ active, theme }) =>
    active
      ? theme.typography.fontWeight.bold
      : theme.typography.fontWeight.normal};
  background: ${({ active, theme }) =>
    active ? theme.colors.background.highlight : 'transparent'};
`;

const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

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
      <PageHeader>
        <H1 gutterBottom>Admin Dashboard</H1>
        <Typography>
          Manage and monitor your platform with comprehensive statistics and
          controls.
        </Typography>
      </PageHeader>

      <TabContainer>
        <TabButton
          variant="text"
          active={activeTab === 'overview'}
          onClick={() => handleTabChange('overview')}
        >
          Overview
        </TabButton>
        <TabButton
          variant="text"
          active={activeTab === 'monitoring'}
          onClick={() => handleTabChange('monitoring')}
        >
          System Monitoring
        </TabButton>
        <TabButton
          variant="text"
          active={activeTab === 'details'}
          onClick={() => handleTabChange('details')}
        >
          System Details
        </TabButton>
      </TabContainer>

      {activeTab === 'overview' && <AdminDashboardContent />}
      {activeTab === 'monitoring' && <SystemMonitoringContent />}
      {activeTab === 'details' && <SystemStatsContent />}
    </>
  );
};

export default UnifiedDashboard;
