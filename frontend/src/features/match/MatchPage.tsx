import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card, CardContent } from '../../components/common/Card';
import { Container, Flex, Grid } from '../../components/common/Layout';
import { Select, SelectGroup } from '../../components/common/Select';
import { H1, H2, Typography } from '../../components/common/Typography';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../hooks/useAuth';
import {
	ContentMatch,
	Match,
	matches as matchesApi,
	watchlist,
} from '../../services/api';
import InviteUser from './InviteUser';

const PosterContainer = styled.div`
	flex-shrink: 0;
	width: 200px;

	@media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
		width: 100%;
	}
`;

const PosterImage = styled.img`
	width: 100%;
	aspect-ratio: 2/3;
	object-fit: cover;
	border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const ContentInfo = styled.div`
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing.sm};
`;

const Overview = styled(Typography).attrs({ variant: 'body2' })`
	color: ${({ theme }) => theme.colors.text.secondary};
	display: -webkit-box;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
	overflow: hidden;
`;

const StatusContainer = styled(Flex)`
	margin-top: auto;
`;

const StatusGroup = styled.div`
	flex: 1;
	min-width: 150px;
`;

const StatusBadge = styled.span<{ status: string }>`
	display: inline-block;
	padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
	border-radius: ${({ theme }) => theme.borderRadius.sm};
	background: ${({ status, theme }) => {
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
	color: ${({ theme }) => theme.colors.text.primary};
`;

const MatchPercentage = styled(Typography)<{ percent: number }>`
	font-size: ${({ theme }) => theme.typography.fontSize.lg};
	font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
	color: ${({ percent, theme }) => {
		if (percent >= 80) return theme.colors.text.success;
		if (percent >= 60) return theme.colors.text.warning;
		return theme.colors.status.wouldLikeToWatchTogether;
	}};
`;

const MatchLabel = styled(Typography).attrs({ variant: 'caption' })`
	margin-top: ${({ theme }) => theme.spacing.xs};
`;

const NoMatches = styled(Typography)`
	text-align: center;
	padding: ${({ theme }) => theme.spacing.xl};
	color: ${({ theme }) => theme.colors.text.secondary};
`;

const MatchPage: React.FC = () => {
	const queryClient = useQueryClient();
	const { user } = useAuth();
	const [mediaTypeFilter, setMediaTypeFilter] = useState<
		'all' | 'movie' | 'tv'
	>('all');
	const [sortBy, setSortBy] = useState<'match' | 'recent'>('match');
	const [statusFilter, setStatusFilter] = useState<
		'all' | 'to_watch' | 'watching'
	>('all');

	const { data: contentMatches = [], isLoading: isContentLoading } = useQuery<
		ContentMatch[]
	>(['watchlist-matches'], () => watchlist.getMatches());

	const { data: userMatches = [], isLoading: isUserLoading } = useQuery<
		Match[]
	>(['matches'], () => matchesApi.getAll());

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
		let filtered = contentMatches.filter(
			(match) =>
				mediaTypeFilter === 'all' || match.media_type === mediaTypeFilter
		);

		if (statusFilter !== 'all') {
			filtered = filtered.filter(
				(match) =>
					match.user1_status === statusFilter ||
					match.user2_status === statusFilter
			);
		}

		return filtered.sort((a, b) => {
			if (sortBy === 'match') {
				return calculateMatchPercentage(b) - calculateMatchPercentage(a);
			}
			return b.tmdb_id - a.tmdb_id;
		});
	}, [contentMatches, mediaTypeFilter, sortBy, statusFilter]);

	if (isUserLoading || isContentLoading) {
		return (
			<Layout>
				<Typography>Loading...</Typography>
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
			<Container>
				<H1 gutterBottom>Matches</H1>

				<Grid columns={2} gap='lg'>
					<div>
						<InviteUser
							onSuccess={() => queryClient.invalidateQueries(['matches'])}
						/>

						<H2 gutterBottom>
							Match Requests{' '}
							{pendingMatches.length > 0 && `(${pendingMatches.length})`}
						</H2>

						{pendingMatches.length === 0 ? (
							<NoMatches>No pending match requests</NoMatches>
						) : (
							pendingMatches.map((match) => (
								<Card key={match.match_id} variant='primary'>
									<CardContent>
										<Typography>From: {match.user1?.email}</Typography>
										<Flex gap='sm'>
											<Button
												variant='success'
												onClick={() =>
													updateMatchMutation.mutate({
														match_id: match.match_id,
														status: 'accepted',
													})
												}
												disabled={updateMatchMutation.isLoading}
											>
												{updateMatchMutation.isLoading
													? 'Accepting...'
													: 'Accept'}
											</Button>
											<Button
												variant='danger'
												onClick={() =>
													updateMatchMutation.mutate({
														match_id: match.match_id,
														status: 'rejected',
													})
												}
												disabled={updateMatchMutation.isLoading}
											>
												{updateMatchMutation.isLoading
													? 'Rejecting...'
													: 'Reject'}
											</Button>
										</Flex>
									</CardContent>
								</Card>
							))
						)}

						<H2 gutterBottom>
							Active Matches{' '}
							{activeMatches.length > 0 && `(${activeMatches.length})`}
						</H2>

						{activeMatches.length === 0 ? (
							<NoMatches>No active matches yet</NoMatches>
						) : (
							activeMatches.map((match) => (
								<Card key={match.match_id} variant='secondary'>
									<CardContent>
										<Typography>
											Matched with:{' '}
											{match.user1_id === user?.user_id
												? match.user2?.email
												: match.user1?.email}
										</Typography>
									</CardContent>
								</Card>
							))
						)}
					</div>

					<div>
						<H2 gutterBottom>
							Content Matches{' '}
							{filteredAndSortedMatches.length > 0 &&
								`(${filteredAndSortedMatches.length})`}
						</H2>

						<Flex gap='sm' wrap='wrap'>
							<SelectGroup>
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
							</SelectGroup>

							<SelectGroup>
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
							</SelectGroup>

							<SelectGroup>
								<Select
									value={sortBy}
									onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
								>
									<option value='match'>Best Match</option>
									<option value='recent'>Recently Added</option>
								</Select>
							</SelectGroup>
						</Flex>

						{filteredAndSortedMatches.length === 0 ? (
							<NoMatches>
								No content matches found with current filters
							</NoMatches>
						) : (
							filteredAndSortedMatches.map((match) => (
								<Card key={match.tmdb_id}>
									<CardContent>
										<Flex gap='lg'>
											<PosterContainer>
												{match.poster_path && (
													<PosterImage
														src={`https://image.tmdb.org/t/p/w500${match.poster_path}`}
														alt={match.title}
													/>
												)}
												<MatchPercentage
													percent={calculateMatchPercentage(match)}
												>
													{calculateMatchPercentage(match)}% Match
												</MatchPercentage>
												<MatchLabel>Watch compatibility</MatchLabel>
											</PosterContainer>

											<ContentInfo>
												<Typography variant='h3'>{match.title}</Typography>
												<Badge variant='primary'>
													{match.media_type === 'tv' ? 'TV Series' : 'Film'}
												</Badge>
												{match.overview && (
													<Overview>{match.overview}</Overview>
												)}

												<StatusContainer gap='md'>
													<StatusGroup>
														<Typography variant='body2'>
															Your Status:
														</Typography>
														<StatusBadge status={match.user1_status}>
															{match.user1_status.replace(/_/g, ' ')}
														</StatusBadge>
													</StatusGroup>
													<StatusGroup>
														<Typography variant='body2'>
															Partner's Status:
														</Typography>
														<StatusBadge status={match.user2_status}>
															{match.user2_status.replace(/_/g, ' ')}
														</StatusBadge>
													</StatusGroup>
												</StatusContainer>
											</ContentInfo>
										</Flex>
									</CardContent>
								</Card>
							))
						)}
					</div>
				</Grid>
			</Container>
		</Layout>
	);
};

export default MatchPage;
