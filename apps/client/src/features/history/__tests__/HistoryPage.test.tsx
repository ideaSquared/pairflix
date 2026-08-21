import userEvent from '@testing-library/user-event';
import type { HistoryEntry } from '../../../services/api';
import { render, screen } from '../../../tests/setup';
import HistoryPage from '../HistoryPage';

// Drive the page by mocking its data hooks directly, mirroring how the auth
// tests mock useAuth -- gives precise control over loading/error/data and the
// mutation object without standing up React Query against a fake API.
const mockUsePrimaryHousehold = vi.fn();
const mockUseHistory = vi.fn();
const mockMutate = vi.fn();
const mockUseSetEnjoyed = vi.fn();

vi.mock('../usePrimaryHousehold', () => ({
  usePrimaryHousehold: () => mockUsePrimaryHousehold(),
}));

vi.mock('../useHistory', () => ({
  useHistory: () => mockUseHistory(),
}));

vi.mock('../useSetEnjoyed', () => ({
  useSetEnjoyed: () => mockUseSetEnjoyed(),
}));

const makeEntry = (overrides: Partial<HistoryEntry> = {}): HistoryEntry => ({
  id: 'w-1',
  tmdbId: 42,
  mediaType: 'movie',
  watchedAt: '2026-05-01T00:00:00.000Z',
  enjoyed: null,
  moodAtPick: null,
  minutesBudgetAtPick: null,
  title: 'Test Movie',
  year: 2026,
  posterPath: null,
  providers: {},
  ...overrides,
});

const historyResponse = (entries: HistoryEntry[]) => ({
  data: entries,
  pagination: {
    page: 1,
    limit: 50,
    total: entries.length,
    totalPages: entries.length === 0 ? 0 : 1,
  },
});

describe('HistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePrimaryHousehold.mockReturnValue({
      data: { id: 'hh-1' },
      isLoading: false,
    });
    mockUseHistory.mockReturnValue({
      data: historyResponse([]),
      isLoading: false,
      error: null,
    });
    mockUseSetEnjoyed.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    });
  });

  it('prompts to join a household when there is none', () => {
    mockUsePrimaryHousehold.mockReturnValue({ data: null, isLoading: false });
    mockUseHistory.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });

    render(<HistoryPage />);

    expect(screen.getByText(/not in a household yet/)).toBeInTheDocument();
  });

  it('renders a loading indicator while history is loading', () => {
    mockUseHistory.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<HistoryPage />);

    expect(screen.getByText(/Loading history/)).toBeInTheDocument();
  });

  it('renders the failure copy when history fails to load', () => {
    mockUseHistory.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('boom'),
    });

    render(<HistoryPage />);

    expect(
      screen.getByText(/Failed to load history: boom/)
    ).toBeInTheDocument();
  });

  it('renders the empty state when there is no history', () => {
    render(<HistoryPage />);

    expect(screen.getByText(/Nothing here yet/)).toBeInTheDocument();
  });

  it('renders a history entry with title, year and watched date', () => {
    const entry = makeEntry();
    mockUseHistory.mockReturnValue({
      data: historyResponse([entry]),
      isLoading: false,
      error: null,
    });

    render(<HistoryPage />);

    expect(screen.getByText('Test Movie (2026)')).toBeInTheDocument();
    const watched = new Date(entry.watchedAt).toLocaleDateString();
    expect(screen.getByText(`Watched ${watched}`)).toBeInTheDocument();
  });

  it('records a thumbs-up and thumbs-down with the correct enjoyed value', async () => {
    const entry = makeEntry({ id: 'w-42', enjoyed: null });
    mockUseHistory.mockReturnValue({
      data: historyResponse([entry]),
      isLoading: false,
      error: null,
    });

    const user = userEvent.setup();
    render(<HistoryPage />);

    await user.click(screen.getByRole('button', { name: 'We enjoyed it' }));
    expect(mockMutate).toHaveBeenCalledWith({
      watchedId: 'w-42',
      enjoyed: true,
    });

    await user.click(
      screen.getByRole('button', { name: "We didn't enjoy it" })
    );
    expect(mockMutate).toHaveBeenCalledWith({
      watchedId: 'w-42',
      enjoyed: false,
    });
  });

  it('shows the success variant on the positive button for an enjoyed entry', () => {
    mockUseHistory.mockReturnValue({
      data: historyResponse([makeEntry({ enjoyed: true })]),
      isLoading: false,
      error: null,
    });

    render(<HistoryPage />);

    expect(
      screen.getByRole('button', { name: 'We enjoyed it' }).className
    ).toMatch(/variant_success/);
    expect(
      screen.getByRole('button', { name: "We didn't enjoy it" }).className
    ).toMatch(/variant_outline/);
  });

  it('shows the danger variant on the negative button for a not-enjoyed entry', () => {
    mockUseHistory.mockReturnValue({
      data: historyResponse([makeEntry({ enjoyed: false })]),
      isLoading: false,
      error: null,
    });

    render(<HistoryPage />);

    expect(
      screen.getByRole('button', { name: "We didn't enjoy it" }).className
    ).toMatch(/variant_danger/);
    expect(
      screen.getByRole('button', { name: 'We enjoyed it' }).className
    ).toMatch(/variant_outline/);
  });

  it('disables both rating buttons while a rating is saving', () => {
    mockUseHistory.mockReturnValue({
      data: historyResponse([makeEntry()]),
      isLoading: false,
      error: null,
    });
    mockUseSetEnjoyed.mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      error: null,
    });

    render(<HistoryPage />);

    expect(
      screen.getByRole('button', { name: 'We enjoyed it' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: "We didn't enjoy it" })
    ).toBeDisabled();
  });

  it('renders a rating mutation error', () => {
    mockUseHistory.mockReturnValue({
      data: historyResponse([makeEntry()]),
      isLoading: false,
      error: null,
    });
    mockUseSetEnjoyed.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: new Error('Could not save your rating'),
    });

    render(<HistoryPage />);

    expect(screen.getByText('Could not save your rating')).toBeInTheDocument();
  });
});
