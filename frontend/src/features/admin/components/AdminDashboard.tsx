import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Alert } from '../../../components/common/Alert';
import { Card, CardContent } from '../../../components/common/Card';
import { Flex, Grid } from '../../../components/common/Layout';
import { Loading } from '../../../components/common/Loading';
import { H1, H4, Typography } from '../../../components/common/Typography';
import { admin } from '../../../services/api';

// Styled components
const StatsCard = styled(Card)`
	transition:
		transform 0.3s ease-in-out,
		box-shadow 0.3s ease-in-out;

	&:hover {
		transform: translateY(-5px);
		box-shadow: ${({ theme }) => theme.shadows.lg};
	}
`;

const StatValue = styled(H4)`
	margin: 0;
	color: ${({ theme }) => theme.colors.primary};
`;

const StatLabel = styled(Typography)`
	color: ${({ theme }) => theme.colors.text.secondary};
	font-size: 0.9rem;
`;

const StatIcon = styled.div`
	width: 48px;
	height: 48px;
	border-radius: 50%;
	background-color: ${({ theme }) => `${theme.colors.primary}20`};
	display: flex;
	align-items: center;
	justify-content: center;
	color: ${({ theme }) => theme.colors.primary};
	font-size: 1.5rem;
	margin-right: ${({ theme }) => theme.spacing.md};
`;

const DashboardHeader = styled.div`
	margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const RecentActivityContainer = styled.div`
	margin-top: ${({ theme }) => theme.spacing.xl};
`;

const ActivityItem = styled.div`
	padding: ${({ theme }) => theme.spacing.sm};
	border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};

	&:last-child {
		border-bottom: none;
	}
`;

const ActivityTime = styled.span`
	color: ${({ theme }) => theme.colors.text.secondary};
	font-size: 0.8rem;
`;

const ActivityMessage = styled.div`
	margin-top: ${({ theme }) => theme.spacing.xs};
`;

const ActivityLevel = styled.span<{ level: string }>`
	display: inline-block;
	padding: 2px 6px;
	border-radius: ${({ theme }) => theme.borderRadius.sm};
	font-size: 0.75rem;
	font-weight: 600;
	margin-right: ${({ theme }) => theme.spacing.sm};
	background-color: ${({ theme, level }) => {
		switch (level) {
			case 'error':
				return `${theme.colors.text.error}20`;
			case 'warn':
				return `${theme.colors.text.warning}20`;
			case 'info':
				return `${theme.colors.primary}20`;
			default:
				return `${theme.colors.text.success}20`;
		}
	}};
	color: ${({ theme, level }) => {
		switch (level) {
			case 'error':
				return theme.colors.text.error;
			case 'warn':
				return theme.colors.text.warning;
			case 'info':
				return theme.colors.primary;
			default:
				return theme.colors.text.success;
		}
	}};
`;

interface DashboardStats {
	totalUsers: number;
	activeUsers: number;
	totalMatches: number;
	watchlistEntries: number;
}

interface AuditLogEntry {
	log_id: string;
	level: string;
	message: string;
	source: string;
	created_at: string;
	metadata?: any;
}

const AdminDashboard: React.FC = () => {
	const [stats, setStats] = useState<DashboardStats>({
		totalUsers: 0,
		activeUsers: 0,
		totalMatches: 0,
		watchlistEntries: 0,
	});
	const [recentLogs, setRecentLogs] = useState<AuditLogEntry[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				setIsLoading(true);
				setError(null);

				// In a real application, these would be actual API calls
				// to fetch dashboard statistics and recent logs
				const statsResponse = await admin.getDashboardStats();
				setStats(statsResponse.stats);

				// Get recent logs for activity feed
				const logsResponse = await admin.getAuditLogs({ limit: 5, offset: 0 });
				setRecentLogs(logsResponse.logs);
			} catch (err) {
				setError(
					'Failed to load dashboard data: ' +
						(err instanceof Error ? err.message : String(err))
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchDashboardData();
	}, []);

	// Format date for display
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		}).format(date);
	};

	if (isLoading) {
		return <Loading message='Loading dashboard data...' />;
	}

	if (error) {
		return <Alert variant='error'>{error}</Alert>;
	}

	return (
		<>
			<DashboardHeader>
				<H1 gutterBottom>Admin Dashboard</H1>
				<Typography>
					Welcome to the Pairflix admin dashboard. Manage your application and
					monitor system performance.
				</Typography>
			</DashboardHeader>

			<Grid columns={4} gap='lg'>
				<StatsCard>
					<CardContent>
						<Flex alignItems='center'>
							<StatIcon>
								<i className='fas fa-users'></i>
							</StatIcon>
							<div>
								<StatValue>{stats.totalUsers}</StatValue>
								<StatLabel>Total Users</StatLabel>
							</div>
						</Flex>
					</CardContent>
				</StatsCard>

				<StatsCard>
					<CardContent>
						<Flex alignItems='center'>
							<StatIcon>
								<i className='fas fa-user-check'></i>
							</StatIcon>
							<div>
								<StatValue>{stats.activeUsers}</StatValue>
								<StatLabel>Active Users</StatLabel>
							</div>
						</Flex>
					</CardContent>
				</StatsCard>

				<StatsCard>
					<CardContent>
						<Flex alignItems='center'>
							<StatIcon>
								<i className='fas fa-heart'></i>
							</StatIcon>
							<div>
								<StatValue>{stats.totalMatches}</StatValue>
								<StatLabel>Total Matches</StatLabel>
							</div>
						</Flex>
					</CardContent>
				</StatsCard>

				<StatsCard>
					<CardContent>
						<Flex alignItems='center'>
							<StatIcon>
								<i className='fas fa-list'></i>
							</StatIcon>
							<div>
								<StatValue>{stats.watchlistEntries}</StatValue>
								<StatLabel>Watchlist Entries</StatLabel>
							</div>
						</Flex>
					</CardContent>
				</StatsCard>
			</Grid>

			<RecentActivityContainer>
				<H4>Recent Activity</H4>
				<Card>
					<CardContent>
						{recentLogs.length > 0 ? (
							recentLogs.map((log) => (
								<ActivityItem key={log.log_id}>
									<Flex justifyContent='space-between' alignItems='center'>
										<ActivityLevel level={log.level}>
											{log.level.toUpperCase()}
										</ActivityLevel>
										<ActivityTime>{formatDate(log.created_at)}</ActivityTime>
									</Flex>
									<ActivityMessage>{log.message}</ActivityMessage>
									<Typography variant='body2'>Source: {log.source}</Typography>
								</ActivityItem>
							))
						) : (
							<Typography>No recent activity to display</Typography>
						)}
					</CardContent>
				</Card>
			</RecentActivityContainer>
		</>
	);
};

export default AdminDashboard;
