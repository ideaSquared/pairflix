import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Alert } from '../../../components/common/Alert';
import { Card, CardContent } from '../../../components/common/Card';
import { Flex, Grid } from '../../../components/common/Layout';
import { Loading } from '../../../components/common/Loading';
import { H1, H4, Typography } from '../../../components/common/Typography';
import { admin } from '../../../services/api';

// Styled components
const StatsContainer = styled.div`
	padding-bottom: ${({ theme }) => theme.spacing.xl};
`;

const MetricCard = styled(Card)`
	height: 100%;
	transition:
		transform 0.2s ease-in-out,
		box-shadow 0.2s ease-in-out;

	&:hover {
		transform: translateY(-3px);
		box-shadow: ${({ theme }) => theme.shadows.md};
	}
`;

const MetricValue = styled(H4)`
	margin: ${({ theme }) => theme.spacing.xs} 0;
	color: ${({ theme }) => theme.colors.primary};
`;

const MetricLabel = styled(Typography)`
	color: ${({ theme }) => theme.colors.text.secondary};
	font-size: 0.9rem;
	font-weight: 500;
`;

const MetricTrend = styled.span<{ trend: 'up' | 'down' | 'neutral' }>`
	display: inline-flex;
	align-items: center;
	color: ${({ theme, trend }) => {
		switch (trend) {
			case 'up':
				return theme.colors.text.success;
			case 'down':
				return theme.colors.text.error;
			default:
				return theme.colors.text.secondary;
		}
	}};
	font-size: 0.85rem;
	margin-left: ${({ theme }) => theme.spacing.xs};
`;

const SectionTitle = styled(H4)`
	margin-top: ${({ theme }) => theme.spacing.lg};
	margin-bottom: ${({ theme }) => theme.spacing.md};
	border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
	padding-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ChartContainer = styled.div`
	height: 300px;
	margin-top: ${({ theme }) => theme.spacing.md};
	margin-bottom: ${({ theme }) => theme.spacing.lg};
	position: relative;
	background-color: ${({ theme }) => theme.colors.background.paper};
	border-radius: ${({ theme }) => theme.borderRadius.md};
	padding: ${({ theme }) => theme.spacing.md};
`;

const ChartPlaceholder = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	border: 1px dashed ${({ theme }) => theme.colors.border.main};
	border-radius: ${({ theme }) => theme.borderRadius.sm};
	background-color: ${({ theme }) => theme.colors.background.lighter};
	color: ${({ theme }) => theme.colors.text.secondary};
`;

interface SystemStats {
	server: {
		uptime: number;
		memory: {
			total: number;
			used: number;
			free: number;
		};
		cpu: {
			usage: number;
			cores: number;
		};
		storage: {
			total: number;
			used: number;
			free: number;
		};
	};
	database: {
		connections: number;
		queriesPerSecond: number;
		size: number;
		tables: {
			name: string;
			rows: number;
			size: number;
		}[];
	};
	application: {
		activeUsers: number;
		activeUsersTrend: 'up' | 'down' | 'neutral';
		requestsPerMinute: number;
		requestsPerMinuteTrend: 'up' | 'down' | 'neutral';
		averageResponseTime: number;
		averageResponseTimeTrend: 'up' | 'down' | 'neutral';
		errorRate: number;
		errorRateTrend: 'up' | 'down' | 'neutral';
	};
}

const SystemStatsPage: React.FC = () => {
	const [stats, setStats] = useState<SystemStats | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchSystemStats = async () => {
			try {
				setIsLoading(true);
				setError(null);

				// In a real implementation, this would be an actual API call
				const response = await admin.getSystemStats();
				setStats(response.stats);
			} catch (err) {
				setError(
					'Failed to load system statistics: ' +
						(err instanceof Error ? err.message : String(err))
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchSystemStats();

		// Set up polling for real-time updates
		const interval = setInterval(fetchSystemStats, 60000); // Poll every minute

		return () => clearInterval(interval);
	}, []);

	// Helper function to format bytes to human-readable format
	const formatBytes = (bytes: number) => {
		if (bytes === 0) return '0 Bytes';

		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(1024));

		return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
	};

	// Helper function to format uptime
	const formatUptime = (seconds: number) => {
		const days = Math.floor(seconds / (3600 * 24));
		const hours = Math.floor((seconds % (3600 * 24)) / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);

		return `${days}d ${hours}h ${minutes}m`;
	};

	if (isLoading) {
		return <Loading message='Loading system statistics...' />;
	}

	if (error) {
		return <Alert variant='error'>{error}</Alert>;
	}

	if (!stats) {
		return <Typography>No system statistics available</Typography>;
	}

	return (
		<StatsContainer>
			<H1 gutterBottom>System Statistics</H1>
			<Typography>
				Real-time performance metrics and system health information
			</Typography>

			<SectionTitle>Application Performance</SectionTitle>
			<Grid columns={4} gap='md'>
				<MetricCard>
					<CardContent>
						<MetricLabel>Active Users</MetricLabel>
						<MetricValue>
							{stats.application.activeUsers}
							<MetricTrend trend={stats.application.activeUsersTrend}>
								{stats.application.activeUsersTrend === 'up' ? (
									<>
										<i className='fas fa-arrow-up'></i> +8%
									</>
								) : stats.application.activeUsersTrend === 'down' ? (
									<>
										<i className='fas fa-arrow-down'></i> -5%
									</>
								) : (
									<>
										<i className='fas fa-minus'></i> 0%
									</>
								)}
							</MetricTrend>
						</MetricValue>
						<Typography variant='body2'>Current active user count</Typography>
					</CardContent>
				</MetricCard>

				<MetricCard>
					<CardContent>
						<MetricLabel>Requests Per Minute</MetricLabel>
						<MetricValue>
							{stats.application.requestsPerMinute}
							<MetricTrend trend={stats.application.requestsPerMinuteTrend}>
								{stats.application.requestsPerMinuteTrend === 'up' ? (
									<>
										<i className='fas fa-arrow-up'></i> +12%
									</>
								) : stats.application.requestsPerMinuteTrend === 'down' ? (
									<>
										<i className='fas fa-arrow-down'></i> -3%
									</>
								) : (
									<>
										<i className='fas fa-minus'></i> 0%
									</>
								)}
							</MetricTrend>
						</MetricValue>
						<Typography variant='body2'>
							Average over last 10 minutes
						</Typography>
					</CardContent>
				</MetricCard>

				<MetricCard>
					<CardContent>
						<MetricLabel>Avg Response Time</MetricLabel>
						<MetricValue>
							{stats.application.averageResponseTime}ms
							<MetricTrend trend={stats.application.averageResponseTimeTrend}>
								{stats.application.averageResponseTimeTrend === 'up' ? (
									<>
										<i className='fas fa-arrow-up'></i> +7%
									</>
								) : stats.application.averageResponseTimeTrend === 'down' ? (
									<>
										<i className='fas fa-arrow-down'></i> -10%
									</>
								) : (
									<>
										<i className='fas fa-minus'></i> 0%
									</>
								)}
							</MetricTrend>
						</MetricValue>
						<Typography variant='body2'>Last 100 requests</Typography>
					</CardContent>
				</MetricCard>

				<MetricCard>
					<CardContent>
						<MetricLabel>Error Rate</MetricLabel>
						<MetricValue>
							{stats.application.errorRate}%
							<MetricTrend trend={stats.application.errorRateTrend}>
								{stats.application.errorRateTrend === 'up' ? (
									<>
										<i className='fas fa-arrow-up'></i> +2%
									</>
								) : stats.application.errorRateTrend === 'down' ? (
									<>
										<i className='fas fa-arrow-down'></i> -1%
									</>
								) : (
									<>
										<i className='fas fa-minus'></i> 0%
									</>
								)}
							</MetricTrend>
						</MetricValue>
						<Typography variant='body2'>
							Percentage of failed requests
						</Typography>
					</CardContent>
				</MetricCard>
			</Grid>

			<ChartContainer>
				<ChartPlaceholder>
					<Typography>
						<i className='fas fa-chart-line'></i> Response Time Trends (24
						hours)
					</Typography>
				</ChartPlaceholder>
			</ChartContainer>

			<SectionTitle>Server Resources</SectionTitle>
			<Grid columns={3} gap='md'>
				<MetricCard>
					<CardContent>
						<MetricLabel>CPU Usage</MetricLabel>
						<MetricValue>{stats.server.cpu.usage}%</MetricValue>
						<Typography variant='body2'>
							{stats.server.cpu.cores} Cores Available
						</Typography>
					</CardContent>
				</MetricCard>

				<MetricCard>
					<CardContent>
						<MetricLabel>Memory Usage</MetricLabel>
						<MetricValue>
							{Math.round(
								(stats.server.memory.used / stats.server.memory.total) * 100
							)}
							%
						</MetricValue>
						<Typography variant='body2'>
							{formatBytes(stats.server.memory.used)} /{' '}
							{formatBytes(stats.server.memory.total)}
						</Typography>
					</CardContent>
				</MetricCard>

				<MetricCard>
					<CardContent>
						<MetricLabel>Server Uptime</MetricLabel>
						<MetricValue>{formatUptime(stats.server.uptime)}</MetricValue>
						<Typography variant='body2'>
							Last Restart:{' '}
							{new Date(
								Date.now() - stats.server.uptime * 1000
							).toLocaleDateString()}
						</Typography>
					</CardContent>
				</MetricCard>
			</Grid>

			<SectionTitle>Database Performance</SectionTitle>
			<Grid columns={3} gap='md'>
				<MetricCard>
					<CardContent>
						<MetricLabel>Active Connections</MetricLabel>
						<MetricValue>{stats.database.connections}</MetricValue>
						<Typography variant='body2'>
							Current database connections
						</Typography>
					</CardContent>
				</MetricCard>

				<MetricCard>
					<CardContent>
						<MetricLabel>Queries Per Second</MetricLabel>
						<MetricValue>{stats.database.queriesPerSecond}</MetricValue>
						<Typography variant='body2'>Average over last minute</Typography>
					</CardContent>
				</MetricCard>

				<MetricCard>
					<CardContent>
						<MetricLabel>Database Size</MetricLabel>
						<MetricValue>{formatBytes(stats.database.size)}</MetricValue>
						<Typography variant='body2'>Total size of all tables</Typography>
					</CardContent>
				</MetricCard>
			</Grid>

			<SectionTitle>Storage Usage</SectionTitle>
			<Card>
				<CardContent>
					<Grid columns={1} gap='sm'>
						<Flex justifyContent='space-between'>
							<Typography>Total Storage:</Typography>
							<Typography>{formatBytes(stats.server.storage.total)}</Typography>
						</Flex>
						<Flex justifyContent='space-between'>
							<Typography>Used Storage:</Typography>
							<Typography>{formatBytes(stats.server.storage.used)}</Typography>
						</Flex>
						<Flex justifyContent='space-between'>
							<Typography>Free Storage:</Typography>
							<Typography>{formatBytes(stats.server.storage.free)}</Typography>
						</Flex>
						<Flex justifyContent='space-between'>
							<Typography>Usage Percentage:</Typography>
							<Typography>
								{Math.round(
									(stats.server.storage.used / stats.server.storage.total) * 100
								)}
								%
							</Typography>
						</Flex>
					</Grid>
				</CardContent>
			</Card>
		</StatsContainer>
	);
};

export default SystemStatsPage;
