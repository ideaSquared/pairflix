import userEvent from '@testing-library/user-event';
import type { Mock } from 'vitest';
import { tasteOnboarding } from '../../../services/api';
import { render, screen, waitFor } from '../../../tests/setup';
import TasteOnboardingPage from '../TasteOnboardingPage';

// Mock the API module
vi.mock('../../../services/api', async () => {
  const originalModule = await vi.importActual('../../../services/api');
  return {
    ...originalModule,
    tasteOnboarding: {
      getDeck: vi.fn(),
      submit: vi.fn(),
    },
  };
});

// Mock the useNavigate hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

const DECK = [
  {
    tmdbId: 101,
    mediaType: 'movie' as const,
    title: 'Test Movie One',
    posterPath: null,
    genreIds: [35],
  },
];

describe('TasteOnboardingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (tasteOnboarding.getDeck as Mock).mockResolvedValue({ cards: DECK });
    (tasteOnboarding.submit as Mock).mockResolvedValue(undefined);
  });

  it('skip navigates to the default next path without submitting anything', async () => {
    const user = userEvent.setup();
    render(<TasteOnboardingPage />);

    await user.click(screen.getByRole('button', { name: 'Skip' }));

    expect(tasteOnboarding.submit).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/tonight');
  });

  it('walks through genre selection, a swipe, and provider selection, then submits and navigates', async () => {
    const user = userEvent.setup();
    render(<TasteOnboardingPage />);

    // Step 1: genre multi-select.
    await user.click(screen.getByRole('button', { name: 'Comedy' }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    // Step 2: swipe deck -- love the one card in the mocked deck.
    await waitFor(() => {
      expect(screen.getByText('Test Movie One')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: 'Love it' }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    // Step 3: streaming providers, then finish.
    await user.click(screen.getByLabelText('Netflix'));
    await user.click(screen.getByRole('button', { name: 'Finish' }));

    await waitFor(() => {
      expect(tasteOnboarding.submit).toHaveBeenCalledWith({
        likedGenreIds: [35],
        swipes: [
          {
            tmdbId: 101,
            mediaType: 'movie',
            genreIds: [35],
            verdict: 'love',
          },
        ],
        providers: ['netflix'],
      });
    });
    expect(mockNavigate).toHaveBeenCalledWith('/tonight');
  });
});
