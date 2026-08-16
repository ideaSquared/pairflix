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
import React, { useMemo, useState } from 'react';
import * as styles from './TonightPicker.css';
import { useActiveHousehold } from './useActiveHousehold';
import { useTonightHomepagePreference } from './useTonightHomepage';
import { useCommitPick, useTonightPick } from './useTonightPick';
import {
  households,
  type Mood,
  type RecommendationCard,
} from '../../services/api/households';

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
    kind: 'accepted' | 'swapped' | 'dismissed'
  ) => {
    if (!household) return;
    void households
      .recordPickEvent(household.id, {
        tmdb_id: card.tmdb_id,
        media_type: card.media_type,
        kind,
        mood,
        minutes_budget: minutes,
      })
      .catch(() => undefined);
  };

  const onSwap = (card: RecommendationCard) => {
    recordEvent(card, 'swapped');
    const next = [...excludedTmdbIds, card.tmdb_id];
    setExcludedTmdbIds(next);
    pickMutation.mutate({
      mood,
      minutes,
      ...(providers.length > 0 ? { providers } : {}),
      excludeTmdbIds: next,
    });
  };

  const onCommit = (card: RecommendationCard) => {
    recordEvent(card, 'accepted');
    commitMutation.mutate(
      {
        tmdbId: card.tmdb_id,
        mediaType: card.media_type,
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

  const onLaunchProvider = async (
    card: RecommendationCard,
    providerSlug: string
  ) => {
    if (!household) return;
    try {
      const { url } = await households.launchProvider(
        household.id,
        card.tmdb_id,
        {
          provider_slug: providerSlug,
          media_type: card.media_type,
          mood,
          minutes_budget: minutes,
        }
      );
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      // Launch failed (provider not available in region); silently no-op
    }
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
                {result.pick.poster_path && (
                  <img
                    className={styles.poster}
                    src={`https://image.tmdb.org/t/p/w500${result.pick.poster_path}`}
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
