import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Alert } from '../../../components/common/Alert';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { Card, CardContent } from '../../../components/common/Card';
import { Flex, Grid } from '../../../components/common/Layout';
import { Loading } from '../../../components/common/Loading';
import { Modal } from '../../../components/common/Modal';
import { Select } from '../../../components/common/Select';
import { H1, Typography } from '../../../components/common/Typography';
import { admin } from '../../../services/api';

// Simple Tabs implementation
interface TabPanelProps {
	title: string;
	children: React.ReactNode;
}

const TabPanel: React.FC<TabPanelProps> = ({ children }) => {
	return <div>{children}</div>;
};

interface TabsProps {
	children: React.ReactElement<TabPanelProps>[];
}

const TabsContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
`;

const TabList = styled.div`
	display: flex;
	gap: ${({ theme }) => theme.spacing.sm};
	margin-bottom: ${({ theme }) => theme.spacing.md};
	border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const TabButton = styled.button<{ active: boolean }>`
	padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
	background: transparent;
	border: none;
	border-bottom: 2px solid
		${({ active, theme }) => (active ? theme.colors.primary : 'transparent')};
	color: ${({ active, theme }) =>
		active ? theme.colors.primary : theme.colors.text.primary};
	font-weight: ${({ active, theme }) =>
		active
			? theme.typography.fontWeight.bold
			: theme.typography.fontWeight.normal};
	cursor: pointer;

	&:hover {
		color: ${({ theme }) => theme.colors.primary};
	}
`;

const Tabs: React.FC<TabsProps> = ({ children }) => {
	const [activeIndex, setActiveIndex] = useState(0);

	return (
		<TabsContainer>
			<TabList>
				{React.Children.map(children, (child, index) => (
					<TabButton
						active={index === activeIndex}
						onClick={() => setActiveIndex(index)}
					>
						{child.props.title}
					</TabButton>
				))}
			</TabList>
			{React.Children.map(children, (child, index) => (
				<div style={{ display: index === activeIndex ? 'block' : 'none' }}>
					{child}
				</div>
			))}
		</TabsContainer>
	);
};

const Toolbar = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: ${({ theme }) => theme.spacing.md};
	flex-wrap: wrap;
	gap: ${({ theme }) => theme.spacing.sm};
`;

const FilterGroup = styled.div`
	display: flex;
	gap: ${({ theme }) => theme.spacing.sm};
	align-items: center;
	flex-wrap: wrap;
`;

const PaginationControls = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: ${({ theme }) => theme.spacing.sm};
	margin-top: ${({ theme }) => theme.spacing.md};
`;

const PaginationInfo = styled.div`
	color: ${({ theme }) => theme.colors.text.secondary};
`;

const EntryCard = styled(Card)`
	transition: all 0.2s ease;

	&:hover {
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}
`;

const StatusBadge = styled(Badge)<{ status: string }>`
	text-transform: capitalize;
`;

const StyledFlex = styled(Flex)`
	margin-top: ${({ theme }) => theme.spacing.xs};
`;

const StyledTypography = styled(Typography)`
	margin-top: ${({ theme }) => theme.spacing.sm};
`;

const ActionFlex = styled(Flex)`
	margin-top: ${({ theme }) => theme.spacing.lg};
`;

const StyledAlert = styled(Alert)`
	margin-top: ${({ theme }) => theme.spacing.md};
	margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const FormatHeading = styled(Typography)`
	margin-top: ${({ theme }) => theme.spacing.md};
	margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);
};

// Type definitions for watchlist entries and matches
interface WatchlistEntry {
	entry_id: string;
	user_id: string;
	title: string;
	media_type: string;
	media_id: string;
	poster_path?: string;
	status: string;
	notes?: string;
	created_at: string;
	updated_at: string;
	user?: {
		username: string;
		email: string;
	};
}

interface Match {
	match_id: string;
	user_id_1: string;
	user_id_2: string;
	entry_id: string;
	status: string;
	created_at: string;
	user1?: {
		username: string;
		email: string;
	};
	user2?: {
		username: string;
		email: string;
	};
	watchlistEntry?: {
		title: string;
		media_type: string;
		media_id: string;
	};
}

const ContentModeration: React.FC = () => {
	// State for watchlist entries
	const [watchlistEntries, setWatchlistEntries] = useState<WatchlistEntry[]>(
		[]
	);
	const [watchlistLoading, setWatchlistLoading] = useState(true);
	const [watchlistError, setWatchlistError] = useState<string | null>(null);
	const [watchlistPagination, setWatchlistPagination] = useState({
		total: 0,
		limit: 10,
		offset: 0,
		hasMore: false,
	});
	const [watchlistFilters, setWatchlistFilters] = useState({
		status: '',
		mediaType: '',
	});

	// State for matches
	const [matches, setMatches] = useState<Match[]>([]);
	const [matchesLoading, setMatchesLoading] = useState(true);
	const [matchesError, setMatchesError] = useState<string | null>(null);
	const [matchesPagination, setMatchesPagination] = useState({
		total: 0,
		limit: 10,
		offset: 0,
		hasMore: false,
	});
	const [matchesFilters, setMatchesFilters] = useState({
		status: '',
	});

	// State for moderation modal
	const [moderationModal, setModerationModal] = useState({
		isOpen: false,
		entry: null as WatchlistEntry | null,
		action: '',
		reason: '',
		loading: false,
		error: null as string | null,
	});

	// Fetch watchlist entries
	const fetchWatchlistEntries = async () => {
		try {
			setWatchlistLoading(true);
			setWatchlistError(null);

			const { status, mediaType } = watchlistFilters;
			const { limit, offset } = watchlistPagination;

			const response = await admin.getAllWatchlistEntries({
				limit,
				offset,
				status,
				mediaType,
			});

			setWatchlistEntries(response.entries);
			setWatchlistPagination(response.pagination);
		} catch (error) {
			setWatchlistError(
				`Failed to load watchlist entries: ${
					error instanceof Error ? error.message : String(error)
				}`
			);
		} finally {
			setWatchlistLoading(false);
		}
	};

	// Fetch matches
	const fetchMatches = async () => {
		try {
			setMatchesLoading(true);
			setMatchesError(null);

			const { status } = matchesFilters;
			const { limit, offset } = matchesPagination;

			const response = await admin.getAllMatches({
				limit,
				offset,
				status,
			});

			setMatches(response.matches);
			setMatchesPagination(response.pagination);
		} catch (error) {
			setMatchesError(
				`Failed to load matches: ${
					error instanceof Error ? error.message : String(error)
				}`
			);
		} finally {
			setMatchesLoading(false);
		}
	};

	// Load initial data
	useEffect(() => {
		fetchWatchlistEntries();
		fetchMatches();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// Reload data when filters or pagination changes
	useEffect(() => {
		fetchWatchlistEntries();
	}, [watchlistFilters, watchlistPagination.offset]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		fetchMatches();
	}, [matchesFilters, matchesPagination.offset]); // eslint-disable-line react-hooks/exhaustive-deps

	// Handle watchlist filter changes
	const handleWatchlistFilterChange = (name: string, value: string) => {
		setWatchlistFilters((prev) => ({ ...prev, [name]: value }));
		setWatchlistPagination((prev) => ({ ...prev, offset: 0 })); // Reset pagination
	};

	// Handle matches filter changes
	const handleMatchesFilterChange = (name: string, value: string) => {
		setMatchesFilters((prev) => ({ ...prev, [name]: value }));
		setMatchesPagination((prev) => ({ ...prev, offset: 0 })); // Reset pagination
	};

	// Open moderation modal
	const openModerationModal = (entry: WatchlistEntry, action: string) => {
		setModerationModal({
			isOpen: true,
			entry,
			action,
			reason: '',
			loading: false,
			error: null,
		});
	};

	// Handle moderation form changes
	const handleModerationChange = (name: string, value: string) => {
		setModerationModal((prev) => ({ ...prev, [name]: value }));
	};

	// Submit moderation action
	const handleModerateEntry = async () => {
		if (!moderationModal.entry) return;

		try {
			setModerationModal((prev) => ({ ...prev, loading: true, error: null }));

			await admin.moderateWatchlistEntry({
				entryId: moderationModal.entry.entry_id,
				action: moderationModal.action as 'flag' | 'remove' | 'approve',
				reason: moderationModal.reason,
			});

			// Close modal and refresh data
			setModerationModal({
				isOpen: false,
				entry: null,
				action: '',
				reason: '',
				loading: false,
				error: null,
			});

			fetchWatchlistEntries();
		} catch (error) {
			setModerationModal((prev) => ({
				...prev,
				loading: false,
				error: `Failed to moderate entry: ${
					error instanceof Error ? error.message : String(error)
				}`,
			}));
		}
	};

	// Render watchlist entries tab
	const renderWatchlistTab = () => {
		if (watchlistLoading && watchlistEntries.length === 0) {
			return <Loading message='Loading watchlist entries...' />;
		}

		if (watchlistError) {
			return <Alert variant='error'>{watchlistError}</Alert>;
		}

		if (watchlistEntries.length === 0) {
			return <Typography>No watchlist entries found.</Typography>;
		}

		return (
			<>
				<Toolbar>
					<FilterGroup>
						<Select
							id='watchlist-status-filter'
							value={watchlistFilters.status}
							onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
								handleWatchlistFilterChange('status', e.target.value)
							}
						>
							<option value=''>All Statuses</option>
							<option value='active'>Active</option>
							<option value='flagged'>Flagged</option>
							<option value='removed'>Removed</option>
						</Select>

						<Select
							id='watchlist-media-filter'
							value={watchlistFilters.mediaType}
							onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
								handleWatchlistFilterChange('mediaType', e.target.value)
							}
						>
							<option value=''>All Media Types</option>
							<option value='movie'>Movies</option>
							<option value='tv'>TV Shows</option>
						</Select>
					</FilterGroup>
				</Toolbar>

				<Grid columns={1} gap='md'>
					{watchlistEntries.map((entry) => (
						<EntryCard key={entry.entry_id}>
							<CardContent>
								<Flex justifyContent='space-between' alignItems='start'>
									<div>
										<Typography variant='h4'>{entry.title}</Typography>
										<Typography variant='caption'>
											Added by {entry.user?.username || 'Unknown'} on{' '}
											{formatDate(entry.created_at)}
										</Typography>
										<StyledFlex gap='sm'>
											<StatusBadge status={entry.status || 'active'}>
												{entry.status || 'active'}
											</StatusBadge>
											<Badge>{entry.media_type}</Badge>
										</StyledFlex>
										{entry.notes && (
											<StyledTypography variant='body2'>
												<strong>Notes:</strong> {entry.notes}
											</StyledTypography>
										)}
									</div>
									<Flex gap='sm'>
										{entry.status !== 'flagged' && (
											<Button
												size='small'
												variant='secondary'
												onClick={() => openModerationModal(entry, 'flag')}
											>
												Flag
											</Button>
										)}
										{entry.status !== 'removed' && (
											<Button
												size='small'
												variant='danger'
												onClick={() => openModerationModal(entry, 'remove')}
											>
												Remove
											</Button>
										)}
										{entry.status !== 'active' && (
											<Button
												size='small'
												variant='primary'
												onClick={() => openModerationModal(entry, 'approve')}
											>
												Approve
											</Button>
										)}
									</Flex>
								</Flex>
							</CardContent>
						</EntryCard>
					))}
				</Grid>

				<PaginationControls>
					<PaginationInfo>
						Showing {watchlistEntries.length} of {watchlistPagination.total}{' '}
						entries
					</PaginationInfo>
					<Button
						size='small'
						variant='secondary'
						disabled={watchlistPagination.offset === 0}
						onClick={() =>
							setWatchlistPagination((prev) => ({
								...prev,
								offset: Math.max(0, prev.offset - prev.limit),
							}))
						}
					>
						Previous
					</Button>
					<Button
						size='small'
						variant='secondary'
						disabled={!watchlistPagination.hasMore}
						onClick={() =>
							setWatchlistPagination((prev) => ({
								...prev,
								offset: prev.offset + prev.limit,
							}))
						}
					>
						Next
					</Button>
				</PaginationControls>
			</>
		);
	};

	// Render matches tab
	const renderMatchesTab = () => {
		if (matchesLoading && matches.length === 0) {
			return <Loading message='Loading matches...' />;
		}

		if (matchesError) {
			return <Alert variant='error'>{matchesError}</Alert>;
		}

		if (matches.length === 0) {
			return <Typography>No matches found.</Typography>;
		}

		return (
			<>
				<Toolbar>
					<FilterGroup>
						<Select
							id='matches-status-filter'
							value={matchesFilters.status}
							onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
								handleMatchesFilterChange('status', e.target.value)
							}
						>
							<option value=''>All Statuses</option>
							<option value='pending'>Pending</option>
							<option value='accepted'>Accepted</option>
							<option value='declined'>Declined</option>
							<option value='expired'>Expired</option>
						</Select>
					</FilterGroup>
				</Toolbar>

				<Grid columns={1} gap='md'>
					{matches.map((match) => (
						<EntryCard key={match.match_id}>
							<CardContent>
								<Typography variant='h4'>
									{match.watchlistEntry?.title || 'Unknown Content'}
								</Typography>
								<Typography variant='body1'>
									Match between {match.user1?.username || 'User 1'} and{' '}
									{match.user2?.username || 'User 2'}
								</Typography>
								<Typography variant='caption'>
									Created on {formatDate(match.created_at)}
								</Typography>
								<StyledFlex gap='sm'>
									<StatusBadge status={match.status || 'pending'}>
										{match.status || 'pending'}
									</StatusBadge>
									<Badge>{match.watchlistEntry?.media_type || 'unknown'}</Badge>
								</StyledFlex>
							</CardContent>
						</EntryCard>
					))}
				</Grid>

				<PaginationControls>
					<PaginationInfo>
						Showing {matches.length} of {matchesPagination.total} matches
					</PaginationInfo>
					<Button
						size='small'
						variant='secondary'
						disabled={matchesPagination.offset === 0}
						onClick={() =>
							setMatchesPagination((prev) => ({
								...prev,
								offset: Math.max(0, prev.offset - prev.limit),
							}))
						}
					>
						Previous
					</Button>
					<Button
						size='small'
						variant='secondary'
						disabled={!matchesPagination.hasMore}
						onClick={() =>
							setMatchesPagination((prev) => ({
								...prev,
								offset: prev.offset + prev.limit,
							}))
						}
					>
						Next
					</Button>
				</PaginationControls>
			</>
		);
	};

	return (
		<>
			<H1 gutterBottom>Content Moderation</H1>
			<Typography gutterBottom>
				Manage and moderate user-generated content on the platform.
			</Typography>

			<Tabs>
				<TabPanel title='Watchlist Entries'>{renderWatchlistTab()}</TabPanel>
				<TabPanel title='Matches'>{renderMatchesTab()}</TabPanel>
			</Tabs>

			{/* Moderation Modal */}
			<Modal
				isOpen={moderationModal.isOpen}
				onClose={() =>
					setModerationModal({
						isOpen: false,
						entry: null,
						action: '',
						reason: '',
						loading: false,
						error: null,
					})
				}
				title={`${
					moderationModal.action === 'flag'
						? 'Flag'
						: moderationModal.action === 'remove'
							? 'Remove'
							: 'Approve'
				} Content`}
			>
				{moderationModal.entry && (
					<>
						<Typography gutterBottom>
							You are about to <strong>{moderationModal.action}</strong> the
							following content:
						</Typography>
						<Typography variant='h4' gutterBottom>
							{moderationModal.entry.title}
						</Typography>

						{moderationModal.action !== 'approve' && (
							<>
								<FormatHeading>Please provide a reason:</FormatHeading>
								<Select
									id='moderation-reason'
									value={moderationModal.reason}
									onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
										handleModerationChange('reason', e.target.value)
									}
									fullWidth
									disabled={moderationModal.loading}
								>
									<option value=''>Select a reason...</option>
									<option value='Inappropriate content'>
										Inappropriate content
									</option>
									<option value='Spam'>Spam</option>
									<option value='Copyright violation'>
										Copyright violation
									</option>
									<option value='Duplicate entry'>Duplicate entry</option>
									<option value='Other'>Other</option>
								</Select>
							</>
						)}

						{moderationModal.error && (
							<StyledAlert variant='error'>{moderationModal.error}</StyledAlert>
						)}

						<ActionFlex justifyContent='flex-end' gap='sm'>
							<Button
								variant='secondary'
								onClick={() =>
									setModerationModal({
										isOpen: false,
										entry: null,
										action: '',
										reason: '',
										loading: false,
										error: null,
									})
								}
								disabled={moderationModal.loading}
							>
								Cancel
							</Button>
							<Button
								variant={
									moderationModal.action === 'approve' ? 'primary' : 'danger'
								}
								onClick={handleModerateEntry}
								disabled={
									moderationModal.loading ||
									(moderationModal.action !== 'approve' &&
										!moderationModal.reason)
								}
							>
								Confirm
							</Button>
						</ActionFlex>
					</>
				)}
			</Modal>
		</>
	);
};

export default ContentModeration;
