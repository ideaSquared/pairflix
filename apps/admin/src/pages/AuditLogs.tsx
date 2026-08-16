import { H1, Loading, Pagination } from '@pairflix/components';
import React, { useEffect, useState } from 'react';
import * as styles from './AuditLogs.css';
import { admin } from '../services/api';

interface AuditLog {
  log_id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source: string;
  context: Record<string, unknown>;
  created_at: string;
}

// Define expected API response structure

// Define GET parameters interface for type safety
interface GetLogsParams {
  limit: number;
  offset: number;
  startDate?: string;
  endDate?: string;
  source?: string;
}

const ITEMS_PER_PAGE = 50;

const ErrorIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z"
      fill="currentColor"
    />
  </svg>
);

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [dateRange] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});
  const [selectedSource] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params: GetLogsParams = {
          limit: ITEMS_PER_PAGE,
          offset: (page - 1) * ITEMS_PER_PAGE,
          ...(dateRange.startDate && { startDate: dateRange.startDate }),
          ...(dateRange.endDate && { endDate: dateRange.endDate }),
          ...(selectedSource && { source: selectedSource }),
        };

        const response = await admin.audit.getLogs(params);

        // Validate response structure
        if (!response) {
          throw new Error('Empty response received from server');
        }

        // Validate data array exists and is an array
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error(
            'Invalid response format: missing or invalid data array'
          );
        }

        // Validate pagination object exists and has required properties
        if (
          !response.pagination ||
          typeof response.pagination !== 'object' ||
          !('total' in response.pagination) ||
          typeof response.pagination.total !== 'number'
        ) {
          throw new Error(
            'Invalid response format: missing or invalid pagination data'
          );
        }

        // All validation passed, update state
        setLogs(response.data);
        setTotalPages(Math.ceil(response.pagination.total / ITEMS_PER_PAGE));
      } catch (err) {
        console.error('Error fetching audit logs:', err);

        // Provide more specific error messages
        if (err instanceof Error) {
          if (err.message.includes('Invalid response format')) {
            setError(`Failed to load logs: ${err.message}`);
          } else if (
            err.message.includes('NetworkError') ||
            err.message.includes('Failed to fetch')
          ) {
            setError(
              'Network error: Unable to connect to the server. Please check your connection.'
            );
          } else if (
            (err as Error & { status?: number }).status === 401 ||
            (err as Error & { status?: number }).status === 403
          ) {
            setError(
              'Authentication error: You do not have permission to view these logs.'
            );
          } else {
            setError(`Failed to fetch audit logs: ${err.message}`);
          }
        } else {
          setError('Failed to fetch audit logs. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [page, dateRange, selectedSource]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Add a retry function
  const handleRetry = () => {
    // Reset page to first page and trigger a refetch
    setPage(1);
    setError(null);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div>
      <H1>Audit Logs</H1>
      <p>View system audit logs and events.</p>

      {error && (
        <div className={styles.errorDisplay}>
          <ErrorIcon />
          <div>
            <div style={{ fontWeight: 500, marginBottom: '4px' }}>Error</div>
            <div>{error}</div>
            <button className={styles.retryButton} onClick={handleRetry}>
              Retry
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <Loading message="Loading audit logs..." />
      ) : (
        <>
          <div className={styles.logGrid}>
            {logs.length > 0 ? (
              logs.map(log => (
                <div className={styles.logEntry} key={log.log_id}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <span className={styles.logLevel({ level: log.level })}>
                      {log.level}
                    </span>
                    <span className={styles.timestamp}>
                      {formatDate(log.created_at)}
                    </span>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Source:</strong> {log.source}
                  </div>
                  <div style={{ marginBottom: '8px' }}>{log.message}</div>
                  {log.context && (
                    <div
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.03)',
                        padding: '8px',
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                      }}
                    >
                      <pre style={{ margin: 0 }}>
                        {JSON.stringify(log.context, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div>No audit logs found.</div>
            )}
          </div>
          {logs.length > 0 && totalPages > 0 && (
            <div style={{ marginTop: '20px' }}>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                showPageNumbers
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AuditLogs;
