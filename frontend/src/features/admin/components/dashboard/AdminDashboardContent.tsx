import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../../../components/common/Button';
import { Card, CardContent } from '../../../../components/common/Card';
import { Grid } from '../../../../components/common/Layout';
import { Loading } from '../../../../components/common/Loading';
import { H3, Typography } from '../../../../components/common/Typography';
import { adminStatsService } from '../../../../services/adminStats.service';
import { fetchWithAuth } from '../../../../services/api';
import StatsOverview from '../shared/StatsOverview';

const DashboardGrid = styled(Grid)`
	margin-top: ${({ theme }) => theme.spacing.lg};
`;

const ActionButtons = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: ${({ theme }) => theme.spacing.md};
	margin-top: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled(H3)`
	margin-bottom: ${({ theme }) => theme.spacing.md};
	margin-top: ${({ theme }) => theme.spacing.lg};
`;

const AdminDashboardContent: React.FC = () => {
	const [metrics, setMetrics] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch metrics data
	useEffect(() => {
		const fetchMetrics = async () => {
			try {
				setIsLoading(true);
				setError(null);

				// Use the centralized admin stats service
				const metricsData = await adminStatsService.getDashboardStats();
				setMetrics(metricsData);
			} catch (err) {
				setError(
					`Failed to load dashboard metrics: ${err instanceof Error ? err.message : String(err)}`
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchMetrics();
	}, []);

	const handleRefreshStats = async () => {
		try {
			setIsLoading(true);
			setError(null);

			// Force a refresh by setting the cache bust flag to true
			const metricsData = await adminStatsService.getDashboardStats(true);
			setMetrics(metricsData);
		} catch (err) {
			setError(
				`Failed to refresh metrics: ${err instanceof Error ? err.message : String(err)}`
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleClearCache = async () => {
		try {
			// Clear the admin stats service cache
			adminStatsService.clearCache();
			// Call the server to clear its cache
			await fetchWithAuth('/api/admin/clear-cache', { method: 'POST' });
			// Refresh metrics after clearing cache
			handleRefreshStats();
		} catch (err) {
			setError(
				`Failed to clear cache: ${err instanceof Error ? err.message : String(err)}`
			);
		}
	};

	if (isLoading && !metrics) {
		return <Loading message='Loading dashboard metrics...' />;
	}

	if (error) {
		return (
			<Card variant='primary' accentColor='var(--color-error)'>
				<CardContent>
					<Typography variant='body1'>{error}</Typography>
					<Button onClick={handleRefreshStats} style={{ marginTop: '1rem' }}>
						Try Again
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			{metrics && (
				<>
					<StatsOverview
						metrics={metrics}
						cards={['users', 'content', 'activity', 'systemHealth']}
					/>

					<SectionTitle>Quick Actions</SectionTitle>
					<ActionButtons>
						<Button
							variant='primary'
							onClick={() => (window.location.href = '/admin/users')}
						>
							Manage Users
						</Button>
						<Button
							variant='secondary'
							onClick={() => (window.location.href = '/admin/activity')}
						>
							View Activity Logs
						</Button>
						<Button variant='secondary' onClick={handleRefreshStats}>
							Refresh Stats
						</Button>
						<Button variant='warning' onClick={handleClearCache}>
							Clear System Cache
						</Button>
					</ActionButtons>

					<SectionTitle>Recent Activity</SectionTitle>
					<DashboardGrid columns={2} gap='md'>
						<Card>
							<CardContent>
								<H3 gutterBottom>New Users</H3>
								{metrics.recentUsers ? (
									<div>
										<Typography variant='body1'>
											{metrics.recentUsers.count} new users in the last{' '}
											{metrics.recentUsers.days} days
										</Typography>
										<Typography variant='body2' style={{ marginTop: '0.5rem' }}>
											{metrics.recentUsers.percentage}%{' '}
											{metrics.recentUsers.trend === 'up'
												? 'increase'
												: 'decrease'}{' '}
											from previous period
										</Typography>
									</div>
								) : (
									<Typography variant='body1'>
										No recent user data available
									</Typography>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardContent>
								<H3 gutterBottom>System Health</H3>
								{metrics.system ? (
									<>
										<Typography variant='body1'>
											{metrics.system.status === 'healthy'
												? 'All systems operational'
												: 'Some system issues detected'}
										</Typography>
										{metrics.system.recentErrors > 0 && (
											<Typography
												variant='body2'
												style={{
													color: 'var(--color-error)',
													marginTop: '0.5rem',
												}}
											>
												{metrics.system.recentErrors} errors in the last 24
												hours
											</Typography>
										)}
									</>
								) : (
									<Typography variant='body1'>
										System health data unavailable
									</Typography>
								)}
							</CardContent>
						</Card>
					</DashboardGrid>

					<SectionTitle>Admin Resources</SectionTitle>
					<DashboardGrid columns={3} gap='md'>
						<Card>
							<CardContent>
								<H3 gutterBottom>Documentation</H3>
								<Typography variant='body2' gutterBottom>
									Access admin documentation and guides
								</Typography>
								<Button
									variant='text'
									onClick={() => window.open('/admin/docs', '_blank')}
								>
									View Docs
								</Button>
							</CardContent>
						</Card>

						<Card>
							<CardContent>
								<H3 gutterBottom>Support</H3>
								<Typography variant='body2' gutterBottom>
									Contact technical support for assistance
								</Typography>
								<Button
									variant='text'
									onClick={() => window.open('mailto:support@pairflix.com')}
								>
									Contact Support
								</Button>
							</CardContent>
						</Card>

						<Card>
							<CardContent>
								<H3 gutterBottom>Settings</H3>
								<Typography variant='body2' gutterBottom>
									Configure system and application settings
								</Typography>
								<Button
									variant='text'
									onClick={() => (window.location.href = '/admin/settings')}
								>
									Open Settings
								</Button>
							</CardContent>
						</Card>
					</DashboardGrid>
				</>
			)}
		</>
	);
};

export default AdminDashboardContent;
