import { PageContainer } from '@pairflix/components';
import React from 'react';
import ActivityFeed from './ActivityFeed';
import * as styles from './ActivityPage.css';

const ActivityPage: React.FC = () => {
  return (
    <PageContainer maxWidth="lg" padding="lg" centered>
      <div className={styles.pageContent}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Activity Feed</h1>
          <p className={styles.description}>
            See what your partner has been watching and their recent activity.
          </p>
        </div>

        <ActivityFeed limit={30} />
      </div>
    </PageContainer>
  );
};

export default ActivityPage;
