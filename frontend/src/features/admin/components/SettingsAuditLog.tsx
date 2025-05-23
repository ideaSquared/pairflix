import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Alert } from '../../../components/common/Alert';
import { Card, CardContent } from '../../../components/common/Card';
import { Flex } from '../../../components/common/Layout';
import { Loading } from '../../../components/common/Loading';
import { H2, H3, Typography } from '../../../components/common/Typography';
import { admin } from '../../../services/api';

type AuditLogEntry = {
	log_id: string;
	level: 'info' | 'warn' | 'error' | 'debug';
	message: string;
	source: string;
	context: any;
	created_at: string;
};

const AuditLogContainer = styled.div`
	padding: ${({ theme }) => theme.spacing.md} 0;
`;

const LogEntry = styled(Card)<{ level: string }>`
	margin-bottom: ${({ theme }) => theme.spacing.md};
	border-left: 4px solid
		${({ level, theme }) => {
			switch (level) {
				case 'info':
					return theme.colors.success;
				case 'warn':
					return theme.colors.warning;
				case 'error':
					return theme.colors.error;
				default:
					return theme.colors.primary;
			}
		}};
`;

const LogHeader = styled(Flex)`
	padding-bottom: ${({ theme }) => theme.spacing.sm};
	border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
	margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const LogTimestamp = styled(Typography)`
	color: ${({ theme }) => theme.colors.text.secondary};
	font-size: 0.85rem;
`;

const LogBody = styled.div`
	pre {
		background-color: ${({ theme }) => theme.colors.background.secondary};
		padding: ${({ theme }) => theme.spacing.sm};
		border-radius: ${({ theme }) => theme.borderRadius};
		overflow: auto;
		max-height: 300px;
		font-size: 0.9rem;
	}
`;

const NoLogEntries = styled(Typography)`
	text-align: center;
	padding: ${({ theme }) => theme.spacing.lg};
	color: ${({ theme }) => theme.colors.text.secondary};
`;

const SettingsAuditLog: React.FC = () => {
	const [logs, setLogs] = useState<AuditLogEntry[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchSettingsAuditLogs = async () => {
			try {
				setIsLoading(true);
				setError(null);

				// Filter logs that are related to settings changes
				const response = await admin.getAuditLogs({
					source: 'admin-controller',
					limit: 20,
				});

				// Filter logs to only include those related to settings
				const settingsLogs = response.logs.filter(
					(log) =>
						log.message.toLowerCase().includes('settings') ||
						(log.context && log.context.changes)
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

	const renderContext = (context: any) => {
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
		return <Loading message='Loading settings audit logs...' />;
	}

	if (error) {
		return <Alert variant='error'>{error}</Alert>;
	}

	return (
		<AuditLogContainer>
			<H2 gutterBottom>Settings Audit Log</H2>
			<Typography gutterBottom>
				This log shows all changes made to application settings
			</Typography>

			{logs.length === 0 ? (
				<NoLogEntries>No settings changes have been logged yet</NoLogEntries>
			) : (
				logs.map((log) => (
					<LogEntry key={log.log_id} level={log.level} variant='secondary'>
						<CardContent>
							<LogHeader justifyContent='space-between' alignItems='center'>
								<Typography variant='h4'>{log.message}</Typography>
								<LogTimestamp>{formatTimestamp(log.created_at)}</LogTimestamp>
							</LogHeader>
							<LogBody>{renderContext(log.context)}</LogBody>
						</CardContent>
					</LogEntry>
				))
			)}
		</AuditLogContainer>
	);
};

export default SettingsAuditLog;
