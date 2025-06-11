import {
  AppLayout,
  ErrorBoundary,
  QueryErrorBoundary,
} from '@pairflix/components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import AppSessionManager from './components/common/AppSessionManager';
import { createAdminNavigation } from './config/navigation';
import { SettingsProvider } from './contexts/SettingsContext';
import { useAuth } from './hooks/useAuth';
import AppRoutes from './routes/AppRoutes';
import { ThemeProvider } from './styles/ThemeProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
      cacheTime: 1000 * 60 * 30, // Cache is kept for 30 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry on 401/403 errors
        if (
          error instanceof Error &&
          error.message.includes('Authentication required')
        ) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
    },
  },
});

function AppWithAuth() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigation = createAdminNavigation(user, logout);

  return (
    <AppLayout
      variant="admin"
      navigation={isAuthenticated ? navigation : undefined}
      sidebar={isAuthenticated ? { collapsible: true } : undefined}
    >
      {/* SessionManager enforces session timeout settings */}
      <AppSessionManager />
      <AppRoutes />
    </AppLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <QueryErrorBoundary>
            <SettingsProvider>
              <ThemeProvider>
                <AppWithAuth />
              </ThemeProvider>
            </SettingsProvider>
          </QueryErrorBoundary>
        </QueryClientProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
