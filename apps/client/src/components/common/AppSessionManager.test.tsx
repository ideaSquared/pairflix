import type { Mock } from 'vitest';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../hooks/useAuth';
import { act, render, screen } from '../../tests/setup';
import AppSessionManager from './AppSessionManager';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../contexts/SettingsContext', () => ({
  useSettings: vi.fn(),
}));

const authState = (overrides: Record<string, unknown>) => ({
  user: null,
  isLoading: false,
  error: null,
  logout: vi.fn(),
  checkAuth: vi.fn(),
  isAuthenticated: false,
  ...overrides,
});

describe('AppSessionManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not show an expiry notice for an anonymous visitor', () => {
    (useAuth as Mock).mockReturnValue(authState({ isAuthenticated: false }));
    (useSettings as Mock).mockReturnValue({
      settings: { security: { sessionTimeout: 30 } },
    });

    render(<AppSessionManager />);

    expect(screen.queryByText(/session has expired/i)).not.toBeInTheDocument();
  });

  it('shows an in-app notice (not a browser alert) and logs out once the idle timeout elapses', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const logout = vi.fn();
    (useAuth as Mock).mockReturnValue(
      authState({ isAuthenticated: true, logout })
    );
    (useSettings as Mock).mockReturnValue({
      settings: { security: { sessionTimeout: 1 } }, // 1 minute, to keep the test fast
    });

    vi.useFakeTimers();
    try {
      render(<AppSessionManager />);

      act(() => {
        vi.advanceTimersByTime(60 * 1000);
      });

      expect(logout).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/session has expired/i)).toBeInTheDocument();
      expect(alertSpy).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
      alertSpy.mockRestore();
    }
  });
});
