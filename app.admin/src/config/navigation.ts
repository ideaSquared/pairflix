import { NavigationConfig } from '@pairflix/components';
import React from 'react';
import {
  HiArrowRightOnRectangle,
  HiChartBarSquare,
  HiClipboardDocumentList,
  HiCog6Tooth,
  HiFilm,
  HiHeart,
  HiPresentationChartBar,
  HiSquares2X2,
  HiUsers,
} from 'react-icons/hi2';

// Extend the NavigationItem type to include onSelect
interface NavigationItemWithCallback {
  key: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
  children?: NavigationItemWithCallback[];
  badge?: string | number;
  disabled?: boolean;
  onSelect?: () => void;
}

export const createAdminNavigation = (
  user?: {
    username: string;
    role: string;
  },
  onLogout?: () => void
): NavigationConfig => ({
  sections: [
    {
      items: [
        {
          key: 'dashboard',
          label: 'Dashboard',
          path: '/',
          icon: React.createElement(HiSquares2X2),
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
          icon: React.createElement(HiUsers),
        },
        {
          key: 'content',
          label: 'Content',
          path: '/content',
          icon: React.createElement(HiFilm),
        },
        {
          key: 'activity',
          label: 'Activity',
          path: '/activity',
          icon: React.createElement(HiChartBarSquare),
        },
        {
          key: 'logs',
          label: 'Audit Logs',
          path: '/logs',
          icon: React.createElement(HiClipboardDocumentList),
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
          icon: React.createElement(HiHeart),
        },
        {
          key: 'stats',
          label: 'Statistics',
          path: '/stats',
          icon: React.createElement(HiPresentationChartBar),
        },
        {
          key: 'settings',
          label: 'Settings',
          path: '/settings',
          icon: React.createElement(HiCog6Tooth),
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
            icon: React.createElement(HiArrowRightOnRectangle),
            onSelect: onLogout
              ? () => {
                  onLogout();
                }
              : undefined,
          } as NavigationItemWithCallback,
        ],
      }
    : undefined,
});
