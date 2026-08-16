import { H1, Loading } from '@pairflix/components';
import React, { useEffect, useState } from 'react';
import * as styles from './SystemStats.css';
import { admin } from '../services/api';

interface SystemStats {
  database: {
    totalUsers: number;
    newUsers: {
      lastDay: number;
      lastWeek: number;
      lastMonth: number;
    };
    activeUsers: number;
    inactivePercentage: number;
    contentStats: {
      watchlistEntries: number;
      matches: number;
      averageWatchlistPerUser: number;
    };
    errorCount: number;
    size: {
      bytes: number;
      megabytes: number;
    };
  };
  system: {
    os: {
      type: string;
      platform: string;
      arch: string;
      release: string;
      uptime: number;
      loadAvg: number[];
    };
    memory: {
      total: number;
      free: number;
      usagePercent: number;
    };
    cpu: {
      cores: number;
      model: string;
      speed: number;
    };
    process: {
      uptime: number;
      memoryUsage: Record<string, number>;
      nodeVersion: string;
      pid: number;
    };
  };
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.join(' ') || '< 1m';
};

const SystemStats: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await admin.system.getStats();
        setStats(response);
      } catch (error) {
        console.error('Error fetching system stats:', error);
        setError('Failed to fetch system statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();

    // Refresh stats every minute
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) return <Loading message="Loading system statistics..." />;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!stats) return <div>No statistics available.</div>;

  return (
    <div>
      <H1>System Statistics</H1>
      <p>Overview of system performance and usage statistics.</p>

      <div className={styles.statSection}>
        <h2 className={styles.sectionTitle}>User Statistics</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>Total Users</h3>
            <div className={styles.statValue}>
              {stats.database.totalUsers.toLocaleString()}
            </div>
          </div>
          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>Active Users</h3>
            <div className={styles.statValue}>
              {stats.database.activeUsers.toLocaleString()}
            </div>
          </div>
          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>New Users (Last 24h)</h3>
            <div className={styles.statValue}>
              {stats.database.newUsers.lastDay.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.statSection}>
        <h2 className={styles.sectionTitle}>System Health</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>System Uptime</h3>
            <div className={styles.statValue}>
              {formatUptime(stats.system.os.uptime)}
            </div>
          </div>
          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>Memory Usage</h3>
            <div className={styles.statValue}>
              {stats.system.memory.usagePercent.toFixed(1)}%
            </div>
          </div>
          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>CPU Cores</h3>
            <div className={styles.statValue}>{stats.system.cpu.cores}</div>
          </div>
          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>Database Size</h3>
            <div className={styles.statValue}>
              {formatBytes(stats.database.size.bytes)}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.statSection}>
        <h2 className={styles.sectionTitle}>Content Statistics</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>Total Watchlist Entries</h3>
            <div className={styles.statValue}>
              {stats.database.contentStats.watchlistEntries.toLocaleString()}
            </div>
          </div>
          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>Total Matches</h3>
            <div className={styles.statValue}>
              {stats.database.contentStats.matches.toLocaleString()}
            </div>
          </div>
          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>Avg. Watchlist Items per User</h3>
            <div className={styles.statValue}>
              {stats.database.contentStats.averageWatchlistPerUser.toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.statSection}>
        <h2 className={styles.sectionTitle}>System Details</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>Operating System</h3>
            <div
              className={styles.statValue}
            >{`${stats.system.os.type} (${stats.system.os.platform})`}</div>
          </div>
          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>Node.js Version</h3>
            <div className={styles.statValue}>
              {stats.system.process.nodeVersion}
            </div>
          </div>
          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>Architecture</h3>
            <div className={styles.statValue}>{stats.system.os.arch}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStats;
