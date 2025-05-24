import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ActivityLog, adminService } from '../../../services/admin.service';

const PageContainer = styled.div`
	padding-bottom: 2rem;
`;

const PageHeader = styled.div`
	margin-bottom: 2rem;
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

const FiltersContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
	margin-bottom: 1.5rem;
	background-color: #1a1a1a;
	padding: 1rem;
	border-radius: 0.5rem;
`;

const FilterGroup = styled.div`
	flex: 1;
	min-width: 200px;
`;

const FilterLabel = styled.label`
	display: block;
	color: #e0e0e0;
	margin-bottom: 0.5rem;
	font-size: 0.875rem;
`;

const FilterSelect = styled.select`
	width: 100%;
	padding: 0.5rem;
	border-radius: 0.25rem;
	border: 1px solid #333;
	background-color: #333;
	color: #e0e0e0;
`;

const FilterInput = styled.input`
	width: 100%;
	padding: 0.5rem;
	border-radius: 0.25rem;
	border: 1px solid #333;
	background-color: #333;
	color: #e0e0e0;
`;

const Table = styled.table`
	width: 100%;
	border-collapse: collapse;
	margin-top: 1.5rem;
	background-color: #1e1e1e;
	border-radius: 0.5rem;
	overflow: hidden;
`;

const TableHead = styled.thead`
	background-color: #2a2a2a;
`;

const TableRow = styled.tr`
	&:not(:last-child) {
		border-bottom: 1px solid #333;
	}

	&:hover {
		background-color: #2a2a2a;
	}
`;

const TableHeader = styled.th`
	padding: 1rem;
	text-align: left;
	color: #e0e0e0;
	font-weight: 500;
`;

const TableCell = styled.td`
	padding: 1rem;
	color: #b3b3b3;
`;

const UserLink = styled.a`
	color: #2196f3;
	text-decoration: none;

	&:hover {
		text-decoration: underline;
	}
`;

const ActionBadge = styled.span<{ action: string }>`
	padding: 0.25rem 0.5rem;
	border-radius: 1rem;
	font-size: 0.75rem;
	background-color: ${({ action }) => {
		switch (action.toLowerCase()) {
			case 'create':
			case 'add':
				return '#4caf5020';
			case 'delete':
			case 'remove':
				return '#f4433620';
			case 'update':
			case 'modify':
				return '#ff980020';
			case 'login':
			case 'logout':
				return '#2196f320';
			default:
				return '#9e9e9e20';
		}
	}};
	color: ${({ action }) => {
		switch (action.toLowerCase()) {
			case 'create':
			case 'add':
				return '#4caf50';
			case 'delete':
			case 'remove':
				return '#f44336';
			case 'update':
			case 'modify':
				return '#ff9800';
			case 'login':
			case 'logout':
				return '#2196f3';
			default:
				return '#9e9e9e';
		}
	}};
`;

const Pagination = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 1.5rem;
`;

const PageInfo = styled.div`
	color: #b3b3b3;
	font-size: 0.875rem;
`;

const PaginationButtons = styled.div`
	display: flex;
	gap: 0.5rem;
`;

const PaginationButton = styled.button<{ active?: boolean }>`
	padding: 0.5rem 0.75rem;
	border: none;
	border-radius: 0.25rem;
	background-color: ${({ active }) => (active ? '#2196f3' : '#333')};
	color: ${({ active }) => (active ? 'white' : '#e0e0e0')};
	cursor: pointer;

	&:hover:not(:disabled) {
		background-color: ${({ active }) => (active ? '#1976d2' : '#444')};
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`;

const ButtonsContainer = styled.div`
	display: flex;
	justify-content: flex-end;
	gap: 1rem;
	margin-bottom: 1rem;
`;

const Button = styled.button`
	background-color: #2196f3;
	color: white;
	border: none;
	padding: 0.5rem 1rem;
	border-radius: 0.25rem;
	cursor: pointer;
	display: flex;
	align-items: center;
	gap: 0.5rem;

	&:hover {
		background-color: #1976d2;
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`;

const SecondaryButton = styled(Button)`
	background-color: #424242;

	&:hover {
		background-color: #616161;
	}
`;

const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
	}).format(date);
};

export const ActivityLogsPage: React.FC = () => {
	const [logs, setLogs] = useState<ActivityLog[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalLogs, setTotalLogs] = useState(0);
	const pageSize = 10;

	// Filter states
	const [userFilter, setUserFilter] = useState('');
	const [actionFilter, setActionFilter] = useState('');
	const [dateFilter, setDateFilter] = useState('');
	const [entityTypeFilter, setEntityTypeFilter] = useState('');

	useEffect(() => {
		fetchLogs();
	}, [page, userFilter, actionFilter, dateFilter, entityTypeFilter]);

	const fetchLogs = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const filters = {
				page,
				limit: pageSize,
				...(userFilter && { userId: userFilter }),
				...(actionFilter && { action: actionFilter }),
				...(dateFilter && { date: dateFilter }),
				...(entityTypeFilter && { entityType: entityTypeFilter }),
			};

			const response = await adminService.getActivityLogs(filters);

			setLogs(response.logs);
			setTotalPages(response.pagination.totalPages);
			setTotalLogs(response.pagination.totalCount);
		} catch (err) {
			setError(
				`Failed to fetch activity logs: ${err instanceof Error ? err.message : String(err)}`
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handlePageChange = (newPage: number) => {
		if (newPage > 0 && newPage <= totalPages) {
			setPage(newPage);
		}
	};

	const handleRefresh = () => {
		fetchLogs();
	};

	const handleExport = async () => {
		try {
			await adminService.exportActivityLogs({
				...(userFilter && { userId: userFilter }),
				...(actionFilter && { action: actionFilter }),
				...(dateFilter && { date: dateFilter }),
				...(entityTypeFilter && { entityType: entityTypeFilter }),
			});
			alert(
				'Export started. You will be notified when the file is ready for download.'
			);
		} catch (err) {
			alert(
				`Failed to export logs: ${err instanceof Error ? err.message : String(err)}`
			);
		}
	};

	const handleClearFilters = () => {
		setUserFilter('');
		setActionFilter('');
		setDateFilter('');
		setEntityTypeFilter('');
	};

	return (
		<PageContainer>
			<PageHeader>
				<H1>Activity Logs</H1>
				<SubHeading>
					View and analyze user activities across the platform
				</SubHeading>
			</PageHeader>

			<ButtonsContainer>
				<SecondaryButton onClick={handleExport}>Export Logs</SecondaryButton>
				<Button onClick={handleRefresh}>Refresh</Button>
			</ButtonsContainer>

			<FiltersContainer>
				<FilterGroup>
					<FilterLabel htmlFor='userFilter'>User</FilterLabel>
					<FilterInput
						id='userFilter'
						type='text'
						placeholder='Filter by user ID/email'
						value={userFilter}
						onChange={(e) => setUserFilter(e.target.value)}
					/>
				</FilterGroup>

				<FilterGroup>
					<FilterLabel htmlFor='actionFilter'>Action</FilterLabel>
					<FilterSelect
						id='actionFilter'
						value={actionFilter}
						onChange={(e) => setActionFilter(e.target.value)}
					>
						<option value=''>All Actions</option>
						<option value='create'>Create</option>
						<option value='update'>Update</option>
						<option value='delete'>Delete</option>
						<option value='login'>Login</option>
						<option value='logout'>Logout</option>
					</FilterSelect>
				</FilterGroup>

				<FilterGroup>
					<FilterLabel htmlFor='entityTypeFilter'>Entity Type</FilterLabel>
					<FilterSelect
						id='entityTypeFilter'
						value={entityTypeFilter}
						onChange={(e) => setEntityTypeFilter(e.target.value)}
					>
						<option value=''>All Entities</option>
						<option value='user'>User</option>
						<option value='watchlist'>Watchlist</option>
						<option value='match'>Match</option>
						<option value='setting'>Setting</option>
					</FilterSelect>
				</FilterGroup>

				<FilterGroup>
					<FilterLabel htmlFor='dateFilter'>Date</FilterLabel>
					<FilterInput
						id='dateFilter'
						type='date'
						value={dateFilter}
						onChange={(e) => setDateFilter(e.target.value)}
					/>
				</FilterGroup>
			</FiltersContainer>

			<SecondaryButton onClick={handleClearFilters}>
				Clear Filters
			</SecondaryButton>

			{isLoading ? (
				<p>Loading activity logs...</p>
			) : error ? (
				<p style={{ color: '#f44336' }}>{error}</p>
			) : (
				<>
					<Table>
						<TableHead>
							<TableRow>
								<TableHeader>Timestamp</TableHeader>
								<TableHeader>User</TableHeader>
								<TableHeader>Action</TableHeader>
								<TableHeader>Entity Type</TableHeader>
								<TableHeader>Entity ID</TableHeader>
								<TableHeader>Details</TableHeader>
							</TableRow>
						</TableHead>
						<tbody>
							{logs.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6}>No activity logs found</TableCell>
								</TableRow>
							) : (
								logs.map((log) => (
									<TableRow key={log.id}>
										<TableCell>{formatDate(log.timestamp)}</TableCell>
										<TableCell>
											<UserLink href={`/admin/users/${log.userId}`}>
												{log.userEmail || log.userId}
											</UserLink>
										</TableCell>
										<TableCell>
											<ActionBadge action={log.action}>
												{log.action}
											</ActionBadge>
										</TableCell>
										<TableCell>{log.entityType}</TableCell>
										<TableCell>{log.entityId}</TableCell>
										<TableCell>{log.details}</TableCell>
									</TableRow>
								))
							)}
						</tbody>
					</Table>

					<Pagination>
						<PageInfo>
							Showing {logs.length} of {totalLogs} logs | Page {page} of{' '}
							{totalPages}
						</PageInfo>
						<PaginationButtons>
							<PaginationButton
								onClick={() => handlePageChange(1)}
								disabled={page === 1}
							>
								First
							</PaginationButton>
							<PaginationButton
								onClick={() => handlePageChange(page - 1)}
								disabled={page === 1}
							>
								Previous
							</PaginationButton>
							{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
								// Show current page and some pages around it
								let pageNum;
								if (totalPages <= 5) {
									// If we have 5 or fewer pages, show all
									pageNum = i + 1;
								} else if (page <= 3) {
									// If we're near the start
									pageNum = i + 1;
								} else if (page >= totalPages - 2) {
									// If we're near the end
									pageNum = totalPages - 4 + i;
								} else {
									// We're in the middle
									pageNum = page - 2 + i;
								}

								return (
									<PaginationButton
										key={pageNum}
										active={pageNum === page}
										onClick={() => handlePageChange(pageNum)}
									>
										{pageNum}
									</PaginationButton>
								);
							})}
							<PaginationButton
								onClick={() => handlePageChange(page + 1)}
								disabled={page === totalPages}
							>
								Next
							</PaginationButton>
							<PaginationButton
								onClick={() => handlePageChange(totalPages)}
								disabled={page === totalPages}
							>
								Last
							</PaginationButton>
						</PaginationButtons>
					</Pagination>
				</>
			)}
		</PageContainer>
	);
};
