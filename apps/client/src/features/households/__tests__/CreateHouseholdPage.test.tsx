import userEvent from '@testing-library/user-event';
import type { Mock } from 'vitest';
import { households } from '../../../services/api';
import { render, screen, waitFor } from '../../../tests/setup';
import CreateHouseholdPage from '../CreateHouseholdPage';

vi.mock('../../../services/api', async () => ({
  ...(await vi.importActual('../../../services/api')),
  households: {
    create: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

describe('CreateHouseholdPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (households.create as Mock).mockResolvedValue({
      household: {
        id: 'h1',
        name: 'Movie Mondays',
        role: 'owner',
        joinedAt: '2026-01-01T00:00:00.000Z',
        memberCount: 1,
      },
    });
  });

  it('creates with the trimmed name and navigates to taste onboarding carrying the invites next path', async () => {
    const user = userEvent.setup();
    render(<CreateHouseholdPage />);

    await user.type(
      screen.getByPlaceholderText('e.g. Movie Mondays'),
      '  Movie Mondays  '
    );
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(households.create).toHaveBeenCalledWith({ name: 'Movie Mondays' });
    });
    expect(mockNavigate).toHaveBeenCalledWith(
      '/onboarding/taste?next=%2Fhouseholds%2Fh1%2Finvites'
    );
  });

  it('submits an empty body when the name field is left blank', async () => {
    const user = userEvent.setup();
    render(<CreateHouseholdPage />);

    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(households.create).toHaveBeenCalledWith({});
    });
    expect(mockNavigate).toHaveBeenCalledWith(
      '/onboarding/taste?next=%2Fhouseholds%2Fh1%2Finvites'
    );
  });

  it('renders the error message and does not navigate when creation fails', async () => {
    (households.create as Mock).mockRejectedValue(
      new Error('Household limit reached')
    );
    const user = userEvent.setup();
    render(<CreateHouseholdPage />);

    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(screen.getByText('Household limit reached')).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows the pending label and disables the button while the create is in flight', async () => {
    (households.create as Mock).mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    render(<CreateHouseholdPage />);

    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(
      await screen.findByRole('button', { name: 'Creating…' })
    ).toBeDisabled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
