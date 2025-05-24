import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { adminService } from '../../../services/admin.service';

interface ActivityLog {
	id: string;
	userId: string;
	username: string;
	action: string;
	entityType: string;
	entityId: string;
	details: any;
	ipAddress: string;
	userAgent: string;
	timestamp: string;
}

interface ActivityFilters {
	userId?: string;
	action?: string;
	entityType?: string;
	startDate?: string;
	endDate?: string;
	search?: string;
}

// Styled components
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
	background-color: #1e1e1e;
	border-radius: 0.5rem;
	padding: 1.5rem;
	margin-bottom: 2rem;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const FiltersGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	gap: 1rem;
	margin-bottom: 1rem;
`;

const FormGroup = styled.div`
	margin-bottom: 1rem;
`;

const FormLabel = styled.label`
	display: block;
	margin-bottom: 0.5rem;
	color: #e0e0e0;
	font-size: 0.875rem;
`;

const FormInput = styled.input`
	width: 100%;
	padding: 0.5rem 0.75rem;
	border-radius: 0.25rem;
	border: 1px solid #333;
	background-color: #333;
	color: #e0e0e0;

	&:focus {
		outline: none;
		box-shadow: 0 0 0 2px #2196f380;
	}
`;

const FormSelect = styled.select`
	width: 100%;
	padding: 0.5rem 0.75rem;
	border-radius: 0.25rem;
	border: 1px solid #333;
	background-color: #333;
	color: #e0e0e0;

	&:focus {
		outline: none;
		box-shadow: 0 0 0 2px #2196f380;
	}
`;

const Button = styled.button`
	padding: 0.5rem 1rem;
	border-radius: 0.25rem;
	border: none;
	background-color: #2196f3;
	color: white;
	cursor: pointer;
	transition: background-color 0.2s;

	&:hover {
		background-color: #1976d2;
	}

	&:focus {
		outline: none;
		box-shadow: 0 0 0 2px #2196f380;
	}

	&:disabled {
		background-color: #666;
		cursor: not-allowed;
	}
`;

const SecondaryButton = styled(Button)`
	background-color: #424242;

	&:hover {
		background-color: #616161;
	}
`;

const FiltersActions = styled.div`
	display: flex;
	justify-content: flex-end;
	gap: 0.5rem;
`;

const Table = styled.table`
	width: 100%;
	border-collapse: separate;
	border-spacing: 0;
	margin-bottom: 1.5rem;
`;

const Th = styled.th`
	text-align: left;
	padding: 1rem;
	background-color: #1e1e1e;
	color: #e0e0e0;
	font-weight: 500;
	border-bottom: 1px solid #333;
	position: sticky;
	top: 0;
	z-index: 1;

	&:first-child {
		border-top-left-radius: 0.5rem;
	}

	&:last-child {
		border-top-right-radius: 0.5rem;
	}
`;

const Td = styled.td`
	padding: 0.75rem 1rem;
	border-bottom: 1px solid #333;
	color: #e0e0e0;
`;

const Tr = styled.tr`
	background-color: #1e1e1e;

	&:hover {
		background-color: #252525;
	}

	&:last-child td {
		border-bottom: none;

		&:first-child {
			border-bottom-left-radius: 0.5rem;
		}

		&:last-child {
			border-bottom-right-radius: 0.5rem;
		}
	}
`;

const TableContainer = styled.div`
	overflow-x: auto;
	border-radius: 0.5rem;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Pagination = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 1rem;
`;

const PaginationInfo = styled.div`
	color: #e0e0e0;
`;

const PaginationControls = styled.div`
	display: flex;
	gap: 0.5rem;
`;

const Badge = styled.span<{
	variant: 'info' | 'success' | 'warning' | 'error';
}>`
	display: inline-block;
	padding: 0.25rem 0.5rem;
	border-radius: 0.25rem;
	font-size: 0.75rem;
	font-weight: 500;
	text-transform: uppercase;

	background-color: ${(props) =>
		props.variant === 'info'
			? '#0d47a133'
			: props.variant === 'success'
				? '#1b5e2033'
				: props.variant === 'warning'
					? '#f57c0033'
					: '#d3230033'};

	color: ${(props) =>
		props.variant === 'info'
			? '#42a5f5'
			: props.variant === 'success'
				? '#66bb6a'
				: props.variant === 'warning'
					? '#ffa726'
					: '#ef5350'};
`;

const DetailButton = styled.button`
	background: none;
	border: none;
	color: #2196f3;
	cursor: pointer;
	padding: 0;
	text-decoration: underline;

	&:hover {
		color: #1976d2;
	}
`;

const Modal = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
`;

const ModalContent = styled.div`
	background-color: #1e1e1e;
	border-radius: 0.5rem;
	padding: 1.5rem;
	width: 100%;
	max-width: 800px;
	max-height: 80vh;
	overflow-y: auto;
	position: relative;
`;

const ModalHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
	padding-bottom: 0.5rem;
	border-bottom: 1px solid #333;
`;

const ModalTitle = styled.h3`
	margin: 0;
	color: #e0e0e0;
`;

const CloseButton = styled.button`
	background: none;
	border: none;
	color: #e0e0e0;
	font-size: 1.5rem;
	cursor: pointer;

	&:hover {
		color: #ffffff;
	}
`;

const DetailsGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	gap: 1rem;
	margin-bottom: 1rem;
`;

const DetailItem = styled.div`
	margin-bottom: 0.5rem;
`;

const DetailLabel = styled.div`
	font-size: 0.75rem;
	color: #999;
	margin-bottom: 0.25rem;
`;

const DetailValue = styled.div`
	color: #e0e0e0;
	word-break: break-word;
`;

const JsonView = styled.pre`
	background-color: #252525;
	padding: 1rem;
	border-radius: 0.25rem;
	overflow: auto;
	color: #e0e0e0;
	font-size: 0.875rem;
`;

export const ActivityLogPage: React.FC = () => {
	const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filters, setFilters] = useState<ActivityFilters>({});
	const [totalLogs, setTotalLogs] = useState(0);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(25);
	const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
	const [actionOptions, setActionOptions] = useState<string[]>([]);
	const [entityTypeOptions, setEntityTypeOptions] = useState<string[]>([]);

	useEffect(() => {
		fetchActivityLogs();
		fetchActionOptions();
		fetchEntityTypeOptions();
	}, [page, pageSize]);

	const fetchActivityLogs = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const response = await adminService.getActivityLogs({
				page,
				pageSize,
				...filters,
			});

			setActivityLogs(response.activityLogs);
			setTotalLogs(response.total);
		} catch (err) {
			setError(
				`Failed to load activity logs: ${err instanceof Error ? err.message : String(err)}`
			);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchActionOptions = async () => {
		try {
			const response = await adminService.getActivityLogActions();
			setActionOptions(response.actions);
		} catch (err) {
			console.error('Failed to fetch activity log actions', err);
		}
	};

	const fetchEntityTypeOptions = async () => {
		try {
			const response = await adminService.getActivityLogEntityTypes();
			setEntityTypeOptions(response.entityTypes);
		} catch (err) {
			console.error('Failed to fetch activity log entity types', err);
		}
	};

	const handleFilterChange = (key: keyof ActivityFilters, value: string) => {
		setFilters({
			...filters,
			[key]: value || undefined, // Convert empty strings to undefined
		});
	};

	const handleSearch = () => {
		setPage(1); // Reset to page 1 when searching
		fetchActivityLogs();
	};

	const handleClearFilters = () => {
		setFilters({});
		setPage(1);
		fetchActivityLogs();
	};

	const handleViewDetails = (log: ActivityLog) => {
		setSelectedLog(log);
	};

	const handleCloseDetails = () => {
		setSelectedLog(null);
	};

	const getActionVariant = (
		action: string
	): 'info' | 'success' | 'warning' | 'error' => {
		if (action.includes('CREATE') || action.includes('REGISTER')) {
			return 'success';
		}
		if (action.includes('UPDATE') || action.includes('LOGIN')) {
			return 'info';
		}
		if (action.includes('DELETE') || action.includes('REMOVE')) {
			return 'warning';
		}
		if (action.includes('ERROR') || action.includes('FAILED')) {
			return 'error';
		}
		return 'info';
	};

	return (
		<PageContainer>
			<PageHeader>
				<H1>Activity Logs</H1>
				<SubHeading>View and manage user activity on the platform</SubHeading>
			</PageHeader>

			<FiltersContainer>
				<FiltersGrid>
					<FormGroup>
						<FormLabel htmlFor='user'>User ID</FormLabel>
						<FormInput
							id='user'
							type='text'
							value={filters.userId || ''}
							onChange={(e) => handleFilterChange('userId', e.target.value)}
							placeholder='Filter by user ID'
						/>
					</FormGroup>

					<FormGroup>
						<FormLabel htmlFor='action'>Action</FormLabel>
						<FormSelect
							id='action'
							value={filters.action || ''}
							onChange={(e) => handleFilterChange('action', e.target.value)}
						>
							<option value=''>All Actions</option>
							{actionOptions.map((action) => (
								<option key={action} value={action}>
									{action}
								</option>
							))}
						</FormSelect>
					</FormGroup>

					<FormGroup>
						<FormLabel htmlFor='entityType'>Entity Type</FormLabel>
						<FormSelect
							id='entityType'
							value={filters.entityType || ''}
							onChange={(e) => handleFilterChange('entityType', e.target.value)}
						>
							<option value=''>All Entity Types</option>
							{entityTypeOptions.map((type) => (
								<option key={type} value={type}>
									{type}
								</option>
							))}
						</FormSelect>
					</FormGroup>

					<FormGroup>
						<FormLabel htmlFor='startDate'>Start Date</FormLabel>
						<FormInput
							id='startDate'
							type='date'
							value={filters.startDate || ''}
							onChange={(e) => handleFilterChange('startDate', e.target.value)}
						/>
					</FormGroup>

					<FormGroup>
						<FormLabel htmlFor='endDate'>End Date</FormLabel>
						<FormInput
							id='endDate'
							type='date'
							value={filters.endDate || ''}
							onChange={(e) => handleFilterChange('endDate', e.target.value)}
						/>
					</FormGroup>

					<FormGroup>
						<FormLabel htmlFor='search'>Search</FormLabel>
						<FormInput
							id='search'
							type='text'
							value={filters.search || ''}
							onChange={(e) => handleFilterChange('search', e.target.value)}
							placeholder='Search in details'
						/>
					</FormGroup>
				</FiltersGrid>

				<FiltersActions>
					<SecondaryButton onClick={handleClearFilters}>
						Clear Filters
					</SecondaryButton>
					<Button onClick={handleSearch}>Apply Filters</Button>
				</FiltersActions>
			</FiltersContainer>

			{error && <p style={{ color: '#f44336' }}>{error}</p>}

			<TableContainer>
				<Table>
					<thead>
						<tr>
							<Th>Time</Th>
							<Th>User</Th>
							<Th>Action</Th>
							<Th>Entity</Th>
							<Th>IP Address</Th>
							<Th>Details</Th>
						</tr>
					</thead>
					<tbody>
						{isLoading && !activityLogs.length ? (
							<tr>
								<Td colSpan={6} style={{ textAlign: 'center' }}>
									Loading...
								</Td>
							</tr>
						) : activityLogs.length === 0 ? (
							<tr>
								<Td colSpan={6} style={{ textAlign: 'center' }}>
									No activity logs found.
								</Td>
							</tr>
						) : (
							activityLogs.map((log) => (
								<Tr key={log.id}>
									<Td>{new Date(log.timestamp).toLocaleString()}</Td>
									<Td>
										{log.username}
										<br />
										<span style={{ fontSize: '0.75rem', color: '#999' }}>
											{log.userId}
										</span>
									</Td>
									<Td>
										<Badge variant={getActionVariant(log.action)}>
											{log.action}
										</Badge>
									</Td>
									<Td>
										{log.entityType}
										{log.entityId && (
											<>
												<br />
												<span style={{ fontSize: '0.75rem', color: '#999' }}>
													{log.entityId}
												</span>
											</>
										)}
									</Td>
									<Td>{log.ipAddress}</Td>
									<Td>
										<DetailButton onClick={() => handleViewDetails(log)}>
											View Details
										</DetailButton>
									</Td>
								</Tr>
							))
						)}
					</tbody>
				</Table>
			</TableContainer>

			<Pagination>
				<PaginationInfo>
					Showing {activityLogs.length} of {totalLogs} logs
				</PaginationInfo>
				<PaginationControls>
					<Button
						onClick={() => setPage(page - 1)}
						disabled={page === 1 || isLoading}
					>
						Previous
					</Button>
					<Button
						onClick={() => setPage(page + 1)}
						disabled={page * pageSize >= totalLogs || isLoading}
					>
						Next
					</Button>
					<FormSelect
						value={pageSize}
						onChange={(e) => {
							setPageSize(Number(e.target.value));
							setPage(1);
						}}
						style={{ marginLeft: '0.5rem', width: 'auto' }}
					>
						<option value='10'>10 per page</option>
						<option value='25'>25 per page</option>
						<option value='50'>50 per page</option>
						<option value='100'>100 per page</option>
					</FormSelect>
				</PaginationControls>
			</Pagination>

			{selectedLog && (
				<Modal onClick={handleCloseDetails}>
					<ModalContent onClick={(e) => e.stopPropagation()}>
						<ModalHeader>
							<ModalTitle>Activity Log Details</ModalTitle>
							<CloseButton onClick={handleCloseDetails}>&times;</CloseButton>
						</ModalHeader>

						<DetailsGrid>
							<DetailItem>
								<DetailLabel>Date & Time</DetailLabel>
								<DetailValue>
									{new Date(selectedLog.timestamp).toLocaleString()}
								</DetailValue>
							</DetailItem>

							<DetailItem>
								<DetailLabel>User</DetailLabel>
								<DetailValue>
									{selectedLog.username} ({selectedLog.userId})
								</DetailValue>
							</DetailItem>

							<DetailItem>
								<DetailLabel>Action</DetailLabel>
								<DetailValue>
									<Badge variant={getActionVariant(selectedLog.action)}>
										{selectedLog.action}
									</Badge>
								</DetailValue>
							</DetailItem>

							<DetailItem>
								<DetailLabel>Entity Type</DetailLabel>
								<DetailValue>{selectedLog.entityType}</DetailValue>
							</DetailItem>

							{selectedLog.entityId && (
								<DetailItem>
									<DetailLabel>Entity ID</DetailLabel>
									<DetailValue>{selectedLog.entityId}</DetailValue>
								</DetailItem>
							)}

							<DetailItem>
								<DetailLabel>IP Address</DetailLabel>
								<DetailValue>{selectedLog.ipAddress}</DetailValue>
							</DetailItem>

							<DetailItem>
								<DetailLabel>User Agent</DetailLabel>
								<DetailValue>{selectedLog.userAgent}</DetailValue>
							</DetailItem>
						</DetailsGrid>

						<DetailItem>
							<DetailLabel>Details</DetailLabel>
							<JsonView>
								{JSON.stringify(selectedLog.details, null, 2)}
							</JsonView>
						</DetailItem>
					</ModalContent>
				</Modal>
			)}
		</PageContainer>
	);
};
