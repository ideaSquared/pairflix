import { ErrorBoundary, QueryErrorBoundary } from '@pairflix/components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import AppSessionManager from './components/common/AppSessionManager';
import SessionExpiredHandler from './components/common/SessionExpiredHandler';
import DevLogin from './components/dev/DevLogin';
import Routes from './components/layout/Routes';
import { SettingsProvider } from './contexts/SettingsContext';
import { ApiError } from './services/api/utils';
import { ThemeProvider } from './styles/ThemeProvider';

// Client errors (4xx -- bad input, unauthenticated, forbidden, not found, quota exceeded...)
// won't succeed on retry.
export const isClientError = (error: unknown): boolean =>
  error instanceof ApiError && error.status >= 400 && error.status < 500;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
      gcTime: 1000 * 60 * 30, // Cache is kept for 30 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (isClientError(error)) return false;
        // Retry up to 3 times for other (network/server) errors.
        return failureCount < 3;
      },
    },
  },
});

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <QueryErrorBoundary>
            <SettingsProvider>
              <ThemeProvider>
                {' '}
                {/* SessionManager enforces session timeout settings */}
                <AppSessionManager />
                <SessionExpiredHandler />
                <Routes />
                {/* Dev tools - only shows in development mode */}
                <DevLogin />
              </ThemeProvider>
            </SettingsProvider>
          </QueryErrorBoundary>
        </QueryClientProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
