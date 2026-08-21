import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { lightThemeClass, themeRoot } from '../../../styles/theme.css';
import AppLayout, { type NavigationConfig } from './AppLayout';

// AppLayout renders react-router-dom <Link>s, so it must live inside a router.
// Router goes inside the theme root so the subject still reads the theme vars.
const renderLayout = (ui: ReactElement) =>
  render(
    <div className={`${lightThemeClass} ${themeRoot}`}>
      <MemoryRouter>{ui}</MemoryRouter>
    </div>
  );

const clientNav: NavigationConfig = {
  logo: <span data-testid="logo">Pairflix</span>,
  sections: [
    {
      title: 'Primary',
      items: [
        { key: 'home', label: 'Home', path: '/' },
        { key: 'browse', label: 'Browse', path: '/browse' },
      ],
    },
  ],
};

const adminNav: NavigationConfig = {
  sections: [
    {
      title: 'Main',
      items: [
        { key: 'dashboard', label: 'Dashboard', path: '/admin' },
        { key: 'users', label: 'Users', path: '/admin/users' },
      ],
    },
  ],
};

const userMenuNav = (
  profileOnSelect: () => void,
  logoutOnSelect: () => void
): NavigationConfig => ({
  sections: [{ items: [{ key: 'home', label: 'Home', path: '/' }] }],
  user: {
    name: 'Jane Doe',
    menu: [
      {
        key: 'profile',
        label: 'Profile',
        path: '/profile',
        onSelect: profileOnSelect,
      },
      {
        key: 'logout',
        label: 'Log out',
        path: '/logout',
        onSelect: logoutOnSelect,
      },
    ],
  },
});

describe('AppLayout', () => {
  describe('variant="client"', () => {
    it('renders the top navigation with links and logo', () => {
      renderLayout(
        <AppLayout variant="client" navigation={clientNav}>
          client body
        </AppLayout>
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();

      const home = screen.getByRole('link', { name: 'Home' });
      expect(home).toHaveAttribute('href', '/');
      expect(screen.getByRole('link', { name: 'Browse' })).toHaveAttribute(
        'href',
        '/browse'
      );

      expect(screen.getByTestId('logo')).toBeInTheDocument();
      expect(screen.getByText('client body')).toBeInTheDocument();

      // The top nav flattens sections into a link row and never renders the
      // section title -- that is a sidebar-only affordance.
      expect(screen.queryByText('Primary')).not.toBeInTheDocument();
      // The top nav is a header banner, not the admin sidebar aside.
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    });
  });

  describe('variant="admin"', () => {
    it('renders the sidebar navigation with section title and links', () => {
      renderLayout(
        <AppLayout variant="admin" navigation={adminNav}>
          admin body
        </AppLayout>
      );

      // Section titles are rendered by the sidebar (and only the sidebar).
      expect(screen.getByText('Main')).toBeInTheDocument();

      expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
        'href',
        '/admin'
      );
      expect(screen.getByRole('link', { name: 'Users' })).toHaveAttribute(
        'href',
        '/admin/users'
      );

      expect(screen.getByRole('complementary')).toBeInTheDocument();
      expect(screen.getByText('admin body')).toBeInTheDocument();
      // No header config passed, so there is no banner in this admin layout.
      expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    });
  });

  describe('hasNavigation gates the header', () => {
    it('omits the header when no navigation is provided (client)', () => {
      renderLayout(<AppLayout variant="client">bare body</AppLayout>);

      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(screen.queryByRole('banner')).not.toBeInTheDocument();
      expect(screen.getByText('bare body')).toBeInTheDocument();
    });

    it('omits the header when navigation has no sections (client)', () => {
      renderLayout(
        <AppLayout variant="client" navigation={{ sections: [] }}>
          empty-sections body
        </AppLayout>
      );

      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
      expect(screen.queryByRole('banner')).not.toBeInTheDocument();
      expect(screen.getByText('empty-sections body')).toBeInTheDocument();
    });
  });

  describe('user dropdown onSelect', () => {
    it('fires onSelect when the logout item is selected', async () => {
      const user = userEvent.setup();
      const profileOnSelect = vi.fn();
      const logoutOnSelect = vi.fn();

      renderLayout(
        <AppLayout
          variant="client"
          navigation={userMenuNav(profileOnSelect, logoutOnSelect)}
        >
          body
        </AppLayout>
      );

      await user.click(screen.getByRole('button', { name: /Jane Doe/ }));
      await waitFor(() =>
        expect(screen.getByText('Log out')).toBeInTheDocument()
      );

      await user.click(screen.getByText('Log out'));

      expect(logoutOnSelect).toHaveBeenCalledTimes(1);
      expect(profileOnSelect).not.toHaveBeenCalled();
    });

    it('does not fire onSelect for a non-logout item', async () => {
      const user = userEvent.setup();
      const profileOnSelect = vi.fn();
      const logoutOnSelect = vi.fn();

      renderLayout(
        <AppLayout
          variant="client"
          navigation={userMenuNav(profileOnSelect, logoutOnSelect)}
        >
          body
        </AppLayout>
      );

      await user.click(screen.getByRole('button', { name: /Jane Doe/ }));
      await waitFor(() =>
        expect(screen.getByText('Profile')).toBeInTheDocument()
      );

      await user.click(screen.getByText('Profile'));

      // handleMenuItemClick only forwards to item.onSelect for key === 'logout',
      // so a profile item's own onSelect is intentionally never invoked.
      expect(profileOnSelect).not.toHaveBeenCalled();
      expect(logoutOnSelect).not.toHaveBeenCalled();
    });
  });
});
