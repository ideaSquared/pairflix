import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { adminService } from '../../../services/admin.service';

// Types for system statistics
interface SystemStats {
	activeUsers: {
		total: number;
		today: number;
		thisWeek: number;
		thisMonth: number;
		trend: number;
	};
	contentStats: {
		movies: number;
		shows: number;
		episodes: number;
		totalContent: number;
	};
	serverStats: {
		cpuUsage: number;
		memoryUsage: number;
		diskUsage: number;
		uptime: number;
	};
	requestStats: {
		totalToday: number;
		avgResponseTime: number;
		errorRate: number;
	};
	watchlistStats: {
		totalItems: number;
		avgItemsPerUser: number;
		mostAddedContent: Array<{ id: string; title: string; count: number }>;
	};
	matchStats: {
		totalMatches: number;
		todayMatches: number;
		avgMatchesPerUser: number;
	};
}

// Styled Components
const PageContainer = styled.div`
	padding: 2rem 0;
`;

const PageHeader = styled.div`
	margin-bottom: 2rem;
`;

const H1 = styled.h1`
	margin-bottom: 0.5rem;
`;

const SubHeading = styled.p`
	color: #666;
	margin-bottom: 2rem;
`;

const Grid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
	gap: 1.5rem;
	margin-bottom: 2rem;
`;

const Card = styled.div`
	background-color: white;
	border-radius: 8px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	padding: 1.5rem;
`;

const CardHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
	padding-bottom: 0.5rem;
	border-bottom: 1px solid #eee;
`;

const CardTitle = styled.h3`
	margin: 0;
	font-size: 1.25rem;
`;

const RefreshButton = styled.button`
	background: none;
	border: none;
	color: #0d6efd;
	cursor: pointer;
	font-size: 1rem;

	&:hover {
		color: #0a58ca;
	}
`;

const StatValue = styled.div`
	font-size: 2rem;
	font-weight: 600;
	margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
	color: #666;
	font-size: 0.875rem;
`;

const StatItem = styled.div`
	margin-bottom: 1rem;
`;

const TrendValue = styled.span<{ trend: number }>`
	color: ${(props) =>
		props.trend > 0 ? '#198754' : props.trend < 0 ? '#dc3545' : '#6c757d'};
	font-size: 0.875rem;
	margin-left: 0.5rem;

	&::before {
		content: '${(props) =>
			props.trend > 0 ? '▲' : props.trend < 0 ? '▼' : '■'}';
		margin-right: 0.25rem;
	}
`;

const ProgressBar = styled.div<{ value: number; color: string }>`
	height: 0.5rem;
	background-color: #e9ecef;
	border-radius: 0.25rem;
	margin: 0.5rem 0;
	overflow: hidden;

	&::before {
		content: '';
		display: block;
		height: 100%;
		width: ${(props) => `${Math.min(props.value, 100)}%`};
		background-color: ${(props) => props.color};
		transition: width 0.3s ease;
	}
`;

const ProgressValue = styled.div`
	display: flex;
	justify-content: space-between;
	font-size: 0.875rem;
	color: #666;
`;

const Table = styled.table`
	width: 100%;
	border-collapse: collapse;
`;

const Th = styled.th`
	text-align: left;
	padding: 0.5rem;
	border-bottom: 1px solid #dee2e6;
	font-size: 0.875rem;
	font-weight: 600;
`;

const Td = styled.td`
	padding: 0.5rem;
	border-bottom: 1px solid #dee2e6;
	font-size: 0.875rem;
`;

const LoadingIndicator = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	height: 200px;
	font-size: 1rem;
	color: #666;
`;

const ErrorMessage = styled.div`
	padding: 1rem;
	background-color: #f8d7da;
	color: #842029;
	border-radius: 8px;
	margin-bottom: 1.5rem;
`;

const DateRangeSelector = styled.div`
	display: flex;
	gap: 0.5rem;
	margin-bottom: 1.5rem;
`;

const DateButton = styled.button<{ active: boolean }>`
	padding: 0.5rem 1rem;
	border: 1px solid ${(props) => (props.active ? '#0d6efd' : '#dee2e6')};
	background-color: ${(props) => (props.active ? '#e7f1ff' : 'white')};
	border-radius: 4px;
	color: ${(props) => (props.active ? '#0d6efd' : '#212529')};
	cursor: pointer;

	&:hover {
		background-color: ${(props) => (props.active ? '#e7f1ff' : '#f8f9fa')};
	}
`;

// Component implementation
export const SystemStatsPage: React.FC = () => {
	const [stats, setStats] = useState<SystemStats | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [dateRange, setDateRange] = useState<'day' | 'week' | 'month' | 'year'>(
		'day'
	);

	useEffect(() => {
		fetchSystemStats();
	}, [dateRange]);

	const fetchSystemStats = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const response = await adminService.getSystemStats({ range: dateRange });
			setStats(response);
		} catch (err) {
			setError(
				`Failed to load system statistics: ${err instanceof Error ? err.message : String(err)}`
			);
			console.error('Error fetching system statistics:', err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleRefresh = () => {
		fetchSystemStats();
	};

	const formatNumber = (value: number): string => {
		return new Intl.NumberFormat().format(value);
	};

	const formatPercentage = (value: number): string => {
		return `${value.toFixed(1)}%`;
	};

	const formatTime = (seconds: number): string => {
		const days = Math.floor(seconds / (3600 * 24));
		const hours = Math.floor((seconds % (3600 * 24)) / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);

		return `${days}d ${hours}h ${minutes}m`;
	};

	if (isLoading && !stats) {
		return (
			<PageContainer>
				<PageHeader>
					<H1>System Statistics</H1>
					<SubHeading>
						Overview of platform usage and performance metrics
					</SubHeading>
				</PageHeader>
				<LoadingIndicator>Loading system statistics...</LoadingIndicator>
			</PageContainer>
		);
	}

	if (error) {
		return (
			<PageContainer>
				<PageHeader>
					<H1>System Statistics</H1>
					<SubHeading>
						Overview of platform usage and performance metrics
					</SubHeading>
				</PageHeader>
				<ErrorMessage>{error}</ErrorMessage>
				<button onClick={fetchSystemStats}>Retry</button>
			</PageContainer>
		);
	}

	return (
		<PageContainer>
			<PageHeader>
				<H1>System Statistics</H1>
				<SubHeading>
					Overview of platform usage and performance metrics
				</SubHeading>
			</PageHeader>

			<DateRangeSelector>
				<DateButton
					active={dateRange === 'day'}
					onClick={() => setDateRange('day')}
				>
					Today
				</DateButton>
				<DateButton
					active={dateRange === 'week'}
					onClick={() => setDateRange('week')}
				>
					This Week
				</DateButton>
				<DateButton
					active={dateRange === 'month'}
					onClick={() => setDateRange('month')}
				>
					This Month
				</DateButton>
				<DateButton
					active={dateRange === 'year'}
					onClick={() => setDateRange('year')}
				>
					This Year
				</DateButton>
			</DateRangeSelector>

			<Grid>
				{/* User Activity Card */}
				<Card>
					<CardHeader>
						<CardTitle>User Activity</CardTitle>
						<RefreshButton onClick={handleRefresh}>⟳</RefreshButton>
					</CardHeader>

					<StatItem>
						<StatLabel>Total Active Users</StatLabel>
						<StatValue>{formatNumber(stats?.activeUsers.total || 0)}</StatValue>
						<TrendValue trend={stats?.activeUsers.trend || 0}>
							{stats?.activeUsers.trend && stats.activeUsers.trend > 0
								? `+${stats.activeUsers.trend}%`
								: `${stats?.activeUsers.trend}%`}
						</TrendValue>
					</StatItem>

					<StatItem>
						<StatLabel>Active Today</StatLabel>
						<div>{formatNumber(stats?.activeUsers.today || 0)}</div>
					</StatItem>

					<StatItem>
						<StatLabel>Active This Week</StatLabel>
						<div>{formatNumber(stats?.activeUsers.thisWeek || 0)}</div>
					</StatItem>

					<StatItem>
						<StatLabel>Active This Month</StatLabel>
						<div>{formatNumber(stats?.activeUsers.thisMonth || 0)}</div>
					</StatItem>
				</Card>

				{/* Content Statistics Card */}
				<Card>
					<CardHeader>
						<CardTitle>Content Statistics</CardTitle>
						<RefreshButton onClick={handleRefresh}>⟳</RefreshButton>
					</CardHeader>

					<StatItem>
						<StatLabel>Total Content Items</StatLabel>
						<StatValue>
							{formatNumber(stats?.contentStats.totalContent || 0)}
						</StatValue>
					</StatItem>

					<StatItem>
						<StatLabel>Movies</StatLabel>
						<div>{formatNumber(stats?.contentStats.movies || 0)}</div>
					</StatItem>

					<StatItem>
						<StatLabel>TV Shows</StatLabel>
						<div>{formatNumber(stats?.contentStats.shows || 0)}</div>
					</StatItem>

					<StatItem>
						<StatLabel>Episodes</StatLabel>
						<div>{formatNumber(stats?.contentStats.episodes || 0)}</div>
					</StatItem>
				</Card>

				{/* Server Statistics Card */}
				<Card>
					<CardHeader>
						<CardTitle>Server Performance</CardTitle>
						<RefreshButton onClick={handleRefresh}>⟳</RefreshButton>
					</CardHeader>

					<StatItem>
						<StatLabel>CPU Usage</StatLabel>
						<ProgressValue>
							<div>Current</div>
							<div>{formatPercentage(stats?.serverStats.cpuUsage || 0)}</div>
						</ProgressValue>
						<ProgressBar
							value={stats?.serverStats.cpuUsage || 0}
							color={
								stats?.serverStats.cpuUsage && stats.serverStats.cpuUsage > 80
									? '#dc3545'
									: stats?.serverStats.cpuUsage &&
										  stats.serverStats.cpuUsage > 60
										? '#ffc107'
										: '#198754'
							}
						/>
					</StatItem>

					<StatItem>
						<StatLabel>Memory Usage</StatLabel>
						<ProgressValue>
							<div>Current</div>
							<div>{formatPercentage(stats?.serverStats.memoryUsage || 0)}</div>
						</ProgressValue>
						<ProgressBar
							value={stats?.serverStats.memoryUsage || 0}
							color={
								stats?.serverStats.memoryUsage &&
								stats.serverStats.memoryUsage > 80
									? '#dc3545'
									: stats?.serverStats.memoryUsage &&
										  stats.serverStats.memoryUsage > 60
										? '#ffc107'
										: '#198754'
							}
						/>
					</StatItem>

					<StatItem>
						<StatLabel>Disk Usage</StatLabel>
						<ProgressValue>
							<div>Current</div>
							<div>{formatPercentage(stats?.serverStats.diskUsage || 0)}</div>
						</ProgressValue>
						<ProgressBar
							value={stats?.serverStats.diskUsage || 0}
							color={
								stats?.serverStats.diskUsage && stats.serverStats.diskUsage > 80
									? '#dc3545'
									: stats?.serverStats.diskUsage &&
										  stats.serverStats.diskUsage > 60
										? '#ffc107'
										: '#198754'
							}
						/>
					</StatItem>

					<StatItem>
						<StatLabel>Server Uptime</StatLabel>
						<div>{formatTime(stats?.serverStats.uptime || 0)}</div>
					</StatItem>
				</Card>

				{/* Request Statistics Card */}
				<Card>
					<CardHeader>
						<CardTitle>API Performance</CardTitle>
						<RefreshButton onClick={handleRefresh}>⟳</RefreshButton>
					</CardHeader>

					<StatItem>
						<StatLabel>Total Requests Today</StatLabel>
						<StatValue>
							{formatNumber(stats?.requestStats.totalToday || 0)}
						</StatValue>
					</StatItem>

					<StatItem>
						<StatLabel>Average Response Time</StatLabel>
						<div>
							{(stats?.requestStats.avgResponseTime || 0).toFixed(2)} ms
						</div>
					</StatItem>

					<StatItem>
						<StatLabel>Error Rate</StatLabel>
						<div
							style={{
								color:
									stats?.requestStats.errorRate &&
									stats.requestStats.errorRate > 5
										? '#dc3545'
										: stats?.requestStats.errorRate &&
											  stats.requestStats.errorRate > 1
											? '#ffc107'
											: '#198754',
							}}
						>
							{formatPercentage(stats?.requestStats.errorRate || 0)}
						</div>
					</StatItem>
				</Card>

				{/* Watchlist Statistics Card */}
				<Card>
					<CardHeader>
						<CardTitle>Watchlist Activity</CardTitle>
						<RefreshButton onClick={handleRefresh}>⟳</RefreshButton>
					</CardHeader>

					<StatItem>
						<StatLabel>Total Watchlist Items</StatLabel>
						<StatValue>
							{formatNumber(stats?.watchlistStats.totalItems || 0)}
						</StatValue>
					</StatItem>

					<StatItem>
						<StatLabel>Average Items per User</StatLabel>
						<div>{(stats?.watchlistStats.avgItemsPerUser || 0).toFixed(1)}</div>
					</StatItem>

					<StatItem>
						<StatLabel>Most Added Content</StatLabel>
						<Table>
							<thead>
								<tr>
									<Th>Title</Th>
									<Th style={{ textAlign: 'right' }}>Count</Th>
								</tr>
							</thead>
							<tbody>
								{stats?.watchlistStats.mostAddedContent
									?.slice(0, 5)
									.map((item) => (
										<tr key={item.id}>
											<Td>{item.title}</Td>
											<Td style={{ textAlign: 'right' }}>{item.count}</Td>
										</tr>
									))}
							</tbody>
						</Table>
					</StatItem>
				</Card>

				{/* Match Statistics Card */}
				<Card>
					<CardHeader>
						<CardTitle>Match Statistics</CardTitle>
						<RefreshButton onClick={handleRefresh}>⟳</RefreshButton>
					</CardHeader>

					<StatItem>
						<StatLabel>Total Matches</StatLabel>
						<StatValue>
							{formatNumber(stats?.matchStats.totalMatches || 0)}
						</StatValue>
					</StatItem>

					<StatItem>
						<StatLabel>Today's Matches</StatLabel>
						<div>{formatNumber(stats?.matchStats.todayMatches || 0)}</div>
					</StatItem>

					<StatItem>
						<StatLabel>Average Matches per User</StatLabel>
						<div>{(stats?.matchStats.avgMatchesPerUser || 0).toFixed(1)}</div>
					</StatItem>
				</Card>
			</Grid>
		</PageContainer>
	);
};
