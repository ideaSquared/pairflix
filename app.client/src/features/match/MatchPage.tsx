import {
  Badge,
  Button,
  Card,
  CardContent,
  Container,
  Flex,
  Grid,
  H1,
  H2,
  PageContainer,
  Select,
  SelectGroup,
  Typography,
} from '@pairflix/components';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../hooks/useAuth';
import {
  type ContentMatch,
  type Match,
  matches as matchesApi,
  watchlist,
} from '../../services/api';
import type { Theme } from '../../styles/theme';
import InviteUser from './InviteUser';
import Recommendations from './Recommendations';

const PosterContainer = styled.div<{ theme: Theme }>`
  flex-shrink: 0;
  width: 150px; // Reduced from 200px for better space utilization

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 100%;
  }
`;

const PosterImage = styled.img<{ theme: Theme }>`
  width: 100%;
  aspect-ratio: 2/3;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const ContentInfo = styled.div<{ theme: Theme }>`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Overview = styled(Typography).attrs({ variant: 'body2' })<{
  theme: Theme;
}>`
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

const StatusBadge = styled.span<{ status: string; theme: Theme }>`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ status, theme }) => {
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
  color: ${({ theme }) => theme.colors.text.primary};
`;

const MatchPercentage = styled(Typography)<{ percent: number; theme: Theme }>`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ percent, theme }) => {
    if (percent >= 80) return theme.colors.text.success;
    if (percent >= 60) return theme.colors.text.warning;
    return theme.colors.status.watchTogetherBackground;
  }};
`;

const MatchLabel = styled(Typography).attrs({ variant: 'caption' })<{
  theme: Theme;
}>`
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const NoMatches = styled(Typography)<{ theme: Theme }>`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const getStatusText = (status: string): string => {
  switch (status) {
    case 'to_watch':
      return 'To Watch';
    case 'watch_together_focused':
      return 'Watch together (focused)';
    case 'watch_together_background':
      return 'Watch together (background)';
    case 'watching':
      return 'Watching';
    case 'finished':
      return 'Finished';
    default:
      return status;
  }
};

const MatchesGrid = styled(Grid)<{ theme: Theme }>`
  // Dynamic grid columns based on screen size
  display: grid;
  grid-template-columns: 1fr 2fr; // Left column 1/3, right column 2/3

  // Adjust for different screen sizes
  @media (max-width: ${({ theme }) => theme.breakpoints.xl}) {
    grid-template-columns: 1fr 1.5fr; // Less difference on smaller screens
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr; // Stack vertically on mobile
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const MatchCard = styled(Card).attrs(() => ({
  variant: 'primary' as const,
}))<{ theme: Theme }>`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  width: 100%;
`;

const ContentMatchCard = styled(Card).attrs(() => ({
  variant: 'primary' as const,
}))<{ theme: Theme }>`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  width: 100%;

  .card-content {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const FiltersContainer = styled(Flex)<{ theme: Theme }>`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;

  // Make filters more compact on smaller screens
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    gap: ${({ theme }) => theme.spacing.xs};

    .select-group {
      flex: 1;
      min-width: 120px;
    }
  }
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
        void queryClient.invalidateQueries(['matches']);
      },
    }
  );

  const calculateMatchPercentage = (match: ContentMatch) => {
    const statusWeights: Record<string, number> = {
      watch_together_focused: 1,
      watch_together_background: 0.8,
      to_watch: 0.6,
      watching: 0.9,
      finished: 0.4,
    };

    const user1Weight = statusWeights[match.user1_status] ?? 0;
    const user2Weight = statusWeights[match.user2_status] ?? 0;

    return Math.round((user1Weight + user2Weight) * 50); // Convert to percentage
  };

  const filteredAndSortedMatches = useMemo(() => {
    let filtered = contentMatches.filter(
      match => mediaTypeFilter === 'all' || match.media_type === mediaTypeFilter
    );

    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        match =>
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
      <PageContainer maxWidth="xxl" padding="lg" centered>
        <Container fluid>
          <Typography>Loading...</Typography>
        </Container>
      </PageContainer>
    );
  }

  const pendingMatches = userMatches.filter(
    match => match.status === 'pending'
  );
  const activeMatches = userMatches.filter(
    match => match.status === 'accepted'
  );

  return (
    <PageContainer maxWidth="xxl" padding="lg" centered>
      <Container fluid>
        <H1 gutterBottom>Matches</H1>

        <MatchesGrid gap="xl">
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
              pendingMatches.map(match => (
                <MatchCard key={match.match_id} variant="primary">
                  <CardContent>
                    <Typography>From: {match.user1?.email}</Typography>
                    <Flex gap="sm">
                      <Button
                        variant="success"
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
                        variant="danger"
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
                </MatchCard>
              ))
            )}

            <H2 gutterBottom>
              Active Matches{' '}
              {activeMatches.length > 0 && `(${activeMatches.length})`}
            </H2>

            {activeMatches.length === 0 ? (
              <NoMatches>No active matches yet</NoMatches>
            ) : (
              activeMatches.map(match => (
                <MatchCard key={match.match_id} variant="primary">
                  <CardContent>
                    <Typography>
                      Matched with:{' '}
                      {match.user1_id === user?.user_id
                        ? match.user2?.email
                        : match.user1?.email}
                    </Typography>
                  </CardContent>
                </MatchCard>
              ))
            )}
          </div>

          <div>
            <H2 gutterBottom>
              Content Matches{' '}
              {filteredAndSortedMatches.length > 0 &&
                `(${filteredAndSortedMatches.length})`}
            </H2>

            <FiltersContainer gap="sm">
              <SelectGroup $isFullWidth={false} className="select-group">
                <Select
                  value={mediaTypeFilter}
                  onChange={e =>
                    setMediaTypeFilter(e.target.value as typeof mediaTypeFilter)
                  }
                >
                  <option value="all">All Types</option>
                  <option value="movie">Movies</option>
                  <option value="tv">TV Shows</option>
                </Select>
              </SelectGroup>

              <SelectGroup $isFullWidth={false} className="select-group">
                <Select
                  value={statusFilter}
                  onChange={e =>
                    setStatusFilter(e.target.value as typeof statusFilter)
                  }
                >
                  <option value="all">All Status</option>
                  <option value="to_watch">To Watch</option>
                  <option value="watching">Watching</option>
                </Select>
              </SelectGroup>

              <SelectGroup $isFullWidth={false} className="select-group">
                <Select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as typeof sortBy)}
                >
                  <option value="match">Best Match</option>
                  <option value="recent">Recently Added</option>
                </Select>
              </SelectGroup>
            </FiltersContainer>

            {filteredAndSortedMatches.length === 0 ? (
              <NoMatches>
                No content matches found with current filters
              </NoMatches>
            ) : (
              filteredAndSortedMatches.map(match => (
                <ContentMatchCard key={match.tmdb_id}>
                  <CardContent className="card-content">
                    <Flex gap="lg">
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
                        <Typography variant="h3">{match.title}</Typography>
                        <Badge variant="primary">
                          {match.media_type === 'tv' ? 'TV Series' : 'Film'}
                        </Badge>
                        {match.overview && (
                          <Overview>{match.overview}</Overview>
                        )}

                        <StatusContainer gap="md">
                          <StatusGroup>
                            <Typography variant="body2">
                              Your Status:
                            </Typography>
                            <StatusBadge status={match.user1_status}>
                              {getStatusText(match.user1_status)}
                            </StatusBadge>
                          </StatusGroup>
                          <StatusGroup>
                            <Typography variant="body2">
                              Partner's Status:
                            </Typography>
                            <StatusBadge status={match.user2_status}>
                              {getStatusText(match.user2_status)}
                            </StatusBadge>
                          </StatusGroup>
                        </StatusContainer>
                      </ContentInfo>
                    </Flex>
                  </CardContent>
                </ContentMatchCard>
              ))
            )}

            {/* New Recommendations section: only show when there's an active match */}
            {activeMatches.length > 0 && <Recommendations />}
          </div>
        </MatchesGrid>
      </Container>
    </PageContainer>
  );
};

export default MatchPage;
