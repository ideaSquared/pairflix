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
import { type HistoryEntry } from '../../services/api';
import * as styles from './HistoryPage.css';
import { useHistory } from './useHistory';
import { usePrimaryHousehold } from './usePrimaryHousehold';
import { useSetEnjoyed } from './useSetEnjoyed';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w185';

type PosterProps = {
  as?: 'img' | 'div';
} & Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'className'>;

// Rendered via createElement, not JSX -- a runtime-dynamic tag spread with
// generic HTMLAttributes through JSX resolves every intrinsic element's
// specific (and mutually incompatible) prop/ref type at once, which TS can't
// check ("union too complex"); createElement's looser typing for a variable
// element type sidesteps that (same reasoning as Typography's `Element`).
const Poster = ({ as = 'img', ...rest }: PosterProps) =>
  React.createElement(as, { className: styles.poster, ...rest });

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
        <div className={styles.pageHeader}>
          <H1>Watch Together History</H1>
        </div>
        <div className={styles.emptyState}>
          <Typography>
            You&apos;re not in a household yet. Create or join one to start
            tracking what you watch together.
          </Typography>
        </div>
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
      <div className={styles.pageHeader}>
        <H1>Watch Together History</H1>
        <Typography variant="body2">
          Tap a thumb to rate something you&apos;ve watched. We use these to
          improve tonight&apos;s picks.
        </Typography>
      </div>

      {entries.length === 0 ? (
        <div className={styles.emptyState}>
          <Typography>Nothing here yet — pick a title tonight.</Typography>
        </div>
      ) : (
        <ul className={styles.historyList}>
          {entries.map(entry => (
            <Card key={entry.id} variant="primary">
              <CardContent>
                <li className={styles.historyRow}>
                  {entry.poster_path ? (
                    <Poster
                      src={`${POSTER_BASE}${entry.poster_path}`}
                      alt={entry.title ?? 'Poster'}
                      loading="lazy"
                    />
                  ) : (
                    <Poster as="div" aria-hidden="true" />
                  )}
                  <div className={styles.meta}>
                    <Typography variant="h3">
                      {entry.title ?? 'Untitled'}
                      {formatYear(entry)}
                    </Typography>
                    <Typography variant="body2">
                      Watched {formatWatchedAt(entry.watched_at)}
                    </Typography>
                    <ProviderBadges providers={[]} />
                  </div>
                  <div className={styles.actions}>
                    <Button
                      variant={entry.enjoyed === true ? 'success' : 'outline'}
                      size="small"
                      onClick={() =>
                        setEnjoyed.mutate({
                          watchedId: entry.id,
                          enjoyed: true,
                        })
                      }
                      disabled={setEnjoyed.isPending}
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
                      disabled={setEnjoyed.isPending}
                      aria-label="We didn't enjoy it"
                      leftIcon={<HiHandThumbDown />}
                    >
                      No
                    </Button>
                  </div>
                </li>
              </CardContent>
            </Card>
          ))}
        </ul>
      )}
    </PageContainer>
  );
};

export default HistoryPage;
