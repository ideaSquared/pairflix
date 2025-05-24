import { useEffect, useState } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { adminStatsService } from '../../services/adminStats.service';

type DashboardStats = {
	totalUsers: number;
	activeUsers: number;
	totalWatchlistItems: number;
	totalMatches: number;
	recentActivity: {
		id: string;
		userId: string;
		activityType: string;
		timestamp: string;
		userName: string;
	}[];
};

export const DashboardPage = () => {
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { logout } = useAdminAuth();

	useEffect(() => {
		const fetchDashboardStats = async () => {
			try {
				setIsLoading(true);
				// Use the adminStatsService instead of direct fetch
				const statsData = await adminStatsService.getDashboardStats();
				setStats(statsData);
			} catch (err) {
				console.error('Error loading dashboard stats:', err);
				if (err instanceof Error) {
					setError(`Failed to load dashboard statistics: ${err.message}`);

					// Check if authentication error
					if (err.message === 'Authentication required') {
						// Handle authentication error
						logout();
					}
				} else {
					setError('Failed to load dashboard statistics: Unknown error');
				}
			} finally {
				setIsLoading(false);
			}
		};

		fetchDashboardStats();
	}, [logout]);

	// Add a retry function for better user experience
	const handleRetry = async () => {
		try {
			setIsLoading(true);
			setError(null);
			// Force refresh to bypass cache
			const statsData = await adminStatsService.getDashboardStats(true);
			setStats(statsData);
		} catch (err) {
			console.error('Error retrying dashboard stats:', err);
			if (err instanceof Error) {
				setError(`Failed to load dashboard statistics: ${err.message}`);
			} else {
				setError('Failed to load dashboard statistics: Unknown error');
			}
		} finally {
			setIsLoading(false);
		}
	};

	if (isLoading) {
		return <div>Loading dashboard data...</div>;
	}

	if (error) {
		return (
			<div className='alert alert-error'>
				{error}
				<button
					onClick={handleRetry}
					style={{ marginLeft: '10px' }}
					className='btn btn-small btn-primary'
				>
					Retry
				</button>
			</div>
		);
	}

	return (
		<div>
			<h1>Dashboard</h1>

			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
					gap: '20px',
					marginTop: '20px',
				}}
			>
				<div className='admin-card'>
					<h3>Total Users</h3>
					<p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
						{stats?.totalUsers || 0}
					</p>
				</div>

				<div className='admin-card'>
					<h3>Active Users</h3>
					<p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
						{stats?.activeUsers || 0}
					</p>
				</div>

				<div className='admin-card'>
					<h3>Watchlist Items</h3>
					<p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
						{stats?.totalWatchlistItems || 0}
					</p>
				</div>

				<div className='admin-card'>
					<h3>Total Matches</h3>
					<p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
						{stats?.totalMatches || 0}
					</p>
				</div>
			</div>

			<div className='admin-card' style={{ marginTop: '40px' }}>
				<h3>Recent Activity</h3>
				<table>
					<thead>
						<tr>
							<th>User</th>
							<th>Activity</th>
							<th>Time</th>
						</tr>
					</thead>
					<tbody>
						{stats?.recentActivity && stats.recentActivity.length > 0 ? (
							stats.recentActivity.map((activity) => (
								<tr key={activity.id}>
									<td>{activity.userName}</td>
									<td>{activity.activityType}</td>
									<td>{new Date(activity.timestamp).toLocaleString()}</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={3}>No recent activity</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};
