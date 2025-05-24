import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Loading } from '../components/common/Loading';
import { H1 } from '../components/common/Typography';
import { admin } from '../services/api';

const LogGrid = styled.div`
	margin-top: 20px;
`;

const LogEntry = styled.div`
	background-color: ${({ theme }) => theme.colors.background.secondary};
	border-radius: ${({ theme }) => theme.borderRadius.sm};
	padding: ${({ theme }) => theme.spacing.md};
	margin-bottom: ${({ theme }) => theme.spacing.sm};
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const LogLevel = styled.span<{ level: string }>`
	padding: 4px 8px;
	border-radius: 12px;
	font-size: 0.75rem;
	font-weight: 500;
	margin-right: ${({ theme }) => theme.spacing.sm};
	background-color: ${({ level, theme }) => {
		switch (level) {
			case 'info':
				return theme.colors.info.light;
			case 'warn':
				return theme.colors.warning.light;
			case 'error':
				return theme.colors.error.light;
			case 'debug':
				return theme.colors.secondary.light;
			default:
				return theme.colors.secondary.light;
		}
	}};
	color: ${({ level, theme }) => {
		switch (level) {
			case 'info':
				return theme.colors.info.dark;
			case 'warn':
				return theme.colors.warning.dark;
			case 'error':
				return theme.colors.error.dark;
			case 'debug':
				return theme.colors.secondary.dark;
			default:
				return theme.colors.secondary.dark;
		}
	}};
`;

const Timestamp = styled.span`
	color: ${({ theme }) => theme.colors.text.secondary};
	font-size: 0.875rem;
`;

interface AuditLog {
	log_id: string;
	level: 'info' | 'warn' | 'error' | 'debug';
	message: string;
	source: string;
	context: any;
	created_at: string;
}

const AuditLogs: React.FC = () => {
	const [logs, setLogs] = useState<AuditLog[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchLogs = async () => {
			try {
				setIsLoading(true);
				setError(null);

				const response = await admin.getAuditLogs({
					limit: 50,
					offset: 0,
				});

				setLogs(response.logs || []);
			} catch (err) {
				console.error('Error fetching audit logs:', err);
				setError('Failed to fetch audit logs. Please try again.');
			} finally {
				setIsLoading(false);
			}
		};

		fetchLogs();
	}, []);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString();
	};

	return (
		<div>
			<H1>Audit Logs</H1>
			<p>View system audit logs and events.</p>

			{error && (
				<div
					style={{
						padding: '10px',
						backgroundColor: '#ffeeee',
						color: '#d32f2f',
						borderRadius: '4px',
						marginBottom: '20px',
					}}
				>
					{error}
				</div>
			)}

			{isLoading ? (
				<Loading message='Loading audit logs...' />
			) : (
				<LogGrid>
					{logs.length > 0 ? (
						logs.map((log) => (
							<LogEntry key={log.log_id}>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										marginBottom: '8px',
									}}
								>
									<LogLevel level={log.level}>{log.level}</LogLevel>
									<Timestamp>{formatDate(log.created_at)}</Timestamp>
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
							</LogEntry>
						))
					) : (
						<div>No audit logs found.</div>
					)}
				</LogGrid>
			)}
		</div>
	);
};

export default AuditLogs;
