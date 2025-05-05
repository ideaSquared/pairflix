import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import styled from 'styled-components';
import Layout from '../../components/layout/Layout';
import { watchlist, WatchlistEntry } from '../../services/api';

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
`;

const Select = styled.select`
	background: #2a2a2a;
	color: white;
	padding: 0.5rem;
	border: 1px solid #3a3a3a;
	border-radius: 4px;
`;

const Button = styled.button`
	background: #646cff;
	color: white;
	border: none;
	border-radius: 4px;
	padding: 0.5rem;
	cursor: pointer;
	&:hover {
		background: #747bff;
	}
`;

const WatchlistPage: React.FC = () => {
	const queryClient = useQueryClient();
	const [searchQuery, setSearchQuery] = useState('');

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
			<input
				type='text'
				placeholder='Search your watchlist...'
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
			/>
			<Grid>
				{entries
					.filter((entry) =>
						entry.title?.toLowerCase().includes(searchQuery.toLowerCase())
					)
					.map((entry: WatchlistEntry) => (
						<Card key={entry.entry_id}>
							<h3>{entry.title}</h3>
							<p>Type: {entry.media_type}</p>
							<Select
								value={entry.status}
								onChange={(e) =>
									handleStatusChange(
										entry.entry_id,
										e.target.value as WatchlistEntry['status']
									)
								}
							>
								<option value='to_watch'>To Watch</option>
								<option value='watching'>Watching</option>
								<option value='finished'>Finished</option>
							</Select>
							{entry.notes && <p>Notes: {entry.notes}</p>}
						</Card>
					))}
			</Grid>
		</Layout>
	);
};

export default WatchlistPage;
