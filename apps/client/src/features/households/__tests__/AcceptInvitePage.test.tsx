import userEvent from '@testing-library/user-event';
import type { Mock } from 'vitest';
import { households } from '../../../services/api';
import { render, screen, waitFor } from '../../../tests/setup';
import AcceptInvitePage from '../AcceptInvitePage';

vi.mock('../../../services/api', async () => ({
  ...(await vi.importActual('../../../services/api')),
  households: {
    acceptInvite: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
  useParams: () => ({ token: 'invite-tok' }),
}));

describe('AcceptInvitePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (households.acceptInvite as Mock).mockResolvedValue({ householdId: 'h1' });
  });

  it('auto-accepts the token from the URL on mount and navigates to taste onboarding on success', async () => {
    render(<AcceptInvitePage />);

    await waitFor(() => {
      expect(households.acceptInvite).toHaveBeenCalledWith('invite-tok');
    });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/onboarding/taste?next=%2Ftonight'
      );
    });
  });

  it('shows the working state while the invite is being accepted', async () => {
    (households.acceptInvite as Mock).mockReturnValue(new Promise(() => {}));
    render(<AcceptInvitePage />);

    expect(await screen.findByText('Working…')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('renders the invalid-invite copy and a fallback action that navigates to household creation on failure', async () => {
    (households.acceptInvite as Mock).mockRejectedValue(new Error('expired'));
    const user = userEvent.setup();
    render(<AcceptInvitePage />);

    await waitFor(() => {
      expect(
        screen.getByText('That invite is invalid or has expired.')
      ).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalledWith(
      '/onboarding/taste?next=%2Ftonight'
    );

    await user.click(
      screen.getByRole('button', { name: 'Create your own household' })
    );
    expect(mockNavigate).toHaveBeenCalledWith('/households/new');
  });
});
