import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import type { Mock } from 'vitest';
import { useAuth } from '../../../hooks/useAuth';
import AppRoutes from '../Routes';

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@pairflix/components', async () => ({
  ...(await vi.importActual('@pairflix/components')),
  AppLayout: function AppLayoutMock({ children }: { children: ReactNode }) {
    return <div>{children}</div>;
  },
}));

vi.mock('../../../features/landing/LandingPage', () => ({
  default: function LandingPageMock() {
    return <div>Landing Page</div>;
  },
}));

vi.mock('../../../features/tonight/TonightPicker', () => ({
  default: function TonightPickerMock() {
    return <div>Tonight Picker</div>;
  },
}));

vi.mock('../../../features/auth/LoginPage', () => ({
  default: function LoginPageMock() {
    return <div>Login Page</div>;
  },
}));

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

const authState = (overrides: Record<string, unknown>) => ({
  user: null,
  isLoading: false,
  error: null,
  logout: vi.fn(),
  checkAuth: vi.fn(),
  isAuthenticated: false,
  ...overrides,
});

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
      <LocationDisplay />
    </MemoryRouter>
  );

describe('AppRoutes route guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ProtectedRoute', () => {
    it('redirects an unauthenticated visitor to /login', async () => {
      (useAuth as Mock).mockReturnValue(
        authState({ isAuthenticated: false, isLoading: false })
      );
      renderAt('/tonight');

      await waitFor(() => {
        expect(screen.getByTestId('location')).toHaveTextContent('/login');
      });
      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Tonight Picker')).not.toBeInTheDocument();
    });

    it('shows the loading placeholder while auth is resolving', () => {
      (useAuth as Mock).mockReturnValue(
        authState({ isAuthenticated: false, isLoading: true })
      );
      renderAt('/tonight');

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Tonight Picker')).not.toBeInTheDocument();
    });

    it('renders the protected element for an authenticated visitor', () => {
      (useAuth as Mock).mockReturnValue(
        authState({
          isAuthenticated: true,
          user: { id: 'u1', username: 'testuser' },
        })
      );
      renderAt('/tonight');

      expect(screen.getByText('Tonight Picker')).toBeInTheDocument();
      expect(screen.getByTestId('location')).toHaveTextContent('/tonight');
    });
  });

  describe('LandingRoute', () => {
    it('redirects an authenticated visitor from / to /tonight', async () => {
      (useAuth as Mock).mockReturnValue(
        authState({
          isAuthenticated: true,
          user: { id: 'u1', username: 'testuser' },
        })
      );
      renderAt('/');

      await waitFor(() => {
        expect(screen.getByTestId('location')).toHaveTextContent('/tonight');
      });
      expect(screen.getByText('Tonight Picker')).toBeInTheDocument();
      expect(screen.queryByText('Landing Page')).not.toBeInTheDocument();
    });

    it('renders the landing page for a guest at /', () => {
      (useAuth as Mock).mockReturnValue(authState({ isAuthenticated: false }));
      renderAt('/');

      expect(screen.getByText('Landing Page')).toBeInTheDocument();
      expect(screen.getByTestId('location')).toHaveTextContent('/');
    });
  });

  describe('LogoutRoute', () => {
    it('calls logout exactly once even across re-renders', async () => {
      const logoutSpy = vi.fn();
      (useAuth as Mock).mockImplementation(() =>
        authState({ logout: () => logoutSpy() })
      );

      const tree = () => (
        <MemoryRouter initialEntries={['/logout']}>
          <AppRoutes />
          <LocationDisplay />
        </MemoryRouter>
      );

      const { rerender } = render(tree());

      await waitFor(() => {
        expect(logoutSpy).toHaveBeenCalledTimes(1);
      });
      expect(screen.getByText('Logging out...')).toBeInTheDocument();

      rerender(tree());
      rerender(tree());

      expect(logoutSpy).toHaveBeenCalledTimes(1);
    });
  });
});
