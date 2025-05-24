import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { SystemStats } from '../../../services/admin.service';
import { adminStatsService } from '../../../services/adminStats.service';

// Styled components
const PageContainer = styled.div`
	padding-bottom: 2rem;
`;

const PageHeader = styled.div`
	margin-bottom: 2rem;
`;

const H1 = styled.h1`
	color: #ffffff;
	margin-bottom: 0.5rem;
	font-size: 2rem;
`;

const SubHeading = styled.p`
	color: #b3b3b3;
	margin-bottom: 2rem;
	font-size: 1rem;
`;

const MetricsGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
	gap: 1.5rem;
	margin-bottom: 2rem;
`;

const RefreshButton = styled.button`
	background-color: #2196f3;
	color: white;
	border: none;
	padding: 0.5rem 1rem;
	border-radius: 0.25rem;
	cursor: pointer;
	font-size: 0.875rem;
	float: right;

	&:hover {
		background-color: #1976d2;
	}
`;

const SectionTitle = styled.h2`
	margin-top: 1.5rem;
	margin-bottom: 1rem;
	color: #ffffff;
	font-size: 1.25rem;
	padding-bottom: 0.25rem;
	border-bottom: 1px solid #444;
`;

const Card = styled.div`
	background-color: #1e1e1e;
	border-radius: 0.5rem;
	padding: 1.5rem;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h3`
	color: #e0e0e0;
	font-size: 1rem;
	margin-top: 0;
	margin-bottom: 0.5rem;
`;

const StatusLabel = styled.span<{ status: 'good' | 'warning' | 'critical' }>`
	display: inline-block;
	padding: 0.25rem 0.5rem;
	border-radius: 1rem;
	font-size: 0.75rem;
	margin-left: 0.5rem;
	background-color: ${({ status }) => {
		switch (status) {
			case 'good':
				return '#4caf5020';
			case 'warning':
				return '#ff980020';
			case 'critical':
				return '#f4433620';
			default:
				return 'transparent';
		}
	}};
	color: ${({ status }) => {
		switch (status) {
			case 'good':
				return '#4caf50';
			case 'warning':
				return '#ff9800';
			case 'critical':
				return '#f44336';
			default:
				return '#e0e0e0';
		}
	}};
`;

const ProgressBarContainer = styled.div`
	background-color: #333;
	height: 0.5rem;
	border-radius: 0.25rem;
	margin: 0.5rem 0 1rem;
	overflow: hidden;
`;

const ProgressBarFill = styled.div<{
	value: number;
	status: 'good' | 'warning' | 'critical';
}>`
	height: 100%;
	width: ${({ value }) => value}%;
	background-color: ${({ status }) => {
		switch (status) {
			case 'good':
				return '#4caf50';
			case 'warning':
				return '#ff9800';
			case 'critical':
				return '#f44336';
			default:
				return '#4caf50';
		}
	}};
	transition:
		width 0.5s ease-in-out,
		background-color 0.3s;
`;

const StatValue = styled.div`
	font-size: 1.5rem;
	font-weight: 500;
	color: #ffffff;
`;

const StatLabel = styled.div`
	color: #999;
	font-size: 0.875rem;
	margin-top: 0.25rem;
`;

const StatInfo = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: baseline;
	margin-bottom: 0.25rem;
`;

const InfoTable = styled.table`
	width: 100%;
	border-collapse: collapse;
	margin-bottom: 0.5rem;
`;

const InfoTableRow = styled.tr`
	&:not(:last-child) {
		border-bottom: 1px solid #333;
	}
`;

const InfoTableHeader = styled.th`
	text-align: left;
	padding: 0.5rem;
	color: #999;
	font-weight: normal;
	font-size: 0.875rem;
`;

const InfoTableCell = styled.td`
	text-align: right;
	padding: 0.5rem;
	color: #e0e0e0;
	font-size: 0.875rem;
`;

const formatUptime = (seconds: number): string => {
	const days = Math.floor(seconds / (3600 * 24));
	const hours = Math.floor((seconds % (3600 * 24)) / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = Math.floor(seconds % 60);

	const parts = [];
	if (days > 0) parts.push(`${days}d`);
	if (hours > 0) parts.push(`${hours}h`);
	if (minutes > 0) parts.push(`${minutes}m`);
	if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

	return parts.join(' ');
};

const formatBytes = (bytes: number, decimals = 2): string => {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const SystemMonitoringPage: React.FC = () => {
	const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

	useEffect(() => {
		fetchSystemStats();

		// Setup polling every 30 seconds
		const interval = setInterval(() => {
			fetchSystemStats();
		}, 30000);

		return () => clearInterval(interval);
	}, []);

	const fetchSystemStats = async () => {
		try {
			setIsLoading(true);
			const stats = await adminStatsService.getSystemStats();
			setSystemStats(stats);
			setLastRefreshed(new Date());
			setError(null);
		} catch (err) {
			setError(
				`Failed to fetch system stats: ${err instanceof Error ? err.message : String(err)}`
			);
		} finally {
			setIsLoading(false);
		}
	};

	const getStatusFromPercentage = (
		percent: number
	): 'good' | 'warning' | 'critical' => {
		if (percent < 70) return 'good';
		if (percent < 90) return 'warning';
		return 'critical';
	};

	return (
		<PageContainer>
			<PageHeader>
				<RefreshButton onClick={fetchSystemStats}>Refresh Stats</RefreshButton>
				<H1>System Monitoring</H1>
				<SubHeading>
					Monitor system health and performance metrics. Last refreshed:{' '}
					{lastRefreshed.toLocaleString()}
				</SubHeading>
			</PageHeader>

			{isLoading && !systemStats && <p>Loading system metrics...</p>}

			{error && <p style={{ color: '#f44336' }}>{error}</p>}

			{systemStats && (
				<>
					<SectionTitle>System Overview</SectionTitle>

					<MetricsGrid>
						<Card>
							<CardTitle>System Uptime</CardTitle>
							<StatValue>{formatUptime(systemStats.uptime)}</StatValue>
						</Card>

						<Card>
							<CardTitle>
								CPU Usage
								<StatusLabel
									status={getStatusFromPercentage(systemStats.cpu.usage)}
								>
									{systemStats.cpu.usage}%
								</StatusLabel>
							</CardTitle>
							<ProgressBarContainer>
								<ProgressBarFill
									value={systemStats.cpu.usage}
									status={getStatusFromPercentage(systemStats.cpu.usage)}
								/>
							</ProgressBarContainer>
							<InfoTable>
								<tbody>
									<InfoTableRow>
										<InfoTableHeader>CPU Model</InfoTableHeader>
										<InfoTableCell>{systemStats.cpu.model}</InfoTableCell>
									</InfoTableRow>
									<InfoTableRow>
										<InfoTableHeader>Cores</InfoTableHeader>
										<InfoTableCell>{systemStats.cpu.cores}</InfoTableCell>
									</InfoTableRow>
									<InfoTableRow>
										<InfoTableHeader>Load Average</InfoTableHeader>
										<InfoTableCell>
											{systemStats.cpu.load.map((l) => l.toFixed(2)).join(', ')}
										</InfoTableCell>
									</InfoTableRow>
								</tbody>
							</InfoTable>
						</Card>

						<Card>
							<CardTitle>
								Memory Usage
								<StatusLabel
									status={getStatusFromPercentage(
										systemStats.memory.percentage
									)}
								>
									{systemStats.memory.percentage}%
								</StatusLabel>
							</CardTitle>
							<ProgressBarContainer>
								<ProgressBarFill
									value={systemStats.memory.percentage}
									status={getStatusFromPercentage(
										systemStats.memory.percentage
									)}
								/>
							</ProgressBarContainer>
							<StatInfo>
								<StatLabel>Used</StatLabel>
								<StatValue>{formatBytes(systemStats.memory.used)}</StatValue>
							</StatInfo>
							<StatInfo>
								<StatLabel>Free</StatLabel>
								<StatValue>{formatBytes(systemStats.memory.free)}</StatValue>
							</StatInfo>
							<StatInfo>
								<StatLabel>Total</StatLabel>
								<StatValue>{formatBytes(systemStats.memory.total)}</StatValue>
							</StatInfo>
						</Card>

						<Card>
							<CardTitle>
								Disk Usage
								<StatusLabel
									status={getStatusFromPercentage(systemStats.disk.percentage)}
								>
									{systemStats.disk.percentage}%
								</StatusLabel>
							</CardTitle>
							<ProgressBarContainer>
								<ProgressBarFill
									value={systemStats.disk.percentage}
									status={getStatusFromPercentage(systemStats.disk.percentage)}
								/>
							</ProgressBarContainer>
							<StatInfo>
								<StatLabel>Used</StatLabel>
								<StatValue>{formatBytes(systemStats.disk.used)}</StatValue>
							</StatInfo>
							<StatInfo>
								<StatLabel>Free</StatLabel>
								<StatValue>{formatBytes(systemStats.disk.free)}</StatValue>
							</StatInfo>
							<StatInfo>
								<StatLabel>Total</StatLabel>
								<StatValue>{formatBytes(systemStats.disk.total)}</StatValue>
							</StatInfo>
						</Card>
					</MetricsGrid>

					<SectionTitle>Node.js Runtime</SectionTitle>

					<MetricsGrid>
						<Card>
							<CardTitle>Node.js Version</CardTitle>
							<StatValue>{systemStats.nodejs.version}</StatValue>
						</Card>

						<Card>
							<CardTitle>
								Heap Memory Usage
								<StatusLabel
									status={getStatusFromPercentage(
										systemStats.nodejs.memory.percentage
									)}
								>
									{systemStats.nodejs.memory.percentage}%
								</StatusLabel>
							</CardTitle>
							<ProgressBarContainer>
								<ProgressBarFill
									value={systemStats.nodejs.memory.percentage}
									status={getStatusFromPercentage(
										systemStats.nodejs.memory.percentage
									)}
								/>
							</ProgressBarContainer>
							<InfoTable>
								<tbody>
									<InfoTableRow>
										<InfoTableHeader>Heap Used</InfoTableHeader>
										<InfoTableCell>
											{formatBytes(systemStats.nodejs.memory.heapUsed)}
										</InfoTableCell>
									</InfoTableRow>
									<InfoTableRow>
										<InfoTableHeader>Heap Total</InfoTableHeader>
										<InfoTableCell>
											{formatBytes(systemStats.nodejs.memory.heapTotal)}
										</InfoTableCell>
									</InfoTableRow>
									<InfoTableRow>
										<InfoTableHeader>External</InfoTableHeader>
										<InfoTableCell>
											{formatBytes(systemStats.nodejs.memory.external)}
										</InfoTableCell>
									</InfoTableRow>
								</tbody>
							</InfoTable>
						</Card>
					</MetricsGrid>
				</>
			)}
		</PageContainer>
	);
};
