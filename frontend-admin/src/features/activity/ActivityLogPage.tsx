import { useEffect, useState } from 'react';

type ActivityLogEntry = {
	id: string;
	userId: string;
	userName: string;
	activityType: string;
	context: string;
	metadata: Record<string, any>;
	ipAddress: string;
	userAgent: string;
	timestamp: string;
};

type ActivityFilterState = {
	activityType: string;
	startDate: string;
	endDate: string;
	userId: string;
};

export const ActivityLogPage = () => {
	const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	const [filters, setFilters] = useState<ActivityFilterState>({
		activityType: '',
		startDate: '',
		endDate: '',
		userId: '',
	});

	const [activityTypes, setActivityTypes] = useState<string[]>([]);

	useEffect(() => {
		// Fetch available activity types for filtering
		const fetchActivityTypes = async () => {
			try {
				const token = localStorage.getItem('admin_token');
				const response = await fetch('/api/admin/activities/types', {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!response.ok) {
					throw new Error('Failed to fetch activity types');
				}

				const data = await response.json();
				setActivityTypes(data.activityTypes);
			} catch (err) {
				console.error('Error loading activity types:', err);
			}
		};

		fetchActivityTypes();
		fetchActivities();
	}, [currentPage]);

	const fetchActivities = async () => {
		try {
			setIsLoading(true);
			const token = localStorage.getItem('admin_token');

			// Build query parameters
			const params = new URLSearchParams({
				page: currentPage.toString(),
				limit: '20',
			});

			if (filters.activityType)
				params.append('activityType', filters.activityType);
			if (filters.startDate) params.append('startDate', filters.startDate);
			if (filters.endDate) params.append('endDate', filters.endDate);
			if (filters.userId) params.append('userId', filters.userId);

			const response = await fetch(`/api/admin/activities?${params}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error('Failed to fetch activity logs');
			}

			const data = await response.json();
			setActivities(data.activities);
			setTotalPages(data.totalPages);
		} catch (err) {
			setError('Error loading activity logs');
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleFilterChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setFilters((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleFilterSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setCurrentPage(1); // Reset to first page when filtering
		fetchActivities();
	};

	const formatMetadata = (metadata: Record<string, any>) => {
		if (!metadata || Object.keys(metadata).length === 0) return 'None';
		return JSON.stringify(metadata, null, 2);
	};

	return (
		<div>
			<h1>Activity Logs</h1>

			<div
				className='admin-card'
				style={{ marginTop: '20px', marginBottom: '20px' }}
			>
				<h3>Filter Activities</h3>
				<form onSubmit={handleFilterSubmit} style={{ marginTop: '15px' }}>
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
							gap: '15px',
						}}
					>
						<div className='form-group' style={{ margin: '0' }}>
							<label htmlFor='activityType'>Activity Type</label>
							<select
								id='activityType'
								name='activityType'
								className='form-control'
								value={filters.activityType}
								onChange={handleFilterChange}
							>
								<option value=''>All Types</option>
								{activityTypes.map((type) => (
									<option key={type} value={type}>
										{type}
									</option>
								))}
							</select>
						</div>

						<div className='form-group' style={{ margin: '0' }}>
							<label htmlFor='startDate'>Start Date</label>
							<input
								type='date'
								id='startDate'
								name='startDate'
								className='form-control'
								value={filters.startDate}
								onChange={handleFilterChange}
							/>
						</div>

						<div className='form-group' style={{ margin: '0' }}>
							<label htmlFor='endDate'>End Date</label>
							<input
								type='date'
								id='endDate'
								name='endDate'
								className='form-control'
								value={filters.endDate}
								onChange={handleFilterChange}
							/>
						</div>

						<div className='form-group' style={{ margin: '0' }}>
							<label htmlFor='userId'>User ID</label>
							<input
								type='text'
								id='userId'
								name='userId'
								placeholder='Filter by user ID'
								className='form-control'
								value={filters.userId}
								onChange={handleFilterChange}
							/>
						</div>
					</div>

					<div style={{ marginTop: '15px' }}>
						<button type='submit' className='btn btn-primary'>
							Apply Filters
						</button>
						<button
							type='button'
							className='btn'
							style={{ marginLeft: '10px' }}
							onClick={() => {
								setFilters({
									activityType: '',
									startDate: '',
									endDate: '',
									userId: '',
								});
								setCurrentPage(1);
								setTimeout(fetchActivities, 0);
							}}
						>
							Clear Filters
						</button>
					</div>
				</form>
			</div>

			{error && <div className='alert alert-error'>{error}</div>}

			<div className='admin-card'>
				{isLoading ? (
					<div>Loading activity logs...</div>
				) : (
					<>
						<table>
							<thead>
								<tr>
									<th>User</th>
									<th>Activity Type</th>
									<th>Context</th>
									<th>IP Address</th>
									<th>Time</th>
									<th>Details</th>
								</tr>
							</thead>
							<tbody>
								{activities.length > 0 ? (
									activities.map((activity) => (
										<tr key={activity.id}>
											<td>{activity.userName}</td>
											<td>{activity.activityType}</td>
											<td>{activity.context}</td>
											<td>{activity.ipAddress}</td>
											<td>{new Date(activity.timestamp).toLocaleString()}</td>
											<td>
												<details>
													<summary>Metadata</summary>
													<pre
														style={{
															whiteSpace: 'pre-wrap',
															fontSize: '0.85rem',
															maxHeight: '200px',
															overflowY: 'auto',
															backgroundColor: '#f5f5f5',
															padding: '8px',
															borderRadius: '4px',
														}}
													>
														{formatMetadata(activity.metadata)}
													</pre>
												</details>
											</td>
										</tr>
									))
								) : (
									<tr>
										<td colSpan={6}>No activities found</td>
									</tr>
								)}
							</tbody>
						</table>

						{/* Pagination */}
						<div
							style={{
								display: 'flex',
								justifyContent: 'center',
								marginTop: '20px',
								gap: '10px',
							}}
						>
							<button
								onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
								disabled={currentPage === 1}
								className='btn'
							>
								Previous
							</button>
							<span style={{ padding: '0.5rem 0' }}>
								Page {currentPage} of {totalPages}
							</span>
							<button
								onClick={() =>
									setCurrentPage((p) => (p < totalPages ? p + 1 : p))
								}
								disabled={currentPage >= totalPages}
								className='btn'
							>
								Next
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
};
