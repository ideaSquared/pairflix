import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../../../components/common/Button';
import { Card, CardContent } from '../../../../components/common/Card';
import { Grid } from '../../../../components/common/Layout';
import { Loading } from '../../../../components/common/Loading';
import { H3, Typography } from '../../../../components/common/Typography';
import { adminStatsService } from '../../../../services/adminStats.service';

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
		return theme.colors.text.primary;
	}};
`;

const MetricChart = styled.div`
	height: 160px;
	margin-top: ${({ theme }) => theme.spacing.md};
	background-color: ${({ theme }) => theme.colors.background.highlight};
	border-radius: ${({ theme }) => theme.borderRadius.sm};
	display: flex;
	align-items: center;
	justify-content: center;

	/* Placeholder for actual charts */
	&::after {
		content: 'Chart placeholder';
		color: ${({ theme }) => theme.colors.text.secondary};
	}
`;

const SystemMonitoringContent: React.FC = () => {
	const [monitoringData, setMonitoringData] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
	const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(
		null
	);

	// Function to fetch monitoring data
	const fetchMonitoringData = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);

			const data = await adminStatsService.getSystemMetrics();
			setMonitoringData(data);
			setLastUpdated(new Date());
		} catch (err) {
			setError(
				`Failed to load monitoring data: ${err instanceof Error ? err.message : String(err)}`
			);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Set up auto-refresh
	useEffect(() => {
		fetchMonitoringData();

		// Auto-refresh every 30 seconds
		const interval = setInterval(() => {
			fetchMonitoringData();
		}, 30000);

		setRefreshInterval(interval);

		// Clean up on unmount
		return () => {
			if (refreshInterval) {
				clearInterval(refreshInterval);
			}
		};
	}, [fetchMonitoringData]);

	// Handle manual refresh
	const handleRefresh = () => {
		fetchMonitoringData();
	};

	// Format memory sizes
	const formatMemory = (bytes: number): string => {
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

	// Determine warning/critical states
	const isWarning = (value: number, threshold: number): boolean => {
		return value >= threshold * 0.7 && value < threshold * 0.9;
	};

	const isCritical = (value: number, threshold: number): boolean => {
		return value >= threshold * 0.9;
	};

	if (isLoading && !monitoringData) {
		return <Loading message='Loading system monitoring data...' />;
	}

	if (error) {
		return (
			<Card variant='primary' accentColor='var(--color-error)'>
				<CardContent>
					<Typography variant='body1'>{error}</Typography>
					<Button onClick={handleRefresh} style={{ marginTop: '1rem' }}>
						Try Again
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<RefreshButton variant='secondary' onClick={handleRefresh}>
				<i className='fas fa-sync-alt' style={{ marginRight: '0.5rem' }} />
				Refresh Data
			</RefreshButton>

			<LastUpdated variant='body2'>
				Last updated: {formatDate(lastUpdated)}
			</LastUpdated>

			{monitoringData && (
				<>
					{/* System Overview */}
					<Grid columns={2} gap='md'>
						<StatsCard>
							<CardContent>
								<H3>CPU Usage</H3>
								<Metric>
									<MetricName variant='body2'>Current Usage</MetricName>
									<MetricValue
										warning={isWarning(monitoringData.cpu.usage, 90)}
										critical={isCritical(monitoringData.cpu.usage, 90)}
									>
										{formatCpuUsage(monitoringData.cpu.usage)}
									</MetricValue>
								</Metric>
								<Metric>
									<MetricName variant='body2'>Average Load (1m)</MetricName>
									<Typography>
										{monitoringData.cpu.loadAvg[0].toFixed(2)}
									</Typography>
								</Metric>
								<Metric>
									<MetricName variant='body2'>Cores</MetricName>
									<Typography>{monitoringData.cpu.cores}</Typography>
								</Metric>
								<MetricChart />
							</CardContent>
						</StatsCard>

						<StatsCard>
							<CardContent>
								<H3>Memory Usage</H3>
								<Metric>
									<MetricName variant='body2'>Used / Total</MetricName>
									<MetricValue
										warning={isWarning(monitoringData.memory.usedPercent, 90)}
										critical={isCritical(monitoringData.memory.usedPercent, 90)}
									>
										{formatMemory(monitoringData.memory.used)} /{' '}
										{formatMemory(monitoringData.memory.total)}
									</MetricValue>
								</Metric>
								<Metric>
									<MetricName variant='body2'>Usage</MetricName>
									<Typography>
										{monitoringData.memory.usedPercent.toFixed(1)}%
									</Typography>
								</Metric>
								<Metric>
									<MetricName variant='body2'>Free</MetricName>
									<Typography>
										{formatMemory(monitoringData.memory.free)}
									</Typography>
								</Metric>
								<MetricChart />
							</CardContent>
						</StatsCard>
					</Grid>

					{/* Detailed System Stats */}
					<Grid columns={3} gap='md' style={{ marginTop: '1.5rem' }}>
						<StatsCard>
							<CardContent>
								<H3>Disk Usage</H3>
								<Metric>
									<MetricName variant='body2'>Used / Total</MetricName>
									<Typography>
										{formatMemory(monitoringData.disk.used)} /{' '}
										{formatMemory(monitoringData.disk.total)}
									</Typography>
								</Metric>
								<Metric>
									<MetricName variant='body2'>Usage</MetricName>
									<MetricValue
										warning={isWarning(monitoringData.disk.usedPercent, 85)}
										critical={isCritical(monitoringData.disk.usedPercent, 95)}
									>
										{monitoringData.disk.usedPercent.toFixed(1)}%
									</MetricValue>
								</Metric>
							</CardContent>
						</StatsCard>

						<StatsCard>
							<CardContent>
								<H3>Network</H3>
								<Metric>
									<MetricName variant='body2'>Received</MetricName>
									<Typography>
										{formatMemory(monitoringData.network.received)}
									</Typography>
								</Metric>
								<Metric>
									<MetricName variant='body2'>Transmitted</MetricName>
									<Typography>
										{formatMemory(monitoringData.network.transmitted)}
									</Typography>
								</Metric>
							</CardContent>
						</StatsCard>

						<StatsCard>
							<CardContent>
								<H3>Process</H3>
								<Metric>
									<MetricName variant='body2'>Uptime</MetricName>
									<Typography>{monitoringData.process.uptime} hours</Typography>
								</Metric>
								<Metric>
									<MetricName variant='body2'>Node Version</MetricName>
									<Typography>{monitoringData.process.nodeVersion}</Typography>
								</Metric>
								<Metric>
									<MetricName variant='body2'>Process ID</MetricName>
									<Typography>{monitoringData.process.pid}</Typography>
								</Metric>
							</CardContent>
						</StatsCard>
					</Grid>

					{/* Active Connections */}
					<H3 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
						Active Connections
					</H3>
					<StatsCard>
						<CardContent>
							<Grid columns={3} gap='md'>
								<Metric>
									<MetricName variant='body2'>Current</MetricName>
									<MetricValue>
										{monitoringData.connections.current}
									</MetricValue>
								</Metric>
								<Metric>
									<MetricName variant='body2'>Peak (24h)</MetricName>
									<Typography>{monitoringData.connections.peak24h}</Typography>
								</Metric>
								<Metric>
									<MetricName variant='body2'>Total (24h)</MetricName>
									<Typography>{monitoringData.connections.total24h}</Typography>
								</Metric>
							</Grid>
							<MetricChart />
						</CardContent>
					</StatsCard>

					{/* System Alerts */}
					{monitoringData.alerts && monitoringData.alerts.length > 0 && (
						<>
							<H3 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
								System Alerts
							</H3>
							<StatsCard variant='primary' accentColor='var(--color-warning)'>
								<CardContent>
									{monitoringData.alerts.map((alert: any, index: number) => (
										<div key={index} style={{ marginBottom: '1rem' }}>
											<Typography
												variant='body1'
												style={{ fontWeight: 'bold' }}
											>
												{alert.severity === 'critical' ? '🔴' : '⚠️'}{' '}
												{alert.message}
											</Typography>
											<Typography variant='body2'>{alert.details}</Typography>
										</div>
									))}
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
