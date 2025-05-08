import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../components/common/Button';
import { Card, CardContent, CardGrid } from '../../components/common/Card';
import { Input, InputGroup } from '../../components/common/Input';
import { Container, Flex } from '../../components/common/Layout';
import { Select, SelectGroup } from '../../components/common/Select';
import { H1, H3 } from '../../components/common/Typography';
import Badge from '../../components/layout/Badge';
import Layout from '../../components/layout/Layout';
import { watchlist, WatchlistEntry } from '../../services/api';
import { theme } from '../../styles/theme';
import SearchMedia from './SearchMedia';

const WatchlistCard = styled(Card)<{ status: string }>`
	border-left: 4px solid
		${({ status }) => {
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

const TabButton = styled(Button)<{ $active: boolean }>`
	background: ${({ $active }) =>
		$active ? theme.colors.primary : theme.colors.background.secondary};
	&:hover {
		background: ${({ $active }) =>
			$active ? theme.colors.primaryHover : theme.colors.border};
	}
`;

const WatchlistPage: React.FC = () => {
	const queryClient = useQueryClient();
	const [searchQuery, setSearchQuery] = useState('');
	const [activeTab, setActiveTab] = useState<'list' | 'search'>('list');

	const { data: entries = [], isLoading } = useQuery(
		['watchlist'],
		watchlist.getAll
	);

	const updateMutation = useMutation(
		({ id, updates }: { id: string; updates: Partial<WatchlistEntry> }) =>
			watchlist.update(id, updates),
		{
			onSuccess: () => {
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

	if (isLoading) return <div>Loading...</div>;

	return (
		<Layout>
			<Container>
				<H1 gutterBottom>My Watchlist</H1>

				<Flex gap='md' wrap='wrap'>
					<TabButton
						$active={activeTab === 'list'}
						onClick={() => setActiveTab('list')}
					>
						My List
					</TabButton>
					<TabButton
						$active={activeTab === 'search'}
						onClick={() => setActiveTab('search')}
					>
						Add New
					</TabButton>
				</Flex>

				{activeTab === 'list' ? (
					<>
						<InputGroup fullWidth>
							<Input
								type='text'
								placeholder='Search your watchlist...'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								fullWidth
							/>
						</InputGroup>

						<CardGrid>
							{entries
								.filter((entry: WatchlistEntry) =>
									entry.title?.toLowerCase().includes(searchQuery.toLowerCase())
								)
								.map((entry: WatchlistEntry) => (
									<WatchlistCard key={entry.entry_id} status={entry.status}>
										<CardContent>
											<H3 gutterBottom>
												<Badge variant={entry.media_type}>
													{entry.media_type}
												</Badge>{' '}
												{entry.title}
											</H3>

											<SelectGroup fullWidth>
												<Select
													value={entry.status}
													onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
														handleStatusChange(
															entry.entry_id,
															e.target.value as WatchlistEntry['status']
														)
													}
													fullWidth
												>
													<option value='to_watch'>To Watch</option>
													<option value='to_watch_together'>
														To Watch Together
													</option>
													<option value='would_like_to_watch_together'>
														Would Like To Watch Together
													</option>
													<option value='watching'>Watching</option>
													<option value='finished'>Finished</option>
												</Select>
											</SelectGroup>

											{entry.notes && <p>Notes: {entry.notes}</p>}
										</CardContent>
									</WatchlistCard>
								))}
						</CardGrid>
					</>
				) : (
					<SearchMedia />
				)}
			</Container>
		</Layout>
	);
};

export default WatchlistPage;
