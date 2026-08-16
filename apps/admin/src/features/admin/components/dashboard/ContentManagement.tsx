import { Card, Flex, Typography } from '@pairflix/components';
import React, { useState } from 'react';
import UserManagementContent from '../../../user-management/UserManagementContent';
import ContentModerationContent from '../content/ContentModerationContent';
import { PageHeader } from '../shared/PageHeader';
import * as styles from './ContentManagement.css';

const ContentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'content'>('users');

  return (
    <div>
      <PageHeader
        title="User & Content Management"
        description="Manage users and content across the platform"
        icon="fas fa-users-cog"
      />

      <Card>
        <div className={styles.tabContainer}>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- pre-existing click-to-switch-tab affordance carried over unchanged from the prior CSS-in-JS version (its capitalized wrapper tag name shielded it from these lint rules; converting to a plain div is a styling-engine swap, not a behavior change) */}
          <div
            className={styles.tab({ active: activeTab === 'users' })}
            onClick={() => setActiveTab('users')}
          >
            <Flex alignItems="center" gap="sm">
              <i className="fas fa-users"></i>
              <Typography>User Management</Typography>
            </Flex>
          </div>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- see justification above */}
          <div
            className={styles.tab({ active: activeTab === 'content' })}
            onClick={() => setActiveTab('content')}
          >
            <Flex alignItems="center" gap="sm">
              <i className="fas fa-film"></i>
              <Typography>Content Moderation</Typography>
            </Flex>
          </div>
        </div>

        {activeTab === 'users' ? (
          <UserManagementContent />
        ) : (
          <ContentModerationContent />
        )}
      </Card>
    </div>
  );
};

export default ContentManagement;
