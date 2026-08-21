import userEvent from '@testing-library/user-event';
import type { Mock } from 'vitest';
import { emailService } from '../../../services/api';
import { act, render, screen, waitFor } from '../../../tests/setup';
import ForgotPasswordPage from '../ForgotPasswordPage';

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (emailService.forgotPassword as Mock).mockResolvedValue({ sent: true });
  });

  it('submits the address and shows the privacy-preserving confirmation', async () => {
    const user = userEvent.setup();

    render(<ForgotPasswordPage />);

    await user.type(screen.getByPlaceholderText('Email'), 'user@example.com');
    await user.click(screen.getByRole('button', { name: 'Send Reset Link' }));

    await waitFor(() =>
      expect(emailService.forgotPassword).toHaveBeenCalledWith({
        email: 'user@example.com',
      })
    );
    expect(
      await screen.findByText(
        'If that address is registered, a reset link is on its way.'
      )
    ).toBeInTheDocument();
  });

  it('renders the error message when the request is rejected', async () => {
    const user = userEvent.setup();
    (emailService.forgotPassword as Mock).mockRejectedValue(
      new Error('Too many requests')
    );

    render(<ForgotPasswordPage />);

    await user.type(screen.getByPlaceholderText('Email'), 'user@example.com');
    await user.click(screen.getByRole('button', { name: 'Send Reset Link' }));

    expect(await screen.findByText('Too many requests')).toBeInTheDocument();
    expect(
      screen.queryByText(
        'If that address is registered, a reset link is on its way.'
      )
    ).not.toBeInTheDocument();
  });

  it('shows a pending label while the request is in flight', async () => {
    const user = userEvent.setup();
    let resolveForgot!: (value: { sent: boolean }) => void;
    (emailService.forgotPassword as Mock).mockImplementation(
      () =>
        new Promise<{ sent: boolean }>(resolve => {
          resolveForgot = resolve;
        })
    );

    render(<ForgotPasswordPage />);

    await user.type(screen.getByPlaceholderText('Email'), 'user@example.com');
    await user.click(screen.getByRole('button', { name: 'Send Reset Link' }));

    const pendingButton = await screen.findByRole('button', {
      name: 'Sending...',
    });
    expect(pendingButton).toBeDisabled();

    await act(async () => {
      resolveForgot({ sent: true });
    });

    expect(
      screen.getByText(
        'If that address is registered, a reset link is on its way.'
      )
    ).toBeInTheDocument();
  });
});
