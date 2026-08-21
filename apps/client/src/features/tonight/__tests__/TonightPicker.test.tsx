import userEvent from '@testing-library/user-event';
import type { Mock } from 'vitest';
import {
  households,
  type HouseholdSummary,
  type RecommendationResult,
} from '../../../services/api/households';
import { fireEvent, render, screen, waitFor } from '../../../tests/setup';
import TonightPicker from '../TonightPicker';
import {
  useActiveHousehold,
  type ActiveHouseholdState,
} from '../useActiveHousehold';

// The service submodule is imported directly (not via the aliased `services/api` index), so it
// needs its own vi.mock. `useTonightPick`/`useCommitPick` run for real on top of these fakes, which
// is what lets us assert the exact `households.pick`/`commit`/`recordPickEvent` calls.
vi.mock('../../../services/api/households', () => ({
  households: {
    pick: vi.fn(),
    commit: vi.fn(),
    recordPickEvent: vi.fn(),
    launchProvider: vi.fn(),
  },
}));

// Drive household loading/empty/active states deterministically.
vi.mock('../useActiveHousehold', () => ({
  useActiveHousehold: vi.fn(),
}));

// No stored provider preference -- keeps the provider list empty so the pick request omits it.
vi.mock('../useTonightHomepage', () => ({
  useTonightHomepagePreference: () => ({ selectedProviders: [] }),
}));

// Keep the upgrade banner (and its own async query) out of the tree.
vi.mock('../../../hooks/useEntitlements', () => ({
  useEntitlements: () => ({ data: undefined }),
}));

const ACTIVE_HOUSEHOLD: HouseholdSummary = {
  id: 'hh-1',
  name: 'Our place',
  role: 'owner',
  joinedAt: '2026-01-01T00:00:00.000Z',
  memberCount: 2,
};

const householdState = (
  household: HouseholdSummary | null,
  isLoading = false
): ActiveHouseholdState => ({
  household,
  households: household ? [household] : [],
  isLoading,
  isError: false,
});

const buildResult = (tmdbId: number, title: string): RecommendationResult => ({
  pick: {
    tmdbId,
    mediaType: 'movie',
    title,
    year: 2020,
    runtime: 100,
    overview: 'A calm evening watch.',
    posterPath: null,
    providers: {},
  },
  alternates: [],
  rationale: 'Matches the mood you picked.',
  score: 0.9,
});

describe('TonightPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useActiveHousehold as Mock).mockReturnValue(
      householdState(ACTIVE_HOUSEHOLD)
    );
    (households.recordPickEvent as Mock).mockResolvedValue({ id: 'evt-1' });
    (households.commit as Mock).mockResolvedValue({ id: 'watch-1' });
  });

  it('shows a loading state while the active household is loading', () => {
    (useActiveHousehold as Mock).mockReturnValue(householdState(null, true));

    render(<TonightPicker />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Pick for us' })
    ).not.toBeInTheDocument();
  });

  it('shows the empty state with a create-a-household action when there is no household', () => {
    (useActiveHousehold as Mock).mockReturnValue(householdState(null));

    render(<TonightPicker />);

    expect(screen.getByText(/not in a household yet/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Create a household' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Pick for us' })
    ).not.toBeInTheDocument();
  });

  it('picks a title for the chosen mood and time, omitting empty providers and excludes', async () => {
    (households.pick as Mock).mockResolvedValue(buildResult(555, 'Inception'));
    const user = userEvent.setup();

    render(<TonightPicker />);

    await user.click(screen.getByRole('button', { name: 'Funny' }));
    fireEvent.change(screen.getByRole('slider'), { target: { value: '120' } });
    await user.click(screen.getByRole('button', { name: 'Pick for us' }));

    await waitFor(() => {
      expect(households.pick).toHaveBeenCalledWith('hh-1', {
        mood: 'funny',
        minutes: 120,
      });
    });
    expect(await screen.findByText('Inception')).toBeInTheDocument();
    expect(
      screen.getByText('Matches the mood you picked.')
    ).toBeInTheDocument();
  });

  it('swaps by excluding the current title and recording a swapped pick-event', async () => {
    (households.pick as Mock)
      .mockResolvedValueOnce(buildResult(100, 'First Movie'))
      .mockResolvedValueOnce(buildResult(200, 'Second Movie'));
    const user = userEvent.setup();

    render(<TonightPicker />);

    await user.click(screen.getByRole('button', { name: 'Pick for us' }));
    expect(await screen.findByText('First Movie')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Swap' }));

    await waitFor(() => {
      expect(households.recordPickEvent).toHaveBeenCalledWith('hh-1', {
        tmdbId: 100,
        mediaType: 'movie',
        kind: 'swapped',
        mood: 'feelgood',
        minutesBudget: 90,
      });
    });
    expect(await screen.findByText('Second Movie')).toBeInTheDocument();
    expect(households.pick).toHaveBeenLastCalledWith('hh-1', {
      mood: 'feelgood',
      minutes: 90,
      excludeTmdbIds: [100],
    });
    expect(screen.queryByText('First Movie')).not.toBeInTheDocument();
  });

  it('commits the pick, clearing the card and resetting the exclude list', async () => {
    (households.pick as Mock)
      .mockResolvedValueOnce(buildResult(100, 'First Movie'))
      .mockResolvedValueOnce(buildResult(200, 'Second Movie'))
      .mockResolvedValueOnce(buildResult(300, 'Third Movie'));
    const user = userEvent.setup();

    render(<TonightPicker />);

    await user.click(screen.getByRole('button', { name: 'Pick for us' }));
    expect(await screen.findByText('First Movie')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Swap' }));
    expect(await screen.findByText('Second Movie')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Watching it' }));

    await waitFor(() => {
      expect(households.commit).toHaveBeenCalledWith('hh-1', 200, {
        mediaType: 'movie',
        mood: 'feelgood',
        minutes: 90,
      });
    });
    await waitFor(() => {
      expect(screen.queryByText('Second Movie')).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Pick for us' }));

    expect(await screen.findByText('Third Movie')).toBeInTheDocument();
    // The commit reset the exclude list, so the fresh pick omits excludeTmdbIds again.
    expect(households.pick).toHaveBeenLastCalledWith('hh-1', {
      mood: 'feelgood',
      minutes: 90,
    });
  });

  it('renders the pick error message when the pick fails', async () => {
    (households.pick as Mock).mockRejectedValue(
      new Error('No titles match your filters')
    );
    const user = userEvent.setup();

    render(<TonightPicker />);

    await user.click(screen.getByRole('button', { name: 'Pick for us' }));

    expect(
      await screen.findByText('No titles match your filters')
    ).toBeInTheDocument();
  });
});
