import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  FilterGroup,
  FilterItem,
  Grid,
  H3,
  Input,
  Pagination,
  Select,
  Table,
  TableActionButton,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeaderCell,
} from '@pairflix/components';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { adminStatsService } from '../../../../services/adminStats.service';
import { admin } from '../../../../services/api';
import { ActivityStats } from '../../../../services/api/admin';

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

const TableRow = styled.tr<{ isToday?: boolean }>`
  background-color: ${({ isToday, theme }) =>
    isToday ? `${theme.colors.primary}10` : 'transparent'};

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.secondary};
  }
`;

// Interface for individual activity entries
interface Activity {
  id: string;
  user_id: string;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
  username?: string;
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

        // Process the response data
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      const response = await admin.activity.getUserActivities(params);

      if (response && Array.isArray(response.activities)) {
        setActivities(response.activities as unknown as Activity[]);
        setTotalCount(response.pagination?.total || 0);
      } else {
        setActivities([]);
        setTotalCount(0);
        console.warn('Unexpected response format from activity API:', response);
      }
    } catch (err) {
      console.error('Activity fetch error:', err);
      setError(
        'Failed to load activities: ' +
          (err instanceof Error ? err.message : String(err))
      );
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();

    // Check if the activity date is today
    const isToday = date.toDateString() === today.toDateString();

    // Format: "May 20, 2025, 2:35 PM (Today)" or just the regular date
    return isToday ? `${date.toLocaleString()} (Today)` : date.toLocaleString();
  };

  // Handle time range change for stats
  const handleTimeRangeChange = (days: 7 | 14 | 30) => {
    setTimeRange(days);
  };

  // Find and count today's activities
  const findTodayActivities = (): number => {
    if (!activities || activities.length === 0) return 0;

    const today = new Date().toDateString();
    return activities.filter(
      activity => new Date(activity.created_at).toDateString() === today
    ).length;
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

  // Render
  return (
    <>
      {/* Stats Cards */}
      {stats && (
        <StatsGrid>
          <Card
            variant="stats"
            title="Total Activities"
            value={stats.totalActivities || 0}
          />
          <Card
            variant="stats"
            title="Active Users"
            value={stats.mostActiveUsers?.length || 0}
          />
          <Card
            variant="stats"
            title="Recent Activities"
            value={findTodayActivities() || stats.last24Hours || 0}
            caption="today"
          />
          <Card
            variant="stats"
            title="Activity Types"
            value={stats.activityByType?.length || 0}
          />
        </StatsGrid>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Time Range Selector */}
      <FilterGroup
        title="Activity Time Range"
        onApply={() => fetchActivities()}
        onClear={() => {
          // No filters to clear for time range selector
        }}
      >
        <FilterItem label="Time Range">
          <Select
            value={timeRange.toString()}
            onChange={e =>
              handleTimeRangeChange(Number(e.target.value) as 7 | 14 | 30)
            }
          >
            <option value="7">Last 7 Days</option>
            <option value="14">Last 14 Days</option>
            <option value="30">Last 30 Days</option>
          </Select>
        </FilterItem>
      </FilterGroup>

      {/* Common Activities */}
      {stats && (
        <>
          <SectionHeader>Most Common Activities</SectionHeader>
          <Grid columns={2} gap="md">
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
        title="Filter Activities"
        onApply={applyFilters}
        onClear={clearFilters}
      >
        <FilterItem label="Quick Filters">
          <Button
            onClick={() => {
              const today = new Date();
              const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
              setStartDate(formattedDate);
              setEndDate(formattedDate);
              setTimeout(applyFilters, 0);
            }}
            variant="secondary"
            style={{ marginRight: '8px' }}
          >
            Today's Activities ({findTodayActivities()})
          </Button>
          <Button onClick={clearFilters} variant="text">
            Clear All Filters
          </Button>
        </FilterItem>

        <FilterItem label="Action">
          <Select
            value={selectedAction}
            onChange={e => setSelectedAction(e.target.value)}
            isFullWidth
          >
            <option value="">All Actions</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="watchlist_add">Add to Watchlist</option>
            <option value="watchlist_remove">Remove from Watchlist</option>
            <option value="profile_update">Update Profile</option>
            <option value="search">Search</option>
          </Select>
        </FilterItem>

        <FilterItem label="User ID">
          <Input
            type="text"
            value={selectedUser}
            onChange={e => setSelectedUser(e.target.value)}
            placeholder="Enter user ID"
            isFullWidth
          />
        </FilterItem>

        <FilterItem label="Start Date">
          <Input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            isFullWidth
          />
        </FilterItem>

        <FilterItem label="End Date">
          <Input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            isFullWidth
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
                  activities.map(activity => {
                    const isToday =
                      new Date(activity.created_at).toDateString() ===
                      new Date().toDateString();
                    return (
                      <TableRow key={activity.id} isToday={isToday}>
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
                              alert(JSON.stringify(activity.metadata, null, 2))
                            }
                          >
                            View
                          </TableActionButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
