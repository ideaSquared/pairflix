import { PageContainer, Typography } from '@pairflix/components';
import React from 'react';
import styled from 'styled-components';

import DocumentTitle from '../../components/common/DocumentTitle';
import EtherealCredentials from '../admin/components/EtherealCredentials';

const DeveloperContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const DeveloperPage: React.FC = () => {
  // Check if we're in development environment
  const isDevelopment =
    process.env.NODE_ENV === 'development' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  if (!isDevelopment) {
    return (
      <PageContainer>
        <DocumentTitle title="Developer Tools" />
        <DeveloperContainer>
          <Typography variant="h4" gutterBottom>
            🚫 Not Available in Production
          </Typography>
          <Typography variant="body1">
            Developer tools are only available in development environments.
          </Typography>
        </DeveloperContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <DocumentTitle title="Developer Tools" />
      <DeveloperContainer>
        <Typography variant="h4" gutterBottom>
          🛠️ Developer Tools
        </Typography>
        <Typography variant="body1" gutterBottom>
          Development and testing utilities for PairFlix.
        </Typography>

        <Section>
          <Typography variant="h5" gutterBottom>
            Email Testing
          </Typography>
          <EtherealCredentials />
        </Section>

        {/* Future developer tools can be added here */}
        <Section>
          <Typography variant="h5" gutterBottom>
            🔜 Coming Soon
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Additional developer tools will be added here:
          </Typography>
          <ul>
            <li>API Request Tester</li>
            <li>Database Query Tool</li>
            <li>Log Viewer</li>
            <li>Performance Metrics</li>
          </ul>
        </Section>
      </DeveloperContainer>
    </PageContainer>
  );
};

export default DeveloperPage;
