import {
  Button,
  Card,
  CardContent,
  H1,
  PageContainer,
  ProviderBadges,
  Typography,
} from '@pairflix/components';
import React from 'react';
import { HiHandThumbDown, HiHandThumbUp } from 'react-icons/hi2';
import styled from 'styled-components';
import { type HistoryEntry } from '../../services/api';
import { useHistory } from './useHistory';
import { usePrimaryHousehold } from './usePrimaryHousehold';
import { useSetEnjoyed } from './useSetEnjoyed';

const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const HistoryList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const HistoryRow = styled.li`
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;

  @media (max-width: 600px) {
    grid-template-columns: 64px 1fr;
    grid-template-areas:
      'poster meta'
      'actions actions';
  }
`;

const Poster = styled.img`
  width: 80px;
  height: 120px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.borderRadius?.sm || '4px'};
  background: ${({ theme }) => theme.colors.background.secondary};
  grid-area: poster;

  @media (max-width: 600px) {
    width: 64px;
    height: 96px;
  }
`;

const Meta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  grid-area: meta;
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  grid-area: actions;
`;

const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const POSTER_BASE = 'https://image.tmdb.org/t/p/w185';

const formatYear = (entry: HistoryEntry): string => {
  if (entry.year) {
    return ` (${entry.year})`;
  }
  return '';
};

const formatWatchedAt = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleDateString();
};

const HistoryPage: React.FC = () => {
  const { data: household, isLoading: householdLoading } =
    usePrimaryHousehold();
  const householdId = household?.id;
  const { data, isLoading, error } = useHistory(householdId);
  const setEnjoyed = useSetEnjoyed(householdId);

  if (householdLoading || isLoading) {
    return (
      <PageContainer maxWidth="lg" padding="lg" centered>
        <Typography>Loading history…</Typography>
      </PageContainer>
    );
  }

  if (!householdId) {
    return (
      <PageContainer maxWidth="lg" padding="lg" centered>
        <PageHeader>
          <H1>Watch Together History</H1>
        </PageHeader>
        <EmptyState>
          <Typography>
            You're not in a household yet. Create or join one to start tracking
            what you watch together.
          </Typography>
        </EmptyState>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer maxWidth="lg" padding="lg" centered>
        <Typography>
          Failed to load history:{' '}
          {error instanceof Error ? error.message : 'unknown error'}
        </Typography>
      </PageContainer>
    );
  }

  const entries = data?.history ?? [];

  return (
    <PageContainer maxWidth="lg" padding="lg" centered>
      <PageHeader>
        <H1>Watch Together History</H1>
        <Typography variant="body2">
          Tap a thumb to rate something you've watched. We use these to improve
          tonight's picks.
        </Typography>
      </PageHeader>

      {entries.length === 0 ? (
        <EmptyState>
          <Typography>Nothing here yet — pick a title tonight.</Typography>
        </EmptyState>
      ) : (
        <HistoryList>
          {entries.map(entry => (
            <Card key={entry.id} variant="primary">
              <CardContent>
                <HistoryRow>
                  {entry.poster_path ? (
                    <Poster
                      src={`${POSTER_BASE}${entry.poster_path}`}
                      alt={entry.title ?? 'Poster'}
                      loading="lazy"
                    />
                  ) : (
                    <Poster as="div" aria-hidden="true" />
                  )}
                  <Meta>
                    <Typography variant="h3">
                      {entry.title ?? 'Untitled'}
                      {formatYear(entry)}
                    </Typography>
                    <Typography variant="body2">
                      Watched {formatWatchedAt(entry.watched_at)}
                    </Typography>
                    <ProviderBadges providers={[]} />
                  </Meta>
                  <Actions>
                    <Button
                      variant={entry.enjoyed === true ? 'success' : 'outline'}
                      size="small"
                      onClick={() =>
                        setEnjoyed.mutate({
                          watchedId: entry.id,
                          enjoyed: true,
                        })
                      }
                      disabled={setEnjoyed.isLoading}
                      aria-label="We enjoyed it"
                      leftIcon={<HiHandThumbUp />}
                    >
                      Yes
                    </Button>
                    <Button
                      variant={entry.enjoyed === false ? 'danger' : 'outline'}
                      size="small"
                      onClick={() =>
                        setEnjoyed.mutate({
                          watchedId: entry.id,
                          enjoyed: false,
                        })
                      }
                      disabled={setEnjoyed.isLoading}
                      aria-label="We didn't enjoy it"
                      leftIcon={<HiHandThumbDown />}
                    >
                      No
                    </Button>
                  </Actions>
                </HistoryRow>
              </CardContent>
            </Card>
          ))}
        </HistoryList>
      )}
    </PageContainer>
  );
};

export default HistoryPage;
