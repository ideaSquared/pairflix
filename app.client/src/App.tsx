import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import QueryErrorBoundary from './components/common/QueryErrorBoundary';
import SessionManager from './components/common/SessionManager';
import { Container } from './components/layout/Layout';
import Routes from './components/layout/Routes';
import { SettingsProvider } from './contexts/SettingsContext';
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

function App() {
	return (
		<BrowserRouter>
			<ErrorBoundary>
				<QueryClientProvider client={queryClient}>
					<QueryErrorBoundary>
						<SettingsProvider>
							<ThemeProvider>
								{/* SessionManager enforces session timeout settings */}
								<SessionManager />
								<Container maxWidth='none' padding='xs'>
									<Routes />
								</Container>
							</ThemeProvider>
						</SettingsProvider>
					</QueryErrorBoundary>
				</QueryClientProvider>
			</ErrorBoundary>
		</BrowserRouter>
	);
}

export default App;
