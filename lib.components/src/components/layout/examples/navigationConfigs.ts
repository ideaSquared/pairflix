import React from 'react';
import { NavigationConfig } from '../AppLayout/AppLayout';

// Example navigation configuration for client application
export const clientNavigationConfig: NavigationConfig = {
  sections: [
    {
      items: [
        {
          key: 'home',
          label: 'Home',
          path: '/',
          icon: '🏠',
        },
        {
          key: 'watchlist',
          label: 'My Watchlist',
          path: '/watchlist',
          icon: '📋',
        },
        {
          key: 'groups',
          label: 'Groups',
          path: '/groups',
          icon: '🎯',
        },
        {
          key: 'activity',
          label: 'Activity',
          path: '/activity',
          icon: '📈',
        },
        {
          key: 'profile',
          label: 'Profile',
          path: '/profile',
          icon: '👤',
        },
      ],
    },
  ],
  logo: React.createElement(
    'div',
    { style: { fontWeight: 'bold', fontSize: '1.5rem' } },
    'PairFlix'
  ),
  user: {
    name: 'User',
    initials: 'U',
    menu: [
      {
        key: 'settings',
        label: 'Settings',
        path: '/settings',
        icon: '⚙️',
      },
      {
        key: 'logout',
        label: 'Logout',
        path: '/logout',
        icon: '🚪',
      },
    ],
  },
};

// Example navigation configuration for admin application
export const adminNavigationConfig: NavigationConfig = {
  sections: [
    {
      items: [
        {
          key: 'dashboard',
          label: 'Dashboard',
          path: '/',
          icon: '📊',
        },
      ],
    },
    {
      title: 'Management',
      items: [
        {
          key: 'users',
          label: 'Users',
          path: '/users',
          icon: '👥',
        },
        {
          key: 'content',
          label: 'Content',
          path: '/content',
          icon: '🎬',
        },
        {
          key: 'activity',
          label: 'Activity',
          path: '/activity',
          icon: '📈',
        },
        {
          key: 'logs',
          label: 'Audit Logs',
          path: '/logs',
          icon: '📜',
        },
      ],
    },
    {
      title: 'System',
      items: [
        {
          key: 'monitoring',
          label: 'Monitoring',
          path: '/monitoring',
          icon: '❤️',
          badge: 'Live',
        },
        {
          key: 'stats',
          label: 'Statistics',
          path: '/stats',
          icon: '📊',
        },
        {
          key: 'settings',
          label: 'Settings',
          path: '/settings',
          icon: '⚙️',
        },
      ],
    },
  ],
  logo: React.createElement(
    'div',
    { style: { fontWeight: 'bold', fontSize: '1.25rem' } },
    'PairFlix Admin'
  ),
  user: {
    name: 'Admin',
    initials: 'A',
    menu: [
      {
        key: 'profile',
        label: 'Profile',
        path: '/profile',
        icon: '👤',
      },
      {
        key: 'logout',
        label: 'Logout',
        path: '/logout',
        icon: '🚪',
      },
    ],
  },
};

// Helper function to create navigation config with icons
export const createNavigationConfig = (
  sections: {
    title?: string;
    items: {
      key: string;
      label: string;
      path: string;
      icon?: React.ReactNode;
      badge?: string | number;
    }[];
  }[],
  options?: {
    logo?: React.ReactNode;
    user?: {
      name: string;
      avatar?: React.ReactNode;
      initials?: string;
      menu?: {
        key: string;
        label: string;
        path: string;
        icon?: React.ReactNode;
      }[];
    };
  }
): NavigationConfig => {
  return {
    sections,
    ...options,
  };
};

// Example with FontAwesome icons (assuming FontAwesome is available)
export const adminNavigationWithFontAwesome: NavigationConfig = {
  sections: [
    {
      items: [
        {
          key: 'dashboard',
          label: 'Dashboard',
          path: '/',
          icon: React.createElement('i', {
            className: 'fas fa-tachometer-alt',
          }),
        },
      ],
    },
    {
      title: 'Management',
      items: [
        {
          key: 'users',
          label: 'Users',
          path: '/users',
          icon: React.createElement('i', { className: 'fas fa-users' }),
        },
        {
          key: 'content',
          label: 'Content',
          path: '/content',
          icon: React.createElement('i', { className: 'fas fa-film' }),
        },
        {
          key: 'activity',
          label: 'Activity',
          path: '/activity',
          icon: React.createElement('i', { className: 'fas fa-chart-line' }),
        },
        {
          key: 'logs',
          label: 'Audit Logs',
          path: '/logs',
          icon: React.createElement('i', {
            className: 'fas fa-clipboard-list',
          }),
        },
      ],
    },
    {
      title: 'System',
      items: [
        {
          key: 'monitoring',
          label: 'Monitoring',
          path: '/monitoring',
          icon: React.createElement('i', { className: 'fas fa-heartbeat' }),
        },
        {
          key: 'stats',
          label: 'Statistics',
          path: '/stats',
          icon: React.createElement('i', { className: 'fas fa-chart-bar' }),
        },
        {
          key: 'settings',
          label: 'Settings',
          path: '/settings',
          icon: React.createElement('i', { className: 'fas fa-cog' }),
        },
      ],
    },
  ],
  logo: React.createElement(
    'div',
    { style: { fontWeight: 'bold', fontSize: '1.25rem' } },
    'PairFlix Admin'
  ),
  user: {
    name: 'Admin User',
    initials: 'AU',
    menu: [
      {
        key: 'profile',
        label: 'Profile',
        path: '/profile',
        icon: React.createElement('i', { className: 'fas fa-user' }),
      },
      {
        key: 'logout',
        label: 'Logout',
        path: '/logout',
        icon: React.createElement('i', { className: 'fas fa-sign-out-alt' }),
      },
    ],
  },
};
