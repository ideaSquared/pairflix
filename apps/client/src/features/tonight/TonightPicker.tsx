import {
  Badge,
  Button,
  Card,
  CardContent,
  Container,
  Flex,
  H1,
  H2,
  PageContainer,
  Typography,
} from '@pairflix/components';
import { useMutation } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import UpgradeBanner from '../billing/UpgradeBanner';
import { useEntitlements } from '../../hooks/useEntitlements';
import {
  households,
  type Mood,
  type RecommendationCard,
} from '../../services/api/households';
import * as styles from './TonightPicker.css';
import { useActiveHousehold } from './useActiveHousehold';
import { useTonightHomepagePreference } from './useTonightHomepage';
import { useCommitPick, useTonightPick } from './useTonightPick';

const MOODS: { id: Mood; label: string }[] = [
  { id: 'funny', label: 'Funny' },
  { id: 'feelgood', label: 'Feel-good' },
  { id: 'romantic', label: 'Romantic' },
  { id: 'thoughtful', label: 'Thoughtful' },
  { id: 'tense', label: 'Tense' },
  { id: 'dark', label: 'Dark' },
  { id: 'action', label: 'Action' },
];

const PROVIDER_OPTIONS: { id: string; label: string }[] = [
  { id: 'netflix', label: 'Netflix' },
  { id: 'prime', label: 'Prime Video' },
  { id: 'disney_plus', label: 'Disney+' },
];

const TonightPicker: React.FC = () => {
  const { household, isLoading: householdLoading } = useActiveHousehold();
  const { selectedProviders } = useTonightHomepagePreference();
  const [mood, setMood] = useState<Mood>('feelgood');
  const [minutes, setMinutes] = useState<number>(90);
  const [providers, setProviders] = useState<string[]>(selectedProviders);
  const [excludedTmdbIds, setExcludedTmdbIds] = useState<number[]>([]);
  const [dismissed, setDismissed] = useState(false);

  const pickMutation = useTonightPick({
    householdId: household?.id ?? '',
  });
  const commitMutation = useCommitPick({
    householdId: household?.id ?? '',
  });
  const launchMutation = useMutation({
    mutationFn: async ({
      card,
      providerSlug,
    }: {
      card: RecommendationCard;
      providerSlug: string;
    }) => {
      if (!household) {
        throw new Error('No household selected');
      }
      return households.launchProvider(household.id, card.tmdbId, {
        providerSlug,
        mediaType: card.mediaType,
      });
    },
    onSuccess: ({ url }) => {
      window.open(url, '_blank', 'noopener,noreferrer');
    },
  });
  const entitlementsQuery = useEntitlements(household?.id);

  const result = pickMutation.data;
  const isPending = pickMutation.isPending;

  const onSubmit = () => {
    setDismissed(false);
    pickMutation.mutate({
      mood,
      minutes,
      ...(providers.length > 0 ? { providers } : {}),
      ...(excludedTmdbIds.length > 0
        ? { excludeTmdbIds: excludedTmdbIds }
        : {}),
    });
  };

  const recordEvent = (
    card: RecommendationCard,
    kind: 'swapped' | 'dismissed'
  ) => {
    if (!household) return;
    void households
      .recordPickEvent(household.id, {
        tmdbId: card.tmdbId,
        mediaType: card.mediaType,
        kind,
        mood,
        minutesBudget: minutes,
      })
      .catch(() => undefined);
  };

  const onSwap = (card: RecommendationCard) => {
    recordEvent(card, 'swapped');
    const next = [...excludedTmdbIds, card.tmdbId];
    setExcludedTmdbIds(next);
    pickMutation.mutate({
      mood,
      minutes,
      ...(providers.length > 0 ? { providers } : {}),
      excludeTmdbIds: next,
    });
  };

  const onCommit = (card: RecommendationCard) => {
    // No explicit 'accepted' pick-event here -- the commit endpoint records it server-side.
    commitMutation.mutate(
      {
        tmdbId: card.tmdbId,
        mediaType: card.mediaType,
        mood,
        minutes,
      },
      {
        onSuccess: () => {
          pickMutation.reset();
          setExcludedTmdbIds([]);
        },
      }
    );
  };

  const onDismiss = (card: RecommendationCard) => {
    recordEvent(card, 'dismissed');
    setDismissed(true);
  };

  const onLaunchProvider = (card: RecommendationCard, providerSlug: string) => {
    launchMutation.mutate({ card, providerSlug });
  };

  const toggleProvider = (id: string) => {
    setProviders(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const providerBadges = useMemo(() => {
    if (!result) return [];
    return result.pick.providers.flatrate ?? [];
  }, [result]);

  if (householdLoading) {
    return (
      <PageContainer maxWidth="lg" padding="lg" centered>
        <Typography>Loading...</Typography>
      </PageContainer>
    );
  }

  if (!household) {
    return (
      <PageContainer maxWidth="lg" padding="lg" centered>
        <Container fluid>
          <H1 gutterBottom>Tonight</H1>
          <Typography variant="body1" gutterBottom>
            You&apos;re not in a household yet. Create one and invite a partner
            — or accept an invite you&apos;ve been sent.
          </Typography>
          <div className={styles.formSection}>
            <Button
              variant="primary"
              onClick={() => window.location.assign('/households/new')}
            >
              Create a household
            </Button>
          </div>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="lg" padding="lg" centered>
      <Container fluid>
        <H1 gutterBottom>Tonight</H1>
        <Typography variant="body1" gutterBottom>
          One pick. Thirty seconds. Made for both of you.
        </Typography>

        {entitlementsQuery.data && (
          <UpgradeBanner
            entitlements={entitlementsQuery.data}
            householdId={household.id}
          />
        )}

        <div className={styles.formSection}>
          <Typography variant="body2" className={styles.label}>
            Mood
          </Typography>
          <Flex wrap="wrap" gap="sm">
            {MOODS.map(m => (
              <button
                key={m.id}
                className={styles.chip({ selected: mood === m.id })}
                onClick={() => setMood(m.id)}
                type="button"
              >
                {m.label}
              </button>
            ))}
          </Flex>
        </div>

        <div className={styles.formSection}>
          <Typography variant="body2" className={styles.label}>
            Time available: {minutes} minutes
          </Typography>
          <div className={styles.sliderRow}>
            <Typography variant="caption">30</Typography>
            <input
              className={styles.slider}
              type="range"
              min={30}
              max={180}
              step={5}
              value={minutes}
              onChange={e => setMinutes(parseInt(e.target.value, 10))}
            />
            <Typography variant="caption">180</Typography>
          </div>
        </div>

        <div className={styles.formSection}>
          <Typography variant="body2" className={styles.label}>
            Streaming services
          </Typography>
          <Flex wrap="wrap">
            {PROVIDER_OPTIONS.map(p => (
              <label key={p.id}>
                <input
                  type="checkbox"
                  checked={providers.includes(p.id)}
                  onChange={() => toggleProvider(p.id)}
                />{' '}
                {p.label}
              </label>
            ))}
          </Flex>
        </div>

        <Button
          className={styles.pickButton}
          variant="primary"
          onClick={onSubmit}
          disabled={isPending || !household}
          isLoading={isPending}
        >
          Pick for us
        </Button>

        {pickMutation.error && (
          <Typography variant="body2" className={styles.errorMessage}>
            {pickMutation.error.message}
          </Typography>
        )}

        {result && !dismissed && (
          <Card variant="primary" className={styles.resultCard}>
            <CardContent>
              <Flex gap="lg" alignItems="flex-start">
                {result.pick.posterPath && (
                  <img
                    className={styles.poster}
                    src={`https://image.tmdb.org/t/p/w500${result.pick.posterPath}`}
                    alt={result.pick.title}
                  />
                )}
                <div>
                  <H2>{result.pick.title}</H2>
                  <Flex gap="sm" className={styles.badgeRow}>
                    {result.pick.year && (
                      <Badge variant="secondary">{result.pick.year}</Badge>
                    )}
                    {result.pick.runtime && (
                      <Badge variant="secondary">
                        {result.pick.runtime} min
                      </Badge>
                    )}
                    {providerBadges.map(p => (
                      <button
                        className={styles.providerLaunchButton}
                        key={p.provider_id}
                        type="button"
                        onClick={() =>
                          onLaunchProvider(result.pick, p.provider_name)
                        }
                      >
                        Watch on {p.provider_name}
                      </button>
                    ))}
                  </Flex>
                  {launchMutation.error && (
                    <Typography variant="body2" className={styles.errorMessage}>
                      {launchMutation.error.message}
                    </Typography>
                  )}
                  <Typography variant="body2" className={styles.rationale}>
                    {result.rationale}
                  </Typography>
                  <Typography variant="body2">
                    {result.pick.overview}
                  </Typography>

                  <Flex gap="md" wrap="wrap" className={styles.actionRow}>
                    <Button
                      variant="success"
                      onClick={() => onCommit(result.pick)}
                      disabled={commitMutation.isPending}
                    >
                      Watching it
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => onSwap(result.pick)}
                      disabled={isPending}
                    >
                      Swap
                    </Button>
                    <Button
                      variant="text"
                      onClick={() => onDismiss(result.pick)}
                    >
                      Not tonight
                    </Button>
                  </Flex>
                  {commitMutation.error && (
                    <Typography variant="body2" className={styles.errorMessage}>
                      {commitMutation.error.message}
                    </Typography>
                  )}
                </div>
              </Flex>
            </CardContent>
          </Card>
        )}
      </Container>
    </PageContainer>
  );
};

export default TonightPicker;
