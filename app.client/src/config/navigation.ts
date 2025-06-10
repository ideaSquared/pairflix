import { NavigationConfig } from '@pairflix/components';
import React from 'react';
import {
  HiArrowLeftOnRectangle,
  HiArrowRightOnRectangle,
  HiChartBarSquare,
  HiHeart,
  HiListBullet,
  HiUser,
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
  const menuItems: NavigationItemWithCallback[] = [];

  if (onLogout) {
    menuItems.push({
      key: 'logout',
      label: 'Logout',
      path: '/logout',
      icon: React.createElement(HiArrowRightOnRectangle),
      onSelect: () => {
        onLogout();
      },
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
            icon: React.createElement(HiListBullet),
          },
          {
            key: 'matches',
            label: 'Matches',
            path: '/matches',
            icon: React.createElement(HiHeart),
          },
          {
            key: 'activity',
            label: 'Activity',
            path: '/activity',
            icon: React.createElement(HiChartBarSquare),
          },
          {
            key: 'profile',
            label: 'Profile',
            path: '/profile',
            icon: React.createElement(HiUser),
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
          icon: React.createElement(HiArrowLeftOnRectangle),
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
