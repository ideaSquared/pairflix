import userEvent from '@testing-library/user-event';
import type { Mock } from 'vitest';
import { households } from '../../../services/api';
import { render, screen, waitFor } from '../../../tests/setup';
import InviteToHouseholdPage from '../InviteToHouseholdPage';

vi.mock('../../../services/api', async () => ({
  ...(await vi.importActual('../../../services/api')),
  households: {
    invite: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useParams: () => ({ id: 'house-1' }),
}));

const inviteResult = (token: string) => ({
  invite: {
    id: 'invite-1',
    token,
    invitedEmail: null,
    expiresAt: '2026-01-08T00:00:00.000Z',
    acceptedAt: null,
  },
});

describe('InviteToHouseholdPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (households.invite as Mock).mockResolvedValue(inviteResult('tok-abc'));
  });

  it('generates an invite for the household and renders the origin-based URL with the returned token', async () => {
    const user = userEvent.setup();
    render(<InviteToHouseholdPage />);

    await user.click(
      screen.getByRole('button', { name: 'Generate invite link' })
    );

    await waitFor(() => {
      expect(households.invite).toHaveBeenCalledWith('house-1', {});
    });
    expect(
      screen.getByText(`${window.location.origin}/household-invites/tok-abc`)
    ).toBeInTheDocument();
  });

  it('passes the trimmed email when one is entered', async () => {
    const user = userEvent.setup();
    render(<InviteToHouseholdPage />);

    await user.type(
      screen.getByPlaceholderText('partner@example.com'),
      '  partner@example.com  '
    );
    await user.click(
      screen.getByRole('button', { name: 'Generate invite link' })
    );

    await waitFor(() => {
      expect(households.invite).toHaveBeenCalledWith('house-1', {
        email: 'partner@example.com',
      });
    });
  });

  it('shows the pending label while generating', async () => {
    (households.invite as Mock).mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    render(<InviteToHouseholdPage />);

    await user.click(
      screen.getByRole('button', { name: 'Generate invite link' })
    );

    expect(
      await screen.findByRole('button', { name: 'Generating…' })
    ).toBeDisabled();
  });

  it('renders the error message when generating fails', async () => {
    (households.invite as Mock).mockRejectedValue(
      new Error('Not a household member')
    );
    const user = userEvent.setup();
    render(<InviteToHouseholdPage />);

    await user.click(
      screen.getByRole('button', { name: 'Generate invite link' })
    );

    await waitFor(() => {
      expect(screen.getByText('Not a household member')).toBeInTheDocument();
    });
  });
});
