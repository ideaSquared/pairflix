import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { adminService } from '../../../services/admin.service';

interface AuditLog {
	id: string;
	adminId: string;
	adminName: string;
	action: string;
	targetType: string;
	targetId: string;
	details: any;
	changes: any;
	ipAddress: string;
	timestamp: string;
}

// Styled components
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

const Card = styled.div`
	background-color: white;
	border-radius: 8px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	padding: 1.5rem;
	margin-bottom: 2rem;
`;

const FiltersContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	gap: 1rem;
	margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
	margin-bottom: 1rem;
`;

const FormLabel = styled.label`
	display: block;
	margin-bottom: 0.5rem;
	font-weight: 500;
`;

const FormInput = styled.input`
	width: 100%;
	padding: 0.5rem;
	border: 1px solid #ddd;
	border-radius: 4px;
`;

const FormSelect = styled.select`
	width: 100%;
	padding: 0.5rem;
	border: 1px solid #ddd;
	border-radius: 4px;
`;

const Button = styled.button`
	background-color: #0d6efd;
	color: white;
	border: none;
	border-radius: 4px;
	padding: 0.5rem 1rem;
	cursor: pointer;
	font-weight: 600;

	&:hover {
		background-color: #0b5ed7;
	}

	&:disabled {
		opacity: 0.65;
		cursor: not-allowed;
	}
`;

const SecondaryButton = styled(Button)`
	background-color: #6c757d;

	&:hover {
		background-color: #5c636a;
	}
`;

const ButtonGroup = styled.div`
	display: flex;
	gap: 1rem;
	justify-content: flex-end;
	margin-bottom: 1.5rem;
`;

const Table = styled.table`
	width: 100%;
	border-collapse: collapse;
`;

const Thead = styled.thead`
	background-color: #f8f9fa;
`;

const Th = styled.th`
	padding: 1rem;
	text-align: left;
	border-bottom: 2px solid #dee2e6;
`;

const Td = styled.td`
	padding: 1rem;
	border-bottom: 1px solid #dee2e6;
`;

const Tr = styled.tr`
	&:hover {
		background-color: #f8f9fa;
	}
`;

const Badge = styled.span<{
	variant: 'info' | 'success' | 'warning' | 'danger';
}>`
	display: inline-block;
	padding: 0.25rem 0.5rem;
	border-radius: 0.25rem;
	font-size: 0.75rem;
	font-weight: 600;
	text-transform: uppercase;

	background-color: ${(props) => {
		switch (props.variant) {
			case 'success':
				return '#d1e7dd';
			case 'info':
				return '#cff4fc';
			case 'warning':
				return '#fff3cd';
			case 'danger':
				return '#f8d7da';
			default:
				return '#e2e3e5';
		}
	}};

	color: ${(props) => {
		switch (props.variant) {
			case 'success':
				return '#0f5132';
			case 'info':
				return '#055160';
			case 'warning':
				return '#664d03';
			case 'danger':
				return '#842029';
			default:
				return '#41464b';
		}
	}};
`;

const DetailButton = styled.button`
	background: none;
	border: none;
	color: #0d6efd;
	padding: 0;
	cursor: pointer;
	text-decoration: underline;

	&:hover {
		color: #0a58ca;
	}
`;

const Pagination = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 1.5rem;
`;

const PaginationInfo = styled.div`
	color: #6c757d;
`;

const PaginationButtons = styled.div`
	display: flex;
	gap: 0.5rem;
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
	background: white;
	border-radius: 8px;
	padding: 2rem;
	width: 100%;
	max-width: 800px;
	max-height: 90vh;
	overflow-y: auto;
`;

const ModalHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
	padding-bottom: 0.5rem;
	border-bottom: 1px solid #dee2e6;
`;

const ModalTitle = styled.h3`
	margin: 0;
`;

const CloseButton = styled.button`
	background: none;
	border: none;
	font-size: 1.5rem;
	cursor: pointer;
	padding: 0;
`;

const DetailsGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	gap: 1rem;
	margin-bottom: 1.5rem;
`;

const DetailItem = styled.div`
	margin-bottom: 0.5rem;
`;

const DetailLabel = styled.div`
	font-size: 0.75rem;
	color: #6c757d;
	margin-bottom: 0.25rem;
`;

const DetailValue = styled.div`
	word-break: break-word;
`;

const ChangesContainer = styled.div`
	margin-top: 1.5rem;
`;

const ChangesTitle = styled.h4`
	margin-bottom: 1rem;
`;

const ChangesList = styled.div`
	border: 1px solid #dee2e6;
	border-radius: 4px;
	overflow: hidden;
`;

const ChangeItem = styled.div`
	padding: 1rem;
	border-bottom: 1px solid #dee2e6;

	&:last-child {
		border-bottom: none;
	}

	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 1rem;
`;

const ChangeField = styled.div`
	font-weight: 500;
`;

const PreviousValue = styled.div`
	background-color: #ffecec;
	padding: 0.5rem;
	border-radius: 4px;
`;

const NewValue = styled.div`
	background-color: #eaffea;
	padding: 0.5rem;
	border-radius: 4px;
`;

export const AuditLogsPage: React.FC = () => {
	const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(25);
	const [totalLogs, setTotalLogs] = useState(0);
	const [totalPages, setTotalPages] = useState(0);

	const [filters, setFilters] = useState({
		adminId: '',
		action: '',
		targetType: '',
		startDate: '',
		endDate: '',
		search: '',
	});

	const [actionOptions, setActionOptions] = useState<string[]>([]);
	const [targetTypeOptions, setTargetTypeOptions] = useState<string[]>([]);

	const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

	useEffect(() => {
		fetchAuditLogs();
		fetchFilterOptions();
	}, [page, pageSize]);

	const fetchAuditLogs = async () => {
		try {
			setIsLoading(true);
			setError(null);

			// Prepare filter parameters, omitting empty strings
			const filterParams = Object.entries(filters).reduce(
				(acc, [key, value]) => {
					if (value) acc[key] = value;
					return acc;
				},
				{} as Record<string, string>
			);

			// Call the admin service to fetch audit logs
			const response = await adminService.getAuditLogs({
				page,
				pageSize,
				...filterParams,
			});

			setAuditLogs(response.logs);
			setTotalLogs(response.pagination.total);
			setTotalPages(response.pagination.totalPages);
		} catch (err) {
			setError(
				`Failed to load audit logs: ${err instanceof Error ? err.message : String(err)}`
			);
			console.error('Error fetching audit logs:', err);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchFilterOptions = async () => {
		try {
			// Fetch available actions for filtering
			const actionsResponse = await adminService.getAuditLogActions();
			setActionOptions(actionsResponse.actions);

			// Fetch available target types for filtering
			const targetTypesResponse = await adminService.getAuditLogTargetTypes();
			setTargetTypeOptions(targetTypesResponse.targetTypes);
		} catch (err) {
			console.error('Error fetching filter options:', err);
		}
	};

	const handleFilterChange = (field: string, value: string) => {
		setFilters((prev) => ({ ...prev, [field]: value }));
	};

	const handleApplyFilters = () => {
		setPage(1); // Reset to first page when applying new filters
		fetchAuditLogs();
	};

	const handleClearFilters = () => {
		setFilters({
			adminId: '',
			action: '',
			targetType: '',
			startDate: '',
			endDate: '',
			search: '',
		});
		setPage(1);
	};

	const handleViewDetails = (log: AuditLog) => {
		setSelectedLog(log);
	};

	const handleCloseDetails = () => {
		setSelectedLog(null);
	};

	const handlePageChange = (newPage: number) => {
		if (newPage >= 1 && newPage <= totalPages) {
			setPage(newPage);
		}
	};

	// Helper function to determine badge variant based on action
	const getActionVariant = (
		action: string
	): 'info' | 'success' | 'warning' | 'danger' => {
		const lowerAction = action.toLowerCase();

		if (lowerAction.includes('create')) return 'success';
		if (lowerAction.includes('update') || lowerAction.includes('edit'))
			return 'info';
		if (lowerAction.includes('delete') || lowerAction.includes('remove'))
			return 'danger';
		if (lowerAction.includes('restore') || lowerAction.includes('approve'))
			return 'warning';

		return 'info';
	};

	// Format timestamp for display
	const formatDate = (timestamp: string) => {
		return new Date(timestamp).toLocaleString();
	};

	return (
		<PageContainer>
			<PageHeader>
				<H1>Audit Logs</H1>
				<SubHeading>
					Track all administrative actions performed in the system
				</SubHeading>
			</PageHeader>

			<Card>
				<FiltersContainer>
					<FormGroup>
						<FormLabel>Admin</FormLabel>
						<FormInput
							type='text'
							placeholder='Filter by admin name or ID'
							value={filters.adminId}
							onChange={(e) => handleFilterChange('adminId', e.target.value)}
						/>
					</FormGroup>

					<FormGroup>
						<FormLabel>Action</FormLabel>
						<FormSelect
							value={filters.action}
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
						<FormLabel>Target Type</FormLabel>
						<FormSelect
							value={filters.targetType}
							onChange={(e) => handleFilterChange('targetType', e.target.value)}
						>
							<option value=''>All Target Types</option>
							{targetTypeOptions.map((type) => (
								<option key={type} value={type}>
									{type}
								</option>
							))}
						</FormSelect>
					</FormGroup>

					<FormGroup>
						<FormLabel>Start Date</FormLabel>
						<FormInput
							type='date'
							value={filters.startDate}
							onChange={(e) => handleFilterChange('startDate', e.target.value)}
						/>
					</FormGroup>

					<FormGroup>
						<FormLabel>End Date</FormLabel>
						<FormInput
							type='date'
							value={filters.endDate}
							onChange={(e) => handleFilterChange('endDate', e.target.value)}
						/>
					</FormGroup>

					<FormGroup>
						<FormLabel>Search</FormLabel>
						<FormInput
							type='text'
							placeholder='Search in details'
							value={filters.search}
							onChange={(e) => handleFilterChange('search', e.target.value)}
						/>
					</FormGroup>
				</FiltersContainer>

				<ButtonGroup>
					<SecondaryButton onClick={handleClearFilters}>
						Clear Filters
					</SecondaryButton>
					<Button onClick={handleApplyFilters}>Apply Filters</Button>
				</ButtonGroup>
			</Card>

			{error && (
				<Card style={{ backgroundColor: '#f8d7da', color: '#842029' }}>
					{error}
				</Card>
			)}

			<Card>
				<Table>
					<Thead>
						<Tr>
							<Th>Time</Th>
							<Th>Admin</Th>
							<Th>Action</Th>
							<Th>Target</Th>
							<Th>IP Address</Th>
							<Th>Details</Th>
						</Tr>
					</Thead>
					<tbody>
						{isLoading ? (
							<Tr>
								<Td colSpan={6} style={{ textAlign: 'center' }}>
									Loading...
								</Td>
							</Tr>
						) : auditLogs.length === 0 ? (
							<Tr>
								<Td colSpan={6} style={{ textAlign: 'center' }}>
									No audit logs found
								</Td>
							</Tr>
						) : (
							auditLogs.map((log) => (
								<Tr key={log.id}>
									<Td>{formatDate(log.timestamp)}</Td>
									<Td>
										<div>{log.adminName}</div>
										<div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
											{log.adminId}
										</div>
									</Td>
									<Td>
										<Badge variant={getActionVariant(log.action)}>
											{log.action}
										</Badge>
									</Td>
									<Td>
										<div>{log.targetType}</div>
										{log.targetId && (
											<div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
												{log.targetId}
											</div>
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

				<Pagination>
					<PaginationInfo>
						Showing {auditLogs.length} of {totalLogs} logs | Page {page} of{' '}
						{totalPages}
					</PaginationInfo>
					<PaginationButtons>
						<Button
							onClick={() => handlePageChange(1)}
							disabled={page === 1 || isLoading}
						>
							First
						</Button>
						<Button
							onClick={() => handlePageChange(page - 1)}
							disabled={page === 1 || isLoading}
						>
							Previous
						</Button>
						<Button
							onClick={() => handlePageChange(page + 1)}
							disabled={page === totalPages || isLoading}
						>
							Next
						</Button>
						<Button
							onClick={() => handlePageChange(totalPages)}
							disabled={page === totalPages || isLoading}
						>
							Last
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
					</PaginationButtons>
				</Pagination>
			</Card>

			{/* Details Modal */}
			{selectedLog && (
				<Modal onClick={handleCloseDetails}>
					<ModalContent onClick={(e) => e.stopPropagation()}>
						<ModalHeader>
							<ModalTitle>Audit Log Details</ModalTitle>
							<CloseButton onClick={handleCloseDetails}>&times;</CloseButton>
						</ModalHeader>

						<DetailsGrid>
							<DetailItem>
								<DetailLabel>Date & Time</DetailLabel>
								<DetailValue>{formatDate(selectedLog.timestamp)}</DetailValue>
							</DetailItem>

							<DetailItem>
								<DetailLabel>Admin</DetailLabel>
								<DetailValue>
									{selectedLog.adminName} ({selectedLog.adminId})
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
								<DetailLabel>Target Type</DetailLabel>
								<DetailValue>{selectedLog.targetType}</DetailValue>
							</DetailItem>

							{selectedLog.targetId && (
								<DetailItem>
									<DetailLabel>Target ID</DetailLabel>
									<DetailValue>{selectedLog.targetId}</DetailValue>
								</DetailItem>
							)}

							<DetailItem>
								<DetailLabel>IP Address</DetailLabel>
								<DetailValue>{selectedLog.ipAddress}</DetailValue>
							</DetailItem>
						</DetailsGrid>

						{/* Show changes if available */}
						{selectedLog.changes &&
							Object.keys(selectedLog.changes).length > 0 && (
								<ChangesContainer>
									<ChangesTitle>Changes Made</ChangesTitle>
									<ChangesList>
										{Object.entries(selectedLog.changes).map(
											([field, values]: [string, any]) => (
												<ChangeItem key={field}>
													<div>
														<ChangeField>{field}</ChangeField>
														<PreviousValue>
															{values.previous !== undefined
																? JSON.stringify(values.previous)
																: 'N/A'}
														</PreviousValue>
													</div>
													<div>
														<ChangeField>New Value</ChangeField>
														<NewValue>
															{values.new !== undefined
																? JSON.stringify(values.new)
																: 'N/A'}
														</NewValue>
													</div>
												</ChangeItem>
											)
										)}
									</ChangesList>
								</ChangesContainer>
							)}

						{/* Additional details if available */}
						{selectedLog.details && (
							<DetailItem style={{ marginTop: '1.5rem' }}>
								<DetailLabel>Additional Details</DetailLabel>
								<pre
									style={{
										background: '#f8f9fa',
										padding: '1rem',
										borderRadius: '4px',
										overflow: 'auto',
									}}
								>
									{JSON.stringify(selectedLog.details, null, 2)}
								</pre>
							</DetailItem>
						)}
					</ModalContent>
				</Modal>
			)}
		</PageContainer>
	);
};
