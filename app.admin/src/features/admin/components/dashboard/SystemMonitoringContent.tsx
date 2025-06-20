import {
  Button,
  Card,
  CardContent,
  Grid,
  H3,
  Loading,
  Typography,
} from '@pairflix/components';
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import React, { useCallback, useEffect, useState } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import styled from 'styled-components';
import { adminStatsService } from '../../../../services/adminStats.service';
import { SystemStats } from '../../../../services/api/admin';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);
// Styled components
const RefreshButton = styled(Button)`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const LastUpdated = styled(Typography)`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StatsCard = styled(Card)`
  h3 {
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
`;

const Metric = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const MetricName = styled(Typography)`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const MetricValue = styled(Typography)<{
  warning?: boolean;
  critical?: boolean;
}>`
  font-size: 1.5rem;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme, warning, critical }) => {
    if (critical) return theme.colors.error;
    if (warning) return theme.colors.warning;
    return theme.colors.text;
  }};
`;

const MetricChart = styled.div`
  height: 160px;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

// Helper function to generate CPU usage history data
const generateCpuHistoryData = (currentUsage: number) => {
  // Generate mock historical data based on current usage
  const now = new Date();
  const data = [];
  for (let i = 10; i >= 0; i--) {
    // Create slightly variable data points based on current value
    const variance = Math.random() * 10 - 5; // -5 to +5 variance
    const usage = Math.max(0, Math.min(100, currentUsage + variance));

    const time = new Date(now.getTime() - i * 5 * 60000); // Every 5 minutes
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      usage: parseFloat(usage.toFixed(1)),
    });
  }
  return data;
};

// Helper function to generate memory usage history data
const generateMemoryHistoryData = (usedPercent: number) => {
  // Generate mock historical data based on current usage
  const now = new Date();
  const data = [];
  for (let i = 10; i >= 0; i--) {
    // Create slightly variable data points based on current value
    const variance = Math.random() * 8 - 4; // -4 to +4 variance
    const usage = Math.max(0, Math.min(100, usedPercent + variance));

    const time = new Date(now.getTime() - i * 5 * 60000); // Every 5 minutes
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      usage: parseFloat(usage.toFixed(1)),
    });
  }
  return data;
};

// Helper function to generate disk usage data for pie chart
const generateDiskUsageData = (used: number, free: number) => {
  return [
    { name: 'Used', value: used },
    { name: 'Free', value: free },
  ];
};

// Helper function to generate user activity data
const generateUserActivityData = (current: number) => {
  // Generate mock historical data
  const now = new Date();
  const data = [];
  for (let i = 23; i >= 0; i--) {
    // Create variable data points based on current values
    const hourOfDay = (now.getHours() - i) % 24;
    // More users during business hours (9am-6pm)
    const factor =
      hourOfDay >= 9 && hourOfDay <= 18
        ? 1 + Math.sin((hourOfDay - 9) * (Math.PI / 9)) * 0.5
        : 0.5;

    const activeUsers = Math.round(
      current * factor * (0.7 + Math.random() * 0.6)
    );
    const time = new Date(now.getTime() - i * 60 * 60000); // Every hour

    data.push({
      time: time.getHours() + ':00',
      users: activeUsers,
    });
  }
  return data;
};

// Types and interfaces
type AlertSeverity = 'warning' | 'critical' | 'info';

interface SystemAlert {
  severity: AlertSeverity;
  message: string;
  details: string;
  timestamp: Date;
}

// System monitoring data interface
interface SystemMonitoringData {
  cpu: {
    usage: number;
    loadAvg: number[];
    cores: number;
    model: string;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usedPercent: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usedPercent: number;
  };
  network: {
    received: number;
    transmitted: number;
  };
  process: {
    uptime: number;
    nodeVersion: string;
    pid: number;
  };
  connections: {
    current: number;
    peak24h: number;
    total24h: number;
  };
  alerts: SystemAlert[];
}

const SystemMonitoringContent: React.FC = () => {
  const [monitoringData, setMonitoringData] =
    useState<SystemMonitoringData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Function to fetch monitoring data
  const fetchMonitoringData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use our central stats service that connects to the backend
      const data = await adminStatsService.getSystemStats(true); // Force refresh

      // Transform the data to match our local type structure
      const formattedData: SystemMonitoringData = {
        cpu: {
          // Use load average as CPU usage when usagePercent is not available
          usage: Number(
            data.system?.memory?.usagePercent ||
              Math.min(
                100,
                ((data.system?.os?.loadAvg?.[0] || 0) * 100) /
                  Math.max(1, data.system?.cpu?.cores || 1)
              )
          ),
          loadAvg: data.system?.os?.loadAvg || [0, 0, 0],
          cores: data.system?.cpu?.cores || 1,
          model: data.system?.cpu?.model || 'Unknown',
        },
        memory: {
          total: data.system?.memory?.total || 0,
          used: data.system?.memory?.total
            ? data.system.memory.total - data.system.memory.free
            : 0,
          free: data.system?.memory?.free || 0,
          usedPercent: data.system?.memory?.usagePercent || 0,
        },
        disk: {
          total: data.database?.size?.bytes || 0,
          used: data.database?.size?.bytes
            ? Math.floor((data.database.size.bytes * 70) / 100) // Use 70% as default storage usage
            : 0,
          free: data.database?.size?.bytes
            ? Math.floor(data.database.size.bytes * 0.3) // Remaining 30%
            : 0,
          usedPercent: 70, // Fixed default percentage
        },
        network: {
          received: data.system?.process?.memoryUsage?.rss || 0,
          transmitted: data.system?.process?.memoryUsage?.external || 0,
        },
        process: {
          // Track uptime in a more container-friendly way
          // Keep the hour conversion but add minimum time for better display
          uptime: Math.max(
            0.1,
            Math.floor((data.system?.process?.uptime || 0) / 3600)
          ),
          nodeVersion: data.system?.process?.nodeVersion || 'Unknown',
          pid: data.system?.process?.pid || 0,
        },
        connections: {
          current: data.database?.activeUsers || 0,
          peak24h: data.database?.totalUsers || 0,
          total24h:
            data.database?.contentStats?.matches ||
            Math.round(data.database?.totalUsers * 1.5) ||
            0,
        },
        alerts: generateSystemAlerts(data), // Generate alerts based on thresholds
      };

      setMonitoringData(formattedData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        `Failed to load monitoring data: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate system alerts based on monitoring thresholds
  const generateSystemAlerts = (data: SystemStats): SystemAlert[] => {
    const alerts: SystemAlert[] = [];

    // CPU usage alert
    const cpuUsage =
      (data.system?.os?.loadAvg?.[0] * 100) / data.system?.cpu?.cores || 0;
    if (cpuUsage > 90) {
      alerts.push({
        severity: 'critical',
        message: 'High CPU Usage',
        details: `Current CPU usage is at ${cpuUsage.toFixed(1)}%, which may impact system performance.`,
        timestamp: new Date(),
      });
    } else if (cpuUsage > 75) {
      alerts.push({
        severity: 'warning',
        message: 'Elevated CPU Usage',
        details: `CPU usage is at ${cpuUsage.toFixed(1)}%, which is above optimal levels.`,
        timestamp: new Date(),
      });
    }

    // Memory usage alert
    const memUsage = data.system?.memory?.usagePercent || 0;
    if (memUsage > 90) {
      alerts.push({
        severity: 'critical',
        message: 'Critical Memory Usage',
        details: `Memory usage is at ${memUsage.toFixed(1)}%, which could lead to system instability.`,
        timestamp: new Date(),
      });
    } else if (memUsage > 80) {
      alerts.push({
        severity: 'warning',
        message: 'High Memory Usage',
        details: `Memory usage is at ${memUsage.toFixed(1)}%, consider optimizing application memory usage.`,
        timestamp: new Date(),
      });
    }

    // Error rate alert
    if (data.database?.errorCount > 10) {
      alerts.push({
        severity: 'critical',
        message: 'High Error Rate',
        details: `There are ${data.database?.errorCount} recent errors reported in the system logs.`,
        timestamp: new Date(),
      });
    } else if (data.database?.errorCount > 5) {
      alerts.push({
        severity: 'warning',
        message: 'Increased Error Rate',
        details: `There are ${data.database?.errorCount} recent errors reported in the system logs.`,
        timestamp: new Date(),
      });
    }

    return alerts;
  };

  // Set up auto-refresh
  useEffect(() => {
    fetchMonitoringData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchMonitoringData();
    }, 30000);

    // Clean up on unmount
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [fetchMonitoringData]);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchMonitoringData();
  };

  // Format memory sizes
  const formatMemory = (bytes: number): string => {
    if (!bytes || isNaN(bytes)) return '0 B';

    const mb = bytes / (1024 * 1024);
    if (mb < 1000) {
      return `${mb.toFixed(1)} MB`;
    }
    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
  };

  // Format CPU usage
  const formatCpuUsage = (usage: number): string => {
    return `${usage.toFixed(1)}%`;
  };

  // Format date
  const formatDate = (date: Date): string => {
    return date.toLocaleTimeString();
  };

  // Format time duration (seconds to readable format)
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days !== 1 ? 's' : ''}, ${hours % 24} hr${
        hours % 24 !== 1 ? 's' : ''
      }`;
    }
    return `${hours} hr${hours !== 1 ? 's' : ''}, ${minutes} min${
      minutes !== 1 ? 's' : ''
    }`;
  };

  // Determine warning/critical states
  const isWarning = (value: number, threshold: number): boolean => {
    return value >= threshold * 0.7 && value < threshold * 0.9;
  };

  const isCritical = (value: number, threshold: number): boolean => {
    return value >= threshold * 0.9;
  };

  if (isLoading && !monitoringData) {
    return <Loading message="Loading system monitoring data..." />;
  }

  if (error) {
    return (
      <Card variant="primary" accentColor="var(--color-error)">
        <CardContent>
          <Typography variant="body1">{error}</Typography>
          <Button onClick={handleRefresh} style={{ marginTop: '1rem' }}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <RefreshButton variant="secondary" onClick={handleRefresh}>
        <i className="fas fa-sync-alt" style={{ marginRight: '0.5rem' }} />
        Refresh Data
      </RefreshButton>

      <LastUpdated variant="body2">
        Last updated: {formatDate(lastUpdated)}
      </LastUpdated>

      {monitoringData && (
        <>
          {/* System Overview */}
          <Grid columns={2} gap="md">
            <StatsCard>
              <CardContent>
                <H3>CPU Usage</H3>
                <Metric>
                  <MetricName variant="body2">Current Usage</MetricName>
                  <MetricValue
                    warning={isWarning(monitoringData.cpu.usage, 90)}
                    critical={isCritical(monitoringData.cpu.usage, 90)}
                  >
                    {formatCpuUsage(monitoringData.cpu.usage)}
                  </MetricValue>
                </Metric>
                <Metric>
                  <MetricName variant="body2">Average Load (1m)</MetricName>
                  <Typography>
                    {monitoringData.cpu.loadAvg[0].toFixed(2)}
                  </Typography>
                </Metric>
                <Metric>
                  <MetricName variant="body2">Cores</MetricName>
                  <Typography>{monitoringData.cpu.cores}</Typography>
                </Metric>
                <MetricChart>
                  <Line
                    data={{
                      labels: generateCpuHistoryData(
                        monitoringData.cpu.usage
                      ).map(item => item.time),
                      datasets: [
                        {
                          label: 'CPU Usage',
                          data: generateCpuHistoryData(
                            monitoringData.cpu.usage
                          ).map(item => item.usage),
                          borderColor: '#8884d8',
                          backgroundColor: 'rgba(136, 132, 216, 0.3)',
                          fill: true,
                          tension: 0.1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                        },
                      },
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          callbacks: {
                            label: context => `${context.parsed.y}% CPU Usage`,
                          },
                        },
                      },
                    }}
                  />
                </MetricChart>
              </CardContent>
            </StatsCard>

            <StatsCard>
              <CardContent>
                <H3>Memory Usage</H3>
                <Metric>
                  <MetricName variant="body2">Used / Total</MetricName>
                  <MetricValue
                    warning={isWarning(monitoringData.memory.usedPercent, 90)}
                    critical={isCritical(monitoringData.memory.usedPercent, 90)}
                  >
                    {formatMemory(monitoringData.memory.used)} /{' '}
                    {formatMemory(monitoringData.memory.total)}
                  </MetricValue>
                </Metric>
                <Metric>
                  <MetricName variant="body2">Usage</MetricName>
                  <Typography>
                    {monitoringData.memory.usedPercent.toFixed(1)}%
                  </Typography>
                </Metric>
                <Metric>
                  <MetricName variant="body2">Free</MetricName>
                  <Typography>
                    {formatMemory(monitoringData.memory.free)}
                  </Typography>
                </Metric>
                <MetricChart>
                  <Line
                    data={{
                      labels: generateMemoryHistoryData(
                        monitoringData.memory.usedPercent
                      ).map(item => item.time),
                      datasets: [
                        {
                          label: 'Memory Usage',
                          data: generateMemoryHistoryData(
                            monitoringData.memory.usedPercent
                          ).map(item => item.usage),
                          borderColor: '#82ca9d',
                          backgroundColor: 'rgba(130, 202, 157, 0.3)',
                          fill: true,
                          tension: 0.1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                        },
                      },
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          callbacks: {
                            label: context =>
                              `${context.parsed.y}% Memory Usage`,
                          },
                        },
                      },
                    }}
                  />
                </MetricChart>
              </CardContent>
            </StatsCard>
          </Grid>

          {/* Detailed System Stats */}
          <Grid columns={3} gap="md" style={{ marginTop: '1.5rem' }}>
            <StatsCard>
              <CardContent>
                <H3>Database Stats</H3>
                <Metric>
                  <MetricName variant="body2">Database Size</MetricName>
                  <Typography>
                    {formatMemory(monitoringData.disk.total)}
                  </Typography>
                </Metric>
                <Metric>
                  <MetricName variant="body2">Usage</MetricName>
                  <MetricValue
                    warning={isWarning(monitoringData.disk.usedPercent, 85)}
                    critical={isCritical(monitoringData.disk.usedPercent, 95)}
                  >
                    {monitoringData.disk.usedPercent.toFixed(1)}%
                  </MetricValue>
                </Metric>
                <MetricChart>
                  <Pie
                    data={{
                      labels: generateDiskUsageData(
                        monitoringData.disk.used,
                        monitoringData.disk.free
                      ).map(item => item.name),
                      datasets: [
                        {
                          data: generateDiskUsageData(
                            monitoringData.disk.used,
                            monitoringData.disk.free
                          ).map(item => item.value),
                          backgroundColor: ['#8884d8', '#82ca9d'],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom' as const,
                        },
                      },
                    }}
                  />
                </MetricChart>
              </CardContent>
            </StatsCard>

            <StatsCard>
              <CardContent>
                <H3>Node.js Process</H3>
                <Metric>
                  <MetricName variant="body2">Heap Memory</MetricName>
                  <Typography>
                    {formatMemory(monitoringData.network.received)}
                  </Typography>
                </Metric>
                <Metric>
                  <MetricName variant="body2">External Memory</MetricName>
                  <Typography>
                    {formatMemory(monitoringData.network.transmitted)}
                  </Typography>
                </Metric>
              </CardContent>
            </StatsCard>

            <StatsCard>
              <CardContent>
                <H3>Server Info</H3>
                <Metric>
                  <MetricName variant="body2">Uptime</MetricName>
                  <Typography>
                    {formatDuration(monitoringData.process.uptime * 3600)}
                  </Typography>
                </Metric>
                <Metric>
                  <MetricName variant="body2">Node Version</MetricName>
                  <Typography>{monitoringData.process.nodeVersion}</Typography>
                </Metric>
                <Metric>
                  <MetricName variant="body2">Process ID</MetricName>
                  <Typography>{monitoringData.process.pid}</Typography>
                </Metric>
              </CardContent>
            </StatsCard>
          </Grid>

          {/* Active Users */}
          <H3 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
            User Activity
          </H3>
          <StatsCard>
            <CardContent>
              <Grid columns={3} gap="md">
                <Metric>
                  <MetricName variant="body2">Active Users</MetricName>
                  <MetricValue>
                    {monitoringData.connections.current}
                  </MetricValue>
                </Metric>
                <Metric>
                  <MetricName variant="body2">Total Users</MetricName>
                  <Typography>{monitoringData.connections.peak24h}</Typography>
                </Metric>
                <Metric>
                  <MetricName variant="body2">User Sessions (24h)</MetricName>
                  <Typography>{monitoringData.connections.total24h}</Typography>
                </Metric>
              </Grid>
              <MetricChart>
                <Line
                  data={{
                    labels: generateUserActivityData(
                      monitoringData.connections.current
                    ).map(item => item.time),
                    datasets: [
                      {
                        label: 'Active Users',
                        data: generateUserActivityData(
                          monitoringData.connections.current
                        ).map(item => item.users),
                        borderColor: '#ffc658',
                        backgroundColor: 'rgba(255, 198, 88, 0.1)',
                        tension: 0.1,
                        pointBackgroundColor: '#ffc658',
                        pointBorderColor: '#ffc658',
                        pointRadius: 4,
                        pointHoverRadius: 8,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }}
                />
              </MetricChart>
            </CardContent>
          </StatsCard>

          {/* System Alerts */}
          {monitoringData.alerts && monitoringData.alerts.length > 0 && (
            <>
              <H3 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                System Alerts
              </H3>
              <StatsCard variant="primary" accentColor="var(--color-warning)">
                <CardContent>
                  {monitoringData.alerts.map(
                    (alert: SystemAlert, index: number) => (
                      <div key={index} style={{ marginBottom: '1rem' }}>
                        <Typography
                          variant="body1"
                          style={{ fontWeight: 'bold' }}
                        >
                          {alert.severity === 'critical'
                            ? '🔴'
                            : alert.severity === 'warning'
                              ? '⚠️'
                              : 'ℹ️'}{' '}
                          {alert.message}
                        </Typography>
                        <Typography variant="body2">{alert.details}</Typography>
                      </div>
                    )
                  )}
                </CardContent>
              </StatsCard>
            </>
          )}
        </>
      )}
    </>
  );
};

export default SystemMonitoringContent;
