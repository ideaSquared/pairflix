import { useQuery } from '@tanstack/react-query';
import React from 'react';
import styled from 'styled-components';
import Layout from '../../components/layout/Layout';
import { watchlist } from '../../services/api';

const Grid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	gap: 1rem;
	padding: 1rem;
`;

const MatchCard = styled.div`
	background: #1a1a1a;
	border-radius: 8px;
	padding: 1rem;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
`;

const StatusBadge = styled.span<{ status: string }>`
	padding: 0.25rem 0.5rem;
	border-radius: 4px;
	font-size: 0.875rem;
	background: ${({ status }) => {
		switch (status) {
			case 'to_watch':
				return '#646cff';
			case 'watching':
				return '#ffd700';
			case 'finished':
				return '#00ff00';
			default:
				return '#646cff';
		}
	}};
`;

interface Match {
	tmdb_id: number;
	media_type: 'movie' | 'tv';
	title?: string;
	user1_status: 'to_watch' | 'watching' | 'finished';
	user2_status: 'to_watch' | 'watching' | 'finished';
}

const MatchPage: React.FC = () => {
	const { data: matches = [], isLoading } = useQuery(
		['matches'],
		watchlist.getMatches
	);

	if (isLoading) return <div>Loading...</div>;

	return (
		<Layout>
			<h1>Matches</h1>
			<p>Shows and movies you both want to watch</p>
			<Grid>
				{matches.map((match: Match) => (
					<MatchCard key={match.tmdb_id}>
						<h3>{match.title}</h3>
						<p>Type: {match.media_type}</p>
						<div>
							<p>
								You:{' '}
								<StatusBadge status={match.user1_status}>
									{match.user1_status}
								</StatusBadge>
							</p>
							<p>
								Partner:{' '}
								<StatusBadge status={match.user2_status}>
									{match.user2_status}
								</StatusBadge>
							</p>
						</div>
					</MatchCard>
				))}
			</Grid>
		</Layout>
	);
};

export default MatchPage;
