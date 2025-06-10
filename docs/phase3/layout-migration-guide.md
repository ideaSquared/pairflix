# Layout Migration Guide

_Phase 3: Cross-Application Layout Standardization_

## Overview

This guide provides step-by-step instructions for migrating from the current application-specific layout components to the standardized `AppLayout` component from the shared component library.

## Migration Strategy

### Phase 1: Preparation
1. Update the shared component library
2. Review current layout implementations
3. Plan navigation configurations
4. Set up testing environment

### Phase 2: Client Application Migration
1. Install updated component library
2. Create navigation configuration
3. Replace Layout component
4. Update route structure
5. Test and validate

### Phase 3: Admin Application Migration
1. Create admin navigation configuration
2. Replace AdminLayout component
3. Update admin route structure
4. Test sidebar functionality
5. Validate responsive behavior

### Phase 4: Cleanup
1. Remove old layout components
2. Update imports
3. Clean up unused code
4. Final testing

## Client Application Migration

### Step 1: Update Component Library

```bash
cd app.client
npm install @pairflix/components@latest
```

### Step 2: Create Navigation Configuration

Create a new file `app.client/src/config/navigation.ts`:

```typescript
import React from 'react';
import { NavigationConfig } from '@pairflix/components';

export const createClientNavigation = (user?: { name: string }): NavigationConfig => ({
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
  logo: React.createElement('h1', { 
    style: { margin: 0, fontWeight: 'bold', fontSize: '1.5rem' } 
  }, 'PairFlix'),
  user: user ? {
    name: user.name,
    initials: user.name.charAt(0).toUpperCase(),
    menu: [
      {
        key: 'settings',
        label: 'Settings',
        path: '/settings',
        icon: React.createElement('i', { className: 'fas fa-cog' }),
      },
      {
        key: 'logout',
        label: 'Logout',
        path: '/logout',
        icon: React.createElement('i', { className: 'fas fa-sign-out-alt' }),
      },
    ],
  } : undefined,
});
```

### Step 3: Update App.tsx

Replace the current layout implementation:

```typescript
// Before
import { Layout } from './components/layout/Layout';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Layout>
        <Routes>
          {/* routes */}
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}
```

```typescript
// After
import { AppLayout } from '@pairflix/components';
import { createClientNavigation } from './config/navigation';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user } = useAuth();
  const navigation = createClientNavigation(user);

  return (
    <ThemeProvider theme={theme}>
      <AppLayout 
        variant="client" 
        navigation={navigation}
        footer={{ show: true, content: <div>© 2024 PairFlix</div> }}
      >
        <Routes>
          {/* routes */}
        </Routes>
      </AppLayout>
    </ThemeProvider>
  );
}
```

### Step 4: Update Route Components

For pages that need custom container behavior:

```typescript
// Before
import { Container } from '../components/layout/Layout';

const WatchlistPage = () => (
  <Container maxWidth="lg">
    <h1>My Watchlist</h1>
    {/* content */}
  </Container>
);
```

```typescript
// After
import { PageContainer } from '@pairflix/components';

const WatchlistPage = () => (
  <PageContainer maxWidth="lg" padding="xl">
    <h1>My Watchlist</h1>
    {/* content */}
  </PageContainer>
);
```

### Step 5: Remove Old Layout Components

After testing, remove:
- `app.client/src/components/layout/Layout.tsx`
- `app.client/src/components/layout/Header.tsx`
- Any custom layout utilities that are now in the shared library

## Admin Application Migration

### Step 1: Create Admin Navigation Configuration

Create `app.admin/src/config/navigation.ts`:

```typescript
import React from 'react';
import { NavigationConfig } from '@pairflix/components';

export const createAdminNavigation = (user?: { username: string }): NavigationConfig => ({
  sections: [
    {
      items: [
        {
          key: 'dashboard',
          label: 'Dashboard',
          path: '/',
          icon: React.createElement('i', { className: 'fas fa-tachometer-alt' }),
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
          icon: React.createElement('i', { className: 'fas fa-clipboard-list' }),
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
  logo: React.createElement('h3', { 
    style: { margin: 0, fontWeight: 'bold' } 
  }, 'PairFlix Admin'),
  user: user ? {
    name: user.username,
    initials: user.username.charAt(0).toUpperCase(),
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
  } : undefined,
});
```

### Step 2: Update Admin App.tsx

```typescript
// Before
import { AdminLayout } from './layouts/AdminLayout';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AdminLayout>
        <Routes>
          {/* routes */}
        </Routes>
      </AdminLayout>
    </ThemeProvider>
  );
}
```

```typescript
// After
import { AppLayout } from '@pairflix/components';
import { createAdminNavigation } from './config/navigation';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user } = useAuth();
  const navigation = createAdminNavigation(user);

  return (
    <ThemeProvider theme={theme}>
      <AppLayout 
        variant="admin"
        navigation={navigation}
        sidebar={{ 
          collapsible: true, 
          defaultCollapsed: false 
        }}
      >
        <Routes>
          {/* routes */}
        </Routes>
      </AppLayout>
    </ThemeProvider>
  );
}
```

### Step 3: Update Admin Page Components

```typescript
// Before - using multiple layout components
import { AdminLayout } from '../components/AdminLayout';
import { Container } from '@pairflix/components';

const UsersPage = () => (
  <Container>
    <h1>User Management</h1>
    {/* content */}
  </Container>
);
```

```typescript
// After - using standardized PageContainer
import { PageContainer } from '@pairflix/components';

const UsersPage = () => (
  <PageContainer maxWidth="xl" padding="lg">
    <h1>User Management</h1>
    {/* content */}
  </PageContainer>
);
```

### Step 4: Remove Old Admin Layout Components

After testing, remove:
- `app.admin/src/layouts/AdminLayout.tsx`
- `app.admin/src/components/layout/Layout.tsx`
- `app.admin/src/features/admin/components/AdminLayout.tsx`
- `app.admin/src/components/layout/Header.tsx`

## Navigation Handling

### Active State Management

The new AppLayout automatically handles active states based on the current path. However, if you need custom active state logic:

```typescript
import { useLocation } from 'react-router-dom';

const useNavigationState = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  return { isActive };
};
```

### Click Handlers

Replace navigation click handlers with React Router's `useNavigate`:

```typescript
// Before
const handleNavigation = (path: string) => {
  window.location.href = path;
};
```

```typescript
// After
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// In navigation config
{
  key: 'watchlist',
  label: 'My Watchlist',
  path: '/watchlist',
  onClick: () => navigate('/watchlist'),
}
```

## Testing Migration

### Unit Tests

Test the new layout components:

```typescript
import { render, screen } from '@testing-library/react';
import { AppLayout } from '@pairflix/components';
import { ThemeProvider } from 'styled-components';
import { theme } from '../styles/theme';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe('AppLayout Migration', () => {
  it('renders client layout correctly', () => {
    const navigation = {
      sections: [
        {
          items: [
            { key: 'test', label: 'Test', path: '/test' }
          ]
        }
      ]
    };

    render(
      <TestWrapper>
        <AppLayout variant="client" navigation={navigation}>
          <div>Test Content</div>
        </AppLayout>
      </TestWrapper>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('renders admin layout with sidebar', () => {
    const navigation = {
      sections: [
        {
          title: 'Management',
          items: [
            { key: 'users', label: 'Users', path: '/users' }
          ]
        }
      ]
    };

    render(
      <TestWrapper>
        <AppLayout variant="admin" navigation={navigation}>
          <div>Admin Content</div>
        </AppLayout>
      </TestWrapper>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
    expect(screen.getByText('Management')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });
});
```

### Integration Tests

Test navigation functionality:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

describe('Navigation Integration', () => {
  it('navigates correctly in client app', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    const watchlistLink = screen.getByText('My Watchlist');
    fireEvent.click(watchlistLink);
    
    expect(window.location.pathname).toBe('/watchlist');
  });
});
```

### Visual Regression Tests

Use tools like Chromatic or Percy to ensure visual consistency:

```typescript
// .storybook/stories/AppLayout.stories.tsx
import { AppLayout } from '@pairflix/components';
import { clientNavigationConfig, adminNavigationConfig } from '../examples/navigationConfigs';

export default {
  title: 'Layout/AppLayout',
  component: AppLayout,
};

export const ClientLayout = () => (
  <AppLayout variant="client" navigation={clientNavigationConfig}>
    <div style={{ padding: '2rem' }}>
      <h1>Client Application Content</h1>
      <p>This is the main content area for the client application.</p>
    </div>
  </AppLayout>
);

export const AdminLayout = () => (
  <AppLayout variant="admin" navigation={adminNavigationConfig}>
    <div style={{ padding: '2rem' }}>
      <h1>Admin Dashboard</h1>
      <p>This is the main content area for the admin application.</p>
    </div>
  </AppLayout>
);
```

## Common Issues and Solutions

### Issue: Icons Not Displaying

**Problem**: FontAwesome icons not showing in navigation

**Solution**: Ensure FontAwesome is properly loaded:

```typescript
// In your HTML head or component
import '@fortawesome/fontawesome-free/css/all.css';

// Or use React FontAwesome components
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

{
  key: 'users',
  label: 'Users',
  path: '/users',
  icon: <FontAwesomeIcon icon={faUsers} />
}
```

### Issue: Theme Colors Not Applied

**Problem**: Layout components not using theme colors

**Solution**: Ensure ThemeProvider wraps the AppLayout:

```typescript
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';

<ThemeProvider theme={theme}>
  <AppLayout variant="client" navigation={navigation}>
    {/* content */}
  </AppLayout>
</ThemeProvider>
```

### Issue: Mobile Navigation Not Working

**Problem**: Mobile menu button not visible or functional

**Solution**: Check CSS for the mobile menu toggle:

```css
/* Ensure this CSS is included */
@media (max-width: 768px) {
  .mobile-menu-toggle {
    display: flex !important;
  }
}
```

### Issue: Responsive Breakpoints Different

**Problem**: New breakpoints don't match existing designs

**Solution**: Update your CSS to use the new standardized breakpoints:

```typescript
import { media } from '@pairflix/components';

const ResponsiveComponent = styled.div`
  @media ${media.mobile} {
    font-size: 14px;
  }
  
  @media ${media.desktop} {
    font-size: 16px;
  }
`;
```

## Performance Considerations

### Bundle Size

The new AppLayout component is designed to be tree-shakeable. Only import what you need:

```typescript
// Good - only imports AppLayout
import { AppLayout } from '@pairflix/components';

// Avoid - imports entire library
import * as Components from '@pairflix/components';
```

### Code Splitting

Consider lazy loading navigation configurations:

```typescript
const adminNavigation = React.lazy(() => import('./config/adminNavigation'));
```

### Memoization

Memoize navigation configurations to prevent unnecessary re-renders:

```typescript
import { useMemo } from 'react';

const App = () => {
  const { user } = useAuth();
  
  const navigation = useMemo(() => 
    createClientNavigation(user), 
    [user]
  );
  
  return (
    <AppLayout variant="client" navigation={navigation}>
      {/* content */}
    </AppLayout>
  );
};
```

## Rollback Plan

If issues arise during migration:

1. **Keep old components**: Don't delete old layout components until migration is complete
2. **Feature flags**: Use environment variables to toggle between old and new layouts
3. **Gradual rollout**: Migrate one route at a time

```typescript
const useNewLayout = process.env.REACT_APP_USE_NEW_LAYOUT === 'true';

return useNewLayout ? (
  <AppLayout variant="client" navigation={navigation}>
    {children}
  </AppLayout>
) : (
  <LegacyLayout>
    {children}
  </LegacyLayout>
);
```

## Next Steps

After successful migration:

1. **Monitor performance**: Track bundle size and runtime performance
2. **Gather feedback**: Get developer feedback on the new layout system
3. **Iterate**: Make improvements based on usage patterns
4. **Document patterns**: Create additional documentation for common use cases

---

*This migration guide will be updated as we discover new patterns and solutions during the implementation process.* 