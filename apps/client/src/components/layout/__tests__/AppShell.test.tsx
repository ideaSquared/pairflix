import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { Mock } from 'vitest';
import { useAuth } from '../../../hooks/useAuth';
import { expectNoAxeViolations } from '../../../tests/axe';
import AppRoutes from '../Routes';

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// The shell is under test here, not the page inside it -- each page has its own axe check.
vi.mock('../../../features/history/HistoryPage', () => ({
  default: function HistoryPageStub() {
    return <h1>History</h1>;
  },
}));

describe('signed-in app shell', () => {
  it('has no accessibility violations (axe): navigation, user menu trigger and footer', async () => {
    (useAuth as Mock).mockReturnValue({
      user: { id: 'user-1', username: 'testuser' },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    const { baseElement } = render(
      <MemoryRouter initialEntries={['/history']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(
      await screen.findByRole('heading', { name: 'History' })
    ).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    await expectNoAxeViolations(baseElement);
  });
});
