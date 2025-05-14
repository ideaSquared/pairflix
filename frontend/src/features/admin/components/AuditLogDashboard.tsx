import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../../components/common/Button';
import { Card, CardContent } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Container, Flex, Grid } from '../../../components/common/Layout';
import { Select } from '../../../components/common/Select';
import { H1, H2, H3, Typography } from '../../../components/common/Typography';
import { admin, AuditLog, AuditLogStats } from '../../../services/api';

// Styled components
const DashboardContainer = styled(Container)`
	padding-top: ${({ theme }) => theme.spacing.xl};
	padding-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StatsGrid = styled(Grid)`
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	gap: ${({ theme }) => theme.spacing.md};
	margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const StatsCard = styled(Card)`
	background: ${({ theme }) => theme.colors.background.secondary};
`;

const StatsCardContent = styled(CardContent)`
	display: flex;
	flex-direction: column;
`;

const StatsValue = styled(Typography)`
	font-size: calc(${({ theme }) => theme.typography.fontSize.xl} * 1.5);
	font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const SuccessMessage = styled(Typography)`
	background: ${({ theme }) => theme.colors.text.success}20;
	border: 1px solid ${({ theme }) => theme.colors.text.success};
	color: ${({ theme }) => theme.colors.text.success};
	padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
	border-radius: ${({ theme }) => theme.borderRadius.sm};
	margin-bottom: ${({ theme }) => theme.spacing.md};
	position: relative;
`;

const ErrorMessage = styled(Typography)`
	background: ${({ theme }) => theme.colors.text.error}20;
	border: 1px solid ${({ theme }) => theme.colors.text.error};
	color: ${({ theme }) => theme.colors.text.error};
	padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
	border-radius: ${({ theme }) => theme.borderRadius.sm};
	margin-bottom: ${({ theme }) => theme.spacing.md};
	position: relative;
`;

const CloseButton = styled.button`
	position: absolute;
	top: 0;
	right: 0;
	padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
	background: none;
	border: none;
	cursor: pointer;
	font-size: ${({ theme }) => theme.typography.fontSize.lg};
	color: inherit;
`;

const FiltersCard = styled(Card)`
	margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const FiltersGrid = styled(Grid)`
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: ${({ theme }) => theme.spacing.md};
`;

const FilterLabel = styled.label`
	display: block;
	font-size: ${({ theme }) => theme.typography.fontSize.sm};
	font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
	margin-bottom: ${({ theme }) => theme.spacing.xs};
	color: ${({ theme }) => theme.colors.text.secondary};
`;

const FilterActions = styled(Flex)`
	margin-top: ${({ theme }) => theme.spacing.md};
	justify-content: space-between;
`;

const LogsTable = styled(Card)`
	overflow: hidden;
`;

const TableContainer = styled.div`
	overflow-x: auto;
`;

const Table = styled.table`
	width: 100%;
	border-collapse: collapse;
`;

const TableHead = styled.thead`
	background: ${({ theme }) => theme.colors.background.secondary};
`;

const TableHeaderCell = styled.th`
	padding: ${({ theme }) => theme.spacing.md};
	text-align: left;
	font-size: ${({ theme }) => theme.typography.fontSize.xs};
	font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
	color: ${({ theme }) => theme.colors.text.secondary};
	text-transform: uppercase;
`;

const TableBody = styled.tbody`
	& tr {
		border-top: 1px solid ${({ theme }) => theme.colors.border};
	}
`;

const TableCell = styled.td`
	padding: ${({ theme }) => theme.spacing.md};
	font-size: ${({ theme }) => theme.typography.fontSize.sm};
	vertical-align: middle;
`;

const LevelBadge = styled.span<{ level: string }>`
	display: inline-flex;
	padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
	border-radius: ${({ theme }) => theme.borderRadius.sm};
	font-size: ${({ theme }) => theme.typography.fontSize.xs};
	font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
	background: ${({ level, theme }) => {
		switch (level) {
			case 'error':
				return `${theme.colors.text.error}20`;
			case 'warn':
				return `${theme.colors.text.warning}20`;
			case 'info':
				return `${theme.colors.primary}20`;
			case 'debug':
				return `${theme.colors.text.secondary}20`;
			default:
				return `${theme.colors.text.secondary}20`;
		}
	}};
	color: ${({ level, theme }) => {
		switch (level) {
			case 'error':
				return theme.colors.text.error;
			case 'warn':
				return theme.colors.text.warning;
			case 'info':
				return theme.colors.primary;
			case 'debug':
				return theme.colors.text.secondary;
			default:
				return theme.colors.text.secondary;
		}
	}};
`;

const ViewButton = styled.button`
	background: none;
	border: none;
	color: ${({ theme }) => theme.colors.primary};
	cursor: pointer;
	font-size: ${({ theme }) => theme.typography.fontSize.sm};

	&:hover {
		color: ${({ theme }) => theme.colors.primaryHover};
		text-decoration: underline;
	}
`;

const PaginationContainer = styled(Flex)`
	padding: ${({ theme }) => theme.spacing.md};
	border-top: 1px solid ${({ theme }) => theme.colors.border};
	justify-content: space-between;
	align-items: center;
`;

const PaginationInfo = styled(Typography)`
	color: ${({ theme }) => theme.colors.text.secondary};
	font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const PaginationButton = styled(Button)<{ disabled?: boolean }>`
	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`;

const AuditLogDashboard: React.FC = () => {
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
				const sourcesData = await admin.getLogSources();
				setSources(sourcesData.sources);

				// Get audit log statistics
				const statsData = await admin.getAuditLogStats();
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

			if (selectedLevel) {
				response = await admin.getAuditLogsByLevel(selectedLevel, params);
			} else {
				response = await admin.getAuditLogs(params);
			}

			setLogs(response.logs);
			setTotalCount(response.pagination.total);
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

			const result = await admin.runLogRotation();
			setSuccessMessage(result.message);

			// Refresh stats after rotation
			const statsData = await admin.getAuditLogStats();
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
		<DashboardContainer>
			<H1 gutterBottom>Admin Dashboard - Audit Logs</H1>

			{/* Stats Cards */}
			{stats && (
				<StatsGrid>
					<StatsCard>
						<StatsCardContent>
							<H3>Total Logs</H3>
							<StatsValue>{stats.total.toLocaleString()}</StatsValue>
						</StatsCardContent>
					</StatsCard>
					<StatsCard>
						<StatsCardContent>
							<H3>Errors</H3>
							<StatsValue style={{ color: 'var(--color-error)' }}>
								{(stats.byLevel.error || 0).toLocaleString()}
							</StatsValue>
						</StatsCardContent>
					</StatsCard>
					<StatsCard>
						<StatsCardContent>
							<H3>Warnings</H3>
							<StatsValue style={{ color: 'var(--color-warning)' }}>
								{(stats.byLevel.warn || 0).toLocaleString()}
							</StatsValue>
						</StatsCardContent>
					</StatsCard>
					<StatsCard>
						<StatsCardContent>
							<H3>Info Logs</H3>
							<StatsValue style={{ color: 'var(--color-primary)' }}>
								{(stats.byLevel.info || 0).toLocaleString()}
							</StatsValue>
						</StatsCardContent>
					</StatsCard>
				</StatsGrid>
			)}

			{/* Success Message */}
			{successMessage && (
				<SuccessMessage>
					{successMessage}
					<CloseButton onClick={() => setSuccessMessage(null)}>×</CloseButton>
				</SuccessMessage>
			)}

			{/* Error Message */}
			{error && (
				<ErrorMessage>
					{error}
					<CloseButton onClick={() => setError(null)}>×</CloseButton>
				</ErrorMessage>
			)}

			{/* Filters */}
			<FiltersCard>
				<CardContent>
					<H2 gutterBottom>Filter Logs</H2>
					<FiltersGrid>
						<div>
							<FilterLabel>Level</FilterLabel>
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
						</div>

						<div>
							<FilterLabel>Source</FilterLabel>
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
						</div>

						<div>
							<FilterLabel>Start Date</FilterLabel>
							<Input
								type='date'
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
								fullWidth
							/>
						</div>

						<div>
							<FilterLabel>End Date</FilterLabel>
							<Input
								type='date'
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
								fullWidth
							/>
						</div>
					</FiltersGrid>

					<FilterActions>
						<div>
							<Button
								variant='primary'
								onClick={applyFilters}
								style={{ marginRight: '0.5rem' }}
							>
								Apply Filters
							</Button>
							<Button variant='secondary' onClick={clearFilters}>
								Clear Filters
							</Button>
						</div>

						<Button variant='danger' onClick={runLogRotation}>
							Run Log Rotation
						</Button>
					</FilterActions>
				</CardContent>
			</FiltersCard>

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
												<LevelBadge level={log.level}>{log.level}</LevelBadge>
											</TableCell>
											<TableCell>{log.message}</TableCell>
											<TableCell>{log.source}</TableCell>
											<TableCell>{formatDate(log.created_at)}</TableCell>
											<TableCell>
												<ViewButton
													onClick={() =>
														alert(JSON.stringify(log.context, null, 2))
													}
												>
													View
												</ViewButton>
											</TableCell>
										</tr>
									))
								)}
							</TableBody>
						</Table>
					</TableContainer>

					{/* Pagination */}
					{!isLoading && totalCount > 0 && (
						<PaginationContainer>
							<PaginationInfo>
								Showing {(page - 1) * limit + 1} to{' '}
								{Math.min(page * limit, totalCount)} of {totalCount} results
							</PaginationInfo>
							<Flex gap='sm'>
								<PaginationButton
									variant='secondary'
									onClick={() => setPage(page > 1 ? page - 1 : 1)}
									disabled={page === 1}
									size='small'
								>
									Previous
								</PaginationButton>
								<PaginationButton
									variant='secondary'
									onClick={() => setPage(page + 1)}
									disabled={page * limit >= totalCount}
									size='small'
								>
									Next
								</PaginationButton>
							</Flex>
						</PaginationContainer>
					)}
				</CardContent>
			</LogsTable>
		</DashboardContainer>
	);
};

export default AuditLogDashboard;
