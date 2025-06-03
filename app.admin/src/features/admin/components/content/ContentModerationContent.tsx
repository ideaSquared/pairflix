import {
	Badge,
	Button,
	Card,
	FilterGroup,
	FilterItem,
	Flex,
	H4,
	Input,
	Loading,
	Modal,
	Pagination,
	Select,
	Table,
	TableActionButton,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeaderCell,
	TableRow,
	Textarea,
	Typography,
} from '@pairflix/components';
import React, { ChangeEvent, useEffect, useState } from 'react';
import {
	MdCheck,
	MdDelete,
	MdEdit,
	MdFlag,
	MdReportProblem,
} from 'react-icons/md';
import styled from 'styled-components';
import { admin } from '../../../../services/api';
import type { Theme } from '../../../../styles/theme';

interface StyledComponent {
	theme: Theme;
}

// Types for content items and reports
interface ContentItem {
	id: string;
	title: string;
	type: 'movie' | 'show' | 'episode';
	status: 'active' | 'pending' | 'flagged' | 'removed';
	reported_count: number;
	tmdb_id: string;
	created_at: string;
	updated_at: string;
	poster_path?: string;
}

interface ReportItem {
	id: string;
	user_name: string;
	reason: string;
	details?: string;
	created_at: string;
}

// Styled components
const SearchContainer = styled.div<StyledComponent>`
	margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ContentTypeBadge = styled(Badge)<{ contentType: string; theme: Theme }>`
	text-transform: capitalize;
`;

const SubHeading = styled(Typography)`
	font-size: 1.25rem;
	font-weight: 600;
	margin-bottom: ${({ theme }: StyledComponent) => theme.spacing.sm};
`;

const StyledCard = styled(Card)`
	margin-bottom: 10px;
	padding: 15px;
`;

const ContentModerationContent: React.FC = () => {
	const [contentItems, setContentItems] = useState<ContentItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [search, setSearch] = useState('');
	const [typeFilter, setTypeFilter] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [sortBy, setSortBy] = useState('reported_count');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

	// Delete/Remove Modal states
	const [showRemoveModal, setShowRemoveModal] = useState(false);
	const [contentToRemove, setContentToRemove] = useState<ContentItem | null>(
		null
	);
	const [removalReason, setRemovalReason] = useState('');

	// Edit Modal states
	const [showEditModal, setShowEditModal] = useState(false);
	const [contentToEdit, setContentToEdit] = useState<ContentItem | null>(null);

	// Review Reports Modal states
	const [showReportsModal, setShowReportsModal] = useState(false);
	const [contentToReview, setContentToReview] = useState<ContentItem | null>(
		null
	);
	const [reports, setReports] = useState<ReportItem[]>([]);

	// Success/Error message states
	const [successMessage, setSuccessMessage] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		fetchContentItems();
	}, [page, search, typeFilter, statusFilter, sortBy, sortOrder]);

	// Show success message temporarily
	useEffect(() => {
		if (successMessage) {
			const timer = setTimeout(() => {
				setSuccessMessage('');
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [successMessage]);

	// Show error message temporarily
	useEffect(() => {
		if (errorMessage) {
			const timer = setTimeout(() => {
				setErrorMessage('');
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [errorMessage]);

	const fetchContentItems = async (retryCount = 0) => {
		try {
			setIsLoading(true);

			// Call the admin API
			const response = await admin.content.getAll({
				limit: 10, // items per page
				offset: (page - 1) * 10, // calculate offset based on page number
				...(search ? { search } : {}),
				...(typeFilter ? { type: typeFilter } : {}),
				...(statusFilter ? { status: statusFilter } : {}),
				...(sortBy ? { sortBy } : {}),
				...(sortOrder ? { sortOrder } : {}),
			});

			if (response && response.content) {
				setContentItems(response.content);
				if (response.pagination) {
					setTotalPages(Math.ceil(response.pagination.total / 10));
				}
			} else {
				throw new Error('Unexpected response format from server');
			}
		} catch (error) {
			console.error('Error fetching content items:', error);

			// Retry logic for network issues (up to 2 retries)
			if (retryCount < 2) {
				setErrorMessage('Connection issue, retrying...');
				setTimeout(() => {
					fetchContentItems(retryCount + 1);
				}, 1500);
				return;
			}

			// More descriptive error messages based on error type
			if (error instanceof TypeError && error.message.includes('fetch')) {
				setErrorMessage(
					'Network error: Unable to connect to the API. Please check your connection.'
				);
			} else if (
				error instanceof Error &&
				(error as any).response?.status === 401
			) {
				setErrorMessage('Authorization error: Please log in again.');
			} else if (
				error instanceof Error &&
				(error as any).response?.status === 403
			) {
				setErrorMessage(
					'Permission denied: You do not have access to content management.'
				);
			} else {
				setErrorMessage(
					'Failed to fetch content. Please try again or contact support.'
				);
			}
		} finally {
			if (retryCount === 0 || retryCount >= 2) {
				setIsLoading(false);
			}
		}
	};

	const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearch(e.target.value);
		setPage(1);
	};

	const handleTypeFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
		setTypeFilter(e.target.value);
	};

	const handleStatusFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
		setStatusFilter(e.target.value);
	};

	const handleSortByChange = (e: ChangeEvent<HTMLSelectElement>) => {
		setSortBy(e.target.value);
	};

	const handleSortOrderChange = (e: ChangeEvent<HTMLSelectElement>) => {
		setSortOrder(e.target.value as 'asc' | 'desc');
	};

	const handleEditContent = (content: ContentItem) => {
		setContentToEdit(content);
		setShowEditModal(true);
	};

	const handleRemoveContent = (content: ContentItem) => {
		setContentToRemove(content);
		setRemovalReason('');
		setShowRemoveModal(true);
	};

	const handleReviewReports = async (content: ContentItem) => {
		setContentToReview(content);
		setReports([]);

		try {
			const response = await admin.content.getReports(content.id);
			setReports(response.reports);
			setShowReportsModal(true);
		} catch (error) {
			console.error('Error fetching content reports:', error);
			setErrorMessage('Failed to fetch reports. Please try again.');
		}
	};

	const dismissReport = async (reportId: string) => {
		try {
			await admin.content.dismissReport(reportId);
			setReports(
				reports.filter((report: ReportItem) => report.id !== reportId)
			);

			if (contentToReview) {
				const updatedContent = {
					...contentToReview,
					reported_count: contentToReview.reported_count - 1,
				};
				setContentToReview(updatedContent);
				setContentItems(
					contentItems.map((item: ContentItem) =>
						item.id === updatedContent.id ? updatedContent : item
					)
				);
			}

			setSuccessMessage('Report dismissed successfully');
		} catch (error) {
			console.error('Error dismissing report:', error);
			setErrorMessage('Failed to dismiss report. Please try again.');
		}
	};

	const approveContent = async (content: ContentItem) => {
		try {
			await admin.content.approve(content.id);

			setContentItems(
				contentItems.map((item) =>
					item.id === content.id ? { ...item, status: 'active' } : item
				)
			);
			setSuccessMessage(`Content "${content.title}" has been approved`);
		} catch (error) {
			console.error('Error approving content:', error);
			setErrorMessage('Failed to approve content. Please try again.');
		}
	};

	const flagContent = async (content: ContentItem) => {
		try {
			await admin.content.flag(content.id);

			setContentItems(
				contentItems.map((item) =>
					item.id === content.id ? { ...item, status: 'flagged' } : item
				)
			);
			setSuccessMessage(
				`Content "${content.title}" has been flagged for review`
			);
		} catch (error) {
			console.error('Error flagging content:', error);
			setErrorMessage('Failed to flag content. Please try again.');
		}
	};

	const renderSuccessMessage = () => {
		if (!successMessage) return null;
		return (
			<div
				style={{
					marginBottom: '20px',
					padding: '10px 20px',
					backgroundColor: '#dff0d8',
					borderColor: '#d6e9c6',
					borderRadius: '4px',
					border: '1px solid #d6e9c6',
				}}
			>
				<Typography style={{ color: '#3c763d' }}>{successMessage}</Typography>
			</div>
		);
	};

	const renderErrorMessage = () => {
		if (!errorMessage) return null;
		return (
			<div
				style={{
					marginBottom: '20px',
					padding: '10px 20px',
					backgroundColor: '#f2dede',
					borderColor: '#ebccd1',
					borderRadius: '4px',
					border: '1px solid #ebccd1',
				}}
			>
				<Typography style={{ color: '#a94442' }}>{errorMessage}</Typography>
			</div>
		);
	};

	const applyFilters = () => {
		setPage(1); // Reset to first page when applying filters
	};

	const clearFilters = () => {
		setTypeFilter('');
		setStatusFilter('');
		setSortBy('reported_count');
		setSortOrder('desc');
		setPage(1);
	};

	const saveContentChanges = async (updatedContent: ContentItem) => {
		try {
			await admin.content.update(updatedContent.id, {
				title: updatedContent.title,
				status: updatedContent.status,
			});

			setContentItems(
				contentItems.map((item: ContentItem) =>
					item.id === updatedContent.id ? updatedContent : item
				)
			);
			setShowEditModal(false);
			setContentToEdit(null);
			setSuccessMessage(
				`Content "${updatedContent.title}" updated successfully`
			);
		} catch (error) {
			console.error('Error updating content:', error);
			setErrorMessage('Failed to update content. Please try again.');
		}
	};

	const confirmRemoveContent = async () => {
		if (!contentToRemove) return;

		try {
			await admin.content.remove(contentToRemove.id, removalReason);
			setContentItems(
				contentItems.map((item: ContentItem) =>
					item.id === contentToRemove.id ? { ...item, status: 'removed' } : item
				)
			);
			setShowRemoveModal(false);
			setContentToRemove(null);
			setSuccessMessage(`Content "${contentToRemove.title}" has been removed`);
		} catch (error) {
			console.error('Error removing content:', error);
			setErrorMessage('Failed to remove content. Please try again.');
		}
	};

	const getContentTypeVariant = (
		type: string
	): 'error' | 'warning' | 'info' | 'success' | 'default' => {
		switch (type) {
			case 'movie':
				return 'info';
			case 'show':
				return 'success';
			case 'episode':
				return 'warning';
			default:
				return 'default';
		}
	};

	const getStatusBadgeVariant = (
		status: string
	): 'error' | 'warning' | 'info' | 'success' | 'default' => {
		switch (status) {
			case 'active':
				return 'success';
			case 'pending':
				return 'warning';
			case 'flagged':
				return 'error';
			case 'removed':
				return 'default';
			default:
				return 'info';
		}
	};

	return (
		<>
			{renderSuccessMessage()}
			{renderErrorMessage()}

			<Flex
				justifyContent='space-between'
				alignItems='center'
				style={{ marginBottom: '20px' }}
			>
				<SearchContainer style={{ flex: 1 }}>
					<Input
						placeholder='Search content by title...'
						value={search}
						onChange={handleSearchChange}
						type='search'
						fullWidth
					/>
				</SearchContainer>
			</Flex>

			<FilterGroup
				title='Filter Content'
				onApply={applyFilters}
				onClear={clearFilters}
			>
				<FilterItem label='Type'>
					<Select
						value={typeFilter}
						onChange={handleTypeFilterChange}
						fullWidth
					>
						<option value=''>All Types</option>
						<option value='movie'>Movies</option>
						<option value='show'>TV Shows</option>
						<option value='episode'>Episodes</option>
					</Select>
				</FilterItem>

				<FilterItem label='Status'>
					<Select
						value={statusFilter}
						onChange={handleStatusFilterChange}
						fullWidth
					>
						<option value=''>All Statuses</option>
						<option value='active'>Active</option>
						<option value='pending'>Pending</option>
						<option value='flagged'>Flagged</option>
						<option value='removed'>Removed</option>
					</Select>
				</FilterItem>

				<FilterItem label='Sort By'>
					<Select value={sortBy} onChange={handleSortByChange} fullWidth>
						<option value='title'>Title</option>
						<option value='reported_count'>Report Count</option>
						<option value='created_at'>Created Date</option>
						<option value='updated_at'>Last Updated</option>
					</Select>
				</FilterItem>

				<FilterItem label='Sort Order'>
					<Select value={sortOrder} onChange={handleSortOrderChange} fullWidth>
						<option value='asc'>Ascending</option>
						<option value='desc'>Descending</option>
					</Select>
				</FilterItem>
			</FilterGroup>

			{isLoading ? (
				<Loading message='Loading content...' />
			) : (
				<>
					<Card>
						<TableContainer>
							<Table>
								<TableHead>
									<TableRow>
										<TableHeaderCell>Title</TableHeaderCell>
										<TableHeaderCell>Type</TableHeaderCell>
										<TableHeaderCell>Status</TableHeaderCell>
										<TableHeaderCell>Reports</TableHeaderCell>
										<TableHeaderCell>Created</TableHeaderCell>
										<TableHeaderCell>Last Updated</TableHeaderCell>
										<TableHeaderCell>Actions</TableHeaderCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{contentItems.length === 0 ? (
										<TableRow>
											<TableCell colSpan={7} style={{ textAlign: 'center' }}>
												No content items found
											</TableCell>
										</TableRow>
									) : (
										contentItems.map((content: ContentItem) => (
											<TableRow key={content.id}>
												<TableCell>{content.title}</TableCell>
												<TableCell>
													<ContentTypeBadge
														variant={getContentTypeVariant(content.type)}
														contentType={content.type}
													>
														{content.type}
													</ContentTypeBadge>
												</TableCell>
												<TableCell>
													<Badge
														variant={getStatusBadgeVariant(content.status)}
													>
														{content.status}
													</Badge>
												</TableCell>
												<TableCell>
													{content.reported_count > 0 ? (
														<Badge variant='error'>
															{content.reported_count}
														</Badge>
													) : (
														'0'
													)}
												</TableCell>
												<TableCell>
													{new Date(content.created_at).toLocaleDateString()}
												</TableCell>
												<TableCell>
													{new Date(content.updated_at).toLocaleDateString()}
												</TableCell>
												<TableCell>
													<Flex gap='xs'>
														<TableActionButton
															onClick={() => handleEditContent(content)}
															title='Edit content'
														>
															<MdEdit />
														</TableActionButton>

														{content.status === 'pending' && (
															<TableActionButton
																onClick={() => approveContent(content)}
																title='Approve content'
																variant='primary'
															>
																<MdCheck />
															</TableActionButton>
														)}

														{content.status !== 'flagged' &&
															content.status !== 'removed' && (
																<TableActionButton
																	onClick={() => flagContent(content)}
																	title='Flag content'
																	variant='warning'
																>
																	<MdFlag />
																</TableActionButton>
															)}

														{content.reported_count > 0 && (
															<TableActionButton
																onClick={() => handleReviewReports(content)}
																title='Review reports'
																variant='secondary'
															>
																<MdReportProblem />
															</TableActionButton>
														)}

														{content.status !== 'removed' && (
															<TableActionButton
																variant='danger'
																onClick={() => handleRemoveContent(content)}
																title='Remove content'
															>
																<MdDelete />
															</TableActionButton>
														)}
													</Flex>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</TableContainer>
					</Card>

					<Pagination
						currentPage={page}
						totalPages={totalPages}
						onPageChange={setPage}
					/>
				</>
			)}

			{/* Remove Content Modal */}
			<Modal
				isOpen={showRemoveModal}
				onClose={() => setShowRemoveModal(false)}
				title='Remove Content'
			>
				<Typography gutterBottom>
					Are you sure you want to remove{' '}
					<strong>{contentToRemove?.title}</strong>? This will make the content
					unavailable to users.
				</Typography>

				<div style={{ marginBottom: '16px', marginTop: '16px' }}>
					<label
						htmlFor='removal-reason'
						style={{ display: 'block', marginBottom: '8px' }}
					>
						Reason for Removal
					</label>{' '}
					<Textarea
						id='removal-reason'
						rows={3}
						value={removalReason}
						onChange={(e) => setRemovalReason(e.target.value)}
						placeholder='Explain why this content is being removed'
						fullWidth
					/>
				</div>

				<Flex justifyContent='end' gap='md' style={{ marginTop: '20px' }}>
					<Button variant='secondary' onClick={() => setShowRemoveModal(false)}>
						Cancel
					</Button>
					<Button variant='danger' onClick={confirmRemoveContent}>
						Remove Content
					</Button>
				</Flex>
			</Modal>

			{/* Edit Content Modal */}
			{contentToEdit && (
				<Modal
					isOpen={showEditModal}
					onClose={() => setShowEditModal(false)}
					title='Edit Content'
				>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							if (contentToEdit) saveContentChanges(contentToEdit);
						}}
					>
						<div style={{ marginBottom: '16px' }}>
							<label
								htmlFor='content-title'
								style={{ display: 'block', marginBottom: '8px' }}
							>
								Title
							</label>
							<Input
								id='content-title'
								value={contentToEdit.title}
								onChange={(e) =>
									setContentToEdit({ ...contentToEdit, title: e.target.value })
								}
								fullWidth
							/>
						</div>

						<div style={{ marginBottom: '16px' }}>
							<label
								htmlFor='content-status'
								style={{ display: 'block', marginBottom: '8px' }}
							>
								Status
							</label>
							<Select
								id='content-status'
								value={contentToEdit.status}
								onChange={(e) =>
									setContentToEdit({
										...contentToEdit,
										status: e.target.value as ContentItem['status'],
									})
								}
								fullWidth
							>
								<option value='active'>Active</option>
								<option value='pending'>Pending</option>
								<option value='flagged'>Flagged</option>
								<option value='removed'>Removed</option>
							</Select>
						</div>

						<div style={{ marginBottom: '16px' }}>
							<Typography style={{ marginBottom: '8px' }}>
								Content Type:
							</Typography>
							<ContentTypeBadge
								variant={getContentTypeVariant(contentToEdit.type)}
								contentType={contentToEdit.type}
							>
								{contentToEdit.type}
							</ContentTypeBadge>
							<Typography
								style={{
									marginTop: '4px',
									fontSize: '0.875rem',
									color: '#666',
								}}
							>
								Content type cannot be changed
							</Typography>
						</div>

						<Flex justifyContent='end' gap='md' style={{ marginTop: '20px' }}>
							<Button
								variant='secondary'
								onClick={() => setShowEditModal(false)}
							>
								Cancel
							</Button>
							<Button variant='primary' type='submit'>
								Save Changes
							</Button>
						</Flex>
					</form>
				</Modal>
			)}

			{/* Review Reports Modal */}
			<Modal
				isOpen={showReportsModal}
				onClose={() => setShowReportsModal(false)}
				title='Review Reports'
			>
				{contentToReview && (
					<>
						<div style={{ marginBottom: '20px' }}>
							<H4 gutterBottom>
								{contentToReview.title}{' '}
								<ContentTypeBadge
									variant={getContentTypeVariant(contentToReview.type)}
									contentType={contentToReview.type}
								>
									{contentToReview.type}
								</ContentTypeBadge>
							</H4>
							<Typography>
								This content has been reported {contentToReview.reported_count}{' '}
								times
							</Typography>
						</div>

						{reports.length === 0 ? (
							<Typography>No active reports found for this content.</Typography>
						) : (
							<>
								<div style={{ marginBottom: '20px' }}>
									<SubHeading gutterBottom>Reports</SubHeading>
									{reports.map((report: ReportItem) => (
										<StyledCard key={report.id}>
											<Flex justifyContent='space-between' alignItems='start'>
												<div>
													<Typography style={{ fontWeight: 'bold' }}>
														Reported by: {report.user_name} on{' '}
														{new Date(report.created_at).toLocaleDateString()}
													</Typography>
													<Typography style={{ marginTop: '8px' }}>
														Reason: {report.reason}
													</Typography>
													{report.details && (
														<Typography style={{ marginTop: '8px' }}>
															Details: {report.details}
														</Typography>
													)}
												</div>
												<Button
													variant='secondary'
													size='small'
													onClick={() => dismissReport(report.id)}
												>
													Dismiss Report
												</Button>
											</Flex>
										</StyledCard>
									))}
								</div>

								<Flex justifyContent='space-between' gap='md'>
									<Button
										variant='danger'
										onClick={() => {
											handleRemoveContent(contentToReview);
											setShowReportsModal(false);
										}}
									>
										Remove Content
									</Button>
									<Flex gap='md'>
										<Button
											variant='secondary'
											onClick={() => setShowReportsModal(false)}
										>
											Close
										</Button>
										{contentToReview.status !== 'active' && (
											<Button
												variant='primary'
												onClick={() => {
													approveContent(contentToReview);
													setShowReportsModal(false);
												}}
											>
												Approve Content
											</Button>
										)}
									</Flex>
								</Flex>
							</>
						)}
					</>
				)}
			</Modal>
		</>
	);
};

export default ContentModerationContent;
