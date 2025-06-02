import { Alert, Badge, Button, Card, CardContent, FilterGroup, FilterItem, Grid, Input, Pagination, Select, Table, TableActionButton, TableBody, TableCell, TableContainer, TableHead, TableHeaderCell } from '@pairflix/components'
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
;
;
;
;
;
;
;
;
;
;
import { admin } from '../../../../services/api';
import { AuditLog, AuditLogStats } from '../../../../services/api/admin';

// Styled components
const StatsGrid = styled(Grid)`
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	gap: ${({ theme }) => theme.spacing.md};
	margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const LogsTable = styled(Card)`
	overflow: hidden;
`;

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
	const [logs, setLogs] = useState<AuditLog[]>([]);
	const [sources, setSources] = useState<string[]>([]);
	const [stats, setStats] = useState<AuditLogStats | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [totalCount, setTotalCount] = useState(0);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	// Filter states
	const [selectedLevel, setSelectedLevel] = useState<string>('');
	const [selectedSource, setSelectedSource] = useState<string>('');
	const [startDate, setStartDate] = useState<string>('');
	const [endDate, setEndDate] = useState<string>('');
	const [page, setPage] = useState(1);
	const limit = 20;

	// Load initial data
	useEffect(() => {
		const fetchInitialData = async () => {
			try {
				setIsLoading(true);
				setError(null);

				// Get log sources for filter dropdown
				const sourcesData = await admin.audit.getSources();
				setSources(sourcesData.sources);

				// Get audit log statistics
				const statsData = await admin.audit.getStats();
				setStats(statsData.stats);

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
	}, []);

	// Re-fetch logs when page changes
	useEffect(() => {
		if (!isLoading) {
			fetchLogs();
		}
	}, [page]);

	// Fetch logs based on current filters
	const fetchLogs = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const offset = (page - 1) * limit;

			let response;
			// Fix TypeScript error by properly handling optional parameters
			const params: {
				limit: number;
				offset: number;
				source?: string;
				startDate?: string;
				endDate?: string;
			} = {
				limit,
				offset,
			};

			// Only add optional parameters if they have values
			if (selectedSource) params.source = selectedSource;
			if (startDate) params.startDate = startDate;
			if (endDate) params.endDate = endDate;

			try {
				if (selectedLevel) {
					response = await admin.audit.getByLevel(selectedLevel, params);
				} else {
					response = await admin.audit.getLogs(params);
				}

				// Check if response and response.data exist
				if (response && response.data) {
					setLogs(response.data);
					if (response.pagination) {
						setTotalCount(response.pagination.total);
					} else {
						setTotalCount(0);
					}
				} else {
					// Handle case where response.data is undefined
					console.error('Invalid API response format:', response);
					setLogs([]);
					setTotalCount(0);
					setError('Failed to load logs: Invalid response format from API');
				}
			} catch (apiErr) {
				console.error('API error:', apiErr);
				setLogs([]);
				setTotalCount(0);
				throw apiErr;
			}
		} catch (err) {
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
		setSelectedSource('');
		setStartDate('');
		setEndDate('');
		setPage(1);
	};

	// Run log rotation
	const runLogRotation = async () => {
		try {
			setIsLoading(true);
			setError(null);
			setSuccessMessage(null);

			const result = await admin.audit.rotate();
			setSuccessMessage(result.message);

			// Refresh stats after rotation
			const statsData = await admin.audit.getStats();
			setStats(statsData.stats);

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
				<StatsGrid>
					<Card variant='stats' title='Total Logs' value={stats.total} />
					<Card
						variant='stats'
						title='Errors'
						value={stats.byLevel.error || 0}
						valueColor='var(--color-error)'
					/>
					<Card
						variant='stats'
						title='Warnings'
						value={stats.byLevel.warn || 0}
						valueColor='var(--color-warning)'
					/>
					<Card
						variant='stats'
						title='Info Logs'
						value={stats.byLevel.info || 0}
						valueColor='var(--color-primary)'
					/>
				</StatsGrid>
			)}

			{/* Success Message */}
			{successMessage && (
				<Alert variant='success' onClose={() => setSuccessMessage(null)}>
					{successMessage}
				</Alert>
			)}

			{/* Error Message */}
			{error && (
				<Alert variant='error' onClose={() => setError(null)}>
					{error}
				</Alert>
			)}

			{/* Filters */}
			<FilterGroup
				title='Filter Logs'
				onApply={applyFilters}
				onClear={clearFilters}
				actionComponent={
					<Button variant='danger' onClick={runLogRotation}>
						Run Log Rotation
					</Button>
				}
			>
				<FilterItem label='Level'>
					<Select
						value={selectedLevel}
						onChange={(e) => setSelectedLevel(e.target.value)}
						fullWidth
					>
						<option value=''>All Levels</option>
						<option value='info'>Info</option>
						<option value='warn'>Warning</option>
						<option value='error'>Error</option>
						<option value='debug'>Debug</option>
					</Select>
				</FilterItem>

				<FilterItem label='Source'>
					<Select
						value={selectedSource}
						onChange={(e) => setSelectedSource(e.target.value)}
						fullWidth
					>
						<option value=''>All Sources</option>
						{sources.map((source) => (
							<option key={source} value={source}>
								{source}
							</option>
						))}
					</Select>
				</FilterItem>

				<FilterItem label='Start Date'>
					<Input
						type='date'
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
						fullWidth
					/>
				</FilterItem>

				<FilterItem label='End Date'>
					<Input
						type='date'
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
						fullWidth
					/>
				</FilterItem>
			</FilterGroup>

			{/* Logs Table */}
			<LogsTable>
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
										<TableCell colSpan={5} style={{ textAlign: 'center' }}>
											Loading...
										</TableCell>
									</tr>
								) : logs.length === 0 ? (
									<tr>
										<TableCell colSpan={5} style={{ textAlign: 'center' }}>
											No logs found
										</TableCell>
									</tr>
								) : (
									logs.map((log) => (
										<tr key={log.log_id}>
											<TableCell>
												<Badge variant={getLevelVariant(log.level)}>
													{log.level}
												</Badge>
											</TableCell>
											<TableCell>{log.message}</TableCell>
											<TableCell>{log.source}</TableCell>
											<TableCell>{formatDate(log.created_at)}</TableCell>
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
			</LogsTable>
		</>
	);
};

export default AuditLogContent;
