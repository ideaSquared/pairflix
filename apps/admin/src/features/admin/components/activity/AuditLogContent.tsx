import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  FilterGroup,
  FilterItem,
  Grid,
  Pagination,
  Select,
  Table,
  TableActionButton,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeaderCell,
} from '@pairflix/components';
import React, { useEffect, useState } from 'react';
import { admin } from '../../../../services/api';
import type {
  AuditLogEntry,
  AuditLogLevel,
  AuditLogStats,
} from '../../../../services/api/admin';
import * as styles from './AuditLogContent.css';

// Convert level to badge variant
const getLevelVariant = (
  level: string
): 'error' | 'warning' | 'info' | 'default' => {
  switch (level) {
    case 'error':
      return 'error';
    case 'warn':
      return 'warning';
    case 'info':
      return 'info';
    case 'debug':
    default:
      return 'default';
  }
};

const AuditLogContent: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter states
  const [selectedLevel, setSelectedLevel] = useState<AuditLogLevel | ''>('');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Load initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get audit log statistics
        const statsData = await admin.auditLogs.stats();
        setStats(statsData);

        // Get logs with current filters
        await fetchLogs();
      } catch (err) {
        setError(
          'Failed to load dashboard data: ' +
            (err instanceof Error ? err.message : String(err))
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch logs when page changes
  useEffect(() => {
    if (!isLoading) {
      fetchLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Fetch logs based on current filters
  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = { page, limit };
      const response = selectedLevel
        ? await admin.auditLogs.byLevel(selectedLevel, params)
        : await admin.auditLogs.list(params);

      setLogs(response.data);
      setTotalCount(response.pagination.total);
    } catch (err) {
      console.error('API error:', err);
      setLogs([]);
      setTotalCount(0);
      setError(
        'Failed to load logs: ' +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    setPage(1); // Reset to first page when filters change
    fetchLogs();
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedLevel('');
    setPage(1);
  };

  // Run log rotation
  const runLogRotation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      const deleted = await admin.auditLogs.rotate();
      const totalDeleted = Object.values(deleted).reduce(
        (sum, count) => sum + count,
        0
      );
      setSuccessMessage(
        `Log rotation complete: ${totalDeleted} entries removed.`
      );

      // Refresh stats after rotation
      const statsData = await admin.auditLogs.stats();
      setStats(statsData);

      // Reload logs
      fetchLogs();
    } catch (err) {
      setError(
        'Failed to run log rotation: ' +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <>
      {/* Stats Cards */}
      {stats && (
        <Grid className={styles.statsGrid}>
          <Card variant="stats" title="Total Logs" value={stats.total} />
          <Card
            variant="stats"
            title="Errors"
            value={stats.byLevel.error || 0}
            valueColor="var(--color-error)"
          />
          <Card
            variant="stats"
            title="Warnings"
            value={stats.byLevel.warn || 0}
            valueColor="var(--color-warning)"
          />
          <Card
            variant="stats"
            title="Info Logs"
            value={stats.byLevel.info || 0}
            valueColor="var(--color-primary)"
          />
        </Grid>
      )}

      {/* Success Message */}
      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <FilterGroup
        title="Filter Logs"
        onApply={applyFilters}
        onClear={clearFilters}
        actionComponent={
          <Button variant="danger" onClick={runLogRotation}>
            Run Log Rotation
          </Button>
        }
      >
        <FilterItem label="Level">
          <Select
            value={selectedLevel}
            onChange={e =>
              setSelectedLevel(e.target.value as AuditLogLevel | '')
            }
            isFullWidth
          >
            <option value="">All Levels</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
            <option value="debug">Debug</option>
          </Select>
        </FilterItem>
      </FilterGroup>

      {/* Logs Table */}
      <Card className={styles.logsTable}>
        <CardContent noPadding>
          <TableContainer>
            <Table>
              <TableHead>
                <tr>
                  <TableHeaderCell>Level</TableHeaderCell>
                  <TableHeaderCell>Message</TableHeaderCell>
                  <TableHeaderCell>Source</TableHeaderCell>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>Details</TableHeaderCell>
                </tr>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <tr>
                    <TableCell colSpan={5} align="center">
                      Loading...
                    </TableCell>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <TableCell colSpan={5} align="center">
                      No logs found
                    </TableCell>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id}>
                      <TableCell>
                        <Badge variant={getLevelVariant(log.level)}>
                          {log.level}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.message}</TableCell>
                      <TableCell>{log.source}</TableCell>
                      <TableCell>{formatDate(log.createdAt)}</TableCell>
                      <TableCell>
                        <TableActionButton
                          onClick={() =>
                            alert(JSON.stringify(log.context, null, 2))
                          }
                        >
                          View
                        </TableActionButton>
                      </TableCell>
                    </tr>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {!isLoading && totalCount > 0 && (
            <Pagination
              page={page}
              totalCount={totalCount}
              limit={limit}
              onPageChange={setPage}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default AuditLogContent;
