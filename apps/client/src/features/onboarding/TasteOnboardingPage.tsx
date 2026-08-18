import {
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
import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  tasteOnboarding,
  type OnboardingCard,
  type OnboardingSwipe,
} from '../../services/api';
import { ONBOARDING_GENRES } from './genres';
import * as styles from './TasteOnboardingPage.css';

const PROVIDER_OPTIONS: { id: string; label: string }[] = [
  { id: 'netflix', label: 'Netflix' },
  { id: 'prime', label: 'Prime Video' },
  { id: 'disney_plus', label: 'Disney+' },
];

type Step = 'genres' | 'swipe' | 'providers';

const DEFAULT_NEXT_PATH = '/tonight';

/**
 * Skippable taste-starter flow shown once per household member at their own join moment --
 * CreateHouseholdPage and AcceptInvitePage both navigate here (with `?next=` set to wherever they
 * would otherwise have gone) instead of straight to their normal next page. Every step's Skip goes
 * straight to `next` without submitting; completing all three steps submits once on finish, then
 * also navigates to `next`.
 */
const TasteOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get('next') || DEFAULT_NEXT_PATH;

  const [step, setStep] = useState<Step>('genres');
  const [likedGenreIds, setLikedGenreIds] = useState<number[]>([]);
  const [swipes, setSwipes] = useState<OnboardingSwipe[]>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [providers, setProviders] = useState<string[]>([]);

  const deckQuery = useQuery({
    queryKey: ['taste-onboarding-deck'],
    queryFn: () => tasteOnboarding.getDeck(),
  });
  const deck = deckQuery.data?.cards ?? [];
  const currentCard: OnboardingCard | undefined = deck[cardIndex];

  const submitMutation = useMutation({
    mutationFn: () =>
      tasteOnboarding.submit({ likedGenreIds, swipes, providers }),
    onSuccess: () => navigate(nextPath),
  });

  const skip = () => navigate(nextPath);

  const toggleGenre = (id: number) => {
    setLikedGenreIds(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const toggleProvider = (id: string) => {
    setProviders(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const swipeCard = (card: OnboardingCard, verdict: 'love' | 'not_for_me') => {
    setSwipes(prev => [
      ...prev,
      {
        tmdbId: card.tmdbId,
        mediaType: card.mediaType,
        genreIds: card.genreIds,
        verdict,
      },
    ]);
    setCardIndex(prev => prev + 1);
  };

  return (
    <PageContainer maxWidth="md" padding="lg" centered>
      <Container fluid>
        <Flex
          justifyContent="space-between"
          alignItems="center"
          className={styles.header}
        >
          <H1>Tell us what you like</H1>
          <Button variant="text" onClick={skip}>
            Skip
          </Button>
        </Flex>

        {step === 'genres' && (
          <Card variant="secondary">
            <CardContent>
              <H2 gutterBottom>Pick a few genres you love</H2>
              <Typography variant="body2" gutterBottom>
                Select as many as you like -- this just gives your first picks a
                head start.
              </Typography>
              <Flex wrap="wrap" gap="sm" className={styles.formSection}>
                {ONBOARDING_GENRES.map(genre => (
                  <button
                    key={genre.id}
                    type="button"
                    className={styles.chip({
                      selected: likedGenreIds.includes(genre.id),
                    })}
                    onClick={() => toggleGenre(genre.id)}
                  >
                    {genre.label}
                  </button>
                ))}
              </Flex>
              <Button
                variant="primary"
                className={styles.nextButton}
                onClick={() => setStep('swipe')}
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'swipe' && (
          <Card variant="secondary">
            <CardContent>
              <H2 gutterBottom>Love it, or not for you?</H2>
              {deckQuery.isLoading && (
                <Typography variant="body2">Loading titles…</Typography>
              )}
              {deckQuery.error && (
                <Typography variant="body2">
                  Couldn&apos;t load titles to swipe on right now.
                </Typography>
              )}
              {currentCard && (
                <div className={styles.formSection}>
                  {currentCard.posterPath && (
                    <img
                      className={styles.poster}
                      src={`https://image.tmdb.org/t/p/w342${currentCard.posterPath}`}
                      alt={currentCard.title}
                    />
                  )}
                  <Typography variant="body1" gutterBottom>
                    {currentCard.title}
                  </Typography>
                  <Flex gap="md">
                    <Button
                      variant="danger"
                      onClick={() => swipeCard(currentCard, 'not_for_me')}
                    >
                      Not for me
                    </Button>
                    <Button
                      variant="success"
                      onClick={() => swipeCard(currentCard, 'love')}
                    >
                      Love it
                    </Button>
                  </Flex>
                </div>
              )}
              {!currentCard && !deckQuery.isLoading && (
                <Typography variant="body2" className={styles.formSection}>
                  That&apos;s everything for now.
                </Typography>
              )}
              <Button
                variant="primary"
                className={styles.nextButton}
                onClick={() => setStep('providers')}
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'providers' && (
          <Card variant="secondary">
            <CardContent>
              <H2 gutterBottom>Where do you stream?</H2>
              <Flex wrap="wrap" className={styles.formSection}>
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
              {submitMutation.error && (
                <Typography variant="body2" className={styles.errorMessage}>
                  {submitMutation.error.message}
                </Typography>
              )}
              <Button
                variant="primary"
                className={styles.nextButton}
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending}
                isLoading={submitMutation.isPending}
              >
                Finish
              </Button>
            </CardContent>
          </Card>
        )}
      </Container>
    </PageContainer>
  );
};

export default TasteOnboardingPage;
