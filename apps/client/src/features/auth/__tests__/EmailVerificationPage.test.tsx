import userEvent from '@testing-library/user-event';
import type { Mock } from 'vitest';
import { emailService } from '../../../services/api';
import { act, render, screen, waitFor } from '../../../tests/setup';
import EmailVerificationPage from '../EmailVerificationPage';

const mockNavigate = vi.fn();
const mockCheckAuth = vi.fn();
let mockSearchParams = new URLSearchParams();

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
  useAuth: () => ({ checkAuth: mockCheckAuth, isAuthenticated: false }),
}));

describe('EmailVerificationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    (emailService.verifyEmail as Mock).mockResolvedValue({ verified: true });
    (emailService.resendVerification as Mock).mockResolvedValue({ sent: true });
  });

  it('verifies the token on mount, showing the loading state then the success state', async () => {
    let resolveVerify!: (value: { verified: boolean }) => void;
    (emailService.verifyEmail as Mock).mockImplementation(
      () =>
        new Promise<{ verified: boolean }>(resolve => {
          resolveVerify = resolve;
        })
    );
    mockSearchParams = new URLSearchParams('token=valid-token');

    render(<EmailVerificationPage />);

    expect(await screen.findByText('Verifying Email...')).toBeInTheDocument();
    expect(emailService.verifyEmail).toHaveBeenCalledWith({
      token: 'valid-token',
    });

    await act(async () => {
      resolveVerify({ verified: true });
    });

    expect(screen.getByText('Email Verified!')).toBeInTheDocument();
    expect(
      screen.getByText('Your email has been verified.')
    ).toBeInTheDocument();
    expect(mockCheckAuth).toHaveBeenCalled();
  });

  it('reveals a resend form on an expired-token error and resends the verification email', async () => {
    const user = userEvent.setup();
    mockSearchParams = new URLSearchParams('token=expired-token');
    (emailService.verifyEmail as Mock).mockRejectedValue(
      new Error('Verification token has expired')
    );

    render(<EmailVerificationPage />);

    expect(await screen.findByText('Verification Failed')).toBeInTheDocument();
    expect(
      screen.getByText('Verification token has expired')
    ).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Email'), 'user@example.com');
    await user.click(
      screen.getByRole('button', { name: 'Send New Verification Email' })
    );

    await waitFor(() =>
      expect(emailService.resendVerification).toHaveBeenCalledWith({
        email: 'user@example.com',
      })
    );

    expect(
      await screen.findByText(
        'If that address is registered, a new link is on its way.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Verification Failed')).toBeInTheDocument();
    expect(screen.queryByText('Email Verified!')).not.toBeInTheDocument();
  });

  it('stays on the expired screen while resending instead of showing the verify loader', async () => {
    const user = userEvent.setup();
    mockSearchParams = new URLSearchParams('token=expired-token');
    (emailService.verifyEmail as Mock).mockRejectedValue(
      new Error('Verification token has expired')
    );
    let resolveResend!: (value: { sent: boolean }) => void;
    (emailService.resendVerification as Mock).mockImplementation(
      () =>
        new Promise<{ sent: boolean }>(resolve => {
          resolveResend = resolve;
        })
    );

    render(<EmailVerificationPage />);

    expect(await screen.findByText('Verification Failed')).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText('Email'), 'user@example.com');
    await user.click(
      screen.getByRole('button', { name: 'Send New Verification Email' })
    );

    expect(screen.queryByText('Verifying Email...')).not.toBeInTheDocument();
    expect(screen.getByText('Verification Failed')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Sending...' })
    ).toBeInTheDocument();

    await act(async () => {
      resolveResend({ sent: true });
    });

    expect(
      screen.getByText(
        'If that address is registered, a new link is on its way.'
      )
    ).toBeInTheDocument();
  });

  it('surfaces a resend error inline without hiding the resend form', async () => {
    const user = userEvent.setup();
    mockSearchParams = new URLSearchParams('token=expired-token');
    (emailService.verifyEmail as Mock).mockRejectedValue(
      new Error('Verification token has expired')
    );

    render(<EmailVerificationPage />);

    expect(await screen.findByText('Verification Failed')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Send New Verification Email' })
    );

    expect(
      screen.getByText(
        'Enter your email address to resend the verification link'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Send New Verification Email' })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(emailService.resendVerification).not.toHaveBeenCalled();
  });

  it('shows an invalid-token message when no token is present in the URL', async () => {
    mockSearchParams = new URLSearchParams();

    render(<EmailVerificationPage />);

    expect(
      await screen.findByText('Invalid or missing verification token')
    ).toBeInTheDocument();
    expect(emailService.verifyEmail).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('button', { name: 'Send New Verification Email' })
    ).not.toBeInTheDocument();
  });
});
