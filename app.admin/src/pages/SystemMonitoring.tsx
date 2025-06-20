import { H1, Typography } from '@pairflix/components';
import React from 'react';
import { SystemMonitoring as SystemMonitoringContent } from '../features/admin';

const SystemMonitoring: React.FC = () => {
  return (
    <div>
      <H1>System Monitoring</H1>
      <Typography gutterBottom>
        Monitor system performance and health metrics in real-time.
      </Typography>

      <SystemMonitoringContent />
    </div>
  );
};

export default SystemMonitoring;
