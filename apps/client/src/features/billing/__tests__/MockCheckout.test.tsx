import userEvent from '@testing-library/user-event';
import { QueryClient } from '@tanstack/react-query';
import type { Mock } from 'vitest';
import { billing } from '../../../services/api';
import { act, render, screen, waitFor } from '../../../tests/setup';
import MockCheckout from '../MockCheckout';

const mockNavigate = vi.fn();
let mockSearchParams = new URLSearchParams('household=household-1');

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

describe('MockCheckout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams('household=household-1');
    (billing.mockActivate as Mock).mockResolvedValue({ ok: true });
  });

  it('warns and disables the button when the household id is missing', () => {
    mockSearchParams = new URLSearchParams();

    render(<MockCheckout />);

    expect(screen.getByText(/Missing household id/)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
    expect(billing.mockActivate).not.toHaveBeenCalled();
  });

  it('activates, invalidates the entitlements query, and navigates on success', async () => {
    const user = userEvent.setup();
    const invalidateSpy = vi.spyOn(QueryClient.prototype, 'invalidateQueries');

    render(<MockCheckout />);

    await user.click(screen.getByRole('button'));

    await waitFor(() =>
      expect(billing.mockActivate).toHaveBeenCalledWith('household-1')
    );
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['entitlements', 'household-1'],
    });

    invalidateSpy.mockRestore();
  });

  it('renders the error message when activation fails', async () => {
    const user = userEvent.setup();
    (billing.mockActivate as Mock).mockRejectedValue(
      new Error('Activation failed')
    );

    render(<MockCheckout />);

    await user.click(screen.getByRole('button'));

    expect(await screen.findByText('Activation failed')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows a pending label while activation is in flight', async () => {
    const user = userEvent.setup();
    let resolveActivate!: (value: { ok: true }) => void;
    (billing.mockActivate as Mock).mockImplementation(
      () =>
        new Promise<{ ok: true }>(resolve => {
          resolveActivate = resolve;
        })
    );

    render(<MockCheckout />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Pay £4.99 / month');

    await user.click(button);

    await waitFor(() =>
      expect(screen.getByRole('button')).toHaveTextContent('Activating…')
    );
    expect(screen.getByRole('button')).toBeDisabled();

    await act(async () => {
      resolveActivate({ ok: true });
    });

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
  });
});
