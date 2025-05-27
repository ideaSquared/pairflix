import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Loading } from '../components/common/Loading';
import { H1 } from '../components/common/Typography';
import { admin } from '../services/api';

const StatsGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: 20px;
	margin-top: 20px;
`;

const StatCard = styled.div`
	background-color: ${({ theme }) => theme.colors.background.secondary};
	border-radius: ${({ theme }) => theme.borderRadius.md};
	padding: ${({ theme }) => theme.spacing.md};
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const StatTitle = styled.h3`
	margin: 0 0 ${({ theme }) => theme.spacing.sm};
	color: ${({ theme }) => theme.colors.text.secondary};
	font-size: 0.875rem;
	text-transform: uppercase;
	letter-spacing: 0.05em;
`;

const StatValue = styled.div`
	font-size: 1.5rem;
	font-weight: 600;
	color: ${({ theme }) => theme.colors.text.primary};
`;

const StatSection = styled.div`
	margin-top: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.h2`
	margin: 0 0 ${({ theme }) => theme.spacing.md};
	font-size: 1.25rem;
`;

interface SystemStats {
	database: {
		totalUsers: number;
		newUsers: {
			lastDay: number;
			lastWeek: number;
			lastMonth: number;
		};
		activeUsers: number;
		inactivePercentage: number;
		contentStats: {
			watchlistEntries: number;
			matches: number;
			averageWatchlistPerUser: number;
		};
		errorCount: number;
		size: {
			bytes: number;
			megabytes: number;
		};
	};
	system: {
		os: {
			type: string;
			platform: string;
			arch: string;
			release: string;
			uptime: number;
			loadAvg: number[];
		};
		memory: {
			total: number;
			free: number;
			usagePercent: number;
		};
		cpu: {
			cores: number;
			model: string;
			speed: number;
		};
		process: {
			uptime: number;
			memoryUsage: any;
			nodeVersion: string;
			pid: number;
		};
	};
}

const formatBytes = (bytes: number): string => {
	if (bytes < 1024) return bytes + ' B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatUptime = (seconds: number): string => {
	const days = Math.floor(seconds / 86400);
	const hours = Math.floor((seconds % 86400) / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);

	const parts = [];
	if (days > 0) parts.push(`${days}d`);
	if (hours > 0) parts.push(`${hours}h`);
	if (minutes > 0) parts.push(`${minutes}m`);

	return parts.join(' ') || '< 1m';
};

const SystemStats: React.FC = () => {
	const [stats, setStats] = useState<SystemStats | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				setIsLoading(true);
				const response = await admin.system.getStats();
				setStats(response);
			} catch (error) {
				console.error('Error fetching system stats:', error);
				setError('Failed to fetch system statistics');
			} finally {
				setIsLoading(false);
			}
		};

		fetchStats();

		// Refresh stats every minute
		const interval = setInterval(fetchStats, 60000);
		return () => clearInterval(interval);
	}, []);

	if (isLoading) return <Loading message='Loading system statistics...' />;
	if (error) return <div style={{ color: 'red' }}>{error}</div>;
	if (!stats) return <div>No statistics available.</div>;

	return (
		<div>
			<H1>System Statistics</H1>
			<p>Overview of system performance and usage statistics.</p>

			<StatSection>
				<SectionTitle>User Statistics</SectionTitle>
				<StatsGrid>
					<StatCard>
						<StatTitle>Total Users</StatTitle>
						<StatValue>{stats.database.totalUsers.toLocaleString()}</StatValue>
					</StatCard>
					<StatCard>
						<StatTitle>Active Users</StatTitle>
						<StatValue>{stats.database.activeUsers.toLocaleString()}</StatValue>
					</StatCard>
					<StatCard>
						<StatTitle>New Users (Last 24h)</StatTitle>
						<StatValue>
							{stats.database.newUsers.lastDay.toLocaleString()}
						</StatValue>
					</StatCard>
				</StatsGrid>
			</StatSection>

			<StatSection>
				<SectionTitle>System Health</SectionTitle>
				<StatsGrid>
					<StatCard>
						<StatTitle>System Uptime</StatTitle>
						<StatValue>{formatUptime(stats.system.os.uptime)}</StatValue>
					</StatCard>
					<StatCard>
						<StatTitle>Memory Usage</StatTitle>
						<StatValue>
							{stats.system.memory.usagePercent.toFixed(1)}%
						</StatValue>
					</StatCard>
					<StatCard>
						<StatTitle>CPU Cores</StatTitle>
						<StatValue>{stats.system.cpu.cores}</StatValue>
					</StatCard>
					<StatCard>
						<StatTitle>Database Size</StatTitle>
						<StatValue>{formatBytes(stats.database.size.bytes)}</StatValue>
					</StatCard>
				</StatsGrid>
			</StatSection>

			<StatSection>
				<SectionTitle>Content Statistics</SectionTitle>
				<StatsGrid>
					<StatCard>
						<StatTitle>Total Watchlist Entries</StatTitle>
						<StatValue>
							{stats.database.contentStats.watchlistEntries.toLocaleString()}
						</StatValue>
					</StatCard>
					<StatCard>
						<StatTitle>Total Matches</StatTitle>
						<StatValue>
							{stats.database.contentStats.matches.toLocaleString()}
						</StatValue>
					</StatCard>
					<StatCard>
						<StatTitle>Avg. Watchlist Items per User</StatTitle>
						<StatValue>
							{stats.database.contentStats.averageWatchlistPerUser.toFixed(1)}
						</StatValue>
					</StatCard>
				</StatsGrid>
			</StatSection>

			<StatSection>
				<SectionTitle>System Details</SectionTitle>
				<StatsGrid>
					<StatCard>
						<StatTitle>Operating System</StatTitle>
						<StatValue>{`${stats.system.os.type} (${stats.system.os.platform})`}</StatValue>
					</StatCard>
					<StatCard>
						<StatTitle>Node.js Version</StatTitle>
						<StatValue>{stats.system.process.nodeVersion}</StatValue>
					</StatCard>
					<StatCard>
						<StatTitle>Architecture</StatTitle>
						<StatValue>{stats.system.os.arch}</StatValue>
					</StatCard>
				</StatsGrid>
			</StatSection>
		</div>
	);
};

export default SystemStats;
