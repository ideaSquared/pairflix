import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Alert } from '../../../../components/common/Alert';
import { Badge } from '../../../../components/common/Badge';
import { Card, CardContent } from '../../../../components/common/Card';
import {
	FilterGroup,
	FilterItem,
} from '../../../../components/common/FilterGroup';
import { Input } from '../../../../components/common/Input';
import { Grid } from '../../../../components/common/Layout';
import { Pagination } from '../../../../components/common/Pagination';
import { Select } from '../../../../components/common/Select';
import {
	Table,
	TableActionButton,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeaderCell,
} from '../../../../components/common/Table';
import { H3, Typography } from '../../../../components/common/Typography';
import { adminStatsService } from '../../../../services/adminStats.service';
import { admin } from '../../../../services/api';

// Styled components
const StatsGrid = styled(Grid)`
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	gap: ${({ theme }) => theme.spacing.md};
	margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ActivityTable = styled(Card)`
	overflow: hidden;
`;

const SectionHeader = styled(H3)`
	margin-top: ${({ theme }) => theme.spacing.lg};
	margin-bottom: ${({ theme }) => theme.spacing.md};
`;

interface Activity {
	id: string;
	user_id: string;
	action: string;
	details: Record<string, any>;
	created_at: string;
	username?: string;
}

interface ActivityStats {
	totalActivities: number;
	activityByType: { action: string; count: number }[];
	mostActiveUsers: {
		user_id: string;
		user?: { username: string };
		count: number;
	}[];
	activityByDay: { date: string; count: number }[];
}

const UserActivityContent: React.FC = () => {
	const [activities, setActivities] = useState<Activity[]>([]);
	const [stats, setStats] = useState<ActivityStats | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [totalCount, setTotalCount] = useState(0);

	// Filter states
	const [selectedAction, setSelectedAction] = useState<string>('');
	const [selectedUser, setSelectedUser] = useState<string>('');
	const [startDate, setStartDate] = useState<string>('');
	const [endDate, setEndDate] = useState<string>('');
	const [page, setPage] = useState(1);
	const [timeRange, setTimeRange] = useState<7 | 14 | 30>(7);
	const limit = 20;

	// Load initial data
	useEffect(() => {
		const fetchActivityData = async () => {
			try {
				setIsLoading(true);
				setError(null);

				// Use our centralized statistics service for activity stats
				const activityData =
					await adminStatsService.getUserActivityStats(timeRange);
				setStats(activityData);

				// Get activities with current filters
				await fetchActivities();
			} catch (err) {
				setError(
					'Failed to load activity data: ' +
						(err instanceof Error ? err.message : String(err))
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchActivityData();
	}, [timeRange]);

	// Fetch activities based on current filters
	const fetchActivities = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const offset = (page - 1) * limit;

			// Fix TypeScript error by properly handling optional parameters
			const params: {
				limit: number;
				offset: number;
				action?: string;
				userId?: string;
				startDate?: string;
				endDate?: string;
			} = {
				limit,
				offset,
			};

			// Only add optional parameters if they have values
			if (selectedAction) params.action = selectedAction;
			if (selectedUser) params.userId = selectedUser;
			if (startDate) params.startDate = startDate;
			if (endDate) params.endDate = endDate;

			const response = await admin.getUserActivities(params);
			setActivities(response.activities);
			setTotalCount(response.pagination.total);
		} catch (err) {
			setError(
				'Failed to load activities: ' +
					(err instanceof Error ? err.message : String(err))
			);
		} finally {
			setIsLoading(false);
		}
	};

	// Apply filters
	const applyFilters = () => {
		setPage(1); // Reset to first page when filters change
		fetchActivities();
	};

	// Clear filters
	const clearFilters = () => {
		setSelectedAction('');
		setSelectedUser('');
		setStartDate('');
		setEndDate('');
		setPage(1);
	};

	// Format date for display
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString();
	};

	// Handle time range change for stats
	const handleTimeRangeChange = (days: 7 | 14 | 30) => {
		setTimeRange(days);
	};

	return (
		<>
			{/* Stats Cards */}
			{stats && (
				<StatsGrid>
					<Card
						variant='stats'
						title='Total Activities'
						value={stats.totalActivities}
					/>
					<Card
						variant='stats'
						title='Active Users'
						value={stats.mostActiveUsers.length}
					/>
					<Card
						variant='stats'
						title='Recent Activities'
						value={stats.activityByDay?.[0]?.count || 0}
					/>
					<Typography variant='caption'>today</Typography>
					<Card
						variant='stats'
						title='Activity Types'
						value={stats.activityByType.length}
					/>
				</StatsGrid>
			)}

			{/* Error Message */}
			{error && (
				<Alert variant='error' onClose={() => setError(null)}>
					{error}
				</Alert>
			)}

			{/* Time Range Selector */}
			<FilterGroup
				title='Activity Time Range'
				onApply={() => fetchActivities()}
				onClear={() => {}}
			>
				<FilterItem label='Time Range'>
					<Select
						value={timeRange.toString()}
						onChange={(e) =>
							handleTimeRangeChange(Number(e.target.value) as 7 | 14 | 30)
						}
					>
						<option value='7'>Last 7 Days</option>
						<option value='14'>Last 14 Days</option>
						<option value='30'>Last 30 Days</option>
					</Select>
				</FilterItem>
			</FilterGroup>

			{/* Common Activities */}
			{stats && (
				<>
					<SectionHeader>Most Common Activities</SectionHeader>
					<Grid columns={2} gap='md'>
						<Card>
							<CardContent>
								<h4>Popular Activity Types</h4>
								<Table>
									<TableHead>
										<tr>
											<TableHeaderCell>Action</TableHeaderCell>
											<TableHeaderCell>Count</TableHeaderCell>
										</tr>
									</TableHead>
									<TableBody>
										{stats.activityByType.slice(0, 5).map((activity, index) => (
											<tr key={index}>
												<TableCell>{activity.action}</TableCell>
												<TableCell>
													<Badge>{activity.count}</Badge>
												</TableCell>
											</tr>
										))}
									</TableBody>
								</Table>
							</CardContent>
						</Card>

						<Card>
							<CardContent>
								<h4>Most Active Users</h4>
								<Table>
									<TableHead>
										<tr>
											<TableHeaderCell>User</TableHeaderCell>
											<TableHeaderCell>Activities</TableHeaderCell>
										</tr>
									</TableHead>
									<TableBody>
										{stats.mostActiveUsers.slice(0, 5).map((user, index) => (
											<tr key={index}>
												<TableCell>
													{user.user?.username || `User ${user.user_id}`}
												</TableCell>
												<TableCell>
													<Badge>{user.count}</Badge>
												</TableCell>
											</tr>
										))}
									</TableBody>
								</Table>
							</CardContent>
						</Card>
					</Grid>
				</>
			)}

			{/* Filters */}
			<SectionHeader>User Activity History</SectionHeader>
			<FilterGroup
				title='Filter Activities'
				onApply={applyFilters}
				onClear={clearFilters}
			>
				<FilterItem label='Action'>
					<Select
						value={selectedAction}
						onChange={(e) => setSelectedAction(e.target.value)}
						fullWidth
					>
						<option value=''>All Actions</option>
						<option value='login'>Login</option>
						<option value='logout'>Logout</option>
						<option value='watchlist_add'>Add to Watchlist</option>
						<option value='watchlist_remove'>Remove from Watchlist</option>
						<option value='profile_update'>Update Profile</option>
						<option value='search'>Search</option>
					</Select>
				</FilterItem>

				<FilterItem label='User ID'>
					<Input
						type='text'
						value={selectedUser}
						onChange={(e) => setSelectedUser(e.target.value)}
						placeholder='Enter user ID'
						fullWidth
					/>
				</FilterItem>

				<FilterItem label='Start Date'>
					<Input
						type='date'
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
						fullWidth
					/>
				</FilterItem>

				<FilterItem label='End Date'>
					<Input
						type='date'
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
						fullWidth
					/>
				</FilterItem>
			</FilterGroup>

			{/* Activities Table */}
			<ActivityTable>
				<CardContent noPadding>
					<TableContainer>
						<Table>
							<TableHead>
								<tr>
									<TableHeaderCell>User</TableHeaderCell>
									<TableHeaderCell>Action</TableHeaderCell>
									<TableHeaderCell>Date</TableHeaderCell>
									<TableHeaderCell>Details</TableHeaderCell>
								</tr>
							</TableHead>
							<TableBody>
								{isLoading ? (
									<tr>
										<TableCell colSpan={4} style={{ textAlign: 'center' }}>
											Loading...
										</TableCell>
									</tr>
								) : activities.length === 0 ? (
									<tr>
										<TableCell colSpan={4} style={{ textAlign: 'center' }}>
											No activities found
										</TableCell>
									</tr>
								) : (
									activities.map((activity) => (
										<tr key={activity.id}>
											<TableCell>
												{activity.username || activity.user_id}
											</TableCell>
											<TableCell>
												<Badge>{activity.action}</Badge>
											</TableCell>
											<TableCell>{formatDate(activity.created_at)}</TableCell>
											<TableCell>
												<TableActionButton
													onClick={() =>
														alert(JSON.stringify(activity.details, null, 2))
													}
												>
													View
												</TableActionButton>
											</TableCell>
										</tr>
									))
								)}
							</TableBody>
						</Table>
					</TableContainer>

					{/* Pagination */}
					{!isLoading && totalCount > 0 && (
						<Pagination
							page={page}
							totalCount={totalCount}
							limit={limit}
							onPageChange={setPage}
						/>
					)}
				</CardContent>
			</ActivityTable>
		</>
	);
};

export default UserActivityContent;
