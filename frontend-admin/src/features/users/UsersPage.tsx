import { useEffect, useState } from 'react';

type User = {
	id: string;
	email: string;
	name: string;
	createdAt: string;
	lastLoginAt: string | null;
	isActive: boolean;
	role: string;
};

export const UsersPage = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [searchTerm, setSearchTerm] = useState('');

	useEffect(() => {
		fetchUsers();
	}, [currentPage]);

	const fetchUsers = async () => {
		try {
			setIsLoading(true);
			const token = localStorage.getItem('admin_token');
			const params = new URLSearchParams({
				page: currentPage.toString(),
				limit: '10',
				search: searchTerm,
			});

			const response = await fetch(`/api/admin/users?${params}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error('Failed to fetch users');
			}

			const data = await response.json();
			setUsers(data.users);
			setTotalPages(data.totalPages);
		} catch (err) {
			setError('Error loading users');
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setCurrentPage(1); // Reset to first page when searching
		fetchUsers();
	};

	const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
		try {
			const token = localStorage.getItem('admin_token');
			const response = await fetch(`/api/admin/users/${userId}/status`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ isActive: !currentStatus }),
			});

			if (!response.ok) {
				throw new Error('Failed to update user status');
			}

			// Update the user in the list
			setUsers(
				users.map((user) =>
					user.id === userId ? { ...user, isActive: !currentStatus } : user
				)
			);
		} catch (err) {
			console.error(err);
			alert('Failed to update user status');
		}
	};

	return (
		<div>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: '20px',
				}}
			>
				<h1>Users</h1>
				<form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
					<input
						type='text'
						placeholder='Search users...'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className='form-control'
						style={{ width: '250px' }}
					/>
					<button type='submit' className='btn btn-primary'>
						Search
					</button>
				</form>
			</div>

			{error && <div className='alert alert-error'>{error}</div>}

			<div className='admin-card'>
				{isLoading ? (
					<div>Loading users...</div>
				) : (
					<>
						<table>
							<thead>
								<tr>
									<th>Name</th>
									<th>Email</th>
									<th>Role</th>
									<th>Created</th>
									<th>Last Login</th>
									<th>Status</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{users.length > 0 ? (
									users.map((user) => (
										<tr key={user.id}>
											<td>{user.name}</td>
											<td>{user.email}</td>
											<td>{user.role}</td>
											<td>{new Date(user.createdAt).toLocaleDateString()}</td>
											<td>
												{user.lastLoginAt
													? new Date(user.lastLoginAt).toLocaleDateString()
													: 'Never'}
											</td>
											<td>
												<span
													style={{
														color: user.isActive
															? 'var(--success)'
															: 'var(--error)',
													}}
												>
													{user.isActive ? 'Active' : 'Inactive'}
												</span>
											</td>
											<td>
												<button
													onClick={() =>
														toggleUserStatus(user.id, user.isActive)
													}
													className={`btn ${user.isActive ? 'btn-secondary' : 'btn-primary'}`}
													style={{
														padding: '0.25rem 0.5rem',
														fontSize: '0.875rem',
													}}
												>
													{user.isActive ? 'Deactivate' : 'Activate'}
												</button>
											</td>
										</tr>
									))
								) : (
									<tr>
										<td colSpan={7}>No users found</td>
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
