import { NavigationConfig } from '@pairflix/components';
import React from 'react';

/**
 * Create navigation configuration for the PairFlix client application
 * @param user - Current authenticated user
 * @param onLogout - Logout handler function
 * @returns Navigation configuration for AppLayout
 */
export const createClientNavigation = (
  user?: { name: string; id: string },
  onLogout?: () => void
): NavigationConfig => {
  const menuItems = [
    {
      key: 'settings',
      label: 'Settings',
      path: '/settings',
      icon: React.createElement('i', { className: 'fas fa-cog' }),
    },
  ];

  if (onLogout) {
    menuItems.push({
      key: 'logout',
      label: 'Logout',
      path: '/logout',
      icon: React.createElement('i', {
        className: 'fas fa-sign-out-alt',
      }),
    });
  }

  const config: NavigationConfig = {
    sections: [
      {
        items: [
          {
            key: 'watchlist',
            label: 'My Watchlist',
            path: '/watchlist',
            icon: React.createElement('i', { className: 'fas fa-list' }),
          },
          {
            key: 'matches',
            label: 'Matches',
            path: '/matches',
            icon: React.createElement('i', { className: 'fas fa-heart' }),
          },
          {
            key: 'activity',
            label: 'Activity',
            path: '/activity',
            icon: React.createElement('i', { className: 'fas fa-chart-line' }),
          },
          {
            key: 'profile',
            label: 'Profile',
            path: '/profile',
            icon: React.createElement('i', { className: 'fas fa-user' }),
          },
        ],
      },
    ],
    logo: React.createElement(
      'h1',
      {
        style: {
          margin: 0,
          fontWeight: 'bold',
          fontSize: '1.5rem',
          cursor: 'pointer',
        },
      },
      'PairFlix'
    ),
  };

  if (user) {
    config.user = {
      name: user.name,
      initials: user.name.charAt(0).toUpperCase(),
      menu: menuItems,
    };
  }

  return config;
};

// Alternative configuration for when user is not authenticated
export const createGuestNavigation = (): NavigationConfig => ({
  sections: [
    {
      items: [
        {
          key: 'login',
          label: 'Login',
          path: '/login',
          icon: React.createElement('i', { className: 'fas fa-sign-in-alt' }),
        },
      ],
    },
  ],
  logo: React.createElement(
    'h1',
    {
      style: {
        margin: 0,
        fontWeight: 'bold',
        fontSize: '1.5rem',
        cursor: 'pointer',
      },
    },
    'PairFlix'
  ),
});
