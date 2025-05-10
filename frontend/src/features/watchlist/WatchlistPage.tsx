import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../components/common/Button';
import { Card, CardContent, CardGrid } from '../../components/common/Card';
import { Input, InputGroup } from '../../components/common/Input';
import { Container, Flex } from '../../components/common/Layout';
import { Select, SelectGroup } from '../../components/common/Select';
import { H1, H3, Typography } from '../../components/common/Typography';
import Badge from '../../components/layout/Badge';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../hooks/useAuth';
import * as userApi from '../../services/api';
import { watchlist, WatchlistEntry } from '../../services/api';
import SearchMedia from './SearchMedia';

const WatchlistCard = styled(Card)<{ status: string }>`
	border-left: 4px solid
		${({ status, theme }) => {
			switch (status) {
				case 'to_watch':
					return theme.colors.status.toWatch;
				case 'to_watch_together':
					return theme.colors.status.toWatchTogether;
				case 'would_like_to_watch_together':
					return theme.colors.status.wouldLikeToWatchTogether;
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

const ListViewItem = styled(WatchlistCard)`
	display: flex;
	margin-bottom: ${({ theme }) => theme.spacing.md};

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

const GridContainer = styled(CardGrid)`
	margin-top: ${({ theme }) => theme.spacing.lg};
`;

const ListContainer = styled.div`
	margin-top: ${({ theme }) => theme.spacing.lg};
`;

const WatchlistPage: React.FC = () => {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [searchQuery, setSearchQuery] = useState('');
	const [activeTab, setActiveTab] = useState<'list' | 'search'>('list');
	const [viewStyle, setViewStyle] = useState(
		user?.preferences?.viewStyle || 'grid'
	);

	const preferenceMutation = useMutation({
		mutationFn: (viewStyle: 'grid' | 'list') =>
			userApi.user.updatePreferences({ viewStyle }),
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

	const handleViewStyleChange = (newViewStyle: 'grid' | 'list') => {
		setViewStyle(newViewStyle); // Update local state immediately
		preferenceMutation.mutate(newViewStyle); // Update server-side preference
	};

	if (isLoading) {
		return (
			<Layout>
				<Container>
					<Typography>Loading your watchlist...</Typography>
				</Container>
			</Layout>
		);
	}

	if (error) {
		return (
			<Layout>
				<Container>
					<Typography color='error'>
						Error loading watchlist:{' '}
						{error instanceof Error ? error.message : 'Unknown error'}
					</Typography>
				</Container>
			</Layout>
		);
	}

	const filteredEntries = entries.filter(
		(entry: unknown): entry is WatchlistEntry => {
			if (!entry || typeof entry !== 'object') return false;
			const castEntry = entry as Partial<WatchlistEntry>;
			if (!castEntry.entry_id || !castEntry.title) {
				console.warn('Invalid entry found:', entry);
				return false;
			}
			return castEntry.title.toLowerCase().includes(searchQuery.toLowerCase());
		}
	);

	const renderWatchlistItem = (entry: WatchlistEntry) => {
		const commonContent = (
			<>
				<H3 gutterBottom>
					<Badge variant='primary'>
						{entry.media_type === 'tv' ? 'TV Series' : 'Movie'}
					</Badge>{' '}
					{entry.title}
				</H3>

				{entry.tmdb_status && (
					<MediaStatus>Status: {entry.tmdb_status}</MediaStatus>
				)}

				<SelectGroup>
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
						<option value='to_watch_together'>To Watch Together</option>
						<option value='would_like_to_watch_together'>
							Would Like To Watch Together
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
			</>
		);

		return viewStyle === 'grid' ? (
			<WatchlistCard key={entry.entry_id} status={entry.status}>
				<RelativeCard>{commonContent}</RelativeCard>
			</WatchlistCard>
		) : (
			<ListViewItem key={entry.entry_id} status={entry.status}>
				<RelativeCard>{commonContent}</RelativeCard>
			</ListViewItem>
		);
	};

	// Fixed mismatched JSX tags and syntax errors.
	return (
		<Layout>
			<Container>
				<H1 gutterBottom>My Watchlist</H1>

				<Card variant='primary'>
					<CardContent>
						<Flex gap='md' wrap='wrap'>
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
					</CardContent>
				</Card>

				{activeTab === 'list' ? (
					<>
						<InputGroup>
							<Flex gap='md' alignItems='center'>
								<Input
									type='text'
									placeholder='Search your watchlist...'
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
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

						{viewStyle === 'grid' ? (
							<GridContainer>
								{filteredEntries.map(renderWatchlistItem)}
							</GridContainer>
						) : (
							<ListContainer>
								{filteredEntries.map(renderWatchlistItem)}
							</ListContainer>
						)}

						{filteredEntries.length === 0 && searchQuery && (
							<Typography>No matches found for "{searchQuery}"</Typography>
						)}
						{filteredEntries.length === 0 && !searchQuery && (
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
