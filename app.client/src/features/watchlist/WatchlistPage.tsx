import {
	Badge,
	Button,
	Card,
	CardContent,
	CardGrid,
	Flex,
	H1,
	H3,
	Input,
	InputGroup,
	Select,
	SelectGroup,
	Typography,
} from '@pairflix/components';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import TagFilter from '../../components/common/TagFilter';
import TagInput from '../../components/common/TagInput';
import Layout, { Container } from '../../components/layout/Layout';
import { useAuth } from '../../hooks/useAuth';
import {
	user as userService,
	watchlist,
	WatchlistEntry,
} from '../../services/api';
import SearchMedia from './SearchMedia';

// Create a custom type for our WatchlistCard component that properly extends Card props
interface WatchlistCardProps {
	status: string;
	variant?: 'primary' | 'secondary' | 'outlined';
	children: React.ReactNode;
	className?: string;
	elevation?: 'low' | 'medium' | 'high';
	accentColor?: string;
	interactive?: boolean;
}

// Extend the Card component to include status prop
const WatchlistCard = styled(Card)<WatchlistCardProps>`
	border-left: 4px solid
		${({ status, theme }) => {
			switch (status) {
				case 'to_watch':
					return theme.colors.status.toWatch;
				case 'watch_together_focused':
					return theme.colors.status.watchTogetherFocused;
				case 'watch_together_background':
					return theme.colors.status.watchTogetherBackground;
				case 'watching':
					return theme.colors.status.watching;
				case 'finished':
					return theme.colors.status.finished;
				default:
					return theme.colors.status.toWatch;
			}
		}};
`;

const MediaStatus = styled(Typography)`
	color: ${({ theme }) => theme.colors.text.secondary};
	margin-top: ${({ theme }) => theme.spacing.xs};
	font-style: italic;
`;

const TabButton = styled(Button)<{ $active: boolean }>`
	background: ${({ $active, theme }) =>
		$active ? theme.colors.primary : theme.colors.background.secondary};
	&:hover {
		background: ${({ $active, theme }) =>
			$active ? theme.colors.primaryHover : theme.colors.border};
	}
`;

const RelativeCard = styled(CardContent)`
	position: relative;
`;

// Update the GridContainer for better space utilization across various screen sizes
const GridContainer = styled(CardGrid)`
	margin-top: ${({ theme }) => theme.spacing.lg};
	display: grid;
	grid-template-columns: repeat(
		auto-fill,
		minmax(280px, 1fr)
	); // Base size adjusted
	gap: ${({ theme }) => theme.spacing.md};

	/* Better utilization of screen space across different devices */
	@media (min-width: 1200px) {
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	}

	/* For larger screens, allow even more cards per row */
	@media (min-width: 1600px) {
		grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
	}

	/* For extra large screens, maximize content density */
	@media (min-width: 2000px) {
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
	}
`;

// Enhanced List View item styling
const ListViewItem = styled(WatchlistCard)`
	display: flex;
	margin-bottom: ${({ theme }) => theme.spacing.md};
	width: 100%;

	${RelativeCard} {
		flex: 1;
		display: flex;
		gap: ${({ theme }) => theme.spacing.lg};

		.content {
			flex: 1;
			display: flex;
			flex-direction: column;
			gap: ${({ theme }) => theme.spacing.sm};
		}

		.actions {
			display: flex;
			align-items: flex-start;
			padding-left: ${({ theme }) => theme.spacing.md};
		}
	}
`;

// Updated list container for better width utilization
const ListContainer = styled.div`
	margin-top: ${({ theme }) => theme.spacing.lg};
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing.md};
`;

const TabsContainer = styled(Flex)`
	margin-bottom: ${({ theme }) => theme.spacing.md};
	border-bottom: 1px solid ${({ theme }) => theme.colors.border};
	padding-bottom: ${({ theme }) => theme.spacing.sm};
`;

type PreferenceResponse = {
	token: string;
	user: {
		preferences: {
			viewStyle: 'grid' | 'list';
			[key: string]: any;
		};
	};
};

const TagsSection = styled.div`
	margin-top: ${({ theme }) => theme.spacing.md};
	padding-top: ${({ theme }) => theme.spacing.sm};
	border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const TagsContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.25rem;
	margin-top: 0.5rem;
`;

const Tag = styled.span`
	background: ${({ theme }) => theme.colors?.primary || '#4853db'};
	color: white;
	padding: 0.15rem 0.4rem;
	border-radius: ${({ theme }) => theme.borderRadius?.sm || '4px'};
	font-size: ${({ theme }) => theme.typography?.fontSize?.sm || '0.875rem'};
`;

const WatchlistPage: React.FC = () => {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [searchQuery, setSearchQuery] = useState('');
	const [activeTab, setActiveTab] = useState<'list' | 'search'>('list');
	const [viewStyle, setViewStyle] = useState(
		user?.preferences?.viewStyle || 'grid'
	);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [isEditingTags, setIsEditingTags] = useState<string | null>(null);

	const preferenceMutation = useMutation<
		PreferenceResponse,
		Error,
		'grid' | 'list'
	>({
		mutationFn: (viewStyle: 'grid' | 'list') =>
			userService.updatePreferences({ viewStyle }),
		onSuccess: (response) => {
			if (response.token) {
				localStorage.setItem('token', response.token);
				queryClient.invalidateQueries(['auth']);
			}
		},
	});

	// Update useEffect to sync with user preferences
	useEffect(() => {
		if (user?.preferences?.viewStyle) {
			setViewStyle(user.preferences.viewStyle);
		}
	}, [user?.preferences?.viewStyle]);

	const {
		data: entries = [],
		isLoading,
		error,
	} = useQuery(['watchlist'], watchlist.getAll, {
		retry: 3,
		staleTime: 30000,
	});

	const updateMutation = useMutation(
		({ id, updates }: { id: string; updates: Partial<WatchlistEntry> }) =>
			watchlist.update(id, updates),
		{
			onMutate: async ({ id, updates }) => {
				await queryClient.cancelQueries(['watchlist']);
				const previousEntries = queryClient.getQueryData<WatchlistEntry[]>([
					'watchlist',
				]);

				queryClient.setQueryData<WatchlistEntry[]>(['watchlist'], (old) => {
					if (!old) return [];
					return old.map((entry) =>
						entry.entry_id === id ? { ...entry, ...updates } : entry
					);
				});

				return { previousEntries };
			},
			onError: (_err, _vars, context) => {
				if (context?.previousEntries) {
					queryClient.setQueryData(['watchlist'], context.previousEntries);
				}
			},
			onSettled: () => {
				queryClient.invalidateQueries(['watchlist']);
			},
		}
	);

	const handleStatusChange = (
		entryId: string,
		status: WatchlistEntry['status']
	) => {
		updateMutation.mutate({ id: entryId, updates: { status } });
	};

	const handleTagsChange = (entryId: string, tags: string[]) => {
		try {
			// Properly format the tags before sending to the API
			updateMutation.mutate({
				id: entryId,
				updates: {
					tags: tags.length > 0 ? tags : [], // Ensure we always send an array, even if empty
				},
			});
			setIsEditingTags(null); // Close tag editor after saving
		} catch (error) {
			console.error('Error updating tags:', error);
			// Keep the tag editor open if there was an error
		}
	};

	const handleViewStyleChange = (newViewStyle: 'grid' | 'list') => {
		setViewStyle(newViewStyle); // Update local state immediately
		preferenceMutation.mutate(newViewStyle); // Update server-side preference
	};

	// Extract all unique tags from entries
	const allTags = useMemo(() => {
		const tags = new Set<string>();
		entries.forEach((entry: any) => {
			if (entry.tags && Array.isArray(entry.tags)) {
				entry.tags.forEach((tag: string) => tags.add(tag));
			}
		});
		return Array.from(tags).sort();
	}, [entries]);

	// Enhanced filtering to include tag filtering with stable sort order
	const filteredEntries = useMemo(() => {
		const filtered = entries.filter(
			(entry: unknown): entry is WatchlistEntry => {
				if (!entry || typeof entry !== 'object') return false;

				const castEntry = entry as Partial<WatchlistEntry>;
				if (!castEntry.entry_id || !castEntry.title) {
					console.warn('Invalid entry found:', entry);
					return false;
				}

				// First filter by search query
				const matchesSearch = castEntry.title
					.toLowerCase()
					.includes(searchQuery.toLowerCase());

				// Then filter by selected tags
				const matchesTags =
					selectedTags.length === 0 ||
					(castEntry.tags &&
						selectedTags.some((tag) => castEntry.tags?.includes(tag)));

				return matchesSearch && !!matchesTags;
			}
		);

		// Apply a stable sort to maintain consistent order regardless of status changes
		// Sort by entry_id to ensure stable positioning
		return [...filtered].sort((a, b) => {
			// First sort by title alphabetically
			return a.title.localeCompare(b.title);
		});
	}, [entries, searchQuery, selectedTags]);

	if (isLoading) {
		return (
			<Layout fullWidth>
				<Container fluid centered>
					<Typography>Loading your watchlist...</Typography>
				</Container>
			</Layout>
		);
	}

	if (error) {
		return (
			<Layout fullWidth>
				<Container fluid centered>
					<Typography color='error'>
						Error loading watchlist:{' '}
						{error instanceof Error ? error.message : 'Unknown error'}
					</Typography>
				</Container>
			</Layout>
		);
	}

	const renderWatchlistItem = (entry: WatchlistEntry) => {
		const commonContent = (
			<>
				<H3 gutterBottom>
					<Badge variant='primary'>
						{entry.media_type === 'tv' ? 'TV Series' : 'Movie'}
					</Badge>{' '}
					{entry.title}
				</H3>
				{/* {entry.tmdb_status && (
					<MediaStatus>Status: {entry.tmdb_status}</MediaStatus>
				)} */}{' '}
				<SelectGroup fullWidth>
					<Select
						value={entry.status}
						onChange={(e) =>
							handleStatusChange(
								entry.entry_id,
								e.target.value as WatchlistEntry['status']
							)
						}
						fullWidth
					>
						<option value='to_watch'>To Watch</option>
						<option value='watch_together_focused'>
							Watch together (focused)
						</option>
						<option value='watch_together_background'>
							Watch together (background)
						</option>
						<option value='watching'>Watching</option>
						<option value='finished'>Finished</option>
					</Select>
				</SelectGroup>
				{entry.notes && (
					<Typography variant='body2' gutterBottom>
						Notes: {entry.notes}
					</Typography>
				)}
				{/* Tags display and management */}
				<TagsSection>
					{isEditingTags === entry.entry_id ? (
						<>
							<Typography variant='body2' gutterBottom>
								Manage Tags:
							</Typography>
							<TagInput
								tags={entry.tags || []}
								onChange={(tags) => handleTagsChange(entry.entry_id, tags)}
								placeholder='Add tags...'
							/>
							<Button
								onClick={() => setIsEditingTags(null)}
								style={{ marginTop: '0.5rem' }}
							>
								Done
							</Button>
						</>
					) : (
						<>
							<Flex justifyContent='space-between' alignItems='center'>
								<Typography variant='body2'>Tags:</Typography>
								<Button
									variant='text'
									onClick={() => setIsEditingTags(entry.entry_id)}
								>
									Edit Tags
								</Button>
							</Flex>
							<TagsContainer>
								{entry.tags && entry.tags.length > 0 ? (
									entry.tags.map((tag, idx) => <Tag key={idx}>{tag}</Tag>)
								) : (
									<Typography variant='caption'>No tags added</Typography>
								)}
							</TagsContainer>
						</>
					)}
				</TagsSection>
			</>
		);

		return viewStyle === 'grid' ? (
			<WatchlistCard
				key={entry.entry_id}
				status={entry.status}
				data-testid={`movie-item-${entry.entry_id}`}
			>
				<RelativeCard>{commonContent}</RelativeCard>
			</WatchlistCard>
		) : (
			<ListViewItem
				key={entry.entry_id}
				status={entry.status}
				data-testid={`movie-item-${entry.entry_id}`}
			>
				<RelativeCard>{commonContent}</RelativeCard>
			</ListViewItem>
		);
	};

	// Fixed mismatched JSX tags and syntax errors.
	return (
		<Layout fullWidth>
			<Container fluid centered>
				<H1 gutterBottom>My Watchlist</H1>

				<Card accentColor='#69c176'>
					<CardContent>
						<Flex gap='md' wrap='wrap' style={{ marginBottom: '1rem' }}>
							<TabButton
								$active={activeTab === 'list'}
								onClick={() => setActiveTab('list')}
							>
								My List{' '}
								{filteredEntries.length > 0 && `(${filteredEntries.length})`}
							</TabButton>
							<TabButton
								$active={activeTab === 'search'}
								onClick={() => setActiveTab('search')}
							>
								Add New
							</TabButton>
						</Flex>

						{activeTab === 'list' && (
							<>
								<InputGroup>
									<Flex gap='md' alignItems='center'>
										<Input
											type='text'
											placeholder='Search your watchlist...'
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											fullWidth
										/>
										<Select
											value={viewStyle}
											onChange={(e) =>
												handleViewStyleChange(e.target.value as 'grid' | 'list')
											}
										>
											<option value='grid'>Grid View</option>
											<option value='list'>List View</option>
										</Select>
									</Flex>
								</InputGroup>

								{/* Tag filter when we have tags */}
								{allTags.length > 0 && (
									<TagFilter
										tags={allTags}
										selectedTags={selectedTags}
										onChange={setSelectedTags}
									/>
								)}
							</>
						)}
					</CardContent>
				</Card>

				{activeTab === 'list' ? (
					<>
						{viewStyle === 'grid' ? (
							<GridContainer>
								{filteredEntries.map(renderWatchlistItem)}
							</GridContainer>
						) : (
							<ListContainer>
								{filteredEntries.map(renderWatchlistItem)}
							</ListContainer>
						)}

						{filteredEntries.length === 0 &&
							(searchQuery || selectedTags.length > 0) && (
								<Typography>
									No matches found{searchQuery ? ` for "${searchQuery}"` : ''}
									{selectedTags.length > 0 ? ` with selected tags` : ''}
								</Typography>
							)}
						{filteredEntries.length === 0 &&
							!searchQuery &&
							selectedTags.length === 0 && (
								<Typography>
									Your watchlist is empty. Add some titles to get started!
								</Typography>
							)}
					</>
				) : (
					<SearchMedia />
				)}
			</Container>
		</Layout>
	);
};

export default WatchlistPage;
