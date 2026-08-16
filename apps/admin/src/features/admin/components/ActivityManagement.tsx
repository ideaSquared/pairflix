import { Button, H1, Typography } from '@pairflix/components';
import React, { useState } from 'react';
import AuditLogContent from './activity/AuditLogContent';
import UserActivityContent from './activity/UserActivityContent';
import * as styles from './ActivityManagement.css';

// Tab options for the activity page
type ActivityTab = 'audit' | 'user';

/**
 * Unified Activity Management component that combines audit logs and user activity
 */
const ActivityManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActivityTab>('audit');

  const handleTabChange = (tab: ActivityTab) => {
    setActiveTab(tab);
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <H1 gutterBottom>Activity Management</H1>
        <Typography>
          View and filter system logs and user activity data to monitor platform
          usage.
        </Typography>
      </div>

      <div className={styles.tabContainer}>
        <Button
          variant="text"
          className={styles.tabButton({ active: activeTab === 'audit' })}
          onClick={() => handleTabChange('audit')}
        >
          System Logs
        </Button>
        <Button
          variant="text"
          className={styles.tabButton({ active: activeTab === 'user' })}
          onClick={() => handleTabChange('user')}
        >
          User Activity
        </Button>
      </div>

      {activeTab === 'audit' && <AuditLogContent />}
      {activeTab === 'user' && <UserActivityContent />}
    </>
  );
};

export default ActivityManagement;
