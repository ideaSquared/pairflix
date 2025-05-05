import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import styled from 'styled-components';
import Layout from '../../components/layout/Layout';
import { watchlist, WatchlistEntry } from '../../services/api';
import SearchMedia from './SearchMedia';

const Grid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	gap: 1rem;
	padding: 1rem;
`;

const Card = styled.div`
	background: #1a1a1a;
	border-radius: 8px;
	padding: 1rem;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	border-left: 4px solid
		${({ status }: { status: string }) => {
			switch (status) {
				case 'to_watch':
					return '#646cff';
				case 'to_watch_together':
					return '#9370db';
				case 'would_like_to_watch_together':
					return '#ff69b4';
				case 'watching':
					return '#ffd700';
				case 'finished':
					return '#00ff00';
				default:
					return '#646cff';
			}
		}};
`;

const Select = styled.select`
	background: #2a2a2a;
	color: white;
	padding: 0.5rem;
	border: 1px solid #3a3a3a;
	border-radius: 4px;
`;

const TabContainer = styled.div`
	margin-bottom: 2rem;
`;

const TabButton = styled.button<{ active: boolean }>`
	background: ${({ active }) => (active ? '#646cff' : '#2a2a2a')};
	color: white;
	border: none;
	border-radius: 4px;
	padding: 0.5rem 1rem;
	margin-right: 1rem;
	cursor: pointer;
	&:hover {
		background: ${({ active }) => (active ? '#747bff' : '#3a3a3a')};
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
			<h1>My Watchlist</h1>
			<TabContainer>
				<TabButton
					active={activeTab === 'list'}
					onClick={() => setActiveTab('list')}
				>
					My List
				</TabButton>
				<TabButton
					active={activeTab === 'search'}
					onClick={() => setActiveTab('search')}
				>
					Add New
				</TabButton>
			</TabContainer>

			{activeTab === 'list' ? (
				<>
					<input
						type='text'
						placeholder='Search your watchlist...'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					<Grid>
						{entries
							.filter((entry: WatchlistEntry) =>
								entry.title?.toLowerCase().includes(searchQuery.toLowerCase())
							)
							.map((entry: WatchlistEntry) => (
								<Card key={entry.entry_id} status={entry.status}>
									<h3>{entry.title}</h3>
									<p>Type: {entry.media_type}</p>
									<Select
										value={entry.status}
										onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
											handleStatusChange(
												entry.entry_id,
												e.target.value as WatchlistEntry['status']
											)
										}
									>
										<option value='to_watch'>To Watch</option>
										<option value='to_watch_together'>To Watch Together</option>
										<option value='would_like_to_watch_together'>
											Would Like To Watch Together
										</option>
										<option value='watching'>Watching</option>
										<option value='finished'>Finished</option>
									</Select>
									{entry.notes && <p>Notes: {entry.notes}</p>}
								</Card>
							))}
					</Grid>
				</>
			) : (
				<SearchMedia />
			)}
		</Layout>
	);
};

export default WatchlistPage;
