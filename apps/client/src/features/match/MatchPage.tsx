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
  type GridProps,
  type TypographyProps,
} from '@pairflix/components';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  type ContentMatch,
  type Match,
  matches as matchesApi,
  watchlist,
} from '../../services/api';
import * as styles from './MatchPage.css';
import InviteUser from './InviteUser';
import Recommendations from './Recommendations';

const Overview = ({ className, ...rest }: TypographyProps) => (
  <Typography
    variant="body2"
    className={`${styles.overview}${className ? ` ${className}` : ''}`}
    {...rest}
  />
);

const MatchPercentage = ({
  percent,
  children,
}: {
  percent: number;
  children: React.ReactNode;
}) => {
  const bucket = percent >= 80 ? 'high' : percent >= 60 ? 'medium' : 'low';
  return (
    <Typography className={styles.matchPercentage({ bucket })}>
      {children}
    </Typography>
  );
};

const MatchLabel = ({ className, ...rest }: TypographyProps) => (
  <Typography
    variant="caption"
    className={`${styles.matchLabel}${className ? ` ${className}` : ''}`}
    {...rest}
  />
);

const NoMatches = ({ className, ...rest }: TypographyProps) => (
  <Typography
    className={`${styles.noMatches}${className ? ` ${className}` : ''}`}
    {...rest}
  />
);

const MatchesGrid = ({ className, ...rest }: GridProps) => (
  <Grid
    className={`${styles.matchesGrid}${className ? ` ${className}` : ''}`}
    {...rest}
  />
);

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
  >({
    queryKey: ['watchlist-matches'],
    queryFn: () => watchlist.getMatches(),
  });

  const { data: userMatches = [], isLoading: isUserLoading } = useQuery<
    Match[]
  >({
    queryKey: ['matches'],
    queryFn: () => matchesApi.getAll(),
  });

  const updateMatchMutation = useMutation({
    mutationFn: ({
      match_id,
      status,
    }: {
      match_id: string;
      status: 'accepted' | 'rejected';
    }) => matchesApi.updateStatus(match_id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });

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
              onSuccess={() =>
                queryClient.invalidateQueries({ queryKey: ['matches'] })
              }
            />

            <H2 gutterBottom>
              Match Requests{' '}
              {pendingMatches.length > 0 && `(${pendingMatches.length})`}
            </H2>

            {pendingMatches.length === 0 ? (
              <NoMatches>No pending match requests</NoMatches>
            ) : (
              pendingMatches.map(match => (
                <Card
                  key={match.match_id}
                  variant="primary"
                  className={styles.matchCard}
                >
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
                        disabled={updateMatchMutation.isPending}
                      >
                        {updateMatchMutation.isPending
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
                        disabled={updateMatchMutation.isPending}
                      >
                        {updateMatchMutation.isPending
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
              activeMatches.map(match => (
                <Card
                  key={match.match_id}
                  variant="primary"
                  className={styles.matchCard}
                >
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

            <Flex gap="sm" wrap="wrap" className={styles.filtersContainer}>
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
            </Flex>

            {filteredAndSortedMatches.length === 0 ? (
              <NoMatches>
                No content matches found with current filters
              </NoMatches>
            ) : (
              filteredAndSortedMatches.map(match => (
                <Card
                  key={match.tmdb_id}
                  variant="primary"
                  className={styles.contentMatchCard}
                >
                  <CardContent className="card-content">
                    <Flex gap="lg">
                      <div className={styles.posterContainer}>
                        {match.poster_path && (
                          <img
                            className={styles.posterImage}
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
                      </div>

                      <div className={styles.contentInfo}>
                        <Typography variant="h3">{match.title}</Typography>
                        <Badge variant="primary">
                          {match.media_type === 'tv' ? 'TV Series' : 'Film'}
                        </Badge>
                        {match.overview && (
                          <Overview>{match.overview}</Overview>
                        )}

                        <Flex gap="md" className={styles.statusContainer}>
                          <div className={styles.statusGroup}>
                            <Typography variant="body2">
                              Your Status:
                            </Typography>
                            <span
                              className={styles.statusBadge({
                                status: match.user1_status,
                              })}
                            >
                              {getStatusText(match.user1_status)}
                            </span>
                          </div>
                          <div className={styles.statusGroup}>
                            <Typography variant="body2">
                              Partner&apos;s Status:
                            </Typography>
                            <span
                              className={styles.statusBadge({
                                status: match.user2_status,
                              })}
                            >
                              {getStatusText(match.user2_status)}
                            </span>
                          </div>
                        </Flex>
                      </div>
                    </Flex>
                  </CardContent>
                </Card>
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
