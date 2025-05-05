import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import Badge from '../../components/layout/Badge';
import Layout from '../../components/layout/Layout';
import {
	ContentMatch,
	Match,
	matches as matchesApi,
	watchlist,
} from '../../services/api';
import InviteUser from './InviteUser';

interface SectionProps {
    flex?: string;
}

const Container = styled.div`
	display: flex;
	gap: 2rem;

	@media (max-width: 768px) {
		flex-direction: column;
	}
`;

const Section = styled.div<SectionProps>`
	flex: ${props => props.flex || 1};
	min-width: 0; // Prevent content from overflowing

	@media (max-width: 768px) {
		margin-bottom: 2rem;
	}
`;

const FiltersContainer = styled.div`
	margin-bottom: 1rem;
	display: flex;
	gap: 1rem;
	flex-wrap: wrap;
`;

const Select = styled.select`
	background: #2a2a2a;
	padding: 0.5rem;
	border: 1px solid #3a3a3a;
	border-radius: 4px;
	color: white;
	min-width: 150px;
`;

const MatchCard = styled.div`
	background: #1a1a1a;
	border-radius: 8px;
	padding: 1rem;
	margin-bottom: 1rem;
	display: flex;
	gap: 1.5rem;

	@media (max-width: 640px) {
		flex-direction: column;
	}
`;

const PosterContainer = styled.div`
	flex-shrink: 0;
	width: 200px;

	@media (max-width: 640px) {
		width: 100%;
	}
`;

const Button = styled.button<{ variant?: 'accept' | 'reject' }>`
	background: ${({ variant }) =>
		variant === 'accept'
			? '#00cc00'
			: variant === 'reject'
			? '#cc0000'
			: '#646cff'};
	color: white;
	border: none;
	border-radius: 4px;
	padding: 0.5rem;
	cursor: pointer;
	&:hover {
		opacity: 0.8;
	}
`;

const ButtonGroup = styled.div`
	display: flex;
	gap: 0.5rem;
`;

const Status = styled.span<{ status: string }>`
	padding: 0.25rem 0.5rem;
	border-radius: 4px;
	background: ${({ status }) =>
		status === 'accepted'
			? '#00cc00'
			: status === 'rejected'
			? '#cc0000'
			: '#646cff'};
	color: white;
`;

const PosterImage = styled.img`
	width: 100%;
	aspect-ratio: 2/3;
	object-fit: cover;
	border-radius: 4px;
`;

const ContentInfo = styled.div`
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
`;

const Title = styled.h3`
	margin: 0;
	font-size: 1.5rem;
`;

const Overview = styled.p`
	font-size: 0.875rem;
	color: #999;
	margin: 0.5rem 0;
	display: -webkit-box;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
	overflow: hidden;
`;

const StatusContainer = styled.div`
	display: flex;
	gap: 1rem;
	flex-wrap: wrap;
	margin-top: auto;
`;

const StatusGroup = styled.div`
	flex: 1;
	min-width: 150px;
`;

const StatusBadge = styled.span<{ status: string }>`
	display: inline-block;
	padding: 0.25rem 0.5rem;
	border-radius: 4px;
	background: ${({ status }) => {
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
	color: white;
`;

const MatchPercentage = styled.div<{ percent: number }>`
	font-size: 1.2rem;
	font-weight: bold;
	color: ${({ percent }) => {
		if (percent >= 80) return '#00ff00';
		if (percent >= 60) return '#ffd700';
		return '#ff69b4';
	}};
`;

const MatchLabel = styled.div`
	font-size: 0.875rem;
	color: #666;
	margin-top: 0.25rem;
`;

const NoMatches = styled.div`
	text-align: center;
	padding: 2rem;
	color: #666;
`;

const MatchPage: React.FC = () => {
	const queryClient = useQueryClient();
	const [mediaTypeFilter, setMediaTypeFilter] = useState<
		'all' | 'movie' | 'tv'
	>('all');
	const [sortBy, setSortBy] = useState<'match' | 'recent'>('match');
	const [statusFilter, setStatusFilter] = useState<
		'all' | 'to_watch' | 'watching'
	>('all');

	const { data: contentMatches = [], isLoading: isContentLoading } = useQuery<
		ContentMatch[]
	>(['watchlist-matches'], watchlist.getMatches);

	const { data: userMatches = [], isLoading: isUserLoading } = useQuery<
		Match[]
	>(['matches'], matchesApi.getAll);

	const updateMatchMutation = useMutation(
		({
			match_id,
			status,
		}: {
			match_id: string;
			status: 'accepted' | 'rejected';
		}) => matchesApi.updateStatus(match_id, status),
		{
			onSuccess: () => {
				queryClient.invalidateQueries(['matches']);
			},
		}
	);

	const calculateMatchPercentage = (match: ContentMatch) => {
		const statusWeights: Record<string, number> = {
			to_watch_together: 1,
			would_like_to_watch_together: 0.8,
			to_watch: 0.6,
			watching: 0.9,
			finished: 0.4,
		};

		const user1Weight = statusWeights[match.user1_status] || 0;
		const user2Weight = statusWeights[match.user2_status] || 0;

		return Math.round((user1Weight + user2Weight) * 50); // Convert to percentage
	};

	const filteredAndSortedMatches = useMemo(() => {
		let filtered = [...(contentMatches || [])];

		// Apply media type filter
		if (mediaTypeFilter !== 'all') {
			filtered = filtered.filter(
				(match) => match.media_type === mediaTypeFilter
			);
		}

		// Apply status filter
		if (statusFilter !== 'all') {
			filtered = filtered.filter(
				(match) =>
					match.user1_status === statusFilter ||
					match.user2_status === statusFilter
			);
		}

		// Sort matches
		return filtered.sort((a, b) => {
			if (sortBy === 'match') {
				return calculateMatchPercentage(b) - calculateMatchPercentage(a);
			}
			// Sort by most recently added (assuming tmdb_id is sequential)
			return b.tmdb_id - a.tmdb_id;
		});
	}, [contentMatches, mediaTypeFilter, sortBy, statusFilter]);

	if (isUserLoading || isContentLoading) {
		return (
			<Layout>
				<div>Loading...</div>
			</Layout>
		);
	}

	const pendingMatches = userMatches.filter(
		(match) => match.status === 'pending'
	);
	const activeMatches = userMatches.filter(
		(match) => match.status === 'accepted'
	);

	return (
		<Layout>
			<h1>Matches</h1>
			<Container>
				<Section flex="0.3">
					<InviteUser
						onSuccess={() => queryClient.invalidateQueries(['matches'])}
					/>

					<h2>
						Match Requests{' '}
						{pendingMatches.length > 0 && `(${pendingMatches.length})`}
					</h2>
					{pendingMatches.length === 0 ? (
						<NoMatches>No pending match requests</NoMatches>
					) : (
						pendingMatches.map((match: Match) => (
							<MatchCard key={match.match_id}>
								<p>From: {match.user1?.email}</p>
								<ButtonGroup>
									<Button
										variant='accept'
										onClick={() =>
											updateMatchMutation.mutate({
												match_id: match.match_id,
												status: 'accepted',
											})
										}
										disabled={updateMatchMutation.isLoading}
									>
										{updateMatchMutation.isLoading ? 'Accepting...' : 'Accept'}
									</Button>
									<Button
										variant='reject'
										onClick={() =>
											updateMatchMutation.mutate({
												match_id: match.match_id,
												status: 'rejected',
											})
										}
										disabled={updateMatchMutation.isLoading}
									>
										{updateMatchMutation.isLoading ? 'Rejecting...' : 'Reject'}
									</Button>
								</ButtonGroup>
							</MatchCard>
						))
					)}

					<h2>
						Active Matches{' '}
						{activeMatches.length > 0 && `(${activeMatches.length})`}
					</h2>
					{activeMatches.length === 0 ? (
						<NoMatches>No active matches yet</NoMatches>
					) : (
						activeMatches.map((match: Match) => (
							<MatchCard key={match.match_id}>
								<p>Matched with: {match.user1?.email}</p>
								<Status status={match.status}>{match.status}</Status>
							</MatchCard>
						))
					)}
				</Section>

				<Section flex="0.7">
					<h2>
						Content Matches{' '}
						{filteredAndSortedMatches.length > 0 &&
							`(${filteredAndSortedMatches.length})`}
					</h2>
					<FiltersContainer>
						<Select
							value={mediaTypeFilter}
							onChange={(e) =>
								setMediaTypeFilter(e.target.value as typeof mediaTypeFilter)
							}
						>
							<option value='all'>All Types</option>
							<option value='movie'>Movies</option>
							<option value='tv'>TV Shows</option>
						</Select>

						<Select
							value={statusFilter}
							onChange={(e) =>
								setStatusFilter(e.target.value as typeof statusFilter)
							}
						>
							<option value='all'>All Status</option>
							<option value='to_watch'>To Watch</option>
							<option value='watching'>Watching</option>
						</Select>

						<Select
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
						>
							<option value='match'>Best Match</option>
							<option value='recent'>Recently Added</option>
						</Select>
					</FiltersContainer>

					{filteredAndSortedMatches.length === 0 ? (
						<NoMatches>No content matches found with current filters</NoMatches>
					) : (
						filteredAndSortedMatches.map((match) => (
							<MatchCard key={match.tmdb_id}>
								<PosterContainer>
									{match.poster_path && (
										<PosterImage
											src={`https://image.tmdb.org/t/p/w500${match.poster_path}`}
											alt={match.title}
										/>
									)}
									<MatchPercentage percent={calculateMatchPercentage(match)}>
										{calculateMatchPercentage(match)}% Match
									</MatchPercentage>
									<MatchLabel>Watch compatibility</MatchLabel>
								</PosterContainer>

								<ContentInfo>
									<Title>{match.title}</Title>
									<Badge variant={match.media_type}>
										{match.media_type === 'tv' ? 'TV Show' : 'Movie'}
									</Badge>
									{match.overview && <Overview>{match.overview}</Overview>}

									<StatusContainer>
										<StatusGroup>
											<div>Your Status:</div>
											<StatusBadge status={match.user1_status}>
												{match.user1_status.replace(/_/g, ' ')}
											</StatusBadge>
										</StatusGroup>
										<StatusGroup>
											<div>Partner's Status:</div>
											<StatusBadge status={match.user2_status}>
												{match.user2_status.replace(/_/g, ' ')}
											</StatusBadge>
										</StatusGroup>
									</StatusContainer>
								</ContentInfo>
							</MatchCard>
						))
					)}
				</Section>
			</Container>
		</Layout>
	);
};

export default MatchPage;
