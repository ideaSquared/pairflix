import userEvent from '@testing-library/user-event';
import type { Mock } from 'vitest';
import { demo } from '../../../services/api/demo';
import { render, screen, waitFor } from '../../../tests/setup';
import LandingPage from '../LandingPage';

vi.mock('../../../services/api/demo', () => ({
  demo: { pick: vi.fn() },
}));

const RESULT = {
  pick: {
    tmdbId: 123,
    mediaType: 'movie' as const,
    title: 'Test Movie',
    year: 2020,
    runtime: 100,
    overview: 'A test movie.',
    posterPath: null,
    providers: {},
  },
  alternates: [],
  rationale: 'Matches your feelgood mood.',
  score: 0.8,
};

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('lets an anonymous visitor get one pick, with a signup CTA and no household actions', async () => {
    (demo.pick as Mock).mockResolvedValue(RESULT);
    const user = userEvent.setup();
    render(<LandingPage />);

    await user.click(screen.getByRole('button', { name: 'Show me a pick' }));

    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
    });
    expect(demo.pick).toHaveBeenCalledWith({ mood: 'feelgood', minutes: 90 });
    expect(
      screen.getByRole('button', { name: 'Create a free account' })
    ).toBeInTheDocument();
    expect(screen.queryByText('Watching it')).not.toBeInTheDocument();
    expect(screen.queryByText('Swap')).not.toBeInTheDocument();
    expect(screen.queryByText('Not tonight')).not.toBeInTheDocument();
  });

  it('shows a used-today state instead of the form when already used recently', () => {
    localStorage.setItem('pairflix.demoPickUsedAt', String(Date.now()));
    render(<LandingPage />);

    expect(screen.getByText(/used today's free pick/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Show me a pick' })
    ).not.toBeInTheDocument();
  });
});
