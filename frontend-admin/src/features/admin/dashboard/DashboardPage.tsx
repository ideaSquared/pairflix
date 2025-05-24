import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { adminService } from '../../../services/admin.service';
import { adminStatsService } from '../../../services/adminStats.service';

// Styled components
const DashboardContainer = styled.div`
	padding-bottom: 2rem;
`;

const PageHeader = styled.div`
	margin-bottom: 2rem;
`;

const StatsGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	gap: 1.5rem;
	margin-bottom: 2rem;
`;

const StatsCard = styled.div`
	background-color: #1e1e1e;
	border-radius: 0.5rem;
	padding: 1.5rem;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const StatsCardHeader = styled.h3`
	margin-top: 0;
	margin-bottom: 1rem;
	font-size: 1rem;
	color: #e0e0e0;
`;

const StatsValue = styled.div`
	font-size: 2rem;
	font-weight: bold;
	color: #ffffff;
	margin-bottom: 0.5rem;
`;

const StatsChange = styled.div<{ positive?: boolean }>`
	font-size: 0.875rem;
	color: ${({ positive }) => (positive ? '#4caf50' : '#f44336')};
`;

const SectionTitle = styled.h2`
	margin-top: 2rem;
	margin-bottom: 1rem;
	border-bottom: 1px solid #2a2a2a;
	padding-bottom: 0.5rem;
	font-size: 1.5rem;
	color: #ffffff;
`;

const ActionGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	gap: 1.5rem;
`;

const ActionCard = styled.div`
	background-color: #1e1e1e;
	border-radius: 0.5rem;
	padding: 1.5rem;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ActionCardTitle = styled.h3`
	margin-top: 0;
	margin-bottom: 0.5rem;
	font-size: 1rem;
	color: #e0e0e0;
`;

const ActionCardDescription = styled.p`
	margin-bottom: 1rem;
	font-size: 0.875rem;
	color: #b3b3b3;
`;

const ActionButton = styled.button`
	background-color: #2c5282;
	color: white;
	border: none;
	border-radius: 0.25rem;
	padding: 0.5rem 1rem;
	font-size: 0.875rem;
	cursor: pointer;
	transition: background-color 0.2s;

	&:hover {
		background-color: #3182ce;
	}
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

export const DashboardPage: React.FC = () => {
	const [stats, setStats] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchDashboardStats();
	}, []);

	const fetchDashboardStats = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const data = await adminStatsService.getDashboardStats();
			setStats(data);
		} catch (err) {
			setError(
				`Failed to load dashboard statistics: ${err instanceof Error ? err.message : String(err)}`
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleClearCache = async () => {
		try {
			await adminService.clearCache();
			// Refresh stats after clearing cache
			await fetchDashboardStats();
		} catch (err) {
			setError(
				`Failed to clear cache: ${err instanceof Error ? err.message : String(err)}`
			);
		}
	};

	return (
		<DashboardContainer>
			<PageHeader>
				<H1>Admin Dashboard</H1>
				<SubHeading>
					Manage your platform with comprehensive analytics and controls
				</SubHeading>
			</PageHeader>

			{isLoading && <p>Loading dashboard statistics...</p>}

			{error && <p style={{ color: '#f44336' }}>{error}</p>}

			{stats && (
				<>
					<StatsGrid>
						<StatsCard>
							<StatsCardHeader>Total Users</StatsCardHeader>
							<StatsValue>{stats.totalUsers || 0}</StatsValue>
							<StatsChange positive={stats.usersChange > 0}>
								{stats.usersChange > 0 ? '↑' : stats.usersChange < 0 ? '↓' : ''}{' '}
								{Math.abs(stats.usersChange || 0)}% from last month
							</StatsChange>
						</StatsCard>

						<StatsCard>
							<StatsCardHeader>Active Users</StatsCardHeader>
							<StatsValue>{stats.activeUsers || 0}</StatsValue>
							<StatsChange positive={true}>
								{((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% of
								total users
							</StatsChange>
						</StatsCard>

						<StatsCard>
							<StatsCardHeader>Content Items</StatsCardHeader>
							<StatsValue>{stats.totalWatchlistEntries || 0}</StatsValue>
							<StatsChange positive={stats.watchlistEntries > 0}>
								{stats.watchlistEntries > 0
									? '↑'
									: stats.watchlistEntries < 0
										? '↓'
										: ''}{' '}
								{Math.abs(stats.watchlistEntries || 0)} new this week
							</StatsChange>
						</StatsCard>

						<StatsCard>
							<StatsCardHeader>Total Matches</StatsCardHeader>
							<StatsValue>{stats.totalMatches || 0}</StatsValue>
							<StatsChange positive={stats.matchesChange > 0}>
								{stats.matchesChange > 0
									? '↑'
									: stats.matchesChange < 0
										? '↓'
										: ''}{' '}
								{Math.abs(stats.matchesChange || 0)}% from last month
							</StatsChange>
						</StatsCard>
					</StatsGrid>

					<SectionTitle>Quick Actions</SectionTitle>

					<ActionGrid>
						<ActionCard>
							<ActionCardTitle>User Management</ActionCardTitle>
							<ActionCardDescription>
								View, edit, and manage user accounts across the platform
							</ActionCardDescription>
							<ActionButton
								onClick={() => (window.location.href = '/admin/users')}
							>
								Manage Users
							</ActionButton>
						</ActionCard>

						<ActionCard>
							<ActionCardTitle>Content Moderation</ActionCardTitle>
							<ActionCardDescription>
								Review and moderate user-submitted content
							</ActionCardDescription>
							<ActionButton
								onClick={() => (window.location.href = '/admin/content')}
							>
								Moderate Content
							</ActionButton>
						</ActionCard>

						<ActionCard>
							<ActionCardTitle>System Monitoring</ActionCardTitle>
							<ActionCardDescription>
								View system metrics and health status
							</ActionCardDescription>
							<ActionButton
								onClick={() => (window.location.href = '/admin/monitoring')}
							>
								View Metrics
							</ActionButton>
						</ActionCard>

						<ActionCard>
							<ActionCardTitle>System Cache</ActionCardTitle>
							<ActionCardDescription>
								Clear system cache to refresh data
							</ActionCardDescription>
							<ActionButton onClick={handleClearCache}>
								Clear Cache
							</ActionButton>
						</ActionCard>
					</ActionGrid>
				</>
			)}
		</DashboardContainer>
	);
};
