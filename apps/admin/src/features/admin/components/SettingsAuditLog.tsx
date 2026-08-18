import {
  Alert,
  Card,
  CardContent,
  Flex,
  H2,
  H3,
  Loading,
  Typography,
} from '@pairflix/components';
import React, { useEffect, useState } from 'react';
import { admin } from '../../../services/api';
import type { AuditLogEntry } from '../../../services/api/admin';
import * as styles from './SettingsAuditLog.css';

const SettingsAuditLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchSettingsAuditLogs = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // The backend has no server-side source filter, so fetch a recent batch
        // and narrow to admin-sourced entries related to settings changes here.
        const response = await admin.auditLogs.list({ limit: 20 });

        const settingsLogs = response.data.filter(
          (log: AuditLogEntry) =>
            log.source === 'admin' &&
            (log.message.toLowerCase().includes('settings') ||
              (log.context && log.context.changes))
        );

        setLogs(settingsLogs);
      } catch (err) {
        setError(
          'Failed to load settings audit logs: ' +
            (err instanceof Error ? err.message : String(err))
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettingsAuditLogs();
  }, []);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderContext = (context: Record<string, unknown> | null) => {
    if (!context) return null;

    // If there are changes, show them specifically
    if (context.changes) {
      return (
        <>
          <H3>Changes</H3>
          <pre>{JSON.stringify(context.changes, null, 2)}</pre>
        </>
      );
    }

    // Otherwise show the full context
    return <pre>{JSON.stringify(context, null, 2)}</pre>;
  };

  if (isLoading) {
    return <Loading message="Loading settings audit logs..." />;
  }

  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }

  return (
    <div className={styles.auditLogContainer}>
      <H2 gutterBottom>Settings Audit Log</H2>
      <Typography gutterBottom>
        This log shows all changes made to application settings
      </Typography>

      {logs.length === 0 ? (
        <Typography className={styles.noLogEntries}>
          No settings changes have been logged yet
        </Typography>
      ) : (
        logs.map(log => (
          <Card
            key={log.id}
            className={styles.logEntry({ level: log.level })}
            variant="secondary"
          >
            <CardContent>
              <Flex
                className={styles.logHeader}
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h4">{log.message}</Typography>
                <Typography className={styles.logTimestamp}>
                  {formatTimestamp(log.createdAt)}
                </Typography>
              </Flex>
              <div className={styles.logBody}>{renderContext(log.context)}</div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default SettingsAuditLog;
