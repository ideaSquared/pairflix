import { H1, Typography } from '@pairflix/components';
import React from 'react';
import { UnifiedDashboard } from '../features/admin';

const Dashboard: React.FC = () => {
  return (
    <div>
      <H1>Admin Dashboard</H1>
      <Typography gutterBottom>
        Welcome to the PairFlix Admin Dashboard. Monitor system performance and
        manage your application.
      </Typography>

      <UnifiedDashboard />
    </div>
  );
};

export default Dashboard;
