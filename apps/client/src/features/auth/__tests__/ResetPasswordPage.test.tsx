import userEvent from '@testing-library/user-event';
import type { Mock } from 'vitest';
import { emailService } from '../../../services/api';
import { render, screen, waitFor } from '../../../tests/setup';
import ResetPasswordPage from '../ResetPasswordPage';

const mockNavigate = vi.fn();
const mockCheckAuth = vi.fn();
let mockSearchParams = new URLSearchParams('token=reset-token');

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom'
    );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams, vi.fn()],
  };
});

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ checkAuth: mockCheckAuth }),
}));

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams('token=reset-token');
    (emailService.resetPassword as Mock).mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
    });
  });

  it('shows an error and disables the inputs and submit when no token is present', async () => {
    mockSearchParams = new URLSearchParams();

    render(<ResetPasswordPage />);

    expect(
      await screen.findByText('Invalid or missing reset token')
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('New Password')).toBeDisabled();
    expect(screen.getByPlaceholderText('Confirm New Password')).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Reset Password' })
    ).toBeDisabled();
  });

  it('rejects mismatched passwords without calling the API', async () => {
    const user = userEvent.setup();

    render(<ResetPasswordPage />);

    await user.type(screen.getByPlaceholderText('New Password'), 'password123');
    await user.type(
      screen.getByPlaceholderText('Confirm New Password'),
      'different456'
    );
    await user.click(screen.getByRole('button', { name: 'Reset Password' }));

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(emailService.resetPassword).not.toHaveBeenCalled();
  });

  it('rejects a too-short password without calling the API', async () => {
    const user = userEvent.setup();

    render(<ResetPasswordPage />);

    await user.type(screen.getByPlaceholderText('New Password'), 'short');
    await user.type(
      screen.getByPlaceholderText('Confirm New Password'),
      'short'
    );
    await user.click(screen.getByRole('button', { name: 'Reset Password' }));

    expect(
      screen.getByText('Password must be at least 8 characters long')
    ).toBeInTheDocument();
    expect(emailService.resetPassword).not.toHaveBeenCalled();
  });

  it('resets the password, shows the success message, and navigates after the timeout', async () => {
    const user = userEvent.setup();

    render(<ResetPasswordPage />);

    await user.type(
      screen.getByPlaceholderText('New Password'),
      'newpassword123'
    );
    await user.type(
      screen.getByPlaceholderText('Confirm New Password'),
      'newpassword123'
    );
    await user.click(screen.getByRole('button', { name: 'Reset Password' }));

    await waitFor(() =>
      expect(emailService.resetPassword).toHaveBeenCalledWith({
        token: 'reset-token',
        password: 'newpassword123',
      })
    );
    expect(mockCheckAuth).toHaveBeenCalled();
    expect(
      await screen.findByText(/Your password has been reset\./)
    ).toBeInTheDocument();

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/tonight'), {
      timeout: 2500,
    });
  });
});
