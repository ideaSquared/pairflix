import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Alert } from '../../../components/common/Alert';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { Card, CardContent } from '../../../components/common/Card';
import { Flex, Grid } from '../../../components/common/Layout';
import { Loading } from '../../../components/common/Loading';
import { H1, H2, Typography } from '../../../components/common/Typography';
import { admin } from '../../../services/api';

const StatsCard = styled(Card)`
	height: 100%;
`;

const MetricValue = styled.div`
	font-size: 2rem;
	font-weight: bold;
	color: ${({ theme }) => theme.colors.primary};
	margin: ${({ theme }) => theme.spacing.xs} 0;
`;

const MetricLabel = styled.div`
	font-size: 0.9rem;
	color: ${({ theme }) => theme.colors.text.secondary};
`;

const StatusIndicator = styled.div<{ status: 'good' | 'warning' | 'error' }>`
	display: inline-block;
	width: 12px;
	height: 12px;
	border-radius: 50%;
	margin-right: ${({ theme }) => theme.spacing.xs};
	background-color: ${({ theme, status }) => {
		switch (status) {
			case 'good':
				return theme.colors.success;
			case 'warning':
				return theme.colors.warning;
			case 'error':
				return theme.colors.error;
			default:
				return theme.colors.text.secondary;
		}
	}};
`;

const TimeControls = styled.div`
	display: flex;
	gap: ${({ theme }) => theme.spacing.sm};
	margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const TimeButton = styled(Button)<{ active: boolean }>`
	opacity: ${({ active }) => (active ? 1 : 0.7)};
`;

const TitleWithStatus = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const StyledGrid = styled(Grid)`
	margin-top: ${({ theme }) => theme.spacing.lg};
`;

const StyledCard = styled(Card)`
	margin-top: ${({ theme }) => theme.spacing.lg};
`;

const StyledFlex = styled(Flex)`
	margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const BoldTypography = styled(Typography)`
	font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const StyledAlert = styled(Alert)`
	margin-top: ${({ theme }) => theme.spacing.md};
	margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StyledButton = styled(Button)`
	margin-top: ${({ theme }) => theme.spacing.lg};
`;

const formatNumber = (num: number) => {
	return new Intl.NumberFormat().format(num);
};

const formatBytes = (bytes: number) => {
	if (bytes === 0) return '0 Bytes';
	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatUptime = (seconds: number) => {
	const days = Math.floor(seconds / (3600 * 24));
	const hours = Math.floor((seconds % (3600 * 24)) / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);

	let result = '';
	if (days > 0) result += `${days}d `;
	if (hours > 0) result += `${hours}h `;
	result += `${minutes}m`;

	return result;
};

const SystemMonitoring: React.FC = () => {
	const [timeRange, setTimeRange] = useState<7 | 14 | 30>(7);
	const [metrics, setMetrics] = useState<any>(null);
	const [activityStats, setActivityStats] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = async () => {
		try {
			setIsLoading(true);
			setError(null);

			// Fetch system metrics
			const metricsResponse = await admin.getSystemMetrics();
			setMetrics(metricsResponse.metrics);

			// Fetch user activity stats
			const activityResponse = await admin.getUserActivityStats({
				days: timeRange,
			});
			setActivityStats(activityResponse);
		} catch (err) {
			setError(
				`Failed to load monitoring data: ${
					err instanceof Error ? err.message : String(err)
				}`
			);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [timeRange]); // Refetch when time range changes

	const handleTimeRangeChange = (days: 7 | 14 | 30) => {
		setTimeRange(days);
	};

	const getSystemStatus = () => {
		if (!metrics) return 'warning';

		// Determine status based on metrics
		if (metrics.system.recentErrors > 10) return 'error';
		if (metrics.system.recentErrors > 5) return 'warning';
		return 'good';
	};

	if (isLoading && !metrics) {
		return <Loading message='Loading system metrics...' />;
	}

	if (error) {
		return <StyledAlert variant='error'>{error}</StyledAlert>;
	}

	return (
		<>
			<H1 gutterBottom>System Monitoring</H1>
			<Typography gutterBottom>
				Monitor system health, performance, and user activity.
			</Typography>

			<TimeControls>
				<TimeButton
					size='small'
					variant='secondary'
					active={timeRange === 7}
					onClick={() => handleTimeRangeChange(7)}
				>
					Last 7 Days
				</TimeButton>
				<TimeButton
					size='small'
					variant='secondary'
					active={timeRange === 14}
					onClick={() => handleTimeRangeChange(14)}
				>
					Last 14 Days
				</TimeButton>
				<TimeButton
					size='small'
					variant='secondary'
					active={timeRange === 30}
					onClick={() => handleTimeRangeChange(30)}
				>
					Last 30 Days
				</TimeButton>
			</TimeControls>

			{metrics && (
				<>
					<TitleWithStatus>
						<StatusIndicator status={getSystemStatus()} />
						<H2>System Status</H2>
					</TitleWithStatus>

					<Grid columns={4} gap='md'>
						{/* User Statistics */}
						<StatsCard>
							<CardContent>
								<MetricLabel>Total Users</MetricLabel>
								<MetricValue>{formatNumber(metrics.users.total)}</MetricValue>
								<Typography variant='body2'>
									{formatNumber(metrics.users.active)} active in the last 30
									days
								</Typography>
							</CardContent>
						</StatsCard>

						{/* Content Statistics */}
						<StatsCard>
							<CardContent>
								<MetricLabel>Content Entries</MetricLabel>
								<MetricValue>
									{formatNumber(metrics.content.watchlistEntries)}
								</MetricValue>
								<Typography variant='body2'>
									{formatNumber(metrics.content.matches)} total matches
								</Typography>
							</CardContent>
						</StatsCard>

						{/* Activity Statistics */}
						<StatsCard>
							<CardContent>
								<MetricLabel>Recent Activity</MetricLabel>
								<MetricValue>
									{formatNumber(metrics.activity.last24Hours)}
								</MetricValue>
								<Typography variant='body2'>
									actions in the last 24 hours
								</Typography>
							</CardContent>
						</StatsCard>

						{/* System Health */}
						<StatsCard>
							<CardContent>
								<MetricLabel>System Health</MetricLabel>
								<Flex alignItems='center'>
									<StatusIndicator status={getSystemStatus()} />
									<MetricValue
										style={{ fontSize: '1.5rem', marginLeft: '4px' }}
									>
										{getSystemStatus() === 'good'
											? 'Good'
											: getSystemStatus() === 'warning'
												? 'Warning'
												: 'Alert'}
									</MetricValue>
								</Flex>
								<Typography variant='body2'>
									{metrics.system.recentErrors} errors in the last 7 days
								</Typography>
							</CardContent>
						</StatsCard>
					</Grid>

					<StyledGrid columns={2} gap='md'>
						{/* System Resources */}
						<StatsCard>
							<CardContent>
								<H2 gutterBottom>System Resources</H2>
								<Grid columns={2} gap='sm'>
									<div>
										<MetricLabel>Server Uptime</MetricLabel>
										<BoldTypography variant='body1'>
											{formatUptime(metrics.system.uptime)}
										</BoldTypography>
									</div>
									<div>
										<MetricLabel>Memory Usage</MetricLabel>
										<BoldTypography variant='body1'>
											{formatBytes(metrics.system.memoryUsage.heapUsed)} /{' '}
											{formatBytes(metrics.system.memoryUsage.heapTotal)}
										</BoldTypography>
									</div>
								</Grid>

								<StyledButton
									size='small'
									variant='secondary'
									onClick={() => fetchData()}
								>
									Refresh Metrics
								</StyledButton>
							</CardContent>
						</StatsCard>

						{/* User Activity */}
						{activityStats && (
							<StatsCard>
								<CardContent>
									<H2 gutterBottom>User Activity</H2>
									<Typography variant='body2' gutterBottom>
										Top activity types in the last {timeRange} days:
									</Typography>

									{activityStats.activityByType
										?.slice(0, 5)
										.map((item: any, index: number) => (
											<StyledFlex key={index} justifyContent='space-between'>
												<Typography variant='body2'>
													{item.action || item.activity_type}
												</Typography>
												<Badge>{item.count}</Badge>
											</StyledFlex>
										))}

									<Typography
										variant='body2'
										gutterBottom
										style={{ marginTop: '1rem' }}
									>
										Most active users:
									</Typography>

									{activityStats.mostActiveUsers
										?.slice(0, 3)
										.map((item: any, index: number) => (
											<StyledFlex key={index} justifyContent='space-between'>
												<Typography variant='body2'>
													{item.user?.username || `User ${item.user_id}`}
												</Typography>
												<Badge>{item.count} actions</Badge>
											</StyledFlex>
										))}
								</CardContent>
							</StatsCard>
						)}
					</StyledGrid>

					{/* System Maintenance Actions */}
					<StyledCard>
						<CardContent>
							<H2 gutterBottom>System Maintenance</H2>
							<Typography gutterBottom>
								Perform administrative actions to maintain system health
							</Typography>

							<Grid columns={3} gap='md' style={{ marginTop: '1rem' }}>
								<Button
									variant='primary'
									onClick={() => admin.runLogRotation()}
								>
									Run Log Rotation
								</Button>
								<Button
									variant='secondary'
									onClick={() => window.location.reload()}
								>
									Refresh Dashboard
								</Button>
								<Button
									variant='warning'
									onClick={() =>
										alert('This would handle cache clearing in a real system')
									}
								>
									Clear Cache
								</Button>
							</Grid>
						</CardContent>
					</StyledCard>
				</>
			)}
		</>
	);
};

export default SystemMonitoring;
