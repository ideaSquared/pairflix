import { NavigationConfig } from '@pairflix/components';
import React from 'react';

export const createAdminNavigation = (user?: {
  username: string;
  role: string;
}): NavigationConfig => ({
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
    'h3',
    {
      style: { margin: 0, fontWeight: 'bold', fontSize: '1.25rem' },
    },
    'PairFlix Admin'
  ),
  user: user
    ? {
        name: user.username,
        initials: user.username.charAt(0).toUpperCase(),
        menu: [
          {
            key: 'logout',
            label: 'Logout',
            path: '/logout',
            icon: React.createElement('i', {
              className: 'fas fa-sign-out-alt',
            }),
          },
        ],
      }
    : undefined,
});
