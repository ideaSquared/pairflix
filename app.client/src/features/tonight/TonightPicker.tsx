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
import styled from 'styled-components';
import type { Theme } from '../../styles/theme';
import { useActiveHousehold } from './useActiveHousehold';
import { useTonightHomepagePreference } from './useTonightHomepage';
import { useCommitPick, useTonightPick } from './useTonightPick';
import type { Mood, RecommendationCard } from '../../services/api/households';

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

const ChipRow = styled(Flex)<{ theme: Theme }>`
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Chip = styled.button<{ selected: boolean; theme: Theme }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: 999px;
  border: 1px solid
    ${({ selected, theme }) =>
      selected ? theme.colors.primary : theme.colors.border};
  background: ${({ selected, theme }) =>
    selected ? theme.colors.primary : 'transparent'};
  color: ${({ selected, theme }) =>
    selected ? '#ffffff' : theme.colors.text.primary};
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  transition: background 0.15s ease;

  &:hover {
    background: ${({ selected, theme }) =>
      selected ? theme.colors.primary : theme.colors.background.secondary};
  }
`;

const SliderRow = styled.div<{ theme: Theme }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin: ${({ theme }) => theme.spacing.md} 0;
`;

const Slider = styled.input.attrs({ type: 'range' })<{ theme: Theme }>`
  flex: 1;
`;

const ProviderRow = styled(Flex)<{ theme: Theme }>`
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`;

const PickButton = styled(Button)<{ theme: Theme }>`
  margin-top: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
`;

const ResultCard = styled(Card).attrs({ variant: 'primary' as const })<{
  theme: Theme;
}>`
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const Poster = styled.img<{ theme: Theme }>`
  width: 200px;
  aspect-ratio: 2/3;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  flex-shrink: 0;
`;

const Rationale = styled(Typography)<{ theme: Theme }>`
  font-style: italic;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ActionRow = styled(Flex)<{ theme: Theme }>`
  margin-top: ${({ theme }) => theme.spacing.lg};
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`;

const FormSection = styled.div<{ theme: Theme }>`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Label = styled(Typography).attrs({ variant: 'body2' })<{ theme: Theme }>`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const ResultLayout = styled(Flex)<{ theme: Theme }>`
  gap: ${({ theme }) => theme.spacing.lg};
  align-items: flex-start;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

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
  const isPending = pickMutation.isLoading;

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

  const onSwap = (card: RecommendationCard) => {
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
            You're not in a household yet. Create one and invite a partner — or
            accept an invite you've been sent.
          </Typography>
          <FormSection>
            <Button
              variant="primary"
              onClick={() => window.location.assign('/households/new')}
            >
              Create a household
            </Button>
          </FormSection>
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

        <FormSection>
          <Label>Mood</Label>
          <ChipRow>
            {MOODS.map(m => (
              <Chip
                key={m.id}
                selected={mood === m.id}
                onClick={() => setMood(m.id)}
                type="button"
              >
                {m.label}
              </Chip>
            ))}
          </ChipRow>
        </FormSection>

        <FormSection>
          <Label>Time available: {minutes} minutes</Label>
          <SliderRow>
            <Typography variant="caption">30</Typography>
            <Slider
              min={30}
              max={180}
              step={5}
              value={minutes}
              onChange={e => setMinutes(parseInt(e.target.value, 10))}
            />
            <Typography variant="caption">180</Typography>
          </SliderRow>
        </FormSection>

        <FormSection>
          <Label>Streaming services</Label>
          <ProviderRow>
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
          </ProviderRow>
        </FormSection>

        <PickButton
          variant="primary"
          onClick={onSubmit}
          disabled={isPending || !household}
          isLoading={isPending}
        >
          Pick for us
        </PickButton>

        {pickMutation.error && (
          <Typography variant="body2" style={{ marginTop: 16 }}>
            {pickMutation.error.message}
          </Typography>
        )}

        {result && !dismissed && (
          <ResultCard>
            <CardContent>
              <ResultLayout>
                {result.pick.poster_path && (
                  <Poster
                    src={`https://image.tmdb.org/t/p/w500${result.pick.poster_path}`}
                    alt={result.pick.title}
                  />
                )}
                <div>
                  <H2>{result.pick.title}</H2>
                  <Flex gap="sm" style={{ flexWrap: 'wrap' }}>
                    {result.pick.year && (
                      <Badge variant="secondary">{result.pick.year}</Badge>
                    )}
                    {result.pick.runtime && (
                      <Badge variant="secondary">
                        {result.pick.runtime} min
                      </Badge>
                    )}
                    {providerBadges.map(p => (
                      <Badge key={p.provider_id} variant="primary">
                        {p.provider_name}
                      </Badge>
                    ))}
                  </Flex>
                  <Rationale variant="body2">{result.rationale}</Rationale>
                  <Typography variant="body2">
                    {result.pick.overview}
                  </Typography>

                  <ActionRow>
                    <Button
                      variant="success"
                      onClick={() => onCommit(result.pick)}
                      disabled={commitMutation.isLoading}
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
                    <Button variant="text" onClick={() => setDismissed(true)}>
                      Not tonight
                    </Button>
                  </ActionRow>
                </div>
              </ResultLayout>
            </CardContent>
          </ResultCard>
        )}
      </Container>
    </PageContainer>
  );
};

export default TonightPicker;
